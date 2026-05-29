export function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-neutral-400 py-12 justify-center text-sm">
      <span className="h-4 w-4 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBox({ message }) {
  return (
    <div className="bg-rose-50 border border-rose-100 text-rose-700 rounded-lg p-4 text-sm">
      {message}
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="text-center text-neutral-400 py-12 text-sm">{message}</div>;
}
