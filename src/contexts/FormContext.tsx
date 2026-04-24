import { useParams } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Form } from "../types/Form";
import {
  hasLocalDraft,
  loadLocalDraft,
  removeLocalDraft,
  saveLocalDraft,
  saveRecentFormMeta,
} from "../utils/recentForms";
import { consumePendingFormDraft } from "../utils/templateLifecycle";

type FormContextType = {
  form: Form | undefined;
  setForm: Dispatch<SetStateAction<Form>>;
};

const FormContext = createContext<FormContextType>({
  form: undefined,
  setForm: () => {},
});

function FormContextProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState<Form | undefined>(undefined);
  const [isEncrypted, setIsEncrypted] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  useEffect(() => {
    // Check if this is a new form creation from a pending draft
    const pendingForm = consumePendingFormDraft();
    if (pendingForm) {
      setForm(pendingForm);
      setIsPublished(false);
    } else if (id) {
      // First check if the form is encrypted via API
      checkIfEncrypted(id, setIsEncrypted, setForm, setIsPublished);
    }
  }, [id]);

  useEffect(() => {
    // Save draft forms to localStorage for "recent forms" functionality
    // Drafts keep both metadata and their editable payload in browser storage.
    if (id && form && !isEncrypted && !isPublished) {
      saveRecentFormMeta(localStorage, {
        id,
        name: form.name,
        respondentName: form.respondentName,
        encrypted: false,
        kind: "form",
        phase: "draft",
      });
      saveLocalDraft(localStorage, id, JSON.stringify(form));
      console.log("Saved draft form to localStorage");
    }
  }, [id, form, isEncrypted, isPublished]);

  const reSetForm = useCallback<Dispatch<SetStateAction<Form>>>((newForm) => {
    if (typeof newForm === "function") {
      return setForm((prev) => (prev ? newForm(prev) : prev));
    }

    return setForm(newForm);
  }, []);

  return (
    <FormContext.Provider value={{ form, setForm: reSetForm }}>
      {children}
    </FormContext.Provider>
  );
}

async function checkIfEncrypted(
  id: string,
  setIsEncrypted: (encrypted: boolean) => void,
  setForm: (form: Form | undefined) => void,
  setIsPublished: (published: boolean) => void,
) {
  try {
    if (hasLocalDraft(localStorage, id)) {
      setIsPublished(false);
      const storedData = loadLocalDraft(localStorage, id);
      if (!storedData) {
        return;
      }

      try {
        const form = Form.fromPOJO(JSON.parse(storedData));
        setForm(form);
        setIsEncrypted(false);
        console.log("Loaded draft form from localStorage");
        return;
      } catch (error) {
        console.error("Error loading form from localStorage:", error);
      }
    }

    const response = await fetch(`/api/forms/${id}`);
    if (response.ok) {
      const storedForm = await response.json();

      // Check if form has been deleted (soft delete)
      if (storedForm.name === "[Deleted]" || storedForm.data === "{}") {
        console.log("Form has been deleted");
        setIsPublished(true); // Deleted forms were published
        // Don't try to parse - let the page handle the deleted state
        return;
      }

      // Form exists in database = it's published
      setIsPublished(true);

      if (storedForm.encrypted) {
        // Form is encrypted - do NOT load from localStorage or anywhere
        // The form page will handle password verification
        saveRecentFormMeta(localStorage, {
          id,
          name: storedForm.name,
          encrypted: true,
          kind: "form",
          phase: "published",
        });
        removeLocalDraft(localStorage, id);
        setIsEncrypted(true);
        console.log("Form is encrypted, password verification required");
        return;
      } else {
        // Form is not encrypted, safe to load
        setIsEncrypted(false);

        // Always load from API/database - never use localStorage
        // This ensures published forms are never modified from stale cache
        const form = Form.fromPOJO(JSON.parse(storedForm.data));
        saveRecentFormMeta(localStorage, {
          id,
          name: storedForm.name,
          respondentName: form.respondentName,
          encrypted: false,
          kind: "form",
          phase: "published",
        });
        removeLocalDraft(localStorage, id);
        setForm(form);
      }
    } else {
      // Form not found in database and no draft was recovered locally.
      setIsPublished(false);
      console.log("No draft form found in localStorage or database");
    }
  } catch (error) {
    console.error("Error checking form encryption status:", error);
    setIsPublished(false);
  }
}

function useFormContext() {
  return useContext(FormContext);
}

export { FormContext, FormContextProvider, useFormContext };
