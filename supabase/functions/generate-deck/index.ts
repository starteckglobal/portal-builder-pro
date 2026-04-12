import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { topic, businessName, tone, slideCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a presentation deck generator. Create professional business presentations. The tone should be: ${tone || "professional"}.`,
          },
          {
            role: "user",
            content: `Create a ${slideCount || 8} slide presentation about: "${topic}" for the business "${businessName}". Return the slides using the generate_slides function.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_slides",
              description: "Generate an array of presentation slides",
              parameters: {
                type: "object",
                properties: {
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "Unique slide id like slide-1, slide-2" },
                        title: { type: "string" },
                        subtitle: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        layout: { type: "string", enum: ["title", "bullets", "two-column", "image-text", "closing"] },
                        notes: { type: "string", description: "Speaker notes for this slide" },
                      },
                      required: ["id", "title", "bullets", "layout", "notes"],
                    },
                  },
                },
                required: ["slides"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_slides" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No slides generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ slides: parsed.slides }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-deck error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
