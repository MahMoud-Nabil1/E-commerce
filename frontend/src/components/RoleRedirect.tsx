import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * After login, redirects the user to the correct dashboard based on their role.
 * ROLE_ADMIN  → /admin
 * ROLE_SELLER → /seller
 * ROLE_USER   → /
 */
export default function RoleRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (user.roles.includes('ROLE_ADMIN')) {
      navigate('/admin', { replace: true });
    } else if (user.roles.includes('ROLE_SELLER')) {
      navigate('/seller', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span style={{ color: 'var(--on-surface-variant)' }}>Redirecting…</span>
    </div>
  );
}
