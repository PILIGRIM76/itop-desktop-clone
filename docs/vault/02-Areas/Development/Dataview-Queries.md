# Dataview Запросы для проекта

## Статус всех подпроектов

```dataview
TABLE status AS "Статус", progress AS "Прогресс"
FROM "01-Projects"
WHERE status
SORT file.name ASC
```

## Критичные задачи

```dataview
TASK
WHERE !completed AND contains(text, "критичн")
SORT file.name ASC
```

## Документация по компонентам

```dataview
TABLE file.folder AS "Папка", file.size AS "Размер"
FROM "01-Projects"
WHERE file.name != "README"
SORT file.folder ASC
```

## Последние изменения

```dataview
TABLE file.mtime AS "Изменено"
SORT file.mtime DESC
LIMIT 10
```

## Баги по приоритету

```dataview
TABLE priority AS "Приоритет", status AS "Статус"
FROM ""
WHERE contains(file.name, "Bug") OR contains(tags, "bug")
SORT priority ASC
```

## Архитектурные заметки

```dataview
TABLE tags AS "Теги"
FROM "02-Areas/Development"
WHERE contains(tags, "architecture")
SORT file.name ASC
```
