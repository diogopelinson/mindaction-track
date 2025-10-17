import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateWeeklyZone } from "@/lib/progressUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import logo from "@/assets/logo.png";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";

const History = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    const { data: updatesData } = await supabase
      .from("weekly_updates")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number", { ascending: true });

    if (updatesData) {
      setUpdates(updatesData);
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="MindAction Club" className="w-32 h-32 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  const chartData = updates.map(update => ({
    semana: `S${update.week_number}`,
    peso: parseFloat(update.weight),
    gordura: update.body_fat_percentage ? parseFloat(update.body_fat_percentage) : null,
  }));

  const getPhotoLabel = (url: string, index: number) => {
    const labels = ['Frente', 'Lateral', 'Costas'];
    return labels[index] || `Foto ${index + 1}`;
  };

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage
      .from('weekly-photos')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-5xl font-bebas tracking-wider mb-2">Histórico de Progresso</h1>
          <p className="text-muted-foreground text-lg">Acompanhe sua evolução ao longo do tempo</p>
        </div>

        {/* Charts */}
        {updates.length > 1 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-bebas text-2xl">Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="semana" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="peso" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      name="Peso (kg)"
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {updates.some(u => u.body_fat_percentage) && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="font-bebas text-2xl">Evolução do % de Gordura</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="semana" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="gordura" 
                        stroke="hsl(var(--accent))" 
                        strokeWidth={3}
                        name="% Gordura"
                        dot={{ fill: 'hsl(var(--accent))', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Weekly Updates */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bebas tracking-wider">Check-ins Semanais</h2>
          
          {updates.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  Nenhum check-in registrado ainda. Faça seu primeiro check-in!
                </p>
              </CardContent>
            </Card>
          ) : (
            updates.map((update) => {
              // Calculate zone if there's a previous update
              const previousUpdate = updates[updates.indexOf(update) - 1];
              let zone = null;
              
              if (previousUpdate && profile) {
                zone = calculateWeeklyZone(
                  parseFloat(update.weight),
                  parseFloat(previousUpdate.weight),
                  profile?.goal_type || 'perda_peso',
                  1
                );
              }

              const photoUrls = update.photo_url 
                ? (Array.isArray(update.photo_url) ? update.photo_url : [update.photo_url])
                : [];

              return (
                <Card key={update.id} className="shadow-card hover:shadow-bronze transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-bebas text-3xl mb-2">
                          Semana {update.week_number}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {new Date(update.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      {zone && (
                        <Badge 
                          variant="outline" 
                          className={`text-lg px-4 py-1 ${
                            zone === 'green' 
                              ? 'bg-success/10 text-success border-success' 
                              : zone === 'yellow'
                              ? 'bg-warning/10 text-warning border-warning'
                              : 'bg-danger/10 text-danger border-danger'
                          }`}
                        >
                          {zone === 'green' ? 'Zona Verde' : zone === 'yellow' ? 'Zona Amarela' : 'Zona Vermelha'}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Peso</p>
                        <p className="text-2xl font-bold">{update.weight} kg</p>
                      </div>
                      
                      {update.body_fat_percentage && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">% Gordura</p>
                          <p className="text-2xl font-bold">{update.body_fat_percentage}%</p>
                        </div>
                      )}
                      
                      {update.waist_circumference && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Cintura</p>
                          <p className="text-2xl font-bold">{update.waist_circumference} cm</p>
                        </div>
                      )}
                      
                      {update.neck_circumference && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Pescoço</p>
                          <p className="text-2xl font-bold">{update.neck_circumference} cm</p>
                        </div>
                      )}
                      
                      {update.hip_circumference && (
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Quadril</p>
                          <p className="text-2xl font-bold">{update.hip_circumference} cm</p>
                        </div>
                      )}
                    </div>

                    {/* Photos */}
                    {photoUrls.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-lg mb-4">Fotos do Progresso</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {photoUrls.map((url, index) => (
                            <div 
                              key={index} 
                              className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all duration-300"
                              onClick={() => setSelectedImage(getPublicUrl(url))}
                            >
                              <img
                                src={getPublicUrl(url)}
                                alt={`Progresso semana ${update.week_number} - ${getPhotoLabel(url, index)}`}
                                className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src = logo;
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <p className="text-white font-semibold">{getPhotoLabel(url, index)}</p>
                                  <p className="text-white/80 text-sm">Clique para ampliar</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {update.notes && (
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Observações</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{update.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">Visualização ampliada da foto</DialogTitle>
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Visualização ampliada"
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;
