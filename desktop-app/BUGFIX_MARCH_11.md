# 🔧 Исправления ошибок - 11 марта 2026

## Ошибка 1: При запуске приложения

### Проблема 1.1: Дублирование IPC обработчика 'take-screenshot'

**Ошибка:**
```
Error: Attempted to register a second handler for 'take-screenshot'
```

**Причина:**
В файле `main.js` было два обработчика для одного IPC события:
- Строка 1341: Обработчик с использованием Electron API (capturePage)
- Строка 1459: Обработчик с использованием PowerShell

**Решение:**
Удалён дублирующийся обработчик (строка 1459), оставлен первый с Electron API.

**Файл:** `main.js`

---

### Проблема 1.2: Неправильное использование ipcMain.handle

**Ошибка:**
```javascript
// Строка 1716 - неверно!
ipcMain.handle('toggle-widget', { sender: mainWindow }, widgetId, !widget.enabled);
```

**Причина:**
В контекстном меню виджета использовался `ipcMain.handle` для вызова, а не для определения обработчика.

**Решение:**
Заменено на прямую логику переключения виджета:

```javascript
click: () => {
  // Тогглируем виджет напрямую
  const widgetData = widgetWindows.get(widgetId);
  if (widgetData) {
    widgetData.window.close();
  } else {
    // Открыть виджет
    const widgetType = widget.id;
    mainWindow.webContents.send('open-widget', widgetType);
  }
}
```

**Файл:** `main.js` (строка 1716)

---

## Ошибка 2: В браузере (renderer)

### Проблема 2.1: Синтаксическая ошибка в app.js

**Ошибка:**
```
app.js:3163 Uncaught SyntaxError: Illegal return statement
```

**Причина:**
При добавлении кода Tab Mode, функция `window.createSnapshot` была разорвана:
- Объявление функции было удалено
- Код функции остался, но без объявления `window.createSnapshot = async () => {`
- Операторы `return` оказались вне функции

**Решение:**
Восстановлено объявление функции:

```javascript
// ========================================
// SNAPSHOT FUNCTIONS (continued)
// ========================================

window.createSnapshot = async () => {
  updateBoxCounts();
  const name = document.getElementById('snapshotName').value.trim();
  // ... остальной код
};
```

**Файл:** `renderer/app.js` (строка 3156)

Также удалён дублирующийся код функции (строки 3212-3217).

---

## Ошибка 3: AI Assistant не работает

### Проблема 3.1: Отсутствуют IPC обработчики AI

**Ошибка:**
```
Error initializing AI Assistant: Error: Error invoking remote method 'get-ai-config': 
Error: No handler registered for 'get-ai-config'
```

**Причина:**
В main.js отсутствовали IPC обработчики для AI функций, хотя модули `ai-client.js` и `ai-config.js` были импортированы.

**Решение:**
Добавлены 8 IPC обработчиков:

```javascript
// AI IPC Handlers
ipcMain.handle('get-ai-config', async () => { ... });
ipcMain.handle('update-ai-config', async (event, updates) => { ... });
ipcMain.handle('set-ai-api-key', async (event, provider, key) => { ... });
ipcMain.handle('get-ai-api-key-status', async (event, provider) => { ... });
ipcMain.handle('chat-with-ai', async (event, provider, message, sessionId, options) => { ... });
ipcMain.handle('analyze-image', async (event, provider, base64Image, prompt) => { ... });
ipcMain.handle('clear-chat-history', async (event, sessionId) => { ... });
ipcMain.handle('get-chat-history', async (event, sessionId) => { ... });
```

**Файл:** `main.js` (строки 2541-2635)

**Особенности реализации:**
- `chat-with-ai` автоматически формирует массив messages с системным промптом
- Добавляется история переписки из conversation history
- Результаты сохраняются в историю для sessionId

---

## ✅ Результат

После исправлений:
- ✅ Приложение запускается без ошибок
- ✅ Все IPC обработчики зарегистрированы корректно
- ✅ Context menu виджетов работает правильно
- ✅ Синтаксические ошибки JavaScript исправлены
- ✅ Функция Snapshot работает корректно
- ✅ AI Assistant полностью функционален

---

## 📝 Примечания

### FFI-napi предупреждение

```
FFI not available, using exec fallback: Cannot find module 'ffi-napi'
```

**Это не ошибка!** Native Windows module использует fallback на exec для некоторых функций.
Основные функции работают корректно.

**Если нужен ffi-napi:**
```bash
npm install ffi-napi
```

Но для работы приложения это **не требуется**.

---

## 🚀 Запуск приложения

```bash
cd "F:\Kimi_Agent_Клон iTop Desktop\desktop-app"
npm start
```

---

**Дата исправления:** 11 марта 2026 г.
**Статус:** ✅ Все исправлено

---

## 🔧 Дополнительное исправление: Z-порядок окон

### Проблема

Боксы и виджеты **перекрывали приложения**, вместо того чтобы быть на уровне рабочего стола (под иконками Windows).

### Решение

Изменён подход к размещению окон в 4 местах файла `main.js`:

**Было:**
```javascript
boxWindow.setAlwaysOnTop(false);
desktopWindowManager.setWindowAsDesktop(hwndValue.toString());  // SetParent - конфликтует!
```

**Стало:**
```javascript
boxWindow.setAlwaysOnTop(false, 'normal');
boxWindow.setSkipTaskbar(true);
desktopWindowManager.sendWindowToBack(hwndValue.toString());  // HWND_BOTTOM - правильно!
```

**Файлы:**
- `main.js` (строки 449, 567, 1237, 1545)
- [`ZORDER_FIX.md`](ZORDER_FIX.md) — полная документация

### Иерархия слоёв

```
Приложения (поверх всего)
    ↓
Иконки рабочего стола Windows
    ↓
Боксы и Виджеты iTop  ← НАШ УРОВЕНЬ
    ↓
Обои рабочего стола
```

**Результат:**
- ✅ Боксы и виджеты видны на рабочем столе
- ✅ Иконки Windows перекрывают боксы и виджеты
- ✅ Приложения перекрывают всё (боксы, виджеты, иконки)
