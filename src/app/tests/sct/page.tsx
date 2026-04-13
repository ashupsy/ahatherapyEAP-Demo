"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { sctStems, testInstructions } from "@/data/test-stimuli";
import { scoreSCTResponse } from "@/lib/scoring";
import { interpretSCT } from "@/lib/interpretation";
import type { SCTScoring } from "@/types";

type Phase = "instructions" | "administration" | "scoring" | "results";

export default function SCTPage() {
  const { state, startSession, addResponse, completeSession, dispatch, logAudit } = useStore();
  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentStem, setCurrentStem] = useState(0);
  const [completionText, setCompletionText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scorings, setScorings] = useState<SCTScoring[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const info = testInstructions.sct;
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const handleBegin = () => {
    if (!activeClient) return;
    const sid = startSession(activeClient.id, "sct");
    setSessionId(sid);
    logAudit("START_SESSION", "session", sid);
    setPhase("administration");
    setCurrentStem(0);
    startTimeRef.current = Date.now();
  };

  const handleSubmitCompletion = () => {
    if (!sessionId) return;
    const latency = Date.now() - startTimeRef.current;
    const stem = sctStems[currentStem];
    const text = completionText.trim() || "...";
    addResponse(sessionId, stem.id, text, latency);

    const fakeResp = {
      id: `sct_${currentStem}_${Date.now()}`,
      stimulusId: stem.id,
      response: text,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
    };
    const scoring = scoreSCTResponse(fakeResp, stem.id, stem.category);
    setScorings((prev) => [...prev, scoring]);

    setCompletionText("");
    if (currentStem < sctStems.length - 1) {
      setCurrentStem((c) => c + 1);
      startTimeRef.current = Date.now();
    } else {
      completeSession(sessionId);
      dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "scored" } });
      setPhase("scoring");
    }
  };

  const handleFinalize = () => {
    if (!activeClient || !sessionId) return;
    const interpretation = interpretSCT(scorings, activeClient);
    interpretation.sessionId = sessionId;
    dispatch({ type: "ADD_INTERPRETATION", payload: interpretation });
    dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "interpreted" } });
    logAudit("INTERPRET_SESSION", "session", sessionId);
    setPhase("results");
  };

  const interpretation = state.interpretations.find((i) => i.sessionId === sessionId);
  const categoryColors: Record<string, string> = {
    family: "bg-blue-100 text-blue-700",
    authority: "bg-purple-100 text-purple-700",
    guilt: "bg-red-100 text-red-700",
    sexuality: "bg-pink-100 text-pink-700",
    self_worth: "bg-amber-100 text-amber-700",
    interpersonal: "bg-teal-100 text-teal-700",
    fears: "bg-orange-100 text-orange-700",
    goals: "bg-green-100 text-green-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">{info.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{info.overview}</p>

      {!activeClient && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Please select or register a client first from the <a href="/clients" className="underline font-medium">Clients</a> page.
        </div>
      )}

      {/* Instructions */}
      {activeClient && phase === "instructions" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-primary-800 mb-3">Administration Instructions</h2>
          <p className="text-sm text-slate-600 mb-3">Client: <strong>{activeClient.firstName} {activeClient.lastName}</strong></p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 mb-4">
            {info.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
          </ol>
          <p className="text-sm text-slate-500 mb-4">{sctStems.length} sentence stems across 8 categories</p>
          <button onClick={handleBegin} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            Begin Test
          </button>
        </div>
      )}

      {/* Administration */}
      {activeClient && phase === "administration" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[sctStems[currentStem].category] || "bg-slate-100 text-slate-600"}`}>
                {sctStems[currentStem].category.replace("_", " ")}
              </span>
              <span className="text-xs text-slate-400">Stem {currentStem + 1} of {sctStems.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
              <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentStem + 1) / sctStems.length) * 100}%` }} />
            </div>

            <p className="text-lg font-medium text-primary-900 mb-4">{sctStems[currentStem].stem}</p>

            <input
              type="text"
              value={completionText}
              onChange={(e) => setCompletionText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmitCompletion(); }}
              placeholder="Complete the sentence..."
              autoFocus
              className="block w-full rounded-lg border border-border px-4 py-3 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none mb-4"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Press Enter or click to continue</span>
              <button onClick={handleSubmitCompletion} className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                {currentStem < sctStems.length - 1 ? "Next →" : "Complete Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring */}
      {activeClient && phase === "scoring" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">SCT Scoring Summary</h2>

            {/* Category summary */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {Object.entries(categoryColors).map(([cat, cls]) => {
                const catScores = scorings.filter((s) => s.category === cat);
                if (catScores.length === 0) return null;
                const neg = catScores.filter((s) => s.tone === "negative").length;
                return (
                  <div key={cat} className={`rounded-lg border border-border p-3 ${neg > catScores.length / 2 ? "bg-red-50" : "bg-slate-50"}`}>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cls}`}>{cat.replace("_", " ")}</span>
                    <p className="text-xs text-slate-500 mt-1">{catScores.length} stems · {neg} negative</p>
                  </div>
                );
              })}
            </div>

            {/* Detail table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-slate-500">
                    <th className="py-2 pr-2">ID</th>
                    <th className="py-2 pr-2">Category</th>
                    <th className="py-2 pr-2">Tone</th>
                    <th className="py-2 pr-2">Completeness</th>
                    <th className="py-2 pr-2">Latency</th>
                    <th className="py-2">Conflict Markers</th>
                  </tr>
                </thead>
                <tbody>
                  {scorings.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 pr-2 font-medium">{s.stemId}</td>
                      <td className="py-1.5 pr-2"><span className={`px-1 py-0.5 rounded text-[10px] ${categoryColors[s.category]}`}>{s.category.replace("_", " ")}</span></td>
                      <td className="py-1.5 pr-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.tone === "negative" ? "bg-red-100 text-red-700" : s.tone === "positive" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>{s.tone}</span>
                      </td>
                      <td className="py-1.5 pr-2">{s.completeness}</td>
                      <td className="py-1.5 pr-2">{(s.latencyMs / 1000).toFixed(1)}s</td>
                      <td className="py-1.5">{s.conflictMarkers.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button onClick={handleFinalize} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            Generate Interpretation →
          </button>
        </div>
      )}

      {/* Results */}
      {activeClient && phase === "results" && interpretation && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">SCT Interpretation</h2>
            <p className="text-sm text-slate-600 mb-4">{interpretation.summary}</p>
            <InterpSection title="Key Findings" items={interpretation.keyFindings} />
            <InterpSection title="Diagnostic Hypotheses" items={interpretation.diagnosticHypotheses} warn />
            <InterpSection title="Strengths Identified" items={interpretation.strengthsIdentified} positive />
            <InterpSection title="Areas of Concern" items={interpretation.areasOfConcern} warn />
            <InterpSection title="Recommendations" items={interpretation.recommendations} />
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-primary-700 mb-1">Psychodynamic Formulation</h3>
              <p className="text-sm text-slate-600 bg-primary-50 rounded-lg p-3">{interpretation.psychodynamicFormulation}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-primary-700 mb-1">Cultural Considerations</h3>
              <p className="text-sm text-slate-600 bg-blue-50 rounded-lg p-3">{interpretation.culturalConsiderations}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setPhase("instructions"); setCurrentStem(0); setScorings([]); setSessionId(null); }} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors">New Session</button>
            <a href="/reports" className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">Generate Report →</a>
          </div>
        </div>
      )}
    </div>
  );
}

function InterpSection({ title, items, warn, positive }: { title: string; items: string[]; warn?: boolean; positive?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3">
      <h3 className={`text-sm font-semibold mb-1 ${warn ? "text-red-700" : positive ? "text-emerald-700" : "text-primary-700"}`}>{title}</h3>
      <ul className="list-disc list-inside text-sm text-slate-600 space-y-0.5">
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}
