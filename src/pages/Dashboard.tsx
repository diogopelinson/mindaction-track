import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, History, Settings, HelpCircle, Target, Weight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [allUpdates, setAllUpdates] = useState<any[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch latest update
      const { data: latestData } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestUpdate(latestData);

      // Fetch all updates
      const { data: allData } = await supabase
        .from('weekly_updates')
        .select('*')
        .eq('user_id', session.user.id)
        .order('week_number', { ascending: true });

      if (allData) {
        setAllUpdates(allData);
      }

      // Count check-ins
      const { count } = await supabase
        .from('weekly_updates')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      setCheckInCount(count || 0);

      setIsLoading(false);
    };

    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const calculateProgress = () => {
    if (!profile) return 0;
    
    const initial = profile.initial_weight;
    const target = profile.target_weight;
    const current = latestUpdate?.weight || initial;

    if (profile.goal_type === 'perda_peso') {
      return ((initial - current) / (initial - target)) * 100;
    } else {
      return ((current - initial) / (target - initial)) * 100;
    }
  };

  const calculateWeightChange = () => {
    if (!profile) return 0;
    const initial = profile.initial_weight;
    const current = latestUpdate?.weight || initial;
    return current - initial;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  const progress = calculateProgress();
  const weightChange = calculateWeightChange();
  const currentWeight = latestUpdate?.weight || profile?.initial_weight || 0;

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="h-16" />
            <div>
              <h1 className="text-2xl font-bebas">Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}!</h1>
              <p className="text-sm text-muted-foreground">Bem-vindo ao Mapa MindFitness</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bebas text-xl">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/checkin')}
            >
              <PlusCircle className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Check-in</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/history')}
            >
              <History className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Histórico</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/profile')}
            >
              <Settings className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Editar Perfil</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col gap-2"
              onClick={() => navigate('/help')}
            >
              <HelpCircle className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Ajuda</span>
            </Button>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bebas text-xl">Progresso</CardTitle>
            <CardDescription>Seu acompanhamento semanal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Peso Atual</p>
                <p className="text-2xl font-bold text-primary">{currentWeight.toFixed(1)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {profile?.goal_type === 'perda_peso' ? 'Perda' : 'Ganho'}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {Math.abs(weightChange).toFixed(1)} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meta</p>
                <p className="text-2xl font-bold text-primary">{profile?.target_weight?.toFixed(1) || 0} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-ins</p>
                <p className="text-2xl font-bold text-primary">{checkInCount}</p>
              </div>
            </div>

            {latestUpdate?.body_fat_percentage && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Gordura Corporal</p>
                <p className="text-xl font-semibold">{latestUpdate.body_fat_percentage}%</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm font-bold text-primary">{Math.min(progress, 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(progress, 100)} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        {allUpdates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-bebas text-xl">Check-ins Recentes</CardTitle>
              <CardDescription>Seus últimos registros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allUpdates.slice(-3).reverse().map((update) => (
                  <div
                    key={update.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Weight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Semana {update.week_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{update.weight} kg</p>
                      {update.body_fat_percentage && (
                        <p className="text-sm text-muted-foreground">{update.body_fat_percentage}% gordura</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {allUpdates.length > 3 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => navigate('/history')}
                >
                  Ver todos os check-ins
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {allUpdates.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="bg-primary/10 p-6 rounded-full">
                  <TrendingUp className="h-12 w-12 text-primary" />
                </div>
                <div>
                  <h3 className="font-bebas text-xl mb-2">Comece sua jornada!</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça seu primeiro check-in na próxima segunda-feira
                  </p>
                  <Button onClick={() => navigate('/help')}>
                    Saiba como fazer o check-in
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Dashboard;