# Чеклист безопасности

## Статус: ✅ Основные исправления выполнены

---

## Хардкоженные ключи

- [x] Supabase URL перенесён в .env
- [x] Supabase anon key перенесён в .env
- [x] Admin ключи заменены на RBAC
- [x] Gmail пароль удалён из исходников
- [x] .env файлы добавлены в .gitignore
- [ ] Ключи ротированы в Supabase Dashboard (ТРЕБУЕТСЯ)

## .env файлы

- [x] desktop-app/.env создан
- [x] admin-panel/.env создан
- [x] telegram-bot/.env создан
- [x] email-worker/.env очищен от секретов
- [x] .env.example файлы заменены на плейсхолдеры
- [x] .env убран из production build

## Авторизация

- [ ] RLS политики настроены
- [ ] Роли корректно назначены
- [ ] JWT токены валидируются
- [ ] Сессии корректно завершаются

## Данные

- [ ] Пароли не хранятся в открытом виде
- [ ] Приватные данные зашифрованы
- [ ] Бэкапы защищены
- [ ] Логи не содержат секретов

## Сеть

- [ ] HTTPS везде
- [ ] CORS настроен
- [ ] CSP политики настроены
- [ ] Rate limiting применён

---

**Последняя проверка:** 26 июля 2026 08:45
**Следующая проверка:** 2 августа 2026

## Необходимые действия

1. **Ротировать ключи в Supabase Dashboard:**
   - Settings → API → Rotate anon key
   - Settings → API → Rotate service key

2. **Ротировать Gmail app password:**
   - Google Account → Security → App passwords → Delete old

3. **Добавить GitHub Secrets для CI/CD:**
   - VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
   - CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
