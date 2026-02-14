import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { EmojiAnalysisResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';
import {
  CHART_COLORS, GRID_COLOR, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE, CURSOR_STYLE, AXIS_TICK,
} from './chartTheme';

interface Props {
  data: EmojiAnalysisResult;
}

const ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M8 14 Q12 18 16 14"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15" cy="9" r="1" fill="currentColor"/>
  </svg>
);

export function EmojiAnalysisCard({ data }: Props) {
  const dn = useDisplayName();
  const trendData = data.emojiOverTime.map(m => ({
    month: m.month,
    count: m.count,
  }));

  return (
    <ResultCard title="Emoji Analysis" icon={ICON}>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.totalEmojis.toLocaleString()}</div>
          <div className="stat-label">Total Emojis</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.heartEmojiCount.toLocaleString()}</div>
          <div className="stat-label">Heart Emojis</div>
        </div>
      </div>

      <h3 className="subsection-title">Most Used Emojis</h3>
      <div className="emoji-grid">
        {data.topEmojis.slice(0, 15).map((e, i) => (
          <div key={i} className="emoji-item">
            <span className="emoji-char">{e.emoji}</span>
            <span className="emoji-count">{e.count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <h3 className="subsection-title">Per Participant</h3>
      {data.perParticipant.map(p => (
        <div key={p.name} className="participant-emoji-section">
          <h4>{dn(p.name)} ({p.totalEmojis.toLocaleString()} emojis)</h4>
          <div className="emoji-grid">
            {p.topEmojis.slice(0, 10).map((e, i) => (
              <div key={i} className="emoji-item">
                <span className="emoji-char">{e.emoji}</span>
                <span className="emoji-count">{e.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {trendData.length > 0 && (
        <>
          <h3 className="subsection-title">Emoji Usage Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={{ ...AXIS_TICK, fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ResultCard>
  );
}
