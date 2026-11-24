import React from 'react';
import { StudentBadge } from '../game/engine';
import { LanguageOption } from '../constants/dataStructure';

interface BadgeUnlockCelebrationProps {
  badge: StudentBadge | null;
  lang: LanguageOption;
  onClose: () => void;
  onShare: () => void;
}

export const BadgeUnlockCelebration: React.FC<BadgeUnlockCelebrationProps> = ({
  badge,
  lang,
  onClose,
  onShare
}) => {
  if (!badge) return null;
  const isAr = lang === 'ar';

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-celebrate-pop"
    >
      {/* Visual floating confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <span className="absolute top-[18%] left-[22%] text-2xl animate-bounce">✨</span>
        <span className="absolute top-[28%] right-[24%] text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🌟</span>
        <span className="absolute bottom-[25%] left-[20%] text-2xl animate-pulse">🎉</span>
        <span className="absolute bottom-[22%] right-[22%] text-3xl animate-pulse" style={{ animationDelay: '0.4s' }}>⭐</span>
        <span className="absolute top-[15%] right-[35%] text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>💫</span>
      </div>

      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-badge-glow">
        {/* Animated Badge Icon with Golden Halo */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-amber-500/30 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-300 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg animate-badge-sparkle">
            {badge.icon}
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
            {isAr ? '🎉 مبروك! وسام إنجاز جديد' : '🎉 Félicitations ! Nouveau Badge'}
          </span>
          <h3 className="text-2xl font-black text-white">
            {badge.title[lang]}
          </h3>
          <p className="text-xs font-medium text-amber-300/80">
            {badge.title[isAr ? 'biof' : 'ar']}
          </p>
          <p className="text-sm text-slate-300 leading-relaxed pt-2">
            {badge.description[lang]}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={onShare}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📤</span>
            <span>{isAr ? 'مشاركة بطاقة الإنجاز كصورة' : 'Partager la Carte en Image'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            {isAr ? 'مواصلة المراجعة والتحديات ←' : 'Continuer les révisions →'}
          </button>
        </div>
      </div>
    </div>
  );
};
