/**
 * Data Type Mapping Utility
 * Maps frontend-friendly data types to PostgreSQL data types
 */

const dataTypeMap = {
  // Integer types
  INTEGER: "INTEGER",
  INT: "INTEGER",
  BIGINT: "BIGINT",
  SMALLINT: "SMALLINT",

  // Text types
  TEXT: "TEXT",
  VARCHAR: "VARCHAR(255)",
  CHAR: "CHAR(50)",
  STRING: "TEXT",

  // Numeric types
  REAL: "REAL",
  FLOAT: "REAL",
  DOUBLE: "DOUBLE PRECISION",
  DECIMAL: "DECIMAL(10,2)",
  NUMERIC: "NUMERIC(10,2)",

  // Boolean
  BOOLEAN: "BOOLEAN",
  BOOL: "BOOLEAN",

  // Date/Time types
  DATE: "DATE",
  TIME: "TIME",
  TIMESTAMP: "TIMESTAMP",
  DATETIME: "TIMESTAMP",

  // JSON
  JSON: "JSON",
  JSONB: "JSONB",

  // UUID
  UUID: "UUID",
};

/**
 * Map frontend data type to PostgreSQL data type
 * @param {string} frontendType - Data type from frontend
 * @returns {string} PostgreSQL data type
 */
function mapToPostgresType(frontendType) {
  const upperType = frontendType.toUpperCase().trim();

  // Check if it's a VARCHAR with length specification
  if (upperType.startsWith("VARCHAR(")) {
    return upperType;
  }

  // Check if it's a DECIMAL/NUMERIC with precision
  if (upperType.startsWith("DECIMAL(") || upperType.startsWith("NUMERIC(")) {
    return upperType;
  }

  // Map using the dataTypeMap
  const mappedType = dataTypeMap[upperType];

  if (!mappedType) {
    throw new Error(
      `Unsupported data type: ${frontendType}. Supported types: ${Object.keys(
        dataTypeMap
      ).join(", ")}`
    );
  }

  return mappedType;
}

/**
 * Validate if a data type is supported
 * @param {string} dataType - Data type to validate
 * @returns {boolean}
 */
function isValidDataType(dataType) {
  const upperType = dataType.toUpperCase().trim();

  // Check basic types
  if (dataTypeMap[upperType]) {
    return true;
  }

  // Check VARCHAR with length
  if (/^VARCHAR\(\d+\)$/.test(upperType)) {
    return true;
  }

  // Check DECIMAL/NUMERIC with precision
  if (/^(DECIMAL|NUMERIC)\(\d+,\d+\)$/.test(upperType)) {
    return true;
  }

  return false;
}

/**
 * Get list of all supported data types
 * @returns {Array<string>}
 */
function getSupportedDataTypes() {
  return Object.keys(dataTypeMap);
}

/**
 * Get recommended data types for frontend dropdown
 * @returns {Array<Object>}
 */
function getRecommendedDataTypes() {
  return [
    { value: "INTEGER", label: "Integer", description: "Whole numbers" },
    {
      value: "BIGINT",
      label: "Big Integer",
      description: "Large whole numbers",
    },
    { value: "TEXT", label: "Text", description: "Variable-length text" },
    {
      value: "VARCHAR",
      label: "Varchar(255)",
      description: "Variable character with length",
    },
    { value: "REAL", label: "Real", description: "Floating-point number" },
    {
      value: "DECIMAL",
      label: "Decimal(10,2)",
      description: "Fixed-point number",
    },
    { value: "BOOLEAN", label: "Boolean", description: "True/False" },
    { value: "DATE", label: "Date", description: "Date (YYYY-MM-DD)" },
    { value: "TIMESTAMP", label: "Timestamp", description: "Date and time" },
    { value: "JSON", label: "JSON", description: "JSON data" },
  ];
}

module.exports = {
  mapToPostgresType,
  isValidDataType,
  getSupportedDataTypes,
  getRecommendedDataTypes,
  dataTypeMap,
};
