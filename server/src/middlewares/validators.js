// Request validation middleware

// Validate workspace creation: name required, max 100 chars
function validateCreateWorkspace(req, res, next) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "name", message: "Workspace name is required" },
    });
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "name",
        message: "Workspace name must be a non-empty string",
      },
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "name",
        message: "Workspace name must be less than 100 characters",
      },
    });
  }

  next();
}

// Validate table creation: name and columns required
function validateCreateTable(req, res, next) {
  const { tableName, columns } = req.body;

  if (!tableName) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "tableName", message: "Table name is required" },
    });
  }

  if (typeof tableName !== "string" || tableName.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "tableName",
        message: "Table name must be a non-empty string",
      },
    });
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "tableName",
        message:
          "Table name must start with a letter and contain only letters, numbers, and underscores",
      },
    });
  }

  if (!columns || !Array.isArray(columns)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "columns", message: "Columns must be an array" },
    });
  }

  if (columns.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "columns", message: "At least one column is required" },
    });
  }

  // Validate each column
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];

    if (!col.columnName || typeof col.columnName !== "string") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: {
          field: `columns[${i}].columnName`,
          message: "Column name is required and must be a string",
        },
      });
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(col.columnName)) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: {
          field: `columns[${i}].columnName`,
          message:
            "Column name must start with a letter and contain only letters, numbers, and underscores",
        },
      });
    }

    if (!col.dataType || typeof col.dataType !== "string") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: {
          field: `columns[${i}].dataType`,
          message: "Data type is required and must be a string",
        },
      });
    }
  }

  next();
}

// Validate query execution: non-empty, max 10000 chars
function validateExecuteQuery(req, res, next) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "query", message: "SQL query is required" },
    });
  }

  if (typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "query", message: "Query must be a non-empty string" },
    });
  }

  if (query.length > 10000) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "query",
        message: "Query is too long (maximum 10000 characters)",
      },
    });
  }

  next();
}

// Validate insert data: rows array, min 1, max 1000 rows
function validateInsertData(req, res, next) {
  const { rows } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "rows", message: "Rows must be an array" },
    });
  }

  if (rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "rows", message: "At least one row is required" },
    });
  }

  if (rows.length > 1000) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: {
        field: "rows",
        message: "Cannot insert more than 1000 rows at once",
      },
    });
  }

  next();
}

// Validate workspace ID: must be valid UUID v4
function validateWorkspaceId(req, res, next) {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "id", message: "Workspace ID is required" },
    });
  }

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(id)) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: { field: "id", message: "Invalid workspace ID format" },
    });
  }

  next();
}

module.exports = {
  validateCreateWorkspace,
  validateCreateTable,
  validateExecuteQuery,
  validateInsertData,
  validateWorkspaceId,
};
