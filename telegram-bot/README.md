# 🤖 iTop Telegram Bot

**Telegram Bot для управления iTop Easy Desktop Clone**

---

## 🚀 Быстрый старт

### 1. Создание бота

1. Откройте Telegram
2. Найдите **@BotFather**
3. Отправьте `/newbot`
4. Введите имя бота (например: `iTop Admin Bot`)
5. Введите username бота (например: `iTopAdminBot`)
6. Скопируйте токен

### 2. Настройка

Создайте файл `.env`:

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

SUPABASE_URL=https://wwqhsmckvmfquezfsyds.supabase.co
SUPABASE_ANON_KEY=sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm

ADMIN_CHAT_IDS=123456789,987654321
```

**Важно:** Узнайте свой Chat ID через @userinfobot

### 3. Установка зависимостей

```bash
npm install
```

### 4. Запуск

```bash
npm start
```

---

## 📋 Команды

### Администратор:

| Команда | Описание |
|---------|----------|
| `/stats` | Статистика системы |
| `/key <type> [count]` | Генерация ключей |
| `/user <email>` | Поиск пользователя |
| `/check <key>` | Проверка ключа |
| `/revoke <key>` | Отозвать ключ |

### Пользователь:

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие |
| `/check <key>` | Проверка ключа |
| `/activate <key>` | Активация ключа |

---

## 💡 Примеры использования

### Генерация Pro ключа:
```
/key pro
```

### Генерация 5 Trial ключей:
```
/key trial 5
```

### Поиск пользователя:
```
/user test@example.com
```

### Проверка ключа:
```
/check ITOP-PRO-ABCDE-12345-FGHIJ
```

---

## 🔐 Безопасность

### Whitelist администраторов

Только указанные Chat IDs могут использовать админ-команды:

```env
ADMIN_CHAT_IDS=123456789,987654321
```

### Логирование

Все действия администраторов логируются в `admin_audit_log`:

```javascript
await supabase.rpc('log_admin_action', {
  p_action: 'TELEGRAM_KEY_GENERATED',
  p_target_type: 'license_keys',
  p_details: { count: 5, type: 'pro', chat_id: chatId }
});
```

---

## 🎨 Форматирование ответов

### Статистика:
```
📊 iTop System Statistics

👥 Users:
   • Total: 150
   • Pro: 45 🌟
   • Free: 105

🎫 Licenses:
   • Total: 500
   • Used: 123
   • Available: 377

📦 Private Boxes: 89
💾 Snapshots: 234
```

### Генерация ключей:
```
✅ Generated 3 license key(s)

Type: PRO
Duration: 365 days

1. ITOP-PRO-ABCDE-12345-FGHIJ
2. ITOP-PRO-FGHIJ-67890-KLMNO
3. ITOP-PRO-KLMNO-11111-PQRST

Use /check <key> to verify
```

---

## 🐛 Troubleshooting

### Ошибка: "TELEGRAM_BOT_TOKEN not set"

**Решение:** Создайте файл `.env` с вашим токеном

### Ошибка: "Access denied"

**Решение:** Добавьте ваш Chat ID в `ADMIN_CHAT_IDS`

### Ошибка: "Function not found"

**Решение:** Выполните `supabase-admin-setup.sql` в Supabase

---

## 🚀 Деплой

### Heroku:

```bash
# Установите Heroku CLI
heroku create itop-bot

# Добавьте переменные окружения
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set SUPABASE_URL=...
heroku config:set SUPABASE_ANON_KEY=...
heroku config:set ADMIN_CHAT_IDS=...

# Деплой
git push heroku main
```

### VPS (PM2):

```bash
# Установите PM2
npm install -g pm2

# Запуск
pm2 start telegram-bot/index.js --name itop-bot

# Автозапуск
pm2 startup
pm2 save
```

### Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

---

## 📊 Мониторинг

### Проверка статуса:
```bash
pm2 status
```

### Логи:
```bash
pm2 logs itop-bot
```

### Перезапуск:
```bash
pm2 restart itop-bot
```

---

## 🎯 Привязка Telegram к пользователю

Для активации ключей через бота, привяжите Chat ID к профилю:

```sql
update profiles 
set telegram_chat_id = 123456789 
where email = 'your-email@example.com';
```

Или добавьте поле в таблицу:

```sql
alter table profiles 
add column telegram_chat_id bigint;
```

---

## 📚 Документация

- [ADMIN_ARCHITECTURE.md](../admin-panel/ADMIN_ARCHITECTURE.md)
- [../admin-panel/README.md](../admin-panel/README.md)

---

**Версия:** 1.0.0  
**Дата:** 11 марта 2026 г.
