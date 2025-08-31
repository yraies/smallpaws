import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import { validatePassword } from "../lib/crypto";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string, shouldEncrypt: boolean) => void;
  mode: "set" | "enter";
  title?: string;
  description?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  title,
  description,
}) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [shouldEncrypt, setShouldEncrypt] = useState(true);

  const validation = validatePassword(password);
  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    mode === "enter"
      ? password.length > 0
      : validation.isValid && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit(password, shouldEncrypt);
      // Reset form
      setPassword("");
      setConfirmPassword("");
      setShouldEncrypt(true);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setConfirmPassword("");
    setShouldEncrypt(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <LockClosedIcon className="h-6 w-6 text-violet-500" />
          <div>
            <h2 className="text-lg font-semibold">
              {title ||
                (mode === "set" ? "Password Protection" : "Enter Password")}
            </h2>
            <p className="text-sm text-gray-600">
              {description ||
                (mode === "set"
                  ? "Protect your form with a password"
                  : "This form is password protected")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "set" && (
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={shouldEncrypt}
                  onChange={(e) => setShouldEncrypt(e.target.checked)}
                  className="h-4 w-4 text-violet-600"
                />
                <span className="text-sm font-medium">
                  Enable password protection
                </span>
              </label>
            </div>
          )}

          {(shouldEncrypt || mode === "enter") && (
            <>
              {/* Password Input */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password requirements removed - any password is now accepted */}
              </div>

              {/* Confirm Password Input (only for 'set' mode) */}
              {mode === "set" && (
                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full rounded-md border px-3 py-2 pr-10 focus:outline-none focus:ring-1 ${
                        confirmPassword && !passwordsMatch
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                      }`}
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit && (shouldEncrypt || mode === "enter")}
              className="rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {mode === "set"
                ? shouldEncrypt
                  ? "Save with Password"
                  : "Save without Password"
                : "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
