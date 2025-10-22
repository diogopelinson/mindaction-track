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
    const { messages, profile } = await req.json();

    // Input validation
    if (!Array.isArray(messages)) {
      console.error('Messages must be an array');
      return new Response(
        JSON.stringify({ error: 'Messages must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (messages.length === 0 || messages.length > 50) {
      console.error('Invalid message count:', messages.length);
      return new Response(
        JSON.stringify({ error: 'Must provide 1-50 messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate message structure
    for (const msg of messages) {
      if (!msg.role || !msg.content || typeof msg.content !== 'string') {
        console.error('Invalid message format:', msg);
        return new Response(
          JSON.stringify({ error: 'Invalid message format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (msg.content.length > 5000) {
        console.error('Message too long:', msg.content.length);
        return new Response(
          JSON.stringify({ error: 'Message content too long (max 5000 characters)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!profile || typeof profile !== 'object') {
      console.error('Invalid profile data');
      return new Response(
        JSON.stringify({ error: 'Invalid profile data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `Você é um coach fitness experiente e motivador chamado "Coach IA MindFitness". 

PERFIL DO CLIENTE:
- Nome: ${profile?.full_name || 'Usuário'}
- Objetivo: ${profile?.goal_type === 'perda_peso' ? 'Perda de peso' : 'Ganho de massa muscular'}
- Peso inicial: ${profile?.initial_weight} kg
- Meta: ${profile?.target_weight} kg
- Idade: ${profile?.age} anos
- Sexo: ${profile?.sex === 'male' ? 'Masculino' : 'Feminino'}

SUAS RESPONSABILIDADES:
- Responder dúvidas sobre treino, nutrição, medições e check-ins
- Explicar o método Navy de cálculo de gordura corporal
- Motivar e orientar sobre o progresso
- Dar dicas práticas e personalizadas
- Esclarecer sobre as zonas (verde, amarela, vermelha)

REGRAS:
- Respostas em português brasileiro
- Seja direto, prático e motivador
- Máximo 150 palavras por resposta
- Não dê diagnósticos médicos
- Encoraje a consultar profissionais quando necessário
- Use linguagem amigável e acessível`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fitness-chat:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
