const { Pool } = require("pg");

// Create PostgreSQL connection pool
// Supports both DATABASE_URL (Railway/Render) and individual variables
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.NODE_ENV === "production"
            ? { rejectUnauthorized: false }
            : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.PG_HOST || "localhost",
        port: process.env.PG_PORT || 5432,
        database: process.env.PG_DATABASE || "ciphersql_app",
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// Test connection and create database if it doesn't exist
async function initializePostgres() {
  try {
    const client = await pool.connect();
    client.release();
  } catch (error) {
    // Silently handle - app will continue without PostgreSQL
  }
}

// Graceful shutdown
pool.on("error", (err, client) => {
  process.exit(-1);
});

// Helper function to execute queries
async function query(text, params) {
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
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
