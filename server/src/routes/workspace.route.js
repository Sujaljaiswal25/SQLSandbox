const express = require("express");
const router = express.Router();
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
const {
  validateCreateWorkspace,
  validateCreateTable,
  validateInsertData,
  validateWorkspaceId,
} = require("../middlewares/validators");
const {
  workspaceLimiter,
  tableLimiter,
} = require("../middlewares/rateLimiter.middleware");

// Workspace CRUD operations
router.post(
  "/workspace",
  workspaceLimiter,
  validateCreateWorkspace,
  createWorkspace
);
router.get("/workspace/:id", validateWorkspaceId, getWorkspace);
router.put(
  "/workspace/:id",
  validateWorkspaceId,
  validateCreateWorkspace,
  updateWorkspace
);
router.delete("/workspace/:id", validateWorkspaceId, deleteWorkspace);
router.get("/workspaces", getAllWorkspaces);

// Workspace sync operation
router.post("/workspace/:id/sync", validateWorkspaceId, syncWorkspace);

// Table operations
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
