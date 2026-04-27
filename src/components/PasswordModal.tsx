import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/16/solid";
import type React from "react";
import { useState } from "react";
import { validatePassword } from "../lib/crypto";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string, shouldEncrypt: boolean) => void;
  mode: "set" | "enter";
  title?: string;
  description?: string;
  toggleLabel?: string;
  submitLabelWithPassword?: string;
  submitLabelWithoutPassword?: string;
  submitLabelEnter?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  mode,
  title,
  description,
  toggleLabel,
  submitLabelWithPassword,
  submitLabelWithoutPassword,
  submitLabelEnter,
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
      : shouldEncrypt
        ? validation.isValid && passwordsMatch
        : true; // Allow submission without password if not encrypting

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="password-modal-title"
        className="w-full max-w-md bg-th-paper p-6 border border-th-line"
      >
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <LockClosedIcon
            className="h-6 w-6 text-th-ink-muted"
            aria-hidden="true"
          />
          <div>
            <h2 id="password-modal-title" className="text-lg font-semibold">
              {title ||
                (mode === "set" ? "Password Protection" : "Enter Password")}
            </h2>
            <p className="text-sm text-th-ink-muted">
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
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">
                  {toggleLabel || "Enable password protection"}
                </span>
              </label>
            </div>
          )}

          {(shouldEncrypt || mode === "enter") && (
            <>
              {/* Password Input */}
              <div className="mb-4">
                <label
                  htmlFor="modal-password"
                  className="mb-2 block text-sm font-medium text-th-ink-muted"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="modal-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-th-line bg-th-paper px-3 py-2 pr-10 focus:border-th-primary focus:outline-none focus:ring-1 focus:ring-th-primary"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-th-line hover:text-th-ink"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                  <label
                    htmlFor="modal-confirm-password"
                    className="mb-2 block text-sm font-medium text-th-ink-muted"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="modal-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border px-3 py-2 pr-10 focus:outline-none focus:ring-1 ${
                        confirmPassword && !passwordsMatch
                          ? "border-th-danger focus:border-th-danger focus:ring-th-danger"
                          : "border-th-line focus:border-th-primary focus:ring-th-primary"
                      }`}
                      placeholder="Confirm password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-th-line hover:text-th-ink"
                      aria-label={
                        showConfirm ? "Hide confirmation" : "Show confirmation"
                      }
                    >
                      {showConfirm ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs text-th-danger" role="alert">
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
              className="border border-th-line px-4 py-2 text-sm font-medium text-th-ink-muted hover:bg-th-paper-soft focus:outline-none focus:ring-2 focus:ring-th-primary focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit && (shouldEncrypt || mode === "enter")}
              className="bg-th-primary px-4 py-2 text-sm font-medium text-white hover:bg-th-primary-hover focus:outline-none focus:ring-2 focus:ring-th-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === "set"
                ? shouldEncrypt
                  ? submitLabelWithPassword || "Publish with Password"
                  : submitLabelWithoutPassword || "Publish without Password"
                : submitLabelEnter || "Unlock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
