const Workspace = require("../models/Workspace");
const { executeQuery } = require("../services/postgresService");

/**
 * Parse PostgreSQL error and return user-friendly message
 */
function parsePostgresError(error) {
  const errorMessage = error.message || error;

  // Syntax errors
  if (errorMessage.includes("syntax error")) {
    const match = errorMessage.match(/syntax error at or near "(.+?)"/);
    const nearWord = match ? match[1] : "";

    return {
      type: "SYNTAX_ERROR",
      message: `Syntax error near '${nearWord}'`,
      suggestion:
        "Check your SQL syntax. Common mistakes: missing semicolons, incorrect keywords, or typos.",
      original: errorMessage,
    };
  }

  // Table not found
  if (
    errorMessage.includes("does not exist") &&
    errorMessage.includes("relation")
  ) {
    const match = errorMessage.match(/relation "(.+?)" does not exist/);
    const tableName = match ? match[1] : "unknown";

    return {
      type: "TABLE_NOT_FOUND",
      message: `Table '${tableName}' does not exist`,
      suggestion:
        "Make sure the table name is correct and the table has been created.",
      original: errorMessage,
    };
  }

  // Column not found
  if (
    errorMessage.includes("does not exist") &&
    errorMessage.includes("column")
  ) {
    const match = errorMessage.match(/column "(.+?)" does not exist/);
    const columnName = match ? match[1] : "unknown";

    return {
      type: "COLUMN_NOT_FOUND",
      message: `Column '${columnName}' does not exist`,
      suggestion:
        "Check the column name spelling and make sure it exists in the table.",
      original: errorMessage,
    };
  }

  // Data type mismatch
  if (errorMessage.includes("invalid input syntax for type")) {
    const match = errorMessage.match(/invalid input syntax for type (.+?):/);
    const dataType = match ? match[1] : "unknown";

    return {
      type: "DATA_TYPE_MISMATCH",
      message: `Invalid value for data type ${dataType}`,
      suggestion: "Make sure the value matches the expected data type.",
      original: errorMessage,
    };
  }

  // Division by zero
  if (errorMessage.includes("division by zero")) {
    return {
      type: "DIVISION_BY_ZERO",
      message: "Division by zero error",
      suggestion: "Check your calculation - you cannot divide by zero.",
      original: errorMessage,
    };
  }

  // Permission denied
  if (errorMessage.includes("permission denied")) {
    return {
      type: "PERMISSION_DENIED",
      message: "Permission denied",
      suggestion: "You do not have permission to perform this operation.",
      original: errorMessage,
    };
  }

  // Generic error
  return {
    type: "QUERY_ERROR",
    message: errorMessage,
    suggestion: "Please check your query and try again.",
    original: errorMessage,
  };
}

/**
 * Format successful query results
 */
function formatQueryResults(pgResult) {
  return {
    success: true,
    data: {
      rows: pgResult.rows || [],
      rowCount: pgResult.rowCount || 0,
      fields: pgResult.fields
        ? pgResult.fields.map((f) => ({
            name: f.name,
            dataType: f.dataTypeID,
          }))
        : [],
      command: pgResult.command || "SELECT",
    },
  };
}

/**
 * POST /api/workspace/:id/execute
 * Execute SQL query and return results
 */
async function executeQueryHandler(req, res) {
  try {
    const { id } = req.params;
    const { query } = req.body;

    // Validation
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        error: {
          type: "VALIDATION_ERROR",
          message: "Query is required",
          suggestion: "Please provide a SQL query to execute.",
        },
      });
    }

    // Get workspace
    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: {
          type: "WORKSPACE_NOT_FOUND",
          message: "Workspace not found",
          suggestion: "Make sure you are using the correct workspace ID.",
        },
      });
    }

    // Execute query with schema isolation
    const result = await executeQuery(workspace.pgSchemaName, query);

    // Check if execution was successful
    if (result.success) {
      // Save successful query to history
      await workspace.addQueryToHistory(
        query,
        "success",
        {
          rowCount: result.rowCount,
          command: result.rows && result.rows.length > 0 ? "SELECT" : "OTHER",
        },
        null
      );

      return res.json(formatQueryResults(result));
    } else {
      // Parse and format error
      const errorInfo = parsePostgresError(result.error);

      // Save failed query to history
      await workspace.addQueryToHistory(
        query,
        "error",
        null,
        errorInfo.message
      );

      return res.status(400).json({
        success: false,
        error: errorInfo,
      });
    }
  } catch (error) {
    console.error("Error executing query:", error);

    const errorInfo = parsePostgresError(error.message);

    res.status(500).json({
      success: false,
      error: {
        ...errorInfo,
        type: "SERVER_ERROR",
        message: "Failed to execute query",
        original: error.message,
      },
    });
  }
}

/**
 * GET /api/workspace/:id/history
 * Get query history for workspace
 */
async function getQueryHistory(req, res) {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const workspace = await Workspace.findByWorkspaceId(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Get last N queries
    const history = workspace.queryHistory.slice(-limit).reverse();

    res.json({
      success: true,
      data: {
        history,
        count: history.length,
      },
    });
  } catch (error) {
    console.error("Error fetching query history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch query history",
      message: error.message,
    });
  }
}

module.exports = {
  executeQueryHandler,
  getQueryHistory,
};
