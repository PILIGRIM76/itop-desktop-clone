# ⚡ Quick Start: Account System Setup

**5 минут до работающей системы аккаунтов!**

---

## 📦 Шаг 1: Установка зависимостей

```bash
cd "F:\Kimi_Agent_Клон iTop Desktop\desktop-app"
npm install @supabase/supabase-js
```

---

## 🌐 Шаг 2: Настройка Supabase (5 минут)

### 2.1 Создайте проект

1. Перейдите на https://supabase.com
2. Нажмите **Start your project**
3. Создайте проект:
   - Name: `itop-desktop-clone`
   - Password: `[запомните!]`
   - Region: `[ближайший к вам]`

### 2.2 Получите ключи

1. **Settings** → **API**
2. Скопируйте:
   - `Project URL`
   - `anon/public key`

### 2.3 Обновите supabase-client.js

Откройте `desktop-app/supabase-client.js` и замените:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

### 2.4 Создайте таблицы

**SQL Editor** → **New Query** → Вставьте и выполните:

```sql
-- Таблица profiles
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

-- Таблица private_boxes
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

-- Таблица desktop_snapshots
create table desktop_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  snapshot_data jsonb not null,
  created_at timestamptz default now()
);

-- Таблица license_keys
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

-- RLS Policies
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
```

### 2.5 Создайте тестовый лицензионный ключ

```sql
insert into license_keys (key, type, duration_days)
values ('ITOP-PRO-ABCDE-12345-FGHIJ', 'pro', 365);
```

---

## 🧪 Шаг 3: Тестирование

### 3.1 Запустите приложение

```bash
npm start
```

### 3.2 Проверьте регистрацию

1. Откройте главное окно
2. Нажмите на иконку профиля (внизу слева)
3. Нажмите **Sign Up**
4. Введите:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
5. Нажмите **Create Account**
6. Проверьте email (должно прийти подтверждение)

### 3.3 Проверьте вход

1. Введите email и пароль
2. Нажмите **Sign In**
3. Должна появиться надпись "Successfully signed in!"

### 3.4 Проверьте активацию лицензии

1. Откройте настройки
2. Найдите секцию "License" или "Activation"
3. Введите: `ITOP-PRO-ABCDE-12345-FGHIJ`
4. Нажмите **Activate**
5. Должно появиться "Pro license activated successfully!"

### 3.5 Проверьте создание Private Box

1. Перейдите на вкладку "Boxes"
2. Найдите карточку "Private Box"
3. Нажмите **Create Private Box**
4. Введите:
   - Name: `My Private Box`
   - Password: `SecurePassword123!`
   - Recovery Email: `your-email@example.com`
5. Нажмите **Create**
6. Должно появиться "Private box created!"

---

## ✅ Чеклист готовности

- [ ] Зависимости установлены (`npm install @supabase/supabase-js`)
- [ ] Supabase проект создан
- [ ] Ключи обновлены в `supabase-client.js`
- [ ] Таблицы созданы (SQL выполнен без ошибок)
- [ ] Тестовый лицензионный ключ создан
- [ ] Регистрация работает
- [ ] Вход работает
- [ ] Активация лицензии работает
- [ ] Private Box создаётся

---

## 🐛 Troubleshooting

### Ошибка: "Invalid API key"

**Решение:**
```javascript
// Проверьте что ключи вставлены полностью
const SUPABASE_URL = 'https://xxxxx.supabase.co';  // Без пробелов
const SUPABASE_ANON_KEY = 'eyJhbGc...';  // Длинная строка, без пробелов
```

### Ошибка: "relation does not exist"

**Решение:**
- Выполните SQL скрипт из Шага 2.4
- Проверьте что все таблицы созданы в **Table Editor**

### Ошибка: "Email not confirmed"

**Решение:**
- Проверьте папку Spam
- Или отключите подтверждение: **Authentication** → **Email Auth** → уберите галочку "Confirm email"

---

## 📚 Документация

- `SUPABASE_SETUP.md` - полная инструкция по настройке
- `ACCOUNT_SYSTEM_DESIGN.md` - архитектура системы
- `PRIVATE_BOX_ACCOUNT_INTEGRATION.md` - интеграция с Private Box

---

**Время настройки:** ~10 минут  
**Сложность:** ⭐⭐ (из 5)
