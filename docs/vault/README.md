# Obsidian Vault - Второй Мозг проекта iTop Easy Desktop Clone

## Как использовать

### Быстрый старт

1. Откройте Obsidian
2. Выберите "Open folder as vault"
3. Укажите папку `docs/vault`
4. Установите рекомендуемые плагины (см. ниже)

### Структура vault

```
docs/vault/
├── 00-Inbox/              # Новые заметки, черновики
├── 01-Projects/           # Проекты (PARA метод)
│   ├── iTop-Desktop-Clone/
│   ├── Desktop-App/
│   ├── Admin-Panel/
│   ├── Telegram-Bot/
│   └── Marketing-Site/
├── 02-Areas/              # Области ответственности
│   ├── Development/
│   ├── Security/
│   ├── Testing/
│   └── DevOps/
├── 03-Resources/          # Полезные ссылки и материалы
├── 04-Archive/            # Архив
├── Templates/             # Шаблоны заметок
└── Daily/                 # Ежедневные заметки
```

## Рекомендуемые плагины

### Установка

1. Откройте Settings → Community plugins
2. Отключите Safe mode
3. Найдите и установите плагины:

| Плагин | Назначение |
|--------|-----------|
| **Dataview** | Запросы к заметкам как к БД |
| **Calendar** | Виджет календаря |
| **Templater** | Продвинутые шаблоны |
| **Obsidian Git** | Git-интеграция vault |
| **Excalidraw** | Диаграммы и схемы |
| **Kanban** | Канбан-доски |
| **Tasks** | Отслеживание задач |
| **Admonition** | Блоки callout |
| **Linter** | Автоформатирование |
| **Mind Map** | Mind map из заголовков |
| **Ollama** | AI локально |

### Плагины уже настроены

Все плагины предустановлены в `.obsidian/plugins/` с конфигурацией.

## Dataview запросы

### Статус всех компонентов

```dataview
TABLE status AS "Статус", progress AS "Прогресс"
FROM "01-Projects"
WHERE status
SORT file.name ASC
```

### Открытые задачи

```dataview
TASK
WHERE !completed
SORT file.name ASC
```

### Заметки за сегодня

```dataview
TABLE file.cday AS "Создано"
FROM "Daily"
WHERE file.cday = date(today)
SORT file.name DESC
```

### Баг-репорты

```datavux
TABLE priority AS "Приоритет", status AS "Статус"
FROM ""
WHERE contains(file.name, "Bug")
SORT priority ASC
```

## Шаблоны

### Daily Note
Ежедневная заметка с задачами и планами.

### Feature Spec
Спецификация новой функции.

### Bug Report
Шаблон баг-репорта.

## Git интеграция

Vault настроен на автокоммит:
- Коммит каждые 30 минут (автоматически)
- Пуш перед backup
- Сообщения коммитов: `vault: update YYYY-MM-DD HH:mm`

## Горячие клавиши

| Комбинация | Действие |
|------------|----------|
| `Ctrl+Shift+D` | Daily Note |
| `Ctrl+Shift+T` | Insert Template |
| `Ctrl+Shift+P` | Git Push |
| `Ctrl+Shift+R` | Refresh Dataview |
| `Ctrl+K` | Insert Link |
| `Ctrl+B` | Toggle Sidebar |

---

**Vault создан:** 26 июля 2026
**Проект:** iTop Easy Desktop Clone
