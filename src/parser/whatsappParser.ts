import type { ParsedMessage, ParsedChat } from './types';

// ============================================================
// WhatsApp Chat Parser — optimized for speed on 800K+ line files
//
// Key optimizations:
//   - indexOf fast-path before regex (avoids regex on non-message lines)
//   - Timestamps stored as epoch ms (number) — no Date object per message
//   - Single .toLowerCase() per message for media/system/call checks
//   - Inline word counting (no array allocation per message)
// ============================================================

/**
 * Regex for lines starting with a WhatsApp timestamp.
 * Only used when the fast indexOf check passes.
 *
 * Group 1: date   (e.g. "19/04/2022" or "5.12.2018" — slash or dot)
 * Group 2: time   (e.g. "4:37:03 pm" or "16:37:03")
 * Group 3: rest   (everything after the ] or - separator)
 */
const MESSAGE_LINE_REGEX =
  /^\u200e?\[?(\d{1,2}[\/.]\d{1,2}[\/.]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP][mM])?)\]?\s*[-–]?\s*(.*)/;

const SENDER_MESSAGE_REGEX = /^([^:]+?):\s([\s\S]*)$/;

// ---- Media patterns (lowercased) ----
const MEDIA_PATTERNS = [
  '<media omitted>', '<medya dahil edilmedi>',
  'image omitted', 'video omitted', 'audio omitted',
  'sticker omitted', 'document omitted', 'gif omitted',
  'contact card omitted', '<attached:',
  '.opus (file attached)', '.jpg (file attached)',
  '.mp4 (file attached)', '.webp (file attached)', '.pdf (file attached)',
  'location: https://maps.google',
];

// ---- System message patterns (lowercased) ----
const SYSTEM_PATTERNS = [
  'messages and calls are end-to-end encrypted',
  'mesajlar ve aramalar uçtan uca şifrelidir',
  'changed the subject',
  'changed the group description', 'changed this group',
  'created group', 'joined using this group',
  'changed their phone number', 'security code changed',
  'güvenlik kodu değişti', 'waiting for this message',
];

// ---- Deleted message patterns (lowercased) ----
const DELETED_PATTERNS = [
  'you deleted this message', 'this message was deleted',
  'bu mesaj silindi', 'bu mesajı sildiniz',
];

// ---- Call patterns (lowercased, checked after U+200E stripping) ----
const CALL_KEYWORDS = [
  'missed voice call', 'missed video call',
  'voice call', 'video call',
  'cevapsız sesli arama', 'cevapsız görüntülü arama',
  'sesli arama', 'görüntülü arama',
];

/**
 * Parse WhatsApp call duration from text like:
 *   "Voice call, 4 min"  "Voice call, 25 sec"  "Video call, 9 hr"
 *   "Voice call, 1 hr 23 min"  "Voice call, No answer"  "Voice call, Ended"
 */
function parseCallDuration(text: string): number {
  let totalSeconds = 0;

  // Match hours
  const hrMatch = /(\d+)\s*hr/i.exec(text);
  if (hrMatch) totalSeconds += parseInt(hrMatch[1], 10) * 3600;

  // Match minutes
  const minMatch = /(\d+)\s*min/i.exec(text);
  if (minMatch) totalSeconds += parseInt(minMatch[1], 10) * 60;

  // Match seconds
  const secMatch = /(\d+)\s*sec/i.exec(text);
  if (secMatch) totalSeconds += parseInt(secMatch[1], 10);

  return totalSeconds;
}

/**
 * Fast inline date+time → epoch ms.
 * Avoids creating a Date object — uses Date.UTC then adjusts.
 */
function parseDateTimeToEpoch(dateStr: string, timeStr: string): number {
  // Parse date: DD/MM/YYYY or DD.MM.YYYY (normalize dots to slashes)
  const ds = dateStr.replace(/\./g, '/');
  const s1 = ds.indexOf('/');
  const s2 = ds.indexOf('/', s1 + 1);
  const a = +ds.substring(0, s1);
  const b = +ds.substring(s1 + 1, s2);
  let y = +ds.substring(s2 + 1);

  if (y < 100) y += y < 50 ? 2000 : 1900;

  let day: number, month: number;
  if (a > 12) { day = a; month = b; }
  else if (b > 12) { month = a; day = b; }
  else { day = a; month = b; } // default DD/MM/YYYY

  // Parse time: "4:37:03 pm" / "16:37" / "4:37 pm"
  const tLen = timeStr.length;
  const lastTwo = timeStr.substring(tLen - 2).toLowerCase();
  const isPM = lastTwo === 'pm';
  const isAM = lastTwo === 'am';
  const timeClean = (isPM || isAM) ? timeStr.substring(0, tLen - 2).trim() : timeStr.trim();

  const c1 = timeClean.indexOf(':');
  const c2 = timeClean.indexOf(':', c1 + 1);

  let hours = +timeClean.substring(0, c1);
  const minutes = c2 === -1 ? +timeClean.substring(c1 + 1) : +timeClean.substring(c1 + 1, c2);
  const seconds = c2 === -1 ? 0 : +timeClean.substring(c2 + 1);

  if (isPM && hours !== 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  // Use new Date() for local timezone (WhatsApp exports use local time)
  return new Date(y, month - 1, day, hours, minutes, seconds).getTime();
}

/** Strip all U+200E (left-to-right mark) chars from a string */
function stripLRM(s: string): string {
  // Fast path: most messages don't have U+200E
  if (s.indexOf('\u200e') === -1) return s;
  return s.replace(/\u200e/g, '');
}

function checkMedia(lower: string): boolean {
  const clean = stripLRM(lower);
  for (let i = 0; i < MEDIA_PATTERNS.length; i++) {
    if (clean.includes(MEDIA_PATTERNS[i])) return true;
  }
  return false;
}

function checkSystem(lower: string): boolean {
  const clean = stripLRM(lower);
  for (let i = 0; i < SYSTEM_PATTERNS.length; i++) {
    if (clean.includes(SYSTEM_PATTERNS[i])) return true;
  }
  return false;
}

function checkDeleted(lower: string): boolean {
  const clean = stripLRM(lower);
  for (let i = 0; i < DELETED_PATTERNS.length; i++) {
    if (clean.includes(DELETED_PATTERNS[i])) return true;
  }
  return false;
}

function checkCall(lower: string): { isCall: boolean; durationSeconds: number } {
  // Strip U+200E before checking — WhatsApp embeds these in call messages
  const clean = stripLRM(lower);
  for (let i = 0; i < CALL_KEYWORDS.length; i++) {
    if (clean.includes(CALL_KEYWORDS[i])) {
      const durationSeconds = parseCallDuration(clean);
      return { isCall: true, durationSeconds };
    }
  }
  return { isCall: false, durationSeconds: 0 };
}

/**
 * Parse a WhatsApp chat export text into structured data.
 * Optimized for very large files (800K+ lines).
 */
export function parseWhatsAppChat(
  content: string,
  onProgress?: (percent: number) => void,
): ParsedChat {
  const lines = content.split('\n');
  const totalLines = lines.length;
  // Pre-allocate with estimated capacity (most lines are messages)
  const messages: ParsedMessage[] = [];
  const participantSet = new Set<string>();

  let currentMessage: ParsedMessage | null = null;
  let progressCounter = 0;

  for (let i = 0; i < totalLines; i++) {
    // Report progress every 50k lines (less frequent = faster)
    if (onProgress) {
      progressCounter++;
      if (progressCounter >= 50000) {
        progressCounter = 0;
        onProgress(Math.round((i / totalLines) * 100));
      }
    }

    const line = lines[i];

    // ---- Fast-path: skip lines that can't start a message ----
    // WhatsApp messages start with '[' or a digit (for non-bracket format) or U+200E
    const ch0 = line.charCodeAt(0);
    // '[' = 91, '0'-'9' = 48-57, U+200E = 8206
    const couldBeMessage = ch0 === 91 || (ch0 >= 48 && ch0 <= 57) || ch0 === 8206;

    if (couldBeMessage) {
      const lineMatch = MESSAGE_LINE_REGEX.exec(line);
      if (lineMatch) {
        // Save previous message
        if (currentMessage) {
          messages.push(currentMessage);
        }

        const timestamp = parseDateTimeToEpoch(lineMatch[1], lineMatch[2]);
        const rest = lineMatch[3];

        const senderMatch = SENDER_MESSAGE_REGEX.exec(rest);

        if (senderMatch) {
          const sender = senderMatch[1].trim();
          // Remove leading U+200E from sender name
          const cleanSender = sender.charCodeAt(0) === 8206 ? sender.substring(1) : sender;
          const messageText = senderMatch[2];
          // Single lowercase for all checks
          const lower = messageText.toLowerCase();

          // Check call and deleted FIRST (should not be marked as system messages)
          const callInfo = checkCall(lower);
          const isDeleted = !callInfo.isCall && checkDeleted(lower);
          const isSys = (callInfo.isCall || isDeleted) ? false : checkSystem(lower);
          const isMedia = (callInfo.isCall || isDeleted) ? false : checkMedia(lower);

          // Add sender to participants (calls and deleted msgs have senders too)
          if (!isSys) {
            participantSet.add(cleanSender);
          }

          currentMessage = {
            timestamp,
            sender: cleanSender,
            message: messageText,
            isSystemMessage: isSys,
            isMedia,
            isCall: callInfo.isCall,
            isDeleted,
            callDurationSeconds: callInfo.durationSeconds,
          };
        } else {
          // System message (no sender)
          const lower = rest.toLowerCase();
          const callInfo = checkCall(lower);

          currentMessage = {
            timestamp,
            sender: '',
            message: rest,
            isSystemMessage: true,
            isMedia: false,
            isCall: callInfo.isCall,
            isDeleted: false,
            callDurationSeconds: callInfo.durationSeconds,
          };
        }
        continue;
      }
    }

    // Continuation of multiline message
    if (currentMessage && line.length > 0) {
      currentMessage.message += '\n' + line;
    }
  }

  // Don't forget the last message
  if (currentMessage) {
    messages.push(currentMessage);
  }

  const participants = Array.from(participantSet);

  // Filter system messages — but keep calls in the list for call stats
  const userMessages = messages.filter(m => !m.isSystemMessage);

  const startDate = userMessages.length > 0 ? userMessages[0].timestamp : Date.now();
  const endDate = userMessages.length > 0 ? userMessages[userMessages.length - 1].timestamp : Date.now();

  if (onProgress) onProgress(100);

  return {
    messages: userMessages,
    participants,
    startDate,
    endDate,
    totalMessages: userMessages.length,
  };
}
