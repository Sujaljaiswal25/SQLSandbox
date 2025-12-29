import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

const Navbar = () => {
  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    syncWorkspace,
    hasUnsavedChanges,
    lastSyncTime,
  } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentWorkspace) return;

    try {
      setIsSaving(true);
      await syncWorkspace();
    } catch (error) {
      alert("Failed to save workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    try {
      await createWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName("");
      setIsCreating(false);
    } catch (error) {
      alert("Failed to create workspace");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 text-white shadow-xl border-b-2 border-gray-800">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-blue-600 bg-opacity-20 p-2 rounded-lg">
              <svg
                className="h-8 w-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CipherSQL Sandbox
              </h1>
              <p className="text-xs text-gray-400">
                Browser-based SQL Environment
              </p>
            </div>
          </div>

          {/* Workspace Selector */}
          <div className="flex items-center space-x-4">
            {currentWorkspace && (
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 font-medium shadow-md ${
                  hasUnsavedChanges
                    ? "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-green-500/30"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  lastSyncTime
                    ? `Last saved: ${lastSyncTime.toLocaleTimeString()}`
                    : "Not saved yet"
                }
              >
                <svg
                  className={`h-5 w-5 ${isSaving ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isSaving ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  )}
                </svg>
                <span>
                  {isSaving
                    ? "Saving..."
                    : hasUnsavedChanges
                    ? "Save"
                    : "Saved"}
                </span>
              </button>
            )}

            {!isCreating ? (
              <>
                <select
                  className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentWorkspace?.workspaceId || ""}
                  onChange={(e) =>
                    e.target.value && switchWorkspace(e.target.value)
                  }
                >
                  <option value="">Select Workspace</option>
                  {workspaces.map((ws) => (
                    <option key={ws.workspaceId} value={ws.workspaceId}>
                      {ws.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsCreating(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New Workspace</span>
                </button>
              </>
            ) : (
              <form
                onSubmit={handleCreateWorkspace}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace name..."
                  className="bg-gray-800 text-white px-4 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewWorkspaceName("");
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Cancel
                </button>
              </form>
            )}

            {currentWorkspace && (
              <div className="text-sm text-gray-400">
                Current:{" "}
                <span className="text-white font-medium">
                  {currentWorkspace.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
