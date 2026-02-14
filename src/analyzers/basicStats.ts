import type { ParsedChat, BasicStatsResult, ParticipantStats, CallStats } from '../parser/types';

/**
 * Fast inline word counter — avoids split().filter().length allocations.
 */
function countWords(text: string): number {
  let count = 0;
  let inWord = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    // Space=32, Tab=9, Newline=10, CR=13
    const isSpace = ch === 32 || ch === 9 || ch === 10 || ch === 13;
    if (isSpace) {
      inWord = false;
    } else if (!inWord) {
      inWord = true;
      count++;
    }
  }
  return count;
}

/** "YYYY-MM-DD" from epoch ms without Date object overhead (uses cached Date) */
const _d = new Date();
function epochToDayKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  const d = _d.getDate();
  return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

function epochGetHour(epoch: number): number {
  _d.setTime(epoch);
  return _d.getHours();
}

/**
 * Computes basic statistics + call stats from a parsed WhatsApp chat.
 */
export function analyzeBasicStats(chat: ParsedChat): BasicStatsResult {
  const { messages, participants } = chat;

  // ---- Per-participant accumulators ----
  const pIdx = new Map<string, number>(); // name → index for fast lookup
  const msgCount = new Int32Array(participants.length);
  const wordCount = new Int32Array(participants.length);
  const charCount = new Int32Array(participants.length);
  const longestLen = new Int32Array(participants.length);
  const longestMsg: string[] = new Array(participants.length).fill('');
  const initCount = new Int32Array(participants.length);
  const morningFirst = new Int32Array(participants.length); // who texts first each morning

  for (let i = 0; i < participants.length; i++) {
    pIdx.set(participants[i], i);
  }

  const CONVERSATION_GAP_MS = 4 * 60 * 60 * 1000; // 4 hours

  // Response times: arrays per participant
  const responseTimes: number[][] = participants.map(() => []);
  const fastestResponse = new Float64Array(participants.length).fill(Infinity);

  // Active days tracking
  const activeDaysSet = new Set<string>();

  // Morning tracking: first text per day
  const morningTrackedDays = new Set<string>();

  // Call stats
  let totalCalls = 0;
  let totalCallDurationSeconds = 0;
  let longestCallSeconds = 0;
  let longestCallDate: number | null = null;
  const callsPerParticipant: Record<string, number> = {};
  const callDurPerParticipant: Record<string, number> = {};
  for (const p of participants) {
    callsPerParticipant[p] = 0;
    callDurPerParticipant[p] = 0;
  }

  let totalWords = 0;
  let totalChars = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const pi = pIdx.get(msg.sender);
    if (pi === undefined) continue;

    // ---- Call stats ----
    if (msg.isCall) {
      totalCalls++;
      totalCallDurationSeconds += msg.callDurationSeconds;
      callsPerParticipant[msg.sender] = (callsPerParticipant[msg.sender] || 0) + 1;
      callDurPerParticipant[msg.sender] = (callDurPerParticipant[msg.sender] || 0) + msg.callDurationSeconds;
      if (msg.callDurationSeconds > longestCallSeconds) {
        longestCallSeconds = msg.callDurationSeconds;
        longestCallDate = msg.timestamp;
      }
      continue; // don't count calls in message stats
    }

    // Skip deleted messages from content stats (but they pass through isSystemMessage=false)
    if (msg.isDeleted) continue;

    if (msg.isMedia) {
      // Still count media as a message for the participant
      msgCount[pi]++;

      // Track active days + morning first for media too
      const dayKey = epochToDayKey(msg.timestamp);
      activeDaysSet.add(dayKey);
      if (!morningTrackedDays.has(dayKey)) {
        const hour = epochGetHour(msg.timestamp);
        if (hour >= 5 && hour <= 12) {
          morningTrackedDays.add(dayKey);
          morningFirst[pi]++;
        }
      }
      continue;
    }

    const words = countWords(msg.message);
    const chars = msg.message.length;

    msgCount[pi]++;
    wordCount[pi] += words;
    charCount[pi] += chars;
    totalWords += words;
    totalChars += chars;

    if (chars > longestLen[pi]) {
      longestLen[pi] = chars;
      longestMsg[pi] = msg.message;
    }

    // Active day
    const dayKey = epochToDayKey(msg.timestamp);
    activeDaysSet.add(dayKey);

    // Morning first text
    if (!morningTrackedDays.has(dayKey)) {
      const hour = epochGetHour(msg.timestamp);
      if (hour >= 5 && hour <= 12) {
        morningTrackedDays.add(dayKey);
        morningFirst[pi]++;
      }
    }

    // Conversation initiation
    if (i === 0) {
      initCount[pi]++;
    } else {
      const gap = msg.timestamp - messages[i - 1].timestamp;
      if (gap >= CONVERSATION_GAP_MS) {
        initCount[pi]++;
      }
    }

    // Response time (different sender)
    if (i > 0 && messages[i - 1].sender !== msg.sender) {
      const rt = msg.timestamp - messages[i - 1].timestamp;
      if (rt > 0 && rt < 86400000) { // < 24h
        responseTimes[pi].push(rt);
        if (rt < fastestResponse[pi]) {
          fastestResponse[pi] = rt;
        }
      }
    }
  }

  // ---- Build participant stats ----
  const participantStats: ParticipantStats[] = participants.map((name, i) => ({
    name,
    messageCount: msgCount[i],
    totalWords: wordCount[i],
    totalChars: charCount[i],
    avgMessageLength: msgCount[i] > 0 ? Math.round(charCount[i] / msgCount[i]) : 0,
    avgWordsPerMessage: msgCount[i] > 0 ? Math.round((wordCount[i] / msgCount[i]) * 10) / 10 : 0,
    longestMessage: longestMsg[i],
    longestMessageLength: longestLen[i],
    initiatedConversations: initCount[i],
  }));

  // ---- Average + fastest response times ----
  const averageResponseTimeMs: Record<string, number> = {};
  const fastestResponseTimeMs: Record<string, number> = {};
  for (let i = 0; i < participants.length; i++) {
    const times = responseTimes[i];
    if (times.length > 0) {
      let sum = 0;
      for (let j = 0; j < times.length; j++) sum += times[j];
      averageResponseTimeMs[participants[i]] = Math.round(sum / times.length);
      fastestResponseTimeMs[participants[i]] = Math.round(fastestResponse[i]);
    } else {
      averageResponseTimeMs[participants[i]] = 0;
      fastestResponseTimeMs[participants[i]] = 0;
    }
  }

  // ---- Who texts first in morning ----
  const whoTextsFirstInMorning: Record<string, number> = {};
  for (let i = 0; i < participants.length; i++) {
    whoTextsFirstInMorning[participants[i]] = morningFirst[i];
  }

  // ---- Total days & messages per day ----
  const totalDaysSpan = messages.length > 0
    ? Math.max(1, Math.ceil((messages[messages.length - 1].timestamp - messages[0].timestamp) / 86400000))
    : 1;
  const messagesPerDay = Math.round((messages.length / totalDaysSpan) * 10) / 10;

  // ---- Longest streak ----
  const sortedDays = Array.from(activeDaysSet).sort();
  let longestStreak = 0;
  let longestStreakStartStr = '';
  let longestStreakEndStr = '';
  let currentStreak = 1;
  let currentStreakStart = sortedDays[0] || '';

  for (let i = 1; i < sortedDays.length; i++) {
    // Fast day diff: parse YYYY-MM-DD to epoch, diff
    const prev = new Date(sortedDays[i - 1]).getTime();
    const curr = new Date(sortedDays[i]).getTime();
    const diffDays = Math.round((curr - prev) / 86400000);

    if (diffDays === 1) {
      currentStreak++;
    } else {
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        longestStreakStartStr = currentStreakStart;
        longestStreakEndStr = sortedDays[i - 1];
      }
      currentStreak = 1;
      currentStreakStart = sortedDays[i];
    }
  }
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    longestStreakStartStr = currentStreakStart;
    longestStreakEndStr = sortedDays[sortedDays.length - 1] || '';
  }

  const callStatsResult: CallStats = {
    totalCalls,
    totalCallDurationSeconds,
    callsPerParticipant,
    callDurationPerParticipant: callDurPerParticipant,
    longestCallSeconds,
    longestCallDate,
  };

  return {
    participants: participantStats,
    totalMessages: messages.length,
    totalWords,
    totalChars,
    messagesPerDay,
    averageResponseTimeMs,
    fastestResponseTimeMs,
    whoTextsFirstInMorning,
    longestStreak,
    longestStreakStart: longestStreakStartStr || null,
    longestStreakEnd: longestStreakEndStr || null,
    totalDays: totalDaysSpan,
    activeDays: activeDaysSet.size,
    callStats: callStatsResult,
  };
}
