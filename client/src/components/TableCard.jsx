import { useState } from "react";

const TableCard = ({ table, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg mb-3 bg-white shadow-sm">
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <svg
            className={`h-4 w-4 transform transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
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
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className="font-medium text-gray-900">{table.tableName}</span>
          <span className="text-xs text-gray-500">
            ({table.columns?.length || 0} columns)
          </span>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete table "${table.tableName}"?`)) {
                onDelete(table.tableName);
              }
            }}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete table"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3">
          <div className="mt-2 space-y-1">
            {table.columns && table.columns.length > 0 ? (
              table.columns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm"
                >
                  <span className="text-gray-700 font-mono">
                    {col.columnName}
                  </span>
                  <span className="text-gray-500 text-xs font-medium">
                    {col.dataType}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No columns</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableCard;
