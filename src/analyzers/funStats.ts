import emojiRegex from 'emoji-regex';
import type { ParsedChat, FunStatsResult } from '../parser/types';

// ============================================================
// Fun / Romantic / Insightful stats analyzer
// ============================================================

const LAUGH_PATTERNS = [
  'haha', 'hahaha', 'hahahaha', 'ahaha', 'ahahaha',
  'lol', 'lmao', 'lmfao', 'rofl', 'xd', 'xdd',
  'jaja', 'jajaja',
  'sksk', 'sjsj', 'dkdk', 'fkfk', 'akjsd', 'asjkd', 'asdf',
  'puhaha', 'ksksk', 'kdkd', 'hshs', 'ghgh', 'djdj', 'fjfj', 'dhdh',
  '😂', '🤣', '😹',
];

const GOOD_MORNING_PATTERNS = [
  'good morning', 'gm', 'morning!',
  'günaydın', 'gunaydin', 'günaydinn', 'günaydınnn',
];

const GOOD_NIGHT_PATTERNS = [
  'good night', 'goodnight', 'gn', 'night night', 'nighty',
  'iyi geceler', 'iyi gece', 'iyi gecee', 'iyigeceler',
];

const APOLOGY_PATTERNS = [
  'sorry', "i'm sorry", 'my bad', 'forgive me',
  'özür', 'özür dilerim', 'pardon', 'affedersin', 'kusura bakma',
  'kusura bakme', 'özürdilerim',
];

// Stop words for phrase detection
const PHRASE_STOP_WORDS = new Set([
  'bir', 've', 'bu', 'da', 'de', 'ne', 'o', 'mi', 'mu', 'mı', 'mü',
  'the', 'a', 'an', 'is', 'am', 'are', 'i', 'you', 'he', 'she', 'it',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'and', 'but', 'or',
  'ha', 'he', 'hm', 'hmm', 'ee', 'aa', 'oo', 'ya', 'la',
]);

const _d = new Date();
function getHour(epoch: number): number {
  _d.setTime(epoch);
  return _d.getHours();
}

function isAllCaps(text: string): boolean {
  let upper = 0;
  let lower = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (ch >= 65 && ch <= 90) upper++;
    else if (ch >= 97 && ch <= 122) lower++;
    else if (ch >= 192 && ch <= 382) {
      if (ch < 300) upper++; else lower++;
    }
  }
  const total = upper + lower;
  return total >= 4 && upper / total > 0.7;
}

function isOneWord(text: string): boolean {
  const t = text.trim();
  return t.length > 0 && !t.includes(' ') && !t.includes('\n');
}

/**
 * Extract bigrams (2-word phrases) from text.
 * Returns lowercased phrase strings.
 */
function extractBigrams(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !PHRASE_STOP_WORDS.has(w));

  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(words[i] + ' ' + words[i + 1]);
  }
  return bigrams;
}

const DOUBLE_TEXT_GAP_MS = 5 * 60 * 1000; // 5 minutes

export function analyzeFunStats(chat: ParsedChat): FunStatsResult {
  const { messages, participants } = chat;
  const regex = emojiRegex();

  // ---- All accumulators ----
  const laughterCount: Record<string, number> = {};
  const goodMorningCount: Record<string, number> = {};
  const goodNightCount: Record<string, number> = {};
  const lateNightCount: Record<string, number> = {};
  const questionCount: Record<string, number> = {};
  const capsCount: Record<string, number> = {};
  const apologyCount: Record<string, number> = {};
  const linkCount: Record<string, number> = {};
  const hourSum: Record<string, number> = {};
  const hourMsgCount: Record<string, number> = {};
  const longestMonologue: Record<string, number> = {};
  const slowestResponse: Record<string, number> = {};
  const oneWordCount: Record<string, number> = {};
  const totalMsgCount: Record<string, number> = {};
  const emojiMsgCount: Record<string, number> = {};
  const emojiTotal: Record<string, number> = {};
  // NEW
  const deletedCount: Record<string, number> = {};
  const doubleTextCount: Record<string, number> = {};
  const youtubeCount: Record<string, number> = {};
  const spotifyCount: Record<string, number> = {};
  const instagramCount: Record<string, number> = {};
  const tiktokCount: Record<string, number> = {};
  const twitterCount: Record<string, number> = {};

  let totalLaughter = 0;
  let totalGoodMorning = 0;
  let totalGoodNight = 0;
  let totalLinks = 0;
  let totalDeleted = 0;

  // Phrase tracking (bigrams)
  const globalPhrases = new Map<string, number>();
  const participantPhrases = new Map<string, Map<string, number>>();

  for (const p of participants) {
    laughterCount[p] = 0; goodMorningCount[p] = 0; goodNightCount[p] = 0;
    lateNightCount[p] = 0; questionCount[p] = 0; capsCount[p] = 0;
    apologyCount[p] = 0; linkCount[p] = 0; hourSum[p] = 0;
    hourMsgCount[p] = 0; longestMonologue[p] = 0; slowestResponse[p] = 0;
    oneWordCount[p] = 0; totalMsgCount[p] = 0; emojiMsgCount[p] = 0;
    emojiTotal[p] = 0; deletedCount[p] = 0; doubleTextCount[p] = 0;
    youtubeCount[p] = 0; spotifyCount[p] = 0; instagramCount[p] = 0;
    tiktokCount[p] = 0; twitterCount[p] = 0;
    participantPhrases.set(p, new Map());
  }

  // Monologue tracking
  let currentSender = '';
  let currentStreak = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const sender = msg.sender;
    if (!(sender in totalMsgCount)) continue;

    // ---- Deleted messages ----
    if (msg.isDeleted) {
      deletedCount[sender]++;
      totalDeleted++;
      continue; // don't count deleted msgs in other stats
    }

    if (msg.isMedia || msg.isCall) continue;

    totalMsgCount[sender]++;

    const lower = msg.message.toLowerCase();
    const hour = getHour(msg.timestamp);

    // ---- Laughter ----
    for (let k = 0; k < LAUGH_PATTERNS.length; k++) {
      if (lower.includes(LAUGH_PATTERNS[k])) {
        laughterCount[sender]++;
        totalLaughter++;
        break;
      }
    }

    // ---- Good morning ----
    if (hour >= 4 && hour <= 12) {
      for (let k = 0; k < GOOD_MORNING_PATTERNS.length; k++) {
        if (lower.includes(GOOD_MORNING_PATTERNS[k])) {
          goodMorningCount[sender]++;
          totalGoodMorning++;
          break;
        }
      }
    }

    // ---- Good night ----
    if (hour >= 20 || hour <= 4) {
      for (let k = 0; k < GOOD_NIGHT_PATTERNS.length; k++) {
        if (lower.includes(GOOD_NIGHT_PATTERNS[k])) {
          goodNightCount[sender]++;
          totalGoodNight++;
          break;
        }
      }
    }

    // ---- Late night ----
    if (hour >= 0 && hour < 5) {
      lateNightCount[sender]++;
    }

    // ---- Questions ----
    if (msg.message.includes('?')) questionCount[sender]++;

    // ---- ALL CAPS ----
    if (isAllCaps(msg.message)) capsCount[sender]++;

    // ---- Apologies ----
    for (let k = 0; k < APOLOGY_PATTERNS.length; k++) {
      if (lower.includes(APOLOGY_PATTERNS[k])) {
        apologyCount[sender]++;
        break;
      }
    }

    // ---- Links + platform breakdown ----
    if (msg.message.includes('http://') || msg.message.includes('https://')) {
      linkCount[sender]++;
      totalLinks++;

      const ml = lower;
      if (ml.includes('youtube.com') || ml.includes('youtu.be')) youtubeCount[sender]++;
      if (ml.includes('spotify.com') || ml.includes('open.spotify')) spotifyCount[sender]++;
      if (ml.includes('instagram.com') || ml.includes('instagr.am')) instagramCount[sender]++;
      if (ml.includes('tiktok.com') || ml.includes('vm.tiktok')) tiktokCount[sender]++;
      if (ml.includes('twitter.com') || ml.includes('x.com/')) twitterCount[sender]++;
    }

    // ---- Average message hour ----
    hourSum[sender] += hour;
    hourMsgCount[sender]++;

    // ---- Monologue ----
    if (sender === currentSender) {
      currentStreak++;
    } else {
      if (currentSender && currentStreak > longestMonologue[currentSender]) {
        longestMonologue[currentSender] = currentStreak;
      }
      currentSender = sender;
      currentStreak = 1;
    }

    // ---- Double texting ----
    // Same sender as previous message AND gap > 5 min since their own last message
    // AND the other person hasn't replied in between (sender == currentSender continuing a streak)
    if (i > 0 && sender === messages[i - 1].sender) {
      const gap = msg.timestamp - messages[i - 1].timestamp;
      if (gap >= DOUBLE_TEXT_GAP_MS) {
        doubleTextCount[sender]++;
      }
    }

    // ---- Slowest response ----
    if (i > 0 && messages[i - 1].sender !== sender) {
      const rt = msg.timestamp - messages[i - 1].timestamp;
      if (rt > slowestResponse[sender]) {
        slowestResponse[sender] = rt;
      }
    }

    // ---- One-word messages ----
    if (isOneWord(msg.message)) oneWordCount[sender]++;

    // ---- Emoji per message ----
    regex.lastIndex = 0;
    let emojiCount = 0;
    while (regex.exec(msg.message) !== null) emojiCount++;
    if (emojiCount > 0) {
      emojiMsgCount[sender]++;
      emojiTotal[sender] += emojiCount;
    }

    // ---- Phrases (bigrams) ----
    // Only process non-trivial messages (> 3 words)
    if (msg.message.length > 10) {
      const bigrams = extractBigrams(msg.message);
      const pMap = participantPhrases.get(sender);
      for (const bg of bigrams) {
        globalPhrases.set(bg, (globalPhrases.get(bg) || 0) + 1);
        if (pMap) pMap.set(bg, (pMap.get(bg) || 0) + 1);
      }
    }
  }

  // Final monologue check
  if (currentSender && currentStreak > longestMonologue[currentSender]) {
    longestMonologue[currentSender] = currentStreak;
  }

  // ---- Derived stats ----
  const avgMessageHour: Record<string, number> = {};
  const oneWordMessagePercent: Record<string, number> = {};
  const emojisPerMessage: Record<string, number> = {};

  for (const p of participants) {
    avgMessageHour[p] = hourMsgCount[p] > 0
      ? Math.round((hourSum[p] / hourMsgCount[p]) * 10) / 10 : 0;
    oneWordMessagePercent[p] = totalMsgCount[p] > 0
      ? Math.round((oneWordCount[p] / totalMsgCount[p]) * 1000) / 10 : 0;
    emojisPerMessage[p] = totalMsgCount[p] > 0
      ? Math.round((emojiTotal[p] / totalMsgCount[p]) * 100) / 100 : 0;
  }

  // ---- Top phrases (global + per participant) ----
  const topPhrases = Array.from(globalPhrases.entries())
    .filter(([, c]) => c >= 5) // minimum 5 occurrences
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([phrase, count]) => ({ phrase, count }));

  const topPhrasesPerParticipant: Record<string, { phrase: string; count: number }[]> = {};
  for (const p of participants) {
    const pMap = participantPhrases.get(p)!;
    topPhrasesPerParticipant[p] = Array.from(pMap.entries())
      .filter(([, c]) => c >= 3)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([phrase, count]) => ({ phrase, count }));
  }

  const whoMax = (obj: Record<string, number>) => {
    let best = ''; let max = -1;
    for (const [k, v] of Object.entries(obj)) {
      if (v > max) { max = v; best = k; }
    }
    return best;
  };

  return {
    laughterCount, totalLaughter,
    whoLaughsMore: whoMax(laughterCount),

    goodMorningCount, goodNightCount,
    totalGoodMorning, totalGoodNight,

    lateNightCount, nightOwl: whoMax(lateNightCount),
    questionCount, whoAsksMore: whoMax(questionCount),
    capsCount, whoShoutsMore: whoMax(capsCount),
    apologyCount, whoApologizesMore: whoMax(apologyCount),

    linkCount, totalLinks,
    avgMessageHour, longestMonologue, slowestResponse,
    oneWordMessagePercent, emojisPerMessage,

    // NEW
    deletedCount, totalDeleted,
    whoDeletesMore: whoMax(deletedCount),

    doubleTextCount,
    whoDoubleTextsMore: whoMax(doubleTextCount),

    youtubeCount, spotifyCount, instagramCount, tiktokCount, twitterCount,

    topPhrases, topPhrasesPerParticipant,
  };
}
