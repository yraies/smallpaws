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
      // Save to both localStorage (for backward compatibility) and API
      localStorage.setItem(
        `${id}-meta`,
        JSON.stringify({ name: form.name, date: new Date().toISOString() })
      );
      localStorage.setItem(`${id}-data`, JSON.stringify(form));

      // Save to API
      saveFormToAPI(id, form);
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
      const form = Form.fromPOJO(JSON.parse(storedForm.data));
      setForm(form);
    }
  } catch (error) {
    console.error("Error loading form from API:", error);
  }
}

async function saveFormToAPI(id: string, form: Form) {
  try {
    await fetch(`/api/forms/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: form.name,
        data: form,
        encrypted: false,
      }),
    });
  } catch (error) {
    console.error("Error saving form to API:", error);
  }
}

function useFormContext() {
  return useContext(FormContext);
}

export { FormContext, FormContextProvider, useFormContext };
