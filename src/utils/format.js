export function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export const SEVERITY_STYLES = {
  HIGH: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  MEDIUM: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  LOW: "bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200",
};

export const JOB_STATUS_STYLES = {
  PENDING: "bg-neutral-100 text-neutral-500 ring-1 ring-inset ring-neutral-200",
  RUNNING: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-100",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  FAILED: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  PARTIALLY_COMPLETED: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
};

export const CHART_COLORS = {
  HIGH: "#ef4444",
  MEDIUM: "#f59e0b",
  LOW: "#3b82f6",
  bar: "#6366f1",
  accent: "#4f46e5",
};

export function qualityColor(score) {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-rose-600";
}

export function qualityPill(score) {
  if (score >= 70) return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100";
  if (score >= 40) return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";
  return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100";
}
