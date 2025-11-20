import React, { useMemo, useState } from 'react';

export type TableColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export type DataTableProps<T> = {
  data: T[];
  columns: TableColumn<T>[];
  pageSize?: number;
  searchableKeys?: (keyof T | string)[];
  actionsRender?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
};

function normalize(value: unknown): string {
  if (value == null) return '';
  try {
    return String(value).toLowerCase();
  } catch {
    return '';
  }
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
  searchableKeys,
  actionsRender,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const keys = (searchableKeys && searchableKeys.length > 0)
      ? searchableKeys
      : columns.map(c => c.key);
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      return keys.some((k) => normalize(row[k as string]).includes(q));
    });
  }, [data, query, searchableKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = normalize(a[sortKey]);
      const bv = normalize(b[sortKey]);
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const onSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-2">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search..."
          className="w-full md:w-80 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((col) => {
                const key = String(col.key);
                const isActive = sortKey === key;
                return (
                  <th
                    key={key}
                    onClick={() => onSort(key, col.sortable)}
                    className={`px-4 py-2 font-medium text-gray-600 select-none ${col.sortable ? 'cursor-pointer' : ''}`}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="ml-1 text-gray-400">
                        {isActive ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    )}
                  </th>
                );
              })}
              {actionsRender && <th className="px-4 py-2 text-gray-600 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, idx) => (
              <tr
                key={idx}
                className={`border-t border-gray-100 ${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : 'hover:bg-gray-50'}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col) => {
                  const key = String(col.key);
                  return (
                    <td key={key} className="px-4 py-2 text-gray-800">
                      {col.render ? col.render(row) : String(row[key] ?? '')}
                    </td>
                  );
                })}
                {actionsRender && (
                  <td className="px-4 py-2">
                    {actionsRender(row)}
                  </td>
                )}
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actionsRender ? 1 : 0)} className="px-4 py-6 text-center text-gray-500">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
        <div>
          Page {currentPage} of {totalPages} • {sorted.length} items
        </div>
        <div className="space-x-2">
          <button
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;



