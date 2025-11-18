import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getZoneConfig, GoalSubtype } from "@/lib/progressUtils";
import { Target } from "lucide-react";

interface ZoneExplainerProps {
  goalType: 'perda_peso' | 'ganho_massa';
  goalSubtype: GoalSubtype;
  initialWeight: number;
  targetWeight?: number;
}

const ZoneExplainer = ({ goalType, goalSubtype, initialWeight, targetWeight }: ZoneExplainerProps) => {
  const config = getZoneConfig(goalType, goalSubtype);
  
  const yellowPercentRange = `${config.yellowMin}% - ${config.greenMin}%`;
  const greenPercentRange = `${config.greenMin}% - ${config.greenMax}%`;
  
  const isWeightLoss = goalType === 'perda_peso';
  
  // Calcular ranges de peso
  const yellowWeightMin = isWeightLoss 
    ? (initialWeight * (1 - config.greenMin / 100)).toFixed(1)
    : (initialWeight * (1 + config.yellowMin / 100)).toFixed(1);
    
  const yellowWeightMax = isWeightLoss 
    ? (initialWeight * (1 - config.yellowMin / 100)).toFixed(1)
    : (initialWeight * (1 + config.greenMin / 100)).toFixed(1);
    
  const greenWeightMin = isWeightLoss 
    ? (initialWeight * (1 - config.greenMax / 100)).toFixed(1)
    : (initialWeight * (1 + config.greenMin / 100)).toFixed(1);
    
  const greenWeightMax = isWeightLoss 
    ? (initialWeight * (1 - config.greenMin / 100)).toFixed(1)
    : (initialWeight * (1 + config.greenMax / 100)).toFixed(1);

  const getGoalTypeName = () => {
    if (goalType === 'ganho_massa') return 'Ganho de Massa';
    if (goalSubtype === 'moderada') return 'Perda de Peso - Moderada';
    if (goalSubtype === 'avancada') return 'Perda de Peso - Avançada';
    return 'Perda de Peso - Padrão';
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Entenda as Zonas de Progresso</CardTitle>
        </div>
        <CardDescription>
          Objetivo: <strong>{getGoalTypeName()}</strong> • Peso Inicial: <strong>{initialWeight.toFixed(1)} kg</strong>
          {targetWeight && (
            <span className="block mt-1 text-primary">
              Peso meta calculado automaticamente: <strong>{targetWeight.toFixed(1)} kg</strong>
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-success/10 border border-success/30 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-success mb-1">Zona Verde - No Caminho Ideal</p>
              <p className="text-sm text-muted-foreground">
                {isWeightLoss ? 'Perda' : 'Ganho'} de <strong>{greenPercentRange}</strong> do peso inicial
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Peso entre <strong>{greenWeightMin} kg</strong> e <strong>{greenWeightMax} kg</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-warning flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white font-bold text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-warning mb-1">Zona Amarela - Atenção</p>
              <p className="text-sm text-muted-foreground">
                {isWeightLoss ? 'Perda' : 'Ganho'} de <strong>{yellowPercentRange}</strong> do peso inicial
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Peso entre <strong>{yellowWeightMin} kg</strong> e <strong>{yellowWeightMax} kg</strong>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-danger/10 border border-danger/30 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-danger flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white font-bold text-sm">✕</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-danger mb-1">Zona Vermelha - Fora do Alvo</p>
              <p className="text-sm text-muted-foreground">
                {isWeightLoss ? 'Perda' : 'Ganho'} menor que <strong>{config.yellowMin}%</strong> ou maior que <strong>{config.greenMax}%</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Peso abaixo de <strong>{greenWeightMin} kg</strong>, acima de <strong>{yellowWeightMax} kg</strong> ou ganho de peso
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs text-muted-foreground">
            <strong>Importante:</strong> Todas as porcentagens são calculadas em relação ao seu peso inicial de <strong>{initialWeight.toFixed(1)} kg</strong>, não ao peso da semana anterior.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneExplainer;
