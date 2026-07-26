# CI/CD Статус

**Обновлено:** 26 июля 2026 08:45

## Настройка

### GitHub Actions

| Workflow | Статус | Описание |
|----------|--------|----------|
| ci.yml | ✅ Создан | Тесты + линтинг + build |
| deploy-admin.yml | ✅ Создан | Деплой админки на Vercel |
| deploy-marketing.yml | ✅ Создан | Деплой сайта на Cloudflare |
| dependabot.yml | ✅ Создан | Авто-обновления |

### Необходимые Secrets

| Secret | Статус | Описание |
|--------|--------|----------|
| `VERCEL_TOKEN` | ❌ Добавить | Токен Vercel |
| `VERCEL_ORG_ID` | ❌ Добавить | ID организации |
| `VERCEL_PROJECT_ID` | ❌ Добавить | ID проекта |
| `CLOUDFLARE_API_TOKEN` | ❌ Добавить | Токен Cloudflare |
| `CLOUDFLARE_ACCOUNT_ID` | ❌ Добавить | ID аккаунта |

### Активация

1. Перейти в GitHub → Settings → Secrets → Actions
2. Добавить секреты из таблицы выше
3. Workflow запустится автоматически при push

## Деплой

### Admin Panel
- Платформа: Vercel
- Деплой: автоматический при мерже в main

### Marketing Site
- Платформа: Cloudflare Workers
- Деплой: автоматический при мерже в main

### Desktop App
- Сборка: GitHub Actions (Windows runner)
- Артефакты: .exe установщик
