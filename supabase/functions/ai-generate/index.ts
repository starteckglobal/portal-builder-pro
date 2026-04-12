import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPTS: Record<string, { system: string; userTemplate: (p: any) => string; tool: any }> = {
  "press-release": {
    system: "You are a senior PR writer. Write polished, publication-ready press releases in AP style. Include dateline, quotes, boilerplate.",
    userTemplate: (p) => `Write a press release for "${p.client}" about: ${p.brief}`,
    tool: {
      name: "write_press_release",
      description: "Return a formatted press release",
      parameters: {
        type: "object",
        properties: {
          headline: { type: "string" },
          subheadline: { type: "string" },
          body: { type: "string", description: "Full press release body with dateline, paragraphs, quotes, and boilerplate" },
        },
        required: ["headline", "body"],
      },
    },
  },
  "pitch-email": {
    system: "You are a media relations expert. Write compelling, personalized pitch emails that get opened. Keep them concise (under 200 words), with a strong subject line and clear ask.",
    userTemplate: (p) => `Write a pitch email to journalist "${p.journalist}" at "${p.outlet}" (covers ${p.beat}, relationship: ${p.relationship}). Story angle: ${p.angle}`,
    tool: {
      name: "write_pitch_email",
      description: "Return a pitch email",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string", description: "Full email body" },
        },
        required: ["subject", "body"],
      },
    },
  },
  "creative-concepts": {
    system: "You are a creative director for PR campaigns. Generate bold, differentiated campaign concepts with visual direction.",
    userTemplate: (p) => `Generate 3 creative campaign concepts for: ${p.prompt}`,
    tool: {
      name: "generate_concepts",
      description: "Return creative campaign concepts",
      parameters: {
        type: "object",
        properties: {
          concepts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                mood: { type: "string" },
                tagline: { type: "string" },
                copy: { type: "string", description: "Sample ad/social copy" },
                palette: { type: "array", items: { type: "string" }, description: "4 hex colors" },
              },
              required: ["title", "description", "mood", "tagline", "palette"],
            },
          },
        },
        required: ["concepts"],
      },
    },
  },
  "sentiment": {
    system: "You are a media analyst specializing in PR sentiment analysis. Analyze text for sentiment, estimate reach and media value, and assess PR impact.",
    userTemplate: (p) => `Analyze this article/headline for sentiment and PR impact:\n\n${p.text}`,
    tool: {
      name: "analyze_sentiment",
      description: "Return sentiment analysis",
      parameters: {
        type: "object",
        properties: {
          sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
          score: { type: "number", description: "0-100 sentiment score" },
          reach_estimate: { type: "string", description: "Estimated audience reach like 250K" },
          pr_impact: { type: "string", description: "2-3 sentence PR impact assessment" },
          key_phrases: { type: "array", items: { type: "string" }, description: "Notable phrases from the text" },
        },
        required: ["sentiment", "score", "reach_estimate", "pr_impact"],
      },
    },
  },
  "meeting-actions": {
    system: "You are a project manager. Extract every actionable task from meeting notes with assignees, deadlines, and priority levels.",
    userTemplate: (p) => `Extract action items from these meeting notes:\n\n${p.notes}`,
    tool: {
      name: "extract_actions",
      description: "Return extracted action items",
      parameters: {
        type: "object",
        properties: {
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task: { type: "string" },
                assignee: { type: "string" },
                deadline: { type: "string" },
                priority: { type: "string", enum: ["high", "medium", "low"] },
              },
              required: ["task", "assignee", "deadline", "priority"],
            },
          },
        },
        required: ["actions"],
      },
    },
  },
  "competitor-intel": {
    system: "You are a competitive intelligence analyst for PR agencies. Identify PR opportunities based on competitor activity.",
    userTemplate: (p) => `Analyze this competitor activity and find PR opportunities:\n\n${p.query}`,
    tool: {
      name: "find_opportunities",
      description: "Return PR opportunities",
      parameters: {
        type: "object",
        properties: {
          opportunities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                opportunity: { type: "string" },
                outlet: { type: "string", description: "Suggested media outlet" },
                angle: { type: "string" },
                urgency: { type: "string", enum: ["high", "medium", "low"] },
                rationale: { type: "string" },
              },
              required: ["opportunity", "outlet", "angle", "urgency"],
            },
          },
        },
        required: ["opportunities"],
      },
    },
  },
  "boilerplate": {
    system: "You are a corporate communications writer. Write professional company boilerplate paragraphs suitable for press releases.",
    userTemplate: (p) => `Write a company boilerplate paragraph for "${p.client}". Make it sound professional, mention New Orleans if relevant, and keep it to 3-4 sentences.`,
    tool: {
      name: "write_boilerplate",
      description: "Return a company boilerplate",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The boilerplate paragraph" },
        },
        required: ["text"],
      },
    },
  },
  "report": {
    system: "You are a PR reporting specialist. Write comprehensive monthly PR reports with executive summaries, metrics analysis, and recommendations.",
    userTemplate: (p) => `Write a monthly PR report for client "${p.client}" with ${p.placements} placements and ${p.reach} total reach this month. Coverage titles: ${p.titles}`,
    tool: {
      name: "write_report",
      description: "Return a PR report",
      parameters: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          highlights: { type: "array", items: { type: "string" } },
          metrics_analysis: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } },
          full_report: { type: "string", description: "Complete formatted report text" },
        },
        required: ["executive_summary", "full_report"],
      },
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { type, ...params } = body;

    const config = PROMPTS[type];
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          { role: "system", content: config.system },
          { role: "user", content: config.userTemplate(params) },
        ],
        tools: [{
          type: "function",
          function: config.tool,
        }],
        tool_choice: { type: "function", function: { name: config.tool.name } },
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
      return new Response(JSON.stringify({ error: "No output generated" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
