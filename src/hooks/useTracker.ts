import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Generate or retrieve the session ID for this browsing session
function getSessionId(): string {
  const key = 'mimi_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Only tracks admin-excluded paths
export function useTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Do not track admin pages
    if (pathname.startsWith('/admin')) return;

    const sessionId = getSessionId();
    void (async () => {
      try {
        await supabase.from('visits').insert({
          page: pathname,
          referrer: document.referrer || null,
          session_id: sessionId,
        });
      } catch {
        // Silently ignore any tracking errors
      }
    })();
  }, [pathname]);
}
