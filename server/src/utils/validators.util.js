// SQL reserved words (most common)
const SQL_RESERVED_WORDS = new Set([
  "SELECT",
  "FROM",
  "WHERE",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "DROP",
  "ALTER",
  "TABLE",
  "DATABASE",
  "INDEX",
  "VIEW",
  "TRIGGER",
  "FUNCTION",
  "PROCEDURE",
  "AND",
  "OR",
  "NOT",
  "NULL",
  "TRUE",
  "FALSE",
  "AS",
  "ON",
  "IN",
  "EXISTS",
  "BETWEEN",
  "LIKE",
  "ORDER",
  "BY",
  "GROUP",
  "HAVING",
  "JOIN",
  "LEFT",
  "RIGHT",
  "INNER",
  "OUTER",
  "UNION",
  "ALL",
  "DISTINCT",
  "COUNT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
]);

// Validate table name
function validateTableName(tableName) {
  const errors = [];

  if (!tableName || typeof tableName !== "string") {
    return { valid: false, errors: ["Table name is required"] };
  }

  const trimmedName = tableName.trim();

  if (trimmedName.length === 0) {
    errors.push("Table name cannot be empty");
  }

  // Check length
  if (trimmedName.length > 63) {
    errors.push("Table name must be 63 characters or less");
  }

  // Check if starts with letter
  if (!/^[a-zA-Z]/.test(trimmedName)) {
    errors.push("Table name must start with a letter");
  }

  // Check valid characters
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmedName)) {
    errors.push(
      "Table name can only contain letters, numbers, and underscores"
    );
  }

  // Check for reserved words
  if (SQL_RESERVED_WORDS.has(trimmedName.toUpperCase())) {
    errors.push(
      `'${trimmedName}' is a SQL reserved word and cannot be used as a table name`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate column name
 * Same rules as table name
 */
function validateColumnName(columnName) {
  const errors = [];

  if (!columnName || typeof columnName !== "string") {
    return { valid: false, errors: ["Column name is required"] };
  }

  const trimmedName = columnName.trim();

  if (trimmedName.length === 0) {
    errors.push("Column name cannot be empty");
  }

  if (trimmedName.length > 63) {
    errors.push("Column name must be 63 characters or less");
  }

  if (!/^[a-zA-Z]/.test(trimmedName)) {
    errors.push("Column name must start with a letter");
  }

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmedName)) {
    errors.push(
      "Column name can only contain letters, numbers, and underscores"
    );
  }

  if (SQL_RESERVED_WORDS.has(trimmedName.toUpperCase())) {
    errors.push(
      `'${trimmedName}' is a SQL reserved word and cannot be used as a column name`
    );
  }

  return { valid: errors.length === 0, errors };
}

// Validate data value against type
function validateDataValue(value, dataType) {
  if (value === null || value === undefined || value === "") {
    return { valid: true, value: null };
  }

  const upperType = dataType.toUpperCase().trim();

  switch (upperType) {
    case "INTEGER":
    case "BIGINT":
    case "SMALLINT":
      const intValue = Number(value);
      if (!Number.isInteger(intValue)) {
        return {
          valid: false,
          error: `Value '${value}' is not a valid integer`,
        };
      }
      return { valid: true, value: intValue };

    case "REAL":
    case "FLOAT":
    case "DOUBLE":
    case "DOUBLE PRECISION":
      const floatValue = Number(value);
      if (isNaN(floatValue)) {
        return {
          valid: false,
          error: `Value '${value}' is not a valid number`,
        };
      }
      return { valid: true, value: floatValue };

    case "DECIMAL":
    case "NUMERIC":
    case "DECIMAL(10,2)":
    case "NUMERIC(10,2)":
      const decimalValue = Number(value);
      if (isNaN(decimalValue)) {
        return {
          valid: false,
          error: `Value '${value}' is not a valid decimal number`,
        };
      }
      return { valid: true, value: decimalValue };

    case "TEXT":
    case "VARCHAR":
    case "VARCHAR(255)":
    case "CHAR":
    case "CHAR(50)":
      return { valid: true, value: String(value) };

    case "BOOLEAN":
    case "BOOL":
      // Check if valid boolean
      if (typeof value === "boolean") {
        return { valid: true, value };
      }
      const lowerValue = String(value).toLowerCase();
      if (lowerValue === "true" || lowerValue === "1" || lowerValue === "t") {
        return { valid: true, value: true };
      }
      if (lowerValue === "false" || lowerValue === "0" || lowerValue === "f") {
        return { valid: true, value: false };
      }
      return {
        valid: false,
        error: `Value '${value}' is not a valid boolean`,
      };

    case "DATE":
      // Check if valid date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(String(value))) {
        return {
          valid: false,
          error: `Value '${value}' is not a valid date (expected YYYY-MM-DD)`,
        };
      }
      const dateObj = new Date(value);
      if (isNaN(dateObj.getTime())) {
        return { valid: false, error: `Value '${value}' is not a valid date` };
      }
      return { valid: true, value: String(value) };

    case "TIMESTAMP":
    case "DATETIME":
      const timestampObj = new Date(value);
      if (isNaN(timestampObj.getTime())) {
        return {
          valid: false,
          error: `Value '${value}' is not a valid timestamp`,
        };
      }
      return { valid: true, value: String(value) };

    case "JSON":
    case "JSONB":
      try {
        if (typeof value === "object") {
          return { valid: true, value: JSON.stringify(value) };
        }
        JSON.parse(value);
        return { valid: true, value: String(value) };
      } catch (error) {
        return { valid: false, error: `Value '${value}' is not valid JSON` };
      }

    default:
      return { valid: true, value };
  }
}

// Validate entire row
function validateRow(row, columns) {
  const errors = [];
  const validatedRow = {};

  for (const column of columns) {
    const value = row[column.columnName];
    const validation = validateDataValue(value, column.dataType);

    if (!validation.valid) {
      errors.push(`Column '${column.columnName}': ${validation.error}`);
    } else {
      validatedRow[column.columnName] = validation.value;
    }
  }

  return { valid: errors.length === 0, errors, validatedRow };
}

// Check for duplicate columns
function checkDuplicateColumns(columns) {
  const seen = new Set();
  const duplicates = [];

  for (const column of columns) {
    const lowerName = column.columnName.toLowerCase();
    if (seen.has(lowerName)) {
      duplicates.push(column.columnName);
    }
    seen.add(lowerName);
  }

  return { hasDuplicates: duplicates.length > 0, duplicates };
}

// Sanitize identifier (prevent SQL injection)
function sanitizeIdentifier(identifier) {
  return identifier.replace(/[^a-zA-Z0-9_]/g, "");
}

// Escape string values for SQL
function escapeStringValue(value) {
  if (value === null || value === undefined) return "NULL";
  return "'" + String(value).replace(/'/g, "''") + "'";
}

module.exports = {
  validateTableName,
  validateColumnName,
  validateDataValue,
  validateRow,
  checkDuplicateColumns,
  sanitizeIdentifier,
  escapeStringValue,
  SQL_RESERVED_WORDS,
};
