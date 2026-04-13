"use client";
import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import { v4 as uuid } from "uuid";
import type {
  ClientProfile,
  TestSession,
  TestResponse,
  TestInterpretation,
  CrossTestAnalysis,
  Report,
  RedFlagAlert,
  AuditLogEntry,
  TestType,
} from "@/types";

// ── State ──
export interface AppState {
  clients: ClientProfile[];
  sessions: TestSession[];
  interpretations: TestInterpretation[];
  crossAnalyses: CrossTestAnalysis[];
  reports: Report[];
  alerts: RedFlagAlert[];
  auditLog: AuditLogEntry[];
  activeClientId: string | null;
}

const initialState: AppState = {
  clients: [],
  sessions: [],
  interpretations: [],
  crossAnalyses: [],
  reports: [],
  alerts: [],
  auditLog: [],
  activeClientId: null,
};

// ── Actions ──
type Action =
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "ADD_CLIENT"; payload: ClientProfile }
  | { type: "SET_ACTIVE_CLIENT"; payload: string | null }
  | { type: "START_SESSION"; payload: TestSession }
  | { type: "ADD_RESPONSE"; payload: { sessionId: string; response: TestResponse } }
  | { type: "COMPLETE_SESSION"; payload: string }
  | { type: "UPDATE_SESSION_STATUS"; payload: { sessionId: string; status: TestSession["status"] } }
  | { type: "ADD_INTERPRETATION"; payload: TestInterpretation }
  | { type: "ADD_CROSS_ANALYSIS"; payload: CrossTestAnalysis }
  | { type: "ADD_REPORT"; payload: Report }
  | { type: "ADD_ALERT"; payload: RedFlagAlert }
  | { type: "ACKNOWLEDGE_ALERT"; payload: string }
  | { type: "ADD_AUDIT_LOG"; payload: AuditLogEntry };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;
    case "ADD_CLIENT":
      return { ...state, clients: [...state.clients, action.payload] };
    case "SET_ACTIVE_CLIENT":
      return { ...state, activeClientId: action.payload };
    case "START_SESSION":
      return { ...state, sessions: [...state.sessions, action.payload] };
    case "ADD_RESPONSE": {
      const sessions = state.sessions.map((s) =>
        s.id === action.payload.sessionId
          ? { ...s, responses: [...s.responses, action.payload.response] }
          : s
      );
      return { ...state, sessions };
    }
    case "COMPLETE_SESSION": {
      const sessions = state.sessions.map((s) =>
        s.id === action.payload ? { ...s, status: "completed" as const, completedAt: new Date().toISOString() } : s
      );
      return { ...state, sessions };
    }
    case "UPDATE_SESSION_STATUS": {
      const sessions = state.sessions.map((s) =>
        s.id === action.payload.sessionId ? { ...s, status: action.payload.status } : s
      );
      return { ...state, sessions };
    }
    case "ADD_INTERPRETATION":
      return { ...state, interpretations: [...state.interpretations, action.payload] };
    case "ADD_CROSS_ANALYSIS":
      return { ...state, crossAnalyses: [...state.crossAnalyses, action.payload] };
    case "ADD_REPORT":
      return { ...state, reports: [...state.reports, action.payload] };
    case "ADD_ALERT":
      return { ...state, alerts: [...state.alerts, action.payload] };
    case "ACKNOWLEDGE_ALERT": {
      const alerts = state.alerts.map((a) =>
        a.id === action.payload ? { ...a, acknowledged: true } : a
      );
      return { ...state, alerts };
    }
    case "ADD_AUDIT_LOG":
      return { ...state, auditLog: [...state.auditLog, action.payload] };
    default:
      return state;
  }
}

// ── Context ──
interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  addClient: (c: Omit<ClientProfile, "id" | "createdAt">) => string;
  startSession: (clientId: string, testType: TestType) => string;
  addResponse: (sessionId: string, stimulusId: string, response: string, latencyMs?: number) => void;
  completeSession: (sessionId: string) => void;
  getClientSessions: (clientId: string) => TestSession[];
  logAudit: (action: string, resourceType: string, resourceId: string) => void;
  raiseAlert: (alert: Omit<RedFlagAlert, "id" | "timestamp" | "acknowledged">) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const STORAGE_KEY = "aha_projective_state";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "LOAD_STATE", payload: JSON.parse(raw) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const addClient = (c: Omit<ClientProfile, "id" | "createdAt">): string => {
    const id = uuid();
    const client: ClientProfile = { ...c, id, createdAt: new Date().toISOString() };
    dispatch({ type: "ADD_CLIENT", payload: client });
    dispatch({ type: "SET_ACTIVE_CLIENT", payload: id });
    return id;
  };

  const startSession = (clientId: string, testType: TestType): string => {
    const id = uuid();
    const session: TestSession = {
      id,
      clientId,
      testType,
      startedAt: new Date().toISOString(),
      status: "in_progress",
      responses: [],
    };
    dispatch({ type: "START_SESSION", payload: session });
    return id;
  };

  const addResponse = (sessionId: string, stimulusId: string, response: string, latencyMs?: number) => {
    const r: TestResponse = {
      id: uuid(),
      stimulusId,
      response,
      timestamp: new Date().toISOString(),
      latencyMs,
    };
    dispatch({ type: "ADD_RESPONSE", payload: { sessionId, response: r } });

    // Auto-detect red flags
    const lower = response.toLowerCase();
    const suicidalKeywords = ["kill myself", "end my life", "suicide", "want to die", "no reason to live", "better off dead"];
    const selfHarmKeywords = ["cut myself", "hurt myself", "self-harm", "burn myself"];
    const sess = state.sessions.find((s) => s.id === sessionId);
    if (suicidalKeywords.some((k) => lower.includes(k))) {
      raiseAlert({
        clientId: sess?.clientId ?? "",
        sessionId,
        type: "suicidal_ideation",
        description: `Potential suicidal ideation detected in response to stimulus ${stimulusId}: "${response.slice(0, 100)}..."`,
        severity: "critical",
      });
    } else if (selfHarmKeywords.some((k) => lower.includes(k))) {
      raiseAlert({
        clientId: sess?.clientId ?? "",
        sessionId,
        type: "self_harm",
        description: `Potential self-harm reference detected in response to stimulus ${stimulusId}`,
        severity: "high",
      });
    }
  };

  const completeSession = (sessionId: string) => {
    dispatch({ type: "COMPLETE_SESSION", payload: sessionId });
  };

  const getClientSessions = (clientId: string) =>
    state.sessions.filter((s) => s.clientId === clientId);

  const logAudit = (action: string, resourceType: string, resourceId: string) => {
    const entry: AuditLogEntry = {
      id: uuid(),
      userId: "therapist_001",
      action,
      resourceType,
      resourceId,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: "ADD_AUDIT_LOG", payload: entry });
  };

  const raiseAlert = (alert: Omit<RedFlagAlert, "id" | "timestamp" | "acknowledged">) => {
    dispatch({
      type: "ADD_ALERT",
      payload: { ...alert, id: uuid(), timestamp: new Date().toISOString(), acknowledged: false },
    });
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        addClient,
        startSession,
        addResponse,
        completeSession,
        getClientSessions,
        logAudit,
        raiseAlert,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
