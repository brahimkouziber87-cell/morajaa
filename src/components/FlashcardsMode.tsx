import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import { DOMAINS } from '../game/curriculumData';
import {
  filterQuestions,
  LeitnerBox,
  LeitnerCardState,
  LEITNER_INTERVAL_DAYS,
  evaluateLeitnerReview,
  isLeitnerCardDue,
  computeLeitnerDeckStats
} from '../game/engine';
import { GLOSSARY_DATABASE } from '../constants/glossaryAndPlannerData';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';

export interface FlashcardItem {
  id: string;
  type: 'concept' | 'exercise';
  domain: MathDomain;
  title: { ar: string; biof: string };
  frontPrompt: { ar: string; biof: string };
  frontFormula?: string;
  backAnswer: { ar: string; biof: string };
  backExplanation: { ar: string; biof: string };
  inspectorTip: { ar: string; biof: string };
}

interface FlashcardsModeProps {
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  onCardMastered: (domain: MathDomain) => void;
}

const MASTERED_STORAGE_KEY = 'math_inspector_flashcards_mastered_v1';
const LEITNER_STORAGE_KEY = 'math_inspector_leitner_srs_v1';

const BOX_METADATA: Record<
  LeitnerBox,
  { ar: string; biof: string; intervalAr: string; intervalFr: string; badgeClass: string }
> = {
  1: {
    ar: 'الصندوق 1 · تثبيت أولي',
    biof: 'Boîte 1 · Initial',
    intervalAr: 'كل يوم (1d)',
    intervalFr: 'Chaque jour (1j)',
    badgeClass: 'border-rose-500/40 bg-rose-950/30 text-rose-300'
  },
  2: {
    ar: 'الصندوق 2 · استحضار قريب',
    biof: 'Boîte 2 · Court terme',
    intervalAr: 'كل 3 أيام (3d)',
    intervalFr: 'Tous les 3j',
    badgeClass: 'border-amber-500/40 bg-amber-950/30 text-amber-300'
  },
  3: {
    ar: 'الصندوق 3 · ترسيخ متوسط',
    biof: 'Boîte 3 · Consolidation',
    intervalAr: 'كل 7 أيام (7d)',
    intervalFr: 'Tous les 7j',
    badgeClass: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300'
  },
  4: {
    ar: 'الصندوق 4 · تحكم متقدم',
    biof: 'Boîte 4 · Avancé',
    intervalAr: 'كل 14 يوماً (14d)',
    intervalFr: 'Tous les 14j',
    badgeClass: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300'
  },
  5: {
    ar: 'الصندوق 5 · ذاكرة طويلة المدى',
    biof: 'Boîte 5 · Long terme',
    intervalAr: 'كل 21 يوماً (21d)',
    intervalFr: 'Tous les 21j',
    badgeClass: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
  }
};

export const FlashcardsMode: React.FC<FlashcardsModeProps> = ({
  levelId,
  streamId,
  lang,
  dualLang,
  onCardMastered
}) => {
  const [selectedDomain, setSelectedDomain] = useState<MathDomain | 'all'>('all');
  const [deckFilter, setDeckFilter] = useState<
    'all' | 'due_srs' | 'concept' | 'exercise' | 'review_only'
  >('all');
  const [selectedBoxFilter, setSelectedBoxFilter] = useState<LeitnerBox | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [shuffleSeed, setShuffleSeed] = useState<number>(0);

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MASTERED_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [srsMap, setSrsMap] = useState<Record<string, LeitnerCardState>>(() => {
    try {
      const saved = localStorage.getItem(LEITNER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [needsReviewIds, setNeedsReviewIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(masteredIds));
    } catch {
      // ignore storage errors
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem(LEITNER_STORAGE_KEY, JSON.stringify(srsMap));
    } catch {
      // ignore storage errors
    }
  }, [srsMap]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Base cards for current level, stream, and domain
  const baseLevelCards = useMemo<FlashcardItem[]>(() => {
    const conceptCards: FlashcardItem[] = GLOSSARY_DATABASE.filter(
      c => c.levels.includes(levelId) && (selectedDomain === 'all' || c.domain === selectedDomain)
    ).map(c => ({
      id: `fc-concept-${c.id}`,
      type: 'concept',
      domain: c.domain,
      title: c.term,
      frontPrompt: {
        ar: `ما هو التعريف الرياضي والصيغة المرجعية لـ: «${c.term.ar}»؟`,
        biof: `Quelle est la définition mathématique et la formule de : « ${c.term.biof} » ?`
      },
      frontFormula: c.symbol,
      backAnswer: {
        ar: c.formula,
        biof: c.formula
      },
      backExplanation: c.definition,
      inspectorTip: c.inspectorTip
    }));

    const questions = filterQuestions(levelId, streamId, selectedDomain);
    const exerciseCards: FlashcardItem[] = questions.map(q => ({
      id: `fc-question-${q.id}`,
      type: 'exercise',
      domain: q.domain,
      title: q.title,
      frontPrompt: q.statement,
      frontFormula: q.formula,
      backAnswer: q.options[q.correctIndex],
      backExplanation: q.explanation,
      inspectorTip: q.inspectorTip
    }));

    return [...conceptCards, ...exerciseCards];
  }, [levelId, streamId, selectedDomain]);

  // Compute Leitner Spaced Repetition statistics across the base deck
  const leitnerStats = useMemo(
    () =>
      computeLeitnerDeckStats(
        baseLevelCards.map(c => c.id),
        srsMap,
        todayISO
      ),
    [baseLevelCards, srsMap, todayISO]
  );

  // Filtered deck according to active filter & Leitner box
  const fullDeck = useMemo<FlashcardItem[]>(() => {
    let combined = [...baseLevelCards];

    if (deckFilter === 'concept') {
      combined = combined.filter(c => c.type === 'concept');
    } else if (deckFilter === 'exercise') {
      combined = combined.filter(c => c.type === 'exercise');
    } else if (deckFilter === 'review_only') {
      combined = combined.filter(c => needsReviewIds.includes(c.id) || !masteredIds.includes(c.id));
    } else if (deckFilter === 'due_srs') {
      combined = combined.filter(c => isLeitnerCardDue(srsMap[c.id], todayISO));
    }

    if (selectedBoxFilter !== 'all') {
      combined = combined.filter(c => srsMap[c.id]?.box === selectedBoxFilter);
    }

    if (shuffleSeed > 0 && combined.length > 1) {
      const copy = [...combined];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = (i * 17 + shuffleSeed * 31) % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    return combined;
  }, [
    baseLevelCards,
    deckFilter,
    selectedBoxFilter,
    shuffleSeed,
    needsReviewIds,
    masteredIds,
    srsMap,
    todayISO
  ]);

  // Reset index and flip state when filters or level change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [levelId, streamId, selectedDomain, deckFilter, selectedBoxFilter, shuffleSeed]);

  const currentCard = fullDeck[currentIndex] || fullDeck[0] || null;
  const currentCardSrs: LeitnerCardState | undefined = currentCard ? srsMap[currentCard.id] : undefined;

  const handleNextCard = useCallback(() => {
    if (fullDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % fullDeck.length);
  }, [fullDeck.length]);

  const handlePrevCard = useCallback(() => {
    if (fullDeck.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + fullDeck.length) % fullDeck.length);
  }, [fullDeck.length]);

  const handleRateLeitner = (rating: 'again' | 'good' | 'easy') => {
    if (!currentCard) return;

    const nextState = evaluateLeitnerReview(srsMap[currentCard.id], currentCard.id, rating, todayISO);
    setSrsMap(prev => ({
      ...prev,
      [currentCard.id]: nextState
    }));

    if (rating === 'again') {
      soundFeedback.playClickSound();
      if (!needsReviewIds.includes(currentCard.id)) {
        setNeedsReviewIds(prev => [...prev, currentCard.id]);
      }
      setMasteredIds(prev => prev.filter(id => id !== currentCard.id));
    } else {
      soundFeedback.playCorrectSound(nextState.box);
      if (!masteredIds.includes(currentCard.id)) {
        setMasteredIds(prev => [...prev, currentCard.id]);
      }
      onCardMastered(currentCard.domain);
      setNeedsReviewIds(prev => prev.filter(id => id !== currentCard.id));
    }

    handleNextCard();
  };

  // Keyboard navigation (Space to flip, Left/Right arrows to navigate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowLeft') {
        lang === 'ar' ? handleNextCard() : handlePrevCard();
      } else if (e.code === 'ArrowRight') {
        lang === 'ar' ? handlePrevCard() : handleNextCard();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lang, handleNextCard, handlePrevCard]);

  const currentLevelObj = LEVELS.find(l => l.id === levelId);
  const currentStreamObj = STREAMS[streamId];
  const masteredInCurrentDeck = fullDeck.filter(c => masteredIds.includes(c.id)).length;
  const masteryPct =
    fullDeck.length > 0 ? Math.round((masteredInCurrentDeck / fullDeck.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Leitner Spaced Repetition System Controls */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold">
              <span>
                {lang === 'ar'
                  ? 'التذكر النشط والتكرار المتباعد الذكي (Leitner Spaced Repetition)'
                  : 'Mémorisation Active & Répétition Espacée (Système Leitner)'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentLevelObj?.name[lang]}</span>
              <span aria-hidden="true">·</span>
              <span>{currentStreamObj?.name[lang]}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {lang === 'ar'
                ? 'طور البطاقات المقلوبة ونظام لايتنر للتكرار المتباعد (5 صناديق)'
                : 'Mode Flashcards 3D & Répétition Espacée Leitner (5 Boîtes)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {lang === 'ar'
                ? 'ينظم نظام لايتنر (Leitner SRS) مراجعاتك زمنياً (بعد يوم، 3 أيام، 7 أيام، 14 يوماً، 21 يوماً) لنقل القواعد والمبرهنات من الذاكرة اللحظية إلى الذاكرة طويلة المدى قبل الامتحان.'
                : 'Le système Leitner planifie vos révisions (1j, 3j, 7j, 14j, 21j) pour ancrer durablement les théorèmes et formules dans la mémoire à long terme.'}
            </p>
          </div>

          {/* Mastery & Due Today Summary Box */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl shrink-0">
            <div>
              <span className="block text-[11px] text-slate-400">
                {lang === 'ar' ? 'مستحقة للمراجعة اليوم' : 'À réviser aujourd\'hui'}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-extrabold text-amber-300 font-mono tabular-nums">
                  {leitnerStats.dueTodayCount}
                </span>
                <span className="text-[11px] text-slate-400">
                  {lang === 'ar' ? 'بطاقة' : 'cartes'}
                </span>
              </div>
            </div>

            <span className="w-px h-8 bg-slate-800" />

            <div>
              <span className="block text-[11px] text-slate-400">
                {lang === 'ar' ? 'البطاقات المتقنة' : 'Cartes maîtrisées'}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">
                  {masteredInCurrentDeck}/{fullDeck.length}
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-400">
                  ({masteryPct}%)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShuffleSeed(prev => prev + 1)}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              {lang === 'ar' ? '🔀 خلط' : '🔀 Mélanger'}
            </button>
          </div>
        </div>

        {/* Proposal 1: Interactive 5-Box Leitner Spaced Repetition Matrix */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold">
                {lang === 'ar' ? '📦 صناديق لايتنر الخمسة (Leitner Boxes)' : '📦 Les 5 Boîtes de Leitner'}
              </span>
              <span className="text-slate-400">
                {lang === 'ar'
                  ? `بطاقات جديدة غير مصنفة: ${leitnerStats.unseenCount} · رسوخ طويل المدى (صندوق 3+): ${leitnerStats.longTermMasteryPct}%`
                  : `Nouvelles cartes : ${leitnerStats.unseenCount} · Ancrage long terme (Boîte 3+) : ${leitnerStats.longTermMasteryPct}%`}
              </span>
            </div>

            {selectedBoxFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedBoxFilter('all')}
                className="text-amber-300 hover:text-amber-200 underline font-bold cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء تصفية الصندوق (عرض الكل)' : 'Afficher toutes les boîtes'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {([1, 2, 3, 4, 5] as LeitnerBox[]).map(boxNum => {
              const meta = BOX_METADATA[boxNum];
              const count = leitnerStats.boxCounts[boxNum] || 0;
              const isSelected = selectedBoxFilter === boxNum;

              return (
                <button
                  key={boxNum}
                  type="button"
                  onClick={() =>
                    setSelectedBoxFilter(prev => (prev === boxNum ? 'all' : boxNum))
                  }
                  className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'ring-2 ring-amber-400 bg-slate-900 border-amber-400'
                      : `${meta.badgeClass} hover:bg-slate-900/90`
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-extrabold truncate">
                      {lang === 'ar' ? meta.ar : meta.biof}
                    </span>
                    <span className="text-sm font-black font-mono tabular-nums">{count}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                    <span>{lang === 'ar' ? meta.intervalAr : meta.intervalFr}</span>
                    <span>+{LEITNER_INTERVAL_DAYS[boxNum]}d</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Domain Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedDomain('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedDomain === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'جميع المجالات' : 'Tous les domaines'}
            </button>
            {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => (
              <button
                key={domKey}
                type="button"
                onClick={() => setSelectedDomain(domKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedDomain === domKey
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {DOMAINS[domKey].icon} {DOMAINS[domKey].name[lang]}
              </button>
            ))}
          </div>

          {/* Card Type & SRS Due Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', ar: 'الكل', biof: 'Toutes' },
                {
                  id: 'due_srs',
                  ar: `⏰ مستحقة اليوم (${leitnerStats.dueTodayCount})`,
                  biof: `⏰ À réviser (${leitnerStats.dueTodayCount})`
                },
                { id: 'concept', ar: 'مفاهيم ومبرهنات', biof: 'Concepts & Théorèmes' },
                { id: 'exercise', ar: 'أسئلة تطبيقية', biof: 'Questions & Exercices' },
                { id: 'review_only', ar: 'غير متقنة بعد', biof: 'Non maîtrisées' }
              ] as const
            ).map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setDeckFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  deckFilter === f.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {f[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main 3D Flip Card Stage */}
      {!currentCard ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <p className="text-base font-bold text-white">
            {lang === 'ar'
              ? 'أحسنت! لا توجد بطاقات متبقية في هذا التصنيف أو الصندوق حالياً.'
              : 'Aucune carte restante dans ce filtre ou cette boîte de Leitner.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDomain('all');
              setDeckFilter('all');
              setSelectedBoxFilter('all');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {lang === 'ar' ? 'عرض جميع البطاقات' : 'Afficher toutes les cartes'}
          </button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Card Counter & Leitner Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 px-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-white tabular-nums">
                {lang === 'ar'
                  ? `البطاقة ${currentIndex + 1} من ${fullDeck.length}`
                  : `Carte ${currentIndex + 1} sur ${fullDeck.length}`}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-indigo-400 font-semibold">
                {DOMAINS[currentCard.domain].icon} {DOMAINS[currentCard.domain].name[lang]}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {currentCard.type === 'concept'
                  ? lang === 'ar'
                    ? 'مفهوم / مبرهنة'
                    : 'Concept / Théorème'
                  : lang === 'ar'
                  ? 'سؤال استحضار'
                  : 'Question Active'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentCardSrs ? (
                <span
                  className={`px-2.5 py-0.5 rounded-lg border text-[11px] font-bold font-mono tabular-nums ${
                    BOX_METADATA[currentCardSrs.box].badgeClass
                  }`}
                >
                  {lang === 'ar'
                    ? `صندوق ${currentCardSrs.box} · المراجعة القادمة: ${currentCardSrs.nextReviewISO}`
                    : `Boîte ${currentCardSrs.box} · Prochaine : ${currentCardSrs.nextReviewISO}`}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 text-[11px] font-semibold">
                  {lang === 'ar' ? 'بطاقة جديدة (لم تُصنف بعد)' : 'Nouvelle carte (Non classée)'}
                </span>
              )}
            </div>
          </div>

          {/* 3D Flip Container */}
          <div
            onClick={() => setIsFlipped(prev => !prev)}
            role="button"
            tabIndex={0}
            aria-label={
              isFlipped
                ? lang === 'ar'
                  ? 'ظهر البطاقة: الجواب والشرح. اضغط للعودة للسؤال'
                  : 'Verso : Réponse. Cliquez pour revenir à la question'
                : lang === 'ar'
                ? 'وجه البطاقة: السؤال. اضغط لقلب البطاقة وإظهار الجواب'
                : 'Recto : Question. Cliquez pour voir la réponse'
            }
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
              }
            }}
            className="perspective-1000 w-full cursor-pointer select-none outline-none"
          >
            <div
              className={`relative w-full min-h-[340px] sm:min-h-[370px] transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT FACE (Question / Concept Prompt) */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between text-xs text-indigo-300 border-b border-slate-800 pb-3">
                  <span className="font-bold">
                    {lang === 'ar' ? 'الوجه الأمامي · السؤال والمفهوم' : 'Recto · Question & Concept'}
                  </span>
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'انقر لقلب البطاقة ↺' : 'Cliquer pour retourner ↺'}
                  </span>
                </div>

                <div className="my-auto py-4 space-y-4 text-center">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-white">
                      {currentCard.title[lang]}
                    </h3>
                    {dualLang && (
                      <p className="text-xs text-indigo-300/80">
                        {currentCard.title[lang === 'ar' ? 'biof' : 'ar']}
                      </p>
                    )}
                  </div>

                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl mx-auto">
                    <MathText text={currentCard.frontPrompt[lang]} />
                  </p>
                  {dualLang && (
                    <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mx-auto">
                      <MathText text={currentCard.frontPrompt[lang === 'ar' ? 'biof' : 'ar']} />
                    </p>
                  )}

                  {currentCard.frontFormula && (
                    <FormulaDisplay
                      formula={currentCard.frontFormula}
                      copyable
                      className="my-2 max-w-xl mx-auto"
                    />
                  )}
                </div>

                <div className="flex items-center justify-center pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold text-indigo-400">
                    {lang === 'ar'
                      ? '↺ اضغط هنا أو على مفتاح المسافة (Space) لكشف الجواب وتقييم تذكرك'
                      : '↺ Cliquez ici ou appuyez sur Espace pour révéler la réponse'}
                  </span>
                </div>
              </div>

              {/* BACK FACE (Answer, Formula & Pedagogical Explanation) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
                <div className="flex items-center justify-between text-xs text-emerald-400 border-b border-slate-800 pb-3">
                  <span className="font-bold">
                    {lang === 'ar'
                      ? 'ظهر البطاقة · الجواب الصحيح والتعليل المنهجي'
                      : 'Verso · Réponse & Justification'}
                  </span>
                  <span className="text-slate-400">
                    {lang === 'ar' ? 'انقر للعودة للسؤال ↻' : 'Cliquer pour revenir ↻'}
                  </span>
                </div>

                <div className="my-auto py-3 space-y-4">
                  <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[11px] text-emerald-300 font-semibold block">
                      {lang === 'ar' ? 'الجواب / الصيغة المرجعية:' : 'Réponse / Formule de référence :'}
                    </span>
                    <div className="text-base sm:text-lg font-extrabold text-white">
                      <FormulaDisplay formula={currentCard.backAnswer[lang]} inline />
                    </div>
                    {dualLang && currentCard.backAnswer.biof !== currentCard.backAnswer.ar && (
                      <div className="text-xs text-emerald-200/80">
                        <FormulaDisplay
                          formula={currentCard.backAnswer[lang === 'ar' ? 'biof' : 'ar']}
                          inline
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                    <p>
                      <MathText text={currentCard.backExplanation[lang]} />
                    </p>
                    {dualLang && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <MathText text={currentCard.backExplanation[lang === 'ar' ? 'biof' : 'ar']} />
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-300/90 leading-relaxed">
                    <strong className="font-bold">
                      {lang === 'ar' ? 'توجيه المفتش: ' : "Conseil de l'Inspecteur : "}
                    </strong>
                    <span>{currentCard.inspectorTip[lang]}</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-400">
                    {lang === 'ar'
                      ? 'قيّم درجة استحضارك أسفله لجدولة البطاقة في صندوق لايتنر المناسب'
                      : 'Évaluez votre rappel ci-dessous pour planifier la prochaine révision Leitner'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation & Leitner Spaced Repetition Evaluation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevCard}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? '→ السابقة' : '← Précédente'}
              </button>
              <button
                type="button"
                onClick={() => setIsFlipped(prev => !prev)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {isFlipped
                  ? lang === 'ar'
                    ? 'عرض السؤال ↺'
                    : 'Voir Question ↺'
                  : lang === 'ar'
                  ? 'قلب البطاقة (الجواب) ↺'
                  : 'Retourner (Réponse) ↺'}
              </button>
              <button
                type="button"
                onClick={handleNextCard}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? 'التالية ←' : 'Suivante →'}
              </button>
            </div>

            {/* 3-Button Leitner SRS Grading Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleRateLeitner('again')}
                title={
                  lang === 'ar'
                    ? 'إعادة البطاقة إلى الصندوق 1 للمراجعة غداً (+1 يوم)'
                    : 'Remettre en Boîte 1 pour révision demain (+1j)'
                }
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-700/60 text-rose-300 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? '🔁 صعب · صندوق 1 (غداً)' : '🔁 Difficile · Boîte 1 (1j)'}
              </button>

              <button
                type="button"
                onClick={() => handleRateLeitner('good')}
                title={
                  lang === 'ar'
                    ? 'ترقية البطاقة للصندوق التالي في نظام لايتنر (+10 XP)'
                    : 'Promouvoir à la boîte suivante (+10 XP)'
                }
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? '👍 جيد · ترقية الصندوق (+10 XP)' : '👍 Bien · Boîte +1 (+10 XP)'}
              </button>

              <button
                type="button"
                onClick={() => handleRateLeitner('easy')}
                title={
                  lang === 'ar'
                    ? 'قفزة مزدوجة في صناديق لايتنر نحو الذاكرة طويلة المدى (+10 XP)'
                    : 'Double saut de boîte Leitner (+10 XP)'
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-black shadow-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                {lang === 'ar' ? '⚡ متقن بسهولة · قفزة (+2 صندوق)' : '⚡ Facile · Saut (+2 Boîtes)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
