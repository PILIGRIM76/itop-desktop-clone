const { app, BrowserWindow, ipcMain, Tray, Menu, shell, screen, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// AI модули
const aiClient = require('./ai-client');
const aiConfig = require('./ai-config');

// Wallpaper модуль
const wallpaperManager = require('./wallpaper-manager');
const wallpaperCreator = require('./wallpaper-creator');

// Calendar модуль
const calendarSync = require('./calendar-sync');

// Taskbar модуль
const taskbarCustomizer = require('./taskbar-customizer');

// Cursor модуль
const cursorCustomizer = require('./cursor-customizer');

// Desktop Window Manager - для установки окон на уровень рабочего стола
const desktopWindowManager = require('./desktop-window-manager');

// Native Windows модуль (опционально, требует компиляции)
let nativeWindows;
try {
  nativeWindows = require('./native-windows');
  console.log('Native Windows module loaded');
} catch (error) {
  console.log('Native Windows module not available, using fallback:', error.message);
  nativeWindows = {
    hideSystemTaskbar: () => ({ success: false, error: 'Module not available' }),
    showSystemTaskbar: () => ({ success: false, error: 'Module not available' }),
    toggleTaskbar: () => ({ success: false, error: 'Module not available' }),
    hideStartButton: () => ({ success: false, error: 'Module not available' }),
    showStartButton: () => ({ success: false, error: 'Module not available' }),
    configureStartMenu: () => ({ success: false, error: 'Module not available' }),
    setSystemCursor: () => ({ success: false, error: 'Module not available' }),
    restoreDefaultCursors: () => ({ success: false, error: 'Module not available' }),
    setSystemWallpaper: () => ({ success: false, error: 'Module not available' }),
    minimizeAllWindows: () => ({ success: false, error: 'Module not available' }),
    isNativeAvailable: false
  };
}

// OAuth Server модуль
const oauthServer = require('./oauth-server');

// Account Manager модуль
const accountManager = require('./account-manager');

let mainWindow;
let tray;
let isDesktopMode = false;
let desktopBoxes = [];
let boxesConfig = []; // Конфигурация боксов
let widgetsConfig = []; // Конфигурация виджетов
let privateBoxConfig = null; // Конфигурация приватного бокса

// Путь к файлу конфигурации
const configPath = path.join(os.homedir(), '.itop-desktop-clone', 'config.json');

// Настройки
const settings = {
  autoStart: true,
  showIcons: true,
  boxesEnabled: true,
  widgetsEnabled: true
};

// Получить конфигурацию боксов по умолчанию
function getDefaultBoxesConfig() {
  return [
    { id: '1', name: 'Programs', icon: 'grid', color: '#8b5cf6', x: 50, y: 50, width: 220, height: 350, items: [], rules: [], layoutMode: 'list' },
    { id: '2', name: 'Folders', icon: 'folder', color: '#3b82f6', x: 290, y: 50, width: 220, height: 350, items: [], rules: [], layoutMode: 'list' },
    { id: '3', name: 'Files & Documents', icon: 'file', color: '#10b981', x: 530, y: 50, width: 220, height: 350, items: [], rules: [], layoutMode: 'list' }
  ];
}

// Нормализовать конфигурацию бокса
function normalizeBoxConfig(box) {
  const normalized = { ...box };
  if (!Array.isArray(normalized.items)) normalized.items = [];
  if (!Array.isArray(normalized.rules)) normalized.rules = [];
  if (!normalized.layoutMode) normalized.layoutMode = 'list';
  if (!normalized.icon) normalized.icon = 'folder';
  if (!normalized.color) normalized.color = '#8b5cf6';
  if (!normalized.name) normalized.name = 'Box';
  return normalized;
}

// Получить конфигурацию виджетов по умолчанию
function getDefaultWidgetsConfig() {
  return [
    { id: 'schedule', name: 'Schedule', enabled: true, x: 100, y: 100, width: 300, height: 400, settings: {} },
    { id: 'inotes', name: 'iNotes', enabled: false, x: 420, y: 100, width: 300, height: 400, settings: {} },
    { id: 'clock', name: 'Clock', enabled: true, x: 740, y: 100, width: 250, height: 200, settings: {} },
    { id: 'weather', name: 'Weather', enabled: false, x: 100, y: 520, width: 280, height: 180, settings: {} },
    { id: 'quick-tools', name: 'Quick Tools', enabled: true, x: 400, y: 520, width: 250, height: 200, settings: {} },
    { id: 'ipomodoro', name: 'iPomodoro', enabled: false, x: 670, y: 520, width: 220, height: 180, settings: {} },
    { id: 'chat-ai', name: 'Chat AI', enabled: true, x: 910, y: 520, width: 300, height: 400, settings: {} }
  ];
}

// Глобальные настройки виджетов по умолчанию
function getDefaultGlobalWidgetSettings() {
  return {
    transparency: 85,          // Прозрачность (0-100)
    scale: 100,                // Масштаб (50-150)
    alwaysOnTop: true,         // Всегда поверх окон
    showInDesktopMode: true,   // Показывать в режиме рабочего стола
    blurEffect: true,          // Эффект размытия фона
    animationEnabled: true,    // Анимации
    globalX: 100,              // Позиция по умолчанию X
    globalY: 100               // Позиция по умолчанию Y
  };
}

// Загрузить конфигурацию из файла
async function loadConfig() {
  try {
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    const configData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    boxesConfig = (config.boxes || getDefaultBoxesConfig()).map(normalizeBoxConfig);

    // Загружаем виджеты с проверкой уникальности
    const loadedWidgets = config.widgets || getDefaultWidgetsConfig();
    
    // Принудительно удаляем ВСЕ дубликаты по id (оставляем только первый вхождение)
    const seenIds = new Set();
    const uniqueWidgets = [];
    for (const widget of loadedWidgets) {
      if (!seenIds.has(widget.id)) {
        seenIds.add(widget.id);
        uniqueWidgets.push(widget);
      } else {
        console.log(`loadConfig: Found duplicate widget ${widget.id}, removing`);
      }
    }
    widgetsConfig = uniqueWidgets;
    
    console.log(`loadConfig: Loaded ${widgetsConfig.length} unique widgets`);
    console.log(`loadConfig: Widget IDs:`, widgetsConfig.map(w => w.id));

    settings.widgetsEnabled = config.settings?.widgetsEnabled ?? true;
    settings.globalWidgetSettings = config.globalWidgetSettings || getDefaultGlobalWidgetSettings();
    privateBoxConfig = config.privateBox || null; // Загружаем приватный бокс

    console.log('Config loaded successfully');
  } catch (error) {
    console.log('No config file found, using defaults');
    boxesConfig = getDefaultBoxesConfig().map(normalizeBoxConfig);
    widgetsConfig = getDefaultWidgetsConfig();
    settings.globalWidgetSettings = getDefaultGlobalWidgetSettings();
    privateBoxConfig = null;
  }
}

// Сохранить конфигурацию в файл
async function saveConfig() {
  try {
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    const config = {
      boxes: boxesConfig,
      widgets: widgetsConfig,
      settings: {
        widgetsEnabled: settings.widgetsEnabled
      },
      globalWidgetSettings: settings.globalWidgetSettings,
      privateBox: privateBoxConfig // Сохраняем приватный бокс
    };

    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    console.log('Config saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// Иконки SVG для боксов
const boxIcons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  settings: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
};

// Создание главного окна
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  // Загружаем интерфейс
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Открываем DevTools для отладки
    mainWindow.webContents.openDevTools();
  });

  // Закрытие окна - сворачиваем в трей
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Создание иконки для трея
function createTrayIcon() {
  // Создаем иконку программно
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Рисуем 4 квадрата
  ctx.fillStyle = '#8b5cf6';
  ctx.fillRect(2, 2, 5, 5);
  
  ctx.fillStyle = '#ec4899';
  ctx.fillRect(9, 2, 5, 5);
  
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(2, 9, 5, 5);
  
  ctx.fillStyle = '#10b981';
  ctx.fillRect(9, 9, 5, 5);
  
  return nativeImage.createFromDataURL(canvas.toDataURL());
}

// Создание иконки в системном трее
function createTray() {
  // Используем SVG иконку
  const trayIconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(trayIconPath);
  } catch (e) {
    // Если иконка не найдена, создаем пустую
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Toggle Desktop Mode',
      click: () => toggleDesktopMode()
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('navigate-to', 'settings');
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('iTop Easy Desktop Clone');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Переключение режима рабочего стола
async function toggleDesktopMode() {
  isDesktopMode = !isDesktopMode;

  if (isDesktopMode) {
    // Определяем текущий язык
    let currentLang = 'en';
    try {
      currentLang = await mainWindow.webContents.executeJavaScript('currentLanguage || localStorage.getItem("preferredLanguage") || "en"');
    } catch (e) {
      currentLang = 'en';
    }

    // Переводы
    const translations = {
      en: {
        title: 'Desktop Mode',
        message: 'Desktop Mode Activated',
        detail: 'To hide Windows desktop icons:\n1. Right-click on desktop\n2. Select View > Show desktop icons (uncheck)\n\nThe app will now stay on top of your desktop.',
        buttons: ['OK', 'Open Settings']
      },
      ru: {
        title: 'Режим рабочего стола',
        message: 'Режим рабочего стола активирован',
        detail: 'Чтобы скрыть иконки рабочего стола Windows:\n1. ПКМ на рабочем столе\n2. Выберите Вид > Отображать иконки рабочего стола (снять галочку)\n\nТеперь приложение будет поверх рабочего стола.',
        buttons: ['OK', 'Открыть настройки']
      }
    };

    const t = translations[currentLang] || translations.en;

    // Показываем диалог с инструкцией
    const result = await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: t.title,
      message: t.message,
      detail: t.detail,
      buttons: t.buttons,
      defaultId: 0
    });

    if (result.response === 1) {
      // Открываем настройки Windows для персонализации
      shell.openExternal('ms-settings:personalization-background');
    }

    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.setVisibleOnAllWorkspaces(true);
    }

    // Создаем окна box'ов
    createDesktopBoxes();
    
    // Создаем виджеты если включены
    if (settings.widgetsEnabled) {
      createDesktopWidgets();
    }
  } else {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setVisibleOnAllWorkspaces(false);
    }

    // Закрываем окна box'ов
    closeDesktopBoxes();
    
    // Закрываем виджеты
    closeDesktopWidgets();
  }

  // Уведомляем рендерер
  if (mainWindow) {
    mainWindow.webContents.send('desktop-mode-changed', isDesktopMode);
  }

  return isDesktopMode;
}

// Окна box'ов на рабочем столе
function createDesktopBoxes() {
  closeDesktopBoxes();

  // Используем сохраненную конфигурацию или дефолтную
  const boxes = boxesConfig.length > 0 ? boxesConfig : getDefaultBoxesConfig();

  let xOffset = 50;
  const yOffset = 50;

  boxes.forEach((box, index) => {
    const boxX = Number.isFinite(box.x) ? box.x : xOffset;
    const boxY = Number.isFinite(box.y) ? box.y : yOffset;
    const boxWidth = box.width || 220;
    const boxHeight = box.height || 350;

    const boxWindow = new BrowserWindow({
      x: boxX,
      y: boxY,
      width: boxWidth,
      height: boxHeight,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: false,
      skipTaskbar: true,
      resizable: true,
      movable: true,
      focusable: false,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Устанавливаем уровень окна - НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
    // Важно: setAlwaysOnTop(false) + sendWindowToBack для размещения ПОД иконками
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

    // Передаем конфигурацию бокса через query параметры
    boxWindow.loadFile(path.join(__dirname, 'renderer', 'box.html'), {
      query: {
        id: box.id,
        name: box.name,
        icon: box.icon || 'folder',
        color: box.color,
        isPortal: box.isPortal ? '1' : '0',
        folderPath: box.folderPath || '',
        layoutMode: box.layoutMode || 'list'
      }
    });

    // Сохраняем позицию для следующего бокса (если нет сохраненных координат)
    if (!Number.isFinite(box.x)) {
      xOffset += 240;
    }

    desktopBoxes.push(boxWindow);
  });
}

function closeDesktopBoxes() {
  desktopBoxes.forEach(box => {
    if (!box.isDestroyed()) {
      box.close();
    }
  });
  desktopBoxes = [];
}

// Создать виджеты на рабочем столе
function createDesktopWidgets() {
  console.log('createDesktopWidgets: Starting...');
  
  // Закрыть все существующие виджеты
  widgetWindows.forEach((widgetData) => {
    if (!widgetData.window.isDestroyed()) {
      widgetData.window.close();
    }
  });
  widgetWindows.clear();

  // Не создавать виджеты если глобально выключены
  if (!settings.widgetsEnabled) {
    console.log('createDesktopWidgets: widgetsEnabled is false, skipping');
    return;
  }

  // Использовать сохраненную конфигурацию или дефолтную
  const widgets = widgetsConfig.length > 0 ? widgetsConfig : getDefaultWidgetsConfig();
  
  console.log('createDesktopWidgets: Total widgets in config:', widgets.length);
  console.log('createDesktopWidgets: Widget IDs:', widgets.map(w => w.id));

  // Создать только включенные виджеты (по одному каждого типа)
  const createdWidgetTypes = new Map(); // Map<widgetType, widgetWindow>

  widgets.forEach(widget => {
    if (widget.enabled) {
      // Проверка: уже создан виджет этого типа?
      if (createdWidgetTypes.has(widget.id)) {
        console.log(`createDesktopWidgets: Widget ${widget.id} already created, skipping duplicate`);
        return; // Пропускаем дубликат
      }

      // Открыть виджет напрямую (не через ipcMain.handle)
      const widgetId = Date.now().toString() + widget.id;

      const widgetWindow = new BrowserWindow({
        x: widget.x || 100,
        y: widget.y || 100,
        width: widget.width || 300,
        height: widget.height || 400,
        minWidth: 200,
        minHeight: 200,
        maxWidth: 500,
        maxHeight: 600,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        alwaysOnTop: false, // Не поверх окон
        skipTaskbar: true,
        resizable: true,
        movable: true,
        hasShadow: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          preload: path.join(__dirname, 'preload.js')
        }
      });

      // Устанавливаем уровень окна - НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
      widgetWindow.setAlwaysOnTop(false, 'normal');
      widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      widgetWindow.setSkipTaskbar(true);

      // Для Windows: устанавливаем окно на уровень рабочего стола (ПОД иконки)
      setTimeout(() => {
        try {
          const hwnd = widgetWindow.getNativeWindowHandle();
          if (hwnd) {
            const hwndValue = hwnd.readBigInt64LE(0);
            console.log(`Setting widget window ${hwndValue} (${widget.id}) below desktop icons`);

            // Используем sendWindowToBack для размещения ПОД иконками
            const success = desktopWindowManager.sendWindowToBack(hwndValue.toString());

            if (!success) {
              console.log(`Fallback: sendWindowToBack failed for widget ${widget.id}`);
            }
          }
        } catch (e) {
          console.log('Error setting widget position:', e.message);
        }
      }, 1500);

      // Map widget id to type
      const widgetTypeMap = {
        'schedule': 'schedule',
        'inotes': 'notes',
        'clock': 'clock',
        'weather': 'weather',
        'quick-tools': 'quickTools',
        'ipomodoro': 'pomodoro',
        'chat-ai': 'chatAI'
      };

      const widgetType = widgetTypeMap[widget.id] || 'clock';

      widgetWindow.loadFile(path.join(__dirname, 'renderer', 'widget.html'), {
        query: { type: widgetType, id: widgetId }
      });

      // Сохраняем ссылку на виджет
      widgetWindows.set(widgetId, { window: widgetWindow, type: widget.id, config: widget });
      
      // Отмечаем тип виджета как созданный
      createdWidgetTypes.set(widget.id, widgetWindow);
      
      console.log(`createDesktopWidgets: Created widget ${widget.id} (${widgetType})`);

      // Обработка перемещения виджета
      let moveTimeout;
      widgetWindow.on('moved', () => {
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
          const [x, y] = widgetWindow.getPosition();
          const [width, height] = widgetWindow.getSize();

          const widgetData = widgetWindows.get(widgetId);
          if (widgetData) {
            widgetData.config.x = x;
            widgetData.config.y = y;
            widgetData.config.width = width;
            widgetData.config.height = height;
            saveConfig();
          }
        }, 500);
      });

      // Обработка изменения размера
      let resizeTimeout;
      widgetWindow.on('resized', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          const [width, height] = widgetWindow.getSize();

          const widgetData = widgetWindows.get(widgetId);
          if (widgetData) {
            widgetData.config.width = width;
            widgetData.config.height = height;
            saveConfig();
          }
        }, 500);
      });

      widgetWindow.on('closed', () => {
        widgetWindows.delete(widgetId);
      });
    }
  });
  
  console.log(`createDesktopWidgets: Created ${createdWidgetTypes.size} desktop widgets`);
  console.log(`createDesktopWidgets: Widget types created:`, Array.from(createdWidgetTypes.keys()));
}

function closeDesktopWidgets() {
  widgetWindows.forEach((widgetData) => {
    if (!widgetData.window.isDestroyed()) {
      widgetData.window.close();
    }
  });
  widgetWindows.clear();
}

// IPC обработчики
ipcMain.handle('toggle-desktop-mode', async () => {
  return await toggleDesktopMode();
});

ipcMain.handle('get-desktop-mode', () => {
  return isDesktopMode;
});

// Загрузка локализации
ipcMain.handle('load-locales', async () => {
  const fs = require('fs').promises;
  const localesPath = path.join(__dirname, 'locales.json');
  try {
    const data = await fs.readFile(localesPath, 'utf-8');
    return data;
  } catch (error) {
    console.error('Error loading locales:', error);
    return '{}';
  }
});

// Обработчик для получения конфигурации боксов
ipcMain.handle('get-boxes-config', () => {
  return boxesConfig.length > 0
    ? boxesConfig.map(normalizeBoxConfig)
    : getDefaultBoxesConfig().map(normalizeBoxConfig);
});

// Обработчик для обновления конфигурации боксов
ipcMain.handle('update-boxes-config', async (event, config) => {
  boxesConfig = (config || []).map(normalizeBoxConfig);
  await saveConfig();
  // Если боксы уже созданы, пересоздаем их с новой конфигурацией
  if (isDesktopMode) {
    createDesktopBoxes();
  }
  // Уведомляем окна боксов об изменениях
  if (desktopBoxes.length > 0) {
    boxesConfig.forEach((box) => {
      desktopBoxes.forEach(boxWindow => {
        if (!boxWindow.isDestroyed()) {
          boxWindow.webContents.send('box-config-updated', box.id, box);
        }
      });
    });
  }
  return true;
});

// Обработчик для обновления отдельного бокса
ipcMain.handle('update-box-config', (event, boxId, updates) => {
  console.log(`update-box-config: boxId=${boxId}, updates=`, updates);
  
  // Находим бокс в конфигурации
  const boxIndex = boxesConfig.findIndex(b => b.id === boxId);
  if (boxIndex !== -1) {
    boxesConfig[boxIndex] = normalizeBoxConfig({ ...boxesConfig[boxIndex], ...updates });
    console.log(`update-box-config: Updated box ${boxId} in config`);
  } else {
    // Если не найден, добавляем новый
    const defaultBox = getDefaultBoxesConfig().find(b => b.id === boxId);
    if (defaultBox) {
      boxesConfig.push(normalizeBoxConfig({ ...defaultBox, ...updates }));
      console.log(`update-box-config: Added new box ${boxId} to config`);
    }
  }

  saveConfig().catch((error) => {
    console.error('Error saving box config:', error);
  });

  // Отправляем уведомление всем окнам боксов об изменении конфигурации
  if (isDesktopMode && desktopBoxes.length > 0) {
    desktopBoxes.forEach(boxWindow => {
      if (!boxWindow.isDestroyed()) {
        boxWindow.webContents.send('box-config-updated', boxId, updates);
      }
    });
    console.log(`update-box-config: Notified ${desktopBoxes.length} box windows`);
  }

  return true;
});

// Обработчик для навигации из box окна
ipcMain.on('navigate-to-settings', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate-to', 'settings');
  }
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.handle('open-file', (event, filePath) => {
  shell.openPath(filePath);
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('get-desktop-files', async () => {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  
  try {
    const files = await fs.readdir(desktopPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(desktopPath, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      })
    );
    return fileDetails;
  } catch (error) {
    console.error('Error reading desktop:', error);
    return [];
  }
});

// Получить список файлов из произвольной папки
async function getFolderFiles(folderPath) {
  try {
    const files = await fs.readdir(folderPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      })
    );
    return fileDetails;
  } catch (error) {
    console.error('Error reading folder:', error);
    return [];
  }
}

async function getFileDetails(filePath) {
  const stats = await fs.stat(filePath);
  return {
    name: path.basename(filePath),
    path: filePath,
    isDirectory: stats.isDirectory(),
    size: stats.size,
    modified: stats.mtime
  };
}

function normalizeItemPath(itemPath) {
  return path.normalize(itemPath || '');
}

function buildWildcardRegex(pattern) {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexPattern = `^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`;
  return new RegExp(regexPattern, 'i');
}

function parseSizePattern(pattern) {
  const trimmed = pattern.trim().toLowerCase();
  const match = trimmed.match(/^(>=|<=|>|<|=)?\s*([\d.]+)\s*(b|kb|mb|gb)?$/i);
  if (!match) return null;
  const op = match[1] || '=';
  const value = parseFloat(match[2]);
  const unit = (match[3] || 'b').toLowerCase();
  const multipliers = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const bytes = value * (multipliers[unit] || 1);
  return { op, bytes };
}

function parseDatePattern(pattern) {
  const trimmed = pattern.trim().toLowerCase();
  const lastMatch = trimmed.match(/^last\s+(\d+)\s+days?$/);
  if (lastMatch) {
    const days = parseInt(lastMatch[1], 10);
    const since = new Date();
    since.setDate(since.getDate() - days);
    return { op: '>=', date: since };
  }
  const compMatch = trimmed.match(/^(>=|<=|>|<|=)?\s*(\d{4}-\d{2}-\d{2})$/);
  if (compMatch) {
    const op = compMatch[1] || '>=';
    const date = new Date(compMatch[2] + 'T00:00:00');
    if (!isNaN(date.getTime())) {
      return { op, date };
    }
  }
  return null;
}

function matchRule(rule, file) {
  if (!rule || !file) return false;
  const type = (rule.type || '').toLowerCase();
  const pattern = (rule.pattern || '').toString().trim();
  if (!pattern) return false;

  if (type === 'extension') {
    const ext = path.extname(file.name || '').toLowerCase().replace('.', '');
    const exts = pattern
      .split(/[,;]+/)
      .map(p => p.trim().toLowerCase().replace('.', ''))
      .filter(Boolean);
    return ext && exts.includes(ext);
  }

  if (type === 'name') {
    if (pattern.includes('*') || pattern.includes('?')) {
      return buildWildcardRegex(pattern).test(file.name || '');
    }
    return (file.name || '').toLowerCase().includes(pattern.toLowerCase());
  }

  if (type === 'size') {
    const parsed = parseSizePattern(pattern);
    if (!parsed) return false;
    const size = file.size || 0;
    switch (parsed.op) {
      case '>': return size > parsed.bytes;
      case '>=': return size >= parsed.bytes;
      case '<': return size < parsed.bytes;
      case '<=': return size <= parsed.bytes;
      case '=': return size === parsed.bytes;
      default: return false;
    }
  }

  if (type === 'date') {
    const parsed = parseDatePattern(pattern);
    if (!parsed) return false;
    const modified = new Date(file.modified);
    switch (parsed.op) {
      case '>': return modified > parsed.date;
      case '>=': return modified >= parsed.date;
      case '<': return modified < parsed.date;
      case '<=': return modified <= parsed.date;
      case '=': return modified.toDateString() === parsed.date.toDateString();
      default: return false;
    }
  }

  return false;
}

async function getDesktopFilesForRules() {
  const desktopPath = path.join(os.homedir(), 'Desktop');
  const files = await getFolderFiles(desktopPath);
  return files;
}

// Получить конфигурацию одного бокса
ipcMain.handle('get-box-config', (event, boxId) => {
  const box = boxesConfig.find(b => b.id === boxId);
  return box ? normalizeBoxConfig(box) : null;
});

// Получить элементы бокса с метаданными
ipcMain.handle('get-box-items', async (event, boxId) => {
  const box = boxesConfig.find(b => b.id === boxId);
  if (!box) return { success: false, error: 'Box not found', items: [] };

  const items = Array.isArray(box.items) ? box.items : [];
  const normalized = items.map(normalizeItemPath).filter(Boolean);
  const unique = Array.from(new Set(normalized));
  const resultItems = [];
  const missing = [];

  for (const itemPath of unique) {
    try {
      const details = await getFileDetails(itemPath);
      resultItems.push(details);
    } catch (error) {
      missing.push(itemPath);
    }
  }

  if (missing.length > 0) {
    box.items = unique.filter(p => !missing.includes(p));
    await saveConfig();
  }

  return { success: true, items: resultItems };
});

// Добавить элементы в бокс
ipcMain.handle('add-items-to-box', async (event, boxId, itemPaths) => {
  const box = boxesConfig.find(b => b.id === boxId);
  if (!box) return { success: false, error: 'Box not found' };

  const incoming = Array.isArray(itemPaths) ? itemPaths : [itemPaths];
  const normalized = incoming.map(normalizeItemPath).filter(Boolean);
  const uniqueIncoming = Array.from(new Set(normalized));

  // Удаляем элементы из других боксов (один файл в одном боксе)
  const incomingSet = new Set(uniqueIncoming);
  boxesConfig.forEach(b => {
    if (b.id !== boxId && Array.isArray(b.items)) {
      b.items = b.items.filter(item => !incomingSet.has(normalizeItemPath(item)));
    }
  });

  if (!Array.isArray(box.items)) box.items = [];
  const existing = new Set(box.items.map(normalizeItemPath));
  uniqueIncoming.forEach(item => {
    if (!existing.has(item)) {
      box.items.push(item);
    }
  });

  await saveConfig();

  if (desktopBoxes.length > 0) {
    desktopBoxes.forEach(boxWindow => {
      if (!boxWindow.isDestroyed()) {
        boxWindow.webContents.send('box-config-updated', boxId, box);
      }
    });
  }

  return { success: true, added: uniqueIncoming.length };
});

// Удалить элемент из бокса
ipcMain.handle('remove-item-from-box', async (event, boxId, itemPath) => {
  const box = boxesConfig.find(b => b.id === boxId);
  if (!box) return { success: false, error: 'Box not found' };

  const target = normalizeItemPath(itemPath);
  box.items = (box.items || []).filter(item => normalizeItemPath(item) !== target);
  await saveConfig();

  if (desktopBoxes.length > 0) {
    desktopBoxes.forEach(boxWindow => {
      if (!boxWindow.isDestroyed()) {
        boxWindow.webContents.send('box-config-updated', boxId, box);
      }
    });
  }

  return { success: true };
});

// Получить файлы из папки (Folder Portal)
ipcMain.handle('get-folder-files', async (event, folderPath) => {
  if (!folderPath) return { success: false, error: 'Folder path is required', items: [] };
  const items = await getFolderFiles(folderPath);
  return { success: true, items };
});

async function applyBoxRulesInternal(mode = 'all') {
  const files = await getDesktopFilesForRules();

  if (mode === 'all') {
    boxesConfig.forEach(b => {
      b.items = [];
    });
  }

  const assigned = new Set();
  boxesConfig.forEach(b => {
    (b.items || []).forEach(item => assigned.add(normalizeItemPath(item)));
  });

  const rules = [];
  boxesConfig.forEach(box => {
    (box.rules || []).forEach(rule => {
      rules.push({
        boxId: box.id,
        priority: parseInt(rule.priority || '2', 10),
        rule
      });
    });
  });

  rules.sort((a, b) => a.priority - b.priority);

  let assignedCount = 0;
  for (const file of files) {
    const filePath = normalizeItemPath(file.path);
    if (mode === 'unassigned' && assigned.has(filePath)) {
      continue;
    }

    const match = rules.find(r => matchRule(r.rule, file));
    if (match) {
      const box = boxesConfig.find(b => b.id === match.boxId);
      if (box) {
        if (!Array.isArray(box.items)) box.items = [];
        if (!box.items.map(normalizeItemPath).includes(filePath)) {
          box.items.push(filePath);
        }
        assigned.add(filePath);
        assignedCount++;
      }
    }
  }

  await saveConfig();

  if (desktopBoxes.length > 0) {
    boxesConfig.forEach((box) => {
      desktopBoxes.forEach(boxWindow => {
        if (!boxWindow.isDestroyed()) {
          boxWindow.webContents.send('box-config-updated', box.id, box);
        }
      });
    });
  }

  return { success: true, assigned: assignedCount };
}

// Применить правила боксов к рабочему столу
ipcMain.handle('apply-box-rules', async (event, mode = 'all') => {
  return await applyBoxRulesInternal(mode);
});

// Сортировка элементов в боксах
ipcMain.handle('sort-box-items', async (event, mode = 'name') => {
  for (const box of boxesConfig) {
    if (!Array.isArray(box.items) || box.items.length === 0) continue;

    const itemsMeta = [];
    for (const itemPath of box.items) {
      try {
        const details = await getFileDetails(itemPath);
        itemsMeta.push(details);
      } catch (error) {
        // Skip missing
      }
    }

    const compare = (a, b) => {
      if (mode === 'type') {
        const extA = path.extname(a.name || '').toLowerCase();
        const extB = path.extname(b.name || '').toLowerCase();
        if (extA !== extB) return extA.localeCompare(extB);
      }
      if (mode === 'date') {
        const tA = new Date(a.modified).getTime();
        const tB = new Date(b.modified).getTime();
        return tB - tA;
      }
      return (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
    };

    itemsMeta.sort(compare);
    box.items = itemsMeta.map(item => item.path);
  }

  await saveConfig();

  if (desktopBoxes.length > 0) {
    boxesConfig.forEach((box) => {
      desktopBoxes.forEach(boxWindow => {
        if (!boxWindow.isDestroyed()) {
          boxWindow.webContents.send('box-config-updated', box.id, box);
        }
      });
    });
  }

  return { success: true };
});

// Автозапуск
function setAutoStart(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    path: app.getPath('exe')
  });
}

// ========================================
// Widget IPC Handlers
// ========================================

let widgetWindows = new Map();

// Открыть виджет
ipcMain.handle('open-widget', async (event, widgetType) => {
  // Проверить есть ли уже открытый виджет этого типа
  const existingWidget = Array.from(widgetWindows.values()).find(w => w.type === widgetType);
  if (existingWidget && !existingWidget.window.isDestroyed()) {
    // Виджет уже открыт, фокусируем его
    existingWidget.window.focus();
    return existingWidget.window.id;
  }

  const widgetId = Date.now().toString();

  // Найти конфигурацию виджета
  let widgetConfig = widgetsConfig.find(w => w.id === widgetType);
  if (!widgetConfig) {
    widgetConfig = getDefaultWidgetsConfig().find(w => w.id === widgetType);
    if (widgetConfig) {
      widgetsConfig.push(widgetConfig);
      await saveConfig();
    }
  }

  const widgetWindow = new BrowserWindow({
    x: widgetConfig?.x || 100,
    y: widgetConfig?.y || 100,
    width: widgetConfig?.width || 300,
    height: widgetConfig?.height || 400,
    minWidth: 200,
    minHeight: 200,
    maxWidth: 500,
    maxHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: false, // Не поверх окон
    skipTaskbar: true,
    resizable: true,
    movable: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Устанавливаем уровень окна - НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
  widgetWindow.setAlwaysOnTop(false, 'normal');
  widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  widgetWindow.setSkipTaskbar(true);

  // Для Windows: устанавливаем окно на уровень рабочего стола (ПОД иконки)
  setTimeout(() => {
    try {
      const hwnd = widgetWindow.getNativeWindowHandle();
      if (hwnd) {
        const hwndValue = hwnd.readBigInt64LE(0);
        console.log(`Setting widget window ${hwndValue} (${widgetType}) below desktop icons`);

        // Используем sendWindowToBack для размещения ПОД иконками
        const success = desktopWindowManager.sendWindowToBack(hwndValue.toString());

        if (!success) {
          console.log(`Fallback: sendWindowToBack failed for widget ${widgetType}`);
        }
      }
    } catch (e) {
      console.log('Error setting widget position:', e.message);
    }
  }, 1500);

  // Load widget HTML with type parameter
  widgetWindow.loadFile(path.join(__dirname, 'renderer', 'widget.html'), {
    query: { type: widgetType, id: widgetId }
  });

  // Store widget reference
  widgetWindows.set(widgetId, { window: widgetWindow, type: widgetType, config: widgetConfig });

  // Обработка перемещения виджета
  let moveTimeout;
  widgetWindow.on('moved', () => {
    clearTimeout(moveTimeout);
    moveTimeout = setTimeout(() => {
      const [x, y] = widgetWindow.getPosition();
      const [width, height] = widgetWindow.getSize();
      
      // Обновить конфигурацию
      const widgetData = widgetWindows.get(widgetId);
      if (widgetData) {
        widgetData.config.x = x;
        widgetData.config.y = y;
        widgetData.config.width = width;
        widgetData.config.height = height;
        
        // Сохранить конфигурацию
        saveConfig();
      }
    }, 500);
  });

  // Обработка изменения размера
  let resizeTimeout;
  widgetWindow.on('resized', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const [width, height] = widgetWindow.getSize();
      
      // Обновить конфигурацию
      const widgetData = widgetWindows.get(widgetId);
      if (widgetData) {
        widgetData.config.width = width;
        widgetData.config.height = height;
        
        // Сохранить конфигурацию
        saveConfig();
      }
    }, 500);
  });

  // Clean up when closed
  widgetWindow.on('closed', () => {
    widgetWindows.delete(widgetId);
  });

  return widgetId;
});

// Закрыть виджет
ipcMain.handle('close-widget', (event, widgetId) => {
  const widgetData = widgetWindows.get(widgetId);
  if (widgetData && !widgetData.window.isDestroyed()) {
    widgetData.window.close();
    return true;
  }
  return false;
});

// Открыть настройки виджета
ipcMain.handle('open-widget-settings', (event, widgetType) => {
  // Navigate to settings panel with widget focus
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate-to', 'widgets');
    mainWindow.webContents.send('open-widget-settings', widgetType);
  }
});

// Сделать скриншот
ipcMain.handle('take-screenshot', async (event, options = {}) => {
  // Screenshot functionality with AI analysis
  if (!mainWindow) return { success: false, error: 'Main window not available' };

  try {
    // Capture screen
    const display = screen.getPrimaryDisplay();
    const { width, height } = display.bounds;
    
    const image = await mainWindow.webContents.capturePage();
    const base64Image = image.toPNG().toString('base64');

    // Если запрошен AI анализ
    if (options.analyzeWithAI) {
      const provider = options.provider || 'openai';
      const prompt = options.prompt || 'Describe what is shown in this screenshot';
      
      const analysisResult = await aiClient.analyzeImage(provider, base64Image, prompt);
      
      return {
        success: true,
        screenshot: base64Image,
        analysis: analysisResult
      };
    }

    return {
      success: true,
      screenshot: base64Image,
      width: width,
      height: height
    };
  } catch (error) {
    console.error('Screenshot error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

// Перейти к настройкам
ipcMain.handle('navigate-to-settings', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.send('navigate-to', 'settings');
  }
});

// ========================================
// Quick Tools IPC Handlers
// ========================================

// Открыть калькулятор
ipcMain.handle('open-calculator', async () => {
  try {
    const { exec } = require('child_process');
    exec('start calc.exe');
    console.log('Calculator opened');
    return { success: true };
  } catch (error) {
    console.error('Error opening calculator:', error);
    return { success: false, error: error.message };
  }
});

// Открыть проводник (Файлы)
ipcMain.handle('open-file-explorer', async () => {
  try {
    const { exec } = require('child_process');
    exec('start explorer.exe');
    console.log('File Explorer opened');
    return { success: true };
  } catch (error) {
    console.error('Error opening file explorer:', error);
    return { success: false, error: error.message };
  }
});

// Открыть календарь
ipcMain.handle('open-calendar', async () => {
  try {
    const { exec } = require('child_process');
    exec('start outlookcal:');
    console.log('Calendar opened');
    return { success: true };
  } catch (error) {
    console.error('Error opening calendar:', error);
    // Fallback - открыть настройки даты/времени
    try {
      exec('start ms-settings:dateandtime');
      console.log('Opened date & time settings as fallback');
      return { success: true };
    } catch (fallbackError) {
      return { success: false, error: fallbackError.message };
    }
  }
});

// Открыть AI Assistant
ipcMain.handle('open-ai-assistant', async () => {
  try {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('navigate-to', 'ai-assistant');
      console.log('AI Assistant opened');
      return { success: true };
    }
    return { success: false, error: 'Main window not found' };
  } catch (error) {
    console.error('Error opening AI assistant:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// Widget IPC Handlers
// ========================================

// Получить конфигурацию виджетов
ipcMain.handle('get-widgets-config', () => {
  return widgetsConfig.length > 0 ? widgetsConfig : getDefaultWidgetsConfig();
});

// Обновить конфигурацию виджета
ipcMain.handle('update-widget-config', async (event, widgetId, updates) => {
  const widgetIndex = widgetsConfig.findIndex(w => w.id === widgetId);
  if (widgetIndex !== -1) {
    widgetsConfig[widgetIndex] = { ...widgetsConfig[widgetIndex], ...updates };
  } else {
    const defaultWidget = getDefaultWidgetsConfig().find(w => w.id === widgetId);
    if (defaultWidget) {
      widgetsConfig.push({ ...defaultWidget, ...updates });
    }
  }
  
  // Сохранить конфигурацию
  await saveConfig();
  
  // Обновить виджет если он открыт
  const widgetData = widgetWindows.get(widgetId);
  if (widgetData) {
    widgetData.config = { ...widgetData.config, ...updates };
  }
  
  return true;
});

// Включить/выключить виджет
ipcMain.handle('toggle-widget', async (event, widgetId, enabled) => {
  const widgetIndex = widgetsConfig.findIndex(w => w.id === widgetId);
  if (widgetIndex !== -1) {
    widgetsConfig[widgetIndex].enabled = enabled;

    // Сохранить конфигурацию
    await saveConfig();

    // Если включаем и виджет не открыт, открыть его
    if (enabled) {
      // Проверяем, есть ли уже открытый виджет этого типа (используем Array.from для Map)
      const existingWidget = Array.from(widgetWindows.values()).find(w => w.type === widgetId);
      if (!existingWidget) {
        // Открыть виджет напрямую
        const newWidgetId = Date.now().toString() + widgetId;
        const widgetConfig = widgetsConfig.find(w => w.id === widgetId);

        const widgetTypeMap = {
          'schedule': 'schedule',
          'inotes': 'notes',
          'clock': 'clock',
          'weather': 'weather',
          'quick-tools': 'quickTools',
          'ipomodoro': 'pomodoro',
          'chat-ai': 'chatAI'
        };

        const widgetType = widgetTypeMap[widgetId] || 'clock';

        const widgetWindow = new BrowserWindow({
          x: widgetConfig?.x || 100,
          y: widgetConfig?.y || 100,
          width: widgetConfig?.width || 300,
          height: widgetConfig?.height || 400,
          minWidth: 200,
          minHeight: 200,
          maxWidth: 500,
          maxHeight: 600,
          frame: false,
          transparent: true,
          backgroundColor: '#00000000',
          alwaysOnTop: isDesktopMode,
          skipTaskbar: true,
          resizable: true,
          movable: true,
          hasShadow: false,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
          }
        });

        // Устанавливаем уровень окна - НА УРОВНЕ РАБОЧЕГО СТОЛА (под иконками)
        widgetWindow.setAlwaysOnTop(false, 'normal');
        widgetWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        widgetWindow.setSkipTaskbar(true);

        // Для Windows: устанавливаем окно на уровень рабочего стола (ПОД иконки)
        setTimeout(() => {
          try {
            const hwnd = widgetWindow.getNativeWindowHandle();
            if (hwnd) {
              const hwndValue = hwnd.readBigInt64LE(0);
              console.log(`Setting widget from toggle ${hwndValue} below desktop icons`);
              desktopWindowManager.sendWindowToBack(hwndValue.toString());
            }
          } catch (e) {
            console.log('Error setting widget from toggle:', e.message);
          }
        }, 1500);

        widgetWindow.loadFile(path.join(__dirname, 'renderer', 'widget.html'), {
          query: { type: widgetType, id: newWidgetId }
        });

        widgetWindows.set(newWidgetId, { window: widgetWindow, type: widgetId, config: widgetConfig });

        widgetWindow.on('closed', () => {
          widgetWindows.delete(newWidgetId);
        });

        return newWidgetId;
      } else {
        console.log(`Widget ${widgetId} already open, focusing existing`);
      }
    } else {
      // Если выключаем, закрыть ВСЕ виджеты этого типа
      Array.from(widgetWindows.entries()).forEach(([id, widgetData]) => {
        if (widgetData.type === widgetId) {
          widgetData.window.close();
          widgetWindows.delete(id);
        }
      });
    }
  }
  return true;
});

// Получить глобальные настройки виджетов
ipcMain.handle('get-global-widget-settings', () => {
  return settings.globalWidgetSettings || getDefaultGlobalWidgetSettings();
});

// Обновить глобальные настройки виджетов
ipcMain.handle('update-global-widget-settings', async (event, newSettings) => {
  settings.globalWidgetSettings = { ...settings.globalWidgetSettings, ...newSettings };
  await saveConfig();
  
  // Если widgetsEnabled = false, закрываем все виджеты
  if (newSettings.widgetsEnabled === false) {
    widgetWindows.forEach((widgetData) => {
      if (!widgetData.window.isDestroyed()) {
        widgetData.window.close();
      }
    });
    widgetWindows.clear();
  }
  
  // Применить настройки ко всем открытым виджетам
  widgetWindows.forEach((widgetData) => {
    if (!widgetData.window.isDestroyed()) {
      widgetData.window.webContents.send('global-settings-changed', settings.globalWidgetSettings);
    }
  });
  
  return true;
});

// Получить настройки конкретного виджета
ipcMain.handle('get-widget-settings', (event, widgetId) => {
  const widget = widgetsConfig.find(w => w.id === widgetId);
  if (widget) {
    return widget.settings || {};
  }
  return {};
});

// Обновить настройки конкретного виджета
ipcMain.handle('update-widget-settings', async (event, widgetId, newSettings) => {
  const widgetIndex = widgetsConfig.findIndex(w => w.id === widgetId);
  if (widgetIndex !== -1) {
    widgetsConfig[widgetIndex].settings = { 
      ...widgetsConfig[widgetIndex].settings, 
      ...newSettings 
    };
    await saveConfig();
    
    // Уведомить виджет об изменении настроек
    const widgetData = widgetWindows.get(widgetId);
    if (widgetData && !widgetData.window.isDestroyed()) {
      widgetData.window.webContents.send('widget-settings-changed', newSettings);
    }
  }
  return true;
});

// Обновить размер окна виджета
ipcMain.handle('update-widget-size', async (event, width, height) => {
  const widgetWindow = BrowserWindow.fromWebContents(event.sender);
  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.setSize(width, height);
  }
  return true;
});

// Открыть контекстное меню виджета
ipcMain.handle('show-widget-context-menu', async (event, widgetId, x, y) => {
  const widget = widgetsConfig.find(w => w.id === widgetId);
  if (!widget) return;

  const { Menu, MenuItem } = require('electron');
  const menu = new Menu();

  // Получаем текущий язык
  let currentLang = 'en';
  try {
    currentLang = await mainWindow.webContents.executeJavaScript('currentLanguage');
  } catch (e) {
    currentLang = 'en';
  }

  // Переводы
  const translations = {
    en: {
      settings: 'Settings',
      resetPosition: 'Reset Position',
      hide: 'Hide Widget',
      show: 'Show Widget',
      close: 'Close Widget'
    },
    ru: {
      settings: 'Настройки',
      resetPosition: 'Сбросить позицию',
      hide: 'Скрыть виджет',
      show: 'Показать виджет',
      close: 'Закрыть виджет'
    }
  };

  const t = translations[currentLang] || translations.en;

  menu.append(new MenuItem({
    label: t.settings,
    click: () => {
      mainWindow.webContents.send('open-widget-settings', widgetId);
    }
  }));

  menu.append(new MenuItem({
    label: t.resetPosition,
    click: () => {
      const defaultWidget = getDefaultWidgetsConfig().find(w => w.id === widgetId);
      if (defaultWidget) {
        widgetsConfig.find(w => w.id === widgetId).x = defaultWidget.x;
        widgetsConfig.find(w => w.id === widgetId).y = defaultWidget.y;
        saveConfig();
      }
    }
  }));

  menu.append(new MenuItem({ type: 'separator' }));

  menu.append(new MenuItem({
    label: widget.enabled ? t.hide : t.show,
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
  }));

  menu.append(new MenuItem({
    label: t.close,
    click: () => {
      const widgetData = widgetWindows.get(widgetId);
      if (widgetData) {
        widgetData.window.close();
      }
    }
  }));

  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
});

// ========================================
// Wallpaper IPC Handlers
// ========================================

// Установить статические обои
ipcMain.handle('set-static-wallpaper', async (event, imagePath) => {
  try {
    return await wallpaperManager.setStaticWallpaper(imagePath);
  } catch (error) {
    console.error('Error setting static wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// Установить живые обои (видео)
ipcMain.handle('set-live-wallpaper', async (event, videoPath, options = {}) => {
  try {
    return await wallpaperManager.setLiveWallpaper(videoPath, options);
  } catch (error) {
    console.error('Error setting live wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// Остановить текущие обои
ipcMain.handle('stop-wallpaper', async () => {
  try {
    return await wallpaperManager.stopWallpaper();
  } catch (error) {
    console.error('Error stopping wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// Запустить плейлист обоев
ipcMain.handle('start-wallpaper-playlist', async (event, wallpapers, options = {}) => {
  try {
    return await wallpaperManager.startPlaylist(wallpapers, options);
  } catch (error) {
    console.error('Error starting playlist:', error);
    return { success: false, error: error.message };
  }
});

// Остановить плейлист обоев
ipcMain.handle('stop-wallpaper-playlist', async () => {
  try {
    wallpaperManager.stopPlaylist();
    return { success: true };
  } catch (error) {
    console.error('Error stopping playlist:', error);
    return { success: false, error: error.message };
  }
});

// Получить текущие обои
ipcMain.handle('get-current-wallpaper', async () => {
  try {
    return wallpaperManager.getCurrentWallpaper();
  } catch (error) {
    console.error('Error getting current wallpaper:', error);
    return null;
  }
});

// Получить статус плейлиста
ipcMain.handle('get-playlist-status', async () => {
  try {
    return wallpaperManager.getPlaylistStatus();
  } catch (error) {
    console.error('Error getting playlist status:', error);
    return { isPlaying: false, currentIndex: 0, total: 0, hasInterval: false };
  }
});

// Пауза/возобновление видео обоев
ipcMain.handle('toggle-wallpaper-pause', async () => {
  try {
    return await wallpaperManager.togglePause();
  } catch (error) {
    console.error('Error toggling wallpaper pause:', error);
    return { success: false, error: error.message };
  }
});

// Установить громкость для видео обоев
ipcMain.handle('set-wallpaper-volume', async (event, volume) => {
  try {
    return await wallpaperManager.setVolume(volume);
  } catch (error) {
    console.error('Error setting wallpaper volume:', error);
    return { success: false, error: error.message };
  }
});

// Выбрать файл обоев через диалог
ipcMain.handle('select-wallpaper-file', async (event, filters) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: filters || [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
        { name: 'Videos', extensions: ['mp4', 'webm', 'mov'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  } catch (error) {
    console.error('Error selecting wallpaper file:', error);
    return null;
  }
});

// ========================================
// Wallpaper Creator IPC Handlers
// ========================================

// Открыть Wallpaper Creator
ipcMain.handle('open-wallpaper-creator', async () => {
  try {
    const window = wallpaperCreator.createCreatorWindow();
    return { success: true, windowId: window.id };
  } catch (error) {
    console.error('Error opening wallpaper creator:', error);
    return { success: false, error: error.message };
  }
});

// Сгенерировать обои
ipcMain.handle('generate-wallpaper', async (event, options) => {
  try {
    return await wallpaperCreator.generateWallpaper(options);
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// Предпросмотр обоев
ipcMain.handle('preview-wallpaper', async (event, options) => {
  try {
    const html = wallpaperCreator.generateWallpaperHTML(options);
    return { success: true, html };
  } catch (error) {
    console.error('Error previewing wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// Box Selection Overlay (для создания выделением)
// ========================================

let selectionOverlay = null;

// Создать окно для выделения прямоугольника на рабочем столе
ipcMain.handle('start-box-selection', async () => {
  return new Promise((resolve) => {
    // Закрыть старое overlay если есть
    if (selectionOverlay && !selectionOverlay.isDestroyed()) {
      selectionOverlay.close();
    }

    const displays = screen.getAllDisplays();
    const bounds = displays[0].bounds; // Используем первый дисплей

    selectionOverlay = new BrowserWindow({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      frame: false,
      transparent: true,
      backgroundColor: '#00000001', // Почти прозрачный
      alwaysOnTop: true,
      skipTaskbar: true,
      focusable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Загрузить HTML для выделения
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body {
            overflow: hidden;
            cursor: crosshair;
            user-select: none;
          }
          #selection {
            position: absolute;
            border: 2px dashed #8b5cf6;
            background: rgba(139, 92, 246, 0.2);
            display: none;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div id="selection"></div>
        <script>
          let startX, startY, selection;
          let isSelecting = false;

          document.addEventListener('mousedown', (e) => {
            isSelecting = true;
            startX = e.clientX;
            startY = e.clientY;
            
            selection = document.getElementById('selection');
            selection.style.display = 'block';
            selection.style.left = startX + 'px';
            selection.style.top = startY + 'px';
            selection.style.width = '0px';
            selection.style.height = '0px';
          });

          document.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            
            const width = currentX - startX;
            const height = currentY - startY;
            
            selection.style.width = Math.abs(width) + 'px';
            selection.style.height = Math.abs(height) + 'px';
            selection.style.left = (width < 0 ? currentX : startX) + 'px';
            selection.style.top = (height < 0 ? currentY : startY) + 'px';
          });

          document.addEventListener('mouseup', (e) => {
            if (!isSelecting) return;
            isSelecting = false;
            
            const width = Math.abs(e.clientX - startX);
            const height = Math.abs(e.clientY - startY);
            
            // Минимальный размер 50x50
            if (width > 50 && height > 50) {
              const x = Math.min(startX, e.clientX);
              const y = Math.min(startY, e.clientY);
              
              // Отправить координаты в main процесс
              const { ipcRenderer } = require('electron');
              ipcRenderer.send('box-selection-complete', {
                x: x - ${bounds.x},
                y: y - ${bounds.y},
                width: width,
                height: height
              });
            }
            
            // Закрыть overlay
            setTimeout(() => {
              window.close();
            }, 100);
          });

          // Закрыть по ESC
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              window.close();
            }
          });
        <\/script>
      </body>
      </html>
    `;

    selectionOverlay.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    selectionOverlay.setIgnoreMouseEvents(false);

    // Обработать завершение выделения
    ipcMain.once('box-selection-complete', (event, rect) => {
      if (selectionOverlay && !selectionOverlay.isDestroyed()) {
        selectionOverlay.close();
      }
      resolve(rect);
    });

    // Если окно закрыто без результата
    selectionOverlay.on('closed', () => {
      selectionOverlay = null;
      resolve(null);
    });
  });
});

// ========================================
// Weather API Handlers
// ========================================

const weatherConfig = require('./weather-config');

// Получить погоду для города
ipcMain.handle('get-weather', async (event, city) => {
  try {
    const axios = require('axios');
    
    if (weatherConfig.apiKey === 'YOUR_API_KEY_HERE' || !weatherConfig.apiKey) {
      // Demo mode - возвращаем тестовые данные
      return {
        success: true,
        demo: true,
        data: {
          city: city || 'Moscow',
          temp: 20,
          description: 'Clear sky (demo mode)',
          humidity: 65,
          windSpeed: 5,
          icon: '01d',
          country: 'RU'
        }
      };
    }
    
    const response = await axios.get(
      `${weatherConfig.baseURL}/weather`,
      {
        params: {
          q: city,
          appid: weatherConfig.apiKey,
          units: weatherConfig.units,
          lang: weatherConfig.lang
        }
      }
    );

    return {
      success: true,
      demo: false,
      data: {
        city: response.data.name,
        temp: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: Math.round(response.data.wind.speed),
        icon: response.data.weather[0].icon,
        country: response.data.sys.country,
        sunrise: response.data.sys.sunrise,
        sunset: response.data.sys.sunset,
        pressure: response.data.main.pressure,
        visibility: response.data.visibility
      }
    };
  } catch (error) {
    console.error('Weather API error:', error.message);
    return {
      success: false,
      error: error.message,
      demo: false
    };
  }
});

// Поиск городов
ipcMain.handle('search-cities', async (event, query) => {
  try {
    const axios = require('axios');
    
    if (weatherConfig.apiKey === 'YOUR_API_KEY_HERE' || !weatherConfig.apiKey) {
      // Demo mode - возвращаем тестовые города
      return {
        success: true,
        demo: true,
        cities: weatherConfig.defaultCities.map(city => ({
          name: city.name,
          country: city.country,
          lat: city.lat,
          lon: city.lon
        }))
      };
    }
    
    const response = await axios.get(
      `${weatherConfig.baseURL}/find`,
      {
        params: {
          q: query,
          appid: weatherConfig.apiKey,
          lang: weatherConfig.lang,
          count: 10
        }
      }
    );

    return {
      success: true,
      demo: false,
      cities: response.data.list.map(city => ({
        name: city.name,
        country: city.sys.country,
        lat: city.coord.lat,
        lon: city.coord.lon
      }))
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      demo: false,
      cities: []
    };
  }
});

// ========================================
// Calendar Sync IPC Handlers
// ========================================

// Получить события календаря
ipcMain.handle('get-calendar-events', async (event, options) => {
  try {
    return await calendarSync.getCalendarEvents(event, options);
  } catch (error) {
    console.error('Error getting calendar events:', error);
    return { success: false, error: error.message, events: [] };
  }
});

// Подключить Google Calendar
ipcMain.handle('connect-google-calendar', async () => {
  try {
    return await calendarSync.connectGoogleCalendar();
  } catch (error) {
    console.error('Error connecting Google Calendar:', error);
    return { success: false, error: error.message };
  }
});

// Обменять код OAuth на токены
ipcMain.handle('exchange-google-code', async (event, code) => {
  try {
    return await calendarSync.exchangeGoogleCode(code);
  } catch (error) {
    console.error('Error exchanging code:', error);
    return { success: false, error: error.message };
  }
});

// Сохранить токены Google Calendar
ipcMain.handle('save-google-calendar-tokens', async (event, tokens) => {
  try {
    return await calendarSync.saveGoogleCalendarTokens(tokens);
  } catch (error) {
    console.error('Error saving tokens:', error);
    return { success: false, error: error.message };
  }
});

// Отключить Google Calendar
ipcMain.handle('disconnect-google-calendar', async () => {
  try {
    return await calendarSync.disconnectGoogleCalendar();
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return { success: false, error: error.message };
  }
});

// Включить/выключить Windows Calendar
ipcMain.handle('toggle-windows-calendar', async (event, enabled) => {
  try {
    return await calendarSync.toggleWindowsCalendar(enabled);
  } catch (error) {
    console.error('Error toggling Windows Calendar:', error);
    return { success: false, error: error.message };
  }
});

// Получить статус синхронизации
ipcMain.handle('get-calendar-sync-status', async () => {
  try {
    return await calendarSync.getCalendarSyncStatus();
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      googleCalendar: { connected: false },
      windowsCalendar: { enabled: false },
      lastSync: null
    };
  }
});

// ========================================
// Taskbar Customizer IPC Handlers
// ========================================

// Получить стили Taskbar
ipcMain.handle('get-taskbar-styles', async () => {
  try {
    return taskbarCustomizer.getTaskbarStyles();
  } catch (error) {
    console.error('Error getting taskbar styles:', error);
    return { success: false, error: error.message, styles: {} };
  }
});

// Получить конфигурацию Taskbar
ipcMain.handle('get-taskbar-config', async () => {
  try {
    return await taskbarCustomizer.getTaskbarConfig();
  } catch (error) {
    console.error('Error getting taskbar config:', error);
    return { success: false, error: error.message, config: null };
  }
});

// Сохранить конфигурацию Taskbar
ipcMain.handle('save-taskbar-config', async (event, config) => {
  try {
    await taskbarCustomizer.saveTaskbarConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving taskbar config:', error);
    return { success: false, error: error.message };
  }
});

// Включить кастомную Taskbar
ipcMain.handle('enable-custom-taskbar', async (event, config) => {
  try {
    taskbarCustomizer.createTaskbarWindow(config);
    return { success: true };
  } catch (error) {
    console.error('Error enabling custom taskbar:', error);
    return { success: false, error: error.message };
  }
});

// Отключить кастомную Taskbar
ipcMain.handle('disable-custom-taskbar', async () => {
  try {
    if (taskbarWindow && !taskbarWindow.isDestroyed()) {
      taskbarWindow.close();
    }
    return { success: true };
  } catch (error) {
    console.error('Error disabling custom taskbar:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// Cursor Customizer IPC Handlers
// ========================================

// Получить стили курсора
ipcMain.handle('get-cursor-styles', async () => {
  try {
    return cursorCustomizer.getCursorStyles();
  } catch (error) {
    console.error('Error getting cursor styles:', error);
    return { success: false, error: error.message, styles: {} };
  }
});

// Получить конфигурацию курсора
ipcMain.handle('get-cursor-config', async () => {
  try {
    return await cursorCustomizer.getCursorConfig();
  } catch (error) {
    console.error('Error getting cursor config:', error);
    return { success: false, error: error.message, config: null };
  }
});

// Сохранить конфигурацию курсора
ipcMain.handle('save-cursor-config', async (event, config) => {
  try {
    await cursorCustomizer.saveCursorConfig(config);
    return { success: true };
  } catch (error) {
    console.error('Error saving cursor config:', error);
    return { success: false, error: error.message };
  }
});

// Включить кастомный курсор
ipcMain.handle('enable-custom-cursor', async (event, config) => {
  try {
    return await cursorCustomizer.enableCustomCursor(config);
  } catch (error) {
    console.error('Error enabling custom cursor:', error);
    return { success: false, error: error.message };
  }
});

// Отключить кастомный курсор
ipcMain.handle('disable-custom-cursor', async () => {
  try {
    return await cursorCustomizer.disableCustomCursor();
  } catch (error) {
    console.error('Error disabling custom cursor:', error);
    return { success: false, error: error.message };
  }
});

// Получить HTML курсора
ipcMain.handle('get-cursor-html', async (event, config) => {
  try {
    return await cursorCustomizer.getCursorHTML(config);
  } catch (error) {
    console.error('Error getting cursor HTML:', error);
    return { success: false, error: error.message, html: '', js: '', css: '' };
  }
});

// ========================================
// Native Windows IPC Handlers
// ========================================

// Скрыть системную Taskbar
ipcMain.handle('hide-system-taskbar', async () => {
  try {
    return nativeWindows.hideSystemTaskbar();
  } catch (error) {
    console.error('Error hiding taskbar:', error);
    return { success: false, error: error.message };
  }
});

// Показать системную Taskbar
ipcMain.handle('show-system-taskbar', async () => {
  try {
    return nativeWindows.showSystemTaskbar();
  } catch (error) {
    console.error('Error showing taskbar:', error);
    return { success: false, error: error.message };
  }
});

// Переключить Taskbar
ipcMain.handle('toggle-system-taskbar', async () => {
  try {
    return nativeWindows.toggleTaskbar();
  } catch (error) {
    console.error('Error toggling taskbar:', error);
    return { success: false, error: error.message };
  }
});

// Скрыть Start кнопку
ipcMain.handle('hide-start-button', async () => {
  try {
    return nativeWindows.hideStartButton();
  } catch (error) {
    console.error('Error hiding start button:', error);
    return { success: false, error: error.message };
  }
});

// Показать Start кнопку
ipcMain.handle('show-start-button', async () => {
  try {
    return nativeWindows.showStartButton();
  } catch (error) {
    console.error('Error showing start button:', error);
    return { success: false, error: error.message };
  }
});

// Показать/скрыть иконки рабочего стола
ipcMain.handle('set-desktop-icons-visible', async (event, visible) => {
  try {
    return await nativeWindows.setDesktopIconsVisible(visible);
  } catch (error) {
    console.error('Error toggling desktop icons:', error);
    return { success: false, error: error.message };
  }
});

// Настроить Start Menu
ipcMain.handle('configure-start-menu', async (event, options) => {
  try {
    return await nativeWindows.configureStartMenu(options);
  } catch (error) {
    console.error('Error configuring start menu:', error);
    return { success: false, error: error.message };
  }
});

// Установить системный курсор
ipcMain.handle('set-system-cursor', async (event, cursorFile, cursorType) => {
  try {
    return nativeWindows.setSystemCursor(cursorFile, cursorType);
  } catch (error) {
    console.error('Error setting system cursor:', error);
    return { success: false, error: error.message };
  }
});

// Восстановить курсоры
ipcMain.handle('restore-default-cursors', async () => {
  try {
    return nativeWindows.restoreDefaultCursors();
  } catch (error) {
    console.error('Error restoring cursors:', error);
    return { success: false, error: error.message };
  }
});

// Установить системные обои
ipcMain.handle('set-system-wallpaper', async (event, imagePath) => {
  try {
    return nativeWindows.setSystemWallpaper(imagePath);
  } catch (error) {
    console.error('Error setting system wallpaper:', error);
    return { success: false, error: error.message };
  }
});

// Свернуть все окна
ipcMain.handle('minimize-all-windows', async () => {
  try {
    return nativeWindows.minimizeAllWindows();
  } catch (error) {
    console.error('Error minimizing windows:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// OAuth Server IPC Handlers
// ========================================

// Запустить OAuth сервер
ipcMain.handle('start-oauth-server', async () => {
  try {
    return await oauthServer.startServer();
  } catch (error) {
    console.error('Error starting OAuth server:', error);
    return { success: false, error: error.message };
  }
});

// Остановить OAuth сервер
ipcMain.handle('stop-oauth-server', async () => {
  try {
    return await oauthServer.stopServer();
  } catch (error) {
    console.error('Error stopping OAuth server:', error);
    return { success: false, error: error.message };
  }
});

// Начать OAuth flow
ipcMain.handle('start-oauth-flow', async () => {
  try {
    return await oauthServer.startOAuthFlow();
  } catch (error) {
    console.error('Error starting OAuth flow:', error);
    return { success: false, error: error.message };
  }
});

// Получить текущие токены
ipcMain.handle('get-oauth-tokens', async () => {
  try {
    return await oauthServer.getCurrentTokens();
  } catch (error) {
    console.error('Error getting tokens:', error);
    return { success: false, error: error.message };
  }
});

// Отозвать токены
ipcMain.handle('revoke-oauth-tokens', async () => {
  try {
    return await oauthServer.revokeTokens();
  } catch (error) {
    console.error('Error revoking tokens:', error);
    return { success: false, error: error.message };
  }
});

// Проверить конфигурацию
ipcMain.handle('check-oauth-configuration', async () => {
  try {
    return oauthServer.checkConfiguration();
  } catch (error) {
    console.error('Error checking OAuth config:', error);
    return { valid: false, issues: ['Error checking configuration'] };
  }
});

// ========================================
// AI IPC Handlers
// ========================================

// Получить AI конфигурацию
ipcMain.handle('get-ai-config', async () => {
  try {
    return aiConfig.getAIConfig();
  } catch (error) {
    console.error('Error getting AI config:', error);
    return { error: error.message };
  }
});

// Обновить AI конфигурацию
ipcMain.handle('update-ai-config', async (event, updates) => {
  try {
    return aiConfig.updateAIConfig(updates);
  } catch (error) {
    console.error('Error updating AI config:', error);
    return { success: false, error: error.message };
  }
});

// Установить API ключ
ipcMain.handle('set-ai-api-key', async (event, provider, key) => {
  try {
    const success = aiConfig.setApiKey(provider, key);
    return { success };
  } catch (error) {
    console.error('Error setting API key:', error);
    return { success: false, error: error.message };
  }
});

// Получить статус API ключа
ipcMain.handle('get-ai-api-key-status', async (event, provider) => {
  try {
    const key = aiConfig.getApiKey(provider);
    return { 
      hasKey: !!key,
      isValid: key ? aiConfig[`isValid${provider.charAt(0).toUpperCase() + provider.slice(1)}Key`](key) : false
    };
  } catch (error) {
    console.error('Error getting API key status:', error);
    return { hasKey: false, isValid: false };
  }
});

// Чат с AI
ipcMain.handle('chat-with-ai', async (event, provider, message, sessionId, options = {}) => {
  try {
    // Формируем messages массив
    const messages = [
      { role: 'system', content: aiConfig.AI_CONFIG.systemPrompt },
      { role: 'user', content: message }
    ];
    
    // Добавляем историю если есть sessionId
    if (sessionId) {
      const history = aiConfig.getConversationHistory(sessionId);
      messages.splice(1, 0, ...history);
    }
    
    const result = await aiClient.chatWithAI(provider, messages, options);
    
    // Сохраняем в историю
    if (sessionId && result.success) {
      aiConfig.addMessageToHistory(sessionId, 'user', message);
      aiConfig.addMessageToHistory(sessionId, 'assistant', result.content || result.choices?.[0]?.message?.content);
    }
    
    return { success: true, ...result };
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return { success: false, error: error.message };
  }
});

// Анализ изображения
ipcMain.handle('analyze-image', async (event, provider, base64Image, prompt) => {
  try {
    const result = await aiClient.analyzeImage(provider, base64Image, prompt);
    return { success: true, result };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return { success: false, error: error.message };
  }
});

// Очистить историю чата
ipcMain.handle('clear-chat-history', async (event, sessionId) => {
  try {
    aiConfig.clearHistory(sessionId);
    return { success: true };
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return { success: false, error: error.message };
  }
});

// Получить историю чата
ipcMain.handle('get-chat-history', async (event, sessionId) => {
  try {
    const history = aiConfig.getConversationHistory(sessionId);
    return { success: true, history };
  } catch (error) {
    console.error('Error getting chat history:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// Инициализация приложения
// ========================================

app.whenReady().then(async () => {
  // Загрузить конфигурацию
  await loadConfig();

  // Загрузить сессию аккаунта
  await accountManager.loadSession();

  // Зарегистрировать IPC обработчики для аккаунтов
  accountManager.registerAccountIPC();

  createWindow();
  createTray();

  if (settings.autoStart) {
    setAutoStart(true);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Не закрываем приложение, оставляем в трее
});

app.on('before-quit', () => {
  app.isQuiting = true;
  closeDesktopBoxes();
});

// Предотвращаем запуск нескольких экземпляров
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// Игнорируем ошибки сертификатов для локальных запросов
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // Предупреждаем в консоли, но не блокируем
  console.warn('Certificate error:', error, 'URL:', url);
  event.preventDefault();
  callback(true);
});

// ========================================
// Context Menu Handlers
// ========================================

// Глобальное контекстное меню для рабочего стола
let desktopContextMenu = null;

// Создать контекстное меню iTop на рабочем столе
function createDesktopContextMenu() {
  // В реальной реализации нужно использовать native Windows API
  // Для Electron используем контекстное меню в box окнах
  
  // Пункты меню которые добавляются в ПКМ рабочего стола:
  const menuItems = [
    { id: 'create-box', label: 'Create a Box', icon: 'grid' },
    { id: 'create-private-box', label: 'Enable Private Box', icon: 'lock', pro: true },
    { type: 'separator' },
    { id: 'organize-icons', label: 'Organize Desktop Icons', icon: 'sort' },
    { id: 'snapshot', label: 'Create Snapshot', icon: 'camera' },
    { type: 'separator' },
    { id: 'settings', label: 'iTop Settings', icon: 'settings' }
  ];
  
  return menuItems;
}

// Обработчик для создания бокса через контекстное меню
ipcMain.handle('create-box-from-context-menu', async (event, position) => {
  try {
    const newBox = {
      id: Date.now().toString(),
      name: 'New Box',
      icon: 'grid',
      color: '#8b5cf6',
      x: position?.x || 100,
      y: position?.y || 100,
      width: 220,
      height: 350,
      items: [],
      rules: [],
      layoutMode: 'list'
    };
    
    // Добавляем в конфигурацию
    boxesConfig.push(newBox);
    await saveConfig();
    
    // Если в desktop mode, пересоздаем боксы
    if (isDesktopMode) {
      createDesktopBoxes();
    }
    
    // Уведомляем главное окно
    if (mainWindow) {
      mainWindow.webContents.send('box-created', newBox);
    }
    
    return { success: true, box: newBox };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Обработчик для организации иконок
ipcMain.handle('organize-desktop-icons', async () => {
  try {
    console.log('Organizing desktop icons...');
    const result = await applyBoxRulesInternal('all');
    return {
      success: result.success,
      message: `Assigned ${result.assigned} items using box rules`
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========================================
// Private Box Handlers
// ========================================

// Путь к хранилищу Private Box
const privateBoxPath = path.join(os.homedir(), '.itop-desktop-clone', 'private-box');
const privateBoxConfigPath = path.join(os.homedir(), '.itop-desktop-clone', 'private-box-config.json');

// Вспомогательные функции для Private Box
async function loadPrivateBoxConfig() {
  try {
    const data = await fs.readFile(privateBoxConfigPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function savePrivateBoxConfig(config) {
  const configDir = path.dirname(privateBoxConfigPath);
  await fs.mkdir(configDir, { recursive: true });
  await fs.writeFile(privateBoxConfigPath, JSON.stringify(config, null, 2), 'utf-8');
}

async function ensurePrivateBoxDir() {
  const configDir = path.dirname(privateBoxPath);
  await fs.mkdir(configDir, { recursive: true });
  await fs.mkdir(privateBoxPath, { recursive: true });
}

// Простая хеш-функция для пароля (в продакшене использовать bcrypt)
function hashPassword(password) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(password + 'itop-salt-2024').digest('hex');
}

// Проверить существует ли Private Box
ipcMain.handle('private-box-exists', async () => {
  const config = await loadPrivateBoxConfig();
  return config !== null;
});

// Создать Private Box
ipcMain.handle('create-private-box', async (event, data) => {
  try {
    const { name, email, password, color } = data;

    if (!name || !email || !password) {
      return { success: false, error: 'All fields are required' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Проверить существует ли уже Private Box
    const existingConfig = await loadPrivateBoxConfig();
    if (existingConfig) {
      return { success: false, error: 'Private Box already exists. Only 1 per account.' };
    }

    await ensurePrivateBoxDir();

    const config = {
      name: name || 'Private Box',
      email,
      passwordHash: hashPassword(password),
      color: color || '#8b5cf6',
      createdAt: new Date().toISOString(),
      locked: true,
      unlockedAt: null
    };

    await savePrivateBoxConfig(config);
    privateBoxConfig = config;

    console.log('Private Box created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating Private Box:', error);
    return { success: false, error: error.message };
  }
});

// Проверить пароль Private Box
ipcMain.handle('verify-private-box-password', async (event, password) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    const isValid = config.passwordHash === hashPassword(password);
    return { success: isValid };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Разблокировать Private Box
ipcMain.handle('unlock-private-box', async (event, password) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Invalid password' };
    }

    config.locked = false;
    config.unlockedAt = new Date().toISOString();
    privateBoxConfig = config;
    await savePrivateBoxConfig(config);

    console.log('Private Box unlocked');
    return { success: true };
  } catch (error) {
    console.error('Error unlocking Private Box:', error);
    return { success: false, error: error.message };
  }
});

// Заблокировать Private Box
ipcMain.handle('lock-private-box', async () => {
  try {
    const config = await loadPrivateBoxConfig();
    if (config) {
      config.locked = true;
      config.unlockedAt = null;
      privateBoxConfig = config;
      await savePrivateBoxConfig(config);
      console.log('Private Box locked');
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Получить статус Private Box
ipcMain.handle('get-private-box-status', async () => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, exists: false };
    }

    return {
      success: true,
      exists: true,
      name: config.name,
      email: config.email,
      locked: config.locked,
      color: config.color,
      createdAt: config.createdAt,
      unlockedAt: config.unlockedAt
    };
  } catch (error) {
    return { success: false, error: error.message, exists: false };
  }
});

// Добавить элемент в Private Box
ipcMain.handle('add-item-to-private-box', async (event, itemPath) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.locked) {
      return { success: false, error: 'Private Box is locked' };
    }

    await ensurePrivateBoxDir();

    const fileName = path.basename(itemPath);
    const destPath = path.join(privateBoxPath, fileName);

    await fs.cp(itemPath, destPath, { recursive: true });
    await fs.rm(itemPath, { recursive: true, force: true });

    console.log('Item added to Private Box:', fileName);
    return { success: true };
  } catch (error) {
    console.error('Error adding item to Private Box:', error);
    return { success: false, error: error.message };
  }
});

// Удалить элемент из Private Box
ipcMain.handle('remove-item-from-private-box', async (event, itemPath) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.locked) {
      return { success: false, error: 'Private Box is locked' };
    }

    const fileName = path.basename(itemPath);
    const fullPath = path.join(privateBoxPath, fileName);

    await fs.rm(fullPath, { recursive: true, force: true });

    console.log('Item removed from Private Box:', fileName);
    return { success: true };
  } catch (error) {
    console.error('Error removing item from Private Box:', error);
    return { success: false, error: error.message };
  }
});

// Получить элементы Private Box
ipcMain.handle('get-private-box-items', async () => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.locked) {
      return { success: false, error: 'Private Box is locked' };
    }

    await ensurePrivateBoxDir();

    const items = await fs.readdir(privateBoxPath);
    const itemsDetails = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(privateBoxPath, item);
        const stats = await fs.stat(itemPath);
        return {
          name: item,
          path: itemPath,
          isDirectory: stats.isDirectory(),
          size: stats.size,
          modified: stats.mtime
        };
      })
    );

    return { success: true, items: itemsDetails };
  } catch (error) {
    console.error('Error getting Private Box items:', error);
    return { success: false, error: error.message, items: [] };
  }
});

// Изменить пароль Private Box
ipcMain.handle('change-private-box-password', async (event, oldPassword, newPassword) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.passwordHash !== hashPassword(oldPassword)) {
      return { success: false, error: 'Invalid old password' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    config.passwordHash = hashPassword(newPassword);
    await savePrivateBoxConfig(config);
    privateBoxConfig = config;

    console.log('Private Box password changed');
    return { success: true };
  } catch (error) {
    console.error('Error changing Private Box password:', error);
    return { success: false, error: error.message };
  }
});

// Восстановить пароль Private Box
ipcMain.handle('recover-private-box-password', async (event, email) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.email !== email) {
      return { success: false, error: 'Email does not match' };
    }

    // В демо-режиме генерируем временный пароль
    const tempPassword = 'temp' + Math.random().toString(36).slice(-6);
    config.passwordHash = hashPassword(tempPassword);
    await savePrivateBoxConfig(config);
    privateBoxConfig = config;

    console.log('Password recovery requested for:', email);
    console.log('Temporary password (demo):', tempPassword);

    // В реальном приложении здесь была бы отправка email
    return { success: true, tempPassword };
  } catch (error) {
    console.error('Error recovering Private Box password:', error);
    return { success: false, error: error.message };
  }
});

// ========================================
// Snapshot System (Резервное копирование)
// ========================================

const snapshotsPath = path.join(os.homedir(), '.itop-desktop-clone', 'snapshots');

// Сохранить снимок конфигурации
ipcMain.handle('create-snapshot', async (event, { name, description, includeWallpaper, includeWidgets }) => {
  try {
    await fs.mkdir(snapshotsPath, { recursive: true });

    const snapshot = {
      id: Date.now().toString(),
      name: name || `Snapshot ${new Date().toLocaleDateString()}`,
      description: description || '',
      createdAt: new Date().toISOString(),
      includeWallpaper,
      includeWidgets,
      boxes: boxesConfig,
      settings: { ...settings },
      globalWidgetSettings: settings.globalWidgetSettings
    };

    // Добавляем обои если включено
    if (includeWallpaper) {
      const wallpaperConfig = await wallpaperManager.getCurrentWallpaper();
      snapshot.wallpaper = wallpaperConfig;
    }

    // Добавляем виджеты если включено
    if (includeWidgets) {
      snapshot.widgets = widgetsConfig;
    }

    // Сохраняем в файл
    const snapshotFile = path.join(snapshotsPath, `${snapshot.id}.json`);
    await fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`Snapshot created: ${snapshot.name} (${snapshot.id})`);
    return { success: true, snapshot };
  } catch (error) {
    console.error('Error creating snapshot:', error);
    return { success: false, error: error.message };
  }
});

// Получить все снимки
ipcMain.handle('get-snapshots', async () => {
  try {
    await fs.mkdir(snapshotsPath, { recursive: true });
    
    const files = await fs.readdir(snapshotsPath);
    const snapshots = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(snapshotsPath, file);
        const data = await fs.readFile(filePath, 'utf-8');
        snapshots.push(JSON.parse(data));
      }
    }

    // Сортируем по дате создания (новые первые)
    snapshots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return snapshots;
  } catch (error) {
    console.error('Error getting snapshots:', error);
    return [];
  }
});

// Восстановить из снимка
ipcMain.handle('restore-snapshot', async (event, snapshotId) => {
  try {
    const snapshotFile = path.join(snapshotsPath, `${snapshotId}.json`);
    const data = await fs.readFile(snapshotFile, 'utf-8');
    const snapshot = JSON.parse(data);

    // Восстанавливаем боксы
    boxesConfig = snapshot.boxes || [];
    
    // Восстанавливаем настройки
    if (snapshot.settings) {
      Object.assign(settings, snapshot.settings);
    }

    // Восстанавливаем глобальные настройки виджетов
    if (snapshot.globalWidgetSettings) {
      settings.globalWidgetSettings = snapshot.globalWidgetSettings;
    }

    // Восстанавливаем обои если включено
    if (snapshot.includeWallpaper && snapshot.wallpaper) {
      await wallpaperManager.restoreWallpaper(snapshot.wallpaper);
    }

    // Восстанавливаем виджеты если включено
    if (snapshot.includeWidgets && snapshot.widgets) {
      widgetsConfig = snapshot.widgets;
      
      // Пересоздаем виджеты если в режиме рабочего стола
      if (isDesktopMode) {
        createDesktopWidgets();
      }
    }

    // Сохраняем конфигурацию
    await saveConfig();

    // Пересоздаем боксы если в режиме рабочего стола
    if (isDesktopMode) {
      createDesktopBoxes();
    }

    // Уведомляем главное окно
    if (mainWindow) {
      mainWindow.webContents.send('snapshot-restored', snapshot);
    }

    console.log(`Snapshot restored: ${snapshot.name}`);
    return { success: true, snapshot };
  } catch (error) {
    console.error('Error restoring snapshot:', error);
    return { success: false, error: error.message };
  }
});

// Удалить снимок
ipcMain.handle('delete-snapshot', async (event, snapshotId) => {
  try {
    const snapshotFile = path.join(snapshotsPath, `${snapshotId}.json`);
    await fs.unlink(snapshotFile);
    
    console.log(`Snapshot deleted: ${snapshotId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    return { success: false, error: error.message };
  }
});

// Экспортировать снимок в файл
ipcMain.handle('export-snapshot', async (event, snapshotId) => {
  try {
    const snapshotFile = path.join(snapshotsPath, `${snapshotId}.json`);
    const data = await fs.readFile(snapshotFile, 'utf-8');
    const snapshot = JSON.parse(data);

    // Диалог сохранения
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Snapshot',
      defaultPath: `${snapshot.name.replace(/[^a-z0-9]/gi, '_')}.snapshot`,
      filters: [{ name: 'Snapshot', extensions: ['snapshot', 'json'] }]
    });

    if (!result.canceled && result.filePath) {
      await fs.writeFile(result.filePath, data, 'utf-8');
      console.log(`Snapshot exported to: ${result.filePath}`);
      return { success: true, path: result.filePath };
    }

    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error exporting snapshot:', error);
    return { success: false, error: error.message };
  }
});

// Импортировать снимок из файла
ipcMain.handle('import-snapshot', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Snapshot',
      filters: [{ name: 'Snapshot', extensions: ['snapshot', 'json'] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const importFile = result.filePaths[0];
    const data = await fs.readFile(importFile, 'utf-8');
    const snapshot = JSON.parse(data);

    // Генерируем новый ID чтобы не перезаписать существующий
    snapshot.id = Date.now().toString();
    snapshot.importedAt = new Date().toISOString();

    // Сохраняем в snapshots
    const snapshotFile = path.join(snapshotsPath, `${snapshot.id}.json`);
    await fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`Snapshot imported: ${snapshot.name}`);
    return { success: true, snapshot };
  } catch (error) {
    console.error('Error importing snapshot:', error);
    return { success: false, error: error.message };
  }
});

// Удалить Private Box
ipcMain.handle('delete-private-box', async (event, password) => {
  try {
    const config = await loadPrivateBoxConfig();
    if (!config) {
      return { success: false, error: 'Private Box not found' };
    }

    if (config.passwordHash !== hashPassword(password)) {
      return { success: false, error: 'Invalid password' };
    }

    // Удалить файлы
    await fs.rm(privateBoxPath, { recursive: true, force: true });
    await fs.rm(privateBoxConfigPath, { force: true });

    privateBoxConfig = null;
    console.log('Private Box deleted');
    return { success: true };
  } catch (error) {
    console.error('Error deleting Private Box:', error);
    return { success: false, error: error.message };
  }
});

// Открыть модальное окно Private Box
ipcMain.handle('open-private-box-modal', async (event, type) => {
  try {
    if (!mainWindow) return { success: false, error: 'Main window not found' };

    const modalPath = path.join(__dirname, 'renderer', 'private-box.html');
    
    // Создаём небольшое окно для модального диалога
    const modalWindow = new BrowserWindow({
      width: 480,
      height: 600,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      resizable: false,
      modal: true,
      parent: mainWindow,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    modalWindow.loadFile(modalPath, {
      query: { type: type || 'create' }
    });

    return { success: true, windowId: modalWindow.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
