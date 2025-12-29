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
    <div className="flex flex-col h-full shadow-lg">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-700 shadow-md">
        <div className="flex items-center space-x-2">
          <svg
            className="h-5 w-5 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-white font-semibold text-sm">SQL Editor</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400 mr-2 hidden sm:inline">
            Press Ctrl+Enter to execute
          </span>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            disabled={isExecuting}
          >
            Clear
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !queryText.trim()}
            className="px-4 py-1.5 text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 border-b-2 border-slate-200">
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
            padding: { top: 16, bottom: 16 },
            fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
            fontLigatures: true,
            cursorBlinking: "smooth",
            smoothScrolling: true,
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
