import type { UseFormRegisterReturn } from "react-hook-form";

import { categories } from "../constants/product-categories";

export function CategoryField({
  registration,
  error,
  defaultAll = false,
}: {
  registration?: UseFormRegisterReturn;
  error?: string;
  defaultAll?: boolean;
}) {
  return (
    <label className="auth-field-wrap">
      <span className="label">Category</span>
      <select className="field auth-field" {...registration} required={!defaultAll}>
        <option value="">{defaultAll ? "All categories" : "Choose a category"}</option>
        {categories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      {error && <span className="auth-field-error">{error}</span>}
    </label>
  );
}
