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

  const addColumn = () =>
    setColumns([...columns, { columnName: "", dataType: "INTEGER" }]);
  const removeColumn = (index) =>
    columns.length > 1 && setColumns(columns.filter((_, i) => i !== index));
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Create Table
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Define your table schema
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
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
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Table Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Table Name *
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g., users, products, orders"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              required
            />
          </div>

          {/* Columns */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Columns *
              </label>
              <button
                type="button"
                onClick={addColumn}
                className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium"
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
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={column.columnName}
                      onChange={(e) =>
                        updateColumn(index, "columnName", e.target.value)
                      }
                      placeholder="Column name"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white"
                      required
                    />
                  </div>
                  <div className="w-44">
                    <select
                      value={column.dataType}
                      onChange={(e) =>
                        updateColumn(index, "dataType", e.target.value)
                      }
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-all bg-white font-medium text-sm"
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
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
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

          <div className="flex items-center gap-2 text-xs text-gray-500 mt-4 bg-blue-50 p-3 rounded-lg">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              An auto-incrementing ID column will be added automatically
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 font-medium"
          >
            {isSubmitting ? "Creating..." : "Create Table"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTableModal;
