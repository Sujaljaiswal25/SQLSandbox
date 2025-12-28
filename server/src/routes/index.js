const express = require("express");
const router = express.Router();

// Import route modules
const workspaceRoutes = require("./workspace.route");
const queryRoutes = require("./query.route");
const hintRoutes = require("./hint.route");

// Mount routes
router.use("/", workspaceRoutes);
router.use("/", queryRoutes);
router.use("/", hintRoutes);

// API info endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CipherSQL Sandbox API",
    version: "1.0.0",
    endpoints: {
      workspaces: {
        "POST /api/workspace": "Create new workspace",
        "GET /api/workspace/:id": "Get workspace details",
        "PUT /api/workspace/:id": "Update workspace",
        "DELETE /api/workspace/:id": "Delete workspace",
        "GET /api/workspaces": "Get all workspaces",
      },
      tables: {
        "POST /api/workspace/:id/table": "Create table",
        "GET /api/workspace/:id/tables": "Get all tables",
        "GET /api/workspace/:id/table/:tableName": "Get table details",
        "DELETE /api/workspace/:id/table/:tableName": "Delete table",
        "POST /api/workspace/:id/table/:tableName/data": "Insert data",
      },
      queries: {
        "POST /api/workspace/:id/execute": "Execute SQL query",
        "GET /api/workspace/:id/history": "Get query history",
      },
      hints: {
        "POST /api/hint": "Get AI query hint",
      },
    },
  });
});

module.exports = router;
