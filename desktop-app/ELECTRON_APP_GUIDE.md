# 🖥️ iTop Easy Desktop Clone - Electron Приложение

## ✅ Реализованные Функции Electron

### 1. IPC Обработчики (main.js → preload.js → renderer.js)

**Управление окном:**
- `minimize-window` - свернуть окно
- `maximize-window` - развернуть/восстановить
- `close-window` - закрыть в трей

**Desktop Mode:**
- `toggle-desktop-mode` - включить/выключить режим рабочего стола
- `get-desktop-mode` - получить статус
- `onDesktopModeChanged` - слушать изменения

**Виджеты:**
- `open-widget` - открыть виджет на рабочем столе
- `close-widget` - закрыть виджет
- `open-widget-settings` - открыть настройки виджета
- `take-screenshot` - сделать скриншот
- `navigate-to-settings` - перейти к настройкам

**Файлы:**
- `get-desktop-files` - получить файлы рабочего стола
- `open-file` - открыть файл
- `select-folder` - выбрать папку

**Боксы:**
- `get-boxes-config` - получить конфигурацию
- `update-boxes-config` - обновить всю конфигурацию
- `update-box-config` - обновить один бокс

---

### 2. Widget Window (виджеты на рабочем столе)

**Характеристики:**
- Frameless окно (без рамки)
- Transparent фон (прозрачный)
- AlwaysOnTop (всегда поверх)
- SkipTaskbar (не в панели задач)
- Resizable (изменение размера)
- Movable (перетаскивание)

**7 Типов виджетов:**
1. Clock - часы с датой
2. Weather - погода
3. Schedule - расписание
4. Notes - заметки
5. Pomodoro - таймер
6. QuickTools - быстрые инструменты
7. ChatAI - AI чат

---

### 3. Box Windows (ящики на рабочем столе)

**Характеристики:**
- Отдельное окно для каждого бокса
- Прозрачный фон
- Перетаскивание
- Изменение размера
- Сохранение позиции

---

### 4. Tray Icon (системный трей)

**Функции:**
- Show App - показать окно
- Toggle Desktop Mode - режим рабочего стола
- Settings - настройки
- Quit - выход

---

## 🚀 Запуск Приложения

```bash
cd "F:\Kimi_Agent_Клон iTop Desktop\desktop-app"
npm start
```

---

## 📁 Структура Файлов

```
desktop-app/
├── main.js              # Main процесс Electron
├── preload.js           # Preload скрипт (API для renderer)
├── package.json         # Зависимости и настройки
├── renderer/
│   ├── index.html       # Главный HTML
│   ├── app.js           # Логика приложения
│   ├── styles.css       # Стили
│   ├── i18n.js          # Локализация
│   ├── api-key.js       # API ключи
│   ├── widget.html      # Виджеты
│   └── box.html         # Боксы
```

---

## 🔧 Отладка Electron

### Консоль Renderer (F12):
```javascript
// Проверка API
window.electronAPI.getDesktopMode()

// Проверка валидации ключа
validateApiKey('ITOP-MASTER-ADMIN-2026-A1B2C3D4')

// Проверка PRO статуса
isProActivated()
```

### Консоль Main (терминал):
- Запуск с `npm start`
- Логи выводятся в терминал
- Для отладки добавьте `console.log()` в main.js

---

## 🎯 Активация PRO

1. Откройте приложение
2. **Sidebar** → **👤 Account**
3. **Ctrl+Shift+A** (5 раз)
4. Введите: `ITOP-MASTER-ADMIN-2026-A1B2C3D4`
5. **Activate PRO**

---

## 🧩 Добавление Виджета

1. **Sidebar** → **🧩 Widgets**
2. Нажмите **➕** на виджете
3. Виджет откроется на рабочем столе
4. Перетащите в нужное место

---

## 🌐 Смена Языка

1. **Sidebar** → **🔧 Settings**
2. Секция **Language**
3. Нажмите **🇷🇺** или **🇬🇧**
4. Перезапустите приложение

---

## 💬 Tooltips (Подсказки)

- Наведите курсор на кнопку
- Через 0.2с появится подсказка
- Работают на всех кнопках

---

## 📝 Примечания

1. **Widget.html** загружается как отдельное окно
2. **Preload.js** предоставляет API для renderer
3. **IPC** связывает main и renderer процессы
4. **LocalStorage** хранит настройки и PRO статус

---

**Версия:** 1.0.1  
**Electron:** v28.0.0  
**Дата:** 2026-03-06
