import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useEffect, useState } from 'react';

export interface DecryptedMood {
  id: string;
  mood: string;
  note: string;
  author: 'A' | 'B';
  createdAt: number;
}

export function useMoods(
  roomCode: string | null,
  decryptFn: ((ciphertext: string, iv: string) => Promise<string>) | null,
) {
  const raw = useQuery(
    api.moods.listMoods,
    roomCode ? { roomCode } : 'skip',
  );
  const logMoodMutation = useMutation(api.moods.logMood);
  const [decrypted, setDecrypted] = useState<DecryptedMood[]>([]);
  const [decrypting, setDecrypting] = useState(false);

  useEffect(() => {
    if (!raw || !decryptFn) {
      setDecrypted([]);
      return;
    }

    let cancelled = false;
    setDecrypting(true);

    Promise.all(
      raw.map(async (entry) => {
        try {
          const json = await decryptFn(entry.encryptedData, entry.iv);
          const data = JSON.parse(json);
          return {
            id: entry._id,
            mood: data.mood,
            note: data.note || '',
            author: data.author,
            createdAt: entry.createdAt,
          } as DecryptedMood;
        } catch {
          return null;
        }
      }),
    ).then((results) => {
      if (!cancelled) {
        setDecrypted(results.filter((r): r is DecryptedMood => r !== null));
        setDecrypting(false);
      }
    });

    return () => { cancelled = true; };
  }, [raw, decryptFn]);

  // Latest mood per partner (list is already desc by createdAt)
  const latestA = decrypted.find((m) => m.author === 'A') ?? null;
  const latestB = decrypted.find((m) => m.author === 'B') ?? null;

  // History: all moods (already sorted desc)
  const history = decrypted;

  const setMood = async (
    roomCode: string,
    encryptFn: (plaintext: string) => Promise<{ ciphertext: string; iv: string }>,
    mood: string,
    note: string,
    author: 'A' | 'B',
  ) => {
    const plaintext = JSON.stringify({ mood, note, author });
    const { ciphertext, iv } = await encryptFn(plaintext);
    await logMoodMutation({ roomCode, encryptedData: ciphertext, iv });
  };

  return { latestA, latestB, history, decrypting, setMood };
}
