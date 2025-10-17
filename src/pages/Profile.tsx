import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Edit2, Save, User, Mail, Phone, Ruler, Weight as WeightIcon, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data || error) {
        await supabase.auth.signOut();
        toast({
          title: "Sessão inválida",
          description: "Sua conta não foi encontrada. Por favor, cadastre-se novamente.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setProfile(data);
      setEditedProfile(data);
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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          phone: editedProfile.phone,
          height: editedProfile.height,
          target_weight: editedProfile.target_weight,
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bebas">Meu Perfil</h1>
          {!isEditing ? (
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit2 className="h-5 w-5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleSave} disabled={isLoading}>
              <Save className="h-5 w-5" />
            </Button>
          )}
        </div>

        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
                <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bebas tracking-wide">{profile.full_name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="h-3 w-3" />
                {profile.email}
              </p>
              <Badge variant="outline" className="mt-3">
                {profile.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Dados fixos do seu cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sexo</p>
                <p className="font-semibold">{profile.sex === 'male' ? 'Masculino' : 'Feminino'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Idade</p>
                <p className="font-semibold">{profile.age} anos</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground mb-1">CPF</p>
                <p className="font-semibold">{profile.cpf}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </CardTitle>
            <CardDescription>Informações de contato editáveis</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={editedProfile?.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <p className="font-semibold">{profile.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Medidas
            </CardTitle>
            <CardDescription>Altura e peso editáveis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={editedProfile?.height || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, height: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="target_weight">Peso Meta (kg)</Label>
                  <Input
                    id="target_weight"
                    type="number"
                    step="0.1"
                    value={editedProfile?.target_weight || ''}
                    onChange={(e) => setEditedProfile({...editedProfile, target_weight: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Altura</p>
                  <p className="font-semibold">{profile.height} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Peso Meta</p>
                  <p className="font-semibold">{profile.target_weight} kg</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Target className="h-5 w-5" />
              Objetivos e Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <WeightIcon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Peso Inicial</p>
                <p className="text-lg font-bold">{profile.initial_weight} kg</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg text-center border-2 border-primary">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Peso Meta</p>
                <p className="text-lg font-bold text-primary">{profile.target_weight} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Button
          variant="destructive"
          className="w-full"
          size="lg"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sair da Conta
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
