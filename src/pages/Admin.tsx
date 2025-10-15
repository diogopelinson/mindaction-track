import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, User, TrendingUp, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { calculateWeeklyZone, getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import logo from "@/assets/logo.png";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userUpdates, setUserUpdates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (roleData?.role !== 'admin') {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta área.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    setIsAdmin(true);
    loadUsers();
    setIsLoading(false);
  };

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários.",
        variant: "destructive",
      });
      return;
    }

    setUsers(data || []);
  };

  const loadUserUpdates = async (userId: string) => {
    const { data, error } = await supabase
      .from('weekly_updates')
      .select('*')
      .eq('user_id', userId)
      .order('week_number', { ascending: true });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do usuário.",
        variant: "destructive",
      });
      return;
    }

    setUserUpdates(data || []);
  };

  const handleSelectUser = async (user: any) => {
    setSelectedUser(user);
    await loadUserUpdates(user.id);
  };

  const getChartData = () => {
    return userUpdates.map((update, index) => {
      const zone = index > 0 
        ? calculateWeeklyZone(update.weight, userUpdates[index - 1].weight, selectedUser.goal_type)
        : null;
      
      return {
        week: `S${update.week_number}`,
        peso: update.weight,
        gordura: update.body_fat_percentage,
        zone: zone?.zone,
      };
    });
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bebas">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Gerencie e acompanhe todos os mentorados</p>
            </div>
          </div>
          <img src={logo} alt="Logo" className="h-12" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* User List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="font-bebas">Mentorados</CardTitle>
              <CardDescription>Total: {users.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                      selectedUser?.id === user.id ? 'border-primary' : ''
                    }`}
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Details */}
          <div className="md:col-span-2 space-y-6">
            {!selectedUser ? (
              <Card className="p-12 text-center">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione um mentorado para ver os detalhes
                </p>
              </Card>
            ) : (
              <>
                {/* User Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bebas">{selectedUser.full_name}</CardTitle>
                    <CardDescription>{selectedUser.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Objetivo</p>
                        <p className="font-semibold">
                          {selectedUser.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peso Inicial</p>
                        <p className="font-semibold">{selectedUser.initial_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Peso Meta</p>
                        <p className="font-semibold">{selectedUser.target_weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-ins</p>
                        <p className="font-semibold">{userUpdates.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Charts */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bebas">Evolução</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <ReferenceLine y={selectedUser.target_weight} yAxisId="left" stroke="hsl(var(--primary))" strokeDasharray="5 5" label="Meta" />
                        <Line yAxisId="left" type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} name="Peso (kg)" />
                        <Line yAxisId="right" type="monotone" dataKey="gordura" stroke="hsl(var(--accent))" strokeWidth={2} name="Gordura (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Weekly Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-bebas">Check-ins Semanais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userUpdates.map((update, index) => {
                        const zone = index > 0 
                          ? calculateWeeklyZone(update.weight, userUpdates[index - 1].weight, selectedUser.goal_type)
                          : null;

                        return (
                          <Card key={update.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">Semana {update.week_number}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(update.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              {zone && (
                                <Badge className={`${getZoneColor(zone.zone)} text-white`}>
                                  {getZoneLabel(zone.zone)}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <p className="text-xs text-muted-foreground">Peso</p>
                                <p className="font-semibold">{update.weight} kg</p>
                              </div>
                              {update.body_fat_percentage && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Gordura</p>
                                  <p className="font-semibold">{update.body_fat_percentage}%</p>
                                </div>
                              )}
                              {update.waist_circumference && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Cintura</p>
                                  <p className="font-semibold">{update.waist_circumference} cm</p>
                                </div>
                              )}
                              {update.neck_circumference && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Pescoço</p>
                                  <p className="font-semibold">{update.neck_circumference} cm</p>
                                </div>
                              )}
                            </div>

                            {update.notes && (
                              <p className="text-sm text-muted-foreground italic">"{update.notes}"</p>
                            )}

                            {update.photo_url && (
                              <div className="mt-3">
                                <img
                                  src={update.photo_url}
                                  alt={`Semana ${update.week_number}`}
                                  className="w-full max-w-sm rounded-lg"
                                />
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
