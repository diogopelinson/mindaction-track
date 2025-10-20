import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Target, TrendingUp, Calendar, Activity } from "lucide-react";
import { MenteeData, MenteeStatus, calculateProgressPercentage, formatDate } from "@/lib/adminUtils";
import { Badge } from "@/components/ui/badge";
import { getZoneColor, getZoneLabel } from "@/lib/progressUtils";
import StatsCard from "@/components/StatsCard";
import ZoneTimeline from "./ZoneTimeline";
import { calculateAllWeeklyZones } from "@/lib/adminUtils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PatternDetection from "@/components/PatternDetection";
import GoalPrediction from "@/components/GoalPrediction";
import AIProgressInsights from "@/components/AIProgressInsights";

interface MenteeDetailViewProps {
  mentee: MenteeData;
  status: MenteeStatus;
  onBack: () => void;
}

const MenteeDetailView = ({ mentee, status, onBack }: MenteeDetailViewProps) => {
  const updates = mentee.updates || [];
  const sortedUpdates = [...updates].sort((a, b) => a.week_number - b.week_number);
  
  const currentWeight = updates.length > 0
    ? [...updates].sort((a, b) => b.week_number - a.week_number)[0].weight
    : mentee.initial_weight;

  const progressPercentage = calculateProgressPercentage(
    currentWeight,
    mentee.initial_weight,
    mentee.target_weight,
    mentee.goal_type
  );

  const zones = calculateAllWeeklyZones(updates, {
    goal_type: mentee.goal_type,
    weekly_variation_percent: mentee.goal_type === 'perda_peso' ? 1 : 0.5,
  });

  const chartData = sortedUpdates.map((update) => ({
    week: update.week_number,
    weight: update.weight,
    bodyFat: update.body_fat_percentage || 0,
  }));

  // Mock profile object for legacy components
  const profileForComponents = {
    id: mentee.id,
    full_name: mentee.full_name,
    email: mentee.email,
    sex: mentee.sex,
    age: mentee.age,
    height: mentee.height,
    initial_weight: mentee.initial_weight,
    target_weight: mentee.target_weight,
    goal_type: mentee.goal_type,
    created_at: mentee.created_at,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bebas">{mentee.full_name}</h1>
              <p className="text-sm text-muted-foreground">{mentee.email}</p>
            </div>
            <Badge className={getZoneColor(status.currentZone)}>
              {getZoneLabel(status.currentZone)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Peso Atual"
          value={`${currentWeight.toFixed(1)} kg`}
          icon={Activity}
          description={`Meta: ${mentee.target_weight} kg`}
        />
        <StatsCard
          title="Progresso"
          value={`${progressPercentage.toFixed(1)}%`}
          icon={TrendingUp}
          description={mentee.goal_type === 'perda_peso' ? 'Perda de Peso' : 'Ganho de Massa'}
        />
        <StatsCard
          title="Check-ins"
          value={updates.length}
          icon={Calendar}
          description={`Última: há ${status.lastUpdateDaysAgo} dias`}
        />
        <StatsCard
          title="Meta"
          value={`${mentee.target_weight} kg`}
          icon={Target}
          description={`De ${mentee.initial_weight} kg`}
        />
      </div>

      {/* Zone Timeline */}
      {zones.length > 0 && <ZoneTimeline zones={zones} />}

      {/* Alertas */}
      {status.needsAttention && (
        <Card className="border-danger">
          <CardHeader>
            <CardTitle className="text-danger flex items-center gap-2">
              ⚠️ Atenção Necessária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {status.attentionReasons.map((reason, i) => (
                <li key={i}>{reason}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {updates.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Peso</CardTitle>
              <CardDescription>Gráfico de evolução semanal</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    label={{ value: 'Semana', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Peso"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {updates.some(u => u.body_fat_percentage) && (
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Gordura Corporal</CardTitle>
                <CardDescription>Percentual de gordura ao longo das semanas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      label={{ value: 'Semana', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis label={{ value: 'Gordura (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="bodyFat" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth={2}
                      name="Gordura Corporal"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* AI Insights */}
      {updates.length > 0 && (
        <AIProgressInsights profile={profileForComponents} updates={updates} />
      )}

      {/* Pattern Detection */}
      {updates.length >= 3 && (
        <PatternDetection updates={updates} profile={profileForComponents} />
      )}

      {/* Goal Prediction */}
      {updates.length >= 2 && (
        <GoalPrediction profile={profileForComponents} updates={updates} />
      )}

      {/* Check-in History Table */}
      {updates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Check-ins</CardTitle>
            <CardDescription>Todas as atualizações semanais</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semana</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso (kg)</TableHead>
                  <TableHead>BF%</TableHead>
                  <TableHead>Zona</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUpdates.reverse().map((update, index) => {
                  const zone = zones.find(z => z.week === update.week_number);
                  return (
                    <TableRow key={update.id || index}>
                      <TableCell className="font-medium">{update.week_number}</TableCell>
                      <TableCell>{formatDate(update.created_at)}</TableCell>
                      <TableCell>{update.weight.toFixed(1)}</TableCell>
                      <TableCell>
                        {update.body_fat_percentage ? `${update.body_fat_percentage.toFixed(1)}%` : '-'}
                      </TableCell>
                      <TableCell>
                        {zone && (
                          <Badge className={getZoneColor(zone.zone)} variant="outline">
                            {getZoneLabel(zone.zone)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {update.notes || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {updates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              Este mentorado ainda não possui check-ins registrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MenteeDetailView;
