import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Weight, Percent } from "lucide-react";
import logo from "@/assets/logo.png";

const History = () => {
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("weekly_updates")
      .select("*")
      .eq("user_id", user.id)
      .order("week_number", { ascending: false });

    if (!error && data) {
      setUpdates(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <img src={logo} alt="Loading" className="h-16 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bebas">Histórico Completo</h1>
            <p className="text-sm text-muted-foreground">Seus últimos registros</p>
          </div>
        </div>

        {updates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                Você ainda não tem nenhum check-in. Faça seu primeiro check-in na segunda-feira!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => (
              <Card key={update.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-bebas">Semana {update.week_number}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(update.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Weight className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Peso</p>
                        <p className="font-semibold">{update.weight} kg</p>
                      </div>
                    </div>
                    {update.body_fat_percentage && (
                      <div className="flex items-center gap-2">
                        <Percent className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Gordura</p>
                          <p className="font-semibold">{update.body_fat_percentage}%</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Medidas (cm)</p>
                      <p className="text-sm">
                        P: {update.neck_circumference} / C: {update.waist_circumference}
                        {update.hip_circumference && ` / Q: ${update.hip_circumference}`}
                      </p>
                    </div>
                  </div>

                  {update.photo_url && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {update.photo_url.split(",").map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}

                  {update.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm">{update.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;