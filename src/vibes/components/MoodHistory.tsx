import { useState } from 'react';
import type { DecryptedMood } from '../hooks/useMoods';
import { getMoodById } from './MoodPicker';

interface Props {
  history: DecryptedMood[];
  myRole: 'A' | 'B';
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function MoodHistory({ history, myRole }: Props) {
  const [open, setOpen] = useState(false);

  if (history.length <= 2) return null; // Not enough history to show

  return (
    <div className="mood-history">
      <button className="mood-history-toggle" onClick={() => setOpen(!open)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--pencil)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mood-history-icon">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6 V12 L16 14" />
        </svg>
        <span>past vibes</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--pencil)" strokeWidth="2" strokeLinecap="round" className={`mood-history-chevron${open ? ' mood-history-chevron-open' : ''}`}>
          <path d="M8 10 L12 14 L16 10" />
        </svg>
      </button>

      {open && (
        <div className="mood-history-list">
          {history.slice(0, 20).map((m) => {
            const moodData = getMoodById(m.mood);
            const isMe = m.author === myRole;
            return (
              <div key={m.id} className={`mood-history-item${isMe ? ' mood-history-me' : ' mood-history-partner'}`}>
                <div className="mood-history-item-icon">
                  {moodData && (
                    <svg viewBox="0 0 32 32" fill="none" stroke={moodData.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={moodData.svg} />
                    </svg>
                  )}
                </div>
                <div className="mood-history-item-info">
                  <span className="mood-history-item-mood">{moodData?.label ?? m.mood}</span>
                  <span className="mood-history-item-who">{isMe ? 'you' : 'pookie'}</span>
                  {m.note && <span className="mood-history-item-note">{m.note}</span>}
                </div>
                <span className="mood-history-item-time">{timeAgo(m.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
