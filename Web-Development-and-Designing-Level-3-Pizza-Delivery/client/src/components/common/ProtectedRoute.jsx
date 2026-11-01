import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <div className="spinner" style={{ width: 40, height: 40 }} aria-label="Loading..." role="status" />
  </div>
);

/**
 * ProtectedRoute
 * - If not authenticated: redirect to /login with returnUrl
 * - If requireAdmin and not admin: redirect to / with error
 */
const ProtectedRoute = ({ requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

