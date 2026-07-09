// Handles the redirect from the backend after OAuth2 login.
// Spring Security redirects here with ?success=true or ?success=false&error=...
// The JWT cookie is already set in the browser at this point — we just need to
// refresh the auth context and send the user to the right page.
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    // Guard against React StrictMode double-invoke
    if (handled.current) return;
    handled.current = true;

    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      // Cookie is already set — refresh the auth context so the app knows
      // who is logged in, then redirect to the role-based landing page.
      refreshUser().then(() => {
        navigate('/redirect', { replace: true });
      }).catch(() => {
        navigate('/login?error=session', { replace: true });
      });
    } else {
      // OAuth2 failed — redirect to login with the error message as a query param
      const msg = error ? decodeURIComponent(error) : 'OAuth2 login failed. Please try again.';
      navigate(`/login?oauthError=${encodeURIComponent(msg)}`, { replace: true });
    }
  }, [navigate, refreshUser, searchParams]);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      color: 'var(--on-surface-variant)',
      fontFamily: 'inherit',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid var(--outline-variant)',
        borderTopColor: 'var(--secondary)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>Completing sign in…</p>
    </div>
  );
}
