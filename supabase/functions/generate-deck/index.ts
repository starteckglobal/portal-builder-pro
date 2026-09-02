import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-version",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const mode = body.mode === "outline" ? "outline" : "slides";
    const topic = String(body.topic || "").slice(0, 5000);
    const businessName = String(body.businessName || "").slice(0, 500);
    const tone = String(body.tone || "professional").slice(0, 100);
    const language = String(body.language || "English").slice(0, 80);
    const slideCount = Math.max(5, Math.min(20, Number(body.slideCount || 8)));
    const outline = Array.isArray(body.outline) ? body.outline.slice(0, 20) : [];
    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) return json({ error: "AI service is not configured" }, 500);

    const schema = mode === "outline"
      ? {
          type: "object",
          properties: { outline: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] } } },
          required: ["outline"],
        }
      : {
          type: "object",
          properties: {
            slides: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" }, title: { type: "string" }, subtitle: { type: "string" },
                  bullets: { type: "array", items: { type: "string" } },
                  layout: { type: "string", enum: ["title", "bullets", "two-column", "image-text", "stats", "quote", "closing"] },
                  notes: { type: "string" },
                },
                required: ["id", "title", "bullets", "layout", "notes"],
              },
            },
          },
          required: ["slides"],
        };

    const instruction = mode === "outline"
      ? `Create an outline of exactly ${slideCount} business presentation slides about "${topic}" for "${businessName}". Return concise slide titles and one-sentence descriptions. Use ${language}.`
      : `Expand this approved outline into exactly ${outline.length || slideCount} polished business slides about "${topic}" for "${businessName}". Outline: ${JSON.stringify(outline)}. Use ${language}. Tone: ${tone}. Make the first slide title and the final slide closing. Keep each slide to at most 5 concise bullets. Choose layouts from the allowed enum. Never invent unsupported metrics, quotes, or citations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are Presenton, a presentation planning and writing assistant. Respond only through the requested structured function. Tone: ${tone}.` },
          { role: "user", content: instruction },
        ],
        tools: [{ type: "function", function: { name: mode === "outline" ? "generate_outline" : "generate_slides", description: "Return structured presentation content", parameters: schema } }],
        tool_choice: { type: "function", function: { name: mode === "outline" ? "generate_outline" : "generate_slides" } },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI gateway request failed [${response.status}]: ${errorBody}`);
      if (response.status === 429) return json({ error: "Rate limit exceeded. Please try again in a moment." }, 429);
      if (response.status === 402) return json({ error: "AI credits exhausted. Please add funds in workspace usage." }, 402);
      return json({ error: "AI generation failed", details: errorBody }, response.status);
    }

    const data = await response.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) return json({ error: "No content generated" }, 500);
    return json(JSON.parse(call.function.arguments));
  } catch (e) {
    console.error("generate-deck error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
