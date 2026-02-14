import emojiRegex from 'emoji-regex';
import type {
  ParsedChat,
  EmojiAnalysisResult,
  EmojiCount,
  ParticipantEmojiStats,
  MonthlyEmojiCount,
} from '../parser/types';

const HEART_EMOJIS = new Set([
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💗',
  '💖', '💝', '💘', '💕', '💞', '💓', '💟', '❣️', '♥️', '❤',
  '🩷', '🩵', '🩶', '♥',
]);

const _d = new Date();
function monthKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

/**
 * Analyze emoji usage in the chat.
 */
export function analyzeEmojis(chat: ParsedChat): EmojiAnalysisResult {
  const { messages, participants } = chat;
  const regex = emojiRegex();

  // Global emoji counts
  const globalCounts = new Map<string, number>();

  // Per-participant emoji counts
  const participantCounts = new Map<string, Map<string, number>>();
  for (const p of participants) {
    participantCounts.set(p, new Map());
  }

  // Monthly emoji count
  const monthlyMap = new Map<string, number>();

  let totalEmojis = 0;
  let heartEmojiCount = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.isMedia || msg.isCall || msg.isDeleted) continue;

    // Reset regex state and scan
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    let msgEmojiCount = 0;
    const mk = monthKey(msg.timestamp);

    while ((match = regex.exec(msg.message)) !== null) {
      const emoji = match[0];
      msgEmojiCount++;

      // Global
      globalCounts.set(emoji, (globalCounts.get(emoji) || 0) + 1);

      // Per participant
      const pMap = participantCounts.get(msg.sender);
      if (pMap) {
        pMap.set(emoji, (pMap.get(emoji) || 0) + 1);
      }

      // Heart count
      if (HEART_EMOJIS.has(emoji)) {
        heartEmojiCount++;
      }
    }

    if (msgEmojiCount > 0) {
      totalEmojis += msgEmojiCount;
      monthlyMap.set(mk, (monthlyMap.get(mk) || 0) + msgEmojiCount);
    }
  }

  // ---- Build sorted results ----
  const topEmojis: EmojiCount[] = Array.from(globalCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([emoji, count]) => ({ emoji, count }));

  const perParticipant: ParticipantEmojiStats[] = participants.map(name => {
    const pMap = participantCounts.get(name)!;
    let pTotal = 0;
    for (const v of pMap.values()) pTotal += v;
    const pTop: EmojiCount[] = Array.from(pMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji, count]) => ({ emoji, count }));

    return { name, totalEmojis: pTotal, topEmojis: pTop };
  });

  const emojiOverTime: MonthlyEmojiCount[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    totalEmojis,
    topEmojis,
    perParticipant,
    heartEmojiCount,
    emojiOverTime,
  };
}
