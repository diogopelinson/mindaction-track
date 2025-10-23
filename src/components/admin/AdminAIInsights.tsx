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
    setInsights(''); // Limpar insights anteriores
    
    try {
      // Verificar autenticação primeiro
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      console.log('✅ Session valid, calling admin-insights with:', {
        menteeId: mentee.id,
        menteeName: mentee.full_name,
        updatesCount: updates.length,
        statusNeedsAttention: status.needsAttention,
        userId: session.user.id
      });

      const { data, error } = await supabase.functions.invoke('admin-insights', {
        body: { 
          mentee: {
            id: mentee.id,
            full_name: mentee.full_name,
            goal_type: mentee.goal_type,
            initial_weight: mentee.initial_weight,
            target_weight: mentee.target_weight
          }, 
          status: {
            needsAttention: status.needsAttention,
            attentionReasons: status.attentionReasons || [],
            lastUpdateDaysAgo: status.lastUpdateDaysAgo || 0
          }, 
          updates 
        }
      });

      console.log('📡 admin-insights response:', { 
        hasData: !!data, 
        hasError: !!error,
        errorDetails: error 
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        
        // Tratamento específico por tipo de erro
        if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
          throw new Error('Não autorizado. Verifique se você está logado como administrador.');
        }
        
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          throw new Error('Acesso negado. Você precisa ser um administrador para acessar esta funcionalidade.');
        }
        
        if (error.message?.includes('429')) {
          throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
        }

        throw new Error(error.message || 'Erro ao chamar a função');
      }

      if (!data || !data.insights) {
        console.error('❌ No insights in response:', data);
        throw new Error('Nenhum insight foi retornado pela IA');
      }

      console.log('✅ Insights generated successfully');
      setInsights(data.insights);
      
      toast({
        title: "Insights gerados com sucesso",
        description: "A análise da IA está pronta.",
      });
      
    } catch (error) {
      console.error('❌ Error generating admin insights:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        variant: "destructive",
        title: "Erro ao gerar insights",
        description: errorMessage,
      });
      
      setInsights(`Erro: ${errorMessage}`);
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
          <div className="space-y-3">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-sm leading-relaxed">
                {insights}
              </div>
            </div>
            <button
              onClick={generateInsights}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Gerar nova análise
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Não foi possível gerar insights no momento.
            </p>
            <button
              onClick={generateInsights}
              className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Tentar novamente
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminAIInsights;