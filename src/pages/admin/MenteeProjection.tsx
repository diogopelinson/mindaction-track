import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import WeightProjectionTable from "@/components/WeightProjectionTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { WeeklyUpdate } from "@/lib/progressUtils";

const MenteeProjection = () => {
  const navigate = useNavigate();
  const { menteeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [mentees, setMentees] = useState<any[]>([]);
  const [selectedMentee, setSelectedMentee] = useState<any>(null);
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);

  useEffect(() => {
    loadMentees();
  }, []);

  useEffect(() => {
    if (menteeId && mentees.length > 0) {
      const mentee = mentees.find(m => m.id === menteeId);
      if (mentee) {
        setSelectedMentee(mentee);
        loadMenteeUpdates(menteeId);
      }
    }
  }, [menteeId, mentees]);

  const loadMentees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Verificar se é admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        navigate('/dashboard');
        return;
      }

      // Buscar todos os mentorados
      const { data: menteesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setMentees(menteesData || []);

    } catch (error) {
      console.error('Error loading mentees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMenteeUpdates = async (menteeUserId: string) => {
    try {
      const { data: updatesData, error } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', menteeUserId)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setUpdates(updatesData || []);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const handleMenteeChange = (menteeUserId: string) => {
    navigate(`/admin/mentee-projection/${menteeUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">Mapa Mind Fitness - Admin</h1>
            <p className="text-muted-foreground">
              Visualize a projeção de peso de cada mentorado
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Select value={menteeId} onValueChange={handleMenteeChange}>
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Selecione um mentorado" />
            </SelectTrigger>
            <SelectContent>
              {mentees.map((mentee) => (
                <SelectItem key={mentee.id} value={mentee.id}>
                  {mentee.full_name} - {mentee.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedMentee && (
          <WeightProjectionTable
            initialWeight={selectedMentee.initial_weight}
            goalType={selectedMentee.goal_type}
            goalSubtype={selectedMentee.goal_subtype}
            weeklyUpdates={updates}
          />
        )}

        {!selectedMentee && (
          <div className="text-center py-12 text-muted-foreground">
            Selecione um mentorado para ver a projeção
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeProjection;
