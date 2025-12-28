const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema(
  {
    columnName: {
      type: String,
      required: true,
      trim: true,
    },
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

const tableSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true,
      trim: true,
    },
    columns: [columnSchema],
    rows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  { _id: false }
);

const queryHistorySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["success", "error"],
      required: true,
    },
    result: mongoose.Schema.Types.Mixed,
    error: String,
  },
  { _id: false }
);

const workspaceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pgSchemaName: {
      type: String,
      required: true,
      unique: true,
    },
    tables: {
      type: [tableSchema],
      default: [],
    },
    queryHistory: {
      type: [queryHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
workspaceSchema.index({ workspaceId: 1 });
workspaceSchema.index({ pgSchemaName: 1 });

// Instance method to add a table
workspaceSchema.methods.addTable = function (tableName, columns) {
  this.tables.push({ tableName, columns, rows: [] });
  return this.save();
};

// Instance method to add query to history
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

  // Keep only last 100 queries to prevent bloat
  if (this.queryHistory.length > 100) {
    this.queryHistory = this.queryHistory.slice(-100);
  }

  return this.save();
};

// Static method to find workspace by workspaceId
workspaceSchema.statics.findByWorkspaceId = function (workspaceId) {
  return this.findOne({ workspaceId });
};

const Workspace = mongoose.model("Workspace", workspaceSchema);

module.exports = Workspace;
