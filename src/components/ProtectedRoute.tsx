import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole: 'admin' | 'mentee' | 'authenticated';
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'mentee' | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Check user role
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (adminRole) {
          setUserRole('admin');
        } else {
          setUserRole('mentee');
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated-only route (no role check)
  if (requireRole === 'authenticated') {
    return <>{children}</>;
  }

  // Role-based checks
  if (requireRole === 'admin' && userRole !== 'admin') {
    // Non-admin trying to access admin route
    return <Navigate to="/dashboard" replace />;
  }

  if (requireRole === 'mentee' && userRole === 'admin') {
    // Admin trying to access mentee route
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
