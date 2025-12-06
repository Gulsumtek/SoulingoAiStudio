export interface UserProfile {
  originalImage: string; // Base64
  avatarImage: string; // Base64 or URL
  gender: 'male' | 'female' | 'neutral';
  ageRange: string;
  voiceName: string;
}

export interface FeedbackResult {
  score: number;
  mispronounced: string[];
  feedback: string;
}

export enum AppState {
  INTRO = 'INTRO',
  CAMERA = 'CAMERA',
  ANALYZING_USER = 'ANALYZING_USER',
  COURSE_SELECT = 'COURSE_SELECT',
  PRACTICE = 'PRACTICE',
}

export type EnglishLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface PracticeSentence {
  id: string;
  text: string;
  level: EnglishLevel;
}

export interface UserProgress {
  completedSentences: Record<string, number>; // sentenceId -> highScore
  unlockedLevels: EnglishLevel[];
}

export const COURSES: Record<EnglishLevel, PracticeSentence[]> = {
  'A1': [
    { id: 'a1_1', text: "Hello, how are you today?", level: 'A1' },
    { id: 'a1_2', text: "I would like a cup of coffee.", level: 'A1' },
    { id: 'a1_3', text: "My name is John and I am happy.", level: 'A1' },
    { id: 'a1_4', text: "The cat is sleeping on the bed.", level: 'A1' },
    { id: 'a1_5', text: "Where is the nearest bus station?", level: 'A1' },
  ],
  'A2': [
    { id: 'a2_1', text: "I usually go to the gym on Mondays.", level: 'A2' },
    { id: 'a2_2', text: "Did you enjoy the movie last night?", level: 'A2' },
    { id: 'a2_3', text: "She has been working here for two years.", level: 'A2' },
    { id: 'a2_4', text: "Can you tell me how to get to the museum?", level: 'A2' },
    { id: 'a2_5', text: "It is important to eat vegetables every day.", level: 'A2' },
  ],
  'B1': [
    { id: 'b1_1', text: "If I had more time, I would travel the world.", level: 'B1' },
    { id: 'b1_2', text: "The environmental impact of plastic is concerning.", level: 'B1' },
    { id: 'b1_3', text: "Innovation distinguishes between a leader and a follower.", level: 'B1' },
    { id: 'b1_4', text: "Although the project was ambitious, we finished on time.", level: 'B1' },
    { id: 'b1_5', text: "Technology has changed the way we communicate forever.", level: 'B1' },
  ],
  'B2': [
    { id: 'b2_1', text: "The rapid expansion of urban areas poses significant challenges.", level: 'B2' },
    { id: 'b2_2', text: "Despite the bad weather, the outdoor concert was a resounding success.", level: 'B2' },
    { id: 'b2_3', text: "I would rather you didn't smoke in here, as I am allergic to it.", level: 'B2' },
    { id: 'b2_4', text: "She managed to complete the marathon, which was quite an achievement.", level: 'B2' },
    { id: 'b2_5', text: "It is generally believed that education is the key to a prosperous society.", level: 'B2' },
  ],
  'C1': [
    { id: 'c1_1', text: "The subtleties of the author's argument were lost on the casual reader.", level: 'C1' },
    { id: 'c1_2', text: "Had I known about the logistics beforehand, I might have reconsidered.", level: 'C1' },
    { id: 'c1_3', text: "The protagonist's internal conflict mirrors the societal unrest of the era.", level: 'C1' },
    { id: 'c1_4', text: "Scientific consensus suggests that immediate action is required to mitigate effects.", level: 'C1' },
    { id: 'c1_5', text: "Scarcely had we arrived at the venue when the keynote speaker began his address.", level: 'C1' },
  ],
  'C2': [
    { id: 'c2_1', text: "The dichotomy between theory and practice is nowhere more evident than in this case.", level: 'C2' },
    { id: 'c2_2', text: "Her eloquent speech was a testament to her profound understanding of the landscape.", level: 'C2' },
    { id: 'c2_3', text: "Notwithstanding the formidable obstacles, the team persevered with unwavering determination.", level: 'C2' },
    { id: 'c2_4', text: "The intricate tapestry of cultural influences is woven into every aspect of the architecture.", level: 'C2' },
    { id: 'c2_5', text: "To insinuate that his motives were anything less than altruistic is a gross misrepresentation.", level: 'C2' },
  ]
};

// Flattened list for legacy support or easy access if needed
export const ALL_SENTENCES = [
    ...COURSES.A1, ...COURSES.A2, ...COURSES.B1,
    ...COURSES.B2, ...COURSES.C1, ...COURSES.C2
];