# Data flow fixes — 2026-10-17

The existing React/Vite app uses Supabase `rvflcpvhkxynfscydksl` directly.

## Fixed

- Budget inline actual editing now appends an adjustment transaction through `set_budget_actual`. Existing payments remain the source of truth for Budget and Dashboard. The RPC locks the parent item and rejects a stale expected total.
- Checklist and Budget use configured main categories plus historic values, so new settings appear without rewriting existing records.
- Menu variable costs now have the JSONB column expected by the form. Legacy scalar costs are preserved as a named entry. Food cost reports include variable costs.
- Supplier details and product names are saved in one database transaction. Unchanged products keep their IDs, prices, units and notes; errors prevent a success message.
- Collection updates/deletes require a returned row. Unique Realtime channels, response ordering, post-write reloads and focus reloads prevent false success, duplicate creates and stale responses.
- Settings remain live across screens. Missing Realtime publications were added for categories, members, lookups, ingredients and profiles.
- Dashboard and Checklist derive overdue counts from deadlines in Vietnam time. Removed the hardcoded weekly progress gain.
- RLS restricts business data and image writes to the two existing workspace accounts. New Auth accounts are not automatically granted workspace access. The private membership table has no client policies by design. Future account access must be granted administratively.
- Hardened function search paths and revoked direct invocation of the signup trigger function.

## Database deployment

`migrations/audit_data_flow.sql` is a one-time migration, already applied to this project. It must not be reapplied blindly: it creates policies, functions and the private access table.

## Validation

- `node --test tests/data-flow.test.js`
- `npm run build`
- `tests/database-flow.sql`: uses the authenticated role and existing workspace identity; checks budget adjustments and stale writes, supplier product metadata, task CRUD, menu JSONB and denial of unapproved accounts. All fixtures are rolled back.

No real credentials, sessions or business snapshots are committed. Interactive signed-in browser flows and an actual two-device Realtime session still require separate verification; SQL role tests do not prove those UI flows. Supabase's compromised-password check remains disabled in project Auth settings.
