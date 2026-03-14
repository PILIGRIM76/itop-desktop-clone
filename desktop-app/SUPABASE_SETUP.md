# 🔐 Supabase Setup Instruction

**Дата:** 11 марта 2026 г.  
**Статус:** Требуется настройка

---

## 📋 Шаг 1: Создание проекта Supabase

1. Перейдите на https://supabase.com
2. Нажмите **Start your project**
3. Войдите через GitHub или создайте аккаунт

### Создайте новый проект:

```
Project Name: itop-desktop-clone
Database Password: [Запомните этот пароль!]
Region: [Выберите ближайший к вам]
Pricing Plan: Free (для начала)
```

---

## 📋 Шаг 2: Получение API ключей

После создания проекта:

1. Перейдите в **Settings** → **API**
2. Скопируйте два ключа:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (длинная строка)

### Обновите файл `supabase-client.js`:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

---

## 📋 Шаг 3: Создание таблиц базы данных

Перейдите в **SQL Editor** и выполните следующие SQL запросы:

### 1. Таблица profiles

```sql
-- Таблица профилей пользователей
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

-- Индекс для быстрого поиска
create index profiles_account_type_idx on profiles(account_type);
```

### 2. Таблица private_boxes

```sql
-- Приватные боксы пользователей
create table private_boxes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  password_hash text not null,
  recovery_email text,
  encrypted_data jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)  -- Один приватный бокс на пользователя
);

-- Индекс для поиска по пользователю
create index private_boxes_user_id_idx on private_boxes(user_id);
```

### 3. Таблица desktop_snapshots

```sql
-- Снимки рабочего стола в облаке
create table desktop_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  snapshot_data jsonb not null,
  created_at timestamptz default now()
);

-- Индекс для поиска по пользователю
create index desktop_snapshots_user_id_idx on desktop_snapshots(user_id);
```

### 4. Таблица license_keys

```sql
-- Лицензионные ключи
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

-- Индекс для поиска ключа
create index license_keys_key_idx on license_keys(key);
```

---

## 📋 Шаг 4: Настройка RLS (Row Level Security)

Включите защиту данных:

```sql
-- Включить RLS для всех таблиц
alter table profiles enable row level security;
alter table private_boxes enable row level security;
alter table desktop_snapshots enable row level security;
alter table license_keys enable row level security;

-- Profiles: пользователи видят только свои данные
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Private Boxes: только владелец
create policy "Users can view own private box"
  on private_boxes for select
  using (auth.uid() = user_id);

create policy "Users can create own private box"
  on private_boxes for insert
  with check (auth.uid() = user_id);

create policy "Users can update own private box"
  on private_boxes for update
  using (auth.uid() = user_id);

create policy "Users can delete own private box"
  on private_boxes for delete
  using (auth.uid() = user_id);

-- Snapshots: только владелец
create policy "Users can view own snapshots"
  on desktop_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can manage own snapshots"
  on desktop_snapshots for all
  using (auth.uid() = user_id);

-- License Keys: только просмотр для активации
create policy "Users can view license keys"
  on license_keys for select
  using (true);  -- Публичный доступ для проверки ключей

create policy "Users can update used license keys"
  on license_keys for update
  using (true);  -- Разрешить активацию
```

---

## 📋 Шаг 5: Настройка Email шаблонов

Перейдите в **Authentication** → **Email Templates**

### 1. Confirm Signup (подтверждение регистрации)

```html
<h2>Welcome to iTop Easy Desktop Clone!</h2>

<p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Confirm Email</a>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>If you didn't create this account, you can safely ignore this email.</p>

<hr>
<p style="color: #666; font-size: 12px;">iTop Easy Desktop Clone - Desktop Organizer</p>
```

### 2. Reset Password (восстановление пароля)

```html
<h2>Reset your password</h2>

<p>You requested a password reset for your iTop Easy Desktop Clone account.</p>

<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #ec4899; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Reset Password</a>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<hr>
<p style="color: #666; font-size: 12px;">iTop Easy Desktop Clone - Desktop Organizer</p>
```

---

## 📋 Шаг 6: Настройка Email подтверждений

Перейдите в **Authentication** → **Settings** → **Email Auth**

### Включите опции:

- ✅ **Enable Email Confirmations** - требовать подтверждения email
- ✅ **Enable Double Opt-In** - двойное подтверждение (рекомендуется)
- ✅ **Secure Email Change** - подтверждение при смене email

### SMTP настройки (опционально):

Для использования своего email сервера вместо Supabase:

```
SMTP Host: smtp.yourprovider.com
SMTP Port: 587
SMTP Username: your-email@domain.com
SMTP Password: your-smtp-password
From Email: noreply@itopdesktop.clone
```

---

## 📋 Шаг 7: Генерация лицензионных ключей

Создайте тестовые лицензионные ключи:

```sql
-- Создать Pro лицензию на 1 год
insert into license_keys (key, type, duration_days)
values 
  ('ITOP-PRO-ABCDE-12345-FGHIJ', 'pro', 365),
  ('ITOP-PRO-TEST11-11111-TEST1', 'pro', 365),
  ('ITOP-PRO-TRIAL-00001-TRIAL', 'trial', 14);
```

---

## 📋 Шаг 8: Тестирование

### Установите зависимости:

```bash
cd desktop-app
npm install
```

### Запустите приложение:

```bash
npm start
```

### Проверьте:

1. **Регистрация:**
   - Откройте окно авторизации
   - Нажмите "Sign Up"
   - Введите email и пароль
   - Проверьте email с подтверждением

2. **Вход:**
   - Нажмите "Sign In"
   - Введите credentials
   - Проверьте сохранение сессии

3. **Активация лицензии:**
   - Войдите в аккаунт
   - Откройте настройки
   - Введите тестовый ключ: `ITOP-PRO-ABCDE-12345-FGHIJ`
   - Проверьте Pro статус

---

## 🔧 Troubleshooting

### Ошибка: "Invalid API key"

**Решение:**
- Проверьте SUPABASE_URL и SUPABASE_ANON_KEY в `supabase-client.js`
- Убедитесь, что ключи скопированы полностью (без пробелов)

### Ошибка: "Email not confirmed"

**Решение:**
- Проверьте папку Spam
- Убедитесь, что SMTP настроен правильно
- Проверьте **Authentication** → **Email Templates**

### Ошибка: "RLS policy violation"

**Решение:**
- Проверьте что RLS policies созданы правильно
- Убедитесь что пользователь аутентифицирован (auth.uid() существует)

---

## 📊 Мониторинг

### Просмотр пользователей:

Перейдите в **Authentication** → **Users**

### Просмотр данных:

Перейдите в **Table Editor** и выберите таблицу

### Логи:

Перейдите в **Logs** → **Auth Logs**

---

## 🚀 Production Checklist

Перед публикацией:

- [ ] Замените тестовые лицензионные ключи на реальные
- [ ] Настройте свой SMTP сервер
- [ ] Включите rate limiting для API
- [ ] Настройте backup базы данных
- [ ] Протестируйте восстановление пароля
- [ ] Проверьте RLS policies на уязвимости

---

## 📚 Дополнительные ресурсы

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)

---

**Статус:** Готово к настройке  
**Следующий шаг:** Выполните шаги 1-8 для активации системы аккаунтов
