import { useEffect, useState, useCallback } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { loadSession, type VibesSession } from './crypto/session';
import { useEncryption } from './hooks/useEncryption';
import { useRoom } from './hooks/useRoom';
import { useMoods } from './hooks/useMoods';
import { useNudge } from './hooks/useNudge';
import { usePresence } from './hooks/usePresence';
import { useTabTitle } from './hooks/useTabTitle';
import RoomJoin from './components/RoomJoin';
import VibesHeader from './components/VibesHeader';
import MoodPicker from './components/MoodPicker';
import CurrentVibes from './components/MoodFeed';
import MoodHistory from './components/MoodHistory';

const STYLE_ID = 'vibes-app-style';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const css = `
*, *::before, *::after { box-sizing: border-box; }

.vibes-app {
  --bg: #1c1917;
  --surface: #231f1c;
  --surface-hover: #2a2521;
  --ink: #e8ddd0;
  --pencil: #9b8e7e;
  --accent: #d4817a;
  --accent-warm: #c4a882;
  --green: #7eb08a;
  --border: #362f2a;
  --font-hand: 'Caveat', cursive;
  --font-body: 'Kalam', cursive;

  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Paper grain */
.vibes-app::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* ---- Header ---- */
.vibes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 2;
}

.vibes-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vibes-home-link { display: flex; }

.vibes-title {
  font-family: var(--font-hand);
  font-size: 2.4rem;
  font-weight: 700;
  line-height: 1;
}

.vibes-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vibes-room-badge {
  font-family: var(--font-hand);
  font-size: 1.1rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(212,129,122,0.12);
  color: var(--accent);
  letter-spacing: 1.5px;
}

.vibes-leave-btn {
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--pencil);
  background: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.vibes-leave-btn:hover {
  color: var(--accent);
  border-color: var(--accent);
}
.vibes-leave-confirm {
  color: var(--accent) !important;
  border-color: var(--accent) !important;
  font-size: 0.8rem;
}

/* Partner status */
.vibes-partner-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
  opacity: 0.5;
  transition: opacity 0.3s;
}
.vibes-partner-online {
  opacity: 1;
}
.vibes-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pencil);
  transition: background 0.3s, box-shadow 0.3s;
}
.vibes-partner-online .vibes-status-dot {
  background: var(--green);
  box-shadow: 0 0 8px rgba(126,176,138,0.5);
}
.vibes-status-text {
  font-size: 0.75rem;
  color: var(--pencil);
  font-family: var(--font-body);
}

/* ---- Main content area ---- */
.vibes-content {
  flex: 1;
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ---- Current Vibes (status cards) ---- */
.current-vibes {
  width: 100%;
  margin-bottom: 2.5rem;
}

.vibes-pair {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
}

.vibes-pair-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  flex-shrink: 0;
}

.vibes-pair-heart {
  width: 28px;
  height: 28px;
}

.vibe-card {
  flex: 1;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 2rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-height: 200px;
  justify-content: center;
  transition: all 0.3s ease;
}

.vibe-card-label {
  font-family: var(--font-hand);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--pencil);
  margin-bottom: 0.5rem;
}

.vibe-card-mood {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vibe-card-icon {
  width: 64px;
  height: 64px;
}

.vibe-card-mood-name {
  font-family: var(--font-hand);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ink);
}

.vibe-card-note {
  font-size: 0.95rem;
  color: var(--ink);
  opacity: 0.8;
  max-width: 180px;
  line-height: 1.4;
}

.vibe-card-time {
  font-size: 0.8rem;
  color: var(--pencil);
  opacity: 0.5;
  margin-top: 4px;
}

.vibe-card-empty {
  opacity: 0.6;
}

.vibe-card-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.vibe-card-placeholder-icon {
  width: 56px;
  height: 56px;
  opacity: 0.4;
}

.vibe-card-empty-text {
  font-size: 0.9rem;
  color: var(--pencil);
}

.vibe-card-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.vibe-card-loading-text {
  font-family: var(--font-hand);
  font-size: 1.1rem;
  color: var(--pencil);
  opacity: 0.6;
}

/* ---- Set Vibe Button ---- */
.mood-set-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-family: var(--font-hand);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 16px 32px;
  cursor: pointer;
  transition: all 0.25s ease;
  width: 100%;
  max-width: 320px;
}

.mood-set-btn:hover:not(:disabled) {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(212,129,122,0.12);
}

.mood-set-btn-icon {
  width: 28px;
  height: 28px;
}

/* ---- Mood Picker ---- */
.mood-picker {
  width: 100%;
  animation: vibes-fade-in 0.25s ease;
}

.mood-picker-label {
  font-family: var(--font-hand);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  text-align: center;
}

.mood-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 1.25rem;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 8px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--ink);
}

.mood-btn:hover:not(:disabled) {
  border-color: var(--pencil);
  transform: translateY(-2px);
  background: var(--surface-hover);
}

.mood-btn-active {
  border-color: var(--accent) !important;
  background: rgba(212,129,122,0.08);
  box-shadow: 0 0 16px rgba(212,129,122,0.15);
}

.mood-icon {
  width: 40px;
  height: 40px;
}

.mood-btn-label {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--pencil);
}

.mood-note-area {
  display: flex;
  gap: 10px;
  animation: vibes-fade-in 0.2s ease;
}

.mood-note-input {
  flex: 1;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 14px 16px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s;
}
.mood-note-input:focus {
  border-color: var(--accent);
}
.mood-note-input::placeholder {
  color: var(--pencil);
  opacity: 0.5;
}

.mood-submit-btn {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 14px 24px;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
  white-space: nowrap;
}
.mood-submit-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.mood-cancel-btn {
  display: block;
  margin: 1rem auto 0;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: var(--pencil);
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 16px;
  transition: color 0.2s;
}
.mood-cancel-btn:hover {
  color: var(--accent);
}

/* ---- Room Join ---- */
.room-join {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg);
  position: relative;
}

.room-join::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.room-join-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 18px;
  padding: 3rem 2.5rem;
  max-width: 440px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.room-join-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.room-home-link {
  display: inline-flex;
  margin-bottom: 0.75rem;
}

.room-join-title {
  font-family: var(--font-hand);
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--ink);
  line-height: 1;
  margin-bottom: 0.35rem;
}

.room-join-subtitle {
  font-size: 1.05rem;
  color: var(--pencil);
}

/* Tabs */
.room-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg);
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 1.75rem;
}

.room-tab {
  flex: 1;
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 10px 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--pencil);
  cursor: pointer;
  transition: all 0.2s;
}

.room-tab-active {
  background: var(--surface);
  color: var(--ink);
}

/* Form */
.room-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.room-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.room-label {
  font-size: 0.95rem;
  color: var(--pencil);
}

.room-input {
  font-family: var(--font-body);
  font-size: 1.1rem;
  padding: 14px 16px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.2s;
}
.room-input:focus {
  border-color: var(--accent);
}
.room-input::placeholder {
  color: var(--pencil);
  opacity: 0.5;
}

.room-error {
  font-size: 0.95rem;
  color: var(--accent);
  text-align: center;
}

.room-primary-btn {
  font-family: var(--font-body);
  font-size: 1.1rem;
  padding: 14px 0;
  background: var(--accent);
  color: var(--bg);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
  margin-top: 0.5rem;
}
.room-primary-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.room-primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.room-hint {
  font-size: 0.9rem;
  color: var(--pencil);
  text-align: center;
  opacity: 0.7;
}

/* Created state */
.room-created {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.room-created-icon {
  width: 64px;
  height: 64px;
}

.room-created-title {
  font-family: var(--font-hand);
  font-size: 2.5rem;
  font-weight: 700;
}

.room-created-desc {
  font-size: 1.05rem;
  color: var(--pencil);
}

.room-code-display {
  font-family: var(--font-hand);
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: 5px;
  color: var(--accent);
  background: var(--bg);
  padding: 14px 32px;
  border-radius: 14px;
  border: 1.5px dashed var(--accent);
  user-select: all;
}

.room-created-hint {
  font-size: 0.9rem;
  color: var(--pencil);
  opacity: 0.7;
  max-width: 280px;
}

/* ---- Key deriving state ---- */
.vibes-deriving {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1.25rem;
  color: var(--pencil);
}

.vibes-deriving-text {
  font-family: var(--font-hand);
  font-size: 1.6rem;
}

/* ---- Nudge button ---- */
.vibes-nudge-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  padding: 0;
}
.vibes-nudge-btn:hover {
  border-color: var(--accent);
  transform: scale(1.1);
}
.vibes-nudge-btn:active {
  transform: scale(0.95);
}
.vibes-nudge-icon {
  width: 20px;
  height: 20px;
}

/* ---- Nudge toast ---- */
.nudge-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--surface);
  border: 1.5px solid var(--accent);
  border-radius: 14px;
  padding: 14px 24px;
  z-index: 50;
  animation: nudge-in 0.4s ease, nudge-out 0.4s ease 2.6s;
  box-shadow: 0 8px 32px rgba(212,129,122,0.2);
  font-size: 1rem;
}
.nudge-toast-heart {
  width: 22px;
  height: 22px;
  animation: nudge-heartbeat 0.6s ease infinite;
}
@keyframes nudge-in {
  from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
@keyframes nudge-out {
  from { opacity: 1; }
  to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}
@keyframes nudge-heartbeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
}

/* ---- Vibe card pulse ---- */
.vibe-card-pulse {
  animation: vibe-pulse 1.2s ease;
}
@keyframes vibe-pulse {
  0% { transform: scale(1); }
  15% { transform: scale(1.04); }
  30% { transform: scale(1); }
  45% { transform: scale(1.02); }
  60% { transform: scale(1); }
}

/* ---- Loading dots ---- */
.vibe-card-loading {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}
.vibe-card-loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--pencil);
  opacity: 0.4;
  animation: loading-dot 1.2s ease infinite;
}
.vibe-card-loading-dot:nth-child(2) { animation-delay: 0.15s; }
.vibe-card-loading-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes loading-dot {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.3; }
  40% { transform: scale(1); opacity: 0.7; }
}

/* ---- Mood History ---- */
.mood-history {
  width: 100%;
  margin-top: 2rem;
}

.mood-history-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.95rem;
  color: var(--pencil);
  background: none;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.mood-history-toggle:hover {
  border-color: var(--pencil);
  color: var(--ink);
}
.mood-history-icon {
  width: 18px;
  height: 18px;
}
.mood-history-chevron {
  width: 18px;
  height: 18px;
  transition: transform 0.2s;
  margin-left: auto;
}
.mood-history-chevron-open {
  transform: rotate(180deg);
}

.mood-history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  max-height: 360px;
  overflow-y: auto;
  animation: vibes-fade-in 0.2s ease;
}

.mood-history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  transition: background 0.15s;
}
.mood-history-me {
  background: rgba(212,129,122,0.04);
}
.mood-history-partner {
  background: rgba(196,168,130,0.04);
}
.mood-history-item-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}
.mood-history-item-icon svg {
  width: 100%;
  height: 100%;
}
.mood-history-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}
.mood-history-item-mood {
  font-family: var(--font-hand);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--ink);
}
.mood-history-item-who {
  font-size: 0.75rem;
  color: var(--pencil);
  opacity: 0.6;
}
.mood-history-item-note {
  width: 100%;
  font-size: 0.8rem;
  color: var(--ink);
  opacity: 0.6;
}
.mood-history-item-time {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--pencil);
  opacity: 0.4;
}

/* Scrollbar styling */
.mood-history-list::-webkit-scrollbar {
  width: 4px;
}
.mood-history-list::-webkit-scrollbar-track {
  background: transparent;
}
.mood-history-list::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

/* ---- Animations ---- */
@keyframes vibes-fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- Responsive ---- */
@media (max-width: 540px) {
  .vibes-header {
    padding: 1rem 1.25rem;
  }
  .vibes-status-text {
    display: none;
  }
  .vibes-leave-btn {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
  .vibes-content {
    padding: 1.5rem 1.25rem;
  }
  .vibes-pair {
    flex-direction: column;
    gap: 0;
  }
  .vibes-pair-divider {
    padding: 8px 0;
  }
  .vibe-card {
    min-height: 160px;
    padding: 1.5rem 1.25rem;
  }
  .vibe-card-icon {
    width: 52px;
    height: 52px;
  }
  .vibe-card-mood-name {
    font-size: 1.5rem;
  }
  .mood-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .room-join-card {
    padding: 2.5rem 1.75rem;
  }
  .mood-note-area {
    flex-direction: column;
  }
}
`;

function VibesInner({ session, onLeave }: { session: VibesSession; onLeave: () => void }) {
  const room = useRoom(session.roomCode);
  const { ready, encrypt, decrypt } = useEncryption(session.password, room?.salt ?? null);
  const { showNudge, sendNudge } = useNudge(
    ready ? session.roomCode : null,
    session.role,
  );
  const { partnerOnline } = usePresence(
    ready ? session.roomCode : null,
    session.role,
  );
  useTabTitle(showNudge);

  const stableDecrypt = useCallback(
    (ciphertext: string, iv: string) => decrypt(ciphertext, iv),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready],
  );

  const { latestA, latestB, history, decrypting, setMood } = useMoods(
    ready ? session.roomCode : null,
    ready ? stableDecrypt : null,
  );

  const myMood = session.role === 'A' ? latestA : latestB;
  const partnerMood = session.role === 'A' ? latestB : latestA;

  const handleSetMood = async (mood: string, note: string) => {
    await setMood(session.roomCode, encrypt, mood, note, session.role);
  };

  if (!ready) {
    return (
      <div className="vibes-app">
        <div className="vibes-deriving">
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none">
            <path d="M20 36 C8 24 2 18 2 11 A8 8 0 0 1 20 9 A8 8 0 0 1 38 11 C38 18 32 24 20 36Z" fill="var(--accent)" opacity="0.75" />
          </svg>
          <p className="vibes-deriving-text">setting up your vibes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vibes-app">
      <VibesHeader roomCode={session.roomCode} onLeave={onLeave} onNudge={sendNudge} showNudge={showNudge} partnerOnline={partnerOnline} />
      <main className="vibes-content">
        <CurrentVibes myMood={myMood} partnerMood={partnerMood} decrypting={decrypting} />
        <MoodPicker onSubmit={handleSetMood} currentMood={myMood?.mood ?? null} />
        <MoodHistory history={history} myRole={session.role} />
      </main>
    </div>
  );
}

export default function VibesApp() {
  const [session, setSession] = useState<VibesSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = css;
      document.head.appendChild(el);
    }
    setSession(loadSession());
    setReady(true);
    return () => { document.getElementById(STYLE_ID)?.remove(); };
  }, []);

  if (!ready) return null;

  return (
    <ConvexProvider client={convex}>
      {session ? (
        <VibesInner session={session} onLeave={() => setSession(null)} />
      ) : (
        <div className="vibes-app">
          <RoomJoin onJoined={setSession} />
        </div>
      )}
    </ConvexProvider>
  );
}
