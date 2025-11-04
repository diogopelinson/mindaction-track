import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogOut, Edit2, Save, User, Mail, Phone, Ruler, Weight as WeightIcon, Target, Camera, Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { profileUpdateSchema } from "@/lib/validationSchemas";
import { logAudit } from "@/lib/auditLogger";
import { getSignedPhotoUrl } from "@/lib/storageUtils";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Carregar URL assinada do avatar se existir
      if (data.avatar_url) {
        const signedUrl = await getSignedPhotoUrl('avatars', data.avatar_url);
        setAvatarSignedUrl(signedUrl);
      }

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem.",
        });
        return;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 5MB.",
        });
        return;
      }

      setIsUploadingAvatar(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Armazenar apenas o caminho, não a URL pública
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Gerar URL assinada para exibição
      const signedUrl = await getSignedPhotoUrl('avatars', filePath);
      setAvatarSignedUrl(signedUrl);

      setProfile({ ...profile, avatar_url: filePath });
      setEditedProfile({ ...editedProfile, avatar_url: filePath });

      // Log de auditoria
      await logAudit({
        action: 'photo.upload',
        resourceType: 'avatar',
        details: { file_name: filePath }
      });

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: error.message,
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Validação com zod
      const validation = profileUpdateSchema.safeParse({
        phone: editedProfile.phone,
        height: editedProfile.height,
        targetWeight: editedProfile.target_weight,
      });

      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: validation.error.issues[0].message,
        });
        setIsLoading(false);
        return;
      }

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

      // Log de auditoria
      await logAudit({
        action: 'profile.update',
        resourceType: 'profile',
        details: { fields_updated: ['phone', 'height', 'target_weight'] }
      });

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

        {/* Profile Header Card with Avatar */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <CardContent className="pt-8 pb-6 relative">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with Upload */}
              <div className="relative mb-4 group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
                <Avatar className="relative h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={avatarSignedUrl || undefined} alt={profile.full_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bebas">
                    {getInitials(profile.full_name)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Upload Button Overlay */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Upload className="h-8 w-8 text-white animate-pulse" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Name and Email */}
              <div className="space-y-2">
                <h2 className="text-3xl font-bebas tracking-wider flex items-center gap-2">
                  {profile.full_name}
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                </h2>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </p>
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20">
                    {profile.goal_type === 'perda_peso' ? '🔥 Perda de Peso' : '💪 Ganho de Massa'}
                  </Badge>
                  <Badge variant="outline" className="bg-accent/10 border-accent/20">
                    {profile.sex === 'male' ? '👨 Masculino' : '👩 Feminino'}
                  </Badge>
                  {profile.level_title && (
                    <Badge 
                      variant="outline" 
                      className="bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-yellow-400/30 text-yellow-600 dark:text-yellow-400 font-semibold"
                    >
                      🏆 {profile.level_title} - Nível {profile.current_level}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>Dados do seu cadastro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Idade</p>
                <p className="font-semibold text-lg">{profile.age} anos</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">CPF</p>
                <p className="font-semibold text-sm">{profile.cpf}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contato
            </CardTitle>
            <CardDescription>Informações de contato {isEditing && '(editável)'}</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={editedProfile?.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="text-lg"
                />
              </div>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <p className="font-semibold text-lg">{profile.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Physical Measurements */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" />
              Medidas Físicas
            </CardTitle>
            <CardDescription>Altura e peso meta {isEditing && '(editáveis)'}</CardDescription>
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
                    className="text-lg"
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
                    className="text-lg"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                  <Ruler className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground text-center">Altura</p>
                  <p className="text-xl font-bold text-center">{profile.height} cm</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-accent/20">
                  <Target className="h-6 w-6 text-accent mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground text-center">Peso Meta</p>
                  <p className="text-xl font-bold text-center">{profile.target_weight} kg</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals and Progress */}
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="font-bebas flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Sua Jornada
            </CardTitle>
            <CardDescription>Progresso do seu objetivo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl text-center border-2 border-dashed">
                <WeightIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-2">Peso Inicial</p>
                <p className="text-2xl font-bebas">{profile.initial_weight} kg</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 rounded-xl text-center border-2 border-primary shadow-lg">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <p className="text-xs text-muted-foreground mb-2">Peso Meta</p>
                <p className="text-2xl font-bebas text-primary">{profile.target_weight} kg</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
              <p className="text-sm font-medium">
                {profile.goal_type === 'perda_peso' 
                  ? `🎯 Meta: Perder ${(profile.initial_weight - profile.target_weight).toFixed(1)} kg`
                  : `🎯 Meta: Ganhar ${(profile.target_weight - profile.initial_weight).toFixed(1)} kg`
                }
              </p>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full shadow-lg"
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
