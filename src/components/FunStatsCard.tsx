import type { ReactNode } from 'react';
import type { FunStatsResult } from '../parser/types';
import { useDisplayName } from '../contexts/NameContext';
import { ResultCard } from './ResultCard';

function formatTime(ms: number): string {
  if (ms === 0) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatHour(h: number): string {
  const hour = Math.floor(h);
  const mins = Math.round((h - hour) * 60);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
}

interface Props {
  data: FunStatsResult;
  participants: string[];
}

export function FunStatsCard({ data, participants }: Props) {
  const dn = useDisplayName();
  // Compute total platform counts for display
  const totalYT = participants.reduce((s, p) => s + (data.youtubeCount[p] || 0), 0);
  const totalSpotify = participants.reduce((s, p) => s + (data.spotifyCount[p] || 0), 0);
  const totalIG = participants.reduce((s, p) => s + (data.instagramCount[p] || 0), 0);
  const totalTT = participants.reduce((s, p) => s + (data.tiktokCount[p] || 0), 0);
  const totalTW = participants.reduce((s, p) => s + (data.twitterCount[p] || 0), 0);
  const hasAnyPlatform = totalYT + totalSpotify + totalIG + totalTT + totalTW > 0;

  return (
    <ResultCard title="Fun & Insightful Stats" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2 L14 8 L20 8 L15 12 L17 19 L12 15 L7 19 L9 12 L4 8 L10 8 Z"/></svg>}>
      {/* ---- Head-to-head comparisons ---- */}
      <div className="h2h-grid">
        <H2HRow
          label="Who laughs more"
          winner={data.whoLaughsMore}
          values={participants.map(p => data.laughterCount[p] || 0)}
          participants={participants}
          unit="times"
          dn={dn}
        />
        <H2HRow
          label="Who double-texts more"
          winner={data.whoDoubleTextsMore}
          values={participants.map(p => data.doubleTextCount[p] || 0)}
          participants={participants}
          unit="times"
          description="Sending another message after 5+ min with no reply"
          dn={dn}
        />
        <H2HRow
          label="Who deletes more messages"
          winner={data.whoDeletesMore}
          values={participants.map(p => data.deletedCount[p] || 0)}
          participants={participants}
          unit="deleted"
          dn={dn}
        />
        <H2HRow
          label="Who asks more questions"
          winner={data.whoAsksMore}
          values={participants.map(p => data.questionCount[p] || 0)}
          participants={participants}
          unit="?"
          dn={dn}
        />
        <H2HRow
          label="Who SHOUTS more (ALL CAPS)"
          winner={data.whoShoutsMore}
          values={participants.map(p => data.capsCount[p] || 0)}
          participants={participants}
          unit="msgs"
          dn={dn}
        />
        <H2HRow
          label="Who apologizes more"
          winner={data.whoApologizesMore}
          values={participants.map(p => data.apologyCount[p] || 0)}
          participants={participants}
          unit="times"
          dn={dn}
        />
        <H2HRow
          label="Night owl (00:00–05:00)"
          winner={data.nightOwl}
          values={participants.map(p => data.lateNightCount[p] || 0)}
          participants={participants}
          unit="msgs"
          dn={dn}
        />
      </div>

      {/* ---- Good morning / Good night ---- */}
      <h3 className="subsection-title">Greetings</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{data.totalGoodMorning.toLocaleString()}</div>
          <div className="stat-label">Good Mornings</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{data.totalGoodNight.toLocaleString()}</div>
          <div className="stat-label">Good Nights</div>
        </div>
        {participants.map(p => (
          <div className="stat-item" key={p + '-gm'}>
            <div className="stat-value">{(data.goodMorningCount[p] || 0).toLocaleString()}</div>
            <div className="stat-label">{dn(p)}'s Good Mornings</div>
          </div>
        ))}
        {participants.map(p => (
          <div className="stat-item" key={p + '-gn'}>
            <div className="stat-value">{(data.goodNightCount[p] || 0).toLocaleString()}</div>
            <div className="stat-label">{dn(p)}'s Good Nights</div>
          </div>
        ))}
      </div>

      {/* ---- Texting habits ---- */}
      <h3 className="subsection-title">Texting Habits</h3>
      <div className="stats-grid">
        {participants.map(p => (
          <div className="stat-item" key={p + '-avgh'}>
            <div className="stat-value">{formatHour(data.avgMessageHour[p] || 0)}</div>
            <div className="stat-label">{dn(p)}'s Avg Text Time</div>
          </div>
        ))}
        {participants.map(p => (
          <div className="stat-item" key={p + '-1w'}>
            <div className="stat-value">{data.oneWordMessagePercent[p] || 0}%</div>
            <div className="stat-label">{dn(p)}'s One-Word Msgs</div>
          </div>
        ))}
        {participants.map(p => (
          <div className="stat-item" key={p + '-epm'}>
            <div className="stat-value">{data.emojisPerMessage[p] || 0}</div>
            <div className="stat-label">{dn(p)}'s Emojis/Msg</div>
          </div>
        ))}
      </div>

      {/* ---- Monologue & Ghost ---- */}
      <h3 className="subsection-title">Monologue & Ghost</h3>
      <div className="stats-grid">
        {participants.map(p => (
          <div className="stat-item" key={p + '-mono'}>
            <div className="stat-value">{(data.longestMonologue[p] || 0).toLocaleString()}</div>
            <div className="stat-label">{dn(p)}'s Longest Monologue</div>
          </div>
        ))}
        {participants.map(p => (
          <div className="stat-item" key={p + '-ghost'}>
            <div className="stat-value">{formatTime(data.slowestResponse[p] || 0)}</div>
            <div className="stat-label">{dn(p)}'s Slowest Reply</div>
          </div>
        ))}
      </div>

      {/* ---- Platform link breakdown ---- */}
      {hasAnyPlatform && (
        <>
          <h3 className="subsection-title">Who Shares More</h3>
          <div className="platform-grid">
            {totalYT > 0 && (
              <PlatformRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10,8 16,12 10,16"/></svg>}
                label="YouTube"
                values={participants.map(p => data.youtubeCount[p] || 0)}
                participants={participants}
                dn={dn}
              />
            )}
            {totalSpotify > 0 && (
              <PlatformRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 15 Q12 13 16 15 M7 12 Q12 10 17 12 M6 9 Q12 7 18 9"/></svg>}
                label="Spotify"
                values={participants.map(p => data.spotifyCount[p] || 0)}
                participants={participants}
                dn={dn}
              />
            )}
            {totalIG > 0 && (
              <PlatformRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/></svg>}
                label="Instagram"
                values={participants.map(p => data.instagramCount[p] || 0)}
                participants={participants}
                dn={dn}
              />
            )}
            {totalTT > 0 && (
              <PlatformRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v14a4 4 0 1 1-3-3.87"/><path d="M17 2a5 5 0 0 0 5 5"/></svg>}
                label="TikTok"
                values={participants.map(p => data.tiktokCount[p] || 0)}
                participants={participants}
                dn={dn}
              />
            )}
            {totalTW > 0 && (
              <PlatformRow
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 4s-2 .5-3 .5c-1-1-2.5-1.5-4-1a4 4 0 0 0-3 4c-4 0-8-2-10.5-5.5-.5 2 0 4 1.5 5.5-1 0-2-.5-2-.5 0 2 1.5 4 3.5 4.5-1 0-2 0-2 0 1 2 3 3 5 3-2 1.5-4.5 2-7 2 10 6 20-2 20-12 0-.5 0-1 0-1.5A8 8 0 0 0 22 4Z"/></svg>}
                label="Twitter/X"
                values={participants.map(p => data.twitterCount[p] || 0)}
                participants={participants}
                dn={dn}
              />
            )}
          </div>
        </>
      )}

      {/* ---- Top Phrases ---- */}
      {data.topPhrases.length > 0 && (
        <>
          <h3 className="subsection-title">Most Used Phrases</h3>
          <div className="phrase-list">
            {data.topPhrases.slice(0, 15).map((p, i) => (
              <div key={i} className="phrase-item">
                <span className="phrase-rank">#{i + 1}</span>
                <span className="phrase-text">"{p.phrase}"</span>
                <span className="phrase-count">{p.count.toLocaleString()}x</span>
              </div>
            ))}
          </div>

          {participants.map(person => {
            const phrases = data.topPhrasesPerParticipant[person] || [];
            if (phrases.length === 0) return null;
            return (
              <div key={person}>
                <h4 className="subsection-title-small">{dn(person)}'s Signature Phrases</h4>
                <div className="phrase-list compact">
                  {phrases.slice(0, 10).map((p, i) => (
                    <div key={i} className="phrase-item">
                      <span className="phrase-text">"{p.phrase}"</span>
                      <span className="phrase-count">{p.count.toLocaleString()}x</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </>
      )}
    </ResultCard>
  );
}

// ---- Head-to-Head comparison row ----
function H2HRow({
  label,
  winner,
  values,
  participants,
  unit,
  description,
  dn,
}: {
  label: string;
  winner: string;
  values: number[];
  participants: string[];
  unit: string;
  description?: string;
  dn: (name: string) => string;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="h2h-row">
      <div className="h2h-label">
        {label}
        {description && <span className="h2h-description"> — {description}</span>}
      </div>
      <div className="h2h-bar-container">
        {participants.map((p, i) => {
          const pct = total > 0 ? Math.max(8, (values[i] / total) * 100) : 50;
          const isWinner = p === winner;
          return (
            <div
              key={p}
              className={`h2h-bar-segment ${isWinner ? 'winner' : ''} ${i === 0 ? 'left' : 'right'}`}
              style={{ width: `${pct}%` }}
            >
              <span className="h2h-bar-name">{dn(p)}</span>
              <span className="h2h-bar-value">{values[i].toLocaleString()} {unit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Platform link row ----
function PlatformRow({
  icon,
  label,
  values,
  participants,
  dn,
}: {
  icon: ReactNode;
  label: string;
  values: number[];
  participants: string[];
  dn: (name: string) => string;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="platform-row">
      <div className="platform-icon">{icon}</div>
      <div className="platform-label">{label}</div>
      <div className="platform-total">{total}</div>
      <div className="platform-breakdown">
        {participants.map((p, i) => (
          <span key={p} className="platform-person">
            {dn(p)}: {values[i]}
          </span>
        ))}
      </div>
    </div>
  );
}
