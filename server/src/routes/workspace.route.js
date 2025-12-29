const express = require("express");
const router = express.Router();

// Import controllers (business logic)
const {
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  syncWorkspace,
} = require("../controllers/workspace.controller");
const {
  createNewTable,
  getTables,
  getTableDetails,
  deleteTable,
  insertData,
} = require("../controllers/table.controller");

// Import validators (input checking)
const {
  validateCreateWorkspace,
  validateCreateTable,
  validateInsertData,
  validateWorkspaceId,
} = require("../middlewares/validators");

// Import rate limiters (prevent abuse)
const {
  workspaceLimiter,
  tableLimiter,
} = require("../middlewares/rateLimiter.middleware");

// ============================================
// WORKSPACE ROUTES
// ============================================

// Create new workspace
router.post(
  "/workspace",
  workspaceLimiter, // Limit: 10 workspaces per hour
  validateCreateWorkspace, // Check if name is provided
  createWorkspace // Execute the creation
);

// Get single workspace by ID
router.get("/workspace/:id", validateWorkspaceId, getWorkspace);

// Update workspace name
router.put(
  "/workspace/:id",
  validateWorkspaceId,
  validateCreateWorkspace,
  updateWorkspace
);

// Delete workspace
router.delete("/workspace/:id", validateWorkspaceId, deleteWorkspace);

// Get all workspaces
router.get("/workspaces", getAllWorkspaces);

// Sync workspace from PostgreSQL to MongoDB
router.post("/workspace/:id/sync", validateWorkspaceId, syncWorkspace);

// ============================================
// TABLE ROUTES (under workspace)
// ============================================

// Create new table in workspace
router.post(
  "/workspace/:id/table",
  tableLimiter,
  validateWorkspaceId,
  validateCreateTable,
  createNewTable
);
router.get("/workspace/:id/tables", validateWorkspaceId, getTables);
router.get(
  "/workspace/:id/table/:tableName",
  validateWorkspaceId,
  getTableDetails
);
router.delete(
  "/workspace/:id/table/:tableName",
  validateWorkspaceId,
  deleteTable
);

// Data insertion
router.post(
  "/workspace/:id/table/:tableName/data",
  validateWorkspaceId,
  validateInsertData,
  insertData
);

module.exports = router;
