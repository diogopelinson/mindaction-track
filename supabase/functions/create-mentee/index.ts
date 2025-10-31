import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar que o usuário está autenticado
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    // Cliente com anon key para validar permissões
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verificar se é admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      throw new Error('User is not an admin');
    }

    console.log('Admin validated:', user.email);

    // Obter dados do body
    const body = await req.json();
    const {
      email,
      password,
      full_name,
      cpf,
      phone,
      sex,
      age,
      height,
      initial_weight,
      target_weight,
      goal_type,
      goal_subtype,
    } = body;

    console.log('Creating mentee:', email);

    // Cliente com service_role para criar usuário
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Criar usuário
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        cpf,
        phone,
        sex,
        age,
        height,
        initial_weight,
        target_weight,
        goal_type,
        goal_subtype,
      },
    });

    if (createError) {
      console.error('Error creating user:', createError);
      throw createError;
    }

    console.log('User created successfully:', newUser.user.id);

    // Atualizar goal_subtype no perfil (trigger já criou o perfil)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ goal_subtype })
      .eq('id', newUser.user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
    }

    console.log('Mentee creation completed successfully');

    return new Response(
      JSON.stringify({ success: true, user: newUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in create-mentee function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
