"use client";

import React from "react";
import dynamic from "next/dynamic";
import CategoryBox from "../../../components/CategoryPage";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import { Category, Question } from "../../../types/Form";
import IconButton from "../../../components/IconButton";
import PasswordModal from "../../../components/PasswordModal";
import EncryptionStatus from "../../../components/EncryptionStatus";
import {
  EyeIcon,
  NewspaperIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  CloudArrowUpIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter, useParams } from "next/navigation";
import {
  encryptFormData,
  hashPassword,
  decryptFormData,
} from "../../../lib/crypto";
import { Form, FormPOJO } from "../../../types/Form";

function FormPageContent() {
  const { form, setForm } = useFormContext();
  const [advancedOptions, setAdvancedOptions] = React.useState(false);
  const [showIcon, setShowIcon] = useLocalStorage("showIcons", false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isEncrypted, setIsEncrypted] = React.useState(false);
  const [needsPasswordVerification, setNeedsPasswordVerification] =
    React.useState(false);
  const [isLoadingForm, setIsLoadingForm] = React.useState(true);
  const router = useRouter();
  const params = useParams();
  const formId = params?.id as string;

  // Check if form exists and if it's encrypted
  React.useEffect(() => {
    if (formId && !form) {
      checkFormStatus(formId);
    }
  }, [formId, form]);

  const checkFormStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/forms/${id}`);
      if (response.ok) {
        const storedForm = await response.json();
        if (storedForm.encrypted) {
          setNeedsPasswordVerification(true);
          setIsEncrypted(true);
        }
      }
      setIsLoadingForm(false);
    } catch (error) {
      console.error("Error checking form status:", error);
      setIsLoadingForm(false);
    }
  };

  const handlePasswordVerification = async (password: string) => {
    if (!formId) return;

    try {
      const response = await fetch(`/api/forms/${formId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Decryption - raw result:", result.form.data);
        // Parse the stored data - it's been JSON.stringify'd by the API
        const storedData = JSON.parse(result.form.data);
        console.log("Decryption - parsed data:", storedData);
        // storedData should now be the EncryptedData object with encrypted and salt
        const decryptedFormData = decryptFormData(storedData, password);
        console.log("Decryption - decrypted successfully");
        const loadedForm = Form.fromPOJO(decryptedFormData as FormPOJO);
        setForm(loadedForm);
        setNeedsPasswordVerification(false);
      } else {
        console.error("Invalid password");
        // Could show error message to user
      }
    } catch (error) {
      console.error("Error verifying password:", error);
    }
  };

  if (isLoadingForm) {
    return <h1>Loading...</h1>;
  }

  if (needsPasswordVerification) {
    return (
      <div className="flex w-full flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Password Protected Form</h1>
        <p>This form is encrypted and requires a password to view.</p>
        <PasswordModal
          isOpen={true}
          onClose={() => router.push("/")}
          onSubmit={(password: string) => handlePasswordVerification(password)}
          mode="enter"
          title="Enter Password"
          description="This form is encrypted and requires a password to view."
        />
      </div>
    );
  }

  if (!form) return <h1>Form not found</h1>;

  const handleSaveForm = async (password: string, shouldEncrypt: boolean) => {
    if (!form || !formId) return;

    setIsSaving(true);

    try {
      let formData = form;
      let encrypted = false;
      let password_hash = null;

      if (shouldEncrypt && password) {
        // Encrypt form data
        console.log("Encryption - original form:", form);
        const encryptedData = encryptFormData(form, password);
        console.log("Encryption - encrypted data:", encryptedData);
        formData = encryptedData as unknown as typeof form; // Store entire encrypted data object
        encrypted = true;
        password_hash = hashPassword(password);
      }

      const response = await fetch(`/api/forms/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          data: formData,
          encrypted,
          password_hash,
        }),
      });

      if (response.ok) {
        setIsEncrypted(encrypted);
        setShowPasswordModal(false);
        // Could add success toast here
      } else {
        console.error("Failed to save form");
        // Could add error toast here
      }
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-2 left-2"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
      </IconButton>

      {/* Save Button */}
      <IconButton
        onClick={() => setShowPasswordModal(true)}
        className="absolute top-2 right-20"
        disabled={isSaving}
      >
        <CloudArrowUpIcon
          className={`h-6 w-6 transition-transform group-hover:scale-90 ${
            isSaving ? "text-gray-400" : "group-hover:text-green-400"
          }`}
        />
      </IconButton>

      <IconButton
        onClick={() => setAdvancedOptions(!advancedOptions)}
        className="absolute top-2 right-2"
      >
        {!advancedOptions ? (
          <EyeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        ) : (
          <WrenchScrewdriverIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        )}
      </IconButton>
      <IconButton
        onClick={() => setShowIcon(!showIcon)}
        className="absolute top-2 right-10"
      >
        {!showIcon ? (
          <NewspaperIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        ) : (
          <PaintBrushIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
        )}
      </IconButton>

      {/* Form Title with Encryption Status */}
      <div className="mb-4 flex items-center gap-2">
        <h2
          title="Form name"
          role="textbox"
          className="w-fit overflow-visible border-b-1 text-center text-2xl"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={(e) =>
            setForm((prev) => {
              if (!e?.currentTarget) return prev;
              return prev.withName(e?.currentTarget?.textContent || "");
            })
          }
        >
          {form?.name}
        </h2>
        <EncryptionStatus isEncrypted={isEncrypted} showText={false} />
      </div>

      {form.categories.map((category) => (
        <CategoryBox
          id={category.id}
          key={category.id.toString()}
          advancedOptions={advancedOptions}
        />
      ))}

      <button
        className="flex w-fit items-center justify-center gap-2 px-2 py-1 hover:backdrop-brightness-90"
        onClick={() =>
          setForm((prev) =>
            prev.addCategory(Category.new("", [Question.new("")]))
          )
        }
      >
        <PlusIcon className="h-4 w-4" />
        Add new Category
      </button>

      {/* Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleSaveForm}
        mode="set"
        title="Save Form"
        description="Choose whether to protect your form with a password"
      />
    </>
  );
}

// Create a client-side only version using dynamic import
const FormPageContentClientOnly = dynamic(
  () => Promise.resolve(FormPageContent),
  {
    ssr: false,
    loading: () => <div>Loading form...</div>,
  }
);

export default function FormPage() {
  return (
    <FormContextProvider>
      <FormPageContentClientOnly />
    </FormContextProvider>
  );
}
