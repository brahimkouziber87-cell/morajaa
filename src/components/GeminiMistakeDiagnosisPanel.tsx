import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  UserStats,
  LanguageOption,
  LevelId,
  StreamId,
  DOMAINS
} from '../constants/dataStructure';
import { MistakeDiagnosisReport } from '../types/curriculum';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import {
  Sparkles,
  Brain,
  AlertTriangle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  FileText,
  Film,
  Target,
  CheckCircle2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface GeminiMistakeDiagnosisPanelProps {
  stats: UserStats;
  levelId: LevelId;
  streamId: StreamId;
  playerName?: string;
  lang: LanguageOption;
  dualLang?: boolean;
  onSelectMissedQuestion?: (questionId: string) => void;
  onLoadSampleMistakes?: () => void;
}

interface ChalkboardFrame {
  questionIndex: number;
  questionId: string;
  questionTitle: { ar: string; biof: string };
  conceptName: { ar: string; biof: string };
  whyStruggled: { ar: string; biof: string };
  stepIndex: number;
  totalStepsInQuestion: number;
  stepTitle: { ar: string; biof: string };
  explanation: { ar: string; biof: string };
  formulaLatex: string;
  keyTakeawayRule: { ar: string; biof: string };
}

export const GeminiMistakeDiagnosisPanel: React.FC<GeminiMistakeDiagnosisPanelProps> = ({
  stats,
  levelId,
  streamId,
  playerName = '',
  lang,
  dualLang = true,
  onSelectMissedQuestion,
  onLoadSampleMistakes
}) => {
  const missedQuestions = useMemo(() => stats.missedQuestions || [], [stats.missedQuestions]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{ code: string; message: string } | null>(null);
  const [report, setReport] = useState<MistakeDiagnosisReport | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'video_explainer'>('text');

  // Interactive Animated Chalkboard / Video Explainer State
  const [activeFrameIdx, setActiveFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(false);
  const playbackTimerRef = useRef<number | null>(null);

  const frames: ChalkboardFrame[] = useMemo(() => {
    if (!report) return [];
    const list: ChalkboardFrame[] = [];
    report.questionDiagnoses.forEach((qd, qIdx) => {
      const steps = qd.stepByStepWalkthrough || [];
      steps.forEach((st, sIdx) => {
        list.push({
          questionIndex: qIdx,
          questionId: qd.questionId,
          questionTitle: qd.questionTitle,
          conceptName: qd.conceptName,
          whyStruggled: qd.whyStruggled,
          stepIndex: sIdx,
          totalStepsInQuestion: steps.length,
          stepTitle: st.stepTitle,
          explanation: st.explanation,
          formulaLatex: st.formulaLatex,
          keyTakeawayRule: qd.keyTakeawayRule
        });
      });
    });
    return list;
  }, [report]);

  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser speech synthesis cancellation issues
      }
    }
  }, []);

  const speakFrame = useCallback(
    (frame: ChalkboardFrame) => {
      if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      stopSpeech();
      try {
        const text = `${frame.conceptName[lang]}. ${frame.stepTitle[lang]}. ${frame.explanation[lang]}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Non-fatal if speech synthesis is unavailable
      }
    },
    [voiceEnabled, lang, stopSpeech]
  );

  useEffect(() => {
    if (playbackTimerRef.current !== null) {
      window.clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (!isPlaying || frames.length === 0 || viewMode !== 'video_explainer') {
      return;
    }

    const currentFrame = frames[activeFrameIdx];
    if (currentFrame) {
      speakFrame(currentFrame);
    }

    playbackTimerRef.current = window.setInterval(() => {
      setActiveFrameIdx(prev => {
        if (prev + 1 >= frames.length) {
          setIsPlaying(false);
          stopSpeech();
          return prev;
        }
        return prev + 1;
      });
    }, 6000);

    return () => {
      if (playbackTimerRef.current !== null) {
        window.clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, activeFrameIdx, frames, viewMode, speakFrame, stopSpeech]);

  useEffect(() => {
    return () => {
      stopSpeech();
      if (playbackTimerRef.current !== null) {
        window.clearInterval(playbackTimerRef.current);
      }
    };
  }, [stopSpeech]);

  const handleAnalyzeMistakes = async () => {
    if (missedQuestions.length === 0 || isLoading) return;
    soundFeedback.playClickSound();
    setIsLoading(true);
    setErrorState(null);
    setIsPlaying(false);
    stopSpeech();

    try {
      const response = await fetch('/api/ai/mistake-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missedQuestions: missedQuestions.slice(0, 6),
          levelId,
          streamId,
          domainScores: stats.domainScores,
          competencyScores: stats.competencyScores,
          playerName
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        soundFeedback.playIncorrectSound();
        setErrorState({
          code: data.code || `HTTP_${response.status}`,
          message: data.error || 'Failed to generate Gemini Mistake Diagnosis.'
        });
        return;
      }

      if (!data.diagnosis) {
        setErrorState({
          code: 'EMPTY_RESPONSE',
          message: 'Gemini returned an empty diagnosis response.'
        });
        return;
      }

      soundFeedback.playTaskCompleteSound();
      setReport(data.diagnosis as MistakeDiagnosisReport);
      setActiveFrameIdx(0);
    } catch (err) {
      soundFeedback.playIncorrectSound();
      setErrorState({
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error connecting to Gemini diagnosis service.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderFriendlyError = () => {
    if (!errorState) return null;
    const isKeyError =
      errorState.code === 'MISSING_API_KEY' ||
      errorState.code === 'API_KEY_INVALID' ||
      errorState.code === 'PERMISSION_DENIED';
    const isQuotaError = errorState.code === 'RESOURCE_EXHAUSTED';

    return (
      <div className="bg-rose-950/40 border border-rose-500/50 rounded-xl p-4 space-y-2.5 text-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-rose-200">
                {isKeyError
                  ? lang === 'ar'
                    ? 'تعذر الاتصال بخدمة تشخيص Gemini: يرجى التحقق من مفتاح API في لوحة الإعدادات (Settings > Secrets).'
                    : 'Connexion Gemini impossible : veuillez vérifier votre clé API dans le panneau Settings > Secrets.'
                  : isQuotaError
                  ? lang === 'ar'
                    ? 'تم تجاوز حصة الطلبات المؤقتة لخدمة Gemini. يرجى إعادة المحاولة بعد لحظات.'
                    : 'Quota Gemini temporairement dépassé. Veuillez réessayer dans quelques instants.'
                  : lang === 'ar'
                  ? 'حدث خطأ أثناء تحليل الأخطاء عبر Gemini.'
                  : 'Une erreur est survenue lors de l’analyse Gemini.'}
              </p>
              <p className="text-[11px] font-mono text-rose-300/80 break-all" dir="ltr">
                [{errorState.code}] {errorState.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAnalyzeMistakes}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shrink-0 cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'إعادة المحاولة' : 'Réessayer'}</span>
          </button>
        </div>
      </div>
    );
  };

  const activeFrame = frames[activeFrameIdx];

  return (
    <div className="bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border-2 border-indigo-500/45 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-indigo-500/25">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-indigo-600/25 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-indigo-300" />
              <span>
                {lang === 'ar'
                  ? 'تشخيص الأخطاء بالذكاء الاصطناعي · Gemini Diagnosis'
                  : 'Diagnostic IA des Erreurs · Gemini'}
              </span>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-900 text-amber-300 border border-slate-700 tabular-nums">
              {lang === 'ar'
                ? `${missedQuestions.length} أسئلة مسجلة في السجل`
                : `${missedQuestions.length} erreurs enregistrées`}
            </span>
          </div>

          <h4 className="text-lg sm:text-xl font-extrabold text-white">
            {lang === 'ar'
              ? '🔬 تحليل الأخطاء المخصص بالذكاء الاصطناعي (لماذا تعثّرت في هذه المفاهيم؟)'
              : '🔬 Diagnostic Personnalisé Gemini : Pourquoi ces notions ont posé problème ?'}
          </h4>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            {lang === 'ar'
              ? 'يقوم نموذج Gemini بتحليل الأسئلة التي أخطأت فيها (missedQuestions) وعدد محاولاتك المتعثرة لتوليد تشخيص معرفي عميق يفسر سبب التعثر، مصحوباً بـ «سبورة شرح متحركة وناطقة» أو تقرير نصي منظم.'
              : 'Gemini analyse vos questions manquées (missedQuestions) et vos blocages répétés pour générer une explication personnalisée (format texte structuré ou tableau animé pas-à-pas).'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {missedQuestions.length > 0 ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAnalyzeMistakes}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>
                    {lang === 'ar' ? 'جاري التحليل المعمق بـ Gemini...' : 'Analyse Gemini en cours...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {report
                      ? lang === 'ar'
                        ? 'تحديث تشخيص Gemini'
                        : 'Actualiser le Diagnostic'
                      : lang === 'ar'
                      ? `تحليل وتشخيص أخطائي بـ Gemini (${Math.min(6, missedQuestions.length)})`
                      : `Analyser mes Erreurs avec Gemini (${Math.min(6, missedQuestions.length)})`}
                  </span>
                </>
              )}
            </button>
          ) : (
            onLoadSampleMistakes && (
              <button
                type="button"
                onClick={onLoadSampleMistakes}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'تحميل تمارين تشخيصية لاختبار التشخيص الذكي'
                    : 'Charger un Pack Test pour Diagnostic IA'}
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Preview of Queued missedQuestions being diagnosed */}
      {missedQuestions.length > 0 && !report && !isLoading && !errorState && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {missedQuestions.slice(0, 6).map(rec => (
            <div
              key={rec.question.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-start justify-between gap-2 text-xs"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold text-indigo-300 block">
                  {DOMAINS[rec.question.domain].icon} {DOMAINS[rec.question.domain].name[lang]}
                </span>
                <p className="font-bold text-slate-100 truncate">{rec.question.title[lang]}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-300 shrink-0">
                {lang === 'ar' ? `${rec.wrongAttempts}× خطأ` : `${rec.wrongAttempts}×`}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {renderFriendlyError()}

      {/* Diagnosis Result Content */}
      {report && (
        <div className="space-y-5">
          {/* Format Switcher: Personalized Text vs Interactive Animated Whiteboard Video Explainer */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode('text');
                  setIsPlaying(false);
                  stopSpeech();
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'text'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>
                  {lang === 'ar' ? '📄 التقرير التشخيصي المفصل (نص + صيغ)' : '📄 Explication Textuelle Détaillée'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode('video_explainer');
                  setActiveFrameIdx(0);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'video_explainer'
                    ? 'bg-emerald-600 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? `🎬 السبورة المتحركة الناطقة (${frames.length} لقطات)`
                    : `🎬 Tableau Animé Pas-à-Pas (${frames.length} scènes)`}
                </span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-400 px-2">
              {report.model} · {report.analyzedCount} {lang === 'ar' ? 'تمارين محللة' : 'analysés'}
            </span>
          </div>

          {/* Cognitive Overview Banner (Always visible) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-900/95 border border-indigo-500/35 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-300">
                <Brain className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'الخلاصة التشخيصية للمفتش الذكي (لماذا تعثّرت؟):'
                    : 'Synthèse Cognitive du Diagnostic :'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                <MathText text={report.executiveSummary[lang]} />
              </p>
              {dualLang && (
                <p
                  className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80"
                  dir={lang === 'ar' ? 'ltr' : 'rtl'}
                >
                  <MathText text={report.executiveSummary[lang === 'ar' ? 'biof' : 'ar']} />
                </p>
              )}
            </div>

            <div className="bg-slate-900/95 border border-amber-500/35 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-amber-300 block">
                  {lang === 'ar' ? '⚡ النمط الجذري المتكرر للخطأ:' : '⚡ Cause Racine Principale :'}
                </span>
                <p className="text-xs font-semibold text-white mt-1 leading-relaxed">
                  {report.rootCausePattern[lang]}
                </p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-emerald-300 block">
                  {lang === 'ar' ? '🎯 المفهوم ذو الأولوية القصوى:' : '🎯 Concept Prioritaire :'}
                </span>
                <p className="text-xs font-extrabold text-emerald-200 mt-1">
                  {report.priorityConcept[lang]}
                </p>
              </div>
            </div>
          </div>

          {/* MODE A: Interactive Animated Whiteboard / Video Explainer */}
          {viewMode === 'video_explainer' && activeFrame && (
            <div className="bg-slate-950 border-2 border-emerald-500/45 rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Chalkboard Top Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                    {lang === 'ar'
                      ? `مشهد ${activeFrameIdx + 1} / ${frames.length}`
                      : `Scène ${activeFrameIdx + 1} / ${frames.length}`}
                  </span>
                  <span className="font-bold text-white truncate">
                    {activeFrame.conceptName[lang]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !voiceEnabled;
                      setVoiceEnabled(next);
                      if (!next) {
                        stopSpeech();
                      } else if (activeFrame) {
                        speakFrame(activeFrame);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      voiceEnabled
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-950 border-slate-700 text-slate-300'
                    }`}
                  >
                    {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>{voiceEnabled ? (lang === 'ar' ? 'الصوت مفعل' : 'Voix ON') : (lang === 'ar' ? 'صامت' : 'Muet')}</span>
                  </button>
                </div>
              </div>

              {/* Chalkboard Stage */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-950 via-[#071520] to-slate-950 space-y-5 min-h-[290px] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-indigo-300 font-bold">
                      {activeFrame.questionTitle[lang]}
                    </span>
                    <span className="text-amber-300 font-mono text-[11px]">
                      {lang === 'ar'
                        ? `الخطوة ${activeFrame.stepIndex + 1} من ${activeFrame.totalStepsInQuestion}`
                        : `Étape ${activeFrame.stepIndex + 1} sur ${activeFrame.totalStepsInQuestion}`}
                    </span>
                  </div>

                  <h5 className="text-lg sm:text-xl font-extrabold text-emerald-300">
                    {activeFrame.stepTitle[lang]}
                  </h5>
                </div>

                {activeFrame.formulaLatex && (
                  <div className="py-1">
                    <FormulaDisplay
                      formula={activeFrame.formulaLatex}
                      className="bg-slate-950/95 border-emerald-500/40 py-5 text-lg sm:text-xl"
                      copyable
                    />
                  </div>
                )}

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-sm text-slate-100 leading-relaxed">
                    <MathText text={activeFrame.explanation[lang]} />
                  </p>
                  {dualLang && (
                    <p
                      className="text-xs text-slate-400 leading-relaxed"
                      dir={lang === 'ar' ? 'ltr' : 'rtl'}
                    >
                      <MathText text={activeFrame.explanation[lang === 'ar' ? 'biof' : 'ar']} />
                    </p>
                  )}
                </div>

                <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl px-4 py-2.5 text-xs text-amber-200 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>{lang === 'ar' ? 'القاعدة الذهبية:' : 'Règle clé :'}</strong>{' '}
                    {activeFrame.keyTakeawayRule[lang]}
                  </span>
                </div>
              </div>

              {/* Player Controls & Scrubber */}
              <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-3">
                <div className="flex gap-1">
                  {frames.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setActiveFrameIdx(idx);
                        if (voiceEnabled && frames[idx]) speakFrame(frames[idx]);
                      }}
                      aria-label={`Scene ${idx + 1}`}
                      className={`h-2 flex-1 rounded-full transition-all cursor-pointer ${
                        idx === activeFrameIdx
                          ? 'bg-emerald-400'
                          : idx < activeFrameIdx
                          ? 'bg-emerald-700'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFrameIdx(prev => Math.max(0, prev - 1));
                        stopSpeech();
                      }}
                      disabled={activeFrameIdx === 0}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (activeFrameIdx + 1 >= frames.length && !isPlaying) {
                          setActiveFrameIdx(0);
                        }
                        setIsPlaying(prev => {
                          if (prev) stopSpeech();
                          return !prev;
                        });
                      }}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      <span>
                        {isPlaying
                          ? lang === 'ar'
                            ? 'إيقاف مؤقت'
                            : 'Pause'
                          : lang === 'ar'
                          ? 'تشغيل الشرح التفاعلي'
                          : 'Lire la Leçon'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveFrameIdx(prev => Math.min(frames.length - 1, prev + 1));
                        stopSpeech();
                      }}
                      disabled={activeFrameIdx + 1 >= frames.length}
                      className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>

                  {onSelectMissedQuestion && activeFrame.questionId && (
                    <button
                      type="button"
                      onClick={() => onSelectMissedQuestion(activeFrame.questionId)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                    >
                      {lang === 'ar' ? 'تطبيق وإعادة حل هذا التمرين ←' : 'Retenter cet exercice →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE B: Detailed Personalized Text & Concept Breakdown */}
          {viewMode === 'text' && (
            <div className="space-y-4">
              {report.questionDiagnoses.map((qd, idx) => (
                <div
                  key={`${qd.questionId}-${idx}`}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-indigo-300">
                        {qd.conceptName[lang]}
                      </span>
                      <h5 className="text-base font-extrabold text-white">
                        {idx + 1}. {qd.questionTitle[lang]}
                      </h5>
                    </div>

                    {onSelectMissedQuestion && qd.questionId && (
                      <button
                        type="button"
                        onClick={() => onSelectMissedQuestion(qd.questionId)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold cursor-pointer"
                      >
                        {lang === 'ar' ? 'إعادة التدرب على هذا السؤال ←' : 'Retenter cette question →'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-rose-950/25 border border-rose-500/35 rounded-xl p-3.5 space-y-1.5">
                      <span className="font-extrabold text-rose-300 block">
                        {lang === 'ar' ? '🔍 لماذا تعثّرت في هذا السؤال؟' : '🔍 Pourquoi cette notion a bloqué ?'}
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        <MathText text={qd.whyStruggled[lang]} />
                      </p>
                    </div>

                    <div className="bg-amber-950/25 border border-amber-500/35 rounded-xl p-3.5 space-y-1.5">
                      <span className="font-extrabold text-amber-300 block">
                        {lang === 'ar' ? '⚠️ الفخ الديداكتيكي الشائع:' : '⚠️ Piège Didactique Classique :'}
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        <MathText text={qd.misconceptionTrap[lang]} />
                      </p>
                    </div>
                  </div>

                  {/* Step-by-Step Corrective Walkthrough */}
                  {qd.stepByStepWalkthrough.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-emerald-300 block">
                        {lang === 'ar' ? '📐 مسار المعالجة خطوة بخطوة:' : '📐 Démarche Corrective Étape par Étape :'}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                        {qd.stepByStepWalkthrough.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2"
                          >
                            <span className="text-[11px] font-extrabold text-indigo-300 block">
                              {sIdx + 1}) {st.stepTitle[lang]}
                            </span>
                            {st.formulaLatex && (
                              <FormulaDisplay
                                formula={st.formulaLatex}
                                className="my-1 py-2 text-xs sm:text-sm"
                              />
                            )}
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              <MathText text={st.explanation[lang]} />
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-emerald-950/25 border border-emerald-500/35 rounded-xl px-4 py-2.5 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      <strong>{lang === 'ar' ? 'القاعدة الذهبية للتثبيت:' : 'Règle d’Or à Retenir :'}</strong>{' '}
                      <MathText text={qd.keyTakeawayRule[lang]} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actionable Study Plan */}
          {report.actionableStudyPlan.length > 0 && (
            <div className="bg-slate-900/95 border border-emerald-500/35 rounded-xl p-4 space-y-2.5">
              <span className="text-xs font-extrabold text-emerald-300 block">
                {lang === 'ar'
                  ? '📋 خطة العمل الفورية المقترحة من Gemini لتجاوز هذه الصعوبات:'
                  : '📋 Plan d’Action Personnalisé Gemini :'}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {report.actionableStudyPlan.map((step, i) => (
                  <div
                    key={i}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 flex items-start gap-2"
                  >
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step[lang]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
