import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GoalPredictionProps {
  profile: any;
  updates: any[];
}

const GoalPrediction = ({ profile, updates }: GoalPredictionProps) => {
  if (updates.length < 2) {
    return null;
  }

  // Calculate average weekly change
  let totalChange = 0;
  for (let i = 1; i < updates.length; i++) {
    const change = updates[i].weight - updates[i - 1].weight;
    totalChange += change;
  }
  const avgWeeklyChange = totalChange / (updates.length - 1);

  const currentWeight = updates[updates.length - 1].weight;
  const targetWeight = profile.target_weight;
  const remainingWeight = Math.abs(targetWeight - currentWeight);

  // Mapa Mind Fitness tem 24 semanas totais
  const TOTAL_WEEKS = 24;
  const currentWeek = updates.length;
  const weeksToGoal = Math.max(0, TOTAL_WEEKS - currentWeek);
  
  // Verificar se está no ritmo adequado
  const velocityBasedWeeks = Math.ceil(remainingWeight / Math.abs(avgWeeklyChange));
  const isSlowPace = velocityBasedWeeks > weeksToGoal && weeksToGoal > 0;
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + weeksToGoal * 7);

  // Calculate progress velocity
  const isOnTrack = profile.goal_type === 'perda_peso' 
    ? avgWeeklyChange < 0 
    : avgWeeklyChange > 0;

  const velocityPercentage = Math.abs((avgWeeklyChange / profile.initial_weight) * 100);

  return (
    <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-3 rounded-full">
              <Target className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="font-bebas text-2xl">Previsão de Meta</CardTitle>
              <CardDescription>Mapa Mind Fitness (24 semanas)</CardDescription>
            </div>
          </div>
          {isSlowPace && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
              ⚠️ Ajustar ritmo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card p-5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Velocidade Semanal</p>
            </div>
            <p className="text-3xl font-bold">{Math.abs(avgWeeklyChange).toFixed(2)} kg</p>
            <Badge 
              variant="outline" 
              className={`mt-2 ${isOnTrack ? 'bg-success/10 text-success border-success' : 'bg-warning/10 text-warning border-warning'}`}
            >
              {isOnTrack ? 'No ritmo' : 'Atenção'}
            </Badge>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Semanas Restantes</p>
            </div>
            <p className="text-3xl font-bold">{weeksToGoal}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {remainingWeight.toFixed(1)} kg até a meta
            </p>
          </div>

          <div className="bg-card p-5 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Previsão</p>
            </div>
            <p className="text-xl font-bold">
              {estimatedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Data estimada
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Velocidade atual:</strong> {velocityPercentage.toFixed(2)}% do peso corporal por semana.
            {isOnTrack ? ' Continue assim!' : ' Revise seu plano com seu mentor.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalPrediction;
