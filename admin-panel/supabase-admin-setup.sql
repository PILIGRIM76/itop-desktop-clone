-- ========================================
-- ADMIN PANEL DATABASE SETUP
-- ========================================

-- 1. Добавить поле роли в profiles
alter table profiles 
add column if not exists role text default 'user' check (role in ('user', 'admin', 'superadmin'));

-- 2. Индекс для поиска админов
create index if not exists profiles_role_idx on profiles(role);

-- 3. Таблица audit log для администраторов
create table if not exists admin_audit_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

create index if not exists admin_audit_log_admin_id_idx on admin_audit_log(admin_id);
create index if not exists admin_audit_log_action_idx on admin_audit_log(action);

-- 4. Добавить поле created_by в license_keys
alter table license_keys 
add column if not exists created_by uuid references profiles(id);

-- 5. Индексы для license_keys
create index if not exists license_keys_used_by_idx on license_keys(used_by);
create index if not exists license_keys_is_used_idx on license_keys(is_used);
create index if not exists license_keys_created_by_idx on license_keys(created_by);

-- 6. Ограничения целостности
alter table license_keys 
add constraint if not exists check_duration_positive check (duration_days > 0);

alter table license_keys 
add constraint if not exists check_activated_when_used 
check (is_used = false or activated_at is not null);

-- ========================================
-- RLS POLICIES FOR ADMIN
-- ========================================

-- Админы видят все профили
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles" on profiles 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы могут обновлять профили (кроме superadmin)
drop policy if exists "Admins can update profiles" on profiles;
create policy "Admins can update profiles" on profiles 
for update using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы видят все лицензии
drop policy if exists "Admins can view all license keys" on license_keys;
create policy "Admins can view all license keys" on license_keys 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы могут создавать лицензии
drop policy if exists "Admins can create license keys" on license_keys;
create policy "Admins can create license keys" on license_keys 
for insert using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы могут обновлять лицензии
drop policy if exists "Admins can update license keys" on license_keys;
create policy "Admins can update license keys" on license_keys 
for update using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Audit log - только вставка
drop policy if exists "Anyone can insert audit logs" on admin_audit_log;
create policy "Anyone can insert audit logs" on admin_audit_log 
for insert with check (true);

-- Админы видят audit log
drop policy if exists "Admins can view audit logs" on admin_audit_log;
create policy "Admins can view audit logs" on admin_audit_log 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Функция проверки роли администратора
create or replace function is_admin() returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and (role = 'admin' or role = 'superadmin')
  );
end;
$$ language plpgsql security definer;

-- Функция генерации лицензионного ключа
create or replace function generate_license_key(
  key_type text default 'pro',
  days integer default 365
) returns text as $$
declare
  new_key text;
  segment text;
begin
  -- Формат: ITOP-XXX-XXXXX-XXXXX-XXXXX
  select upper(substring(md5(random()::text) from 1 for 5)) into segment;
  new_key := 'ITOP-' || upper(substring(key_type from 1 for 3)) || '-' || segment;
  
  select upper(substring(md5(random()::text) from 1 for 5)) into segment;
  new_key := new_key || '-' || segment;
  
  select upper(substring(md5(random()::text) from 1 for 5)) into segment;
  new_key := new_key || '-' || segment;
  
  insert into license_keys (key, type, duration_days, created_by)
  values (new_key, key_type, days, auth.uid());
  
  return new_key;
end;
$$ language plpgsql security definer;

-- Функция пакетной генерации ключей
create or replace function generate_license_keys_batch(
  count integer default 1,
  key_type text default 'pro',
  days integer default 365
) returns text[] as $$
declare
  keys text[];
  i integer;
  new_key text;
begin
  keys := array[]::text[];
  
  for i in 1..count loop
    new_key := generate_license_key(key_type, days);
    keys := array_append(keys, new_key);
  end loop;
  
  return keys;
end;
$$ language plpgsql security definer;

-- Функция логирования действий админа
create or replace function log_admin_action(
  p_action text,
  p_target_type text default null,
  p_target_id uuid default null,
  p_details jsonb default null
) returns void as $$
begin
  insert into admin_audit_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, p_details);
end;
$$ language plpgsql security definer;

-- ========================================
-- VIEW ДЛЯ СТАТИСТИКИ
-- ========================================

-- Общая статистика
create or replace view admin_stats_overview as
select
  (select count(*) from profiles) as total_users,
  (select count(*) from profiles where role = 'admin') as total_admins,
  (select count(*) from profiles where account_type = 'pro') as pro_users,
  (select count(*) from profiles where account_type = 'free') as free_users,
  (select count(*) from license_keys) as total_licenses,
  (select count(*) from license_keys where is_used = true) as used_licenses,
  (select count(*) from license_keys where is_used = false) as available_licenses,
  (select count(*) from private_boxes) as total_private_boxes,
  (select count(*) from desktop_snapshots) as total_snapshots;

-- Статистика по регистрациям (по дням)
create or replace view admin_stats_registrations as
select
  date_trunc('day', created_at) as registration_date,
  count(*) as new_users
from profiles
group by date_trunc('day', created_at)
order by registration_date desc;

-- Статистика по активациям лицензий
create or replace view admin_stats_license_activations as
select
  date_trunc('day', activated_at) as activation_date,
  type as license_type,
  count(*) as activations
from license_keys
where is_used = true
group by date_trunc('day', activated_at), type
order by activation_date desc;

-- ========================================
-- СОЗДАТЬ ПЕРВОГО АДМИНИСТРАТОРА
-- ========================================

-- ВНИМАНИЕ: Замените email на ваш!
-- update profiles 
-- set role = 'superadmin' 
-- where email = 'your-admin-email@example.com';

-- ========================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- ========================================

-- Генерация одного Pro ключа:
-- select generate_license_key('pro', 365);

-- Генерация 5 Trial ключей:
-- select generate_license_keys_batch(5, 'trial', 14);

-- Логирование действия:
-- select log_admin_action('LICENSE_GENERATED', 'license_key', null, '{"count": 5, "type": "pro"}');

-- Проверка статистики:
-- select * from admin_stats_overview;
