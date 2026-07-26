// ========================================
// App List Manager
// Сканирование установленных программ Windows
// ========================================

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Пути к папкам с ярлыками программ
const START_MENU_PATHS = [
  path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
  'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs'
];

// Кэш приложений
let appsCache = null;
let lastScanTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

// Расширения ярлыков
const SHORTCUT_EXTENSIONS = ['.lnk', '.url'];

/**
 * Сканирование папки с ярлыками рекурсивно
 */
async function scanFolder(folderPath, category = '') {
  const apps = [];

  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(folderPath, item.name);

      if (item.isDirectory()) {
        // Рекурсивное сканирование подпапок
        const subCategory = category ? `${category} > ${item.name}` : item.name;
        const subApps = await scanFolder(fullPath, subCategory);
        apps.push(...subApps);
      } else if (item.isFile()) {
        const ext = path.extname(item.name).toLowerCase();

        if (SHORTCUT_EXTENSIONS.includes(ext)) {
          const app = {
            name: path.basename(item.name, ext),
            path: fullPath,
            category: category,
            icon: null,
            isPinned: false,
            lastUsed: null
          };

          // Попытка получить путь назначения из ярлыка
          if (ext === '.lnk') {
            try {
              const target = await getShortcutTarget(fullPath);
              if (target) {
                app.target = target;
              }
            } catch (e) {
              // Игнорируем ошибки чтения ярлыка
            }
          }

          apps.push(app);
        }
      }
    }
  } catch (e) {
    // Папка не существует или нет доступа
  }

  return apps;
}

/**
 * Получение пути назначения из ярлыка (.lnk)
 * Использует PowerShell для чтения WScript.Shell
 */
async function getShortcutTarget(lnkPath) {
  try {
    const psCommand = `$shell = New-Object -ComObject WScript.Shell; $shortcut = $shell.CreateShortcut('${lnkPath.replace(/'/g, "''")}'); $shortcut.TargetPath`;
    const { stdout } = await execAsync(`powershell -Command "${psCommand}"`, { timeout: 5000 });
    return stdout.trim();
  } catch (e) {
    return null;
  }
}

/**
 * Получение всех установленных приложений
 */
async function getAllApps(forceRefresh = false) {
  const now = Date.now();

  // Проверка кэша
  if (!forceRefresh && appsCache && (now - lastScanTime) < CACHE_TTL) {
    return appsCache;
  }

  console.log('Scanning Start Menu folders...');
  const apps = [];

  for (const menuPath of START_MENU_PATHS) {
    try {
      const folderApps = await scanFolder(menuPath);
      apps.push(...folderApps);
    } catch (e) {
      console.warn(`Failed to scan ${menuPath}:`, e.message);
    }
  }

  // Сортировка по имени
  apps.sort((a, b) => a.name.localeCompare(b.name));

  // Удаление дубликатов
  const uniqueApps = [];
  const seenNames = new Set();

  for (const app of apps) {
    const key = app.name.toLowerCase();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      uniqueApps.push(app);
    }
  }

  appsCache = uniqueApps;
  lastScanTime = now;

  console.log(`Found ${uniqueApps.length} applications`);
  return uniqueApps;
}

/**
 * Поиск приложений
 */
async function searchApps(query) {
  if (!query || query.trim() === '') {
    return [];
  }

  const apps = await getAllApps();
  const lowerQuery = query.toLowerCase();

  return apps.filter(app => {
    const nameMatch = app.name.toLowerCase().includes(lowerQuery);
    const categoryMatch = app.category.toLowerCase().includes(lowerQuery);
    return nameMatch || categoryMatch;
  }).slice(0, 20); // Лимит 20 результатов
}

/**
 * Получение закреплённых приложений
 */
async function getPinnedApps() {
  const configPath = getPinnedAppsPath();

  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

/**
 * Сохранение закреплённых приложений
 */
async function savePinnedApps(pinnedApps) {
  const configPath = getPinnedAppsPath();

  try {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(pinnedApps, null, 2));
    return true;
  } catch (e) {
    console.error('Failed to save pinned apps:', e.message);
    return false;
  }
}

/**
 * Закрепить/открепить приложение
 */
async function togglePin(appPath) {
  const pinned = await getPinnedApps();
  const index = pinned.indexOf(appPath);

  if (index === -1) {
    pinned.push(appPath);
  } else {
    pinned.splice(index, 1);
  }

  await savePinnedApps(pinned);
  return index === -1; // true если закреплено, false если откреплено
}

/**
 * Проверка закреплено ли приложение
 */
async function isPinned(appPath) {
  const pinned = await getPinnedApps();
  return pinned.includes(appPath);
}

/**
 * Запуск приложения
 */
async function launchApp(appPath) {
  try {
    const ext = path.extname(appPath).toLowerCase();

    if (ext === '.lnk' || ext === '.url') {
      // Для ярлыков используем start
      await execAsync(`start "" "${appPath}"`, { timeout: 5000 });
    } else {
      // Для exe файлов
      const { spawn } = require('child_process');
      spawn(appPath, [], {
        detached: true,
        stdio: 'ignore'
      }).unref();
    }

    return true;
  } catch (e) {
    console.error('Failed to launch app:', e.message);
    return false;
  }
}

/**
 * Power options
 */
async function powerAction(action) {
  const commands = {
    shutdown: 'shutdown /s /t 0',
    restart: 'shutdown /r /t 0',
    sleep: 'rundll32.exe powrprof.dll,SetSuspendState 0,1,0',
    lock: 'rundll32.exe user32.dll,LockWorkStation',
    signout: 'shutdown /l'
  };

  const command = commands[action];
  if (!command) {
    return false;
  }

  try {
    await execAsync(command, { timeout: 5000 });
    return true;
  } catch (e) {
    console.error(`Power action ${action} failed:`, e.message);
    return false;
  }
}

/**
 * Путь к файлу закреплённых приложений
 */
function getPinnedAppsPath() {
  const configDir = path.join(process.env.USERPROFILE || '', '.itop-desktop-clone');
  return path.join(configDir, 'pinned-apps.json');
}

/**
 * Сброс кэша
 */
function resetCache() {
  appsCache = null;
  lastScanTime = 0;
}

module.exports = {
  getAllApps,
  searchApps,
  getPinnedApps,
  savePinnedApps,
  togglePin,
  isPinned,
  launchApp,
  powerAction,
  resetCache
};
