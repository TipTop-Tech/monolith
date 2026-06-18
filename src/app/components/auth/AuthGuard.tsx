import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AuthGuard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};
