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
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-2 gap-1.5">
          <svg
            className="h-4 w-4 text-purple-600"
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
          What do you need help with?
        </label>
        <input
          type="text"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g., Find users aged > 25"
          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 text-sm transition-all"
        />
      </div>

      <button
        onClick={handleGetHint}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
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
        <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 flex items-center gap-2">
          <svg
            className="h-4 w-4 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xs text-blue-800 font-medium">
            Ask about SQL concepts, syntax, or how to get started!
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-3">
          <div className="flex items-start gap-2">
            <svg
              className="h-4 w-4 text-red-600 mt-0.5"
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
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-purple-900 flex items-center text-sm gap-2">
              <svg
                className="h-5 w-5 text-purple-600"
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
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100 p-1 rounded-lg transition-all"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="bg-white/80 rounded-lg p-3.5 border border-purple-100">
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
