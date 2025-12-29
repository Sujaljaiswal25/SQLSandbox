import { useWorkspace } from "../context/WorkspaceContext";
import ResultTable from "./ResultTable";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";

const ResultViewer = () => {
  const { queryResults, queryError, isExecuting } = useWorkspace();

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700 shadow-md">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-blue-400"
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
          <h3 className="text-white font-semibold text-sm">Query Results</h3>
        </div>
        {queryResults && (
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 text-xs font-medium bg-blue-500 bg-opacity-20 text-blue-300 rounded-full">
              {queryResults.rowCount} row
              {queryResults.rowCount !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-gradient-to-br from-gray-50 to-slate-50">
        {isExecuting ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-600 font-medium">Executing query...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait</p>
            </div>
          </div>
        ) : queryError ? (
          <ErrorDisplay error={queryError} />
        ) : queryResults ? (
          <>
            {queryResults.rows && queryResults.rows.length > 0 ? (
              <ResultTable data={queryResults} />
            ) : (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 p-6 rounded-r-lg shadow-md">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-emerald-800 font-semibold text-lg">
                      Query executed successfully!
                    </p>
                    <p className="text-emerald-700 text-sm mt-1">
                      {queryResults.command || "Operation"} completed.{" "}
                      <span className="font-medium">
                        {queryResults.rowCount}
                      </span>{" "}
                      row(s) affected.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default ResultViewer;
