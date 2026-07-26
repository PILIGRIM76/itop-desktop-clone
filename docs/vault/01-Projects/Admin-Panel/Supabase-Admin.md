# Supabase Admin Setup

**Файл:** `admin-panel/supabase-admin-setup.sql`

---

## Что создаётся

1. Поле `role` в таблице `profiles` (user/admin/superadmin)
2. Таблица `admin_audit_log` для логирования действий
3. RLS политики для администраторов
4. Функции:
   - `is_admin()` — проверка роли
   - `generate_license_key()` — генерация ключа
   - `generate_license_keys_batch()` — пакетная генерация
   - `log_admin_action()` — логирование
5. Views для статистики:
   - `admin_stats_overview`
   - `admin_stats_registrations`
   - `admin_stats_license_activations`

## Назначение администратора

```sql
UPDATE profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
```

## Проверка

```sql
SELECT is_admin(); -- true для администратора
SELECT * FROM admin_stats_overview;
```
