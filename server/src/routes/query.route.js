const express = require("express");
const router = express.Router();
const {
  executeQueryHandler,
  getQueryHistory,
} = require("../controllers/query.controller");
const {
  validateExecuteQuery,
  validateWorkspaceId,
} = require("../middlewares/validators");

// Execute SQL query
router.post(
  "/workspace/:id/execute",
  validateWorkspaceId,
  validateExecuteQuery,
  executeQueryHandler
);

// Get query history
router.get("/workspace/:id/history", validateWorkspaceId, getQueryHistory);

module.exports = router;
