import type React from "react";
import FormHeader from "./FormHeader";

interface DocumentPageShellProps {
  formName: string;
  isEncrypted: boolean;
  onHomeClick: () => void;
  readOnly?: boolean;
  onFormNameChange?: (name: string) => void;
  actions?: React.ReactNode;
  notice?: React.ReactNode;
  overlay?: React.ReactNode;
  children: React.ReactNode;
}

export default function DocumentPageShell({
  formName,
  isEncrypted,
  onHomeClick,
  readOnly = false,
  onFormNameChange,
  actions,
  notice,
  overlay,
  children,
}: DocumentPageShellProps) {
  return (
    <>
      <FormHeader
        formName={formName}
        isEncrypted={isEncrypted}
        onFormNameChange={onFormNameChange}
        onHomeClick={onHomeClick}
        readOnly={readOnly}
      />

      {actions}
      {notice}
      {overlay}
      {children}
    </>
  );
}
