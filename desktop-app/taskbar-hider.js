// ========================================
// Taskbar Hider Module
// Реальное скрытие системной панели задач Windows
// ========================================

const { execSync, exec } = require('child_process');
const os = require('os');

// Состояние
let isHidden = false;
let originalSettings = null;

/**
 * Скрыть панель задач через реестр Windows
 * Автоматическое скрытие панели задач
 */
function hideTaskbarViaRegistry() {
  try {
    // Бинарные данные для auto-hide taskbar
    // Settings byte array: [0x28, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x02, ...]
    // 0x03 = auto-hide enabled, 0x02 = bottom position
    const settingsHex = '280000000300000002000000000000000000000000000000';

    const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3" /v "Settings" /t REG_BINARY /d ${settingsHex} /f`;

    execSync(command, { timeout: 5000 });

    // Перезапуск Explorer для применения изменений
    restartExplorer();

    isHidden = true;
    return { success: true, method: 'registry' };
  } catch (error) {
    console.error('Registry method failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Показать панель задач через реестр
 */
function showTaskbarViaRegistry() {
  try {
    // Settings byte array: [0x28, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x02, ...]
    // 0x02 = auto-hide disabled
    const settingsHex = '280000000200000002000000000000000000000000000000';

    const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\StuckRects3" /v "Settings" /t REG_BINARY /d ${settingsHex} /f`;

    execSync(command, { timeout: 5000 });

    restartExplorer();

    isHidden = false;
    return { success: true, method: 'registry' };
  } catch (error) {
    console.error('Registry show failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Скрыть панель задач через PowerShell + WinAPI
 * Использует FindWindow и ShowWindow
 */
function hideTaskbarViaPowerShell() {
  try {
    const psScript = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        public class TaskbarHelper {
          [DllImport("user32.dll")]
          public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
          [DllImport("user32.dll")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
          [DllImport("user32.dll")]
          public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
          public const int SW_HIDE = 0;
          public const int SW_SHOW = 5;
          public const uint SWP_NOMOVE = 0x0002;
          public const uint SWP_NOSIZE = 0x0001;
          public const uint SWP_NOACTIVATE = 0x0010;
        }
      "@

      # Основная панель задач
      $taskbar = [TaskbarHelper]::FindWindow("Shell_TrayWnd", $null)
      if ($taskbar -ne [IntPtr]::Zero) {
        [TaskbarHelper]::ShowWindow($taskbar, [TaskbarHelper]::SW_HIDE)
      }

      # Вторичная панель задач (на нескольких мониторах)
      $secondaryTaskbar = [TaskbarHelper]::FindWindow("Shell_SecondaryTrayWnd", $null)
      if ($secondaryTaskbar -ne [IntPtr]::Zero) {
        [TaskbarHelper]::ShowWindow($secondaryTaskbar, [TaskbarHelper]::SW_HIDE)
      }

      Write-Output "Taskbar hidden"
    `;

    execSync(`powershell -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ';')}"`, { timeout: 10000 });

    isHidden = true;
    return { success: true, method: 'powershell' };
  } catch (error) {
    console.error('PowerShell method failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Показать панель задач через PowerShell
 */
function showTaskbarViaPowerShell() {
  try {
    const psScript = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        public class TaskbarShowHelper {
          [DllImport("user32.dll")]
          public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
          [DllImport("user32.dll")]
          public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
          public const int SW_SHOW = 5;
        }
      "@

      $taskbar = [TaskbarShowHelper]::FindWindow("Shell_TrayWnd", $null)
      if ($taskbar -ne [IntPtr]::Zero) {
        [TaskbarShowHelper]::ShowWindow($taskbar, [TaskbarShowHelper]::SW_SHOW)
      }

      $secondaryTaskbar = [TaskbarShowHelper]::FindWindow("Shell_SecondaryTrayWnd", $null)
      if ($secondaryTaskbar -ne [IntPtr]::Zero) {
        [TaskbarShowHelper]::ShowWindow($secondaryTaskbar, [TaskbarShowHelper]::SW_SHOW)
      }

      Write-Output "Taskbar shown"
    `;

    execSync(`powershell -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ';')}"`, { timeout: 10000 });

    isHidden = false;
    return { success: true, method: 'powershell' };
  } catch (error) {
    console.error('PowerShell show failed:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Перезапуск Explorer для применения изменений
 */
function restartExplorer() {
  try {
    execSync('taskkill /f /im explorer.exe', { timeout: 5000 });
    // Небольшая задержка перед запуском
    execSync('timeout /t 1 /nobreak > nul', { timeout: 3000 });
    execSync('start explorer.exe', { timeout: 5000 });
  } catch (error) {
    console.error('Explorer restart failed:', error.message);
  }
}

/**
 * Скрыть панель задач (главная функция)
 * Пробует несколько методов
 */
function hideTaskbar() {
  // Метод 1: Реестр (надёжный)
  let result = hideTaskbarViaRegistry();
  if (result.success) return result;

  // Метод 2: PowerShell (если реестр не сработал)
  result = hideTaskbarViaPowerShell();
  if (result.success) return result;

  return { success: false, error: 'All methods failed' };
}

/**
 * Показать панель задач (главная функция)
 */
function showTaskbar() {
  // Метод 1: Реестр
  let result = showTaskbarViaRegistry();
  if (result.success) return result;

  // Метод 2: PowerShell
  result = showTaskbarViaPowerShell();
  if (result.success) return result;

  return { success: false, error: 'All methods failed' };
}

/**
 * Переключить видимость панели задач
 */
function toggleTaskbar() {
  if (isHidden) {
    return showTaskbar();
  } else {
    return hideTaskbar();
  }
}

/**
 * Получить текущее состояние
 */
function getState() {
  return { isHidden };
}

module.exports = {
  hideTaskbar,
  showTaskbar,
  toggleTaskbar,
  getState,
  hideTaskbarViaRegistry,
  showTaskbarViaRegistry,
  hideTaskbarViaPowerShell,
  showTaskbarViaPowerShell
};
