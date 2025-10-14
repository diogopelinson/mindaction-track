import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogOut, User } from "lucide-react";
import logo from "@/assets/logo.png";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    } else {
      toast({
        title: "Até logo!",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
            <User className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-2xl font-bebas">{profile?.full_name}</h1>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas">Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sexo</span>
              <span className="font-semibold">{profile?.sex === 'male' ? 'Masculino' : 'Feminino'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Idade</span>
              <span className="font-semibold">{profile?.age} anos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Altura</span>
              <span className="font-semibold">{profile?.height} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPF</span>
              <span className="font-semibold">{profile?.cpf}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Telefone</span>
              <span className="font-semibold">{profile?.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas">Metas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Objetivo</span>
              <span className="font-semibold">
                {profile?.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso Inicial</span>
              <span className="font-semibold">{profile?.initial_weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Peso Meta</span>
              <span className="font-semibold">{profile?.target_weight} kg</span>
            </div>
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;