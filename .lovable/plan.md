

# Connect All Portal Modules to AI Generation

## Summary
Replace all 8 fake `setTimeout` template generators with real AI-powered generation via Lovable Cloud edge functions. Each module currently returns hardcoded text after a 1.5s delay.

## Modules to Connect

| Module | Tab ID | Current Behavior | AI Capability |
|--------|--------|-----------------|---------------|
| Press Release Writer | `pressrelease` | Template string | Full press release from client + brief |
| Pitch Email Composer | `pitchemail` | Template email | Personalized pitch email using journalist context |
| Creative AI Studio | `imagegen` | 2 hardcoded concepts | Campaign concepts with palettes, taglines, copy |
| Clipper + Sentiment | `clipper` | Static "positive 85" | Real sentiment analysis with PR impact assessment |
| Meeting Parser | `meeting` | 2 hardcoded actions | Extract all action items with assignees/deadlines |
| Competitor Intel | `competitor` | 1 hardcoded opportunity | Multiple PR opportunities from competitor analysis |
| Boilerplate Manager | `boilerplate` | Generic one-liner | Full company boilerplate paragraph |
| Report Builder | `reports` | Template summary | Comprehensive monthly PR report |

## Implementation

### Step 1: Create a single multi-purpose edge function
**File:** `supabase/functions/ai-generate/index.ts`

One edge function that accepts a `type` parameter and routes to the appropriate prompt. This avoids creating 8 separate functions. Types: `press-release`, `pitch-email`, `creative-concepts`, `sentiment`, `meeting-actions`, `competitor-intel`, `boilerplate`, `report`.

Each type will have a tailored system prompt and use tool calling (structured output) to return well-typed JSON. Uses `LOVABLE_API_KEY` + Lovable AI Gateway with `google/gemini-3-flash-preview`.

### Step 2: Update ABMPortal.tsx
Replace every `setTimeout(() => { ... }, 1500)` block with a call to `supabase.functions.invoke('ai-generate', { body: { type, ...params } })`. Parse the response and set state. Add error handling with toast notifications for 429/402 errors.

### Step 3: Deploy and test

## Technical Details

- **Model:** `google/gemini-3-flash-preview` (fast, cost-effective)
- **Structured output:** Tool calling for each type ensures valid JSON responses
- **Error handling:** 429 rate limit and 402 credit errors surfaced as toasts
- **No new dependencies** — uses existing `supabase` client
- **No new tables** — all generation is stateless (results displayed inline)

## Files Changed
| File | Action |
|------|--------|
| `supabase/functions/ai-generate/index.ts` | Create — multi-purpose AI generation edge function |
| `src/components/ABMPortal.tsx` | Edit — replace 8 setTimeout blocks with real AI calls |

