import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Activity, Target, Ruler, Scale, TrendingUp } from "lucide-react";
import { MenteeData } from "@/lib/adminUtils";
import { formatDate } from "@/lib/adminUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SecureImage } from "@/components/SecureImage";

interface MenteeFullDataViewProps {
  mentee: MenteeData;
}

export const MenteeFullDataView = ({ mentee }: MenteeFullDataViewProps) => {
  const sortedUpdates = [...(mentee.updates || [])].sort((a, b) => b.week_number - a.week_number);
  
  return (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados Pessoais
          </CardTitle>
          <CardDescription>Informações cadastrais do mentorado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nome Completo</p>
              <p className="font-semibold">{mentee.full_name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-semibold break-all">{mentee.email}</p>
            </div>
            
            {mentee.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                <p className="font-semibold">{mentee.phone}</p>
              </div>
            )}
            
            {mentee.cpf && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">CPF</p>
                <p className="font-semibold">{mentee.cpf}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Sexo</p>
              <p className="font-semibold">{mentee.sex === 'male' ? 'Masculino' : 'Feminino'}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Idade</p>
              <p className="font-semibold">{mentee.age} anos</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Data de Cadastro</p>
              <p className="font-semibold">{formatDate(mentee.created_at)}</p>
            </div>
          </div>

          {mentee.avatar_url && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Foto de Perfil</p>
              <SecureImage
                bucket="avatars"
                path={mentee.avatar_url}
                alt="Foto de perfil"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dados Antropométricos Iniciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Medidas Iniciais
          </CardTitle>
          <CardDescription>Dados antropométricos do cadastro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Altura</p>
              <p className="font-semibold text-xl">{mentee.height} cm</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Peso Inicial</p>
              <p className="font-semibold text-xl">{mentee.initial_weight} kg</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">IMC Inicial</p>
              <p className="font-semibold text-xl">
                {(mentee.initial_weight / Math.pow(mentee.height / 100, 2)).toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos e Metas
          </CardTitle>
          <CardDescription>Metas estabelecidas pelo mentorado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tipo de Objetivo</p>
              <Badge variant="outline" className="text-base px-3 py-1">
                {mentee.goal_type === 'perda_peso' ? '📉 Perda de Peso' : '💪 Ganho de Massa'}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Peso Meta</p>
              <p className="font-semibold text-xl">{mentee.target_weight} kg</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Diferença para Meta</p>
              <p className="font-semibold text-xl">
                {Math.abs(mentee.target_weight - mentee.initial_weight).toFixed(1)} kg
              </p>
            </div>
            
            {mentee.goal_type && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Variação Semanal Esperada</p>
                <p className="font-semibold text-xl">
                  {mentee.goal_type === 'perda_peso' ? '-1%' : '+0.5%'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Histórico Completo de Check-ins */}
      {sortedUpdates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Histórico Completo de Check-ins
            </CardTitle>
            <CardDescription>Todos os dados registrados em cada semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Semana</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Peso</TableHead>
                    <TableHead>% Gordura</TableHead>
                    <TableHead>Pescoço</TableHead>
                    <TableHead>Cintura</TableHead>
                    <TableHead>Quadril</TableHead>
                    <TableHead>Fotos</TableHead>
                    <TableHead className="min-w-[200px]">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUpdates.map((update) => {
                    const photoUrls = update.photo_url 
                      ? update.photo_url.split(',').filter((url: string) => url.trim()) 
                      : [];
                    
                    return (
                      <TableRow key={update.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">Semana {update.week_number}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {formatDate(update.created_at)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {update.weight.toFixed(1)} kg
                        </TableCell>
                        <TableCell>
                          {update.body_fat_percentage 
                            ? `${update.body_fat_percentage.toFixed(1)}%` 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {update.neck_circumference 
                            ? `${update.neck_circumference} cm` 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {update.waist_circumference 
                            ? `${update.waist_circumference} cm` 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {update.hip_circumference 
                            ? `${update.hip_circumference} cm` 
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {photoUrls.length > 0 ? (
                            <div className="flex gap-1">
                              {photoUrls.map((url: string, idx: number) => (
                                <SecureImage
                                  key={idx}
                                  bucket="weekly-photos"
                                  path={url}
                                  alt={`Foto ${idx + 1}`}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm whitespace-pre-wrap">
                            {update.notes || '-'}
                          </p>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {sortedUpdates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Este mentorado ainda não possui check-ins registrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};