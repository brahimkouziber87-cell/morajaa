import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  Question,
  UserStats,
  MathDomain,
  Competency,
  LEVELS,
  DOMAINS
} from '../constants/dataStructure';
import {
  filterQuestions,
  ClassStudentRecord,
  DEFAULT_CLASSROOM_STUDENTS,
  computeClassAnalyticsSummary,
  studentStatsToClassRecord,
  createInitialStats
} from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import {
  Users,
  Play,
  Trophy,
  Timer,
  Copy,
  Check,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface LiveClassroomTournamentModeProps {
  levelId: LevelId;
  streamId: StreamId;
  defaultPlayerName: string;
  lang: LanguageOption;
  dualLang: boolean;
  stats?: UserStats;
  onAwardXp: (xp: number, score: number) => void;
}

interface ClassroomPlayer {
  id: string;
  name: string;
  score: number;
  streak: number;
  isBot?: boolean;
  avatar: string;
}

const COMPETENCY_SHORT_LABELS: Record<Competency, { ar: string; biof: string }> = {
  restitution: { ar: 'استرداد المعارف', biof: 'Restitution' },
  application: { ar: 'التطبيق المباشر', biof: 'Application' },
  reasoning: { ar: 'الاستدلال والبرهان', biof: 'Raisonnement' },
  problem_solving: { ar: 'حل المسائل', biof: 'Problèmes' }
};

function getHeatmapCellStyle(pct: number): string {
  if (pct < 55) {
    return 'bg-rose-950/70 border-rose-500/50 text-rose-300';
  }
  if (pct < 70) {
    return 'bg-amber-950/60 border-amber-500/40 text-amber-300';
  }
  if (pct < 85) {
    return 'bg-indigo-950/60 border-indigo-500/40 text-indigo-300';
  }
  return 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300';
}

export const LiveClassroomTournamentMode: React.FC<LiveClassroomTournamentModeProps> = ({
  levelId,
  streamId,
  defaultPlayerName,
  lang,
  dualLang,
  stats,
  onAwardXp
}) => {
  const [role, setRole] = useState<'teacher' | 'student'>('teacher');
  const [classroomSubView, setClassroomSubView] = useState<'tournament' | 'teacher_analytics'>(
    'teacher_analytics'
  );
  const [roomPin, setRoomPin] = useState<string>('MATH-2026');
  const [copiedPin, setCopiedPin] = useState<boolean>(false);
  const [gameState, setGameState] = useState<'lobby' | 'question' | 'round_result' | 'podium'>(
    'lobby'
  );
  const [targetDomainFilter, setTargetDomainFilter] = useState<MathDomain | 'all'>('all');

  const effectiveStats = useMemo(() => stats || createInitialStats(), [stats]);

  // Proposal 3: Class Roster State for Teacher Analytics Heatmap
  const [classRoster, setClassRoster] = useState<ClassStudentRecord[]>(() => {
    const userRecord = studentStatsToClassRecord(
      effectiveStats,
      defaultPlayerName || 'أنت (المتعلم)',
      levelId,
      streamId
    );
    return [userRecord, ...DEFAULT_CLASSROOM_STUDENTS];
  });
  const [syncNotice, setSyncNotice] = useState<string>('');

  // Keep user's record updated when stats or name change
  useEffect(() => {
    const updatedUser = studentStatsToClassRecord(
      effectiveStats,
      defaultPlayerName || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)'),
      levelId,
      streamId
    );
    setClassRoster(prev => {
      const others = prev.filter(
        s =>
          !s.studentId.startsWith('student-') &&
          s.studentName.toLowerCase() !== updatedUser.studentName.toLowerCase()
      );
      return [updatedUser, ...others];
    });
  }, [effectiveStats, defaultPlayerName, levelId, streamId, lang]);

  // Fetch synced class roster from server when roomPin changes
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/classroom/analytics/${encodeURIComponent(roomPin)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (cancelled || !data || !Array.isArray(data.syncedStudents)) return;
        if (data.syncedStudents.length > 0) {
          setClassRoster(prev => {
            const byName = new Map<string, ClassStudentRecord>();
            prev.forEach(st => byName.set(st.studentName.toLowerCase(), st));
            data.syncedStudents.forEach((st: ClassStudentRecord) =>
              byName.set(st.studentName.toLowerCase(), st)
            );
            return Array.from(byName.values());
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [roomPin]);

  const handleSyncMyStatsToClass = async () => {
    soundFeedback.playClickSound();
    const record = studentStatsToClassRecord(
      effectiveStats,
      defaultPlayerName || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)'),
      levelId,
      streamId
    );

    try {
      const res = await fetch(
        `/api/classroom/analytics/${encodeURIComponent(roomPin)}/sync-student`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record)
        }
      );
      const data = await res.json();
      if (data && Array.isArray(data.syncedStudents)) {
        setClassRoster(prev => {
          const byName = new Map<string, ClassStudentRecord>();
          prev.forEach(st => byName.set(st.studentName.toLowerCase(), st));
          data.syncedStudents.forEach((st: ClassStudentRecord) =>
            byName.set(st.studentName.toLowerCase(), st)
          );
          return Array.from(byName.values());
        });
      }
    } catch {
      // Local roster already updated
    }

    setSyncNotice(
      lang === 'ar'
        ? `✓ تمت مزامنة حصيلتك التشخيصية مع قسم ${roomPin} بنجاح!`
        : `✓ Votre bilan a été synchronisé avec la classe ${roomPin} !`
    );
    setTimeout(() => setSyncNotice(''), 3500);
  };

  const handleExportClassCsv = () => {
    const headers = [
      'RoomCode',
      'StudentName',
      'Level',
      'Stream',
      'SolvedCount',
      'DiagnosticGradeOn20',
      'AlgebraPct',
      'AnalysisPct',
      'GeometryPct',
      'ProbStatsPct',
      'ProblemSolvingPct',
      'LastActiveISO'
    ];
    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };
    const rows = classRoster.map(s =>
      [
        roomPin,
        s.studentName,
        s.levelId,
        s.streamId,
        s.solvedCount,
        s.diagnosticGradeOn20,
        s.domainMasteryPct.arithmetic_algebra,
        s.domainMasteryPct.analysis_functions,
        s.domainMasteryPct.geometry_trig,
        s.domainMasteryPct.probability_stats,
        s.competencyMasteryPct.problem_solving,
        s.lastActiveISO
      ]
        .map(escapeCsv)
        .join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspector_class_report_${roomPin}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSyncNotice(
      lang === 'ar'
        ? `📥 تم تصدير شبكة تقويم القسم (${roomPin}) بصيغة CSV بنجاح!`
        : `📥 Grille diagnostique (${roomPin}) exportée en CSV avec succès !`
    );
    setTimeout(() => setSyncNotice(''), 3500);
  };

  const classAnalytics = useMemo(
    () => computeClassAnalyticsSummary(roomPin, classRoster),
    [roomPin, classRoster]
  );

  // Live Tournament Players State
  const [players, setPlayers] = useState<ClassroomPlayer[]>([
    {
      id: 'p-user',
      name: defaultPlayerName || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)'),
      score: 0,
      streak: 0,
      avatar: '🎓'
    },
    { id: 'p-1', name: 'ياسين العلمي', score: 0, streak: 0, isBot: true, avatar: '⚡' },
    { id: 'p-2', name: 'فاطمة الزهراء', score: 0, streak: 0, isBot: true, avatar: '📐' },
    { id: 'p-3', name: 'عمر التازي', score: 0, streak: 0, isBot: true, avatar: '📈' },
    { id: 'p-4', name: 'زينب الإدريسي', score: 0, streak: 0, isBot: true, avatar: '🎲' }
  ]);

  // Keep user player name synced with defaultPlayerName
  useEffect(() => {
    const cleanName = defaultPlayerName || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)');
    setPlayers(prev =>
      prev.map(p => (p.id === 'p-user' ? { ...p, name: cleanName } : p))
    );
  }, [defaultPlayerName, lang]);

  const tournamentDeck: Question[] = useMemo(() => {
    const list = filterQuestions(levelId, streamId, targetDomainFilter);
    const fallback = list.length >= 3 ? list : filterQuestions(levelId, streamId, 'all');
    return fallback.slice(0, 5);
  }, [levelId, streamId, targetDomainFilter]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timerSec, setTimerSec] = useState<number>(20);
  const roundResolvedRef = useRef<boolean>(false);

  const currentQ: Question | undefined = tournamentDeck[currentQuestionIndex];

  const generateNewRoomPin = () => {
    const code = `MATH-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomPin(code);
  };

  const copyRoomPin = () => {
    navigator.clipboard?.writeText(roomPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const resolveCurrentRound = useCallback(() => {
    if (roundResolvedRef.current) return;
    roundResolvedRef.current = true;

    setPlayers(prev =>
      prev.map(p => {
        if (p.isBot) {
          const botCorrect = Math.random() < 0.75;
          const botTime = Math.floor(5 + Math.random() * 12);
          const pts = botCorrect ? Math.round(450 + botTime * 20) : 0;
          return {
            ...p,
            score: p.score + pts,
            streak: botCorrect ? p.streak + 1 : 0
          };
        }
        return p;
      })
    );
    setGameState('round_result');
  }, []);

  // Clean timer countdown (separated from state transitions to avoid React 19 state updater side effects)
  useEffect(() => {
    if (gameState !== 'question') return;

    const intervalId = window.setInterval(() => {
      setTimerSec(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameState, currentQuestionIndex]);

  useEffect(() => {
    if (gameState === 'question' && timerSec === 0) {
      resolveCurrentRound();
    }
  }, [gameState, timerSec, resolveCurrentRound]);

  const handleStartTournament = (domainOverride: MathDomain | 'all' = 'all') => {
    setTargetDomainFilter(domainOverride);
    setClassroomSubView('tournament');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimerSec(20);
    roundResolvedRef.current = false;
    setGameState('question');
    fetch(`/api/classroom/session/${encodeURIComponent(roomPin)}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetDomain: domainOverride,
        status: 'active',
        currentQuestionIndex: 0
      })
    }).catch(() => {});
  };

  const handleSelectOption = (optIdx: number) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(optIdx);
    const isCorrect = optIdx === currentQ.correctIndex;

    const earnedPoints = isCorrect ? Math.round(500 + timerSec * 25) : 0;
    if (isCorrect) {
      soundFeedback.playCorrectSound();
    } else {
      soundFeedback.playIncorrectSound();
    }

    setPlayers(prev =>
      prev.map(p => {
        if (p.id === 'p-user') {
          const nextScore = p.score + earnedPoints;
          const nextStreak = isCorrect ? p.streak + 1 : 0;
          fetch(`/api/classroom/session/${encodeURIComponent(roomPin)}/state`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerUpdate: {
                playerName: p.name,
                score: nextScore,
                streak: nextStreak,
                correctCount: isCorrect ? 1 : 0
              }
            })
          }).catch(() => {});
          return {
            ...p,
            score: nextScore,
            streak: nextStreak
          };
        }
        return p;
      })
    );
  };

  const handleNextRound = () => {
    if (currentQuestionIndex + 1 < tournamentDeck.length) {
      roundResolvedRef.current = false;
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTimerSec(20);
      setGameState('question');
    } else {
      setGameState('podium');
      const userRank =
        [...players].sort((a, b) => b.score - a.score).findIndex(p => p.id === 'p-user') + 1;
      soundFeedback.playExamResultSound(userRank <= 2);
      onAwardXp(150, 100);
    }
  };

  const sortedLeaderboard = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const currentLevelObj = LEVELS.find(l => l.id === levelId) || LEVELS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher (Teacher Analytics Heatmap vs Live Tournament) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {lang === 'ar'
                    ? 'فضاء الأستاذ والتحدي الصفي المشترك'
                    : 'Portail Enseignant & Arène de Classe'}
                </span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 text-indigo-300 border border-slate-800">
                {currentLevelObj.name[lang]}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              {lang === 'ar'
                ? 'فضاء الأستاذ: المبيان الحراري للقسم والمسابقة الصفية المباشرة'
                : 'Portail Enseignant : Carte Thermique de la Classe & Tournoi Live'}
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ar'
                ? 'اجمع تقارير المفتش التربوي لتلاميذ القسم عبر رمز القسم الموحد لتشخيص الفروع والكفايات التي تحتاج إلى دعم جماعي، أو أطلق مسابقة صفية مباشرة.'
                : 'Agrégez les bilans diagnostiques de la classe via un code unique pour identifier les besoins de remédiation collective ou lancez un tournoi en direct.'}
            </p>
          </div>

          {/* Class Code & Role Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-950 border border-indigo-500/40 px-3.5 py-2 rounded-xl">
              <span className="text-xs text-slate-400 font-semibold">
                {lang === 'ar' ? 'رمز القسم:' : 'Code Classe :'}
              </span>
              <span className="font-mono font-extrabold text-amber-300 text-sm tracking-wider">
                {roomPin}
              </span>
              <button
                type="button"
                onClick={copyRoomPin}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                title={lang === 'ar' ? 'نسخ رمز القسم' : 'Copier'}
              >
                {copiedPin ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={generateNewRoomPin}
              className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 cursor-pointer"
            >
              {lang === 'ar' ? 'تغيير الرمز' : 'Nouveau Code'}
            </button>
          </div>
        </div>

        {/* Sub-view Tabs: Proposal 3 Teacher Analytics vs Live Tournament */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setClassroomSubView('teacher_analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                classroomSubView === 'teacher_analytics'
                  ? 'bg-emerald-600 text-slate-950 shadow-md shadow-emerald-600/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? '📊 فضاء الأستاذ والمبيان الحراري للقسم'
                  : '📊 Portail Enseignant & Carte Thermique'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setClassroomSubView('tournament')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                classroomSubView === 'tournament'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? '🏆 غرفة المسابقة الصفية المباشرة (Live Arena)'
                  : '🏆 Tournoi de Classe en Direct'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                role === 'teacher' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'منظور الأستاذ' : 'Vue Enseignant'}
            </button>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                role === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'منظور التلميذ' : 'Vue Élève'}
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================================
          PROPOSAL 3: Teacher Analytics Portal & Class Mastery Heatmap
      ===================================================================== */}
      {classroomSubView === 'teacher_analytics' && (
        <div className="space-y-6">
          {/* Class Diagnostic KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-slate-400 block">
                {lang === 'ar' ? 'عدد تلاميذ القسم المسجلين' : 'Élèves synchronisés'}
              </span>
              <span className="text-2xl font-black text-white font-mono tabular-nums block">
                {classAnalytics.studentCount}
              </span>
              <span className="text-[11px] text-indigo-300 block">
                {lang === 'ar' ? `رمز القسم: ${roomPin}` : `Classe : ${roomPin}`}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-slate-400 block">
                {lang === 'ar' ? 'معدل القسم التشخيصي (/20)' : 'Moyenne Diagnostique (/20)'}
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono tabular-nums block">
                {classAnalytics.averageGradeOn20} / 20
              </span>
              <span className="text-[11px] text-slate-400 block">
                {lang === 'ar' ? 'وفق شبكة تقويم المفتش' : 'Selon la grille officielle'}
              </span>
            </div>

            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-rose-300 font-semibold block">
                {lang === 'ar' ? 'أضعف مجال جماعي بالقسم' : 'Domaine Prioritaire de la Classe'}
              </span>
              <span className="text-base font-extrabold text-white block truncate">
                {DOMAINS[classAnalytics.weakestClassDomain].icon}{' '}
                {DOMAINS[classAnalytics.weakestClassDomain].name[lang]}
              </span>
              <span className="text-xs font-mono font-bold text-rose-400 tabular-nums block">
                {lang === 'ar'
                  ? `متوسط التحكم: ${classAnalytics.domainAveragesPct[classAnalytics.weakestClassDomain]}%`
                  : `Maîtrise moyenne : ${classAnalytics.domainAveragesPct[classAnalytics.weakestClassDomain]}%`}
              </span>
            </div>

            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-amber-300 font-semibold block">
                {lang === 'ar' ? 'الكفاية المنهجية الأشد حاجة للدعم' : 'Compétence à Renforcer'}
              </span>
              <span className="text-base font-extrabold text-white block truncate">
                {COMPETENCY_SHORT_LABELS[classAnalytics.weakestClassCompetency][lang]}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums block">
                {lang === 'ar'
                  ? `متوسط الإتقان: ${classAnalytics.competencyAveragesPct[classAnalytics.weakestClassCompetency]}%`
                  : `Score moyen : ${classAnalytics.competencyAveragesPct[classAnalytics.weakestClassCompetency]}%`}
              </span>
            </div>
          </div>

          {/* Collective Inspector Recommendation & Sync Actions */}
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {lang === 'ar'
                      ? 'توصية المفتش التربوي لحصة الدعم الجماعي المقبلة'
                      : 'Recommandation de l\'Inspecteur pour la Séance de Remédiation Collective'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {classAnalytics.collectiveRecommendation[lang]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSyncMyStatsToClass}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar' ? 'مزامنة حصيلتي مع القسم' : 'Synchroniser mon bilan'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportClassCsv}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>📥</span>
                  <span>
                    {lang === 'ar' ? 'تصدير شبكة التقويم (CSV)' : 'Exporter Grille (CSV)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartTournament(classAnalytics.weakestClassDomain)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {lang === 'ar'
                      ? `إطلاق مسابقة دعم جماعي (${DOMAINS[classAnalytics.weakestClassDomain].name.ar})`
                      : `Tournoi ciblé (${DOMAINS[classAnalytics.weakestClassDomain].name.biof})`}
                  </span>
                </button>
              </div>
            </div>

            {syncNotice && (
              <div className="text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-xl px-3.5 py-2">
                {syncNotice}
              </div>
            )}

            {classAnalytics.prioritySupportStudents.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-amber-300 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'ar'
                      ? 'فوج الدعم التربوي الموجه (أولوية المواكبة):'
                      : 'Groupe de soutien prioritaire :'}
                  </span>
                </span>
                {classAnalytics.prioritySupportStudents.map((stName, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 font-semibold"
                  >
                    {stName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Class Mastery Heatmap Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  {lang === 'ar'
                    ? 'المبيان الحراري لتحكم تلاميذ القسم حسب الفروع والكفايات (Class Mastery Heatmap)'
                    : 'Carte Thermique de Maîtrise de la Classe (Domaines & Compétences)'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? 'تساعد الألوان الأستاذ على الرصد البصري الفوري للثغرات الفردية والجماعية داخل الفصل.'
                    : 'Visualisation matricielle des acquis individuels et collectifs.'}
                </p>
              </div>

              {/* Heatmap Legend */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded border bg-rose-950/70 border-rose-500/50 text-rose-300">
                  {'< 55%'} {lang === 'ar' ? 'حرج' : 'Critique'}
                </span>
                <span className="px-2 py-0.5 rounded border bg-amber-950/60 border-amber-500/40 text-amber-300">
                  55–69% {lang === 'ar' ? 'يحتاج دعماً' : 'À soutenir'}
                </span>
                <span className="px-2 py-0.5 rounded border bg-indigo-950/60 border-indigo-500/40 text-indigo-300">
                  70–84% {lang === 'ar' ? 'جيد' : 'Bien'}
                </span>
                <span className="px-2 py-0.5 rounded border bg-emerald-950/60 border-emerald-500/40 text-emerald-300">
                  85%+ {lang === 'ar' ? 'متحكم' : 'Maîtrisé'}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 text-start font-bold">
                      {lang === 'ar' ? 'المتعلم(ة)' : 'Élève'}
                    </th>
                    <th className="py-2.5 px-2 text-center font-bold">
                      {lang === 'ar' ? 'النقطة /20' : 'Note /20'}
                    </th>
                    {(Object.keys(DOMAINS) as MathDomain[]).map(dom => (
                      <th key={dom} className="py-2.5 px-2 text-center font-bold">
                        <span className="block">{DOMAINS[dom].icon}</span>
                        <span className="text-[10px]">{DOMAINS[dom].name[lang]}</span>
                      </th>
                    ))}
                    {(Object.keys(COMPETENCY_SHORT_LABELS) as Competency[]).map(comp => (
                      <th key={comp} className="py-2.5 px-2 text-center font-bold">
                        <span className="text-[10px] text-indigo-300">
                          {COMPETENCY_SHORT_LABELS[comp][lang]}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {classRoster.map(st => (
                    <tr key={st.studentId} className="hover:bg-slate-950/60">
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{st.studentName}</span>
                          {st.studentId.startsWith('student-') && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
                              {lang === 'ar' ? 'أنت' : 'Moi'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-center font-mono font-black tabular-nums text-amber-300">
                        {st.diagnosticGradeOn20}
                      </td>
                      {(Object.keys(DOMAINS) as MathDomain[]).map(dom => {
                        const val = st.domainMasteryPct[dom] ?? 0;
                        return (
                          <td key={dom} className="py-2 px-1.5 text-center">
                            <span
                              className={`inline-block w-14 py-1 rounded-lg border font-mono font-bold tabular-nums ${getHeatmapCellStyle(
                                val
                              )}`}
                            >
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                      {(Object.keys(COMPETENCY_SHORT_LABELS) as Competency[]).map(comp => {
                        const val = st.competencyMasteryPct[comp] ?? 0;
                        return (
                          <td key={comp} className="py-2 px-1.5 text-center">
                            <span
                              className={`inline-block w-14 py-1 rounded-lg border font-mono font-bold tabular-nums ${getHeatmapCellStyle(
                                val
                              )}`}
                            >
                              {val}%
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-700 bg-slate-950/90 font-extrabold">
                    <td className="py-3 px-3 text-amber-300">
                      {lang === 'ar' ? 'متوسط القسم العام' : 'Moyenne de la Classe'}
                    </td>
                    <td className="py-3 px-2 text-center font-mono tabular-nums text-emerald-400">
                      {classAnalytics.averageGradeOn20}
                    </td>
                    {(Object.keys(DOMAINS) as MathDomain[]).map(dom => {
                      const avg = classAnalytics.domainAveragesPct[dom] ?? 0;
                      return (
                        <td key={dom} className="py-2.5 px-1.5 text-center">
                          <span
                            className={`inline-block w-14 py-1 rounded-lg border font-mono tabular-nums ${getHeatmapCellStyle(
                              avg
                            )}`}
                          >
                            {avg}%
                          </span>
                        </td>
                      );
                    })}
                    {(Object.keys(COMPETENCY_SHORT_LABELS) as Competency[]).map(comp => {
                      const avg = classAnalytics.competencyAveragesPct[comp] ?? 0;
                      return (
                        <td key={comp} className="py-2.5 px-1.5 text-center">
                          <span
                            className={`inline-block w-14 py-1 rounded-lg border font-mono tabular-nums ${getHeatmapCellStyle(
                              avg
                            )}`}
                          >
                            {avg}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          LIVE CLASSROOM TOURNAMENT ARENA
      ===================================================================== */}
      {classroomSubView === 'tournament' && (
        <>
          {/* Game State 1: Lobby */}
          {gameState === 'lobby' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <span className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  🎮
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  {lang === 'ar' ? 'قاعة انتظار المتنافسين (Lobby)' : "Salle d'Attente du Tournoi"}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar'
                    ? `انضم ${players.length} تلاميذ جاهزون لخوض جولة من ${tournamentDeck.length} أسئلة إشهادية موحدة.`
                    : `${players.length} élèves connectés, prêts pour la série de ${tournamentDeck.length} questions.`}
                </p>
              </div>

              {/* Players Roster */}
              <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                {players.map(p => (
                  <div
                    key={p.id}
                    className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-bold text-white shadow-md"
                  >
                    <span className="text-base">{p.avatar}</span>
                    <span>{p.name}</span>
                    {p.id === 'p-user' && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 text-[10px]">
                        {lang === 'ar' ? 'أنت' : 'Moi'}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleStartTournament('all')}
                  className="px-7 py-3 rounded-xl text-xs md:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {lang === 'ar' ? 'إطلاق التحدي المباشر الآن' : 'Démarrer le Tournoi'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Game State 2: Active Question */}
          {gameState === 'question' && currentQ && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-indigo-600/25 border border-indigo-500 text-indigo-300 font-mono font-bold text-xs tabular-nums">
                    {lang === 'ar'
                      ? `السؤال ${currentQuestionIndex + 1} من ${tournamentDeck.length}`
                      : `Question ${currentQuestionIndex + 1} sur ${tournamentDeck.length}`}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentQ.title[lang]}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono text-sm font-extrabold tabular-nums border ${
                    timerSec <= 5
                      ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-amber-300'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  <span>{timerSec}s</span>
                </div>
              </div>

              {/* Question Text & Formula */}
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-extrabold text-white leading-relaxed">
                  <MathText text={currentQ.statement[lang]} />
                </h3>
                {dualLang && (
                  <p
                    className="text-xs md:text-sm text-slate-400 leading-relaxed"
                    dir={lang === 'ar' ? 'ltr' : 'rtl'}
                  >
                    <MathText text={currentQ.statement[lang === 'ar' ? 'biof' : 'ar']} />
                  </p>
                )}

                {currentQ.formula && (
                  <div className="pt-1">
                    <FormulaDisplay formula={currentQ.formula} copyable />
                  </div>
                )}
              </div>

              {/* 4 Answer Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {currentQ.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  let style =
                    'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500 hover:bg-slate-900';
                  if (selectedOption !== null) {
                    if (isChosen) {
                      style =
                        'bg-indigo-600/30 border-indigo-500 text-white font-bold ring-2 ring-indigo-500/40';
                    } else {
                      style = 'bg-slate-950/50 border-slate-800/60 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-3 ${style}`}
                    >
                      <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs md:text-sm font-semibold">
                        <MathText text={opt[lang]} />
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-400">
                    {lang === 'ar'
                      ? '✅ تم تسجيل إجابتك! يمكنك انتظار المؤقت أو كشف ترتيب الجولة فوراً.'
                      : '✅ Réponse enregistrée ! Vous pouvez révéler le classement immédiatement.'}
                  </p>
                  <button
                    type="button"
                    onClick={resolveCurrentRound}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                  >
                    {lang === 'ar' ? 'كشف النتيجة والترتيب الفوري ←' : 'Voir le résultat maintenant →'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Game State 3: Round Result & Breakdown */}
          {gameState === 'round_result' && currentQ && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'ar'
                    ? 'نتائج الجولة وعناصر الإجابة الرسمية'
                    : 'Résultats de la Manche & Corrigé'}
                </h3>
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md cursor-pointer"
                >
                  {currentQuestionIndex + 1 < tournamentDeck.length
                    ? lang === 'ar'
                      ? 'الجولة التالية ←'
                      : 'Manche suivante →'
                    : lang === 'ar'
                    ? 'عرض منصة التتويج 🏆'
                    : 'Afficher le podium 🏆'}
                </button>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-2">
                <span className="font-bold text-emerald-300 block">
                  {lang === 'ar' ? 'الجواب الصحيح:' : 'Réponse exacte :'}{' '}
                  {currentQ.options[currentQ.correctIndex][lang]}
                </span>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                  {currentQ.explanation[lang]}
                </p>
              </div>

              {/* Current Live Leaderboard */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {lang === 'ar' ? 'ترتيب الفصل اللحظي:' : 'Classement en direct :'}
                </h4>
                <div className="space-y-2">
                  {sortedLeaderboard.map((p, rankIdx) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                        p.id === 'p-user'
                          ? 'bg-indigo-950/50 border-indigo-500/60 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 font-mono font-bold text-slate-400 tabular-nums">
                          #{rankIdx + 1}
                        </span>
                        <span className="text-base">{p.avatar}</span>
                        <span>{p.name}</span>
                      </div>
                      <span className="font-mono font-extrabold text-amber-300 tabular-nums">
                        {p.score} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Game State 4: Podium Celebration */}
          {gameState === 'podium' && (
            <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-8 shadow-2xl text-center space-y-8">
              <div className="space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 mb-2">
                  <Trophy className="w-10 h-10" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                  {lang === 'ar'
                    ? '🎉 منصة تتويج أبطال التحدي الصفي!'
                    : '🎉 Podium Officiel du Tournoi !'}
                </h3>
                <p className="text-xs md:text-sm text-slate-300">
                  {lang === 'ar'
                    ? 'تهانينا لجميع المشاركين! حصلت على مكافأة +150 XP و +100 نقطة لتطوير رتبتك الأكاديمية.'
                    : 'Félicitations à tous les participants ! Vous remportez +150 XP et +100 points.'}
                </p>
              </div>

              {/* 3 Steps Podium */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-lg mx-auto pt-6 pb-2">
                {sortedLeaderboard[1] && (
                  <div className="space-y-2">
                    <span className="text-2xl block">{sortedLeaderboard[1].avatar}</span>
                    <span className="text-xs font-bold text-white block truncate">
                      {sortedLeaderboard[1].name}
                    </span>
                    <span className="text-xs font-mono font-bold tabular-nums text-slate-300 block">
                      {sortedLeaderboard[1].score} pts
                    </span>
                    <div className="bg-slate-700/80 rounded-t-xl h-24 flex items-center justify-center font-extrabold text-slate-300 text-lg border border-slate-600">
                      🥈 2
                    </div>
                  </div>
                )}

                {sortedLeaderboard[0] && (
                  <div className="space-y-2">
                    <span className="text-3xl block">{sortedLeaderboard[0].avatar}</span>
                    <span className="text-sm font-extrabold text-amber-300 block truncate">
                      {sortedLeaderboard[0].name}
                    </span>
                    <span className="text-xs font-mono font-bold tabular-nums text-amber-400 block">
                      {sortedLeaderboard[0].score} pts
                    </span>
                    <div className="bg-amber-600/90 rounded-t-xl h-36 flex items-center justify-center font-extrabold text-slate-950 text-2xl border-2 border-amber-400 shadow-xl shadow-amber-500/20">
                      🥇 1
                    </div>
                  </div>
                )}

                {sortedLeaderboard[2] && (
                  <div className="space-y-2">
                    <span className="text-2xl block">{sortedLeaderboard[2].avatar}</span>
                    <span className="text-xs font-bold text-white block truncate">
                      {sortedLeaderboard[2].name}
                    </span>
                    <span className="text-xs font-mono font-bold tabular-nums text-slate-300 block">
                      {sortedLeaderboard[2].score} pts
                    </span>
                    <div className="bg-amber-900/60 rounded-t-xl h-18 flex items-center justify-center font-extrabold text-amber-200 text-base border border-amber-800">
                      🥉 3
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setGameState('lobby');
                    setPlayers(prev => prev.map(p => ({ ...p, score: 0, streak: 0 })));
                  }}
                  className="px-6 py-3 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer"
                >
                  {lang === 'ar' ? 'بدء جولة جديدة ↻' : 'Nouveau Tournoi ↻'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
