// ============================================================
// AI Projective Testing & Interpretation System – Type Definitions
// ============================================================

// ---- Client / Demographics ----
export interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  education: string;
  occupation: string;
  referralReason: string;
  culturalBackground: string;
  languages: string[];
  dateOfBirth: string;
  createdAt: string;
}

// ---- Common ----
export type TestType = "rorschach" | "tat" | "sct" | "dap";

export interface TestSession {
  id: string;
  clientId: string;
  testType: TestType;
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "completed" | "scored" | "interpreted";
  responses: TestResponse[];
}

export interface TestResponse {
  id: string;
  stimulusId: string;
  response: string;
  inquiryNotes?: string;
  timestamp: string;
  latencyMs?: number;
}

// ---- Rorschach (Exner Comprehensive System) ----
export type RorschachLocation = "W" | "D" | "Dd" | "S" | "WS" | "DS";
export type RorschachDeterminant =
  | "F" | "M" | "FM" | "m"
  | "FC" | "CF" | "C" | "Cn"
  | "FC'" | "C'F" | "C'"
  | "FT" | "TF" | "T"
  | "FV" | "VF" | "V"
  | "FY" | "YF" | "Y"
  | "Fr" | "rF" | "FD";
export type RorschachFormQuality = "+" | "o" | "u" | "-" | "none";
export type RorschachContent =
  | "H" | "(H)" | "Hd" | "(Hd)"
  | "A" | "(A)" | "Ad" | "(Ad)"
  | "An" | "Art" | "Ay" | "Bl" | "Bt" | "Cg" | "Cl" | "Ex" | "Fd"
  | "Fi" | "Ge" | "Hh" | "Ls" | "Na" | "Sc" | "Sx" | "Xy" | "Id";
export type RorschachSpecialScore =
  | "DV" | "DV2" | "INC" | "INC2" | "DR" | "DR2"
  | "FAB" | "FAB2" | "ALOG" | "CONTAM"
  | "AB" | "AG" | "COP" | "GHR" | "PHR" | "MOR" | "PER" | "PSV";

export interface RorschachScoring {
  responseId: string;
  cardNumber: number;
  location: RorschachLocation;
  locationNumber?: number;
  determinants: RorschachDeterminant[];
  formQuality: RorschachFormQuality;
  contents: RorschachContent[];
  popular: boolean;
  specialScores: RorschachSpecialScore[];
  zScore?: number;
  organizationalActivity?: boolean;
}

export interface RorschachStructuralSummary {
  R: number; // Total responses
  lambda: number;
  erpiRatio: string; // EB style
  EA: number;
  es: number;
  Adj_es: number;
  D: number;
  Adj_D: number;
  // Location
  W: number; D_loc: number; Dd: number; S: number;
  // Determinants
  M: number; FM: number; m_det: number;
  FC: number; CF: number; C: number;
  SumC: number; WSumC: number;
  // Form Quality
  FQPlus: number; FQo: number; FQu: number; FQMinus: number;
  // Content
  H: number; A: number; Hd: number; Ad: number;
  // Ratios
  Afr: number;
  isolateIndex: number;
  // Special indices
  DEPI: number;
  CDI: number;
  PTI: number;
  SCZI: number;
  S_CON: number;
  HVI: boolean;
  OBS: boolean;
}

// ---- TAT (Thematic Apperception Test) ----
export interface TATScoring {
  responseId: string;
  cardNumber: string;
  needs: string[];
  press: string[];
  conflict: string;
  affectTone: "positive" | "negative" | "neutral" | "mixed";
  resolution: "adaptive" | "maladaptive" | "ambiguous" | "absent";
  defenses: string[];
  themes: string[];
  objectRelations: string;
  selfRepresentation: string;
}

// ---- SCT (Sentence Completion Test) ----
export interface SCTScoring {
  responseId: string;
  stemId: string;
  category: "family" | "authority" | "guilt" | "sexuality" | "self_worth" | "interpersonal" | "fears" | "goals";
  tone: "positive" | "negative" | "neutral" | "ambivalent";
  completeness: "complete" | "partial" | "evasive" | "blank";
  conflictMarkers: string[];
  latencyMs: number;
  themes: string[];
}

// ---- DAP (Draw-A-Person) ----
export interface DAPScoring {
  responseId: string;
  drawingType: "person" | "opposite_sex" | "self" | "house" | "tree";
  figureSize: "small" | "average" | "large" | "fills_page";
  placement: "center" | "top" | "bottom" | "left" | "right" | "corner";
  proportion: "appropriate" | "distorted" | "exaggerated_head" | "exaggerated_limbs" | "small_head";
  linePressure: "light" | "normal" | "heavy" | "variable";
  missingParts: string[];
  perspective: "front" | "profile" | "back" | "mixed";
  details: string[];
  symbolicIndicators: string[];
}

// ---- Interpretation ----
export interface TestInterpretation {
  sessionId: string;
  testType: TestType;
  summary: string;
  keyFindings: string[];
  diagnosticHypotheses: string[];
  strengthsIdentified: string[];
  areasOfConcern: string[];
  psychodynamicFormulation: string;
  culturalConsiderations: string;
  recommendations: string[];
}

export interface CrossTestAnalysis {
  clientId: string;
  sessions: string[];
  convergentFindings: string[];
  divergentFindings: string[];
  integratedFormulation: string;
  diagnosticImpressions: string[];
  riskFactors: string[];
  protectiveFactors: string[];
  treatmentRecommendations: string[];
  furtherTestingSuggested: string[];
}

// ---- Report ----
export interface Report {
  id: string;
  clientId: string;
  client: ClientProfile;
  createdAt: string;
  sessions: TestSession[];
  interpretations: TestInterpretation[];
  crossTestAnalysis?: CrossTestAnalysis;
  therapistNotes: string;
  status: "draft" | "finalized";
}

// ---- Dashboard / Alerts ----
export interface RedFlagAlert {
  id: string;
  clientId: string;
  sessionId: string;
  type: "suicidal_ideation" | "self_harm" | "violence" | "psychosis" | "severe_depression";
  description: string;
  severity: "high" | "critical";
  timestamp: string;
  acknowledged: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  ipAddress?: string;
}
