import React from "react";

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  showSpinner = true,
}: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {showSpinner && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        )}
        <p className={showSpinner ? "text-gray-600" : "text-2xl font-bold"}>
          {message}
        </p>
      </div>
    </div>
  );
}
