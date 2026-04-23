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
            className={`${className} text-pistachio-700`}
            aria-hidden="true"
          />
          {showText ? (
            <span className="text-sm text-pistachio-700 font-medium">
              Encrypted
            </span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </>
      ) : (
        <>
          <LockOpenIcon
            className={`${className} text-lavender-200`}
            aria-hidden="true"
          />
          {showText ? (
            <span className="text-sm text-lavender-500">Not encrypted</span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </>
      )}
    </div>
  );
};

export default EncryptionStatus;
