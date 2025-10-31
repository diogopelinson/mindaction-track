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
import { loginSchema, signupSchema } from "@/lib/validationSchemas";

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

    // Validate input
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.issues[0].message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

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

    // Validate CPF first
    if (!validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: "CPF Inválido",
        description: "Por favor, insira um CPF válido.",
      });
      setIsLoading(false);
      return;
    }

    // Validate all inputs with zod
    const validation = signupSchema.safeParse({
      email,
      password,
      fullName,
      cpf,
      phone,
      sex,
      age,
      height,
      initialWeight,
      targetWeight,
      goalType,
    });

    if (!validation.success) {
      toast({
        title: "Erro de validação",
        description: validation.error.issues[0].message,
        variant: "destructive",
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
              <TabsList className="grid w-full grid-cols-1 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
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

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-center text-blue-900 dark:text-blue-100">
                    <strong>Novo por aqui?</strong><br />
                    Entre em contato com seu coach/administrador para criar sua conta.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
