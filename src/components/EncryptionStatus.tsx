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
  return (
    <div className="flex items-center gap-1">
      {isEncrypted ? (
        <>
          <LockClosedIcon className={`${className} text-green-600`} />
          {showText && (
            <span className="text-sm text-green-600 font-medium">
              Encrypted
            </span>
          )}
        </>
      ) : (
        <>
          <LockOpenIcon className={`${className} text-gray-400`} />
          {showText && (
            <span className="text-sm text-gray-500">Not encrypted</span>
          )}
        </>
      )}
    </div>
  );
};

export default EncryptionStatus;
