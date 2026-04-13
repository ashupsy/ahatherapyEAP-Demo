// ============================================================
// Interpretation Engine – psychodynamic formulation, cross-test
// analysis, diagnostic hypotheses, cultural context mapping
// ============================================================

import type {
  ClientProfile,
  RorschachStructuralSummary,
  RorschachScoring,
  TATScoring,
  SCTScoring,
  DAPScoring,
  TestInterpretation,
  CrossTestAnalysis,
} from "@/types";

// ──────────────────────────────────────────────────────────────
// Rorschach Interpretation
// ──────────────────────────────────────────────────────────────
export function interpretRorschach(
  scorings: RorschachScoring[],
  summary: RorschachStructuralSummary,
  client: ClientProfile
): TestInterpretation {
  const findings: string[] = [];
  const hypotheses: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Cognitive processing
  if (summary.lambda > 1.0) {
    findings.push("Elevated Lambda indicates an avoidant or simplistic approach to complexity.");
    concerns.push("Tendency to oversimplify emotional experiences.");
  } else if (summary.lambda < 0.3) {
    findings.push("Low Lambda suggests the individual is flooded by stimulus complexity.");
    concerns.push("Difficulty managing emotional input — risk of overwhelm.");
  }

  if (summary.W > summary.D_loc + summary.Dd) {
    findings.push("Whole responses predominate, indicating a global, integrative cognitive style.");
    strengths.push("Strong capacity for holistic/synthetic thinking.");
  }

  // Affect
  if (summary.WSumC > summary.M + 1) {
    findings.push("WSumC > M: Extratensive experience style — affect-driven decision-making.");
  } else if (summary.M > summary.WSumC + 1) {
    findings.push("M > WSumC: Introversive style — preference for internal deliberation.");
    strengths.push("Reflective and introspective approach to problems.");
  }

  if (summary.Afr < 0.4) {
    findings.push("Low Affective Ratio (Afr) suggests avoidance of emotionally stimulating situations.");
    concerns.push("Emotional withdrawal or constriction.");
  }

  // Self-perception
  if (summary.FQMinus / summary.R > 0.25) {
    findings.push("High proportion of FQ- responses indicates perceptual distortion or idiosyncratic thinking.");
    concerns.push("Possible thought disorder or reality testing impairment.");
    hypotheses.push("Rule out perceptual-thinking disorder (PTI elevated).");
  }

  // Interpersonal
  const COP = scorings.filter((s) => s.specialScores.includes("COP")).length;
  const AG = scorings.filter((s) => s.specialScores.includes("AG")).length;
  if (COP > AG) {
    strengths.push("Positive interpersonal expectation — cooperative relational style.");
  } else if (AG > COP) {
    findings.push("Aggressive content exceeds cooperative content.");
    concerns.push("Hostile or competitive interpersonal stance.");
  }

  // Stress
  if (summary.D < -1) {
    findings.push("Negative D score indicates current stress exceeds available resources.");
    concerns.push("Vulnerability to impulsive behavior under stress.");
  }
  if (summary.Adj_D < -1) {
    findings.push("Negative Adjusted D score reflects chronic resource deficit.");
    hypotheses.push("Consider anxiety or depressive spectrum disorder.");
  }

  // Depression index
  if (summary.DEPI >= 5) {
    findings.push(`DEPI index = ${summary.DEPI} (elevated) — significant depressive features.`);
    hypotheses.push("Major Depressive Disorder or Persistent Depressive Disorder.");
    recommendations.push("Administer BDI-II or PHQ-9 for symptom severity quantification.");
  }

  // Suicide constellation
  if (summary.S_CON >= 8) {
    findings.push("Suicide Constellation is elevated — risk screening required.");
    concerns.push("CRITICAL: Elevated suicide risk indicators.");
    recommendations.push("Immediate safety assessment and risk management protocol.");
  }

  const MOR = scorings.filter((s) => s.specialScores.includes("MOR")).length;
  if (MOR >= 3) {
    findings.push("Elevated Morbid content suggests pessimistic self-image and damaged body image.");
  }

  if (summary.isolateIndex > 0.25) {
    findings.push("Elevated Isolation Index indicates social withdrawal.");
    concerns.push("Social isolation or alienation.");
  }

  if (findings.length === 0) {
    findings.push("Response profile falls within normal limits.");
    strengths.push("Adequate reality testing and cognitive processing.");
  }

  recommendations.push("Integrate Rorschach findings with clinical interview and history.");

  const formulation = `This individual presents with ${summary.M > summary.WSumC ? "an introversive" : "an extratensive"} experience style (EB = ${summary.erpiRatio}). ` +
    `Cognitive processing is ${summary.lambda > 1 ? "avoidantly simplified" : summary.lambda < 0.3 ? "complex and potentially overwhelmed" : "adequately flexible"}. ` +
    `Affective modulation is ${summary.Afr < 0.4 ? "constricted" : summary.Afr > 0.8 ? "emotionally responsive" : "within expected range"}. ` +
    `Self-perception ${summary.FQMinus / summary.R > 0.2 ? "shows distortion" : "is generally accurate"}, ` +
    `and interpersonal functioning is ${COP > AG ? "cooperative" : AG > COP ? "marked by aggression" : "neutral"}.`;

  return {
    sessionId: "",
    testType: "rorschach",
    summary: `Rorschach (Exner CS) – ${summary.R} responses scored. Key structural variables: EB=${summary.erpiRatio}, Lambda=${summary.lambda.toFixed(2)}, D=${summary.D}.`,
    keyFindings: findings,
    diagnosticHypotheses: hypotheses,
    strengthsIdentified: strengths,
    areasOfConcern: concerns,
    psychodynamicFormulation: formulation,
    culturalConsiderations: generateCulturalContext(client, "rorschach"),
    recommendations,
  };
}

// ──────────────────────────────────────────────────────────────
// TAT Interpretation
// ──────────────────────────────────────────────────────────────
export function interpretTAT(scorings: TATScoring[], client: ClientProfile): TestInterpretation {
  const findings: string[] = [];
  const hypotheses: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // Aggregate needs
  const needCounts: Record<string, number> = {};
  scorings.forEach((s) => s.needs.forEach((n) => { needCounts[n] = (needCounts[n] || 0) + 1; }));
  const dominantNeeds = Object.entries(needCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  findings.push(`Dominant needs across stories: ${dominantNeeds.map(([n, c]) => `${n} (${c})`).join(", ")}.`);

  // Aggregate press
  const pressCounts: Record<string, number> = {};
  scorings.forEach((s) => s.press.forEach((p) => { pressCounts[p] = (pressCounts[p] || 0) + 1; }));
  const dominantPress = Object.entries(pressCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  findings.push(`Dominant environmental press: ${dominantPress.map(([p, c]) => `${p} (${c})`).join(", ")}.`);

  // Affect tone distribution
  const tones = scorings.map((s) => s.affectTone);
  const negCount = tones.filter((t) => t === "negative").length;
  const posCount = tones.filter((t) => t === "positive").length;
  if (negCount > scorings.length * 0.6) {
    findings.push("Predominantly negative affect tone across stories.");
    concerns.push("Pervasive negative emotional outlook.");
    hypotheses.push("Dysthymia or major depressive features.");
  } else if (posCount > scorings.length * 0.6) {
    strengths.push("Generally positive emotional outlook across narratives.");
  }

  // Resolution patterns
  const maladaptive = scorings.filter((s) => s.resolution === "maladaptive").length;
  const adaptive = scorings.filter((s) => s.resolution === "adaptive").length;
  if (maladaptive > adaptive) {
    findings.push("Maladaptive resolutions predominate — characters fail to resolve conflicts.");
    concerns.push("Pessimistic expectations about problem-solving.");
    hypotheses.push("Learned helplessness pattern — consider depressive cognitions.");
  } else if (adaptive > maladaptive) {
    strengths.push("Characters tend toward adaptive resolution — positive coping outlook.");
  }

  // Defense patterns
  const defenseCounts: Record<string, number> = {};
  scorings.forEach((s) => s.defenses.forEach((d) => { defenseCounts[d] = (defenseCounts[d] || 0) + 1; }));
  const topDefenses = Object.entries(defenseCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  findings.push(`Primary defense mechanisms: ${topDefenses.map(([d]) => d).join(", ")}.`);

  // Object relations
  const disrupted = scorings.filter((s) => s.objectRelations.includes("Disrupted")).length;
  if (disrupted > scorings.length * 0.5) {
    findings.push("Majority of stories depict disrupted or conflictual object relations.");
    concerns.push("Difficulty forming or maintaining secure attachments.");
  }

  // Aggression need
  if (needCounts["Aggression"] && needCounts["Aggression"] > 2) {
    concerns.push("Elevated aggression themes across narratives.");
    recommendations.push("Assess anger management and risk of acting out.");
  }

  const formulation = `Thematic analysis reveals a pattern dominated by ${dominantNeeds[0]?.[0] ?? "varied"} needs ` +
    `against a backdrop of ${dominantPress[0]?.[0] ?? "varied"} environmental press. ` +
    `The ${negCount > posCount ? "negative" : "generally balanced"} affect tone and ` +
    `${maladaptive > adaptive ? "maladaptive" : "adaptive"} resolutions suggest ` +
    `${maladaptive > adaptive ? "pessimistic internal working models" : "adequate coping capacity"}. ` +
    `Defense style is predominantly ${topDefenses[0]?.[0] ?? "mixed"}, indicating ` +
    `${topDefenses[0]?.[0] === "Intellectualization" ? "affective distancing" : "emotionally reactive coping"}.`;

  recommendations.push("Correlate TAT themes with clinical history and Rorschach findings.");

  return {
    sessionId: "",
    testType: "tat",
    summary: `TAT – ${scorings.length} stories analyzed. Dominant need: ${dominantNeeds[0]?.[0] ?? "N/A"}, Dominant press: ${dominantPress[0]?.[0] ?? "N/A"}.`,
    keyFindings: findings,
    diagnosticHypotheses: hypotheses,
    strengthsIdentified: strengths,
    areasOfConcern: concerns,
    psychodynamicFormulation: formulation,
    culturalConsiderations: generateCulturalContext(client, "tat"),
    recommendations,
  };
}

// ──────────────────────────────────────────────────────────────
// SCT Interpretation
// ──────────────────────────────────────────────────────────────
export function interpretSCT(scorings: SCTScoring[], client: ClientProfile): TestInterpretation {
  const findings: string[] = [];
  const hypotheses: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  // By category
  const categories = ["family", "authority", "guilt", "sexuality", "self_worth", "interpersonal", "fears", "goals"] as const;
  for (const cat of categories) {
    const catScores = scorings.filter((s) => s.category === cat);
    if (catScores.length === 0) continue;
    const negCount = catScores.filter((s) => s.tone === "negative").length;
    const evasiveCount = catScores.filter((s) => s.completeness === "evasive" || s.completeness === "blank").length;
    const conflictCount = catScores.reduce((acc, s) => acc + s.conflictMarkers.length, 0);
    const label = cat.replace("_", " ");

    if (negCount > catScores.length * 0.5) {
      findings.push(`${label}: Predominantly negative tone — suggests conflictual attitudes in this domain.`);
      concerns.push(`Negative attitudes toward ${label}.`);
    } else if (negCount === 0 && catScores.length > 1) {
      strengths.push(`Positive orientation toward ${label}.`);
    }

    if (evasiveCount > 0) {
      findings.push(`${label}: ${evasiveCount} evasive/blank response(s) — possible avoidance or defensiveness.`);
    }

    if (conflictCount > catScores.length) {
      findings.push(`${label}: Multiple conflict markers detected.`);
    }
  }

  // Overall tone
  const allNeg = scorings.filter((s) => s.tone === "negative").length;
  const allPos = scorings.filter((s) => s.tone === "positive").length;
  if (allNeg > scorings.length * 0.5) {
    hypotheses.push("Pervasive negative self/world schema — rule out depressive disorder.");
  }
  if (allPos > scorings.length * 0.6) {
    strengths.push("Generally positive self-concept and outlook.");
  }

  // Latency analysis
  const avgLatency = scorings.reduce((a, s) => a + s.latencyMs, 0) / Math.max(scorings.length, 1);
  const highLatency = scorings.filter((s) => s.latencyMs > avgLatency * 1.5);
  if (highLatency.length > 0) {
    findings.push(`Elevated response latency on ${highLatency.length} stem(s) — possible emotional loading: ${highLatency.map((s) => s.stemId).join(", ")}.`);
  }

  // Conflict markers summary
  const allMarkers: Record<string, number> = {};
  scorings.forEach((s) => s.conflictMarkers.forEach((m) => { allMarkers[m] = (allMarkers[m] || 0) + 1; }));
  const topMarkers = Object.entries(allMarkers).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (topMarkers.length > 0) {
    findings.push(`Primary conflict markers: ${topMarkers.map(([m, c]) => `${m} (${c})`).join(", ")}.`);
  }

  const formulation = `Sentence completion responses reveal ${allNeg > allPos ? "predominantly negative" : "balanced"} attitudes ` +
    `across life domains. ${concerns.length > 0 ? `Areas of particular concern include ${concerns.slice(0, 2).join(" and ")}. ` : ""}` +
    `${topMarkers[0] ? `The most frequent conflict marker is ${topMarkers[0][0]}, suggesting ${topMarkers[0][0] === "Absolutist thinking" ? "rigid cognitive patterns" : topMarkers[0][0] === "Helplessness" ? "feelings of powerlessness" : "internal tension"}. ` : ""}` +
    `Response completeness and latency patterns ${highLatency.length > 3 ? "suggest significant emotional guarding" : "are within normal limits"}.`;

  recommendations.push("Explore flagged categories in subsequent therapy sessions.");

  return {
    sessionId: "",
    testType: "sct",
    summary: `SCT – ${scorings.length} stems completed. Overall tone: ${allNeg > allPos ? "negative" : allPos > allNeg ? "positive" : "mixed"}.`,
    keyFindings: findings,
    diagnosticHypotheses: hypotheses,
    strengthsIdentified: strengths,
    areasOfConcern: concerns,
    psychodynamicFormulation: formulation,
    culturalConsiderations: generateCulturalContext(client, "sct"),
    recommendations,
  };
}

// ──────────────────────────────────────────────────────────────
// DAP Interpretation
// ──────────────────────────────────────────────────────────────
export function interpretDAP(scorings: DAPScoring[], client: ClientProfile): TestInterpretation {
  const findings: string[] = [];
  const hypotheses: string[] = [];
  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  for (const s of scorings) {
    const label = s.drawingType.replace("_", " ");
    findings.push(`[${label}] Size: ${s.figureSize}, Placement: ${s.placement}, Proportion: ${s.proportion}, Line pressure: ${s.linePressure}, Perspective: ${s.perspective}.`);

    if (s.missingParts.length > 0) {
      findings.push(`[${label}] Missing parts: ${s.missingParts.join(", ")}.`);
    }

    s.symbolicIndicators.forEach((ind) => {
      if (ind.toLowerCase().includes("low self-esteem") || ind.toLowerCase().includes("insecurity")) concerns.push(ind);
      else if (ind.toLowerCase().includes("aggression")) concerns.push(ind);
      else if (ind.toLowerCase().includes("withdrawal") || ind.toLowerCase().includes("avoidance")) concerns.push(ind);
    });

    if (s.details.length >= 3) strengths.push(`${label}: rich detail and elaboration.`);
    if (s.proportion === "appropriate" && s.linePressure === "normal") strengths.push(`${label}: adequate body image integration.`);
  }

  // Cross-drawing analysis
  const allMissing = scorings.flatMap((s) => s.missingParts);
  if (allMissing.includes("Hands") && allMissing.includes("Eyes")) {
    hypotheses.push("Combined omission of hands and eyes suggests withdrawal from social engagement and reduced sense of agency.");
  }

  const allSymbols = scorings.flatMap((s) => s.symbolicIndicators);
  const uniqueConcerns = [...new Set(concerns)];

  if (scorings.some((s) => s.figureSize === "small" && s.placement === "corner")) {
    hypotheses.push("Small figure in corner: significant feelings of inadequacy and social withdrawal.");
    recommendations.push("Explore self-esteem and social anxiety in therapy.");
  }

  if (scorings.some((s) => s.linePressure === "heavy")) {
    hypotheses.push("Heavy line pressure may indicate elevated tension, aggression, or assertiveness needs.");
  }

  const formulation = `Drawing analysis across ${scorings.length} production(s) reveals ` +
    `${uniqueConcerns.length > 2 ? "multiple areas of psychological concern" : "generally adequate self-representation"}. ` +
    `${allMissing.length > 0 ? `Omission of ${[...new Set(allMissing)].join(", ")} warrants clinical attention. ` : ""}` +
    `Line quality and placement patterns suggest ${allSymbols.some((s) => s.includes("anxiety")) ? "underlying anxiety" : "adequate ego functioning"}.`;

  recommendations.push("Consider follow-up with objective personality measures (MMPI-2, MCMI-IV).");

  return {
    sessionId: "",
    testType: "dap",
    summary: `DAP/HTP – ${scorings.length} drawing(s) analyzed. Key indicators: ${allSymbols.slice(0, 3).join("; ") || "within normal limits"}.`,
    keyFindings: findings,
    diagnosticHypotheses: hypotheses,
    strengthsIdentified: strengths,
    areasOfConcern: uniqueConcerns,
    psychodynamicFormulation: formulation,
    culturalConsiderations: generateCulturalContext(client, "dap"),
    recommendations,
  };
}

// ──────────────────────────────────────────────────────────────
// Cross-Test Integrated Analysis
// ──────────────────────────────────────────────────────────────
export function generateCrossTestAnalysis(
  interpretations: TestInterpretation[],
  client: ClientProfile
): CrossTestAnalysis {
  const allConcerns = interpretations.flatMap((i) => i.areasOfConcern);
  const allStrengths = interpretations.flatMap((i) => i.strengthsIdentified);
  const allHypotheses = interpretations.flatMap((i) => i.diagnosticHypotheses);
  const allRecommendations = interpretations.flatMap((i) => i.recommendations);

  // Find convergent findings (appear in 2+ tests)
  const findingCounts: Record<string, number> = {};
  const allFindings = interpretations.flatMap((i) => i.keyFindings);
  allFindings.forEach((f) => {
    const key = f.toLowerCase().slice(0, 40);
    findingCounts[key] = (findingCounts[key] || 0) + 1;
  });

  const convergent: string[] = [];
  const divergent: string[] = [];

  // Check for convergent themes
  const hasDep = allHypotheses.some((h) => h.toLowerCase().includes("depress"));
  const hasAnx = allConcerns.some((c) => c.toLowerCase().includes("anxi") || c.toLowerCase().includes("withdrawal"));
  const hasAgg = allConcerns.some((c) => c.toLowerCase().includes("aggress"));
  const hasRelational = allConcerns.some((c) => c.toLowerCase().includes("attachment") || c.toLowerCase().includes("interpersonal"));

  if (hasDep) convergent.push("Depressive features identified across multiple test modalities.");
  if (hasAnx) convergent.push("Anxiety or avoidance patterns converge across tests.");
  if (hasAgg) convergent.push("Aggression themes present in multiple assessments.");
  if (hasRelational) convergent.push("Interpersonal difficulties consistently noted.");

  // Check for divergent findings
  if (allStrengths.length > 0 && allConcerns.length > 0) {
    divergent.push("Coexistence of identified strengths and significant concerns suggests a nuanced clinical picture.");
  }

  const testsUsed = interpretations.map((i) => i.testType.toUpperCase()).join(", ");

  const integratedFormulation =
    `Integrated analysis across ${testsUsed} reveals a clinical picture characterized by ` +
    `${convergent.length > 0 ? convergent.join("; ") + ". " : "no strongly convergent patterns. "}` +
    `${client.referralReason ? `The referral concern of "${client.referralReason}" is ${hasDep || hasAnx ? "supported by test findings" : "partially addressed by current data"}. ` : ""}` +
    `From a psychodynamic perspective, the individual appears to employ ` +
    `${allConcerns.some((c) => c.includes("avoidance")) ? "avoidant" : "mixed"} defensive strategies, ` +
    `with ${allStrengths.length > allConcerns.length ? "more protective factors than risk factors" : "notable areas requiring clinical attention"}. ` +
    `Cultural considerations for a ${client.age}-year-old ${client.gender} ${client.culturalBackground ? `from a ${client.culturalBackground} background` : ""} ` +
    `should inform interpretation of projective material.`;

  const riskFactors = [...new Set(allConcerns)].slice(0, 6);
  const protectiveFactors = [...new Set(allStrengths)].slice(0, 6);

  return {
    clientId: client.id,
    sessions: [],
    convergentFindings: convergent,
    divergentFindings: divergent,
    integratedFormulation,
    diagnosticImpressions: [...new Set(allHypotheses)],
    riskFactors,
    protectiveFactors,
    treatmentRecommendations: [...new Set(allRecommendations)],
    furtherTestingSuggested: [
      "MMPI-2-RF for objective personality assessment",
      "BDI-II for depression severity",
      "BAI for anxiety symptom quantification",
      "WAIS-IV if cognitive concerns are present",
    ],
  };
}

// ──────────────────────────────────────────────────────────────
// Cultural Context Mapping
// ──────────────────────────────────────────────────────────────
function generateCulturalContext(client: ClientProfile, testType: string): string {
  const parts: string[] = [];

  parts.push(
    `Cultural context for a ${client.age}-year-old ${client.gender}` +
    `${client.culturalBackground ? ` identifying as ${client.culturalBackground}` : ""}` +
    `${client.occupation ? `, working as/studying ${client.occupation}` : ""}.`
  );

  if (testType === "rorschach") {
    parts.push("Normative data for the Rorschach varies cross-culturally. Form quality tables should reference culture-appropriate norms where available.");
    parts.push("Content involving culturally specific imagery (religious, folkloric) should not be scored as unusual without cultural context.");
  } else if (testType === "tat") {
    parts.push("TAT cards depict primarily Western cultural scenes. Story content may reflect cultural adaptation rather than psychopathology.");
    parts.push("Themes of family obligation, collectivism, or hierarchical relationships may be normative in many cultural contexts.");
  } else if (testType === "sct") {
    parts.push("Sentence completion norms vary by language and culture. Attitudes toward authority, family, and gender roles are culturally mediated.");
  } else if (testType === "dap") {
    parts.push("Drawing conventions (e.g., figure size, detail level) vary by cultural exposure and artistic training.");
    parts.push("Omission of features may reflect cultural drawing norms rather than psychological indicators.");
  }

  if (client.languages && client.languages.length > 1) {
    parts.push(`Multilingual client (${client.languages.join(", ")}). Language of test administration may affect response richness.`);
  }

  return parts.join(" ");
}
