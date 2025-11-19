import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { Form } from "../types/Form";
import { useParams } from "next/navigation";

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

  useEffect(() => {
    // Check if this is a new form creation from sessionStorage
    if (sessionStorage.getItem("create_new") === "true") {
      const form = Form.fromPOJO(JSON.parse(sessionStorage.getItem("form")!));
      setForm(form);
      sessionStorage.removeItem("create_new");
      sessionStorage.removeItem("form");
    } else if (id) {
      // First check if the form is encrypted via API
      checkIfEncrypted(id, setIsEncrypted, setForm);
    }
  }, [id]);

  useEffect(() => {
    if (id && !!form && !isEncrypted) {
      // ONLY save to localStorage if form is NOT encrypted
      localStorage.setItem(
        `${id}-meta`,
        JSON.stringify({ name: form.name, date: new Date().toISOString() })
      );
      localStorage.setItem(`${id}-data`, JSON.stringify(form));
    } else if (id && isEncrypted) {
      // If form is encrypted, remove any cached data from localStorage
      localStorage.removeItem(`${id}-data`);
      localStorage.removeItem(`${id}-meta`);
    }
  }, [id, form, isEncrypted]);

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
  setForm: (form: Form | undefined) => void
) {
  try {
    const response = await fetch(`/api/forms/${id}`);
    if (response.ok) {
      const storedForm = await response.json();

      if (storedForm.encrypted) {
        // Form is encrypted - do NOT load from localStorage or anywhere
        // The form page will handle password verification
        setIsEncrypted(true);
        console.log("Form is encrypted, password verification required");
        return;
      } else {
        // Form is not encrypted, safe to load
        setIsEncrypted(false);

        // Try localStorage first (for drafts/offline access)
        const data = localStorage.getItem(`${id}-data`);
        if (data) {
          const loadedForm = Form.fromPOJO(JSON.parse(data));
          setForm(loadedForm);
        } else {
          // Load from API
          const form = Form.fromPOJO(JSON.parse(storedForm.data));
          setForm(form);
        }
      }
    } else {
      // Form not found in API, try localStorage for legacy forms
      const data = localStorage.getItem(`${id}-data`);
      if (data) {
        const loadedForm = Form.fromPOJO(JSON.parse(data));
        setForm(loadedForm);
        setIsEncrypted(false);
      }
    }
  } catch (error) {
    console.error("Error checking form encryption status:", error);
  }
}

function useFormContext() {
  return useContext(FormContext);
}

export { FormContext, FormContextProvider, useFormContext };
