import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  Question,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import { QUESTIONS_DATABASE, DOMAINS } from '../game/curriculumData';
import {
  CumulativeLeaderboardEntry,
  filterQuestions,
  permuteQuestionOptions
} from '../game/engine';
import {
  DuelPlayerResult,
  DuelChallengePayload,
  DUEL_HISTORY_STORAGE_KEY,
  encodeDuelPayload,
  decodeDuelPayload,
  buildShareableDuelUrl
} from '../game/duelUtils';
import { soundFeedback } from '../utils/feedbackSounds';
import { FormulaDisplay, MathText } from './FormulaDisplay';

export type { DuelPlayerResult, DuelChallengePayload };
export { encodeDuelPayload, decodeDuelPayload, buildShareableDuelUrl };

interface FriendlyDuelArenaProps {
  playerName: string;
  currentLevelId: LevelId;
  currentStreamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  initialDuelCode?: string | null;
  preselectedOpponent?: {
    name: string;
    levelId: LevelId;
    streamId: StreamId;
    accuracyPct: number;
  } | null;
  onDuelCompletedPoints?: (earnedScore: number, earnedXp: number, correctCount: number, totalAnswered: number) => void;
  onDuelLeaderboardUpdate?: (
    duel: DuelChallengePayload,
    completedRole: 'creator' | 'challenger',
    completedResult: DuelPlayerResult
  ) => void;
  onAdoptPeerName?: (name: string) => void;
  onServerLeaderboardSync?: (entries: CumulativeLeaderboardEntry[]) => void;
}

export const FriendlyDuelArena: React.FC<FriendlyDuelArenaProps> = ({
  playerName,
  currentLevelId,
  currentStreamId,
  lang,
  dualLang,
  initialDuelCode,
  preselectedOpponent,
  onDuelCompletedPoints,
  onDuelLeaderboardUpdate,
  onAdoptPeerName,
  onServerLeaderboardSync
}) => {
  const effectivePlayerName = playerName.trim() || (lang === 'ar' ? 'المتعلم المتحدي' : 'Challenger');

  // Duel Builder State
  const [duelLevelId, setDuelLevelId] = useState<LevelId>(currentLevelId);
  const [duelStreamId, setDuelStreamId] = useState<StreamId>(currentStreamId);
  const [duelDomain, setDuelDomain] = useState<MathDomain | 'all'>('all');
  const [friendNameInput, setFriendNameInput] = useState<string>(
    preselectedOpponent?.name || (lang === 'ar' ? 'صديق المراجعة' : 'Ami de révision')
  );
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(false);

  // Active Duel Payload & Phases: 'builder' | 'playing' | 'link_ready' | 'comparison'
  const [phase, setPhase] = useState<'builder' | 'playing' | 'link_ready' | 'comparison'>('builder');
  const [activePayload, setActivePayload] = useState<DuelChallengePayload | null>(null);
  const [playingRole, setPlayingRole] = useState<'creator' | 'challenger'>('creator');
  const [challengerName, setChallengerName] = useState<string>('');
  const [isIncomingInvite, setIsIncomingInvite] = useState<boolean>(false);
  const processedInitialCodeRef = useRef<string | null>(null);

  // Active Quiz Gameplay State inside Duel
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [sessionScore, setSessionScore] = useState<number>(0);
  const [sessionOutcomes, setSessionOutcomes] = useState<boolean[]>([]);

  // Import / Copy Link UI State
  const [importLinkInput, setImportLinkInput] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Saved Duel History
  const [duelHistory, setDuelHistory] = useState<DuelChallengePayload[]>(() => {
    try {
      const saved = localStorage.getItem(DUEL_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const saveDuelToHistory = useCallback((completedDuel: DuelChallengePayload) => {
    setDuelHistory(prev => {
      const filtered = prev.filter(d => d.duelId !== completedDuel.duelId);
      const next = [completedDuel, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(DUEL_HISTORY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Sync level/stream when parent changes if still in builder
  useEffect(() => {
    if (phase === 'builder') {
      setDuelLevelId(currentLevelId);
      setDuelStreamId(currentStreamId);
    }
  }, [currentLevelId, currentStreamId, phase]);

  // Handle preselected opponent from leaderboard row button
  useEffect(() => {
    if (preselectedOpponent) {
      setDuelLevelId(preselectedOpponent.levelId);
      setDuelStreamId(preselectedOpponent.streamId);
      setFriendNameInput(preselectedOpponent.name);
      setPhase('builder');
    }
  }, [preselectedOpponent]);

  // Available questions for the chosen level/stream/domain
  const availableQuestions = useMemo<Question[]>(() => {
    const filtered = filterQuestions(duelLevelId, duelStreamId, duelDomain);
    return filtered.length > 0 ? filtered : QUESTIONS_DATABASE.slice(0, 8);
  }, [duelLevelId, duelStreamId, duelDomain]);

  // Initialize default 5 questions whenever availableQuestions changes
  useEffect(() => {
    const defaultFive = availableQuestions.slice(0, 5).map((q: Question) => q.id);
    setSelectedQuestionIds(defaultFive);
  }, [availableQuestions]);

  // Check if an initialDuelCode was passed via URL (?duel=...) once per token
  useEffect(() => {
    if (!initialDuelCode || processedInitialCodeRef.current === initialDuelCode) return;
    const decoded = decodeDuelPayload(initialDuelCode);
    if (!decoded) return;

    processedInitialCodeRef.current = initialDuelCode;
    setActivePayload(decoded);
    setIsIncomingInvite(true);

    const suggestedPeerName =
      playerName.trim() && playerName.trim() !== decoded.creatorName
        ? playerName.trim()
        : '';

    setChallengerName(suggestedPeerName);
    if (decoded.creatorResult && decoded.challengerResult) {
      saveDuelToHistory(decoded);
      setPhase('comparison');
    } else {
      setPlayingRole('challenger');
      setPhase('link_ready');
    }

    // Hydrate from server if a newer duel state already exists
    fetch(`/api/duels/${encodeURIComponent(decoded.duelId)}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.duel) {
          const serverDuel = data.duel as DuelChallengePayload;
          setActivePayload(serverDuel);
          if (serverDuel.creatorResult && serverDuel.challengerResult) {
            saveDuelToHistory(serverDuel);
            setPhase('comparison');
          }
        }
        if (Array.isArray(data?.leaderboard) && onServerLeaderboardSync) {
          onServerLeaderboardSync(data.leaderboard);
        }
      })
      .catch(() => {
        // Offline / local fallback works seamlessly
      });
  }, [initialDuelCode, playerName, saveDuelToHistory, onServerLeaderboardSync]);

  // Poll server while waiting in link_ready for a remote peer to complete the duel
  useEffect(() => {
    if (phase !== 'link_ready' || !activePayload?.duelId) return;
    if (activePayload.creatorResult && activePayload.challengerResult) return;

    const interval = window.setInterval(() => {
      fetch(`/api/duels/${encodeURIComponent(activePayload.duelId)}`)
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (Array.isArray(data?.leaderboard) && onServerLeaderboardSync) {
            onServerLeaderboardSync(data.leaderboard);
          }
          const serverDuel = data?.duel as DuelChallengePayload | undefined;
          if (serverDuel && serverDuel.challengerResult && !activePayload.challengerResult) {
            setActivePayload(serverDuel);
            saveDuelToHistory(serverDuel);
            soundFeedback.playTaskCompleteSound();
            if (onDuelLeaderboardUpdate) {
              onDuelLeaderboardUpdate(serverDuel, 'challenger', serverDuel.challengerResult);
            }
            if (serverDuel.creatorResult) {
              setPhase('comparison');
            }
          }
        })
        .catch(() => {
          // ignore network errors
        });
    }, 4000);

    return () => window.clearInterval(interval);
  }, [phase, activePayload, saveDuelToHistory, onDuelLeaderboardUpdate, onServerLeaderboardSync]);

  // Timer during 'playing' phase
  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Questions resolved from activePayload
  const duelQuestions = useMemo<Question[]>(() => {
    const ids = activePayload ? activePayload.questionIds : selectedQuestionIds;
    const map = new Map<string, Question>(QUESTIONS_DATABASE.map((q: Question) => [q.id, q]));
    const resolved = ids
      .map((id, idx) => {
        const found = map.get(id);
        return found ? permuteQuestionOptions(found, idx + 1) : null;
      })
      .filter((q): q is Question => q !== null);
    return resolved.length > 0 ? resolved : availableQuestions.slice(0, 5);
  }, [activePayload, selectedQuestionIds, availableQuestions]);

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds(prev => {
      if (prev.includes(qId)) {
        if (prev.length <= 2) return prev; // Keep at least 2 questions
        return prev.filter(id => id !== qId);
      }
      if (prev.length >= 6) return prev; // Max 6 questions per duel
      return [...prev, qId];
    });
  };

  const handleRandomizeFive = () => {
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    setSelectedQuestionIds(shuffled.slice(0, Math.min(5, shuffled.length)).map(q => q.id));
  };

  // Create Duel Payload & either start Creator's round or generate link directly
  const handleCreateDuel = (playCreatorRoundFirst: boolean) => {
    soundFeedback.playClickSound();
    const payload: DuelChallengePayload = {
      duelId: `duel-${Date.now().toString(36)}`,
      levelId: duelLevelId,
      streamId: duelStreamId,
      domain: duelDomain,
      questionIds: selectedQuestionIds.length > 0 ? selectedQuestionIds : availableQuestions.slice(0, 5).map(q => q.id),
      creatorName: effectivePlayerName,
      createdAtISO: new Date().toISOString().slice(0, 10)
    };

    setActivePayload(payload);
    setIsIncomingInvite(false);
    setChallengerName(friendNameInput);

    // Register duel on server so remote peers & leaderboard stay synced
    fetch('/api/duels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {
      // Offline / static fallback works via URL payload
    });

    if (playCreatorRoundFirst) {
      setPlayingRole('creator');
      setCurrentQIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setElapsedSeconds(0);
      setSessionScore(0);
      setSessionOutcomes([]);
      setPhase('playing');
    } else {
      setPhase('link_ready');
    }
  };

  // Start Challenger's Round (Friend accepting the challenge)
  const handleStartChallengerRound = () => {
    if (!activePayload) return;
    soundFeedback.playClickSound();
    const chosenPeerName =
      challengerName.trim() ||
      friendNameInput.trim() ||
      (lang === 'ar' ? 'المنافس الصديق' : 'Ami Challenger');
    setChallengerName(chosenPeerName);
    if (isIncomingInvite && onAdoptPeerName) {
      onAdoptPeerName(chosenPeerName);
    }

    setPlayingRole('challenger');
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setElapsedSeconds(0);
    setSessionScore(0);
    setSessionOutcomes([]);
    setPhase('playing');
  };

  // Simulate Friend's Attempt immediately for instant comparison
  const handleSimulateFriendResult = () => {
    if (!activePayload) return;
    soundFeedback.playTaskCompleteSound();
    const totalQ = duelQuestions.length;
    const targetAcc = preselectedOpponent ? preselectedOpponent.accuracyPct / 100 : 0.72;

    const outcomes: boolean[] = [];
    let score = 0;
    for (let i = 0; i < totalQ; i++) {
      const q = duelQuestions[i];
      // Deterministic + realistic outcome per question
      const isRight = ((i * 37 + activePayload.duelId.charCodeAt(activePayload.duelId.length - 1)) % 100) / 100 <= targetAcc;
      outcomes.push(isRight);
      if (isRight) {
        score += q.points + 8;
      }
    }

    const correctCount = outcomes.filter(Boolean).length;
    const simulatedTime = totalQ * 14 + (totalQ - correctCount) * 6;

    const creatorRes: DuelPlayerResult = activePayload.creatorResult || {
      playerName: activePayload.creatorName,
      score: Math.round(totalQ * 22),
      correctCount: Math.max(1, Math.min(totalQ, Math.round(totalQ * 0.8))),
      totalQuestions: totalQ,
      timeSeconds: totalQ * 15,
      questionOutcomes: duelQuestions.map((_, idx) => idx % 4 !== 3)
    };

    const friendRes: DuelPlayerResult = {
      playerName: challengerName.trim() || friendNameInput.trim() || (lang === 'ar' ? 'الصديق المنافس' : 'Ami Challenger'),
      score,
      correctCount,
      totalQuestions: totalQ,
      timeSeconds: simulatedTime,
      questionOutcomes: outcomes
    };

    const updatedPayload: DuelChallengePayload = {
      ...activePayload,
      creatorResult: creatorRes,
      challengerResult: friendRes
    };

    setActivePayload(updatedPayload);
    saveDuelToHistory(updatedPayload);

    if (onDuelLeaderboardUpdate) {
      onDuelLeaderboardUpdate(updatedPayload, 'challenger', friendRes);
    }

    fetch(`/api/duels/${encodeURIComponent(updatedPayload.duelId)}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duelPayload: updatedPayload,
        role: 'challenger',
        result: friendRes,
        levelId: updatedPayload.levelId,
        streamId: updatedPayload.streamId
      })
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (Array.isArray(data?.leaderboard) && onServerLeaderboardSync) {
          onServerLeaderboardSync(data.leaderboard);
        }
      })
      .catch(() => {});

    setPhase('comparison');
  };

  // Submit current question in Duel Gameplay
  const handleConfirmDuelAnswer = () => {
    if (selectedOption === null || isSubmitted) return;
    const currentQ = duelQuestions[currentQIndex];
    const isCorrect = selectedOption === currentQ.correctIndex;
    const speedBonus = Math.max(0, 12 - Math.floor(elapsedSeconds / (currentQIndex + 1) / 3));
    const earned = isCorrect ? currentQ.points + speedBonus : 0;

    if (isCorrect) {
      soundFeedback.playCorrectSound();
    } else {
      soundFeedback.playIncorrectSound();
    }

    setIsSubmitted(true);
    setSessionScore(prev => prev + earned);
    setSessionOutcomes(prev => [...prev, isCorrect]);
  };

  const handleNextDuelQuestion = () => {
    if (!activePayload) return;

    if (currentQIndex + 1 < duelQuestions.length) {
      soundFeedback.playClickSound();
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Finished the duel round!
      soundFeedback.playTaskCompleteSound();
      const correctCount = sessionOutcomes.filter(Boolean).length;
      const completedName =
        playingRole === 'creator'
          ? activePayload.creatorName
          : challengerName.trim() || friendNameInput.trim() || (lang === 'ar' ? 'المنافس الصديق' : 'Ami Challenger');

      const resultObj: DuelPlayerResult = {
        playerName: completedName,
        score: sessionScore,
        correctCount,
        totalQuestions: duelQuestions.length,
        timeSeconds: elapsedSeconds,
        questionOutcomes: sessionOutcomes
      };

      const isSelfOwnedAttempt =
        playingRole === 'creator' || (playingRole === 'challenger' && isIncomingInvite);

      if (isSelfOwnedAttempt && onDuelCompletedPoints) {
        onDuelCompletedPoints(
          sessionScore,
          sessionScore + correctCount * 10,
          correctCount,
          duelQuestions.length
        );
      }

      if (playingRole === 'challenger' && isIncomingInvite && onAdoptPeerName) {
        onAdoptPeerName(completedName);
      }

      const updated: DuelChallengePayload =
        playingRole === 'creator'
          ? { ...activePayload, creatorResult: resultObj }
          : { ...activePayload, challengerResult: resultObj };

      setActivePayload(updated);

      if (onDuelLeaderboardUpdate) {
        onDuelLeaderboardUpdate(updated, playingRole, resultObj);
      }

      // Sync completion with server & refresh leaderboard
      fetch(`/api/duels/${encodeURIComponent(updated.duelId)}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duelPayload: updated,
          role: playingRole,
          result: resultObj,
          levelId: updated.levelId,
          streamId: updated.streamId
        })
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (Array.isArray(data?.leaderboard) && onServerLeaderboardSync) {
            onServerLeaderboardSync(data.leaderboard);
          }
        })
        .catch(() => {});

      if (playingRole === 'creator' && !updated.challengerResult) {
        setPhase('link_ready');
      } else {
        saveDuelToHistory(updated);
        setPhase('comparison');
      }
    }
  };

  // Build Shareable URL
  const shareableDuelUrl = useMemo(() => {
    if (!activePayload) return '';
    return buildShareableDuelUrl(activePayload);
  }, [activePayload]);

  const handleCopyDuelLink = async () => {
    if (!shareableDuelUrl) return;
    soundFeedback.playClickSound();
    try {
      await navigator.clipboard.writeText(shareableDuelUrl);
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      setCopyFeedback(true);
      window.setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleImportDuelLink = () => {
    soundFeedback.playClickSound();
    setImportError(null);
    const decoded = decodeDuelPayload(importLinkInput);
    if (!decoded) {
      setImportError(
        lang === 'ar'
          ? 'الرابط أو الكود غير صالح. تأكد من نسخ رابط التحدي كاملاً.'
          : 'Lien ou code invalide. Veuillez vérifier le lien du défi.'
      );
      return;
    }

    setActivePayload(decoded);
    setImportLinkInput('');
    setIsIncomingInvite(true);
    if (decoded.creatorResult && decoded.challengerResult) {
      saveDuelToHistory(decoded);
      if (onDuelLeaderboardUpdate) {
        onDuelLeaderboardUpdate(decoded, 'challenger', decoded.challengerResult);
      }
      setPhase('comparison');
    } else {
      setChallengerName(
        playerName.trim() && playerName.trim() !== decoded.creatorName
          ? playerName.trim()
          : ''
      );
      setPlayingRole('challenger');
      setPhase('link_ready');
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
            <span>⚔️ {lang === 'ar' ? 'المبارزة الودية التنافسية (Friendly Duel)' : 'Duel Amical entre Amis (Friendly Duel)'}</span>
            <span aria-hidden="true">·</span>
            <span>{lang === 'ar' ? 'تحدي الأصدقاء بنفس التمارين ومقارنة النتائج' : 'Défiez vos amis sur les mêmes exercices'}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            {lang === 'ar'
              ? 'أنشئ رابط تحدٍّ خاص بمجموعة تمارين رياضية وقارن نتيجتك مع أصدقائك'
              : 'Générez un Lien de Défi Mathématique et Comparez vos Résultats'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {lang === 'ar'
              ? 'اختر مجموعة محددة من المسائل الرياضية حسب مستواك، خُض الجولة الأولى لتسجيل رقمك القياسي، ثم أرسل رابط التحدي لصديقك ليحل نفس التمارين وتظهر جدول المقارنة التفصيلية تمريناً بتمرين!'
              : 'Sélectionnez une série d\'exercices, jouez votre manche pour enregistrer votre score, puis partagez le lien du défi avec un ami pour comparer vos performances question par question.'}
          </p>
        </div>

        {phase !== 'builder' && (
          <button
            type="button"
            onClick={() => {
              setPhase('builder');
              setActivePayload(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer self-start lg:self-center shrink-0"
          >
            {lang === 'ar' ? '🔄 إعداد مبارزة جديدة' : '🔄 Nouveau Duel'}
          </button>
        )}
      </div>

      {/* Paste / Open Friend's Challenge Link Bar */}
      {phase === 'builder' && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-amber-300 block">
              {lang === 'ar'
                ? '📩 هل وصلك رابط أو كود تحدٍّ من صديق؟'
                : '📩 Avez-vous reçu un lien ou code de défi d\'un ami ?'}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {lang === 'ar'
                ? 'الصق رابط التحدي هنا لخوض نفس التمارين ومقارنة نتيجتكما فوراً.'
                : 'Collez le lien ici pour résoudre les mêmes exercices et comparer vos scores.'}
            </span>
          </div>

          <div className="flex flex-1 max-w-xl items-center gap-2">
            <input
              type="text"
              value={importLinkInput}
              onChange={e => setImportLinkInput(e.target.value)}
              placeholder={
                lang === 'ar'
                  ? 'الصق رابط المبارزة (?duel=...) هنا...'
                  : 'Collez le lien du duel (?duel=...) ici...'
              }
              dir="ltr"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="button"
              onClick={handleImportDuelLink}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 cursor-pointer"
            >
              {lang === 'ar' ? 'فتح التحدي ⚔️' : 'Ouvrir le Défi ⚔️'}
            </button>
          </div>
          {importError && <p className="text-xs text-rose-400 font-semibold w-full">{importError}</p>}
        </div>
      )}

      {/* PHASE 1: DUEL BUILDER */}
      {phase === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Configuration Column */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎯</span>
                <span>
                  {lang === 'ar'
                    ? '1. تخصيص إعدادات المبارزة ومجموعة التمارين'
                    : '1. Configurer le Duel et la Série d\'Exercices'}
                </span>
              </h4>
              <span className="text-xs font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg">
                {selectedQuestionIds.length} {lang === 'ar' ? 'تمارين محددة' : 'exercices choisis'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Level Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {lang === 'ar' ? 'المستوى الدراسي للمبارزة:' : 'Niveau scolaire du duel :'}
                </label>
                <select
                  value={duelLevelId}
                  onChange={e => {
                    const nextLvl = e.target.value as LevelId;
                    setDuelLevelId(nextLvl);
                    const lvlObj = LEVELS.find(l => l.id === nextLvl);
                    if (lvlObj && lvlObj.allowedStreams.length > 0) {
                      setDuelStreamId(lvlObj.allowedStreams[0]);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-indigo-500"
                >
                  {LEVELS.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name[lang]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Friend / Opponent Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {lang === 'ar' ? 'اسم الصديق أو المنافس المستهدف:' : 'Nom de l\'ami / adversaire :'}
                </label>
                <input
                  type="text"
                  value={friendNameInput}
                  onChange={e => setFriendNameInput(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: سارة / أمين...' : 'Ex: Sara / Amine...'}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Domain Filter Pills */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                {lang === 'ar' ? 'مجال التمارين في المبارزة:' : 'Domaine mathématique :'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDuelDomain('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    duelDomain === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? 'جميع المجالات (شامل)' : 'Tous les domaines'}
                </button>
                {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
                  <button
                    key={domKey}
                    type="button"
                    onClick={() => setDuelDomain(domKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                      duelDomain === domKey
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="font-mono">{DOMAINS[domKey].icon}</span>
                    <span>{DOMAINS[domKey].name[lang]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Problem Set Preview & Custom Picker Toggle */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300">
                  {lang === 'ar'
                    ? 'حزمة المسائل الرياضية المختارة للمبارزة:'
                    : 'Série de problèmes sélectionnés pour le duel :'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRandomizeFive}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    🎲 {lang === 'ar' ? 'قرعة عشوائية (5 تمارين)' : 'Tirage aléatoire (5 Q)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomPicker(prev => !prev)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                  >
                    {showCustomPicker
                      ? lang === 'ar'
                        ? 'إغلاق التحديد اليدوي'
                        : 'Fermer la sélection'
                      : lang === 'ar'
                      ? 'تحديد التمارين يدوياً'
                      : 'Choisir manuellement'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {(showCustomPicker ? availableQuestions : duelQuestions).map((q, idx) => {
                  const isSelected = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => showCustomPicker && toggleQuestionSelection(q.id)}
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                        showCustomPicker ? 'cursor-pointer' : ''
                      } ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-100'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {showCustomPicker ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="accent-indigo-500 rounded cursor-pointer"
                          />
                        ) : (
                          <span className="w-5 h-5 rounded-md bg-indigo-600/30 border border-indigo-400/50 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{q.title[lang]}</p>
                          <p className="text-[11px] text-slate-400 truncate">{q.statement[lang]}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-400 shrink-0">
                        +{q.points} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Launch Actions Card */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  {lang === 'ar' ? 'بطاقة انطلاق المبارزة' : 'Carte de Lancement du Duel'}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {LEVELS.find(l => l.id === duelLevelId)?.shortName[lang]} · {STREAMS[duelStreamId]?.code}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="text-center flex-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-600/30 border border-indigo-400 text-indigo-300 font-bold flex items-center justify-center">
                    {effectivePlayerName.slice(0, 1)}
                  </div>
                  <p className="text-xs font-bold text-white mt-1.5 truncate">{effectivePlayerName}</p>
                  <span className="text-[10px] text-indigo-400">{lang === 'ar' ? 'صانع التحدي' : 'Créateur'}</span>
                </div>

                <div className="text-center px-2">
                  <span className="text-lg font-black text-amber-400 font-mono block">VS</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedQuestionIds.length} Q
                  </span>
                </div>

                <div className="text-center flex-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-rose-600/30 border border-rose-400 text-rose-300 font-bold flex items-center justify-center">
                    {(friendNameInput || 'F').slice(0, 1)}
                  </div>
                  <p className="text-xs font-bold text-white mt-1.5 truncate">
                    {friendNameInput || (lang === 'ar' ? 'الصديق المنافس' : 'Ami Challenger')}
                  </p>
                  <span className="text-[10px] text-rose-400">{lang === 'ar' ? 'المنافس' : 'Adversaire'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'يمكنك خوض التمارين الخمسة الآن لتثبيت نتيجتك في الرابط قبل إرساله لصديقك، أو توليد رابط التحدي مباشرة.'
                  : 'Vous pouvez résoudre les 5 exercices maintenant pour inclure votre score dans le lien, ou générer le lien directement.'}
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleCreateDuel(true)}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>⚔️</span>
                <span>
                  {lang === 'ar'
                    ? 'ابدأ جولتك أولاً ثم أنشئ رابط التحدي لصديقك'
                    : 'Jouer ma manche puis générer le lien du défi'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCreateDuel(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                <span>
                  {lang === 'ar'
                    ? 'توليد رابط التحدي الفوري لحزمة التمارين'
                    : 'Générer immédiatement le lien de défi'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: ACTIVE DUEL GAMEPLAY (CREATOR OR CHALLENGER TURN) */}
      {phase === 'playing' && duelQuestions[currentQIndex] && (
        <div className="bg-slate-950 border border-indigo-500/50 rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-extrabold">
                {playingRole === 'creator'
                  ? lang === 'ar'
                    ? `جولة صانع التحدي: ${activePayload?.creatorName}`
                    : `Manche du Créateur : ${activePayload?.creatorName}`
                  : lang === 'ar'
                  ? `جولة المنافس: ${challengerName || friendNameInput}`
                  : `Manche de l'Adversaire : ${challengerName || friendNameInput}`}
              </span>
              <span className="text-xs font-mono text-slate-300">
                {lang === 'ar'
                  ? `التمرين ${currentQIndex + 1} من ${duelQuestions.length}`
                  : `Question ${currentQIndex + 1} sur ${duelQuestions.length}`}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                ⏱️ {elapsedSeconds}s
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
                🏆 {sessionScore} pts
              </span>
            </div>
          </div>

          {/* Current Duel Question Display */}
          {(() => {
            const q = duelQuestions[currentQIndex];
            return (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 block mb-1">{q.title[lang]}</span>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    <MathText text={q.statement[lang]} />
                  </h4>
                  {dualLang && (
                    <p className="text-xs text-slate-400 mt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      <MathText text={q.statement[lang === 'ar' ? 'biof' : 'ar']} />
                    </p>
                  )}
                  {q.formula && (
                    <FormulaDisplay formula={q.formula} copyable className="mt-3" />
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, idx) => {
                    const isPicked = selectedOption === idx;
                    const isRight = idx === q.correctIndex;
                    let btnStyle = 'bg-slate-900 border-slate-800 text-slate-200 hover:border-indigo-500/60';
                    if (isSubmitted) {
                      if (isRight) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isPicked && !isRight) {
                        btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      }
                    } else if (isPicked) {
                      btnStyle = 'bg-indigo-950/70 border-indigo-400 text-white ring-2 ring-indigo-500/30';
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                      >
                        <div className="text-xs sm:text-sm">
                          <span className="block font-bold">{opt[lang]}</span>
                          {dualLang && (
                            <span className="block text-[11px] text-slate-400 mt-0.5">
                              {opt[lang === 'ar' ? 'biof' : 'ar']}
                            </span>
                          )}
                        </div>
                        {isSubmitted && isRight && <span>✅</span>}
                        {isSubmitted && isPicked && !isRight && <span>❌</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Action Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  {!isSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleConfirmDuelAnswer}
                      className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'تأكيد الجواب في المبارزة' : 'Valider ma réponse'}
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                      <p className="text-xs text-slate-300">
                        <strong className="text-amber-300">
                          {lang === 'ar' ? 'التعليل المنهجي: ' : 'Explication : '}
                        </strong>
                        {q.explanation[lang]}
                      </p>
                      <button
                        type="button"
                        onClick={handleNextDuelQuestion}
                        className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 transition-colors cursor-pointer"
                      >
                        {currentQIndex + 1 < duelQuestions.length
                          ? lang === 'ar'
                            ? 'التمرين الموالي ←'
                            : 'Question suivante →'
                          : lang === 'ar'
                          ? 'إنهاء الجولة واعتماد النتيجة 🏁'
                          : 'Terminer la manche 🏁'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* PHASE 3: CHALLENGE LINK READY & FRIEND TURN LAUNCHER */}
      {phase === 'link_ready' && activePayload && (
        <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 block">
                {isIncomingInvite
                  ? lang === 'ar'
                    ? `⚔️ دعوة مبارزة ودية مفتوحة من: ${activePayload.creatorName}`
                    : `⚔️ Invitation de Duel Amical reçue de : ${activePayload.creatorName}`
                  : lang === 'ar'
                  ? '✅ رابط التحدي جاهز للمشاركة!'
                  : '✅ Lien du Défi Prêt à Partager !'}
              </span>
              <h4 className="text-lg font-extrabold text-white mt-0.5">
                {isIncomingInvite
                  ? lang === 'ar'
                    ? `تحدى ${activePayload.creatorName} في حزمة من ${duelQuestions.length} تمارين وحدّث لوحة الصدارة`
                    : `Affrontez ${activePayload.creatorName} sur ${duelQuestions.length} exercices et entrez au classement`
                  : lang === 'ar'
                  ? `مبارزة الرياضيات الودية من إعداد: ${activePayload.creatorName}`
                  : `Duel Mathématique créé par : ${activePayload.creatorName}`}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {LEVELS.find(l => l.id === activePayload.levelId)?.name[lang]} · {duelQuestions.length}{' '}
                {lang === 'ar' ? 'مسائل رياضية موحدة' : 'problèmes identiques'}
              </p>
            </div>

            {activePayload.creatorResult && (
              <div className="bg-slate-900 border border-indigo-500/40 rounded-xl px-4 py-2.5 flex items-center gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {lang === 'ar' ? 'نتيجة صانع التحدي المسجلة' : 'Score du créateur'}
                  </span>
                  <span className="text-sm font-extrabold text-indigo-300 font-mono">
                    {activePayload.creatorResult.score} pts ({activePayload.creatorResult.correctCount}/
                    {activePayload.creatorResult.totalQuestions}) · {activePayload.creatorResult.timeSeconds}s
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Incoming Peer Invitation Card (highlighted when opened from URL) */}
          {isIncomingInvite && (
            <div className="bg-gradient-to-r from-indigo-950/60 to-emerald-950/40 border border-indigo-500/50 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-indigo-300">
                  {lang === 'ar'
                    ? '🎯 التمارين المشفرة داخل رابط التحدي:'
                    : '🎯 Série d\'exercices contenue dans le lien :'}
                </span>
                <span className="text-[11px] font-mono text-emerald-300">
                  {duelQuestions.length} {lang === 'ar' ? 'أسئلة جاهزة' : 'questions prêtes'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {duelQuestions.map((dq, qIdx) => (
                  <span
                    key={dq.id}
                    className="text-[11px] bg-slate-900/90 border border-slate-700 text-slate-200 px-2.5 py-1 rounded-lg"
                  >
                    #{qIdx + 1} {dq.title[lang]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shareable Challenge Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-amber-300">
              {lang === 'ar'
                ? '🔗 انسخ رابط التحدي وأرسله لصديقك (يتضمن حزمة التمارين المحددة ونتيجتك، ويحدّث لوحة الصدارة فور إنهائه):'
                : '🔗 Copiez ce lien de défi et envoyez-le à votre ami (contient les exercices et met à jour le classement) :'}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareableDuelUrl}
                dir="ltr"
                aria-label="Shareable Duel URL"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-indigo-200 font-mono select-all outline-none"
              />
              <button
                type="button"
                onClick={handleCopyDuelLink}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shrink-0"
              >
                {copyFeedback
                  ? lang === 'ar'
                    ? '✓ تم نسخ رابط التحدي!'
                    : '✓ Lien copié !'
                  : lang === 'ar'
                  ? '📋 نسخ رابط التحدي'
                  : '📋 Copier le lien'}
              </button>
            </div>
          </div>

          {/* Friend / Challenger Action Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h5 className="text-xs sm:text-sm font-bold text-white">
                {isIncomingInvite
                  ? lang === 'ar'
                    ? '🚀 أدخل اسمك لبدء المبارزة وتسجيل نقطتك في لوحة الصدارة:'
                    : '🚀 Entrez votre nom pour relever le défi et apparaître au classement :'
                  : lang === 'ar'
                  ? '🤝 خوض جولة الصديق المنافس ومقارنة النتائج فوراً:'
                  : '🤝 Jouer la manche de l\'ami et comparer les résultats :'}
              </h5>
              <p className="text-xs text-slate-400">
                {lang === 'ar'
                  ? 'بمجرد إنهاء الصديق للأسئلة المحددة، يتم تحديث لوحة الصدارة التنافسية وعرض جدول المقارنة التفصيلي.'
                  : 'Dès que votre ami termine la série, le classement est mis à jour automatiquement avec le comparatif détaillé.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={challengerName}
                onChange={e => {
                  setChallengerName(e.target.value);
                  setFriendNameInput(e.target.value);
                }}
                placeholder={lang === 'ar' ? 'اكتب اسمك أو اسم المنافس...' : 'Votre nom ou celui de l\'ami...'}
                className="bg-slate-950 border border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-white font-semibold outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleStartChallengerRound}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-md"
              >
                {isIncomingInvite
                  ? lang === 'ar'
                    ? '⚔️ اقبل التحدي وابدأ الحل الآن'
                    : '⚔️ Relever le Défi Maintenant'
                  : lang === 'ar'
                  ? '🎮 ابدأ جولة الصديق الآن'
                  : '🎮 Jouer la manche de l\'ami'}
              </button>
              {!isIncomingInvite && (
                <button
                  type="button"
                  onClick={handleSimulateFriendResult}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  {lang === 'ar' ? '⚡ مقارنة فورية مع نتيجة الصديق' : '⚡ Comparer les résultats maintenant'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: HEAD-TO-HEAD RESULTS COMPARISON */}
      {phase === 'comparison' && activePayload && activePayload.creatorResult && activePayload.challengerResult && (
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-2xl p-6 space-y-6">
          {(() => {
            const p1 = activePayload.creatorResult!;
            const p2 = activePayload.challengerResult!;
            const p1Wins = p1.score > p2.score || (p1.score === p2.score && p1.timeSeconds <= p2.timeSeconds);
            const isTie = p1.score === p2.score && p1.timeSeconds === p2.timeSeconds;

            return (
              <>
                {/* Winner Announcement Banner */}
                <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <span className="text-xs font-bold text-amber-400 block">
                        {lang === 'ar' ? 'النتيجة النهائية للمبارزة الودية' : 'Résultat Final du Duel Amical'}
                      </span>
                      <h4 className="text-lg font-extrabold text-white">
                        {isTie
                          ? lang === 'ar'
                            ? 'تعادل مثالي في النقاط والزمن!'
                            : 'Égalité parfaite !'
                          : lang === 'ar'
                          ? `الفائز بالمبارزة: ${p1Wins ? p1.playerName : p2.playerName} 🎉`
                          : `Vainqueur du Duel : ${p1Wins ? p1.playerName : p2.playerName} 🎉`}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyDuelLink}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
                    >
                      {copyFeedback
                        ? lang === 'ar'
                          ? '✓ تم نسخ رابط النتيجة!'
                          : '✓ Lien copié !'
                        : lang === 'ar'
                        ? '📤 مشاركة رابط النتيجة النهائية'
                        : '📤 Partager le résultat'}
                    </button>
                  </div>
                </div>

                {/* Head-to-Head Player Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Player 1 Card */}
                  <div
                    className={`p-5 rounded-xl border ${
                      p1Wins
                        ? 'bg-indigo-950/40 border-amber-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-indigo-400 block">
                          {lang === 'ar' ? 'المتحدي الأول (صانع التحدي)' : 'Joueur 1 (Créateur)'}
                        </span>
                        <h5 className="text-base font-extrabold text-white">{p1.playerName}</h5>
                      </div>
                      {p1Wins && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-extrabold">
                          👑 {lang === 'ar' ? 'الفائز' : 'Gagnant'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'النقاط' : 'Score'}</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">{p1.score}</span>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الدقة' : 'Précision'}</span>
                        <span className="text-base font-extrabold text-white font-mono">
                          {p1.correctCount}/{p1.totalQuestions}
                        </span>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الزمن' : 'Temps'}</span>
                        <span className="text-base font-extrabold text-amber-300 font-mono">{p1.timeSeconds}s</span>
                      </div>
                    </div>
                  </div>

                  {/* Player 2 Card */}
                  <div
                    className={`p-5 rounded-xl border ${
                      !p1Wins && !isTie
                        ? 'bg-emerald-950/40 border-amber-400 shadow-lg'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] font-bold text-rose-400 block">
                          {lang === 'ar' ? 'المتحدي الثاني (الصديق المنافس)' : 'Joueur 2 (Ami Challenger)'}
                        </span>
                        <h5 className="text-base font-extrabold text-white">{p2.playerName}</h5>
                      </div>
                      {!p1Wins && !isTie && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-extrabold">
                          👑 {lang === 'ar' ? 'الفائز' : 'Gagnant'}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'النقاط' : 'Score'}</span>
                        <span className="text-base font-extrabold text-emerald-400 font-mono">{p2.score}</span>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الدقة' : 'Précision'}</span>
                        <span className="text-base font-extrabold text-white font-mono">
                          {p2.correctCount}/{p2.totalQuestions}
                        </span>
                      </div>
                      <div className="bg-slate-950 rounded-lg p-2 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الزمن' : 'Temps'}</span>
                        <span className="text-base font-extrabold text-amber-300 font-mono">{p2.timeSeconds}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question-by-Question Comparison Table */}
                <div className="space-y-2.5">
                  <h5 className="text-sm font-bold text-white">
                    {lang === 'ar'
                      ? '📊 مقارنة الأداء التفصيلية تمريناً بتمرين:'
                      : '📊 Comparaison détaillée question par question :'}
                  </h5>
                  <div className="space-y-2">
                    {duelQuestions.map((q, idx) => {
                      const p1Right = p1.questionOutcomes[idx] ?? false;
                      const p2Right = p2.questionOutcomes[idx] ?? false;
                      return (
                        <div
                          key={q.id}
                          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-indigo-400">#{idx + 1}</span>
                              <span className="text-xs font-bold text-white">{q.title[lang]}</span>
                            </div>
                            <p className="text-xs text-slate-300">{q.statement[lang]}</p>
                            <p className="text-[11px] text-emerald-400 font-semibold">
                              {lang === 'ar' ? 'الجواب الصحيح: ' : 'Réponse correcte : '}
                              {q.options[q.correctIndex]?.[lang]}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                                p1Right
                                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <span>{p1Right ? '✓' : '✗'}</span>
                              <span>{p1.playerName}</span>
                            </div>

                            <div
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                                p2Right
                                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                                  : 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                              }`}
                            >
                              <span>{p2Right ? '✓' : '✗'}</span>
                              <span>{p2.playerName}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Recent Duels History Log */}
      {duelHistory.length > 0 && phase === 'builder' && (
        <div className="border-t border-slate-800 pt-4 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'ar' ? 'سجل المبارزات الودية الأخيرة' : 'Historique des Duels Récents'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {duelHistory.slice(0, 4).map(item => (
              <div
                key={item.duelId}
                className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white">
                    {item.creatorResult?.playerName || item.creatorName}
                  </span>
                  <span className="text-amber-400 font-mono mx-1.5">VS</span>
                  <span className="font-bold text-white">
                    {item.challengerResult?.playerName || '—'}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.creatorResult?.score ?? 0} pts — {item.challengerResult?.score ?? 0} pts ·{' '}
                    {LEVELS.find(l => l.id === item.levelId)?.shortName[lang]}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePayload(item);
                    setPhase('comparison');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 font-bold cursor-pointer shrink-0"
                >
                  {lang === 'ar' ? 'عرض المقارنة' : 'Voir comparatif'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
