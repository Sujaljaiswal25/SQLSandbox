const ResultTable = ({ data }) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return null;
  }

  const columns = Object.keys(data.rows[0]);

  return (
    <div className="overflow-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td
                  key={`${rowIndex}-${column}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {row[column] !== null && row[column] !== undefined ? (
                    String(row[column])
                  ) : (
                    <span className="text-gray-400 italic">NULL</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
