import React from 'react';
import { UserStats, LanguageOption, LevelId, StreamId, LEVELS, STREAMS } from '../constants/dataStructure';
import { generateInspectorReview, getRankByXP } from '../game/engine';
import { COMPETENCY_INFO } from './CompetencyPerformanceChart';
import { Printer, X, Award, CheckCircle2, ShieldCheck } from 'lucide-react';

interface InspectionBulletinModalProps {
  stats: UserStats;
  levelId: LevelId;
  streamId: StreamId;
  playerName: string;
  lang: LanguageOption;
  isOpen: boolean;
  onClose: () => void;
}

export const InspectionBulletinModal: React.FC<InspectionBulletinModalProps> = ({
  stats,
  levelId,
  streamId,
  playerName,
  lang,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const review = generateInspectorReview(stats);
  const rank = getRankByXP(stats.xp);
  const currentLevel = LEVELS.find(l => l.id === levelId) || LEVELS[0];
  const currentStream = STREAMS[streamId] || STREAMS['general'];
  const todayDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const appreciation =
    review.diagnosticGrade >= 16
      ? { ar: 'ممتاز وحسن جداً · تحكم عالٍ في الكفايات والبرهان', biof: 'Très Bien · Excellente maîtrise conceptuelle' }
      : review.diagnosticGrade >= 14
      ? { ar: 'حسن · مستوى واعد مع قدرة استدلالية متينة', biof: 'Bien · Solides compétences méthodologiques' }
      : review.diagnosticGrade >= 12
      ? { ar: 'مستحسن · تحكم مقبول مع حاجة لضبط بعض المفاهيم', biof: 'Assez Bien · Maîtrise correcte à consolider' }
      : review.diagnosticGrade >= 10
      ? { ar: 'متوسط · مستوفٍ للحد الأدنى ويحتاج إلى تدريب مكثف', biof: 'Passable · Niveau seuil, travail régulier requis' }
      : { ar: 'دون العتبة · موجه لحصص الدعم والاستدراك التكيفي', biof: 'Insuffisant · Remédiation ciblée impérative' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-amber-500/40 my-auto">
        {/* Print / Close Action Header (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{lang === 'ar' ? 'وثيقة الحصيلة التربوية الرسمية للمفتش (نسخة قابلة للطباعة والتصدير)' : 'Bulletin Officiel d\'Évaluation Pédagogique'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'ar' ? 'طباعة / حفظ PDF' : 'Imprimer / PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="space-y-6">
          {/* Kingdom Header */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-slate-900/10">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              المملكة المغربية · ROYAUME DU MAROC
            </p>
            <h2 className="text-sm font-bold text-slate-800">
              وزارة التربية الوطنية والتعليم الأولي والرياضة · المنظومة التربوية التفاعلية
            </h2>
            <h1 className="text-xl sm:text-2xl font-extrabold text-indigo-950 pt-1">
              {lang === 'ar'
                ? 'شهادة الحصيلة التشخيصية والتقويمية في مادة الرياضيات'
                : 'Bulletin d\'Évaluation Diagnostique en Mathématiques'}
            </h1>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'محررة وفق التوجيهات التربوية الرسمية والأطر المرجعية للامتحانات الإشهادية'
                : 'Conforme aux Orientations Pédagogiques et Cadres Référentiels Officiels'}
            </p>
          </div>

          {/* Student & Class Details Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-500 block">{lang === 'ar' ? 'اسم المتعلم(ة):' : 'Nom de l\'élève :'}</span>
              <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                {playerName || (lang === 'ar' ? 'تلميذ مجد' : 'Élève')}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 block">{lang === 'ar' ? 'المستوى والشعبة:' : 'Niveau & Filière :'}</span>
              <strong className="text-sm font-bold text-indigo-900 block mt-0.5">
                {currentLevel.name[lang]}
              </strong>
              <span className="text-[10px] text-slate-500">{currentStream.name[lang]}</span>
            </div>

            <div>
              <span className="text-slate-500 block">{lang === 'ar' ? 'الرتبة التقديرية:' : 'Rang Pédagogique :'}</span>
              <strong className="text-sm font-bold text-amber-700 block mt-0.5">
                {rank.title[lang]}
              </strong>
              <span className="text-[10px] text-slate-500">{stats.xp} XP</span>
            </div>

            <div>
              <span className="text-slate-500 block">{lang === 'ar' ? 'تاريخ التقييم:' : 'Date d\'évaluation :'}</span>
              <strong className="text-xs font-semibold text-slate-800 block mt-0.5 font-mono">
                {todayDate}
              </strong>
            </div>
          </div>

          {/* Overall Diagnostic Grade */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl shadow-md gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-300 block">
                {lang === 'ar' ? 'المعدل التقديري العام المحصل عليه' : 'Note Diagnostique Globale Attribuée'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mono">
                  {stats.solvedCount > 0 ? review.diagnosticGrade : '14.0'} / 20
                </span>
                <span className="text-xs text-indigo-200">
                  ({appreciation[lang]})
                </span>
              </div>
            </div>

            <div className="text-center sm:text-end bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
              <span className="text-[11px] text-indigo-200 block">{lang === 'ar' ? 'الأسئلة المنجزة' : 'Exercices traités'}</span>
              <strong className="text-lg font-mono font-bold text-white">
                {stats.solvedCount > 0 ? `${stats.correctCount} / ${stats.solvedCount}` : '24 / 30'}
              </strong>
            </div>
          </div>

          {/* Competency Matrix Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {lang === 'ar' ? 'تفصيل التحكم حسب الكفايات المرجعية الأربع:' : 'Détail par Compétence Ministérielle :'}
            </h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-start border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-start">{lang === 'ar' ? 'الكفاية الرياضية المستهدفة' : 'Compétence'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'المعامل الوزاري' : 'Pondération'}</th>
                    <th className="p-3 text-center">{lang === 'ar' ? 'نسبة الإتقان' : 'Maîtrise'}</th>
                    <th className="p-3 text-start">{lang === 'ar' ? 'تقدير المفتش التربوي' : 'Avis de l\'Inspecteur'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(COMPETENCY_INFO).map(([key, info]) => {
                    const compKey = key as keyof typeof stats.competencyScores;
                    const item = stats.competencyScores[compKey];
                    const pct = item && item.total > 0 ? Math.round((item.correct / item.total) * 100) : 75;

                    return (
                      <tr key={key} className="hover:bg-slate-50/80">
                        <td className="p-3 font-semibold text-slate-900">
                          {info.name[lang]}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-700">
                          {info.weight}
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">
                          {pct}%
                        </td>
                        <td className="p-3 text-slate-600">
                          {pct >= 80
                            ? (lang === 'ar' ? 'إتقان تام وتحكم منهجي' : 'Maîtrise confirmée')
                            : pct >= 60
                            ? (lang === 'ar' ? 'مستوى مرضي وقابل للتطوير' : 'Niveau satisfaisant')
                            : (lang === 'ar' ? 'حاجة لتمارين دعم مكثفة' : 'Renforcement conseillé')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formal Stamp and Signatures */}
          <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-slate-900/10 text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-800">{lang === 'ar' ? 'ملاحظة الأستاذ(ة) الممارس:' : 'Visa du Professeur :'}</p>
              <p className="text-slate-600 italic">
                {lang === 'ar'
                  ? 'عمل جاد، يُوصى بالاستمرار في حل التمارين البارامترية ومراجعة معجم المفاهيم أسبوعياً.'
                  : 'Travail régulier. Poursuivre les exercices paramétriques et consolider les démonstrations.'}
              </p>
            </div>

            <div className="text-center sm:text-end space-y-2">
              <div className="inline-block border-2 border-dashed border-indigo-700/60 p-3 rounded-2xl text-center bg-indigo-50/50">
                <ShieldCheck className="w-6 h-6 text-indigo-700 mx-auto mb-1" />
                <span className="block text-[11px] font-bold text-indigo-900">
                  {lang === 'ar' ? 'خاتم التفتيش التربوي التفاعلي' : 'Cachet de l\'Inspection Pédagogique'}
                </span>
                <span className="block text-[9px] font-mono text-indigo-600">
                  MathInspector Morocco · Validé
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
