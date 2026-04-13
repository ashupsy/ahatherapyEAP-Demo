"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";

const cards = [
  {
    title: "Rorschach Inkblot Test",
    desc: "Exner Comprehensive System – 10 inkblot cards with full scoring",
    href: "/tests/rorschach",
    color: "bg-primary-100 border-primary-300",
  },
  {
    title: "TAT",
    desc: "Thematic Apperception Test – narrative story analysis",
    href: "/tests/tat",
    color: "bg-blue-50 border-blue-200",
  },
  {
    title: "SCT",
    desc: "Sentence Completion Test – 32 stems across 8 categories",
    href: "/tests/sct",
    color: "bg-indigo-50 border-indigo-200",
  },
  {
    title: "DAP / HTP",
    desc: "Draw-A-Person / House-Tree-Person – symbolic analysis",
    href: "/tests/dap",
    color: "bg-violet-50 border-violet-200",
  },
];

export default function HomePage() {
  const { state } = useStore();
  const unacked = state.alerts.filter((a) => !a.acknowledged).length;

  return (
    <div>
      {/* Hero */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-900">AI Projective Testing &amp; Interpretation System</h1>
        <p className="text-slate-500 mt-1">
          Administer, score, interpret, and report Rorschach · TAT · SCT · DAP/HTP
        </p>
      </div>

      {/* Alert banner */}
      {unacked > 0 && (
        <Link
          href="/dashboard"
          className="block mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium"
        >
          ⚠️ {unacked} unacknowledged red-flag alert{unacked > 1 ? "s" : ""} — click to review
        </Link>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Clients" value={state.clients.length} />
        <Stat label="Sessions" value={state.sessions.length} />
        <Stat label="Reports" value={state.reports.length} />
        <Stat label="Alerts" value={unacked} accent={unacked > 0} />
      </div>

      {/* Test cards */}
      <h2 className="text-lg font-semibold text-primary-800 mb-3">Projective Tests</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className={`rounded-xl border p-5 ${c.color} hover:shadow-md transition-shadow`}
          >
            <h3 className="font-bold text-primary-900">{c.title}</h3>
            <p className="text-xs text-slate-600 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/clients" className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-primary-800">+ New Client</h3>
          <p className="text-xs text-slate-500 mt-1">Register a new client and start a test battery</p>
        </Link>
        <Link href="/interpretation" className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-primary-800">Cross-Test Analysis</h3>
          <p className="text-xs text-slate-500 mt-1">Generate integrated psychodynamic formulation</p>
        </Link>
        <Link href="/reports" className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-primary-800">Reports</h3>
          <p className="text-xs text-slate-500 mt-1">Generate PDF/HTML comprehensive reports</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-danger" : "text-primary-800"}`}>{value}</p>
    </div>
  );
}
