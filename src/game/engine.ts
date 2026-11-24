import { 
  LevelId, 
  StreamId, 
  MathDomain, 
  Question, 
  UserStats, 
  Competency, 
  InspectorReview,
  StepErrorPitfall,
  LocalizedString
} from '../types/curriculum';
import { QUESTIONS_DATABASE, LEVELS, DOMAINS } from './curriculumData';
import { PITFALLS_DATABASE } from './pitfallsData';
import {
  CURRICULUM_TOPICS_DATABASE,
  GLOSSARY_DATABASE,
  CurriculumTopicTemplate,
  StudyPlanItem,
  DayOfWeekId
} from '../constants/glossaryAndPlannerData';
import { LESSONS_DATABASE } from '../constants/dataStructure';
import { SKILL_TREE_DATABASE } from '../data/rpgClassesAndSkills';

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  levelId: LevelId;
  streamId: StreamId;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeRemainingSec: number;
  dateISO: string;
  isCurrentUser?: boolean;
}

export interface StudentBadge {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  requirementText: LocalizedString;
  unlocked: boolean;
  progressPct: number;
  currentValue: number;
  targetValue: number;
}

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    studentName: 'أمينة العلمي (Amina El Alami)',
    levelId: '2bac',
    streamId: '2bac_sm',
    score: 345,
    correctCount: 10,
    totalQuestions: 10,
    timeRemainingSec: 42,
    dateISO: '2026-11-05'
  },
  {
    id: 'lb-2',
    studentName: 'يوسف بنعلي (Youssef Benali)',
    levelId: '2bac',
    streamId: '2bac_pc',
    score: 310,
    correctCount: 9,
    totalQuestions: 10,
    timeRemainingSec: 38,
    dateISO: '2026-11-06'
  },
  {
    id: 'lb-3',
    studentName: 'سلمى الإدريسي (Salma Idrissi)',
    levelId: '1bac',
    streamId: '1bac_sm',
    score: 285,
    correctCount: 9,
    totalQuestions: 10,
    timeRemainingSec: 29,
    dateISO: '2026-11-06'
  },
  {
    id: 'lb-4',
    studentName: 'ريان التازي (Rayane Tazi)',
    levelId: '3ac',
    streamId: 'general',
    score: 260,
    correctCount: 8,
    totalQuestions: 10,
    timeRemainingSec: 35,
    dateISO: '2026-11-07'
  },
  {
    id: 'lb-5',
    studentName: 'مريم الفاسي (Meriem El Fassi)',
    levelId: 'tc',
    streamId: 'tc_sciences',
    score: 235,
    correctCount: 8,
    totalQuestions: 10,
    timeRemainingSec: 21,
    dateISO: '2026-11-07'
  }
];

export function createInitialStats(): UserStats {
  return {
    xp: 0,
    score: 0,
    streak: 0,
    maxStreak: 0,
    solvedCount: 0,
    correctCount: 0,
    dailyGoal: 5,
    dailySolvedCount: 0,
    pitfallsFound: 0,
    competencyScores: {
      restitution: { correct: 0, total: 0 },
      application: { correct: 0, total: 0 },
      reasoning: { correct: 0, total: 0 },
      problem_solving: { correct: 0, total: 0 }
    },
    domainScores: {
      arithmetic_algebra: { correct: 0, total: 0 },
      analysis_functions: { correct: 0, total: 0 },
      geometry_trig: { correct: 0, total: 0 },
      probability_stats: { correct: 0, total: 0 }
    }
  };
}

export interface CumulativeLeaderboardEntry {
  id: string;
  studentName: string;
  levelId: LevelId;
  streamId: StreamId;
  cumulativeScore: number;
  xp: number;
  solvedCount: number;
  correctCount: number;
  badgesCount: number;
  unlockedBadgeTitles: string[];
  rankBadge: string;
  rankTitle: LocalizedString;
  dateISO: string;
  isCurrentUser?: boolean;
}

export const INITIAL_CUMULATIVE_LEADERBOARD: CumulativeLeaderboardEntry[] = [
  {
    id: 'clb-1',
    studentName: 'أمينة العلمي (Amina El Alami)',
    levelId: '2bac',
    streamId: '2bac_sm',
    cumulativeScore: 1420,
    xp: 2130,
    solvedCount: 52,
    correctCount: 49,
    badgesCount: 7,
    unlockedBadgeTitles: ['سيد المعادلات', 'خبير الدوال', 'سريع الحساب', 'درع التفوق الإشهادي', 'فارس السلسلة'],
    rankBadge: '🏆',
    rankTitle: { ar: 'بطل الأولمبياد الوطني', biof: 'Maître des Olympiades' },
    dateISO: '2026-11-06'
  },
  {
    id: 'clb-2',
    studentName: 'يوسف المنصوري (Youssef El Mansouri)',
    levelId: '2bac',
    streamId: '2bac_pc',
    cumulativeScore: 1280,
    xp: 1890,
    solvedCount: 46,
    correctCount: 42,
    badgesCount: 6,
    unlockedBadgeTitles: ['خبير الدوال', 'سريع الحساب', 'مهندس الفضاء', 'محقق الأخطاء'],
    rankBadge: '🎓',
    rankTitle: { ar: 'عبقري البكالوريا', biof: 'Génie du Bac' },
    dateISO: '2026-11-06'
  },
  {
    id: 'clb-3',
    studentName: 'سلمى الإدريسي (Salma Idrissi)',
    levelId: '1bac',
    streamId: '1bac_sm',
    cumulativeScore: 1150,
    xp: 1680,
    solvedCount: 41,
    correctCount: 38,
    badgesCount: 6,
    unlockedBadgeTitles: ['سيد المعادلات', 'سريع الحساب', 'خبير الدوال', 'فارس السلسلة'],
    rankBadge: '🎓',
    rankTitle: { ar: 'عبقري البكالوريا', biof: 'Génie du Bac' },
    dateISO: '2026-11-07'
  },
  {
    id: 'clb-4',
    studentName: 'رانيا التازي (Rania Tazi)',
    levelId: '2bac',
    streamId: '2bac_svt',
    cumulativeScore: 1020,
    xp: 1490,
    solvedCount: 38,
    correctCount: 34,
    badgesCount: 5,
    unlockedBadgeTitles: ['خبير الدوال', 'سريع الحساب', 'محقق الأخطاء'],
    rankBadge: '🎓',
    rankTitle: { ar: 'عبقري البكالوريا', biof: 'Génie du Bac' },
    dateISO: '2026-11-07'
  },
  {
    id: 'clb-5',
    studentName: 'المهدي بناني (Mehdi Bennani)',
    levelId: '3ac',
    streamId: 'general',
    cumulativeScore: 980,
    xp: 1420,
    solvedCount: 36,
    correctCount: 32,
    badgesCount: 5,
    unlockedBadgeTitles: ['سيد المعادلات', 'سريع الحساب', 'فارس السلسلة'],
    rankBadge: '⚔️',
    rankTitle: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' },
    dateISO: '2026-11-07'
  },
  {
    id: 'clb-6',
    studentName: 'سارة الفاسي (Sara El Fassi)',
    levelId: 'tc',
    streamId: 'tc_sciences',
    cumulativeScore: 890,
    xp: 1280,
    solvedCount: 33,
    correctCount: 29,
    badgesCount: 4,
    unlockedBadgeTitles: ['سريع الحساب', 'مهندس الفضاء'],
    rankBadge: '⚔️',
    rankTitle: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' },
    dateISO: '2026-11-08'
  },
  {
    id: 'clb-7',
    studentName: 'سعد الوزاني (Saad Ouazzani)',
    levelId: '1bac',
    streamId: '1bac_se',
    cumulativeScore: 820,
    xp: 1190,
    solvedCount: 30,
    correctCount: 26,
    badgesCount: 4,
    unlockedBadgeTitles: ['سيد المعادلات', 'سريع الحساب'],
    rankBadge: '⚔️',
    rankTitle: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' },
    dateISO: '2026-11-08'
  },
  {
    id: 'clb-8',
    studentName: 'كنزة المرابط (Kenza Mourabit)',
    levelId: '2ac',
    streamId: 'general',
    cumulativeScore: 760,
    xp: 1080,
    solvedCount: 28,
    correctCount: 24,
    badgesCount: 3,
    unlockedBadgeTitles: ['سريع الحساب', 'سيد المعادلات'],
    rankBadge: '⚔️',
    rankTitle: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' },
    dateISO: '2026-11-08'
  },
  {
    id: 'clb-9',
    studentName: 'يونس الزهراوي (Younes Zahraoui)',
    levelId: '2bac',
    streamId: '2bac_eco',
    cumulativeScore: 740,
    xp: 1020,
    solvedCount: 27,
    correctCount: 23,
    badgesCount: 3,
    unlockedBadgeTitles: ['خبير الدوال', 'سريع الحساب'],
    rankBadge: '⚔️',
    rankTitle: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' },
    dateISO: '2026-11-08'
  },
  {
    id: 'clb-10',
    studentName: 'آدم الشرايبي (Adam Cheraibi)',
    levelId: '1ac',
    streamId: 'general',
    cumulativeScore: 640,
    xp: 890,
    solvedCount: 25,
    correctCount: 22,
    badgesCount: 3,
    unlockedBadgeTitles: ['سريع الحساب', 'سيد المعادلات'],
    rankBadge: '📐',
    rankTitle: { ar: 'محلل بارع', biof: 'Analyste Brillant' },
    dateISO: '2026-11-08'
  }
];

export function rankCumulativeLeaderboard(
  entries: CumulativeLeaderboardEntry[],
  sortBy: 'score' | 'xp' | 'accuracy' | 'badges' = 'score'
): CumulativeLeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (sortBy === 'score') {
      if (b.cumulativeScore !== a.cumulativeScore) return b.cumulativeScore - a.cumulativeScore;
      return b.correctCount - a.correctCount;
    }
    if (sortBy === 'xp') {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.cumulativeScore - a.cumulativeScore;
    }
    if (sortBy === 'accuracy') {
      const accA = a.solvedCount > 0 ? a.correctCount / a.solvedCount : 0;
      const accB = b.solvedCount > 0 ? b.correctCount / b.solvedCount : 0;
      if (accB !== accA) return accB - accA;
      return b.cumulativeScore - a.cumulativeScore;
    }
    if (sortBy === 'badges') {
      if (b.badgesCount !== a.badgesCount) return b.badgesCount - a.badgesCount;
      return b.cumulativeScore - a.cumulativeScore;
    }
    return b.cumulativeScore - a.cumulativeScore;
  });
}

/**
 * Evaluates all student achievement badges ("سيد المعادلات", "خبير الدوال", "سريع الحساب", etc.)
 * based on accumulated points and domain/competency progress in UserStats.
 */
export function evaluateStudentBadges(stats: UserStats): StudentBadge[] {
  const algebraCorrect = stats.domainScores.arithmetic_algebra.correct;
  const analysisCorrect = stats.domainScores.analysis_functions.correct;
  const geometryCorrect = stats.domainScores.geometry_trig.correct;
  const probCorrect = stats.domainScores.probability_stats.correct;
  const reasoningCorrect = stats.competencyScores.reasoning.correct + stats.competencyScores.problem_solving.correct;

  // 1. سيد المعادلات (Master of Equations) - unlocks at 50 points OR 2 algebra correct answers
  const eqTarget = 50;
  const eqVal = Math.max(stats.score, algebraCorrect * 25);

  // 2. خبير الدوال (Functions Expert) - unlocks at 100 points OR 2 analysis correct answers
  const fnTarget = 100;
  const fnVal = Math.max(stats.score, analysisCorrect * 50);

  // 3. سريع الحساب (Speedy Reckoner / Fast Calculator) - unlocks at 80 points OR streak >= 3 OR 2 algebra answers
  const speedTarget = 80;
  const speedVal = Math.max(stats.score, stats.maxStreak * 30, algebraCorrect * 40);

  // 4. مهندس الفضاء والمثلثات (Geometry & Trig Architect) - unlocks at 150 points OR 2 geometry correct answers
  const geoTarget = 150;
  const geoVal = Math.max(stats.score, geometryCorrect * 75);

  // 5. محقق الأخطاء الديداكتيكية (Didactic Error Detective) - unlocks at 1 pitfall found OR 120 points
  const pitTarget = 120;
  const pitVal = Math.max(stats.score, stats.pitfallsFound * 120);

  // 6. فارس السلسلة الذهبية (Golden Streak Knight) - unlocks at maxStreak >= 3 OR 180 points
  const streakTarget = 180;
  const streakVal = Math.max(stats.score, stats.maxStreak * 60);

  // 7. حكيم الاستدلال والبرهان (Reasoning Sage) - unlocks at 130 points OR 2 reasoning/problem solving answers
  const reasoningTarget = 130;
  const reasoningVal = Math.max(stats.score, reasoningCorrect * 65);

  // 8. درع التفوق الإشهادي (National Exam Excellence Shield) - unlocks at 250 points
  const shieldTarget = 250;
  const shieldVal = stats.score;

  const buildBadge = (
    id: string,
    icon: string,
    title: LocalizedString,
    description: LocalizedString,
    requirementText: LocalizedString,
    currentVal: number,
    targetVal: number
  ): StudentBadge => {
    const clamped = Math.min(currentVal, targetVal);
    const progressPct = Math.round((clamped / targetVal) * 100);
    return {
      id,
      icon,
      title,
      description,
      requirementText,
      unlocked: currentVal >= targetVal,
      progressPct,
      currentValue: clamped,
      targetValue: targetVal
    };
  };

  return [
    buildBadge(
      'badge-equations-master',
      '∑',
      { ar: 'سيد المعادلات', biof: 'Maître des Équations' },
      {
        ar: 'تحكم متميز في الحساب الجبري، المعادلات، والأعداد العقدية.',
        biof: 'Maîtrise remarquable du calcul algébrique, des équations et des nombres complexes.'
      },
      { ar: '50 نقطة أو تمرينان في الجبر', biof: '50 pts ou 2 exercices d\'algèbre' },
      eqVal,
      eqTarget
    ),
    buildBadge(
      'badge-functions-expert',
      '∫',
      { ar: 'خبير الدوال', biof: 'Expert des Fonctions' },
      {
        ar: 'براعة في دراسة الدوال، النهايات، الاشتقاق وحساب التكامل.',
        biof: 'Excellence dans l\'étude des fonctions, limites, dérivation et calcul intégral.'
      },
      { ar: '100 نقطة أو تمرينان في التحليل', biof: '100 pts ou 2 exercices d\'analyse' },
      fnVal,
      fnTarget
    ),
    buildBadge(
      'badge-speed-calculator',
      '⚡',
      { ar: 'سريع الحساب', biof: 'Calculateur Rapide' },
      {
        ar: 'سرعة بديهة استثنائية في الحساب الذهني وإنجاز العمليات في وقت قياسي.',
        biof: 'Rapidité exceptionnelle en calcul mental et résolution en un temps record.'
      },
      { ar: '80 نقطة أو سلسلة 3 إجابات متتالية', biof: '80 pts ou série de 3 combos' },
      speedVal,
      speedTarget
    ),
    buildBadge(
      'badge-geometry-architect',
      '△',
      { ar: 'مهندس الفضاء والمثلثات', biof: 'Architecte Géomètre' },
      {
        ar: 'إتقان مبرهنات الهندسة المستوية والفضائية والحساب المثلثي.',
        biof: 'Maîtrise de la géométrie plane, dans l\'espace et de la trigonométrie.'
      },
      { ar: '150 نقطة أو تمرينان في الهندسة', biof: '150 pts ou 2 exercices de géométrie' },
      geoVal,
      geoTarget
    ),
    buildBadge(
      'badge-error-detective',
      '🔍',
      { ar: 'محقق الأخطاء الديداكتيكية', biof: 'Détective Didactique' },
      {
        ar: 'يقظة منهجية عالية في رصد المغالطات الرياضية وتصويبها.',
        biof: 'Vigilance méthodologique dans la détection et correction des erreurs.'
      },
      { ar: 'اكتشاف خطأ منهجي أو 120 نقطة', biof: '1 piège déjoué ou 120 pts' },
      pitVal,
      pitTarget
    ),
    buildBadge(
      'badge-combo-knight',
      '🔥',
      { ar: 'فارس السلسلة الذهبية', biof: 'Chevalier du Combo' },
      {
        ar: 'ثبات التركيز وتحقيق إجابات صحيحة متتالية دون أخطاء.',
        biof: 'Concentration soutenue avec une série de réponses justes consécutives.'
      },
      { ar: 'سلسلة 3 إجابات متتالية أو 180 نقطة', biof: 'Série de 3 combos ou 180 pts' },
      streakVal,
      streakTarget
    ),
    buildBadge(
      'badge-reasoning-sage',
      '⚖️',
      { ar: 'حكيم الاستدلال والبرهان', biof: 'Sage du Raisonnement' },
      {
        ar: 'إتقان براهين الاستلزام، الترجع، الخلف وفصل الحالات بدقة متناهية.',
        biof: 'Rigueur absolue dans les démonstrations par récurrence, absurde et disjonction.'
      },
      { ar: 'تمرينان في الاستدلال أو 130 نقطة', biof: '2 exercices de raisonnement ou 130 pts' },
      reasoningVal,
      reasoningTarget
    ),
    buildBadge(
      'badge-exam-shield',
      '🏆',
      { ar: 'درع التفوق الإشهادي', biof: 'Bouclier d\'Excellence' },
      {
        ar: 'جاهزية كاملة للامتحانات الإشهادية (الموحد، الجهوي، والوطني).',
        biof: 'Préparation optimale aux examens officiels (Brevet, Régional, National).'
      },
      { ar: 'بلوغ 250 نقطة إجمالية', biof: 'Atteindre 250 points au total' },
      shieldVal,
      shieldTarget
    )
  ];
}

/**
 * Proposal 1: Procedural Algebraic Question Generator (التوليد الجبري البارامتري اللانهائي)
 * Generates fresh, mathematically verified questions with dynamic parameters based on levelId and seed.
 */
export function generateProceduralQuestion(
  levelId: LevelId,
  streamId: StreamId,
  seed: number
): Question {
  const step = Math.max(1, seed);
  const archetype = step % 4;
  const isCollege = levelId === '1ac' || levelId === '2ac' || levelId === '3ac';

  if (isCollege) {
    if (archetype === 0) {
      // Archetype 0: Linear equation a*x + b = c*x + d
      const a = (step % 4) + 3; // 3..6
      const c = (step % 2) + 1; // 1..2
      const xSol = ((step * 3) % 9) + 2; // 2..10
      const b = ((step * 5) % 11) - 5; // -5..5
      const d = (a - c) * xSol + b;

      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const dSign = d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}`;

      return permuteQuestionOptions(
        {
          id: `proc-college-${levelId}-${step}`,
          levelId,
          streams: [streamId, 'general'],
          domain: 'arithmetic_algebra',
          competency: 'application',
          title: {
            ar: `تمرين بارامتري متجدد #${step} : حل معادلة من الدرجة الأولى`,
            biof: `Exercice Paramétrique #${step} : Équation du 1er Degré`
          },
          statement: {
            ar: 'حل في ℝ المعادلة الجبرية المولدة آلياً التالية:',
            biof: "Résoudre dans ℝ l'équation algébrique générée dynamiquement :"
          },
          formula: `${a}x ${bSign} = ${c}x ${dSign}`,
          options: [
            { ar: `x = ${xSol}`, biof: `x = ${xSol}` },
            { ar: `x = ${xSol + 2}`, biof: `x = ${xSol + 2}` },
            { ar: `x = ${-xSol}`, biof: `x = ${-xSol}` },
            { ar: `x = ${xSol - 3}`, biof: `x = ${xSol - 3}` }
          ],
          correctIndex: 0,
          explanation: {
            ar: `نجمع المجاهيل في الطرف الأيسر والمعاليم في الطرف الأيمن:\n(${a} - ${c})x = ${d} - (${b}) => ${a - c}x = ${d - b} => x = ${xSol}.`,
            biof: `On isole l'inconnue x :\n(${a} - ${c})x = ${d} - (${b}) => ${a - c}x = ${d - b} => x = ${xSol}.`
          },
          inspectorTip: {
            ar: 'توجيه المفتش (الجبر): عند نقل حد من طرف إلى آخر، غيّر إشارته فوراً قبل التبسيط.',
            biof: "Conseil de l'Inspecteur : Changez immédiatement le signe d'un terme transposé."
          },
          points: 20,
          difficulty: 'medium'
        },
        step
      );
    }

    if (archetype === 1) {
      // Archetype 1: Remarkable identity expansion (x + k)^2
      const k = ((step * 2) % 7) + 2; // 2..8
      const twoK = 2 * k;
      const kSq = k * k;

      return permuteQuestionOptions(
        {
          id: `proc-college-${levelId}-${step}`,
          levelId,
          streams: [streamId, 'general'],
          domain: 'arithmetic_algebra',
          competency: 'restitution',
          title: {
            ar: `تمرين بارامتري متجدد #${step} : النشر بالمتطابقات الهامة`,
            biof: `Exercice Paramétrique #${step} : Identités Remarquables`
          },
          statement: {
            ar: 'انشر وبسّط التعبير الجبري التالي باستعمال المتطابقة الهامة المناسبة:',
            biof: "Développer et réduire l'expression algébrique suivante :"
          },
          formula: `A(x) = (x + ${k})^2`,
          options: [
            { ar: `x² + ${twoK}x + ${kSq}`, biof: `x² + ${twoK}x + ${kSq}` },
            { ar: `x² + ${kSq}`, biof: `x² + ${kSq}` },
            { ar: `x² + ${k}x + ${kSq}`, biof: `x² + ${k}x + ${kSq}` },
            { ar: `x² - ${twoK}x + ${kSq}`, biof: `x² - ${twoK}x + ${kSq}` }
          ],
          correctIndex: 0,
          explanation: {
            ar: `بتطبيق المتطابقة الهامة الأولى (a + b)² = a² + 2ab + b² نجد:\n(x + ${k})² = x² + 2(${k})x + ${k}² = x² + ${twoK}x + ${kSq}.`,
            biof: `En appliquant (a + b)² = a² + 2ab + b² :\n(x + ${k})² = x² + ${twoK}x + ${kSq}.`
          },
          inspectorTip: {
            ar: 'توجيه المفتش: لا تنسَ أبداً الحد الأوسط (الجداء المزدوج 2ab) أثناء نشر مربع مجموع.',
            biof: "Conseil de l'Inspecteur : N'oubliez jamais le double produit 2ab."
          },
          points: 20,
          difficulty: 'easy'
        },
        step
      );
    }

    if (archetype === 2) {
      // Archetype 2: Pythagoras theorem scaled triple (3m, 4m, 5m) where hypotenuse BC = x
      const scale = (step % 4) + 1; // 1..4
      const ab = 3 * scale;
      const ac = 4 * scale;
      const bc = 5 * scale;

      return permuteQuestionOptions(
        {
          id: `proc-college-${levelId}-${step}`,
          levelId,
          streams: [streamId, 'general'],
          domain: 'geometry_trig',
          competency: 'application',
          title: {
            ar: `تمرين بارامتري متجدد #${step} : مبرهنة فيتاغورس المباشرة`,
            biof: `Exercice Paramétrique #${step} : Théorème de Pythagore`
          },
          statement: {
            ar: `ليكن ABC مثلثاً قائماً الزاوية في A بحيث AB = ${ab} و AC = ${ac}. احسب طول الوتر BC = x:`,
            biof: `Soit ABC un triangle rectangle en A tel que AB = ${ab} et AC = ${ac}. Calculer l'hypoténuse BC = x :`
          },
          formula: `BC^2 = x^2 = AB^2 + AC^2 = ${ab}^2 + ${ac}^2`,
          options: [
            { ar: `x = ${bc}`, biof: `x = ${bc}` },
            { ar: `x = ${ab + ac}`, biof: `x = ${ab + ac}` },
            { ar: `x = ${bc * bc}`, biof: `x = ${bc * bc}` },
            { ar: `x = ${bc - 1}`, biof: `x = ${bc - 1}` }
          ],
          correctIndex: 0,
          explanation: {
            ar: `حسب مبرهنة فيتاغورس المباشرة في المثلث القائم في A:\nx² = ${ab}² + ${ac}² = ${ab * ab} + ${ac * ac} = ${bc * bc} ومنه x = √${bc * bc} = ${bc}.`,
            biof: `D'après le théorème de Pythagore :\nx² = ${ab * ab} + ${ac * ac} = ${bc * bc}, d'où x = ${bc}.`
          },
          inspectorTip: {
            ar: 'توجيه المفتش (الهندسة): لا تخلط بين مربع الوتر x² وطول الوتر x؛ تذكر دائماً أخذ الجذر المربع في الخطوة الأخيرة.',
            biof: "Conseil de l'Inspecteur : N'oubliez pas d'extraire la racine carrée à la dernière étape."
          },
          points: 20,
          difficulty: 'medium'
        },
        step
      );
    }

    // Archetype 3: Affine function image calculation f(x) = a*x + b
    const a = ((step % 4) + 2); // 2..5
    const b = ((step * 3) % 7) - 3; // -3..3
    const x0 = (step % 5) + 1; // 1..5
    const img = a * x0 + b;
    const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;

    return permuteQuestionOptions(
      {
        id: `proc-college-${levelId}-${step}`,
        levelId,
        streams: [streamId, 'general'],
        domain: 'analysis_functions',
        competency: 'application',
        title: {
          ar: `تمرين بارامتري متجدد #${step} : الدالة التآلفية وصورة عدد`,
          biof: `Exercice Paramétrique #${step} : Fonction Affine & Image`
        },
        statement: {
          ar: `نعتبر الدالة التآلفية f المعرفة بما يلي. احسب صورة العدد x = ${x0} بالدالة f:`,
          biof: `Soit f la fonction affine définie ci-dessous. Calculer l'image de x = ${x0} par f :`
        },
        formula: `f(x) = ${a}x ${bSign} \\quad ; \\quad x = ${x0}`,
        options: [
          { ar: `f(${x0}) = ${img}`, biof: `f(${x0}) = ${img}` },
          { ar: `f(${x0}) = ${a * x0 - b}`, biof: `f(${x0}) = ${a * x0 - b}` },
          { ar: `f(${x0}) = ${a + x0 + b}`, biof: `f(${x0}) = ${a + x0 + b}` },
          { ar: `f(${x0}) = ${img + a}`, biof: `f(${x0}) = ${img + a}` }
        ],
        correctIndex: 0,
        explanation: {
          ar: `نعوض x بالقيمة ${x0} في تعبير الدالة:\nf(${x0}) = ${a} × ${x0} ${bSign} = ${a * x0} ${bSign} = ${img}.`,
          biof: `On remplace x par ${x0} :\nf(${x0}) = ${a} × ${x0} ${bSign} = ${img}.`
        },
        inspectorTip: {
          ar: 'توجيه المفتش (الدوال): لحساب صورة عدد x₀ نعوض x بـ x₀، وللبحث عن السابق نحل المعادلة f(x) = y.',
          biof: "Conseil de l'Inspecteur : Pour calculer une image, remplacez x par sa valeur."
        },
        points: 20,
        difficulty: 'easy'
      },
      step
    );
  }

  // For Lycée (TC, 1Bac, 2Bac): 4 distinct archetypes cycling via step % 4
  if (archetype === 0) {
    // Archetype 0: Arithmetic sequence modeled by f(x) = u0 + r*x
    const u0 = ((step * 2) % 7) + 2; // 2..8
    const r = (step % 4) + 2; // 2..5
    const nVal = 10;
    const unVal = u0 + r * nVal;

    return permuteQuestionOptions(
      {
        id: `proc-lycee-${levelId}-${step}`,
        levelId,
        streams: [streamId, 'general'],
        domain: 'arithmetic_algebra',
        competency: 'application',
        title: {
          ar: `تمرين بارامتري متجدد #${step} : المتتالية الحسابية والحد العام`,
          biof: `Exercice Paramétrique #${step} : Suite Arithmétique & Terme Général`
        },
        statement: {
          ar: `لتكن (uₙ) متتالية حسابية حدها الأول u₀ = ${u0} وأساسها r = ${r} معرفة بـ uₙ = f(n). احسب قيمة الحد u₁₀:`,
          biof: `Soit (uₙ) une suite arithmétique de premier terme u₀ = ${u0} et de raison r = ${r} telle que uₙ = f(n). Calculer u₁₀ :`
        },
        formula: `f(x) = ${u0} + ${r}x \\quad ; \\quad u_n = f(n) \\quad (n = 10)`,
        options: [
          { ar: `u₁₀ = ${unVal}`, biof: `u₁₀ = ${unVal}` },
          { ar: `u₁₀ = ${u0 + r * 9}`, biof: `u₁₀ = ${u0 + r * 9}` },
          { ar: `u₁₀ = ${u0 * r * 10}`, biof: `u₁₀ = ${u0 * r * 10}` },
          { ar: `u₁₀ = ${unVal + r}`, biof: `u₁₀ = ${unVal + r}` }
        ],
        correctIndex: 0,
        explanation: {
          ar: `صيغة الحد العام لمتتالية حسابية هي uₙ = u₀ + n·r.\nإذن u₁₀ = f(10) = ${u0} + 10 × ${r} = ${unVal}.`,
          biof: `Le terme général est uₙ = u₀ + n·r.\nDonc u₁₀ = f(10) = ${u0} + 10 × ${r} = ${unVal}.`
        },
        inspectorTip: {
          ar: 'توجيه المفتش (المتتاليات): إذا انطلقت المتتالية من u₀ فإن uₙ = u₀ + n·r، وإذا انطلقت من u₁ فإن uₙ = u₁ + (n - 1)r.',
          biof: "Conseil de l'Inspecteur : Vérifiez toujours l'indice du premier terme (u₀ ou u₁)."
        },
        points: 25,
        difficulty: 'easy'
      },
      step
    );
  }

  if (archetype === 1) {
    // Archetype 1: Limit at +infinity of rational function f(x) = (a x^2 + b x) / (c x^2 + 1)
    const c = (step % 3) + 1; // 1..3
    const ratio = ((step * 2) % 4) + 2; // 2..5
    const a = c * ratio;
    const b = (step % 5) + 1;

    return permuteQuestionOptions(
      {
        id: `proc-lycee-${levelId}-${step}`,
        levelId,
        streams: [streamId, 'general'],
        domain: 'analysis_functions',
        competency: 'application',
        title: {
          ar: `تمرين بارامتري متجدد #${step} : نهاية دالة جذرية عند +∞`,
          biof: `Exercice Paramétrique #${step} : Limite d'une Fonction Rationnelle`
        },
        statement: {
          ar: 'احسب نهاية الدالة الجذرية f(x) عندما يؤول x إلى +∞:',
          biof: 'Calculer la limite de la fonction rationnelle f(x) lorsque x tend vers +∞ :'
        },
        formula: `\\lim_{x \\to +\\infty} f(x) \\quad \\text{avec} \\quad f(x) = \\frac{${a}x^2 + ${b}x - 1}{${c}x^2 + 3}`,
        options: [
          { ar: `${ratio}`, biof: `${ratio}` },
          { ar: `+∞`, biof: `+∞` },
          { ar: `0`, biof: `0` },
          { ar: `${a}`, biof: `${a}` }
        ],
        correctIndex: 0,
        explanation: {
          ar: `نهاية دالة جذرية عند +∞ هي نهاية خارج الحدين الأعلى درجة:\nlim f(x) = lim (${a}x² / ${c}x²) = ${a} / ${c} = ${ratio}.`,
          biof: `En +∞, la limite d'une fonction rationnelle est celle du quotient des termes de plus haut degré : ${a}x² / (${c}x²) = ${ratio}.`
        },
        inspectorTip: {
          ar: 'توجيه المفتش (النهايات): قاعدة الحد الأعلى درجة تطبق فقط عند ∞± ولا تطبق أبداً عند عدد حقيقي x₀.',
          biof: "Conseil de l'Inspecteur : La règle des termes de plus haut degré ne s'applique qu'au voisinage de ±∞."
        },
        points: 25,
        difficulty: 'medium'
      },
      step
    );
  }

  if (archetype === 2) {
    // Archetype 2: Canonical quadratic extremum f(x) = a(x - alpha)^2 + beta
    const a = (step % 3) + 1; // 1..3
    const alpha = ((step * 2) % 5) + 1; // 1..5
    const beta = ((step * 3) % 7) - 3; // -3..3
    const betaSign = beta >= 0 ? `+ ${beta}` : `- ${Math.abs(beta)}`;

    return permuteQuestionOptions(
      {
        id: `proc-lycee-${levelId}-${step}`,
        levelId,
        streams: [streamId, 'general'],
        domain: 'arithmetic_algebra',
        competency: 'reasoning',
        title: {
          ar: `تمرين بارامتري متجدد #${step} : الشكل القانوني ورأس الشلجم`,
          biof: `Exercice Paramétrique #${step} : Forme Canonique & Sommet`
        },
        statement: {
          ar: 'حدد إحداثيتي رأس الشلجم Ω والقيمة الدنيا للدالة الحدودية f المعرفة بالشكل القانوني التالي:',
          biof: 'Déterminer les coordonnées du sommet Ω et le minimum de la fonction f donnée sous forme canonique :'
        },
        formula: `f(x) = ${a}(x - ${alpha})^2 ${betaSign}`,
        options: [
          { ar: `Ω(${alpha} ; ${beta}) والقيمة الدنيا هي ${beta}`, biof: `Ω(${alpha} ; ${beta}), minimum = ${beta}` },
          { ar: `Ω(-${alpha} ; ${beta}) والقيمة الدنيا هي ${beta}`, biof: `Ω(-${alpha} ; ${beta}), minimum = ${beta}` },
          { ar: `Ω(${alpha} ; ${a}) والقيمة الدنيا هي ${a}`, biof: `Ω(${alpha} ; ${a}), minimum = ${a}` },
          { ar: `Ω(${beta} ; ${alpha}) والقيمة الدنيا هي ${alpha}`, biof: `Ω(${beta} ; ${alpha}), minimum = ${alpha}` }
        ],
        correctIndex: 0,
        explanation: {
          ar: `بما أن a = ${a} > 0 فإن لكل x من ℝ لدينا (x - ${alpha})² ≥ 0، ومنه f(x) ≥ ${beta}.\nتتحقق المساواة عند x = ${alpha}، إذن الرأس هو Ω(${alpha} ; ${beta}) والقيمة الدنيا هي ${beta}.`,
          biof: `Comme a = ${a} > 0, le minimum de f sur ℝ est ${beta}, atteint en x = ${alpha}. Le sommet est Ω(${alpha} ; ${beta}).`
        },
        inspectorTip: {
          ar: 'توجيه المفتش: في الشكل القانوني a(x - α)² + β، انتبه لإشارة α داخل القوس (تُقرأ بعكس الإشارة الظاهرة).',
          biof: "Conseil de l'Inspecteur : Dans a(x - α)² + β, attention au signe de α."
        },
        points: 25,
        difficulty: 'medium'
      },
      step
    );
  }

  // Archetypes 0 & 3: Polynomial derivative & tangent slope at x0
  const a = (step % 3) + 1; // 1..3
  const b = ((step * 2) % 5) + 1; // 1..5
  const c = (step % 7) - 3; // -3..3
  const x0 = (step % 3) + 1; // 1..3
  // f(x) = a x^2 + b x + c => f'(x) = 2a x + b
  const derivativeAtX0 = 2 * a * x0 + b;
  const wrong1 = derivativeAtX0 + a;
  const wrong2 = a * x0 * x0 + b * x0 + c;
  const wrong3 = 2 * a * x0 - b;

  const cStr = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const aStr = a === 1 ? '' : `${a}`;

  const lyceeQuestion: Question = {
    id: `proc-lycee-${levelId}-${step}`,
    levelId,
    streams: [streamId, 'general'],
    domain: 'analysis_functions',
    competency: 'application',
    title: {
      ar: `تمرين بارامتري متجدد #${step} : العدد المشتق وميل المماس`,
      biof: `Exercice Paramétrique #${step} : Nombre Dérivé & Pente`
    },
    statement: {
      ar: `نعتبر الدالة العددية f المعرفة على ℝ بما يلي. احسب العدد المشتق f'(${x0}) (المعامل الموجه للمماس عند x₀ = ${x0}):`,
      biof: `Soit f la fonction définie sur ℝ ci-dessous. Calculer le nombre dérivé f'(${x0}) (pente de la tangente en x₀ = ${x0}) :`
    },
    formula: `f(x) = ${aStr}x^2 + ${b}x ${cStr} \\quad ; \\quad x_0 = ${x0}`,
    options: [
      { ar: `f'(${x0}) = ${derivativeAtX0}`, biof: `f'(${x0}) = ${derivativeAtX0}` },
      { ar: `f'(${x0}) = ${wrong1}`, biof: `f'(${x0}) = ${wrong1}` },
      { ar: `f'(${x0}) = ${wrong2}`, biof: `f'(${x0}) = ${wrong2}` },
      { ar: `f'(${x0}) = ${wrong3}`, biof: `f'(${x0}) = ${wrong3}` }
    ],
    correctIndex: 0,
    explanation: {
      ar: `الدالة المشتقة هي f'(x) = ${2 * a}x + ${b}.\nبالتعويض بـ x₀ = ${x0} نجد: f'(${x0}) = ${2 * a}(${x0}) + ${b} = ${derivativeAtX0}.`,
      biof: `La fonction dérivée est f'(x) = ${2 * a}x + ${b}.\nEn remplaçant x₀ par ${x0}, on obtient : f'(${x0}) = ${2 * a} × ${x0} + ${b} = ${derivativeAtX0}.`
    },
    inspectorTip: {
      ar: 'توجيه المفتش (التوليد البارامتري): مشتقة ax² + bx + c هي 2ax + b، لا تخلط بين صورة العدد f(x₀) والعدد المشتق f\'(x₀).',
      biof: 'Conseil de l\'Inspecteur : Ne confondez jamais l\'image f(x₀) et le nombre dérivé f\'(x₀).'
    },
    points: 25,
    difficulty: 'medium'
  };

  return permuteQuestionOptions(lyceeQuestion, step);
}

export interface SmartDomainPriority {
  domain: MathDomain;
  domainName: LocalizedString;
  icon: string;
  correct: number;
  total: number;
  accuracyPct: number;
  effectiveRatio: number;
  status: 'unexplored' | 'critical' | 'needs_practice' | 'mastered';
  statusLabel: LocalizedString;
}

export interface SmartQuizRecommendation {
  recommendedDomain: MathDomain;
  secondaryDomain: MathDomain;
  recommendedTopicTitle: LocalizedString;
  pedagogicalReason: LocalizedString;
  actionCallout: LocalizedString;
  rankedDomains: SmartDomainPriority[];
  smartDeck: Question[];
}

/**
 * Proposal 2: Adaptive Spaced Repetition helper (تحديد المجال الأضعف لاستهدافه تكييفياً)
 */
export function getWeakestDomain(stats: UserStats): MathDomain {
  const domains: MathDomain[] = [
    'arithmetic_algebra',
    'analysis_functions',
    'geometry_trig',
    'probability_stats'
  ];

  let weakest: MathDomain = 'analysis_functions';
  let lowestScore = Infinity;

  for (const dom of domains) {
    const entry = stats.domainScores[dom] || { correct: 0, total: 0 };
    // Unvisited domains get 0.35 baseline so any domain with < 35% accuracy is prioritized first
    const ratio = entry.total === 0 ? 0.35 : entry.correct / entry.total;
    if (ratio < lowestScore) {
      lowestScore = ratio;
      weakest = dom;
    }
  }
  return weakest;
}

/**
 * Smart Quiz Engine (الموجه التربوي الذكي):
 * Analyzes `stats.domainScores` across all 4 mathematical domains, ranks them from lowest
 * mastery to highest, suggests the next best curriculum topic for the student's level/stream,
 * and constructs a targeted Smart Quiz question deck.
 */
export function getSmartQuizRecommendation(
  stats: UserStats,
  levelId: LevelId,
  streamId: StreamId,
  sessionSeed: number = 1
): SmartQuizRecommendation {
  const domainKeys: MathDomain[] = [
    'arithmetic_algebra',
    'analysis_functions',
    'geometry_trig',
    'probability_stats'
  ];

  const rankedDomains: SmartDomainPriority[] = domainKeys
    .map(dom => {
      const entry = stats.domainScores?.[dom] || { correct: 0, total: 0 };
      const accuracyPct = entry.total > 0 ? Math.round((entry.correct / entry.total) * 100) : 0;
      const effectiveRatio = entry.total === 0 ? 0.35 : entry.correct / entry.total;

      let status: SmartDomainPriority['status'] = 'needs_practice';
      let statusLabel: LocalizedString = {
        ar: 'يحتاج إلى تثبيت',
        biof: 'À consolider'
      };

      if (entry.total === 0) {
        status = 'unexplored';
        statusLabel = {
          ar: 'لم يُختبر بعد (أولوية تشخيصية)',
          biof: 'Non exploré (Priorité diagnostique)'
        };
      } else if (accuracyPct < 55) {
        status = 'critical';
        statusLabel = {
          ar: 'أولوية قصوى للدعم',
          biof: 'Priorité critique de soutien'
        };
      } else if (accuracyPct >= 80) {
        status = 'mastered';
        statusLabel = {
          ar: 'متحكم بتميز',
          biof: 'Maîtrise avancée'
        };
      }

      return {
        domain: dom,
        domainName: DOMAINS[dom].name,
        icon: DOMAINS[dom].icon,
        correct: entry.correct,
        total: entry.total,
        accuracyPct,
        effectiveRatio,
        status,
        statusLabel
      };
    })
    .sort((a, b) => {
      if (a.effectiveRatio !== b.effectiveRatio) {
        return a.effectiveRatio - b.effectiveRatio;
      }
      return a.total - b.total;
    });

  const primary = rankedDomains[0];
  const secondary = rankedDomains[1] || rankedDomains[0];

  // Collect candidate questions for the primary recommended domain (level+stream first, then same domain across curriculum)
  const primaryPool = filterQuestions(levelId, streamId, primary.domain);
  const fallbackLevelPool = QUESTIONS_DATABASE.filter(
    q => q.levelId === levelId && q.domain === primary.domain
  );
  const fallbackDomainPool = QUESTIONS_DATABASE.filter(q => q.domain === primary.domain);
  const effectivePrimaryPool = [...primaryPool, ...fallbackLevelPool, ...fallbackDomainPool];

  // Check if student has missed questions in the primary domain to prioritize remediation first
  const missedInPrimary = (stats.missedQuestions || [])
    .map(m => m.question)
    .filter(q => q.domain === primary.domain);

  const secondaryPool = filterQuestions(levelId, streamId, secondary.domain);
  const effectiveSecondaryPool = [
    ...secondaryPool,
    ...QUESTIONS_DATABASE.filter(q => q.domain === secondary.domain),
    ...QUESTIONS_DATABASE
  ];

  // Build a 6-question adaptive Smart Quiz deck (4 from weakest domain + 2 from second weakest)
  const seenIds = new Set<string>();
  const smartDeck: Question[] = [];

  for (const mq of missedInPrimary) {
    if (smartDeck.length >= 2) break;
    if (!seenIds.has(mq.id)) {
      seenIds.add(mq.id);
      smartDeck.push(permuteQuestionOptions(mq, sessionSeed + smartDeck.length));
    }
  }

  for (let i = 0; i < effectivePrimaryPool.length && smartDeck.length < 4; i++) {
    const candidate = effectivePrimaryPool[(i + sessionSeed - 1) % effectivePrimaryPool.length];
    if (candidate && !seenIds.has(candidate.id)) {
      seenIds.add(candidate.id);
      smartDeck.push(permuteQuestionOptions(candidate, sessionSeed + smartDeck.length));
    }
  }

  for (let i = 0; i < effectiveSecondaryPool.length && smartDeck.length < 6; i++) {
    const candidate = effectiveSecondaryPool[(i + sessionSeed - 1) % effectiveSecondaryPool.length];
    if (candidate && !seenIds.has(candidate.id)) {
      seenIds.add(candidate.id);
      smartDeck.push(permuteQuestionOptions(candidate, sessionSeed + smartDeck.length));
    }
  }

  const leadQuestion = smartDeck[0];
  const recommendedTopicTitle: LocalizedString = leadQuestion
    ? leadQuestion.title
    : primary.domainName;

  let pedagogicalReason: LocalizedString;
  if (primary.total === 0) {
    pedagogicalReason = {
      ar: `لم تقم بعد بحل تمارين في مجال «${primary.domainName.ar}». يقترح المستشار الذكي البدء بدرس «${recommendedTopicTitle.ar}» لتشخيص مكتسباتك وبناء توازن شامل بين الفروع الأربعة.`,
      biof: `Vous n'avez pas encore résolu d'exercices en « ${primary.domainName.biof} ». Le Smart Quiz recommande de commencer par « ${recommendedTopicTitle.biof} » pour équilibrer votre profil.`
    };
  } else if (primary.accuracyPct < 55) {
    pedagogicalReason = {
      ar: `سجلت أقل نسبة تحكم في مجال «${primary.domainName.ar}» بدقة ${primary.accuracyPct}% (${primary.correct} من ${primary.total}). الأولوية القصوى الآن هي التركيز على موضوع «${recommendedTopicTitle.ar}» لرفع نقطتك التراكمية.`,
      biof: `Votre score le plus bas se situe en « ${primary.domainName.biof} » avec ${primary.accuracyPct}% de réussite (${primary.correct}/${primary.total}). Priorité immédiate au sujet « ${recommendedTopicTitle.biof} ».`
    };
  } else {
    pedagogicalReason = {
      ar: `مجال «${primary.domainName.ar}» هو الأقل نسبياً في سجل أدائك الحالي بدقة ${primary.accuracyPct}% (${primary.correct}/${primary.total}). نوصي بالتدرب على «${recommendedTopicTitle.ar}» لبلوغ عتبة التميز (85%+).`,
      biof: `Le domaine « ${primary.domainName.biof} » présente votre marge de progression principale (${primary.accuracyPct}%, ${primary.correct}/${primary.total}). Entraînez-vous sur « ${recommendedTopicTitle.biof} ».`
    };
  }

  const actionCallout: LocalizedString = {
    ar: `ابدأ الاختبار الذكي في ${primary.domainName.ar} (${smartDeck.length} تمارين مختارة)`,
    biof: `Lancer le Smart Quiz en ${primary.domainName.biof} (${smartDeck.length} exercices ciblés)`
  };

  return {
    recommendedDomain: primary.domain,
    secondaryDomain: secondary.domain,
    recommendedTopicTitle,
    pedagogicalReason,
    actionCallout,
    rankedDomains,
    smartDeck
  };
}

/**
 * Proposal 3: Official Mock Exam Paper Generator (ورقة الامتحان التجريبي الموحد على 20 نقطة)
 */
export interface MockExamSection {
  sectionNumber: number;
  title: LocalizedString;
  allocatedPointsOn20: number;
  question: Question;
}

export function generateMockExamPaper(levelId: LevelId, streamId: StreamId, examSeed: number = 1): MockExamSection[] {
  const deck = generateTimedChallengeDeck(levelId, streamId, 4, examSeed);
  const allocations = [4, 4, 5, 7]; // Total = 20 / 20 (Barème officiel)
  const sectionTitles: LocalizedString[] = [
    { ar: 'التمرين الأول (4 نقط): استرداد المعارف والحساب الجبري', biof: 'Exercice 1 (4 pts) : Algèbre & Restitution' },
    { ar: 'التمرين الثاني (4 نقط): الهندسة والحساب المثلثي', biof: 'Exercice 2 (4 pts) : Géométrie & Trigonométrie' },
    { ar: 'التمرين الثالث (5 نقط): الاستدلال والاحتمالات / المتتاليات', biof: 'Exercice 3 (5 pts) : Raisonnement, Suites & Probabilités' },
    { ar: 'المسألة الشاملة (7 نقط): التحليل ودراسة الدوال', biof: 'Problème de Synthèse (7 pts) : Analyse & Étude de Fonctions' }
  ];

  return deck.slice(0, 4).map((q, idx) => ({
    sectionNumber: idx + 1,
    title: sectionTitles[idx],
    allocatedPointsOn20: allocations[idx],
    question: q
  }));
}

export function permuteQuestionOptions(question: Question, sessionSeed: number = 0): Question {
  const n = question.options.length;
  if (n <= 1) return question;

  let hash = sessionSeed;
  for (let i = 0; i < question.id.length; i++) {
    hash = (hash * 31 + question.id.charCodeAt(i)) >>> 0;
  }

  const shift = hash % n;
  if (shift === 0) return question;

  const rotatedOptions = question.options.map((_, idx) => {
    return question.options[(idx - shift + n) % n];
  });
  const newCorrectIndex = (question.correctIndex + shift) % n;

  return {
    ...question,
    options: rotatedOptions,
    correctIndex: newCorrectIndex
  };
}

const questionFilterCache = new Map<string, Question[]>();
const pitfallFilterCache = new Map<string, StepErrorPitfall[]>();

export function filterQuestions(
  levelId: LevelId,
  streamId: StreamId,
  domainFilter: MathDomain | 'all' = 'all'
): Question[] {
  const cacheKey = `${levelId}:${streamId}:${domainFilter}`;
  const cached = questionFilterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result = QUESTIONS_DATABASE.filter(q => {
    const matchesLevel = q.levelId === levelId;
    const matchesStream = q.streams.includes(streamId) || q.streams.includes('general');
    const matchesDomain = domainFilter === 'all' || q.domain === domainFilter;
    return matchesLevel && matchesStream && matchesDomain;
  }).map((q, idx) => permuteQuestionOptions(q, idx));

  questionFilterCache.set(cacheKey, result);
  return result;
}

export function filterPitfalls(levelId: LevelId, streamId: StreamId): StepErrorPitfall[] {
  const cacheKey = `${levelId}:${streamId}`;
  const cached = pitfallFilterCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const filtered = PITFALLS_DATABASE.filter(p => {
    return p.levelId === levelId && (p.streams.includes(streamId) || p.streams.includes('general'));
  });
  const result = filtered.length === 0 ? PITFALLS_DATABASE : filtered;
  pitfallFilterCache.set(cacheKey, result);
  return result;
}

export function generateTimedChallengeDeck(
  levelId: LevelId,
  streamId: StreamId,
  targetCount: number = 10,
  sessionSeed: number = 1
): Question[] {
  const seenIds = new Set<string>();
  const deck: Question[] = [];

  const levelConfig = LEVELS.find(l => l.id === levelId);
  const currentCycle = levelConfig?.cycle || 'lycee';
  const sameCycleLevels = new Set(
    LEVELS.filter(l => l.cycle === currentCycle).map(l => l.id)
  );

  const tier1 = QUESTIONS_DATABASE.filter(
    q => q.levelId === levelId && (q.streams.includes(streamId) || q.streams.includes('general'))
  );

  const tier2 = QUESTIONS_DATABASE.filter(
    q => sameCycleLevels.has(q.levelId)
  );

  const tiers = [tier1, tier2, QUESTIONS_DATABASE];

  for (const pool of tiers) {
    for (let i = 0; i < pool.length; i++) {
      if (deck.length >= targetCount) break;
      const idx = (i + sessionSeed) % pool.length;
      const candidate = pool[idx];
      if (!seenIds.has(candidate.id)) {
        seenIds.add(candidate.id);
        deck.push(permuteQuestionOptions(candidate, sessionSeed + deck.length));
      }
    }
    if (deck.length >= targetCount) break;
  }

  return deck;
}

export function calculateTimedFinalScore(
  rawScore: number,
  correctCount: number,
  totalQuestions: number,
  timeRemainingSec: number
): { finalScore: number; timeBonus: number; accuracyPct: number } {
  const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const timeBonus = correctCount > 0 ? Math.round(timeRemainingSec * 2 * (correctCount / totalQuestions)) : 0;
  const finalScore = rawScore + timeBonus;
  return { finalScore, timeBonus, accuracyPct };
}

export function rankLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctCount !== a.correctCount) return b.correctCount - a.correctCount;
    return b.timeRemainingSec - a.timeRemainingSec;
  });
}

export function calculateAnswerPoints(
  basePoints: number,
  isCorrect: boolean,
  currentStreak: number,
  timeSpentSeconds: number,
  timeLimitSeconds: number = 45
): { points: number; xp: number; newStreak: number } {
  if (!isCorrect) {
    return { points: 0, xp: 5, newStreak: 0 };
  }

  const streakMultiplier = 1 + Math.min(currentStreak * 0.2, 1.0);
  const timeBonus = timeSpentSeconds < (timeLimitSeconds / 2) ? 1.25 : 1.0;
  
  const points = Math.round(basePoints * streakMultiplier * timeBonus);
  const xp = Math.round(points * 1.5);
  const newStreak = currentStreak + 1;

  return { points, xp, newStreak };
}

export function getRankByXP(xp: number): {
  levelNumber: number;
  title: { ar: string; biof: string };
  badge: string;
  nextThreshold: number;
} {
  const RANKS = [
    { threshold: 0, levelNumber: 1, title: { ar: 'تلميذ مستكشف', biof: 'Élève Explorateur' }, badge: '🌱' },
    { threshold: 100, levelNumber: 2, title: { ar: 'باحث مجتهد', biof: 'Chercheur Assidu' }, badge: '📘' },
    { threshold: 300, levelNumber: 3, title: { ar: 'محلل بارع', biof: 'Analyste Brillant' }, badge: '📐' },
    { threshold: 600, levelNumber: 4, title: { ar: 'فارس الرياضيات', biof: 'Chevalier des Maths' }, badge: '⚔️' },
    { threshold: 1000, levelNumber: 5, title: { ar: 'عبقري البكالوريا', biof: 'Génie du Bac' }, badge: '🎓' },
    { threshold: 1600, levelNumber: 6, title: { ar: 'بطل الأولمبياد الوطني', biof: 'Maître des Olympiades' }, badge: '🏆' }
  ];

  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].threshold) {
      const nextThreshold = i < RANKS.length - 1 ? RANKS[i + 1].threshold : RANKS[i].threshold + 1000;
      return {
        levelNumber: RANKS[i].levelNumber,
        title: RANKS[i].title,
        badge: RANKS[i].badge,
        nextThreshold
      };
    }
  }

  return {
    levelNumber: 1,
    title: { ar: 'تلميذ مستكشف', biof: 'Élève Explorateur' },
    badge: '🌱',
    nextThreshold: 100
  };
}

export function generateInspectorReview(stats: UserStats): InspectorReview {
  const total = stats.solvedCount;
  const correct = stats.correctCount;
  const accuracy = total > 0 ? (correct / total) : 0;
  
  const diagnosticGrade = Math.round(accuracy * 20 * 10) / 10;

  let overallRankTitle = { ar: 'في طور الاكتساب', biof: 'En cours d\'acquisition' };
  let pedagogicalObservation = { 
    ar: 'المتعلم يحتاج إلى مزيد من ترسيخ القواعد الأساسية والتمرن على التمارين التطبيقية.',
    biof: 'L\'apprenant nécessite un renforcement des connaissances fondamentales et plus de pratique.'
  };

  if (diagnosticGrade >= 16) {
    overallRankTitle = { ar: 'مستوى متميز (امتياز)', biof: 'Niveau d\'Excellence (Très Bien)' };
    pedagogicalObservation = {
      ar: 'تحكم ممتاز في المفاهيم الرياضية، دقة عالية في البرهان، وقدرة متميزة على تجنب الفخاخ المنهجية.',
      biof: 'Excellente maîtrise des concepts, haute rigueur de démonstration et évitement parfait des pièges didactiques.'
    };
  } else if (diagnosticGrade >= 13) {
    overallRankTitle = { ar: 'مستوى جيد ومتحكم (مستحسن)', biof: 'Bon Niveau de Maîtrise (Bien)' };
    pedagogicalObservation = {
      ar: 'استيعاب طيب للمقرر الدراسي، ينصح بالتركيز على مسائل الاستدلال والبرهان الأكثر عمقاً.',
      biof: 'Bonne assimilation du programme officiel, travaillez davantage les questions de raisonnement approfondi.'
    };
  } else if (diagnosticGrade >= 10) {
    overallRankTitle = { ar: 'مستوى متوسط (مقبول)', biof: 'Niveau Moyen (Passable)' };
    pedagogicalObservation = {
      ar: 'الحد الأدنى من الكفايات محقق، لكن توجد ثغرات يجب تداركها خاصة في الخطوات الوسيطية للحساب.',
      biof: 'Le socle minimal est acquis, mais des lacunes subsistent dans les étapes intermédiaires de calcul.'
    };
  }

  const strengths: { ar: string; biof: string }[] = [];
  const weaknesses: { ar: string; biof: string }[] = [];

  Object.entries(stats.competencyScores).forEach(([key, score]) => {
    if (score.total > 0) {
      const ratio = score.correct / score.total;
      const compKey = key as Competency;
      const compNames: Record<Competency, { ar: string; biof: string }> = {
        restitution: { ar: 'استرداد المعارف والتعاريف', biof: 'Restitution des connaissances' },
        application: { ar: 'التطبيق المباشر للقواعد', biof: 'Application directe des règles' },
        reasoning: { ar: 'الاستدلال والبرهان الرياضي', biof: 'Raisonnement & Démonstration' },
        problem_solving: { ar: 'حل الوضعيات والمسائل', biof: 'Résolution de problèmes' }
      };

      if (ratio >= 0.7) {
        strengths.push({
          ar: `إتقان كفاية ${compNames[compKey].ar} بنسبة ${Math.round(ratio * 100)}%`,
          biof: `Maîtrise de la compétence ${compNames[compKey].biof} à ${Math.round(ratio * 100)}%`
        });
      } else {
        weaknesses.push({
          ar: `حاجة إلى دعم كفاية ${compNames[compKey].ar} (نسبة النجاح ${Math.round(ratio * 100)}%)`,
          biof: `Besoin de renforcement en ${compNames[compKey].biof} (${Math.round(ratio * 100)}% de réussite)`
        });
      }
    }
  });

  if (strengths.length === 0) {
    strengths.push({
      ar: 'المثابرة والمحاولة المستمرة لحل التحديات',
      biof: 'Persévérance et volonté d\'apprentissage'
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push({
      ar: 'الحفاظ على نفس وتيرة التركيز وتجنب التسرع',
      biof: 'Maintenir la même rigueur et éviter la précipitation'
    });
  }

  const officialInspectorAdvice = {
    ar: 'نصيحة المفتش التربوي: الرياضيات لا تُقرأ بالعين مجردة، بل بالممارسة بالقلم والورقة، وكتابة التعليل الرياضي الكامل لكل خطوة، ومراجعة الأخطاء الشائعة في دفاتر الفروض السابقة.',
    biof: 'Conseil de l\'Inspecteur Pédagogique : Les mathématiques s\'apprennent la plume à la main. Rédigez toujours chaque étape de raisonnement et tenez un cahier d\'erreurs pour les examens.'
  };

  return {
    overallRankTitle,
    diagnosticGrade,
    pedagogicalObservation,
    strengths,
    weaknesses,
    officialInspectorAdvice
  };
}

export interface FunctionDef {
  id: string;
  name: string;
  label: string;
  fn: (x: number) => number;
  derivative: (x: number) => number;
  formula: string;
  domain: [number, number];
  presetPoints: number[];
}

export const LAB_FUNCTIONS: FunctionDef[] = [
  {
    id: 'poly2',
    name: 'شبه مكافئ (ثانية إعدادي / جذع مشترك)',
    label: 'f(x) = x² - 4x + 3',
    formula: 'x^2 - 4x + 3',
    fn: (x: number) => x * x - 4 * x + 3,
    derivative: (x: number) => 2 * x - 4,
    domain: [-2, 6],
    presetPoints: [0, 1, 2, 3, 4]
  },
  {
    id: 'poly3',
    name: 'دالة تكعيبية (1 و 2 باكالوريا)',
    label: 'f(x) = x³ - 3x',
    formula: 'x^3 - 3x',
    fn: (x: number) => Math.pow(x, 3) - 3 * x,
    derivative: (x: number) => 3 * Math.pow(x, 2) - 3,
    domain: [-3, 3],
    presetPoints: [-2, -1, 0, 1, 2]
  },
  {
    id: 'exponential',
    name: 'الدالة الأسية (2 باكالوريا)',
    label: 'f(x) = e^x - 2',
    formula: 'e^x - 2',
    fn: (x: number) => Math.exp(x) - 2,
    derivative: (x: number) => Math.exp(x),
    domain: [-3, 3],
    presetPoints: [-1, 0, 1]
  },
  {
    id: 'trig',
    name: 'الدالة الجيبية (جذع / 1 باك)',
    label: 'f(x) = 2 sin(x)',
    formula: '2 \\sin(x)',
    fn: (x: number) => 2 * Math.sin(x),
    derivative: (x: number) => 2 * Math.cos(x),
    domain: [-4, 4],
    presetPoints: [-3.14, -1.57, 0, 1.57, 3.14]
  }
];

// ============================================================================
// Proposal 1: Leitner Spaced Repetition System (نظام التكرار المتباعد الذكي)
// ============================================================================
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

export const LEITNER_INTERVAL_DAYS: Record<LeitnerBox, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 21
};

export interface LeitnerCardState {
  cardId: string;
  box: LeitnerBox;
  lastReviewedISO: string;
  nextReviewISO: string;
  reviewCount: number;
  lapses: number;
}

export interface LeitnerDeckStats {
  boxCounts: Record<LeitnerBox, number>;
  unseenCount: number;
  dueTodayCount: number;
  longTermMasteryPct: number;
}

function addDaysToISO(baseISO: string, days: number): string {
  const date = new Date(`${baseISO.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() + days);
    return fallback.toISOString().slice(0, 10);
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function evaluateLeitnerReview(
  prev: LeitnerCardState | undefined,
  cardId: string,
  rating: 'again' | 'good' | 'easy',
  todayISO: string = new Date().toISOString().slice(0, 10)
): LeitnerCardState {
  const currentBox: LeitnerBox = prev?.box ?? 1;
  let nextBox: LeitnerBox = 1;
  let lapses = prev?.lapses ?? 0;

  if (rating === 'again') {
    nextBox = 1;
    lapses += 1;
  } else if (rating === 'good') {
    nextBox = (prev ? Math.min(5, currentBox + 1) : 2) as LeitnerBox;
  } else {
    nextBox = (prev ? Math.min(5, currentBox + 2) : 3) as LeitnerBox;
  }

  const intervalDays = LEITNER_INTERVAL_DAYS[nextBox];
  const nextReviewISO = addDaysToISO(todayISO, intervalDays);

  return {
    cardId,
    box: nextBox,
    lastReviewedISO: todayISO,
    nextReviewISO,
    reviewCount: (prev?.reviewCount ?? 0) + 1,
    lapses
  };
}

export function isLeitnerCardDue(
  state: LeitnerCardState | undefined,
  todayISO: string = new Date().toISOString().slice(0, 10)
): boolean {
  if (!state) return true;
  return state.nextReviewISO <= todayISO;
}

export function computeLeitnerDeckStats(
  cardIds: string[],
  srsMap: Record<string, LeitnerCardState>,
  todayISO: string = new Date().toISOString().slice(0, 10)
): LeitnerDeckStats {
  const boxCounts: Record<LeitnerBox, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let unseenCount = 0;
  let dueTodayCount = 0;
  let longTermCount = 0;

  for (const id of cardIds) {
    const state = srsMap[id];
    if (!state) {
      unseenCount += 1;
      dueTodayCount += 1;
    } else {
      boxCounts[state.box] = (boxCounts[state.box] || 0) + 1;
      if (state.nextReviewISO <= todayISO) {
        dueTodayCount += 1;
      }
      if (state.box >= 3) {
        longTermCount += 1;
      }
    }
  }

  const longTermMasteryPct =
    cardIds.length > 0 ? Math.round((longTermCount / cardIds.length) * 100) : 0;

  return {
    boxCounts,
    unseenCount,
    dueTodayCount,
    longTermMasteryPct
  };
}

// ============================================================================
// Proposal 2: Handwritten & Algebraic Step Verification Engine (فحص خطوات المسودة)
// ============================================================================
export interface ScratchpadStepAnalysis {
  stepNumber: number;
  rawStep: string;
  formulaLatex: string;
  status: 'correct' | 'error' | 'warning';
  comment: LocalizedString;
}

export interface ScratchpadVerificationResult {
  isAllCorrect: boolean;
  errorStepNumber: number | null;
  steps: ScratchpadStepAnalysis[];
  overallVerdict: LocalizedString;
  correctedFinalStepLatex: string;
  inspectorAdvice: LocalizedString;
  source: 'gemini_vision' | 'deterministic_inspector';
}

function parseLinearEquationRoot(line: string): number | null {
  const normalized = line
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/');
  if (!normalized.includes('=') || !normalized.includes('x')) return null;
  if (normalized.includes('^') || normalized.includes('²') || normalized.includes('ln') || normalized.includes('sin')) {
    return null;
  }

  const parts = normalized.split('=');
  if (parts.length !== 2) return null;

  const parseLinearSide = (expr: string): { a: number; b: number } | null => {
    let a = 0;
    let b = 0;
    const withPlus = expr.replace(/(?=[+-])/g, ' ').trim();
    if (!withPlus) return null;
    const tokens = withPlus.split(/\s+/);

    for (const tok of tokens) {
      if (!tok) continue;
      if (tok.includes('x')) {
        const coeffStr = tok.replace('x', '').replace('*', '');
        if (coeffStr === '' || coeffStr === '+') a += 1;
        else if (coeffStr === '-') a -= 1;
        else {
          const val = Number(coeffStr);
          if (Number.isNaN(val)) return null;
          a += val;
        }
      } else {
        if (tok.includes('/')) {
          const [num, den] = tok.split('/').map(Number);
          if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
          b += num / den;
        } else {
          const val = Number(tok);
          if (Number.isNaN(val)) return null;
          b += val;
        }
      }
    }
    return { a, b };
  };

  const left = parseLinearSide(parts[0]);
  const right = parseLinearSide(parts[1]);
  if (!left || !right) return null;

  const netA = left.a - right.a;
  const netB = right.b - left.b;
  if (Math.abs(netA) < 1e-9) return null;
  return netB / netA;
}

type InequalityOp = '<' | '>' | '<=' | '>=';

function parseLinearSideExpr(expr: string): { a: number; b: number } | null {
  let a = 0;
  let b = 0;
  const withPlus = expr.replace(/(?=[+-])/g, ' ').trim();
  if (!withPlus) return null;
  const tokens = withPlus.split(/\s+/);

  for (const tok of tokens) {
    if (!tok) continue;
    if (tok.includes('x')) {
      const coeffStr = tok.replace('x', '').replace('*', '');
      if (coeffStr === '' || coeffStr === '+') a += 1;
      else if (coeffStr === '-') a -= 1;
      else {
        const val = Number(coeffStr);
        if (Number.isNaN(val)) return null;
        a += val;
      }
    } else {
      if (tok.includes('/')) {
        const [num, den] = tok.split('/').map(Number);
        if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
        b += num / den;
      } else {
        const val = Number(tok);
        if (Number.isNaN(val)) return null;
        b += val;
      }
    }
  }
  return { a, b };
}

function flipInequalityOp(op: InequalityOp): InequalityOp {
  if (op === '<') return '>';
  if (op === '>') return '<';
  if (op === '<=') return '>=';
  return '<=';
}

function parseLinearInequality(line: string): { bound: number; op: InequalityOp; dividedByNegative: boolean } | null {
  const normalized = line
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/\\le/g, '<=')
    .replace(/\\ge/g, '>=');

  if (!normalized.includes('x')) return null;
  if (normalized.includes('^') || normalized.includes('²') || normalized.includes('ln') || normalized.includes('sin')) {
    return null;
  }

  let rawOp: InequalityOp | null = null;
  for (const candidate of ['<=', '>=', '<', '>'] as InequalityOp[]) {
    if (normalized.includes(candidate)) {
      rawOp = candidate;
      break;
    }
  }
  if (!rawOp) return null;

  const parts = normalized.split(rawOp);
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  const left = parseLinearSideExpr(parts[0]);
  const right = parseLinearSideExpr(parts[1]);
  if (!left || !right) return null;

  const netA = left.a - right.a;
  const netB = right.b - left.b;
  if (Math.abs(netA) < 1e-9) return null;

  const dividedByNegative = netA < 0;
  const canonicalOp = dividedByNegative ? flipInequalityOp(rawOp) : rawOp;
  return {
    bound: netB / netA,
    op: canonicalOp,
    dividedByNegative
  };
}

function parseQuadraticEquation(
  line: string
): { a: number; b: number; c: number; delta: number; roots: number[] } | null {
  const normalized = line
    .replace(/\s+/g, '')
    .replace(/−/g, '-')
    .replace(/²/g, '^2');

  if (!normalized.includes('=0')) return null;
  const parts = normalized.split('=');
  if (parts.length !== 2 || parts[1] !== '0') return null;

  const match = parts[0].match(/^([+-]?\d*)x\^2([+-]\d*)x([+-]\d+)$/i);
  if (!match) return null;

  const parseCoeff = (s: string): number => {
    if (s === '' || s === '+') return 1;
    if (s === '-') return -1;
    return Number(s);
  };

  const a = parseCoeff(match[1]);
  const b = parseCoeff(match[2]);
  const c = Number(match[3]);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || Math.abs(a) < 1e-9) {
    return null;
  }

  const delta = b * b - 4 * a * c;
  let roots: number[] = [];
  if (delta > 1e-9) {
    const r1 = (-b - Math.sqrt(delta)) / (2 * a);
    const r2 = (-b + Math.sqrt(delta)) / (2 * a);
    roots = [r1, r2].sort((u, v) => u - v);
  } else if (Math.abs(delta) <= 1e-9) {
    roots = [-b / (2 * a)];
  }
  return { a, b, c, delta, roots };
}

function parseDeltaLineValue(line: string): number | null {
  const normalized = line.replace(/\s+/g, '').replace(/−/g, '-');
  if (!/^(Δ|\\delta|delta)=/i.test(normalized)) return null;
  const segments = normalized.split('=');
  const lastSeg = segments[segments.length - 1];
  if (!lastSeg) return null;
  if (/^[+-]?\d+(\.\d+)?$/.test(lastSeg)) {
    return Number(lastSeg);
  }
  return null;
}

export function verifyAlgebraicStepsDeterministic(
  stepsInput: string[],
  problemContext: string = ''
): ScratchpadVerificationResult {
  const cleanedSteps = stepsInput.map(s => s.trim()).filter(Boolean);

  if (cleanedSteps.length === 0) {
    return {
      isAllCorrect: false,
      errorStepNumber: null,
      steps: [],
      overallVerdict: {
        ar: 'المسودة فارغة حالياً. ارسم خطوات الحل أو أدرج السطور الجبرية لفحصها.',
        biof: 'Le brouillon est vide. Dessinez ou saisissez vos étapes algébriques pour les vérifier.'
      },
      correctedFinalStepLatex: '',
      inspectorAdvice: {
        ar: 'توجيه المفتش: اكتب كل خطوة في سطر مستقل مع الحفاظ على تكافؤ المعادلات والمتراجحات.',
        biof: "Conseil de l'Inspecteur : Rédigez chaque étape sur une ligne distincte en préservant l'équivalence."
      },
      source: 'deterministic_inspector'
    };
  }

  let errorStepNumber = null as number | null;
  let baselineRoot = null as number | null;
  let baselineInequality = null as { bound: number; op: InequalityOp } | null;
  let baselineQuadratic = null as { a: number; b: number; c: number; delta: number; roots: number[] } | null;
  let correctedFinalStepLatex = cleanedSteps[cleanedSteps.length - 1];

  const steps: ScratchpadStepAnalysis[] = cleanedSteps.map((raw, idx) => {
    const stepNum = idx + 1;
    const compact = raw.replace(/\s+/g, '').toLowerCase();

    // 0. Check Quadratic Equation & Discriminant Δ = b^2 - 4ac
    const parsedQuad = parseQuadraticEquation(raw);
    if (parsedQuad !== null && baselineQuadratic === null) {
      baselineQuadratic = parsedQuad;
    } else if (baselineQuadratic !== null) {
      const formatQuadSolution = (q: { delta: number; roots: number[] }): string => {
        if (q.delta < 0) return '\\Delta < 0 \\implies S = \\emptyset';
        if (q.roots.length === 1) return `\\Delta = 0 \\implies x = ${q.roots[0]}`;
        return `\\Delta = ${q.delta} \\implies S = \\{${q.roots[0]} ; ${q.roots[1]}\\}`;
      };

      const studentDelta = parseDeltaLineValue(raw);
      if (studentDelta !== null) {
        if (Math.abs(studentDelta - baselineQuadratic.delta) > 1e-6) {
          if (errorStepNumber === null) errorStepNumber = stepNum;
          correctedFinalStepLatex = formatQuadSolution(baselineQuadratic);
          return {
            stepNumber: stepNum,
            rawStep: raw,
            formulaLatex: raw,
            status: 'error',
            comment: {
              ar: `خطأ في السطر ${stepNum}: حساب المميز Δ = b² - 4ac غير سليم! القيمة الصحيحة هي Δ = (${baselineQuadratic.b})² - 4(${baselineQuadratic.a})(${baselineQuadratic.c}) = ${baselineQuadratic.delta} وليس ${studentDelta}.`,
              biof: `Erreur à la ligne ${stepNum} : Le calcul du discriminant Δ = b² - 4ac est faux ! La valeur exacte est Δ = ${baselineQuadratic.delta} (et non ${studentDelta}).`
            }
          };
        }
      } else if (compact.includes('x=') || compact.includes('x_1=') || compact.includes('x1=')) {
        const numberMatches = raw.replace(/x_[12]|x[12]/gi, 'x').match(/[+-]?\d+(\.\d+)?/g);
        if (numberMatches && baselineQuadratic.roots.length > 0) {
          const studentNums = numberMatches.map(Number).sort((u, v) => u - v);
          const rootsMatch =
            studentNums.length === baselineQuadratic.roots.length &&
            studentNums.every((val, i) => Math.abs(val - baselineQuadratic!.roots[i]) <= 1e-4);
          if (!rootsMatch) {
            if (errorStepNumber === null) errorStepNumber = stepNum;
            correctedFinalStepLatex = formatQuadSolution(baselineQuadratic);
            return {
              stepNumber: stepNum,
              rawStep: raw,
              formulaLatex: raw,
              status: 'error',
              comment: {
                ar: `خطأ في السطر ${stepNum}: خطأ في تعويض صيغة الجذرين (-b ± √Δ)/(2a) (انتبه لإشارة -b). الجذور الصحيحة هي: ${baselineQuadratic.roots.join(' و ')}.`,
                biof: `Erreur à la ligne ${stepNum} : Mauvaise application de (-b ± √Δ)/(2a). Les racines exactes sont : ${baselineQuadratic.roots.join(' et ')}.`
              }
            };
          }
        }
      }
    }

    // 1. Check classic remarkable identity error: (a+b)^2 = a^2 + b^2 or (x+3)^2 = x^2 + 9
    const eqSides = compact.split('=');
    if (
      eqSides.length === 2 &&
      /^\([a-z0-9+]+\)\^?2$/i.test(eqSides[0]) &&
      eqSides[1].split('+').length === 2
    ) {
      if (errorStepNumber === null) errorStepNumber = stepNum;
      correctedFinalStepLatex = '(a + b)^2 = a^2 + 2ab + b^2';
      return {
        stepNumber: stepNum,
        rawStep: raw,
        formulaLatex: raw,
        status: 'error',
        comment: {
          ar: 'خطأ منهجي شائع: نسيان الجداء المزدوج (2ab) أثناء نشر المتطابقة الهامة (a+b)² = a² + 2ab + b².',
          biof: 'Erreur classique : Oubli du double produit (2ab) dans le développement de (a+b)² = a² + 2ab + b².'
        }
      };
    }

    // 2. Check chain rule derivative error on e^(kx) -> e^(kx) without k
    if (
      (compact.includes("(e^{2x})'=e^{2x}") || compact.includes("(e^(2x))'=e^(2x)")) &&
      !compact.includes('2e')
    ) {
      if (errorStepNumber === null) errorStepNumber = stepNum;
      correctedFinalStepLatex = "(e^{2x})' = 2e^{2x}";
      return {
        stepNumber: stepNum,
        rawStep: raw,
        formulaLatex: raw,
        status: 'error',
        comment: {
          ar: "خطأ في اشتقاق الدالة المركبة: مشتقة e^{u(x)} هي u'(x)·e^{u(x)}، أي يجب الضرب في مشتقة الأس (2).",
          biof: "Erreur de dérivation composée : (e^{u(x)})' = u'(x)·e^{u(x)}, il faut multiplier par la dérivée de l'exposant (2)."
        }
      };
    }

    // 3. Check logarithm sum trap: ln(a+b) = ln(a) + ln(b)
    if (compact.includes('ln(a+b)=ln(a)+ln(b)') || compact.includes('ln(x+1)=ln(x)+ln(1)')) {
      if (errorStepNumber === null) errorStepNumber = stepNum;
      correctedFinalStepLatex = '\\ln(a \\times b) = \\ln(a) + \\ln(b)';
      return {
        stepNumber: stepNum,
        rawStep: raw,
        formulaLatex: raw,
        status: 'error',
        comment: {
          ar: 'خطأ مفاهيمي جسيم: اللوغاريتم النيبيري يحول الجداء إلى مجموع ln(a·b) = ln(a)+ln(b) وليس المجموع ln(a+b).',
          biof: 'Erreur conceptuelle : Le logarithme transforme le produit en somme ln(a·b) = ln(a)+ln(b), jamais une somme ln(a+b).'
        }
      };
    }

    // 4. Check linear equation equivalence across steps (only when not in a quadratic system)
    const currentRoot = baselineQuadratic === null ? parseLinearEquationRoot(raw) : null;
    if (currentRoot !== null) {
      if (baselineRoot === null) {
        baselineRoot = currentRoot;
      } else if (Math.abs(currentRoot - baselineRoot) > 1e-6) {
        if (errorStepNumber === null) errorStepNumber = stepNum;
        const cleanRoot = Number.isInteger(baselineRoot)
          ? String(baselineRoot)
          : baselineRoot.toFixed(2);
        correctedFinalStepLatex = `x = ${cleanRoot}`;
        return {
          stepNumber: stepNum,
          rawStep: raw,
          formulaLatex: raw,
          status: 'error',
          comment: {
            ar: `خطأ في السطر ${stepNum}: تغير حل المعادلة عند الانتقال لهذا السطر (ربما نسيت تغيير إشارة الحد عند نقله للطرف الآخر أو أخطأت في القسمة). الحل الصحيح هو x = ${cleanRoot}.`,
            biof: `Erreur à la ligne ${stepNum} : L'équivalence de l'équation est rompue (vérifiez le changement de signe lors de la transposition). Solution exacte : x = ${cleanRoot}.`
          }
        };
      }
    }

    // 5. Check linear inequality equivalence & negative-division sign-flip rule
    const currentIneq = parseLinearInequality(raw);
    if (currentIneq !== null) {
      if (baselineInequality === null) {
        baselineInequality = { bound: currentIneq.bound, op: currentIneq.op };
      } else {
        const cleanBound = Number.isInteger(baselineInequality.bound)
          ? String(baselineInequality.bound)
          : baselineInequality.bound.toFixed(2);
        const sameBound = Math.abs(currentIneq.bound - baselineInequality.bound) <= 1e-6;
        const sameOp = currentIneq.op === baselineInequality.op;

        if (!sameOp || !sameBound) {
          if (errorStepNumber === null) errorStepNumber = stepNum;
          correctedFinalStepLatex = `x ${baselineInequality.op} ${cleanBound}`;
          const isDirectionFlipTrap = sameBound && !sameOp;
          return {
            stepNumber: stepNum,
            rawStep: raw,
            formulaLatex: raw,
            status: 'error',
            comment: isDirectionFlipTrap
              ? {
                  ar: `خطأ في السطر ${stepNum}: نسيت عكس اتجاه رمز المتراجحة عند القسمة على عدد سالب! المتراجحة المكافئة الصحيحة هي x ${baselineInequality.op} ${cleanBound}.`,
                  biof: `Erreur à la ligne ${stepNum} : Vous avez oublié d'inverser le sens de l'inégalité lors de la division par un nombre négatif ! Résultat exact : x ${baselineInequality.op} ${cleanBound}.`
                }
              : {
                  ar: `خطأ في السطر ${stepNum}: تغيرت مجموعة حلول المتراجحة (تحقق من الإشارات عند النقل أو القسمة). النتيجة الصحيحة هي x ${baselineInequality.op} ${cleanBound}.`,
                  biof: `Erreur à la ligne ${stepNum} : L'équivalence de l'inéquation est rompue. Résultat exact : x ${baselineInequality.op} ${cleanBound}.`
                }
          };
        }
      }
    }

    return {
      stepNumber: stepNum,
      rawStep: raw,
      formulaLatex: raw,
      status: 'correct',
      comment: {
        ar: `السطر ${stepNum} سليم رياضياً ومنطقياً.`,
        biof: `L'étape ${stepNum} est mathématiquement correcte.`
      }
    };
  });

  const finalRoot: number | null = baselineRoot;
  if (finalRoot !== null && errorStepNumber === null) {
    const cleanRoot = Number.isInteger(finalRoot)
      ? String(finalRoot)
      : finalRoot.toFixed(2);
    correctedFinalStepLatex = `x = ${cleanRoot}`;
  } else if (baselineInequality !== null && errorStepNumber === null) {
    const cleanBound = Number.isInteger(baselineInequality.bound)
      ? String(baselineInequality.bound)
      : baselineInequality.bound.toFixed(2);
    correctedFinalStepLatex = `x ${baselineInequality.op} ${cleanBound}`;
  } else if (baselineQuadratic !== null && errorStepNumber === null) {
    correctedFinalStepLatex =
      baselineQuadratic.roots.length === 2
        ? `\\Delta = ${baselineQuadratic.delta} \\implies S = \\{${baselineQuadratic.roots[0]} ; ${baselineQuadratic.roots[1]}\\}`
        : baselineQuadratic.roots.length === 1
        ? `\\Delta = 0 \\implies S = \\{${baselineQuadratic.roots[0]}\\}`
        : '\\Delta < 0 \\implies S = \\emptyset';
  }

  const isAllCorrect = errorStepNumber === null;

  return {
    isAllCorrect,
    errorStepNumber,
    steps,
    overallVerdict: isAllCorrect
      ? {
          ar: `أحسنت! جميع الخطوات (${steps.length}/${steps.length}) متكافئة وسليمة رياضياً${problemContext ? ` في تمرين «${problemContext}»` : ''}.`,
          biof: `Excellent ! Toutes les étapes (${steps.length}/${steps.length}) sont rigoureuses et mathématiquement valides.`
        }
      : {
          ar: `تم رصد خلل جبرية/منهجي في السطر رقم ${errorStepNumber}. راجع الملاحظة التصحيحية أسفله لتصويب البرهان.`,
          biof: `Une erreur algébrique a été détectée à la ligne ${errorStepNumber}. Consultez la correction détaillée ci-dessous.`
        },
    correctedFinalStepLatex,
    inspectorAdvice: isAllCorrect
      ? {
          ar: 'توجيه المفتش: منهجية تحريرك ممتازة؛ احرص يوم الامتحان على تأطير النتيجة النهائية وكتابة مجموعة الحلول S.',
          biof: "Conseil de l'Inspecteur : Excellente rédaction ; pensez à encadrer le résultat final et à noter l'ensemble des solutions S."
        }
      : {
          ar: 'توجيه المفتش: عند نقل حد من طرف لآخر في معادلة أو متراجحة، تتغير إشارته وجوباً، وعند النشر احذر من نسيان الجداء المزدوج.',
          biof: "Conseil de l'Inspecteur : Lors de la transposition d'un terme d'un membre à l'autre, changez systématiquement son signe."
        },
    source: 'deterministic_inspector'
  };
}

// ============================================================================
// Proposal 3: Teacher Analytics Portal & Class Mastery Heatmap (فضاء الأستاذ)
// ============================================================================
export interface ClassStudentRecord {
  studentId: string;
  studentName: string;
  levelId: LevelId;
  streamId: StreamId;
  solvedCount: number;
  diagnosticGradeOn20: number;
  domainMasteryPct: Record<MathDomain, number>;
  competencyMasteryPct: Record<Competency, number>;
  lastActiveISO: string;
}

export interface ClassAnalyticsSummary {
  classCode: string;
  studentCount: number;
  averageGradeOn20: number;
  domainAveragesPct: Record<MathDomain, number>;
  competencyAveragesPct: Record<Competency, number>;
  weakestClassDomain: MathDomain;
  weakestClassCompetency: Competency;
  prioritySupportStudents: string[];
  collectiveRecommendation: LocalizedString;
}

export const DEFAULT_CLASSROOM_STUDENTS: ClassStudentRecord[] = [
  {
    studentId: 'cls-st-1',
    studentName: 'ياسين العلمي',
    levelId: '2bac',
    streamId: '2bac_pc',
    solvedCount: 34,
    diagnosticGradeOn20: 16.5,
    domainMasteryPct: {
      arithmetic_algebra: 88,
      analysis_functions: 84,
      geometry_trig: 76,
      probability_stats: 80
    },
    competencyMasteryPct: {
      restitution: 92,
      application: 85,
      reasoning: 78,
      problem_solving: 74
    },
    lastActiveISO: '2026-11-14'
  },
  {
    studentId: 'cls-st-2',
    studentName: 'فاطمة الزهراء بنجلون',
    levelId: '2bac',
    streamId: '2bac_pc',
    solvedCount: 29,
    diagnosticGradeOn20: 14.8,
    domainMasteryPct: {
      arithmetic_algebra: 82,
      analysis_functions: 79,
      geometry_trig: 62,
      probability_stats: 71
    },
    competencyMasteryPct: {
      restitution: 86,
      application: 78,
      reasoning: 68,
      problem_solving: 64
    },
    lastActiveISO: '2026-11-14'
  },
  {
    studentId: 'cls-st-3',
    studentName: 'عمر التازي',
    levelId: '2bac',
    streamId: '2bac_pc',
    solvedCount: 19,
    diagnosticGradeOn20: 10.6,
    domainMasteryPct: {
      arithmetic_algebra: 68,
      analysis_functions: 54,
      geometry_trig: 42,
      probability_stats: 48
    },
    competencyMasteryPct: {
      restitution: 70,
      application: 58,
      reasoning: 44,
      problem_solving: 38
    },
    lastActiveISO: '2026-11-14'
  },
  {
    studentId: 'cls-st-4',
    studentName: 'زينب الإدريسي',
    levelId: '2bac',
    streamId: '2bac_pc',
    solvedCount: 25,
    diagnosticGradeOn20: 13.2,
    domainMasteryPct: {
      arithmetic_algebra: 75,
      analysis_functions: 72,
      geometry_trig: 55,
      probability_stats: 61
    },
    competencyMasteryPct: {
      restitution: 80,
      application: 71,
      reasoning: 59,
      problem_solving: 52
    },
    lastActiveISO: '2026-11-14'
  },
  {
    studentId: 'cls-st-5',
    studentName: 'حمزة المرابط',
    levelId: '2bac',
    streamId: '2bac_pc',
    solvedCount: 16,
    diagnosticGradeOn20: 9.4,
    domainMasteryPct: {
      arithmetic_algebra: 60,
      analysis_functions: 49,
      geometry_trig: 38,
      probability_stats: 45
    },
    competencyMasteryPct: {
      restitution: 64,
      application: 52,
      reasoning: 40,
      problem_solving: 35
    },
    lastActiveISO: '2026-11-13'
  }
];

export function studentStatsToClassRecord(
  stats: UserStats,
  studentName: string,
  levelId: LevelId,
  streamId: StreamId
): ClassStudentRecord {
  const review = generateInspectorReview(stats);
  const calcPct = (c: number, t: number, fallback: number) =>
    t > 0 ? Math.round((c / t) * 100) : fallback;

  return {
    studentId: `student-${(studentName || 'guest').trim().toLowerCase().replace(/\s+/g, '-')}`,
    studentName: (studentName || 'المتعلم الحالي').trim(),
    levelId,
    streamId,
    solvedCount: stats.solvedCount,
    diagnosticGradeOn20: stats.solvedCount > 0 ? review.diagnosticGrade : 12.0,
    domainMasteryPct: {
      arithmetic_algebra: calcPct(
        stats.domainScores.arithmetic_algebra.correct,
        stats.domainScores.arithmetic_algebra.total,
        65
      ),
      analysis_functions: calcPct(
        stats.domainScores.analysis_functions.correct,
        stats.domainScores.analysis_functions.total,
        60
      ),
      geometry_trig: calcPct(
        stats.domainScores.geometry_trig.correct,
        stats.domainScores.geometry_trig.total,
        55
      ),
      probability_stats: calcPct(
        stats.domainScores.probability_stats.correct,
        stats.domainScores.probability_stats.total,
        58
      )
    },
    competencyMasteryPct: {
      restitution: calcPct(
        stats.competencyScores.restitution.correct,
        stats.competencyScores.restitution.total,
        70
      ),
      application: calcPct(
        stats.competencyScores.application.correct,
        stats.competencyScores.application.total,
        65
      ),
      reasoning: calcPct(
        stats.competencyScores.reasoning.correct,
        stats.competencyScores.reasoning.total,
        55
      ),
      problem_solving: calcPct(
        stats.competencyScores.problem_solving.correct,
        stats.competencyScores.problem_solving.total,
        50
      )
    },
    lastActiveISO: new Date().toISOString().slice(0, 10)
  };
}

export function computeClassAnalyticsSummary(
  classCode: string,
  students: ClassStudentRecord[]
): ClassAnalyticsSummary {
  const list = students.length > 0 ? students : DEFAULT_CLASSROOM_STUDENTS;
  const n = list.length;

  const avgGrade =
    Math.round((list.reduce((acc, s) => acc + s.diagnosticGradeOn20, 0) / n) * 10) / 10;

  const domainKeys: MathDomain[] = [
    'arithmetic_algebra',
    'analysis_functions',
    'geometry_trig',
    'probability_stats'
  ];
  const compKeys: Competency[] = [
    'restitution',
    'application',
    'reasoning',
    'problem_solving'
  ];

  const domainAveragesPct = {} as Record<MathDomain, number>;
  let weakestClassDomain: MathDomain = 'geometry_trig';
  let minDomScore = Infinity;

  for (const d of domainKeys) {
    const avg = Math.round(list.reduce((acc, s) => acc + (s.domainMasteryPct[d] ?? 0), 0) / n);
    domainAveragesPct[d] = avg;
    if (avg < minDomScore) {
      minDomScore = avg;
      weakestClassDomain = d;
    }
  }

  const competencyAveragesPct = {} as Record<Competency, number>;
  let weakestClassCompetency: Competency = 'problem_solving';
  let minCompScore = Infinity;

  for (const c of compKeys) {
    const avg = Math.round(list.reduce((acc, s) => acc + (s.competencyMasteryPct[c] ?? 0), 0) / n);
    competencyAveragesPct[c] = avg;
    if (avg < minCompScore) {
      minCompScore = avg;
      weakestClassCompetency = c;
    }
  }

  const prioritySupportStudents = list
    .filter(s => s.diagnosticGradeOn20 < 12 || s.domainMasteryPct[weakestClassDomain] < 55)
    .map(s => s.studentName);

  const domName = DOMAINS[weakestClassDomain].name;
  const compTitles: Record<Competency, LocalizedString> = {
    restitution: { ar: 'استرداد المعارف', biof: 'Restitution des connaissances' },
    application: { ar: 'التطبيق المباشر للقواعد', biof: 'Application directe' },
    reasoning: { ar: 'الاستدلال والبرهان الرياضي', biof: 'Raisonnement & Démonstration' },
    problem_solving: { ar: 'حل المسائل المركبة', biof: 'Résolution de problèmes' }
  };

  return {
    classCode,
    studentCount: n,
    averageGradeOn20: avgGrade,
    domainAveragesPct,
    competencyAveragesPct,
    weakestClassDomain,
    weakestClassCompetency,
    prioritySupportStudents,
    collectiveRecommendation: {
      ar: `يُظهر المبيان الحراري للقسم (${classCode}) أن أضعف مجال جماعي هو «${domName.ar}» بمتوسط تحكم ${domainAveragesPct[weakestClassDomain]}%، وأضعف كفاية منهجية هي «${compTitles[weakestClassCompetency].ar}» (${competencyAveragesPct[weakestClassCompetency]}%). يُوصى ببرمجة حصة دعم جماعي مركزة مع تخصيص ورشة مواكبة لفائدة (${prioritySupportStudents.join('، ') || 'جميع المتعلمين'}).`,
      biof: `La carte thermique de la classe (${classCode}) indique un besoin prioritaire en « ${domName.biof} » (${domainAveragesPct[weakestClassDomain]}%) et sur la compétence « ${compTitles[weakestClassCompetency].biof} » (${competencyAveragesPct[weakestClassCompetency]}%). Planifiez une séance de remédiation collective ciblée.`
    }
  };
}

// ============================================================================
// Dynamic Ministerial Curriculum Linker & Personalized Learning Paths Engine
// (نظام الربط الديناميكي بقاعدة بيانات المناهج الوزارية ومسارات التعلم المخصصة)
// ============================================================================
export type LearningPathStage = 'remediation' | 'foundation' | 'consolidation' | 'excellence';

export interface PersonalizedPathStep {
  stepOrder: number;
  topic: CurriculumTopicTemplate;
  stage: LearningPathStage;
  priorityScore: number;
  domainAccuracyPct: number | null;
  missedInDomainCount: number;
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  recommendedActionTab: 'quiz' | 'pitfalls' | 'proof' | 'boss';
  linkedQuestionIds: string[];
  linkedQuestions: Question[];
  linkedSkillNodes: {
    id: string;
    title: LocalizedString;
    unlocked: boolean;
    stars: number;
  }[];
  linkedLessons: { id: string; title: LocalizedString }[];
  linkedPitfalls: { id: string; title: LocalizedString }[];
  linkedGlossaryTerms: { id: string; term: LocalizedString; symbol: string }[];
  pedagogicalRationale: LocalizedString;
  estimatedDurationMin: number;
}

export interface PersonalizedLearningPath {
  levelId: LevelId;
  streamId: StreamId;
  overallReadinessPct: number;
  estimatedGradeOn20: number;
  focusProfile: LearningPathStage;
  summaryTitle: LocalizedString;
  summaryAdvice: LocalizedString;
  steps: PersonalizedPathStep[];
  totalLinkedResourcesCount: number;
}

export function buildPersonalizedLearningPath(
  stats: UserStats,
  levelId: LevelId,
  streamId: StreamId
): PersonalizedLearningPath {
  // 1. Fetch official Ministerial curriculum topics for the student's level and stream
  const exactTopics = CURRICULUM_TOPICS_DATABASE.filter(
    t => t.levelId === levelId && (t.streams.includes(streamId) || t.streams.includes('general'))
  );
  const topics =
    exactTopics.length > 0
      ? exactTopics
      : CURRICULUM_TOPICS_DATABASE.filter(t => t.levelId === levelId);

  const missedList = stats.missedQuestions || [];
  const masteredSkills = stats.masteredSkills || {};
  const review = generateInspectorReview(stats);

  const reasoningAcc =
    stats.competencyScores.reasoning.total > 0
      ? Math.round((stats.competencyScores.reasoning.correct / stats.competencyScores.reasoning.total) * 100)
      : 50;

  const difficultyRank: Record<'easy' | 'medium' | 'hard', Record<'easy' | 'medium' | 'hard', number>> = {
    easy: { easy: 0, medium: 1, hard: 2 },
    medium: { medium: 0, easy: 1, hard: 2 },
    hard: { hard: 0, medium: 1, easy: 2 }
  };

  let totalLinkedResourcesCount = 0;

  const rawSteps: PersonalizedPathStep[] = topics.map(topic => {
    const domStat = stats.domainScores[topic.domain];
    const hasAttempts = domStat && domStat.total > 0;
    const domainAccuracyPct = hasAttempts
      ? Math.round((domStat.correct / domStat.total) * 100)
      : null;

    const missedInDomainCount = missedList.filter(
      m => m.question.domain === topic.domain && (m.question.levelId === levelId || m.wrongAttempts >= 1)
    ).length;

    // 2. Determine Learning Path Stage & Recommended Difficulty
    let stage: LearningPathStage = 'foundation';
    let recommendedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';

    if (missedInDomainCount > 0 || (domainAccuracyPct !== null && domainAccuracyPct < 55)) {
      stage = 'remediation';
      recommendedDifficulty = 'easy';
    } else if (!hasAttempts) {
      stage = 'foundation';
      recommendedDifficulty = 'easy';
    } else if (domainAccuracyPct !== null && domainAccuracyPct < 80) {
      stage = 'consolidation';
      recommendedDifficulty = 'medium';
    } else {
      stage = 'excellence';
      recommendedDifficulty = 'hard';
    }

    // 3. Dynamically link Questions, Lessons, Pitfalls, Glossary & Skill Nodes
    const candidateQuestions = filterQuestions(levelId, streamId, topic.domain);
    const domainMatchedQuestions = candidateQuestions.filter(q => q.domain === topic.domain);
    const pool = domainMatchedQuestions.length > 0 ? domainMatchedQuestions : candidateQuestions;
    const sortedQuestions = [...pool].sort(
      (a, b) => difficultyRank[recommendedDifficulty][a.difficulty] - difficultyRank[recommendedDifficulty][b.difficulty]
    );

    const exactLessons = LESSONS_DATABASE.filter(
      l => l.levelId === levelId && l.domain === topic.domain
    );
    const linkedLessons = (
      exactLessons.length > 0
        ? exactLessons
        : LESSONS_DATABASE.filter(l => l.levelId === levelId)
    ).map(l => ({ id: l.id, title: l.title }));

    const exactPitfalls = PITFALLS_DATABASE.filter(
      p => p.levelId === levelId && p.domain === topic.domain
    );
    const levelPitfalls = PITFALLS_DATABASE.filter(p => p.levelId === levelId);
    const linkedPitfalls = (
      exactPitfalls.length > 0 ? exactPitfalls : levelPitfalls
    ).map(p => ({ id: p.id, title: p.title }));

    const exactGlossary = GLOSSARY_DATABASE.filter(
      g => g.levels.includes(levelId) && g.domain === topic.domain
    );
    const linkedGlossaryTerms = (
      exactGlossary.length > 0
        ? exactGlossary
        : GLOSSARY_DATABASE.filter(g => g.levels.includes(levelId)).slice(0, 2)
    ).map(g => ({ id: g.id, term: g.term, symbol: g.symbol }));

    const levelSkills = SKILL_TREE_DATABASE.filter(s => s.levelId === levelId);
    const domainSkills = levelSkills.filter(s => s.domain === topic.domain);
    const linkedSkillNodes = (domainSkills.length > 0 ? domainSkills : levelSkills.slice(0, 1)).map(s => {
      const explicitStars = masteredSkills[s.id];
      const inferredStars =
        explicitStars !== undefined
          ? explicitStars
          : domainAccuracyPct === null
          ? 0
          : domainAccuracyPct >= 80
          ? 3
          : domainAccuracyPct >= 55
          ? 2
          : domainAccuracyPct >= 30
          ? 1
          : 0;
      const unlocked =
        s.prerequisites.length === 0 ||
        s.prerequisites.every(pid => {
          const pStars = masteredSkills[pid];
          if (pStars !== undefined) return pStars >= 1;
          return (domainAccuracyPct ?? 0) >= 35;
        });
      return {
        id: s.id,
        title: s.title,
        unlocked,
        stars: inferredStars
      };
    });

    totalLinkedResourcesCount +=
      sortedQuestions.length +
      linkedLessons.length +
      linkedPitfalls.length +
      linkedGlossaryTerms.length +
      linkedSkillNodes.length;

    // 4. Recommend optimal pedagogical arena for this step
    let recommendedActionTab: 'quiz' | 'pitfalls' | 'proof' | 'boss' = 'quiz';
    if (stage === 'remediation' && missedInDomainCount >= 2 && linkedPitfalls.length > 0) {
      recommendedActionTab = 'pitfalls';
    } else if (stage === 'excellence' && reasoningAcc < 75) {
      recommendedActionTab = 'proof';
    } else if (stage === 'excellence') {
      recommendedActionTab = 'boss';
    }

    // 5. Priority scoring: urgency of gap + exam weight + untried foundation
    const examBoost = topic.sessionType === 'exam_prep' ? 12 : topic.sessionType === 'exercises' ? 6 : 2;
    const gapScore =
      stage === 'remediation'
        ? 110 + (100 - (domainAccuracyPct ?? 40)) + missedInDomainCount * 15
        : stage === 'foundation'
        ? 75
        : stage === 'consolidation'
        ? 45 + (100 - (domainAccuracyPct ?? 65)) * 0.5
        : 15;
    const priorityScore = Math.round(gapScore + examBoost);

    const domLabel = DOMAINS[topic.domain].name;
    let pedagogicalRationale: LocalizedString;
    if (stage === 'remediation') {
      pedagogicalRationale = {
        ar: `أولوية تدارك: نسبة تحكمك في «${domLabel.ar}» هي ${domainAccuracyPct ?? 0}% مع ${missedInDomainCount} أخطاء مرصودة. ابدأ بتمارين التأسيس وكشف الفخاخ قبل الانتقال للتحديات الإشهادية.`,
        biof: `Priorité remédiation : maîtrise de ${domainAccuracyPct ?? 0}% en « ${domLabel.biof} » (${missedInDomainCount} erreurs détectées). Consolidez les bases avant les sujets d'examen.`
      };
    } else if (stage === 'foundation') {
      pedagogicalRationale = {
        ar: `محور غير مختبر بعد في مسارك الحالي. يُنصح بضبط ملخص الدرس (${linkedLessons.length}) والمفاهيم الأساسية ثم إنجاز التمارين المتدرجة (${sortedQuestions.length}).`,
        biof: `Chapitre non encore évalué. Consultez la fiche de synthèse (${linkedLessons.length}) puis enchaînez avec les exercices progressifs (${sortedQuestions.length}).`
      };
    } else if (stage === 'consolidation') {
      pedagogicalRationale = {
        ar: `أداء واعد (${domainAccuracyPct}%) في «${domLabel.ar}». أنت مؤهل الآن لتمارين التطبيق المتوسط ورفع الدقة فوق 80%.`,
        biof: `Progression encourageante (${domainAccuracyPct}%) en « ${domLabel.biof} ». Passez aux exercices intermédiaires pour dépasser le seuil de 80%.`
      };
    } else {
      pedagogicalRationale = {
        ar: `تمكن متميز (${domainAccuracyPct}%)! حان وقت تحديات الامتحان الإشهادي والبرهان المنطقي لترسيخ التميز (${topic.examWeightNote.ar}).`,
        biof: `Excellente maîtrise (${domainAccuracyPct}%) ! Passez aux défis d'examen et aux démonstrations pour viser l'excellence.`
      };
    }

    return {
      stepOrder: 0,
      topic,
      stage,
      priorityScore,
      domainAccuracyPct,
      missedInDomainCount,
      recommendedDifficulty,
      recommendedActionTab,
      linkedQuestionIds: sortedQuestions.map(q => q.id),
      linkedQuestions: sortedQuestions,
      linkedSkillNodes,
      linkedLessons,
      linkedPitfalls,
      linkedGlossaryTerms,
      pedagogicalRationale,
      estimatedDurationMin: topic.recommendedDurationMin
    };
  });

  // Sort by highest priority first, then tie-break preserving official syllabus sequence
  rawSteps.sort((a, b) => b.priorityScore - a.priorityScore);
  const steps = rawSteps.map((s, idx) => ({ ...s, stepOrder: idx + 1 }));

  // Compute global readiness across topics
  const readinessValues = steps.map(s =>
    s.domainAccuracyPct !== null ? s.domainAccuracyPct : 25
  );
  const overallReadinessPct =
    readinessValues.length > 0
      ? Math.round(readinessValues.reduce((a, b) => a + b, 0) / readinessValues.length)
      : 0;

  const hasRemediation = steps.some(s => s.stage === 'remediation');
  const hasFoundation = steps.some(s => s.stage === 'foundation');
  const focusProfile: LearningPathStage = hasRemediation
    ? 'remediation'
    : hasFoundation
    ? 'foundation'
    : overallReadinessPct >= 80
    ? 'excellence'
    : 'consolidation';

  const topTopic = steps[0]?.topic.title || {
    ar: 'المراجعة العامة للمقرر',
    biof: 'Révision générale'
  };

  const levelCfg = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  const summaryTitle: LocalizedString =
    focusProfile === 'remediation'
      ? {
          ar: `مسار تدارك وتقوية مخصص — ${levelCfg.shortName.ar}`,
          biof: `Parcours de Remédiation Ciblée — ${levelCfg.shortName.biof}`
        }
      : focusProfile === 'foundation'
      ? {
          ar: `مسار التأسيس المنهجي — ${levelCfg.shortName.ar}`,
          biof: `Parcours d'Acquisition Progressive — ${levelCfg.shortName.biof}`
        }
      : focusProfile === 'consolidation'
      ? {
          ar: `مسار التثبيت والتفوق — ${levelCfg.shortName.ar}`,
          biof: `Parcours de Consolidation — ${levelCfg.shortName.biof}`
        }
      : {
          ar: `مسار التميز والإعداد للامتحان الإشهادي — ${levelCfg.shortName.ar}`,
          biof: `Parcours d'Excellence & Préparation Examen — ${levelCfg.shortName.biof}`
        };

  const summaryAdvice: LocalizedString = {
    ar: `يربط النظام ديناميكياً ${steps.length} محاور وزارية رسمية مع ${totalLinkedResourcesCount} مورداً تفاعلياً. المحطة الأولى المقترحة لتقدمك الحالي هي: «${topTopic.ar}».`,
    biof: `Le système relie dynamiquement ${steps.length} chapitres officiels à ${totalLinkedResourcesCount} ressources interactives. Votre étape n°1 recommandée : « ${topTopic.biof} ».`
  };

  return {
    levelId,
    streamId,
    overallReadinessPct,
    estimatedGradeOn20: stats.solvedCount > 0 ? review.diagnosticGrade : 10,
    focusProfile,
    summaryTitle,
    summaryAdvice,
    steps,
    totalLinkedResourcesCount
  };
}

export function generatePersonalizedWeeklyPlan(
  path: PersonalizedLearningPath
): StudyPlanItem[] {
  const daysOrder: DayOfWeekId[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const stepsPool = path.steps;

  return daysOrder.map((dayId, idx) => {
    if (dayId === 'sun') {
      const topStep = stepsPool[0];
      return {
        id: `pplan-${path.levelId}-${path.streamId}-sun`,
        dayId: 'sun',
        levelId: path.levelId,
        streamId: path.streamId,
        domain: topStep ? topStep.topic.domain : 'analysis_functions',
        title: {
          ar: 'حصيلة المسار المخصص: امتحان تجريبي وتدارك التعثرات (/20)',
          biof: 'Bilan du Parcours Personnalisé : Examen Blanc & Remédiation (/20)'
        },
        sessionType: 'exam_prep',
        durationMin: 90,
        priority: 'high',
        completed: false
      };
    }

    const step = stepsPool.length > 0 ? stepsPool[idx % stepsPool.length] : null;
    if (!step) {
      return {
        id: `pplan-${path.levelId}-${path.streamId}-${dayId}-${idx}`,
        dayId,
        levelId: path.levelId,
        streamId: path.streamId,
        domain: 'arithmetic_algebra',
        title: {
          ar: 'مراجعة القواعد الأساسية وحل التمارين',
          biof: 'Révision des notions fondamentales'
        },
        sessionType: 'exercises',
        durationMin: 60,
        priority: 'medium',
        completed: false
      };
    }

    const mappedSessionType: StudyPlanItem['sessionType'] =
      step.stage === 'remediation'
        ? 'remediation'
        : step.stage === 'foundation'
        ? 'course'
        : step.stage === 'consolidation'
        ? 'exercises'
        : 'exam_prep';

    return {
      id: `pplan-${path.levelId}-${path.streamId}-${dayId}-${idx}`,
      dayId,
      levelId: path.levelId,
      streamId: path.streamId,
      domain: step.topic.domain,
      title: step.topic.title,
      sessionType: mappedSessionType,
      durationMin: step.estimatedDurationMin,
      priority: step.stage === 'remediation' || idx < 2 ? 'high' : 'medium',
      completed: false
    };
  });
}


