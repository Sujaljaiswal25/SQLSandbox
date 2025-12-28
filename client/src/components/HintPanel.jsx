import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

const HintPanel = () => {
  const { getHint, tables } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [hint, setHint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tableContext, setTableContext] = useState("");

  const handleGetHint = async () => {
    if (tables.length === 0) {
      alert("Create some tables first to get hints");
      return;
    }

    try {
      setIsLoading(true);
      const response = await getHint(tableContext);
      setHint(response.hint);
      setIsOpen(true);
    } catch (error) {
      alert("Failed to get hint");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2 mb-2">
        <input
          type="text"
          value={tableContext}
          onChange={(e) => setTableContext(e.target.value)}
          placeholder="What do you want to do? (optional)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={handleGetHint}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50"
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
              <span>Getting Hint...</span>
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
      </div>

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
