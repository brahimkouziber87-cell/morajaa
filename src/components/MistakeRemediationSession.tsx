import React, { useState, useMemo, useEffect } from 'react';
import {
  UserStats,
  LanguageOption,
  LevelId,
  StreamId,
  Question,
  DOMAINS,
  Competency,
  MissedQuestionRecord
} from '../constants/dataStructure';
import { filterQuestions, getWeakestDomain, permuteQuestionOptions } from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { GeminiMistakeDiagnosisPanel } from './GeminiMistakeDiagnosisPanel';
import { soundFeedback } from '../utils/feedbackSounds';
import { RotateCcw, CheckCircle2, AlertTriangle, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

interface MistakeRemediationSessionProps {
  stats: UserStats;
  levelId: LevelId;
  streamId: StreamId;
  playerName?: string;
  lang: LanguageOption;
  dualLang?: boolean;
  onRemediateResult: (question: Question, isCorrect: boolean, timeSpent: number) => void;
  onLoadDiagnosticMistakes?: (questions: Question[]) => void;
}

const COMPETENCY_BADGES: Record<Competency, { ar: string; biof: string }> = {
  restitution: { ar: 'استرداد المعارف', biof: 'Restitution' },
  application: { ar: 'تطبيق الخاصيات', biof: 'Application des Propriétés' },
  reasoning: { ar: 'الاستدلال والبرهان', biof: 'Raisonnement' },
  problem_solving: { ar: 'حل المسائل', biof: 'Résolution de Problèmes' }
};

export const MistakeRemediationSession: React.FC<MistakeRemediationSessionProps> = ({
  stats,
  levelId,
  streamId,
  playerName = '',
  lang,
  dualLang = true,
  onRemediateResult,
  onLoadDiagnosticMistakes
}) => {
  const missedRecords: MissedQuestionRecord[] = useMemo(
    () => stats.missedQuestions || [],
    [stats.missedQuestions]
  );

  const weakestDomain = useMemo(() => getWeakestDomain(stats), [stats]);

  // Diagnostic fallback questions (property-application & weak-domain questions for current level)
  const diagnosticQuestions = useMemo(() => {
    const levelQs = filterQuestions(levelId, streamId, 'all');
    const propQs = levelQs.filter(q => q.id.includes('-prop-') || q.domain === weakestDomain);
    return (propQs.length >= 3 ? propQs : levelQs).slice(0, 5);
  }, [levelId, streamId, weakestDomain]);

  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showPropertyReminder, setShowPropertyReminder] = useState<boolean>(true);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [sessionFixedIds, setSessionFixedIds] = useState<string[]>([]);

  // Ensure activeIndex stays within bounds when missedRecords shrinks
  useEffect(() => {
    if (activeIndex >= missedRecords.length && missedRecords.length > 0) {
      setActiveIndex(0);
    }
  }, [missedRecords.length, activeIndex]);

  const currentRecord: MissedQuestionRecord | undefined = missedRecords[activeIndex];
  const currentQuestion: Question | undefined = useMemo(() => {
    if (!currentRecord?.question) return undefined;
    return permuteQuestionOptions(
      currentRecord.question,
      (currentRecord.wrongAttempts || 1) + activeIndex + 1
    );
  }, [currentRecord, activeIndex]);

  const handleStartSession = (targetIdx = 0) => {
    setActiveIndex(targetIdx);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowPropertyReminder(true);
    setQuestionStartTime(Date.now());
    setIsSessionActive(true);
  };

  const handleLoadDiagnosticPack = () => {
    if (onLoadDiagnosticMistakes && diagnosticQuestions.length > 0) {
      onLoadDiagnosticMistakes(diagnosticQuestions);
      setSessionFixedIds([]);
      handleStartSession(0);
    }
  };

  const handleOptionClick = (optIdx: number) => {
    if (!currentQuestion || isSubmitted) return;
    setSelectedOption(optIdx);
    setIsSubmitted(true);
    const isCorrect = optIdx === currentQuestion.correctIndex;
    const elapsed = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

    if (isCorrect) {
      soundFeedback.playCorrectSound();
      setSessionFixedIds(prev =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
    } else {
      soundFeedback.playIncorrectSound();
    }

    onRemediateResult(currentQuestion, isCorrect, elapsed);
  };

  const handleRetrySameQuestion = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowPropertyReminder(true);
    setQuestionStartTime(Date.now());
  };

  const handleNextMistake = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowPropertyReminder(true);
    setQuestionStartTime(Date.now());
    if (missedRecords.length > 0) {
      setActiveIndex(prev => prev % missedRecords.length);
    } else {
      setIsSessionActive(false);
    }
  };

  const remediatedTotal = stats.remediatedCount || 0;

  return (
    <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                {lang === 'ar' ? 'وحدة الدعم والمعالجة المركزة' : 'Module de Remédiation Ciblée'}
              </span>
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
              {lang === 'ar'
                ? `تم تداركها بنجاح: ${remediatedTotal}`
                : `Erreurs corrigées : ${remediatedTotal}`}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {lang === 'ar'
              ? '🛠️ جلسة تدارك الأخطاء وتثبيت الخاصيات (Session de Remédiation des Erreurs)'
              : '🛠️ Session de Remédiation des Erreurs & Consolidation des Propriétés'}
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'ar'
              ? 'أعد حل الأسئلة التي أخطأت فيها سابقاً مع تذكير منهجي بالخاصيات الرياضية لتحويل نقاط الضعف إلى مكتسبات راسخة (+20 XP لكل تدارك ناجح).'
              : 'Résolvez à nouveau les questions manquées avec un rappel méthodologique des propriétés pour consolider vos acquis (+20 XP par réussite).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {missedRecords.length > 0 ? (
            <button
              type="button"
              onClick={() => handleStartSession(0)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>
                {isSessionActive
                  ? lang === 'ar'
                    ? `جلسة التدارك نشطة (${missedRecords.length} أسئلة متبقية)`
                    : `Session active (${missedRecords.length} restantes)`
                  : lang === 'ar'
                  ? `بدء جلسة تدارك الأخطاء (${missedRecords.length})`
                  : `Démarrer la Remédiation (${missedRecords.length})`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLoadDiagnosticPack}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `توليد جلسة تدارك للخاصيات (${DOMAINS[weakestDomain].name.ar})`
                  : `Charger 5 Exercices de Remédiation (${DOMAINS[weakestDomain].name.biof})`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">
              {lang === 'ar' ? 'الأسئلة المسجلة للتدارك' : 'Questions à Remédier'}
            </span>
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {missedRecords.length}
            </span>
          </div>
          <AlertTriangle className="w-6 h-6 text-amber-400/70" />
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">
              {lang === 'ar' ? 'الأخطاء التي تم تصحيحها وتجاوزها' : 'Erreurs Corrigées avec Succès'}
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {remediatedTotal}
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-400/70" />
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">
              {lang === 'ar' ? 'المجال ذو الأولوية في الدعم' : 'Domaine Prioritaire de Soutien'}
            </span>
            <span className="text-sm font-bold text-indigo-300 mt-0.5 block">
              {DOMAINS[weakestDomain].icon} {DOMAINS[weakestDomain].name[lang]}
            </span>
          </div>
          <BookOpen className="w-6 h-6 text-indigo-400/70" />
        </div>
      </div>

      {/* Gemini-Powered Mistake Diagnosis Panel */}
      <GeminiMistakeDiagnosisPanel
        stats={stats}
        levelId={levelId}
        streamId={streamId}
        playerName={playerName}
        lang={lang}
        dualLang={dualLang}
        onSelectMissedQuestion={(questionId) => {
          const targetIdx = missedRecords.findIndex(r => r.question.id === questionId);
          if (targetIdx >= 0) {
            handleStartSession(targetIdx);
          }
        }}
        onLoadSampleMistakes={handleLoadDiagnosticPack}
      />

      {/* Empty State when no mistakes are queued */}
      {missedRecords.length === 0 && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">
            {sessionFixedIds.length > 0
              ? lang === 'ar'
                ? `🎉 أحسنت! لقد أتممت تدارك وتصحيح جميع أخطائك المسجلة (${sessionFixedIds.length} تمارين)!`
                : `🎉 Bravo ! Vous avez corrigé toutes vos erreurs enregistrées (${sessionFixedIds.length} exercices) !`
              : lang === 'ar'
              ? 'سجل الأخطاء خالٍ حالياً — جميع إجاباتك الأخيرة سليمة أو لم يتم تسجيل إجابات خاطئة بعد'
              : 'Aucune erreur en attente de remédiation pour le moment'}
          </h4>
          <p className="text-xs text-slate-400 max-w-xl mx-auto leading-relaxed">
            {lang === 'ar'
              ? 'عندما تجيب بشكل خاطئ عن أي سؤال في وضع التمارين (QuizMode)، يُضاف تلقائياً إلى هذه الجلسة لتتمكن من إعادة حله. يمكنك أيضاً تحميل حزمة تدريبية لتطبيق الخاصيات في مجالك الأضعف الآن:'
              : 'Toute question répondue incorrectement dans le mode Exercices est automatiquement ajoutée ici. Vous pouvez aussi lancer une session d\'application des propriétés sur votre domaine le plus faible :'}
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={handleLoadDiagnosticPack}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? `📐 إطلاق جلسة تطبيق الخاصيات وتقوية المهارات (${diagnosticQuestions.length} تمارين)`
                  : `📐 Lancer une Session d'Application des Propriétés (${diagnosticQuestions.length} exercices)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Queue of Missed Questions + Active Interactive Player */}
      {missedRecords.length > 0 && (
        <div className="space-y-5">
          {/* Horizontal Pill Selector of Missed Questions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                {lang === 'ar'
                  ? 'قائمة الأسئلة المطلوب تداركها (انقر على أي سؤال لمعالجته فوراً):'
                  : 'Liste des questions à remédier (cliquez sur une question pour la traiter) :'}
              </span>
              <span className="font-mono text-amber-300">
                {activeIndex + 1} / {missedRecords.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {missedRecords.map((rec, idx) => {
                const isCurrent = idx === activeIndex && isSessionActive;
                return (
                  <button
                    key={rec.question.id}
                    type="button"
                    onClick={() => handleStartSession(idx)}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-md bg-slate-900 border border-slate-700 font-mono text-[11px] flex items-center justify-center text-amber-400">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[200px]">{rec.question.title[lang]}</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-700/50 text-[10px] font-mono text-rose-300">
                      {lang === 'ar' ? `${rec.wrongAttempts} خطأ` : `${rec.wrongAttempts}x`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Remediation Workspace */}
          {currentQuestion && (
            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold">
                    {lang === 'ar'
                      ? `تدارك السؤال #${activeIndex + 1}`
                      : `Remédiation #${activeIndex + 1}`}
                  </span>
                  <span className="text-slate-400">
                    {DOMAINS[currentQuestion.domain].icon} {DOMAINS[currentQuestion.domain].name[lang]}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-indigo-300 font-semibold">
                    {COMPETENCY_BADGES[currentQuestion.competency][lang]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-rose-400 bg-rose-950/50 border border-rose-800/50 px-2.5 py-0.5 rounded-md">
                    {lang === 'ar'
                      ? `عدد المحاولات الخاطئة السابقة: ${currentRecord.wrongAttempts}`
                      : `Tentatives échouées : ${currentRecord.wrongAttempts}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPropertyReminder(prev => !prev)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-500/50 text-indigo-200 font-bold cursor-pointer"
                  >
                    {showPropertyReminder
                      ? lang === 'ar'
                        ? 'إخفاء تذكير الخاصية'
                        : 'Masquer la propriété'
                      : lang === 'ar'
                      ? '📐 عرض الخاصية الرياضية'
                      : '📐 Voir la propriété'}
                  </button>
                </div>
              </div>

              {/* Property & Methodological Scaffolding Box */}
              {showPropertyReminder && (
                <div className="bg-indigo-950/35 border border-indigo-500/40 rounded-xl p-3.5 space-y-1.5 text-xs">
                  <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>
                      {lang === 'ar'
                        ? '📐 تذكير بالخاصية والقاعدة المنهجية قبل الحل:'
                        : '📐 Rappel de la Propriété & Règle Méthodologique :'}
                    </span>
                  </p>
                  <p className="text-slate-200 leading-relaxed">
                    {(currentQuestion.hint || currentQuestion.inspectorTip)[lang]}
                  </p>
                  {dualLang && (
                    <p
                      className="text-indigo-300/80 leading-relaxed"
                      dir={lang === 'ar' ? 'ltr' : 'rtl'}
                    >
                      {(currentQuestion.hint || currentQuestion.inspectorTip)[
                        lang === 'ar' ? 'biof' : 'ar'
                      ]}
                    </p>
                  )}
                </div>
              )}

              {/* Question Title & Statement */}
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-white">{currentQuestion.title[lang]}</h4>
                {dualLang && (
                  <p
                    className="text-xs font-medium text-indigo-300"
                    dir={lang === 'ar' ? 'ltr' : 'rtl'}
                  >
                    {currentQuestion.title[lang === 'ar' ? 'biof' : 'ar']}
                  </p>
                )}

                <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                  <MathText text={currentQuestion.statement[lang]} />
                </p>
                {dualLang && (
                  <p
                    className="text-xs md:text-sm text-slate-400 leading-relaxed"
                    dir={lang === 'ar' ? 'ltr' : 'rtl'}
                  >
                    <MathText text={currentQuestion.statement[lang === 'ar' ? 'biof' : 'ar']} />
                  </p>
                )}

                {currentQuestion.formula && (
                  <div className="pt-1">
                    <FormulaDisplay formula={currentQuestion.formula} copyable />
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isChosen = selectedOption === idx;
                  const isCorrect = idx === currentQuestion.correctIndex;

                  let style =
                    'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/60 hover:bg-slate-900/80';
                  if (isSubmitted) {
                    if (isCorrect) {
                      style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                    } else if (isChosen) {
                      style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      style = 'bg-slate-900/40 border-slate-800/50 text-slate-500';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleOptionClick(idx)}
                      className={`p-3.5 rounded-xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-xs md:text-sm block">
                            <MathText text={opt[lang]} />
                          </span>
                          {dualLang && opt.ar !== opt.biof && (
                            <span
                              className="text-[11px] text-slate-400 block"
                              dir={lang === 'ar' ? 'ltr' : 'rtl'}
                            >
                              <MathText text={opt[lang === 'ar' ? 'biof' : 'ar']} />
                            </span>
                          )}
                        </div>
                      </div>
                      {isSubmitted && isCorrect && (
                        <span className="text-xs font-bold text-emerald-400 shrink-0">✓</span>
                      )}
                      {isSubmitted && isChosen && !isCorrect && (
                        <span className="text-xs font-bold text-rose-400 shrink-0">✗</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation after submission */}
              {isSubmitted && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    selectedOption === currentQuestion.correctIndex
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-rose-950/30 border-rose-500/50'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={`text-sm font-bold ${
                        selectedOption === currentQuestion.correctIndex
                          ? 'text-emerald-300'
                          : 'text-rose-300'
                      }`}
                    >
                      {selectedOption === currentQuestion.correctIndex
                        ? lang === 'ar'
                          ? '🎉 ممتاز! لقد تداركت هذا الخطأ بنجاح وتمت إزالته من قائمة الأخطاء العالقة (+20 XP).'
                          : '🎉 Excellent ! Vous avez corrigé cette erreur avec succès (+20 XP).'
                        : lang === 'ar'
                        ? '⚠️ لا يزال الجواب غير دقيق. اقرأ البرهان المفصل للخاصية أدناه ثم أعد المحاولة:'
                        : '⚠️ Réponse encore inexacte. Consultez le corrigé détaillé ci-dessous puis réessayez :'}
                    </p>

                    <div className="flex items-center gap-2">
                      {selectedOption !== currentQuestion.correctIndex && (
                        <button
                          type="button"
                          onClick={handleRetrySameQuestion}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'إعادة المحاولة الآن' : 'Réessayer'}</span>
                        </button>
                      )}
                      {missedRecords.length > 0 && (
                        <button
                          type="button"
                          onClick={handleNextMistake}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer flex items-center gap-1"
                        >
                          <span>{lang === 'ar' ? 'السؤال التالي في الجلسة' : 'Question suivante'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-200 space-y-1.5 border-t border-slate-800/80 pt-2.5 leading-relaxed">
                    <p className="font-semibold text-emerald-400">
                      {lang === 'ar'
                        ? 'البرهان وتطبيق الخاصية خطوة بخطوة:'
                        : 'Corrigé détaillé et application de la propriété :'}
                    </p>
                    <p className="whitespace-pre-line">{currentQuestion.explanation[lang]}</p>
                    {dualLang && (
                      <p
                        className="text-slate-400 whitespace-pre-line pt-1"
                        dir={lang === 'ar' ? 'ltr' : 'rtl'}
                      >
                        {currentQuestion.explanation[lang === 'ar' ? 'biof' : 'ar']}
                      </p>
                    )}
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 text-xs text-amber-200">
                    <strong>{lang === 'ar' ? 'توجيه المفتش:' : 'Conseil de l\'Inspecteur :'}</strong>{' '}
                    {currentQuestion.inspectorTip[lang]}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
