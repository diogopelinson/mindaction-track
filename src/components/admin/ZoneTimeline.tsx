import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WeeklyZoneData, formatDate } from "@/lib/adminUtils";
import { getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ZoneTimelineProps {
  zones: WeeklyZoneData[];
}

const ZoneTimeline = ({ zones }: ZoneTimelineProps) => {
  if (zones.length === 0) {
    return null;
  }

  // Pegar últimas 12 semanas ou todas se houver menos
  const recentZones = zones.slice(-12);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline de Zonas</CardTitle>
        <CardDescription>Últimas {recentZones.length} semanas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {recentZones.map((zoneData) => (
            <TooltipProvider key={zoneData.week}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`h-12 w-12 rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${getZoneColor(zoneData.zone)}`}
                  >
                    <span className="text-xs font-bold">S{zoneData.week}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs space-y-1">
                    <p><strong>Semana {zoneData.week}</strong></p>
                    <p>Zona: {getZoneLabel(zoneData.zone)}</p>
                    <p>Peso: {zoneData.weight.toFixed(1)} kg</p>
                    <p>Data: {formatDate(zoneData.date)}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-success" />
            <span>Verde: No objetivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-warning" />
            <span>Amarela: Atenção</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-danger" />
            <span>Vermelha: Fora da meta</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneTimeline;
