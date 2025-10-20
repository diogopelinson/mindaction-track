import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/logo.png";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateCPF, formatCPF } from "@/lib/cpfValidator";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requestAdminAccess, setRequestAdminAccess] = useState(false);
  const [cpfValue, setCpfValue] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user is admin
          const { data: adminRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          if (adminRole) {
            // Admin user - redirect to admin panel
            navigate('/admin');
            return;
          }
          
          // Not admin - verify profile exists
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileData) {
            navigate('/dashboard');
          } else {
            // Profile doesn't exist, logout silently
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        await supabase.auth.signOut();
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Check if user is admin
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .eq('role', 'admin')
          .maybeSingle();

        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });

        // Redirect based on role
        if (adminRole) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Não foi possível fazer login. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const cpf = formData.get('cpf') as string;
    const phone = formData.get('phone') as string;
    const sex = formData.get('sex') as string;
    const age = parseInt(formData.get('age') as string);
    const height = parseFloat(formData.get('height') as string);
    const initialWeight = parseFloat(formData.get('initialWeight') as string);
    const targetWeight = parseFloat(formData.get('targetWeight') as string);
    const goalType = formData.get('goalType') as string;

    // Validate CPF
    if (!validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: "CPF Inválido",
        description: "Por favor, insira um CPF válido.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            cpf,
            phone,
            sex,
            age,
            height,
            initial_weight: initialWeight,
            target_weight: targetWeight,
            goal_type: goalType,
          },
        },
      });

      if (error) throw error;

      if (data.session && data.user) {
        if (requestAdminAccess) {
          // Insert admin request in database
          try {
            await supabase
              .from('admin_requests')
              .insert({
                user_id: data.user.id,
                full_name: fullName,
                email,
                cpf,
                phone,
                status: 'pending'
              });
            
            toast({
              title: "Solicitação registrada!",
              description: "Sua solicitação de acesso admin foi registrada e está aguardando aprovação do administrador.",
              duration: 8000,
            });
          } catch (requestError) {
            console.error('Error creating admin request:', requestError);
          }
        } else {
          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao Mapa MindFitness!",
          });
        }
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex justify-center mb-8">
          <img src={logo} alt="Mapa MindFitness" className="w-32 h-32" />
        </div>

        <Card className="shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bebas tracking-wider">
              Mapa MindFitness
            </CardTitle>
            <CardDescription>
              Entre ou crie sua conta para começar sua jornada
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-mail</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-bronze shadow-bronze"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="signup-name">Nome Completo</Label>
                      <Input
                        id="signup-name"
                        name="fullName"
                        type="text"
                        placeholder="Seu nome"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cpfValue}
                        onChange={(e) => setCpfValue(formatCPF(e.target.value))}
                        maxLength={14}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="signup-email">E-mail</Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Idade</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        placeholder="25"
                        min="18"
                        max="120"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        placeholder="170"
                        min="100"
                        max="250"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Sexo</Label>
                    <RadioGroup name="sex" defaultValue="male" className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Masculino
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Feminino
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Objetivo</Label>
                    <RadioGroup name="goalType" defaultValue="perda_peso" className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="perda_peso" id="perda_peso" />
                        <Label htmlFor="perda_peso" className="font-normal cursor-pointer">
                          <span className="font-semibold">Perda de Peso</span> - Reduzir gordura corporal
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ganho_massa" id="ganho_massa" />
                        <Label htmlFor="ganho_massa" className="font-normal cursor-pointer">
                          <span className="font-semibold">Ganho de Massa</span> - Aumentar massa muscular
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="initial-weight">Peso Atual (kg)</Label>
                      <Input
                        id="initial-weight"
                        name="initialWeight"
                        type="number"
                        step="0.1"
                        placeholder="80.0"
                        min="30"
                        max="300"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-weight">Peso Meta (kg)</Label>
                      <Input
                        id="target-weight"
                        name="targetWeight"
                        type="number"
                        step="0.1"
                        placeholder="75.0"
                        min="30"
                        max="300"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
                    <Checkbox 
                      id="admin-request" 
                      checked={requestAdminAccess}
                      onCheckedChange={(checked) => setRequestAdminAccess(checked as boolean)}
                    />
                    <Label htmlFor="admin-request" className="text-sm font-normal cursor-pointer">
                      Quero solicitar acesso como administrador
                    </Label>
                  </div>

                  {requestAdminAccess && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                      <p className="text-sm">
                        Sua solicitação será enviada ao administrador para aprovação. 
                        Você receberá as permissões de admin assim que sua solicitação for aprovada.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gradient-bronze shadow-bronze"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
