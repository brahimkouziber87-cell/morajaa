import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  Question,
  LEVELS,
  STREAMS,
  DOMAINS
} from '../constants/dataStructure';
import {
  generateTimedChallengeDeck,
  calculateTimedFinalScore,
  rankLeaderboardEntries,
  INITIAL_LEADERBOARD,
  LeaderboardEntry
} from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';

interface TimedChallengeModeProps {
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  defaultStudentName?: string;
  onChallengeCompleted: (
    earnedScore: number,
    earnedXp: number,
    correctCount: number,
    totalAnswered: number,
    missedQuestions?: Question[]
  ) => void;
}

const LEADERBOARD_STORAGE_KEY = 'math_inspector_timed_leaderboard_v1';

export const TimedChallengeMode: React.FC<TimedChallengeModeProps> = ({
  levelId,
  streamId,
  lang,
  dualLang,
  defaultStudentName = '',
  onChallengeCompleted
}) => {
  const [timeLimitSec, setTimeLimitSec] = useState<number>(120);
  const [status, setStatus] = useState<'idle' | 'running' | 'finished'>('idle');
  const [sessionSeed, setSessionSeed] = useState<number>(1);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(120);
  const [rawScore, setRawScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [answersLog, setAnswersLog] = useState<{ question: Question; chosenIdx: number; isCorrect: boolean }[]>([]);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return rankLeaderboardEntries(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
    return rankLeaderboardEntries(INITIAL_LEADERBOARD);
  });

  const [studentName, setStudentName] = useState<string>(defaultStudentName);
  const [nameError, setNameError] = useState<string>('');
  const [scoreSaved, setScoreSaved] = useState<boolean>(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'all' | 'current_level'>('all');

  useEffect(() => {
    if (defaultStudentName && !studentName) {
      setStudentName(defaultStudentName);
    }
  }, [defaultStudentName, studentName]);

  // Memoize the 10-question non-repeating deck so it only recalculates when starting a new session or changing level/stream
  const deck = useMemo(
    () => generateTimedChallengeDeck(levelId, streamId, 10, sessionSeed),
    [levelId, streamId, sessionSeed]
  );

  // Refs to avoid stale state inside interval callback
  const rawScoreRef = useRef(rawScore);
  const correctCountRef = useRef(correctCount);
  const answersLogRef = useRef(answersLog);
  rawScoreRef.current = rawScore;
  correctCountRef.current = correctCount;
  answersLogRef.current = answersLog;

  useEffect(() => {
    if (status !== 'running') return;

    const timerId = window.setInterval(() => {
      setTimeLeftSec(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [status]);

  useEffect(() => {
    if (status === 'running' && timeLeftSec === 0) {
      setStatus('finished');
      const { finalScore } = calculateTimedFinalScore(
        rawScoreRef.current,
        correctCountRef.current,
        10,
        0
      );
      soundFeedback.playExamResultSound(correctCountRef.current >= 5);
      onChallengeCompleted(
        finalScore,
        Math.round(finalScore * 1.2),
        correctCountRef.current,
        answersLogRef.current.length,
        answersLogRef.current.filter(a => !a.isCorrect).map(a => a.question)
      );
    }
  }, [status, timeLeftSec, onChallengeCompleted]);

  const handleStartChallenge = () => {
    setSessionSeed(prev => prev + 1);
    setCurrentIdx(0);
    setTimeLeftSec(timeLimitSec);
    setRawScore(0);
    setCorrectCount(0);
    setStreak(0);
    setAnswersLog([]);
    setScoreSaved(false);
    setNameError('');
    setStatus('running');
  };

  const handleAnswerClick = (optionIdx: number) => {
    if (status !== 'running') return;
    const currentQuestion = deck[currentIdx];
    if (!currentQuestion) return;

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const streakBonus = isCorrect ? Math.min(streak * 5, 25) : 0;
    const questionPoints = isCorrect ? currentQuestion.points + streakBonus : 0;

    const nextRawScore = rawScore + questionPoints;
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextLog = [...answersLog, { question: currentQuestion, chosenIdx: optionIdx, isCorrect }];

    setRawScore(nextRawScore);
    setCorrectCount(nextCorrectCount);
    setStreak(nextStreak);
    setAnswersLog(nextLog);

    if (isCorrect) {
      soundFeedback.playCorrectSound(nextStreak);
    } else {
      soundFeedback.playIncorrectSound();
    }

    if (currentIdx + 1 >= deck.length) {
      // Completed all 10 rapid-fire questions!
      setStatus('finished');
      const { finalScore } = calculateTimedFinalScore(
        nextRawScore,
        nextCorrectCount,
        deck.length,
        timeLeftSec
      );
      soundFeedback.playExamResultSound(nextCorrectCount >= 5);
      onChallengeCompleted(
        finalScore,
        Math.round(finalScore * 1.2),
        nextCorrectCount,
        deck.length,
        nextLog.filter(a => !a.isCorrect).map(a => a.question)
      );
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleSaveToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) {
      setNameError(
        lang === 'ar'
          ? 'يرجى إدخال اسمك أو لقبك الدراسي لتوثيق نتيجتك في لوحة الشرف.'
          : 'Veuillez saisir votre nom ou pseudonyme pour enregistrer votre score.'
      );
      return;
    }

    const { finalScore } = calculateTimedFinalScore(rawScore, correctCount, deck.length, timeLeftSec);
    const newEntry: LeaderboardEntry = {
      id: `lb-user-${Date.now()}`,
      studentName: trimmed,
      levelId,
      streamId,
      score: finalScore,
      correctCount,
      totalQuestions: deck.length,
      timeRemainingSec: timeLeftSec,
      dateISO: new Date().toISOString().slice(0, 10),
      isCurrentUser: true
    };

    const updated = rankLeaderboardEntries([
      ...leaderboard.map(item => ({ ...item, isCurrentUser: false })),
      newEntry
    ]);
    setLeaderboard(updated);
    setScoreSaved(true);
    setNameError('');

    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const filteredLeaderboard = useMemo(() => {
    if (leaderboardFilter === 'current_level') {
      return leaderboard.filter(entry => entry.levelId === levelId);
    }
    return leaderboard;
  }, [leaderboard, leaderboardFilter, levelId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentQuestion = deck[currentIdx];
  const finalSummary = useMemo(
    () => calculateTimedFinalScore(rawScore, correctCount, deck.length, timeLeftSec),
    [rawScore, correctCount, deck.length, timeLeftSec]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left / Main Column (7 cols): Timed Challenge Arena */}
      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs font-semibold text-rose-400">
              {lang === 'ar'
                ? 'سباق السرعة والتركيز · 10 أسئلة متتالية بدون تكرار'
                : 'Sprint Chronométré · 10 Questions Rapides Sans Répétition'}
            </p>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {lang === 'ar' ? 'طور التحدي الزمني السريع (Timed Challenge)' : 'Mode Défi Chronométré (10 Questions)'}
            </h3>
          </div>

          {status === 'running' && (
            <div
              className={`px-4 py-2 rounded-xl border font-mono text-lg font-extrabold tabular-nums ${
                timeLeftSec <= 20
                  ? 'bg-rose-950/70 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-indigo-500/60 text-indigo-300'
              }`}
              aria-live="polite"
            >
              ⏱ {formatTime(timeLeftSec)}
            </div>
          )}
        </div>

        {/* STATE 1: IDLE / SETUP */}
        {status === 'idle' && (
          <div className="space-y-6 py-2">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white">
                {lang === 'ar' ? 'قواعد التحدي الزمني (10 أسئلة):' : 'Règles du Défi Chronométré (10 Questions) :'}
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-300">
                <li>
                  • {lang === 'ar'
                    ? 'ستواجه سلسلة من 10 أسئلة رياضية منتقاة بدقة دون أي تكرار ومع توزيع متوازن للخيارات.'
                    : 'Vous affronterez une série de 10 questions mathématiques uniques sans répétition.'}
                </li>
                <li>
                  • {lang === 'ar'
                    ? 'كل إجابة صحيحة متتالية ترفع مضاعف السلسلة (Combo)، والوقت المتبقي يمنحك مكافأة سرعة إضافية.'
                    : 'Chaque bonne réponse consécutive augmente votre bonus de série et le temps restant est bonifié.'}
                </li>
                <li>
                  • {lang === 'ar'
                    ? 'وثق اسمك عند النهاية لتسجيل رقمك القياسي في لوحة المتصدرين.'
                    : 'Enregistrez votre nom à la fin pour figurer au classement officiel.'}
                </li>
              </ul>
            </div>

            {/* Selectable Countdown Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2.5">
                {lang === 'ar' ? 'اختر مدة العداد التنازلي للتحدي:' : 'Choisir la durée du compte à rebours :'}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { sec: 90, labelAr: '90 ثانية (تحدي النخبة)', labelFr: '90s (Sprint Élite)' },
                  { sec: 120, labelAr: '120 ثانية (قياسي رسمي)', labelFr: '120s (Standard)' },
                  { sec: 180, labelAr: '180 ثانية (تركيز هادئ)', labelFr: '180s (Confort)' }
                ].map(opt => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => setTimeLimitSec(opt.sec)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      timeLimitSec === opt.sec
                        ? 'bg-rose-600/20 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? opt.labelAr : opt.labelFr}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartChallenge}
              className="w-full py-3.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm md:text-base rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'انطلاق التحدي الزمني (10 أسئلة) ←' : 'Démarrer le Défi Chronométré (10 Questions) →'}
            </button>
          </div>
        )}

        {/* STATE 2: RUNNING (ACTIVE 10-QUESTION SPRINT) */}
        {status === 'running' && currentQuestion && (
          <div className="space-y-5">
            {/* Progress Bar & Live Counters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="text-white font-bold">
                  {lang === 'ar'
                    ? `السؤال ${currentIdx + 1} من ${deck.length}`
                    : `Question ${currentIdx + 1} sur ${deck.length}`}
                </span>
                <div className="flex items-center gap-3 font-mono tabular-nums">
                  <span className="text-emerald-400">
                    ✓ {correctCount}/{currentIdx}
                  </span>
                  <span>·</span>
                  <span className="text-amber-300">
                    🔥 {streak}x
                  </span>
                  <span>·</span>
                  <span className="text-indigo-300">
                    {rawScore} pts
                  </span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{ width: `${((currentIdx + 1) / deck.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active Question Statement */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{DOMAINS[currentQuestion.domain].name[lang]}</span>
                <span className="font-mono text-emerald-400">+{currentQuestion.points} pts</span>
              </div>

              <h4 className="text-lg font-bold text-white">
                {currentQuestion.title[lang]}
              </h4>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                <MathText text={currentQuestion.statement[lang]} />
              </p>
              {dualLang && (
                <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                  <MathText text={currentQuestion.statement[lang === 'ar' ? 'biof' : 'ar']} />
                </p>
              )}

              {currentQuestion.formula && (
                <FormulaDisplay formula={currentQuestion.formula} copyable className="text-base py-2.5" />
              )}
            </div>

            {/* Rapid-Fire Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerClick(idx)}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-rose-500 hover:bg-slate-900 text-start transition-all cursor-pointer"
                >
                  <span className="text-sm md:text-base font-semibold text-white block" dir="auto">
                    <MathText text={opt[lang]} />
                  </span>
                  {dualLang && opt.ar !== opt.biof && (
                    <span className="text-xs text-slate-400 block mt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      <MathText text={opt[lang === 'ar' ? 'biof' : 'ar']} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STATE 3: FINISHED / RESULTS & SAVE TO LEADERBOARD */}
        {status === 'finished' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">
                  {lang === 'ar' ? 'المجموع النهائي' : 'Score Final'}
                </span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1 block">
                  {finalSummary.finalScore}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">
                  {lang === 'ar' ? 'الإجابات الصحيحة' : 'Réponses Exactes'}
                </span>
                <span className="text-2xl font-bold text-white font-mono tabular-nums mt-1 block">
                  {correctCount} / {deck.length}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">
                  {lang === 'ar' ? 'مكافأة السرعة' : 'Bonus Temps'}
                </span>
                <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1 block">
                  +{finalSummary.timeBonus}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <span className="text-xs text-slate-400 block">
                  {lang === 'ar' ? 'الوقت المتبقي' : 'Temps Restant'}
                </span>
                <span className="text-2xl font-bold text-indigo-300 font-mono tabular-nums mt-1 block">
                  {timeLeftSec}s
                </span>
              </div>
            </div>

            {/* Save Score to Leaderboard Form */}
            {!scoreSaved ? (
              <form onSubmit={handleSaveToLeaderboard} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <label htmlFor="leaderboard-name-input" className="block text-sm font-bold text-white">
                  {lang === 'ar'
                    ? 'سجل اسمك في لوحة المتصدرين (Leaderboard):'
                    : 'Enregistrer votre résultat au Classement (Leaderboard) :'}
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    id="leaderboard-name-input"
                    type="text"
                    value={studentName}
                    onChange={(e) => {
                      setStudentName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder={lang === 'ar' ? 'أدخل اسمك الكامل أو لقبك الدراسي...' : 'Votre nom ou pseudonyme...'}
                    className="flex-1 bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {lang === 'ar' ? 'حفظ النتيجة في لوحة الشرف' : 'Enregistrer au Classement'}
                  </button>
                </div>
                {nameError && (
                  <p className="text-xs font-semibold text-rose-400">{nameError}</p>
                )}
              </form>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-600/50 rounded-xl p-4 text-sm text-emerald-300 font-semibold">
                {lang === 'ar'
                  ? '✓ تم توثيق نتيجتك بنجاح في لوحة المتصدرين!'
                  : '✓ Votre score a été enregistré avec succès dans le classement !'}
              </div>
            )}

            {/* Quick Review of Answered Questions */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400">
                {lang === 'ar' ? 'ملخص إجاباتك في الجولة السريعة:' : 'Récapitulatif de vos réponses :'}
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {answersLog.map((item, idx) => (
                  <div
                    key={item.question.id}
                    className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs"
                  >
                    <div className="truncate">
                      <span className="font-bold text-slate-300">
                        {idx + 1}. {item.question.title[lang]}
                      </span>
                      <span className="text-slate-500 mx-2">·</span>
                      <span className="text-slate-400">
                        {item.question.options[item.question.correctIndex][lang]}
                      </span>
                    </div>
                    <span className={`font-bold shrink-0 ${item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.isCorrect
                        ? (lang === 'ar' ? '✓ صحيح' : '✓ Exact')
                        : (lang === 'ar' ? '✗ خطأ' : '✗ Faux')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartChallenge}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'خوض تحدٍ زمني جديد (10 أسئلة جديدة)' : 'Relancer un Nouveau Défi Chronométré'}
            </button>
          </div>
        )}
      </div>

      {/* Right Column (5 cols): Integrated Leaderboard */}
      <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs font-semibold text-amber-400">
              {lang === 'ar' ? 'ترتيب الأبطال حسب الدقة والسرعة' : 'Classement par Précision & Vitesse'}
            </p>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {lang === 'ar' ? 'لوحة المتصدرين (Leaderboard)' : 'Tableau des Leaders (Leaderboard)'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setLeaderboardFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                leaderboardFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'Tous'}
            </button>
            <button
              type="button"
              onClick={() => setLeaderboardFilter('current_level')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                leaderboardFilter === 'current_level' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {LEVELS.find(l => l.id === levelId)?.shortName[lang]}
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredLeaderboard.map((entry, idx) => {
            const levelBadge = LEVELS.find(l => l.id === entry.levelId)?.shortName[lang] || entry.levelId;
            const streamBadge = STREAMS[entry.streamId]?.code || entry.streamId;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-indigo-950/50 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800/90 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : idx === 1
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40'
                        : idx === 2
                        ? 'bg-amber-700/20 text-amber-400 border border-amber-700/40'
                        : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {entry.studentName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {levelBadge} · {streamBadge} · {entry.correctCount}/{entry.totalQuestions} ({entry.timeRemainingSec}s)
                    </p>
                  </div>
                </div>

                <div className="text-end shrink-0">
                  <span className="font-mono text-base font-extrabold text-emerald-400 tabular-nums block">
                    {entry.score}
                  </span>
                  <span className="text-[10px] text-slate-500">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
