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
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
          <svg
            className="h-4 w-4 mr-1.5 text-purple-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          What are you trying to do?
        </label>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g., 'Find all users with age > 25' or 'Count orders per user'"
          className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm transition-all duration-200 shadow-sm"
        />
      </div>

      <button
        onClick={handleGetHint}
        disabled={isLoading || tables.length === 0}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
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
              className="h-5 w-5"
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
        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center">
          <svg
            className="h-5 w-5 text-yellow-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-xs text-yellow-800 font-medium">
            Create tables first to get AI-powered hints
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-sm">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
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
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-purple-900 flex items-center text-sm">
              <svg
                className="h-5 w-5 mr-2 text-purple-600"
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
              className="text-purple-600 hover:text-purple-800 transition-colors"
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
          <div className="bg-white bg-opacity-60 rounded-lg p-4 border border-purple-100">
            <p className="text-sm text-purple-900 whitespace-pre-wrap leading-relaxed">
              {hint}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HintPanel;
