## Section by section

| Section | "+ Add" form fields | Stored in |
| --- | --- | --- |
| Clients (new panel + selector everywhere) | name, industry, website, contact email, status, notes | new `clients` |
| Leads CRM | company, contact, email, stage, value, source, client | existing `leads` (add form; already saves) |
| Media Lists | name, outlet, beat, email, relationship, notes | existing `contacts` |
| Pitch Kanban | title, outlet, column, owner, due date | existing `kanban_cards` |
| Clipper + Sentiment / Media Monitor | outlet, headline, URL, date, sentiment, reach, client | existing `coverage` |
| Social Calendar | date, channel, caption, status, client | new `calendar_posts` |
| Meeting Parser | title, date, attendees, raw notes, action items | new `meeting_notes` |
| Competitor Intel | competitor, outlet/source, note, date | new `competitor_notes` |
| Boilerplates | label, body text, client | new `boilerplates` |
| ROI Calculator | scenario name, inputs, computed result | new `roi_scenarios` |
| Report Builder | title, period, client, summary body | new `reports` |
| Analytics / Dashboard | no form — read the new records | — |
| Team Chat | message composer persists messages | new `chat_messages` |
| Press Release / Pitch / Creative AI | keep AI flow, add "Save" into existing history | existing `ai_outputs` |
| Client Onboard | wizard submit creates a real client record | new `clients` |

Live Meeting and Deck Builder are untouched.

## Technical notes

- One reusable `AddRecordModal` component (glass card, labeled inputs, select, textarea, Cancel / Save with the existing specular buttons) drives every form, configured per section; plus a small `SectionHeader` with the `+ Add` action. No new UI library.
- Hooks extend `src/hooks/usePortalData.ts` with the same React Query pattern already used (`useX` list + `useAddX` mutation invalidating its key), so lists and dashboard metrics refresh immediately after save. Add edit/delete on the new lists where it is trivial.
- New tables are staged as one additive migration in this draft: `clients`, `calendar_posts`, `meeting_notes`, `competitor_notes`, `boilerplates`, `roi_scenarios`, `reports`, `chat_messages` — each with `id`, `user_id`, timestamps, RLS restricted to the owner, and the required grants. Existing tables get only nullable additions (e.g. optional `client_id`), nothing dropped or retyped.
- Because this is a draft, the new tables are created when the draft is accepted; the Clients panel and the new forms only persist after that point.
- Validation: required fields disable Save; numbers coerced; toast on success/failure.
