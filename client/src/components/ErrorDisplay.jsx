const ErrorDisplay = ({ error }) => {
  if (!error) return null;

  const getErrorIcon = (type) => {
    switch (type) {
      case "SYNTAX_ERROR":
        return (
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">{getErrorIcon(error.type)}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {error.type?.replace(/_/g, " ") || "Error"}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
          </div>
          {error.suggestion && (
            <div className="mt-3 text-sm text-red-600 bg-red-100 p-3 rounded">
              <p className="font-medium">💡 Suggestion:</p>
              <p className="mt-1">{error.suggestion}</p>
            </div>
          )}
          {error.original && error.original !== error.message && (
            <details className="mt-3">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                {error.original}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
