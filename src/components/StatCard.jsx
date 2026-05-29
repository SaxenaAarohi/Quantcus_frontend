export default function StatCard({ label, value, accent = "text-neutral-900", hint }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{label}</p>
      <p className={`text-3xl font-semibold mt-1.5 tracking-tight ${accent}`}>{value}</p>
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}
