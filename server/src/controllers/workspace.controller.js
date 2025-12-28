const { v4: uuidv4 } = require("uuid");
const Workspace = require("../models/workspace.model");
const {
  createWorkspaceSchema,
  dropWorkspaceSchema,
  getTablesInSchema,
  verifyAndSyncWorkspace,
} = require("../services/postgres.service");

/**
 * POST /api/workspace
 * Create new workspace with MongoDB document and PostgreSQL schema
 */
async function createWorkspace(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Workspace name is required",
      });
    }

    // Generate unique workspace ID
    const workspaceId = uuidv4();
    const pgSchemaName = `ws_${workspaceId.replace(/-/g, "_")}`;

    // Create PostgreSQL schema first
    await createWorkspaceSchema(workspaceId.replace(/-/g, "_"));

    // Create MongoDB document
    const workspace = new Workspace({
      workspaceId,
      name: name.trim(),
      pgSchemaName,
      tables: [],
      queryHistory: [],
    });

    await workspace.save();

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: {
        workspaceId: workspace.workspaceId,
        name: workspace.name,
        pgSchemaName: workspace.pgSchemaName,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create workspace",
      message: error.message,
    });
  }
}

/**
 * GET /api/workspace/:id
 * Get workspace by ID with all tables and metadata
 * Automatically verifies and syncs PostgreSQL schema
 */
async function getWorkspace(req, res) {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Verify and sync workspace schema
    // This will reconstruct tables if PostgreSQL schema is missing
    const syncResult = await verifyAndSyncWorkspace(
      workspace.workspaceId,
      workspace.pgSchemaName,
      workspace.tables
    );

    // Get actual tables from PostgreSQL after sync
    const pgTables = await getTablesInSchema(workspace.pgSchemaName);

    res.json({
      success: true,
      data: {
        workspaceId: workspace.workspaceId,
        name: workspace.name,
        pgSchemaName: workspace.pgSchemaName,
        tables: workspace.tables,
        pgTables: pgTables,
        queryHistory: workspace.queryHistory.slice(-10), // Last 10 queries
        createdAt: workspace.createdAt,
        updatedAt: workspace.updatedAt,
      },
      sync: syncResult.reconstructed
        ? {
            reconstructed: true,
            partial: syncResult.partial || false,
            summary: syncResult.summary,
            errors: syncResult.errors,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch workspace",
      message: error.message,
    });
  }
}

/**
 * PUT /api/workspace/:id
 * Update workspace details (name only for now)
 */
async function updateWorkspace(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Workspace name is required",
      });
    }

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    workspace.name = name.trim();
    await workspace.save();

    res.json({
      success: true,
      message: "Workspace updated successfully",
      data: {
        workspaceId: workspace.workspaceId,
        name: workspace.name,
        updatedAt: workspace.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update workspace",
      message: error.message,
    });
  }
}

/**
 * DELETE /api/workspace/:id
 * Delete workspace and cleanup PostgreSQL schema
 */
async function deleteWorkspace(req, res) {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Drop PostgreSQL schema first
    await dropWorkspaceSchema(id.replace(/-/g, "_"));

    // Delete MongoDB document
    await Workspace.deleteOne({ workspaceId: id });

    res.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete workspace",
      message: error.message,
    });
  }
}

/**
 * GET /api/workspaces
 * Get all workspaces (optional feature)
 */
async function getAllWorkspaces(req, res) {
  try {
    const workspaces = await Workspace.find()
      .select("workspaceId name createdAt updatedAt")
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: workspaces,
      count: workspaces.length,
    });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch workspaces",
      message: error.message,
    });
  }
}

module.exports = {
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
};
