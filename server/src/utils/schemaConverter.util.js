/**
 * Schema to SQL Conversion
 * Converts table definitions to SQL statements
 */

const {
  validateTableName,
  validateColumnName,
  validateRow,
  checkDuplicateColumns,
} = require("./validators.util");

const {
  generateCreateTableSQL,
  generateBulkInsertSQL,
} = require("./sqlGenerator.util");

/**
 * Convert schema definition to SQL statements
 * @param {Object} tableDefinition - Table definition object
 * @param {string} tableDefinition.tableName - Table name
 * @param {Array} tableDefinition.columns - Column definitions
 * @param {Array} tableDefinition.rows - Row data (optional)
 * @param {string} schemaName - PostgreSQL schema name
 * @returns {Object} Result with SQL statements and validation errors
 */
function convertSchemaToSQL(tableDefinition, schemaName) {
  const { tableName, columns, rows = [] } = tableDefinition;
  const errors = [];
  const sqlStatements = [];

  // Step 1: Validate table name
  const tableValidation = validateTableName(tableName);
  if (!tableValidation.valid) {
    return {
      success: false,
      errors: tableValidation.errors,
      sqlStatements: [],
    };
  }

  // Step 2: Validate columns
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    return {
      success: false,
      errors: ["Table must have at least one column"],
      sqlStatements: [],
    };
  }

  // Validate each column
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];

    if (!col.columnName || !col.dataType) {
      errors.push(`Column ${i + 1}: columnName and dataType are required`);
      continue;
    }

    const colValidation = validateColumnName(col.columnName);
    if (!colValidation.valid) {
      errors.push(
        `Column '${col.columnName}': ${colValidation.errors.join(", ")}`
      );
    }
  }

  // Check for duplicate column names
  const duplicateCheck = checkDuplicateColumns(columns);
  if (duplicateCheck.hasDuplicates) {
    errors.push(
      `Duplicate column names: ${duplicateCheck.duplicates.join(", ")}`
    );
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      sqlStatements: [],
    };
  }

  // Step 3: Generate CREATE TABLE statement
  try {
    const createTableSQL = generateCreateTableSQL(
      schemaName,
      tableName,
      columns
    );
    sqlStatements.push({
      type: "CREATE_TABLE",
      sql: createTableSQL,
    });
  } catch (error) {
    return {
      success: false,
      errors: [`Failed to generate CREATE TABLE: ${error.message}`],
      sqlStatements: [],
    };
  }

  // Step 4: Validate and generate INSERT statements for rows
  if (rows && rows.length > 0) {
    const validatedRows = [];
    const rowErrors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowValidation = validateRow(row, columns);

      if (!rowValidation.valid) {
        rowErrors.push(`Row ${i + 1}: ${rowValidation.errors.join(", ")}`);
      } else {
        validatedRows.push(rowValidation.validatedRow);
      }
    }

    if (rowErrors.length > 0) {
      return {
        success: false,
        errors: rowErrors,
        sqlStatements,
      };
    }

    // Step 5: Generate INSERT statements
    try {
      const insertStatements = generateBulkInsertSQL(
        schemaName,
        tableName,
        validatedRows,
        columns
      );

      insertStatements.forEach((sql) => {
        sqlStatements.push({
          type: "INSERT",
          sql,
        });
      });
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to generate INSERT statements: ${error.message}`],
        sqlStatements,
      };
    }
  }

  // Step 6: Return result
  return {
    success: true,
    errors: [],
    sqlStatements,
    summary: {
      tableName,
      columnCount: columns.length,
      rowCount: rows.length,
      totalStatements: sqlStatements.length,
    },
  };
}

/**
 * Convert multiple table definitions to SQL
 * @param {Array} tables - Array of table definitions
 * @param {string} schemaName - PostgreSQL schema name
 * @returns {Object} Conversion results
 */
function convertMultipleTablesToSQL(tables, schemaName) {
  const results = [];
  const allStatements = [];
  let totalErrors = [];

  for (const table of tables) {
    const result = convertSchemaToSQL(table, schemaName);
    results.push({
      tableName: table.tableName,
      success: result.success,
      errors: result.errors,
      statementCount: result.sqlStatements.length,
    });

    if (result.success) {
      allStatements.push(...result.sqlStatements);
    } else {
      totalErrors.push(...result.errors);
    }
  }

  return {
    success: totalErrors.length === 0,
    results,
    sqlStatements: allStatements,
    errors: totalErrors,
    summary: {
      totalTables: tables.length,
      successfulTables: results.filter((r) => r.success).length,
      totalStatements: allStatements.length,
    },
  };
}

/**
 * Validate table definition without generating SQL
 * Useful for pre-validation before creation
 * @param {Object} tableDefinition - Table definition
 * @returns {Object} Validation result
 */
function validateTableDefinition(tableDefinition) {
  const { tableName, columns, rows = [] } = tableDefinition;
  const errors = [];

  // Validate table name
  const tableValidation = validateTableName(tableName);
  if (!tableValidation.valid) {
    errors.push(...tableValidation.errors);
  }

  // Validate columns exist
  if (!columns || !Array.isArray(columns) || columns.length === 0) {
    errors.push("Table must have at least one column");
    return { valid: false, errors };
  }

  // Validate each column
  for (const col of columns) {
    if (!col.columnName || !col.dataType) {
      errors.push(`Column must have columnName and dataType`);
      continue;
    }

    const colValidation = validateColumnName(col.columnName);
    if (!colValidation.valid) {
      errors.push(...colValidation.errors);
    }
  }

  // Check duplicates
  const duplicateCheck = checkDuplicateColumns(columns);
  if (duplicateCheck.hasDuplicates) {
    errors.push(`Duplicate columns: ${duplicateCheck.duplicates.join(", ")}`);
  }

  // Validate rows if provided
  if (rows.length > 0) {
    for (let i = 0; i < rows.length; i++) {
      const rowValidation = validateRow(rows[i], columns);
      if (!rowValidation.valid) {
        errors.push(`Row ${i + 1}: ${rowValidation.errors.join(", ")}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  convertSchemaToSQL,
  convertMultipleTablesToSQL,
  validateTableDefinition,
};
