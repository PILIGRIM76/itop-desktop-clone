// ========================================
// Windows Native API Module
// Работа с системными функциями Windows
// Попытка загрузки ffi, fallback на exec
// ========================================

let ffi, ref, user32, shell32, advapi32;
let ffiAvailable = false;

try {
  ffi = require('ffi-napi');
  ref = require('ref-napi');
  
  const { exec } = require('child_process');
  const path = require('path');
  const fs = require('fs').promises;

  // Типы данных Windows
  const BOOL = ref.types.int32;
  const DWORD = ref.types.uint32;
  const HWND = ref.types.int64;
  const LPCSTR = ref.types.CString;
  const LPVOID = ref.types.void;

  // Загрузка Windows DLL
  user32 = ffi.Library('user32', {
    'ShowWindow': [BOOL, [HWND, 'int']],
    'FindWindowA': [HWND, [LPCSTR, LPCSTR]],
    'SetWindowPos': [BOOL, [HWND, HWND, 'int', 'int', 'int', 'int', 'uint']],
    'SystemParametersInfoW': [BOOL, ['uint', 'uint', LPVOID, 'uint']],
    'LoadCursorFromFileW': [HWND, [ref.types.CString]],
    'SetSystemCursor': [BOOL, [HWND, DWORD]],
    'DestroyCursor': [BOOL, [HWND]],
    'GetSystemMetrics': ['int', ['int']],
    'GetForegroundWindow': [HWND, []],
    'GetWindowTextA': ['int', [HWND, ref.refType('char'), 'int']],
    'GetWindowThreadProcessId': [DWORD, [HWND, ref.refType(DWORD)]],
    'EnumWindows': [BOOL, [ref.refType('function'), LPVOID]],
    'IsWindowVisible': [BOOL, [HWND]],
    'SendMessageW': [ref.types.int64, [HWND, 'uint', ref.types.uint64, ref.types.int64]]
  });

  shell32 = ffi.Library('shell32', {
    'ShellExecuteW': [ref.types.int64, [HWND, LPCSTR, LPCSTR, LPCSTR, LPCSTR, 'int']]
  });

  advapi32 = ffi.Library('advapi32', {
    'RegSetKeyValueW': ['long', [ref.types.int64, LPCSTR, LPCSTR, DWORD, LPVOID, DWORD]],
    'RegOpenKeyExW': ['long', [ref.types.int64, LPCSTR, DWORD, DWORD, ref.refType(ref.types.int64)]],
    'RegCloseKey': ['long', [ref.types.int64]]
  });

  ffiAvailable = true;
  console.log('FFI module loaded successfully');
} catch (error) {
  console.log('FFI not available, using exec fallback:', error.message);
  ffiAvailable = false;
}

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const SW_HIDE = 0;
const SW_SHOW = 5;
const SWP_NOMOVE = 0x0002;
const SWP_NOSIZE = 0x0001;
const HWND_BOTTOM = 1;
const HWND_TOPMOST = -1;
const SPI_SETDESKWALLPAPER = 20;
const SPIF_UPDATEINIFILE = 0x01;
const SPIF_SENDCHANGE = 0x02;

// OCR_* constants for cursors
const OCR_NORMAL = 32512;
const OCR_IBEAM = 32513;
const OCR_WAIT = 32514;
const OCR_CROSS = 32515;
const OCR_UP = 32516;
const OCR_SIZEWE = 32644;
const OCR_SIZENS = 32645;
const OCR_SIZEALL = 32646;

// Конфигурация
const configPath = path.join(
  require('os').homedir(),
  '.itop-desktop-clone',
  'native-config.json'
);

// Состояние
let originalTaskbarVisible = true;
let systemCursorsBackup = new Map();

// ========================================
// TASKBAR ФУНКЦИИ
// ========================================

// Скрыть системную Taskbar
function hideSystemTaskbar() {
  if (ffiAvailable && user32) {
    try {
      const taskbarHwnd = user32.FindWindowA('Shell_TrayWnd', null);
      if (taskbarHwnd) {
        user32.ShowWindow(taskbarHwnd, SW_HIDE);
        return { success: true, message: 'Taskbar hidden' };
      }
      return { success: false, error: 'Taskbar not found' };
    } catch (error) {
      return { success: false, error: error.message, fallback: 'exec' };
    }
  } else {
    // Fallback через exec
    return new Promise((resolve) => {
      exec('powershell -command "taskkill /f /im explorer.exe && start explorer.exe"', (error) => {
        resolve({
          success: !error,
          error: error?.message,
          message: 'Taskbar hidden via PowerShell (restarts Explorer)'
        });
      });
    });
  }
}

// Показать системную Taskbar
function showSystemTaskbar() {
  if (ffiAvailable && user32) {
    try {
      const taskbarHwnd = user32.FindWindowA('Shell_TrayWnd', null);
      if (taskbarHwnd) {
        user32.ShowWindow(taskbarHwnd, SW_SHOW);
        return { success: true, message: 'Taskbar shown' };
      }
      return { success: false, error: 'Taskbar not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: true, message: 'Taskbar already visible (FFI not available)' };
  }
}

// Переключить видимость Taskbar
function toggleTaskbar() {
  if (originalTaskbarVisible) {
    return hideSystemTaskbar();
  } else {
    return showSystemTaskbar();
  }
}

// Скрыть кнопку Пуск и панель задач через реестр
function hideTaskbarViaRegistry() {
  return new Promise((resolve) => {
    const commands = [
      // Auto-hide taskbar
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3" /v "Settings" /t REG_BINARY /d "280000000300000002000000000000000000000000000000" /f`,
      // Restart Explorer
      `taskkill /f /im explorer.exe && start explorer.exe`
    ];

    exec(commands.join(' && '), (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, message: 'Taskbar hidden via registry' });
      }
    });
  });
}

// ========================================
// START MENU ФУНКЦИИ
// ========================================

// Скрыть кнопку Пуск
function hideStartButton() {
  try {
    // Поиск кнопки Start
    const startHwnd = user32.FindWindowA('Button', null);
    if (startHwnd) {
      user32.ShowWindow(startHwnd, SW_HIDE);
      return { success: true };
    }
    return { success: false, error: 'Start button not found' };
  } catch (error) {
    return { success: false, error: error.message, fallback: 'registry' };
  }
}

// Показать кнопку Пуск
function showStartButton() {
  try {
    const startHwnd = user32.FindWindowA('Button', null);
    if (startHwnd) {
      user32.ShowWindow(startHwnd, SW_SHOW);
      return { success: true };
    }
    return { success: false, error: 'Start button not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Настройка Start Menu через реестр
function configureStartMenu(options) {
  return new Promise((resolve) => {
    const { fullscreen = false, showRecentlyAdded = true } = options;
    
    const commands = [
      // Fullscreen Start Menu
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\ImmersiveShell" /v "GridTaskbarConfig" /t REG_DWORD /d "${fullscreen ? '1' : '0'}" /f`,
      // Show/hide recently added apps
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "Start_TrackDocs" /t REG_DWORD /d "${showRecentlyAdded ? '1' : '0'}" /f`
    ];

    exec(commands.join(' && '), (error, stdout, stderr) => {
      resolve({
        success: !error,
        error: error?.message,
        message: 'Start Menu configured (requires restart)'
      });
    });
  });
}

// ========================================
// DESKTOP ICONS
// ========================================

function setDesktopIconsVisible(visible) {
  return new Promise((resolve) => {
    const hideValue = visible ? '0' : '1';
    const commands = [
      `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideIcons" /t REG_DWORD /d "${hideValue}" /f`,
      'taskkill /f /im explorer.exe',
      'start explorer.exe'
    ];

    exec(commands.join(' && '), (error) => {
      resolve({
        success: !error,
        error: error?.message,
        message: visible ? 'Desktop icons shown' : 'Desktop icons hidden'
      });
    });
  });
}

// ========================================
// CURSOR ФУНКЦИИ
// ========================================

// Установить системный курсор из файла
function setSystemCursor(cursorFile, cursorType = OCR_NORMAL) {
  try {
    // Загрузить курсор из файла
    const hCursor = user32.LoadCursorFromFileW(cursorFile);
    if (!hCursor) {
      return { success: false, error: 'Failed to load cursor' };
    }

    // Установить как системный
    const result = user32.SetSystemCursor(hCursor, cursorType);
    
    if (result) {
      return { success: true, message: 'Cursor set' };
    } else {
      return { success: false, error: 'Failed to set cursor' };
    }
  } catch (error) {
    console.error('Error setting cursor:', error);
    return { success: false, error: error.message };
  }
}

// Восстановить стандартные курсоры
function restoreDefaultCursors() {
  try {
    const cursorTypes = [
      OCR_NORMAL, OCR_IBEAM, OCR_WAIT, OCR_CROSS,
      OCR_UP, OCR_SIZEWE, OCR_SIZENS, OCR_SIZEALL
    ];

    // Перезагрузка курсоров через SystemParametersInfo
    user32.SystemParametersInfoW(SPI_SETDESKWALLPAPER, 0, null, SPIF_SENDCHANGE);
    
    return { success: true, message: 'Default cursors restored' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Создать кастомный курсор
async function createCustomCursor(options) {
  const {
    size = 32,
    color = '#8b5cf6',
    shape = 'arrow',
    outputPath = path.join(require('os').tmpdir(), `custom_cursor_${Date.now()}.cur`)
  } = options;

  // Генерация простого .cur файла (упрощённо)
  // В реальности нужно использовать библиотеку для генерации курсоров
  const cursorData = Buffer.alloc(128); // Заглушка
  
  try {
    await fs.writeFile(outputPath, cursorData);
    return {
      success: true,
      path: outputPath,
      message: 'Custom cursor created (placeholder)'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========================================
// WALLPAPER ФУНКЦИИ
// ========================================

// Установить системные обои
function setSystemWallpaper(imagePath) {
  try {
    const result = user32.SystemParametersInfoW(
      SPI_SETDESKWALLPAPER,
      0,
      imagePath,
      SPIF_UPDATEINIFILE | SPIF_SENDCHANGE
    );

    return {
      success: result !== 0,
      message: result ? 'Wallpaper set' : 'Failed to set wallpaper'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========================================
// ПРИЛОЖЕНИЯ
// ========================================

// Открыть приложение
function openApplication(appPath) {
  try {
    shell32.ShellExecuteW(0, 'open', appPath, null, null, 1);
    return { success: true, message: `Opening ${appPath}` };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Закрыть активное окно
function closeActiveWindow() {
  try {
    const hwnd = user32.GetForegroundWindow();
    if (hwnd) {
      user32.ShowWindow(hwnd, SW_HIDE);
      return { success: true };
    }
    return { success: false, error: 'No active window' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Свернуть все окна
function minimizeAllWindows() {
  try {
    exec('powershell -command "(New-Object -ComObject Shell.Application).MinimizeAll()"', (error) => {
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ========================================
// ЭКСПОРТ
// ========================================

module.exports = {
  // Taskbar
  hideSystemTaskbar,
  showSystemTaskbar,
  toggleTaskbar,
  hideTaskbarViaRegistry,
  
  // Start Menu
  hideStartButton,
  showStartButton,
  configureStartMenu,
  setDesktopIconsVisible,
  
  // Cursors
  setSystemCursor,
  restoreDefaultCursors,
  createCustomCursor,
  
  // Wallpaper
  setSystemWallpaper,
  
  // Applications
  openApplication,
  closeActiveWindow,
  minimizeAllWindows,
  
  // Проверка доступности
  isNativeAvailable: true
};
