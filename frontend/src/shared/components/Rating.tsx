import { Star } from "lucide-react";

export const Rating = ({ value, count }: { value: number; count?: number }) => (
  <span className="inline-flex items-center gap-1 text-sm">
    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
    {value.toFixed(1)}
    {count !== undefined && <span className="text-slate-400">({count})</span>}
  </span>
);
