# 📧 iTop Email Worker

**Email notification worker для iTop Easy Desktop**

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd email-worker
npm install
```

### 2. Настройка .env

```bash
# Скопируйте .env.example
copy .env.example .env

# Отредактируйте .env и заполните:
# - SUPABASE_SERVICE_KEY
# - SMTP_PASS (SendGrid API key)
# - FROM_EMAIL
```

### 3. Запуск

```bash
# Production
npm start

# Development (auto-reload)
npm run dev
```

---

## 📋 Настройка SMTP

### SendGrid:

1. Создайте аккаунт на https://sendgrid.com
2. Создайте API Key в Settings → API Keys
3. Заполните .env:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=iTop Easy Desktop
```

### Gmail:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=iTop Easy Desktop
```

---

## 📊 Как работает

```
┌─────────────────────────────────────────────────────────────┐
│  License Key Activated (триггер в БД)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  notification_queue (статус: pending)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Worker проверяет каждые 5 минут
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  Email Worker (index.js)                                    │
│  1. Получает pending уведомления                            │
│  2. Отправляет через SMTP                                   │
│  3. Обновляет статус (sent/failed)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Функции

### Обработка очереди:

- ✅ Автоматическая проверка каждые 5 минут
- ✅ До 3 попыток отправки
- ✅ Логирование ошибок
- ✅ Статистика по статусам

### Типы уведомлений:

1. **Активация лицензии** (автоматически)
2. **Истекающая лицензия** (за 7 дней)
3. **Регистрация** (приветственное письмо)

---

## 📝 Тестирование

### Проверка очереди:

```sql
-- Посмотреть pending уведомления
SELECT * FROM notification_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- Посмотреть отправленные
SELECT * FROM notification_queue 
WHERE status = 'sent' 
ORDER BY sent_at DESC 
LIMIT 10;

-- Посмотреть ошибки
SELECT * FROM notification_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Тестовая отправка:

```sql
-- Добавить тестовое уведомление
SELECT queue_notification(
  'test@example.com',
  'Test Email',
  '<h1>Hello from iTop!</h1>',
  now()
);
```

---

## 🐛 Troubleshooting

### Ошибка: "SMTP connection failed"

**Причина:** Неверные SMTP credentials

**Решение:**
```bash
# Проверьте .env
cat .env

# Для SendGrid убедитесь что API key начинается с SG.
```

### Ошибка: "ETIMEDOUT"

**Причина:** Брандмауэр блокирует порт 587

**Решение:**
```bash
# Попробуйте порт 465 (SSL)
SMTP_PORT=465
SMTP_SECURE=true
```

### Уведомления не отправляются

**Проверьте логи:**

```bash
# В worker консоли должны быть:
📧 Processing email queue...
📬 Found X pending notifications
📤 Sending email to...
✅ Email sent: <message-id>
```

**Проверьте очередь:**

```sql
SELECT status, count(*) 
FROM notification_queue 
GROUP BY status;
```

---

## 📊 Мониторинг

### Запуск как сервис (Windows):

```bash
# Установите PM2
npm install -g pm2

# Запустите worker
pm2 start email-worker/index.js --name itop-email

# Автозапуск при старте системы
pm2 startup
pm2 save
```

### Просмотр логов:

```bash
pm2 logs itop-email
```

### Статус:

```bash
pm2 status
```

---

## 🎯 Следующие шаги

1. ✅ Настроить SMTP (SendGrid/Gmail)
2. ✅ Запустить worker
3. ✅ Протестировать активацию ключа
4. ⏳ Добавить уведомления об истечении лицензии

---

**Версия:** 1.0.0  
**Дата:** 11 марта 2026 г.
