const { mapToPostgresType } = require("./dataTypeMapping.util");
const { sanitizeIdentifier, escapeStringValue } = require("./validators.util");

// Generate CREATE TABLE statement
function generateCreateTableSQL(schemaName, tableName, columns) {
  if (!columns || columns.length === 0) {
    throw new Error("Table must have at least one column");
  }

  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);

  const columnDefs = columns.map((col) => {
    const safeColumn = sanitizeIdentifier(col.columnName);
    const pgType = mapToPostgresType(col.dataType);
    return `"${safeColumn}" ${pgType}`;
  });

  const allColumns = ["id SERIAL PRIMARY KEY", ...columnDefs];

  const sql = `CREATE TABLE IF NOT EXISTS ${safeSchema}."${safeTable}" (
  ${allColumns.join(",\n  ")}
);`;

  return sql;
}

// Generate INSERT statement for one row
function generateInsertSQL(schemaName, tableName, rowData, columns) {
  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);

  const columnNames = Object.keys(rowData);

  if (columnNames.length === 0) {
    throw new Error("Row data cannot be empty");
  }

  const safeColumns = columnNames.map((col) => `"${sanitizeIdentifier(col)}"`);

  const values = columnNames.map((colName) => {
    const value = rowData[colName];
    const colDef = columns?.find((c) => c.columnName === colName);
    return formatValue(value, colDef?.dataType);
  });

  const sql = `INSERT INTO ${safeSchema}."${safeTable}" (${safeColumns.join(
    ", "
  )})
VALUES (${values.join(", ")});`;

  return sql;
}

// Generate array of INSERT statements for multiple rows
function generateBulkInsertSQL(schemaName, tableName, rows, columns) {
  if (!rows || rows.length === 0) return [];
  return rows.map((row) =>
    generateInsertSQL(schemaName, tableName, row, columns)
  );
}

// Format value based on data type for SQL
function formatValue(value, dataType) {
  if (value === null || value === undefined) return "NULL";

  if (!dataType) {
    if (typeof value === "number") return value;
    if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
    return escapeStringValue(value);
  }

  const upperType = dataType.toUpperCase().trim();

  // Numbers don't need quotes
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
    let boolValue = value;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      boolValue = lower === "true" || lower === "t" || lower === "1";
    }
    return boolValue ? "TRUE" : "FALSE";
  }

  // JSON types
  if (upperType === "JSON" || upperType === "JSONB") {
    if (typeof value === "object")
      return escapeStringValue(JSON.stringify(value));
    return escapeStringValue(value);
  }

  // Everything else needs quotes (TEXT, VARCHAR, DATE, TIMESTAMP, etc.)
  return escapeStringValue(value);
}

// Drop table if exists
function generateDropTableSQL(schemaName, tableName) {
  const safeSchema = sanitizeIdentifier(schemaName);
  const safeTable = sanitizeIdentifier(tableName);
  return `DROP TABLE IF EXISTS ${safeSchema}."${safeTable}" CASCADE;`;
}

// Create schema if not exists
function generateCreateSchemaSQL(schemaName) {
  const safeSchema = sanitizeIdentifier(schemaName);
  return `CREATE SCHEMA IF NOT EXISTS ${safeSchema};`;
}

// Drop schema if exists
function generateDropSchemaSQL(schemaName) {
  const safeSchema = sanitizeIdentifier(schemaName);
  return `DROP SCHEMA IF EXISTS ${safeSchema} CASCADE;`;
}

// Set search path to specific schema
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
