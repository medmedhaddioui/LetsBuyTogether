import { LoaderCircle } from "lucide-react";

export const LoadingIndicator = () => (
  <div className="flex min-h-48 items-center justify-center">
    <LoaderCircle className="animate-spin text-brand-600" />
  </div>
);
