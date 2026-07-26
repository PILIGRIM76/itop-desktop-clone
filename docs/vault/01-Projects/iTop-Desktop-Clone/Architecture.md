# Архитектура iTop Easy Desktop Clone

## Общая схема

```
┌─────────────────────────────────────────────────────────────┐
│              iTop Easy Desktop (Electron)                    │
│              desktop-app/                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │ Main.js  │  │ Preload  │  │   Renderer               │   │
│  │ (Node)   │  │ (Bridge) │  │   (HTML/JS/CSS)          │   │
│  └────┬─────┘  └────┬─────┘  └────────────┬─────────────┘   │
│       │              │                     │                 │
│       └──────────────┼─────────────────────┘                 │
│                      │ IPC                                   │
└──────────────────────┼───────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────────────┐
│                  Supabase Cloud                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐   │
│  │   Auth   │  │ Database │  │   Realtime API           │   │
│  └──────────┘  └──────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Модули Desktop App

### Main Process (main.js)
- Управление окнами (BrowserWindow)
- IPC обработчики (~100+ каналов)
- Жизненный цикл боксов и виджетов
- Правила организации файлов
- Автозапуск при входе в систему

### Preload (preload.js)
- Context Bridge для безопасного IPC
- ~100+ методов в `window.electronAPI`

### Renderer (app.js + index.html)
- Box Management (создание, настройка, правила)
- Widget System (часы, погода, календарь, Pomodoro, заметки)
- AI Assistant (интеграция с Gemini/OpenAI/Anthropic)
- Wallpaper Manager (live/static, плейлисты, создание)
- Personalization (темы, таскбар, курсор)
- Account System (регистрация, вход, лицензии)

## Подпроекты

### Admin Panel
- React SPA с маршрутизацией
- Dashboard со статистикой (Recharts)
- Управление пользователями и лицензиями
- Роль-based доступ (admin/superadmin)

### Telegram Bot
- Команды: /stats, /key, /user, /check, /activate, /revoke
- Whitelist Chat ID для безопасности
- Интеграция с Supabase для данных

### Email Worker
- Polling notification_queue в Supabase
- Отправка через Nodemailer (SendGrid SMTP)
- Retry с exponential backoff

### Marketing Site
- Astro 5 статический сайт
- Деплой на Cloudflare Workers
- Блог с MDX контентом
