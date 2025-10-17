import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIPhotoComparisonProps {
  update: any;
}

const AIPhotoComparison = ({ update }: AIPhotoComparisonProps) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const photoUrls = update.photo_url 
    ? (typeof update.photo_url === 'string' 
        ? update.photo_url.split(',').filter((url: string) => url.trim()) 
        : Array.isArray(update.photo_url) 
          ? update.photo_url 
          : [])
    : [];

  if (photoUrls.length === 0) return null;

  const comparePhotos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('compare-photos', {
        body: { photoUrls, weekNumber: update.week_number }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Análise visual concluída!",
        description: "IA analisou suas fotos.",
      });
    } catch (error: any) {
      console.error('Error comparing photos:', error);
      toast({
        title: "Erro na análise",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" size="sm">
          <Sparkles className="h-4 w-4" />
          Análise com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bebas text-2xl">Análise Visual com IA - Semana {update.week_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Photos Grid */}
          <div className="grid grid-cols-3 gap-4">
            {photoUrls.map((url: string, idx: number) => (
              <img
                key={idx}
                src={url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-48 object-cover rounded-lg border border-border"
              />
            ))}
          </div>

          {/* Analysis Button */}
          {!analysis && (
            <Button 
              onClick={comparePhotos} 
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analisando suas fotos...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Analisar Progresso Visual
                </>
              )}
            </Button>
          )}

          {/* Analysis Result */}
          {analysis && (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Análise Visual da IA</h3>
                  <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {analysis}
                  </div>
                </div>
              </div>
              <Button 
                onClick={() => setAnalysis(null)} 
                variant="outline" 
                className="w-full"
              >
                Analisar Novamente
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIPhotoComparison;
