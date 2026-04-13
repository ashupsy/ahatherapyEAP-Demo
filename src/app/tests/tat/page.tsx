"use client";
import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { tatCards, testInstructions } from "@/data/test-stimuli";
import { scoreTATResponse } from "@/lib/scoring";
import { interpretTAT } from "@/lib/interpretation";
import type { TATScoring } from "@/types";

type Phase = "instructions" | "administration" | "scoring" | "results";

export default function TATPage() {
  const { state, startSession, addResponse, completeSession, dispatch, logAudit } = useStore();
  const [phase, setPhase] = useState<Phase>("instructions");
  const [currentCard, setCurrentCard] = useState(0);
  const [storyText, setStoryText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scorings, setScorings] = useState<TATScoring[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7]);
  const startTimeRef = useRef<number>(Date.now());
  const info = testInstructions.tat;
  const activeClient = state.clients.find((c) => c.id === state.activeClientId);

  const handleBegin = () => {
    if (!activeClient) return;
    const sid = startSession(activeClient.id, "tat");
    setSessionId(sid);
    logAudit("START_SESSION", "session", sid);
    setPhase("administration");
    setCurrentCard(0);
    startTimeRef.current = Date.now();
  };

  const handleSubmitStory = () => {
    if (!sessionId || !storyText.trim()) return;
    const latency = Date.now() - startTimeRef.current;
    const card = tatCards[selectedCards[currentCard]];
    addResponse(sessionId, card.id, storyText, latency);

    const fakeResp = {
      id: `tat_${currentCard}_${Date.now()}`,
      stimulusId: card.id,
      response: storyText,
      timestamp: new Date().toISOString(),
      latencyMs: latency,
    };
    const scoring = scoreTATResponse(fakeResp, card.id);
    setScorings((prev) => [...prev, scoring]);

    setStoryText("");
    if (currentCard < selectedCards.length - 1) {
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
    const interpretation = interpretTAT(scorings, activeClient);
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

          <h3 className="text-sm font-semibold text-primary-700 mb-2">Select Cards (8–12 recommended)</h3>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-6">
            {tatCards.map((card, idx) => (
              <label key={card.id} className={`flex items-center gap-1.5 text-xs p-2 rounded border cursor-pointer ${selectedCards.includes(idx) ? "bg-primary-50 border-primary-300" : "bg-white border-border"}`}>
                <input
                  type="checkbox"
                  checked={selectedCards.includes(idx)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedCards([...selectedCards, idx].sort((a, b) => a - b));
                    else setSelectedCards(selectedCards.filter((i) => i !== idx));
                  }}
                />
                {card.label}
              </label>
            ))}
          </div>

          <button onClick={handleBegin} disabled={selectedCards.length < 1} className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors">
            Begin Test ({selectedCards.length} cards)
          </button>
        </div>
      )}

      {/* Administration */}
      {activeClient && phase === "administration" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-primary-800">{tatCards[selectedCards[currentCard]].label}</h2>
              <span className="text-xs text-slate-400">Card {currentCard + 1} of {selectedCards.length}</span>
            </div>
            <div className="bg-slate-100 rounded-lg p-6 min-h-[200px] flex items-center justify-center mb-3">
              <p className="text-sm text-slate-500 italic text-center">{tatCards[selectedCards[currentCard]].description}</p>
            </div>
            <p className="text-xs text-slate-400">Present the card and ask the client to tell a story.</p>
          </div>

          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-2">Client&apos;s Story</h2>
            <p className="text-sm text-slate-500 mb-3">What is happening? What led up to this? What are the characters feeling? What will happen next?</p>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              rows={8}
              placeholder="Record the client's story verbatim..."
              className="block w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary-400 focus:ring-1 focus:ring-primary-300 outline-none mb-4"
            />
            <div className="flex justify-end">
              <button onClick={handleSubmitStory} disabled={!storyText.trim()} className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-colors">
                {currentCard < selectedCards.length - 1 ? "Next Card →" : "Complete Test"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring */}
      {activeClient && phase === "scoring" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="font-semibold text-primary-800 mb-4">TAT Thematic Scoring</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-slate-500">
                    <th className="py-2 pr-3">Card</th>
                    <th className="py-2 pr-3">Needs</th>
                    <th className="py-2 pr-3">Press</th>
                    <th className="py-2 pr-3">Conflict</th>
                    <th className="py-2 pr-3">Affect</th>
                    <th className="py-2 pr-3">Resolution</th>
                    <th className="py-2">Defenses</th>
                  </tr>
                </thead>
                <tbody>
                  {scorings.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1.5 pr-3 font-medium">{s.cardNumber}</td>
                      <td className="py-1.5 pr-3">{s.needs.join(", ")}</td>
                      <td className="py-1.5 pr-3">{s.press.join(", ")}</td>
                      <td className="py-1.5 pr-3">{s.conflict}</td>
                      <td className="py-1.5 pr-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          s.affectTone === "negative" ? "bg-red-100 text-red-700" :
                          s.affectTone === "positive" ? "bg-green-100 text-green-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{s.affectTone}</span>
                      </td>
                      <td className="py-1.5 pr-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          s.resolution === "maladaptive" ? "bg-red-100 text-red-700" :
                          s.resolution === "adaptive" ? "bg-green-100 text-green-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>{s.resolution}</span>
                      </td>
                      <td className="py-1.5">{s.defenses.join(", ")}</td>
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
            <h2 className="font-semibold text-primary-800 mb-4">TAT Interpretation</h2>
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
            <button onClick={() => { setPhase("instructions"); setCurrentCard(0); setScorings([]); setSessionId(null); }} className="px-5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-slate-50 transition-colors">
              New Session
            </button>
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
