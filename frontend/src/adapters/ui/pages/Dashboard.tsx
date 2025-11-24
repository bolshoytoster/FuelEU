import { useState } from 'react';

import { createDataApi } from '@adapters/infrastructure/api/dataApi';
import { Table } from '@adapters/ui/components/Table';
import { useResource } from '@adapters/ui/hooks/useResource';
import { ListBankEntriesUseCase } from '@core/application/listBankEntries';
import { ComparisonUseCase } from '@core/application/comparison';
import { ListRoutesUseCase } from '@core/application/listRoutes';
import { formatNumber } from '@shared/format';

const dataApi = createDataApi();
const listRoutesUseCase = new ListRoutesUseCase(dataApi);
const comparisonUseCase = new ComparisonUseCase(dataApi);
const listBankEntriesUseCase = new ListBankEntriesUseCase(dataApi);

export const Dashboard = () => {
  const routesResource = useResource(
    listRoutesUseCase.execute.bind(listRoutesUseCase)
  );
  const comparisonResource = useResource(
    comparisonUseCase.execute.bind(comparisonUseCase)
  );
  const bankingResource = useResource(
    listBankEntriesUseCase.execute.bind(listBankEntriesUseCase)
  );

  const tabData = [
    {
      title: "Routes",
      description: "All reported routes with their GHG intensity.",
      contents: (
        <Table
          resource={routesResource}
          columns={{
            'routeId': route => route.routeId,
            'vesselType': route => route.vesselType,
            'fuelType': route => route.fuelType,
            'year': route => route.year,
            'ghgIntensity (gCO₂e/MJ)': route => formatNumber(route.ghgIntensity),
            'fuelConsumption (t)': route => route.fuelConsumption,
            'distance (km)': route => route.distance,
            'totalEmissions (t)': route => route.totalEmissions,
            // The 'Set Baseline' buttons
            '': route => route.isBaseline ? "Baseline" : (
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
          }}
        />
      )
    },
    {
      title: "Compare",
      contents: (
        <Table
          resource={comparisonResource}
          columns={{
            'routeId': route => route.routeId,
            'ghgIntensity (gCO₂e/MJ)': route => formatNumber(route.ghgIntensity),
            '% difference': route => formatNumber(route.percentDiff),
            'compliant': route => route.compliant ? '✅' : '❌'
          }}
        />
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
        {tabData[currentTab].description}
        {tabData[currentTab].contents}
      </section>
    </main>
  );
};

