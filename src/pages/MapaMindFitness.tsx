import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import WeightProjectionTable from "@/components/WeightProjectionTable";
import BottomNav from "@/components/BottomNav";
import { Loader2 } from "lucide-react";
import type { WeeklyUpdate } from "@/lib/progressUtils";

const MapaMindFitness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Buscar updates
      const { data: updatesData, error: updatesError } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', user.id)
        .order('week_number', { ascending: true });

      if (updatesError) throw updatesError;
      setUpdates(updatesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mapa Mind Fitness</h1>
          <p className="text-muted-foreground">
            Acompanhe sua projeção de peso ao longo de 24 semanas
          </p>
        </div>

        <WeightProjectionTable
          initialWeight={profile.initial_weight}
          goalType={profile.goal_type}
          goalSubtype={profile.goal_subtype}
          weeklyUpdates={updates}
        />
      </div>
      <BottomNav />
    </div>
  );
};

export default MapaMindFitness;
