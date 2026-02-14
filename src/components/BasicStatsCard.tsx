import type { BasicStatsResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';

function formatTime(ms: number): string {
  if (ms === 0) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatCallDuration(totalSeconds: number): string {
  if (totalSeconds === 0) return 'N/A';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

interface Props {
  data: BasicStatsResult;
}

export function BasicStatsCard({ data }: Props) {
  const dn = useDisplayName();
  const call = data.callStats;

  return (
    <ResultCard title="Basic Stats" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="10" rx="1"/><rect x="10" y="6" width="4" height="16" rx="1"/><rect x="17" y="2" width="4" height="20" rx="1"/></svg>}>
      {/* ---- Big hero stats for each participant ---- */}
      <div className="participant-hero-grid">
        {data.participants.map(p => (
          <div key={p.name} className="participant-hero">
            <div className="participant-hero-name">{dn(p.name)}</div>
            <div className="participant-hero-stat">
              <span className="hero-value">{p.messageCount.toLocaleString()}</span>
              <span className="hero-label">messages</span>
            </div>
            <div className="participant-hero-stat">
              <span className="hero-value">{p.totalWords.toLocaleString()}</span>
              <span className="hero-label">words</span>
            </div>
            <div className="participant-hero-stat">
              <span className="hero-value">{p.initiatedConversations}</span>
              <span className="hero-label">started convos</span>
            </div>
            <div className="participant-hero-stat">
              <span className="hero-value">{formatTime(data.averageResponseTimeMs[p.name] || 0)}</span>
              <span className="hero-label">avg response</span>
            </div>
            <div className="participant-hero-stat">
              <span className="hero-value">{formatTime(data.fastestResponseTimeMs[p.name] || 0)}</span>
              <span className="hero-label">fastest reply</span>
            </div>
            <div className="participant-hero-stat">
              <span className="hero-value">{(data.whoTextsFirstInMorning[p.name] || 0).toLocaleString()}</span>
              <span className="hero-label">morning first texts</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Overall stats ---- */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.totalMessages.toLocaleString()}</div>
          <div className="stat-label">Total Messages</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.totalWords.toLocaleString()}</div>
          <div className="stat-label">Total Words</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.messagesPerDay}</div>
          <div className="stat-label">Messages / Day</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.activeDays.toLocaleString()}</div>
          <div className="stat-label">Active Days</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.longestStreak}</div>
          <div className="stat-label">Longest Streak (days)</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.totalDays.toLocaleString()}</div>
          <div className="stat-label">Total Days Span</div>
        </div>
      </div>

      {/* ---- Call stats ---- */}
      {call.totalCalls > 0 && (
        <>
          <h3 className="subsection-title">Voice & Video Calls</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{call.totalCalls.toLocaleString()}</div>
              <div className="stat-label">Total Calls</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatCallDuration(call.totalCallDurationSeconds)}</div>
              <div className="stat-label">Total Call Time</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{formatCallDuration(call.longestCallSeconds)}</div>
              <div className="stat-label">Longest Call</div>
            </div>
            {data.participants.map(p => (
              <div className="stat-item" key={p.name + '-calls'}>
                <div className="stat-value">{(call.callsPerParticipant[p.name] || 0).toLocaleString()}</div>
                <div className="stat-label">{dn(p.name)}'s Calls</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---- Detail table ---- */}
      <h3 className="subsection-title">Detailed Breakdown</h3>
      <div className="participants-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Messages</th>
              <th>Words</th>
              <th>Avg Msg Len</th>
              <th>Avg Words/Msg</th>
              <th>Started Convos</th>
              <th>Avg Response</th>
              <th>Fastest Reply</th>
            </tr>
          </thead>
          <tbody>
            {data.participants.map(p => (
              <tr key={p.name}>
                <td><strong>{dn(p.name)}</strong></td>
                <td>{p.messageCount.toLocaleString()}</td>
                <td>{p.totalWords.toLocaleString()}</td>
                <td>{p.avgMessageLength} chars</td>
                <td>{p.avgWordsPerMessage}</td>
                <td>{p.initiatedConversations}</td>
                <td>{formatTime(data.averageResponseTimeMs[p.name] || 0)}</td>
                <td>{formatTime(data.fastestResponseTimeMs[p.name] || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResultCard>
  );
}
