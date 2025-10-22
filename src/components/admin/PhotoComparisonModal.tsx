import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PhotoComparisonModalProps {
  open: boolean;
  onClose: () => void;
  update1: {
    week_number: number;
    weight: number;
    body_fat_percentage: number | null;
    photo_url: string;
    created_at: string;
  };
  update2: {
    week_number: number;
    weight: number;
    body_fat_percentage: number | null;
    photo_url: string;
    created_at: string;
  };
}

export const PhotoComparisonModal = ({ open, onClose, update1, update2 }: PhotoComparisonModalProps) => {
  const photos1 = update1.photo_url ? update1.photo_url.split(',').filter(url => url.trim()) : [];
  const photos2 = update2.photo_url ? update2.photo_url.split(',').filter(url => url.trim()) : [];
  
  const weightDiff = update2.weight - update1.weight;
  const bfDiff = (update2.body_fat_percentage || 0) - (update1.body_fat_percentage || 0);

  const photoLabels = ['Frente', 'Lateral', 'Costas'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Comparação: Semana {update1.week_number} vs Semana {update2.week_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Stats Comparison */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">Diferença de Peso</p>
                <p className={`text-2xl font-bold text-center ${weightDiff < 0 ? 'text-success' : 'text-danger'}`}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">Diferença de BF%</p>
                <p className={`text-2xl font-bold text-center ${bfDiff < 0 ? 'text-success' : bfDiff > 0 ? 'text-danger' : 'text-muted-foreground'}`}>
                  {bfDiff > 0 ? '+' : ''}{bfDiff.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground text-center">Período</p>
                <p className="text-2xl font-bold text-center">
                  {update2.week_number - update1.week_number} semanas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Photo Comparisons */}
          <div className="space-y-6">
            {photoLabels.map((label, idx) => {
              const photo1 = photos1[idx];
              const photo2 = photos2[idx];
              
              if (!photo1 && !photo2) return null;
              
              return (
                <div key={label} className="space-y-2">
                  <h3 className="font-semibold text-lg">{label}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Week 1 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Semana {update1.week_number}</Badge>
                        <span className="text-sm text-muted-foreground">{update1.weight.toFixed(1)} kg</span>
                      </div>
                      {photo1 ? (
                        <img
                          src={photo1}
                          alt={`Semana ${update1.week_number} - ${label}`}
                          className="w-full h-80 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-full h-80 flex items-center justify-center bg-muted rounded-lg border">
                          <p className="text-muted-foreground">Sem foto</p>
                        </div>
                      )}
                    </div>

                    {/* Week 2 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Semana {update2.week_number}</Badge>
                        <span className="text-sm text-muted-foreground">{update2.weight.toFixed(1)} kg</span>
                      </div>
                      {photo2 ? (
                        <img
                          src={photo2}
                          alt={`Semana ${update2.week_number} - ${label}`}
                          className="w-full h-80 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-full h-80 flex items-center justify-center bg-muted rounded-lg border">
                          <p className="text-muted-foreground">Sem foto</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};