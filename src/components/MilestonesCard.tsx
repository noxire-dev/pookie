import type { MilestonesResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function formatDate(epoch: number | string): string {
  const date = typeof epoch === 'string' ? new Date(epoch) : new Date(epoch);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  data: MilestonesResult;
}

export function MilestonesCard({ data }: Props) {
  const dn = useDisplayName();
  return (
    <ResultCard title="Milestones" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 21 H16 M12 17 V21 M5 3 H19 V8 A7 7 0 0 1 12 17 A7 7 0 0 1 5 8 Z M5 5 H2 V9 H5 M19 5 H22 V9 H19"/></svg>}>
      {data.firstMessage && (
        <div className="milestone-item highlight">
          <div className="milestone-label">First Ever Message</div>
          <div className="milestone-date">{formatDate(data.firstMessage.timestamp)}</div>
          <div className="milestone-detail">
            <strong>{dn(data.firstMessage.sender)}:</strong> "{data.firstMessage.message.substring(0, 200)}"
          </div>
        </div>
      )}

      {data.messageMilestones.length > 0 && (
        <>
          <h3 className="subsection-title">Message Milestones</h3>
          {data.messageMilestones.map((ms, i) => (
            <div key={i} className="milestone-item">
              <div className="milestone-label">{ms.label}</div>
              {ms.date && <div className="milestone-date">{formatDate(ms.date)}</div>}
              {ms.message && (
                <div className="milestone-detail">
                  <strong>{dn(ms.message.sender)}:</strong> "{ms.message.message.substring(0, 150)}"
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {data.longestMessage && (
        <div className="milestone-item">
          <div className="milestone-label">Longest Message ({data.longestMessage.message.length.toLocaleString()} chars)</div>
          <div className="milestone-date">{formatDate(data.longestMessage.timestamp)}</div>
          <div className="milestone-detail">
            <strong>{dn(data.longestMessage.sender)}:</strong> "{data.longestMessage.message.substring(0, 300)}..."
          </div>
        </div>
      )}

      {data.longestGap && (
        <div className="milestone-item">
          <div className="milestone-label">Longest Gap: {formatDuration(data.longestGap.durationMs)}</div>
          <div className="milestone-date">
            {formatDate(data.longestGap.startDate)} — {formatDate(data.longestGap.endDate)}
          </div>
        </div>
      )}

      {data.mostMessagesInADay && (
        <div className="milestone-item">
          <div className="milestone-label">Most Messages in a Day</div>
          <div className="milestone-date">{data.mostMessagesInADay.date}</div>
          <div className="milestone-detail">{data.mostMessagesInADay.count.toLocaleString()} messages</div>
        </div>
      )}

      {data.anniversaries.length > 0 && (
        <>
          <h3 className="subsection-title">Chat Anniversaries</h3>
          <div className="anniversary-list">
            {data.anniversaries.map((a, i) => (
              <div key={i} className="anniversary-item">
                <span className="anniversary-label">{a.label}</span>
                <span className="anniversary-date">{formatDate(a.date)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ResultCard>
  );
}
