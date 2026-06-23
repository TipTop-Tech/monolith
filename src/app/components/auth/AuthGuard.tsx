import { Navigate, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export const AuthGuard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasCheckedNewUser, setHasCheckedNewUser] = useState(false);

  useEffect(() => {
    if (user && !hasCheckedNewUser) {
      if (user.created_at) {
        const createdAtTime = new Date(user.created_at).getTime();
        const nowTime = new Date().getTime();
        // If the account was created within the last 15 seconds, it's a new sign-up
        const isNewUser = (nowTime - createdAtTime) < 15000;
        
        if (isNewUser) {
          navigate('/routines', { replace: true });
        }
      }
      setHasCheckedNewUser(true);
    }
  }, [user, hasCheckedNewUser, navigate]);

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
