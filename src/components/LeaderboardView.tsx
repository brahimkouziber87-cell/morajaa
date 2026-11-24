import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  UserStats,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import {
  CumulativeLeaderboardEntry,
  INITIAL_CUMULATIVE_LEADERBOARD,
  rankCumulativeLeaderboard,
  evaluateStudentBadges
} from '../game/engine';
import {
  CUMULATIVE_LEADERBOARD_STORAGE_KEY,
  DuelChallengePayload,
  DuelPlayerResult,
  upsertDuelParticipantInLeaderboard
} from '../game/duelUtils';
import { BadgesShowcase } from './BadgesShowcase';
import { ShareAchievementModal } from './ShareAchievementModal';
import { FriendlyDuelArena } from './FriendlyDuelArena';

interface LeaderboardViewProps {
  playerName: string;
  currentLevelId: LevelId;
  currentStreamId: StreamId;
  stats: UserStats;
  lang: LanguageOption;
  dualLang: boolean;
  onNavigateToQuiz: () => void;
  onNavigateToTimed: () => void;
  initialDuelCode?: string | null;
  onDuelCompletedPoints?: (earnedScore: number, earnedXp: number, correctCount: number, totalAnswered: number) => void;
  onAdoptPeerName?: (name: string) => void;
}

const CUMULATIVE_STORAGE_KEY = CUMULATIVE_LEADERBOARD_STORAGE_KEY;

function loadSavedLeaderboardEntries(): CumulativeLeaderboardEntry[] {
  try {
    const saved = localStorage.getItem(CUMULATIVE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item: CumulativeLeaderboardEntry) => !item.isCurrentUser && item.id !== 'current-user-entry');
      }
    }
  } catch {
    // ignore parsing error
  }
  return INITIAL_CUMULATIVE_LEADERBOARD;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  playerName,
  currentLevelId,
  currentStreamId,
  stats,
  lang,
  dualLang,
  onNavigateToQuiz,
  onNavigateToTimed,
  initialDuelCode,
  onDuelCompletedPoints,
  onAdoptPeerName
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<LevelId | 'all'>('all');
  const [selectedCycleFilter, setSelectedCycleFilter] = useState<'all' | 'college' | 'lycee'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'xp' | 'accuracy' | 'badges'>('score');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBadgesSection, setShowBadgesSection] = useState<boolean>(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [showDuelArena, setShowDuelArena] = useState<boolean>(true);
  const [persistedLeaderboard, setPersistedLeaderboard] = useState<CumulativeLeaderboardEntry[]>(() =>
    loadSavedLeaderboardEntries()
  );
  const [serverLeaderboardEntries, setServerLeaderboardEntries] = useState<CumulativeLeaderboardEntry[]>([]);
  const [duelUpdateNotice, setDuelUpdateNotice] = useState<string | null>(null);
  const [selectedOpponent, setSelectedOpponent] = useState<{
    name: string;
    levelId: LevelId;
    streamId: StreamId;
    accuracyPct: number;
  } | null>(null);

  // Compute current player's earned badges and title
  const currentBadges = useMemo(() => evaluateStudentBadges(stats), [stats]);
  const unlockedBadges = useMemo(() => currentBadges.filter(b => b.unlocked), [currentBadges]);
  const unlockedTitles = useMemo(() => unlockedBadges.map(b => b.title[lang]), [unlockedBadges, lang]);

  // Sync shared duel leaderboard updates from Express server
  useEffect(() => {
    let active = true;
    const fetchServerLeaderboard = () => {
      fetch('/api/leaderboard')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (active && Array.isArray(data?.leaderboard)) {
            setServerLeaderboardEntries(data.leaderboard);
          }
        })
        .catch(() => {
          // ignore offline errors
        });
    };

    fetchServerLeaderboard();
    const timer = window.setInterval(fetchServerLeaderboard, 6000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  // Handle Friendly Duel completion: persist peer & creator scores to leaderboard immediately
  const handleDuelLeaderboardUpdate = useCallback(
    (duel: DuelChallengePayload, completedRole: 'creator' | 'challenger', completedResult: DuelPlayerResult) => {
      const activeProfileName = (playerName.trim() || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)')).toLowerCase();
      const isSelfDrivenProfileUpdate =
        completedRole === 'creator' ||
        (Boolean(initialDuelCode) && completedResult.playerName.trim().toLowerCase() === activeProfileName);

      setPersistedLeaderboard(prev => {
        let next = [...prev];

        // If duel carries an external creatorResult (from an imported link), ensure creator is also visible on peer's leaderboard
        if (
          duel.creatorResult &&
          duel.creatorResult.playerName.trim().toLowerCase() !== activeProfileName &&
          completedRole === 'challenger'
        ) {
          next = upsertDuelParticipantInLeaderboard(next, {
            playerName: duel.creatorResult.playerName,
            levelId: duel.levelId,
            streamId: duel.streamId,
            score: duel.creatorResult.score,
            xpEarned: duel.creatorResult.score + duel.creatorResult.correctCount * 10,
            correctCount: duel.creatorResult.correctCount,
            totalQuestions: duel.creatorResult.totalQuestions,
            dateISO: duel.createdAtISO
          });
        }

        // Persist non-current-user peer results directly into localStorage leaderboard
        if (!isSelfDrivenProfileUpdate) {
          next = upsertDuelParticipantInLeaderboard(next, {
            playerName: completedResult.playerName,
            levelId: duel.levelId,
            streamId: duel.streamId,
            score: completedResult.score,
            xpEarned: completedResult.score + completedResult.correctCount * 10,
            correctCount: completedResult.correctCount,
            totalQuestions: completedResult.totalQuestions,
            dateISO: new Date().toISOString().slice(0, 10)
          });
        }

        try {
          localStorage.setItem(CUMULATIVE_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore storage quota errors
        }
        return next;
      });

      setDuelUpdateNotice(
        lang === 'ar'
          ? `🏆 تم تحديث لوحة الصدارة بنتيجة المبارزة الودية لـ "${completedResult.playerName}" (+${completedResult.score} نقطة)!`
          : `🏆 Classement mis à jour suite au Duel Amical de "${completedResult.playerName}" (+${completedResult.score} pts) !`
      );
    },
    [playerName, lang, initialDuelCode]
  );

  // Merge persisted leaderboard + server duel updates + current active user
  const rawLeaderboard = useMemo<CumulativeLeaderboardEntry[]>(() => {
    const currentUserName = playerName.trim() || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)');
    const currentUserLower = currentUserName.toLowerCase();

    const currentUserEntry: CumulativeLeaderboardEntry = {
      id: 'current-user-entry',
      studentName: currentUserName,
      levelId: currentLevelId,
      streamId: currentStreamId,
      cumulativeScore: stats.score,
      xp: stats.xp,
      solvedCount: stats.solvedCount,
      correctCount: stats.correctCount,
      badgesCount: unlockedBadges.length,
      unlockedBadgeTitles: unlockedTitles,
      rankBadge: unlockedBadges.length >= 5 ? '🏆' : unlockedBadges.length >= 3 ? '⚔️' : '📘',
      rankTitle: {
        ar: unlockedBadges.length >= 5 ? 'بطل متقدم' : unlockedBadges.length >= 2 ? 'محلل مجتهد' : 'مستكشف صاعد',
        biof: unlockedBadges.length >= 5 ? 'Champion Avancé' : unlockedBadges.length >= 2 ? 'Analyste Assidu' : 'Explorateur Émergent'
      },
      dateISO: new Date().toISOString().slice(0, 10),
      isCurrentUser: true
    };

    const byName = new Map<string, CumulativeLeaderboardEntry>();
    for (const item of persistedLeaderboard) {
      const key = item.studentName.trim().toLowerCase();
      if (key && key !== currentUserLower && !item.isCurrentUser && item.id !== 'current-user-entry') {
        byName.set(key, item);
      }
    }

    // Merge server-synced duel participants without overwriting higher local scores
    for (const srv of serverLeaderboardEntries) {
      const key = srv.studentName.trim().toLowerCase();
      if (!key || key === currentUserLower) continue;
      const existing = byName.get(key);
      if (!existing || srv.cumulativeScore > existing.cumulativeScore) {
        byName.set(key, srv);
      }
    }

    return [currentUserEntry, ...Array.from(byName.values())];
  }, [
    persistedLeaderboard,
    serverLeaderboardEntries,
    playerName,
    currentLevelId,
    currentStreamId,
    stats,
    unlockedBadges,
    unlockedTitles,
    lang
  ]);

  // Filter and sort the leaderboard
  const processedLeaderboard = useMemo(() => {
    let filtered = rawLeaderboard;

    // Filter by Cycle if chosen
    if (selectedCycleFilter !== 'all') {
      const cycleLevels = new Set(LEVELS.filter(l => l.cycle === selectedCycleFilter).map(l => l.id));
      filtered = filtered.filter(item => cycleLevels.has(item.levelId));
    }

    // Filter by Specific Level
    if (selectedLevelFilter !== 'all') {
      filtered = filtered.filter(item => item.levelId === selectedLevelFilter);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(item => item.studentName.toLowerCase().includes(q));
    }

    return rankCumulativeLeaderboard(filtered, sortBy);
  }, [rawLeaderboard, selectedCycleFilter, selectedLevelFilter, searchQuery, sortBy]);

  // Current user's index in the filtered list
  const currentUserRank = useMemo(() => {
    const idx = processedLeaderboard.findIndex(item => item.isCurrentUser);
    return idx >= 0 ? idx + 1 : null;
  }, [processedLeaderboard]);

  const top3 = useMemo(() => processedLeaderboard.slice(0, 3), [processedLeaderboard]);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span>🏆 {lang === 'ar' ? 'لوحة الشرف الوطنية للتلاميذ' : 'Tableau d\'Honneur National des Élèves'}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? 'الترتيب التراكمي الشامل والمبارزة الودية' : 'Classement Cumulatif & Duel Amical'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'ar'
                ? 'لوحة الصدارة التفاعلية (Leaderboard)، المبارزة الودية، ونظام الأوسمة'
                : 'Classement Interactif, Duel Amical entre Amis & Système de Badges'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {lang === 'ar'
                ? 'ترتيب تنافسي لأعلى الطلاب، مع ميزة "المبارزة الودية" (Friendly Duel) لتوليد رابط تحدٍّ خاص بحزمة تمارين رياضية وإرساله للأصدقاء لمقارنة النتائج تمريناً بتمرين.'
                : 'Classement compétitif avec fonction "Duel Amical" permettant de générer un lien de défi sur une série d\'exercices pour comparer vos résultats avec vos amis.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDuelArena(prev => !prev)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer ${
                showDuelArena
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50'
                  : 'bg-slate-950 text-indigo-300 border border-indigo-500/40 hover:bg-slate-800'
              }`}
            >
              <span>⚔️</span>
              <span>
                {showDuelArena
                  ? lang === 'ar'
                    ? 'إخفاء ساحة المبارزة الودية'
                    : 'Masquer l\'Arène de Duel'
                  : lang === 'ar'
                  ? 'فتح المبارزة الودية (Friendly Duel)'
                  : 'Ouvrir Duel Amical'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📤</span>
              <span>{lang === 'ar' ? 'مشاركة بطاقة الإنجاز كصورة' : 'Partager ma Carte'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToTimed}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors cursor-pointer"
            >
              {lang === 'ar' ? '⚡ التحدي الزمني السريع' : '⚡ Défi Chrono Rapide'}
            </button>
          </div>
        </div>

        {/* Current User Competitive Standing Strip */}
        <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400 text-indigo-300 flex items-center justify-center text-xl font-bold font-math shrink-0">
              {playerName ? playerName.slice(0, 1) : '∑'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">
                  {playerName || (lang === 'ar' ? 'أنت (المتعلم)' : 'Vous (Élève)')}
                </h3>
                <span className="text-[11px] bg-indigo-500/20 border border-indigo-400/50 text-indigo-300 px-2 py-0.5 rounded-md font-bold">
                  {lang === 'ar' ? 'أنت (الملف النشط)' : 'Votre profil'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="text-xs text-slate-400">
                  {LEVELS.find(l => l.id === currentLevelId)?.name[lang]} · {STREAMS[currentStreamId]?.name[lang]}
                </p>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>📤</span>
                  <span>{lang === 'ar' ? 'مشاركة بطاقة إنجازاتي كصورة' : 'Partager ma carte d\'accomplissements'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الرتبة في اللوحة' : 'Rang'}</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">
                {currentUserRank ? `#${currentUserRank}` : '—'}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'النقاط التراكمية' : 'Points'}</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                {stats.score}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'نقاط الخبرة XP' : 'XP'}</span>
              <span className="text-lg font-bold text-indigo-300 font-mono">
                {stats.xp}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الأوسمة المحققة' : 'Badges'}</span>
              <span className="text-lg font-bold text-amber-300 font-mono">
                {unlockedBadges.length} / {currentBadges.length}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-3 pt-2">
          {/* Level Filter Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              {lang === 'ar' ? '1. تصفية الترتيب حسب المستوى الدراسي:' : '1. Filtrer le classement par niveau scolaire :'}
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedLevelFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  selectedLevelFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {lang === 'ar' ? 'جميع المستويات (الترتيب العام)' : 'Tous les Niveaux (Général)'}
              </button>

              {LEVELS.map(lvl => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevelFilter(lvl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedLevelFilter === lvl.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {lvl.shortName[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter & Sort Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Cycle Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold me-1">
                {lang === 'ar' ? 'السلك:' : 'Cycle :'}
              </span>
              {[
                { id: 'all' as const, ar: 'الكل', biof: 'Tous' },
                { id: 'college' as const, ar: 'إعدادي', biof: 'Collège' },
                { id: 'lycee' as const, ar: 'تأهيلي', biof: 'Lycée' }
              ].map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCycleFilter(c.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    selectedCycleFilter === c.id
                      ? 'bg-slate-800 text-white border border-indigo-500/50'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {c[lang]}
                </button>
              ))}
            </div>

            {/* Sort Criteria */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-semibold me-1">
                {lang === 'ar' ? 'ترتيب حسب:' : 'Trier par :'}
              </span>
              {[
                { id: 'score' as const, ar: 'النقاط التراكمية', biof: 'Points Cumulés' },
                { id: 'xp' as const, ar: 'نقاط الخبرة (XP)', biof: 'Expérience (XP)' },
                { id: 'accuracy' as const, ar: 'نسبة الدقة %', biof: 'Précision %' },
                { id: 'badges' as const, ar: 'الأوسمة', biof: 'Badges' }
              ].map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortBy(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    sortBy === s.id
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {s[lang]}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="w-full sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? '🔍 ابحث باسم التلميذ...' : '🔍 Chercher un élève...'}
                className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Friendly Duel Arena Section */}
      {showDuelArena && (
        <FriendlyDuelArena
          playerName={playerName}
          currentLevelId={currentLevelId}
          currentStreamId={currentStreamId}
          lang={lang}
          dualLang={dualLang}
          initialDuelCode={initialDuelCode}
          preselectedOpponent={selectedOpponent}
          onDuelCompletedPoints={onDuelCompletedPoints}
          onDuelLeaderboardUpdate={handleDuelLeaderboardUpdate}
          onAdoptPeerName={onAdoptPeerName}
          onServerLeaderboardSync={setServerLeaderboardEntries}
        />
      )}

      {/* Podium Section for Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 bg-slate-900 border border-slate-400/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between h-[230px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-slate-300/20 border border-slate-400 text-slate-200 font-extrabold flex items-center justify-center font-mono text-sm">
                  #2
                </span>
                <span className="text-xl">🥈</span>
              </div>
              <h4 className="text-base font-bold text-white truncate">
                {top3[1].studentName}
              </h4>
              <p className="text-xs text-slate-400">
                {LEVELS.find(l => l.id === top3[1].levelId)?.shortName[lang]} · {STREAMS[top3[1].streamId]?.code}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {top3[1].unlockedBadgeTitles.slice(0, 2).map((bt, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    🎖️ {bt}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{lang === 'ar' ? 'المجموع:' : 'Total :'}</span>
              <span className="font-mono text-xl font-extrabold text-emerald-400">{top3[1].cumulativeScore} pts</span>
            </div>
          </div>

          {/* Rank 1 (Gold) */}
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between h-[260px]">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-extrabold flex items-center justify-center font-mono text-base shadow-md">
                  #1
                </span>
                <span className="text-3xl">👑</span>
              </div>
              <div className="pt-1">
                <span className="text-[11px] font-bold text-amber-400 block">
                  {lang === 'ar' ? 'بطل الصدارة الوطني' : 'Champion National'}
                </span>
                <h4 className="text-lg font-extrabold text-white truncate mt-0.5">
                  {top3[0].studentName}
                </h4>
                <p className="text-xs text-slate-300">
                  {LEVELS.find(l => l.id === top3[0].levelId)?.name[lang]}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {top3[0].unlockedBadgeTitles.slice(0, 3).map((bt, i) => (
                  <span key={i} className="text-[10px] bg-amber-950/50 border border-amber-500/40 text-amber-200 px-2 py-0.5 rounded-md font-semibold">
                    ⭐ {bt}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-amber-300 font-semibold">{lang === 'ar' ? 'النقاط التراكمية:' : 'Points Cumulés :'}</span>
              <span className="font-mono text-2xl font-black text-amber-400">{top3[0].cumulativeScore} pts</span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 bg-slate-900 border border-amber-700/40 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between h-[210px]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-700/20 border border-amber-600 text-amber-400 font-extrabold flex items-center justify-center font-mono text-sm">
                  #3
                </span>
                <span className="text-xl">🥉</span>
              </div>
              <h4 className="text-base font-bold text-white truncate">
                {top3[2].studentName}
              </h4>
              <p className="text-xs text-slate-400">
                {LEVELS.find(l => l.id === top3[2].levelId)?.shortName[lang]} · {STREAMS[top3[2].streamId]?.code}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {top3[2].unlockedBadgeTitles.slice(0, 2).map((bt, i) => (
                  <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    🎖️ {bt}
                  </span>
                ))}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{lang === 'ar' ? 'المجموع:' : 'Total :'}</span>
              <span className="font-mono text-xl font-extrabold text-emerald-400">{top3[2].cumulativeScore} pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Leaderboard Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-4">
        {duelUpdateNotice && (
          <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs font-bold text-emerald-300">
            <span>{duelUpdateNotice}</span>
            <button
              type="button"
              onClick={() => setDuelUpdateNotice(null)}
              className="text-emerald-200 hover:text-white underline shrink-0 cursor-pointer"
            >
              {lang === 'ar' ? 'إغلاق' : 'Fermer'}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {lang === 'ar'
              ? `قائمة الطلاب المتصدرين (${processedLeaderboard.length})`
              : `Liste des Élèves Classés (${processedLeaderboard.length})`}
          </h3>
          <span className="text-xs text-slate-400">
            {lang === 'ar' ? 'اختر أي متعلم لتحديه في مبارزة ودية مباشرة' : 'Défiez n\'importe quel élève en duel amical'}
          </span>
        </div>

        <div className="space-y-2.5">
          {processedLeaderboard.map((entry, idx) => {
            const levelObj = LEVELS.find(l => l.id === entry.levelId);
            const streamObj = STREAMS[entry.streamId];
            const accuracy = entry.solvedCount > 0 ? Math.round((entry.correctCount / entry.solvedCount) * 100) : 0;

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  entry.isCurrentUser
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-950 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`w-9 h-9 rounded-xl font-mono text-sm font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-base font-bold text-white truncate">
                        {entry.studentName}
                      </p>
                      {entry.isCurrentUser && (
                        <span className="text-[10px] bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                          {lang === 'ar' ? 'أنت' : 'Vous'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-indigo-300 font-semibold">{levelObj?.shortName[lang] || entry.levelId}</span>
                      <span>·</span>
                      <span>{streamObj?.code || entry.streamId}</span>
                      <span>·</span>
                      <span className="text-slate-300">{entry.rankTitle[lang]}</span>
                    </div>

                    {/* Unlocked Badges Pills */}
                    {entry.unlockedBadgeTitles && entry.unlockedBadgeTitles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {entry.unlockedBadgeTitles.map((title, tIdx) => (
                          <span
                            key={tIdx}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${
                              entry.isCurrentUser
                                ? 'bg-amber-950/40 border border-amber-400/80 text-amber-200 shadow-sm animate-badge-glow font-bold'
                                : 'bg-slate-900 border border-slate-800 text-amber-300/90'
                            }`}
                          >
                            <span className={entry.isCurrentUser ? 'animate-badge-sparkle inline-block' : ''}>🎖️</span>
                            <span>{title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score, XP, Accuracy Metrics & Direct Duel Button */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-center md:text-end">
                    <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الدقة' : 'Précision'}</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{accuracy}%</span>
                  </div>

                  <div className="text-center md:text-end">
                    <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الخبرة' : 'Exp'}</span>
                    <span className="text-xs font-mono font-bold text-indigo-300">{entry.xp} XP</span>
                  </div>

                  <div className="text-center md:text-end min-w-[70px]">
                    <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'النقاط التراكمية' : 'Points'}</span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">
                      {entry.cumulativeScore}
                    </span>
                  </div>

                  {!entry.isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOpponent({
                          name: entry.studentName,
                          levelId: entry.levelId,
                          streamId: entry.streamId,
                          accuracyPct: accuracy || 75
                        });
                        setShowDuelArena(true);
                        window.scrollTo({ top: 240, behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>⚔️</span>
                      <span>{lang === 'ar' ? 'مبارزة' : 'Défier'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated Badges System Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {lang === 'ar'
              ? 'نظام أوسمة الإنجاز (Badges System) الممنوحة حسب إحصائيات الأداء'
              : 'Système des Badges d\'Accomplissement selon les Statistiques'}
          </h3>
          <button
            type="button"
            onClick={() => setShowBadgesSection(prev => !prev)}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
          >
            {showBadgesSection
              ? (lang === 'ar' ? 'إخفاء تفاصيل الأوسمة' : 'Masquer les badges')
              : (lang === 'ar' ? 'عرض تفاصيل الأوسمة' : 'Afficher les badges')}
          </button>
        </div>

        {showBadgesSection && (
          <BadgesShowcase stats={stats} lang={lang} />
        )}
      </div>

      {/* Share Achievement Card Modal */}
      <ShareAchievementModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        studentName={playerName}
        levelId={currentLevelId}
        streamId={currentStreamId}
        score={stats.score}
        xp={stats.xp}
        accuracyPct={stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 100}
        unlockedBadges={unlockedBadges}
        lang={lang}
      />
    </div>
  );
};

