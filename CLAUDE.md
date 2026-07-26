# CLAUDE.md - Правила для AI агента

## Главное правило: Obsidian как Второй Мозг

**ВСЕ действия, планы, заметки, архитектурные решения и документация ОБЯЗАТЕЛЬНО сохраняются в Obsidian vault (`F:\Obsidian_Vaults\iTop-Easy-Desktop`).**

Это не опционально — это основной способ документирования проекта.

---

## Дополнительные инструкции

- **`.claude/project.md`** — обзор проекта и структура
- **`.claude/instructions.md`** — детальные инструкции по работе с vault
- **`docs/vault/README.md`** — README для Obsidian vault

---

## Структура Obsidian Vault

```
docs/vault/
├── 00-Inbox/              # Новые заметки, черновики, входящие
├── 01-Projects/           # Проекты и компоненты
│   ├── iTop-Desktop-Clone/  # Обзор проекта
│   ├── Desktop-App/         # Документация Desktop приложения
│   ├── Admin-Panel/         # Документация админки
│   ├── Telegram-Bot/        # Документация бота
│   ├── Email-Worker/        # Документация воркера
│   └── Marketing-Site/      # Документация сайта
├── 02-Areas/              # Области ответственности
│   ├── Development/       # Заметки по разработке
│   ├── Security/          # Безопасность
│   ├── Testing/           # Тестирование
│   └── DevOps/            # CI/CD, деплой
├── 03-Resources/          # Полезные ссылки
├── 04-Archive/            # Архив
├── Templates/             # Шаблоны
└── Daily/                 # Ежедневные заметки
```

---

## Когда и что сохранять в Obsidian

### ОБЯЗАТЕЛЬНО сохранять:

1. **При начале работы над задачей:**
   - Файл: `Daily/YYYY-MM-DD.md`
   - Добавить задачу в секцию "Задачи на сегодня"

2. **При архитектурном решении:**
   - Файл: `01-Projects/[Component]/[Feature].md`
   - Описать решение, альтернативы, обоснование

3. **При начале разработки фичи:**
   - Файл: `01-Projects/[Component]/[Feature].md`
   - Статус: `В разработке`
   - Описать что будет сделано

4. **При завершении фичи:**
   - Файл: `01-Projects/[Component]/[Feature].md`
   - Статус: `✅ Готово`
   - Описать что сделано

5. **При найденном баге:**
   - Файл: `02-Areas/Security/Bug-[Name].md` или `Templates/bug-report.md`
   - Или добавить в существующий файл компонента

6. **При изменении статуса проекта:**
   - Файл: `01-Projects/iTop-Desktop-Clone/Status.md`
   - Обновить таблицу прогресса

7. **При добавлении зависимости/инструмента:**
   - Файл: `03-Resources/[Tool]-Links.md`
   - Ссылка + описание

8. **При настройке CI/CD:**
   - Файл: `02-Areas/DevOps/CI-CD-Status.md`
   - Обновить статус workflow

---

## Форматы заметок

### Daily Note
```markdown
# {{date:YYYY-MM-DD}}

## Задачи на сегодня
- [ ] Задача 1
- [ ] Задача 2

## Что сделал
- [x] Выполнено 1

## Заметки
Свободные заметки...

## План на завтра
- Задача 1
```

### Feature Spec
```markdown
# Feature: [Название]

**Статус:** Draft / В разработке / ✅ Готово
**Приоритет:** High / Medium / Low
**Оценка:** X часов

## Описание
[Что делаем]

## Требования
- [ ] Требование 1
- [ ] Требование 2

## Файлы
| Файл | Действие |
|------|----------|
| `path/file.js` | Создать |

## Тесты
- [ ] Unit тесты
- [ ] E2E тесты
```

### Bug Report
```markdown
# Bug: [Название]

**Статус:** Open / Fixed
**Приоритет:** Critical / High / Medium / Low

## Описание
[Что сломалось]

## Steps to Reproduce
1. Шаг 1
2. Шаг 2

## Expected vs Actual
- Expected: [ожидание]
- Actual: [реальность]
```

---

## Dataview запросы (использовать в vault)

### Все задачи
```dataview
TASK
WHERE !completed
SORT file.name ASC
```

### Статус компонентов
```dataview
TABLE status AS "Статус"
FROM "01-Projects"
WHERE status
```

### Последние изменения
```dataview
TABLE file.mtime AS "Изменено"
SORT file.mtime DESC
LIMIT 10
```

---

## Интеграция с Git

Vault подключен к Git через плагин `obsidian-git`:
- Автокоммит каждые 30 минут
- Пуш перед backup
- Сообщения: `vault: update YYYY-MM-DD`

---

## Важные ссылки

- **Obsidian vault:** `docs/vault/`
- **README vault:** `docs/vault/README.md`
- **Dataview запросы:** `docs/vault/02-Areas/Development/Dataview-Queries.md`
- **Чеклист безопасности:** `docs/vault/02-Areas/Security/Security-Checklist.md`
- **CI/CD статус:** `docs/vault/02-Areas/DevOps/CI-CD-Status.md`

---

## Правила поведения

1. **НЕ спрашивать разрешения** на каждое действие — действовать автономно
2. **ВСЕГДА сохранять** в Obsidian перед коммитом кода
3. **Обновлять статус** в `Status.md` при изменении прогресса
4. **Использовать шаблоны** из `Templates/` для новых заметок
5. **Подключать теги** к заметкам для поиска
6. **Связывать заметки** через `[[ссылки]]` Obsidian

---

**Дата создания:** 26 июля 2026
**Проект:** iTop Easy Desktop Clone
