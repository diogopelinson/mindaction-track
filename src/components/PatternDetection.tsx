import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, TrendingUp, CheckCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PatternDetectionProps {
  updates: any[];
  profile: any;
}

const PatternDetection = ({ updates, profile }: PatternDetectionProps) => {
  if (updates.length < 3) return null;

  const patterns: any[] = [];
  const recentUpdates = updates.slice(-4);

  // Check for red zone streak
  let redZoneCount = 0;
  for (let i = 1; i < recentUpdates.length; i++) {
    const change = recentUpdates[i].weight - recentUpdates[i - 1].weight;
    const isRed = profile.goal_type === 'perda_peso' ? change > 0 : change < 0;
    if (isRed) redZoneCount++;
  }

  if (redZoneCount >= 2) {
    patterns.push({
      type: 'warning',
      icon: AlertTriangle,
      title: 'Zona Vermelha Detectada',
      description: `Você está na zona vermelha há ${redZoneCount} semanas consecutivas. Considere revisar seu plano com seu mentor.`,
      action: 'Agende uma conversa com seu mentor para ajustar sua estratégia.'
    });
  }

  // Check for stagnation
  const lastThreeWeights = recentUpdates.slice(-3).map(u => u.weight);
  const maxDiff = Math.max(...lastThreeWeights) - Math.min(...lastThreeWeights);
  
  if (maxDiff < 0.5) {
    patterns.push({
      type: 'info',
      icon: Activity,
      title: 'Peso Estável',
      description: 'Seu peso tem se mantido estável nas últimas 3 semanas.',
      action: profile.goal_type === 'perda_peso' 
        ? 'Pode ser necessário ajustar sua dieta ou aumentar a intensidade dos treinos.'
        : 'Considere aumentar sua ingestão calórica ou revisar seu treino.'
    });
  }

  // Check for rapid progress
  const avgChange = recentUpdates.reduce((acc, curr, idx) => {
    if (idx === 0) return acc;
    return acc + Math.abs(curr.weight - recentUpdates[idx - 1].weight);
  }, 0) / (recentUpdates.length - 1);

  if (avgChange > 1.5) {
    patterns.push({
      type: 'warning',
      icon: TrendingDown,
      title: 'Mudança Rápida Detectada',
      description: `Você está perdendo/ganhando ${avgChange.toFixed(1)} kg por semana em média.`,
      action: 'Mudanças muito rápidas podem não ser sustentáveis. Converse com seu mentor sobre ajustes.'
    });
  }

  // Check for consistent progress
  let consistentProgress = true;
  for (let i = 1; i < recentUpdates.length; i++) {
    const change = recentUpdates[i].weight - recentUpdates[i - 1].weight;
    const isGood = profile.goal_type === 'perda_peso' ? change < 0 : change > 0;
    if (!isGood) consistentProgress = false;
  }

  if (consistentProgress && recentUpdates.length >= 3) {
    patterns.push({
      type: 'success',
      icon: CheckCircle,
      title: 'Progresso Consistente!',
      description: `Parabéns! Você está na zona verde há ${recentUpdates.length - 1} semanas consecutivas.`,
      action: 'Continue com o excelente trabalho! Mantenha sua rotina atual.'
    });
  }

  if (patterns.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bebas text-2xl flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Padrões Detectados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {patterns.map((pattern, idx) => {
          const Icon = pattern.icon;
          return (
            <Alert 
              key={idx}
              variant={pattern.type === 'warning' ? 'destructive' : 'default'}
              className={
                pattern.type === 'success' 
                  ? 'bg-success/10 border-success' 
                  : pattern.type === 'info'
                  ? 'bg-primary/10 border-primary'
                  : ''
              }
            >
              <Icon className="h-5 w-5" />
              <AlertTitle className="font-semibold flex items-center gap-2">
                {pattern.title}
                <Badge variant="outline" className="ml-auto">
                  IA
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>{pattern.description}</p>
                <p className="text-sm font-medium pt-2 border-t border-border">
                  💡 {pattern.action}
                </p>
              </AlertDescription>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PatternDetection;
