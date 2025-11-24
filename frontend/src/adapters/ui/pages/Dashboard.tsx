import { createDataApi } from '@adapters/infrastructure/api/dataApi';
import { DataSection } from '@adapters/ui/components/DataSection';
import { useResource } from '@adapters/ui/hooks/useResource';
import { ListBankEntriesUseCase } from '@core/application/listBankEntries';
import { ListComplianceUseCase } from '@core/application/listCompliance';
import { ListRoutesUseCase } from '@core/application/listRoutes';
import { formatNumber, formatYear } from '@shared/format';

const dataApi = createDataApi();
const listRoutesUseCase = new ListRoutesUseCase(dataApi);
const listComplianceUseCase = new ListComplianceUseCase(dataApi);
const listBankEntriesUseCase = new ListBankEntriesUseCase(dataApi);

export const Dashboard = () => {
  const routesResource = useResource(
    listRoutesUseCase.execute.bind(listRoutesUseCase)
  );
  const complianceResource = useResource(
    listComplianceUseCase.execute.bind(listComplianceUseCase)
  );
  const bankingResource = useResource(
    listBankEntriesUseCase.execute.bind(listBankEntriesUseCase)
  );

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          FuelEU Monitor
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          Decarbonisation overview
        </h1>
        <p className="text-slate-500">
          Live view of the compliance, routes performance, and banking
          movements sourced from the backend service.
        </p>
      </header>

      <DataSection
        title="Routes"
        description="All reported routes with their GHG intensity."
        resource={routesResource}
        columns={[
          {
            header: 'Route',
            render: (route) => (
              <span className="font-medium text-slate-800">
                {(route as { routeId: string }).routeId}
              </span>
            )
          },
          {
            header: 'Year',
            render: (route) => formatYear((route as { year: number }).year)
          },
          {
            header: 'GHG intensity',
            render: (route) =>
              `${formatNumber((route as { ghgIntensity: number }).ghgIntensity)} gCO₂e`
          },
          {
            header: 'Baseline',
            render: (route) =>
              (route as { isBaseline: boolean }).isBaseline ? (
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Baseline
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  Observed
                </span>
              )
          }
        ]}
      />

      <DataSection
        title="Compliance"
        description="Computed compliance balance per ship."
        resource={complianceResource}
        columns={[
          {
            header: 'Ship',
            render: (record) => (
              <span className="font-medium text-slate-800">
                {(record as { shipId: string }).shipId}
              </span>
            )
          },
          {
            header: 'Year',
            render: (record) => formatYear((record as { year: number }).year)
          },
          {
            header: 'CB (gCO₂e)',
            render: (record) =>
              formatNumber((record as { cbGco2eq: number }).cbGco2eq)
          }
        ]}
      />

      <DataSection
        title="Banking"
        description="Available surplus amounts per ship."
        resource={bankingResource}
        columns={[
          {
            header: 'Ship',
            render: (entry) => (
              <span className="font-medium text-slate-800">
                {(entry as { shipId: string }).shipId}
              </span>
            )
          },
          {
            header: 'Year',
            render: (entry) => formatYear((entry as { year: number }).year)
          },
          {
            header: 'Amount (gCO₂e)',
            render: (entry) =>
              formatNumber((entry as { amountGco2eq: number }).amountGco2eq)
          }
        ]}
      />
    </main>
  );
};

