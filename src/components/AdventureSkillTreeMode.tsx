import React, { useState, useMemo } from 'react';
import {
  LevelId,
  StreamId,
  LanguageOption,
  UserStats,
  DOMAINS,
  LEVELS,
  STREAMS
} from '../constants/dataStructure';
import { SKILL_TREE_DATABASE } from '../data/rpgClassesAndSkills';
import { SkillNode } from '../types/curriculum';
import {
  buildPersonalizedLearningPath,
  LearningPathStage,
  PersonalizedPathStep
} from '../game/engine';
import { FormulaDisplay } from './FormulaDisplay';
import { soundFeedback } from '../utils/feedbackSounds';
import {
  Lock,
  Star,
  ChevronRight,
  Compass,
  Zap,
  GitBranch,
  CalendarPlus,
  BookOpen,
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface AdventureSkillTreeModeProps {
  levelId: LevelId;
  streamId?: StreamId;
  lang: LanguageOption;
  dualLang: boolean;
  stats: UserStats;
  onLaunchSkillPractice: (domain: string, skillTitle: string) => void;
  onOpenPitfalls?: () => void;
  onOpenGlossary?: () => void;
  onOpenProof?: () => void;
  onOpenBoss?: () => void;
  onSyncPathToPlanner?: () => void;
}

const STAGE_STYLES: Record<
  LearningPathStage,
  { badge: string; border: string; label: { ar: string; biof: string } }
> = {
  remediation: {
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    border: 'border-rose-500/40 hover:border-rose-400',
    label: { ar: 'أولوية قصوى · تدارك التعثر', biof: 'Priorité · Remédiation' }
  },
  foundation: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    border: 'border-indigo-500/40 hover:border-indigo-400',
    label: { ar: 'تأسيس وبناء القواعد', biof: 'Acquisition · Bases' }
  },
  consolidation: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    border: 'border-amber-500/40 hover:border-amber-400',
    label: { ar: 'تثبيت وتطوير الأداء', biof: 'Consolidation' }
  },
  excellence: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    border: 'border-emerald-500/40 hover:border-emerald-400',
    label: { ar: 'تميّز وتحدي إشهادي', biof: 'Excellence · Examen' }
  }
};

export const AdventureSkillTreeMode: React.FC<AdventureSkillTreeModeProps> = ({
  levelId,
  streamId = 'general',
  lang,
  dualLang,
  stats,
  onLaunchSkillPractice,
  onOpenPitfalls,
  onOpenGlossary,
  onOpenProof,
  onOpenBoss,
  onSyncPathToPlanner
}) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const personalizedPath = useMemo(
    () => buildPersonalizedLearningPath(stats, levelId, streamId),
    [stats, levelId, streamId]
  );

  const levelSkills = useMemo(() => {
    return SKILL_TREE_DATABASE.filter(n => n.levelId === levelId);
  }, [levelId]);

  const masteredSkills = useMemo(() => {
    return stats.masteredSkills || {};
  }, [stats.masteredSkills]);

  const getNodeStars = (node: SkillNode): number => {
    if (masteredSkills[node.id] !== undefined) {
      return masteredSkills[node.id];
    }
    const domainStat = stats.domainScores[node.domain];
    if (domainStat && domainStat.total >= 2) {
      const pct = (domainStat.correct / domainStat.total) * 100;
      if (pct >= 80) return 3;
      if (pct >= 55) return 2;
      if (pct >= 30) return 1;
    }
    return 0;
  };

  const isNodeUnlocked = (node: SkillNode): boolean => {
    if (node.prerequisites.length === 0) return true;
    return node.prerequisites.every(prereqId => {
      const prereqNode = SKILL_TREE_DATABASE.find(n => n.id === prereqId);
      const stars = prereqNode ? getNodeStars(prereqNode) : (masteredSkills[prereqId] || 0);
      return stars >= 1;
    });
  };

  const totalPossibleStars = levelSkills.length * 3;
  const currentEarnedStars = levelSkills.reduce((acc, n) => acc + getNodeStars(n), 0);
  const masteryPercentage =
    totalPossibleStars > 0 ? Math.round((currentEarnedStars / totalPossibleStars) * 100) : 0;

  const currentLevelObj = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const currentStreamObj = STREAMS[streamId];

  const handleLaunchPathStep = (step: PersonalizedPathStep) => {
    soundFeedback.playClickSound();
    if (step.recommendedActionTab === 'pitfalls' && onOpenPitfalls) {
      onOpenPitfalls();
      return;
    }
    if (step.recommendedActionTab === 'proof' && onOpenProof) {
      onOpenProof();
      return;
    }
    if (step.recommendedActionTab === 'boss' && onOpenBoss) {
      onOpenBoss();
      return;
    }
    onLaunchSkillPractice(step.topic.domain, step.topic.title[lang]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1.5 shadow-md">
                <Compass className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'مسار التعلم المخصص وشجرة المهارات' : 'Parcours Personnalisé & Compétences'}</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-950 text-indigo-300 border border-slate-800">
                {currentLevelObj.name[lang]} · {currentStreamObj?.code}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white mt-1">
              {personalizedPath.summaryTitle[lang]}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {personalizedPath.summaryAdvice[lang]}
            </p>
          </div>

          {/* Overall Mastery Ring KPI */}
          <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-4 flex items-center gap-4">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="23" stroke="#1e293b" strokeWidth="5" fill="none" />
                <circle
                  cx="28"
                  cy="28"
                  r="23"
                  stroke="#6366f1"
                  strokeWidth="5"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 23}
                  strokeDashoffset={2 * Math.PI * 23 * (1 - masteryPercentage / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute font-mono font-extrabold text-sm text-white">
                {masteryPercentage}%
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">
                {lang === 'ar' ? 'الجاهزية العامة والمجموع' : 'Préparation & Étoiles'}
              </span>
              <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                ⭐ {currentEarnedStars} / {totalPossibleStars}
              </span>
              <span className="text-[11px] text-emerald-400 block font-semibold mt-0.5">
                {lang === 'ar'
                  ? `التقدير التشخيصي: ${personalizedPath.estimatedGradeOn20}/20`
                  : `Note diagnostique : ${personalizedPath.estimatedGradeOn20}/20`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Ministerial Curriculum Linker & Personalized Learning Path */}
      <section className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 md:p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <GitBranch className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? 'نظام الربط الديناميكي بقاعدة بيانات المناهج الوزارية'
                  : 'Moteur de Liaison Dynamique au Programme Officiel'}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              {lang === 'ar'
                ? 'خريطة مسارك التعليمي المخصص خطوة بخطوة'
                : 'Votre Feuille de Route Pédagogique Personnalisée'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'ar'
                ? `مرتبة آلياً حسب مستواك الدراسي (${currentLevelObj.shortName.ar})، نتائج المجالات الأربعة، وأخطائك المسجلة.`
                : `Ordonnée automatiquement selon votre niveau (${currentLevelObj.shortName.biof}), vos scores par domaine et vos erreurs récentes.`}
            </p>
          </div>

          {onSyncPathToPlanner && (
            <button
              type="button"
              onClick={() => {
                soundFeedback.playTaskCompleteSound();
                onSyncPathToPlanner();
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-md shrink-0"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {lang === 'ar'
                  ? 'مزامنة المسار مع مخططي الأسبوعي'
                  : 'Synchroniser avec mon Planning'}
              </span>
            </button>
          )}
        </div>

        {/* Ordered Personalized Path Steps */}
        <div className="space-y-3.5">
          {personalizedPath.steps.map(step => {
            const style = STAGE_STYLES[step.stage];
            const domainMeta = DOMAINS[step.topic.domain];
            const isExpanded = expandedStepId === step.topic.id;

            const actionLabel =
              step.recommendedActionTab === 'pitfalls'
                ? (lang === 'ar' ? '⚠️ كشف الفخاخ المرتبطة' : '⚠️ Chasser les pièges')
                : step.recommendedActionTab === 'proof'
                ? (lang === 'ar' ? '🧩 ورشة البرهان المنطقي' : '🧩 Atelier Démonstrations')
                : step.recommendedActionTab === 'boss'
                ? (lang === 'ar' ? '⚔️ تحدي الزعيم الإشهادي' : '⚔️ Combat de Boss')
                : (lang === 'ar' ? '⚡ ابدأ تمارين هذه المحطة ←' : '⚡ Pratiquer ce chapitre →');

            return (
              <div
                key={step.topic.id}
                className={`rounded-2xl bg-slate-950/90 border p-4 md:p-5 transition-all space-y-3 ${style.border}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 font-mono font-extrabold text-sm text-white flex items-center justify-center shrink-0">
                      #{step.stepOrder}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`px-2 py-0.5 rounded-md border font-bold ${style.badge}`}>
                          {style.label[lang]}
                        </span>
                        <span className="text-indigo-400 font-semibold">
                          {domainMeta.icon} {domainMeta.name[lang]}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {step.domainAccuracyPct !== null
                            ? `${step.domainAccuracyPct}%`
                            : lang === 'ar'
                            ? 'جديد'
                            : 'Nouveau'}
                        </span>
                        <span className="text-slate-600" aria-hidden="true">·</span>
                        <span className="text-slate-400">
                          {step.recommendedDifficulty === 'easy'
                            ? (lang === 'ar' ? 'مستوى: تأسيسي' : 'Niveau : Base')
                            : step.recommendedDifficulty === 'medium'
                            ? (lang === 'ar' ? 'مستوى: متوسط' : 'Niveau : Intermédiaire')
                            : (lang === 'ar' ? 'مستوى: إشهادي متقدم' : 'Niveau : Avancé')}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                        {step.topic.title[lang]}
                      </h4>
                      {dualLang && (
                        <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                          {step.topic.title[lang === 'ar' ? 'biof' : 'ar']}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step Action Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        soundFeedback.playClickSound();
                        setExpandedStepId(isExpanded ? null : step.topic.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      {isExpanded
                        ? (lang === 'ar' ? 'إخفاء الروابط ▲' : 'Masquer ▲')
                        : (lang === 'ar' ? 'عرض الموارد المرتبطة ▼' : 'Ressources liées ▼')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLaunchPathStep(step)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                    >
                      {actionLabel}
                    </button>
                  </div>
                </div>

                {/* Personalized Rationale */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800/80 rounded-xl px-3.5 py-2.5">
                  💡 {step.pedagogicalRationale[lang]}
                </p>

                {/* Dynamic Curriculum Links Summary Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {step.linkedQuestionIds.length} {lang === 'ar' ? 'تمارين مكيفة' : 'exercices'}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-300 font-semibold">
                      <BookOpen className="w-3.5 h-3.5" />
                      {step.linkedLessons.length} {lang === 'ar' ? 'ملخص درس' : 'synthèse(s)'}
                    </span>
                    <span className="flex items-center gap-1 text-amber-300 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {step.linkedPitfalls.length} {lang === 'ar' ? 'فخاخ مرصودة' : 'pièges'}
                    </span>
                    <span className="text-slate-400">
                      📖 {step.linkedGlossaryTerms.length} {lang === 'ar' ? 'مفاهيم معجمية' : 'notions'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    📌 {step.topic.examWeightNote[lang]}
                  </span>
                </div>

                {/* Expanded Linked Ministerial Resources Panel */}
                {isExpanded && (
                  <div className="pt-3 mt-2 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-fadeIn">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="font-bold text-indigo-300 block">
                        📘 {lang === 'ar' ? 'ملخصات الدروس المرتبطة:' : 'Fiches de Cours Liées :'}
                      </span>
                      {step.linkedLessons.map(l => (
                        <p key={l.id} className="text-slate-300 leading-snug">
                          • {l.title[lang]}
                        </p>
                      ))}
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="font-bold text-amber-300 block">
                        ⚠️ {lang === 'ar' ? 'فخاخ ومصطلحات مرتبطة:' : 'Pièges & Notions Clés :'}
                      </span>
                      {step.linkedPitfalls.slice(0, 2).map(p => (
                        <p key={p.id} className="text-slate-300 leading-snug">
                          • {p.title[lang]}
                        </p>
                      ))}
                      {step.linkedGlossaryTerms.slice(0, 2).map(g => (
                        <p key={g.id} className="text-slate-400 leading-snug">
                          🔹 {g.term[lang]} (<span className="font-mono">{g.symbol}</span>)
                        </p>
                      ))}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {onOpenPitfalls && step.linkedPitfalls.length > 0 && (
                          <button
                            type="button"
                            onClick={onOpenPitfalls}
                            className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                          >
                            {lang === 'ar' ? 'فتح الفخاخ ←' : 'Voir pièges →'}
                          </button>
                        )}
                        {onOpenGlossary && (
                          <button
                            type="button"
                            onClick={onOpenGlossary}
                            className="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer"
                          >
                            {lang === 'ar' ? 'فتح المعجم ←' : 'Glossaire →'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                      <span className="font-bold text-emerald-300 block">
                        🗺️ {lang === 'ar' ? 'عقد المهارات المرتبطة:' : 'Nœuds de Compétences :'}
                      </span>
                      {step.linkedSkillNodes.map(sk => (
                        <div key={sk.id} className="flex items-center justify-between text-slate-300 gap-2">
                          <span className="truncate">
                            {sk.unlocked ? '🔓' : '🔒'} {sk.title[lang]}
                          </span>
                          <span className="font-mono text-amber-300 shrink-0">
                            {'★'.repeat(sk.stars)}{'☆'.repeat(Math.max(0, 3 - sk.stars))}
                          </span>
                        </div>
                      ))}
                      {step.missedInDomainCount > 0 && (
                        <p className="text-[11px] text-rose-400 font-bold pt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {lang === 'ar'
                            ? `${step.missedInDomainCount} أخطاء بانتظار التدارك`
                            : `${step.missedInDomainCount} erreur(s) à remédier`}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Skill Nodes Visual Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800">
          <span>{lang === 'ar' ? 'شجرة المهارات التفاعلية (انقر على أي مهارة لبدء التدريب الموجه):' : 'Arbre des compétences (cliquez pour lancer l\'entraînement) :'}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {lang === 'ar' ? 'متاحة' : 'Accessible'}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              {lang === 'ar' ? 'تتطلب مكتسبات قبلية' : 'Verrouillée'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levelSkills.map((node, idx) => {
            const unlocked = isNodeUnlocked(node);
            const stars = getNodeStars(node);
            const domainMeta = DOMAINS[node.domain];

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className={`group relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  unlocked
                    ? 'bg-slate-950/90 border-slate-800 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-lg">
                      {node.icon}
                    </span>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        #{idx + 1} · {domainMeta.name[lang]}
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {node.title[lang]}
                      </span>
                    </div>
                  </div>

                  {unlocked ? (
                    <div className="flex items-center text-amber-400 text-xs">
                      {[1, 2, 3].map(s => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="p-1 rounded-md bg-slate-900 border border-slate-700 text-slate-500">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {node.formulaSample && (
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 overflow-x-auto text-center">
                    <FormulaDisplay formula={node.formulaSample} className="text-xs py-1" />
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {unlocked
                      ? stars === 3
                        ? lang === 'ar' ? 'متقنة ⭐⭐⭐' : 'Maîtrisée ⭐⭐⭐'
                        : stars > 0
                        ? lang === 'ar' ? 'قيد التطوير' : 'En cours'
                        : lang === 'ar' ? 'جاهزة للبدء' : 'Prête'
                      : lang === 'ar' ? 'مقيدة بمتطلب' : 'Prérequis requis'}
                  </span>

                  <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Briefing & Launch Modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-2xl flex items-center justify-center">
                  {selectedNode.icon}
                </span>
                <div>
                  <span className="text-xs text-indigo-400 font-semibold block">
                    {DOMAINS[selectedNode.domain].name[lang]}
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {selectedNode.title[lang]}
                  </h3>
                  {dualLang && (
                    <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                      {selectedNode.title[lang === 'ar' ? 'biof' : 'ar']}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedNode.description[lang]}
              </p>
              {dualLang && (
                <p className="text-xs text-slate-400 leading-relaxed" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                  {selectedNode.description[lang === 'ar' ? 'biof' : 'ar']}
                </p>
              )}

              {selectedNode.formulaSample && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'ar' ? 'الصيغة الرياضية المحورية للدرس:' : 'Formule Clé de la Compétence :'}
                  </span>
                  <FormulaDisplay formula={selectedNode.formulaSample} copyable className="text-sm py-2" />
                </div>
              )}

              {selectedNode.prerequisites.length > 0 && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-amber-300">
                    {lang === 'ar' ? 'المكتسبات القبلية المشروطة:' : 'Prérequis exigés :'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedNode.prerequisites.map(pId => {
                      const pNode = SKILL_TREE_DATABASE.find(n => n.id === pId);
                      const isDone = (pNode ? getNodeStars(pNode) : (masteredSkills[pId] || 0)) >= 1;
                      return (
                        <button
                          key={pId}
                          type="button"
                          onClick={() => {
                            if (pNode) {
                              soundFeedback.playClickSound();
                              setSelectedNode(pNode);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/80'
                              : 'bg-amber-950/60 text-amber-300 border border-amber-700/50 hover:bg-amber-900/60'
                          }`}
                        >
                          {isDone ? '✓' : '🔒'} {pNode ? pNode.title[lang] : pId}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Fermer'}
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetDomain = selectedNode.domain;
                  const targetTitle = selectedNode.title[lang];
                  setSelectedNode(null);
                  onLaunchSkillPractice(targetDomain, targetTitle);
                }}
                className="px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? 'بدء تدريب هذه المهارة في بنك التمارين ←'
                    : 'Lancer l\'entraînement ciblé ←'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
