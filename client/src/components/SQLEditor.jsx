import Editor from "@monaco-editor/react";
import { useWorkspace } from "../context/WorkspaceContext";

const SQLEditor = () => {
  const { queryText, setQueryText, executeQuery, isExecuting, clearResults } =
    useWorkspace();

  const handleExecute = async () => {
    if (!queryText.trim()) {
      alert("Please enter a SQL query");
      return;
    }

    try {
      await executeQuery(queryText);
    } catch (error) {
      console.error("Execution error:", error);
    }
  };

  const handleClear = () => {
    setQueryText("");
    clearResults();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <h3 className="text-white font-medium">SQL Editor</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
            disabled={isExecuting}
          >
            Clear
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !queryText.trim()}
            className="px-4 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isExecuting ? (
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
                <span>Executing...</span>
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Execute (Ctrl+Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 border-b border-gray-200">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={queryText}
          onChange={(value) => setQueryText(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
          onMount={(editor) => {
            // Add Ctrl+Enter keybinding for execution
            editor.addCommand(
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              () => {
                handleExecute();
              }
            );
          }}
        />
      </div>
    </div>
  );
};

export default SQLEditor;
