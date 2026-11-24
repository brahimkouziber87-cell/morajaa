import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  Question,
  UserStats,
  MathDomain,
  LEVELS,
  STREAMS,
  DOMAINS
} from './constants/dataStructure';
import {
  createInitialStats,
  calculateAnswerPoints,
  evaluateStudentBadges,
  getRankByXP,
  getSmartQuizRecommendation,
  getWeakestDomain,
  StudentBadge
} from './game/engine';
import { Header, AppTab } from './components/Header';
import { GameModeHubSelector } from './components/GameModeHubSelector';
import { CurriculumSelector } from './components/CurriculumSelector';
import { QuizMode } from './components/QuizMode';
import { TimedChallengeMode } from './components/TimedChallengeMode';
import { PitfallsMode } from './components/PitfallsMode';
import { MathLabMode } from './components/MathLabMode';
import { InspectorReportMode } from './components/InspectorReportMode';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { LeaderboardView } from './components/LeaderboardView';
import { BadgeUnlockCelebration } from './components/BadgeUnlockCelebration';
import { ShareAchievementModal } from './components/ShareAchievementModal';
import { ConceptGlossary } from './components/ConceptGlossary';
import { StudyPlanner } from './components/StudyPlanner';
import { FlashcardsMode } from './components/FlashcardsMode';
import { ProofBuilderMode } from './components/ProofBuilderMode';
import { BossFightArena } from './components/BossFightArena';
import { ConceptOfTheDayCard } from './components/ConceptOfTheDayCard';
import { MathScratchpadModal } from './components/MathScratchpadModal';
import { AdventureSkillTreeMode } from './components/AdventureSkillTreeMode';
import { PlayerClassSelectorModal } from './components/PlayerClassSelectorModal';
import { SpatialGeometryLabMode } from './components/SpatialGeometryLabMode';
import { LiveClassroomTournamentMode } from './components/LiveClassroomTournamentMode';
import { PLAYER_CLASSES, SKILL_TREE_DATABASE } from './data/rpgClassesAndSkills';
import { PlayerClassId } from './types/curriculum';
import { soundFeedback } from './utils/feedbackSounds';

const STATS_STORAGE_KEY = 'math_inspector_user_stats_v2';
const DAILY_DATE_KEY = 'math_inspector_daily_date_v2';
const READING_MODE_STORAGE_KEY = 'math_inspector_reading_mode_v2';

function loadInitialStats(): UserStats {
  const fallback = createInitialStats();
  if (typeof window === 'undefined') return fallback;
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem(DAILY_DATE_KEY);
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DAILY_DATE_KEY, todayStr);
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<UserStats>;
    const isSameDay = savedDate === todayStr;
    if (!isSameDay) {
      localStorage.setItem(DAILY_DATE_KEY, todayStr);
    }
    return {
      ...fallback,
      ...parsed,
      dailyGoal: typeof parsed.dailyGoal === 'number' && parsed.dailyGoal > 0 ? parsed.dailyGoal : 5,
      dailySolvedCount: isSameDay && typeof parsed.dailySolvedCount === 'number' ? parsed.dailySolvedCount : 0,
      competencyScores: {
        ...fallback.competencyScores,
        ...(parsed.competencyScores || {})
      },
      domainScores: {
        ...fallback.domainScores,
        ...(parsed.domainScores || {})
      }
    };
  } catch {
    return fallback;
  }
}

export default function App() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialDuelCode = searchParams ? searchParams.get('duel') : null;
  const hasAutostart = Boolean(searchParams && searchParams.has('autostart'));
  const isAutoStart = Boolean(hasAutostart || initialDuelCode);
  const [playerName, setPlayerName] = useState<string>(hasAutostart ? 'ياسين العلمي' : '');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(!isAutoStart);
  const [selectedLevel, setSelectedLevel] = useState<LevelId>('2bac');
  const [selectedStream, setSelectedStream] = useState<StreamId>('2bac_pc');
  const [lang, setLang] = useState<LanguageOption>('ar');
  const [dualLang, setDualLang] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<AppTab>(initialDuelCode ? 'leaderboard' : 'quiz');
  const [stats, setStats] = useState<UserStats>(() => loadInitialStats());
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isClassSelectorOpen, setIsClassSelectorOpen] = useState<boolean>(false);
  const [quizInitialDomain, setQuizInitialDomain] = useState<MathDomain | 'all'>('all');
  const [personalizedSyncTrigger, setPersonalizedSyncTrigger] = useState<number>(0);

  // Eye-Friendly Reading Mode State
  const [isReadingMode, setIsReadingMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(READING_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Sound Engine Mute State
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFeedback.isMuted());

  useEffect(() => {
    const unsub = soundFeedback.subscribe(enabled => {
      setIsSoundMuted(!enabled);
    });
    return unsub;
  }, []);

  const handleToggleReadingMode = useCallback(() => {
    setIsReadingMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem(READING_MODE_STORAGE_KEY, String(next));
      } catch {}
      soundFeedback.playClickSound();
      return next;
    });
  }, []);

  const handleToggleSoundMute = useCallback(() => {
    soundFeedback.toggle();
  }, []);

  const handleSelectPlayerClass = useCallback((classId: PlayerClassId) => {
    soundFeedback.playClickSound();
    setStats(prev => ({
      ...prev,
      playerClass: classId
    }));
  }, []);

  // Persist stats to localStorage whenever updated
  useEffect(() => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem(DAILY_DATE_KEY, todayStr);
      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // Ignore storage quota errors
    }
  }, [stats]);

  // Badge celebration & global achievement card share
  const [celebratingBadge, setCelebratingBadge] = useState<StudentBadge | null>(null);
  const [isGlobalShareOpen, setIsGlobalShareOpen] = useState<boolean>(false);
  const prevUnlockedBadgesRef = useRef<Set<string> | null>(null);

  const currentBadges = useMemo(() => evaluateStudentBadges(stats), [stats]);
  const unlockedBadges = useMemo(() => currentBadges.filter(b => b.unlocked), [currentBadges]);

  useEffect(() => {
    const currentUnlockedIds = new Set(unlockedBadges.map(b => b.id));

    if (prevUnlockedBadgesRef.current !== null) {
      for (const badge of unlockedBadges) {
        if (!prevUnlockedBadgesRef.current.has(badge.id)) {
          setCelebratingBadge(badge);
          soundFeedback.playBadgeUnlockSound();
          break;
        }
      }
    }

    prevUnlockedBadgesRef.current = currentUnlockedIds;
  }, [unlockedBadges]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'fr';
  }, [lang]);

  useEffect(() => {
    document.body.classList.toggle('reading-mode', isReadingMode);
    return () => {
      document.body.classList.remove('reading-mode');
    };
  }, [isReadingMode]);

  const handleOnboardingComplete = useCallback(
    (profile: { playerName: string; levelId: LevelId; streamId: StreamId; lang: LanguageOption }) => {
      setPlayerName(profile.playerName);
      setSelectedLevel(profile.levelId);
      setSelectedStream(profile.streamId);
      setLang(profile.lang);
      setShowOnboarding(false);
    },
    []
  );

  const handleLevelChange = useCallback((newLevel: LevelId, defaultStream: StreamId) => {
    setSelectedLevel(newLevel);
    setSelectedStream(defaultStream);
  }, []);

  const handleCycleDailyGoal = useCallback(() => {
    soundFeedback.playClickSound();
    setStats(prev => {
      const goals = [5, 10, 15, 20];
      const idx = goals.indexOf(prev.dailyGoal);
      const nextGoal = goals[(idx + 1) % goals.length];
      return {
        ...prev,
        dailyGoal: nextGoal
      };
    });
  }, []);

  const handleAnswerSubmitted = useCallback((question: Question, isCorrect: boolean, timeSpent: number) => {
    setStats(prev => {
      const { points, xp, newStreak } = calculateAnswerPoints(
        question.points,
        isCorrect,
        prev.streak,
        timeSpent
      );

      // Apply +20% XP bonus if question domain matches active RPG class specialization
      const currentClass = PLAYER_CLASSES.find(c => c.id === (prev.playerClass || 'algebraist')) || PLAYER_CLASSES[0];
      const classMultiplier = isCorrect && currentClass.bonusDomain === question.domain ? 1.2 : 1.0;
      const finalXp = Math.round(xp * classMultiplier);

      const nextComp = { ...prev.competencyScores };
      nextComp[question.competency] = {
        correct: nextComp[question.competency].correct + (isCorrect ? 1 : 0),
        total: nextComp[question.competency].total + 1
      };

      const nextDom = { ...prev.domainScores };
      nextDom[question.domain] = {
        correct: nextDom[question.domain].correct + (isCorrect ? 1 : 0),
        total: nextDom[question.domain].total + 1
      };

      // Dynamically update masteredSkills stars (1..3) for matching skill nodes
      const nextMasteredSkills = { ...(prev.masteredSkills || {}) };
      const domStat = nextDom[question.domain];
      if (domStat && domStat.total >= 1) {
        const domPct = (domStat.correct / domStat.total) * 100;
        const earnedStars = domPct >= 80 && domStat.total >= 2 ? 3 : domPct >= 55 ? 2 : isCorrect || domPct >= 30 ? 1 : 0;
        if (earnedStars > 0) {
          const matchingNodes = SKILL_TREE_DATABASE.filter(
            n => n.levelId === question.levelId && n.domain === question.domain
          );
          for (const node of matchingNodes) {
            const prereqsMet =
              node.prerequisites.length === 0 ||
              node.prerequisites.every(pId => (nextMasteredSkills[pId] || 0) >= 1);
            if (prereqsMet) {
              nextMasteredSkills[node.id] = Math.max(nextMasteredSkills[node.id] || 0, earnedStars);
            }
          }
        }
      }

      const todayStr = new Date().toISOString().slice(0, 10);
      const prevDayEntry = prev.dailyActivityHistory?.[todayStr] || {
        solved: prev.dailySolvedCount,
        correct: 0
      };

      const existingMissed = [...(prev.missedQuestions || [])];
      let nextRemediatedCount = prev.remediatedCount || 0;

      if (!isCorrect) {
        const idx = existingMissed.findIndex(item => item.question.id === question.id);
        if (idx >= 0) {
          existingMissed[idx] = {
            ...existingMissed[idx],
            wrongAttempts: existingMissed[idx].wrongAttempts + 1,
            lastMissedAt: new Date().toISOString()
          };
        } else {
          existingMissed.unshift({
            question,
            wrongAttempts: 1,
            lastMissedAt: new Date().toISOString()
          });
        }
      } else {
        const idx = existingMissed.findIndex(item => item.question.id === question.id);
        if (idx >= 0) {
          existingMissed.splice(idx, 1);
          nextRemediatedCount += 1;
        }
      }

      return {
        ...prev,
        xp: prev.xp + finalXp,
        score: prev.score + points,
        streak: newStreak,
        maxStreak: Math.max(prev.maxStreak, newStreak),
        solvedCount: prev.solvedCount + 1,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        dailySolvedCount: prev.dailySolvedCount + 1,
        competencyScores: nextComp,
        domainScores: nextDom,
        masteredSkills: nextMasteredSkills,
        missedQuestions: existingMissed.slice(0, 20),
        remediatedCount: nextRemediatedCount,
        dailyActivityHistory: {
          ...(prev.dailyActivityHistory || {}),
          [todayStr]: {
            solved: prevDayEntry.solved + 1,
            correct: prevDayEntry.correct + (isCorrect ? 1 : 0)
          }
        }
      };
    });
  }, []);

  const handleLoadDiagnosticMistakes = useCallback((questionsToQueue: Question[]) => {
    setStats(prev => {
      const existing = [...(prev.missedQuestions || [])];
      const existingIds = new Set(existing.map(m => m.question.id));
      const additions = questionsToQueue
        .filter(q => !existingIds.has(q.id))
        .map(q => ({
          question: q,
          wrongAttempts: 1,
          lastMissedAt: new Date().toISOString()
        }));
      return {
        ...prev,
        missedQuestions: [...existing, ...additions].slice(0, 20)
      };
    });
  }, []);

  const handleTimedChallengeCompleted = useCallback(
    (
      earnedScore: number,
      earnedXp: number,
      correctCount: number,
      totalAnswered: number,
      missedList?: Question[]
    ) => {
      soundFeedback.playTaskCompleteSound();
      setStats(prev => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const prevDayEntry = prev.dailyActivityHistory?.[todayStr] || {
          solved: prev.dailySolvedCount,
          correct: 0
        };

        const existingMissed = [...(prev.missedQuestions || [])];
        if (missedList && missedList.length > 0) {
          for (const mq of missedList) {
            const idx = existingMissed.findIndex(item => item.question.id === mq.id);
            if (idx >= 0) {
              existingMissed[idx] = {
                ...existingMissed[idx],
                wrongAttempts: existingMissed[idx].wrongAttempts + 1,
                lastMissedAt: new Date().toISOString()
              };
            } else {
              existingMissed.unshift({
                question: mq,
                wrongAttempts: 1,
                lastMissedAt: new Date().toISOString()
              });
            }
          }
        }

        return {
          ...prev,
          xp: prev.xp + earnedXp,
          score: prev.score + earnedScore,
          solvedCount: prev.solvedCount + totalAnswered,
          correctCount: prev.correctCount + correctCount,
          dailySolvedCount: prev.dailySolvedCount + totalAnswered,
          maxStreak: Math.max(prev.maxStreak, correctCount),
          missedQuestions: existingMissed.slice(0, 20),
          dailyActivityHistory: {
            ...(prev.dailyActivityHistory || {}),
            [todayStr]: {
              solved: prevDayEntry.solved + totalAnswered,
              correct: prevDayEntry.correct + correctCount
            }
          }
        };
      });
    },
    []
  );

  const handleFlashcardMastered = useCallback((domain: MathDomain) => {
    soundFeedback.playCorrectSound();
    setStats(prev => {
      const nextDom = { ...prev.domainScores };
      if (nextDom[domain]) {
        nextDom[domain] = {
          correct: nextDom[domain].correct + 1,
          total: nextDom[domain].total + 1
        };
      }
      const todayStr = new Date().toISOString().slice(0, 10);
      const prevDayEntry = prev.dailyActivityHistory?.[todayStr] || {
        solved: prev.dailySolvedCount,
        correct: 0
      };
      return {
        ...prev,
        xp: prev.xp + 10,
        score: prev.score + 10,
        solvedCount: prev.solvedCount + 1,
        correctCount: prev.correctCount + 1,
        dailySolvedCount: prev.dailySolvedCount + 1,
        domainScores: nextDom,
        dailyActivityHistory: {
          ...(prev.dailyActivityHistory || {}),
          [todayStr]: {
            solved: prevDayEntry.solved + 1,
            correct: prevDayEntry.correct + 1
          }
        }
      };
    });
  }, []);

  const handlePitfallResolved = useCallback((foundOnFirstTry: boolean) => {
    if (foundOnFirstTry) {
      soundFeedback.playCorrectSound();
    } else {
      soundFeedback.playHintSound();
    }
    setStats(prev => ({
      ...prev,
      xp: prev.xp + (foundOnFirstTry ? 35 : 15),
      score: prev.score + (foundOnFirstTry ? 25 : 10),
      pitfallsFound: prev.pitfallsFound + 1
    }));
  }, []);

  const handlePomodoroComplete = useCallback((earnedXp: number) => {
    soundFeedback.playTaskCompleteSound();
    setStats(prev => ({
      ...prev,
      xp: prev.xp + earnedXp,
      score: prev.score + Math.round(earnedXp * 0.5)
    }));
  }, []);

  const handleDailyConceptReward = useCallback(
    (bonusXp: number, bonusPoints: number, domain: MathDomain, isCorrect: boolean) => {
      if (isCorrect) {
        soundFeedback.playTaskCompleteSound();
      } else {
        soundFeedback.playIncorrectSound();
      }
      setStats(prev => {
        const nextDom = { ...prev.domainScores };
        if (nextDom[domain]) {
          nextDom[domain] = {
            correct: nextDom[domain].correct + (isCorrect ? 1 : 0),
            total: nextDom[domain].total + 1
          };
        }
        const nextComp = { ...prev.competencyScores };
        nextComp.application = {
          correct: nextComp.application.correct + (isCorrect ? 1 : 0),
          total: nextComp.application.total + 1
        };
        const todayStr = new Date().toISOString().slice(0, 10);
        const prevDayEntry = prev.dailyActivityHistory?.[todayStr] || {
          solved: prev.dailySolvedCount,
          correct: 0
        };
        return {
          ...prev,
          xp: prev.xp + bonusXp,
          score: prev.score + bonusPoints,
          streak: isCorrect ? prev.streak + 1 : 0,
          maxStreak: isCorrect ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak,
          solvedCount: prev.solvedCount + 1,
          correctCount: prev.correctCount + (isCorrect ? 1 : 0),
          dailySolvedCount: prev.dailySolvedCount + 1,
          domainScores: nextDom,
          competencyScores: nextComp,
          dailyActivityHistory: {
            ...(prev.dailyActivityHistory || {}),
            [todayStr]: {
              solved: prevDayEntry.solved + 1,
              correct: prevDayEntry.correct + (isCorrect ? 1 : 0)
            }
          }
        };
      });
    },
    []
  );

  const currentLevelObj = LEVELS.find(l => l.id === selectedLevel) || LEVELS[0];
  const currentStreamObj = STREAMS[selectedStream];
  const activePlayerClassConfig = useMemo(() => {
    return PLAYER_CLASSES.find(c => c.id === stats.playerClass) || PLAYER_CLASSES[0];
  }, [stats.playerClass]);

  const playerRank = useMemo(() => getRankByXP(stats.xp), [stats.xp]);

  const accuracyPct = useMemo(() => {
    return stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 100;
  }, [stats.solvedCount, stats.correctCount]);

  const rankProgressPct = useMemo(() => {
    const thresholds = [0, 100, 300, 600, 1000, 1600];
    const currentBase = playerRank.levelNumber > 1 ? (thresholds[playerRank.levelNumber - 1] ?? 0) : 0;
    const nextTarget = playerRank.nextThreshold;
    const span = Math.max(1, nextTarget - currentBase);
    const gained = Math.max(0, stats.xp - currentBase);
    return Math.min(100, Math.round((gained / span) * 100));
  }, [stats.xp, playerRank]);

  const smartQuizSuggestion = useMemo(
    () => getSmartQuizRecommendation(stats, selectedLevel, selectedStream),
    [stats, selectedLevel, selectedStream]
  );

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isReadingMode ? 'reading-mode bg-[#FAF7EE] text-[#24292E]' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {showOnboarding && (
        <StudentOnboardingModal
          initialName={playerName}
          initialLevel={selectedLevel}
          initialStream={selectedStream}
          initialLang={lang}
          onComplete={handleOnboardingComplete}
        />
      )}

      <Header
        currentTab={activeTab}
        onTabChange={(tab) => {
          soundFeedback.playClickSound();
          setActiveTab(tab);
        }}
        lang={lang}
        onToggleLang={(newLang) => {
          soundFeedback.playClickSound();
          setLang(newLang);
        }}
        xp={stats.xp}
        streak={stats.streak}
        dailySolvedCount={stats.dailySolvedCount}
        dailyGoal={stats.dailyGoal}
        onCycleDailyGoal={handleCycleDailyGoal}
        onPomodoroComplete={handlePomodoroComplete}
        onOpenScratchpad={() => {
          soundFeedback.playClickSound();
          setIsScratchpadOpen(true);
        }}
        isReadingMode={isReadingMode}
        onToggleReadingMode={handleToggleReadingMode}
        isSoundMuted={isSoundMuted}
        onToggleSoundMute={handleToggleSoundMute}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Overview Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
                  <span>{currentLevelObj.name[lang]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{currentStreamObj.name[lang]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{lang === 'ar' ? 'خيار عربي / دولي BIOF' : 'Option Arabe / BIOF'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClassSelectorOpen(true)}
                    title={lang === 'ar' ? 'تغيير فئة البطل والتخصص والامتيازات' : 'Changer de spécialité héroïque RPG'}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-950/80 to-purple-950/80 hover:from-indigo-900/90 hover:to-purple-900/90 border border-indigo-700/60 hover:border-indigo-400 px-3 py-1 rounded-xl text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-sm">{activePlayerClassConfig.icon}</span>
                    <span>{activePlayerClassConfig.name[lang]}</span>
                    <span className="text-[10px] text-amber-300 font-mono bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                      +20% XP
                    </span>
                  </button>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-xl text-xs">
                    <span className="text-emerald-400 font-bold">
                      {lang === 'ar'
                        ? `المتعلم(ة): ${playerName || 'ضيف'}`
                        : `Élève : ${playerName || 'Invité'}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowOnboarding(true)}
                      className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
                    >
                      {lang === 'ar' ? 'تعديل' : 'Modifier'}
                    </button>
                    <span className="text-slate-700" aria-hidden="true">|</span>
                    <button
                      type="button"
                      onClick={() => setIsGlobalShareOpen(true)}
                      className="text-amber-300 hover:text-amber-200 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      <span>📤</span>
                      <span>{lang === 'ar' ? 'بطاقة الإنجاز' : 'Carte'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {lang === 'ar'
                    ? 'المراجعة الشاملة وضبط مقرر الرياضيات للسلكين الإعدادي والتأهيلي'
                    : 'Révision Générale et Maîtrise du Programme de Mathématiques (Collège & Lycée)'}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl mt-2">
                  {lang === 'ar'
                    ? 'منصة تربوية تفاعلية مصممة وفق الأطر المرجعية الرسمية، تجمع بين شجرة المهارات، ملخصات الدروس، التوليد بالذكاء الاصطناعي، التحدي الزمني، والمختبر البياني والفضائي 3D.'
                    : 'Plateforme ludopédagogique selon les cadres référentiels officiels : arbre de compétences, fiches de synthèse, génération IA, défi chrono et labo 3D.'}
                </p>
              </div>

              {/* Student RPG Level & Rank HUD Strip */}
              <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{playerRank.badge}</span>
                    <span className="font-extrabold text-white">
                      {lang === 'ar'
                        ? `المستوى ${playerRank.levelNumber}: ${playerRank.title.ar}`
                        : `Niveau ${playerRank.levelNumber} : ${playerRank.title.biof}`}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">·</span>
                    <span className="text-amber-300 font-mono font-bold">
                      {stats.xp} XP
                    </span>
                    <span className="text-[11px] text-slate-400">
                      ({lang === 'ar' ? `المتبقي للترقية: ${Math.max(0, playerRank.nextThreshold - stats.xp)} XP` : `${Math.max(0, playerRank.nextThreshold - stats.xp)} XP pour monter`})
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-400 text-xs font-mono">
                    <span>{lang === 'ar' ? `التمارين: ${stats.solvedCount}` : `Résolus : ${stats.solvedCount}`}</span>
                    <span className="text-slate-700" aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-bold">{lang === 'ar' ? `الدقة: ${accuracyPct}%` : `Précision : ${accuracyPct}%`}</span>
                    {stats.streak > 0 && (
                      <>
                        <span className="text-slate-700" aria-hidden="true">·</span>
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <span>🔥</span>
                          <span>{stats.streak}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress bar towards next level */}
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${rankProgressPct}%` }}
                  />
                </div>

                {/* Smart Quiz Adaptive Next-Best-Topic Quick Callout */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold shrink-0">
                      {lang === 'ar' ? '🎯 Smart Quiz · المقترح التالي' : '🎯 Smart Quiz · Sujet Suivant'}
                    </span>
                    <span className="text-slate-200 font-bold truncate">
                      {smartQuizSuggestion.recommendedTopicTitle[lang]}
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono tabular-nums shrink-0">
                      ({DOMAINS[smartQuizSuggestion.recommendedDomain].name[lang]} ·{' '}
                      {smartQuizSuggestion.rankedDomains[0].total > 0
                        ? `${smartQuizSuggestion.rankedDomains[0].accuracyPct}%`
                        : lang === 'ar'
                          ? 'غير مختبر'
                          : 'Non testé'})
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    {(stats.missedQuestions?.length || 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          soundFeedback.playClickSound();
                          setActiveTab('report');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 text-rose-200 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        {lang === 'ar'
                          ? `🔬 تشخيص الأخطاء بـ Gemini (${stats.missedQuestions!.length})`
                          : `🔬 Diagnostic Erreurs Gemini (${stats.missedQuestions!.length})`}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        soundFeedback.playClickSound();
                        setActiveTab('adventure');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? '🗺️ المسار المخصص' : '🗺️ Mon Parcours'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundFeedback.playClickSound();
                        setQuizInitialDomain(smartQuizSuggestion.recommendedDomain);
                        setActiveTab('quiz');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'ابدأ المراجعة الذكية ←' : 'Lancer Smart Quiz →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seamless Game Mode Hub Selector */}
            <GameModeHubSelector
              currentTab={activeTab}
              onTabChange={setActiveTab}
              lang={lang}
              dualLang={dualLang}
            />
          </div>

          {/* Right Hero Tactical Deck */}
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 min-h-[280px] flex flex-col justify-between p-6">
            <img
              src="/src/assets/images/hero_math_classroom_1794065990783.jpg"
              alt="مختبر مراجعة الرياضيات للسلك الثانوي"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-35"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

            <div className="relative z-10 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
                <span dir="ltr">∫ f(x)dx · lim f(x) · sin²θ + cos²θ = 1</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
                  {lang === 'ar' ? 'جاهزية للامتحان' : 'Prêt pour l\'Examen'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">
                {lang === 'ar'
                  ? 'بوابات التدريب التفاعلي والتنافس الصفي'
                  : 'Arènes d\'Entraînement & Compétition de Classe'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lang === 'ar'
                  ? 'اختر بوابتك المفضلة: تدرب على شجرة المهارات، خض التحدي الزمني ضد الساعة، أو افتح محاكاة الهندسة الفضائية ثلاثية الأبعاد.'
                  : 'Sélectionnez votre arène : progression didactique, défi chrono ou simulation 3D de l\'espace.'}
              </p>
            </div>

            {/* Quick Tactical Action Buttons */}
            <div className="relative z-10 grid grid-cols-2 gap-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('adventure')}
                className="px-3 py-2 rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <span>🗺️</span>
                <span>{lang === 'ar' ? 'شجرة المهارات' : 'Compétences'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('timed')}
                className="px-3 py-2 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <span>⏱️</span>
                <span>{lang === 'ar' ? 'تحدي الـ 10 أسئلة' : 'Défi Chrono'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spatial')}
                className="px-3 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
              >
                <span>🪐</span>
                <span>{lang === 'ar' ? 'الفضاء 3D' : 'Espace 3D'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('classroom')}
                className="px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>👥</span>
                <span>{lang === 'ar' ? 'تحدي الفصل Live' : 'Classe Live'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* Concept of the Day Challenge Card ('تحدي المفهوم اليومي') */}
        <ConceptOfTheDayCard
          levelId={selectedLevel}
          lang={lang}
          dualLang={dualLang}
          onChallengeReward={handleDailyConceptReward}
          onOpenGlossary={() => setActiveTab('glossary')}
        />

        {/* Interactive Curriculum Selector */}
        <CurriculumSelector
          selectedLevel={selectedLevel}
          selectedStream={selectedStream}
          lang={lang}
          dualLang={dualLang}
          onLevelChange={handleLevelChange}
          onStreamChange={setSelectedStream}
          onLangChange={setLang}
          onDualLangChange={setDualLang}
        />

        {/* Active Learning / Game View */}
        {activeTab === 'adventure' && (
          <AdventureSkillTreeMode
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            stats={stats}
            onLaunchSkillPractice={(domain) => {
              setQuizInitialDomain(domain as MathDomain);
              setActiveTab('quiz');
            }}
            onOpenPitfalls={() => setActiveTab('pitfalls')}
            onOpenGlossary={() => setActiveTab('glossary')}
            onOpenProof={() => setActiveTab('proof')}
            onOpenBoss={() => setActiveTab('boss')}
            onSyncPathToPlanner={() => {
              setPersonalizedSyncTrigger(prev => prev + 1);
              setActiveTab('planner');
            }}
          />
        )}

        {activeTab === 'spatial' && (
          <SpatialGeometryLabMode
            lang={lang}
            dualLang={dualLang}
            onLabChallengeCompleted={(earnedXp, earnedScore) => {
              setStats(prev => ({
                ...prev,
                xp: prev.xp + earnedXp,
                score: prev.score + earnedScore
              }));
            }}
          />
        )}

        {activeTab === 'classroom' && (
          <LiveClassroomTournamentMode
            levelId={selectedLevel}
            streamId={selectedStream}
            defaultPlayerName={playerName}
            lang={lang}
            dualLang={dualLang}
            stats={stats}
            onAwardXp={(earnedXp, earnedScore) => {
              setStats(prev => ({
                ...prev,
                xp: prev.xp + earnedXp,
                score: prev.score + earnedScore
              }));
            }}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizMode
            playerName={playerName}
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            stats={stats}
            initialDomain={quizInitialDomain}
            onAnswerSubmitted={handleAnswerSubmitted}
          />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsMode
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            onCardMastered={handleFlashcardMastered}
          />
        )}

        {activeTab === 'timed' && (
          <TimedChallengeMode
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            defaultStudentName={playerName}
            onChallengeCompleted={handleTimedChallengeCompleted}
          />
        )}

        {activeTab === 'glossary' && (
          <ConceptGlossary
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            onPracticeDomain={(domain) => {
              setQuizInitialDomain(domain);
              setActiveTab('quiz');
            }}
          />
        )}

        {activeTab === 'planner' && (
          <StudyPlanner
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            stats={stats}
            personalizedSyncTrigger={personalizedSyncTrigger}
            onStartQuizSession={() => setActiveTab('quiz')}
            onOpenGlossary={() => setActiveTab('glossary')}
          />
        )}

        {activeTab === 'pitfalls' && (
          <PitfallsMode
            levelId={selectedLevel}
            streamId={selectedStream}
            lang={lang}
            dualLang={dualLang}
            onPitfallResolved={handlePitfallResolved}
          />
        )}

        {activeTab === 'lab' && (
          <MathLabMode
            lang={lang}
            onLabChallengeCompleted={(earnedXp, earnedScore) => {
              setStats(prev => ({
                ...prev,
                xp: prev.xp + earnedXp,
                score: prev.score + earnedScore
              }));
            }}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            playerName={playerName}
            currentLevelId={selectedLevel}
            currentStreamId={selectedStream}
            stats={stats}
            lang={lang}
            dualLang={dualLang}
            onNavigateToQuiz={() => setActiveTab('quiz')}
            onNavigateToTimed={() => setActiveTab('timed')}
            initialDuelCode={initialDuelCode}
            onDuelCompletedPoints={handleTimedChallengeCompleted}
            onAdoptPeerName={setPlayerName}
          />
        )}

        {activeTab === 'report' && (
          <InspectorReportMode
            stats={stats}
            levelId={selectedLevel}
            streamId={selectedStream}
            playerName={playerName}
            lang={lang}
            dualLang={dualLang}
            onResetStats={() => setStats(createInitialStats())}
            onLaunchRemediation={() => {
              setQuizInitialDomain(getWeakestDomain(stats));
              setActiveTab('quiz');
            }}
            onRemediateResult={handleAnswerSubmitted}
            onLoadDiagnosticMistakes={handleLoadDiagnosticMistakes}
          />
        )}

        {activeTab === 'proof' && (
          <ProofBuilderMode
            levelId={selectedLevel}
            lang={lang}
            dualLang={dualLang}
            onProofCompleted={(earnedXp) => {
              setStats(prev => ({
                ...prev,
                xp: prev.xp + earnedXp,
                score: prev.score + Math.round(earnedXp * 0.5)
              }));
            }}
          />
        )}

        {activeTab === 'boss' && (
          <BossFightArena
            levelId={selectedLevel}
            lang={lang}
            dualLang={dualLang}
            onVictoryReward={(bonusXp) => {
              setStats(prev => ({
                ...prev,
                xp: prev.xp + bonusXp,
                score: prev.score + Math.round(bonusXp * 0.5)
              }));
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            {lang === 'ar'
              ? 'MathInspector · منصة المراجعة الشاملة للرياضيات بالتعليم الثانوي الإعدادي والتأهيلي'
              : 'MathInspector · Plateforme de Révision des Mathématiques au Secondaire Collégial et Qualifiant'}
          </span>
          <span>
            {lang === 'ar'
              ? 'مصممة وفق التوجيهات التربوية والأطر المرجعية الرسمية (عربي / BIOF)'
              : 'Conçue selon les Orientations Pédagogiques et Cadres Référentiels Officiels'}
          </span>
        </div>
      </footer>

      {/* Real-time Badge Unlock Celebration Modal with Visual Effects */}
      <BadgeUnlockCelebration
        badge={celebratingBadge}
        lang={lang}
        onClose={() => setCelebratingBadge(null)}
        onShare={() => {
          setCelebratingBadge(null);
          setIsGlobalShareOpen(true);
        }}
      />

      {/* Global Share Achievement Card Modal */}
      <ShareAchievementModal
        isOpen={isGlobalShareOpen}
        onClose={() => setIsGlobalShareOpen(false)}
        studentName={playerName}
        levelId={selectedLevel}
        streamId={selectedStream}
        score={stats.score}
        xp={stats.xp}
        accuracyPct={stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 100}
        unlockedBadges={unlockedBadges}
        lang={lang}
      />

      {/* Math Scratchpad & Whiteboard Modal */}
      <MathScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        lang={lang}
      />

      {/* Player Class Selection Modal */}
      <PlayerClassSelectorModal
        isOpen={isClassSelectorOpen}
        onClose={() => setIsClassSelectorOpen(false)}
        currentClass={stats.playerClass}
        onSelectClass={handleSelectPlayerClass}
        lang={lang}
        dualLang={dualLang}
      />

      {/* Floating Scratchpad Quick-Launch Button */}
      <button
        type="button"
        onClick={() => setIsScratchpadOpen(true)}
        title={lang === 'ar' ? 'المسودة والسبورة الرياضية الرقمية (Scratchpad)' : 'Brouillon & Tableau Blanc Mathématique'}
        aria-label="Open Scratchpad"
        className="fixed bottom-6 end-6 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold p-3.5 rounded-2xl shadow-xl shadow-amber-500/25 border-2 border-amber-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
      >
        <span className="text-xl">✏️</span>
        <span className="text-xs hidden sm:inline-block font-black text-slate-950">
          {lang === 'ar' ? 'المسودة والسبورة' : 'Brouillon 3D'}
        </span>
      </button>
    </div>
  );
}

