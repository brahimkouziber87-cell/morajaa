export type CycleId = 'college' | 'lycee';

export type LevelId = 
  // Collège
  | '1ac' 
  | '2ac' 
  | '3ac'
  // Lycée
  | 'tc' 
  | '1bac' 
  | '2bac';

export type StreamId = 
  | 'general'       // Collège
  | 'tc_sciences'   // Tronc Commun Scientifique & Tech
  | 'tc_lettres'    // Tronc Commun Lettres
  | '1bac_sm'       // 1ère Bac Sciences Mathématiques
  | '1bac_se'       // 1ère Bac Sciences Expérimentales
  | '1bac_eco'      // 1ère Bac Sciences Économiques
  | '1bac_lit'      // 1ère Bac Lettres
  | '2bac_sm'       // 2ème Bac Sciences Mathématiques A & B
  | '2bac_pc'       // 2ème Bac Sciences Physiques - Chimie
  | '2bac_svt'      // 2ème Bac Sciences de la Vie et de la Terre
  | '2bac_eco';     // 2ème Bac Sciences Économiques & Gestion

export type LanguageOption = 'ar' | 'biof';

export type MathDomain = 
  | 'arithmetic_algebra' // الحساب والجبر
  | 'analysis_functions' // التحليل والدوال
  | 'geometry_trig'      // الهندسة والحساب المثلثي
  | 'probability_stats'; // الاحتمالات والإحصاء

export type Competency = 
  | 'restitution'        // استرداد المعارف والتعاريف
  | 'application'        // التطبيق المباشر للقواعد
  | 'reasoning'          // الاستدلال والبرهان الرياضي
  | 'problem_solving';   // حل المسائل والنمذجة

export interface LocalizedString {
  ar: string;
  biof: string;
}

export interface Question {
  id: string;
  levelId: LevelId;
  streams: StreamId[];
  domain: MathDomain;
  competency: Competency;
  title: LocalizedString;
  statement: LocalizedString;
  formula?: string; // Visual LaTeX-like or math representation
  options: LocalizedString[];
  correctIndex: number;
  hint?: LocalizedString;
  explanation: LocalizedString;
  inspectorTip: LocalizedString;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StepErrorPitfall {
  id: string;
  levelId: LevelId;
  streams: StreamId[];
  domain: MathDomain;
  title: LocalizedString;
  context: LocalizedString;
  problem: LocalizedString;
  steps: {
    line: number;
    text: LocalizedString;
    formula?: string;
    isError: boolean;
    inspectorObservation?: LocalizedString;
  }[];
  misconceptionExplanation: LocalizedString;
  correctCorrection: LocalizedString;
  didacticRecommendation: LocalizedString;
}

export interface MissedQuestionRecord {
  question: Question;
  wrongAttempts: number;
  lastMissedAt: string;
}

export type PlayerClassId = 'algebraist' | 'geometer' | 'analyst' | 'statistician';

export interface PlayerClassConfig {
  id: PlayerClassId;
  name: LocalizedString;
  title: LocalizedString;
  icon: string;
  perk: LocalizedString;
  bonusDomain: MathDomain;
  color: string;
}

export interface SkillNode {
  id: string;
  levelId: LevelId;
  domain: MathDomain;
  title: LocalizedString;
  description: LocalizedString;
  prerequisites: string[];
  icon: string;
  minMasteryStars: number;
  formulaSample?: string;
}

export interface UserStats {
  xp: number;
  score: number;
  streak: number;
  maxStreak: number;
  solvedCount: number;
  correctCount: number;
  dailyGoal: number;
  dailySolvedCount: number;
  pitfallsFound: number;
  competencyScores: Record<Competency, { correct: number; total: number }>;
  domainScores: Record<MathDomain, { correct: number; total: number }>;
  dailyActivityHistory?: Record<string, { solved: number; correct: number }>;
  missedQuestions?: MissedQuestionRecord[];
  remediatedCount?: number;
  playerClass?: PlayerClassId;
  masteredSkills?: Record<string, number>; // skillNodeId -> starCount (0 to 3)
}

export interface InspectorReview {
  overallRankTitle: LocalizedString;
  diagnosticGrade: number; // out of 20 (Moroccan system)
  pedagogicalObservation: LocalizedString;
  strengths: LocalizedString[];
  weaknesses: LocalizedString[];
  officialInspectorAdvice: LocalizedString;
}

export interface MistakeDiagnosisStep {
  stepTitle: LocalizedString;
  explanation: LocalizedString;
  formulaLatex: string;
}

export interface QuestionMistakeDiagnosis {
  questionId: string;
  questionTitle: LocalizedString;
  conceptName: LocalizedString;
  whyStruggled: LocalizedString;
  misconceptionTrap: LocalizedString;
  keyTakeawayRule: LocalizedString;
  stepByStepWalkthrough: MistakeDiagnosisStep[];
}

export interface MistakeDiagnosisReport {
  analyzedCount: number;
  generatedAtISO: string;
  model: string;
  executiveSummary: LocalizedString;
  rootCausePattern: LocalizedString;
  priorityConcept: LocalizedString;
  questionDiagnoses: QuestionMistakeDiagnosis[];
  actionableStudyPlan: LocalizedString[];
}

