interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  showSpinner = true,
}: LoadingStateProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        {showSpinner && (
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500 mx-auto mb-4"
            aria-hidden="true"
          ></div>
        )}
        <p className={showSpinner ? "text-lavender-700" : "text-2xl font-bold"}>
          {message}
        </p>
      </div>
    </div>
  );
}
