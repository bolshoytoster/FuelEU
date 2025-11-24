import { useState } from 'react';

import { createDataApi } from '@adapters/infrastructure/api/dataApi';
import { DataSection } from '@adapters/ui/components/DataSection';
import { useResource } from '@adapters/ui/hooks/useResource';
import { ListBankEntriesUseCase } from '@core/application/listBankEntries';
import { ListComplianceUseCase } from '@core/application/listCompliance';
import { ListRoutesUseCase } from '@core/application/listRoutes';
import { formatNumber } from '@shared/format';

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

  const tabData = [
    {
      title: "Routes",
      description: "All reported routes with their GHG intensity.",
      resource: routesResource,
      columns: [
        {
          header: 'routeId',
          render: route => (
            <span className="font-medium text-slate-800">
              {(route as { routeId: string }).routeId}
            </span>
          )
        },
        {
          header: 'vesselType',
          render: route => (route as { vesselType: string }).vesselType
        },
        {
          header: 'fuelType',
          render: route => (route as { fuelType: string }).fuelType
        },
        {
          header: 'year',
          render: route => (route as { year: number }).year
        },
        {
          header: 'ghgIntensity (gCO₂e/MJ)',
          render: route => formatNumber((route as { ghgIntensity: number }).ghgIntensity)
        },
        {
          header: 'fuelConsumption (t)',
          render: route => (route as { fuelConsumption: number }).fuelConsumption
        },
        {
          header: 'distance (km)',
          render: route => (route as { distance: number }).distance
        },
        {
          header: 'totalEmissions (t)',
          render: route => (route as { totalEmissions: number }).totalEmissions
        }
      ]
    },
    {
      title: "Compare",
      resource: complianceResource,
      columns: [
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
          render: (record) => (record as { year: number }).year
        },
        {
          header: 'CB (gCO₂e)',
          render: (record) =>
            formatNumber((record as { cbGco2eq: number }).cbGco2eq)
        }
      ]
    },
    {
      title: "Banking",
      resource: bankingResource,
      columns: [
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
          render: (entry) => (entry as { year: number }).year
        },
        {
          header: 'Amount (gCO₂e)',
          render: (entry) =>
            formatNumber((entry as { amountGco2eq: number }).amountGco2eq)
        }
      ]
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

      <DataSection data={tabData[currentTab]} />
    </main>
  );
};

