import { useState, useEffect, useCallback } from "react";
import { X, ChevronDown, ChevronUp, Trash2 } from "lucide-react";

interface ErrorLog {
  id: string;
  timestamp: Date;
  type: "api" | "runtime" | "promise";
  message: string;
  details?: string;
  status?: number;
  url?: string;
}

// Global error store
let errorListeners: ((errors: ErrorLog[]) => void)[] = [];
let errors: ErrorLog[] = [];

const addError = (error: Omit<ErrorLog, "id" | "timestamp">) => {
  const newError: ErrorLog = {
    ...error,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
  };
  errors = [newError, ...errors].slice(0, 50); // Keep last 50 errors
  errorListeners.forEach((listener) => listener([...errors]));
};

const clearErrors = () => {
  errors = [];
  errorListeners.forEach((listener) => listener([]));
};

// Export for use in api.ts
export const logApiError = (
  message: string,
  status?: number,
  url?: string,
  details?: string
) => {
  addError({ type: "api", message, status, url, details });
};

// Export for use anywhere
export const logRuntimeError = (message: string, details?: string) => {
  addError({ type: "runtime", message, details });
};

export default function ErrorOverlay() {
  const [errorList, setErrorList] = useState<ErrorLog[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to errors
    const listener = (newErrors: ErrorLog[]) => setErrorList(newErrors);
    errorListeners.push(listener);

    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      addError({
        type: "promise",
        message: "Unhandled Promise Rejection",
        details:
          event.reason?.message ||
          event.reason?.toString() ||
          "Unknown error",
      });
    };

    // Catch runtime errors
    const handleError = (event: ErrorEvent) => {
      addError({
        type: "runtime",
        message: event.message,
        details: `${event.filename}:${event.lineno}:${event.colno}`,
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      errorListeners = errorListeners.filter((l) => l !== listener);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-[9999] bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
      >
        🐛 {errorList.length > 0 ? `(${errorList.length})` : "Debug"}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-20 left-2 right-2 z-[9999] bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 ${
        isMinimized ? "max-h-12" : "max-h-[50vh]"
      } overflow-hidden transition-all duration-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">🐛 Debug Console</span>
          {errorList.length > 0 && (
            <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
              {errorList.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearErrors}
            className="p-1.5 hover:bg-gray-700 rounded"
            title="Clear all"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-700 rounded"
          >
            {isMinimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1.5 hover:bg-gray-700 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Error List */}
      {!isMinimized && (
        <div className="overflow-y-auto max-h-[calc(50vh-48px)]">
          {errorList.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No errors yet. Errors will appear here.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {errorList.map((error) => (
                <div
                  key={error.id}
                  className="p-2 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => toggleExpand(error.id)}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        error.type === "api"
                          ? "bg-blue-500/20 text-blue-400"
                          : error.type === "promise"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {error.type.toUpperCase()}
                    </span>
                    {error.status && (
                      <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                        {error.status}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {error.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1 text-gray-200 break-all">
                    {error.message}
                  </p>
                  {error.url && (
                    <p className="text-xs text-gray-500 mt-0.5 break-all">
                      {error.url}
                    </p>
                  )}
                  {expandedId === error.id && error.details && (
                    <pre className="text-xs mt-2 p-2 bg-gray-950 rounded overflow-x-auto whitespace-pre-wrap text-gray-300">
                      {error.details}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
