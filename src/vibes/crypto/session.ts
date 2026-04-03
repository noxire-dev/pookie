export interface VibesSession {
  roomCode: string;
  password: string;
  role: 'A' | 'B';
}

const KEY = 'vibes-session';

export function saveSession(session: VibesSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function loadSession(): VibesSession | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VibesSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}
