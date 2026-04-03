import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect, useRef } from 'react';

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds
const ONLINE_THRESHOLD = 90_000;   // 3 minutes

export function usePresence(roomCode: string | null, myRole: 'A' | 'B') {
  const heartbeatMutation = useMutation(api.presence.heartbeat);
  const presenceData = useQuery(
    api.presence.getPresence,
    roomCode ? { roomCode } : 'skip',
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Send heartbeats
  useEffect(() => {
    if (!roomCode) return;

    const sendHeartbeat = () => {
      heartbeatMutation({ roomCode, role: myRole });
    };

    sendHeartbeat(); // immediate
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roomCode, myRole, heartbeatMutation]);

  // Determine partner's online status
  const partnerRole = myRole === 'A' ? 'B' : 'A';
  const partnerPresence = presenceData?.find((p) => p.role === partnerRole);
  const partnerOnline = partnerPresence
    ? Date.now() - partnerPresence.lastSeen < ONLINE_THRESHOLD
    : false;

  return { partnerOnline };
}
