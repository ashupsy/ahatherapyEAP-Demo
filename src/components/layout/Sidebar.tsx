"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const nav = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/clients", label: "Clients", icon: "👤" },
  { href: "/tests/rorschach", label: "Rorschach", icon: "🖼" },
  { href: "/tests/tat", label: "TAT", icon: "📖" },
  { href: "/tests/sct", label: "SCT", icon: "✏️" },
  { href: "/tests/dap", label: "DAP / HTP", icon: "🎨" },
  { href: "/interpretation", label: "Interpretation", icon: "🔍" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/reports", label: "Reports", icon: "📄" },
  { href: "/admin", label: "Security", icon: "🔒" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state } = useStore();
  const unacknowledged = state.alerts.filter((a) => !a.acknowledged).length;

  return (
    <aside className="w-64 bg-primary-900 text-white flex flex-col shrink-0 no-print">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-primary-700">
        <h1 className="text-lg font-bold tracking-wide">Aha Therapy</h1>
        <p className="text-xs text-primary-300 mt-0.5">AI Projective Testing System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-primary-700 text-white font-semibold"
                  : "text-primary-200 hover:bg-primary-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === "Dashboard" && unacknowledged > 0 && (
                <span className="ml-auto bg-danger text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unacknowledged}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-primary-700 text-xs text-primary-400">
        <p>HIPAA · GDPR · DPDPA</p>
        <p className="mt-0.5">v1.0.0 — EAP Demo</p>
      </div>
    </aside>
  );
}
