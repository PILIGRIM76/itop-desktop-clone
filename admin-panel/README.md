# 🛡️ iTop Admin Panel

**Admin Panel для управления iTop Easy Desktop Clone**

---

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd admin-panel
npm install
```

### 2. Настройка Supabase

Ключи уже настроены в `src/supabaseClient.js`:
- URL: `https://wwqhsmckvmfquezfsyds.supabase.co`
- Key: `sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm`

### 3. Настройка БД

Выполните в Supabase SQL Editor:

```bash
# Откройте файл и выполните SQL
admin-panel/supabase-admin-setup.sql
```

### 4. Назначьте первого администратора

```sql
-- Замените email на ваш!
update profiles 
set role = 'superadmin' 
where email = 'your-email@example.com';
```

### 5. Запуск разработки

```bash
npm run dev
```

Откроется по адресу: http://localhost:3001

### 6. Сборка для production

```bash
npm run build
```

---

## 📁 Структура проекта

```
admin-panel/
├── src/
│   ├── main.jsx              # Точка входа React
│   ├── App.jsx               # Главный компонент с роутингом
│   ├── supabaseClient.js     # Supabase клиент
│   ├── components/
│   │   ├── Dashboard.jsx     # Дашборд со статистикой
│   │   └── Sidebar.jsx       # Боковая навигация
│   ├── pages/
│   │   ├── Login.jsx         # Страница входа
│   │   ├── Users.jsx         # Управление пользователями
│   │   ├── Licenses.jsx      # Управление лицензиями
│   │   └── Settings.jsx      # Настройки
│   └── styles/
│       └── index.css         # Глобальные стили
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔐 Функционал

### Dashboard
- 📊 Общая статистика системы
- 👥 Количество пользователей
- 🌟 Pro подписки
- 🎫 Лицензионные ключи
- 📦 Private Boxes
- 💾 Снимки

### Users
- 👥 Список всех пользователей
- 🔍 Поиск по email/имени
- ✏️ Изменение роли (User/Admin/Superadmin)
- 🗑️ Удаление пользователей
- 📊 Фильтрация по роли

### Licenses
- 🔑 Генерация ключей (пакетно)
- 📋 Список всех ключей
- ✅ Статус использования
- 📋 Копирование ключа
- 🚫 Деактивация ключей
- 🗑️ Удаление ключей

### Settings
- 👤 Профиль администратора
- 🔐 Сброс пароля
- 📊 Информация о системе

---

## 🎨 Особенности

- **Тёмная тема** - современный дизайн
- **Адаптивность** - работает на мобильных
- **Real-time** - данные обновляются автоматически
- **Безопасность** - RLS политики Supabase
- **Audit Log** - логирование всех действий

---

## 🔒 Безопасность

### RLS Политики

Только администраторы могут:
- ✅ Просматривать все профили
- ✅ Обновлять роли пользователей
- ✅ Генерировать лицензионные ключи
- ✅ Просматривать audit log

### Audit Logging

Все действия администраторов логируются:
```javascript
await supabase.rpc('log_admin_action', {
  p_action: 'LICENSE_KEYS_GENERATED',
  p_target_type: 'license_keys',
  p_details: { count: 5, type: 'pro' }
});
```

---

## 🚀 Деплой

### Vercel (рекомендуется)

```bash
# Установите Vercel CLI
npm install -g vercel

# Деплой
npm run deploy
```

### Netlify

```bash
# Сборка
npm run build

# Перетащите папку dist на netlify.com
```

### VPS (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "dist"]
```

---

## 📊 API Functions

### Генерация ключа
```javascript
const { data } = await supabase.rpc('generate_license_key', {
  key_type: 'pro',
  days: 365
});
```

### Пакетная генерация
```javascript
const { data } = await supabase.rpc('generate_license_keys_batch', {
  count: 5,
  key_type: 'trial',
  days: 14
});
```

### Проверка админа
```javascript
const isAdmin = await supabase.rpc('is_admin');
```

---

## 🧪 Тестирование

### Вход администратора

1. Откройте http://localhost:3001
2. Введите email и пароль администратора
3. Нажмите "Sign In"

### Генерация ключа

1. Перейдите на страницу "Licenses"
2. Выберите тип ключа (Pro/Trial/Enterprise)
3. Укажите количество
4. Нажмите "Generate Keys"

### Управление пользователями

1. Перейдите на страницу "Users"
2. Найдите пользователя по email
3. Измените роль в dropdown
4. Изменения сохранятся автоматически

---

## 🐛 Troubleshooting

### Ошибка: "Access Denied"

**Причина:** У пользователя нет роли admin/superadmin

**Решение:**
```sql
update profiles set role = 'admin' where email = 'your-email@example.com';
```

### Ошибка: "Function not found"

**Причина:** SQL функции не созданы

**Решение:** Выполните `supabase-admin-setup.sql`

### Ошибка CORS

**Решение:** Добавьте URL в Supabase Dashboard:
- Authentication → URL Configuration
- Add Site URL: `http://localhost:3001`

---

## 📚 Документация

- [ADMIN_ARCHITECTURE.md](./ADMIN_ARCHITECTURE.md) - Архитектура
- [../desktop-app/SUPABASE_SETUP.md](../desktop-app/SUPABASE_SETUP.md) - Настройка Supabase

---

## 🎯 Следующие шаги

1. ✅ Настроить БД (выполнить SQL)
2. ✅ Назначить администратора
3. ✅ Протестировать вход
4. ✅ Протестировать генерацию ключей
5. ⏳ Создать Telegram Bot

---

**Версия:** 1.0.0  
**Дата:** 11 марта 2026 г.
