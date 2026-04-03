import { useEffect, useRef } from 'react';

const BASE_TITLE = 'Vibes — pookie.sh';

export function useTabTitle(showNudge: boolean) {
  const flashRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set base title
  useEffect(() => {
    document.title = BASE_TITLE;
    return () => { document.title = 'pookie.sh'; };
  }, []);

  // Flash title on nudge when tab is hidden
  useEffect(() => {
    if (!showNudge) {
      if (flashRef.current) {
        clearInterval(flashRef.current);
        flashRef.current = null;
      }
      document.title = BASE_TITLE;
      return;
    }

    if (!document.hidden) return; // only flash when tab is backgrounded

    let toggle = false;
    flashRef.current = setInterval(() => {
      document.title = toggle ? BASE_TITLE : 'your pookie misses you!';
      toggle = !toggle;
    }, 1000);

    const handleFocus = () => {
      if (flashRef.current) {
        clearInterval(flashRef.current);
        flashRef.current = null;
      }
      document.title = BASE_TITLE;
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      if (flashRef.current) clearInterval(flashRef.current);
      window.removeEventListener('focus', handleFocus);
      document.title = BASE_TITLE;
    };
  }, [showNudge]);
}
