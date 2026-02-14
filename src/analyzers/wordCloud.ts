import type { ParsedChat, WordCloudResult, WordCount } from '../parser/types';

// ============================================================
// Stop words for Turkish and English
// Common words that should be excluded from word frequency analysis
// ============================================================

const TURKISH_STOP_WORDS = new Set([
  'bir', 've', 'bu', 'da', 'de', 'ne', 'o', 'ben', 'sen', 'biz', 'siz',
  'onlar', 'için', 'ile', 'ama', 'fakat', 'ya', 'ki', 'mi', 'mu', 'mı',
  'mü', 'var', 'yok', 'çok', 'daha', 'en', 'gibi', 'kadar', 'sonra',
  'önce', 'şey', 'sey', 'her', 'tüm', 'bazı', 'bazi', 'olarak', 'olan',
  'ise', 'hem', 'veya', 'ya', 'bile', 'hep', 'hiç', 'hic', 'evet', 'hayır',
  'hayir', 'tamam', 'oldu', 'olur', 'olan', 'değil', 'degil', 'diye',
  'neden', 'nasıl', 'nasil', 'nerede', 'zaman', 'bana', 'sana', 'ona',
  'benim', 'senin', 'onun', 'bize', 'size', 'aslında', 'aslinda', 'sadece',
  'şimdi', 'simdi', 'artık', 'artik', 'hala', 'yani', 'işte', 'iste',
  'abi', 'olm', 'lan', 'la', 'ha', 'he', 'hm', 'hmm', 'ee', 'aa', 'oo',
  'eed', 'eed', 'mk', 'ya', 'yaa', 'ay', 'aha', 'oha', 'vay', 'hadi',
  'gel', 'git', 'al', 'ver', 'yap', 'et', 'ol', 'de', 'di', 'mi',
  'onu', 'şu', 'su', 'böyle', 'boyle', 'öyle', 'oyle', 'niye', 'acaba',
]);

const ENGLISH_STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further',
  'then', 'once', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours',
  'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he',
  'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its',
  'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what',
  'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'and', 'but',
  'or', 'nor', 'not', 'so', 'very', 'just', 'about', 'up', 'down',
  'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only',
  'own', 'same', 'than', 'too', 'also', 'if', 'because', 'until', 'while',
  'yes', 'no', 'ok', 'okay', 'yeah', 'yep', 'nope', 'lol', 'haha',
  'hahaha', 'hmm', 'oh', 'ah', 'um', 'uh',
]);

const ALL_STOP_WORDS = new Set([...TURKISH_STOP_WORDS, ...ENGLISH_STOP_WORDS]);

/**
 * Analyze word frequency in the chat.
 */
export function analyzeWordCloud(chat: ParsedChat): WordCloudResult {
  const { messages, participants } = chat;

  // Global word counts
  const globalCounts = new Map<string, number>();

  // Per-participant word counts
  const participantCounts = new Map<string, Map<string, number>>();
  for (const p of participants) {
    participantCounts.set(p, new Map());
  }

  for (let mi = 0; mi < messages.length; mi++) {
    const msg = messages[mi];
    if (msg.isMedia || msg.isCall || msg.isDeleted) continue;

    // Tokenize: lowercase, split on whitespace and punctuation, filter short words and stop words
    const words = msg.message
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // keep only letters, numbers, whitespace
      .split(/\s+/)
      .filter(w => w.length >= 2 && !ALL_STOP_WORDS.has(w));

    for (const word of words) {
      // Global
      globalCounts.set(word, (globalCounts.get(word) || 0) + 1);

      // Per participant
      const pMap = participantCounts.get(msg.sender);
      if (pMap) {
        pMap.set(word, (pMap.get(word) || 0) + 1);
      }
    }
  }

  // ---- Top words globally ----
  const topWords: WordCount[] = Array.from(globalCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));

  // ---- Top words per participant ----
  const perParticipant: Record<string, WordCount[]> = {};
  for (const [name, pMap] of participantCounts.entries()) {
    perParticipant[name] = Array.from(pMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({ word, count }));
  }

  // ---- Unique words (words only one person uses, with count > 3 to be meaningful) ----
  const uniqueWords: Record<string, string[]> = {};
  for (const p of participants) {
    uniqueWords[p] = [];
  }

  // For each word, check if only one participant uses it
  const allWords = new Set<string>();
  for (const pMap of participantCounts.values()) {
    for (const word of pMap.keys()) {
      allWords.add(word);
    }
  }

  for (const word of allWords) {
    const usersWhoUseIt: string[] = [];
    for (const [name, pMap] of participantCounts.entries()) {
      const count = pMap.get(word) || 0;
      if (count >= 3) {
        usersWhoUseIt.push(name);
      }
    }
    if (usersWhoUseIt.length === 1) {
      uniqueWords[usersWhoUseIt[0]].push(word);
    }
  }

  // Limit unique words to top 20 per person (sorted by frequency)
  for (const p of participants) {
    uniqueWords[p] = uniqueWords[p]
      .sort((a, b) => {
        const countA = participantCounts.get(p)?.get(a) || 0;
        const countB = participantCounts.get(p)?.get(b) || 0;
        return countB - countA;
      })
      .slice(0, 20);
  }

  return {
    topWords,
    perParticipant,
    uniqueWords,
  };
}
