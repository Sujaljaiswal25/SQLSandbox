const { query, getClient } = require("../configs/postgres");
const { mapToPostgresType } = require("../utils/dataTypeMapping");

/**
 * Create a new PostgreSQL schema for a workspace
 * Schema naming: ws_{workspaceId}
 */
async function createWorkspaceSchema(workspaceId) {
  const schemaName = `ws_${workspaceId}`;
  try {
    await query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    console.log(`Created schema: ${schemaName}`);
    return schemaName;
  } catch (error) {
    console.error(`Error creating schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Drop a workspace schema and all its tables
 */
async function dropWorkspaceSchema(workspaceId) {
  const schemaName = `ws_${workspaceId}`;
  try {
    await query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
    console.log(`Dropped schema: ${schemaName}`);
    return true;
  } catch (error) {
    console.error(`Error dropping schema ${schemaName}:`, error);
    throw error;
  }
}

/**
 * Create a table in a workspace schema
 * @param {string} schemaName - PostgreSQL schema name
 * @param {string} tableName - Table name
 * @param {Array} columns - Array of {columnName, dataType}
 */
async function createTable(schemaName, tableName, columns) {
  if (!columns || columns.length === 0) {
    throw new Error("Table must have at least one column");
  }

  // Build column definitions
  const columnDefs = columns
    .map((col) => {
      const pgType = mapToPostgresType(col.dataType);
      return `"${col.columnName}" ${pgType}`;
    })
    .join(", ");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${schemaName}."${tableName}" (
      id SERIAL PRIMARY KEY,
      ${columnDefs}
    )
  `;

  try {
    await query(createTableQuery);
    console.log(`Created table: ${schemaName}.${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error creating table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Drop a table from a workspace schema
 */
async function dropTable(schemaName, tableName) {
  try {
    await query(`DROP TABLE IF EXISTS ${schemaName}."${tableName}" CASCADE`);
    console.log(`Dropped table: ${schemaName}.${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error dropping table ${tableName}:`, error);
    throw error;
  }
}

/**
 * Insert a row into a table
 */
async function insertRow(schemaName, tableName, rowData) {
  const columns = Object.keys(rowData);
  const values = Object.values(rowData);

  const columnList = columns.map((col) => `"${col}"`).join(", ");
  const placeholders = values.map((_, idx) => `$${idx + 1}`).join(", ");

  const insertQuery = `
    INSERT INTO ${schemaName}."${tableName}" (${columnList})
    VALUES (${placeholders})
    RETURNING *
  `;

  try {
    const result = await query(insertQuery, values);
    return result.rows[0];
  } catch (error) {
    console.error(`Error inserting row into ${tableName}:`, error);
    throw error;
  }
}

/**
 * Execute a user-provided SQL query within a workspace schema
 * Security: Set search_path to limit access to only workspace schema
 */
async function executeQuery(schemaName, sqlQuery) {
  const client = await getClient();

  try {
    // Begin transaction
    await client.query("BEGIN");

    // Set search path to restrict access to only this workspace's schema
    await client.query(`SET search_path TO ${schemaName}, public`);

    // Execute the user's query
    const result = await client.query(sqlQuery);

    // Commit transaction
    await client.query("COMMIT");

    return {
      success: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields,
    };
  } catch (error) {
    // Rollback on error
    await client.query("ROLLBACK");
    console.error("Query execution error:", error);

    return {
      success: false,
      error: error.message,
    };
  } finally {
    client.release();
  }
}

/**
 * Get all tables in a workspace schema
 */
async function getTablesInSchema(schemaName) {
  const tablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = $1 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  try {
    const result = await query(tablesQuery, [schemaName]);
    return result.rows.map((row) => row.table_name);
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw error;
  }
}

/**
 * Get table structure (columns and types)
 */
async function getTableStructure(schemaName, tableName) {
  const structureQuery = `
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = $1 
    AND table_name = $2
    ORDER BY ordinal_position
  `;

  try {
    const result = await query(structureQuery, [schemaName, tableName]);
    return result.rows;
  } catch (error) {
    console.error("Error fetching table structure:", error);
    throw error;
  }
}

/**
 * Get all rows from a table
 */
async function getTableData(schemaName, tableName) {
  try {
    const result = await query(`SELECT * FROM ${schemaName}."${tableName}"`);
    return result.rows;
  } catch (error) {
    console.error("Error fetching table data:", error);
    throw error;
  }
}

module.exports = {
  createWorkspaceSchema,
  dropWorkspaceSchema,
  createTable,
  dropTable,
  insertRow,
  executeQuery,
  getTablesInSchema,
  getTableStructure,
  getTableData,
};
