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
import { computePasswordHash, decryptFormData } from "../lib/crypto";
import { Form, type FormPOJO } from "../types/Form";
import {
  loadLocalDraft,
  removeLocalDraft,
  saveLocalDraft,
  saveRecentFormMeta,
} from "../utils/recentForms";
import { consumePendingTemplateDraft } from "../utils/templateLifecycle";

type TemplateContextType = {
  template: Form | undefined;
  templateName: string;
  setTemplate: Dispatch<SetStateAction<Form>>;
  isFinalized: boolean;
  setIsFinalized: (value: boolean) => void;
  isEncrypted: boolean;
  setIsEncrypted: (value: boolean) => void;
  needsPasswordVerification: boolean;
  unlockTemplate: (password: string) => Promise<void>;
  isLoading: boolean;
};

const TemplateContext = createContext<TemplateContextType>({
  template: undefined,
  templateName: "",
  setTemplate: () => {},
  isFinalized: false,
  setIsFinalized: () => {},
  isEncrypted: false,
  setIsEncrypted: () => {},
  needsPasswordVerification: false,
  unlockTemplate: async () => {},
  isLoading: true,
});

function TemplateContextProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const id = params?.id as string;
  const [template, setTemplate] = useState<Form | undefined>(undefined);
  const [templateName, setTemplateName] = useState("");
  const [isFinalized, setIsFinalized] = useState(false);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    useState(false);
  const [passwordSalt, setPasswordSalt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const unlockTemplate = useCallback(
    async (password: string) => {
      if (!id) return;

      try {
        // Build verification payload: use client-side hash if salt available
        const verifyBody: Record<string, string> = {};
        if (passwordSalt) {
          verifyBody.passwordHash = computePasswordHash(password, passwordSalt);
        } else {
          // Legacy artifact without salt: send plaintext for backward compat
          verifyBody.password = password;
        }

        const response = await fetch(`/api/templates/${id}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verifyBody),
        });

        if (!response.ok) {
          const error = await response.json();
          alert(error.error || "Invalid password");
          return;
        }

        const result = await response.json();
        const encryptedData = JSON.parse(result.template.data);
        const decryptedTemplate = decryptFormData(
          encryptedData,
          password,
        ) as FormPOJO;
        const loadedTemplate =
          Form.fromPOJO(decryptedTemplate).withoutAnswers();

        setTemplate(loadedTemplate);
        setTemplateName(result.template.name);
        setIsEncrypted(true);
        setIsFinalized(true);
        setNeedsPasswordVerification(false);
        saveRecentFormMeta(localStorage, {
          id,
          name: result.template.name,
          encrypted: true,
          kind: "template",
          phase: "finalized",
        });
        removeLocalDraft(localStorage, id);
      } catch (error) {
        console.error("Error verifying template password:", error);
        alert("Failed to unlock template.");
      }
    },
    [id, passwordSalt],
  );

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    void loadTemplate(
      id,
      setTemplate,
      setTemplateName,
      setIsFinalized,
      setIsEncrypted,
      setNeedsPasswordVerification,
      setPasswordSalt,
      setIsLoading,
    );
  }, [id]);

  useEffect(() => {
    if (!id || !template || isFinalized) return;

    saveRecentFormMeta(localStorage, {
      id,
      name: template.name,
      encrypted: false,
      kind: "template",
      phase: "draft",
    });
    saveLocalDraft(localStorage, id, JSON.stringify(template.withoutAnswers()));
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
        templateName: template?.name ?? templateName,
        setTemplate: reSetTemplate,
        isFinalized,
        setIsFinalized,
        isEncrypted,
        setIsEncrypted,
        needsPasswordVerification,
        unlockTemplate,
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
  setTemplateName: (name: string) => void,
  setIsFinalized: (value: boolean) => void,
  setIsEncrypted: (value: boolean) => void,
  setNeedsPasswordVerification: (value: boolean) => void,
  setPasswordSalt: (salt: string | null) => void,
  setIsLoading: (value: boolean) => void,
) {
  try {
    const response = await fetch(`/api/templates/${id}`);

    if (response.ok) {
      const storedTemplate = await response.json();

      if (storedTemplate.requiresPassword) {
        setTemplate(undefined);
        // Name is no longer returned before password verification
        setTemplateName("");
        setIsFinalized(true);
        setIsEncrypted(true);
        setNeedsPasswordVerification(true);
        setPasswordSalt(storedTemplate.passwordSalt ?? null);
        setIsLoading(false);
        return;
      }

      const template = Form.fromPOJO(JSON.parse(storedTemplate.data));

      setTemplate(template.withoutAnswers());
      setTemplateName(storedTemplate.name);
      setIsFinalized(true);
      setIsEncrypted(Boolean(storedTemplate.encrypted));
      setNeedsPasswordVerification(false);
      saveRecentFormMeta(localStorage, {
        id,
        name: storedTemplate.name,
        encrypted: Boolean(storedTemplate.encrypted),
        kind: "template",
        phase: "finalized",
      });
      removeLocalDraft(localStorage, id);
      setIsLoading(false);
      return;
    }

    if (response.status !== 404) {
      setTemplate(undefined);
      setTemplateName("");
      setIsFinalized(false);
      setIsEncrypted(false);
      setNeedsPasswordVerification(false);
      setIsLoading(false);
      return;
    }

    const pendingDraft = consumePendingTemplateDraft(id);
    if (pendingDraft) {
      setTemplate(pendingDraft);
      setTemplateName(pendingDraft.name);
      setIsFinalized(false);
      setIsEncrypted(false);
      setNeedsPasswordVerification(false);
      setIsLoading(false);
      return;
    }

    setIsFinalized(false);
    setIsEncrypted(false);
    setNeedsPasswordVerification(false);
    const storedData = loadLocalDraft(localStorage, id);
    if (storedData) {
      const draftTemplate = Form.fromPOJO(
        JSON.parse(storedData),
      ).withoutAnswers();
      setTemplate(draftTemplate);
      setTemplateName(draftTemplate.name);
    }
    setIsLoading(false);
  } catch (error) {
    console.error("Error loading template:", error);
    setIsFinalized(false);
    setIsEncrypted(false);
    setNeedsPasswordVerification(false);
    setIsLoading(false);
  }
}

function useTemplateContext() {
  return useContext(TemplateContext);
}

export { TemplateContextProvider, useTemplateContext };
