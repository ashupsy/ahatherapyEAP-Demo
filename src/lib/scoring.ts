// ============================================================
// AI Scoring Engines for all four projective tests
// ============================================================
// These functions simulate AI-based scoring. In production they
// would call an LLM / NLP backend; here they use heuristic
// analysis to demonstrate the scoring workflow.

import type {
  TestResponse,
  RorschachScoring,
  RorschachStructuralSummary,
  RorschachLocation,
  RorschachDeterminant,
  RorschachFormQuality,
  RorschachContent,
  RorschachSpecialScore,
  TATScoring,
  SCTScoring,
  DAPScoring,
} from "@/types";

// ── Helpers ──
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function hasKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k));
}

// ──────────────────────────────────────────────────────────────
// RORSCHACH – Exner Comprehensive System
// ──────────────────────────────────────────────────────────────
const locationOptions: RorschachLocation[] = ["W", "D", "Dd", "S", "WS", "DS"];
const determinantOptions: RorschachDeterminant[] = ["F", "M", "FM", "m", "FC", "CF", "C", "FC'", "FT", "FV", "FY", "FD"];
const contentOptions: RorschachContent[] = ["H", "(H)", "Hd", "A", "(A)", "Ad", "An", "Art", "Bt", "Cg", "Cl", "Fd", "Ge", "Hh", "Ls", "Na", "Sc"];
const specialScoreOptions: RorschachSpecialScore[] = ["DV", "INC", "DR", "FAB", "AB", "AG", "COP", "GHR", "PHR", "MOR", "PER"];

export function scoreRorschachResponse(response: TestResponse, cardNumber: number): RorschachScoring {
  const text = response.response.toLowerCase();

  // Infer location from response characteristics
  let location: RorschachLocation = "D";
  if (hasKeyword(text, ["whole", "entire", "all of it", "everything"])) location = "W";
  else if (hasKeyword(text, ["tiny", "small part", "little", "edge"])) location = "Dd";
  else if (hasKeyword(text, ["white", "space", "empty", "gap"])) location = "S";

  // Infer determinants
  const determinants: RorschachDeterminant[] = ["F"];
  if (hasKeyword(text, ["moving", "running", "dancing", "flying", "walking", "fighting"])) determinants.push("M");
  if (hasKeyword(text, ["animal moving", "crawling", "bird flying"])) determinants.push("FM");
  if (hasKeyword(text, ["red", "blue", "green", "color", "colourful", "bright"])) determinants.push("FC");
  if (hasKeyword(text, ["soft", "furry", "texture", "rough", "smooth"])) determinants.push("FT");
  if (hasKeyword(text, ["shadow", "dark", "shading", "grey"])) determinants.push("FY");
  if (hasKeyword(text, ["depth", "far away", "3d", "behind"])) determinants.push("FV");

  // Infer form quality
  let formQuality: RorschachFormQuality = "o";
  if (hasKeyword(text, ["bat", "butterfly", "moth"]) && cardNumber === 5) formQuality = "+";
  else if (hasKeyword(text, ["person", "people", "face"]) && [3, 7].includes(cardNumber)) formQuality = "+";
  else if (text.length < 15) formQuality = "u";

  // Infer content
  const contents: RorschachContent[] = [];
  if (hasKeyword(text, ["person", "people", "man", "woman", "human", "figure"])) contents.push("H");
  if (hasKeyword(text, ["face", "head", "hand", "eye"])) contents.push("Hd");
  if (hasKeyword(text, ["animal", "dog", "cat", "bear", "bird", "bat", "butterfly", "spider", "insect"])) contents.push("A");
  if (hasKeyword(text, ["paw", "wing", "claw", "tail"])) contents.push("Ad");
  if (hasKeyword(text, ["blood", "organ", "anatomy", "bone", "skeleton", "x-ray"])) contents.push("An");
  if (hasKeyword(text, ["art", "painting", "design", "pattern"])) contents.push("Art");
  if (hasKeyword(text, ["flower", "plant", "tree", "leaf"])) contents.push("Bt");
  if (hasKeyword(text, ["cloud", "smoke", "fog"])) contents.push("Cl");
  if (hasKeyword(text, ["landscape", "mountain", "island", "lake"])) contents.push("Ls");
  if (hasKeyword(text, ["fire", "explosion", "volcano"])) contents.push("Fi" as RorschachContent);
  if (contents.length === 0) contents.push(pick(contentOptions));

  // Popular responses
  const popularMap: Record<number, string[]> = {
    1: ["bat", "butterfly", "moth"],
    2: ["bear", "animal"],
    3: ["people", "person", "human"],
    5: ["bat", "butterfly", "bird"],
    8: ["animal", "bear", "tiger"],
    10: ["crab", "spider"],
  };
  const popular = popularMap[cardNumber]
    ? hasKeyword(text, popularMap[cardNumber])
    : false;

  // Special scores
  const specialScores: RorschachSpecialScore[] = [];
  if (hasKeyword(text, ["dead", "death", "dying", "broken", "decay", "rotten"])) specialScores.push("MOR");
  if (hasKeyword(text, ["fighting", "attacking", "biting", "war"])) specialScores.push("AG");
  if (hasKeyword(text, ["helping", "cooperating", "dancing together", "playing"])) specialScores.push("COP");
  if (hasKeyword(text, ["i think", "i remember", "my", "i saw"])) specialScores.push("PER");
  if (text.split(" ").length > 40) specialScores.push("DR");

  return {
    responseId: response.id,
    cardNumber,
    location,
    determinants,
    formQuality,
    contents,
    popular,
    specialScores,
    zScore: location === "W" ? 2.5 + Math.random() * 3 : undefined,
    organizationalActivity: location === "W" || determinants.length > 2,
  };
}

export function computeStructuralSummary(scorings: RorschachScoring[]): RorschachStructuralSummary {
  const R = scorings.length || 1;
  const count = (fn: (s: RorschachScoring) => boolean) => scorings.filter(fn).length;

  const W = count((s) => s.location === "W" || s.location === "WS");
  const D_loc = count((s) => s.location === "D" || s.location === "DS");
  const Dd = count((s) => s.location === "Dd");
  const S = count((s) => ["S", "WS", "DS"].includes(s.location));

  const hasDet = (d: string) => count((s) => s.determinants.includes(d as RorschachDeterminant));
  const M = hasDet("M");
  const FM = hasDet("FM");
  const m_det = hasDet("m");
  const FC_d = hasDet("FC");
  const CF_d = hasDet("CF");
  const C_d = hasDet("C");

  const pureF = count((s) => s.determinants.length === 1 && s.determinants[0] === "F");
  const lambda = pureF / Math.max(R - pureF, 1);

  const SumC = FC_d * 0.5 + CF_d * 1.0 + C_d * 1.5;
  const WSumC = SumC;
  const EA = M + WSumC;
  const es = FM + m_det + hasDet("FT") + hasDet("FV") + hasDet("FY") + hasDet("FC'");
  const D = Math.round((EA - es) / 2);

  const FQPlus = count((s) => s.formQuality === "+");
  const FQo = count((s) => s.formQuality === "o");
  const FQu = count((s) => s.formQuality === "u");
  const FQMinus = count((s) => s.formQuality === "-");

  const H = count((s) => s.contents.includes("H"));
  const A = count((s) => s.contents.includes("A"));
  const Hd = count((s) => s.contents.includes("Hd"));
  const Ad = count((s) => s.contents.includes("Ad"));

  const chromaticCards = scorings.filter((s) => s.cardNumber >= 8).length;
  const Afr = chromaticCards / Math.max(R - chromaticCards, 1);

  const isolateContents = count((s) =>
    s.contents.some((c) => ["Bt", "Cl", "Ge", "Ls", "Na"].includes(c))
  );
  const isolateIndex = isolateContents / R;

  // Simplified constellation indices
  const MOR = count((s) => s.specialScores.includes("MOR"));
  const DEPI = Math.min(7, (FQMinus > 2 ? 1 : 0) + (MOR > 1 ? 1 : 0) + (Afr < 0.5 ? 1 : 0) + (SumC < 2 ? 1 : 0) + (isolateIndex > 0.3 ? 1 : 0));
  const CDI = Math.min(5, (EA < 6 ? 1 : 0) + (Afr < 0.46 ? 1 : 0) + (H < 2 ? 1 : 0) + (pureF / R > 0.7 ? 1 : 0));
  const PTI = Math.min(5, (FQMinus / R > 0.26 ? 1 : 0) + (FQPlus + FQo < R * 0.7 ? 1 : 0) + (WSumC > M + 2 ? 1 : 0));
  const S_CON = Math.min(12, (FQMinus > 3 ? 1 : 0) + (MOR > 2 ? 1 : 0) + (S > 3 ? 1 : 0) + (Afr < 0.4 ? 1 : 0));

  return {
    R,
    lambda,
    erpiRatio: `${M}:${WSumC.toFixed(1)}`,
    EA,
    es,
    Adj_es: Math.max(0, es - 1),
    D,
    Adj_D: Math.max(-2, D),
    W, D_loc, Dd, S,
    M, FM, m_det,
    FC: FC_d, CF: CF_d, C: C_d,
    SumC, WSumC,
    FQPlus, FQo, FQu, FQMinus,
    H, A, Hd, Ad,
    Afr: Math.round(Afr * 100) / 100,
    isolateIndex: Math.round(isolateIndex * 100) / 100,
    DEPI, CDI, PTI, SCZI: PTI,
    S_CON,
    HVI: S > 3 && H > 3,
    OBS: Dd > 3 && FQPlus > 3,
  };
}

// ──────────────────────────────────────────────────────────────
// TAT – Thematic Scoring
// ──────────────────────────────────────────────────────────────
const needOptions = ["Achievement", "Affiliation", "Autonomy", "Dominance", "Nurturance", "Succorance", "Abasement", "Aggression", "Avoidance"];
const pressOptions = ["Rejection", "Lack of support", "Loss", "Physical danger", "Parental control", "Affiliation need"];
const defenseOptions = ["Projection", "Denial", "Rationalization", "Intellectualization", "Displacement", "Reaction formation", "Sublimation", "Repression"];

export function scoreTATResponse(response: TestResponse, cardId: string): TATScoring {
  const text = response.response.toLowerCase();

  const needs: string[] = [];
  if (hasKeyword(text, ["success", "achieve", "win", "accomplish", "goal"])) needs.push("Achievement");
  if (hasKeyword(text, ["friend", "together", "belong", "join", "connect"])) needs.push("Affiliation");
  if (hasKeyword(text, ["alone", "independent", "free", "escape", "leave"])) needs.push("Autonomy");
  if (hasKeyword(text, ["control", "power", "lead", "command", "boss"])) needs.push("Dominance");
  if (hasKeyword(text, ["help", "care", "nurture", "protect", "support"])) needs.push("Nurturance");
  if (hasKeyword(text, ["need", "want", "depend", "seek help", "rely"])) needs.push("Succorance");
  if (hasKeyword(text, ["angry", "attack", "fight", "hurt", "destroy", "kill"])) needs.push("Aggression");
  if (needs.length === 0) needs.push(pick(needOptions));

  const press: string[] = [];
  if (hasKeyword(text, ["reject", "abandon", "ignore", "leave behind"])) press.push("Rejection");
  if (hasKeyword(text, ["loss", "lost", "died", "gone", "disappear"])) press.push("Loss");
  if (hasKeyword(text, ["mother", "father", "parent", "family pressure"])) press.push("Parental control");
  if (hasKeyword(text, ["danger", "threat", "scared", "afraid"])) press.push("Physical danger");
  if (press.length === 0) press.push(pick(pressOptions));

  let conflict = "Approach-avoidance";
  if (hasKeyword(text, ["torn", "confused", "uncertain"])) conflict = "Ambivalence";
  else if (hasKeyword(text, ["duty", "obligation", "should"])) conflict = "Duty vs. desire";
  else if (hasKeyword(text, ["guilt", "wrong", "mistake"])) conflict = "Guilt-driven conflict";

  let affectTone: TATScoring["affectTone"] = "neutral";
  if (hasKeyword(text, ["happy", "joy", "love", "hope", "smile", "laugh"])) affectTone = "positive";
  else if (hasKeyword(text, ["sad", "cry", "angry", "fear", "pain", "suffer", "dark", "lonely"])) affectTone = "negative";
  else if (hasKeyword(text, ["but", "however", "although"])) affectTone = "mixed";

  let resolution: TATScoring["resolution"] = "ambiguous";
  if (hasKeyword(text, ["resolved", "better", "succeed", "overcome", "found a way"])) resolution = "adaptive";
  else if (hasKeyword(text, ["failed", "never", "couldn't", "gave up", "destroyed"])) resolution = "maladaptive";
  else if (text.trim().endsWith("...") || text.length < 30) resolution = "absent";

  const defenses: string[] = [];
  if (hasKeyword(text, ["not really", "just", "only"])) defenses.push("Denial");
  if (hasKeyword(text, ["because logically", "reason", "makes sense"])) defenses.push("Intellectualization");
  if (hasKeyword(text, ["they wanted", "they thought"])) defenses.push("Projection");
  if (hasKeyword(text, ["actually good", "fine", "okay"])) defenses.push("Reaction formation");
  if (defenses.length === 0) defenses.push(pick(defenseOptions));

  const themes: string[] = [];
  if (hasKeyword(text, ["family", "mother", "father", "parent", "home"])) themes.push("Family dynamics");
  if (hasKeyword(text, ["love", "relationship", "partner"])) themes.push("Intimacy");
  if (hasKeyword(text, ["work", "career", "school", "study"])) themes.push("Achievement striving");
  if (hasKeyword(text, ["death", "loss", "grief"])) themes.push("Loss and mourning");
  if (hasKeyword(text, ["conflict", "fight", "argue", "war"])) themes.push("Aggression");
  if (hasKeyword(text, ["alone", "isolated", "nobody"])) themes.push("Isolation");
  if (themes.length === 0) themes.push("General narrative");

  return {
    responseId: response.id,
    cardNumber: cardId,
    needs,
    press,
    conflict,
    affectTone,
    resolution,
    defenses,
    themes,
    objectRelations: affectTone === "negative" ? "Disrupted or conflictual object relations" : "Adequate object relations",
    selfRepresentation: needs.includes("Abasement") || affectTone === "negative"
      ? "Fragile or negative self-representation"
      : "Cohesive self-representation",
  };
}

// ──────────────────────────────────────────────────────────────
// SCT – Sentence Completion Scoring
// ──────────────────────────────────────────────────────────────
export function scoreSCTResponse(
  response: TestResponse,
  stemId: string,
  category: SCTScoring["category"]
): SCTScoring {
  const text = response.response.toLowerCase().trim();

  let tone: SCTScoring["tone"] = "neutral";
  const posWords = ["love", "happy", "good", "great", "enjoy", "proud", "wonderful", "beautiful", "strong"];
  const negWords = ["hate", "angry", "sad", "afraid", "hurt", "terrible", "awful", "ashamed", "weak", "lonely", "scared", "bad", "never"];
  const posCount = posWords.filter((w) => text.includes(w)).length;
  const negCount = negWords.filter((w) => text.includes(w)).length;
  if (posCount > 0 && negCount > 0) tone = "ambivalent";
  else if (posCount > negCount) tone = "positive";
  else if (negCount > posCount) tone = "negative";

  let completeness: SCTScoring["completeness"] = "complete";
  if (!text || text === "...") completeness = "blank";
  else if (text.length < 5) completeness = "evasive";
  else if (text.endsWith("...") || text.includes("i don't know")) completeness = "partial";

  const conflictMarkers: string[] = [];
  if (hasKeyword(text, ["but", "however", "although", "even though"])) conflictMarkers.push("Ambivalence");
  if (hasKeyword(text, ["never", "always", "everyone", "nobody"])) conflictMarkers.push("Absolutist thinking");
  if (hasKeyword(text, ["should", "must", "have to"])) conflictMarkers.push("Superego pressure");
  if (hasKeyword(text, ["wish", "if only", "hope"])) conflictMarkers.push("Unfulfilled desire");
  if (hasKeyword(text, ["can't", "unable", "impossible"])) conflictMarkers.push("Helplessness");

  const themes: string[] = [];
  if (hasKeyword(text, ["mother", "father", "parent", "family"])) themes.push("Family");
  if (hasKeyword(text, ["friend", "people", "social"])) themes.push("Social");
  if (hasKeyword(text, ["work", "job", "career", "success"])) themes.push("Achievement");
  if (hasKeyword(text, ["fear", "afraid", "scared", "worry"])) themes.push("Anxiety");
  if (hasKeyword(text, ["guilt", "sorry", "mistake", "wrong"])) themes.push("Guilt");
  if (hasKeyword(text, ["love", "relationship", "partner"])) themes.push("Intimacy");
  if (themes.length === 0) themes.push("General");

  return {
    responseId: response.id,
    stemId,
    category,
    tone,
    completeness,
    conflictMarkers,
    latencyMs: response.latencyMs ?? 0,
    themes,
  };
}

// ──────────────────────────────────────────────────────────────
// DAP – Draw-A-Person Scoring
// ──────────────────────────────────────────────────────────────
export function scoreDAPResponse(response: TestResponse, drawingType: DAPScoring["drawingType"]): DAPScoring {
  const text = response.response.toLowerCase();

  // These would normally come from image analysis; here we infer from the
  // therapist's descriptive notes about the drawing.
  let figureSize: DAPScoring["figureSize"] = "average";
  if (hasKeyword(text, ["small", "tiny", "miniature"])) figureSize = "small";
  else if (hasKeyword(text, ["large", "big", "fills"])) figureSize = "large";
  else if (hasKeyword(text, ["fills page", "entire page"])) figureSize = "fills_page";

  let placement: DAPScoring["placement"] = "center";
  if (hasKeyword(text, ["top", "upper"])) placement = "top";
  else if (hasKeyword(text, ["bottom", "lower"])) placement = "bottom";
  else if (hasKeyword(text, ["left", "left side"])) placement = "left";
  else if (hasKeyword(text, ["right", "right side"])) placement = "right";
  else if (hasKeyword(text, ["corner"])) placement = "corner";

  let proportion: DAPScoring["proportion"] = "appropriate";
  if (hasKeyword(text, ["big head", "large head"])) proportion = "exaggerated_head";
  else if (hasKeyword(text, ["long arms", "long legs", "big hands"])) proportion = "exaggerated_limbs";
  else if (hasKeyword(text, ["small head", "tiny head"])) proportion = "small_head";
  else if (hasKeyword(text, ["disproportionate", "distorted", "uneven"])) proportion = "distorted";

  let linePressure: DAPScoring["linePressure"] = "normal";
  if (hasKeyword(text, ["light", "faint", "barely visible"])) linePressure = "light";
  else if (hasKeyword(text, ["heavy", "dark", "pressed hard", "bold"])) linePressure = "heavy";
  else if (hasKeyword(text, ["variable", "uneven pressure"])) linePressure = "variable";

  const missingParts: string[] = [];
  if (hasKeyword(text, ["no hands", "missing hands", "without hands"])) missingParts.push("Hands");
  if (hasKeyword(text, ["no eyes", "missing eyes"])) missingParts.push("Eyes");
  if (hasKeyword(text, ["no mouth", "missing mouth"])) missingParts.push("Mouth");
  if (hasKeyword(text, ["no feet", "missing feet"])) missingParts.push("Feet");
  if (hasKeyword(text, ["no arms", "missing arms"])) missingParts.push("Arms");
  if (hasKeyword(text, ["no nose", "missing nose"])) missingParts.push("Nose");
  if (hasKeyword(text, ["no ears", "missing ears"])) missingParts.push("Ears");
  if (hasKeyword(text, ["no body", "stick figure"])) missingParts.push("Body detail");

  let perspective: DAPScoring["perspective"] = "front";
  if (hasKeyword(text, ["profile", "side view", "side"])) perspective = "profile";
  else if (hasKeyword(text, ["back", "turned away"])) perspective = "back";

  const details: string[] = [];
  if (hasKeyword(text, ["detailed", "elaborate", "accessories"])) details.push("High detail");
  if (hasKeyword(text, ["clothing", "dressed", "clothes"])) details.push("Clothing present");
  if (hasKeyword(text, ["facial features", "expression"])) details.push("Facial expression");
  if (hasKeyword(text, ["ground line", "baseline"])) details.push("Ground line");
  if (hasKeyword(text, ["background", "scenery"])) details.push("Environmental context");

  const symbolicIndicators: string[] = [];
  if (figureSize === "small") symbolicIndicators.push("Low self-esteem or insecurity");
  if (figureSize === "fills_page") symbolicIndicators.push("Grandiosity or need for control");
  if (placement === "top") symbolicIndicators.push("Fantasy orientation or optimism");
  if (placement === "bottom") symbolicIndicators.push("Concrete thinking or depression");
  if (placement === "corner") symbolicIndicators.push("Withdrawal or anxiety");
  if (linePressure === "heavy") symbolicIndicators.push("Tension, aggression, or assertiveness");
  if (linePressure === "light") symbolicIndicators.push("Insecurity, timidity, or low energy");
  if (missingParts.includes("Hands")) symbolicIndicators.push("Difficulty with agency or control");
  if (missingParts.includes("Eyes")) symbolicIndicators.push("Avoidance of social contact");
  if (missingParts.includes("Mouth")) symbolicIndicators.push("Difficulty with communication");
  if (proportion === "exaggerated_head") symbolicIndicators.push("Intellectual preoccupation");
  if (perspective === "back") symbolicIndicators.push("Withdrawal or avoidance");
  if (perspective === "profile") symbolicIndicators.push("Evasiveness or guardedness");

  return {
    responseId: response.id,
    drawingType,
    figureSize,
    placement,
    proportion,
    linePressure,
    missingParts,
    perspective,
    details,
    symbolicIndicators,
  };
}
