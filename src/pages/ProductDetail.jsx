import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid,
} from "recharts";
import { api } from "../services/api";
import Badge from "../components/Badge";
import { Spinner, ErrorBox } from "../components/Spinner";
import { formatPrice, formatDate, qualityColor, CHART_COLORS } from "../utils/format";

const EDIT_FIELDS = [
  ["title", "Title"], ["brand", "Brand"], ["category", "Category"],
  ["price", "Price"], ["mrp", "MRP"], ["color", "Color"],
  ["size", "Size"], ["material", "Material"], ["availability", "Availability"],
  ["imageUrl", "Image URL"], ["productUrl", "Product URL"], ["description", "Description"],
];

export default function ProductDetail() {
  const { skuId } = useParams();
  const [product, setProduct] = useState(null);
  const [competitor, setCompetitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadAll(); }, [skuId]);

  async function loadAll() {
    setLoading(true);
    try {
      const p = await api.getProduct(skuId);
      setProduct(p);
      setForm(buildForm(p));
      const c = await api.getCompetitorPrices(skuId);
      setCompetitor(c);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function buildForm(p) {
    const f = {};
    EDIT_FIELDS.forEach(([k]) => { f[k] = p[k] ?? ""; });
    return f;
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const body = { ...form, price: form.price === "" ? null : Number(form.price), mrp: form.mrp === "" ? null : Number(form.mrp) };
      await api.updateProduct(skuId, body);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function runEnhance() {
    setEnhancing(true); setError("");
    try {
      await api.enhanceTitle(skuId);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnhancing(false);
    }
  }

  async function refresh() {
    setRefreshing(true); setError("");
    try {
      await api.refreshPrices(skuId);
      const c = await api.getCompetitorPrices(skuId);
      setCompetitor(c);
      const p = await api.getProduct(skuId);
      setProduct(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) return <Spinner />;
  if (error && !product) return <ErrorBox message={error} />;
  if (!product) return <ErrorBox message="Product not found." />;

  const cmp = competitor?.comparison;
  const chartData = (competitor?.prices || []).map((c) => ({ name: c.platform, price: c.competitorPrice }));
  const aboveMarket = cmp && cmp.percentDifference > 10;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/products" className="link text-sm">← Products</Link>
        <h1 className="text-2xl font-semibold tracking-tight">{product.skuId}</h1>
        <span className={`text-sm font-medium ${qualityColor(product.qualityScore)}`}>
          Quality {product.qualityScore}/100
        </span>
      </div>
      {error && <ErrorBox message={error} />}

      <div className="grid md:grid-cols-2 gap-6">

        <form onSubmit={save} className="card p-5 space-y-4">
          <h2 className="font-medium">Product Data <span className="text-xs text-neutral-400">({product.source})</span></h2>
          <div className="grid grid-cols-2 gap-3">
            {EDIT_FIELDS.map(([key, label]) => (
              <label key={key} className="text-sm">
                <span className="text-neutral-500">{label}</span>
                <input value={form[key] ?? ""} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="input mt-1" />
              </label>
            ))}
          </div>
          <button disabled={saving} className="btn-primary">
            {saving ? "Saving & re-validating..." : "Save & Re-validate"}
          </button>
        </form>

        <div className="card p-5 space-y-3">
          <h2 className="font-medium">Listing Issues ({product.issues.length})</h2>
          {product.issues.length === 0 ? (
            <p className="text-emerald-600 text-sm">No issues. This listing looks good.</p>
          ) : (
            <ul className="space-y-2">
              {product.issues.map((i) => (
                <li key={i.id} className="border border-neutral-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Badge label={i.severity} />
                    <span className="font-medium text-sm text-neutral-700">{i.issueType}</span>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">{i.message}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">Fix: {i.suggestedFix}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Enhanced Title</h2>
          <button onClick={runEnhance} disabled={enhancing} className="btn-secondary">
            {enhancing ? "Generating..." : "Generate"}
          </button>
        </div>
        {product.enhancedTitle ? (
          <div className="text-sm space-y-2">
            <p><span className="text-neutral-400">Original:</span> {product.title || "—"}</p>
            <p className="text-base font-semibold text-neutral-900">{product.enhancedTitle}</p>
            {product.suggestedKeywords?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {product.suggestedKeywords.map((k) => (
                  <span key={k} className="badge bg-neutral-100 text-neutral-600">{k}</span>
                ))}
              </div>
            )}
            {product.enhancedTitleReason && <p className="text-xs text-neutral-400">{product.enhancedTitleReason}</p>}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">No enhanced title yet. Generate one from the product attributes.</p>
        )}
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Competitor Prices <span className="text-xs text-neutral-400">(we sell on Flipkart)</span></h2>
          <button onClick={refresh} disabled={refreshing} className="btn-secondary">
            {refreshing ? "Refreshing..." : "Refresh Prices"}
          </button>
        </div>

        {!competitor || competitor.prices.length === 0 ? (
          <p className="text-sm text-neutral-400">No competitor prices yet. Click "Refresh Prices" or upload a competitor CSV.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <Stat label="Our Price" value={formatPrice(cmp.ourPrice)} />
              <Stat label="Lowest" value={formatPrice(cmp.lowest)} />
              <Stat label="Highest" value={formatPrice(cmp.highest)} />
              <Stat label="Average" value={formatPrice(cmp.average)} />
              <Stat
                label="Diff vs Lowest"
                value={cmp.percentDifference === null ? "—" : `${cmp.percentDifference}%`}
                accent={aboveMarket ? "text-rose-600" : "text-neutral-900"}
              />
            </div>

            <div className={`text-sm rounded-lg p-3 border ${aboveMarket ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-neutral-50 border-neutral-100 text-neutral-600"}`}>
              {cmp.recommendedAction}
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#a3a3a3", fontSize: 12 }} />
                <Tooltip cursor={{ fill: "#fafafa" }} formatter={(v) => formatPrice(v)} />
                {cmp.ourPrice ? <ReferenceLine y={cmp.ourPrice} stroke={CHART_COLORS.accent} strokeDasharray="4 4" label={{ value: "Our price", fill: "#71717a", fontSize: 11 }} /> : null}
                <Bar dataKey="price" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={cmp.ourPrice && d.price < cmp.ourPrice ? CHART_COLORS.accent : CHART_COLORS.bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-neutral-400 text-left border-b border-neutral-100">
                  <tr>
                    <th className="px-3 py-2 font-medium">Platform</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Last Checked</th>
                    <th className="px-3 py-2 font-medium">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {competitor.prices.map((c) => (
                    <tr key={c.id} className="border-t border-neutral-100">
                      <td className="px-3 py-2 font-medium text-neutral-700">{c.platform}</td>
                      <td className="px-3 py-2 text-neutral-700">{formatPrice(c.competitorPrice)}</td>
                      <td className="px-3 py-2 text-neutral-400">{formatDate(c.lastCheckedAt)}</td>
                      <td className="px-3 py-2">
                        {c.competitorUrl ? <a href={c.competitorUrl} target="_blank" rel="noreferrer" className="link">view</a> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-neutral-900" }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-2.5 border border-neutral-100">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className={`font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
