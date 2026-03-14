// ========================================
// Wallpaper Manager Module
// Handles live and static wallpapers
// ========================================

const { BrowserWindow, screen } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class WallpaperManager {
  constructor() {
    this.wallpaperWindow = null;
    this.currentWallpaper = null;
    this.playlist = [];
    this.playlistIndex = 0;
    this.playlistInterval = null;
    this.isPlaying = false;
  }

  // Создать окно для обоев
  async createWallpaperWindow() {
    if (this.wallpaperWindow && !this.wallpaperWindow.isDestroyed()) {
      return this.wallpaperWindow;
    }

    const displays = screen.getAllDisplays();
    const primaryDisplay = screen.getPrimaryDisplay();

    // Создаем окно на весь экран
    this.wallpaperWindow = new BrowserWindow({
      x: 0,
      y: 0,
      width: primaryDisplay.bounds.width,
      height: primaryDisplay.bounds.height,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      alwaysOnTop: false, // На уровне рабочего стола
      skipTaskbar: true,
      resizable: false,
      movable: false,
      focusable: false,
      hasShadow: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Устанавливаем окно на уровень рабочего стола
    this.wallpaperWindow.setAlwaysOnTop(false, 'desktop');
    this.wallpaperWindow.setVisibleOnAllWorkspaces(true);

    return this.wallpaperWindow;
  }

  // Установить статические обои
  async setStaticWallpaper(imagePath) {
    try {
      const window = await this.createWallpaperWindow();
      
      // Остановить плейлист если есть
      this.stopPlaylist();

      // Загрузить HTML для статических обоев
      const html = await this.generateStaticWallpaperHTML(imagePath);
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      this.currentWallpaper = {
        type: 'static',
        path: imagePath
      };

      return { success: true };
    } catch (error) {
      console.error('Error setting static wallpaper:', error);
      return { success: false, error: error.message };
    }
  }

  // Установить живые обои (видео)
  async setLiveWallpaper(videoPath, options = {}) {
    try {
      const window = await this.createWallpaperWindow();
      
      // Остановить плейлист если есть
      this.stopPlaylist();

      // Загрузить HTML для живых обоев
      const html = await this.generateLiveWallpaperHTML(videoPath, options);
      window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

      this.currentWallpaper = {
        type: 'live',
        path: videoPath,
        options: {
          muted: options.muted ?? true,
          loop: options.loop ?? true,
          volume: options.volume ?? 0
        }
      };

      this.isPlaying = true;

      return { success: true };
    } catch (error) {
      console.error('Error setting live wallpaper:', error);
      return { success: false, error: error.message };
    }
  }

  // Сгенерировать HTML для статических обоев
  async generateStaticWallpaperHTML(imagePath) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body {
            overflow: hidden;
            background: #000;
          }
          img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        </style>
      </head>
      <body>
        <img src="${imagePath}" alt="Wallpaper">
      </body>
      </html>
    `;
  }

  // Сгенерировать HTML для живых обоев
  async generateLiveWallpaperHTML(videoPath, options = {}) {
    const muted = options.muted ?? true;
    const loop = options.loop ?? true;
    const volume = options.volume ?? 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; }
          body {
            overflow: hidden;
            background: #000;
          }
          video {
            position: absolute;
            top: 50%;
            left: 50%;
            min-width: 100%;
            min-height: 100%;
            width: auto;
            height: auto;
            transform: translateX(-50%) translateY(-50%);
            z-index: 0;
          }
        </style>
      </head>
      <body>
        <video autoplay ${loop ? 'loop' : ''} ${muted ? 'muted' : ''} 
               playsinline preload="auto">
          <source src="${videoPath}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <script>
          const video = document.querySelector('video');
          video.volume = ${volume};
          
          // Обработка ошибок
          video.addEventListener('error', (e) => {
            console.error('Video error:', e);
          });
          
          // Принудительный запуск
          video.play().catch(err => {
            console.error('Auto-play failed:', err);
          });
        <\/script>
      </body>
      </html>
    `;
  }

  // Остановить текущие обои
  async stopWallpaper() {
    if (this.wallpaperWindow && !this.wallpaperWindow.isDestroyed()) {
      this.wallpaperWindow.close();
      this.wallpaperWindow = null;
    }

    this.stopPlaylist();
    this.currentWallpaper = null;
    this.isPlaying = false;

    return { success: true };
  }

  // Запустить плейлист обоев
  async startPlaylist(wallpapers, options = {}) {
    if (!wallpapers || wallpapers.length === 0) {
      return { success: false, error: 'Empty playlist' };
    }

    this.playlist = wallpapers;
    this.playlistIndex = 0;
    this.isPlaying = true;

    const interval = options.interval || 300000; // 5 минут по умолчанию
    const shuffle = options.shuffle || false;

    if (shuffle) {
      this.shufflePlaylist();
    }

    // Запустить первый элемент
    await this.playCurrentWallpaper();

    // Установить интервал переключения
    this.playlistInterval = setInterval(async () => {
      this.nextWallpaper(shuffle);
      await this.playCurrentWallpaper();
    }, interval);

    return { success: true };
  }

  // Воспроизвести текущие обои из плейлиста
  async playCurrentWallpaper() {
    const wallpaper = this.playlist[this.playlistIndex];
    
    if (!wallpaper) {
      return { success: false, error: 'Invalid playlist index' };
    }

    if (wallpaper.type === 'live' || wallpaper.path.endsWith('.mp4') || 
        wallpaper.path.endsWith('.webm') || wallpaper.path.endsWith('.mov')) {
      return await this.setLiveWallpaper(wallpaper.path, wallpaper.options || {});
    } else {
      return await this.setStaticWallpaper(wallpaper.path);
    }
  }

  // Следующие обои в плейлисте
  nextWallpaper(shuffle = false) {
    if (shuffle) {
      this.playlistIndex = Math.floor(Math.random() * this.playlist.length);
    } else {
      this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
    }
  }

  // Перемешать плейлист
  shufflePlaylist() {
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }
  }

  // Остановить плейлист
  stopPlaylist() {
    if (this.playlistInterval) {
      clearInterval(this.playlistInterval);
      this.playlistInterval = null;
    }
    this.playlist = [];
    this.playlistIndex = 0;
  }

  // Получить текущие обои
  getCurrentWallpaper() {
    return this.currentWallpaper;
  }

  // Получить статус плейлиста
  getPlaylistStatus() {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.playlistIndex,
      total: this.playlist.length,
      hasInterval: this.playlistInterval !== null
    };
  }

  // Пауза/возобновление видео
  async togglePause() {
    if (!this.wallpaperWindow || this.wallpaperWindow.isDestroyed()) {
      return { success: false, error: 'Wallpaper window not found' };
    }

    await this.wallpaperWindow.webContents.executeJavaScript(`
      const video = document.querySelector('video');
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        return !video.paused;
      }
      return null;
    `);

    return { success: true };
  }

  // Изменить громкость
  async setVolume(volume) {
    if (!this.wallpaperWindow || this.wallpaperWindow.isDestroyed()) {
      return { success: false, error: 'Wallpaper window not found' };
    }

    await this.wallpaperWindow.webContents.executeJavaScript(`
      const video = document.querySelector('video');
      if (video) {
        video.volume = Math.max(0, Math.min(1, ${volume}));
      }
    `);

    return { success: true };
  }
}

// Экспортируем singleton
module.exports = new WallpaperManager();
