import { useEffect, useState } from "react";
import { api } from "../services/api";
import Badge from "../components/Badge";
import { Spinner, ErrorBox, EmptyState } from "../components/Spinner";
import { formatDate } from "../utils/format";
import { IconChip, IconCheckCircle, IconXFail, IconJobs } from "../components/icons";

const TYPE_LABEL = {
  VIDEO_PROCESSING: "Video Processing",
  CSV_VALIDATION: "CSV Import",
  PRICE_REFRESH: "Price Sync",
};

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    api.listJobs().then(setJobs).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">

      <div>
        <div className="flex items-center gap-2.5">
          <IconChip width={24} height={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Job Processing Log</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1.5">
          Monitor asynchronous pipelines including video brand scanning, CSV catalogs insertion feeds, and Live competitor price sync loops.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <EmptyState message="No jobs yet. Import a video or CSV to create one." />
      ) : (
        <div className="card p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Task Execution Pipeline ({jobs.length})</h2>
            <span className="text-xs text-slate-400">Auto-refreshes automatically</span>
          </div>
          <div className="divide-y divide-slate-100">
            {jobs.map((j) => (<JobRow key={j.id} job={j} />))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobRow({ job: j }) {
  const tone = statusTone(j.status);
  return (
    <div className="py-5 flex items-start gap-4">

      <span className={`h-10 w-10 rounded-lg grid place-items-center shrink-0 ${tone.tile}`}>
        <tone.Icon width={20} height={20} className={tone.text} />
      </span>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold uppercase tracking-wide text-slate-800 text-sm">
              {TYPE_LABEL[j.type] || j.type}
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-xs text-slate-400">ID: {j.id.slice(-8)}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">{j.message || "—"}</p>
          <p className="text-xs text-slate-400 mt-1.5">
            Started: {formatDate(j.startedAt)} <span className="mx-1">•</span> Finished: {formatDate(j.completedAt)}
          </p>
          {j.errorDetails && (
            <details className="text-xs mt-2">
              <summary className="cursor-pointer text-rose-600">Error details</summary>
              <pre className="bg-slate-50 border border-slate-100 p-2 rounded mt-1 overflow-x-auto">
                {safeJson(j.errorDetails)}
              </pre>
            </details>
          )}
        </div>

        <div className="w-full sm:w-56 shrink-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-700">{j.status}</span>
            <span className="text-slate-400">{j.progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
            <div className={`h-full rounded-full transition-all ${tone.bar}`} style={{ width: `${j.progress}%` }} />
          </div>
          <div className="mt-2 flex justify-end">
            <Badge label={j.status} type="status" />
          </div>
        </div>
      </div>
    </div>
  );
}

function statusTone(status) {
  switch (status) {
    case "COMPLETED":
      return { Icon: IconCheckCircle, tile: "bg-emerald-50", text: "text-emerald-600", bar: "bg-indigo-600" };
    case "FAILED":
      return { Icon: IconXFail, tile: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500" };
    case "PARTIALLY_COMPLETED":
      return { Icon: IconCheckCircle, tile: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" };
    case "RUNNING":
      return { Icon: IconJobs, tile: "bg-indigo-50", text: "text-indigo-600", bar: "bg-indigo-600" };
    default: // PENDING
      return { Icon: IconJobs, tile: "bg-slate-100", text: "text-slate-400", bar: "bg-slate-300" };
  }
}

function safeJson(v) {
  try {
    return JSON.stringify(typeof v === "string" ? JSON.parse(v) : v, null, 2);
  } catch {
    return String(v);
  }
}
