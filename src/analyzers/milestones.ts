import type { ParsedChat, MilestonesResult, Milestone } from '../parser/types';

const _d = new Date();
function dateToKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  const d = _d.getDate();
  return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours % 24} hour${(hours % 24) !== 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes % 60} minute${(minutes % 60) !== 1 ? 's' : ''}`;
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Find notable milestones in the chat history.
 */
export function analyzeMilestones(chat: ParsedChat): MilestonesResult {
  const { messages } = chat;

  if (messages.length === 0) {
    return {
      firstMessage: null,
      messageMilestones: [],
      longestMessage: null,
      longestGap: null,
      mostMessagesInADay: null,
      anniversaries: [],
    };
  }

  const firstMessage = messages[0];

  // ---- Message count milestones ----
  const milestoneNumbers = [100, 1000, 5000, 10000, 25000, 50000, 100000, 500000];
  const messageMilestones: Milestone[] = [];
  for (const num of milestoneNumbers) {
    if (messages.length >= num) {
      const msg = messages[num - 1];
      messageMilestones.push({
        label: `${num.toLocaleString()}th message`,
        message: msg,
        date: msg.timestamp,
        value: msg.message.substring(0, 100),
      });
    }
  }

  // ---- Longest message ----
  let longestMessage = messages[0];
  for (let i = 1; i < messages.length; i++) {
    if (!messages[i].isMedia && !messages[i].isCall && !messages[i].isDeleted && messages[i].message.length > longestMessage.message.length) {
      longestMessage = messages[i];
    }
  }

  // ---- Longest gap ----
  let longestGapStart = messages[0].timestamp;
  let longestGapEnd = messages[0].timestamp;
  let longestGapMs = 0;

  for (let i = 1; i < messages.length; i++) {
    const gap = messages[i].timestamp - messages[i - 1].timestamp;
    if (gap > longestGapMs) {
      longestGapMs = gap;
      longestGapStart = messages[i - 1].timestamp;
      longestGapEnd = messages[i].timestamp;
    }
  }

  // ---- Most messages in a single day ----
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < messages.length; i++) {
    const dKey = dateToKey(messages[i].timestamp);
    dailyMap.set(dKey, (dailyMap.get(dKey) || 0) + 1);
  }

  let mostMessagesDate = '';
  let mostMessagesCount = 0;
  for (const [date, count] of dailyMap.entries()) {
    if (count > mostMessagesCount) {
      mostMessagesCount = count;
      mostMessagesDate = date;
    }
  }

  // ---- Anniversaries ----
  const startDate = new Date(firstMessage.timestamp);
  const endDate = new Date(chat.endDate);
  const anniversaryIntervals = [
    { months: 1, label: '1 month' },
    { months: 3, label: '3 months' },
    { months: 6, label: '6 months' },
    { months: 12, label: '1 year' },
    { months: 18, label: '1.5 years' },
    { months: 24, label: '2 years' },
    { months: 36, label: '3 years' },
    { months: 48, label: '4 years' },
    { months: 60, label: '5 years' },
  ];

  const anniversaries: { label: string; date: number }[] = [];
  for (const { months, label } of anniversaryIntervals) {
    const annivDate = new Date(startDate);
    annivDate.setMonth(annivDate.getMonth() + months);
    if (annivDate <= endDate) {
      anniversaries.push({ label, date: annivDate.getTime() });
    }
  }

  return {
    firstMessage,
    messageMilestones,
    longestMessage,
    longestGap: longestGapMs > 0
      ? { startDate: longestGapStart, endDate: longestGapEnd, durationMs: longestGapMs }
      : null,
    mostMessagesInADay: mostMessagesDate ? { date: mostMessagesDate, count: mostMessagesCount } : null,
    anniversaries,
  };
}
