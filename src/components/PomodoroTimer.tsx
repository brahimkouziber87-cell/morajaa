import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LanguageOption } from '../types/curriculum';

export interface PomodoroTimerProps {
  lang: LanguageOption;
  onPomodoroComplete?: (earnedXp: number) => void;
  /** Optional initial duration in seconds (default 25 * 60 = 1500) */
  defaultMinutes?: number;
}

export type PomodoroMode = 'focus' | 'short_break' | 'long_break' | 'demo';

interface PresetBlock {
  id: PomodoroMode;
  minutes: number;
  seconds: number;
  label: { ar: string; biof: string };
  icon: string;
  badgeColor: string;
}

const PRESET_BLOCKS: PresetBlock[] = [
  {
    id: 'focus',
    minutes: 25,
    seconds: 25 * 60,
    label: { ar: '25 دقيقة (تركيز بومودورو)', biof: '25 min (Focus Pomodoro)' },
    icon: '🍅',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  {
    id: 'short_break',
    minutes: 5,
    seconds: 5 * 60,
    label: { ar: '5 دقائق (استراحة قصيرة)', biof: '5 min (Pause courte)' },
    icon: '☕',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'long_break',
    minutes: 15,
    seconds: 15 * 60,
    label: { ar: '15 دقيقة (استراحة ممتدة)', biof: '15 min (Pause longue)' },
    icon: '🧘',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
  },
  {
    id: 'demo',
    minutes: 0.16,
    seconds: 10,
    label: { ar: '10 ثوانٍ (تجربة سريعة للحركة)', biof: '10 s (Test démo animation)' },
    icon: '⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  }
];

/** Play gentle melodic celebration chime when timer expires */
function playCelebrationChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.14);
      osc.stop(ctx.currentTime + idx * 0.14 + 0.4);
    });
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  lang,
  onPomodoroComplete,
  defaultMinutes = 25
}) => {
  const [initialSeconds, setInitialSeconds] = useState<number>(defaultMinutes * 60);
  const [timeLeft, setTimeLeft] = useState<number>(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentMode, setCurrentMode] = useState<PomodoroMode>('focus');
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  const handleTimerExpired = useCallback(() => {
    // Trigger celebration animation & modal
    playCelebrationChime();
    setShowCelebrationModal(true);

    if (currentMode === 'focus' || currentMode === 'demo') {
      setCompletedSessions(prev => prev + 1);
      if (onPomodoroComplete) {
        onPomodoroComplete(50); // Award +50 XP for completed study block!
      }
    }
  }, [currentMode, onPomodoroComplete]);

  // Handle countdown interval
  useEffect(() => {
    if (!isRunning) return;

    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // Handle timer reaching zero safely outside state updater
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      handleTimerExpired();
    }
  }, [isRunning, timeLeft, handleTimerExpired]);

  const handleStartPause = () => {
    if (timeLeft === 0) {
      setTimeLeft(initialSeconds);
    }
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialSeconds);
  };

  const handleSelectBlock = (block: PresetBlock) => {
    setIsRunning(false);
    setCurrentMode(block.id);
    setInitialSeconds(block.seconds);
    setTimeLeft(block.seconds);
  };

  const handleStartBreakAfterExpiry = () => {
    setShowCelebrationModal(false);
    const shortBreak = PRESET_BLOCKS.find(b => b.id === 'short_break')!;
    handleSelectBlock(shortBreak);
    setIsRunning(true);
  };

  const handleStartNewFocusBlock = () => {
    setShowCelebrationModal(false);
    const focusBlock = PRESET_BLOCKS.find(b => b.id === 'focus')!;
    handleSelectBlock(focusBlock);
    setIsRunning(true);
  };

  // Format time MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate circular progress ratio (0 to 1)
  const progressRatio = initialSeconds > 0 ? (initialSeconds - timeLeft) / initialSeconds : 0;
  const radius = 11;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Header Compact Trigger Button */}
      <button
        type="button"
        onClick={() => setIsPopoverOpen(prev => !prev)}
        title={
          lang === 'ar'
            ? `مؤقت بومودورو للتركيز: ${formattedTime} (انقر لضبط كتلة 25 دقيقة)`
            : `Minuteur Pomodoro : ${formattedTime} (Cliquer pour régler le bloc de 25 min)`
        }
        aria-label={lang === 'ar' ? `مؤقت التركيز بومودورو ${formattedTime}` : `Minuteur Pomodoro ${formattedTime}`}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
          isRunning
            ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 animate-pomodoro-pulse shadow-md shadow-rose-900/30'
            : timeLeft === 0
            ? 'bg-amber-950/60 border-amber-500/80 text-amber-200'
            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
        }`}
      >
        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
          <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-slate-800"
            />
            <circle
              cx="14"
              cy="14"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-300 ${
                isRunning ? 'text-rose-400' : currentMode === 'short_break' ? 'text-emerald-400' : 'text-indigo-400'
              }`}
            />
          </svg>
          <span className="absolute text-xs" role="img" aria-hidden="true">
            {currentMode === 'short_break' ? '☕' : currentMode === 'long_break' ? '🧘' : '🍅'}
          </span>
        </div>

        <div className="text-start leading-tight">
          <span className="block text-[11px] font-mono font-extrabold tabular-nums tracking-wider text-white">
            {formattedTime}
          </span>
          <span className="block text-[9px] text-slate-400 whitespace-nowrap">
            {isRunning
              ? lang === 'ar'
                ? 'جلسة نشطة...'
                : 'En cours...'
              : lang === 'ar'
              ? 'بومودورو 25د'
              : 'Pomodoro 25m'}
          </span>
        </div>
      </button>

      {/* Popover Card for Full Controls */}
      {isPopoverOpen && (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="absolute end-0 mt-2 w-80 sm:w-88 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-5 shadow-2xl z-50 animate-celebrate-pop space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍅</span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lang === 'ar' ? 'مؤقت بومودورو للتركيز الدراسي' : 'Minuteur de Focus Pomodoro'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {lang === 'ar' ? 'منهجية الكتل الزمنية لترسيخ الرياضيات' : 'Méthode des blocs de révision ciblés'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Large Countdown Display with Glowing Animation */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`text-4xl font-mono font-black tabular-nums tracking-widest ${
                  isRunning
                    ? 'text-rose-400 animate-pomodoro-glow'
                    : timeLeft === 0
                    ? 'text-amber-400'
                    : 'text-white'
                }`}
              >
                {formattedTime}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              {currentMode === 'focus'
                ? lang === 'ar'
                  ? '🎯 كتلة تركيز دراسي مكثفة (25 دقيقة)'
                  : '🎯 Bloc de concentration intensive (25 min)'
                : currentMode === 'short_break'
                ? lang === 'ar'
                  ? '☕ استراحة قصيرة لتثبيت الذاكرة (5 دقائق)'
                  : '☕ Pause courte de consolidation (5 min)'
                : currentMode === 'long_break'
                ? lang === 'ar'
                  ? '🧘 استراحة ممتدة بعد 4 جلسات (15 دقيقة)'
                  : '🧘 Pause longue récupératrice (15 min)'
                : lang === 'ar'
                ? '⚡ كتلة اختبار سريعة (10 ثوانٍ)'
                : '⚡ Test rapide démo (10 secondes)'}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isRunning ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.round(progressRatio * 100)}%` }}
              />
            </div>
          </div>

          {/* Block Selection Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">
              {lang === 'ar' ? 'اختر كتلة المراجعة:' : 'Choisir le bloc d\'étude :'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BLOCKS.map(block => (
                <button
                  key={block.id}
                  type="button"
                  onClick={() => handleSelectBlock(block)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border text-start transition-all cursor-pointer flex items-center gap-2 ${
                    currentMode === block.id
                      ? `${block.badgeColor} ring-1 ring-inset`
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base shrink-0">{block.icon}</span>
                  <span className="truncate">{block.label[lang]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Play/Pause, Reset, Demo trigger */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleStartPause}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
              }`}
            >
              <span>{isRunning ? '⏸️' : '▶️'}</span>
              <span>
                {isRunning
                  ? lang === 'ar'
                    ? 'إيقاف مؤقت'
                    : 'Pause'
                  : timeLeft < initialSeconds && timeLeft > 0
                  ? lang === 'ar'
                    ? 'استئناف التركيز'
                    : 'Reprendre'
                  : lang === 'ar'
                  ? 'بدء كتلة التركيز (25 د)'
                  : 'Démarrer le bloc (25m)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              title={lang === 'ar' ? 'إعادة ضبط الوقت' : 'Réinitialiser'}
              className="py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              🔄
            </button>
          </div>

          {/* Completed sessions counter and inspector advice */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400">
            <span>
              {lang === 'ar' ? 'الجلسات المكتملة اليوم:' : 'Sessions complétées :'}
            </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {completedSessions} 🍅 (+{completedSessions * 50} XP)
            </span>
          </div>
        </div>
      )}

      {/* Celebration Modal Triggered on Timer Expiry */}
      {showCelebrationModal && (
        <div
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
        >
          {/* Confetti Particle Burst Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {Array.from({ length: 30 }).map((_, i) => {
              const colors = ['bg-rose-500', 'bg-amber-400', 'bg-emerald-400', 'bg-indigo-400', 'bg-cyan-400', 'bg-fuchsia-400'];
              const color = colors[i % colors.length];
              const left = `${(i * 3.3) + 2}%`;
              const delay = `${(i % 5) * 0.25}s`;
              return (
                <div
                  key={i}
                  className={`absolute top-0 w-3 h-3 rounded-sm ${color} animate-confetti-drift opacity-90`}
                  style={{
                    left,
                    animationDelay: delay,
                    transform: `rotate(${i * 24}deg)`
                  }}
                />
              );
            })}
          </div>

          {/* Celebration Card Dialog */}
          <div className="relative max-w-md w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-celebrate-pop">
            {/* Animated glowing icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
              <div className="absolute -inset-2 rounded-full border-2 border-rose-400/50 animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 text-white text-4xl flex items-center justify-center shadow-lg shadow-rose-600/40">
                🍅
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-rose-500/20 border border-rose-400 text-rose-300">
                ✨ {lang === 'ar' ? 'اكتمال كتلة التركيز الدراسي' : 'Bloc de Révision Terminé'} ✨
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {lang === 'ar'
                  ? '🎉 رائع! انتهت جلسة التركيز بومودورو بنجاح!'
                  : '🎉 Bravo ! Session Pomodoro complétée avec succès !'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                {lang === 'ar'
                  ? 'أحسنت العمل! لقد أنجزت كتلة دراسية بتركيز كامل، مما يعزز الاستيعاب الرياضي والذاكرة طويلة المدى. تم منحك +50 XP تركيز.'
                  : 'Félicitations pour votre concentration soutenue ! Vous avez consolidé votre mémorisation mathématique. +50 XP accordés.'}
              </p>
            </div>

            {/* Reward & Break Recommendation Strip */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="text-start">
                <span className="text-[10px] text-slate-400 block">
                  {lang === 'ar' ? 'المكافأة التربوية:' : 'Récompense :'}
                </span>
                <span className="font-extrabold text-amber-300 font-mono text-sm">
                  ⚡ +50 XP Focus
                </span>
              </div>
              <div className="text-end">
                <span className="text-[10px] text-slate-400 block">
                  {lang === 'ar' ? 'توجيه المفتش:' : 'Conseil :'}
                </span>
                <span className="font-semibold text-emerald-300">
                  {lang === 'ar' ? 'استراحة 5 دقائق لتثبيت الأثر' : 'Pause de 5 min conseillée'}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleStartBreakAfterExpiry}
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>☕</span>
                <span>
                  {lang === 'ar' ? 'بدء استراحة قصيرة (5 دقائق)' : 'Démarrer une pause courte (5 min)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleStartNewFocusBlock}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>🍅</span>
                <span>
                  {lang === 'ar' ? 'بدء كتلة تركيز جديدة (25 دقيقة)' : 'Nouveau bloc de 25 min'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowCelebrationModal(false)}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق ومتابعة حل التمارين' : 'Fermer et continuer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
