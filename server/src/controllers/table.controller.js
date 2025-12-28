const Workspace = require("../models/workspace.model");
const {
  createTable,
  dropTable,
  insertRow,
  getTablesInSchema,
  getTableStructure,
  getTableData,
  syncWorkspaceFromPostgres,
} = require("../services/postgres.service");
const { isValidDataType } = require("../utils/dataTypeMapping.util");

/**
 * POST /api/workspace/:id/table
 * Create new table in workspace
 */
async function createNewTable(req, res) {
  try {
    const { id } = req.params;
    const { tableName, columns } = req.body;

    // Validation
    if (!tableName || tableName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Table name is required",
      });
    }

    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one column is required",
      });
    }

    // Validate column data types
    for (const col of columns) {
      if (!col.columnName || !col.dataType) {
        return res.status(400).json({
          success: false,
          error: "Each column must have columnName and dataType",
        });
      }

      if (!isValidDataType(col.dataType)) {
        return res.status(400).json({
          success: false,
          error: `Invalid data type: ${col.dataType}`,
        });
      }
    }

    // Get workspace
    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Check if table already exists
    const tableExists = workspace.tables.find((t) => t.tableName === tableName);
    if (tableExists) {
      return res.status(400).json({
        success: false,
        error: `Table '${tableName}' already exists in this workspace`,
      });
    }

    // Create table in PostgreSQL
    await createTable(workspace.pgSchemaName, tableName, columns);

    // Auto-sync: Update MongoDB with current PostgreSQL state
    const syncResult = await syncWorkspaceFromPostgres(workspace.pgSchemaName);
    if (syncResult.success) {
      workspace.tables = syncResult.tables;
    }

    await workspace.save();

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: {
        tableName,
        columns,
      },
    });
  } catch (error) {
    console.error("Error creating table:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create table",
      message: error.message,
    });
  }
}

/**
 * GET /api/workspace/:id/tables
 * Get all tables in workspace
 */
async function getTables(req, res) {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Get tables from PostgreSQL for verification
    const pgTables = await getTablesInSchema(workspace.pgSchemaName);

    res.json({
      success: true,
      data: {
        tables: workspace.tables,
        pgTables: pgTables,
      },
    });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tables",
      message: error.message,
    });
  }
}

/**
 * GET /api/workspace/:id/table/:tableName
 * Get table structure and data
 */
async function getTableDetails(req, res) {
  try {
    const { id, tableName } = req.params;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Get structure from PostgreSQL
    const structure = await getTableStructure(
      workspace.pgSchemaName,
      tableName
    );
    const data = await getTableData(workspace.pgSchemaName, tableName);

    // Get metadata from MongoDB
    const tableMetadata = workspace.tables.find(
      (t) => t.tableName === tableName
    );

    res.json({
      success: true,
      data: {
        tableName,
        structure,
        data,
        metadata: tableMetadata,
      },
    });
  } catch (error) {
    console.error("Error fetching table details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch table details",
      message: error.message,
    });
  }
}

/**
 * DELETE /api/workspace/:id/table/:tableName
 * Drop specific table
 */
async function deleteTable(req, res) {
  try {
    const { id, tableName } = req.params;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Drop table from PostgreSQL
    await dropTable(workspace.pgSchemaName, tableName);

    // Remove from MongoDB
    workspace.tables = workspace.tables.filter(
      (t) => t.tableName !== tableName
    );
    await workspace.save();

    res.json({
      success: true,
      message: `Table '${tableName}' deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete table",
      message: error.message,
    });
  }
}

/**
 * POST /api/workspace/:id/table/:tableName/data
 * Insert rows into table
 */
async function insertData(req, res) {
  try {
    const { id, tableName } = req.params;
    const { rows } = req.body;

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Rows array is required",
      });
    }

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    const table = workspace.tables.find((t) => t.tableName === tableName);

    if (!table) {
      return res.status(404).json({
        success: false,
        error: `Table '${tableName}' not found in workspace`,
      });
    }

    // Insert each row into PostgreSQL
    const insertedRows = [];
    for (const row of rows) {
      const inserted = await insertRow(workspace.pgSchemaName, tableName, row);
      insertedRows.push(inserted);
    }

    // Auto-sync: Update MongoDB with current PostgreSQL state
    const syncResult = await syncWorkspaceFromPostgres(workspace.pgSchemaName);
    if (syncResult.success) {
      workspace.tables = syncResult.tables;
    }

    await workspace.save();

    res.status(201).json({
      success: true,
      message: `${rows.length} row(s) inserted successfully`,
      data: insertedRows,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to insert data",
      message: error.message,
    });
  }
}

module.exports = {
  createNewTable,
  getTables,
  getTableDetails,
  deleteTable,
  insertData,
};
