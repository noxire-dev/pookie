import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { MediaStatsResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';
import {
  CHART_COLORS, GRID_COLOR, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE, CURSOR_STYLE, AXIS_TICK,
} from './chartTheme';

interface Props {
  data: MediaStatsResult;
  participants: string[];
}

const ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 3 L7 6 H3 V20 H21 V6 H17 L15 3 Z"/><circle cx="12" cy="13" r="4"/>
  </svg>
);

export function MediaStatsCard({ data, participants }: Props) {
  const dn = useDisplayName();
  const participantData = participants.map(p => ({
    name: dn(p),
    media: data.mediaPerParticipant[p] || 0,
  }));

  const trendData = data.mediaOverTime.map(m => ({
    month: m.month,
    media: m.count,
  }));

  return (
    <ResultCard title="Media Stats" icon={ICON}>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.totalMedia.toLocaleString()}</div>
          <div className="stat-label">Total Media Shared</div>
        </div>
        {participants.map(p => (
          <div className="stat-item" key={p}>
            <div className="stat-value">{(data.mediaPerParticipant[p] || 0).toLocaleString()}</div>
            <div className="stat-label">{dn(p)}</div>
          </div>
        ))}
      </div>

      {trendData.length > 0 && (
        <>
          <h3 className="subsection-title">Media Sharing Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData.slice(-24)}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={{ ...AXIS_TICK, fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
                <Bar dataKey="media" fill={CHART_COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {participantData.length > 0 && (
        <>
          <h3 className="subsection-title">Media per Participant</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={participantData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis type="number" tick={AXIS_TICK} />
                <YAxis type="category" dataKey="name" tick={{ ...AXIS_TICK, fontSize: 12 }} width={100} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
                <Bar dataKey="media" fill={CHART_COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ResultCard>
  );
}
