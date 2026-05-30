import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Badge from "../components/Badge";
import { ErrorBox } from "../components/Spinner";
import { IconCloudUpload, IconFile, IconSparkle, IconQuestion } from "../components/icons";

export default function Upload() {
  const [videoFile, setVideoFile] = useState(null);
  const [enhance, setEnhance] = useState(true);
  const [productCsv, setProductCsv] = useState(null);
  const [competitorCsv, setCompetitorCsv] = useState(null);

  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const resultRef = useRef(null);
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function submitVideo(e) {
    e.preventDefault();
    if (!videoFile) return setError("Please choose a video file.");
    setError(""); setResult(null); setBusy("video");
    try {
      const fd = new FormData();
      fd.append("video", videoFile);
      fd.append("enhanceTitle", String(enhance));
      const res = await api.uploadVideo(fd);
      setResult({ kind: "video", data: res });
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function submitProductCsv(e) {
    e.preventDefault();
    if (!productCsv) return setError("Please choose a product CSV file.");
    setError(""); setResult(null); setBusy("productCsv");
    try {
      const fd = new FormData();
      fd.append("csv", productCsv);
      const res = await api.uploadProductsCsv(fd);
      setResult({ kind: "productCsv", data: res });
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  async function submitCompetitorCsv(e) {
    e.preventDefault();
    if (!competitorCsv) return setError("Please choose a competitor price CSV file.");
    setError(""); setResult(null); setBusy("competitorCsv");
    try {
      const fd = new FormData();
      fd.append("csv", competitorCsv);
      const res = await api.uploadCompetitorCsv(fd);
      setResult({ kind: "competitorCsv", data: res });
    } catch (err) { setError(err.message); } finally { setBusy(""); }
  }

  return (
    <div className="space-y-6">

      <div>
        <div className="flex items-center gap-2.5">
          <IconCloudUpload width={24} height={24} className="text-indigo-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Import Listings &amp; Feeds</h1>
        </div>
        <p className="text-sm text-slate-500 mt-1.5">
          Add new catalog products. Upload a promotional/spec video for automatic AI attribute extraction, or submit a fallback product inventory CSV.
        </p>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid lg:grid-cols-2 gap-6">

        <form onSubmit={submitVideo} className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="badge bg-indigo-50 text-indigo-600 uppercase text-[10px] tracking-wider font-semibold">Primary Input</span>
            <h2 className="font-semibold text-slate-800">Video Frame Extraction</h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            AI models will scan keyframes to detect details like packaging description, color branding, category alignment, and dimensions.
          </p>

          <Dropzone
            icon={<IconCloudUpload width={32} height={32} className="text-slate-400" />}
            title={videoFile ? videoFile.name : "Drag or click to choose video file"}
            hint="MP4, MOV UP TO 50MB"
            accept="video/*"
            onChange={(f) => setVideoFile(f)}
          />

          <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
            <IconSparkle width={18} height={18} className="text-indigo-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Automate SEO Title Enhancement</p>
            </div>
            <Toggle on={enhance} onClick={() => setEnhance(!enhance)} />
          </div>

          <button disabled={busy === "video"} className="btn-primary w-full py-2.5">
            {busy === "video" ? "Processing..." : "Process Video"}
          </button>
        </form>

        <form onSubmit={submitProductCsv} className="card p-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="badge bg-orange-50 text-orange-600 uppercase text-[10px] tracking-wider font-semibold">Fallback / Bulk</span>
            <h2 className="font-semibold text-slate-800">Bulk CSV Inventory Feed</h2>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            If video is not available or incomplete, import structured listings directly via standard e-commerce grid files.
          </p>

          <Dropzone
            icon={<IconFile width={30} height={30} className="text-slate-400" />}
            title={productCsv ? productCsv.name : "Choose inventory CSV document"}
            hint="STANDARD CSV LIST FORMAT"
            accept=".csv,text/csv"
            onChange={(f) => setProductCsv(f)}
          />

          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-800">
            <IconQuestion width={18} height={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              Upload a CSV file to import your product catalog.
            </p>
          </div>

          <button disabled={busy === "productCsv"} className="btn w-full py-2.5 bg-orange-600 text-white hover:bg-orange-500">
            {busy === "productCsv" ? "Importing..." : "Import Catalog Feed"}
          </button>
        </form>
      </div>

      <form onSubmit={submitCompetitorCsv} className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span className="badge bg-slate-100 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">Optional</span>
          <h2 className="font-semibold text-slate-800">Competitor Price Feed</h2>
        </div>
        <p className="text-sm text-slate-500">
          Upload a competitor price CSV (columns: sku_id, platform, competitor_price…). SKUs must already exist.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <Dropzone
              compact
              icon={<IconFile width={22} height={22} className="text-slate-400" />}
              title={competitorCsv ? competitorCsv.name : "Choose competitor price CSV"}
              hint="SKU_ID, PLATFORM, COMPETITOR_PRICE"
              accept=".csv,text/csv"
              onChange={(f) => setCompetitorCsv(f)}
            />
          </div>
          <button disabled={busy === "competitorCsv"} className="btn-secondary py-2.5 px-5 whitespace-nowrap">
            {busy === "competitorCsv" ? "Uploading..." : "Upload Competitor CSV"}
          </button>
        </div>
      </form>

      {result && (
        <div ref={resultRef} className="scroll-mt-6">
          <ResultPanel result={result} />
        </div>
      )}
    </div>
  );
}

function Dropzone({ icon, title, hint, accept, onChange, compact }) {
  return (
    <label className={`block border-2 border-dashed border-slate-200 rounded-xl text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors ${compact ? "p-4" : "p-8"}`}>
      <input type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files[0])} />
      <div className="flex justify-center">{icon}</div>
      <p className="mt-2 text-sm font-medium text-slate-600 truncate">{title}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-0.5">{hint}</p>
    </label>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${on ? "bg-indigo-600" : "bg-slate-300"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : ""}`} />
    </button>
  );
}

function ResultPanel({ result }) {
  const { kind, data } = result;
  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-slate-800">Result</h2>
        {data.jobStatus && <Badge label={data.jobStatus} type="status" />}
        {data.jobId && <Link to="/jobs" className="link text-sm">View job</Link>}
      </div>

      {kind === "video" && (
        <div className="text-sm space-y-3">
          <p className="text-slate-500">{data.note}</p>
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3">
            <IconSparkle width={18} height={18} className="text-indigo-500 shrink-0" />
            <p className="text-slate-700">
              A blank draft listing{" "}
              <span className="font-semibold">{data.product.skuId}</span>{" "}
              was created. Add the title, category, price and image to complete it.
            </p>
          </div>
          <Link to={`/products/${data.product.skuId}`} className="btn-primary inline-flex py-2 px-4">
            Add product details →
          </Link>
        </div>
      )}

      {kind === "productCsv" && (
        <div className="text-sm space-y-2">
          <p>Saved <span className="font-medium">{data.savedCount}</span> product(s).</p>
          {data.failedRows?.length > 0 && (
            <div className="text-rose-700">
              {data.failedRows.length} row(s) failed:
              <ul className="list-disc ml-5">
                {data.failedRows.map((r, i) => (<li key={i}>Row {r.row}: {r.reason}</li>))}
              </ul>
            </div>
          )}
          <Link to="/products" className="link">View products →</Link>
        </div>
      )}

      {kind === "competitorCsv" && (
        <div className="text-sm space-y-2">
          <p>Saved <span className="font-medium">{data.savedCount}</span> competitor price(s).</p>
          {data.failedRows?.length > 0 && (
            <div className="text-rose-700">
              {data.failedRows.length} row(s) failed:
              <ul className="list-disc ml-5">
                {data.failedRows.map((r, i) => (<li key={i}>Row {r.row}: {r.reason}</li>))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
