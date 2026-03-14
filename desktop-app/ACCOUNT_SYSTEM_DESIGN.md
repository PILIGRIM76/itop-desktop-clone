# 📦 iTop Easy Desktop Clone - Account System

**Дата:** 11 марта 2026 г.  
**Статус:** В разработке

---

## 🏗 Архитектура

### Технологический стек:

- **Бэкенд:** Supabase (PostgreSQL + Auth + Storage)
- **Клиент:** @supabase/supabase-js
- **Аутентификация:** Email/Password + Magic Link
- **Хранение сессий:** LocalStorage + JWT

---

## 📁 Структура файлов

```
desktop-app/
├── account-manager.js          # Менеджер аккаунтов (IPC обработчики)
├── supabase-client.js          # Supabase клиент
├── email-templates/
│   ├── password-recovery.html  # Шаблон письма восстановления
│   └── welcome.html            # Приветственное письмо
├── renderer/
│   ├── auth.html               # Окно авторизации/регистрации
│   ├── auth.js                 # Логика авторизации
│   ├── auth.css                # Стили авторизации
│   └── profile.html            # Профиль пользователя
├── account/
│   ├── account-window.js       # Управление окном профиля
│   └── license-manager.js      # Управление лицензиями
└── package.json                # Зависимости
```

---

## 🗄 Структура базы данных (Supabase)

### Таблица: `profiles`

```sql
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
```

### Таблица: `private_boxes`

```sql
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
```

### Таблица: `desktop_snapshots`

```sql
create table desktop_snapshots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  snapshot_data jsonb not null,
  created_at timestamptz default now()
);
```

### Таблица: `license_keys`

```sql
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
```

### RLS (Row Level Security) Policies

```sql
-- Включить RLS
alter table profiles enable row level security;
alter table private_boxes enable row level security;
alter table desktop_snapshots enable row level security;

-- Profiles: пользователи видят только свои данные
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

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

-- Snapshots: только владелец
create policy "Users can view own snapshots"
  on desktop_snapshots for select
  using (auth.uid() = user_id);

create policy "Users can manage own snapshots"
  on desktop_snapshots for all
  using (auth.uid() = user_id);
```

---

## 🔑 Функционал

### 1. Регистрация (Sign Up)

```javascript
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe"
}

Response:
{
  "success": true,
  "user": { "id": "...", "email": "...", "account_type": "free" },
  "message": "Registration successful. Please check your email."
}
```

### 2. Вход (Log In)

```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response:
{
  "success": true,
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "expires_in": 3600
  },
  "user": { "id": "...", "email": "...", "account_type": "pro" }
}
```

### 3. Активация Pro (Activation)

```javascript
POST /api/auth/activate
{
  "license_key": "ITOP-PRO-XXXX-XXXX-XXXX"
}

Response:
{
  "success": true,
  "license": {
    "type": "pro",
    "expires_at": "2027-03-11T00:00:00Z"
  }
}
```

### 4. Восстановление пароля (Forgot Password)

```javascript
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Password recovery email sent"
}
```

### 5. Смена пароля (Change Password)

```javascript
POST /api/auth/change-password
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Выход (Logout)

```javascript
POST /api/auth/logout

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🔐 Проверка Pro статуса

```javascript
// Проверка перед созданием Private Box
async function canCreatePrivateBox() {
  const user = await accountManager.getCurrentUser();
  
  if (!user) {
    return { 
      allowed: false, 
      reason: 'auth_required',
      message: 'Please log in to create a Private Box'
    };
  }
  
  // Проверка существующего Private Box
  const existingBoxes = await accountManager.getPrivateBoxes();
  if (existingBoxes.length > 0) {
    return { 
      allowed: false, 
      reason: 'already_exists',
      message: 'You already have a Private Box (1 per account)'
    };
  }
  
  // Проверка Pro статуса
  if (user.account_type === 'pro') {
    return { allowed: true };
  }
  
  return { 
    allowed: false, 
    reason: 'pro_required',
    message: 'Private Box requires Pro account',
    upgradeUrl: 'https://itopsoftware.com/upgrade'
  };
}
```

---

## 📄 Лицензионные ключи

### Формат ключа:
```
ITOP-PRO-XXXXX-XXXXX-XXXXX
```

### Генерация ключа:
```javascript
function generateLicenseKey() {
  const prefix = 'ITOP-PRO';
  const segment = () => Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${segment()}-${segment()}-${segment()}`;
}
```

### Проверка ключа:
```javascript
async function activateLicense(userId, licenseKey) {
  // Проверка формата
  if (!/^ITOP-PRO-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(licenseKey)) {
    throw new Error('Invalid license key format');
  }
  
  // Проверка в базе
  const key = await supabase
    .from('license_keys')
    .select('*')
    .eq('key', licenseKey)
    .single();
  
  if (!key) {
    throw new Error('License key not found');
  }
  
  if (key.is_used) {
    throw new Error('License key already activated');
  }
  
  // Активация
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + key.duration_days);
  
  await supabase
    .from('profiles')
    .update({
      account_type: 'pro',
      license_key: licenseKey,
      license_expires_at: expiresAt.toISOString()
    })
    .eq('id', userId);
  
  await supabase
    .from('license_keys')
    .update({
      is_used: true,
      used_by: userId,
      activated_at: new Date().toISOString()
    })
    .eq('id', key.id);
  
  return { success: true, expiresAt };
}
```

---

## 🎨 UI Компоненты

### Окно авторизации (auth.html)

```
┌────────────────────────────────────────────┐
│  🔐 iTop Easy Desktop - Account            │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  [•] Sign In   [ ] Sign Up           │  │
│  └──────────────────────────────────────┘  │
│                                            │
│  Email:    [________________________]      │
│  Password: [________________________]      │
│                                            │
│  [ ] Remember me                           │
│  [ ] I agree to Terms & Conditions         │
│                                            │
│  [        Sign In        ]                 │
│                                            │
│  ────────── or ──────────                  │
│                                            │
│  [📧 Continue with Email Magic Link]       │
│  [🔵 Continue with Google]                 │
│                                            │
│  Forgot password? [Reset here]             │
│                                            │
└────────────────────────────────────────────┘
```

### Окно профиля (profile.html)

```
┌────────────────────────────────────────────┐
│  👤 My Account                             │
├────────────────────────────────────────────┤
│                                            │
│  ┌─────────┐  Email: user@example.com     │
│  │  👤     │  Name:  [John Doe______]     │
│  │ Avatar  │                               │
│  └─────────┘  [Change Avatar]             │
│                                            │
│  ────────────────────────────────────────  │
│                                            │
│  Account Type:  [PRO Badge 🌟]             │
│  License Key:   ITOP-PRO-XXXXX-XXXXX-XXXXX │
│  Expires:       March 11, 2027             │
│                                            │
│  [Upgrade to Pro] [Change License]         │
│                                            │
│  ────────────────────────────────────────  │
│                                            │
│  Private Box:  [Created ✅] [Manage]       │
│  Cloud Sync:   [Enabled]                   │
│  Snapshots:    [3 saved]                   │
│                                            │
│  ────────────────────────────────────────  │
│                                            │
│  [Change Password] [Recovery Email]        │
│                                            │
│  [        Sign Out        ]                │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🚀 План реализации

### Этап 1: Настройка Supabase (1 день)
- [ ] Создать проект Supabase
- [ ] Настроить таблицы и RLS policies
- [ ] Настроить Email шаблоны
- [ ] Получить API ключи

### Этап 2: Бэкенд логика (2 дня)
- [ ] `supabase-client.js` - клиент
- [ ] `account-manager.js` - IPC обработчики
- [ ] `license-manager.js` - управление лицензиями

### Этап 3: UI компоненты (2 дня)
- [ ] `auth.html` - окно авторизации
- [ ] `auth.js` - логика
- [ ] `auth.css` - стили
- [ ] `profile.html` - профиль

### Этап 4: Интеграция (1 день)
- [ ] Интеграция с Private Box
- [ ] Проверка Pro статуса в Boxes
- [ ] Сохранение сессии

### Этап 5: Тестирование (1 день)
- [ ] Тесты регистрации/входа
- [ ] Тесты активации лицензии
- [ ] Тесты восстановления пароля

---

## 📦 Зависимости

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## 🔐 Безопасность

### Хранение токенов:
- Access token: In-memory (переменная процесса)
- Refresh token: Encrypted localStorage
- Пароли: Никогда не хранятся

### JWT Token:
```javascript
{
  "aud": "authenticated",
  "exp": 1710172800,
  "sub": "user-uuid",
  "email": "user@example.com",
  "app_metadata": {
    "account_type": "pro"
  }
}
```

---

## 📝 Примечания

1. **Email подтверждение:** Требуется для активации аккаунта
2. **Magic Link:** Альтернатива паролю (без пароля)
3. **OAuth:** Google OAuth опционально
4. **Trial:** 14-дневный trial Pro для новых пользователей

---

**Статус:** Готов к реализации  
**Следующий шаг:** Настройка Supabase проекта
