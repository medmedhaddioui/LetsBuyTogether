export const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="card p-10 text-center">
    <h3 className="text-xl">{title}</h3>
    <p className="mt-2 text-slate-500">{text}</p>
  </div>
);
