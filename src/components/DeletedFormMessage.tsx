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
        <TrashIcon
          className="h-16 w-16 text-th-danger mx-auto mb-4"
          aria-hidden="true"
        />
        <h1 className="text-2xl font-bold mb-2">This form has been deleted</h1>
        <p className="text-th-line mb-6">{message}</p>
        <button
          type="button"
          onClick={onGoHome}
          className="bg-th-primary hover:bg-th-primary-hover text-white px-6 py-2 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}
