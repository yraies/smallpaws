import { PlusIcon } from "@heroicons/react/16/solid";
import type { Category } from "../types/Form";
import CategoryBox from "./CategoryPage";

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
    <main
      className="form-categories not-print:flex not-print:flex-col not-print:gap-2"
      aria-label="Form categories"
    >
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
          type="button"
          className="flex w-fit items-center justify-center gap-2 px-2 py-1 hover:backdrop-brightness-90 print:hidden"
          onClick={onAddCategory}
          aria-label="Add new category"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Add new Category
        </button>
      )}
    </main>
  );
}
