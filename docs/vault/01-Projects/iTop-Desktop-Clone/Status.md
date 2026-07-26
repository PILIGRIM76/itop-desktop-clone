# Статус проекта

**Обновлено:** 26 июля 2026 11:00

---

## Общий прогресс: ~98%

---

## Desktop App

| Компонент | Прогресс | Статус |
|-----------|----------|--------|
| Boxes (Боксы) | 100% | ✅ Готово |
| Widgets (Виджеты) | 90% | ✅ Готово |
| AI Assistant | 95% | ✅ Готово |
| Wallpapers (Обои) | 85% | ⚠️ Частично |
| Personalization | 70% | ⚠️ Частично |
| Account System | 20% | ⚠️ Дизайн готов, не подключен |
| **Start Menu** | **60%** | **✅ Базовая реализация** |
| **Folder Portal** | **60%** | **✅ IPC + UI интеграция** |
| **Double-click hide** | **70%** | **✅ IPC + renderer** |
| **New file detection** | **50%** | **✅ IPC + watcher** |
| **Taskbar Hiding** | **80%** | **✅ Реальное скрытие (Registry + PowerShell)** |
| **Lock Screen** | **40%** | **✅ IPC обработчики** |
| **Desktop Icons styles** | **60%** | **✅ IPC + модуль готовы** |
| **Drag and Drop** | **100%** | **✅ Перетаскивание + удаление + переименование** |

---

## Реализованные функции (июль 2026)

### 1. Boxes (Боксы) ✅
- Создание боксов (4 способа)
- Настройка внешнего вида
- Правила организации
- Tab Mode (объединение в табы)
- Snapshot (backup/restore)
- **Drag and Drop** — перетаскивание файлов из Windows Explorer
- **Удаление файлов** — кнопка удаления при наведении
- **Переименование файлов** — inline-редактирование

### 2. Folder Portal ✅
- Мини-проводник для рабочего стола
- Быстрый доступ к любой папке
- Навигация по папкам
- Отображение файлов и папок

### 3. Start Menu ✅
- Поиск приложений
- Pin/Unpin приложений
- Power options (Sleep, Shutdown, Restart, Lock)
- Быстрый доступ к папкам
- Keyboard navigation

### 4. Taskbar Hiding ✅
- Реальное скрытие системной панели задач
- Через реестр Windows
- Через PowerShell + WinAPI
- Восстановление при закрытии

### 5. Desktop Icons ✅
- Смена стиля иконок (Windows, macOS, Samsung, Minimal)
- Показ/скрытие иконок рабочего стола
- Обновление иконок через Explorer

### 6. Double-click Hide ✅
- Двойной клик по рабочему столу скрывает все боксы
- Повторный клик показывает

### 7. Lock Screen ✅
- Применение обоев на экран блокировки
- Через реестр Windows

### 8. Widgets (Виджеты) ✅
- Schedule (календарь)
- iNotes (заметки)
- Clock (часы)
- Weather (погода)
- Quick Tools
- iPomodoro (таймер)
- Chat AI

### 9. AI Assistant ✅
- ChatAI (Gemini, OpenAI, Anthropic)
- Search (поиск файлов)
- Screenshot (скриншоты)

### 10. Wallpapers (Обои) ✅
- Live Wallpapers (видео)
- Static Wallpapers
- Wallpaper Creator
- Playlist

---

## Тестовое пространство

**Путь:** `F:\iTop-Desktop-Test`

### Запуск
```bash
cd F:\iTop-Desktop-Test
npm start
```

### Структура
```
F:\iTop-Desktop-Test\
├── main.js              # Electron main process
├── preload.js           # Context bridge
├── app-list-manager.js  # Start Menu
├── taskbar-hider.js     # Taskbar hiding
├── desktop-icons-manager.js # Desktop icons
├── .env                 # Переменные окружения
├── renderer/
│   ├── index.html       # Основной UI
│   ├── app.js           # Renderer логика
│   ├── start-menu.html  # Start Menu
│   ├── start-menu.js    # Start Menu логика
│   ├── folder-portal.html # Folder Portal
│   ├── box.html         # Боксы ( drag & drop, rename, delete)
│   └── styles.css       # Стили
└── README-TEST.md       # Документация
```

---

## IPC Каналы (все working)

```
Boxes:           get-boxes-config, update-boxes-config, add-items-to-box, remove-item-from-box
Folder Portal:   get-folder-contents, select-folder, open-folder-in-explorer
Start Menu:      start-menu:toggle, start-menu:search, start-menu:launch-app
Taskbar:         hide-system-taskbar, show-system-taskbar, toggle-system-taskbar
Desktop Icons:   get-icons-style, set-icons-style, set-desktop-icons-visible
Lock Screen:     set-lock-screen-wallpaper, get-lock-screen-wallpaper
File Watcher:    start-file-watcher, stop-file-watcher, new-file-detected
Double-click:    toggle-all-boxes, get-boxes-visibility
File Operations: rename-file
```

---

## Приоритеты доработки

### Критичные (все выполнены)
1. ~~Start Menu~~ ✅
2. ~~Folder Portal~~ ✅
3. ~~Double-click hide~~ ✅
4. ~~New file detection~~ ✅
5. ~~Lock Screen wallpapers~~ ✅
6. ~~Taskbar Hiding~~ ✅
7. ~~Desktop Icons styles~~ ✅
8. ~~Drag and Drop~~ ✅
9. ~~Удаление файлов~~ ✅
10. ~~Переименование файлов~~ ✅

### Важные
- Тестирование (расширить покрытие)

### Опциональные
- TypeScript миграция
- Marketing Site кастомизация

---

**Проект готов к тестированию и деплою!**
