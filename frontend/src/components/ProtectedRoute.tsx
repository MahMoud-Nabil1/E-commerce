import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Which roles are allowed. If omitted, any authenticated user is allowed. */
  roles?: string[];
}

/**
 * Wraps a route so only authenticated users (with the right role) can access it.
 * Unauthenticated users are sent to /login with the current path saved in state.
 * Authenticated users without the required role are sent to their own dashboard.
 */
export default function ProtectedRoute({ children, roles }: Props) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: 'var(--on-surface-variant)' }}>Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Admins always go to /admin — even if they also hold ROLE_SELLER in the DB.
  // This prevents a superadmin with a stale ROLE_SELLER from landing on /seller.
  if (user.roles.includes('ROLE_ADMIN') && !roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin" replace />;
  }

  if (roles && !roles.some((r) => user.roles.includes(r))) {
    // Redirect to their own dashboard
    if (user.roles.includes('ROLE_ADMIN')) return <Navigate to="/admin" replace />;
    if (user.roles.includes('ROLE_SELLER')) return <Navigate to="/seller" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
