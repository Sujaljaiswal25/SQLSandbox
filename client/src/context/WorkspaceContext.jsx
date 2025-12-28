import { createContext, useContext, useState, useEffect, useRef } from "react";
import * as api from "../services/api";

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [tables, setTables] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [queryResults, setQueryResults] = useState(null);
  const [queryError, setQueryError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const autoSaveTimerRef = useRef(null);

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspaceId = localStorage.getItem("currentWorkspaceId");
    if (savedWorkspaceId) {
      loadWorkspace(savedWorkspaceId);
    }
  }, []);

  // Load all workspaces
  const loadWorkspaces = async () => {
    try {
      const response = await api.getAllWorkspaces();
      setWorkspaces(response.data || []);
    } catch (error) {
      console.error("Error loading workspaces:", error);
    }
  };

  // Create new workspace
  const createWorkspace = async (name) => {
    try {
      setIsLoading(true);
      const response = await api.createWorkspace(name);
      const newWorkspace = response.data;

      setWorkspaces((prev) => [...prev, newWorkspace]);
      setCurrentWorkspace(newWorkspace);
      localStorage.setItem("currentWorkspaceId", newWorkspace.workspaceId);

      return newWorkspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Load workspace by ID
  const loadWorkspace = async (workspaceId) => {
    try {
      setIsLoading(true);
      const response = await api.getWorkspace(workspaceId);

      setCurrentWorkspace(response.data);
      setTables(response.data.tables || []);
      localStorage.setItem("currentWorkspaceId", workspaceId);

      return response.data;
    } catch (error) {
      console.error("Error loading workspace:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Switch workspace
  const switchWorkspace = async (workspaceId) => {
    await loadWorkspace(workspaceId);
    // Clear query results when switching workspace
    setQueryResults(null);
    setQueryError(null);
    setQueryText("");
  };

  // Update workspace name
  const updateWorkspaceName = async (workspaceId, newName) => {
    try {
      const response = await api.updateWorkspace(workspaceId, newName);

      // Update in local state
      setCurrentWorkspace((prev) => ({ ...prev, name: newName }));
      setWorkspaces((prev) =>
        prev.map((ws) =>
          ws.workspaceId === workspaceId ? { ...ws, name: newName } : ws
        )
      );

      return response.data;
    } catch (error) {
      console.error("Error updating workspace:", error);
      throw error;
    }
  };

  // Delete workspace
  const deleteWorkspace = async (workspaceId) => {
    try {
      await api.deleteWorkspace(workspaceId);

      setWorkspaces((prev) =>
        prev.filter((ws) => ws.workspaceId !== workspaceId)
      );

      if (currentWorkspace?.workspaceId === workspaceId) {
        setCurrentWorkspace(null);
        setTables([]);
        localStorage.removeItem("currentWorkspaceId");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      throw error;
    }
  };

  // Create table
  const createTable = async (tableData) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    try {
      setIsLoading(true);
      const response = await api.createTable(
        currentWorkspace.workspaceId,
        tableData
      );

      // Reload workspace to get updated tables
      await loadWorkspace(currentWorkspace.workspaceId);

      return response.data;
    } catch (error) {
      console.error("Error creating table:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete table
  const deleteTable = async (tableName) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    try {
      setIsLoading(true);
      await api.deleteTable(currentWorkspace.workspaceId, tableName);

      // Remove from local state
      setTables((prev) => prev.filter((t) => t.tableName !== tableName));
    } catch (error) {
      console.error("Error deleting table:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Execute query
  const executeQuery = async (query) => {
    if (!currentWorkspace) throw new Error("No workspace selected");
    if (!query || query.trim() === "") throw new Error("Query cannot be empty");

    try {
      setIsExecuting(true);
      setQueryError(null);
      setQueryResults(null);

      const response = await api.executeQuery(
        currentWorkspace.workspaceId,
        query
      );

      if (response.success) {
        setQueryResults(response.data);
        setQueryError(null);
      } else {
        setQueryError(response.error);
        setQueryResults(null);
      }

      return response;
    } catch (error) {
      const errorData = error.response?.data?.error || {
        type: "NETWORK_ERROR",
        message: error.message || "Failed to execute query",
      };

      setQueryError(errorData);
      setQueryResults(null);
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  // Get hint
  const getHint = async ({ query, intent, error } = {}) => {
    if (!currentWorkspace) throw new Error("No workspace selected");

    try {
      const response = await api.getHint(
        currentWorkspace.workspaceId,
        query || queryText,
        intent,
        error
      );

      return response;
    } catch (error) {
      console.error("Error getting hint:", error);
      throw error;
    }
  };

  // Clear query results
  const clearResults = () => {
    setQueryResults(null);
    setQueryError(null);
  };

  // Sync workspace (save to MongoDB)
  const syncWorkspace = async () => {
    if (!currentWorkspace) return;

    try {
      const response = await api.syncWorkspace(currentWorkspace.workspaceId);
      setHasUnsavedChanges(false);
      setLastSyncTime(new Date());
      console.log("Workspace synced:", response);
      return response;
    } catch (error) {
      console.error("Error syncing workspace:", error);
      throw error;
    }
  };

  // Auto-save with debouncing
  const scheduleAutoSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        syncWorkspace();
      }
    }, 30000); // 30 seconds debounce
  };

  // Mark workspace as having unsaved changes
  const markDirty = () => {
    setHasUnsavedChanges(true);
    scheduleAutoSave();
  };

  // Cleanup auto-save timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const value = {
    // State
    currentWorkspace,
    workspaces,
    tables,
    queryText,
    queryResults,
    queryError,
    isLoading,
    isExecuting,
    hasUnsavedChanges,
    lastSyncTime,

    // Actions
    setQueryText,
    createWorkspace,
    loadWorkspace,
    switchWorkspace,
    updateWorkspaceName,
    deleteWorkspace,
    createTable,
    deleteTable,
    executeQuery,
    getHint,
    clearResults,
    loadWorkspaces,
    syncWorkspace,
    markDirty,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
