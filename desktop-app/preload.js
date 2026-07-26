const { contextBridge, ipcRenderer } = require('electron');

// API для взаимодействия с main процессом
contextBridge.exposeInMainWorld('electronAPI', {
  // Универсальный метод для слушания событий
  on: (channel, callback) => {
    ipcRenderer.on(channel, callback);
  },

  // Загрузка локализации
  loadLocales: () => ipcRenderer.invoke('load-locales'),
  
  // Управление окном
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // Режим рабочего стола
  toggleDesktopMode: () => ipcRenderer.invoke('toggle-desktop-mode'),
  getDesktopMode: () => ipcRenderer.invoke('get-desktop-mode'),
  onDesktopModeChanged: (callback) => {
    ipcRenderer.on('desktop-mode-changed', (event, isActive) => callback(isActive));
  },

  // Навигация
  onNavigateTo: (callback) => {
    ipcRenderer.on('navigate-to', (event, page) => callback(page));
  },

  // Файлы
  getDesktopFiles: () => ipcRenderer.invoke('get-desktop-files'),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // Виджеты
  openWidget: (widgetType) => ipcRenderer.invoke('open-widget', widgetType),
  closeWidget: (widgetId) => ipcRenderer.invoke('close-widget', widgetId),
  openWidgetSettings: (widgetType) => ipcRenderer.invoke('open-widget-settings', widgetType),
  takeScreenshot: () => ipcRenderer.invoke('take-screenshot'),
  navigateToSettings: () => ipcRenderer.invoke('navigate-to-settings'),
  
  // Quick Tools
  openCalculator: () => ipcRenderer.invoke('open-calculator'),
  openFileExplorer: () => ipcRenderer.invoke('open-file-explorer'),
  openCalendar: () => ipcRenderer.invoke('open-calendar'),
  openAiAssistant: () => ipcRenderer.invoke('open-ai-assistant'),
  
  getWidgetsConfig: () => ipcRenderer.invoke('get-widgets-config'),
  updateWidgetConfig: (widgetId, updates) => ipcRenderer.invoke('update-widget-config', widgetId, updates),
  toggleWidget: (widgetId, enabled) => ipcRenderer.invoke('toggle-widget', widgetId, enabled),
  getGlobalWidgetSettings: () => ipcRenderer.invoke('get-global-widget-settings'),
  updateGlobalWidgetSettings: (settings) => ipcRenderer.invoke('update-global-widget-settings', settings),
  getWidgetSettings: (widgetId) => ipcRenderer.invoke('get-widget-settings', widgetId),
  updateWidgetSettings: (widgetId, settings) => ipcRenderer.invoke('update-widget-settings', widgetId, settings),
  showWidgetContextMenu: (widgetId, x, y) => ipcRenderer.invoke('show-widget-context-menu', widgetId, x, y),
  getWidgetContextMenuLabels: () => ipcRenderer.invoke('get-widget-context-menu-labels'),
  updateWidgetSize: (width, height) => ipcRenderer.invoke('update-widget-size', width, height),
  onGlobalSettingsChanged: (callback) => {
    ipcRenderer.on('global-settings-changed', (event, settings) => callback(settings));
  },
  onWidgetSettingsChanged: (callback) => {
    ipcRenderer.on('widget-settings-changed', (event, settings) => callback(settings));
  },

  // Конфигурация боксов
  getBoxesConfig: () => ipcRenderer.invoke('get-boxes-config'),
  getBoxConfig: (boxId) => ipcRenderer.invoke('get-box-config', boxId),
  updateBoxesConfig: (config) => ipcRenderer.invoke('update-boxes-config', config),
  updateBoxConfig: (boxId, updates) => ipcRenderer.invoke('update-box-config', boxId, updates),
  getBoxItems: (boxId) => ipcRenderer.invoke('get-box-items', boxId),
  addItemsToBox: (boxId, items) => ipcRenderer.invoke('add-items-to-box', boxId, items),
  removeItemFromBox: (boxId, itemPath) => ipcRenderer.invoke('remove-item-from-box', boxId, itemPath),
  renameFile: (oldPath, newName) => ipcRenderer.invoke('rename-file', oldPath, newName),
  getFolderFiles: (folderPath) => ipcRenderer.invoke('get-folder-files', folderPath),
  applyBoxRules: (mode) => ipcRenderer.invoke('apply-box-rules', mode),
  sortBoxItems: (mode) => ipcRenderer.invoke('sort-box-items', mode),
  onBoxConfigUpdated: (callback) => {
    ipcRenderer.on('box-config-updated', (event, boxId, updates) => callback(boxId, updates));
  },

  // Контекстное меню
  createBoxFromContextMenu: (position) => ipcRenderer.invoke('create-box-from-context-menu', position),
  organizeDesktopIcons: () => ipcRenderer.invoke('organize-desktop-icons'),
  
  // Box Selection (создание выделением)
  startBoxSelection: () => ipcRenderer.invoke('start-box-selection'),

  // Weather API
  getWeather: (city) => ipcRenderer.invoke('get-weather', city),
  searchCities: (query) => ipcRenderer.invoke('search-cities', query),

  // Calendar Sync
  getCalendarEvents: (options) => ipcRenderer.invoke('get-calendar-events', options),
  connectGoogleCalendar: () => ipcRenderer.invoke('connect-google-calendar'),
  exchangeGoogleCode: (code) => ipcRenderer.invoke('exchange-google-code', code),
  saveGoogleCalendarTokens: (tokens) => ipcRenderer.invoke('save-google-calendar-tokens', tokens),
  disconnectGoogleCalendar: () => ipcRenderer.invoke('disconnect-google-calendar'),
  toggleWindowsCalendar: (enabled) => ipcRenderer.invoke('toggle-windows-calendar', enabled),
  getCalendarSyncStatus: () => ipcRenderer.invoke('get-calendar-sync-status'),

  // Taskbar Customizer
  getTaskbarStyles: () => ipcRenderer.invoke('get-taskbar-styles'),
  getTaskbarConfig: () => ipcRenderer.invoke('get-taskbar-config'),
  saveTaskbarConfig: (config) => ipcRenderer.invoke('save-taskbar-config', config),
  enableCustomTaskbar: (config) => ipcRenderer.invoke('enable-custom-taskbar', config),
  disableCustomTaskbar: () => ipcRenderer.invoke('disable-custom-taskbar'),

  // Cursor Customizer
  getCursorStyles: () => ipcRenderer.invoke('get-cursor-styles'),
  getCursorConfig: () => ipcRenderer.invoke('get-cursor-config'),
  saveCursorConfig: (config) => ipcRenderer.invoke('save-cursor-config', config),
  enableCustomCursor: (config) => ipcRenderer.invoke('enable-custom-cursor', config),
  disableCustomCursor: () => ipcRenderer.invoke('disable-custom-cursor'),
  getCursorHTML: (config) => ipcRenderer.invoke('get-cursor-html', config),

  // Native Windows API
  hideSystemTaskbar: () => ipcRenderer.invoke('hide-system-taskbar'),
  showSystemTaskbar: () => ipcRenderer.invoke('show-system-taskbar'),
  toggleSystemTaskbar: () => ipcRenderer.invoke('toggle-system-taskbar'),
  hideStartButton: () => ipcRenderer.invoke('hide-start-button'),
  showStartButton: () => ipcRenderer.invoke('show-start-button'),
  setDesktopIconsVisible: (visible) => ipcRenderer.invoke('set-desktop-icons-visible', visible),
  configureStartMenu: (options) => ipcRenderer.invoke('configure-start-menu', options),
  setSystemCursor: (cursorFile, cursorType) => ipcRenderer.invoke('set-system-cursor', cursorFile, cursorType),
  restoreDefaultCursors: () => ipcRenderer.invoke('restore-default-cursors'),
  setSystemWallpaper: (imagePath) => ipcRenderer.invoke('set-system-wallpaper', imagePath),
  minimizeAllWindows: () => ipcRenderer.invoke('minimize-all-windows'),

  // OAuth Server
  startOAuthServer: () => ipcRenderer.invoke('start-oauth-server'),
  stopOAuthServer: () => ipcRenderer.invoke('stop-oauth-server'),
  startOAuthFlow: () => ipcRenderer.invoke('start-oauth-flow'),
  getOAuthTokens: () => ipcRenderer.invoke('get-oauth-tokens'),
  revokeOAuthTokens: () => ipcRenderer.invoke('revoke-oauth-tokens'),
  checkOAuthConfiguration: () => ipcRenderer.invoke('check-oauth-configuration'),

  // Private Box
  privateBoxExists: () => ipcRenderer.invoke('private-box-exists'),
  createPrivateBox: (data) => ipcRenderer.invoke('create-private-box', data),
  verifyPrivateBoxPassword: (password) => ipcRenderer.invoke('verify-private-box-password', password),
  unlockPrivateBox: (password) => ipcRenderer.invoke('unlock-private-box', password),
  lockPrivateBox: () => ipcRenderer.invoke('lock-private-box'),
  getPrivateBoxStatus: () => ipcRenderer.invoke('get-private-box-status'),
  addItemToPrivateBox: (itemPath) => ipcRenderer.invoke('add-item-to-private-box', itemPath),
  removeItemFromPrivateBox: (itemPath) => ipcRenderer.invoke('remove-item-from-private-box', itemPath),
  getPrivateBoxItems: () => ipcRenderer.invoke('get-private-box-items'),
  changePrivateBoxPassword: (oldPassword, newPassword) => ipcRenderer.invoke('change-private-box-password', oldPassword, newPassword),
  recoverPrivateBoxPassword: (email) => ipcRenderer.invoke('recover-private-box-password', email),
  deletePrivateBox: (password) => ipcRenderer.invoke('delete-private-box', password),
  openPrivateBoxModal: (type) => ipcRenderer.invoke('open-private-box-modal', type),

  // AI Integration
  getAIConfig: () => ipcRenderer.invoke('get-ai-config'),
  updateAIConfig: (updates) => ipcRenderer.invoke('update-ai-config', updates),
  setAIApiKey: (provider, key) => ipcRenderer.invoke('set-ai-api-key', provider, key),
  getAIApiKeyStatus: (provider) => ipcRenderer.invoke('get-ai-api-key-status', provider),
  chatWithAI: (provider, message, sessionId, options) => ipcRenderer.invoke('chat-with-ai', provider, message, sessionId, options),
  analyzeImage: (provider, base64Image, prompt) => ipcRenderer.invoke('analyze-image', provider, base64Image, prompt),
  clearChatHistory: (sessionId) => ipcRenderer.invoke('clear-chat-history', sessionId),
  getChatHistory: (sessionId) => ipcRenderer.invoke('get-chat-history', sessionId),

  // Wallpaper Management
  setStaticWallpaper: (imagePath) => ipcRenderer.invoke('set-static-wallpaper', imagePath),
  setLiveWallpaper: (videoPath, options) => ipcRenderer.invoke('set-live-wallpaper', videoPath, options),
  stopWallpaper: () => ipcRenderer.invoke('stop-wallpaper'),
  startWallpaperPlaylist: (wallpapers, options) => ipcRenderer.invoke('start-wallpaper-playlist', wallpapers, options),
  stopWallpaperPlaylist: () => ipcRenderer.invoke('stop-wallpaper-playlist'),
  getCurrentWallpaper: () => ipcRenderer.invoke('get-current-wallpaper'),
  getPlaylistStatus: () => ipcRenderer.invoke('get-playlist-status'),
  toggleWallpaperPause: () => ipcRenderer.invoke('toggle-wallpaper-pause'),
  setWallpaperVolume: (volume) => ipcRenderer.invoke('set-wallpaper-volume', volume),
  selectWallpaperFile: (filters) => ipcRenderer.invoke('select-wallpaper-file', filters),
  
  // Wallpaper Creator
  openWallpaperCreator: () => ipcRenderer.invoke('open-wallpaper-creator'),
  generateWallpaper: (options) => ipcRenderer.invoke('generate-wallpaper', options),
  previewWallpaper: (options) => ipcRenderer.invoke('preview-wallpaper', options),

  // Language
  languageChanged: (lang) => ipcRenderer.send('language-changed', lang),
  onLanguageChanged: (callback) => {
    ipcRenderer.on('language-changed', (event, lang) => callback(lang));
  },

  // Snapshot System
  createSnapshot: (data) => ipcRenderer.invoke('create-snapshot', data),
  getSnapshots: () => ipcRenderer.invoke('get-snapshots'),
  restoreSnapshot: (snapshotId) => ipcRenderer.invoke('restore-snapshot', snapshotId),
  deleteSnapshot: (snapshotId) => ipcRenderer.invoke('delete-snapshot', snapshotId),
  exportSnapshot: (snapshotId) => ipcRenderer.invoke('export-snapshot', snapshotId),
  importSnapshot: () => ipcRenderer.invoke('import-snapshot'),
  onSnapshotRestored: (callback) => {
    ipcRenderer.on('snapshot-restored', (event, snapshot) => callback(snapshot));
  },

  // Account Management
  accountLoadSession: () => ipcRenderer.invoke('account-load-session'),
  accountSignUp: (email, password, fullName) => ipcRenderer.invoke('account-signup', email, password, fullName),
  accountSignIn: (email, password) => ipcRenderer.invoke('account-signin', email, password),
  accountSignOut: () => ipcRenderer.invoke('account-signout'),
  accountResetPassword: (email) => ipcRenderer.invoke('account-reset-password', email),
  accountChangePassword: (currentPassword, newPassword) => ipcRenderer.invoke('account-change-password', currentPassword, newPassword),
  accountActivateLicense: (licenseKey) => ipcRenderer.invoke('account-activate-license', licenseKey),
  accountGetCurrentUser: () => ipcRenderer.invoke('account-get-current-user'),
  accountIsAuthenticated: () => ipcRenderer.invoke('account-is-authenticated'),
  accountIsProUser: () => ipcRenderer.invoke('account-is-pro-user'),
  accountGetPrivateBoxes: () => ipcRenderer.invoke('account-get-private-boxes'),
  accountCreatePrivateBox: (name, passwordHash, recoveryEmail) => ipcRenderer.invoke('account-create-private-box', name, passwordHash, recoveryEmail),
  accountUpdatePrivateBox: (boxId, updates) => ipcRenderer.invoke('account-update-private-box', boxId, updates),
  accountSaveSnapshot: (name, description, snapshotData) => ipcRenderer.invoke('account-save-snapshot', name, description, snapshotData),
  accountGetSnapshots: () => ipcRenderer.invoke('account-get-snapshots'),
  accountDeleteSnapshot: (snapshotId) => ipcRenderer.invoke('account-delete-snapshot', snapshotId),
  accountUpdateProfile: (updates) => ipcRenderer.invoke('account-update-profile', updates),

  // Start Menu
  toggleStartMenu: () => ipcRenderer.invoke('start-menu:toggle'),
  closeStartMenu: () => ipcRenderer.invoke('start-menu:close'),
  getStartMenuApps: () => ipcRenderer.invoke('start-menu:get-apps'),
  searchStartMenuApps: (query) => ipcRenderer.invoke('start-menu:search', query),
  launchStartMenuApp: (appPath) => ipcRenderer.invoke('start-menu:launch-app', appPath),
  getPinnedApps: () => ipcRenderer.invoke('start-menu:get-pinned'),
  togglePinApp: (appPath) => ipcRenderer.invoke('start-menu:toggle-pin', appPath),
  powerAction: (action) => ipcRenderer.invoke('start-menu:power', action),
  getUserName: () => ipcRenderer.invoke('start-menu:get-user-name'),
  openFolder: (folderPath) => ipcRenderer.invoke('start-menu:open-folder', folderPath),
  onStartMenuToggle: (callback) => {
    ipcRenderer.on('start-menu-toggled', (event, isOpen) => callback(isOpen));
  },

  // Folder Portal
  getFolderContents: (folderPath) => ipcRenderer.invoke('get-folder-contents', folderPath),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFolderInExplorer: (folderPath) => ipcRenderer.invoke('open-folder-in-explorer', folderPath),

  // Double-click to Hide All Boxes
  toggleAllBoxes: () => ipcRenderer.invoke('toggle-all-boxes'),
  getBoxesVisibility: () => ipcRenderer.invoke('get-boxes-visibility'),
  onBoxesVisibilityChanged: (callback) => {
    ipcRenderer.on('boxes-visibility-changed', (event, visible) => callback(visible));
  },

  // New File Detection
  startFileWatcher: (folderPath) => ipcRenderer.invoke('start-file-watcher', folderPath),
  stopFileWatcher: (folderPath) => ipcRenderer.invoke('stop-file-watcher', folderPath),
  onNewFileDetected: (callback) => {
    ipcRenderer.on('new-file-detected', (event, data) => callback(data));
  },

  // Lock Screen Wallpaper
  setLockScreenWallpaper: (imagePath) => ipcRenderer.invoke('set-lock-screen-wallpaper', imagePath),
  getLockScreenWallpaper: () => ipcRenderer.invoke('get-lock-screen-wallpaper'),

  // System Information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Open File/Folder
  openInExplorer: (itemPath) => ipcRenderer.invoke('open-in-explorer', itemPath),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // Desktop Icons Manager
  getIconsStyle: () => ipcRenderer.invoke('get-icons-style'),
  setIconsStyle: (styleId) => ipcRenderer.invoke('set-icons-style', styleId),
  setDesktopIconsVisible: (visible) => ipcRenderer.invoke('set-desktop-icons-visible', visible),
  refreshDesktopIcons: () => ipcRenderer.invoke('refresh-desktop-icons'),
  getIconsInfo: () => ipcRenderer.invoke('get-icons-info'),

  // Платформа
  platform: process.platform
});
