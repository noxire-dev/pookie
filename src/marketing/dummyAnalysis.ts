import type { AnalysisResult, ChatSummary } from '../parser/types';

const p1 = 'Alex';
const p2 = 'Jordan';

/* 18 months of activity: 2022-03 to 2023-08 */
function months(startYear: number, startMonth: number, count: number) {
  const arr: string[] = [];
  for (let i = 0; i < count; i++) {
    const m = startMonth + i;
    const y = startYear + Math.floor((m - 1) / 12);
    const mm = ((m - 1) % 12) + 1;
    arr.push(`${y}-${String(mm).padStart(2, '0')}`);
  }
  return arr;
}

const monthList = months(2022, 3, 18);
const msgCurve = [820, 1400, 2100, 2600, 3100, 2800, 3400, 3600, 2900, 3200, 3800, 4100, 3500, 2700, 3100, 3600, 3900, 2200];

const startDate = new Date('2022-03-15T18:32:00').getTime();
const endDate = new Date('2023-08-20T23:14:00').getTime();

export const dummyChatSummary: ChatSummary = {
  participants: [p1, p2],
  startDate,
  endDate,
  totalMessages: 47892,
};

export const dummyAnalysisResult: AnalysisResult = {
  /* ── Basic Stats ── */
  basicStats: {
    participants: [
      {
        name: p1,
        messageCount: 27780,
        totalWords: 198400,
        totalChars: 1102000,
        avgMessageLength: 39.7,
        avgWordsPerMessage: 7.1,
        longestMessage: 'I just want you to know that every single moment I spend with you makes me realize how lucky I am. From the way you laugh at my terrible jokes to how you always know exactly what to say when I am having a rough day. You are my favorite person in the entire universe and I never want to stop telling you that.',
        longestMessageLength: 342,
        initiatedConversations: 412,
      },
      {
        name: p2,
        messageCount: 20112,
        totalWords: 156800,
        totalChars: 872000,
        avgMessageLength: 43.3,
        avgWordsPerMessage: 7.8,
        longestMessage: 'Remember that night we stayed up until 4am just talking about nothing and everything? I think about it all the time. Those are the moments that make everything worth it.',
        longestMessageLength: 168,
        initiatedConversations: 298,
      },
    ],
    totalMessages: 47892,
    totalWords: 355200,
    totalChars: 1974000,
    messagesPerDay: 38,
    averageResponseTimeMs: { [p1]: 240000, [p2]: 312000 },
    fastestResponseTimeMs: { [p1]: 3200, [p2]: 4100 },
    whoTextsFirstInMorning: { [p1]: 486, [p2]: 312 },
    longestStreak: 89,
    longestStreakStart: '2023-01-05',
    longestStreakEnd: '2023-04-04',
    totalDays: 524,
    activeDays: 498,
    callStats: {
      totalCalls: 342,
      totalCallDurationSeconds: 186400,
      callsPerParticipant: { [p1]: 198, [p2]: 144 },
      callDurationPerParticipant: { [p1]: 102000, [p2]: 84400 },
      longestCallSeconds: 14820,
      longestCallDate: new Date('2023-02-14T21:00:00').getTime(),
    },
  },

  /* ── Timeline ── */
  timeline: {
    monthlyActivity: monthList.map((month, i) => ({
      month,
      count: msgCurve[i],
      perParticipant: {
        [p1]: Math.round(msgCurve[i] * 0.58),
        [p2]: Math.round(msgCurve[i] * 0.42),
      },
    })),
    hourlyActivity: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: h >= 22 || h <= 2
        ? 2800 + Math.round(Math.sin(h * 0.5) * 400)
        : h >= 8 && h <= 11
          ? 1800 + h * 80
          : 600 + h * 50,
    })),
    dayOfWeekActivity: [
      { day: 0, dayName: 'Sunday', count: 7200 },
      { day: 1, dayName: 'Monday', count: 6100 },
      { day: 2, dayName: 'Tuesday', count: 6400 },
      { day: 3, dayName: 'Wednesday', count: 6300 },
      { day: 4, dayName: 'Thursday', count: 6800 },
      { day: 5, dayName: 'Friday', count: 7600 },
      { day: 6, dayName: 'Saturday', count: 7492 },
    ],
    heatmap: (() => {
      const cells: { day: number; hour: number; count: number }[] = [];
      for (let d = 0; d < 7; d++)
        for (let h = 0; h < 24; h++)
          cells.push({ day: d, hour: h, count: Math.round(40 + Math.random() * 260) });
      return cells;
    })(),
    mostActiveDay: { date: '2023-02-14', count: 487 },
    dailyActivity: [],
    dailyTrend: [],
    peakHour: 22,
    peakDayOfWeek: 'Friday',
  },

  /* ── Love Analysis ── */
  loveAnalysis: {
    keywordCounts: [
      { keyword: 'love', count: 1842, perParticipant: { [p1]: 1076, [p2]: 766 } },
      { keyword: 'miss you', count: 634, perParticipant: { [p1]: 380, [p2]: 254 } },
      { keyword: 'baby', count: 1203, perParticipant: { [p1]: 542, [p2]: 661 } },
      { keyword: 'heart', count: 287, perParticipant: { [p1]: 164, [p2]: 123 } },
      { keyword: 'forever', count: 98, perParticipant: { [p1]: 62, [p2]: 36 } },
    ],
    totalAffectionMessages: 3421,
    affectionPerParticipant: { [p1]: 1986, [p2]: 1435 },
    whoSaysLoveMore: p1,
    petNames: [
      { keyword: 'babe', count: 892, perParticipant: { [p1]: 510, [p2]: 382 } },
      { keyword: 'honey', count: 341, perParticipant: { [p1]: 198, [p2]: 143 } },
      { keyword: 'sweetheart', count: 87, perParticipant: { [p1]: 52, [p2]: 35 } },
    ],
    affectionOverTime: monthList.map((month, i) => ({
      month,
      count: 120 + Math.round(Math.sin(i * 0.4 + 1) * 80 + i * 8),
    })),
  },

  /* ── Emoji Analysis ── */
  emojiAnalysis: {
    totalEmojis: 18432,
    topEmojis: [
      { emoji: '❤️', count: 4210 },
      { emoji: '😂', count: 3892 },
      { emoji: '🥰', count: 2104 },
      { emoji: '😘', count: 1876 },
      { emoji: '💕', count: 1203 },
      { emoji: '😭', count: 987 },
      { emoji: '🥺', count: 876 },
      { emoji: '✨', count: 654 },
      { emoji: '🫶', count: 543 },
      { emoji: '😊', count: 489 },
      { emoji: '💀', count: 412 },
      { emoji: '🤣', count: 398 },
      { emoji: '🥵', count: 234 },
      { emoji: '🙈', count: 221 },
      { emoji: '💗', count: 198 },
    ],
    perParticipant: [
      {
        name: p1,
        totalEmojis: 10680,
        topEmojis: [
          { emoji: '❤️', count: 2410 },
          { emoji: '😂', count: 2100 },
          { emoji: '😘', count: 1200 },
          { emoji: '🥰', count: 1100 },
          { emoji: '💕', count: 780 },
        ],
      },
      {
        name: p2,
        totalEmojis: 7752,
        topEmojis: [
          { emoji: '😂', count: 1792 },
          { emoji: '❤️', count: 1800 },
          { emoji: '🥰', count: 1004 },
          { emoji: '🥺', count: 620 },
          { emoji: '😘', count: 676 },
        ],
      },
    ],
    heartEmojiCount: 5413,
    emojiOverTime: monthList.map((month, i) => ({
      month,
      count: 600 + Math.round(Math.sin(i * 0.35) * 300 + i * 30),
    })),
  },

  /* ── Media Stats ── */
  mediaStats: {
    totalMedia: 2891,
    mediaPerParticipant: { [p1]: 1690, [p2]: 1201 },
    mediaOverTime: monthList.map((month, i) => ({
      month,
      count: 80 + Math.round(Math.sin(i * 0.4 + 2) * 60 + i * 5),
    })),
  },

  /* ── Milestones ── */
  milestones: {
    firstMessage: {
      timestamp: startDate,
      sender: p1,
      message: 'Hey! Just got your number from the group. How was the hike today?',
      isSystemMessage: false,
      isMedia: false,
      isCall: false,
      callDurationSeconds: 0,
      isDeleted: false,
    },
    messageMilestones: [
      { label: '1,000th message', message: null, date: new Date('2022-04-28').getTime(), value: 1000 },
      { label: '10,000th message', message: null, date: new Date('2022-08-12').getTime(), value: 10000 },
      { label: '25,000th message', message: null, date: new Date('2023-02-03').getTime(), value: 25000 },
    ],
    longestMessage: {
      timestamp: new Date('2023-01-15T02:34:00').getTime(),
      sender: p1,
      message: 'I just want you to know that every single moment I spend with you makes me realize how lucky I am...',
      isSystemMessage: false,
      isMedia: false,
      isCall: false,
      callDurationSeconds: 0,
      isDeleted: false,
    },
    longestGap: {
      startDate: new Date('2022-07-10').getTime(),
      endDate: new Date('2022-07-13').getTime(),
      durationMs: 3 * 86400000,
    },
    mostMessagesInADay: { date: '2023-02-14', count: 487 },
    anniversaries: [
      { label: '6 months', date: new Date('2022-09-15').getTime() },
      { label: '1 year', date: new Date('2023-03-15').getTime() },
    ],
  },

  /* ── Word Cloud ── */
  wordCloud: {
    topWords: [
      { word: 'love', count: 1842 }, { word: 'good', count: 1654 }, { word: 'morning', count: 1423 },
      { word: 'night', count: 1312 }, { word: 'miss', count: 1108 }, { word: 'today', count: 986 },
      { word: 'home', count: 923 }, { word: 'okay', count: 876 }, { word: 'yeah', count: 832 },
      { word: 'really', count: 798 }, { word: 'think', count: 743 }, { word: 'want', count: 712 },
      { word: 'know', count: 698 }, { word: 'feel', count: 654 }, { word: 'time', count: 621 },
      { word: 'call', count: 598 }, { word: 'work', count: 567 }, { word: 'haha', count: 543 },
      { word: 'sleep', count: 512 }, { word: 'food', count: 498 }, { word: 'cute', count: 476 },
      { word: 'happy', count: 454 }, { word: 'sorry', count: 423 }, { word: 'wait', count: 412 },
      { word: 'come', count: 398 }, { word: 'please', count: 376 }, { word: 'together', count: 354 },
      { word: 'aww', count: 332 }, { word: 'laugh', count: 312 }, { word: 'song', count: 298 },
    ],
    perParticipant: {
      [p1]: [
        { word: 'love', count: 1076 }, { word: 'babe', count: 510 }, { word: 'morning', count: 820 },
        { word: 'miss', count: 680 }, { word: 'haha', count: 398 },
      ],
      [p2]: [
        { word: 'baby', count: 661 }, { word: 'love', count: 766 }, { word: 'night', count: 712 },
        { word: 'okay', count: 543 }, { word: 'yeah', count: 498 },
      ],
    },
    uniqueWords: {
      [p1]: ['bruh', 'ngl', 'lowkey', 'deadass', 'goated'],
      [p2]: ['bestie', 'slay', 'periodt', 'manifesting', 'iconic'],
    },
  },

  /* ── Fun Stats ── */
  funStats: {
    laughterCount: { [p1]: 2340, [p2]: 1876 },
    totalLaughter: 4216,
    whoLaughsMore: p1,

    goodMorningCount: { [p1]: 486, [p2]: 312 },
    goodNightCount: { [p1]: 398, [p2]: 423 },
    totalGoodMorning: 798,
    totalGoodNight: 821,

    lateNightCount: { [p1]: 687, [p2]: 516 },
    nightOwl: p1,

    questionCount: { [p1]: 1234, [p2]: 1567 },
    whoAsksMore: p2,

    capsCount: { [p1]: 342, [p2]: 198 },
    whoShoutsMore: p1,

    apologyCount: { [p1]: 187, [p2]: 236 },
    whoApologizesMore: p2,

    linkCount: { [p1]: 234, [p2]: 178 },
    totalLinks: 412,

    avgMessageHour: { [p1]: 21.3, [p2]: 22.1 },

    longestMonologue: { [p1]: 23, [p2]: 17 },

    slowestResponse: { [p1]: 43200000, [p2]: 28800000 },

    oneWordMessagePercent: { [p1]: 18.3, [p2]: 14.7 },

    emojisPerMessage: { [p1]: 0.38, [p2]: 0.39 },

    deletedCount: { [p1]: 89, [p2]: 134 },
    totalDeleted: 223,
    whoDeletesMore: p2,

    doubleTextCount: { [p1]: 312, [p2]: 198 },
    whoDoubleTextsMore: p1,

    youtubeCount: { [p1]: 87, [p2]: 64 },
    spotifyCount: { [p1]: 45, [p2]: 112 },
    instagramCount: { [p1]: 134, [p2]: 98 },
    tiktokCount: { [p1]: 23, [p2]: 67 },
    twitterCount: { [p1]: 12, [p2]: 8 },

    topPhrases: [
      { phrase: 'i love you', count: 2847 },
      { phrase: 'good night', count: 821 },
      { phrase: 'good morning', count: 798 },
      { phrase: 'miss you', count: 634 },
      { phrase: 'how are you', count: 589 },
      { phrase: 'see you', count: 412 },
      { phrase: 'have fun', count: 367 },
      { phrase: 'take care', count: 298 },
      { phrase: 'come here', count: 245 },
      { phrase: 'so cute', count: 198 },
    ],
    topPhrasesPerParticipant: {
      [p1]: [
        { phrase: 'i love you', count: 1523 },
        { phrase: 'good morning', count: 486 },
        { phrase: 'miss you', count: 378 },
        { phrase: 'you okay?', count: 267 },
        { phrase: 'come here', count: 189 },
      ],
      [p2]: [
        { phrase: 'i love you', count: 1324 },
        { phrase: 'good night', count: 423 },
        { phrase: 'so cute', count: 312 },
        { phrase: 'miss you', count: 256 },
        { phrase: 'love you more', count: 198 },
      ],
    },
  },
};
