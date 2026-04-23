interface ErrorMessageProps {
  title?: string;
  message: string;
  onGoHome?: () => void;
}

export default function ErrorMessage({
  title = "Error",
  message,
  onGoHome,
}: ErrorMessageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-danger-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-danger-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <title>Error</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-lavender-900 mb-2">{title}</h1>
        <p className="text-lavender-700 mb-6">{message}</p>
        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="inline-flex items-center px-4 py-2 bg-lavender-700 text-white hover:bg-lavender-900 transition-colors"
          >
            Go Home
          </button>
        )}
      </div>
    </div>
  );
}
