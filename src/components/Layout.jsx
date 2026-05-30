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
  const [open, setOpen] = useState(false);

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

      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-40 w-64 shrink-0 bg-white border-r border-slate-200 text-slate-600 flex flex-col h-screen transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >

        <div className="px-5 py-5 flex items-center gap-3 border-b border-slate-100">
          <span className="h-9 w-9 rounded-lg bg-indigo-600 text-white grid place-items-center">
            <IconGlobe width={20} height={20} />
          </span>
          <div className="leading-tight flex-1">
            <p className="text-slate-800 font-semibold text-sm">Flipkart Seller Center</p>
            <p className="text-[10px] tracking-[0.18em] text-slate-400 font-medium">PRODUCT INTELLIGENCE</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-slate-400 hover:text-slate-700"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={auditPrices}
            disabled={auditing}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-60"
          >
            <IconRefresh width={14} height={14} className={auditing ? "animate-spin" : ""} />
            {auditing ? "Auditing..." : "Audit Market Prices"}
          </button>
        </div>

        <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
          {links.map(({ to, label, end, Icon, badge, alert }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`
              }
            >
              <Icon width={18} height={18} />
              <span className="flex-1">{label}</span>
              {badge && counts[badge] > 0 && (
                <span
                  className={`min-w-[20px] text-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                    alert ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {counts[badge]}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-slate-100 text-[11px] text-slate-400">
          Flipkart Seller Dashboard
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">

        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 bg-white border-b border-slate-200 px-4 py-3">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-slate-600 hover:text-slate-900">
            <MenuIcon />
          </button>
          <span className="h-8 w-8 rounded-lg bg-indigo-600 text-white grid place-items-center">
            <IconGlobe width={18} height={18} />
          </span>
          <span className="font-semibold text-slate-800 text-sm truncate">Flipkart Seller Center</span>
        </header>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-5 lg:py-7 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
