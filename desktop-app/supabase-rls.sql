alter table profiles enable row level security;
alter table private_boxes enable row level security;
alter table desktop_snapshots enable row level security;
alter table license_keys enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own private box" on private_boxes for select using (auth.uid() = user_id);
create policy "Users can create own private box" on private_boxes for insert with check (auth.uid() = user_id);
create policy "Users can update own private box" on private_boxes for update using (auth.uid() = user_id);
create policy "Users can delete own private box" on private_boxes for delete using (auth.uid() = user_id);

create policy "Users can view own snapshots" on desktop_snapshots for select using (auth.uid() = user_id);
create policy "Users can manage own snapshots" on desktop_snapshots for all using (auth.uid() = user_id);

create policy "Users can view license keys" on license_keys for select using (true);
create policy "Users can update used license keys" on license_keys for update using (true);
