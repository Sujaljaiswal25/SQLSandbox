const { Pool } = require("pg");

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PG_HOST || "localhost",
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || "ciphersql_app",
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and create database if it doesn't exist
async function initializePostgres() {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL");
    client.release();
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error.message);
    throw error;
  }
}

// Graceful shutdown
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Query error:", error.message);
    throw error;
  }
}

// Get a client from the pool for transactions
async function getClient() {
  return await pool.connect();
}

module.exports = {
  pool,
  query,
  getClient,
  initializePostgres,
};
