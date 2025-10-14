import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera } from "lucide-react";
import logo from "@/assets/logo.png";

const CheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);

  useEffect(() => {
    checkAuthAndPermissions();
  }, []);

  const checkAuthAndPermissions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // Check if today is Monday
    const today = new Date().getDay();
    const isMonday = today === 1;

    // Check if user already did check-in this week
    const { data: existingCheckin } = await supabase
      .from("weekly_updates")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", new Date(new Date().setDate(new Date().getDate() - 7)).toISOString())
      .maybeSingle();

    setCanCheckIn(isMonday && !existingCheckin);

    // Calculate week number
    const { count } = await supabase
      .from("weekly_updates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setWeekNumber((count || 0) + 1);
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const weight = parseFloat(formData.get("weight") as string);
    const neck = parseFloat(formData.get("neck_circumference") as string);
    const waist = parseFloat(formData.get("waist_circumference") as string);
    const hip = profile?.sex === "female" ? parseFloat(formData.get("hip_circumference") as string) : null;
    const notes = formData.get("notes") as string;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upload photos
    let photoUrls: string[] = [];
    const photos = [frontPhoto, sidePhoto, backPhoto];
    const photoLabels = ["front", "side", "back"];

    for (let i = 0; i < photos.length; i++) {
      if (photos[i]) {
        const fileName = `${user.id}/${Date.now()}_${photoLabels[i]}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("weekly-photos")
          .upload(fileName, photos[i]!);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("weekly-photos")
            .getPublicUrl(fileName);
          photoUrls.push(publicUrl);
        }
      }
    }

    // Insert check-in
    const { error } = await supabase
      .from("weekly_updates")
      .insert({
        user_id: user.id,
        week_number: weekNumber,
        weight,
        neck_circumference: neck,
        waist_circumference: waist,
        hip_circumference: hip,
        photo_url: photoUrls.join(","),
        notes,
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar check-in",
        description: error.message,
      });
    } else {
      toast({
        title: "Check-in realizado com sucesso!",
        description: "Seus dados foram salvos.",
      });
      navigate("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  if (!canCheckIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-bebas text-2xl">Check-in Indisponível</CardTitle>
            <CardDescription>
              {new Date().getDay() !== 1
                ? "O check-in está disponível apenas às segundas-feiras."
                : "Você já realizou seu check-in desta semana. Retorne na próxima segunda-feira."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <img src={logo} alt="Logo" className="h-12" />
          <div>
            <h1 className="text-2xl font-bebas">Check-in Semanal</h1>
            <p className="text-sm text-muted-foreground">Semana {weekNumber}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Peso</CardTitle>
              <CardDescription>Meça em jejum, logo ao acordar</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="weight">Peso (kg) *</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                required
                placeholder="80.0"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Medidas (cm)</CardTitle>
              <CardDescription>
                As medidas são usadas para calcular o percentual de gordura corporal pelo Método Navy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="neck_circumference">Circunferência do Pescoço *</Label>
                <Input
                  id="neck_circumference"
                  name="neck_circumference"
                  type="number"
                  step="0.1"
                  required
                  placeholder="38.0"
                />
              </div>
              <div>
                <Label htmlFor="waist_circumference">Circunferência da Cintura *</Label>
                <Input
                  id="waist_circumference"
                  name="waist_circumference"
                  type="number"
                  step="0.1"
                  required
                  placeholder="90.0"
                />
              </div>
              {profile?.sex === "female" && (
                <div>
                  <Label htmlFor="hip_circumference">Circunferência do Quadril *</Label>
                  <Input
                    id="hip_circumference"
                    name="hip_circumference"
                    type="number"
                    step="0.1"
                    required
                    placeholder="100.0"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos</CardTitle>
              <CardDescription>Tire 3 fotos: Frente, Lateral e Costas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="front-photo">Frente</Label>
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="front-photo" className="cursor-pointer flex-1">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {frontPhoto ? frontPhoto.name : "Clique para tirar/selecionar foto"}
                      </p>
                    </div>
                  </label>
                  <input
                    id="front-photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setFrontPhoto(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="side-photo">Lateral</Label>
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="side-photo" className="cursor-pointer flex-1">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {sidePhoto ? sidePhoto.name : "Clique para tirar/selecionar foto"}
                      </p>
                    </div>
                  </label>
                  <input
                    id="side-photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setSidePhoto(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="back-photo">Costas</Label>
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor="back-photo" className="cursor-pointer flex-1">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                      <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        {backPhoto ? backPhoto.name : "Clique para tirar/selecionar foto"}
                      </p>
                    </div>
                  </label>
                  <input
                    id="back-photo"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => setBackPhoto(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
              <CardDescription>Como você está se sentindo?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Como você está se sentindo? Alguma mudança na rotina?"
                rows={4}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" size="lg">
            Salvar Check-in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CheckIn;