"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { rorschachCards, testInstructions } from "@/data/test-stimuli";
import { scoreRorschachResponse, computeStructuralSummary } from "@/lib/scoring";
import { interpretRorschach } from "@/lib/interpretation";
import type { RorschachScoring } from "@/types";

type Phase = "instructions" | "free_association" | "inquiry" | "scoring" | "results";

export default function RorschachPage() {
  const { state, startSession, addResponse, completeSession, dispatch, logAudit } = useStore();
  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentCard, setCurrentCard] = useState(0);
  const [responseText, setResponseText] = useState("");
  const [inquiryText, setInquiryText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scorings, setScorings] = useState<RorschachScoring[]>([]);
  const startTimeRef = useRef<number>(Date.now());
  const info = testInstructions.rorschach;

  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const handleBegin = () => {
    if (!activeClient) return;
    const sid = startSession(activeClient.id, "rorschach");
    setSessionId(sid);
    logAudit("START_SESSION", "session", sid);
    setPhase("free_association");
    startTimeRef.current = Date.now();
  };

  const handleSubmitResponse = () => {
    if (!sessionId || !responseText.trim()) return;
    const latency = Date.now() - startTimeRef.current;
    const card = rorschachCards[currentCard];
    addResponse(sessionId, String(card.id), responseText, latency);

    // Auto-score
    const fakeResp = {
      id: `r_${currentCard}_${Date.now()}`,
      stimulusId: String(card.id),
      response: responseText,
      inquiryNotes: inquiryText,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
    };
    const scoring = scoreRorschachResponse(fakeResp, card.id);
    setScorings((prev) => [...prev, scoring]);

    setResponseText("");
    setInquiryText("");

    if (currentCard < rorschachCards.length - 1) {
      setCurrentCard((c) => c + 1);
      startTimeRef.current = Date.now();
    } else {
      completeSession(sessionId);
      dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "scored" } });
      setPhase("scoring");
    }
  };

  const handleFinalize = () => {
    if (!activeClient || !sessionId) return;
    const summary = computeStructuralSummary(scorings);
    const interpretation = interpretRorschach(scorings, summary, activeClient);
    interpretation.sessionId = sessionId;
    dispatch({ type: "ADD_INTERPRETATION", payload: interpretation });
    dispatch({ type: "UPDATE_SESSION_STATUS", payload: { sessionId, status: "interpreted" } });
    logAudit("INTERPRET_SESSION", "session", sessionId);
    setPhase("results");
  };

  const summary = scorings.length > 0 ? computeStructuralSummary(scorings) : null;
  const interpretation = state.interpretations.find((i) => i.sessionId === sessionId);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-900 mb-1">{info.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{info.overview}</p>

      {/* No active client */}
      {!activeClient && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Please select or register a client first from the <a href="/clients" className="underline font-medium">Clients</a> page.
        </div>
      )}

      {/* Instructions Phase */}
      {activeClient && phase === "instructions" && (
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold text-primary-800 mb-3">Administration Instructions</h2>
          <p className="text-sm text-slate-600 mb-3">Client: <strong>{activeClient.firstName} {activeClient.lastName}</strong></p>
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 mb-6">
            {info.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
          </ol>
          <button onClick={handleBegin} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            Begin Test
          </button>
        </div>
      )}

      {/* Free Association Phase */}
      {activeClient && phase === "free_association" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Stimulus */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-primary-800">{rorschachCards[currentCard].label}</h2>
              <span className="text-xs text-slate-400">Card {currentCard + 1} of {rorschachCards.length}</span>
            </div>
            <div className="inkblot-card w-full max-w-sm mx-auto flex items-center justify-center">
              <span className="text-white/60 text-sm">[Inkblot Stimulus]</span>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center italic">{rorschachCards[currentCard].description}</p>
          </div>

          {/* Response */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-2">Client Response</h2>
            <p className="text-sm text-slate-500 mb-3">&quot;{rorschachCards[currentCard].instruction}&quot;</p>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={5}
              placeholder="Record the client's response verbatim..."
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none mb-3"
            />
            <h3 className="text-sm font-medium text-slate-700 mb-1">Inquiry Notes (optional)</h3>
            <textarea
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              rows={3}
              placeholder="Where did you see it? What made it look like that?"
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none mb-4"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Response time tracked automatically</span>
              <button
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
                className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {currentCard < rorschachCards.length - 1 ? "Next Card →" : "Complete Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Phase */}
      {activeClient && phase === "scoring" && summary && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">Scoring Summary – Exner Comprehensive System</h2>

            {/* Structural Summary Table */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <ScoringCard label="Total Responses (R)" value={summary.R} />
              <ScoringCard label="Lambda" value={summary.lambda.toFixed(2)} />
              <ScoringCard label="EB (Erlebnistypus)" value={summary.erpiRatio} />
              <ScoringCard label="EA" value={summary.EA.toFixed(1)} />
              <ScoringCard label="es" value={summary.es} />
              <ScoringCard label="D Score" value={summary.D} warn={summary.D < -1} />
              <ScoringCard label="Adj D" value={summary.Adj_D} warn={summary.Adj_D < -1} />
              <ScoringCard label="Afr" value={summary.Afr.toFixed(2)} />
            </div>

            {/* Location */}
            <h3 className="text-sm font-semibold text-primary-700 mb-2">Location Frequencies</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ScoringCard label="W" value={summary.W} small />
              <ScoringCard label="D" value={summary.D_loc} small />
              <ScoringCard label="Dd" value={summary.Dd} small />
              <ScoringCard label="S" value={summary.S} small />
            </div>

            {/* Form Quality */}
            <h3 className="text-sm font-semibold text-primary-700 mb-2">Form Quality</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              <ScoringCard label="FQ+" value={summary.FQPlus} small />
              <ScoringCard label="FQo" value={summary.FQo} small />
              <ScoringCard label="FQu" value={summary.FQu} small />
              <ScoringCard label="FQ-" value={summary.FQMinus} small warn={summary.FQMinus > summary.R * 0.25} />
            </div>

            {/* Indices */}
            <h3 className="text-sm font-semibold text-primary-700 mb-2">Clinical Indices</h3>
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              <ScoringCard label="DEPI" value={summary.DEPI} small warn={summary.DEPI >= 5} />
              <ScoringCard label="CDI" value={summary.CDI} small warn={summary.CDI >= 4} />
              <ScoringCard label="PTI" value={summary.PTI} small warn={summary.PTI >= 3} />
              <ScoringCard label="S-CON" value={summary.S_CON} small warn={summary.S_CON >= 8} />
              <ScoringCard label="HVI" value={summary.HVI ? "Yes" : "No"} small />
              <ScoringCard label="OBS" value={summary.OBS ? "Yes" : "No"} small />
            </div>

            {/* Individual card scorings */}
            <h3 className="text-sm font-semibold text-primary-700 mb-2">Response-Level Scoring</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-slate-500">
                    <th className="py-2 pr-3">Card</th>
                    <th className="py-2 pr-3">Loc</th>
                    <th className="py-2 pr-3">Det</th>
                    <th className="py-2 pr-3">FQ</th>
                    <th className="py-2 pr-3">Content</th>
                    <th className="py-2 pr-3">Pop</th>
                    <th className="py-2">Special</th>
                  </tr>
                </thead>
                <tbody>
                  {scorings.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-medium">{s.cardNumber}</td>
                      <td className="py-1.5 pr-3">{s.location}</td>
                      <td className="py-1.5 pr-3">{s.determinants.join(".")}</td>
                      <td className="py-1.5 pr-3">{s.formQuality}</td>
                      <td className="py-1.5 pr-3">{s.contents.join(", ")}</td>
                      <td className="py-1.5 pr-3">{s.popular ? "P" : ""}</td>
                      <td className="py-1.5">{s.specialScores.join(", ") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleFinalize}
            className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            Generate Interpretation →
          </button>
        </div>
      )}

      {/* Results Phase */}
      {activeClient && phase === "results" && interpretation && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">Rorschach Interpretation</h2>
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
            <button
              onClick={() => { setPhase("instructions"); setCurrentCard(0); setScorings([]); setSessionId(null); }}
              className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              New Session
            </button>
            <a href="/reports" className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
              Generate Report →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoringCard({ label, value, small, warn }: { label: string; value: string | number; small?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-lg border ${warn ? "border-red-200 bg-red-50" : "border-border bg-slate-50"} ${small ? "p-2" : "p-3"}`}>
      <p className={`text-slate-500 ${small ? "text-[10px]" : "text-xs"}`}>{label}</p>
      <p className={`font-bold ${small ? "text-sm" : "text-lg"} ${warn ? "text-danger" : "text-primary-800"}`}>{value}</p>
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
