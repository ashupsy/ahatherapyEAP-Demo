// ============================================================
// Test Stimuli & Sentence Stems for All Projective Tests
// ============================================================

export const rorschachCards = [
  { id: 1, label: "Card I", description: "Bilateral symmetrical inkblot – achromatic", instruction: "What might this be?" },
  { id: 2, label: "Card II", description: "Bilateral inkblot with red areas", instruction: "What might this be?" },
  { id: 3, label: "Card III", description: "Bilateral inkblot with red areas – human-like figures", instruction: "What might this be?" },
  { id: 4, label: "Card IV", description: "Large dark achromatic inkblot", instruction: "What might this be?" },
  { id: 5, label: "Card V", description: "Bilateral achromatic inkblot – bat-like", instruction: "What might this be?" },
  { id: 6, label: "Card VI", description: "Achromatic inkblot with textural qualities", instruction: "What might this be?" },
  { id: 7, label: "Card VII", description: "Bilateral achromatic inkblot – face-like", instruction: "What might this be?" },
  { id: 8, label: "Card VIII", description: "First fully chromatic card – multicolored", instruction: "What might this be?" },
  { id: 9, label: "Card IX", description: "Complex chromatic inkblot", instruction: "What might this be?" },
  { id: 10, label: "Card X", description: "Complex multicolored inkblot – multiple separate areas", instruction: "What might this be?" },
];

export const tatCards = [
  { id: "1", label: "Card 1", description: "A young boy contemplating a violin resting on a table in front of him." },
  { id: "2", label: "Card 2", description: "A country scene – young woman in foreground with books, man working field, older woman watching." },
  { id: "3BM", label: "Card 3BM", description: "A figure huddled on the floor beside a couch, with an ambiguous object nearby." },
  { id: "3GF", label: "Card 3GF", description: "A young woman standing with downcast head, face covered with right hand." },
  { id: "4", label: "Card 4", description: "A woman clutching the shoulders of a man whose face and body are averted." },
  { id: "5", label: "Card 5", description: "A middle-aged woman standing in a doorway of a half-opened door looking into a room." },
  { id: "6BM", label: "Card 6BM", description: "A short elderly woman standing with her back turned to a tall young man." },
  { id: "6GF", label: "Card 6GF", description: "A young woman sitting on the edge of a sofa looking back over her shoulder at an older man." },
  { id: "7BM", label: "Card 7BM", description: "An older and younger man looking at each other – grey-haired man, younger man." },
  { id: "7GF", label: "Card 7GF", description: "An older woman sitting on a sofa beside a girl, speaking or reading to the girl holding a doll." },
  { id: "8BM", label: "Card 8BM", description: "An adolescent boy in foreground, surgical scene dimly visible in background." },
  { id: "9GF", label: "Card 9GF", description: "A young woman with a magazine and purse running along a beach, another young woman behind a tree." },
  { id: "10", label: "Card 10", description: "A young woman's head against a man's shoulder." },
  { id: "11", label: "Card 11", description: "A road skirting a deep chasm between high cliffs, obscure figures on the cliff." },
  { id: "12M", label: "Card 12M", description: "A young man lying on a couch with his eyes closed, an older man leaning over him with hand stretched out." },
  { id: "13MF", label: "Card 13MF", description: "A young man standing with downcast head buried in his arm. Behind – a woman lying in bed." },
  { id: "14", label: "Card 14", description: "A silhouette of a figure against a bright window." },
  { id: "15", label: "Card 15", description: "A gaunt man with clenched hands standing among gravestones." },
  { id: "16", label: "Card 16 (Blank)", description: "A completely blank white card." },
  { id: "20", label: "Card 20", description: "A dimly illuminated figure of a person leaning against a lamp post in the dark." },
];

export const sctStems = [
  // Family
  { id: "F1", stem: "My mother always...", category: "family" as const },
  { id: "F2", stem: "When I was a child, my family...", category: "family" as const },
  { id: "F3", stem: "My father...", category: "family" as const },
  { id: "F4", stem: "My family treats me like...", category: "family" as const },
  { id: "F5", stem: "If my parents only knew...", category: "family" as const },

  // Authority
  { id: "A1", stem: "Rules are...", category: "authority" as const },
  { id: "A2", stem: "People in authority...", category: "authority" as const },
  { id: "A3", stem: "When someone tells me what to do, I...", category: "authority" as const },
  { id: "A4", stem: "My teachers/supervisors...", category: "authority" as const },

  // Guilt
  { id: "G1", stem: "I feel guilty when...", category: "guilt" as const },
  { id: "G2", stem: "My worst mistake was...", category: "guilt" as const },
  { id: "G3", stem: "If I could undo one thing...", category: "guilt" as const },
  { id: "G4", stem: "I am ashamed of...", category: "guilt" as const },

  // Sexuality
  { id: "S1", stem: "Intimacy is...", category: "sexuality" as const },
  { id: "S2", stem: "When I think about relationships...", category: "sexuality" as const },
  { id: "S3", stem: "My body...", category: "sexuality" as const },

  // Self-worth
  { id: "SW1", stem: "I am...", category: "self_worth" as const },
  { id: "SW2", stem: "My greatest strength is...", category: "self_worth" as const },
  { id: "SW3", stem: "I secretly feel...", category: "self_worth" as const },
  { id: "SW4", stem: "When I look in the mirror...", category: "self_worth" as const },
  { id: "SW5", stem: "People think I am...", category: "self_worth" as const },

  // Interpersonal
  { id: "I1", stem: "My friends...", category: "interpersonal" as const },
  { id: "I2", stem: "When I meet new people...", category: "interpersonal" as const },
  { id: "I3", stem: "I get angry when...", category: "interpersonal" as const },
  { id: "I4", stem: "The people around me...", category: "interpersonal" as const },

  // Fears
  { id: "FE1", stem: "I am afraid of...", category: "fears" as const },
  { id: "FE2", stem: "My worst fear is...", category: "fears" as const },
  { id: "FE3", stem: "At night I think about...", category: "fears" as const },

  // Goals
  { id: "GO1", stem: "In the future, I hope to...", category: "goals" as const },
  { id: "GO2", stem: "My biggest dream is...", category: "goals" as const },
  { id: "GO3", stem: "If I had more time, I would...", category: "goals" as const },
  { id: "GO4", stem: "Success means...", category: "goals" as const },
];

export const dapInstructions = [
  { id: "person", label: "Draw a Person", instruction: "Please draw a whole person. It can be any kind of person you want. Take your time and draw the best person you can." },
  { id: "opposite_sex", label: "Draw a Person of Opposite Sex", instruction: "Now please draw a person of the opposite sex from the one you just drew." },
  { id: "self", label: "Draw Yourself", instruction: "Now please draw a picture of yourself." },
  { id: "house", label: "Draw a House (HTP)", instruction: "Please draw a house. It can be any kind of house you want." },
  { id: "tree", label: "Draw a Tree (HTP)", instruction: "Please draw a tree. It can be any kind of tree you want." },
];

export const testInstructions: Record<string, { title: string; overview: string; instructions: string[] }> = {
  rorschach: {
    title: "Rorschach Inkblot Test",
    overview: "The Rorschach test uses ten standardized inkblot images. The client is asked to describe what they see in each inkblot. There are no right or wrong answers.",
    instructions: [
      "Present each card one at a time in numerical order.",
      "Ask the client: \"What might this be?\"",
      "Record all responses verbatim, including pauses and spontaneous comments.",
      "Note the response time and card rotation.",
      "After the Free Association phase, conduct the Inquiry phase to clarify location and determinants.",
      "Scoring follows Exner's Comprehensive System.",
    ],
  },
  tat: {
    title: "Thematic Apperception Test (TAT)",
    overview: "The TAT presents ambiguous pictures and asks the client to create a story about each one, revealing unconscious motivations, conflicts, and emotional patterns.",
    instructions: [
      "Select 8–12 cards appropriate for the client's age and gender.",
      "Present one card at a time.",
      "Ask the client to tell a story: What is happening? What led up to this? What are the characters feeling? What will happen next?",
      "Allow the client to speak freely; note latency and emotional reactions.",
      "Record the complete narrative verbatim.",
      "Stories are analyzed for needs, press, themes, defenses, and object relations.",
    ],
  },
  sct: {
    title: "Sentence Completion Test (SCT)",
    overview: "The client is given sentence stems and asked to complete them. Responses reveal attitudes, conflicts, and emotional patterns across life domains.",
    instructions: [
      "Present sentence stems one at a time.",
      "Ask the client to complete each sentence with the first thing that comes to mind.",
      "Note response latency — delays may indicate areas of conflict.",
      "Record completions verbatim.",
      "Analyze responses for tone, themes, conflict markers, and completeness.",
      "Categories include: Family, Authority, Guilt, Sexuality, Self-Worth, Interpersonal, Fears, Goals.",
    ],
  },
  dap: {
    title: "Draw-A-Person / House-Tree-Person (DAP/HTP)",
    overview: "Drawing tests allow the client to express feelings, conflicts, and self-perception through their drawings. Symbolic and structural analysis reveals psychological dynamics.",
    instructions: [
      "Provide blank paper and pencils (erasers optional based on protocol).",
      "Ask the client to draw a whole person first, then a person of the opposite sex, and finally themselves.",
      "For HTP: additionally ask for a house drawing and a tree drawing.",
      "Note drawing time, erasures, spontaneous comments, and sequence.",
      "Upload or scan the drawing for analysis.",
      "Analyze: figure size, placement, proportion, line pressure, missing parts, symbolic indicators.",
    ],
  },
};
