import { useState } from "react";
import { useWorkspace } from "../context/WorkspaceContext";

const DATA_TYPES = [
  "INTEGER",
  "BIGINT",
  "TEXT",
  "VARCHAR",
  "REAL",
  "DECIMAL",
  "BOOLEAN",
  "DATE",
  "TIMESTAMP",
  "JSON",
];

const CreateTableModal = ({ isOpen, onClose }) => {
  const { createTable } = useWorkspace();
  const [tableName, setTableName] = useState("");
  const [columns, setColumns] = useState([
    { columnName: "", dataType: "INTEGER" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addColumn = () => {
    setColumns([...columns, { columnName: "", dataType: "INTEGER" }]);
  };

  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index, field, value) => {
    const newColumns = [...columns];
    newColumns[index][field] = value;
    setColumns(newColumns);
  };

  const validateForm = () => {
    if (!tableName.trim()) {
      setError("Table name is required");
      return false;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tableName)) {
      setError(
        "Table name must start with a letter and contain only letters, numbers, and underscores"
      );
      return false;
    }

    for (let i = 0; i < columns.length; i++) {
      if (!columns[i].columnName.trim()) {
        setError(`Column ${i + 1}: Column name is required`);
        return false;
      }

      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(columns[i].columnName)) {
        setError(
          `Column ${
            i + 1
          }: Column name must start with a letter and contain only letters, numbers, and underscores`
        );
        return false;
      }
    }

    // Check for duplicate column names
    const columnNames = columns.map((c) => c.columnName.toLowerCase());
    const duplicates = columnNames.filter(
      (name, index) => columnNames.indexOf(name) !== index
    );
    if (duplicates.length > 0) {
      setError(`Duplicate column name: ${duplicates[0]}`);
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setError("");

      await createTable({
        tableName: tableName.trim(),
        columns: columns.map((col) => ({
          columnName: col.columnName.trim(),
          dataType: col.dataType,
        })),
      });

      // Reset form
      setTableName("");
      setColumns([{ columnName: "", dataType: "INTEGER" }]);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create table");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTableName("");
    setColumns([{ columnName: "", dataType: "INTEGER" }]);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Table</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Table Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Table Name *
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g., users, products, orders"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Columns */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Columns * (at least one required)
              </label>
              <button
                type="button"
                onClick={addColumn}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span>Add Column</span>
              </button>
            </div>

            <div className="space-y-3">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={column.columnName}
                      onChange={(e) =>
                        updateColumn(index, "columnName", e.target.value)
                      }
                      placeholder="Column name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={column.dataType}
                      onChange={(e) =>
                        updateColumn(index, "dataType", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2">
            Note: An auto-incrementing ID column will be added automatically.
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Table"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTableModal;
