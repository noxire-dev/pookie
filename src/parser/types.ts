// ============================================================
// Core parsed message types
// ============================================================

export interface ParsedMessage {
  /** Epoch ms — stored as number for speed (avoids Date object overhead) */
  timestamp: number;
  sender: string;
  message: string;
  isSystemMessage: boolean;
  isMedia: boolean;
  isCall: boolean;
  isDeleted: boolean;
  callDurationSeconds: number; // 0 if not a call or missed
}

export interface ParsedChat {
  messages: ParsedMessage[];
  participants: string[];
  startDate: number; // epoch ms
  endDate: number;   // epoch ms
  totalMessages: number;
}

// ============================================================
// Analysis result types
// ============================================================

// --- Basic Stats ---
export interface ParticipantStats {
  name: string;
  messageCount: number;
  totalWords: number;
  totalChars: number;
  avgMessageLength: number;
  avgWordsPerMessage: number;
  longestMessage: string;
  longestMessageLength: number;
  initiatedConversations: number;
}

export interface CallStats {
  totalCalls: number;
  totalCallDurationSeconds: number;
  callsPerParticipant: Record<string, number>;
  callDurationPerParticipant: Record<string, number>;
  longestCallSeconds: number;
  longestCallDate: number | null; // epoch ms
}

export interface BasicStatsResult {
  participants: ParticipantStats[];
  totalMessages: number;
  totalWords: number;
  totalChars: number;
  messagesPerDay: number;
  averageResponseTimeMs: Record<string, number>;
  fastestResponseTimeMs: Record<string, number>;
  whoTextsFirstInMorning: Record<string, number>; // count per participant
  longestStreak: number;
  longestStreakStart: string | null; // "YYYY-MM-DD"
  longestStreakEnd: string | null;   // "YYYY-MM-DD"
  totalDays: number;
  activeDays: number;
  callStats: CallStats;
}

// --- Timeline ---
export interface MonthlyActivity {
  month: string; // "YYYY-MM"
  count: number;
  perParticipant: Record<string, number>;
}

export interface HourlyActivity {
  hour: number; // 0-23
  count: number;
}

export interface DayOfWeekActivity {
  day: number; // 0=Sunday .. 6=Saturday
  dayName: string;
  count: number;
}

export interface HeatmapCell {
  day: number;   // 0-6
  hour: number;  // 0-23
  count: number;
}

export interface DailyActivity {
  date: string; // "YYYY-MM-DD"
  count: number;
}

export interface DailyTrendPoint {
  date: string;    // "YYYY-MM-DD"
  count: number;
  perParticipant: Record<string, number>;
}

export interface TimelineResult {
  monthlyActivity: MonthlyActivity[];
  hourlyActivity: HourlyActivity[];
  dayOfWeekActivity: DayOfWeekActivity[];
  heatmap: HeatmapCell[];
  mostActiveDay: DailyActivity;
  dailyActivity: DailyActivity[];
  dailyTrend: DailyTrendPoint[];   // full daily breakdown with per-participant
  peakHour: number;
  peakDayOfWeek: string;
}

// --- Love/Affection Analysis ---
export interface AffectionKeywordCount {
  keyword: string;
  count: number;
  perParticipant: Record<string, number>;
}

export interface MonthlyAffection {
  month: string;
  count: number;
}

export interface LoveAnalysisResult {
  keywordCounts: AffectionKeywordCount[];
  totalAffectionMessages: number;
  affectionPerParticipant: Record<string, number>;
  whoSaysLoveMore: string;
  petNames: AffectionKeywordCount[];
  affectionOverTime: MonthlyAffection[];
}

// --- Emoji Analysis ---
export interface EmojiCount {
  emoji: string;
  count: number;
}

export interface ParticipantEmojiStats {
  name: string;
  totalEmojis: number;
  topEmojis: EmojiCount[];
}

export interface MonthlyEmojiCount {
  month: string;
  count: number;
}

export interface EmojiAnalysisResult {
  totalEmojis: number;
  topEmojis: EmojiCount[];
  perParticipant: ParticipantEmojiStats[];
  heartEmojiCount: number;
  emojiOverTime: MonthlyEmojiCount[];
}

// --- Media Stats ---
export interface MediaStatsResult {
  totalMedia: number;
  mediaPerParticipant: Record<string, number>;
  mediaOverTime: { month: string; count: number }[];
}

// --- Milestones ---
export interface Milestone {
  label: string;
  message: ParsedMessage | null;
  date: number | null; // epoch ms
  value?: string | number;
}

export interface MilestonesResult {
  firstMessage: ParsedMessage | null;
  messageMilestones: Milestone[];
  longestMessage: ParsedMessage | null;
  longestGap: { startDate: number; endDate: number; durationMs: number } | null;
  mostMessagesInADay: { date: string; count: number } | null;
  anniversaries: { label: string; date: number }[];
}

// --- Word Cloud ---
export interface WordCount {
  word: string;
  count: number;
}

export interface WordCloudResult {
  topWords: WordCount[];
  perParticipant: Record<string, WordCount[]>;
  uniqueWords: Record<string, string[]>; // words only one person uses
}

// --- Fun / Romantic Stats ---
export interface FunStatsResult {
  // Laughter
  laughterCount: Record<string, number>;       // per participant
  totalLaughter: number;
  whoLaughsMore: string;

  // Good morning / Good night
  goodMorningCount: Record<string, number>;
  goodNightCount: Record<string, number>;
  totalGoodMorning: number;
  totalGoodNight: number;

  // Late night owl (messages between 00:00–04:59)
  lateNightCount: Record<string, number>;
  nightOwl: string;

  // Who sends more questions (? messages)
  questionCount: Record<string, number>;
  whoAsksMore: string;

  // ALL CAPS messages (shouting)
  capsCount: Record<string, number>;
  whoShoutsMore: string;

  // Who apologizes more
  apologyCount: Record<string, number>;
  whoApologizesMore: string;

  // Links / URL sharing
  linkCount: Record<string, number>;
  totalLinks: number;

  // Average message time (what hour do they typically text)
  avgMessageHour: Record<string, number>;

  // Double/triple texting (sending multiple messages in a row without reply)
  longestMonologue: Record<string, number>;  // longest streak of consecutive messages

  // Ghost ratio: longest time each person took to reply
  slowestResponse: Record<string, number>;   // ms

  // One-word messages ratio
  oneWordMessagePercent: Record<string, number>;

  // "typing patterns" — who uses more emojis per message
  emojisPerMessage: Record<string, number>;

  // Deleted messages
  deletedCount: Record<string, number>;
  totalDeleted: number;
  whoDeletesMore: string;

  // Double texting (follow-up after 5+ min with no reply)
  doubleTextCount: Record<string, number>;
  whoDoubleTextsMore: string;

  // Link platform breakdown
  youtubeCount: Record<string, number>;
  spotifyCount: Record<string, number>;
  instagramCount: Record<string, number>;
  tiktokCount: Record<string, number>;
  twitterCount: Record<string, number>;

  // Most used phrases (bigrams)
  topPhrases: { phrase: string; count: number }[];
  topPhrasesPerParticipant: Record<string, { phrase: string; count: number }[]>;
}

// ============================================================
// Combined analysis result
// ============================================================

export interface AnalysisResult {
  basicStats: BasicStatsResult;
  timeline: TimelineResult;
  loveAnalysis: LoveAnalysisResult;
  emojiAnalysis: EmojiAnalysisResult;
  mediaStats: MediaStatsResult;
  milestones: MilestonesResult;
  wordCloud: WordCloudResult;
  funStats: FunStatsResult;
}

// ============================================================
// Worker message types
// ============================================================

export type WorkerRequest = {
  type: 'analyze';
  fileContent: string;
};

export type WorkerProgressMessage = {
  type: 'progress';
  step: string;
  percent: number;
};

/** Summary info sent back from worker (no full message array — too expensive for 800K+ msgs) */
export interface ChatSummary {
  participants: string[];
  startDate: number;
  endDate: number;
  totalMessages: number;
}

export type WorkerResultMessage = {
  type: 'result';
  data: AnalysisResult;
  chat: ChatSummary;
};

export type WorkerErrorMessage = {
  type: 'error';
  message: string;
};

export type WorkerResponse = WorkerProgressMessage | WorkerResultMessage | WorkerErrorMessage;
