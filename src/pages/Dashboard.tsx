import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LogOut, TrendingUp, Camera, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentWeek] = useState(10);
  
  // Mock data - will be replaced with real data from Lovable Cloud
  const userData = {
    name: "Joyce Alves",
    initialWeight: 64.5,
    currentWeight: 66.0,
    targetWeight: 65.7,
    minWeight: 65.5,
    maxWeight: 67.3,
    bodyFat: 28.5,
    weeklyProgress: [
      { week: 1, weight: 64.5, min: 64.3, target: 64.3, max: 64.4 },
      { week: 2, weight: 64.7, min: 64.4, target: 64.5, max: 64.7 },
      { week: 3, weight: 64.9, min: 64.6, target: 64.8, max: 65.1 },
      { week: 4, weight: 65.1, min: 64.7, target: 65.0, max: 65.4 },
      { week: 5, weight: 65.3, min: 64.9, target: 65.2, max: 65.7 },
      { week: 6, weight: 65.5, min: 65.1, target: 65.4, max: 66.0 },
      { week: 7, weight: 65.7, min: 65.2, target: 65.7, max: 66.3 },
      { week: 8, weight: 65.9, min: 65.4, target: 65.9, max: 66.7 },
      { week: 9, weight: 66.0, min: 65.5, target: 66.1, max: 67.0 },
      { week: 10, weight: 66.0, min: 65.7, target: 66.3, max: 67.3 },
    ]
  };

  const getProgressZone = () => {
    const { currentWeight, targetWeight, minWeight, maxWeight } = userData;
    
    if (currentWeight >= minWeight && currentWeight <= targetWeight) {
      return { color: "bg-success", label: "Zona Verde", description: "Progresso ideal!" };
    } else if (currentWeight > targetWeight && currentWeight <= maxWeight) {
      return { color: "bg-warning", label: "Zona Amarela", description: "Atenção ao protocolo" };
    } else {
      return { color: "bg-danger", label: "Zona Vermelha", description: "Revisar estratégia" };
    }
  };

  const progressZone = getProgressZone();
  const progressPercentage = ((currentWeek / 24) * 100);

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MindAction Club" className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bebas tracking-wide">MindAction Club</h1>
                <p className="text-sm text-muted-foreground">Olá, {userData.name}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Progress Overview */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bebas tracking-wide">
              <TrendingUp className="h-6 w-6 text-primary" />
              Seu Progresso - Semana {currentWeek}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Peso Inicial</p>
                <p className="text-2xl font-bebas">{userData.initialWeight} kg</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Peso Atual</p>
                <p className="text-2xl font-bebas">{userData.currentWeight} kg</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">Meta Projetada</p>
                <p className="text-2xl font-bebas">{userData.targetWeight} kg</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground mb-1">% Gordura</p>
                <p className="text-2xl font-bebas">{userData.bodyFat}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-raleway">Progresso da Trilha</span>
                <span className="text-sm text-muted-foreground">
                  Semana {currentWeek} de 24
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            {/* Zone Indicator */}
            <div className={`p-4 rounded-lg ${progressZone.color}/10 border-2 border-current`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bebas text-xl tracking-wide">{progressZone.label}</p>
                  <p className="text-sm text-muted-foreground">{progressZone.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full ${progressZone.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Chart Preview */}
        <Card className="shadow-card animate-slide-up">
          <CardHeader>
            <CardTitle className="text-2xl font-bebas tracking-wide">
              Evolução Semanal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {userData.weeklyProgress.slice(-8).map((week) => (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-muted/30 rounded-t relative" 
                       style={{ height: `${(week.weight / 70) * 100}%` }}>
                    <div className="absolute inset-0 gradient-bronze opacity-70 rounded-t" />
                  </div>
                  <span className="text-xs text-muted-foreground">S{week.week}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button 
            size="lg" 
            className="gradient-bronze shadow-bronze h-auto py-6"
            onClick={() => navigate('/weekly-update')}
          >
            <Camera className="mr-2 h-5 w-5" />
            <div className="text-left">
              <p className="font-bebas text-lg">Atualização Semanal</p>
              <p className="text-xs opacity-90">Registre seu progresso</p>
            </div>
          </Button>

          <Button 
            size="lg" 
            variant="outline"
            className="h-auto py-6 border-2"
            onClick={() => navigate('/history')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            <div className="text-left">
              <p className="font-bebas text-lg">Histórico Completo</p>
              <p className="text-xs opacity-80">Ver todas as semanas</p>
            </div>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
