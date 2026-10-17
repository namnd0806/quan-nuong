# Checklist & Budget workspace v2

## UI

- Phone: collapsed category sections, whole-row editing, full-screen native dialogs, sticky save/payment controls and bottom navigation.
- Desktop: full-width multi-column records and large dialogs (up to 1060px), with payment history beside budget details. Existing app navigation remains available.
- Shared category management with a curated outline icon picker, automatic select options and synchronized names.
- Checklist: personal/shared filters, status/priority/deadline, notes, private attachments, linked budget and update history.
- Budget: projected total, actual total and spending per member. There are no ownership ratios, equalization calculations or comparisons between members.
- Budget details separate projection from an optional agreed amount. Remaining payable is shown only when an agreed amount exists.
- Positive legacy payments can be assigned to a payer without inventing historical attribution. Older adjustments remain visible and unassigned until reviewed.

## Backend

The two timestamped migrations in `supabase/migrations` build on the existing database plus `migrations/audit_data_flow.sql`. They have already been applied to the current project. Do not run the older bootstrap scripts against a live database.

- Task/budget writes use `save_planning_record` with an expected update timestamp.
- `save_payment` uses stable UUIDs so retrying a create cannot duplicate a charge.
- `void_payment` preserves the record and a required cancellation reason. Voided amounts are excluded from Budget and Dashboard.
- Payments reference `members.id`; user labels are separate from identity. A budget's owner is not automatically its payer.
- Budget items with payment history cannot be deleted. Renaming a category updates linked task/budget names atomically.
- `workspace_events` stores actor/action history and is read-only to app clients.
- Uploaded PDFs and receipt images use the **private** `workspace-files` bucket. Clients create short-lived signed links. Removing an attachment association does not erase a stored file.
- Existing workspace membership RLS applies to new records, RPCs, history and private files. Authenticated strangers cannot read business data.
- Collection loading paginates past the API response cap. History fetches only the selected record's latest 100 events.

## Verification

`npm test` runs 7 model tests and 6 DOM interaction/hook tests: row editing, valid form payloads, conflict display, payment create/cancel, group icons and payment collection pagination past 1000 records.

`tests/planning-database.sql` checks real authenticated database writes for task/budget links, both payers, correct totals, duplicate retries, stale updates, cancellation history, group rename, protected deletion and unauthorized access. All fixtures are rolled back.

`npm run build` verifies the production bundle. DOM tests use mocked network calls; SQL tests cover the real RPC contracts. These do not replace a signed-in visual browser test on actual desktop/mobile devices or a two-device Realtime test. The existing login credentials are unchanged.
