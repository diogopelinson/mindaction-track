import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MenteeData, MenteeStatus } from "@/lib/adminUtils";

interface AdminAIInsightsProps {
  mentee: MenteeData;
  status: MenteeStatus;
  updates: any[];
}

const AdminAIInsights = ({ mentee, status, updates }: AdminAIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateInsights();
  }, [mentee.id]);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-insights', {
        body: { mentee, status, updates }
      });

      if (error) throw error;

      setInsights(data.insights);
    } catch (error) {
      console.error('Error generating admin insights:', error);
      toast({
        variant: "destructive",
        title: "Erro ao gerar insights",
        description: "Não foi possível gerar os insights do administrador.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityBadge = () => {
    if (insights.includes('ALTA') || insights.includes('URGENTE')) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Alta Prioridade</Badge>;
    }
    if (insights.includes('MÉDIA')) {
      return <Badge variant="default" className="gap-1"><Clock className="h-3 w-3" />Média Prioridade</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><TrendingUp className="h-3 w-3" />Baixa Prioridade</Badge>;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Análise IA para Admin</CardTitle>
          </div>
          {!isLoading && insights && getPriorityBadge()}
        </div>
        <CardDescription>
          Insights acionáveis gerados por IA para tomada de decisão
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <p className="text-sm">Gerando análise estratégica...</p>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-sm leading-relaxed">
              {insights}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível gerar insights no momento.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAIInsights;