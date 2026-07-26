# Email Worker - Queue Processor

**Статус:** ✅ 70%

---

## Описание

Фоновый процесс для отправки email уведомлений из очереди в Supabase.

## Как работает

1. Polling таблицы `notification_queue` каждые 30 секунд
2. Извлечение неотправленных уведомлений
3. Отправка через Nodemailer (SendGrid SMTP)
4. Обновление статуса (sent/failed)
5. Retry с exponential backoff при ошибках

## Типы уведомлений

- Welcome email (регистрация)
- Password recovery (восстановление пароля)
- License activated (активация лицензии)
- License expiring (истекающая лицензия)

## Конфигурация (.env)

```
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_key
EMAIL_FROM=noreply@yourdomain.com
```

## Запуск

```bash
cd email-worker
npm install
npm start
```
