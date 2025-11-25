import { useEffect, useState } from 'react';

import { createDataApi } from '@adapters/infrastructure/api/dataApi';
import { Table } from '@adapters/ui/components/Table';
import { useResource } from '@adapters/ui/hooks/useResource';
import { ComparisonUseCase } from '@core/application/comparison';
import { ListRoutesUseCase } from '@core/application/listRoutes';
import { GetBankRecordUseCase } from '@core/application/getBankRecord';
import { GetBankHistoryUseCase } from '@core/application/getBankHistory';
import { BankEntry, BankRecord } from '@core/domain/models';
import { formatNumber } from '@shared/format';

const dataApi = createDataApi();
const listRoutesUseCase = new ListRoutesUseCase(dataApi);
const comparisonUseCase = new ComparisonUseCase(dataApi);
const getBankRecordUseCase = new GetBankRecordUseCase(dataApi);
const getBankHistoryUseCase = new GetBankHistoryUseCase(dataApi);

export const Dashboard = () => {
  const routesResource = useResource(
    listRoutesUseCase.execute.bind(listRoutesUseCase)
  );
  const comparisonResource = useResource(
    comparisonUseCase.execute.bind(comparisonUseCase)
  );


  // The route/year selected in the banking tab
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [bankRecordState, setBankRecordState] = useState<{
    data?: BankRecord;
    error?: string;
    status: 'idle' | 'loading' | 'success' | 'error';
  }>({ status: 'idle' });
  const [bankingAction, setBankingAction] = useState<'bank' | 'apply'>();
  const [bankHistoryState, setBankHistoryState] = useState<{
    data?: BankEntry[];
    error?: string;
    loading: boolean;
  }>({ loading: false });

  const selectableRoutes = new Set<string>();
  const selectableYears = new Set<number>();

  if (routesResource.data)
    for (const route of routesResource.data) {
      if (!selectedYear || route.year == +selectedYear)
        selectableRoutes.add(route.routeId);
      if (!selectedRoute || route.routeId == selectedRoute)
        selectableYears.add(route.year);
    }

  useEffect(() => {
    if (!selectedRoute || !selectedYear) {
      setBankRecordState({ status: 'idle' });
      return;
    }

    let cancelled = false;

    setBankRecordState((prev) => ({
      ...prev,
      error: undefined,
      status: 'loading'
    }));

    getBankRecordUseCase
      .execute(selectedRoute, selectedYear)
      .then((record) => {
        if (cancelled)
          return;
        setBankRecordState({
          data: record,
          status: 'success'
        });
      })
      .catch((error: Error) => {
        if (cancelled)
          return;
        setBankRecordState({
          error: error.message,
          status: 'error'
        });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRoute, selectedYear]);

  const fetchBankHistory = (shipId: string, shouldAbort?: () => boolean) => {
    setBankHistoryState((prev) => ({
      ...prev,
      error: undefined,
      loading: true
    }));

    getBankHistoryUseCase
      .execute(shipId)
      .then((entries) => {
        if (shouldAbort?.())
          return;
        setBankHistoryState({
          data: entries,
          loading: false
        });
      })
      .catch((error: Error) => {
        if (shouldAbort?.())
          return;
        setBankHistoryState({
          error: error.message,
          loading: false
        });
      });
  };

  useEffect(() => {
    if (!selectedRoute) {
      setBankHistoryState({ data: [], loading: false });
      return;
    }

    let cancelled = false;
    fetchBankHistory(selectedRoute, () => cancelled);
    return () => {
      cancelled = true;
    };
  }, [selectedRoute]);

  const refreshBankHistory = () => {
    if (!selectedRoute)
      return;
    fetchBankHistory(selectedRoute);
  };

  const handleBankingAction = async (action: 'bank' | 'apply') => {
    if (!selectedRoute || !selectedYear)
      return;

    setBankingAction(action);
    setBankRecordState((prev) => ({
      ...prev,
      error: undefined,
      status: 'loading'
    }));

    try {
      const nextRecord = action === 'bank'
        ? await dataApi.bankSurplus(selectedRoute, selectedYear)
        : await dataApi.applyBankedSurplus(selectedRoute, selectedYear);

      if (nextRecord) {
        setBankRecordState({
          data: nextRecord,
          status: 'success'
        });
      } else {
        const refreshedRecord = await getBankRecordUseCase.execute(selectedRoute, selectedYear);
        setBankRecordState({
          data: refreshedRecord,
          status: 'success'
        });
      }
      refreshBankHistory();
    } catch (error) {
      setBankRecordState({
        error: (error as Error).message,
        status: 'error'
      });
    } finally {
      setBankingAction(undefined);
    }
  };


  const tabData = [
    {
      title: "Routes",
      contents: (
        <Table
          resource={routesResource}
          columns={[
            {
              header: "routeId",
              render: route => route.routeId
            },
            {
              header: "vesselType",
              render: route => route.vesselType,
              filter: useState(""),
            },
            {
              header: "fuelType",
              render: route => route.fuelType,
              filter: useState(""),
            },
            {
              header: "year",
              render: route => "" + route.year,
              filter: useState(""),
            },
            {
              header: "ghgIntensity (gCO₂e/MJ)",
              render: route => route.ghgIntensity
            },
            {
              header: "fuelConsumption (t)",
              render: route => route.fuelConsumption
            },
            {
              header: "distance (km)",
              render: route => route.distance
            },
            {
              header: "totalEmissions (t)",
              render: route => route.totalEmissions
            },
            {
              header: "",
              render: route => route.isBaseline ? "Baseline" : (
                <button
                  onClick={
                    // When a button is clicked, set this route as the baseline,
                    // then refresh data for this and the comparison page
                    () => dataApi.setBaseline(route.routeId).then(() => {
                      routesResource.refresh();
                      comparisonResource.refresh();
                    })
                  }
                  className="rounded-2xl border bg-white p-3"
                >
                  Set Baseline
                </button>
              )
            }
          ]}
        />
      )
    },
    {
      title: "Compare",
      contents: (
        <>
          <Table
            resource={comparisonResource}
            columns={[
              {
                header: "routeId",
                render: route => route.routeId
              },
              {
                header: "ghgIntensity (gCO₂e/MJ)",
                render: route => formatNumber(route.ghgIntensity)
              },
              {
                header: "% difference",
                render: route => formatNumber(route.percentDiff)
              },
              {
                header: "compliant",
                render: route => route.compliant ? "✅" : "❌"
              }
            ]}
          />

          <svg viewBox="0 0 512 512" className="m-16">
            <text y="500">80</text>
            <text y="256">90</text>
            <text y="12">100</text>
            <line x1="32" y1="6" x2="32" y2="500" stroke="black"></line>
            <line x1="28" y1="496" x2="496" y2="496" stroke="black"></line>

            {comparisonResource.data?.map((route, i) => {
              const x = 64 + i * 460 / comparisonResource.data!.length;
              const height = (route.ghgIntensity / 20 - 4) * 490;

              return (
                <g>
                  <rect
                    x={x}
                    y={496 - height}
                    width="32"
                    height={height - 1}
                    // This is a colour generation formula that I came up with for a previous project.
                    // You can find a mostly-complete explanation through the following links:
                    // https://bolshoy.ddns.net/files/colour_maths.jpg
                    // https://www.desmos.com/calculator/o988gkndov
                    fill={i
                      ? "hsl(" + (180 + 360 * i) / (2 ** Math.floor(Math.log2(i))) + " 100 45)"
                      : "hsl(0 100 45)"
                    }
                  ></rect>
                  <rect></rect>
                  <text x={x} y="512">{route.routeId}</text>
                </g>
              )
            })}
          </svg>
        </>
      )
    },
    {
      title: "Banking",
      contents: (
        <>
          Ship: <select value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}>
            <option value=""></option>
            {[...selectableRoutes].map(routeId => (
              <option key={routeId} value={routeId}>{routeId}</option>
            ))}
          </select>
          <br/>
          Year: <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            <option value=""></option>
            {[...selectableYears].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <br/>
          <br/>

          {selectedRoute && selectedYear && (
            <>
              {bankRecordState.status === 'loading' && (
                <p>Loading banking record...</p>
              )}
              {bankRecordState.status === 'error' && (
                <p className="text-red-600">
                  Failed to load banking record: {bankRecordState.error}
                </p>
              )}
              {bankRecordState.status === 'success' && bankRecordState.data && (
                <>
                  Current Compliance Balance (CB): {formatNumber(bankRecordState.data.balance)}
                  {0 < bankRecordState.data.balance ? (
                    <button
                      className="rounded-2xl border p-4 m-4 bg-white disabled:opacity-50"
                      disabled={bankingAction === 'bank'}
                      onClick={() => handleBankingAction('bank')}
                    >
                      {bankingAction === 'bank' ? 'Banking…' : 'Bank Surplus'}
                    </button>
                  ) : (
                    <button
                      className="rounded-2xl border p-4 m-4 bg-white disabled:opacity-50"
                      disabled={bankingAction === 'apply'}
                      onClick={() => handleBankingAction('apply')}
                    >
                      {bankingAction === 'apply' ? 'Applying…' : 'Apply Banked Surplus'}
                    </button>
                  )}
                  {selectedRoute && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Bank History</h3>
                      <Table
                        resource={{
                          data: bankHistoryState.data,
                          error: bankHistoryState.error,
                          loading: bankHistoryState.loading,
                          refresh: refreshBankHistory
                        }}
                        columns={[
                          {
                            header: "Year",
                            render: entry => entry.year
                          },
                          {
                            header: "Amount (gCO₂e)",
                            render: entry => formatNumber(entry.amountGco2eq)
                          }
                        ]}
                      />
                    </div>
                  )}
                </>
              )}
              {bankRecordState.status === 'success' && !bankRecordState.data && (
                <p>No banking record available for this selection.</p>
              )}
            </>
          )}
        </>
      )
    }
  ];

  const [currentTab, setCurrentTab] = useState(0);

  return (
    <main className="mx-auto max-w-5xl gap-6 p-6">
      <div className="flex flex-row justify-evenly">
        {tabData.map((tab, index) => (
          <button
            key={index}
            onClick={() => setCurrentTab(index)}
            className={"rounded-2xl border p-4 m-4 " + (currentTab == index ? "bg-cyan-100" : "bg-white")}>
            {tab.title}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border bg-white p-6 space-y-4">
        {tabData[currentTab].contents}
      </section>
    </main>
  );
};

