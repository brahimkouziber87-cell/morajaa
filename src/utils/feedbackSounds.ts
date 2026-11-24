/**
 * Lightweight Gamified Web Audio Sound Library
 * Zero external MP3/WAV dependencies — 100% offline, procedural Web Audio API synthesis.
 * Supports: clicks, task completions, badge unlock fanfares, correct/error cues, and global mute state.
 */

const SOUND_PREF_KEY = 'math_inspector_feedback_sound_enabled_v2';

type SoundStateListener = (enabled: boolean) => void;

class FeedbackSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private listeners: Set<SoundStateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SOUND_PREF_KEY);
        if (saved !== null) {
          this.enabled = JSON.parse(saved) === true;
        }
      } catch {
        this.enabled = true;
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public isMuted(): boolean {
    return !this.enabled;
  }

  public setEnabled(val: boolean): void {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SOUND_PREF_KEY, JSON.stringify(val));
      } catch {
        // ignore storage quota errors
      }
    }
    this.listeners.forEach(fn => fn(this.enabled));
  }

  public setMuted(muted: boolean): void {
    this.setEnabled(!muted);
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playClickSound();
    }
    return this.enabled;
  }

  public subscribe(listener: SoundStateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 1. Tactile UI Click Sound (صوت النقر اللطيف)
   * A short, damped 1200Hz frequency sine impulse.
   */
  public playClickSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore audio policy blocks
    }
  }

  /**
   * 2. Task / Goal Completion Chime (صوت إنجاز المهمة أو التمرين)
   * Harmonic ascending chime: E5 -> A5 -> C#6 with sweet resonance.
   */
  public playTaskCompleteSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [659.25, 880.0, 1108.73]; // E5, A5, C#6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.38);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * 3. Badge Unlock & Triumph Fanfare (صوت التتويج والحصول على وسام)
   * Grand celebratory fanfare arpeggio: C5 -> G5 -> C6 -> E6 -> G6 with shimmer.
   */
  public playBadgeUnlockSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Grand Major Arpeggio: C5, G5, C6, E6, G6
      const fanfare = [
        { f: 523.25, t: 0.00, dur: 0.18 },
        { f: 783.99, t: 0.12, dur: 0.18 },
        { f: 1046.5, t: 0.24, dur: 0.22 },
        { f: 1318.51, t: 0.36, dur: 0.26 },
        { f: 1567.98, t: 0.50, dur: 0.65 }
      ];

      fanfare.forEach(({ f, t, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.001, now + t);
        gain.gain.linearRampToValueAtTime(0.2, now + t + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + dur + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * 4. Correct Answer Sound (Streak support)
   */
  public playCorrectSound(streak: number = 1): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = streak >= 2 ? [523.25, 659.25, 783.99, 1046.5, 1318.51] : [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.075);

        gain.gain.setValueAtTime(0.001, now + idx * 0.075);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.075 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.075 + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.075);
        osc.stop(now + idx * 0.075 + 0.34);
      });
    } catch {
      // Ignore audio blocks
    }
  }

  /**
   * 5. Incorrect Answer Sound
   */
  public playIncorrectSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [329.63, 277.18, 220.0];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);

        gain.gain.setValueAtTime(0.001, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.11, now + idx * 0.11 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.24);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * 6. Pedagogical Hint Revealer
   */
  public playHintSound(): void {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * 7. Mock Exam Submission
   */
  public playExamResultSound(passed: boolean): void {
    if (!this.enabled) return;
    if (passed) {
      this.playBadgeUnlockSound();
    } else {
      this.playIncorrectSound();
    }
  }
}

export const soundFeedback = new FeedbackSoundEngine();
