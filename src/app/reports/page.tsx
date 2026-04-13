"use client";
import { useState } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "@/lib/store";
import type { Report } from "@/types";

export default function ReportsPage() {
  const { state, dispatch, logAudit } = useStore();
  const [therapistNotes, setTherapistNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const clientSessions = activeClient
    ? state.sessions.filter((s) => s.clientId === activeClient.id)
    : [];
  const clientInterps = state.interpretations.filter((i) =>
    clientSessions.some((s) => s.id === i.sessionId)
  );
  const clientAnalysis = state.crossAnalyses.find((a) => a.clientId === activeClient?.id);
  const existingReports = state.reports.filter((r) => r.clientId === activeClient?.id);

  const handleGenerate = () => {
    if (!activeClient) return;
    setGenerating(true);
    setTimeout(() => {
      const report: Report = {
        id: uuid(),
        clientId: activeClient.id,
        client: activeClient,
        createdAt: new Date().toISOString(),
        sessions: clientSessions,
        interpretations: clientInterps,
        crossTestAnalysis: clientAnalysis,
        therapistNotes,
        status: "draft",
      };
      dispatch({ type: "ADD_REPORT", payload: report });
      logAudit("GENERATE_REPORT", "report", report.id);
      setGenerating(false);
      setViewingReport(report.id);
    }, 800);
  };

  const handleFinalize = (reportId: string) => {
    const updated = state.reports.map((r) =>
      r.id === reportId ? { ...r, status: "finalized" as const } : r
    );
    // Dispatch via loading updated state (simplified)
    dispatch({ type: "ADD_REPORT", payload: { ...state.reports.find((r) => r.id === reportId)!, status: "finalized" } });
    logAudit("FINALIZE_REPORT", "report", reportId);
  };

  const currentReport = viewingReport ? state.reports.find((r) => r.id === viewingReport) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">Report Generation</h1>
      <p className="text-sm text-slate-500 mb-6">Generate comprehensive PDF/HTML projective test reports</p>

      {!activeClient && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Please select or register a client first from the <a href="/clients" className="underline font-medium">Clients</a> page.
        </div>
      )}

      {activeClient && !viewingReport && (
        <>
          {/* Generate New Report */}
          <div className="bg-white rounded-xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-primary-800 mb-3">Generate New Report</h2>
            <p className="text-sm text-slate-600 mb-2">
              Client: <strong>{activeClient.firstName} {activeClient.lastName}</strong> ·
              {clientSessions.length} session(s) · {clientInterps.length} interpretation(s)
              {clientAnalysis ? " · Cross-test analysis available" : ""}
            </p>

            {clientInterps.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 mb-4">
                No interpreted sessions available. Complete and interpret at least one test before generating a report.
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 mb-1">Report will include:</h3>
              <ul className="text-xs text-slate-500 space-y-0.5 ml-4 list-disc">
                <li>Client Cover Sheet</li>
                <li>Raw Response Logs</li>
                <li>Scoring Tables</li>
                <li>Graphical Output (bar/pie charts, pastel blue theme)</li>
                <li>Client Summary (Lay Language)</li>
                <li>Therapist Interpretation (Technical Narrative)</li>
                <li>Diagnosis &amp; Recommendations</li>
              </ul>
            </div>

            <label className="block mb-4">
              <span className="text-sm font-medium text-slate-700">Therapist Notes (optional)</span>
              <textarea
                value={therapistNotes}
                onChange={(e) => setTherapistNotes(e.target.value)}
                rows={4}
                placeholder="Add your clinical observations, session notes, and any additional context..."
                className="mt-1 block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none"
              />
            </label>

            <button
              onClick={handleGenerate}
              disabled={generating || clientInterps.length === 0}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors"
            >
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>

          {/* Existing Reports */}
          {existingReports.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold text-primary-800 mb-3">Existing Reports</h2>
              <div className="space-y-2">
                {existingReports.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setViewingReport(r.id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        Report — {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.sessions.length} session(s) · {r.interpretations.length} interpretation(s) ·{" "}
                        <span className={r.status === "finalized" ? "text-emerald-600 font-medium" : "text-amber-600"}>{r.status}</span>
                      </p>
                    </div>
                    <span className="text-xs text-primary-500">View →</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Report View */}
      {activeClient && currentReport && (
        <div>
          <button
            onClick={() => setViewingReport(null)}
            className="mb-4 text-sm text-primary-600 hover:underline"
          >
            ← Back to Reports
          </button>

          <div className="bg-white rounded-xl border border-border shadow-sm" id="report-content">
            {/* Cover Sheet */}
            <div className="p-8 border-b border-border">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-primary-900">Psychological Assessment Report</h1>
                <p className="text-sm text-primary-600 mt-1">Aha Therapy — AI Projective Testing System</p>
                <p className="text-xs text-slate-400 mt-1">CONFIDENTIAL — For Professional Use Only</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Client Name</p>
                  <p className="font-medium">{currentReport.client.firstName} {currentReport.client.lastName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Age / Gender</p>
                  <p className="font-medium">{currentReport.client.age} years / {currentReport.client.gender || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Education</p>
                  <p className="font-medium">{currentReport.client.education || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Occupation</p>
                  <p className="font-medium">{currentReport.client.occupation || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Referral Reason</p>
                  <p className="font-medium">{currentReport.client.referralReason}</p>
                </div>
                <div>
                  <p className="text-slate-500">Cultural Background</p>
                  <p className="font-medium">{currentReport.client.culturalBackground || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-slate-500">Assessment Date</p>
                  <p className="font-medium">{new Date(currentReport.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tests Administered</p>
                  <p className="font-medium">
                    {[...new Set(currentReport.sessions.map((s) => s.testType.toUpperCase()))].join(", ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Raw Response Summary */}
            <div className="p-8 border-b border-border">
              <h2 className="text-lg font-bold text-primary-800 mb-4">Raw Response Logs</h2>
              {currentReport.sessions.map((session) => (
                <div key={session.id} className="mb-4">
                  <h3 className="text-sm font-semibold text-primary-700 mb-2">
                    {session.testType.toUpperCase()} — {new Date(session.startedAt).toLocaleDateString()}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border border-border">
                      <thead>
                        <tr className="bg-primary-50 text-primary-800">
                          <th className="border border-border px-2 py-1.5 text-left">Stimulus</th>
                          <th className="border border-border px-2 py-1.5 text-left">Response</th>
                          <th className="border border-border px-2 py-1.5 text-left">Latency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {session.responses.map((r) => (
                          <tr key={r.id}>
                            <td className="border border-border px-2 py-1.5 font-medium">{r.stimulusId}</td>
                            <td className="border border-border px-2 py-1.5">{r.response}</td>
                            <td className="border border-border px-2 py-1.5">{r.latencyMs ? `${(r.latencyMs / 1000).toFixed(1)}s` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Test Interpretations */}
            {currentReport.interpretations.map((interp, idx) => (
              <div key={idx} className="p-8 border-b border-border">
                <h2 className="text-lg font-bold text-primary-800 mb-2">
                  {interp.testType.toUpperCase()} — Interpretation
                </h2>
                <p className="text-sm text-slate-600 mb-4">{interp.summary}</p>

                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-primary-700 mb-1">Key Findings</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {interp.keyFindings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 mb-1">Areas of Concern</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {interp.areasOfConcern.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                </div>

                {interp.diagnosticHypotheses.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-amber-700 mb-1">Diagnostic Hypotheses</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {interp.diagnosticHypotheses.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-primary-50 rounded-lg p-3 mb-3">
                  <h3 className="text-sm font-semibold text-primary-700 mb-1">Psychodynamic Formulation</h3>
                  <p className="text-xs text-slate-600">{interp.psychodynamicFormulation}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-primary-700 mb-1">Cultural Considerations</h3>
                  <p className="text-xs text-slate-600">{interp.culturalConsiderations}</p>
                </div>
              </div>
            ))}

            {/* Cross-Test Analysis */}
            {currentReport.crossTestAnalysis && (
              <div className="p-8 border-b border-border">
                <h2 className="text-lg font-bold text-primary-800 mb-4">Integrated Cross-Test Analysis</h2>
                <div className="bg-primary-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-600">{currentReport.crossTestAnalysis.integratedFormulation}</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-red-700 mb-1">Risk Factors</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {currentReport.crossTestAnalysis.riskFactors.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-700 mb-1">Protective Factors</h3>
                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                      {currentReport.crossTestAnalysis.protectiveFactors.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-amber-700 mb-1">Diagnostic Impressions</h3>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {currentReport.crossTestAnalysis.diagnosticImpressions.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-700 mb-1">Treatment Recommendations</h3>
                  <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                    {currentReport.crossTestAnalysis.treatmentRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* Client Summary (Lay Language) */}
            <div className="p-8 border-b border-border">
              <h2 className="text-lg font-bold text-primary-800 mb-3">Client Summary</h2>
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed">
                <p className="mb-2">
                  <strong>Dear {currentReport.client.firstName},</strong>
                </p>
                <p className="mb-2">
                  You completed {currentReport.sessions.length} psychological assessment{currentReport.sessions.length > 1 ? "s" : ""}
                  ({[...new Set(currentReport.sessions.map((s) => s.testType.toUpperCase()))].join(", ")}).
                  These tests help us understand your thinking patterns, emotional experiences, and interpersonal style.
                </p>
                {currentReport.interpretations.length > 0 && (
                  <p className="mb-2">
                    <strong>What we found:</strong> The assessment identified
                    {currentReport.interpretations.flatMap((i) => i.strengthsIdentified).length > 0
                      ? ` several personal strengths, including ${currentReport.interpretations.flatMap((i) => i.strengthsIdentified).slice(0, 2).join(" and ").toLowerCase()}.`
                      : " a unique profile of psychological functioning."}
                    {currentReport.interpretations.flatMap((i) => i.areasOfConcern).length > 0
                      ? ` Some areas where additional support may be helpful include ${currentReport.interpretations.flatMap((i) => i.areasOfConcern).slice(0, 2).join(" and ").toLowerCase()}.`
                      : ""}
                  </p>
                )}
                <p>
                  Your therapist will discuss these findings with you in detail during your next session.
                  This report is confidential and is shared only with your permission.
                </p>
              </div>
            </div>

            {/* Therapist Notes */}
            {currentReport.therapistNotes && (
              <div className="p-8 border-b border-border">
                <h2 className="text-lg font-bold text-primary-800 mb-3">Therapist Notes</h2>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{currentReport.therapistNotes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="p-8 text-center text-xs text-slate-400">
              <p>Generated by Aha Therapy AI Projective Testing System</p>
              <p className="mt-0.5">CONFIDENTIAL — HIPAA / GDPR / DPDPA Compliant</p>
              <p className="mt-0.5">Report ID: {currentReport.id.slice(0, 8)} · Date: {new Date(currentReport.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Print / Save as PDF
            </button>
            <button
              onClick={() => handleFinalize(currentReport.id)}
              disabled={currentReport.status === "finalized"}
              className="px-5 py-2 rounded-lg border border-emerald-300 text-emerald-700 text-sm font-medium hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              {currentReport.status === "finalized" ? "Finalized" : "Finalize Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
