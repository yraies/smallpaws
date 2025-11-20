import React from "react";
import CategoryBox from "./CategoryPage";
import { Category } from "../types/Form";
import { PlusIcon } from "@heroicons/react/16/solid";

interface FormCategoryListProps {
  categories: Category[];
  advancedOptions: boolean;
  readOnly: boolean;
  showAddButton?: boolean;
  onAddCategory?: () => void;
}

export default function FormCategoryList({
  categories,
  advancedOptions,
  readOnly,
  showAddButton = false,
  onAddCategory,
}: FormCategoryListProps) {
  return (
    <>
      {categories.map((category) => (
        <CategoryBox
          id={category.id}
          key={category.id.toString()}
          advancedOptions={advancedOptions}
          readOnly={readOnly}
        />
      ))}

      {showAddButton && onAddCategory && (
        <button
          className="flex w-fit items-center justify-center gap-2 px-2 py-1 hover:backdrop-brightness-90"
          onClick={onAddCategory}
        >
          <PlusIcon className="h-4 w-4" />
          Add new Category
        </button>
      )}
    </>
  );
}
