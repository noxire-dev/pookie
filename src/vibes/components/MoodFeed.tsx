import { useEffect, useRef, useState } from 'react';
import type { DecryptedMood } from '../hooks/useMoods';
import { getMoodById } from './MoodPicker';

interface Props {
  myMood: DecryptedMood | null;
  partnerMood: DecryptedMood | null;
  decrypting: boolean;
}

function useTimeAgo(ts: number | null): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (ts === null) return;
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, [ts]);
  if (ts === null) return '';
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

function VibeCard({ mood, label, isEmpty, loading, pulse }: {
  mood: DecryptedMood | null;
  label: string;
  isEmpty: boolean;
  loading: boolean;
  pulse: boolean;
}) {
  const moodData = mood ? getMoodById(mood.mood) : null;
  const time = useTimeAgo(mood?.createdAt ?? null);

  // Glow color based on mood
  const glowColor = moodData?.color ?? 'transparent';
  const glowStyle = moodData ? {
    borderColor: `color-mix(in srgb, ${glowColor} 30%, var(--border))`,
    boxShadow: `0 0 24px color-mix(in srgb, ${glowColor} 10%, transparent)`,
  } : {};

  if (loading) {
    return (
      <div className="vibe-card vibe-card-empty">
        <p className="vibe-card-label">{label}</p>
        <div className="vibe-card-loading">
          <div className="vibe-card-loading-dot" />
          <div className="vibe-card-loading-dot" />
          <div className="vibe-card-loading-dot" />
        </div>
      </div>
    );
  }

  if (isEmpty || !mood || !moodData) {
    return (
      <div className="vibe-card vibe-card-empty">
        <p className="vibe-card-label">{label}</p>
        <div className="vibe-card-placeholder">
          <svg viewBox="0 0 32 32" fill="none" stroke="var(--pencil)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="vibe-card-placeholder-icon">
            <circle cx="16" cy="16" r="13" strokeDasharray="4 3" />
            <path d="M12 14 L14 14 M18 14 L20 14 M12 20 L20 20" />
          </svg>
          <p className="vibe-card-empty-text">no vibe set yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`vibe-card${pulse ? ' vibe-card-pulse' : ''}`} style={glowStyle}>
      <p className="vibe-card-label">{label}</p>
      <div className="vibe-card-mood">
        <svg viewBox="0 0 32 32" fill="none" stroke={moodData.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="vibe-card-icon">
          <path d={moodData.svg} />
        </svg>
        <span className="vibe-card-mood-name">{moodData.label}</span>
      </div>
      {mood.note && <p className="vibe-card-note">{mood.note}</p>}
      <span className="vibe-card-time">{time}</span>
    </div>
  );
}

export default function CurrentVibes({ myMood, partnerMood, decrypting }: Props) {
  const [partnerPulse, setPartnerPulse] = useState(false);
  const prevPartnerId = useRef<string | null>(null);

  // Pulse animation when partner mood changes
  useEffect(() => {
    if (!partnerMood) return;
    if (prevPartnerId.current !== null && prevPartnerId.current !== partnerMood.id) {
      setPartnerPulse(true);
      const timer = setTimeout(() => setPartnerPulse(false), 1200);
      return () => clearTimeout(timer);
    }
    prevPartnerId.current = partnerMood.id;
  }, [partnerMood]);

  return (
    <div className="current-vibes">
      <div className="vibes-pair">
        <VibeCard mood={myMood} label="you" isEmpty={!myMood} loading={false} pulse={false} />
        <div className="vibes-pair-divider">
          <svg viewBox="0 0 24 24" fill="none" className="vibes-pair-heart">
            <path d="M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z" fill="var(--accent)" opacity="0.3" />
          </svg>
        </div>
        <VibeCard mood={partnerMood} label="your pookie" isEmpty={!partnerMood} loading={decrypting && !partnerMood} pulse={partnerPulse} />
      </div>
    </div>
  );
}
