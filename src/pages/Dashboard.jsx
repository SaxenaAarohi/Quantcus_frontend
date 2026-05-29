import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
} from "recharts";
import { api } from "../services/api";
import { Spinner, ErrorBox } from "../components/Spinner";
import { CHART_COLORS, qualityPill } from "../utils/format";
import { IconDashboard, IconBag, IconWarning, IconInfo, IconInspect } from "../components/icons";

function riskBand(score) {
  if (score >= 70) return { label: "Low risk: Catalog healthy", tint: "from-emerald-50 to-white", ring: "ring-emerald-200", bar: "bg-emerald-500", text: "text-emerald-600" };
  if (score >= 40) return { label: "Medium risk: Attributes missing", tint: "from-amber-50 to-white", ring: "ring-amber-200", bar: "bg-amber-500", text: "text-amber-600" };
  return { label: "High risk: Listings incomplete", tint: "from-rose-50 to-white", ring: "ring-rose-200", bar: "bg-rose-500", text: "text-rose-600" };
}

const SEVERITY_LEGEND = [
  { key: "HIGH", label: "Critical (HIGH)" },
  { key: "MEDIUM", label: "Moderate (MEDIUM)" },
  { key: "LOW", label: "Minor (LOW)" },
];

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getSummary(), api.listProducts()])
      .then(([s, p]) => { setSummary(s); setProducts(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categoryData = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const c = p.category || "Uncategorized";
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [products]);

  const flagged = useMemo(
    () => [...products].sort((a, b) => a.qualityScore - b.qualityScore),
    [products]
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorBox message={error} />;

  const bySev = summary.issuesBySeverity || {};
  const faultData = SEVERITY_LEGEND
    .map(({ key }) => ({ name: key, value: bySev[key] || 0 }))
    .filter((d) => d.value > 0);
  const risk = riskBand(summary.avgQualityScore);

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2.5">
        <IconDashboard width={22} height={22} className="text-indigo-600" />
        <h1 className="text-xl font-semibold tracking-tight text-slate-800">Product Quality Analytics</h1>
      </div>

      {summary.totalProducts === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 text-sm">
          No products yet. Import a product video or CSV from the{" "}
          <Link to="/upload" className="link">Import Listings</Link> page to get started.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className={`card p-5 bg-gradient-to-br ${risk.tint} ring-1 ${risk.ring}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Catalog Quality Score</p>
          <p className={`text-3xl font-bold mt-2 ${risk.text}`}>{summary.avgQualityScore}%</p>
          <div className="h-1.5 bg-white/70 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${risk.bar}`} style={{ width: `${summary.avgQualityScore}%` }} />
          </div>
          <p className="text-xs text-slate-500 mt-2">{risk.label}</p>
        </div>

        <MetricCard
          icon={<IconBag width={18} height={18} />}
          label="Total SKUs"
          value={summary.totalProducts}
          hint="Monitored SKU catalog"
        />

        <MetricCard
          icon={<IconWarning width={18} height={18} />}
          label="Active Faults"
          value={summary.totalIssues}
          hint="Pending corrections"
          iconTint="bg-amber-50 text-amber-600"
        />

        <div className="card p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Severity Levels</p>
          <div className="mt-3 space-y-2">
            <SeverityRow color="#ef4444" label="High Severity" value={bySev.HIGH || 0} />
            <SeverityRow color="#f59e0b" label="Medium Severity" value={bySev.MEDIUM || 0} />
            <SeverityRow color="#3b82f6" label="Low Severity" value={bySev.LOW || 0} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Category Volume Share</h2>
          {categoryData.length === 0 ? (
            <p className="text-slate-400 text-sm py-20 text-center">No category data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef0f3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="count" fill={CHART_COLORS.bar} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Fault Severity Proportions</h2>
          {faultData.length === 0 ? (
            <p className="text-slate-400 text-sm py-20 text-center">No faults detected.</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={faultData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={3}>
                    {faultData.map((d) => (<Cell key={d.name} fill={CHART_COLORS[d.name]} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-3">
                {SEVERITY_LEGEND.map(({ key, label }) => (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[key] }} />
                    <span className="text-slate-600">{label}</span>
                    <span className="ml-auto text-slate-400 text-xs">{bySev[key] || 0} issue(s)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <IconInfo width={18} height={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-800">Flagged Listings Requiring Quick Action</h2>
          </div>
          <Link to="/products" className="link text-sm">Review all pages →</Link>
        </div>

        {flagged.length === 0 ? (
          <p className="text-slate-400 text-sm py-10 text-center">No listings to review.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 text-left border-b border-slate-100">
                <tr>
                  <th className="px-3 py-2.5 font-medium uppercase text-[11px] tracking-wider">SKU ID</th>
                  <th className="px-3 py-2.5 font-medium uppercase text-[11px] tracking-wider">Product Name</th>
                  <th className="px-3 py-2.5 font-medium uppercase text-[11px] tracking-wider">Source</th>
                  <th className="px-3 py-2.5 font-medium uppercase text-[11px] tracking-wider">Quality Score</th>
                  <th className="px-3 py-2.5 font-medium uppercase text-[11px] tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flagged.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-medium text-slate-600">{p.skuId}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Thumb src={p.imageUrl} name={p.title || p.skuId} />
                        <div className="leading-tight">
                          <p className="font-medium text-slate-700">{p.title || "Unnamed extracted item"}</p>
                          <p className="text-[11px] uppercase tracking-wide text-slate-400">{p.category || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="badge bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wide">{p.source}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${qualityPill(p.qualityScore)}`}>{p.qualityScore}%</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link to={`/products/${p.skuId}`} className="btn-secondary inline-flex">
                        <IconInspect width={14} height={14} /> Inspect Product
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, hint, iconTint = "bg-indigo-50 text-indigo-600" }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-3xl font-bold mt-2 text-slate-800">{value}</p>
        </div>
        <span className={`h-9 w-9 rounded-lg grid place-items-center ${iconTint}`}>{icon}</span>
      </div>
      <p className="text-xs text-slate-400 mt-3">{hint}</p>
    </div>
  );
}

function SeverityRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-slate-600">{label}</span>
      <span className="ml-auto font-semibold text-slate-700">{value}</span>
    </div>
  );
}

// Product thumbnail with graceful fallback to a coloured initial tile.
function Thumb({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="h-9 w-9 rounded-md bg-slate-100 text-slate-400 grid place-items-center text-xs font-semibold border border-slate-200">
        {(name || "?").charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailed(true)}
      className="h-9 w-9 rounded-md object-cover border border-slate-200"
    />
  );
}
