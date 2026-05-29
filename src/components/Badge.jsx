import { SEVERITY_STYLES, JOB_STATUS_STYLES } from "../utils/format";

export default function Badge({ label, type = "severity" }) {
  const map = type === "status" ? JOB_STATUS_STYLES : SEVERITY_STYLES;
  const style = map[label] || "bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-neutral-200";
  return <span className={`badge ${style}`}>{label}</span>;
}
