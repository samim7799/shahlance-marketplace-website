import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAccountTypes }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Optional role gate
  if (requireAccountTypes && requireAccountTypes.length > 0) {
    const allowed = requireAccountTypes.includes(user.accountType) || user.accountType === 'both';
    if (!allowed) return <Navigate to="/profile" replace />;
  }

  return children;
}
