import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect, useRef, useState } from 'react';

export function useNudge(roomCode: string | null, myRole: 'A' | 'B') {
  const latest = useQuery(
    api.nudges.latestNudge,
    roomCode ? { roomCode } : 'skip',
  );
  const sendNudgeMutation = useMutation(api.nudges.sendNudge);
  const [showNudge, setShowNudge] = useState(false);
  const lastSeenId = useRef<string | null>(null);

  // Detect new nudge from partner
  useEffect(() => {
    if (!latest) return;
    if (latest.from !== myRole && latest._id !== lastSeenId.current) {
      lastSeenId.current = latest._id;
      setShowNudge(true);
      const timer = setTimeout(() => setShowNudge(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [latest, myRole]);

  const sendNudge = async () => {
    if (!roomCode) return;
    await sendNudgeMutation({ roomCode, from: myRole });
  };

  return { showNudge, sendNudge };
}
