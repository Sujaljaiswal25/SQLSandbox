import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

const Navbar = () => {
  const {
    currentWorkspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    if (
      confirm(
        `Delete workspace "${currentWorkspace.name}"? This cannot be undone.`
      )
    ) {
      try {
        await deleteWorkspace(currentWorkspace.workspaceId);
      } catch (error) {
        alert("Failed to delete workspace");
      }
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
    <nav className="bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white shadow-2xl border-b border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-full mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-600/20 to-cyan-600/20 p-2.5 rounded-xl border border-blue-500/20">
                <svg
                  className="h-7 w-7 text-blue-400"
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
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                CipherSQL
              </h1>
              <p className="text-[10px] text-gray-500">SQL Sandbox</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentWorkspace && (
              <button
                onClick={handleDeleteWorkspace}
                className="px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Delete</span>
              </button>
            )}

            {!isCreating ? (
              <>
                <select
                  className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm shadow-lg transition-all"
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
                  className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>New</span>
                </button>
              </>
            ) : (
              <form
                onSubmit={handleCreateWorkspace}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Workspace name..."
                  className="bg-gray-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm shadow-lg w-48"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-green-600/90 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-all text-sm font-medium shadow-lg shadow-green-500/20"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setNewWorkspaceName("");
                  }}
                  className="bg-gray-700/90 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-all text-sm shadow-lg"
                >
                  Cancel
                </button>
              </form>
            )}

            {currentWorkspace && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">
                  <span className="text-white font-medium">
                    {currentWorkspace.name}
                  </span>
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
