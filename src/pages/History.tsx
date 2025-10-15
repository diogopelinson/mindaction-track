import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";
import { calculateWeeklyZone, getZoneColor, getZoneLabel } from "@/lib/progressUtils";

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [updates, setUpdates] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data, error } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('week_number', { ascending: true });

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu histórico.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setUpdates(data || []);
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  const getChartData = () => {
    return updates.map((update) => ({
      week: `S${update.week_number}`,
      peso: update.weight,
      gordura: update.body_fat_percentage,
    }));
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bebas">Histórico</h1>
              <p className="text-sm text-muted-foreground">Todos os seus check-ins</p>
            </div>
          </div>
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        {updates.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-bebas">Evolução Completa</CardTitle>
              <CardDescription>Seu progresso ao longo das semanas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <ReferenceLine y={profile?.target_weight} yAxisId="left" stroke="hsl(var(--primary))" strokeDasharray="5 5" label="Meta" />
                  <Line yAxisId="left" type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                  <Line yAxisId="right" type="monotone" dataKey="gordura" stroke="hsl(var(--accent))" strokeWidth={2} name="Gordura (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {updates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Você ainda não tem check-ins registrados.</p>
              <Button className="mt-4" onClick={() => navigate('/checkin')}>
                Fazer primeiro check-in
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update, index) => {
              const zone = index > 0 ? calculateWeeklyZone(update.weight, updates[index - 1].weight, profile?.goal_type) : null;
              return (
                <Card key={update.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="font-bebas">Semana {update.week_number}</CardTitle>
                          {zone && <Badge className={`${getZoneColor(zone.zone)} text-white`}>{getZoneLabel(zone.zone)}</Badge>}
                        </div>
                        <CardDescription>{new Date(update.created_at).toLocaleDateString('pt-BR')}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Peso</p>
                        <p className="text-xl font-bold text-primary">{update.weight} kg</p>
                      </div>
                      {update.body_fat_percentage && (
                        <div>
                          <p className="text-sm text-muted-foreground">Gordura</p>
                          <p className="text-xl font-bold text-primary">{update.body_fat_percentage}%</p>
                        </div>
                      )}
                    </div>
                    {update.notes && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">{update.notes}</p>
                      </div>
                    )}
                    {update.photo_url && (
                      <img src={update.photo_url} alt={`Semana ${update.week_number}`} className="w-full max-w-md rounded-lg mx-auto" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default History;
