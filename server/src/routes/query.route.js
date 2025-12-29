const express = require("express");
const router = express.Router();

// Import controllers
const {
  executeQueryHandler,
  getQueryHistory,
} = require("../controllers/query.controller");

// Import validators
const {
  validateExecuteQuery,
  validateWorkspaceId,
} = require("../middlewares/validators");

// Import rate limiter
const { queryLimiter } = require("../middlewares/rateLimiter.middleware");

// ============================================
// QUERY ROUTES
// ============================================

// Execute SQL query in workspace
// Example: SELECT * FROM users WHERE age > 25
router.post(
  "/workspace/:id/execute",
  queryLimiter, // Limit: 30 queries per minute
  validateWorkspaceId, // Check workspace exists
  validateExecuteQuery, // Check query is provided
  executeQueryHandler // Run the SQL query
);

// Get history of executed queries
router.get("/workspace/:id/history", validateWorkspaceId, getQueryHistory);

module.exports = router;
