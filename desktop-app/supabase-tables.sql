CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  account_type text default 'free' check (account_type in ('free', 'pro')),
  license_key text unique,
  license_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table private_boxes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  password_hash text not null,
  recovery_email text,
  encrypted_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table desktop_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  snapshot_data jsonb not null,
  created_at timestamptz default now()
);

create table license_keys (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  type text default 'pro' check (type in ('pro', 'trial')),
  duration_days integer default 365,
  is_used boolean default false,
  used_by uuid references profiles(id),
  created_at timestamptz default now(),
  activated_at timestamptz
);

create index profiles_account_type_idx on profiles(account_type);
create index private_boxes_user_id_idx on private_boxes(user_id);
create index desktop_snapshots_user_id_idx on desktop_snapshots(user_id);
create index license_keys_key_idx on license_keys(key);
