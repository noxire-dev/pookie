import type {
  ParsedChat,
  LoveAnalysisResult,
  AffectionKeywordCount,
  MonthlyAffection,
} from '../parser/types';

// ============================================================
// Keyword lists — combined for single-pass matching
// ============================================================

const LOVE_KEYWORDS: string[] = [
  'i love you', 'love you', 'love u', 'luv u', 'luv you',
  'i miss you', 'miss you', 'miss u',
  'i adore you', 'you mean everything', 'you mean the world',
  'my everything', 'my love', 'my darling',
  'sweetheart', 'babe', 'baby', 'honey', 'xoxo', 'kisses', 'hugs',
  'seni seviyorum', 'seni çok seviyorum',
  'seni özledim', 'çok özledim', 'özledim seni',
  'aşkım', 'askim', 'canım', 'canim',
  'hayatım', 'hayatim', 'birtanem',
  'tatlım', 'tatlim', 'güzelim', 'guzelim',
  'sevgilim', 'bebeğim', 'bebegim',
  'koçum', 'kocum',
  'benim herşeyim', 'benim her şeyim',
  'sana bayılıyorum', 'çok tatlısın',
  'öpüyorum', 'opuyorum',
  'sarılmak istiyorum', 'kucaklıyorum',
];

const PET_NAMES: string[] = [
  'babe', 'baby', 'honey', 'sweetheart', 'darling',
  'love', 'dear', 'sweetie', 'boo', 'cutie',
  'angel', 'prince', 'princess', 'sunshine', 'pumpkin',
  'aşkım', 'askim', 'canım', 'canim',
  'hayatım', 'hayatim', 'birtanem',
  'tatlım', 'tatlim', 'güzelim', 'guzelim',
  'sevgilim', 'bebeğim', 'bebegim',
  'koçum', 'kocum', 'balım', 'balim',
  'kuşum', 'kusum', 'meleğim', 'melegim',
  'prensesim', 'prensim', 'şekerim', 'sekerim',
  'pookie', 'ponçik', 'poncik',
];

const _d = new Date();
function monthKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

/**
 * Analyze love/affection patterns in the chat.
 * Optimized: single lowercase per message, combined keyword + pet name pass.
 */
export function analyzeLove(chat: ParsedChat): LoveAnalysisResult {
  const { messages, participants } = chat;

  // Accumulator maps — use arrays indexed by keyword index for speed
  const kwCounts = new Int32Array(LOVE_KEYWORDS.length);
  const kwPerP: Int32Array[] = LOVE_KEYWORDS.map(() => new Int32Array(participants.length));

  const pnCounts = new Int32Array(PET_NAMES.length);
  const pnPerP: Int32Array[] = PET_NAMES.map(() => new Int32Array(participants.length));

  const pIdx = new Map<string, number>();
  for (let i = 0; i < participants.length; i++) pIdx.set(participants[i], i);

  const affectionPerP = new Int32Array(participants.length);
  const monthlyMap = new Map<string, number>();
  let totalAffectionMessages = 0;

  for (let mi = 0; mi < messages.length; mi++) {
    const msg = messages[mi];
    if (msg.isMedia || msg.isCall || msg.isDeleted) continue;

    const pi = pIdx.get(msg.sender);
    if (pi === undefined) continue;

    const lower = msg.message.toLowerCase();
    let hasAffection = false;

    // Check love keywords
    for (let k = 0; k < LOVE_KEYWORDS.length; k++) {
      if (lower.includes(LOVE_KEYWORDS[k])) {
        kwCounts[k]++;
        kwPerP[k][pi]++;
        hasAffection = true;
      }
    }

    // Check pet names
    for (let k = 0; k < PET_NAMES.length; k++) {
      if (lower.includes(PET_NAMES[k])) {
        pnCounts[k]++;
        pnPerP[k][pi]++;
        hasAffection = true;
      }
    }

    if (hasAffection) {
      totalAffectionMessages++;
      affectionPerP[pi]++;
      const mk = monthKey(msg.timestamp);
      monthlyMap.set(mk, (monthlyMap.get(mk) || 0) + 1);
    }
  }

  // ---- Build results ----
  const keywordResults: AffectionKeywordCount[] = [];
  for (let k = 0; k < LOVE_KEYWORDS.length; k++) {
    if (kwCounts[k] > 0) {
      const pp: Record<string, number> = {};
      for (let i = 0; i < participants.length; i++) pp[participants[i]] = kwPerP[k][i];
      keywordResults.push({ keyword: LOVE_KEYWORDS[k], count: kwCounts[k], perParticipant: pp });
    }
  }
  keywordResults.sort((a, b) => b.count - a.count);

  const petNameResults: AffectionKeywordCount[] = [];
  for (let k = 0; k < PET_NAMES.length; k++) {
    if (pnCounts[k] > 0) {
      const pp: Record<string, number> = {};
      for (let i = 0; i < participants.length; i++) pp[participants[i]] = pnPerP[k][i];
      petNameResults.push({ keyword: PET_NAMES[k], count: pnCounts[k], perParticipant: pp });
    }
  }
  petNameResults.sort((a, b) => b.count - a.count);

  const affectionPerParticipant: Record<string, number> = {};
  let whoSaysLoveMore = '';
  let maxAffection = 0;
  for (let i = 0; i < participants.length; i++) {
    affectionPerParticipant[participants[i]] = affectionPerP[i];
    if (affectionPerP[i] > maxAffection) {
      maxAffection = affectionPerP[i];
      whoSaysLoveMore = participants[i];
    }
  }

  const affectionOverTime: MonthlyAffection[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    keywordCounts: keywordResults,
    totalAffectionMessages,
    affectionPerParticipant,
    whoSaysLoveMore,
    petNames: petNameResults,
    affectionOverTime,
  };
}
