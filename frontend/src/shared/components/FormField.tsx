import { forwardRef } from "react";

export const FormField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }
>(function FormField({ label, error, ...props }, ref) {
  return (
    <label className="auth-field-wrap">
      <span className="label">{label}</span>
      <input ref={ref} className={`field auth-field ${error ? "field-error" : ""}`} {...props} />
      {error && <span className="auth-field-error">{error}</span>}
    </label>
  );
});
