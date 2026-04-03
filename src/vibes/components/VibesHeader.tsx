import { useState } from 'react';
import { clearSession } from '../crypto/session';

interface Props {
  roomCode: string;
  onLeave: () => void;
  onNudge: () => void;
  showNudge: boolean;
  partnerOnline: boolean;
}

export default function VibesHeader({ roomCode, onLeave, onNudge, showNudge, partnerOnline }: Props) {
  const [copied, setCopied] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const handleLeave = () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      setTimeout(() => setConfirmLeave(false), 3000);
      return;
    }
    clearSession();
    onLeave();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <header className="vibes-header">
        <div className="vibes-header-left">
          <a href="/" className="vibes-home-link">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <path d="M20 36 C8 24 2 18 2 11 A8 8 0 0 1 20 9 A8 8 0 0 1 38 11 C38 18 32 24 20 36Z" fill="var(--accent)" opacity="0.75" />
            </svg>
          </a>
          <h1 className="vibes-title">Vibes</h1>
          <div className={`vibes-partner-status${partnerOnline ? ' vibes-partner-online' : ''}`} title={partnerOnline ? 'pookie is online' : 'pookie is away'}>
            <span className="vibes-status-dot" />
            <span className="vibes-status-text">{partnerOnline ? 'pookie online' : 'pookie away'}</span>
          </div>
        </div>
        <div className="vibes-header-right">
          <button className="vibes-nudge-btn" onClick={onNudge} title="Send a little nudge">
            <svg viewBox="0 0 24 24" fill="none" className="vibes-nudge-icon">
              <path d="M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z" fill="var(--accent)" opacity="0.7" />
            </svg>
          </button>
          <button className="vibes-room-badge" onClick={handleCopy} title="Copy room code">
            {copied ? 'copied!' : roomCode}
          </button>
          <button className={`vibes-leave-btn${confirmLeave ? ' vibes-leave-confirm' : ''}`} onClick={handleLeave}>
            {confirmLeave ? 'tap again to leave' : 'leave'}
          </button>
        </div>
      </header>

      {/* Nudge toast */}
      {showNudge && (
        <div className="nudge-toast">
          <svg viewBox="0 0 24 24" fill="none" className="nudge-toast-heart">
            <path d="M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z" fill="var(--accent)" />
          </svg>
          <span>your pookie is thinking of you</span>
        </div>
      )}
    </>
  );
}
