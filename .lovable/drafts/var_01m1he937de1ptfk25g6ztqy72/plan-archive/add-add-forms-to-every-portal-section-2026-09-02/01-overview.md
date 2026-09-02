# Add "+ Add" forms to every portal section

Right now most sections display data but give no way to enter it. Leads, Contacts, Coverage and Kanban already save to the database; the rest (Clients, Social Calendar, Meeting Notes, Competitors, Boilerplates, ROI scenarios, Reports, Media Monitor mentions, Team Chat) are display-only or template-only.

This adds a consistent "+ Add" button to each section header (except Live Meeting and Deck Builder), opening a small modal form in the existing dark/glass style. Saving writes to the database, the list refreshes instantly, and the dashboard metrics pick up the new records.

Nothing existing is removed or restyled — this is purely additive.

## New Clients concept

A first-class Clients record (name, industry, website, contact email, status, notes) becomes the thing other sections attach to: leads, coverage, calendar posts, reports and the Client Portal all get an optional client selector, so information entered anywhere feeds back into the app.
