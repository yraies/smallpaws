import { useParams } from "next/navigation";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Form } from "../types/Form";
import {
  loadDraftFormData,
  removeDraftFormData,
  saveDraftFormData,
  saveRecentFormMeta,
} from "../utils/recentForms";

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
    // Check if this is a new form creation from sessionStorage
    if (sessionStorage.getItem("create_new") === "true") {
      // biome-ignore lint/style/noNonNullAssertion: guarded by create_new check above
      const form = Form.fromPOJO(JSON.parse(sessionStorage.getItem("form")!));
      setForm(form);
      sessionStorage.removeItem("create_new");
      sessionStorage.removeItem("form");
      setIsPublished(false); // New forms are drafts
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
        encrypted: false,
        isPublished: false,
      });
      saveDraftFormData(localStorage, id, JSON.stringify(form));
      console.log("Saved draft form to localStorage");
    }
  }, [id, form, isEncrypted, isPublished]);

  const reSetForm: Dispatch<SetStateAction<Form>> = (newForm) => {
    if (typeof newForm === "function")
      return setForm((prev) => (prev ? newForm(prev) : prev));
    else return setForm(newForm);
  };

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
      saveRecentFormMeta(localStorage, {
        id,
        name: storedForm.name,
        encrypted: Boolean(storedForm.encrypted),
        isPublished: true,
      });
      removeDraftFormData(localStorage, id);

      if (storedForm.encrypted) {
        // Form is encrypted - do NOT load from localStorage or anywhere
        // The form page will handle password verification
        setIsEncrypted(true);
        console.log("Form is encrypted, password verification required");
        return;
      } else {
        // Form is not encrypted, safe to load
        setIsEncrypted(false);

        // Always load from API/database - never use localStorage
        // This ensures published forms are never modified from stale cache
        const form = Form.fromPOJO(JSON.parse(storedForm.data));
        setForm(form);
      }
    } else {
      // Form not found in database - check localStorage for draft
      setIsPublished(false);
      console.log(
        "Form not found in database, checking localStorage for draft",
      );
      const storedData = loadDraftFormData(localStorage, id);
      if (storedData) {
        try {
          const form = Form.fromPOJO(JSON.parse(storedData));
          setForm(form);
          setIsEncrypted(false);
          console.log("Loaded draft form from localStorage");
        } catch (error) {
          console.error("Error loading form from localStorage:", error);
        }
      } else {
        console.log("No draft form found in localStorage either");
      }
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
