import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertTriangle } from "lucide-react";
import { MenteeData, MenteeStatus, calculateProgressPercentage } from "@/lib/adminUtils";
import { getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import { Progress } from "@/components/ui/progress";

interface MenteeCardProps {
  mentee: MenteeData;
  status: MenteeStatus;
  onViewDetails: () => void;
}

const MenteeCard = ({ mentee, status, onViewDetails }: MenteeCardProps) => {
  const currentWeight = mentee.updates && mentee.updates.length > 0
    ? [...mentee.updates].sort((a, b) => b.week_number - a.week_number)[0].weight
    : mentee.initial_weight;

  const progressPercentage = calculateProgressPercentage(
    currentWeight,
    mentee.initial_weight,
    mentee.target_weight,
    mentee.goal_type
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bebas text-xl">{mentee.full_name}</h3>
              {status.needsAttention && (
                <AlertTriangle className="h-5 w-5 text-danger" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{mentee.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mentee.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
            </p>
            {mentee.level_title && (
              <Badge 
                variant="outline" 
                className="mt-2 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 border-yellow-400/30 text-yellow-600 dark:text-yellow-400 text-xs"
              >
                🏆 {mentee.level_title} - Nível {mentee.current_level}
              </Badge>
            )}
          </div>
          <Badge className={getZoneColor(status.currentZone)}>
            {getZoneLabel(status.currentZone)}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Inicial</p>
              <p className="font-semibold">{mentee.initial_weight} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Atual</p>
              <p className="font-semibold">{currentWeight.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Meta</p>
              <p className="font-semibold">{mentee.target_weight} kg</p>
            </div>
          </div>

          {status.needsAttention && (
            <div className="flex flex-col gap-1 p-2 bg-danger/10 border border-danger rounded-lg">
              {status.attentionReasons.map((reason, i) => (
                <p key={i} className="text-xs text-danger">{reason}</p>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Última atualização: há {status.lastUpdateDaysAgo} dias
          </p>
        </div>

        <Button onClick={onViewDetails} className="w-full" size="sm">
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};

export default MenteeCard;
