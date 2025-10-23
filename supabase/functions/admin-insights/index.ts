import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // LOG IMEDIATO para debug
  console.log('🔵 admin-insights function called', {
    method: req.method,
    timestamp: new Date().toISOString(),
    hasAuth: !!req.headers.get('authorization')
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and check admin role
    const authHeader = req.headers.get('authorization');
    console.log('🔐 Checking authorization...', { hasAuthHeader: !!authHeader });
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Auth check result:', { 
      hasUser: !!user, 
      userId: user?.id,
      hasError: !!authError,
      errorMessage: authError?.message 
    });
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    console.log('👑 Checking admin role for user:', user.id);
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    console.log('👑 Role check result:', { 
      hasRole: !!roleData, 
      role: roleData?.role,
      hasError: !!roleError,
      errorMessage: roleError?.message 
    });

    if (roleError || !roleData) {
      console.error('❌ Authorization failed: User is not admin');
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Admin access required',
        details: roleError?.message || 'User does not have admin role'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📦 Parsing request body...');
    const body = await req.json();
    const { mentee, status, updates } = body;

    // Input validation with detailed logging
    console.log('✅ Validating input data:', { 
      hasMentee: !!mentee, 
      hasStatus: !!status, 
      updatesIsArray: Array.isArray(updates),
      updatesCount: Array.isArray(updates) ? updates.length : 0,
      menteeId: mentee?.id,
      menteeName: mentee?.full_name
    });

    if (!mentee || !mentee.id || !mentee.full_name) {
      console.error('❌ Invalid mentee data:', mentee);
      return new Response(JSON.stringify({ 
        error: 'Invalid mentee data',
        details: 'Mentee must have id and full_name' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!status || typeof status.needsAttention === 'undefined') {
      console.error('❌ Invalid status data:', status);
      return new Response(JSON.stringify({ 
        error: 'Invalid status data',
        details: 'Status must include needsAttention field' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(updates)) {
      console.error('❌ Invalid updates data:', updates);
      return new Response(JSON.stringify({ 
        error: 'Invalid updates data',
        details: 'Updates must be an array' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (updates.length > 100) {
      console.error('❌ Too many updates:', updates.length);
      return new Response(JSON.stringify({ 
        error: 'Too many updates provided',
        details: `Received ${updates.length} updates, maximum is 100` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('🔑 Checking LOVABLE_API_KEY...');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      console.error('❌ LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        details: 'LOVABLE_API_KEY is not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Preparar dados para análise do admin com fallbacks seguros
    const sortedUpdates = [...updates].sort((a, b) => a.week_number - b.week_number);
    const currentWeight = sortedUpdates[sortedUpdates.length - 1]?.weight || mentee.initial_weight;
    const weightChange = currentWeight - mentee.initial_weight;
    const targetDiff = mentee.target_weight - mentee.initial_weight;
    const progressPercent = targetDiff !== 0 
      ? ((weightChange / targetDiff) * 100).toFixed(1)
      : '0.0';
    
    const recentZones = sortedUpdates.slice(-4).map((u: any) => u.zone || 'verde').join(' → ');
    const lastCheckInDays = status.lastUpdateDaysAgo || 0;
    const attentionReasons = (status.attentionReasons || []).join('; ');
    
    console.log('Admin insights request:', {
      menteeName: mentee.full_name,
      updatesCount: updates.length,
      currentWeight,
      progressPercent,
      needsAttention: status.needsAttention
    });
    
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

    console.log('🤖 Calling Lovable AI API...');
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

    console.log('📡 AI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API error:', response.status, errorText);
      return new Response(JSON.stringify({ 
        error: `AI API error: ${response.status}`,
        details: errorText 
      }), {
        status: response.status === 429 ? 429 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;
    console.log('✅ Insights generated successfully');

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ FATAL ERROR in admin-insights:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});