-- Solo-user RLS: only authenticated users can read/write all tables
-- The allowlist is enforced at the auth layer (login page), not RLS.

alter table meetings enable row level security;
alter table kb_entries enable row level security;
alter table kb_changes enable row level security;
alter table titles enable row level security;
alter table title_feedback enable row level security;
alter table subscribers enable row level security;
alter table cohorts enable row level security;
alter table retention_experiments enable row level security;
alter table campaigns enable row level security;
alter table campaign_assets enable row level security;
alter table sessions enable row level security;
alter table predictions enable row level security;
alter table research_runs enable row level security;
alter table trending_topics enable row level security;

create policy "authenticated_full_access" on meetings for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on kb_entries for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on kb_changes for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on titles for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on title_feedback for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on subscribers for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on cohorts for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on retention_experiments for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on campaigns for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on campaign_assets for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on sessions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on predictions for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on research_runs for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "authenticated_full_access" on trending_topics for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
