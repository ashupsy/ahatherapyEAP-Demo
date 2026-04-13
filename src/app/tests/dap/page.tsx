"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { dapInstructions, testInstructions } from "@/data/test-stimuli";
import { scoreDAPResponse } from "@/lib/scoring";
import { interpretDAP } from "@/lib/interpretation";
import type { DAPScoring } from "@/types";

type Phase = "instructions" | "administration" | "scoring" | "results";

export default function DAPPage() {
  const { state, startSession, addResponse, completeSession, dispatch, logAudit } = useStore();
  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentDrawing, setCurrentDrawing] = useState(0);
  const [description, setDescription] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scorings, setScorings] = useState<DAPScoring[]>([]);
  const info = testInstructions.dap;
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const handleBegin = () => {
    if (!activeClient) return;
    const sid = startSession(activeClient.id, "dap");
    setSessionId(sid);
    logAudit("START_SESSION", "session", sid);
    setPhase("administration");
    setCurrentDrawing(0);
  };

  const handleSubmitDrawing = () => {
    if (!sessionId || !description.trim()) return;
    const drawingInfo = dapInstructions[currentDrawing];
    addResponse(sessionId, drawingInfo.id, description);

    const fakeResp = {
      id: `dap_${currentDrawing}_${Date.now()}`,
      stimulusId: drawingInfo.id,
      response: description,
      timestamp: new Date().toISOString(),
    };
    const scoring = scoreDAPResponse(fakeResp, drawingInfo.id as DAPScoring["drawingType"]);
    setScorings((prev) => [...prev, scoring]);

    setDescription("");
    if (currentDrawing < dapInstructions.length - 1) {
      setCurrentDrawing((c) => c + 1);
    } else {
      completeSession(sessionId);
      dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "scored" } });
      setPhase("scoring");
    }
  };

  const handleFinalize = () => {
    if (!activeClient || !sessionId) return;
    const interpretation = interpretDAP(scorings, activeClient);
    interpretation.sessionId = sessionId;
    dispatch({ type: "ADD_INTERPRETATION", payload: interpretation });
    dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "interpreted" } });
    logAudit("INTERPRET_SESSION", "session", sessionId);
    setPhase("results");
  };

  const interpretation = state.interpretations.find((i) => i.sessionId === sessionId);

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
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-primary-700 mb-2">Drawing Sequence ({dapInstructions.length} drawings)</h3>
            <div className="space-y-1.5">
              {dapInstructions.map((d, i) => (
                <div key={d.id} className="text-sm text-slate-600 bg-slate-50 rounded-lg p-2.5">
                  <strong>{i + 1}.</strong> {d.label} — {d.instruction}
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleBegin} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            Begin Test
          </button>
        </div>
      )}

      {/* Administration */}
      {activeClient && phase === "administration" && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary-800">{dapInstructions[currentDrawing].label}</h2>
              <span className="text-xs text-slate-400">Drawing {currentDrawing + 1} of {dapInstructions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
              <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${((currentDrawing + 1) / dapInstructions.length) * 100}%` }} />
            </div>

            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-primary-800 italic">&quot;{dapInstructions[currentDrawing].instruction}&quot;</p>
            </div>

            {/* Drawing upload placeholder */}
            <div className="border-2 border-dashed border-primary-200 rounded-lg p-8 text-center mb-4 bg-slate-50">
              <p className="text-sm text-slate-400 mb-2">Drawing area / Upload zone</p>
              <p className="text-xs text-slate-400">In production: client draws on a digital canvas or uploads a scanned image</p>
            </div>

            <h3 className="text-sm font-semibold text-slate-700 mb-2">Therapist&apos;s Description of Drawing</h3>
            <p className="text-xs text-slate-500 mb-2">Describe the drawing in detail: size, placement, proportions, line quality, missing parts, notable features.</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="e.g., Small figure placed in the upper left corner. Light line pressure. Missing hands and feet. Large head relative to body. Front-facing. No ground line. Minimal clothing detail."
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none mb-4"
            />
            <div className="flex justify-end">
              <button onClick={handleSubmitDrawing} disabled={!description.trim()} className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors">
                {currentDrawing < dapInstructions.length - 1 ? "Next Drawing →" : "Complete Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring */}
      {activeClient && phase === "scoring" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">DAP/HTP Scoring Summary</h2>
            <div className="space-y-4">
              {scorings.map((s, i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-primary-700 text-sm mb-3">{s.drawingType.replace("_", " ").toUpperCase()}</h3>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Size</p>
                      <p className="text-sm font-medium">{s.figureSize}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Placement</p>
                      <p className="text-sm font-medium">{s.placement}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Proportion</p>
                      <p className="text-sm font-medium">{s.proportion}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Line Pressure</p>
                      <p className="text-sm font-medium">{s.linePressure}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Perspective</p>
                      <p className="text-sm font-medium">{s.perspective}</p>
                    </div>
                    <div className="bg-slate-50 rounded p-2">
                      <p className="text-[10px] text-slate-500">Missing Parts</p>
                      <p className="text-sm font-medium">{s.missingParts.join(", ") || "None"}</p>
                    </div>
                  </div>
                  {s.symbolicIndicators.length > 0 && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">Symbolic Indicators</p>
                      <div className="flex flex-wrap gap-1">
                        {s.symbolicIndicators.map((ind, j) => (
                          <span key={j} className="px-2 py-0.5 rounded-full text-[10px] bg-primary-100 text-primary-700">{ind}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
            <h2 className="font-semibold text-primary-800 mb-4">DAP/HTP Interpretation</h2>
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
            <button onClick={() => { setPhase("instructions"); setCurrentDrawing(0); setScorings([]); setSessionId(null); }} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors">New Session</button>
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
