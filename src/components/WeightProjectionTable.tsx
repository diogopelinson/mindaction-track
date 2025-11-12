import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getZoneConfig, calculateWeeklyZoneByLimits, isMaintenancePhase, calculateMaintenanceZone } from "@/lib/progressUtils";
import type { WeeklyUpdate, Zone } from "@/lib/progressUtils";

interface WeightProjectionTableProps {
  initialWeight: number;
  goalType: 'perda_peso' | 'ganho_massa';
  goalSubtype?: 'padrao' | 'moderada' | 'standard';
  weeklyUpdates: WeeklyUpdate[];
}

const WeightProjectionTable = ({ 
  initialWeight, 
  goalType, 
  goalSubtype = 'padrao',
  weeklyUpdates 
}: WeightProjectionTableProps) => {
  const config = getZoneConfig(goalType, goalSubtype);
  
  // Calcular percentuais em kg
  const yellowPercentKg = (initialWeight * config.yellowMin) / 100;
  const greenMinKg = (initialWeight * config.greenMin) / 100;
  const greenMaxKg = (initialWeight * config.greenMax) / 100;

  // Encontrar peso da semana 18 para cálculo de manutenção
  const week18Update = weeklyUpdates.find(u => u.week_number === 18);
  const maintenanceWeight = week18Update ? week18Update.weight : null;

  // Gerar 24 semanas de projeção
  const weeks = Array.from({ length: 24 }, (_, i) => {
    const weekNumber = i + 1;
    const isMaintenance = isMaintenancePhase(weekNumber);
    
    // Cálculos cumulativos a partir do peso inicial
    let limInf: number;
    let projetado: number;
    let maxAting: number;

    if (isMaintenance && maintenanceWeight) {
      // FASE DE MANUTENÇÃO (Semanas 19-24)
      // Usar peso da semana 18 como referência
      projetado = maintenanceWeight; // Peso ideal = peso da semana 18
      limInf = maintenanceWeight * 0.99; // -1%
      maxAting = maintenanceWeight * 1.01; // +1%
    } else {
      // FASE DE PROGRESSÃO (Semanas 1-18)
      if (goalType === 'ganho_massa') {
        // Ganho de massa: adicionar progressivamente
        limInf = initialWeight + (yellowPercentKg * weekNumber);
        projetado = initialWeight + (greenMinKg * weekNumber);
        maxAting = initialWeight + (greenMaxKg * weekNumber);
      } else {
        // Perda de peso: subtrair progressivamente
        limInf = initialWeight - (yellowPercentKg * weekNumber);
        projetado = initialWeight - (greenMinKg * weekNumber);
        maxAting = initialWeight - (greenMaxKg * weekNumber);
      }
    }

    // Buscar peso atual se existir check-in para essa semana
    const weekUpdate = weeklyUpdates.find(u => u.week_number === weekNumber);
    const pesoAtual = weekUpdate?.weight;

    // Determinar se a semana já passou (tem check-in)
    const isCompleted = !!pesoAtual;

    // Calcular zona real se tiver peso atual
    let zone: Zone | null = null;
    if (pesoAtual) {
      if (isMaintenance && maintenanceWeight) {
        // Usar lógica de manutenção
        zone = calculateMaintenanceZone(pesoAtual, maintenanceWeight);
      } else {
        // Usar lógica de progressão
        zone = calculateWeeklyZoneByLimits(
          pesoAtual,
          parseFloat(limInf.toFixed(1)),
          parseFloat(projetado.toFixed(1)),
          parseFloat(maxAting.toFixed(1)),
          goalType
        );
      }
    }

    return {
      weekNumber,
      limInf: limInf.toFixed(1),
      projetado: projetado.toFixed(1),
      maxAting: maxAting.toFixed(1),
      pesoAtual: pesoAtual?.toFixed(1),
      isCompleted,
      zone,
      isMaintenance,
    };
  });

  // Função para determinar cor da linha baseada na zona
  const getRowColor = (zone: Zone | null, isCompleted: boolean) => {
    if (!isCompleted) return 'bg-muted/50'; // Futuro
    if (!zone) return 'bg-muted/50'; // Sem dados
    
    switch (zone) {
      case 'green': return 'bg-success/20 border-l-4 border-success';
      case 'yellow': return 'bg-warning/20 border-l-4 border-warning';
      case 'red': return 'bg-danger/20 border-l-4 border-danger';
    }
  };

  // Função para obter label da zona
  const getZoneLabel = (zone: Zone) => {
    switch (zone) {
      case 'green': return 'Verde';
      case 'yellow': return 'Amarela';
      case 'red': return 'Vermelha';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa Mind Fitness - Projeção de 24 Semanas</CardTitle>
        <CardDescription>
          Peso Inicial: <span className="font-bold">{initialWeight.toFixed(1)} kg</span>
          {' | '}
          {config.yellowMin}%: {yellowPercentKg.toFixed(3)} kg
          {' | '}
          {config.greenMin}%: {greenMinKg.toFixed(3)} kg
          {' | '}
          {config.greenMax}%: {greenMaxKg.toFixed(3)} kg
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-bold">Semanas</TableHead>
                <TableHead className="text-center font-bold">Lim Inf</TableHead>
                <TableHead className="text-center font-bold">Projetado</TableHead>
                <TableHead className="text-center font-bold">Max Ating</TableHead>
                <TableHead className="text-center font-bold">Peso Atual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeks.map((week) => (
                <TableRow 
                  key={week.weekNumber}
                  className={getRowColor(week.zone, week.isCompleted)}
                >
                  <TableCell className="text-center font-medium">
                    <div className="flex items-center justify-center gap-2">
                      {week.weekNumber}
                      {week.isMaintenance && (
                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                          Manutenção
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {week.isMaintenance ? '-' : week.limInf}
                  </TableCell>
                  <TableCell className="text-center font-semibold">
                    {week.isMaintenance ? '-' : week.projetado}
                  </TableCell>
                  <TableCell className="text-center">
                    {week.isMaintenance ? '-' : week.maxAting}
                  </TableCell>
                  <TableCell className="text-center">
                    {week.pesoAtual ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold">{week.pesoAtual} kg</span>
                        {week.zone && (
                          <Badge 
                            variant="outline"
                            className={`text-xs ${
                              week.zone === 'green' 
                                ? 'bg-success text-success-foreground border-success' 
                                : week.zone === 'yellow'
                                ? 'bg-warning text-warning-foreground border-warning'
                                : 'bg-danger text-danger-foreground border-danger'
                            }`}
                          >
                            {getZoneLabel(week.zone)}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Legenda de Zonas:</p>
          <p><span className="inline-block w-4 h-4 bg-success/20 border-l-4 border-success rounded mr-2"></span>Zona Verde - Progresso ideal</p>
          <p><span className="inline-block w-4 h-4 bg-warning/20 border-l-4 border-warning rounded mr-2"></span>Zona Amarela - Atenção necessária</p>
          <p><span className="inline-block w-4 h-4 bg-danger/20 border-l-4 border-danger rounded mr-2"></span>Zona Vermelha - Fora do objetivo</p>
          <p><span className="inline-block w-4 h-4 bg-muted/50 border border-border rounded mr-2"></span>Semanas futuras (projeção)</p>
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📅 Estrutura do Programa (24 Semanas)</p>
            <p className="text-blue-800 dark:text-blue-200">
              • <strong>Semanas 1-18:</strong> Fase de {goalType === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}<br/>
              • <strong>Semanas 19-24:</strong> Fase de Manutenção (manter peso atingido na semana 18)
            </p>
            {maintenanceWeight && (
              <p className="text-blue-800 dark:text-blue-200 mt-2">
                • <strong>Peso de Manutenção:</strong> {maintenanceWeight.toFixed(1)} kg (±1% = zona verde)
              </p>
            )}
          </div>

          <p className="mt-4 font-medium text-foreground">
            • <strong>Lim Inf:</strong> Limite inferior (zona amarela)<br/>
            • <strong>Projetado:</strong> Peso ideal para zona verde<br/>
            • <strong>Max Ating:</strong> Máximo atingível (zona verde)<br/>
            • <strong>Peso Atual:</strong> Seu peso registrado no check-in
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeightProjectionTable;
