import React from "react";
import CategoryBox from "./CategoryPage";
import { Category } from "../types/Form";

interface FormCategoryListProps {
  categories: Category[];
  advancedOptions: boolean;
  readOnly: boolean;
}

export default function FormCategoryList({
  categories,
  advancedOptions,
  readOnly,
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
    </>
  );
}
