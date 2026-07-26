# Account System

**Статус:** ⚠️ 20% (дизайн готов, не подключен)  
**Файлы:** `account-manager.js`, `supabase-client.js`, `renderer/auth.html`

---

## Архитектура

- **Бэкенд:** Supabase (PostgreSQL + Auth)
- **Клиент:** @supabase/supabase-js
- **Аутентификация:** Email/Password

## Таблицы

| Таблица | Описание |
|---------|----------|
| profiles | Профили пользователей |
| private_boxes | Приватные боксы (1 на пользователя) |
| desktop_snapshots | Снимки рабочего стола |
| license_keys | Лицензионные ключи |

## API

- POST `/api/auth/signup` — регистрация
- POST `/api/auth/login` — вход
- POST `/api/auth/activate` — активация Pro
- POST `/api/auth/forgot-password` — восстановление пароля

## Лицензии

Формат: `ITOP-PRO-XXXXX-XXXXX-XXXXX`

## Что нужно доработать

1. Google OAuth интеграция
2. Валидация email
3. Восстановление пароля (отправка email)
4. Профиль пользователя (аватар, настройки)
