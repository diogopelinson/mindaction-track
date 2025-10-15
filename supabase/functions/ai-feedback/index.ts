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
    const { weeklyData, goalType, userName } = await req.json();

    // Generate personalized feedback based on zone
    let feedback = {
      message: "",
      motivation: "",
      suggestion: "",
      weeksToGoal: null as number | null,
    };

    const latestZone = weeklyData[weeklyData.length - 1]?.zone;
    const averageWeeklyChange = weeklyData.reduce((sum: number, week: any, index: number) => {
      if (index === 0) return 0;
      return sum + Math.abs(week.weight - weeklyData[index - 1].weight);
    }, 0) / (weeklyData.length - 1);

    const currentWeight = weeklyData[weeklyData.length - 1]?.weight;
    const targetWeight = weeklyData[0]?.targetWeight;
    const remaining = Math.abs(targetWeight - currentWeight);

    if (averageWeeklyChange > 0) {
      feedback.weeksToGoal = Math.ceil(remaining / averageWeeklyChange);
    }

    switch (latestZone) {
      case 'green':
        feedback.message = `Parabéns, ${userName}! Você está na zona verde! 🎯`;
        feedback.motivation = "Continue nesse ritmo perfeito. Seu progresso está excelente!";
        feedback.suggestion = "Mantenha a consistência no treino e alimentação.";
        break;
      
      case 'yellow':
        feedback.message = `Atenção, ${userName}. Você está na zona amarela. ⚠️`;
        feedback.motivation = "Seu progresso está um pouco abaixo do ideal, mas ainda está no caminho certo.";
        feedback.suggestion = "Revise sua alimentação e intensidade dos treinos para otimizar resultados.";
        break;
      
      case 'red':
        feedback.message = `${userName}, precisamos ajustar seu plano! 🔴`;
        feedback.motivation = "Seu progresso está fora do esperado. Vamos fazer mudanças estratégicas.";
        feedback.suggestion = "É hora de conversar com seu mentor para revisar protocolo e estratégias.";
        break;
      
      default:
        feedback.message = `Olá, ${userName}! Vamos começar sua jornada! 💪`;
        feedback.motivation = "Estamos prontos para acompanhar sua evolução semana a semana.";
        feedback.suggestion = "Faça seu primeiro check-in na próxima segunda-feira!";
    }

    // Add prediction message if we have enough data
    if (feedback.weeksToGoal && feedback.weeksToGoal < 100) {
      feedback.message += ` Com base no seu ritmo atual, você deve atingir sua meta em aproximadamente ${feedback.weeksToGoal} semanas.`;
    }

    return new Response(
      JSON.stringify(feedback),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error generating feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
