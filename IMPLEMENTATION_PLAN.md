# IMPLEMENTATION_PLAN.md — План реализации iTop Easy Desktop Clone

**Дата:** 26 июля 2026  
**Версия:** 2.0  
**Статус:** Готов к выполнению

---

## Решение по архитектуре

**Рекомендация: Keep Supabase (вариант A).**

Причины:
- Supabase уже интегрирован во все 4 подпроекта (desktop-app, admin-panel, telegram-bot, email-worker)
- RLS-политики, RPC-функции, таблицы и схемы уже развернуты
- Миграция на NestJS + Prisma + SQLite потребовала бы полного переписывания бэкенда без выигрыша — SQLite не подходит для многопользовательской системы с авторизацией
- Supabase уже решает auth, DB, realtime, storage — это экономия месяцев работы

---

## Фаза 1: Obsidian Vault + Документация

**Цель:** Настроить «второй мозг» — структурированное хранилище знаний проекта.

### Шаг 1.1: Создание структуры vault

Создать папку `docs/vault/` в корне проекта со структурой:

```
docs/vault/
├── 00-Inbox/                        # Новые заметки, черновики
├── 01-Projects/
│   ├── iTop-Desktop-Clone/
│   │   ├── README.md               # Обзор проекта
│   │   ├── Architecture.md         # Архитектура (5 подпроектов)
│   │   ├── Tech-Stack.md           # Стек технологий
│   │   ├── Status.md               # Текущий статус по фазам
│   │   └── Changelog.md            # Лог изменений
│   ├── Desktop-App/
│   │   ├── Electron-Architecture.md # Main/Preload/Renderer
│   │   ├── Boxes.md                # Боксы — статус, файлы, IPC
│   │   ├── Widgets.md              # Виджеты — типы, конфигурация
│   │   ├── AI-Assistant.md         # AI-ассистент — провайдеры, ключи
│   │   ├── Wallpapers.md           # Обои — live/static/creator
│   │   ├── Personalization.md      # Персонализация — темы, таскбар
│   │   ├── Account-System.md       # Аккаунты — auth, лицензии
│   │   └── Security.md             # Проблемы безопасности
│   ├── Admin-Panel/
│   │   ├── Pages.md                # Dashboard, Users, Licenses, Settings
│   │   └── Supabase-Admin.md       # Админ SQL, RLS, функции
│   ├── Telegram-Bot/
│   │   └── Commands.md             # Команды, доступ, логика
│   ├── Email-Worker/
│   │   └── Queue-Processor.md      # Очередь, retry, SMTP
│   └── Marketing-Site/
│       └── Astro-Setup.md          # Конфигурация, деплой
├── 02-Areas/
│   ├── Development/                # Заметки по разработке
│   ├── Security/                   # Безопасность
│   ├── Testing/                    # Тестирование
│   └── DevOps/                     # CI/CD, деплой
├── 03-Resources/
│   ├── Electron-Links.md           # Полезные ссылки Electron
│   ├── Supabase-Links.md           # Supabase документация
│   └── iTop-Manual-Notes.md        # Заметки по мануалу iTop
├── 04-Archive/                     # Архивные заметки
├── Templates/                      # Шаблоны заметок
│   ├── meeting-note.md
│   ├── bug-report.md
│   └── feature-spec.md
└── Daily/                          # Ежедневные заметки
    └── YYYY-MM-DD.md
```

**Файлы для создания:** ~30+ markdown-файлов в `docs/vault/`

### Шаг 1.2: Настройка Obsidian

Создать файлы конфигурации Obsidian:

| Файл | Назначение |
|------|-----------|
| `docs/vault/.obsidian/app.json` | Основные настройки (тёмная тема, шрифт, поведение) |
| `docs/vault/.obsidian/appearance.json` | Внешний вид (тёмная тема, CSS- тема) |
| `docs/vault/.obsidian/hotkeys.json` | Горячие клавиши |
| `docs/vault/.obsidian/core-plugins.json` | Включённые плагины |
| `docs/vault/.obsidian/community-plugins.json` | Список community-плагинов |

**Рекомендуемые плагины (установить вручную через Obsidian):**

| Плагин | Назначение |
|--------|-----------|
| **Dataview** | Запросы к заметкам как к БД (таблици статуса) |
| **Calendar** | Виджет календаря для ежедневных заметок |
| **Templater** | Продвинутые шаблоны |
| **Git** | Git-интеграция vault (коммиты из Obsidian) |
| **Excalidraw** | Диаграммы архитектуры |
| **Kanban** | Канбан-доски для задач |
| **Tasks** | Отслеживание задач в заметках |
| **Admonition** | Блоки callout (INFO, WARNING, TODO) |
| **Linter** | Автоформатирование markdown |

### Шаг 1.3: Начальное заполнение документации

Перенести и структурировать существующую информацию из:
- `DEVELOPMENT_PLAN.md` → `01-Projects/iTop-Desktop-Clone/Status.md`
- `ADMIN_SYSTEM_GUIDE.md` → `01-Projects/Admin-Panel/Supabase-Admin.md`
- `desktop-app/ACCOUNT_SYSTEM_DESIGN.md` → `01-Projects/Desktop-App/Account-System.md`
- `desktop-app/SUPABASE_SETUP.md` → `03-Resources/Supabase-Links.md`

**Результат фазы 1:** Рабочий Obsidian vault с архитектурной документацией проекта, готовый к использованию как «второй мозг».

---

## Фаза 2: Исправление проблем безопасности

**Цель:** Убрать все хардкоженные ключи из исходного кода, ввести安全管理.

### Критические находки (из exploration)

| Проблема | Файл | Строка |
|----------|------|--------|
| Supabase URL + anon key хардкожены | `desktop-app/supabase-client.js` | 10-11 |
| Supabase URL + anon key хардкожены | `admin-panel/src/supabaseClient.js` | 5-6 |
| 4 admin-ключа хардкожены | `desktop-app/renderer/api-key.js` | 10-19 |
| Gmail SMTP пароль в .env (закоммичен) | `email-worker/.env` | — |
| Google OAuth placeholder | `desktop-app/oauth-server.js` | 14-15 |

### Шаг 2.1: Настройка .env файлов

**Desktop App** — создать `desktop-app/.env`:

```
SUPABASE_URL=https://wwqhsmckvmfquezfsyds.supabase.co
SUPABASE_ANON_KEY=sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm
WEATHER_API_KEY=YOUR_API_KEY_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

Примечание: Desktop App (Electron) не может читать .env напрямую в renderer. Нужно:
1. Читать .env в main.js через `dotenv`
2. Пробрасывать значения через IPC или `process.env` → `contextBridge`
3. Для renderer: передавать через preload.js переменные окружения

**Admin Panel** — создать `admin-panel/.env`:

```
VITE_SUPABASE_URL=https://wwqhsmckvmfquezfsyds.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm
```

(Vite автоматически подставляет `VITE_` префикс в `import.meta.env`)

**Telegram Bot** — создать `telegram-bot/.env` (скопировать из .env.example):

```
TELEGRAM_BOT_TOKEN=your_token_here
SUPABASE_URL=https://wwqhsmckvmfquezfsyds.supabase.co
SUPABASE_ANON_KEY=sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm
ADMIN_CHAT_IDS=your_telegram_id
```

**Email Worker** — проверить что `.env` в `.gitignore` (уже есть).

### Шаг 2.2: Модификация файлов для чтения из окружения

**Файл: `desktop-app/supabase-client.js`**
```javascript
// БЫЛО (хардкод):
const supabaseUrl = 'https://wwqhsmckvmfquezfsyds.supabase.co';
const supabaseKey = 'sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm';

// СТАЛО (из env):
const supabaseUrl = process.env.SUPABASE_URL || 'https://wwqhsmckvmfquezfsyds.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_-ohfdIC9yMQMUzXJ54cKTg_GNDXnNgm';
```

**Файл: `desktop-app/main.js`** — добавить в начало:
```javascript
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
```

**Файл: `desktop-app/renderer/api-key.js`** — убрать хардкоженные ключи:
```javascript
// БЫЛО: 4 хардкоженных ключа
// СТАЛО: ключи проверяются через Supabase (admin-роль в profiles)
// Удалить массив ITOP_ADMIN_KEYS полностью
// Заменить проверку на: user.role === 'admin' из Supabase
```

**Файл: `admin-panel/src/supabaseClient.js`**
```javascript
// БЫЛО:
const supabaseUrl = 'https://...';
const supabaseKey = 'sb_...';

// СТАЛО:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Шаг 2.3: Ротация скомпрометированных ключей

Критически важно — после переноса ключей:
1. **Заменить Supabase anon key** в дашборде Supabase (Settings > API > Anon key → Rotate)
2. **Заменить Supabase service key** (Settings > API > Service role key → Rotate)
3. **Заменить Gmail app password** (Google Account > Security > App passwords → Delete old, create new)
4. **Убрать admin-ключи** из кода и перейти на RBAC через Supabase profiles

### Шаг 2.4: Обновить .gitignore

Добавить в корневой `.gitignore`:

```gitignore
# Secrets
*.env
!.env.example
!.env.template
desktop-app/.env
admin-panel/.env
telegram-bot/.env
email-worker/.env

# Старые архивы (мусор)
*.tar.gz
```

### Шаг 2.5: Удалить скомпрометированные данные из git history

Поскольку ключи уже закоммичены в git, после ротации ключей:
1. Использовать `git filter-repo` или BFG Repo Cleaner для очистки истории
2. Либо принять что ключи были в истории, и полагаться на ротацию

**Результат фазы 2:** Все секреты в .env файлах, код читает из окружения, ключи ротированы.

---

## Фаза 3: Тестирование

**Цель:** Ввести структурированное тестирование — unit, интеграционные, E2E.

### Шаг 3.1: Выбор и настройка фреймворков

| Подпроект | Unit Tests | Интеграционные | E2E |
|-----------|-----------|----------------|-----|
| Desktop App (Electron) | Jest | Jest + Supabase mock | Playwright (Electron) |
| Admin Panel (React) | Vitest | Vitest + MSW | Playwright |
| Telegram Bot | Vitest | Vitest + nock | — |
| Email Worker | Vitest | Vitest + mock SMTP | — |
| Marketing Site (Astro) | — | — | Playwright |

### Шаг 3.2: Конфигурация тестирования для Desktop App

**Файлы для создания:**

| Файл | Назначение |
|------|-----------|
| `desktop-app/jest.config.js` | Конфигурация Jest |
| `desktop-app/package.json` | Добавить скрипты тестов |
| `desktop-app/tests/setup.js` | Глобальные моки (Electron IPC, BrowserWindow) |
| `desktop-app/tests/unit/supabase-client.test.js` | Тесты клиента Supabase |
| `desktop-app/tests/unit/account-manager.test.js` | Тесты менеджера аккаунтов |
| `desktop-app/tests/unit/wallpaper-manager.test.js` | Тесты менеджера обоев |
| `desktop-app/tests/unit/calendar-sync.test.js` | Тесты синхронизации календаря |
| `desktop-app/tests/integration/ipc-handlers.test.js` | Тесты IPC обработчиков |

**Пример jest.config.js:**
```javascript
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'supabase-client.js',
    'account-manager.js',
    'wallpaper-manager.js',
    'calendar-sync.js',
    'ai-client.js',
    '!node_modules/**'
  ]
};
```

### Шаг 3.3: Конфигурация тестирования для Admin Panel

**Файлы для создания:**

| Файл | Назначение |
|------|-----------|
| `admin-panel/vitest.config.js` | Конфигурация Vitest |
| `admin-panel/src/tests/setup.js` | Моки (Supabase client, React Router) |
| `admin-panel/src/tests/unit/Dashboard.test.jsx` | Тесты Dashboard |
| `admin-panel/src/tests/unit/Users.test.jsx` | Тесты Users |
| `admin-panel/src/tests/unit/Licenses.test.jsx` | Тесты Licenses |
| `admin-panel/src/tests/integration/auth.test.jsx` | Тесты авторизации |
| `admin-panel/src/tests/integration/routes.test.jsx` | Тесты маршрутизации |

### Шаг 3.4: Конфигурация тестирования для Telegram Bot

**Файлы для создания:**

| Файл | Назначение |
|------|-----------|
| `telegram-bot/vitest.config.js` | Конфигурация Vitest |
| `telegram-bot/tests/setup.js` | Моки (node-telegram-bot-api, Supabase) |
| `telegram-bot/tests/unit/commands.test.js` | Тесты всех команд (/start, /key, /check и т.д.) |
| `telegram-bot/tests/integration/bot-lifecycle.test.js` | Тесты жизненного цикла бота |

### Шаг 3.5: E2E тесты с Playwright

**Файлы для создания:**

| Файл | Назначение |
|------|-----------|
| `tests/e2e/playwright.config.js` | Конфигурация Playwright |
| `tests/e2e/desktop-app.spec.js` | E2E: запуск Electron, создание бокса, виджет |
| `tests/e2e/admin-panel.spec.js` | E2E: логин, навигация, CRUD лицензий |
| `tests/e2e/fixtures/auth.fixture.js` | Фикстура авторизации |

### Шаг 3.6: Обновить package.json файлы

В каждый подпроект добавить скрипты:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

**Результат фазы 3:** Рабочий набор unit, интеграционных и E2E тестов для всех подпроектов.

---

## Фаза 4: CI/CD Pipeline (GitHub Actions)

**Цель:** Автоматизированная проверка качества кода и деплой.

### Шаг 4.1: Структура `.github/`

```
.github/
├── workflows/
│   ├── ci.yml                    # Основной CI (тесты, линтинг)
│   ├── deploy-admin.yml          # Деплой админки на Vercel
│   ├── deploy-marketing.yml      # Деплой маркетинг-сайта на Cloudflare
│   ├── release-desktop.yml       # Сборка Electron-приложения
│   └── dependency-review.yml     # Проверка зависимостей
├── actions/
│   └── setup-project/
│       └── action.yml            # Композитное действие (установка Node, npm ci)
├── CODEOWNERS                    # Владельцы кода
└── dependabot.yml                # Автоматические обновления зависимостей
```

### Шаг 4.2: Основной CI workflow

**Файл: `.github/workflows/ci.yml`**

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install root dependencies
        run: npm ci
      - name: Lint desktop-app
        run: npm run lint
        working-directory: desktop-app

  test-desktop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: desktop-app/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: desktop-app
      - name: Run tests
        run: npm test
        working-directory: desktop-app
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: desktop-coverage
          path: desktop-app/coverage/

  test-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: admin-panel/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: admin-panel
      - name: Run tests
        run: npm test
        working-directory: admin-panel

  test-bot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: telegram-bot/package-lock.json
      - name: Install dependencies
        run: npm ci
        working-directory: telegram-bot
      - name: Run tests
        run: npm test
        working-directory: telegram-bot

  build-desktop:
    needs: [lint, test-desktop]
    runs-on: windows-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
        working-directory: desktop-app
      - name: Build Electron
        run: npm run build
        working-directory: desktop-app
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: desktop-build
          path: desktop-app/dist/
```

### Шаг 4.3: Деплой workflow для Admin Panel

**Файл: `.github/workflows/deploy-admin.yml`**

```yaml
name: Deploy Admin Panel

on:
  push:
    branches: [main]
    paths:
      - 'admin-panel/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./admin-panel
```

### Шаг 4.4: Деплой workflow для Marketing Site

**Файл: `.github/workflows/deploy-marketing.yml`**

```yaml
name: Deploy Marketing Site

on:
  push:
    branches: [main]
    paths:
      - 'damp-breeze-714d/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install & Build
        run: |
          npm ci
          npm run build
        working-directory: damp-breeze-714d
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
          working-directory: damp-breeze-714d
```

### Шаг 4.5: Dependabot

**Файл: `.github/dependabot.yml`**

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /desktop-app
    schedule:
      interval: weekly
    open-pull-requests-limit: 5
  - package-ecosystem: npm
    directory: /admin-panel
    schedule:
      interval: weekly
  - package-ecosystem: npm
    directory: /telegram-bot
    schedule:
      interval: weekly
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

### Шаг 4.6: Необходимые GitHub Secrets

| Secret | Назначение |
|--------|-----------|
| `VERCEL_TOKEN` | Токен Vercel для деплоя админки |
| `VERCEL_ORG_ID` | ID организации Vercel |
| `VERCEL_PROJECT_ID` | ID проекта Vercel |
| `CLOUDFLARE_API_TOKEN` | Токен Cloudflare для Workers |
| `CLOUDFLARE_ACCOUNT_ID` | ID аккаунта Cloudflare |
| `SUPABASE_URL` | URL Supabase (для E2E тестов в CI) |
| `SUPABASE_ANON_KEY` | Anon key (для E2E тестов в CI) |

**Результат фазы 4:** Полноценный CI/CD — каждый PR проверяется автоматически, деплой при мерже в main.

---

## Фаза 5: Доработка недостающих функций

**Цель:** Закрыть основные gaps между текущим состоянием и полным iTop Easy Desktop.

### Приоритет 1: Start Menu (Приоритет: КРИТИЧНЫЙ)

**Файлы для создания/изменения:**

| Файл | Действие |
|------|---------|
| `desktop-app/renderer/start-menu.html` | **Создать** — HTML структура меню Пуск |
| `desktop-app/renderer/start-menu.js` | **Создать** — логика меню (поиск, приложения, pin, power) |
| `desktop-app/renderer/styles.css` | **Изменить** — добавить стили Start Menu |
| `desktop-app/preload.js` | **Изменить** — добавить IPC для Start Menu |
| `desktop-app/main.js` | **Изменить** — добавить окно Start Menu + IPC обработчики |

**Функционал:**
- Поиск приложений/файлов (Windows Search integration)
- Список установленных программ (чтение из ProgramData/Start Menu)
- Pin/Unpin приложений
- Power options (Sleep, Shutdown, Restart)
- Пользовательская папка
- Live Tiles (опционально)
- Keyboard navigation (стрелки, Enter, Esc)

### Приоритет 2: Taskbar Hiding (Приоритет: ВЫСОКИЙ)

**Файлы для изменения:**

| Файл | Действие |
|------|---------|
| `desktop-app/taskbar-customizer.js` | **Изменить** — заменить overlay на реальное скрытие |
| `desktop-app/native-windows.js` | **Изменить** — добавить WinAPI вызовы |

**Подход:**
- Текущая реализация — визуальная имитация (overlay поверх панели задач)
- Нужно: Использовать `ffi-napi` или `koffi` для вызова WinAPI:
  - `FindWindow("Shell_TrayWnd", "")` → `ShowWindow(hwnd, SW_HIDE)`
  - `FindWindow("Shell_SecondaryTrayWnd", "")` → скрытие вторичных панелей
- Alt: Использовать `windows-tray-hide` npm пакет
- При закрытии приложения — восстанавливать панель задач

**Риски:** Некоторые антивирусы могут ругаться на манипуляции с Shell_TrayWnd. Нужен digital signing.

### Приоритет 3: Lock Screen (Приоритет: ВЫСОКИЙ)

**Файлы для создания:**

| Файл | Действие |
|------|---------|
| `desktop-app/renderer/lock-screen.html` | **Создать** — UI экрана блокировки |
| `desktop-app/renderer/lock-screen.js` | **Создать** — логика (таймер, пароль, обои) |
| `desktop-app/renderer/styles.css` | **Изменить** — стили lock screen |

**Функционал:**
- Полноэкранный блокирующий BrowserWindow (всегда поверх)
- Таймер блокировки (настраиваемый)
- Пароль для разблокировки (из account system)
- Применение обоев на lock screen
- Время, дата, уведомления

### Приоритет 4: Улучшение Account System (Приоритет: СРЕДНИЙ)

**Файлы для изменения:**

| Файл | Действие |
|------|---------|
| `desktop-app/account-manager.js` | **Изменить** — доработать signup/signin flow |
| `desktop-app/renderer/auth.html` | **Изменить** — улучшить UI авторизации |
| `desktop-app/main.js` | **Изменить** — доработать OAuth handlers |

**Доработки:**
- Google OAuth (уже есть placeholder в oauth-server.js)
- Валидация email
- Восстановление пароля
- Профиль пользователя (аватар, настройки)
- Синхронизация настроек через Supabase

### Приоритет 5: Widgets 100% (Приоритет: СРЕДНИЙ)

**Недостающие виджеты (из DEVELOPMENT_PLAN):**

| Виджет | Файлы | Статус |
|--------|-------|--------|
| Pomodoro Timer | `renderer/widget.html` | Частично (есть UI, нет persistence) |
| Quick Notes | `renderer/widget.html` | Частично |
| System Monitor | — | Отсутствует |
| Spotify/Now Playing | — | Отсутствует |

### Приоритет 6: Улучшение Marketing Site (Приоритет: НИЗКИЙ)

Текущий `damp-breeze-714d` — стартовый шаблон Astro. Нужно:
- Переименовать/переструктурировать под iTop branding
- Создать landing page (Features, Screenshots, Download, Pricing)
- Настроить dark theme
- Добавить страницы: Features, Download, Documentation, Blog
- SEO мета-теги, OG tags
- Формы обратной связи

**Результат фазы 5:** Полнофункциональное приложение с Start Menu, Taskbar hiding, Lock Screen и доработанными виджетами.

---

## Фаза 6: Миграция на TypeScript (Опциональная)

**Цель:** Постепенный переход на TypeScript для типобезопасности.

### Подход: Incremental adoption

Не писать всё на TS сразу, а конвертировать по мере изменения файлов.

### Шаг 6.1: Настройка TS для Desktop App

**Файлы для создания/изменения:**

| Файл | Действие |
|------|---------|
| `desktop-app/tsconfig.json` | **Создать** — конфигурация TypeScript |
| `desktop-app/package.json` | **Изменить** — добавить typescript, ts-node |
| `desktop-app/types/electron.d.ts` | **Создать** — типы для Electron API |
| `desktop-app/types/supabase.d.ts` | **Создать** — типы для Supabase |
| `desktop-app/types/ipc.d.ts` | **Создать** — типы для IPC каналов |

**Пример tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Шаг 6.2: Конвертация приоритетных файлов

Порядок конвертации (от простых к сложным):

1. `types/*.d.ts` — определение типов (создать новые)
2. `supabase-client.js` → `supabase-client.ts` — простой файл
3. `account-manager.js` → `account-manager.ts` — средняя сложность
4. `ai-config.js` → `ai-config.ts` — средняя сложность
5. `weather-config.js` → `weather-config.ts` — простой файл
6. `wallpaper-manager.js` → `wallpaper-manager.ts` — сложный
7. `main.js` → `main.ts` — самый сложный (~1800 строк)
8. `preload.js` → `preload.ts` — средняя сложность
9. `renderer/app.js` → `renderer/app.ts` — самый большой (~6000 строк, делать последним)

### Шаг 6.3: TS для Admin Panel

Файл: `admin-panel/tsconfig.json` —启用 React JSX + TypeScript:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src"]
}
```

Конвертировать `.jsx` → `.tsx` по мере правок.

**Результат фазы 6:** Ключевые модули на TypeScript, типизированные IPC-контракты, меньше runtime-ошибок.

---

## Очистка (параллельно с фазами 1-2)

Удалить мусор из репозитория:

| Удалить | Причина |
|---------|---------|
| `$null` (корень) | Артефакт PowerShell |
| `itop-easy-desktop-clone-source.tar.gz` | Старый архив (есть git) |
| `app/` (пустая папка с node_modules) | Не используется |
| `desktop-app/Z-ORDER-FIX.md` | Дубликат `ZORDER_FIX.md` |
| 17+ дублирующих README в desktop-app/ | Оставить 1 основной, остальные перенести в vault |

---

## Хронология выполнения

| Фаза | Зависимости | Оценка времени | Параллельность |
|------|-------------|---------------|----------------|
| Фаза 1 (Obsidian vault) | Нет | 2-3 часа | Параллельно с фазой 2 |
| Очистка мусора | Нет | 30 минут | Параллельно с фазой 1 |
| Фаза 2 (Безопасность) | Нет | 3-4 часа | Параллельно с фазой 1 |
| Фаза 3 (Тесты) | Фаза 2 (env переменные) | 6-8 часов | После фазы 2 |
| Фаза 4 (CI/CD) | Фаза 3 (тесты) | 3-4 часа | После фазы 3 |
| Фаза 5 (Функции) | Фаза 2 (безопасность) | 20-30 часов | Параллельно с фазами 3-4 |
| Фаза 6 (TypeScript) | Фаза 3 (тесты для валидации) | 15-20 часов | После фазы 3, параллельно с фазами 4-5 |

**Общая оценка:** 50-70 часов чистого времени разработки.

---

## Файлы для создания/изменения (сводка)

### Новые файлы (~60+)
```
docs/vault/                          # ~30 markdown файлов
.github/workflows/ci.yml
.github/workflows/deploy-admin.yml
.github/workflows/deploy-marketing.yml
.github/workflows/release-desktop.yml
.github/dependabot.yml
.github/CODEOWNERS
desktop-app/.env
desktop-app/jest.config.js
desktop-app/tests/setup.js
desktop-app/tests/unit/*.test.js
admin-panel/.env
admin-panel/vitest.config.js
admin-panel/src/tests/setup.js
admin-panel/src/tests/unit/*.test.jsx
telegram-bot/vitest.config.js
telegram-bot/tests/setup.js
telegram-bot/tests/unit/*.test.js
tests/e2e/playwright.config.js
tests/e2e/*.spec.js
desktop-app/renderer/start-menu.html
desktop-app/renderer/start-menu.js
desktop-app/renderer/lock-screen.html
desktop-app/renderer/lock-screen.js
desktop-app/tsconfig.json
desktop-app/types/*.d.ts
admin-panel/tsconfig.json
```

### Изменяемые файлы (~15)
```
.gitignore                           # Добавить .env правила
desktop-app/supabase-client.js       # Убрать хардкод ключей
desktop-app/main.js                  # Добавить dotenv, IPC для Start Menu/Lock Screen
desktop-app/preload.js               # Добавить IPC каналы
desktop-app/renderer/app.js          # Интеграция Start Menu
desktop-app/renderer/api-key.js      # Убрать хардкоженные ключи
desktop-app/renderer/styles.css      # Стили Start Menu, Lock Screen
desktop-app/package.json             # Добавить зависимости, скрипты тестов
admin-panel/src/supabaseClient.js    # Убрать хардкод ключей
admin-panel/package.json             # Добавить зависимости тестов
telegram-bot/package.json            # Добавить зависимости тестов
desktop-app/taskbar-customizer.js    # Реальное скрытие taskbar
desktop-app/native-windows.js        # WinAPI вызовы
```

### Удаляемые файлы (~5)
```
$null
itop-easy-desktop-clone-source.tar.gz
app/                                 # Вся папка
desktop-app/Z-ORDER-FIX.md           # Дубликат
```
