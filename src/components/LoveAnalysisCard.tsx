import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { LoveAnalysisResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';
import {
  CHART_COLORS, GRID_COLOR, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE, CURSOR_STYLE, AXIS_TICK,
} from './chartTheme';

interface Props {
  data: LoveAnalysisResult;
  participants: string[];
}

const ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z"/>
  </svg>
);

export function LoveAnalysisCard({ data, participants }: Props) {
  const dn = useDisplayName();
  const trendData = data.affectionOverTime.map(m => ({
    month: m.month,
    count: m.count,
  }));

  return (
    <ResultCard title="Love & Affection" icon={ICON}>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.totalAffectionMessages.toLocaleString()}</div>
          <div className="stat-label">Affection Messages</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.whoSaysLoveMore ? dn(data.whoSaysLoveMore) : 'N/A'}</div>
          <div className="stat-label">Says Love More</div>
        </div>
        {participants.map(p => (
          <div className="stat-item" key={p}>
            <div className="stat-value">{(data.affectionPerParticipant[p] || 0).toLocaleString()}</div>
            <div className="stat-label">{dn(p)}'s Affection Count</div>
          </div>
        ))}
      </div>

      {data.keywordCounts.length > 0 && (
        <>
          <h3 className="subsection-title">Top Love Keywords</h3>
          <div className="keyword-list">
            {data.keywordCounts.slice(0, 15).map(kw => (
              <div key={kw.keyword} className="keyword-item">
                <span className="keyword-text">"{kw.keyword}"</span>
                <span className="keyword-count">{kw.count.toLocaleString()}x</span>
                <span className="keyword-breakdown">
                  ({Object.entries(kw.perParticipant).map(([name, count]) =>
                    `${dn(name)}: ${count}`
                  ).join(', ')})
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.petNames.length > 0 && (
        <>
          <h3 className="subsection-title">Pet Names Used</h3>
          <div className="keyword-list">
            {data.petNames.slice(0, 15).map(pn => (
              <div key={pn.keyword} className="keyword-item">
                <span className="keyword-text">"{pn.keyword}"</span>
                <span className="keyword-count">{pn.count.toLocaleString()}x</span>
                <span className="keyword-breakdown">
                  ({Object.entries(pn.perParticipant).map(([name, count]) =>
                    `${dn(name)}: ${count}`
                  ).join(', ')})
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {trendData.length > 0 && (
        <>
          <h3 className="subsection-title">Affection Over Time</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="month" tick={{ ...AXIS_TICK, fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
                <Line type="monotone" dataKey="count" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </ResultCard>
  );
}
