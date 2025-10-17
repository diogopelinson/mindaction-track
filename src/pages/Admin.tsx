import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserData(selectedUser);
    }
  }, [selectedUser]);

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
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

    setIsAdmin(true);
    await fetchUsers();
    await fetchAdminRequests();
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .order("full_name");

    if (data) {
      setUsers(data);
    }
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
    // Add admin role
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

    // Update request status
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

  const fetchUserData = async (userId: string) => {
    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setUserData(profile);

    // Fetch user updates
    const { data: updatesData } = await supabase
      .from("weekly_updates")
      .select("*")
      .eq("user_id", userId)
      .order("week_number");

    setUpdates(updatesData || []);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  const chartData = updates.map((update) => ({
    week: update.week_number,
    weight: update.weight,
    bodyFat: update.body_fat_percentage,
  }));

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bebas">Painel Admin</h1>
              <p className="text-sm text-muted-foreground">Gerenciar usuários e acompanhar evolução</p>
            </div>
          </div>
        </div>

        {adminRequests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Solicitações de Acesso Admin</CardTitle>
              <CardDescription>{adminRequests.length} solicitação(ões) pendente(s)</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Usuário</CardTitle>
            <CardDescription>Escolha um usuário para visualizar seu progresso</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {userData && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-semibold">{userData.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{userData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Objetivo</p>
                    <p className="font-semibold">
                      {userData.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="font-semibold">{userData.target_weight} kg</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {updates.length > 0 && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Evolução do Peso</CardTitle>
                    <CardDescription>Gráfico de evolução semanal</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="week" 
                          label={{ value: 'Semana', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Peso"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {updates.some(u => u.body_fat_percentage) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Evolução da Gordura Corporal</CardTitle>
                      <CardDescription>Percentual de gordura ao longo das semanas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="week" 
                            label={{ value: 'Semana', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis label={{ value: 'Gordura (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="bodyFat" 
                            stroke="hsl(var(--accent))" 
                            strokeWidth={2}
                            name="Gordura Corporal"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {updates.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    Este usuário ainda não possui check-ins registrados.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
