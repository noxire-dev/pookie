import type {
  ParsedChat,
  TimelineResult,
  MonthlyActivity,
  HourlyActivity,
  DayOfWeekActivity,
  HeatmapCell,
  DailyActivity,
  DailyTrendPoint,
} from '../parser/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Reusable Date for extraction — avoids creating Date objects per message */
const _d = new Date();

function dateToKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  const d = _d.getDate();
  return `${y}-${m < 10 ? '0' : ''}${m}-${d < 10 ? '0' : ''}${d}`;
}

function monthToKey(epoch: number): string {
  _d.setTime(epoch);
  const y = _d.getFullYear();
  const m = _d.getMonth() + 1;
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

function getHour(epoch: number): number {
  _d.setTime(epoch);
  return _d.getHours();
}

function getDay(epoch: number): number {
  _d.setTime(epoch);
  return _d.getDay();
}

/**
 * Computes timeline-related analytics from a parsed chat.
 */
export function analyzeTimeline(chat: ParsedChat): TimelineResult {
  const { messages, participants } = chat;

  // ---- Monthly activity ----
  const monthlyMap = new Map<string, { count: number; perParticipant: Record<string, number> }>();

  // ---- Fixed-size arrays for hourly and DOW ----
  const hourlyArr = new Int32Array(24);
  const dowArr = new Int32Array(7);
  const heatmapFlat = new Int32Array(7 * 24); // [day * 24 + hour]

  // ---- Daily activity (with per-participant) ----
  const dailyMap = new Map<string, { count: number; perParticipant: Record<string, number> }>();

  for (let i = 0; i < messages.length; i++) {
    const ts = messages[i].timestamp;
    const sender = messages[i].sender;

    // Monthly
    const mKey = monthToKey(ts);
    let mEntry = monthlyMap.get(mKey);
    if (!mEntry) {
      const pp: Record<string, number> = {};
      for (let p = 0; p < participants.length; p++) pp[participants[p]] = 0;
      mEntry = { count: 0, perParticipant: pp };
      monthlyMap.set(mKey, mEntry);
    }
    mEntry.count++;
    if (mEntry.perParticipant[sender] !== undefined) {
      mEntry.perParticipant[sender]++;
    }

    // Hourly + DOW + heatmap
    const hour = getHour(ts);
    const day = getDay(ts);
    hourlyArr[hour]++;
    dowArr[day]++;
    heatmapFlat[day * 24 + hour]++;

    // Daily
    const dKey = dateToKey(ts);
    let dEntry = dailyMap.get(dKey);
    if (!dEntry) {
      const pp: Record<string, number> = {};
      for (let p = 0; p < participants.length; p++) pp[participants[p]] = 0;
      dEntry = { count: 0, perParticipant: pp };
      dailyMap.set(dKey, dEntry);
    }
    dEntry.count++;
    if (dEntry.perParticipant[sender] !== undefined) {
      dEntry.perParticipant[sender]++;
    }
  }

  // ---- Build monthly activity sorted by month ----
  const monthlyActivity: MonthlyActivity[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      count: data.count,
      perParticipant: data.perParticipant,
    }));

  // ---- Build hourly activity ----
  const hourlyActivity: HourlyActivity[] = [];
  for (let h = 0; h < 24; h++) {
    hourlyActivity.push({ hour: h, count: hourlyArr[h] });
  }

  // ---- Build day of week activity ----
  const dayOfWeekActivity: DayOfWeekActivity[] = [];
  for (let d = 0; d < 7; d++) {
    dayOfWeekActivity.push({ day: d, dayName: DAY_NAMES[d], count: dowArr[d] });
  }

  // ---- Build heatmap ----
  const heatmap: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      heatmap.push({ day, hour, count: heatmapFlat[day * 24 + hour] });
    }
  }

  // ---- Build daily activity + daily trend (sorted) ----
  const sortedDailyEntries = Array.from(dailyMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  const dailyActivity: DailyActivity[] = [];
  const dailyTrend: DailyTrendPoint[] = [];
  let mostActiveDay: DailyActivity = { date: '', count: 0 };

  for (const [date, data] of sortedDailyEntries) {
    dailyActivity.push({ date, count: data.count });
    dailyTrend.push({ date, count: data.count, perParticipant: data.perParticipant });
    if (data.count > mostActiveDay.count) {
      mostActiveDay = { date, count: data.count };
    }
  }

  // ---- Peak hour ----
  let peakHour = 0;
  for (let h = 1; h < 24; h++) {
    if (hourlyArr[h] > hourlyArr[peakHour]) peakHour = h;
  }

  // ---- Peak day of week ----
  let peakDow = 0;
  for (let d = 1; d < 7; d++) {
    if (dowArr[d] > dowArr[peakDow]) peakDow = d;
  }

  return {
    monthlyActivity,
    hourlyActivity,
    dayOfWeekActivity,
    heatmap,
    mostActiveDay,
    dailyActivity,
    dailyTrend,
    peakHour,
    peakDayOfWeek: DAY_NAMES[peakDow],
  };
}
