import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";
import TableCard from "./TableCard";

const SchemaExplorer = ({ onCreateTable }) => {
  const { tables, currentWorkspace, deleteTable } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="text-center py-8">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No workspace selected
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Select or create a workspace to begin
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <svg
            className="h-5 w-5 mr-2 text-blue-600"
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
          Schema Explorer
        </h2>
        <button
          onClick={onCreateTable}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1.5 transition-all duration-200 shadow-md hover:shadow-lg"
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
          <span>Create Table</span>
        </button>
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-900 font-semibold flex items-center">
              <svg
                className="h-4 w-4 mr-1.5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              {currentWorkspace.name}
            </p>
            <p className="text-xs text-blue-700 mt-1 ml-6">
              {tables.length} {tables.length === 1 ? "table" : "tables"}
            </p>
          </div>
          <div className="px-3 py-1 bg-blue-600 bg-opacity-20 rounded-full">
            <span className="text-xs font-bold text-blue-800">
              {tables.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {tables.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-dashed border-gray-300 shadow-inner">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <p className="mt-3 text-sm font-medium text-gray-700">
              No tables yet
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Click "Create Table" to add your first table
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
