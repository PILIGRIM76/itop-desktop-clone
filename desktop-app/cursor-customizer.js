// ========================================
// Mouse Cursor Customization Module
// Кастомизация курсора мыши
// ========================================

const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Путь к конфигурации
const configPath = path.join(
  require('os').homedir(),
  '.itop-desktop-clone',
  'cursor-config.json'
);

// Стили курсоров
const cursorStyles = {
  default: {
    name: 'Default (Windows)',
    type: 'system',
    size: 100,
    color: '#ffffff',
    trail: false
  },
  custom: {
    name: 'Custom',
    type: 'custom',
    size: 100,
    color: '#8b5cf6',
    trail: true,
    trailLength: 10,
    glow: true,
    glowColor: '#8b5cf6',
    glowSize: 20
  },
  minimal: {
    name: 'Minimal',
    type: 'custom',
    size: 80,
    color: '#ffffff',
    trail: false,
    glow: false
  },
  gaming: {
    name: 'Gaming',
    type: 'custom',
    size: 120,
    color: '#ff0000',
    trail: true,
    trailLength: 15,
    glow: true,
    glowColor: '#ff0000',
    glowSize: 30,
    crosshair: true
  },
  dark: {
    name: 'Dark',
    type: 'custom',
    size: 100,
    color: '#000000',
    trail: false,
    glow: false
  }
};

// Конфигурация по умолчанию
const defaultConfig = {
  style: 'default',
  enabled: false,
  customSize: 100,
  customColor: '#8b5cf6',
  trailEnabled: false,
  trailLength: 10,
  glowEnabled: false,
  glowColor: '#8b5cf6',
  glowSize: 20
};

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
    console.error('Error saving cursor config:', error);
    return false;
  }
}

// Сгенерировать CSS для курсора
function generateCursorCSS(config) {
  const style = cursorStyles[config.style] || cursorStyles.default;
  
  if (config.style === 'default') {
    return ''; // Системный курсор
  }
  
  return `
    /* Custom Cursor Styles */
    * {
      cursor: none !important;
    }
    
    .custom-cursor {
      position: fixed;
      width: ${style.size * (config.customSize / 100)}px;
      height: ${style.size * (config.customSize / 100)}px;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      transition: transform 0.05s ease-out;
    }
    
    .custom-cursor-dot {
      position: absolute;
      width: 8px;
      height: 8px;
      background: ${config.customColor};
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
    
    .custom-cursor-outer {
      position: absolute;
      width: ${style.size * (config.customSize / 100)}px;
      height: ${style.size * (config.customSize / 100)}px;
      border: 2px solid ${config.customColor};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.1s ease-out;
    }
    
    ${style.trail && config.trailEnabled ? `
      .custom-cursor-trail {
        position: fixed;
        width: ${style.size * 0.6 * (config.customSize / 100)}px;
        height: ${style.size * 0.6 * (config.customSize / 100)}px;
        background: ${config.customColor}33;
        border-radius: 50%;
        pointer-events: none;
        z-index: 999998;
        transform: translate(-50%, -50%);
      }
    ` : ''}
    
    ${style.glow && config.glowEnabled ? `
      .custom-cursor-glow {
        position: fixed;
        width: ${style.glowSize * (config.customSize / 100)}px;
        height: ${style.glowSize * (config.customSize / 100)}px;
        background: radial-gradient(circle, ${config.glowColor}66 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999997;
        transform: translate(-50%, -50%);
        filter: blur(10px);
      }
    ` : ''}
  `;
}

// Сгенерировать HTML для курсора
function generateCursorHTML(config) {
  const style = cursorStyles[config.style] || cursorStyles.default;
  
  if (config.style === 'default') {
    return '';
  }
  
  let html = `
    <div id="customCursor" class="custom-cursor">
      <div class="custom-cursor-dot"></div>
      <div class="custom-cursor-outer"></div>
    </div>
  `;
  
  if (style.trail && config.trailEnabled) {
    for (let i = 0; i < config.trailLength; i++) {
      html += `<div class="custom-cursor-trail" data-trail="${i}" style="opacity: ${1 - i / config.trailLength}"></div>`;
    }
  }
  
  if (style.glow && config.glowEnabled) {
    html += `<div class="custom-cursor-glow"></div>`;
  }
  
  return html;
}

// Сгенерировать JavaScript для курсора
function generateCursorJS(config) {
  if (config.style === 'default') {
    return '';
  }
  
  return `
    <script>
      (function() {
        const cursor = document.getElementById('customCursor');
        const trails = document.querySelectorAll('.custom-cursor-trail');
        const glow = document.querySelector('.custom-cursor-glow');
        
        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let trailPositions = [];
        
        // Инициализация позиций шлейфа
        for (let i = 0; i < ${config.trailLength}; i++) {
          trailPositions.push({ x: 0, y: 0 });
        }
        
        document.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
        });
        
        function updateCursor() {
          // Плавное движение курсора
          const dx = mouseX - cursorX;
          const dy = mouseY - cursorY;
          cursorX += dx * 0.2;
          cursorY += dy * 0.2;
          
          if (cursor) {
            cursor.style.left = cursorX + 'px';
            cursor.style.top = cursorY + 'px';
          }
          
          // Обновление шлейфа
          if (trails.length > 0) {
            trailPositions.unshift({ x: cursorX, y: cursorY });
            trailPositions.pop();
            
            trails.forEach((trail, index) => {
              const pos = trailPositions[index * 2] || trailPositions[trailPositions.length - 1];
              trail.style.left = pos.x + 'px';
              trail.style.top = pos.y + 'px';
            });
          }
          
          // Обновление свечения
          if (glow) {
            glow.style.left = cursorX + 'px';
            glow.style.top = cursorY + 'px';
          }
          
          requestAnimationFrame(updateCursor);
        }
        
        updateCursor();
        
        // Эффекты при клике
        document.addEventListener('mousedown', () => {
          if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(0.9)';
          }
        });
        
        document.addEventListener('mouseup', () => {
          if (cursor) {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
          }
        });
        
        // Эффекты при наведении на ссылки
        document.querySelectorAll('a, button, [role="button"]').forEach(el => {
          el.addEventListener('mouseenter', () => {
            if (cursor) {
              cursor.style.transform = 'translate(-50%, -50%) scale(1.3)';
            }
          });
          el.addEventListener('mouseleave', () => {
            if (cursor) {
              cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
          });
        });
      })();
    <\/script>
  `;
}

// Экспорт функций
module.exports = {
  cursorStyles,
  defaultConfig,
  loadConfig,
  saveConfig,
  generateCursorCSS,
  generateCursorHTML,
  generateCursorJS
};
