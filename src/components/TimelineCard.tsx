import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import type { TimelineResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';
import {
  CHART_COLORS, GRID_COLOR, TOOLTIP_STYLE, TOOLTIP_LABEL_STYLE,
  TOOLTIP_ITEM_STYLE, CURSOR_STYLE, AXIS_TICK, HEATMAP_COLOR,
} from './chartTheme';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  data: TimelineResult;
  participants: string[];
}

const ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10 H21 M16 2 V6 M8 2 V6"/>
  </svg>
);

export function TimelineCard({ data, participants }: Props) {
  const dn = useDisplayName();
  const hourlyData = data.hourlyActivity.map(h => ({
    hour: `${h.hour}:00`,
    messages: h.count,
  }));

  const dowData = data.dayOfWeekActivity.map(d => ({
    day: DAY_NAMES_SHORT[d.day],
    messages: d.count,
  }));

  const monthlyData = data.monthlyActivity.map(m => ({
    month: m.month,
    total: m.count,
    ...m.perParticipant,
  }));

  const dailyTrendData = data.dailyTrend.slice(-90).map(d => ({
    date: d.date.substring(5),
    total: d.count,
    ...d.perParticipant,
  }));

  return (
    <ResultCard title="Timeline" icon={ICON}>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.peakHour}:00</div>
          <div className="stat-label">Peak Hour</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.peakDayOfWeek}</div>
          <div className="stat-label">Most Active Day</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.mostActiveDay.date}</div>
          <div className="stat-label">Busiest Day ({data.mostActiveDay.count.toLocaleString()} msgs)</div>
        </div>
      </div>

      <h3 className="subsection-title">Messages per Month (per person)</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="month" tick={{ ...AXIS_TICK, fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis tick={AXIS_TICK} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#555" strokeWidth={1} dot={false} name="Total" />
            {participants.map((p, i) => (
              <Line key={p} type="monotone" dataKey={p} name={dn(p)} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {dailyTrendData.length > 0 && (
        <>
          <h3 className="subsection-title">Daily Trend (last 90 days)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis dataKey="date" tick={{ ...AXIS_TICK, fontSize: 9 }} angle={-45} textAnchor="end" height={50} interval={6} />
                <YAxis tick={AXIS_TICK} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
                <Legend />
                {participants.map((p, i) => (
                  <Bar key={p} dataKey={p} name={dn(p)} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <h3 className="subsection-title">Activity by Hour of Day</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="hour" tick={{ ...AXIS_TICK, fontSize: 10 }} />
            <YAxis tick={AXIS_TICK} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
            <Bar dataKey="messages" fill={CHART_COLORS[0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="subsection-title">Activity by Day of Week</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dowData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="day" tick={AXIS_TICK} />
            <YAxis tick={AXIS_TICK} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} itemStyle={TOOLTIP_ITEM_STYLE} cursor={CURSOR_STYLE} />
            <Bar dataKey="messages" fill={CHART_COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3 className="subsection-title">Activity Heatmap (Day x Hour)</h3>
      <div className="heatmap-container">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: 24 }, (_, i) => (
                <th key={i}>{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
              const cells = data.heatmap.filter(h => h.day === dayIdx);
              const maxCount = Math.max(...data.heatmap.map(h => h.count), 1);
              return (
                <tr key={dayIdx}>
                  <td className="heatmap-day">{DAY_NAMES_SHORT[dayIdx]}</td>
                  {cells.map(cell => {
                    const intensity = cell.count / maxCount;
                    const bg = `${HEATMAP_COLOR} ${intensity})`;
                    return (
                      <td
                        key={cell.hour}
                        className="heatmap-cell"
                        style={{ backgroundColor: bg }}
                        title={`${DAY_NAMES_SHORT[cell.day]} ${cell.hour}:00 — ${cell.count} messages`}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ResultCard>
  );
}
