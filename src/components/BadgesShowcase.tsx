import React, { useMemo } from 'react';
import { UserStats, LanguageOption } from '../constants/dataStructure';
import { evaluateStudentBadges } from '../game/engine';

interface BadgesShowcaseProps {
  stats: UserStats;
  lang: LanguageOption;
}

export const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({ stats, lang }) => {
  const [filter, setFilter] = React.useState<'all' | 'unlocked' | 'locked'>('all');
  const badges = useMemo(() => evaluateStudentBadges(stats), [stats]);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  const filteredBadges = useMemo(() => {
    if (filter === 'unlocked') return badges.filter(b => b.unlocked);
    if (filter === 'locked') return badges.filter(b => !b.unlocked);
    return badges;
  }, [badges, filter]);

  return (
    <section
      aria-label={lang === 'ar' ? 'نظام الأوسمة والإنجازات التربوية' : 'Système des Badges et Accomplissements'}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <p className="text-xs font-semibold text-amber-400">
            {lang === 'ar'
              ? 'خزانة الأوسمة التربوية · تتويج الكفايات والمثابرة'
              : 'Vitrine des Badges Pédagogiques · Récompenses de Maîtrise'}
          </p>
          <h3 className="text-xl font-bold text-white mt-0.5">
            {lang === 'ar'
              ? 'نظام أوسمة الإنجاز (Badges System)'
              : 'Système des Badges d\'Accomplissement'}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? `الكل (${badges.length})` : `Tous (${badges.length})`}
            </button>
            <button
              type="button"
              onClick={() => setFilter('unlocked')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'unlocked' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? `المحققة (${unlockedCount})` : `Débloqués (${unlockedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setFilter('locked')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                filter === 'locked' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'ar' ? `قيد الإنجاز (${badges.length - unlockedCount})` : `En cours (${badges.length - unlockedCount})`}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span>{lang === 'ar' ? 'النقاط:' : 'Score :'} <strong className="text-emerald-400">{stats.score} pts</strong></span>
            <span>·</span>
            <span>{lang === 'ar' ? 'الأوسمة:' : 'Badges :'} <strong className="text-amber-400">{unlockedCount}/{badges.length}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBadges.map(badge => {
          return (
            <div
              key={badge.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                badge.unlocked
                  ? 'bg-amber-950/25 border-amber-500/80 shadow-lg shadow-amber-500/10 animate-badge-glow'
                  : 'bg-slate-950/70 border-slate-800/80 opacity-85'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold font-math shrink-0 border ${
                        badge.unlocked
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-badge-sparkle shadow-md shadow-amber-400/20'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {badge.icon}
                    </span>
                    <div>
                      <h4 className={`text-sm font-bold ${badge.unlocked ? 'text-white' : 'text-slate-300'}`}>
                        {badge.title[lang]}
                      </h4>
                      <span className="text-[11px] text-slate-400 block">
                        {badge.title[lang === 'ar' ? 'biof' : 'ar']}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-bold shrink-0 ${
                      badge.unlocked ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {badge.unlocked
                      ? (lang === 'ar' ? '✓ مُحقق' : '✓ Débloqué')
                      : (lang === 'ar' ? '🔒 قيد الإنجاز' : '🔒 Verrouillé')}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {badge.description[lang]}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/70 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{badge.requirementText[lang]}</span>
                  <span className="font-mono tabular-nums text-amber-300 font-semibold">
                    {badge.progressPct}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      badge.unlocked ? 'bg-amber-400' : 'bg-indigo-500/70'
                    }`}
                    style={{ width: `${badge.progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
