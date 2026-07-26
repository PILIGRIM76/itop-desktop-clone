# Инструкции для AI агента

## Obsidian Vault — Второй Мозг

**ГЛАВНОЕ ПРАВИЛО: ВСЕ документация хранится в `docs/vault/`.**

### Когда писать в vault

| Ситуация | Куда писать |
|----------|-------------|
| Начало задачи | `Daily/YYYY-MM-DD.md` |
| Архитектурное решение | `01-Projects/[Component]/[Feature].md` |
| Начало фичи | `01-Projects/[Component]/[Feature].md` (Статус: В разработке) |
| Конец фичи | `01-Projects/[Component]/[Feature].md` (Статус: ✅ Готово) |
| Найден баг | `02-Areas/Security/Bug-[Name].md` |
| Изменение статуса | `01-Projects/iTop-Desktop-Clone/Status.md` |
| Новая зависимость | `03-Resources/[Tool]-Links.md` |
| Настройка CI/CD | `02-Areas/DevOps/CI-CD-Status.md` |

### Форматы файлов

#### Daily Note
```markdown
# 2026-07-26

## Задачи на сегодня
- [ ] Задача 1

## Что сделал
- [x] Выполнено 1

## Заметки
Текст...

## План на завтра
- Задача 1
```

#### Feature Spec
```markdown
# Feature: Название

**Статус:** Draft / В разработке / ✅ Готово

## Описание
...

## Требования
- [ ] Требование 1

## Файлы
| Файл | Действие |
|------|----------|
| path/file.js | Создать |
```

### Dataview запросы

```dataview
TASK WHERE !completed SORT file.name ASC
```

```dataview
TABLE status AS "Статус" FROM "01-Projects" WHERE status
```

### Связывание

Использовать `[[]]` для связей между заметками:
- `[[01-Projects/Desktop-App/Boxes]]`
- `[[Templates/bug-report]]`

### Теги

Использовать теги для категоризации:
- `#bug` — баги
- `#feature` — фичи
- `#architecture` — архитектура
- `#security` — безопасность
- `#todo` — задачи

---

**ВСЕГДА сохранять изменения в vault перед коммитом кода!**
