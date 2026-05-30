import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Spinner, ErrorBox, EmptyState } from "../components/Spinner";
import { formatDate } from "../utils/format";
import { IconBell, IconSearch, IconAlertCircle, IconCheckCircle, IconInspect } from "../components/icons";

function alertTitle(a) {
  const sku = a.product?.skuId || "";
  if (a.alertType === "PRICE_ABOVE_COMPETITORS") return "Flipkart Price Competitiveness Risk";
  if (a.alertType === "OUT_OF_STOCK") return `OutOfStock Alert: ${sku}`;
  if (a.severity === "HIGH") return `Severe Listing Issue: ${sku}`;
  return a.alertType.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [dismissed, setDismissed] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.listAlerts(severity).then(setAlerts).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [severity]);

  function dismiss(id) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const visible = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${a.message} ${a.alertType} ${a.product?.skuId || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">

      <div>
        <div className="flex items-center gap-2.5">
          <IconBell width={24} height={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Active Seller Alerts</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1.5">
          Stay notified of high-priority listing errors, out-of-stock SKUs, and undercutting competitor price signals.
        </p>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by details, message body, or sku ID..."
            className="input pl-9"
          />
        </div>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input sm:w-48">
          <option value="">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {error && <ErrorBox message={error} />}
      {loading ? (
        <Spinner />
      ) : visible.length === 0 ? (
        <EmptyState message="No alerts. Listings and pricing look healthy." />
      ) : (
        <div className="space-y-3">
          {visible.map((a) => (
            <AlertCard key={a.id} alert={a} onDismiss={() => dismiss(a.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlertCard({ alert: a, onDismiss }) {
  const isLow = a.severity === "LOW";
  const sku = a.product?.skuId;

  const tone = a.severity === "HIGH"
    ? { Icon: IconAlertCircle, color: "text-rose-500" }
    : a.severity === "MEDIUM"
    ? { Icon: IconAlertCircle, color: "text-amber-500" }
    : { Icon: IconCheckCircle, color: "text-blue-500" };

  return (
    <div className="card p-4 flex items-start gap-3">
      <tone.Icon width={22} height={22} className={`${tone.color} shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0 flex flex-col lg:flex-row lg:items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800">{alertTitle(a)}</h3>
            {sku && (
              <span className="badge bg-white border border-slate-200 text-slate-500 font-mono text-[10px]">SKU ID: {sku}</span>
            )}
          </div>
          <p className="text-sm text-slate-600 mt-1">{a.message}</p>
          <p className="text-xs text-slate-400 mt-1.5">Raised {formatDate(a.createdAt)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button onClick={onDismiss} className="btn-secondary whitespace-nowrap">
            {isLow ? "Mark Active" : "Snooze / Acknowledge"}
          </button>
          {sku ? (
            <Link
              to={`/products/${sku}`}
              className={`btn text-white px-3 py-1.5 whitespace-nowrap ${isLow ? "bg-indigo-400 hover:bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-500"}`}
            >
              <IconInspect width={14} height={14} /> Fix Issue
            </Link>
          ) : (
            <button disabled className="btn bg-indigo-300 text-white px-3 py-1.5 whitespace-nowrap opacity-60">
              <IconInspect width={14} height={14} /> Fix Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
