/**
 * Desktop Window Manager - Устанавливает окна на уровень рабочего стола
 * Использует Windows API для размещения окон ПОД иконками рабочего стола
 */

const { execSync } = require('child_process');
const path = require('path');

// PowerShell скрипт для получения хендла окна и установки Z-order
function getDesktopWindowHandle() {
  try {
    // Ищем окно Progman (Program Manager - рабочий стол)
    const progmanCmd = `powershell -Command "Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class User32 {
          [DllImport(\"user32.dll\")]
          public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
          [DllImport(\"user32.dll\")]
          public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
          [DllImport(\"user32.dll\")]
          public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
          [DllImport(\"user32.dll\")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
      }
\"@; 
      $progman = [User32]::FindWindow(\"Progman\", \"Program Manager\");
      if ($progman -eq [IntPtr]::Zero) {
          # Пробуем найти WorkerW (альтернативное окно рабочего стола)
          $workerw = [IntPtr]::Zero;
          $shell = [User32]::FindWindow(\"Shell_TrayWnd\", $null);
          while ($workerw -eq [IntPtr]::Zero) {
              $workerw = [User32]::FindWindowEx([IntPtr]::Zero, $workerw, \"WorkerW\", $null);
          }
          $workerw.ToInt64();
      } else {
          $progman.ToInt64();
      }"`;
    
    const result = execSync(progmanCmd, { encoding: 'utf8' });
    return parseInt(result.trim());
  } catch (error) {
    console.error('Error getting desktop window handle:', error.message);
    return null;
  }
}

// Установить окно на уровень рабочего стола (ПОД иконки)
function setWindowAsDesktop(hwnd) {
  try {
    const desktopHwnd = getDesktopWindowHandle();
    if (!desktopHwnd) {
      console.log('Could not get desktop window handle');
      return false;
    }

    // PowerShell команда для установки окна
    const cmd = `powershell -Command "Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class User32 {
          [DllImport(\"user32.dll\")]
          public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
          [DllImport(\"user32.dll\")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
          [DllImport(\"user32.dll\")]
          public static extern bool SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
      }
\"@;
      $hwnd = [IntPtr]${hwnd};
      $desktop = [IntPtr]${desktopHwnd};
      
      # Устанавливаем родительское окно - рабочий стол
      [User32]::SetParent($hwnd, $desktop) | Out-Null;
      
      # SWP_NOACTIVATE = 0x0010, SWP_NOMOVE = 0x0002, SWP_NOSIZE = 0x0001
      $flags = 0x0010 -bor 0x0002 -bor 0x0001;
      
      # Устанавливаем позицию - после рабочего стола (под иконками)
      [User32]::SetWindowPos($hwnd, $desktop, 0, 0, 0, 0, $flags) | Out-Null;
      
      # Показываем окно
      [User32]::ShowWindow($hwnd, 5) | Out-Null;  # SW_SHOW = 5
    "`;
    
    execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`Window ${hwnd} set as desktop window`);
    return true;
  } catch (error) {
    console.error('Error setting window as desktop:', error.message);
    return false;
  }
}

// Удалить окно с уровня рабочего стола (сделать обычным окном)
function removeWindowFromDesktop(hwnd) {
  try {
    const cmd = `powershell -Command "Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class User32 {
          [DllImport(\"user32.dll\")]
          public static extern bool SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
      }
\"@;
      $hwnd = [IntPtr]${hwnd};
      # Устанавливаем родителя в NULL (обычное окно)
      [User32]::SetParent($hwnd, [IntPtr]::Zero) | Out-Null;
    "`;
    
    execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`Window ${hwnd} removed from desktop`);
    return true;
  } catch (error) {
    console.error('Error removing window from desktop:', error.message);
    return false;
  }
}

// Альтернативный метод: использование HWND_BOTTOM
function sendWindowToBack(hwnd) {
  try {
    const cmd = `powershell -Command "Add-Type @"
      using System;
      using System.Runtime.InteropServices;
      public class User32 {
          [DllImport(\"user32.dll\")]
          public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
      }
\"@;
      $hwnd = [IntPtr]${hwnd};
      $HWND_BOTTOM = [IntPtr]1;
      $SWP_NOMOVE = 0x0002;
      $SWP_NOSIZE = 0x0001;
      $SWP_NOACTIVATE = 0x0010;
      $flags = $SWP_NOMOVE -bor $SWP_NOSIZE -bor $SWP_NOACTIVATE;
      
      [User32]::SetWindowPos($hwnd, $HWND_BOTTOM, 0, 0, 0, 0, $flags) | Out-Null;
    "`;
    
    execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`Window ${hwnd} sent to back`);
    return true;
  } catch (error) {
    console.error('Error sending window to back:', error.message);
    return false;
  }
}

module.exports = {
  setWindowAsDesktop,
  removeWindowFromDesktop,
  sendWindowToBack,
  getDesktopWindowHandle
};
