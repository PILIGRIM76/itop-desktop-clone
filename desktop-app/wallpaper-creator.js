// ========================================
// Wallpaper Creator Module
// Генерация обоев с эффектами частиц и фильтрами
// ========================================

const { BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let creatorWindow = null;

// Эффекты частиц по умолчанию
const defaultParticleEffects = {
  enabled: true,
  count: 50,
  size: { min: 2, max: 5 },
  speed: { min: 0.5, max: 2 },
  color: { r: 255, g: 255, b: 255, alpha: 0.5 },
  shape: 'circle', // circle, square, triangle
  motion: 'float' // float, rise, fall, spiral
};

// Фильтры по умолчанию
const defaultFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  vignette: 0
};

// Эффекты курсора по умолчанию
const defaultCursorEffects = {
  enabled: false,
  trail: true,
  glow: true,
  ripple: false,
  size: 20,
  color: '#8b5cf6'
};

// Создать окно Wallpaper Creator
function createCreatorWindow() {
  if (creatorWindow && !creatorWindow.isDestroyed()) {
    creatorWindow.focus();
    return creatorWindow;
  }

  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  creatorWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    transparent: false,
    backgroundColor: '#1a1a2e',
    alwaysOnTop: false,
    skipTaskbar: false,
    resizable: true,
    movable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  creatorWindow.loadFile(path.join(__dirname, 'renderer', 'wallpaper-creator.html'));
  
  creatorWindow.on('closed', () => {
    creatorWindow = null;
  });

  return creatorWindow;
}

// Сгенерировать обои с эффектами
async function generateWallpaper(options) {
  const {
    type = 'particles',
    width = 1920,
    height = 1080,
    backgroundColor = '#1a1a2e',
    particleEffects = defaultParticleEffects,
    filters = defaultFilters,
    cursorEffects = defaultCursorEffects
  } = options;

  try {
    // Создаём HTML для генерации
    const html = generateWallpaperHTML({
      type,
      width,
      height,
      backgroundColor,
      particleEffects,
      filters,
      cursorEffects
    });

    // Создаём временное окно для рендеринга
    const renderWindow = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    await renderWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    // Ждём завершения рендеринга
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Делаем скриншот
    const image = await renderWindow.webContents.capturePage();
    const buffer = image.toPNG();

    renderWindow.close();

    // Сохраняем файл
    const outputPath = path.join(
      require('os').homedir(),
      '.itop-desktop-clone',
      'wallpapers',
      `generated_${Date.now()}.png`
    );

    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, buffer);

    return {
      success: true,
      path: outputPath
    };
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Сгенерировать HTML для обоев
function generateWallpaperHTML(options) {
  const {
    type,
    width,
    height,
    backgroundColor,
    particleEffects,
    filters,
    cursorEffects
  } = options;

  // CSS фильтры
  const filterStyle = `
    filter: 
      brightness(${filters.brightness}%)
      contrast(${filters.contrast}%)
      saturate(${filters.saturation}%)
      hue-rotate(${filters.hue}deg)
      blur(${filters.blur}px)
      grayscale(${filters.grayscale}%)
      sepia(${filters.sepia}%);
  `;

  // HTML для разных типов обоев
  let contentHTML = '';
  
  if (type === 'particles') {
    contentHTML = generateParticlesHTML(particleEffects, cursorEffects);
  } else if (type === 'gradient') {
    contentHTML = generateGradientHTML(options);
  } else if (type === 'solid') {
    contentHTML = `<div style="background-color: ${backgroundColor}; width: 100%; height: 100%;"></div>`;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; }
        body {
          overflow: hidden;
          background: ${backgroundColor};
          width: ${width}px;
          height: ${height}px;
          ${filterStyle}
        }
        #canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .cursor-effect {
          position: absolute;
          pointer-events: none;
          border-radius: 50%;
          background: radial-gradient(circle, ${cursorEffects.color} 0%, transparent 70%);
          opacity: 0.6;
          transition: transform 0.1s;
        }
      </style>
    </head>
    <body>
      <div id="canvas">${contentHTML}</div>
      <script>
        const canvas = document.getElementById('canvas');
        const particleEffects = ${JSON.stringify(particleEffects)};
        const cursorEffects = ${JSON.stringify(cursorEffects)};
        
        // Создаём частицы
        if (particleEffects.enabled) {
          for (let i = 0; i < particleEffects.count; i++) {
            createParticle();
          }
        }
        
        function createParticle() {
          const particle = document.createElement('div');
          const size = particleEffects.size.min + Math.random() * (particleEffects.size.max - particleEffects.size.min);
          
          particle.style.cssText = \`
            position: absolute;
            width: \${size}px;
            height: \${size}px;
            background: rgba(\${particleEffects.color.r}, \${particleEffects.color.g}, \${particleEffects.color.b}, \${particleEffects.color.alpha});
            border-radius: \${particleEffects.shape === 'circle' ? '50%' : particleEffects.shape === 'square' ? '0' : '0'};
            left: \${Math.random() * 100}%;
            top: \${Math.random() * 100}%;
            pointer-events: none;
          \`;
          
          if (particleEffects.shape === 'triangle') {
            particle.style.width = '0';
            particle.style.height = '0';
            particle.style.background = 'transparent';
            particle.style.borderLeft = \`\${size/2}px solid transparent\`;
            particle.style.borderRight = \`\${size/2}px solid transparent\`;
            particle.style.borderBottom = \`\${size}px solid rgba(\${particleEffects.color.r}, \${particleEffects.color.g}, \${particleEffects.color.b}, \${particleEffects.color.alpha})\`;
          }
          
          canvas.appendChild(particle);
          
          // Анимация
          animateParticle(particle, particleEffects.motion);
        }
        
        function animateParticle(particle, motion) {
          let x = parseFloat(particle.style.left);
          let y = parseFloat(particle.style.top);
          let speedX = (Math.random() - 0.5) * particleEffects.speed.min;
          let speedY = (Math.random() - 0.5) * particleEffects.speed.min;
          
          function update() {
            if (motion === 'float') {
              x += speedX;
              y += speedY;
            } else if (motion === 'rise') {
              y -= particleEffects.speed.min;
            } else if (motion === 'fall') {
              y += particleEffects.speed.min;
            }
            
            // Зацикливание
            if (x < 0) x = 100;
            if (x > 100) x = 0;
            if (y < 0) y = 100;
            if (y > 100) y = 0;
            
            particle.style.left = x + '%';
            particle.style.top = y + '%';
            
            requestAnimationFrame(update);
          }
          
          update();
        }
        
        // Эффекты курсора
        if (cursorEffects.enabled && cursorEffects.trail) {
          document.addEventListener('mousemove', (e) => {
            const trail = document.createElement('div');
            trail.className = 'cursor-effect';
            trail.style.width = cursorEffects.size + 'px';
            trail.style.height = cursorEffects.size + 'px';
            trail.style.left = (e.clientX - cursorEffects.size/2) + 'px';
            trail.style.top = (e.clientY - cursorEffects.size/2) + 'px';
            document.body.appendChild(trail);
            
            setTimeout(() => {
              trail.style.opacity = '0';
              setTimeout(() => trail.remove(), 500);
            }, 100);
          });
        }
      </script>
    </body>
    </html>
  `;
}

function generateParticlesHTML(particleEffects, cursorEffects) {
  return ''; // Частицы создаются через JS
}

function generateGradientHTML(options) {
  const { gradientColors = ['#8b5cf6', '#ec4899'], gradientType = 'linear', gradientAngle = 135 } = options;
  
  if (gradientType === 'radial') {
    return `<div style="background: radial-gradient(circle, ${gradientColors.join(', ')}); width: 100%; height: 100%;"></div>`;
  }
  
  return `<div style="background: linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')}); width: 100%; height: 100%;"></div>`;
}

// IPC обработчики экспортируются для использования в main.js
module.exports = {
  createCreatorWindow,
  generateWallpaper,
  defaultParticleEffects,
  defaultFilters,
  defaultCursorEffects,
  
  // Функции для IPC (вызываются из main.js)
  openWallpaperCreator: () => {
    const window = createCreatorWindow();
    return { success: true, windowId: window.id };
  },
  
  generateWallpaperHandler: async (options) => {
    return await generateWallpaper(options);
  },
  
  previewWallpaperHandler: async (options) => {
    const html = generateWallpaperHTML(options);
    return { success: true, html };
  }
};
