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
    const { profile, updates } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare data summary
    const currentWeight = updates[updates.length - 1]?.weight || profile.initial_weight;
    const weightChange = currentWeight - profile.initial_weight;
    const checkInCount = updates.length;
    
    const recentTrend = updates.slice(-3).map((u: any) => u.weight);
    
    const prompt = `Você é um coach fitness especializado. Analise o progresso deste cliente e forneça insights personalizados.

PERFIL:
- Objetivo: ${profile.goal_type === 'perda_peso' ? 'Perda de peso' : 'Ganho de massa'}
- Peso inicial: ${profile.initial_weight} kg
- Peso atual: ${currentWeight} kg
- Meta: ${profile.target_weight} kg
- Check-ins realizados: ${checkInCount}
- Mudança total: ${weightChange.toFixed(1)} kg

ÚLTIMAS 3 PESAGENS: ${recentTrend.join(' kg → ')} kg

Forneça uma análise em português brasileiro com:
1. Avaliação do progresso atual (2-3 frases)
2. Tendência identificada (melhorando/estável/necessita atenção)
3. Uma sugestão prática e específica
4. Motivação personalizada

Seja direto, específico e motivador. Máximo 200 palavras.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um coach fitness experiente e motivador.' },
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
    console.error('Error in analyze-progress:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
