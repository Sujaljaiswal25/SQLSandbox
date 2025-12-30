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
      <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 px-6 py-3.5 flex items-center justify-between border-b border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
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
          </div>
          <h3 className="text-white font-semibold">SQL Editor</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-slate-700 rounded">
              Ctrl
            </kbd>
            <span className="text-gray-600">+</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 bg-slate-700 rounded">
              Enter
            </kbd>
          </span>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm bg-slate-800/80 hover:bg-slate-700 text-gray-300 hover:text-white rounded-lg transition-all shadow-lg border border-slate-700/50"
            disabled={isExecuting}
          >
            Clear
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting || !queryText.trim()}
            className="px-5 py-2 text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
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
      <div className="flex-1">
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
