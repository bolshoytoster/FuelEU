import type { ReactNode } from 'react';

type Props<T> = {
  columns: { [header: string]: (row: T) => ReactNode };
  resource: {
    data?: T[];
    loading: boolean;
    error?: string;
    refresh: () => void;
  };
};

export const Table = <T,>({columns, resource}: Props<T>) => {
  if (!resource.data) {
    return (
      <p className="text-sm text-slate-500 animate-pulse">
        Loading latest data…
      </p>
    );
  }

  if (resource.error) {
    return (
      <div className="text-sm text-red-600 flex items-center gap-2">
        <span>Could not load data.</span>
        <button
          type="button"
          className="underline"
          onClick={resource.refresh}
        >
          Retry
        </button>
      </div>
    );
  }

  if (resource.data.length === 0) {
    return <p className="text-sm text-slate-500">No records yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className={"min-w-full divide-y" + (resource.loading ? " animate-pulse" : "")}>
        <thead>
          <tr>
            {Object.keys(columns).map(header => (
              <th
                key={header}
                scope="col"
                className="px-3 py-2 text-left text-sm font-semibold text-slate-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {resource.data.map((row, index) => (
            <tr key={index}>
              {Object.entries(columns).map(([header, render]) => (
                <td
                  key={header}
                  className="px-3 py-2 text-sm text-slate-600"
                >
                  {render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
};

