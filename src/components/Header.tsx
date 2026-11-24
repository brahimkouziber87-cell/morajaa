import React, { useState } from 'react';
import { LanguageOption } from '../types/curriculum';
import { PomodoroTimer } from './PomodoroTimer';
import { GAME_MODES } from './GameModeHubSelector';

export type AppTab =
  | 'adventure'
  | 'quiz'
  | 'spatial'
  | 'classroom'
  | 'flashcards'
  | 'timed'
  | 'glossary'
  | 'planner'
  | 'pitfalls'
  | 'lab'
  | 'proof'
  | 'boss'
  | 'leaderboard'
  | 'report';

interface HeaderProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  lang: LanguageOption;
  onToggleLang: (lang: LanguageOption) => void;
  xp: number;
  streak: number;
  dailySolvedCount: number;
  dailyGoal: number;
  onCycleDailyGoal?: () => void;
  onPomodoroComplete?: (earnedXp: number) => void;
  onOpenScratchpad?: () => void;
  isReadingMode?: boolean;
  onToggleReadingMode?: () => void;
  isSoundMuted?: boolean;
  onToggleSoundMute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  lang,
  onToggleLang,
  xp,
  streak,
  dailySolvedCount,
  dailyGoal,
  onCycleDailyGoal,
  onPomodoroComplete,
  onOpenScratchpad,
  isReadingMode = false,
  onToggleReadingMode,
  isSoundMuted = false,
  onToggleSoundMute
}) => {
  const [showPomodoroModal, setShowPomodoroModal] = useState<boolean>(false);
  const [showMobileNav, setShowMobileNav] = useState<boolean>(false);

  const safeGoal = Math.max(1, dailyGoal || 5);
  const progressRatio = Math.min(1, dailySolvedCount / safeGoal);
  const isGoalReached = dailySolvedCount >= safeGoal;

  // SVG Circular Progress Ring Geometry (r = 13, circumference ≈ 81.68)
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand wordmark & logo */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center font-math text-lg shadow-md shadow-indigo-600/30">
              ∑
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {lang === 'ar' ? 'MathInspector · رياضيات المغرب' : 'MathInspector · Maths Maroc'}
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-3.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onTabChange('adventure')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'adventure' ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? '🗺️ شجرة المهارات' : '🗺️ Compétences'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('quiz')}
              className={`hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'quiz' ? 'text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'المراجعة' : 'Révision'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('spatial')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'spatial' ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? '🪐 الفضاء 3D' : '🪐 Espace 3D'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('classroom')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'classroom' ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? '👥 تحدي الفصل' : '👥 Classe'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('flashcards')}
              className={`hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'flashcards' ? 'text-purple-400 font-bold border-b-2 border-purple-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'البطاقات' : 'Flashcards'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('timed')}
              className={`hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'timed' ? 'text-rose-400 font-bold border-b-2 border-rose-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'التحدي الزمني' : 'Défi Chrono'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('boss')}
              className={`hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'boss' ? 'text-rose-400 font-bold border-b-2 border-rose-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'معركة الزعيم ⚔️' : 'Boss Fight ⚔️'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('leaderboard')}
              className={`hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'leaderboard' ? 'text-amber-400 font-bold border-b-2 border-amber-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'الصدارة' : 'Classement'}
            </button>
            <button
              type="button"
              onClick={() => onTabChange('report')}
              className={`hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentTab === 'report' ? 'text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1' : 'text-slate-300'
              }`}
            >
              {lang === 'ar' ? 'تقرير المفتش' : 'Bilan'}
            </button>
          </nav>

          {/* Zone 3: Daily Goal Circular Progress Ring + Scratchpad + XP + Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Scratchpad Whiteboard Button */}
            {onOpenScratchpad && (
              <button
                type="button"
                onClick={onOpenScratchpad}
                title={lang === 'ar' ? 'فتح المسودة الرياضية للعمليات والرسوم' : 'Ouvrir le brouillon interactif'}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>✏️</span>
                <span className="hidden md:inline">{lang === 'ar' ? 'المسودة' : 'Brouillon'}</span>
              </button>
            )}

            {/* Interactive Daily Goal Circular Progress Ring */}
            <button
              type="button"
              onClick={onCycleDailyGoal}
              title={
                lang === 'ar'
                  ? `الهدف اليومي: ${dailySolvedCount} من ${safeGoal} تمارين (انقر لتغيير الهدف اليومي 5 / 10 / 15 / 20)`
                  : `Objectif quotidien : ${dailySolvedCount}/${safeGoal} (Cliquez pour changer)`
              }
              className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 transform -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    className="text-slate-800"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className={
                      isGoalReached
                        ? 'text-emerald-400 transition-all duration-500'
                        : 'text-indigo-400 transition-all duration-500'
                    }
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold tabular-nums text-white">
                  {dailySolvedCount}
                </span>
              </div>
              <span className="hidden sm:inline text-[11px] font-mono tabular-nums text-slate-400">
                /{safeGoal}
              </span>
            </button>

            {/* XP Counter Pill */}
            <div
              title={lang === 'ar' ? 'نقاط الخبرة التراكمية (XP)' : 'Points d\'Expérience (XP)'}
              className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-500/30 px-3 py-1 rounded-xl text-xs font-bold font-mono tabular-nums text-amber-300"
            >
              <span>⚡</span>
              <span>{xp} XP</span>
            </div>

            {/* Streak Counter Pill */}
            {streak > 0 && (
              <div
                title={lang === 'ar' ? `سلسلة الإجابات الصحيحة المتتالية: ${streak}` : `Série de victoires : ${streak}`}
                className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-xl text-xs font-bold font-mono tabular-nums text-rose-400"
              >
                <span>🔥</span>
                <span>{streak}</span>
              </div>
            )}

            {/* Reading Mode Calm Cream Toggle */}
            {onToggleReadingMode && (
              <button
                type="button"
                onClick={onToggleReadingMode}
                title={
                  isReadingMode
                    ? (lang === 'ar' ? 'الرجوع إلى وضع اللعبة الداكن' : 'Désactiver le mode lecture')
                    : (lang === 'ar' ? 'تفعيل وضع القراءة الهادئ (لون كريمي مريح للعين أثناء قراءة الدروس)' : 'Activer le mode lecture (teinte crème reposante)')
                }
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isReadingMode
                    ? 'bg-[#EFE6D2] hover:bg-[#E5DBC4] text-[#3D3222] border-[#CFC3A5] shadow-sm'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800 hover:border-amber-500/40 text-amber-200'
                }`}
              >
                <span>📖</span>
                <span className="hidden lg:inline">
                  {lang === 'ar' ? (isReadingMode ? 'وضع القراءة' : 'قراءة هادئة') : (isReadingMode ? 'Lecture' : 'Lecture')}
                </span>
              </button>
            )}

            {/* Sound Effects Mute Toggle Button */}
            {onToggleSoundMute && (
              <button
                type="button"
                onClick={onToggleSoundMute}
                title={
                  isSoundMuted
                    ? (lang === 'ar' ? 'تشغيل المؤثرات الصوتية للألعاب (صوت النقر والإنجاز والأوسمة)' : 'Activer les effets sonores du jeu')
                    : (lang === 'ar' ? 'كتم المؤثرات الصوتية للألعاب' : 'Couper le son du jeu')
                }
                className={`p-1.5 rounded-xl border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                  isSoundMuted
                    ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-500'
                    : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-300'
                }`}
              >
                <span className="text-sm">{isSoundMuted ? '🔇' : '🔊'}</span>
              </button>
            )}

            {/* Pomodoro Focus Button */}
            <button
              type="button"
              onClick={() => setShowPomodoroModal(true)}
              title={lang === 'ar' ? 'مؤقت بومودورو للتركيز الموجه' : 'Chronomètre Pomodoro Focus'}
              className="p-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="text-sm">🍅</span>
            </button>

            {/* Mobile / Tablet Game Modes Button */}
            <button
              type="button"
              onClick={() => setShowMobileNav(true)}
              title={lang === 'ar' ? 'عرض كافة أنماط اللعبة (14)' : 'Tous les modes de jeu (14)'}
              className="xl:hidden px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>🎮</span>
              <span className="hidden sm:inline">{lang === 'ar' ? 'الأنماط (14)' : 'Modes (14)'}</span>
            </button>

            {/* Language Switcher Button */}
            <button
              type="button"
              onClick={() => onToggleLang(lang === 'ar' ? 'biof' : 'ar')}
              title={lang === 'ar' ? 'التبديل إلى الخيار الدولي (الفرنسية)' : 'Basculer vers l\'Arabe'}
              className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'BIOF' : 'عربي'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Game Modes Drawer Modal */}
      {showMobileNav && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <h3 className="text-base font-bold text-white">
                  {lang === 'ar' ? 'بوابات اللعبة وأنماط المراجعة (14)' : 'Toutes les Arènes de Jeu (14)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileNav(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GAME_MODES.map(mode => {
                const isActive = currentTab === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      onTabChange(mode.id);
                      setShowMobileNav(false);
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                      isActive
                        ? `${mode.activeBg} border-transparent`
                        : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{mode.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold truncate">{mode.title[lang]}</p>
                        {mode.badge && (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-white/20 text-white shrink-0">
                            {mode.badge[lang]}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {mode.description[lang]}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Pomodoro Focus Timer Modal */}
      {showPomodoroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPomodoroModal(false)}
              className="absolute top-4 end-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
            <PomodoroTimer
              lang={lang}
              onPomodoroComplete={(earnedXp) => {
                if (onPomodoroComplete) onPomodoroComplete(earnedXp);
              }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
