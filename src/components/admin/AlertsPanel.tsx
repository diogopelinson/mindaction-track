import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, TrendingDown, UserPlus } from "lucide-react";
import { MenteeData, MenteeStatus } from "@/lib/adminUtils";

interface Alert {
  menteeId: string;
  menteeName: string;
  type: 'urgent' | 'high' | 'medium' | 'low';
  message: string;
  icon: React.ReactNode;
}

interface AlertsPanelProps {
  mentees: Array<{ mentee: MenteeData; status: MenteeStatus }>;
  onSelectMentee: (menteeId: string) => void;
}

const AlertsPanel = ({ mentees, onSelectMentee }: AlertsPanelProps) => {
  const generateAlerts = (): Alert[] => {
    const alerts: Alert[] = [];

    mentees.forEach(({ mentee, status }) => {
      // URGENTE: > 14 dias sem check-in OU 3+ semanas zona vermelha
      if (status.lastUpdateDaysAgo > 14) {
        alerts.push({
          menteeId: mentee.id,
          menteeName: mentee.full_name,
          type: 'urgent',
          message: `Sem check-in há ${status.lastUpdateDaysAgo} dias`,
          icon: <AlertTriangle className="h-4 w-4" />,
        });
      }

      // Verificar 3+ semanas em zona vermelha
      const updates = mentee.updates || [];
      if (updates.length >= 3) {
        const sortedUpdates = [...updates].sort((a, b) => b.week_number - a.week_number);
        let redZoneStreak = 0;
        
        for (let i = 0; i < Math.min(3, sortedUpdates.length - 1); i++) {
          const current = sortedUpdates[i];
          const previous = sortedUpdates[i + 1];
          const weightChange = current.weight - previous.weight;
          
          if (mentee.goal_type === 'perda_peso' && weightChange >= 0) {
            redZoneStreak++;
          } else if (mentee.goal_type === 'ganho_massa' && weightChange <= 0) {
            redZoneStreak++;
          }
        }

        if (redZoneStreak >= 3) {
          alerts.push({
            menteeId: mentee.id,
            menteeName: mentee.full_name,
            type: 'urgent',
            message: '3+ semanas em zona vermelha',
            icon: <TrendingDown className="h-4 w-4" />,
          });
        }
      }

      // ALTA: 7-14 dias sem check-in OU 2 semanas zona vermelha
      if (status.lastUpdateDaysAgo >= 7 && status.lastUpdateDaysAgo <= 14) {
        alerts.push({
          menteeId: mentee.id,
          menteeName: mentee.full_name,
          type: 'high',
          message: `Sem check-in há ${status.lastUpdateDaysAgo} dias`,
          icon: <Clock className="h-4 w-4" />,
        });
      }

      // MÉDIA: Estagnação ou zona amarela consistente
      if (status.attentionReasons.some(reason => reason.includes('Estagnação'))) {
        alerts.push({
          menteeId: mentee.id,
          menteeName: mentee.full_name,
          type: 'medium',
          message: 'Peso estagnado há 3+ semanas',
          icon: <TrendingDown className="h-4 w-4" />,
        });
      }

      // BAIXA: Novos mentorados sem check-in
      if (updates.length === 0) {
        alerts.push({
          menteeId: mentee.id,
          menteeName: mentee.full_name,
          type: 'low',
          message: 'Novo mentorado - aguardando primeiro check-in',
          icon: <UserPlus className="h-4 w-4" />,
        });
      }
    });

    // Ordenar por prioridade
    const priority = { urgent: 0, high: 1, medium: 2, low: 3 };
    return alerts.sort((a, b) => priority[a.type] - priority[b.type]);
  };

  const alerts = generateAlerts();
  const urgentCount = alerts.filter(a => a.type === 'urgent').length;
  const highCount = alerts.filter(a => a.type === 'high').length;

  const getAlertVariant = (type: Alert['type']) => {
    switch (type) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const getAlertLabel = (type: Alert['type']) => {
    switch (type) {
      case 'urgent': return 'URGENTE';
      case 'high': return 'ALTA';
      case 'medium': return 'MÉDIA';
      case 'low': return 'BAIXA';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <Card className="border-warning">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertas e Notificações
            </CardTitle>
            <CardDescription>
              {urgentCount > 0 && `${urgentCount} urgente${urgentCount > 1 ? 's' : ''}`}
              {urgentCount > 0 && highCount > 0 && ', '}
              {highCount > 0 && `${highCount} alta${highCount > 1 ? 's' : ''}`}
            </CardDescription>
          </div>
          <Badge variant="destructive" className="h-8 min-w-8 flex items-center justify-center">
            {alerts.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {alerts.slice(0, 10).map((alert, index) => (
            <div
              key={`${alert.menteeId}-${index}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-full ${
                  alert.type === 'urgent' ? 'bg-destructive/10 text-destructive' :
                  alert.type === 'high' ? 'bg-primary/10 text-primary' :
                  alert.type === 'medium' ? 'bg-muted' :
                  'bg-muted/50'
                }`}>
                  {alert.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{alert.menteeName}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
                <Badge variant={getAlertVariant(alert.type)} className="shrink-0">
                  {getAlertLabel(alert.type)}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => onSelectMentee(alert.menteeId)}
              >
                Ver
              </Button>
            </div>
          ))}
        </div>
        {alerts.length > 10 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            +{alerts.length - 10} alertas adicionais
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;