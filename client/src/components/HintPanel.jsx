import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

const HintPanel = () => {
  const { getHint, tables, queryText } = useWorkspace();
  const [isOpen, setIsOpen] = useState(true);
  const [hint, setHint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [intent, setIntent] = useState("");
  const [error, setError] = useState(null);

  const handleGetHint = async () => {
    if (tables.length === 0) {
      setError("Create some tables first to get SQL hints");
      return;
    }

    if (!queryText && !intent) {
      setError("Either write a query or describe what you want to do");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getHint({ query: queryText, intent });

      if (response.success) {
        setHint(response.data.hint);
        setIsOpen(true);
      } else {
        setError(response.error || "Failed to generate hint");
      }
    } catch (error) {
      setError(
        error.response?.data?.error || "Failed to get hint. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What are you trying to do?
        </label>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g., 'Find all users with age > 25' or 'Count orders per user'"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>

      <button
        onClick={handleGetHint}
        disabled={isLoading || tables.length === 0}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md text-sm flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
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
            <span>Generating Hint...</span>
          </>
        ) : (
          <>
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
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>Get AI Hint</span>
          </>
        )}
      </button>

      {tables.length === 0 && (
        <p className="mt-2 text-xs text-gray-500 text-center">
          Create tables to start getting hints
        </p>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-600 mr-2 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {isOpen && hint && (
        <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium text-purple-900 flex items-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Hint
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-purple-600 hover:text-purple-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-purple-800 whitespace-pre-wrap">{hint}</p>
        </div>
      )}
    </div>
  );
};

export default HintPanel;
