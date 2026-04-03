import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export function useRoom(roomCode: string | null) {
  const room = useQuery(
    api.rooms.getRoom,
    roomCode ? { code: roomCode } : 'skip',
  );
  return room;
}
