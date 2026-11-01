import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, callbackError } from './supabase';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [recovery, setRecovery] = useState(false);
  const [linkError, setLinkError] = useState(callbackError);
  const navigate = useNavigate();
  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (event === 'PASSWORD_RECOVERY') { setRecovery(true); setLinkError(''); navigate('/reset-password', { replace: true }); }
      if (event === 'SIGNED_OUT') setRecovery(false);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setLinkError('Your saved session couldn’t be restored. Please sign in again.');
      setSession(data.session); setLoading(false);
    }).catch(() => { if (active) { setLinkError('Couldn’t restore your session. Please sign in again.'); setLoading(false); } });
    const timeout = setTimeout(() => { if (active) setLoading(false); }, 12000);
    return () => { active = false; clearTimeout(timeout); subscription.unsubscribe(); };
  }, [navigate]);
  return <AuthContext.Provider value={{ session, loading, recovery, setRecovery, linkError, clearLinkError: () => setLinkError('') }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
