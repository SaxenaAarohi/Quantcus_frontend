import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { TableSkeleton, ErrorBox, EmptyState } from "../components/Spinner";
import { formatPrice, qualityPill } from "../utils/format";
import { IconBag, IconSearch, IconChevronRight } from "../components/icons";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => { load(); }, []);

  function load() {
    setLoading(true);
    api.listProducts().then(setProducts).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))],
    [products]
  );

  const filtered = products.filter((p) => {
    if (category && (p.category || "") !== category) return false;
    if (severity && !p.issues.some((i) => i.severity === severity)) return false;
    if (stock && (p.availability || "") !== stock) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${p.skuId} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (loading) return <TableSkeleton />;
  if (error) return <ErrorBox message={error} />;

  return (
    <div className="space-y-6">

      <div>
        <div className="flex items-center gap-2.5">
          <IconBag width={24} height={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Ecomm Inventory</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1.5">
          Displaying active product listings on Flipkart. Filter by category, listing alerts, and quality issues.
        </p>
      </div>

      <div className="card p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch width={16} height={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product name, brand or SKU code..."
            className="input pl-9"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input lg:w-44">
          <option value="">All Categories</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="input lg:w-44">
          <option value="">All Severities</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)} className="input lg:w-44">
          <option value="">All Stock Status</option>
          <option value="in_stock">In Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No products match the current filters." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-left border-b border-slate-100">
              <tr>
                <Th>SKU ID</Th>
                <Th>SKU Product</Th>
                <Th>Source Info</Th>
                <Th>Price Point</Th>
                <Th>List Score</Th>
                <Th className="text-right">Review</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{p.skuId}</td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={p.imageUrl} name={p.title || p.skuId} />
                      <div className="leading-tight">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{p.title || "No title set"}</span>
                          {p.brand && (
                            <span className="badge bg-slate-100 text-slate-500 uppercase text-[9px] tracking-wide">{p.brand}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {p.category || "—"} <span className="mx-1">•</span> <Stock value={p.availability} />
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`badge uppercase text-[10px] tracking-wide ${p.source === "MANUAL" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"}`}>
                      {p.source}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <PricePoint price={p.price} mrp={p.mrp} />
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${qualityPill(p.qualityScore)}`}>{p.qualityScore}%</span>
                      {p.issues.length > 0 && (
                        <span className="badge bg-rose-50 text-rose-600">{p.issues.length} issue(s)</span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <Link to={`/products/${p.skuId}`} className="link inline-flex items-center gap-0.5">
                      Inspect <IconChevronRight width={14} height={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, className = "" }) {
  return <th className={`px-4 py-3 font-medium uppercase text-[11px] tracking-wider ${className}`}>{children}</th>;
}

function Stock({ value }) {
  const out = value === "out_of_stock";
  return (
    <span className={out ? "text-rose-500" : "text-emerald-600"}>
      {out ? "Out of Stock" : "In Stock"}
    </span>
  );
}

function PricePoint({ price, mrp }) {
  const invalid = price === null || price === undefined || Number(price) < 0;
  if (invalid) {
    return (
      <div className="leading-tight">
        <p className="font-semibold text-rose-600">{price === null || price === undefined ? "—" : formatPrice(price)}</p>
        <p className="text-xs text-rose-500">Invalid</p>
      </div>
    );
  }
  return (
    <div className="leading-tight">
      <p className="font-semibold text-slate-700">{formatPrice(price)}</p>
      {mrp != null && mrp !== price && (
        <p className="text-xs text-slate-400 line-through">{formatPrice(mrp)}</p>
      )}
    </div>
  );
}

function Thumb({ src, name }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span className="h-11 w-11 rounded-md bg-slate-50 text-slate-300 grid place-items-center text-[10px] font-medium border border-dashed border-slate-200">
        Empty
      </span>
    );
  }
  return (
    <img src={src} alt={name} onError={() => setFailed(true)} className="h-11 w-11 rounded-md object-cover border border-slate-200" />
  );
}
