
const express = require("express");
const cors = require("cors");


const workspaceRoutes = require("./routes/workspace.route");
const queryRoutes = require("./routes/query.route");
const hintRoutes = require("./routes/hint.route");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "CipherSQL Sandbox API is running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", workspaceRoutes); // Workspace & Table routes
app.use("/api", queryRoutes); // SQL Query execution routes
app.use("/api", hintRoutes); // AI Hint routes


app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
