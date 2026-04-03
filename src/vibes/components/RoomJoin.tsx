import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { generateSalt, hashPassword } from '../crypto/encryption';
import { saveSession, type VibesSession } from '../crypto/session';

interface Props {
  onJoined: (session: VibesSession) => void;
}

export default function RoomJoin({ onJoined }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [password, setPassword] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const createRoomMutation = useMutation(api.rooms.createRoom);
  const confirmJoinMutation = useMutation(api.rooms.confirmJoin);

  // For join tab: fetch room to verify password
  const normalizedCode = roomCode.toUpperCase().trim();
  const roomData = useQuery(
    api.rooms.getRoom,
    tab === 'join' && normalizedCode.length === 6 ? { code: normalizedCode } : 'skip',
  );

  const handleCreate = async () => {
    if (password.length < 4) {
      setError('password needs at least 4 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const salt = generateSalt();
      const pwHash = await hashPassword(password);
      const { code } = await createRoomMutation({ salt, passwordHash: pwHash });
      setCreatedCode(code);
    } catch (e) {
      setError('something went wrong — try again');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAfterCreate = () => {
    if (!createdCode) return;
    const session: VibesSession = { roomCode: createdCode, password, role: 'A' };
    saveSession(session);
    onJoined(session);
  };

  const handleJoin = async () => {
    if (normalizedCode.length !== 6) {
      setError('room code must be 6 characters');
      return;
    }
    if (password.length < 4) {
      setError('password needs at least 4 characters');
      return;
    }
    if (!roomData) {
      setError("can't find that room — check the code");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const pwHash = await hashPassword(password);
      if (pwHash !== roomData.passwordHash) {
        setError('wrong password');
        setLoading(false);
        return;
      }
      await confirmJoinMutation({ code: normalizedCode, passwordHash: pwHash });
      const session: VibesSession = { roomCode: normalizedCode, password, role: 'B' };
      saveSession(session);
      onJoined(session);
    } catch (e) {
      setError('something went wrong — try again');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // After creating a room, show the code to share
  if (createdCode) {
    return (
      <div className="room-join">
        <div className="room-join-card">
          <div className="room-created">
            <svg viewBox="0 0 48 48" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="room-created-icon">
              <circle cx="24" cy="24" r="18" />
              <path d="M16 24 L22 30 L32 18" />
            </svg>
            <h2 className="room-created-title">room created!</h2>
            <p className="room-created-desc">share this code with your pookie:</p>
            <div className="room-code-display">{createdCode}</div>
            <p className="room-created-hint">and the password you just set — they'll need both to join</p>
            <button className="room-primary-btn" onClick={handleStartAfterCreate}>
              let's go
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-join">
      <div className="room-join-card">
        <div className="room-join-header">
          <a href="/" className="room-home-link">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path d="M20 36 C8 24 2 18 2 11 A8 8 0 0 1 20 9 A8 8 0 0 1 38 11 C38 18 32 24 20 36Z" fill="var(--accent)" opacity="0.75" />
            </svg>
          </a>
          <h1 className="room-join-title">Vibes</h1>
          <p className="room-join-subtitle">connect with your pookie</p>
        </div>

        <div className="room-tabs">
          <button
            className={`room-tab${tab === 'create' ? ' room-tab-active' : ''}`}
            onClick={() => { setTab('create'); setError(''); }}
          >
            create room
          </button>
          <button
            className={`room-tab${tab === 'join' ? ' room-tab-active' : ''}`}
            onClick={() => { setTab('join'); setError(''); }}
          >
            join room
          </button>
        </div>

        <div className="room-form">
          {tab === 'join' && (
            <div className="room-field">
              <label className="room-label">room code</label>
              <input
                type="text"
                className="room-input"
                placeholder="ABC123"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}
          <div className="room-field">
            <label className="room-label">
              {tab === 'create' ? 'choose a password' : 'enter password'}
            </label>
            <input
              type="password"
              className="room-input"
              placeholder="something only you two know"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (tab === 'create' ? handleCreate() : handleJoin())}
            />
          </div>

          {error && <p className="room-error">{error}</p>}

          <button
            className="room-primary-btn"
            onClick={tab === 'create' ? handleCreate : handleJoin}
            disabled={loading}
          >
            {loading ? 'working on it...' : tab === 'create' ? 'create room' : 'join room'}
          </button>

          {tab === 'create' && (
            <p className="room-hint">
              you'll get a room code to share with your partner
            </p>
          )}
          {tab === 'join' && (
            <p className="room-hint">
              your partner should have given you a code and password
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
