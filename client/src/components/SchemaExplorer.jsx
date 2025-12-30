import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import TableCard from "./TableCard";

const SchemaExplorer = ({ onCreateTable }) => {
  const { tables, currentWorkspace, deleteTable } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="mt-2 text-sm font-medium text-gray-600">No workspace</p>
        <p className="text-xs text-gray-500 mt-1">Create one to begin</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
          Schema
        </h2>
        <button
          onClick={onCreateTable}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-lg shadow-blue-500/20"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>New</span>
        </button>
      </div>

      <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-900 font-semibold">
              {currentWorkspace.name}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {tables.length} {tables.length === 1 ? "table" : "tables"}
            </p>
          </div>
          <div className="px-2.5 py-1 bg-blue-600/20 rounded-lg">
            <span className="text-xs font-bold text-blue-800">
              {tables.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        {tables.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-300">
            <svg
              className="mx-auto h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="mt-2 text-sm font-medium text-gray-600">No tables</p>
            <p className="text-xs text-gray-500 mt-1">
              Click New to create one
            </p>
          </div>
        ) : (
          tables.map((table) => (
            <TableCard
              key={table.tableName}
              table={table}
              onDelete={deleteTable}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;
