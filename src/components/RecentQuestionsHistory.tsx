import React, { useState, useMemo } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  MathDomain,
  Competency,
  DOMAINS
} from '../constants/dataStructure';
import { FormulaDisplay, MathText } from './FormulaDisplay';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Trash2,
  Sparkles,
  TrendingUp,
  Zap,
  BarChart3,
  X
} from 'lucide-react';

export interface SolvedQuestionHistoryItem {
  id: string;
  questionId: string;
  questionTitle: { ar: string; biof: string };
  questionStatement: { ar: string; biof: string };
  formula?: string;
  domain: MathDomain;
  competency: Competency;
  levelId: LevelId;
  streamId: StreamId;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  isCorrect: boolean;
  timeSpentSec: number;
  pointsEarned: number;
  xpEarned: number;
  timestamp: number;
  selectedOptionText: { ar: string; biof: string };
  correctOptionText: { ar: string; biof: string };
  explanation: { ar: string; biof: string };
  inspectorTip?: { ar: string; biof: string };
}

interface RecentQuestionsHistoryProps {
  history: SolvedQuestionHistoryItem[];
  lang: LanguageOption;
  dualLang: boolean;
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
  onRetryQuestion?: (questionId: string) => void;
}

const COMPETENCY_LABELS: Record<Competency, { ar: string; biof: string }> = {
  restitution: { ar: 'استرداد المعارف (20%)', biof: 'Restitution (20%)' },
  application: { ar: 'تطبيق القواعد (40%)', biof: 'Application directe (40%)' },
  reasoning: { ar: 'الاستدلال والبرهان (25%)', biof: 'Raisonnement (25%)' },
  problem_solving: { ar: 'حل المسائل المركبة (15%)', biof: 'Résolution de problèmes (15%)' }
};

export const RecentQuestionsHistory: React.FC<RecentQuestionsHistoryProps> = ({
  history,
  lang,
  dualLang,
  isOpen,
  onClose,
  onClearHistory,
  onRetryQuestion
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Compute analytics across the 10 recent questions
  const statsSummary = useMemo(() => {
    if (history.length === 0) {
      return {
        total: 0,
        correctCount: 0,
        accuracyPct: 0,
        avgTimeSec: 0,
        totalPoints: 0,
        totalXp: 0,
        trendText: { ar: 'لا توجد بيانات كافية', biof: 'Données insuffisantes' }
      };
    }

    const total = history.length;
    const correctCount = history.filter(h => h.isCorrect).length;
    const accuracyPct = Math.round((correctCount / total) * 100);
    const sumTime = history.reduce((acc, h) => acc + h.timeSpentSec, 0);
    const avgTimeSec = Math.round(sumTime / total);
    const totalPoints = history.reduce((acc, h) => acc + h.pointsEarned, 0);
    const totalXp = history.reduce((acc, h) => acc + h.xpEarned, 0);

    // Trend: compare most recent half (index 0..Math.floor(n/2)) vs older half
    let trendText = {
      ar: 'أداء مستقر ومتوازن',
      biof: 'Performance stable et équilibrée'
    };

    if (total >= 4) {
      const half = Math.floor(total / 2);
      const recentSlice = history.slice(0, half);
      const olderSlice = history.slice(half);

      const recentAcc = recentSlice.filter(h => h.isCorrect).length / recentSlice.length;
      const olderAcc = olderSlice.filter(h => h.isCorrect).length / olderSlice.length;
      const recentSpeed = recentSlice.reduce((a, b) => a + b.timeSpentSec, 0) / recentSlice.length;
      const olderSpeed = olderSlice.reduce((a, b) => a + b.timeSpentSec, 0) / olderSlice.length;

      if (recentAcc > olderAcc) {
        trendText = {
          ar: '📈 تطور تصاعدي ملحوظ في دقة الإجابات!',
          biof: '📈 Nette progression de la précision !'
        };
      } else if (recentSpeed < olderSpeed && recentAcc >= olderAcc) {
        trendText = {
          ar: '⚡ تحسن رائع في سرعة البديهة وحل الأسئلة!',
          biof: '⚡ Excellente amélioration de la vitesse d\'exécution !'
        };
      } else if (recentAcc < olderAcc) {
        trendText = {
          ar: '⚠️ يُنصح بالتمهل والتركيز لتفادي الأخطاء المتسرعة',
          biof: '⚠️ Prenez le temps de bien relire pour éviter la précipitation'
        };
      }
    }

    return {
      total,
      correctCount,
      accuracyPct,
      avgTimeSec,
      totalPoints,
      totalXp,
      trendText
    };
  }, [history]);

  // Filter items
  const filteredHistory = useMemo(() => {
    if (filter === 'correct') return history.filter(h => h.isCorrect);
    if (filter === 'incorrect') return history.filter(h => !h.isCorrect);
    return history;
  }, [history, filter]);

  if (!isOpen) return null;

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 md:p-6 shadow-2xl space-y-5 my-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg md:text-xl font-bold text-white">
                {lang === 'ar' ? 'سجل تفاعلي لآخر 10 أسئلة تم حلها' : 'Historique Interactif des 10 Dernières Questions'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 border border-indigo-700/60 text-indigo-300">
                {history.length} / 10
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ar'
                ? 'تتبع النتيجة، الزمن المستغرق لكل سؤال، ومراجعة التعليل الديدكتيكي لتقييم تطورك الذاتي'
                : 'Suivez le score, le temps passé et révisez les justifications mathématiques'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title={lang === 'ar' ? 'مسح سجل الأسئلة' : 'Effacer l\'historique'}
              className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-700/50 text-slate-400 hover:text-rose-300 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'ar' ? 'مسح السجل' : 'Effacer'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
          <Clock className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-300">
            {lang === 'ar' ? 'لم تقم بحل أي سؤال بعد في هذه الجلسة' : 'Aucune question résolue pour l\'instant'}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {lang === 'ar'
              ? 'ابدأ بالإجابة على التمارين أعلاه؛ وسيتم تسجيل كل سؤال تلقائياً مع مدة حله ونتيجته هنا لمساعدتك على قياس سرعتك ودقتك.'
              : 'Commencez à résoudre des questions ci-dessus ; chaque question sera automatiquement archivée ici avec son chronomètre.'}
          </p>
        </div>
      ) : (
        <>
          {/* Analytics KPI Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'ar' ? 'نسبة النجاح' : 'Taux de Réussite'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums">
                  {statsSummary.accuracyPct}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({statsSummary.correctCount}/{statsSummary.total})
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${statsSummary.accuracyPct}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'ar' ? 'متوسط زمن السؤال' : 'Temps Moyen / Question'}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-extrabold text-cyan-400 font-mono tabular-nums">
                  {statsSummary.avgTimeSec}
                </span>
                <span className="text-xs text-slate-400">{lang === 'ar' ? 'ثانية' : 'sec'}</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {statsSummary.avgTimeSec <= 20
                  ? (lang === 'ar' ? '⚡ وتيرة سريعة جداً' : '⚡ Rythme très rapide')
                  : statsSummary.avgTimeSec <= 45
                  ? (lang === 'ar' ? '⏱️ وتيرة متوازنة ومضبوطة' : '⏱️ Rythme équilibré')
                  : (lang === 'ar' ? '⏳ تفكير عميق وتأنٍّ' : '⏳ Analyse approfondie')}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">
                {lang === 'ar' ? 'مجموع النقاط والخبرة' : 'Points & XP Cumulés'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
                  +{statsSummary.totalPoints}
                </span>
                <span className="text-xs text-indigo-400 font-mono">
                  (+{statsSummary.totalXp} XP)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                {lang === 'ar' ? 'محصلة آخر 10 أسئلة' : 'Sur les 10 dernières'}
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                {lang === 'ar' ? 'مؤشر التطور' : 'Indicateur de Progression'}
              </span>
              <p className="text-xs font-semibold text-indigo-300 leading-snug mt-1">
                {statsSummary.trendText[lang]}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {lang === 'ar' ? `الكل (${history.length})` : `Tous (${history.length})`}
              </button>
              <button
                type="button"
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filter === 'correct'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-emerald-400/80 border border-slate-800 hover:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? `صحيح (${statsSummary.correctCount})` : `Exactes (${statsSummary.correctCount})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  filter === 'incorrect'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-rose-400/80 border border-slate-800 hover:text-rose-300'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? `خاطئ (${statsSummary.total - statsSummary.correctCount})` : `Erreurs (${statsSummary.total - statsSummary.correctCount})`}</span>
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              {lang === 'ar' ? 'انقر على السؤال لكشف التعليل الرياضي' : 'Cliquez pour afficher la justification'}
            </span>
          </div>

          {/* History Items List */}
          <div className="space-y-3">
            {filteredHistory.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const speedBadgeColor =
                item.timeSpentSec <= 20
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : item.timeSpentSec <= 45
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300';

              return (
                <div
                  key={item.id}
                  className={`bg-slate-950 border rounded-xl overflow-hidden transition-all duration-200 ${
                    item.isCorrect
                      ? 'border-slate-800 hover:border-emerald-500/40'
                      : 'border-rose-950/80 hover:border-rose-600/50'
                  }`}
                >
                  {/* Card Main Row (Always Visible) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-900/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Sequence & Status Badge */}
                      <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                        <span className="text-[11px] font-mono text-slate-500">#{index + 1}</span>
                        {item.isCorrect ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-rose-950 border border-rose-500/50 flex items-center justify-center text-rose-400">
                            <XCircle className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Title & Statement snippet */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {item.questionTitle[lang]}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                            {DOMAINS[item.domain].icon} {DOMAINS[item.domain].name[lang]}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-900/40 text-indigo-300 font-medium">
                            {COMPETENCY_LABELS[item.competency][lang]}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-1">
                          <MathText text={item.questionStatement[lang]} />
                        </p>
                      </div>
                    </div>

                    {/* Time, Points & Expand Indicator */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-900">
                      {/* Time Spent Pill */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${speedBadgeColor}`}
                        title={lang === 'ar' ? 'الوقت المستغرق في حل هذا السؤال' : 'Temps passé'}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.timeSpentSec}s</span>
                      </div>

                      {/* Points / XP */}
                      <div className="text-end">
                        <span className={`text-xs font-bold font-mono block ${item.isCorrect ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {item.isCorrect ? `+${item.pointsEarned} pts` : '0 pts'}
                        </span>
                        {item.isCorrect && (
                          <span className="text-[10px] text-indigo-400 font-mono block">
                            +{item.xpEarned} XP
                          </span>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Pane (KaTeX, Full Question, Options & Didactic Explanation) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 space-y-4">
                      {/* Full statement */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">
                          {lang === 'ar' ? 'نص السؤال الكامل:' : 'Énoncé complet :'}
                        </span>
                        <p className="text-sm text-slate-200 leading-relaxed">
                          <MathText text={item.questionStatement[lang]} />
                        </p>
                        {dualLang && (
                          <p className="text-xs text-slate-400 leading-relaxed pt-1" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                            <MathText text={item.questionStatement[lang === 'ar' ? 'biof' : 'ar']} />
                          </p>
                        )}
                      </div>

                      {/* Mathematical Formula via KaTeX */}
                      {item.formula && (
                        <div className="py-1">
                          <FormulaDisplay formula={item.formula} copyable className="py-2.5 text-base" />
                        </div>
                      )}

                      {/* Comparison: Chosen Option vs Correct Option */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div
                          className={`p-3 rounded-xl border ${
                            item.isCorrect
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                              : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                          }`}
                        >
                          <span className="text-[11px] font-bold block mb-1">
                            {lang === 'ar' ? 'إجابتك المسجلة:' : 'Votre réponse :'}
                          </span>
                          <div className="text-sm font-semibold">
                            <MathText text={item.selectedOptionText[lang]} />
                          </div>
                          <span className="text-[10px] mt-1 block opacity-80">
                            {item.isCorrect
                              ? (lang === 'ar' ? '✓ إجابة صحيحة' : '✓ Réponse exacte')
                              : (lang === 'ar' ? '✗ إجابة غير صحيحة' : '✗ Réponse incorrecte')}
                          </span>
                        </div>

                        {!item.isCorrect && (
                          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200">
                            <span className="text-[11px] font-bold block mb-1">
                              {lang === 'ar' ? 'الإجابة النموذجية الصحيحة:' : 'Bonne réponse :'}
                            </span>
                            <div className="text-sm font-semibold">
                              <MathText text={item.correctOptionText[lang]} />
                            </div>
                            <span className="text-[10px] mt-1 block opacity-80">
                              {lang === 'ar' ? 'الخيار الصائب المعتمد' : 'Option validée'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Step-by-Step Mathematical Explanation */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                        <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === 'ar' ? 'التعليل الرياضي والمنهجي:' : 'Justification Mathématique :'}</span>
                        </h5>
                        <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                          <MathText text={item.explanation[lang]} />
                        </div>
                        {dualLang && (
                          <div className="text-xs text-slate-400 whitespace-pre-line pt-2 border-t border-slate-800" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                            <MathText text={item.explanation[lang === 'ar' ? 'biof' : 'ar']} />
                          </div>
                        )}
                      </div>

                      {/* Inspector Didactic Tip */}
                      {item.inspectorTip && (
                        <div className="bg-amber-950/30 border border-amber-700/40 rounded-xl p-3 text-xs text-amber-200 leading-relaxed">
                          <span className="font-bold block mb-0.5">
                            {lang === 'ar' ? '💡 توجيه المفتش التربوي:' : '💡 Conseil de l\'Inspecteur :'}
                          </span>
                          <p>{item.inspectorTip[lang]}</p>
                        </div>
                      )}

                      {/* Action Bar: Retry question button */}
                      {onRetryQuestion && (
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => onRetryQuestion(item.questionId)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{lang === 'ar' ? 'إعادة تدريب على هذا السؤال الآن' : 'Réessayer cette question'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
