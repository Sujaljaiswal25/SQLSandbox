// Workspace model - stores workspace metadata and table definitions

const mongoose = require("mongoose");

// Column definition schema
const columnSchema = new mongoose.Schema(
  {
    columnName: { type: String, required: true, trim: true },
    dataType: {
      type: String,
      required: true,
      enum: [
        "INTEGER",
        "TEXT",
        "REAL",
        "DATE",
        "BOOLEAN",
        "VARCHAR",
        "TIMESTAMP",
        "BIGINT",
        "DECIMAL",
        "NUMERIC",
      ],
    },
  },
  { _id: false }
);

// Table schema with columns and rows
const tableSchema = new mongoose.Schema(
  {
    tableName: { type: String, required: true, trim: true },
    columns: [columnSchema],
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

// Query history schema
const queryHistorySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    executedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["success", "error"], required: true },
    result: mongoose.Schema.Types.Mixed,
    error: String,
  },
  { _id: false }
);

// Main workspace schema
const workspaceSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    pgSchemaName: { type: String, required: true, unique: true },
    tables: { type: [tableSchema], default: [] },
    queryHistory: { type: [queryHistorySchema], default: [] },
  },
  { timestamps: true }
);

// Indexes for fast lookups
workspaceSchema.index({ workspaceId: 1 });
workspaceSchema.index({ pgSchemaName: 1 });

// Add a table to workspace
workspaceSchema.methods.addTable = function (tableName, columns) {
  this.tables.push({ tableName, columns, rows: [] });
  return this.save();
};

// Add query to history (keep last 100 only)
workspaceSchema.methods.addQueryToHistory = function (
  query,
  status,
  result,
  error
) {
  this.queryHistory.push({
    query,
    status,
    result,
    error,
    executedAt: new Date(),
  });
  if (this.queryHistory.length > 100) {
    this.queryHistory = this.queryHistory.slice(-100);
  }
  return this.save();
};

// Find workspace by workspaceId
workspaceSchema.statics.findByWorkspaceId = function (workspaceId) {
  return this.findOne({ workspaceId });
};

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;
