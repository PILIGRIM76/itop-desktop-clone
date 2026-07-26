# Исследование: iTop Easy Desktop V4

**Источники:**
- https://www.itopsoftware.com/itop-easy-desktop
- https://www.itopsoftware.com/user-manual/ied/

**Дата:** 26 июля 2026

---

## Ключевые находки

### Полный функционал iTop Easy Desktop V4

#### 1. Boxes (Боксы)
- **Quick Start** — авто-сортировка в умные группы (Документы, Изображения, Приложения, Папки)
- **Customize** — ручная настройка боксов
- 4 способа создания боксов:
  1. Кнопка "+" в панели
  2. Выделение прямоугольником на рабочем столе
  3. Правый клик → iTop Easy Desktop → Create a Box
  4. Выделение иконок → правый клик → Create a Box for these icons
- **Tab Mode** — объединение боксов в табы
- **Folder Portal** — мини-проводник к любой папке
- **Private Box** — парольная защита (PRO, 1 на аккаунт)
- **Double-click to hide** — двойной клик скрывает все боксы
- **New file detection** — красная метка на новых файлах
- **Auto-save layouts** — автосохранение макетов

#### 2. Wallpapers (Обои)
- **Live Wallpapers** — видео обои
- **Static Wallpapers** — статичные обои
- **22,000+ HD обоев** без водяных знаков
- **4/8K видео** поддержка
- **My Wallpapers** — избранное, скачанные, опубликованные, созданные, локальные
- **Playlist** — Single Loop, Shuffle, Order
- **Create Wallpaper** — Particle Effects, Filters, Mouse Effects
- **Apply to Lock Screen** — применение на экран блокировки

#### 3. Personalization (Персонализация) - PRO
- **Themes** — темы оформления, 1-click dark theme
- **Taskbar** — кастомизация панели задач
- **Start Menu** — стили меню Пуск (от классики до новых)
- **Desktop Icons** — смена иконок на Apple/Samsung стили
- **Mouse** — кастомизация курсора

#### 4. Widgets (Виджеты)
- **Schedule** — Google Calendar + Outlook Calendar синхронизация
- **iNotes** — заметки с pin, менеджер заметок
- **Clock** — Dial Clock + Digital Clock
- **Weather** — прогноз погоды
- **Quick Tools** — скриншот и другие инструменты
- **iPomodoro** — таймер 25 минут
- **Chat AI** — AI чат

#### 5. AI Assistant
- **ChatAI** — на основе ChatGPT, без регистрации
- **Search** — быстрый поиск файлов
- **Screenshot** — полный/окно/прокрутка

#### 6. PawPal (НОВОЕ в V4)
- Цифровой питомец (кот)
- Интерактивность: кормить, играть, болтать
- Обычный/тихий режим
- Панель питомца
- Скрыть/показать

---

## Что нужно реализовать в нашем клоне

### P0 - Критичные
1. **Folder Portal** — новый тип бокса
2. **Double-click to hide** — IPC handler
3. **New file detection** — fs.watch + badge
4. **Desktop Icons styles** — пакеты иконок

### P1 - Важные
5. **PawPal** — цифровой питомец
6. **Lock Screen wallpapers** — Windows API
7. **Mouse Effects** — эффекты в Creator

### P2 - Улучшения
8. **Real Taskbar hiding** — WinAPI
9. **Real Cursor replacement** — SetSystemCursor
10. **Wallpaper catalog** — API/CDN
