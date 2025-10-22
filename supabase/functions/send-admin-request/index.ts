import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminRequestEmail {
  email: string;
  fullName: string;
  cpf: string;
  phone: string;
}

// HTML escape function to prevent XSS
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { email, fullName, cpf, phone }: AdminRequestEmail = await req.json();

    // Validate that the user is requesting access for their own email
    if (email !== user.email) {
      throw new Error('You can only request admin access for your own email');
    }

    // Input validation
    if (!email || !fullName || !cpf || !phone) {
      throw new Error('Missing required fields');
    }

    if (fullName.length > 200 || email.length > 200 || cpf.length > 20 || phone.length > 20) {
      throw new Error('Input exceeds maximum length');
    }

    console.log("Sending admin request email for:", email);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Mapa MindFitness <onboarding@resend.dev>",
        to: ["diogopelinsonduartemoraes@gmail.com"],
        subject: "Nova Solicitação de Acesso Admin - Mapa MindFitness",
        html: `
          <h1>Nova Solicitação de Acesso Admin</h1>
          <p>Um novo usuário solicitou acesso como administrador no Mapa MindFitness:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>CPF:</strong> ${escapeHtml(cpf)}</p>
            <p><strong>Telefone:</strong> ${escapeHtml(phone)}</p>
          </div>
          <p>Para aprovar este usuário como administrador, você precisa:</p>
          <ol>
            <li>Acessar o backend do Lovable Cloud</li>
            <li>Navegar até a tabela "user_roles"</li>
            <li>Adicionar uma nova linha com:
              <ul>
                <li>user_id: (busque pelo email ${escapeHtml(email)} na tabela profiles)</li>
                <li>role: admin</li>
              </ul>
            </li>
          </ol>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Este é um email automático do sistema Mapa MindFitness.
          </p>
        `,
      }),
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending admin request email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
