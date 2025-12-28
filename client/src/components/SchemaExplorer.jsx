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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Schema Explorer</h2>
        <button
          onClick={onCreateTable}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm flex items-center space-x-1 transition-colors duration-200"
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

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">{currentWorkspace.name}</span>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          {tables.length} {tables.length === 1 ? "table" : "tables"}
        </p>
      </div>

      <div className="space-y-2">
        {tables.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
            <p className="mt-2 text-sm text-gray-600">No tables yet</p>
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
