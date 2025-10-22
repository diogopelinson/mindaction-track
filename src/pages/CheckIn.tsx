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
import { CheckInTutorial } from "@/components/CheckInTutorial";
import { BodyFatGuide } from "@/components/BodyFatGuide";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkInSchema } from "@/lib/validationSchemas";

const CheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekNumber, setWeekNumber] = useState(1);
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [sidePhoto, setSidePhoto] = useState<File | null>(null);
  const [backPhoto, setBackPhoto] = useState<File | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  useEffect(() => {
    checkAuthAndPermissions();
  }, []);

  const checkAuthAndPermissions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch profile and verify it exists
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData || profileError) {
        await supabase.auth.signOut();
        toast({
          title: "Sessão inválida",
          description: "Sua conta não foi encontrada. Por favor, cadastre-se novamente.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setProfile(profileData);

      // Calculate week number
      const { count } = await supabase
        .from("weekly_updates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const newWeekNumber = (count || 0) + 1;
      setWeekNumber(newWeekNumber);
      
      // Verificar se é o primeiro check-in e se já viu o tutorial
      if (newWeekNumber === 1) {
        const hasSeenTutorial = localStorage.getItem('hasSeenCheckInTutorial');
        if (!hasSeenTutorial) {
          setShowTutorial(true);
        }
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

  const validateMeasurements = (neck: number, waist: number, hip?: number | null) => {
    const warnings: string[] = [];
    
    if (neck < 25 || neck > 60) {
      warnings.push("Medida do pescoço parece incomum. Verifique se está correta.");
    }
    
    if (waist < 50 || waist > 150) {
      warnings.push("Medida da cintura parece incomum. Verifique se está correta.");
    }
    
    if (waist <= neck) {
      warnings.push("A cintura deve ser maior que o pescoço. Verifique as medidas.");
    }
    
    if (hip && hip < waist) {
      warnings.push("O quadril geralmente é maior que a cintura. Verifique as medidas.");
    }
    
    return warnings;
  };

  const handleMeasurementChange = () => {
    const neckInput = document.getElementById("neck_circumference") as HTMLInputElement;
    const waistInput = document.getElementById("waist_circumference") as HTMLInputElement;
    const hipInput = document.getElementById("hip_circumference") as HTMLInputElement;
    
    const neck = parseFloat(neckInput?.value || "0");
    const waist = parseFloat(waistInput?.value || "0");
    const hip = profile?.sex === "female" ? parseFloat(hipInput?.value || "0") : null;
    
    if (neck > 0 && waist > 0) {
      const warnings = validateMeasurements(neck, waist, hip);
      setValidationWarnings(warnings);
    }
  };

  const completeTutorial = () => {
    localStorage.setItem('hasSeenCheckInTutorial', 'true');
    setShowTutorial(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const weight = parseFloat(formData.get("weight") as string);
    const neck = parseFloat(formData.get("neck_circumference") as string);
    const waist = parseFloat(formData.get("waist_circumference") as string);
    const hip = profile?.sex === "female" ? parseFloat(formData.get("hip_circumference") as string) : null;
    const notes = formData.get("notes") as string;

    // Validação com zod
    const validation = checkInSchema.safeParse({
      weight,
      neckCircumference: neck || undefined,
      waistCircumference: waist || undefined,
      hipCircumference: hip || undefined,
      notes: notes || undefined,
    });

    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Dados inválidos",
        description: validation.error.issues[0].message,
      });
      return;
    }

    // Validação adicional de medidas
    const warnings = validateMeasurements(neck, waist, hip);
    if (warnings.length > 0) {
      toast({
        variant: "destructive",
        title: "Verifique as medidas",
        description: warnings.join(" "),
      });
      return;
    }

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

  return (
    <>
      {showTutorial && <CheckInTutorial onComplete={completeTutorial} />}
      
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medidas (cm)</CardTitle>
                  <CardDescription>
                    As medidas são usadas para calcular o percentual de gordura corporal pelo Método Navy
                  </CardDescription>
                </div>
                <BodyFatGuide />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {validationWarnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {validationWarnings.map((warning, i) => (
                      <div key={i}>• {warning}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="neck_circumference">Circunferência do Pescoço *</Label>
                <Input
                  id="neck_circumference"
                  name="neck_circumference"
                  type="number"
                  step="0.1"
                  required
                  placeholder="38.0"
                  onChange={handleMeasurementChange}
                  min="25"
                  max="60"
                />
                <p className="text-xs text-muted-foreground mt-1">Valores típicos: 30-45 cm</p>
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
                  onChange={handleMeasurementChange}
                  min="50"
                  max="150"
                />
                <p className="text-xs text-muted-foreground mt-1">Valores típicos: 60-120 cm</p>
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
                    onChange={handleMeasurementChange}
                    min="50"
                    max="170"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Valores típicos: 80-130 cm</p>
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
    </>
  );
};

export default CheckIn;