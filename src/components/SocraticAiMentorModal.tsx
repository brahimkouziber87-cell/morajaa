import React, { useState, useEffect, useMemo } from 'react';
import { Question, LanguageOption } from '../types/curriculum';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { Brain, CheckCircle2, X, Lightbulb } from 'lucide-react';

interface SocraticAiMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  lang: LanguageOption;
  dualLang: boolean;
  onSuccessScaffolding?: () => void;
}

export const SocraticAiMentorModal: React.FC<SocraticAiMentorModalProps> = ({
  isOpen,
  onClose,
  question,
  lang,
  onSuccessScaffolding
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [step1Answer, setStep1Answer] = useState<number | null>(null);
  const [step2Answer, setStep2Answer] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setStep1Answer(null);
      setStep2Answer(null);
    }
  }, [question.id, isOpen]);

  const { step1Options, step1CorrectIdx, step2Options, step2CorrectIdx } = useMemo(() => {
    const raw1 = [
      { ar: 'تحديد المعطيات والشروط الأساسية (مجموعة التعريف، شروط المبرهنة، المعطيات العددية)', biof: 'Identifier les hypothèses et l\'ensemble de définition' },
      { ar: 'التعويض العشوائي للقيم دون التحقق من الشروط', biof: 'Remplacer au hasard' },
      { ar: 'القفز مباشرة إلى النتيجة دون تبرير', biof: 'Conclure directement sans étape intermédiaire' }
    ];
    const raw2 = [
      {
        ar: (question.hint || question.inspectorTip).ar,
        biof: (question.hint || question.inspectorTip).biof
      },
      { ar: 'استعمال خاصية غير مرتبطة بهذا الفصل', biof: 'Utiliser une formule non adaptée' }
    ];

    let hash = 0;
    for (let i = 0; i < question.id.length; i++) {
      hash = (hash * 31 + question.id.charCodeAt(i)) % 997;
    }

    const shift1 = (hash % raw1.length) || 1;
    const rotated1 = raw1.map((_, idx) => raw1[(idx + shift1) % raw1.length]);
    const correct1 = rotated1.findIndex(item => item === raw1[0]);

    const shift2 = hash % 2 === 0 ? 1 : 0;
    const rotated2 = shift2 === 1 ? [raw2[1], raw2[0]] : raw2;
    const correct2 = rotated2.findIndex(item => item === raw2[0]);

    return {
      step1Options: rotated1,
      step1CorrectIdx: correct1,
      step2Options: rotated2,
      step2CorrectIdx: correct2
    };
  }, [question]);

  if (!isOpen) return null;

  const handleStep1Submit = (idx: number) => {
    setStep1Answer(idx);
    if (idx === step1CorrectIdx) {
      setTimeout(() => setCurrentStep(2), 500);
    }
  };

  const handleStep2Submit = (idx: number) => {
    setStep2Answer(idx);
    if (idx === step2CorrectIdx) {
      setTimeout(() => {
        setCurrentStep(3);
        if (onSuccessScaffolding) onSuccessScaffolding();
      }, 500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="socratic-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center text-xl shadow-inner">
              <Brain className="w-5 h-5 text-indigo-400" />
            </span>
            <div>
              <h2 id="socratic-modal-title" className="font-extrabold text-white text-base">
                {lang === 'ar' ? 'المعلم السقراطي الموجه (Socratic Tutor)' : 'Tuteur Socratique Étape par Étape'}
              </h2>
              <span className="text-[11px] text-slate-400">
                {lang === 'ar' ? 'بناء البرهان الرياضي خطوة بخطوة بالاستدلال التوجيهي' : 'Démarche guidée pour construire la solution'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Reminder Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
          <span className="font-bold text-indigo-400 block">{question.title[lang]}</span>
          <p className="text-slate-200 line-clamp-2">
            <MathText text={question.statement[lang]} />
          </p>
          {question.formula && (
            <div className="pt-1">
              <FormulaDisplay formula={question.formula} className="text-xs py-1" />
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span className={currentStep >= 1 ? 'text-indigo-400' : ''}>
            {lang === 'ar' ? '1. الشروط والمعطيات' : '1. Hypothèses'}
          </span>
          <span>→</span>
          <span className={currentStep >= 2 ? 'text-indigo-400' : ''}>
            {lang === 'ar' ? '2. اختيار الخاصية' : '2. Théorème'}
          </span>
          <span>→</span>
          <span className={currentStep >= 3 ? 'text-emerald-400' : ''}>
            {lang === 'ar' ? '3. الاستنتاج النهائي' : '3. Conclusion'}
          </span>
        </div>

        {/* Step 1: Hypotheses */}
        {currentStep === 1 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'الخطوة 1: قبل الشروع في الحساب، ما هي أول خطوة منهجية يوصي بها مفتش الرياضيات؟'
                  : 'Étape 1 : Quelle est la première démarche méthodologique rigoureuse ?'}
              </span>
            </div>

            <div className="space-y-2">
              {step1Options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStep1Submit(idx)}
                  className={`w-full p-3 rounded-xl border text-start text-xs font-semibold transition-all cursor-pointer ${
                    step1Answer === idx
                      ? idx === step1CorrectIdx
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/60'
                  }`}
                >
                  {opt[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Theorem Selection */}
        {currentStep === 2 && (
          <div className="space-y-3 animate-in fade-in">
            <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-200 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'ar'
                  ? 'الخطوة 2: أي مبرهنة أو خاصية رياضية مطابقة تفتح لك مفتاح الحل في هذا التمرين؟'
                  : 'Étape 2 : Quelle propriété théorique débloque la solution ?'}
              </span>
            </div>

            <div className="space-y-2">
              {step2Options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleStep2Submit(idx)}
                  className={`w-full p-3 rounded-xl border text-start text-xs font-semibold transition-all cursor-pointer ${
                    step2Answer === idx
                      ? idx === step2CorrectIdx
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold'
                        : 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-indigo-500/60'
                  }`}
                >
                  {opt[lang]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Synthesis & Scaffolding Complete */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-emerald-950/30 border border-emerald-500/50 rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {lang === 'ar' ? '🎉 أحسنت! لقد اكتمل مسار الاستدلال السقراطي' : '🎉 Bravo ! Raisonnement Socratique Validé'}
                </span>
              </span>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                {question.explanation[lang]}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'العودة للتمرين وتأكيد الجواب الصحيح ✓' : 'Retourner à l\'exercice et valider ✓'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
