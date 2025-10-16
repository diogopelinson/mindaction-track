import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, cpf, phone }: AdminRequestEmail = await req.json();

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
            <p><strong>Nome:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>CPF:</strong> ${cpf}</p>
            <p><strong>Telefone:</strong> ${phone}</p>
          </div>
          <p>Para aprovar este usuário como administrador, você precisa:</p>
          <ol>
            <li>Acessar o backend do Lovable Cloud</li>
            <li>Navegar até a tabela "user_roles"</li>
            <li>Adicionar uma nova linha com:
              <ul>
                <li>user_id: (busque pelo email ${email} na tabela profiles)</li>
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
