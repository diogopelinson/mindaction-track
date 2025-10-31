import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, LayoutDashboard, Users, UserCheck, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/logo.png";
import AdminStats from "@/components/admin/AdminStats";
import MenteeCard from "@/components/admin/MenteeCard";
import MenteeTable from "@/components/admin/MenteeTable";
import MenteeDetailView from "@/components/admin/MenteeDetailView";
import AlertsPanel from "@/components/admin/AlertsPanel";
import { MenteeData, calculateMenteeStatus, calculateGlobalStats } from "@/lib/adminUtils";

type View = 'dashboard' | 'mentees' | 'requests' | 'detail';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>("");
  const [mentees, setMentees] = useState<MenteeData[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Admins don't need a profile - only check role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta página.",
        });
        navigate("/dashboard");
        return;
      }

      await fetchMentees();
      await fetchAdminRequests();
      setIsLoading(false);
    } catch (error) {
      console.error('Auth error:', error);
      await supabase.auth.signOut();
      toast({
        title: "Erro de autenticação",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  };

  const fetchMentees = async () => {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name");

    if (!profilesData) return;

    const menteesWithUpdates: MenteeData[] = await Promise.all(
      profilesData.map(async (profile) => {
        const { data: updates } = await supabase
          .from("weekly_updates")
          .select("*")
          .eq("user_id", profile.id)
          .order("week_number");

        return {
          ...profile,
          updates: updates || [],
        } as MenteeData;
      })
    );

    setMentees(menteesWithUpdates);
  };

  const fetchAdminRequests = async () => {
    const { data } = await supabase
      .from("admin_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) {
      setAdminRequests(data);
    }
  };

  const handleApproveRequest = async (requestId: string, userId: string) => {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: "admin"
      });

    if (roleError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar a role de admin.",
      });
      return;
    }

    const { error: updateError } = await supabase
      .from("admin_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    if (updateError) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o status da solicitação.",
      });
      return;
    }

    toast({
      title: "Solicitação aprovada!",
      description: "O usuário agora tem acesso de administrador.",
    });

    await fetchAdminRequests();
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from("admin_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível rejeitar a solicitação.",
      });
      return;
    }

    toast({
      title: "Solicitação rejeitada",
      description: "A solicitação foi rejeitada com sucesso.",
    });

    await fetchAdminRequests();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleViewMenteeDetails = (menteeId: string) => {
    setSelectedMenteeId(menteeId);
    setCurrentView('detail');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  const menteesWithStatus = mentees.map((mentee) => ({
    mentee,
    status: calculateMenteeStatus(mentee.updates || [], mentee),
  }));

  const selectedMentee = mentees.find((m) => m.id === selectedMenteeId);
  const selectedStatus = selectedMentee ? calculateMenteeStatus(selectedMentee.updates || [], selectedMentee) : null;

  const globalStats = calculateGlobalStats(mentees);

  // Detail View
  if (currentView === 'detail' && selectedMentee && selectedStatus) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <MenteeDetailView
            mentee={selectedMentee}
            status={selectedStatus}
            onBack={() => setCurrentView('dashboard')}
          />
        </div>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="MINDACTION" className="h-10" />
            <div>
              <h1 className="text-xl font-bebas">Painel Administrativo</h1>
              <p className="text-xs text-muted-foreground">Gestão de Mentorados</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Quick Action Buttons */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <Button 
            onClick={() => navigate('/admin/create-mentee')}
            size="lg"
            className="gradient-bronze shadow-bronze"
          >
            <Users className="h-5 w-5 mr-2" />
            Criar Novo Mentorado
          </Button>
          <Button 
            onClick={() => navigate('/admin/mentee-projection')}
            size="lg"
            variant="outline"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            Ver Mapa Mind Fitness
          </Button>
        </div>

        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as View)} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="mentees">
              <Users className="h-4 w-4 mr-2" />
              Mentorados
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserCheck className="h-4 w-4 mr-2" />
              Solicitações
              {adminRequests.length > 0 && (
                <span className="ml-2 h-5 w-5 rounded-full bg-danger text-danger-foreground text-xs flex items-center justify-center">
                  {adminRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Dashboard View */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Alertas no topo */}
            <AlertsPanel mentees={menteesWithStatus} onSelectMentee={handleViewMenteeDetails} />
            
            <AdminStats stats={globalStats} />
            
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bebas">Mentorados Recentes</h2>
              <Button variant="outline" onClick={() => setCurrentView('mentees')}>
                Ver Todos
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menteesWithStatus.slice(0, 6).map(({ mentee, status }) => (
                <MenteeCard
                  key={mentee.id}
                  mentee={mentee}
                  status={status}
                  onViewDetails={() => handleViewMenteeDetails(mentee.id)}
                />
              ))}
            </div>

            {menteesWithStatus.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">Nenhum mentorado cadastrado ainda.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Mentees View */}
          <TabsContent value="mentees">
            <MenteeTable
              mentees={menteesWithStatus}
              onSelectMentee={handleViewMenteeDetails}
            />
          </TabsContent>

          {/* Admin Requests View */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Acesso Admin</CardTitle>
                <CardDescription>
                  {adminRequests.length === 0
                    ? "Nenhuma solicitação pendente"
                    : `${adminRequests.length} solicitação(ões) pendente(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {adminRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhuma solicitação de acesso admin pendente.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold">{request.full_name}</p>
                          <p className="text-sm text-muted-foreground">{request.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            CPF: {request.cpf} | Tel: {request.phone}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id, request.user_id)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
