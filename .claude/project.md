# Проект iTop Easy Desktop Clone

## Обзор

Клон десктоп-организатора iTop Easy Desktop для Windows.

## Технологии

- **Desktop:** Electron 28 + vanilla JS
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Admin Panel:** React 18 + Vite 5
- **Telegram Bot:** Node.js
- **Email Worker:** Node.js + Nodemailer
- **Marketing:** Astro 5 + Cloudflare

## Структура

```
desktop-app/          # Основное приложение
admin-panel/          # Админ-панель
telegram-bot/         # Telegram бот
email-worker/         # Email воркер
damp-breeze-714d/     # Маркетинг сайт
docs/vault/           # Obsidian vault (ВТОРОЙ МОЗГ)
```

## Obsidian Vault

**ВСЕ заметки, планы, документация хранятся в `docs/vault/`.**

### Структура vault

- `00-Inbox/` — новые заметки
- `01-Projects/` — по подпроектам
- `02-Areas/` — по областям (Dev, Security, Testing, DevOps)
- `03-Resources/` — ссылки и материалы
- `Templates/` — шаблоны
- `Daily/` — ежедневные заметки

### Правила работы с vault

1. При начале задачи — создать/обновить Daily Note
2. При архитектурном решении — записать в `01-Projects/[Component]/`
3. При баге — создать в `02-Areas/Security/` или обновить компонент
4. При завершении задачи — обновить `Status.md`
5. Перед коммитом — сохранить изменения в vault

### Шаблоны

Использовать шаблоны из `Templates/`:
- `daily-note.md` — ежедневная заметка
- `feature-spec.md` — спецификация фичи
- `bug-report.md` — баг-репорт

### Dataview

Использовать Dataview для запросов:
```dataview
TASK WHERE !completed SORT file.name ASC
```
