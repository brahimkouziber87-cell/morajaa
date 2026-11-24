import { LevelId, MathDomain, StreamId } from '../types/curriculum';
import { CumulativeLeaderboardEntry } from './engine';

export interface DuelPlayerResult {
  playerName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeSeconds: number;
  /** Array of booleans indicating whether each question in questionIds was answered correctly */
  questionOutcomes: boolean[];
}

export interface DuelChallengePayload {
  duelId: string;
  levelId: LevelId;
  streamId: StreamId;
  domain: MathDomain | 'all';
  questionIds: string[];
  creatorName: string;
  createdAtISO: string;
  creatorResult?: DuelPlayerResult;
  challengerResult?: DuelPlayerResult;
}

export const CUMULATIVE_LEADERBOARD_STORAGE_KEY = 'math_inspector_cumulative_leaderboard_v1';
export const DUEL_HISTORY_STORAGE_KEY = 'math_inspector_duel_history_v1';

/** Encode DuelChallengePayload into a compact URL-safe Base64 string */
export function encodeDuelPayload(payload: DuelChallengePayload): string {
  try {
    const json = JSON.stringify(payload);
    const encodedUri = encodeURIComponent(json);
    if (typeof btoa === 'function') {
      return btoa(encodedUri);
    }
    return Buffer.from(encodedUri, 'utf-8').toString('base64');
  } catch {
    return '';
  }
}

/** Decode a URL-safe Base64 string or full URL containing ?duel=... into DuelChallengePayload */
export function decodeDuelPayload(input: string): DuelChallengePayload | null {
  try {
    let rawToken = input.trim();
    if (!rawToken) return null;

    if (rawToken.includes('duel=')) {
      const urlObj = new URL(rawToken.startsWith('http') ? rawToken : `https://example.com/${rawToken}`);
      rawToken = urlObj.searchParams.get('duel') || '';
    }

    if (!rawToken) return null;
    const base64Decoded =
      typeof atob === 'function'
        ? atob(rawToken)
        : Buffer.from(rawToken, 'base64').toString('utf-8');
    const json = decodeURIComponent(base64Decoded);
    const parsed = JSON.parse(json) as DuelChallengePayload;
    if (!parsed || !Array.isArray(parsed.questionIds) || parsed.questionIds.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Build a full shareable URL containing the encoded Friendly Duel payload */
export function buildShareableDuelUrl(payload: DuelChallengePayload, originUrl?: string): string {
  const token = encodeDuelPayload(payload);
  if (!token) return '';
  if (originUrl) {
    const cleanBase = originUrl.split('?')[0];
    return `${cleanBase}?duel=${encodeURIComponent(token)}`;
  }
  if (typeof window !== 'undefined') {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?duel=${encodeURIComponent(token)}`;
  }
  return `?duel=${encodeURIComponent(token)}`;
}

export interface DuelLeaderboardParticipantUpdate {
  playerName: string;
  levelId: LevelId;
  streamId: StreamId;
  score: number;
  xpEarned: number;
  correctCount: number;
  totalQuestions: number;
  dateISO?: string;
}

/**
 * Pure helper that inserts or updates a Friendly Duel participant on the cumulative leaderboard.
 */
export function upsertDuelParticipantInLeaderboard(
  entries: CumulativeLeaderboardEntry[],
  participant: DuelLeaderboardParticipantUpdate
): CumulativeLeaderboardEntry[] {
  const normalizedName = participant.playerName.trim();
  if (!normalizedName) return entries;

  const targetLower = normalizedName.toLowerCase();
  const todayStr = participant.dateISO || new Date().toISOString().slice(0, 10);
  const existingIdx = entries.findIndex(
    e => e.studentName.trim().toLowerCase() === targetLower
  );

  if (existingIdx >= 0) {
    const existing = entries[existingIdx];
    const hasDuelBadge = existing.unlockedBadgeTitles.some(
      t => t.includes('مبارز') || t.toLowerCase().includes('duel')
    );
    const nextBadgeTitles = hasDuelBadge
      ? existing.unlockedBadgeTitles
      : [...existing.unlockedBadgeTitles, 'مبارز ودي'];

    const updatedEntry: CumulativeLeaderboardEntry = {
      ...existing,
      cumulativeScore: existing.cumulativeScore + participant.score,
      xp: existing.xp + participant.xpEarned,
      solvedCount: existing.solvedCount + participant.totalQuestions,
      correctCount: existing.correctCount + participant.correctCount,
      badgesCount: Math.max(existing.badgesCount, nextBadgeTitles.length),
      unlockedBadgeTitles: nextBadgeTitles,
      dateISO: todayStr
    };

    const nextList = [...entries];
    nextList[existingIdx] = updatedEntry;
    return nextList;
  }

  const slug = normalizedName
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/gi, '-')
    .replace(/^-|-$/g, '') || 'peer';

  const accuracyRatio =
    participant.totalQuestions > 0
      ? participant.correctCount / participant.totalQuestions
      : 0;

  const badgeTitles = ['مبارز ودي'];
  if (accuracyRatio >= 0.8) {
    badgeTitles.push('دقة المبارزة');
  }

  const newEntry: CumulativeLeaderboardEntry = {
    id: `duel-peer-${slug}-${Date.now().toString(36)}`,
    studentName: normalizedName,
    levelId: participant.levelId,
    streamId: participant.streamId,
    cumulativeScore: participant.score,
    xp: participant.xpEarned,
    solvedCount: participant.totalQuestions,
    correctCount: participant.correctCount,
    badgesCount: badgeTitles.length,
    unlockedBadgeTitles: badgeTitles,
    rankBadge: accuracyRatio >= 0.8 ? '⚔️' : '📘',
    rankTitle:
      accuracyRatio >= 0.8
        ? { ar: 'فارس المبارزة الودية', biof: 'Chevalier du Duel Amical' }
        : { ar: 'منافس صاعد', biof: 'Challenger Émergent' },
    dateISO: todayStr
  };

  return [newEntry, ...entries];
}
