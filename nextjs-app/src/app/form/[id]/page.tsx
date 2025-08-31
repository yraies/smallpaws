"use client";

import React from "react";
import CategoryBox from "../../../components/CategoryPage";
import {
  FormContextProvider,
  useFormContext,
} from "../../../contexts/FormContext";
import { Category, Question } from "../../../types/Form";
import IconButton from "../../../components/IconButton";
import {
  EyeIcon,
  NewspaperIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
} from "@heroicons/react/16/solid";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";

function FormPageContent() {
  const { form, setForm } = useFormContext();
  const [advancedOptions, setAdvancedOptions] = React.useState(false);
  const [showIcon, setShowIcon] = useLocalStorage("showIcons", false);
  const router = useRouter();

  if (!form) return <h1>Form not found</h1>;

  return (
    <>
      <IconButton
        onClick={() => router.push("/")}
        className="absolute top-2 left-2"
      >
        <HomeIcon className="h-6 w-6 transition-transform group-hover:scale-90 group-hover:text-violet-400" />
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

      <h2
        title="Form name"
        role="textbox"
        className="mb-4 w-fit overflow-visible border-b-1 text-center text-2xl"
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
        Add new Category
      </button>
    </>
  );
}

export default function FormPage() {
  return (
    <FormContextProvider>
      <FormPageContent />
    </FormContextProvider>
  );
}
