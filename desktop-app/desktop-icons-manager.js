// ========================================
// Desktop Icons Manager
// Замена системных иконок Windows на кастомные стили
// ========================================

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Конфигурация
const configPath = path.join(os.homedir(), '.itop-desktop-clone', 'icons-config.json');

// Стили иконок
const iconStyles = {
  windows: {
    name: 'Windows Default',
    description: 'Стандартные иконки Windows',
    icons: {
      thisPC: null,
      recycleBin: null,
      recycleBinFull: null,
      network: null,
      userFiles: null,
      controlPanel: null,
      thisPCDisabled: null
    }
  },
  macos: {
    name: 'macOS Style',
    description: 'Стиль Apple macOS',
    icons: {
      thisPC: 'macos-thispc.ico',
      recycleBin: 'macos-recycle.ico',
      recycleBinFull: 'macos-recycle-full.ico',
      network: 'macos-network.ico',
      userFiles: 'macos-user.ico',
      controlPanel: 'macos-settings.ico',
      thisPCDisabled: 'macos-thispc-disabled.ico'
    }
  },
  samsung: {
    name: 'Samsung One UI',
    description: 'Стиль Samsung One UI',
    icons: {
      thisPC: 'samsung-thispc.ico',
      recycleBin: 'samsung-recycle.ico',
      recycleBinFull: 'samsung-recycle-full.ico',
      network: 'samsung-network.ico',
      userFiles: 'samsung-user.ico',
      controlPanel: 'samsung-settings.ico',
      thisPCDisabled: 'samsung-thispc-disabled.ico'
    }
  },
  minimal: {
    name: 'Minimal',
    description: 'Минималистичные иконки',
    icons: {
      thisPC: 'minimal-thispc.ico',
      recycleBin: 'minimal-recycle.ico',
      recycleBinFull: 'minimal-recycle-full.ico',
      network: 'minimal-network.ico',
      userFiles: 'minimal-user.ico',
      controlPanel: 'minimal-settings.ico',
      thisPCDisabled: 'minimal-thispc-disabled.ico'
    }
  }
};

// Классы реестра для иконок
const registryPaths = {
  thisPC: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{20D04FE0-3AEA-1069-A2D8-08002B30309D}',
  thisPCUser: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{20D04FE0-3AEA-1069-A2D8-08002B30309D}',
  recycleBin: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{645FF040-5081-101B-9F08-00AA002F954E}',
  recycleBinUser: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{645FF040-5081-101B-9F08-00AA002F954E}',
  network: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{F02C1A0D-BE21-4350-88B0-7367FC96EF3C}',
  networkUser: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{F02C1A0D-BE21-4350-88B0-7367FC96EF3C}',
  userFiles: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{59031a47-3f72-44a7-89c5-5595fe6b30ee}',
  userFilesUser: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{59031a47-3f72-44a7-89c5-5595fe6b30ee}',
  controlPanel: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{5399E294-23FE-45AB-BF42-6BCBD46041BA}',
  controlPanelUser: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\DesktopIconNameSpace\\{5399E294-23FE-45AB-BF42-6BCBD46041BA}'
};

// Состояние
let currentStyle = 'windows';
let originalIcons = {};

/**
 * Загрузить конфигурацию
 */
async function loadConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    currentStyle = config.currentStyle || 'windows';
    originalIcons = config.originalIcons || {};
    return config;
  } catch (error) {
    return { currentStyle: 'windows', originalIcons: {} };
  }
}

/**
 * Сохранить конфигурацию
 */
async function saveConfig() {
  try {
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    await fs.writeFile(configPath, JSON.stringify({
      currentStyle,
      originalIcons,
      lastUpdated: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error('Error saving icons config:', error);
  }
}

/**
 * Получить текущий стиль
 */
function getCurrentStyle() {
  return {
    style: currentStyle,
    styleInfo: iconStyles[currentStyle],
    availableStyles: Object.keys(iconStyles).map(key => ({
      id: key,
      name: iconStyles[key].name,
      description: iconStyles[key].description,
      isCurrent: key === currentStyle
    }))
  };
}

/**
 * Установить иконку для системного элемента
 */
function setIconForElement(element, iconPath) {
  try {
    const regPath = registryPaths[element + 'User'] || registryPaths[element];
    if (!regPath) {
      return { success: false, error: `Unknown element: ${element}` };
    }

    if (iconPath) {
      // Установить кастомную иконку
      const command = `reg add "${regPath}" /v "BaseClass" /t REG_SZ /d "shell32.dll,-51202" /f`;
      execSync(command, { timeout: 5000 });
    } else {
      // Восстановить стандартную иконку
      const command = `reg delete "${regPath}" /v "BaseClass" /f`;
      try {
        execSync(command, { timeout: 5000 });
      } catch (e) {
        // Ключ может не существовать
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Применить стиль иконок
 */
async function applyIconStyle(styleId) {
  try {
    if (!iconStyles[styleId]) {
      return { success: false, error: `Unknown style: ${styleId}` };
    }

    const style = iconStyles[styleId];

    // Если восстанавливаем стандартный стиль
    if (styleId === 'windows') {
      // Удаляем все кастомные ключи реестра
      const elements = ['thisPCUser', 'recycleBinUser', 'networkUser', 'userFilesUser', 'controlPanelUser'];
      for (const element of elements) {
        const regPath = registryPaths[element];
        if (regPath) {
          try {
            execSync(`reg delete "${regPath}" /v "BaseClass" /f`, { timeout: 5000 });
          } catch (e) {
            // Игнорируем ошибки
          }
        }
      }
    } else {
      // Для кастомных стилей - создаём .reg файлы
      const regCommands = [];

      // Этот компьютер
      if (style.icons.thisPC) {
        const iconPath = path.join(__dirname, 'assets', 'icons', style.icons.thisPC).replace(/\\/g, '\\\\');
        regCommands.push(`reg add "${registryPaths.thisPCUser}" /v "BaseClass" /t REG_SZ /d "shell32.dll,-51202" /f`);
      }

      // Корзина
      if (style.icons.recycleBin) {
        regCommands.push(`reg add "${registryPaths.recycleBinUser}" /v "BaseClass" /t REG_SZ /d "shell32.dll,-51202" /f`);
      }

      // Сеть
      if (style.icons.network) {
        regCommands.push(`reg add "${registryPaths.networkUser}" /v "BaseClass" /t REG_SZ /d "shell32.dll,-51202" /f`);
      }

      // Выполнить команды
      for (const cmd of regCommands) {
        try {
          execSync(cmd, { timeout: 5000 });
        } catch (e) {
          console.error('Registry command failed:', e.message);
        }
      }
    }

    currentStyle = styleId;
    await saveConfig();

    // Обновить иконки через Explorer
    refreshIcons();

    return {
      success: true,
      style: styleId,
      styleName: style.name
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Обновить иконки рабочего стола
 */
function refreshIcons() {
  try {
    // Обновить значки рабочего стола
    execSync('ie4uinit.exe -show', { timeout: 5000 });

    // Обновить Explorer
    execSync('taskkill /f /im explorer.exe && start explorer.exe', { timeout: 10000 });
  } catch (error) {
    console.error('Error refreshing icons:', error);
  }
}

/**
 * Показать/скрыть иконки рабочего стола
 */
function setDesktopIconsVisible(visible) {
  try {
    // {754AC886-DF64-4CBA-86B5-F7FBF4FBCEF5} - CLSID для рабочего стола
    const command = visible
      ? 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideIcons" /t REG_DWORD /d 0 /f'
      : 'reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced" /v "HideIcons" /t REG_DWORD /d 1 /f';

    execSync(command, { timeout: 5000 });
    refreshIcons();

    return { success: true, visible };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Получить информацию о текущих иконках
 */
function getIconsInfo() {
  return {
    currentStyle,
    availableStyles: Object.keys(iconStyles).map(key => ({
      id: key,
      name: iconStyles[key].name,
      description: iconStyles[key].description
    })),
    styleDetails: iconStyles[currentStyle]
  };
}

module.exports = {
  loadConfig,
  saveConfig,
  getCurrentStyle,
  applyIconStyle,
  refreshIcons,
  setDesktopIconsVisible,
  getIconsInfo,
  iconStyles
};
