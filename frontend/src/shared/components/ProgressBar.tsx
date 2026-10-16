export const ProgressBar = ({ value, max }: { value: number; max: number }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm font-medium">
      <span>
        {value} of {max} items
      </span>
      <span>{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-brand-500"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);
