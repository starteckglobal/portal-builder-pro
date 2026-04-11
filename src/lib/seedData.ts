import { supabase } from "@/integrations/supabase/client";

const SEED_LEADS = [
  { name: "Crescent City Brewing", contact: "Marcus Williams", status: "hot", value: "$18K/mo", notes: "Product launch Q3.", score: 95 },
  { name: "Gulf South Medical", contact: "Dr. Patricia Hayes", status: "hot", value: "$25K/mo", notes: "Crisis comms needed.", score: 92 },
  { name: "NOLA Eats Festival", contact: "James Dupont", status: "warm", value: "$12K", notes: "Annual event PR.", score: 74 },
  { name: "Bayou Tech", contact: "Aisha Monroe", status: "warm", value: "$8.5K/mo", notes: "B2B thought leadership.", score: 68 },
  { name: "French Quarter Hotels", contact: "Robert Tran", status: "cold", value: "$30K/mo", notes: "Tourism campaign.", score: 45 },
  { name: "LA Film Commission", contact: "Denise Arceneaux", status: "hot", value: "$20K/mo", notes: "Film incentive awareness.", score: 88 },
];

const SEED_CONTACTS = [
  { name: "Sarah Chen", outlet: "Times-Picayune", beat: "Business", relationship: "strong", last_pitch: "2026-04-03", response: "positive" },
  { name: "Mike Rodriguez", outlet: "WWL-TV", beat: "General", relationship: "strong", last_pitch: "2026-04-07", response: "positive" },
  { name: "Lauren Fields", outlet: "Gambit Weekly", beat: "Food", relationship: "strong", last_pitch: "2026-04-05", response: "pending" },
  { name: "David Park", outlet: "Nola.com", beat: "Entertainment", relationship: "good", last_pitch: "2026-04-02", response: "positive" },
  { name: "Jasmine Hall", outlet: "WDSU", beat: "Morning", relationship: "good", last_pitch: "2026-03-28", response: "positive" },
  { name: "Chris Montague", outlet: "LA Cookin'", beat: "Food", relationship: "strong", last_pitch: "2026-04-01", response: "positive" },
];

const SEED_COVERAGE = [
  { outlet: "Louisiana Cookin'", title: "Crescent City: Homebrew to Big Name", type: "Feature", reach: "180K", sentiment: "positive", date: "2026-04-08", client: "Crescent City Brewing" },
  { outlet: "WWL-TV", title: "NOLA Eats Returns", type: "Segment", reach: "425K", sentiment: "positive", date: "2026-04-07", client: "NOLA Eats Festival" },
  { outlet: "Times-Picayune", title: "Gulf South Board Changes", type: "News", reach: "310K", sentiment: "neutral", date: "2026-04-07", client: "Gulf South Medical" },
  { outlet: "Nola.com", title: "Film Commission Record Year", type: "Feature", reach: "520K", sentiment: "positive", date: "2026-04-06", client: "LA Film Commission" },
  { outlet: "Gambit Weekly", title: "New Brewery Shakes Scene", type: "Interview", reach: "85K", sentiment: "positive", date: "2026-04-05", client: "Crescent City Brewing" },
];

const SEED_KANBAN = [
  { title: "Bayou Tech thought leadership", client: "Bayou Tech", contact: "Biz NOLA", column_name: "draft", position: 0 },
  { title: "Crescent City launch", client: "Crescent City", contact: "WWL-TV", column_name: "sent", position: 0 },
  { title: "Film Commission exclusive", client: "LA Film", contact: "Gambit Weekly", column_name: "sent", position: 1 },
  { title: "NOLA Eats lineup", client: "NOLA Eats", contact: "Times-Pic", column_name: "followup", position: 0 },
  { title: "Brewery feature", client: "Crescent City", contact: "LA Cookin'", column_name: "placed", position: 0 },
];

const SEED_NOTIFICATIONS = [
  { type: "crisis", title: "Crisis Alert", msg: "Gulf South story may break", read: false, priority: "urgent", time: "8:00 AM" },
  { type: "deadline", title: "Deadline", msg: "Press release due 3PM", read: false, priority: "high", time: "9:00 AM" },
  { type: "coverage", title: "Coverage Win", msg: "Crescent City in LA Cookin'", read: false, priority: "normal", time: "10:22 AM" },
  { type: "approval", title: "Approval Needed", msg: "Film Commission release v2", read: false, priority: "high", time: "10:45 AM" },
];

export async function seedDataForUser(userId: string) {
  // Check if user already has data
  const { data: existing } = await supabase.from("leads").select("id").eq("user_id", userId).limit(1);
  if (existing && existing.length > 0) return; // Already seeded

  // Seed all tables in parallel
  await Promise.all([
    supabase.from("leads").insert(SEED_LEADS.map((l) => ({ ...l, user_id: userId }))),
    supabase.from("contacts").insert(SEED_CONTACTS.map((c) => ({ ...c, user_id: userId }))),
    supabase.from("coverage").insert(SEED_COVERAGE.map((c) => ({ ...c, user_id: userId }))),
    supabase.from("kanban_cards").insert(SEED_KANBAN.map((k) => ({ ...k, user_id: userId }))),
    supabase.from("notifications").insert(SEED_NOTIFICATIONS.map((n) => ({ ...n, user_id: userId }))),
  ]);
}
