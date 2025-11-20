import React from "react";
import { TrashIcon } from "@heroicons/react/16/solid";

interface DeletedFormMessageProps {
  message?: string;
  onGoHome: () => void;
}

export default function DeletedFormMessage({
  message = "The form you're trying to access has been removed.",
  onGoHome,
}: DeletedFormMessageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <TrashIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">This form has been deleted</h1>
        <p className="text-gray-400 mb-6">{message}</p>
        <button
          onClick={onGoHome}
          className="bg-violet-500 hover:bg-violet-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
