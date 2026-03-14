// ========================================
// Taskbar Customization Module
// Кастомизация панели задач (визуальная имитация)
// ========================================

const { BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let taskbarWindow = null;

// Стили панели задач
const taskbarStyles = {
  default: {
    name: 'Default (Windows 10)',
    alignment: 'left',
    height: 40,
    transparency: 0.9,
    color: '#1a1a2e',
    iconSize: 32,
    showLabels: true,
    cornerRadius: 0
  },
  centered: {
    name: 'Centered (Windows 11)',
    alignment: 'center',
    height: 48,
    transparency: 0.85,
    color: '#1e1e2e',
    iconSize: 36,
    showLabels: false,
    cornerRadius: 0
  },
  floating: {
    name: 'Floating',
    alignment: 'center',
    height: 52,
    transparency: 0.95,
    color: '#2a2a3e',
    iconSize: 40,
    showLabels: false,
    cornerRadius: 12,
    floating: true,
    gap: 8
  },
  minimal: {
    name: 'Minimal',
    alignment: 'center',
    height: 36,
    transparency: 0.8,
    color: '#0f0f1a',
    iconSize: 28,
    showLabels: false,
    cornerRadius: 8
  },
  transparent: {
    name: 'Transparent',
    alignment: 'left',
    height: 40,
    transparency: 0.3,
    color: '#000000',
    iconSize: 32,
    showLabels: true,
    cornerRadius: 0
  }
};

// Конфигурация по умолчанию
const defaultConfig = {
  style: 'default',
  autoHide: false,
  position: 'bottom', // bottom, top, left, right
  customColor: null,
  showDesktopButton: true,
  showStartButton: true,
  showSearch: true,
  showWidgets: true,
  pinnedApps: ['explorer', 'edge', 'store']
};

// Путь к конфигурации
const configPath = path.join(
  require('os').homedir(),
  '.itop-desktop-clone',
  'taskbar-config.json'
);

// Загрузить конфигурацию
async function loadConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return { ...defaultConfig, ...JSON.parse(data) };
  } catch (error) {
    return defaultConfig;
  }
}

// Сохранить конфигурацию
async function saveConfig(config) {
  try {
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving taskbar config:', error);
    return false;
  }
}

// Создать окно кастомной Taskbar
function createTaskbarWindow(config) {
  if (taskbarWindow && !taskbarWindow.isDestroyed()) {
    taskbarWindow.close();
  }

  const displays = screen.getAllDisplays();
  const primaryDisplay = displays[0];
  const { width, height, x, y } = primaryDisplay.bounds;

  let taskbarConfig = {
    x: x,
    y: y + height - config.height,
    width: width,
    height: config.height,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  };

  // Для floating стиля
  if (taskbarStyles[config.style]?.floating) {
    const style = taskbarStyles[config.style];
    taskbarConfig.x = x + (width - 600) / 2;
    taskbarConfig.y = y + height - config.height - style.gap;
    taskbarConfig.width = 600;
  }

  taskbarWindow = new BrowserWindow(taskbarConfig);

  // Загрузить HTML
  taskbarWindow.loadFile(path.join(__dirname, 'renderer', 'taskbar-overlay.html'), {
    query: { style: config.style }
  });

  // Установить уровень окна
  taskbarWindow.setAlwaysOnTop(true, 'screen-saver');

  taskbarWindow.on('closed', () => {
    taskbarWindow = null;
  });

  return taskbarWindow;
}

// Сгенерировать HTML для Taskbar
function generateTaskbarHTML(config) {
  const style = taskbarStyles[config.style] || taskbarStyles.default;
  
  const backgroundColor = config.customColor || style.color;
  const alpha = Math.round(style.transparency * 255).toString(16).padStart(2, '0');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          width: 100%;
          height: 100%;
          overflow: hidden;
          font-family: 'Segoe UI', sans-serif;
        }
        
        .taskbar {
          width: 100%;
          height: 100%;
          background: ${backgroundColor}${alpha};
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          padding: 0 12px;
          ${style.alignment === 'center' ? 'justify-content: center;' : ''}
          ${style.floating ? `
            border-radius: ${style.cornerRadius}px;
            margin: ${style.gap}px;
            width: calc(100% - ${style.gap * 2}px);
          ` : ''}
        }
        
        .taskbar-section {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .taskbar-section.left {
          ${style.alignment === 'left' ? 'flex: 1;' : ''}
        }
        
        .taskbar-section.center {
          ${style.alignment === 'center' ? 'flex: 1; justify-content: center;' : ''}
        }
        
        .taskbar-section.right {
          margin-left: auto;
        }
        
        .taskbar-item {
          width: ${style.iconSize + 8}px;
          height: ${style.iconSize + 8}px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: ${style.cornerRadius / 2}px;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }
        
        .taskbar-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }
        
        .taskbar-item:active {
          transform: scale(0.95);
        }
        
        .taskbar-item svg {
          width: ${style.iconSize}px;
          height: ${style.iconSize}px;
        }
        
        .start-button {
          background: linear-gradient(135deg, #0078d4, #00bcf2);
          border-radius: ${style.cornerRadius / 2}px;
        }
        
        .start-button:hover {
          background: linear-gradient(135deg, #0095e6, #10d4ff);
        }
        
        .desktop-button {
          width: 20px;
          border-right: 1px solid rgba(255,255,255,0.2);
        }
        
        .app-label {
          position: absolute;
          bottom: ${style.iconSize + 12}px;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        
        .taskbar-item:hover .app-label {
          opacity: 1;
        }
      </style>
    </head>
    <body>
      <div class="taskbar">
        ${config.showStartButton ? `
          <div class="taskbar-section left">
            <div class="taskbar-item start-button" onclick="openStartMenu()">
              <svg viewBox="0 0 24 24" fill="white">
                <path d="M3 11V5l9-2v8H3zm9-2V3l9 2v6h-9zM3 13h9v8H3v-8zm9 0h9v6l-9 2v-8z"/>
              </svg>
              <span class="app-label">Start</span>
            </div>
          </div>
        ` : ''}
        
        <div class="taskbar-section ${style.alignment === 'center' ? 'center' : 'left'}">
          ${config.pinnedApps.map(app => `
            <div class="taskbar-item" onclick="openApp('${app}')">
              ${getAppIcon(app)}
              <span class="app-label">${getAppName(app)}</span>
            </div>
          `).join('')}
        </div>
        
        <div class="taskbar-section right">
          <div class="taskbar-item" onclick="showNotifications()">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="app-label">Notifications</span>
          </div>
          <div class="taskbar-item" onclick="showCalendar()">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span class="app-label" id="clockLabel">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          ${config.showDesktopButton ? `
            <div class="taskbar-item desktop-button" onclick="showDesktop()">
              <span class="app-label">Show Desktop</span>
            </div>
          ` : ''}
        </div>
      </div>
      
      <script>
        // Обновление часов
        setInterval(() => {
          const clockLabel = document.getElementById('clockLabel');
          if (clockLabel) {
            clockLabel.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          }
        }, 1000);
        
        function openStartMenu() {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('taskbar-start-clicked');
        }
        
        function openApp(appName) {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('taskbar-app-clicked', appName);
        }
        
        function showNotifications() {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('taskbar-notifications-clicked');
        }
        
        function showCalendar() {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('taskbar-calendar-clicked');
        }
        
        function showDesktop() {
          const { ipcRenderer } = require('electron');
          ipcRenderer.send('taskbar-show-desktop');
        }
        
        function getAppIcon(app) {
          const icons = {
            explorer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
            edge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
            store: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
          };
          return icons[app] || icons.explorer;
        }
        
        function getAppName(app) {
          const names = {
            explorer: 'File Explorer',
            edge: 'Microsoft Edge',
            store: 'Microsoft Store'
          };
          return names[app] || app;
        }
      </script>
    </body>
    </html>
  `;
}

// Экспорт функций
module.exports = {
  taskbarStyles,
  defaultConfig,
  loadConfig,
  saveConfig,
  createTaskbarWindow,
  generateTaskbarHTML
};
