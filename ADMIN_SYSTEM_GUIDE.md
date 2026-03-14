# 🛡️ iTop Admin System - Complete Guide

**Админ-панель + Telegram Bot для iTop Easy Desktop Clone**

---

## 📊 Обзор системы

```
┌─────────────────────────────────────────────────────────────┐
│              iTop Easy Desktop (Клиент)                     │
│              10,000+ пользователей                          │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────────────┐
│                  Supabase Cloud                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │   Auth   │  │ Database │  │   Realtime API           │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└────────────┬───────────────────┬────────────────────────────┘
             │                   │
      HTTPS  │                   │  HTTPS
             │                   │
┌────────────▼───────┐   ┌──────▼────────────────────────────┐
│  Admin Panel       │   │  Telegram Bot                     │
│  (React SPA)       │   │  (Node.js)                        │
│                    │   │                                    │
│  • Dashboard       │   │  • /stats - Статистика            │
│  • Users           │   │  • /key - Генерация ключей        │
│  • Licenses        │   │  • /user - Поиск пользователей    │
│  • Settings        │   │  • /check - Проверка ключа        │
└────────────────────┘   └────────────────────────────────────┘
```

---

## 📁 Структура проекта

```
F:\Kimi_Agent_Клон iTop Desktop\
├── desktop-app/              # Основное приложение (Electron)
│   ├── main.js
│   ├── account-manager.js
│   └── ...
│
├── admin-panel/              # Админ-панель (React + Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Licenses.jsx
│   │   │   └── Settings.jsx
│   │   └── styles/
│   │       └── index.css
│   ├── package.json
│   └── README.md
│
├── telegram-bot/             # Telegram Bot (Node.js)
│   ├── index.js
│   ├── package.json
│   └── README.md
│
└── admin-panel/
    ├── ADMIN_ARCHITECTURE.md
    └── supabase-admin-setup.sql
```

---

## 🚀 Быстрый старт

### Шаг 1: Настройка Supabase

Выполните в Supabase SQL Editor:

```sql
-- Откройте файл и выполните весь скрипт
admin-panel/supabase-admin-setup.sql
```

**Что создаётся:**
- ✅ Поле `role` в profiles
- ✅ Таблица `admin_audit_log`
- ✅ RLS политики для админов
- ✅ Функции для генерации ключей
- ✅ View для статистики

---

### Шаг 2: Назначение администратора

```sql
-- Замените email на ваш!
update profiles 
set role = 'superadmin' 
where email = 'your-email@example.com';
```

---

### Шаг 3: Запуск админ-панели

```bash
cd admin-panel

# Установка зависимостей (уже выполнено)
npm install

# Запуск разработки
npm run dev

# Сборка для production
npm run build
```

**Откроется:** http://localhost:3001

---

### Шаг 4: Настройка Telegram Bot

```bash
cd telegram-bot

# 1. Создайте .env файл
cp .env.example .env

# 2. Отредактируйте .env
# - Вставьте TELEGRAM_BOT_TOKEN от @BotFather
# - Добавьте ваш Chat ID в ADMIN_CHAT_IDS

# 3. Запуск
npm start
```

---

## 🎯 Функционал

### Админ-панель

| Раздел | Функции |
|--------|---------|
| **Dashboard** | Статистика, графики, метрики |
| **Users** | Поиск, фильтрация, изменение ролей, удаление |
| **Licenses** | Генерация (пакетно), список, активация/деактивация |
| **Settings** | Профиль, безопасность, информация |

### Telegram Bot

| Команда | Описание | Доступ |
|---------|----------|--------|
| `/stats` | Статистика системы | Admin |
| `/key <type> [count]` | Генерация ключей | Admin |
| `/user <email>` | Поиск пользователя | Admin |
| `/check <key>` | Проверка ключа | Все |
| `/activate <key>` | Активация ключа | Все |
| `/revoke <key>` | Отозвать ключ | Superadmin |

---

## 🔐 Безопасность

### RLS Политики

Только администраторы могут:
- ✅ Просматривать все профили
- ✅ Обновлять роли
- ✅ Генерировать ключи
- ✅ Просматривать audit log

### Audit Logging

Все действия логируются:
```javascript
await supabase.rpc('log_admin_action', {
  p_action: 'LICENSE_KEYS_GENERATED',
  p_target_type: 'license_keys',
  p_details: { count: 5, type: 'pro' }
});
```

### Telegram Bot

- ✅ Whitelist Chat IDs
- ✅ Проверка админ-прав
- ✅ Логирование команд

---

## 📊 API Functions

### Генерация ключа:
```sql
select generate_license_key('pro', 365);
```

### Пакетная генерация:
```sql
select generate_license_keys_batch(5, 'trial', 14);
```

### Проверка админа:
```sql
select is_admin();
```

### Статистика:
```sql
select * from admin_stats_overview;
```

---

## 🎨 Скриншоты

### Dashboard
```
┌─────────────────────────────────────────┐
│  📊 Dashboard                           │
├─────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 👥 150  │ │ 🌟 45   │ │ 🎫 500  │   │
│  │ Users   │ │ Pro     │ │ Licenses│   │
│  └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

### Telegram Bot
```
✅ Generated 3 license key(s)

Type: PRO
Duration: 365 days

1. ITOP-PRO-ABCDE-12345-FGHIJ
2. ITOP-PRO-FGHIJ-67890-KLMNO
3. ITOP-PRO-KLMNO-11111-PQRST
```

---

## 🚀 Деплой

### Admin Panel - Vercel

```bash
npm run deploy
```

### Telegram Bot - Heroku

```bash
heroku create itop-bot
heroku config:set TELEGRAM_BOT_TOKEN=...
git push heroku main
```

### Telegram Bot - VPS (PM2)

```bash
pm2 start telegram-bot/index.js --name itop-bot
pm2 startup
pm2 save
```

---

## 📋 Чеклист развёртывания

- [ ] Supabase проект настроен
- [ ] SQL скрипт выполнен
- [ ] Первый администратор назначен
- [ ] Admin Panel запущена
- [ ] Telegram Bot создан (@BotFather)
- [ ] .env файл настроен
- [ ] ADMIN_CHAT_IDS заполнен
- [ ] Telegram Bot запущен
- [ ] Тестирование пройдено

---

## 🧪 Тестирование

### 1. Вход в админ-панель

1. Откройте http://localhost:3001
2. Введите email/пароль администратора
3. Проверьте доступ ко всем разделам

### 2. Генерация ключа

1. Перейдите в "Licenses"
2. Выберите тип "Pro"
3. Нажмите "Generate Keys"
4. Скопируйте ключ

### 3. Telegram Bot

1. Откройте бота в Telegram
2. Отправьте `/stats`
3. Отправьте `/key pro`
4. Проверьте ключ через `/check <key>`

---

## 🐛 Troubleshooting

### Ошибка: "Access Denied"

**Причина:** Нет роли admin/superadmin

**Решение:**
```sql
update profiles set role = 'admin' where email = 'your-email@example.com';
```

### Ошибка: "Function not found"

**Причина:** SQL функции не созданы

**Решение:** Выполните `supabase-admin-setup.sql`

### Бот не отвечает

**Причина:** Неверный токен или не запущен

**Решение:**
```bash
# Проверьте .env
cat .env

# Перезапустите
npm start
```

---

## 📚 Документация

| Файл | Описание |
|------|----------|
| `ADMIN_ARCHITECTURE.md` | Архитектура системы |
| `admin-panel/README.md` | Админ-панель |
| `telegram-bot/README.md` | Telegram Bot |
| `supabase-admin-setup.sql` | SQL скрипт |

---

## 🎯 Следующие шаги

1. ✅ Настроить Supabase
2. ✅ Запустить админ-панель
3. ✅ Настроить Telegram Bot
4. ⏳ Протестировать функционал
5. ⏳ Развернуть на production

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли
2. Проверьте Supabase Dashboard
3. Проверьте .env файл

---

**Версия:** 1.0.0  
**Дата:** 11 марта 2026 г.  
**Статус:** ✅ Готово к использованию
