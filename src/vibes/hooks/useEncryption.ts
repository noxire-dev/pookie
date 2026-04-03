import { useEffect, useState, useCallback, useRef } from 'react';
import { deriveKey, encrypt, decrypt } from '../crypto/encryption';

export function useEncryption(password: string | null, saltB64: string | null) {
  const [ready, setReady] = useState(false);
  const keyRef = useRef<CryptoKey | null>(null);

  useEffect(() => {
    if (!password || !saltB64) {
      keyRef.current = null;
      setReady(false);
      return;
    }
    let cancelled = false;
    deriveKey(password, saltB64).then((k) => {
      if (!cancelled) {
        keyRef.current = k;
        setReady(true);
      }
    });
    return () => { cancelled = true; };
  }, [password, saltB64]);

  const encryptData = useCallback(async (plaintext: string) => {
    if (!keyRef.current) throw new Error('Encryption key not ready');
    return encrypt(plaintext, keyRef.current);
  }, []);

  const decryptData = useCallback(async (ciphertext: string, iv: string) => {
    if (!keyRef.current) throw new Error('Encryption key not ready');
    return decrypt(ciphertext, iv, keyRef.current);
  }, []);

  return { ready, encrypt: encryptData, decrypt: decryptData };
}
