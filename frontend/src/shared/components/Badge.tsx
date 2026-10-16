import type { ReactNode } from "react";

export const Badge = ({
  children,
  tone = "green",
}: {
  children: ReactNode;
  tone?: "green" | "gray" | "amber" | "blue";
}) => (
  <span
    className={`badge ${tone === "green" ? "bg-brand-50 text-brand-700" : tone === "amber" ? "bg-amber-100 text-amber-800" : tone === "blue" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"}`}
  >
    {children}
  </span>
);
