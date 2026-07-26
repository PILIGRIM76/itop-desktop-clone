# Проблемы безопасности

**Статус:** ⚠️ Требует исправления

---

## Найденные проблемы

| Проблема | Файл | Критичность |
|----------|------|-------------|
| Supabase URL + anon key хардкожены | `supabase-client.js` | 🔴 Высокая |
| Supabase URL + anon key хардкожены | `admin-panel/src/supabaseClient.js` | 🔴 Высокая |
| 4 admin-ключа хардкожены | `renderer/api-key.js` | 🔴 Высокая |
| Gmail пароль в .env (закоммичен) | `email-worker/.env` | 🔴 Высокая |
| Google OAuth placeholder | `oauth-server.js` | 🟡 Средняя |

## План исправления

1. Создать `.env` файлы для каждого подпроекта
2. Модифицировать код для чтения из окружения
3. Убрать хардкоженные admin-ключи → RBAC через Supabase
4. Ротировать скомпрометированные ключи
5. Обновить `.gitignore`

## Ротация ключей

После переноса ключей:
1. Supabase Dashboard → Settings → API → Rotate anon key
2. Supabase Dashboard → Settings → API → Rotate service key
3. Google Account → Security → App passwords → Delete old
