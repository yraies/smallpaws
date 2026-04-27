import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/16/solid";
import type React from "react";

interface EncryptionStatusProps {
  isEncrypted: boolean;
  className?: string;
  showText?: boolean;
}

const EncryptionStatus: React.FC<EncryptionStatusProps> = ({
  isEncrypted,
  className = "h-4 w-4",
  showText = false,
}) => {
  const label = isEncrypted ? "Encrypted" : "Not encrypted";

  return (
    <div className="flex items-center gap-1" title={label}>
      {isEncrypted ? (
        <>
          <LockClosedIcon
            className={`${className} text-th-success`}
            aria-hidden="true"
          />
          {showText ? (
            <span className="text-sm text-th-success font-medium">
              Encrypted
            </span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </>
      ) : (
        <>
          <LockOpenIcon
            className={`${className} text-th-line`}
            aria-hidden="true"
          />
          {showText ? (
            <span className="text-sm text-th-ink-muted">Not encrypted</span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </>
      )}
    </div>
  );
};

export default EncryptionStatus;
