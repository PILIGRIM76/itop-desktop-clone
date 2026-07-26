# Быстрая шпаргалка

## Структура проекта

```
iTop Easy Desktop Clone/
├── desktop-app/          # Electron приложение
├── admin-panel/          # React админка
├── telegram-bot/         # Telegram бот
├── email-worker/         # Email воркер
├── damp-breeze-714d/     # Маркетинг сайт
├── docs/vault/           # Obsidian vault (этот!)
└── .github/workflows/    # CI/CD
```

## Команды

### Desktop App
```bash
cd desktop-app
npm install          # Установка зависимостей
npm start            # Запуск Electron
npm run build        # Сборка установщика
npm test             # Запуск тестов
```

### Admin Panel
```bash
cd admin-panel
npm install
npm run dev          # Запуск dev сервера (порт 3001)
npm run build        # Сборка для production
```

### Telegram Bot
```bash
cd telegram-bot
npm install
cp .env.example .env # Настроить .env
npm start            # Запуск бота
```

## Горячие клавиши в приложении

| Комбинация | Действие |
|------------|----------|
| `Ctrl+Shift+C` | AI Chat |
| `Ctrl+Shift+S` | Search |
| `Ctrl+Shift+A` | Screenshot |

## Полезные ссылки

- [Electron Docs](https://www.electronjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [iTop Manual](https://www.itopsoftware.com/user-manual/ied/)
