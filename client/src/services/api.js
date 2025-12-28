import axios from "axios";

// Configure base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      console.error("Network Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== WORKSPACE APIs ====================

/**
 * Create a new workspace
 */
export const createWorkspace = async (name) => {
  const response = await api.post("/workspace", { name });
  return response.data;
};

/**
 * Get workspace by ID
 */
export const getWorkspace = async (workspaceId) => {
  const response = await api.get(`/workspace/${workspaceId}`);
  return response.data;
};

/**
 * Get all workspaces
 */
export const getAllWorkspaces = async () => {
  const response = await api.get("/workspaces");
  return response.data;
};

/**
 * Update workspace
 */
export const updateWorkspace = async (workspaceId, name) => {
  const response = await api.put(`/workspace/${workspaceId}`, { name });
  return response.data;
};

/**
 * Delete workspace
 */
export const deleteWorkspace = async (workspaceId) => {
  const response = await api.delete(`/workspace/${workspaceId}`);
  return response.data;
};

// ==================== TABLE APIs ====================

/**
 * Create a new table in workspace
 */
export const createTable = async (workspaceId, tableData) => {
  const response = await api.post(`/workspace/${workspaceId}/table`, tableData);
  return response.data;
};

/**
 * Get all tables in workspace
 */
export const getTables = async (workspaceId) => {
  const response = await api.get(`/workspace/${workspaceId}/tables`);
  return response.data;
};

/**
 * Get table details
 */
export const getTableDetails = async (workspaceId, tableName) => {
  const response = await api.get(
    `/workspace/${workspaceId}/table/${tableName}`
  );
  return response.data;
};

/**
 * Delete a table
 */
export const deleteTable = async (workspaceId, tableName) => {
  const response = await api.delete(
    `/workspace/${workspaceId}/table/${tableName}`
  );
  return response.data;
};

/**
 * Insert data into table
 */
export const insertTableData = async (workspaceId, tableName, rows) => {
  const response = await api.post(
    `/workspace/${workspaceId}/table/${tableName}/data`,
    { rows }
  );
  return response.data;
};

// ==================== QUERY APIs ====================

/**
 * Execute SQL query
 */
export const executeQuery = async (workspaceId, query) => {
  const response = await api.post(`/workspace/${workspaceId}/execute`, {
    query,
  });
  return response.data;
};

/**
 * Get query history
 */
export const getQueryHistory = async (workspaceId, limit = 20) => {
  const response = await api.get(`/workspace/${workspaceId}/history`, {
    params: { limit },
  });
  return response.data;
};

// ==================== HINT APIs ====================

/**
 * Get AI hint for query
 */
export const getHint = async (workspaceId, query, tableContext) => {
  const response = await api.post("/hint", {
    workspaceId,
    query,
    tableContext,
  });
  return response.data;
};

// ==================== HEALTH CHECK ====================

/**
 * Check API health
 */
export const checkHealth = async () => {
  const response = await api.get("/health", {
    baseURL: "http://localhost:5000",
  });
  return response.data;
};

export default api;
