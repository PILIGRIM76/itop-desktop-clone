# iTop Easy Desktop Clone

**Статус:** В разработке  
**Дата начала:** Март 2026  
**Текущая версия:** 1.0.0

---

## Обзор

Клон [iTop Easy Desktop](https://www.itopsoftware.com/user-manual/ied/) — приложение для организации рабочего стола Windows с умными блоками, виджетами, обоями и AI-ассистентом.

## Архитектура

Проект состоит из 5 подпроектов:

| Подпроект | Стек | Описание |
|-----------|------|----------|
| **desktop-app** | Electron 28 + vanilla JS | Основное десктоп-приложение |
| **admin-panel** | React 18 + Vite 5 + Supabase | Админ-панель для управления |
| **telegram-bot** | Node.js + Supabase | Telegram-бот для админ-операций |
| **email-worker** | Node.js + Nodemailer | Фоновая отправка уведомлений |
| **marketing-site** | Astro 5 + Cloudflare | Маркетинговый сайт/блог |

## Бэкенд

Весь бэкенд построен на **Supabase** (PostgreSQL + Auth + RLS):
- Аутентификация пользователей (email/password)
- Row Level Security для изоляции данных
- RPC-функции для генерации лицензий
- Realtime для синхронизации

## Ключевые файлы

- `desktop-app/main.js` — Electron main process (~1800 строк)
- `desktop-app/renderer/app.js` — Renderer logic (~6000 строк)
- `desktop-app/account-manager.js` — Supabase auth integration
- `admin-panel/src/App.jsx` — React routes + auth

## Документация

Вся документация хранится в Obsidian vault (`docs/vault/`):
- Архитектура: `01-Projects/iTop-Desktop-Clone/Architecture.md`
- Статус: `01-Projects/iTop-Desktop-Clone/Status.md`
- Компоненты: `01-Projects/Desktop-App/*.md`

---

**Создано:** 26 июля 2026  
**Автор:** AI Assistant
