"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { generateCrossTestAnalysis } from "@/lib/interpretation";

export default function InterpretationPage() {
  const { state, dispatch, logAudit } = useStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);
  const clientSessions = activeClient
    ? state.sessions.filter((s) => s.clientId === activeClient.id && s.status === "interpreted")
    : [];
  const clientInterpretations = state.interpretations.filter((i) =>
    clientSessions.some((s) => s.id === i.sessionId)
  );
  const existingAnalysis = state.crossAnalyses.find((a) => a.clientId === activeClient?.id);

  const handleGenerate = () => {
    if (!activeClient || clientInterpretations.length === 0) return;
    const selectedInterps = selectedSessions.length > 0
      ? clientInterpretations.filter((i) => selectedSessions.includes(i.sessionId))
      : clientInterpretations;
    const analysis = generateCrossTestAnalysis(selectedInterps, activeClient);
    analysis.sessions = clientSessions.map((s) => s.id);
    dispatch({ type: "ADD_CROSS_ANALYSIS", payload: analysis });
    logAudit("GENERATE_CROSS_ANALYSIS", "cross_analysis", activeClient.id);
  };

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const analysis = existingAnalysis;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">Cross-Test Analysis &amp; Interpretation</h1>
      <p className="text-sm text-slate-500 mb-6">Integrated psychodynamic formulation across multiple projective tests</p>

      {!activeClient && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Please select or register a client first from the <a href="/clients" className="underline font-medium">Clients</a> page.
        </div>
      )}

      {activeClient && clientSessions.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          No interpreted sessions for <strong>{activeClient.firstName} {activeClient.lastName}</strong>. Complete and interpret at least one projective test first.
        </div>
      )}

      {activeClient && clientSessions.length > 0 && (
        <>
          {/* Session selection */}
          <div className="bg-white rounded-xl border border-border p-6 mb-6">
            <h2 className="font-semibold text-primary-800 mb-3">
              Interpreted Sessions for {activeClient.firstName} {activeClient.lastName}
            </h2>
            <div className="space-y-2 mb-4">
              {clientSessions.map((s) => {
                const interp = clientInterpretations.find((i) => i.sessionId === s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSessions.includes(s.id) || selectedSessions.length === 0
                        ? "bg-primary-50 border-primary-300"
                        : "bg-white border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSessions.includes(s.id) || selectedSessions.length === 0}
                      onChange={() => toggleSession(s.id)}
                      className="accent-primary-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-primary-800">
                        {s.testType.toUpperCase()} — {new Date(s.startedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">{interp?.summary || `${s.responses.length} responses`}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <button
              onClick={handleGenerate}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              {analysis ? "Regenerate" : "Generate"} Cross-Test Analysis
            </button>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Convergent & Divergent */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-primary-700 mb-3">Convergent Findings</h3>
                  {analysis.convergentFindings.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No strongly convergent patterns detected.</p>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {analysis.convergentFindings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                </div>
                <div className="bg-white rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-primary-700 mb-3">Divergent Findings</h3>
                  {analysis.divergentFindings.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No significant divergence across tests.</p>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                      {analysis.divergentFindings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  )}
                </div>
              </div>

              {/* Integrated formulation */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-primary-700 mb-3">Integrated Psychodynamic Formulation</h3>
                <p className="text-sm text-slate-600 leading-relaxed bg-primary-50 rounded-lg p-4">{analysis.integratedFormulation}</p>
              </div>

              {/* Risk & Protective factors */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-red-200 p-6">
                  <h3 className="font-semibold text-red-700 mb-3">Risk Factors</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {analysis.riskFactors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
                <div className="bg-white rounded-xl border border-emerald-200 p-6">
                  <h3 className="font-semibold text-emerald-700 mb-3">Protective Factors</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {analysis.protectiveFactors.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>

              {/* Diagnostic Impressions */}
              {analysis.diagnosticImpressions.length > 0 && (
                <div className="bg-white rounded-xl border border-amber-200 p-6">
                  <h3 className="font-semibold text-amber-700 mb-3">Diagnostic Impressions</h3>
                  <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                    {analysis.diagnosticImpressions.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              )}

              {/* Treatment Recommendations */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-primary-700 mb-3">Treatment Recommendations</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {analysis.treatmentRecommendations.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>

              {/* Further Testing */}
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="font-semibold text-primary-700 mb-3">Suggested Further Testing</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {analysis.furtherTestingSuggested.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>

              <a href="/reports" className="inline-block px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                Generate Full Report →
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
