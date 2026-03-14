# 🛡️ iTop Admin System - Архитектура

**Дата:** 11 марта 2026 г.  
**Версия:** 1.0.0

---

## 🏗 Архитектура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                     iTop Easy Desktop                           │
│                  (Клиентское приложение)                        │
│                                                                 │
│  • Оргазайзер рабочего стола                                   │
│  • Боксы, виджеты, обои                                        │
│  • Личный кабинет                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      Supabase Cloud                             │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │    Auth      │  │  PostgreSQL  │  │   Realtime API      │   │
│  │  (JWT/OAuth) │  │   Database   │  │   (WebSockets)      │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    ↕ HTTPS                    ↕ HTTPS
┌─────────────────────────────────┐  ┌───────────────────────────┐
│     Admin Panel (React SPA)     │  │    Telegram Bot           │
│                                 │  │                           │
│  • Dashboard                    │  │  • /start - Информация    │
│  • Пользователи                 │  │  • /key - Генерация ключа │
│  • Лицензии                     │  │  • /stats - Статистика    │
│  • Генерация ключей             │  │  • /user - Поиск по email │
│  • Статистика                   │  │  • /activate - Активация  │
└─────────────────────────────────┘  └───────────────────────────┘
```

---

## 📁 Структура проектов

```
F:\Kimi_Agent_Клон iTop Desktop\
├── desktop-app/                    # Основное приложение (Electron)
│   ├── main.js
│   ├── account-manager.js
│   └── ...
│
├── admin-panel/                    # Админ-панель (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── supabaseClient.js
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UsersTable.jsx
│   │   │   ├── LicenseGenerator.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Licenses.jsx
│   │   │   └── Settings.jsx
│   │   └── styles/
│   │       └── index.css
│   └── README.md
│
└── telegram-bot/                   # Telegram Bot (Node.js)
    ├── index.js
    ├── package.json
    ├── .env
    ├── config.js
    ├── bot.js
    ├── commands/
    │   ├── start.js
    │   ├── key.js
    │   ├── stats.js
    │   └── user.js
    └── README.md
```

---

## 🗄 База данных (Supabase)

### Таблица: profiles (обновлённая)

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'superadmin')),
  account_type text default 'free' check (account_type in ('free', 'pro')),
  license_key text unique,
  license_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Таблица: admin_audit_log (новая)

```sql
create table admin_audit_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

create index admin_audit_log_admin_id_idx on admin_audit_log(admin_id);
create index admin_audit_log_action_idx on admin_audit_log(action);
```

### Таблица: license_keys (обновлённая)

```sql
create table license_keys (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  type text default 'pro' check (type in ('pro', 'trial', 'enterprise')),
  duration_days integer default 365,
  is_used boolean default false,
  used_by uuid references profiles(id),
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  activated_at timestamptz
);
```

---

## 🔐 RLS Политики

### Для администраторов:

```sql
-- Админы видят все профили
create policy "Admins can view all profiles" on profiles 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы могут обновлять профили (кроме superadmin)
create policy "Admins can update profiles" on profiles 
for update using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы видят все лицензии
create policy "Admins can view all license keys" on license_keys 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Админы могут создавать лицензии
create policy "Admins can create license keys" on license_keys 
for insert using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);

-- Audit log - только вставка
create policy "Anyone can insert audit logs" on admin_audit_log 
for insert with check (true);

-- Админы видят audit log
create policy "Admins can view audit logs" on admin_audit_log 
for select using (
  exists (
    select 1 from profiles p 
    where p.id = auth.uid() 
    and (p.role = 'admin' or p.role = 'superadmin')
  )
);
```

---

## 🔑 Функции базы данных

### Генерация лицензионного ключа:

```sql
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
  
  insert into license_keys (key, type, duration_days)
  values (new_key, key_type, days);
  
  return new_key;
end;
$$ language plpgsql security definer;
```

### Проверка роли администратора:

```sql
create or replace function is_admin() returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and (role = 'admin' or role = 'superadmin')
  );
end;
$$ language plpgsql security definer;
```

---

## 🎯 API Endpoints (для админ-панели)

### Authentication:
- `POST /auth/login` - Вход администратора
- `POST /auth/logout` - Выход
- `GET /auth/session` - Проверка сессии

### Users:
- `GET /users` - Список всех пользователей
- `GET /users/:id` - Детали пользователя
- `PATCH /users/:id` - Обновление пользователя
- `DELETE /users/:id` - Удаление (soft delete)
- `POST /users/:id/role` - Изменение роли

### Licenses:
- `GET /licenses` - Список лицензий
- `POST /licenses/generate` - Генерация ключей (пакетно)
- `PATCH /licenses/:id` - Обновление статуса
- `POST /licenses/:id/activate` - Принудительная активация
- `POST /licenses/:id/deactivate` - Деактивация

### Statistics:
- `GET /stats/overview` - Общая статистика
- `GET /stats/users` - Статистика пользователей
- `GET /stats/licenses` - Статистика лицензий
- `GET /stats/activity` - Активность (audit log)

---

## 🤖 Telegram Bot Commands

### Базовые команды:

| Команда | Описание | Доступ |
|---------|----------|--------|
| `/start` | Информация о боте | Все |
| `/help` | Справка по командам | Все |
| `/stats` | Статистика системы | Admin |
| `/key <type> [count]` | Генерация ключа | Admin |
| `/user <email>` | Поиск пользователя | Admin |
| `/activate <key>` | Активация ключа | Все |
| `/check <key>` | Проверка ключа | Все |
| `/revoke <key>` | Отозвать ключ | Superadmin |

### Примеры использования:

```
# Генерация Pro ключа
/key pro

# Генерация 5 Trial ключей
/key trial 5

# Поиск пользователя
/user test@example.com

# Проверка ключа
/check ITOP-PRO-ABCDE-12345-FGHIJ
```

---

## 🔐 Безопасность

### Админ-панель:

1. **JWT Authentication** - токены через Supabase Auth
2. **RLS Policies** - защита на уровне строк
3. **Audit Logging** - логирование всех действий
4. **IP Whitelist** (опционально) - доступ с определённых IP
5. **2FA** (опционально) - двухфакторная аутентификация

### Telegram Bot:

1. **Whitelist Chat IDs** - только для авторизованных админов
2. **Command Rate Limiting** - защита от злоупотреблений
3. **Sensitive Data Masking** - скрытие паролей и токенов
4. **Confirmation Dialogs** - подтверждение критичных операций

---

## 📊 Dashboard Metrics

### Основная статистика:

- 👥 **Всего пользователей** (с разбивкой по ролям)
- 🌟 **Pro подписки** (активные/истёкшие)
- 🎫 **Лицензии** (использовано/свободно)
- 📦 **Private Boxes** (всего создано)
- 💾 **Снимки** (всего сохранено)
- 📈 **Активность** (за 7/30 дней)

### Графики:

- Регистрация пользователей (по дням)
- Активация лицензий (по типам)
- Активность по дням недели

---

## 🚀 Деплой

### Admin Panel (React):

```bash
# Сборка
npm run build

# Деплой на Vercel
vercel deploy

# Или на Netlify
netlify deploy --prod
```

### Telegram Bot:

```bash
# Запуск
node index.js

# Или через PM2
pm2 start telegram-bot/index.js --name itop-bot
```

---

## 📝 Чеклист развёртывания

- [ ] Supabase проект настроен
- [ ] Таблицы созданы
- [ ] RLS политики настроены
- [ ] Функции созданы
- [ ] Первый администратор назначен
- [ ] Admin Panel собран и развёрнут
- [ ] Telegram Bot запущен
- [ ] Whitelist админов настроен
- [ ] Audit logging работает
- [ ] Документация обновлена

---

**Следующий шаг:** Создание React приложения админ-панели!
