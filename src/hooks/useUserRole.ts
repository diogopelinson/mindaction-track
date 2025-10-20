import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'admin' | 'mentee' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setRole(null);
          setIsLoading(false);
          return;
        }

        // Check if user is admin
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (adminRole) {
          setRole('admin');
        } else {
          setRole('mentee');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    isAdmin: role === 'admin',
    isMentee: role === 'mentee',
    isLoading,
  };
};
