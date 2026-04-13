"use client";
import { useStore } from "@/lib/store";
import type { TestType } from "@/types";

const testColors: Record<TestType, string> = {
  rorschach: "bg-primary-100 text-primary-700",
  tat: "bg-blue-100 text-blue-700",
  sct: "bg-indigo-100 text-indigo-700",
  dap: "bg-violet-100 text-violet-700",
};

export default function DashboardPage() {
  const { state, dispatch, logAudit } = useStore();
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const clientSessions = activeClient
    ? state.sessions.filter((s) => s.clientId === activeClient.id)
    : state.sessions;

  const clientInterps = state.interpretations.filter((i) =>
    clientSessions.some((s) => s.id === i.sessionId)
  );

  const clientAlerts = activeClient
    ? state.alerts.filter((a) => a.clientId === activeClient.id)
    : state.alerts;

  const unacked = clientAlerts.filter((a) => !a.acknowledged);

  const handleAcknowledge = (alertId: string) => {
    dispatch({ type: "ACKNOWLEDGE_ALERT", payload: alertId });
    logAudit("ACKNOWLEDGE_ALERT", "alert", alertId);
  };

  // Compute chart-like data
  const sessionsByTest: Record<string, number> = { rorschach: 0, tat: 0, sct: 0, dap: 0 };
  clientSessions.forEach((s) => { sessionsByTest[s.testType] = (sessionsByTest[s.testType] || 0) + 1; });

  const statusCounts = { in_progress: 0, completed: 0, scored: 0, interpreted: 0 };
  clientSessions.forEach((s) => { statusCounts[s.status]++; });

  // Aggregate concerns & strengths from interpretations
  const allConcerns = clientInterps.flatMap((i) => i.areasOfConcern);
  const allStrengths = clientInterps.flatMap((i) => i.strengthsIdentified);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">Therapist Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">
        {activeClient
          ? `Showing data for ${activeClient.firstName} ${activeClient.lastName}`
          : "Showing all clients — select a client for detailed view"}
      </p>

      {/* Red Flag Alerts */}
      {unacked.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-red-700 mb-2">Red Flag Alerts</h2>
          <div className="space-y-2">
            {unacked.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                  alert.severity === "critical"
                    ? "bg-red-50 border-red-300"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === "critical" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-500">{alert.type.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm text-slate-700">{alert.description}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="shrink-0 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-white transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Sessions" value={clientSessions.length} />
        <StatCard label="Interpreted" value={statusCounts.interpreted} />
        <StatCard label="In Progress" value={statusCounts.in_progress} />
        <StatCard label="Active Alerts" value={unacked.length} accent={unacked.length > 0} />
      </div>

      {/* Sessions by Test Type - Visual Bar Chart */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-primary-800 mb-4">Sessions by Test Type</h2>
          <div className="space-y-3">
            {Object.entries(sessionsByTest).map(([test, count]) => {
              const max = Math.max(...Object.values(sessionsByTest), 1);
              return (
                <div key={test}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${testColors[test as TestType]}`}>
                      {test.toUpperCase()}
                    </span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-primary-400 h-3 rounded-full transition-all"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session Status Distribution */}
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-primary-800 mb-4">Session Status</h2>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const max = Math.max(...Object.values(statusCounts), 1);
              const colors: Record<string, string> = {
                in_progress: "bg-amber-400",
                completed: "bg-blue-400",
                scored: "bg-indigo-400",
                interpreted: "bg-emerald-400",
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-600 capitalize">{status.replace("_", " ")}</span>
                    <span className="text-slate-500">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className={`${colors[status]} h-3 rounded-full transition-all`} style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insight Maps */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Concerns */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="font-semibold text-red-700 mb-3">Areas of Concern ({allConcerns.length})</h2>
          {allConcerns.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No concerns flagged yet.</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {[...new Set(allConcerns)].map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          )}
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-xl border border-emerald-100 p-6">
          <h2 className="font-semibold text-emerald-700 mb-3">Strengths Identified ({allStrengths.length})</h2>
          {allStrengths.length === 0 ? (
            <p className="text-sm text-slate-400 italic">No strengths identified yet.</p>
          ) : (
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
              {[...new Set(allStrengths)].map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
        </div>
      </div>

      {/* Session History */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="font-semibold text-primary-800 mb-4">Session History</h2>
        {clientSessions.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No sessions recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-slate-500 text-xs">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Test</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Responses</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {clientSessions.map((s) => {
                  const client = state.clients.find((c) => c.id === s.clientId);
                  return (
                    <tr key={s.id} className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-xs">{new Date(s.startedAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${testColors[s.testType]}`}>
                          {s.testType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-xs">{client ? `${client.firstName} ${client.lastName}` : s.clientId.slice(0, 8)}</td>
                      <td className="py-2 pr-3 text-xs">{s.responses.length}</td>
                      <td className="py-2 pr-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          s.status === "interpreted" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "scored" ? "bg-indigo-100 text-indigo-700" :
                          s.status === "completed" ? "bg-blue-100 text-blue-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Suggested Further Testing */}
      {clientInterps.length > 0 && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-primary-800 mb-3">Suggested Further Testing</h2>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
            {!sessionsByTest.rorschach && <li>Rorschach Inkblot Test — recommended for personality structure assessment</li>}
            {!sessionsByTest.tat && <li>TAT — recommended for thematic/narrative analysis</li>}
            {!sessionsByTest.sct && <li>SCT — recommended for conscious/preconscious attitudes</li>}
            {!sessionsByTest.dap && <li>DAP/HTP — recommended for self-image and body-image assessment</li>}
            <li>MMPI-2-RF — objective personality inventory for cross-validation</li>
            <li>BDI-II / BAI — brief symptom severity measures</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent ? "text-danger" : "text-primary-800"}`}>{value}</p>
    </div>
  );
}
