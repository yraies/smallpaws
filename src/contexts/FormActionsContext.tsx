import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  exportFormAsCSV,
  exportFormAsJSON,
  prepareFormClone,
} from "../utils/formActions";
import { removeRecentFormFromStorage } from "../utils/recentForms";
import { useFormContext } from "./FormContext";

interface FormActionsContextType {
  // State
  isPublished: boolean;
  isEncrypted: boolean;
  isPublishing: boolean;
  isCloning: boolean;
  isDeleting: boolean;

  // Setters
  setIsPublished: (value: boolean) => void;
  setIsEncrypted: (value: boolean) => void;

  // Actions
  handleClone: () => void;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  handleDelete?: () => Promise<void>;
  handlePublish?: () => void;
  handleShare?: () => void;
}

const FormActionsContext = createContext<FormActionsContextType | undefined>(
  undefined,
);

interface FormActionsProviderProps {
  children: ReactNode;
  formId?: string;
  initialIsPublished?: boolean;
  initialIsEncrypted?: boolean;
  onPublish?: () => void;
  onShare?: () => void;
  allowDelete?: boolean;
}

export function FormActionsProvider({
  children,
  formId,
  initialIsPublished = false,
  initialIsEncrypted = false,
  onPublish,
  onShare,
  allowDelete = true,
}: FormActionsProviderProps) {
  const { form } = useFormContext();
  const router = useRouter();

  const [isPublished, setIsPublished] = useState(initialIsPublished);
  const [isEncrypted, setIsEncrypted] = useState(initialIsEncrypted);
  const [isPublishing, _setIsPublishing] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleClone = useCallback(() => {
    if (!form || !formId) return;

    setIsCloning(true);
    try {
      const newFormId = prepareFormClone(form);
      router.push(`/form/${newFormId}`);
    } catch (error) {
      console.error("Error cloning form:", error);
      alert("Failed to clone form. Please try again.");
    } finally {
      setIsCloning(false);
    }
  }, [form, formId, router]);

  const handleExportCSV = useCallback(() => {
    if (!form) return;

    try {
      exportFormAsCSV(form);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export CSV. Please try again.");
    }
  }, [form]);

  const handleExportJSON = useCallback(() => {
    if (!form) return;

    try {
      exportFormAsJSON(form);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      alert("Failed to export JSON. Please try again.");
    }
  }, [form]);

  const handleDelete = useCallback(async () => {
    if (!form || !formId) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${form.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Clean up localStorage remnants
        removeRecentFormFromStorage(localStorage, formId);

        alert("Form deleted successfully!");
        router.push("/");
      } else {
        const error = await response.json();
        console.error("Failed to delete form:", error);
        alert("Failed to delete form. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      alert("An error occurred while deleting the form.");
    } finally {
      setIsDeleting(false);
    }
  }, [form, formId, router]);

  return (
    <FormActionsContext.Provider
      value={{
        isPublished,
        isEncrypted,
        isPublishing,
        isCloning,
        isDeleting,
        setIsPublished,
        setIsEncrypted,
        handleClone,
        handleExportCSV,
        handleExportJSON,
        handleDelete: formId && allowDelete ? handleDelete : undefined,
        handlePublish: onPublish,
        handleShare: onShare,
      }}
    >
      {children}
    </FormActionsContext.Provider>
  );
}

export function useFormActions() {
  const context = useContext(FormActionsContext);
  if (context === undefined) {
    throw new Error("useFormActions must be used within a FormActionsProvider");
  }
  return context;
}
