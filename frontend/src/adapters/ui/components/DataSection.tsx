import type { ReactNode } from 'react';

type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  description: string;
  columns: Column<T>[];
  resource: {
    data?: T[];
    loading: boolean;
    error?: string;
    refresh: () => void;
  };
};

export const DataSection = <T,>({
  data: {
    description,
    columns,
    resource
  }
}: { data: Props<T> }) => {
  const renderingState = () => {
    if (resource.loading) {
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

    if (!resource.data || resource.data.length === 0) {
      return <p className="text-sm text-slate-500">No records yet.</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className="px-3 py-2 text-left text-sm font-semibold text-slate-700"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {resource.data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className="px-3 py-2 text-sm text-slate-600"
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
      {description}
      {renderingState()}
    </section>
  );
};

