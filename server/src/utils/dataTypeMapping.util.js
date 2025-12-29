// Map friendly data types to PostgreSQL types
const dataTypeMap = {
  INTEGER: "INTEGER",
  INT: "INTEGER",
  BIGINT: "BIGINT",
  SMALLINT: "SMALLINT",
  TEXT: "TEXT",
  VARCHAR: "VARCHAR(255)",
  CHAR: "CHAR(50)",
  STRING: "TEXT",
  REAL: "REAL",
  FLOAT: "REAL",
  DOUBLE: "DOUBLE PRECISION",
  DECIMAL: "DECIMAL(10,2)",
  NUMERIC: "NUMERIC(10,2)",
  BOOLEAN: "BOOLEAN",
  BOOL: "BOOLEAN",
  DATE: "DATE",
  TIME: "TIME",
  TIMESTAMP: "TIMESTAMP",
  DATETIME: "TIMESTAMP",
  JSON: "JSON",
  JSONB: "JSONB",
  UUID: "UUID",
};

// Convert to PostgreSQL type
function mapToPostgresType(frontendType) {
  const upperType = frontendType.toUpperCase().trim();

  if (upperType.startsWith("VARCHAR(")) return upperType;
  if (upperType.startsWith("DECIMAL(") || upperType.startsWith("NUMERIC(")) {
    return upperType;
  }

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

// Check if data type is valid
function isValidDataType(dataType) {
  const upperType = dataType.toUpperCase().trim();

  if (dataTypeMap[upperType]) return true;
  if (/^VARCHAR\(\d+\)$/.test(upperType)) return true;
  if (/^(DECIMAL|NUMERIC)\(\d+,\d+\)$/.test(upperType)) return true;

  return false;
}

// Get all supported types
function getSupportedDataTypes() {
  return Object.keys(dataTypeMap);
}

// Get recommended types for dropdown
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
