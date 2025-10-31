import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, History, Settings, HelpCircle, Target, Weight, TrendingUp, Calendar, Flame, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { calculateWeeklyZone, getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatsCard from "@/components/StatsCard";
import ProgressRing from "@/components/ProgressRing";
import AIProgressInsights from "@/components/AIProgressInsights";
import GoalPrediction from "@/components/GoalPrediction";
import PatternDetection from "@/components/PatternDetection";
import { AchievementsDisplay } from "@/components/AchievementsDisplay";
import { IntermediateGoals } from "@/components/IntermediateGoals";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAchievements } from "@/hooks/useAchievements";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [allUpdates, setAllUpdates] = useState<any[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const { checkAndAwardAchievements } = useAchievements();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        // Verify user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // If profile doesn't exist, logout and redirect
        if (!profileData || profileError) {
          await supabase.auth.signOut();
          toast({
            title: "Sessão inválida",
            description: "Sua conta não foi encontrada. Por favor, cadastre-se novamente.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        setProfile(profileData);

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
          // Check for new achievements
          if (profileData) {
            checkAndAwardAchievements(allData, profileData);
          }
        }

        // Count check-ins
        const { count } = await supabase
          .from('weekly_updates')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);

        setCheckInCount(count || 0);

        setIsLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        await supabase.auth.signOut();
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login novamente.",
          variant: "destructive",
        });
        navigate('/auth');
      }
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

  const chartData = allUpdates.map((update) => ({
    week: update.week_number,
    weight: update.weight,
    bodyFat: update.body_fat_percentage,
  }));

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
          <ThemeToggle />
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Peso Atual"
            value={`${currentWeight.toFixed(1)} kg`}
            icon={Weight}
            description={profile?.goal_type === 'perda_peso' ? 'Em redução' : 'Em crescimento'}
          />
          <StatsCard
            title={profile?.goal_type === 'perda_peso' ? 'Peso Perdido' : 'Peso Ganho'}
            value={`${Math.abs(weightChange).toFixed(1)} kg`}
            icon={TrendingUp}
            description={`Faltam ${Math.abs((profile?.target_weight || 0) - currentWeight).toFixed(1)} kg`}
          />
          <StatsCard
            title="Check-ins"
            value={checkInCount}
            icon={Calendar}
            description={`${checkInCount > 0 ? 'Última semana ' + (latestUpdate?.week_number || 0) : 'Nenhum ainda'}`}
          />
          <StatsCard
            title="Gordura Corporal"
            value={latestUpdate?.body_fat_percentage ? `${latestUpdate.body_fat_percentage}%` : '-'}
            icon={Activity}
            description={latestUpdate?.body_fat_percentage ? 'Método Navy' : 'Aguardando medidas'}
          />
        </div>

        {/* Achievements - Show compact version */}
        {allUpdates.length > 0 && (
          <AchievementsDisplay compact />
        )}

        {/* Intermediate Goals */}
        {allUpdates.length > 0 && (
          <IntermediateGoals />
        )}

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bebas text-xl">Visão Geral do Progresso</CardTitle>
            <CardDescription>Seu acompanhamento detalhado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1 w-full space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Meta de {profile?.goal_type === 'perda_peso' ? 'Perda' : 'Ganho'} de Peso</span>
                    <span className="text-sm font-bold text-primary">{Math.min(progress, 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-3" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Inicial</p>
                    <p className="text-lg font-bold">{profile?.initial_weight?.toFixed(1) || 0} kg</p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
                    <p className="text-xs text-muted-foreground mb-1">Atual</p>
                    <p className="text-lg font-bold text-primary">{currentWeight.toFixed(1)} kg</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Meta</p>
                    <p className="text-lg font-bold">{profile?.target_weight?.toFixed(1) || 0} kg</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ProgressRing progress={progress} size={160} strokeWidth={12} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Features */}
        <AIProgressInsights profile={profile} updates={allUpdates} />
        <GoalPrediction profile={profile} updates={allUpdates} />
        <PatternDetection updates={allUpdates} profile={profile} />

        {/* Evolution Charts */}
        {allUpdates.length > 1 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="font-bebas text-xl">Evolução do Peso</CardTitle>
                <CardDescription>Seu progresso ao longo das semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" label={{ value: 'Semana', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {allUpdates.some(u => u.body_fat_percentage) && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-bebas text-xl">Evolução da Gordura Corporal</CardTitle>
                  <CardDescription>Percentual de gordura ao longo das semanas</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" label={{ value: 'Semana', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Gordura (%)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="bodyFat" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Recent Check-ins */}
        {allUpdates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-bebas text-xl">Check-ins Recentes</CardTitle>
              <CardDescription>Seus últimos registros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allUpdates.slice(-3).reverse().map((update, idx, arr) => {
                  const previousUpdate = arr[idx + 1];
                  let zone = null;
                  
                  if (profile) {
                    zone = calculateWeeklyZone(
                      update.weight,
                      profile.initial_weight,
                      profile.goal_type,
                      (profile as any).goal_subtype || 'padrao'
                    );
                  }

                  return (
                    <div
                      key={update.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Weight className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">Semana {update.week_number}</p>
                            {zone && (
                              <Badge variant="outline" className={`text-xs ${getZoneColor(zone)}`}>
                                {getZoneLabel(zone)}
                              </Badge>
                            )}
                          </div>
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
                  );
                })}
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
          <Card className="text-center py-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative bg-primary/10 p-8 rounded-full">
                    <Flame className="h-16 w-16 text-primary" />
                  </div>
                </div>
                <div className="max-w-md">
                  <h3 className="font-bebas text-3xl mb-3 tracking-wide">Comece sua Transformação!</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Você está a um passo de iniciar sua jornada. Faça seu primeiro check-in na próxima segunda-feira 
                    e comece a acompanhar sua evolução semana a semana.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={() => navigate('/help')} size="lg" className="gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Como Fazer Check-in
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="outline" size="lg" className="gap-2">
                      <Settings className="h-5 w-5" />
                      Editar Perfil
                    </Button>
                  </div>
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