# 🔧 Z-Order Исправление - Боксы и Виджеты под иконками

## Проблема

**Боксы и виджеты перекрывали приложения**, вместо того чтобы быть на уровне рабочего стола (под иконками Windows).

---

## Решение

Изменён подход к размещению окон боксов и виджетов:

### Было (неправильно):
```javascript
boxWindow.setAlwaysOnTop(false);
boxWindow.setVisibleOnAllWorkspaces(true);

// Используем setWindowAsDesktop (SetParent)
desktopWindowManager.setWindowAsDesktop(hwndValue.toString());
```

**Проблема:** `setWindowAsDesktop` использует `SetParent`, что может конфликтовать с Electron и вызывать проблемы с отрисовкой.

---

### Стало (правильно):
```javascript
// НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
boxWindow.setAlwaysOnTop(false, 'normal');
boxWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
boxWindow.setSkipTaskbar(true);

// Используем sendWindowToBack (HWND_BOTTOM)
desktopWindowManager.sendWindowToBack(hwndValue.toString());
```

**Преимущества:**
- ✅ `sendWindowToBack` использует `SetWindowPos` с `HWND_BOTTOM`
- ✅ Окно размещается ПОД иконками рабочего стола
- ✅ Не конфликтует с Electron
- ✅ Приложения перекрывают боксы и виджеты

---

## Изменённые файлы

### 1. `main.js`

Изменения в 4 местах создания окон:

#### Боксы (строка 449)
```javascript
// Устанавливаем уровень окна - НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
boxWindow.setAlwaysOnTop(false, 'normal');
boxWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
boxWindow.setSkipTaskbar(true);

// Для Windows: устанавливаем окно на уровень рабочего стола (ПОД иконки)
setTimeout(() => {
  try {
    const hwnd = boxWindow.getNativeWindowHandle();
    if (hwnd) {
      const hwndValue = hwnd.readBigInt64LE(0);
      console.log(`Setting box window ${hwndValue} below desktop icons`);
      
      // Используем sendWindowToBack для размещения ПОД иконками
      const success = desktopWindowManager.sendWindowToBack(hwndValue.toString());
      
      if (!success) {
        console.log(`Fallback: sendWindowToBack failed for box ${box.id}`);
      }
    }
  } catch (e) {
    console.log('Error setting box position:', e.message);
  }
}, 1500);
```

#### Виджеты (createDesktopWidgets) (строка 567)
Аналогичное изменение для виджетов.

#### Виджеты (open-widget IPC) (строка 1237)
Аналогичное изменение для виджетов.

#### Виджеты (toggle-widget) (строка 1545)
Аналогичное изменение для виджетов.

---

## Иерархия Z-порядка (слои)

```
┌─────────────────────────────────┐
│  Приложения (поверх всего)      │  ← Активные окна
├─────────────────────────────────┤
│  Иконки рабочего стола Windows   │  ← Explorer.exe
├─────────────────────────────────┤
│  Боксы и Виджеты iTop           │  ← НАШ УРОВЕНЬ
├─────────────────────────────────┤
│  Обои рабочего стола            │  ← Фон
└─────────────────────────────────┘
```

---

## Проверка работы

### Ожидается:
1. ✅ **Боксы и виджеты видны** на рабочем столе
2. ✅ **Иконки Windows перекрывают** боксы и виджеты
3. ✅ **Приложения перекрывают** всё (боксы, виджеты, иконки)
4. ✅ **Можно перетаскивать** иконки поверх боксов
5. ✅ **Можно взаимодействовать** с боксами и виджетами (клик сквозь иконки)

### Тест:
1. Откройте любое приложение (Браузер, Проводник)
2. Окно приложения должно **полностью перекрыть** боксы и виджеты
3. Сверните приложение — боксы и виджеты снова видны

---

## Технические детали

### desktop-window-manager.js

Функция `sendWindowToBack`:
```javascript
function sendWindowToBack(hwnd) {
  const cmd = `powershell -Command "Add-Type @"
    using System;
    using System.Runtime.InteropServices;
    public class User32 {
        [DllImport(\"user32.dll\")]
        public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    }
  \"@;
    $hwnd = [IntPtr]${hwnd};
    $HWND_BOTTOM = [IntPtr]1;  // Размещаем окно внизу стека
    $SWP_NOMOVE = 0x0002;
    $SWP_NOSIZE = 0x0001;
    $SWP_NOACTIVATE = 0x0010;
    $flags = $SWP_NOMOVE -bor $SWP_NOSIZE -bor $SWP_NOACTIVATE;
    
    [User32]::SetWindowPos($hwnd, $HWND_BOTTOM, 0, 0, 0, 0, $flags) | Out-Null;
  "`;
  
  execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  return true;
}
```

**Ключевые параметры:**
- `HWND_BOTTOM = 1` — размещает окно внизу стека Z-порядка
- `SWP_NOACTIVATE` — не активировать окно
- `SWP_NOMOVE` — не изменять позицию
- `SWP_NOSIZE` — не изменять размер

---

## Примечания

### Задержка 1500ms

Используется задержка `setTimeout(..., 1500)` для надёжности:
- Electron должен полностью инициализировать окно
- Window handle должен стать доступным
- Windows Desktop Window Manager должен обработать окно

**Если задержка слишком мала:**
- Окно может не разместиться правильно
- Может потребоваться увеличение до 2000ms

### Альтернативный подход

Если `sendWindowToBack` не работает на некоторых системах, можно использовать:

```javascript
// Альтернатива: явное указание родителя (WorkerW)
desktopWindowManager.setWindowAsDesktop(hwndValue.toString());
```

Но это может вызвать конфликты с Electron!

---

## Дата исправления

**11 марта 2026 г.**

**Статус:** ✅ Исправлено
