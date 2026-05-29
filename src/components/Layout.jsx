import { NavLink, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  IconDashboard, IconImport, IconInventory, IconAlerts, IconJobs, IconGlobe, IconRefresh,
} from "./icons";

const links = [
  { to: "/", label: "Quality Dashboard", end: true, Icon: IconDashboard },
  { to: "/upload", label: "Import Listings", Icon: IconImport },
  { to: "/products", label: "Inventory Products", Icon: IconInventory, badge: "products" },
  { to: "/alerts", label: "Seller Alerts", Icon: IconAlerts, badge: "alerts", alert: true },
  { to: "/jobs", label: "Job History", Icon: IconJobs },
];

export default function Layout() {
  const [counts, setCounts] = useState({ products: 0, alerts: 0 });
  const [auditing, setAuditing] = useState(false);

  useEffect(() => { loadCounts(); }, []);

  function loadCounts() {
    api.getSummary()
      .then((s) => setCounts({ products: s.totalProducts, alerts: s.totalAlerts }))
      .catch(() => {});
  }

  async function auditPrices() {
    setAuditing(true);
    try {
      await api.refreshPrices();

      window.location.reload();
    } catch {
      setAuditing(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f4f5f7]">

      <aside className="w-64 shrink-0 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 flex flex-col sticky top-0 h-screen">

        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/5">
          <span className="h-9 w-9 rounded-lg bg-indigo-600/90 text-white grid place-items-center">
            <IconGlobe width={20} height={20} />
          </span>
          <div className="leading-tight">
            <p className="text-white font-semibold text-sm">Flipkart Seller Center</p>
            <p className="text-[10px] tracking-[0.18em] text-slate-400 font-medium">PRODUCT INTELLIGENCE</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={auditPrices}
            disabled={auditing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors disabled:opacity-60"
          >
            <IconRefresh width={14} height={14} className={auditing ? "animate-spin" : ""} />
            {auditing ? "Auditing..." : "Audit Market Prices"}
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 flex-1">
          {links.map(({ to, label, end, Icon, badge, alert }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <Icon width={18} height={18} />
              <span className="flex-1">{label}</span>
              {badge && counts[badge] > 0 && (
                <span
                  className={`min-w-[20px] text-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    alert ? "bg-rose-500 text-white" : "bg-white/10 text-slate-200"
                  }`}
                >
                  {counts[badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/5 text-[11px] text-slate-500">
          Flipkart Seller Dashboard
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-8 py-7 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
