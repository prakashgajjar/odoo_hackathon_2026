'use client';

import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

export function DataTable({ columns, data, onRowClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Inbox className="w-16 h-16 text-zinc-400 mb-4" />
        <p className="text-zinc-500 text-lg font-medium">No data available</p>
        <p className="text-zinc-400 text-sm mt-1">Once you add items, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-4 text-left text-xs font-bold text-zinc-700 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {data.map((row, idx) => (
            <motion.tr
              key={row._id || idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="hover:bg-zinc-50 transition-colors duration-300 cursor-pointer group"
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => {
                try {
                  const value = row[col.key];
                  const content = col.render 
                    ? col.render(value, row) 
                    : (value !== null && value !== undefined ? String(value) : '-');
                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors duration-300"
                    >
                      {content}
                    </td>
                  );
                } catch (error) {
                  console.error(`Error rendering column ${col.key}:`, error);
                  return (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-sm text-red-500"
                    >
                      Error
                    </td>
                  );
                }
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
