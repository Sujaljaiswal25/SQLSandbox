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
const { queryLimiter } = require("../middlewares/rateLimiter.middleware");

// Execute SQL query
router.post(
  "/workspace/:id/execute",
  queryLimiter,
  validateWorkspaceId,
  validateExecuteQuery,
  executeQueryHandler
);

// Get query history
router.get("/workspace/:id/history", validateWorkspaceId, getQueryHistory);

module.exports = router;
