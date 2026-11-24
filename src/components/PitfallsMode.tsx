import React, { useState, useEffect } from 'react';
import { LevelId, StreamId, LanguageOption } from '../constants/dataStructure';
import { filterPitfalls } from '../game/engine';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import { CheckCircle2, ShieldAlert, Award } from 'lucide-react';

interface PitfallsModeProps {
  levelId: LevelId;
  streamId: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  onPitfallResolved: (foundOnFirstTry: boolean) => void;
}

export const PitfallsMode: React.FC<PitfallsModeProps> = ({
  levelId,
  streamId,
  lang,
  dualLang,
  onPitfallResolved
}) => {
  const pitfalls = filterPitfalls(levelId, streamId);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedStepLine, setSelectedStepLine] = useState<number | null>(null);
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [firstTryIds, setFirstTryIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentIdx(0);
    setSelectedStepLine(null);
    setAttemptsOnCurrent(0);
    setResolved(false);
    setResolvedIds([]);
    setFirstTryIds([]);
  }, [levelId, streamId]);

  const currentPitfall = pitfalls[currentIdx] || pitfalls[0];

  if (!currentPitfall) return null;

  const handleSelectCase = (idx: number) => {
    soundFeedback.playClickSound();
    setCurrentIdx(idx);
    setSelectedStepLine(null);
    setAttemptsOnCurrent(0);
    const targetPitfall = pitfalls[idx];
    setResolved(targetPitfall ? resolvedIds.includes(targetPitfall.id) : false);
  };

  const handleInspectStep = (line: number, isError: boolean) => {
    if (resolved) return;
    setSelectedStepLine(line);
    const nextAttempts = attemptsOnCurrent + 1;
    setAttemptsOnCurrent(nextAttempts);

    if (isError) {
      setResolved(true);
      const isFirstTry = nextAttempts === 1;
      setResolvedIds(prev => (prev.includes(currentPitfall.id) ? prev : [...prev, currentPitfall.id]));
      if (isFirstTry) {
        setFirstTryIds(prev => (prev.includes(currentPitfall.id) ? prev : [...prev, currentPitfall.id]));
      }
      onPitfallResolved(isFirstTry);
    } else {
      soundFeedback.playHintSound();
    }
  };

  const handleNextPitfall = () => {
    const nextIdx = (currentIdx + 1) % pitfalls.length;
    handleSelectCase(nextIdx);
  };

  const allCasesSolved = pitfalls.length > 0 && resolvedIds.length >= pitfalls.length;
  const detectivePrecisionPct =
    resolvedIds.length > 0 ? Math.round((firstTryIds.length / resolvedIds.length) * 100) : 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>
              {lang === 'ar'
                ? 'ورشة التشخيص الديداكتيكي · تقمص دور المصحح والمفتش'
                : 'Atelier de Diagnostic Didactique · Rôle du Correcteur'}
            </span>
          </p>
          <h3 className="text-xl font-bold text-white mt-1">
            {currentPitfall.title[lang]}
          </h3>
          {dualLang && (
            <p className="text-sm text-slate-400 mt-0.5" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
              {currentPitfall.title[lang === 'ar' ? 'biof' : 'ar']}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400">
            {lang === 'ar'
              ? `تم تشخيص: ${resolvedIds.length}/${pitfalls.length} · دقة المحاولة الأولى: ${detectivePrecisionPct}%`
              : `Diagnostiqués : ${resolvedIds.length}/${pitfalls.length} · 1er essai : ${detectivePrecisionPct}%`}
          </span>
          <span className="text-xs text-slate-400 tabular-nums">
            {lang === 'ar'
              ? `الحالة ${currentIdx + 1} من ${pitfalls.length}`
              : `Cas ${currentIdx + 1} sur ${pitfalls.length}`}
          </span>
        </div>
      </div>

      {/* Interactive Case Selector Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {pitfalls.map((p, idx) => {
          const isSolved = resolvedIds.includes(p.id);
          const isCurrent = idx === currentIdx;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectCase(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isCurrent
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                  : isSolved
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/60'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{lang === 'ar' ? `الحالة #${idx + 1}` : `Cas #${idx + 1}`}</span>
              {isSolved && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          );
        })}
      </div>

      {/* All Cases Completed Banner */}
      {allCasesSolved && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-emerald-200 text-xs sm:text-sm font-bold">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              {lang === 'ar'
                ? `🎉 أحسنت أيها المفتش! لقد شخصت جميع الأخطاء الشائعة لهذا المستوى بدقة ${detectivePrecisionPct}% من المحاولة الأولى.`
                : `🎉 Bravo Inspecteur ! Vous avez diagnostiqué tous les pièges de ce niveau avec ${detectivePrecisionPct}% de réussite au 1er essai.`}
            </span>
          </div>
        </div>
      )}

      {/* Problem Context */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
        <p className="text-xs text-slate-400">{currentPitfall.context[lang]}</p>
        <p className="text-base font-bold text-indigo-300">{currentPitfall.problem[lang]}</p>
        {dualLang && (
          <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
            {currentPitfall.problem[lang === 'ar' ? 'biof' : 'ar']}
          </p>
        )}
      </div>

      {/* Instruction */}
      <div className="text-sm text-slate-300 font-medium">
        {lang === 'ar'
          ? 'انقر على السطر الذي ارتكب فيه التلميذ خطأً رياضياً أو منهجياً لتشخيصه:'
          : 'Cliquez sur la ligne où l\'élève a commis une faute mathématique ou méthodologique :'}
      </div>

      {/* Student Steps List */}
      <div className="space-y-3">
        {currentPitfall.steps.map(step => {
          const isClicked = selectedStepLine === step.line;
          let stepBorder = 'border-slate-800 bg-slate-950/80 hover:border-amber-500/60';
          let feedbackBadge = '';

          if (resolved && step.isError) {
            stepBorder = 'border-amber-500 bg-amber-950/30';
            feedbackBadge = lang === 'ar' ? '⚠️ هنا يكمن الخطأ المنهجي!' : '⚠️ Faute détectée ici !';
          } else if (isClicked && !step.isError) {
            stepBorder = 'border-emerald-600/50 bg-emerald-950/20';
            feedbackBadge = lang === 'ar' ? '✓ هذه الخطوة سليمة رياضياً' : '✓ Cette étape est correcte';
          }

          return (
            <button
              key={step.line}
              type="button"
              onClick={() => handleInspectStep(step.line, step.isError)}
              className={`w-full text-start p-4 rounded-xl border transition-all cursor-pointer ${stepBorder}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {lang === 'ar' ? `السطر ${step.line}` : `Ligne ${step.line}`} — <MathText text={step.text[lang]} />
                </span>
                {feedbackBadge && (
                  <span className="text-xs font-bold text-amber-300">{feedbackBadge}</span>
                )}
              </div>
              {step.formula && <FormulaDisplay formula={step.formula} copyable className="text-base py-2" />}
              {resolved && step.isError && step.inspectorObservation && (
                <div className="mt-3 pt-3 border-t border-amber-800/50 text-sm text-amber-200 leading-relaxed">
                  <div className="font-semibold"><MathText text={step.inspectorObservation[lang]} /></div>
                  {dualLang && (
                    <div className="text-xs text-amber-300/80 mt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      <MathText text={step.inspectorObservation[lang === 'ar' ? 'biof' : 'ar']} />
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Diagnostic Resolution Panel */}
      {resolved && (
        <div className="pt-5 border-t border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-rose-400">
                {lang === 'ar' ? 'تحليل العائق الإبستمولوجي (مصدر الخطأ):' : 'Obstacle Épistémologique (Origine de l\'erreur) :'}
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentPitfall.misconceptionExplanation[lang]}
              </p>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <h4 className="text-xs font-bold text-emerald-400">
                {lang === 'ar' ? 'التصحيح النموذجي المعتمد:' : 'Correction Officielle Attendue :'}
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {currentPitfall.correctCorrection[lang]}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-300">
              {currentPitfall.didacticRecommendation[lang]}
            </p>
            <button
              type="button"
              onClick={handleNextPitfall}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {lang === 'ar' ? 'فحص ورقة تلميذ أخرى ←' : 'Examiner une Autre Copie →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
