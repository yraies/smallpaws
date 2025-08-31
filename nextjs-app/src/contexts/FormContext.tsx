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

  useEffect(() => {
    // Check if this is a new form creation from sessionStorage
    if (sessionStorage.getItem("create_new") === "true") {
      const form = Form.fromPOJO(JSON.parse(sessionStorage.getItem("form")!));
      setForm(form);
      sessionStorage.removeItem("create_new");
      sessionStorage.removeItem("form");
    } else if (id) {
      // Try to load from localStorage first (for backward compatibility)
      const data = localStorage.getItem(`${id}-data`);
      if (data) {
        const loadedForm = Form.fromPOJO(JSON.parse(data));
        setForm(loadedForm);
      } else {
        // Load from API
        loadFormFromAPI(id, setForm);
      }
    }
  }, [id]);

  useEffect(() => {
    if (id && !!form) {
      // Save to localStorage ONLY for draft storage (not to API)
      localStorage.setItem(
        `${id}-meta`,
        JSON.stringify({ name: form.name, date: new Date().toISOString() })
      );
      localStorage.setItem(`${id}-data`, JSON.stringify(form));

      // DO NOT auto-save to API - only save when user explicitly chooses
      // This prevents unencrypted data from being sent to server
    }
  }, [id, form]);

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

async function loadFormFromAPI(
  id: string,
  setForm: (form: Form | undefined) => void
) {
  try {
    const response = await fetch(`/api/forms/${id}`);
    if (response.ok) {
      const storedForm = await response.json();

      // If form is encrypted, don't try to load it automatically
      // The user will need to provide password through the UI
      if (storedForm.encrypted) {
        console.log("Form is encrypted, password verification required");
        // Don't load the form data - let the UI handle password verification
        return;
      }

      // For unencrypted forms, load normally
      const form = Form.fromPOJO(JSON.parse(storedForm.data));
      setForm(form);
    }
  } catch (error) {
    console.error("Error loading form from API:", error);
  }
}

function useFormContext() {
  return useContext(FormContext);
}

export { FormContext, FormContextProvider, useFormContext };
