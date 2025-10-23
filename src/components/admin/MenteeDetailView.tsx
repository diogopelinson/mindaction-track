import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Target, TrendingUp, Calendar, Activity, Eye, Image as ImageIcon } from "lucide-react";
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

import { PhotoComparisonModal } from "./PhotoComparisonModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SecureImage } from "@/components/SecureImage";
import { MenteeFullDataView } from "./MenteeFullDataView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesPanel } from "./NotesPanel";
import { TagsManager } from "./TagsManager";

interface MenteeDetailViewProps {
  mentee: MenteeData;
  status: MenteeStatus;
  onBack: () => void;
}

const MenteeDetailView = ({ mentee, status, onBack }: MenteeDetailViewProps) => {
  const [showPhotoComparison, setShowPhotoComparison] = useState(false);
  const [selectedUpdates, setSelectedUpdates] = useState<any[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  
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

  const openPhotoComparison = (update: any) => {
    // Encontrar uma atualização anterior para comparar
    const currentIndex = sortedUpdates.findIndex(u => u.week_number === update.week_number);
    if (currentIndex > 0) {
      setSelectedUpdates([sortedUpdates[currentIndex - 1], update]);
      setShowPhotoComparison(true);
    }
  };

  const openLightbox = (photoUrl: string) => {
    setLightboxPhoto(photoUrl);
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

      {/* Tags Manager */}
      <Card>
        <CardHeader>
          <CardTitle>Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagsManager menteeId={mentee.id} />
        </CardContent>
      </Card>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
          <TabsTrigger value="full-data">Dados Completos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">

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

      {/* Galeria de Fotos */}
      {updates.length > 0 && updates.some(u => u.photo_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Galeria de Fotos de Progresso
            </CardTitle>
            <CardDescription>Fotos de todos os check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[...sortedUpdates].reverse().map((update) => {
                const photoUrls = update.photo_url 
                  ? update.photo_url.split(',').filter((url: string) => url.trim()) 
                  : [];
                
                if (photoUrls.length === 0) return null;
                
                return (
                  <div key={update.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">Semana {update.week_number}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(update.created_at)} • {update.weight.toFixed(1)} kg
                          {update.body_fat_percentage && ` • ${update.body_fat_percentage.toFixed(1)}% BF`}
                        </p>
                      </div>
                      {sortedUpdates.findIndex(u => u.week_number === update.week_number) > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openPhotoComparison(update)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Comparar
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {photoUrls.map((url: string, idx: number) => (
                        <div 
                          key={idx}
                          className="relative group cursor-pointer overflow-hidden rounded-lg"
                          onClick={() => openLightbox(url)}
                        >
                          <SecureImage
                            bucket="weekly-photos"
                            path={url}
                            alt={`Semana ${update.week_number} - ${['Frente', 'Lateral', 'Costas'][idx]}`}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <Badge variant="secondary" className="w-full justify-center">
                              {['Frente', 'Lateral', 'Costas'][idx]}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <NotesPanel menteeId={mentee.id} />
        </TabsContent>

        <TabsContent value="full-data" className="mt-6">
          <MenteeFullDataView mentee={mentee} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showPhotoComparison && selectedUpdates.length === 2 && (
        <PhotoComparisonModal
          open={showPhotoComparison}
          onClose={() => setShowPhotoComparison(false)}
          update1={selectedUpdates[0]}
          update2={selectedUpdates[1]}
        />
      )}

      {/* Lightbox */}
      <Dialog open={!!lightboxPhoto} onOpenChange={() => setLightboxPhoto(null)}>
        <DialogContent className="max-w-4xl" aria-describedby="lightbox-description">
          <p id="lightbox-description" className="sr-only">Visualização ampliada da foto de progresso</p>
          {lightboxPhoto && (
            <SecureImage 
              bucket="weekly-photos"
              path={lightboxPhoto} 
              alt="Foto ampliada" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenteeDetailView;
