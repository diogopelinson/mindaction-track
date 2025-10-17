import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Loader2, TrendingUp, Target, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIProgressInsightsProps {
  profile: any;
  updates: any[];
}

const AIProgressInsights = ({ profile, updates }: AIProgressInsightsProps) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-progress', {
        body: { profile, updates }
      });

      if (error) throw error;

      setInsights(data.insights);
      toast({
        title: "Análise concluída!",
        description: "Insights gerados com sucesso.",
      });
    } catch (error: any) {
      console.error('Error generating insights:', error);
      toast({
        title: "Erro ao gerar insights",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="font-bebas text-2xl">Análise Inteligente</CardTitle>
              <CardDescription>Insights personalizados com IA</CardDescription>
            </div>
          </div>
          <Button 
            onClick={generateInsights} 
            disabled={isLoading || updates.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Gerar Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {insights && (
        <CardContent>
          <div className="space-y-4 bg-card p-6 rounded-lg border border-border">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Sua Análise Personalizada</h4>
                <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {insights}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t border-border text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Gerado por IA baseado nos seus últimos {updates.length} check-ins</span>
            </div>
          </div>
        </CardContent>
      )}
      {updates.length === 0 && (
        <CardContent>
          <p className="text-center text-muted-foreground">
            Faça pelo menos um check-in para gerar insights personalizados.
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export default AIProgressInsights;
