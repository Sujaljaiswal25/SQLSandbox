const { query, getClient } = require("../configs/postgres.config");
const { mapToPostgresType } = require("../utils/dataTypeMapping.util");
const { convertSchemaToSQL } = require("../utils/schemaConverter.util");

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

/**
 * Check if a workspace schema exists in PostgreSQL
 */
async function schemaExists(schemaName) {
  const checkQuery = `
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name = $1
  `;

  try {
    const result = await query(checkQuery, [schemaName]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking schema existence:`, error);
    return false;
  }
}

/**
 * Reconstruct workspace schema from MongoDB metadata
 * Used when workspace exists in MongoDB but not in PostgreSQL
 * @param {string} schemaName - PostgreSQL schema name
 * @param {Array} tables - Table definitions from MongoDB
 */
async function reconstructWorkspace(schemaName, tables) {
  const client = await getClient();
  const reconstructedTables = [];
  const errors = [];

  try {
    await client.query("BEGIN");

    // Create schema if doesn't exist
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    console.log(`Schema ${schemaName} created/verified`);

    // Reconstruct each table
    for (const table of tables) {
      try {
        // Convert table definition to SQL
        const conversion = convertSchemaToSQL(table, schemaName);

        if (!conversion.success) {
          errors.push({
            tableName: table.tableName,
            errors: conversion.errors,
          });
          continue;
        }

        // Execute all SQL statements (CREATE TABLE + INSERTs)
        for (const statement of conversion.sqlStatements) {
          await client.query(statement.sql);
        }

        reconstructedTables.push({
          tableName: table.tableName,
          columnCount: table.columns.length,
          rowCount: table.rows ? table.rows.length : 0,
        });

        console.log(`Reconstructed table: ${schemaName}.${table.tableName}`);
      } catch (error) {
        errors.push({
          tableName: table.tableName,
          errors: [error.message],
        });
        console.error(`Error reconstructing table ${table.tableName}:`, error);
      }
    }

    await client.query("COMMIT");

    return {
      success: errors.length === 0,
      reconstructedTables,
      errors,
      summary: {
        totalTables: tables.length,
        successfulTables: reconstructedTables.length,
        failedTables: errors.length,
      },
    };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error reconstructing workspace:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Verify and sync workspace
 * Checks if PostgreSQL schema exists and matches MongoDB metadata
 * Reconstructs if needed
 */
async function verifyAndSyncWorkspace(workspaceId, schemaName, tables) {
  try {
    const exists = await schemaExists(schemaName);

    if (!exists) {
      console.log(`Schema ${schemaName} not found. Reconstructing...`);
      const result = await reconstructWorkspace(schemaName, tables);
      return {
        synced: true,
        reconstructed: true,
        ...result,
      };
    }

    // Schema exists - verify tables match
    const existingTables = await getTablesInSchema(schemaName);
    const expectedTables = tables.map((t) => t.tableName);

    const missingTables = expectedTables.filter(
      (t) => !existingTables.includes(t)
    );

    if (missingTables.length > 0) {
      console.log(`Missing tables detected: ${missingTables.join(", ")}`);
      // Reconstruct only missing tables
      const tablesToReconstruct = tables.filter((t) =>
        missingTables.includes(t.tableName)
      );
      const result = await reconstructWorkspace(
        schemaName,
        tablesToReconstruct
      );
      return {
        synced: true,
        reconstructed: true,
        partial: true,
        missingTables,
        ...result,
      };
    }

    return {
      synced: true,
      reconstructed: false,
      message: "Workspace schema is in sync",
    };
  } catch (error) {
    console.error("Error verifying workspace:", error);
    throw error;
  }
}

/**
 * Sync workspace from PostgreSQL to MongoDB
 * Extracts current state from PostgreSQL and returns data for MongoDB update
 * @param {string} schemaName - PostgreSQL schema name
 * @returns {Promise<Object>} Tables data with columns and rows
 */
async function syncWorkspaceFromPostgres(schemaName) {
  try {
    // Get all tables in schema
    const tableNames = await getTablesInSchema(schemaName);

    if (tableNames.length === 0) {
      return {
        success: true,
        tables: [],
        message: "No tables to sync",
      };
    }

    const tables = [];

    // For each table, get structure and data
    for (const tableName of tableNames) {
      try {
        // Get table structure (columns)
        const columns = await getTableStructure(schemaName, tableName);

        // Format columns for MongoDB
        const formattedColumns = columns
          .filter((col) => col.column_name !== "id") // Exclude auto-generated ID
          .map((col) => ({
            columnName: col.column_name,
            dataType: mapPostgresToFriendlyType(col.data_type),
          }));

        // Get table data (rows)
        const rows = await getTableData(schemaName, tableName);

        // Format rows - remove the auto-generated ID column
        const formattedRows = rows.map((row) => {
          const { id, ...rowData } = row;
          return rowData;
        });

        tables.push({
          tableName,
          columns: formattedColumns,
          rows: formattedRows,
          createdAt: new Date(),
        });
      } catch (error) {
        console.error(`Error syncing table ${tableName}:`, error);
        // Continue with other tables even if one fails
      }
    }

    return {
      success: true,
      tables,
      summary: {
        totalTables: tableNames.length,
        syncedTables: tables.length,
      },
    };
  } catch (error) {
    console.error("Error syncing workspace from PostgreSQL:", error);
    throw error;
  }
}

/**
 * Map PostgreSQL data types back to friendly names
 * Reverse of mapToPostgresType
 */
function mapPostgresToFriendlyType(pgType) {
  const typeMap = {
    integer: "INTEGER",
    bigint: "BIGINT",
    smallint: "SMALLINT",
    text: "TEXT",
    "character varying": "VARCHAR",
    varchar: "VARCHAR",
    char: "CHAR",
    character: "CHAR",
    real: "REAL",
    "double precision": "DOUBLE",
    numeric: "DECIMAL",
    decimal: "DECIMAL",
    boolean: "BOOLEAN",
    date: "DATE",
    time: "TIME",
    "timestamp without time zone": "TIMESTAMP",
    timestamp: "TIMESTAMP",
    "timestamp with time zone": "TIMESTAMPTZ",
    json: "JSON",
    jsonb: "JSONB",
    uuid: "UUID",
    bytea: "BYTEA",
  };

  return typeMap[pgType.toLowerCase()] || pgType.toUpperCase();
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
  schemaExists,
  reconstructWorkspace,
  verifyAndSyncWorkspace,
  syncWorkspaceFromPostgres,
};
