import type { ParsedChat, MediaStatsResult } from '../parser/types';

const _d = new Date();
function monthKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

/**
 * Analyze media sharing patterns in the chat.
 */
export function analyzeMedia(chat: ParsedChat): MediaStatsResult {
  const { messages, participants } = chat;

  let totalMedia = 0;
  const mediaPerParticipant: Record<string, number> = {};
  for (const p of participants) mediaPerParticipant[p] = 0;

  const monthlyMap = new Map<string, number>();

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg.isMedia) continue;

    totalMedia++;
    if (mediaPerParticipant[msg.sender] !== undefined) {
      mediaPerParticipant[msg.sender]++;
    }

    const mk = monthKey(msg.timestamp);
    monthlyMap.set(mk, (monthlyMap.get(mk) || 0) + 1);
  }

  const mediaOverTime = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return { totalMedia, mediaPerParticipant, mediaOverTime };
}
