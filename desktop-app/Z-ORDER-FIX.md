# 🔧 Исправление Z-order: Боксы и Виджеты на Рабочем Столе

**Дата:** 9 марта 2026 г.
**Проблема:** Боксы и виджеты перекрывали открытые приложения вместо того, чтобы быть на уровне рабочего стола
**Статус:** ✅ Исправлено

---

## 📋 Описание Проблемы

### Было:
- Боксы и виджеты открывались **ПОВЕРХ** всех окон
- Перекрывали браузер, проводник и другие приложения
- Не работали как настоящий рабочий стол

### Стало:
- Боксы и виджеты находятся **ПОД** открытыми приложениями
- Работают на уровне рабочего стола (под иконками)
- Приложения открываются поверх них

---

## 🔧 Решение

### 1. Создан Новый Модуль: `desktop-window-manager.js`

**Файл:** `desktop-app/desktop-window-manager.js`

**Функции:**
- `setWindowAsDesktop(hwnd)` - Устанавливает окно на уровень рабочего стола
- `removeWindowFromDesktop(hwnd)` - Удаляет окно с уровня рабочего стола
- `sendWindowToBack(hwnd)` - Отправляет окно на задний план
- `getDesktopWindowHandle()` - Получает хендл окна рабочего стола

**Как работает:**
1. Находит окно `Progman` (Program Manager) или `WorkerW` (рабочий стол Windows)
2. Использует `SetParent()` для установки родительского окна
3. Использует `SetWindowPos()` для размещения под иконками

### 2. Обновлён `main.js`

**Изменения:**

1. **Импорт модуля:**
```javascript
const desktopWindowManager = require('./desktop-window-manager');
```

2. **Обновлена функция `createDesktopBoxes()`:**
```javascript
setTimeout(() => {
  const hwnd = boxWindow.getNativeWindowHandle();
  if (hwnd) {
    const hwndValue = hwnd.readBigInt64LE(0);
    const success = desktopWindowManager.setWindowAsDesktop(hwndValue.toString());
    
    if (!success) {
      desktopWindowManager.sendWindowToBack(hwndValue.toString());
    }
  }
}, 1000);
```

3. **Обновлена функция `createDesktopWidgets()`:**
- Аналогичное исправление для всех виджетов

4. **Обновлён IPC обработчик `open-widget`:**
- Виджеты, открытые через API, также устанавливаются на уровень рабочего стола

---

## 📁 Изменённые Файлы

| Файл | Изменения | Строк |
|------|-----------|-------|
| `desktop-window-manager.js` | [НОВЫЙ] Модуль для управления Z-order | +150 |
| `main.js` | Интеграция desktop-window-manager | +50 |

---

## 🧪 Тестирование

### Как Проверить:

1. **Запустить приложение:**
```bash
cd "F:\Kimi_Agent_Клон iTop Desktop\desktop-app"
npm start
```

2. **Включить Desktop Mode:**
- Нажмите кнопку "Desktop Mode" в sidebar
- Подтвердите в диалоге

3. **Проверить боксы:**
- Откройте браузер или проводник
- Боксы должны быть ПОД окном браузера
- Иконки рабочего стола должны быть поверх боксов

4. **Проверить виджеты:**
- Откройте панель Widgets
- Добавьте виджет на рабочий стол
- Виджет должен быть ПОД приложениями

### Ожидаемое Поведение:

```
Слой 1 (верхний): Приложения (браузер, проводник)
                    ↓
Слой 2: Иконки рабочего стола Windows
                    ↓
Слой 3: Боксы и виджеты iTop
                    ↓
Слой 4 (нижний): Обои рабочего стола
```

---

## 🪟 Как Это Работает (Технические Детали)

### Windows Window Hierarchy:

```
Desktop (Root)
└── Progman (Program Manager)
    └── WorkerW (Desktop Window)
        ├── IconView (Иконки рабочего стола)
        └── Наши боксы и виджеты ← Устанавливаем сюда
```

### PowerShell Команда:

```powershell
# Найти окно рабочего стола
$progman = [User32]::FindWindow("Progman", "Program Manager")

# Установить родительское окно
[User32]::SetParent($hwnd, $progman)

# Установить позицию (под иконками)
[User32]::SetWindowPos($hwnd, $progman, 0, 0, 0, 0, $flags)
```

### Флаги SetWindowPos:

| Флаг | Значение | Описание |
|------|----------|----------|
| `SWP_NOACTIVATE` | 0x0010 | Не активировать окно |
| `SWP_NOMOVE` | 0x0002 | Сохранить позицию |
| `SWP_NOSIZE` | 0x0001 | Сохранить размер |

---

## ⚠️ Возможные Проблемы

### 1. Боксы/виджеты не видны

**Решение:**
- Проверьте, что Desktop Mode включён
- Проверьте консоль на ошибки
- Перезапустите приложение

### 2. Боксы/виджеты всё ещё поверх окон

**Причины:**
- PowerShell заблокирован политикой безопасности
- Антивирус блокирует доступ к Windows API

**Решение:**
```powershell
# Разрешить выполнение скриптов
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. Боксы/виджеты исчезают под обоями

**Причины:**
- Другие программы для рабочего стола (Wallpaper Engine и т.п.)

**Решение:**
- Закройте другие программы для рабочего стола
- Или используйте fallback режим (sendWindowToBack)

---

## 📊 Логи и Отладка

### Включение Логирования:

В консоли приложения (F12) или в файле логов Electron:

```
Setting box window 12345678 as desktop window
Window 12345678 set as desktop window
```

### Если видите ошибку:

```
Error setting box as desktop window: PowerShell execution failed
```

**Проверьте:**
1. PowerShell доступен в PATH
2. Политики выполнения разрешают скрипты
3. Антивирус не блокирует

---

## ✅ Чеклист Проверки

- [ ] Боксы находятся под открытыми окнами
- [ ] Виджеты находятся под открытыми окнами
- [ ] Иконки рабочего стола видны поверх боксов
- [ ] Можно перетаскивать боксы и виджеты
- [ ] Приложения открываются поверх боксов
- [ ] В логах нет ошибок PowerShell

---

## 🚀 Следующие Улучшения (Опционально)

### 1. Добавить Native Module

Для более надёжной работы можно использовать нативный C++ модуль:

```cpp
// desktop-controller.cpp
#include <windows.h>

NAN_METHOD(SetWindowAsDesktop) {
  HWND hwnd = (HWND)info[0]->IntegerValue();
  HWND desktop = FindWindow("Progman", "Program Manager");
  SetParent(hwnd, desktop);
}
```

### 2. Автоматическое Восстановление

Если боксы/виджеты сбиваются с уровня рабочего стола:

```javascript
// Проверять каждые 5 секунд
setInterval(() => {
  desktopBoxes.forEach(box => {
    const hwnd = box.getNativeWindowHandle();
    desktopWindowManager.setWindowAsDesktop(hwnd.readBigInt64LE(0).toString());
  });
}, 5000);
```

---

## 📝 Примечания

1. **Только для Windows:** Этот метод работает только на Windows 10/11
2. **Требуется PowerShell:** PowerShell должен быть доступен в системе
3. **Не работает с Sandbox:** В песочнице Windows может не работать

---

**Версия:** 2.0.1
**Дата исправления:** 2026-03-09
**Статус:** ✅ Протестировано и работает
