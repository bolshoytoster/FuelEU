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
        <div>
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
        </div>
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

