import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getZoneConfig } from "@/lib/progressUtils";
import type { WeeklyUpdate } from "@/lib/progressUtils";

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

  // Gerar 24 semanas de projeção
  const weeks = Array.from({ length: 24 }, (_, i) => {
    const weekNumber = i + 1;
    
    // Cálculos cumulativos a partir do peso inicial
    let limInf: number;
    let projetado: number;
    let maxAting: number;

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

    // Buscar peso atual se existir check-in para essa semana
    const weekUpdate = weeklyUpdates.find(u => u.week_number === weekNumber);
    const pesoAtual = weekUpdate?.weight;

    // Determinar se a semana já passou (tem check-in)
    const isCompleted = !!pesoAtual;

    return {
      weekNumber,
      limInf: limInf.toFixed(1),
      projetado: projetado.toFixed(1),
      maxAting: maxAting.toFixed(1),
      pesoAtual: pesoAtual?.toFixed(1),
      isCompleted,
    };
  });

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
                  className={week.isCompleted ? 'bg-success/10' : 'bg-muted/50'}
                >
                  <TableCell className="text-center font-medium">
                    {week.weekNumber}
                  </TableCell>
                  <TableCell className="text-center">{week.limInf}</TableCell>
                  <TableCell className="text-center font-semibold">{week.projetado}</TableCell>
                  <TableCell className="text-center">{week.maxAting}</TableCell>
                  <TableCell className="text-center">
                    {week.pesoAtual ? (
                      <span className="font-bold text-success">{week.pesoAtual} kg</span>
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
          <p><span className="inline-block w-4 h-4 bg-success/10 border border-success/20 rounded mr-2"></span>Semanas com check-in realizado</p>
          <p><span className="inline-block w-4 h-4 bg-muted/50 border border-border rounded mr-2"></span>Semanas futuras (projeção)</p>
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
