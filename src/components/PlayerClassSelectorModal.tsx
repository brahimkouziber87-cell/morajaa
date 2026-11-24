import React from 'react';
import { LanguageOption, PlayerClassId } from '../types/curriculum';
import { PLAYER_CLASSES } from '../data/rpgClassesAndSkills';
import { Sparkles, CheckCircle2, Shield, X } from 'lucide-react';

interface PlayerClassSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentClass?: PlayerClassId;
  onSelectClass: (classId: PlayerClassId) => void;
  lang: LanguageOption;
  dualLang: boolean;
}

export const PlayerClassSelectorModal: React.FC<PlayerClassSelectorModalProps> = ({
  isOpen,
  onClose,
  currentClass = 'algebraist',
  onSelectClass,
  lang,
  dualLang
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="class-selector-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'تخصيص الهوية الرياضية (RPG Classes)' : 'Classes Mathématiques RPG'}</span>
              </span>
            </div>
            <h2 id="class-selector-title" className="text-xl md:text-2xl font-extrabold text-white">
              {lang === 'ar' ? 'اختر فئة تخصصك الرياضي المفضل' : 'Choisissez votre Spécialisation Mathématique'}
            </h2>
            <p className="text-xs text-slate-300">
              {lang === 'ar'
                ? 'تمنحك كل فئة مضاعف خبرة +20% XP في مجالها الرياضي وميزة تكتيكية خاصة أثناء التمارين والتحديات.'
                : 'Chaque classe vous confère un bonus de +20% XP dans son domaine et des atouts didactiques exclusifs.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Player Classes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PLAYER_CLASSES.map(cls => {
            const isSelected = currentClass === cls.id;
            return (
              <div
                key={cls.id}
                onClick={() => onSelectClass(cls.id)}
                className={`group relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-950 border-amber-400 shadow-xl shadow-amber-500/10 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-950'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                      {cls.icon}
                    </span>
                    {isSelected ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'الفئة الحالية' : 'Active'}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition-colors">
                        {lang === 'ar' ? 'تفعيل ←' : 'Sélectionner'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                      {cls.name[lang]}
                    </h3>
                    {dualLang && (
                      <p className="text-xs text-slate-400" dir={lang === 'ar' ? 'ltr' : 'rtl'}>
                        {cls.name[lang === 'ar' ? 'biof' : 'ar']}
                      </p>
                    )}
                    <p className="text-[11px] font-semibold text-indigo-400 mt-0.5">
                      {cls.title[lang]}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'الميزة التكتيكية:' : 'Atout didactique :'}</span>
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {cls.perk[lang]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-lg"
          >
            {lang === 'ar' ? 'حفظ وتأكيد التخصص ✓' : 'Confirmer la spécialisation ✓'}
          </button>
        </div>
      </div>
    </div>
  );
};
