/**
 * SQL Statement Generator
 * Generates CREATE TABLE and INSERT statements from schema definitions
 */

const { mapToPostgresType } = require("./dataTypeMapping.util");
const { sanitizeIdentifier, escapeStringValue } = require("./validators.util");

/**
 * Generate CREATE TABLE statement
 * @param {string} schemaName - PostgreSQL schema name
 * @param {string} tableName - Table name
 * @param {Array} columns - Array of {columnName, dataType}
 * @returns {string} SQL CREATE TABLE statement
 */
function generateCreateTableSQL(schemaName, tableName, columns) {
  if (!columns || columns.length === 0) {
    throw new Error("Table must have at least one column");
  }

  // Sanitize identifiers
  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);

  // Build column definitions
  const columnDefs = columns.map((col) => {
    const safeColumn = sanitizeIdentifier(col.columnName);
    const pgType = mapToPostgresType(col.dataType);
    return `"${safeColumn}" ${pgType}`;
  });

  // Add auto-incrementing ID as primary key
  const allColumns = ["id SERIAL PRIMARY KEY", ...columnDefs];

  const sql = `CREATE TABLE IF NOT EXISTS ${safeSchema}."${safeTable}" (
  ${allColumns.join(",\n  ")}
);`;

  return sql;
}

/**
 * Generate INSERT statement for a single row
 * @param {string} schemaName - PostgreSQL schema name
 * @param {string} tableName - Table name
 * @param {Object} rowData - Row data as key-value pairs
 * @param {Array} columns - Column definitions for data type reference
 * @returns {string} SQL INSERT statement
 */
function generateInsertSQL(schemaName, tableName, rowData, columns) {
  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);

  const columnNames = Object.keys(rowData);

  if (columnNames.length === 0) {
    throw new Error("Row data cannot be empty");
  }

  // Build column list
  const safeColumns = columnNames.map((col) => `"${sanitizeIdentifier(col)}"`);

  // Build values list with proper type handling
  const values = columnNames.map((colName) => {
    const value = rowData[colName];

    // Find column definition to get data type
    const colDef = columns?.find((c) => c.columnName === colName);

    return formatValue(value, colDef?.dataType);
  });

  const sql = `INSERT INTO ${safeSchema}."${safeTable}" (${safeColumns.join(
    ", "
  )})
VALUES (${values.join(", ")});`;

  return sql;
}

/**
 * Generate multiple INSERT statements
 * @param {string} schemaName - PostgreSQL schema name
 * @param {string} tableName - Table name
 * @param {Array} rows - Array of row objects
 * @param {Array} columns - Column definitions
 * @returns {Array} Array of SQL INSERT statements
 */
function generateBulkInsertSQL(schemaName, tableName, rows, columns) {
  if (!rows || rows.length === 0) {
    return [];
  }

  return rows.map((row) =>
    generateInsertSQL(schemaName, tableName, row, columns)
  );
}

/**
 * Format value for SQL based on data type
 * @param {*} value - Value to format
 * @param {string} dataType - Data type (optional)
 * @returns {string} Formatted SQL value
 */
function formatValue(value, dataType) {
  // Handle NULL
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (!dataType) {
    // Auto-detect type if not provided
    if (typeof value === "number") {
      return value;
    }
    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }
    return escapeStringValue(value);
  }

  const upperType = dataType.toUpperCase().trim();

  // Numbers (no quotes)
  if (
    upperType.includes("INT") ||
    upperType.includes("REAL") ||
    upperType.includes("FLOAT") ||
    upperType.includes("DOUBLE") ||
    upperType.includes("DECIMAL") ||
    upperType.includes("NUMERIC")
  ) {
    return Number(value);
  }

  // Booleans
  if (upperType.includes("BOOL")) {
    // Convert to boolean first
    let boolValue = value;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      boolValue = lower === "true" || lower === "t" || lower === "1";
    }
    return boolValue ? "TRUE" : "FALSE";
  }

  // JSON types
  if (upperType === "JSON" || upperType === "JSONB") {
    if (typeof value === "object") {
      return escapeStringValue(JSON.stringify(value));
    }
    return escapeStringValue(value);
  }

  // Everything else (TEXT, VARCHAR, DATE, TIMESTAMP, etc.) - quote it
  return escapeStringValue(value);
}

/**
 * Generate DROP TABLE statement
 * @param {string} schemaName - PostgreSQL schema name
 * @param {string} tableName - Table name
 * @returns {string} SQL DROP TABLE statement
 */
function generateDropTableSQL(schemaName, tableName) {
  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);

  return `DROP TABLE IF EXISTS ${safeSchema}."${safeTable}" CASCADE;`;
}

/**
 * Generate CREATE SCHEMA statement
 * @param {string} schemaName - Schema name
 * @returns {string} SQL CREATE SCHEMA statement
 */
function generateCreateSchemaSQL(schemaName) {
  const safeSchema = sanitizeIdentifier(schemaName);

  return `CREATE SCHEMA IF NOT EXISTS ${safeSchema};`;
}

/**
 * Generate DROP SCHEMA statement
 * @param {string} schemaName - Schema name
 * @returns {string} SQL DROP SCHEMA statement
 */
function generateDropSchemaSQL(schemaName) {
  const safeSchema = sanitizeIdentifier(schemaName);

  return `DROP SCHEMA IF EXISTS ${safeSchema} CASCADE;`;
}

/**
 * Generate SET search_path statement
 * @param {string} schemaName - Schema name
 * @returns {string} SQL SET statement
 */
function generateSetSearchPathSQL(schemaName) {
  const safeSchema = sanitizeIdentifier(schemaName);

  return `SET search_path TO ${safeSchema}, public;`;
}

module.exports = {
  generateCreateTableSQL,
  generateInsertSQL,
  generateBulkInsertSQL,
  generateDropTableSQL,
  generateCreateSchemaSQL,
  generateDropSchemaSQL,
  generateSetSearchPathSQL,
  formatValue,
};
