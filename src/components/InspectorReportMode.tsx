import React, { useState } from 'react';
import {
  UserStats,
  LanguageOption,
  LevelId,
  StreamId,
  Question,
  LEVELS,
  STREAMS,
  DOMAINS,
  MathDomain,
  Competency,
  PEDAGOGICAL_GUIDELINES_BY_LEVEL
} from '../constants/dataStructure';
import { generateInspectorReview, getRankByXP, getWeakestDomain } from '../game/engine';
import { BadgesShowcase } from './BadgesShowcase';
import { CompetencyPerformanceChart } from './CompetencyPerformanceChart';
import { ActivityTrendChart } from './ActivityTrendChart';
import { MistakeRemediationSession } from './MistakeRemediationSession';
import { InspectionBulletinModal } from './InspectionBulletinModal';
import { Printer } from 'lucide-react';

interface InspectorReportModeProps {
  stats: UserStats;
  levelId: LevelId;
  streamId: StreamId;
  playerName?: string;
  lang: LanguageOption;
  dualLang?: boolean;
  onResetStats: () => void;
  onLaunchRemediation?: () => void;
  onRemediateResult?: (question: Question, isCorrect: boolean, timeSpent: number) => void;
  onLoadDiagnosticMistakes?: (questions: Question[]) => void;
}

const COMPETENCY_NAMES: Record<Competency, { ar: string; biof: string }> = {
  restitution: { ar: 'استرداد المعارف والتعاريف (20%)', biof: 'Restitution des Connaissances (20%)' },
  application: { ar: 'التطبيق المباشر للقواعد (40%)', biof: 'Application Directe des Règles (40%)' },
  reasoning: { ar: 'الاستدلال والبرهان الرياضي (25%)', biof: 'Raisonnement & Démonstration (25%)' },
  problem_solving: { ar: 'حل الوضعيات والمسائل المركبة (15%)', biof: 'Résolution de Problèmes (15%)' }
};

export const InspectorReportMode: React.FC<InspectorReportModeProps> = ({
  stats,
  levelId,
  streamId,
  playerName = '',
  lang,
  dualLang = true,
  onResetStats,
  onLaunchRemediation,
  onRemediateResult,
  onLoadDiagnosticMistakes
}) => {
  const review = generateInspectorReview(stats);
  const rank = getRankByXP(stats.xp);
  const weakestDomain = getWeakestDomain(stats);
  const currentLevel = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const currentStream = STREAMS[streamId];
  const guideline = PEDAGOGICAL_GUIDELINES_BY_LEVEL[levelId];

  const [showBulletin, setShowBulletin] = useState(false);

  return (
    <div className="space-y-6">
      {/* Section 1: Student Badges & Achievements Showcase */}
      <BadgesShowcase stats={stats} lang={lang} />

      {/* Section 2: Interactive Mistake Remediation Session ('جلسة تدارك الأخطاء') */}
      <MistakeRemediationSession
        stats={stats}
        levelId={levelId}
        streamId={streamId}
        playerName={playerName}
        lang={lang}
        dualLang={dualLang}
        onRemediateResult={(q, isCorrect, timeSpent) => {
          if (onRemediateResult) {
            onRemediateResult(q, isCorrect, timeSpent);
          }
        }}
        onLoadDiagnosticMistakes={onLoadDiagnosticMistakes}
      />

      {/* Section 3A: Recharts 7-Day Activity Trend Chart (Solved Question Count over Last 7 Days) */}
      <ActivityTrendChart stats={stats} lang={lang} />

      {/* Section 3B: Recharts Performance Tracking Chart - Weekly Improvement in Competency Scores */}
      <CompetencyPerformanceChart stats={stats} lang={lang} />

      {/* Section 4: Live Student Diagnostic Report */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <p className="text-xs text-slate-400">
              {currentLevel.name[lang]} · {currentStream.name[lang]}
            </p>
            <h3 className="text-xl font-bold text-white mt-0.5">
              {lang === 'ar' ? 'بطاقة التقويم التشخيصي والحصيلة التربوية' : 'Bulletin d\'Évaluation Diagnostique & Bilan'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulletin(true)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-slate-950 flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>{lang === 'ar' ? '📜 وثيقة الحصيلة الرسمية (PDF)' : '📜 Bulletin Officiel (PDF)'}</span>
            </button>

            {onLaunchRemediation && (
              <button
                type="button"
                onClick={onLaunchRemediation}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
              >
                {lang === 'ar'
                  ? `🎯 بدء حصة الدعم الموجه (${DOMAINS[weakestDomain].name.ar})`
                  : `🎯 Lancer la Remédiation (${DOMAINS[weakestDomain].name.biof})`}
              </button>
            )}
            <button
              type="button"
              onClick={onResetStats}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إعادة تصفير الإحصائيات' : 'Réinitialiser le Bilan'}
            </button>
          </div>
        </div>

        {/* Official Inspection Bulletin Modal */}
        <InspectionBulletinModal
          isOpen={showBulletin}
          onClose={() => setShowBulletin(false)}
          stats={stats}
          levelId={levelId}
          streamId={streamId}
          playerName={playerName || ''}
          lang={lang}
        />

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'النقطة التقديرية (على 20)' : 'Note Diagnostique (/20)'}
            </span>
            <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1 block">
              {stats.solvedCount > 0 ? `${review.diagnosticGrade} / 20` : '— / 20'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {review.overallRankTitle[lang]}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'الرتبة والخبرة المكتسبة' : 'Grade & Expérience XP'}
            </span>
            <span className="text-lg font-bold text-indigo-300 mt-1 block">
              {rank.badge} {rank.title[lang]}
            </span>
            <span className="text-xs font-mono tabular-nums text-slate-400 mt-1 block">
              {stats.xp} / {rank.nextThreshold} XP
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'التمارين المنجزة بنجاح' : 'Exercices Réussis'}
            </span>
            <span className="text-2xl font-bold text-white font-mono tabular-nums mt-1 block">
              {stats.correctCount} / {stats.solvedCount}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'ar' ? `أفضل سلسلة: ${stats.maxStreak}` : `Meilleure série : ${stats.maxStreak}`}
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 block">
              {lang === 'ar' ? 'الأخطاء المنهجية المكتشفة' : 'Pièges Didactiques Déjoués'}
            </span>
            <span className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1 block">
              {stats.pitfallsFound}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {lang === 'ar' ? 'في طور صائد الأخطاء' : 'En mode Chasseur d\'Erreurs'}
            </span>
          </div>
        </div>

        {/* Competency & Domain Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'نسبة التحكم حسب الكفايات المنهجية:' : 'Maîtrise par Compétences Méthodologiques :'}
            </h4>
            <div className="space-y-3">
              {(Object.keys(COMPETENCY_NAMES) as Competency[]).map(compKey => {
                const item = stats.competencyScores[compKey];
                const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
                return (
                  <div key={compKey} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">{COMPETENCY_NAMES[compKey][lang]}</span>
                      <span className="font-mono tabular-nums text-indigo-300">
                        {item.correct}/{item.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">
              {lang === 'ar' ? 'نسبة التحكم حسب المجالات المعرفية:' : 'Maîtrise par Domaines Mathématiques :'}
            </h4>
            <div className="space-y-3">
              {(Object.keys(DOMAINS) as MathDomain[]).map(domKey => {
                const item = stats.domainScores[domKey];
                const pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
                return (
                  <div key={domKey} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">
                        {DOMAINS[domKey].icon} {DOMAINS[domKey].name[lang]}
                      </span>
                      <span className="font-mono tabular-nums text-emerald-300">
                        {item.correct}/{item.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Official Inspector Advice */}
        <div className="bg-indigo-950/30 border border-indigo-800/50 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold text-indigo-300">
            {review.pedagogicalObservation[lang]}
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            {review.officialInspectorAdvice[lang]}
          </p>
        </div>
      </div>

      {/* Section 3: Official Pedagogical Guidelines & Reference Framework Matrix (التوجيهات التربوية الرسمية) */}
      {guideline && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-4">
            <p className="text-xs font-semibold text-emerald-400">
              {guideline.officialReference[lang]}
            </p>
            <h3 className="text-xl font-bold text-white mt-1">
              {lang === 'ar'
                ? `مرجع التوجيهات التربوية الرسمية والأطر المرجعية — ${currentLevel.name.ar}`
                : `Référentiel des Orientations Pédagogiques Officielles — ${currentLevel.name.biof}`}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {guideline.didacticVision[lang]}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Domain Official Weightings */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-sm font-bold text-indigo-400">
                {lang === 'ar'
                  ? 'الأوزان الرسمية للمجالات في المقرر والامتحانات:'
                  : 'Pondération Officielle des Domaines au Programme :'}
              </h4>
              <div className="space-y-3">
                {guideline.officialWeighting.map((w, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white">
                        {DOMAINS[w.domain].icon} {DOMAINS[w.domain].name[lang]}
                      </span>
                      <span className="font-mono text-emerald-400">{w.weightPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${w.weightPct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">{w.note[lang]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites, Interdisciplinarity & Assessment Structure */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-amber-400">
                  {lang === 'ar'
                    ? 'المكتسبات القبلية والتقاطعات مع المواد العلمية (Interdisciplinarité):'
                    : 'Prérequis & Prolongements Interdisciplinaires :'}
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {guideline.interdisciplinaryLinks.map((link, idx) => (
                    <li key={idx}>• {link[lang]}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <h4 className="text-sm font-bold text-cyan-400">
                  {lang === 'ar'
                    ? 'بنية المراقبة المستمرة والامتحانات الإشهادية الرسمية:'
                    : 'Structure de l\'Évaluation Continue et Certificative :'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {guideline.assessmentStructure[lang]}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Deep Architectural Deconstruction, Bug Fixes & Pedagogical Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <p className="text-xs font-semibold text-amber-400">
            {lang === 'ar'
              ? 'التدقيق الهندسي والبيداغوجي الشامل · منظور مطور التطبيقات وأستاذ الرياضيات'
              : 'Audit Architectural, Optimisation Algorithmique & Ingénierie Didactique'}
          </p>
          <h3 className="text-xl font-bold text-white mt-1">
            {lang === 'ar'
              ? 'تفكيك بنية التطبيق، التحليل العميق للوحدات، وسجل تصحيح الأخطاء البرمجية والرياضية'
              : 'Déconstruction Complète des Modules, Analyse Mathématique & Corrections de Bugs'}
          </h3>
        </div>

        {/* 3-Column Deep Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-indigo-400">
              {lang === 'ar' ? '1. تفكيك بنية الوحدات الهندسية (14 Modules)' : '1. Déconstruction des 14 Modules'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li>
                • <strong>game/engine.ts & FormulaDisplay.tsx</strong> : {lang === 'ar' ? 'النواة الحسابية المعزولة (تصفية مخبأة O(1)، مولد بارامتري، حساب XP) + محرك عرض الصيغ الرياضية الحقيقية بـ KaTeX.' : 'Noyau algorithmique pur (cache O(1), générateur paramétrique) + rendu mathématique KaTeX.'}
              </li>
              <li>
                • <strong>QuizMode.tsx + SpeechRecognition + Audio</strong> : {lang === 'ar' ? 'التمارين التفاعلية + الإملاء الصوتي (Voice-to-Text) بـ SpeechRecognition API + المؤثرات الصوتية التفاعلية (Web Audio API) + سجل آخر 10 أسئلة.' : 'Exercices interactifs + Dictée Vocale (SpeechRecognition) + Sons Web Audio + Historique des 10 dernières questions.'}
              </li>
              <li>
                • <strong>ActivityTrendChart.tsx & CompetencyPerformanceChart.tsx</strong> : {lang === 'ar' ? 'مبيان اتجاه النشاط لآخر 7 أيام (Recharts Area/Bar) + مبيان تطور الكفايات الأربع أسبوعياً.' : 'Graphique de tendance d\'activité sur 7 jours (Recharts) + suivi hebdomadaire des compétences.'}
              </li>
              <li>
                • <strong>ProofBuilderMode.tsx & BossFightArena.tsx</strong> : {lang === 'ar' ? 'ورشة بناء البرهان الرياضي خطوة بخطوة + حلبة زعماء الفصول (RPG Boss Fight) للتحضير الإشهادي.' : 'Atelier de construction de démonstrations + Arène RPG des Boss de chapitres.'}
              </li>
              <li>
                • <strong>MathLabMode.tsx, PitfallsMode.tsx & FlashcardsMode.tsx</strong> : {lang === 'ar' ? 'المختبر البياني للدوال والمماسات + صائد الأخطاء الشائعة + البطاقات المقلوبة ثلاثية الأبعاد (3D Flip).' : 'Labo graphique de fonctions + chasseur d\'erreurs + cartes mémoire 3D.'}
              </li>
              <li>
                • <strong>ConceptGlossary.tsx, StudyPlanner.tsx & InspectionBulletinModal.tsx</strong> : {lang === 'ar' ? 'المعجم الرياضي المزدوج + المخطط الأسبوعي + وثيقة الحصيلة الرسمية القابلة للطباعة (PDF).' : 'Glossaire bilingue + planificateur + bulletin officiel imprimable.'}
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-rose-400">
              {lang === 'ar' ? '2. سجل تشخيص وتصحيح الأخطاء (Bug Fixes)' : '2. Journal des Bugs Diagnostiqués & Corrigés'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li>
                • <strong>{lang === 'ar' ? 'إصلاح خطأ النشر على Cloud Run (Node v22 ESM):' : 'Correction Déploiement Cloud Run (Node v22 ESM) :'}</strong> {lang === 'ar' ? 'معالجة خطأ ERR_MODULE_NOT_FOUND في server.ts عبر فك الارتباط بالمسارات النسبية بدون امتداد وجعل الخادم مستقلاً بالكامل في بيئة الإنتاج.' : 'Résolution de ERR_MODULE_NOT_FOUND dans server.ts pour l\'exécution native sous Node.js v22.'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'حفظ سجل النشاط اليومي (7-Day History):' : 'Persistance de l\'Historique sur 7 Jours :'}</strong> {lang === 'ar' ? 'تخزين عدد الأسئلة المحلولة والصحيحة يومياً في dailyActivityHistory داخل localStorage لتغذية مبيان Activity Trend بدقة.' : 'Enregistrement quotidien des questions résolues dans dailyActivityHistory (localStorage).'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'تزامن سؤال الذكاء الاصطناعي وحلقة الهدف اليومي:' : 'Synchronisation IA & Anneau Quotidien :'}</strong> {lang === 'ar' ? 'تحديث تلقائي لتمرين الذكاء الاصطناعي عند تغيير المستوى وربط حلقة التقدم بجميع الأنشطة.' : 'Régénération de l\'exercice IA au changement de niveau et synchronisation de l\'anneau SVG.'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'تأمين SpeechRecognition ومؤقتات الذاكرة:' : 'Sécurisation SpeechRecognition & Minuteurs :'}</strong> {lang === 'ar' ? 'إغلاق آمن لجلسات الميكروفون عند مغادرة المكون وتوفير بدائل النطق التفاعلي للمتصفحات غير الداعمة.' : 'Nettoyage propre des instances SpeechRecognition et fallback interactif.'}
              </li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h4 className="text-sm font-bold text-emerald-400">
              {lang === 'ar' ? '3. التحليل الرياضي والبيداغوجي الشامل' : '3. Analyse Didactique & Optimisation'}
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
              <li>
                • <strong>{lang === 'ar' ? 'تحويل الصوت إلى نص رياضي (Voice-to-Text):' : 'Reconnaissance Vocale Mathématique :'}</strong> {lang === 'ar' ? 'خوارزمية تطبيع النطق بالعربية والفرنسية (الأعداد، الإشارات، الجذور، القوى، π، ∞) ومطابقتها الفورية مع الخيارات.' : 'Normalisation vocale bilingue (nombres, signes, racines, puissances) et correspondance automatique.'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'التتبع المزدوج بالرسوم البيانية (Recharts):' : 'Double Suivi Graphique (Recharts) :'}</strong> {lang === 'ar' ? 'الجمع بين مبيان اتجاه النشاط لآخر 7 أيام (الاستمرارية) ومبيان تطور الكفايات الأربع (الجودة المنهجية).' : 'Combinaison de la régularité sur 7 jours (Activity Trend) et de la maîtrise par compétences.'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'الذاكرة المخبأة (O(1)) وعزل المنحنيات:' : 'Cache O(1) & Mémoïsation SVG :'}</strong> {lang === 'ar' ? 'تخزين تصفية التمارين في questionFilterCache وعزل حساب 125 نقطة للمنحنى البياني بـ useMemo.' : 'Cache mémoire O(1) et mémoïsation du tracé SVG à 125 points.'}
              </li>
              <li>
                • <strong>{lang === 'ar' ? 'التناغم اللغوي المزدوج (عربي ↔ BIOF):' : 'Pont Linguistique Arabe ↔ BIOF :'}</strong> {lang === 'ar' ? 'مطابقة تامة للأطر المرجعية المغربية من الأولى إعدادي (1AC) إلى الثانية بكالوريا (2BAC).' : 'Conformité aux cadres de référence marocains de la 1AC à la 2BAC.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


