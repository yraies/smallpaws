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

type TemplateContextType = {
  template: Form | undefined;
  setTemplate: Dispatch<SetStateAction<Form>>;
  isFinalized: boolean;
  setIsFinalized: (value: boolean) => void;
  isLoading: boolean;
};

const TemplateContext = createContext<TemplateContextType>({
  template: undefined,
  setTemplate: () => {},
  isFinalized: false,
  setIsFinalized: () => {},
  isLoading: true,
});

function TemplateContextProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<Form | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("create_new_template") === "true") {
      const rawTemplate = sessionStorage.getItem("template");
      if (!rawTemplate) {
        setIsLoading(false);
        return;
      }

      setTemplate(Form.fromPOJO(JSON.parse(rawTemplate)));
      setIsFinalized(false);
      sessionStorage.removeItem("create_new_template");
      sessionStorage.removeItem("template");
      setIsLoading(false);
      return;
    }

    if (!id) {
      setIsLoading(false);
      return;
    }

    void loadTemplate(id, setTemplate, setIsFinalized, setIsLoading);
  }, [id]);

  useEffect(() => {
    if (!id || !template || isFinalized) return;

    saveRecentFormMeta(localStorage, {
      id,
      name: template.name,
      encrypted: false,
      isPublished: false,
      kind: "template",
    });
    saveDraftFormData(
      localStorage,
      id,
      JSON.stringify(template.withoutAnswers()),
    );
  }, [id, template, isFinalized]);

  const reSetTemplate: Dispatch<SetStateAction<Form>> = (newTemplate) => {
    if (typeof newTemplate === "function") {
      return setTemplate((prev) => (prev ? newTemplate(prev) : prev));
    }

    return setTemplate(newTemplate);
  };

  return (
    <TemplateContext.Provider
      value={{
        template,
        setTemplate: reSetTemplate,
        isFinalized,
        setIsFinalized,
        isLoading,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

async function loadTemplate(
  id: string,
  setTemplate: (template: Form | undefined) => void,
  setIsFinalized: (value: boolean) => void,
  setIsLoading: (value: boolean) => void,
) {
  try {
    const response = await fetch(`/api/templates/${id}`);

    if (response.ok) {
      const storedTemplate = await response.json();
      const template = Form.fromPOJO(JSON.parse(storedTemplate.data));

      setTemplate(template.withoutAnswers());
      setIsFinalized(true);
      saveRecentFormMeta(localStorage, {
        id,
        name: storedTemplate.name,
        encrypted: false,
        isPublished: true,
        kind: "template",
      });
      removeDraftFormData(localStorage, id);
      setIsLoading(false);
      return;
    }

    setIsFinalized(false);
    const storedData = loadDraftFormData(localStorage, id);
    if (storedData) {
      setTemplate(Form.fromPOJO(JSON.parse(storedData)).withoutAnswers());
    }
    setIsLoading(false);
  } catch (error) {
    console.error("Error loading template:", error);
    setIsFinalized(false);
    setIsLoading(false);
  }
}

function useTemplateContext() {
  return useContext(TemplateContext);
}

export { TemplateContextProvider, useTemplateContext };
