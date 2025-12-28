import { useWorkspace } from "../context/WorkspaceContext";
import ResultTable from "./ResultTable";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";

const ResultViewer = () => {
  const { queryResults, queryError, isExecuting } = useWorkspace();

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-medium">Query Results</h3>
        {queryResults && (
          <span className="text-sm text-gray-300">
            {queryResults.rowCount} row{queryResults.rowCount !== 1 ? "s" : ""}{" "}
            returned
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
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
              <p className="text-gray-600">Executing query...</p>
            </div>
          </div>
        ) : queryError ? (
          <ErrorDisplay error={queryError} />
        ) : queryResults ? (
          <>
            {queryResults.rows && queryResults.rows.length > 0 ? (
              <ResultTable data={queryResults} />
            ) : (
              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-green-500 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <p className="text-green-800 font-medium">
                      Query executed successfully
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      {queryResults.command || "Operation"} completed.{" "}
                      {queryResults.rowCount} row(s) affected.
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
