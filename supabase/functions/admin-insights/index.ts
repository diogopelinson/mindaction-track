import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mentee, status, updates } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Preparar dados para análise do admin
    const currentWeight = updates[updates.length - 1]?.weight || mentee.initial_weight;
    const weightChange = currentWeight - mentee.initial_weight;
    const progressPercent = ((weightChange / (mentee.target_weight - mentee.initial_weight)) * 100).toFixed(1);
    
    const recentZones = updates.slice(-4).map((u: any) => u.zone || 'verde').join(' → ');
    const lastCheckInDays = status.lastUpdateDaysAgo;
    const attentionReasons = status.attentionReasons.join('; ');
    
    const prompt = `Você é um assistente de mentoria fitness para ADMINISTRADORES. Analise este mentorado e forneça insights ACIONÁVEIS para o admin tomar decisões.

DADOS DO MENTORADO:
- Nome: ${mentee.full_name}
- Objetivo: ${mentee.goal_type === 'perda_peso' ? 'Perda de peso' : 'Ganho de massa'}
- Peso inicial: ${mentee.initial_weight} kg → Atual: ${currentWeight} kg → Meta: ${mentee.target_weight} kg
- Progresso: ${progressPercent}%
- Última atualização: há ${lastCheckInDays} dias
- Total de check-ins: ${updates.length}
${status.needsAttention ? `- ⚠️ ATENÇÃO NECESSÁRIA: ${attentionReasons}` : ''}

FORNEÇA UMA ANÁLISE EM PORTUGUÊS BRASILEIRO COM:

1. **Status Geral** (1-2 frases): Resumo executivo do mentorado

2. **Nível de Prioridade**: 
   - URGENTE: Mais de 14 dias sem atualizar OU 3+ semanas em zona vermelha
   - ALTA: 7-14 dias sem atualizar OU 2+ semanas zona vermelha
   - MÉDIA: Estagnação ou zona amarela consistente
   - BAIXA: Tudo ok ou novo mentorado

3. **Ações Recomendadas** (2-3 itens CONCRETOS e ESPECÍFICOS):
   - O que o admin deve fazer AGORA
   - Quando fazer contato (urgente hoje, essa semana, próximo check-in)
   - Tipo de abordagem (motivacional, técnica, replanejamento de meta)

4. **Pontos de Atenção** (se houver): 
   - Alertas específicos (estagnação, zona vermelha, ausência prolongada)
   - Tendências preocupantes

5. **Pontos Positivos** (se houver): 
   - O que está funcionando bem
   - Progressos a serem reconhecidos

Seja DIRETO, ESPECÍFICO e focado em AÇÃO para o admin. Use linguagem profissional mas clara. Máximo 250 palavras.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um assistente estratégico para administradores de programas fitness. Foque em insights acionáveis e priorização clara.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in admin-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});