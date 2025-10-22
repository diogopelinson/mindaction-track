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
    const { photoUrls, weekNumber } = await req.json();

    // Input validation
    if (!Array.isArray(photoUrls)) {
      console.error('photoUrls must be an array');
      return new Response(
        JSON.stringify({ error: 'photoUrls must be an array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (photoUrls.length === 0 || photoUrls.length > 3) {
      console.error('Invalid number of photos:', photoUrls.length);
      return new Response(
        JSON.stringify({ error: 'Must provide 1-3 photo URLs' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URLs
    for (const url of photoUrls) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        console.error('Invalid photo URL:', url);
        return new Response(
          JSON.stringify({ error: 'Invalid photo URL format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (typeof weekNumber !== 'number' || weekNumber < 1) {
      console.error('Invalid week number:', weekNumber);
      return new Response(
        JSON.stringify({ error: 'Invalid week number' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build content array with images
    const content = [
      {
        type: "text",
        text: `Você é um especialista em análise de composição corporal. Analise estas ${photoUrls.length} fotos de progresso da semana ${weekNumber} de um cliente.

Forneça uma análise visual detalhada em português brasileiro incluindo:
1. Mudanças visíveis na composição corporal (postura, definição muscular, etc.)
2. Áreas de progresso notável
3. Sugestões para melhorar as fotos futuras
4. Comentário motivacional

Seja específico, profissional e motivador. Máximo 250 palavras.`
      }
    ];

    // Add up to 3 images
    for (let i = 0; i < Math.min(photoUrls.length, 3); i++) {
      content.push({
        type: "image_url",
        image_url: { url: photoUrls[i] }
      } as any);
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em fitness e análise de composição corporal.' 
          },
          { role: 'user', content }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in compare-photos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
