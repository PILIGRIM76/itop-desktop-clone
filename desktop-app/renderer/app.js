// ========================================
// iTop Easy Desktop Clone - Main App Logic
// ========================================

// ========================================
// Localization (i18n) System
// ========================================
let currentLanguage = 'ru'; // По умолчанию русский язык
let locales = {};

// Load locales
async function loadLocales() {
  try {
    // Загружаем через IPC из main процесса
    const localesData = await window.electronAPI.loadLocales();
    locales = JSON.parse(localesData);
    
    console.log('✅ Locales loaded via IPC. Languages:', Object.keys(locales));
    console.log('✅ widgets.schedule (ru):', locales.ru?.widgets?.schedule);
    console.log('✅ widgets.clock (ru):', locales.ru?.widgets?.clock);
  } catch (error) {
    console.error('❌ Error loading locales via IPC:', error.message);
    console.log('🔄 Using embedded locales...');
    locales = getEmbeddedLocales();
    console.log('✅ Embedded locales loaded. Languages:', Object.keys(locales));
    console.log('✅ widgets.schedule (ru):', locales.ru?.widgets?.schedule);
    console.log('✅ widgets.clock (ru):', locales.ru?.widgets?.clock);
  }
}

// Get translation
function t(key, lang = currentLanguage) {
  const keys = key.split('.');
  let value = locales[lang];
  
  console.log(`t('${key}'): lang='${lang}', keys=`, keys);
  
  // Вложенный поиск (например, widgets -> schedule)
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
      console.log(`  -> found '${k}', value=`, value);
    } else {
      console.log(`  -> '${k}' not found, returning key`);
      return key; // Ключ не найден, возвращаем оригинал
    }
  }
  const result = value || key;
  console.log(`t('${key}') = '${result}'`);
  return result;
}

// Apply translations to all elements with data-i18n
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = translation;
    } else {
      el.textContent = translation;
    }
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const translation = t(key);
    if (translation) {
      el.title = translation;
    }
  });

  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    const translation = t(key);
    if (translation) {
      el.setAttribute('aria-label', translation);
    }
  });

  // Update nav tooltips
  document.querySelectorAll('.nav-item').forEach(item => {
    const tab = item.dataset.tab;
    const tooltip = item.querySelector('.nav-tooltip');
    if (tooltip && tab) {
      const navKey = `nav.${tab}`;
      const translation = t(navKey);
      if (translation) tooltip.textContent = translation;
    }
  });

  // Update desktop mode tooltip
  const desktopModeTooltip = document.querySelector('#desktopModeBtn .nav-tooltip');
  if (desktopModeTooltip) {
    desktopModeTooltip.textContent = t('nav.desktopMode');
  }
  
  // Update all dynamically generated content
  renderBoxes();
  renderWallpapers();
  renderThemes();
  renderWidgets();
  renderAIFeatures();
}

// Save language preference
function saveLanguagePreference(lang) {
  localStorage.setItem('preferredLanguage', lang);
}

// Load language preference
function loadLanguagePreference() {
  return localStorage.getItem('preferredLanguage') || 'ru'; // По умолчанию русский
}

// Set language
function setLanguage(lang) {
  if (locales[lang]) {
    currentLanguage = lang;
    console.log(`✅ setLanguage: currentLanguage = '${lang}'`);
    console.log(`✅ Testing t('widgets.schedule'):`, t('widgets.schedule'));
    console.log(`✅ Testing t('widgets.clock'):`, t('widgets.clock'));
    applyTranslations();
    saveLanguagePreference(lang);
    updateLanguageButtons();
    console.log(`✅ Language changed to: ${lang}`);
  } else {
    console.error(`❌ setLanguage: No locales for lang '${lang}'`);
  }
}

// Update language buttons state
function updateLanguageButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });
}

// Change language (global function for HTML buttons)
window.changeLanguage = function(lang) {
  setLanguage(lang);
};

// Embedded locales fallback (полные переводы)
function getEmbeddedLocales() {
  return {
    ru: {
      nav: {
        boxes: 'Боксы',
        wallpapers: 'Обои',
        personalization: 'Персонализация',
        widgets: 'Виджеты',
        aiAssistant: 'AI Ассистент',
        settings: 'Настройки',
        desktopMode: 'Режим рабочего стола'
      },
      boxes: {
        title: 'Боксы',
        subtitle: 'Организуйте рабочий стол с настраиваемыми боксами',
        enableBoxes: 'Включить боксы',
        createNewBox: 'Создать новый бокс',
        fromPanel: 'Из панели',
        drawRectangle: 'Нарисовать прямоугольник',
        contextMenu: 'Контекстное меню',
        forSelectedIcons: 'Для выбранных иконок',
        folderPortal: 'Портал папки',
        folderPortalDesc: 'Создайте портал для доступа к папке прямо с рабочего стола',
        createFolderPortal: 'Создать портал папки',
        privateBox: 'Приватный бокс',
        privateBoxTitle: 'Защитите ваши приватные файлы паролем',
        privateBoxDesc: 'Только 1 приватный бокс на аккаунт. Восстановление пароля через email.',
        createPrivateBox: 'Создать приватный бокс',
        proBadge: 'PRO',
        freeAccountLimit: 'Бесплатные аккаунты: максимум 3 бокса. Обновите до Pro для неограниченных боксов.',
        itemsCount: 'элементов',
        boxesCount: 'боксов',
        searchPlaceholder: 'Поиск боксов...',
        tabs: {
          box: 'Бокс',
          appearance: 'Внешний вид',
          organization: 'Организация',
          quickActions: 'Быстрые действия',
          layout: 'Макет',
          snapshot: 'Снимок'
        }
      },
      wallpapers: {
        title: 'Обои',
        subtitle: 'Найдите потрясающие обои для рабочего стола',
        liveWallpapers: 'Живые обои',
        staticWallpapers: 'Статические обои',
        myWallpapers: 'Мои обои',
        searchPlaceholder: 'Поиск обоев...',
        popular: '🔥 Популярно на этой неделе',
        playlistSettings: 'Настройки плейлиста',
        playlist: {
          singleLoop: 'Одиночный повтор',
          shuffle: 'Перемешать',
          order: 'Порядок'
        },
        lockScreen: 'Применить к экрану блокировки',
        lockScreenDesc: 'Использовать статические обои на экране блокировки Windows',
        createCustom: 'Создать пользовательские обои',
        selectLocal: 'Выбрать локальные обои',
        playLive: 'Запустить живые обои',
        liveWallpaperControls: 'Управление живыми обоями',
        pause: 'Пауза',
        stop: 'Стоп',
        volume: 'Громкость'
      },
      widgets: {
        title: 'Виджеты',
        subtitle: 'Включите и настройте виджеты рабочего стола',
        globalSettings: 'Глобальные настройки виджетов',
        enableWidgets: 'Включить виджеты',
        enableWidgetsDesc: 'Показывать виджеты на рабочем столе',
        showInDesktopMode: 'Показывать в режиме рабочего стола',
        showInDesktopModeDesc: 'Отображать виджеты при активном режиме рабочего стола',
        alwaysOnTop: 'Всегда поверх окон',
        alwaysOnTopDesc: 'Держать виджеты над другими окнами',
        blurEffect: 'Эффект размытия',
        blurEffectDesc: 'Включить эффект размытия фона',
        animations: 'Анимации',
        animationsDesc: 'Включить анимации виджетов',
        transparency: 'Прозрачность',
        transparencyDesc: 'Прозрачность фона виджета',
        scale: 'Масштаб',
        scaleDesc: 'Глобальный масштаб виджетов',
        schedule: 'Расписание',
        scheduleDesc: 'Напоминания о важных событиях',
        inotes: 'Заметки',
        inotesDesc: 'Заметки для важных вещей',
        clock: 'Часы',
        clockDesc: 'Аналоговые и цифровые часы',
        weather: 'Погода',
        weatherDesc: 'Будьте в курсе погоды',
        quickTools: 'Быстрые инструменты',
        quickToolsDesc: 'Мгновенный запуск основных функций',
        'quick-tools': 'Быстрые инструменты',
        'quick-toolsDesc': 'Мгновенный запуск основных функций',
        ipomodoro: 'Таймер',
        ipomodoroDesc: 'Оставайтесь сосредоточенными на любой задаче',
        chatAi: 'Chat AI',
        chatAiDesc: 'AI чат, написание, перевод, резюме',
        'chat-ai': 'Chat AI',
        'chat-aiDesc': 'AI чат, написание, перевод, резюме',
        settings: 'Настройки',
        addToDesktop: 'Добавить на рабочий стол'
      },
      settings: {
        title: 'Настройки',
        general: 'Общие',
        language: 'Язык',
        languageDesc: 'Выберите язык приложения',
        autoStart: 'Автозапуск',
        autoStartDesc: 'Запускать приложение при старте системы',
        replaceDesktop: 'Заменить рабочий стол',
        replaceDesktopDesc: 'Скрыть иконки Windows и использовать боксы iTop',
        showTray: 'Показывать в трее',
        showTrayDesc: 'Держать приложение в системном трее',
        about: 'О программе',
        version: 'Версия',
        checkUpdate: 'Проверить обновление',
        russian: 'Русский',
        english: 'English'
      },
      common: {
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
        close: 'Закрыть',
        ok: 'OK'
      },
      widgetWindow: {
        title: 'Виджет рабочего стола',
        settings: 'Настройки',
        close: 'Закрыть',
        refresh: 'Обновить',
        defaultTitle: 'Виджет',
        titles: {
          clock: 'Часы',
          weather: 'Погода',
          schedule: 'Расписание',
          notes: 'iNotes',
          pomodoro: 'iPomodoro',
          quickTools: 'Быстрые инструменты',
          chatAI: 'Chat AI'
        },
        clockLoading: 'Загрузка времени...',
        weatherPartlyCloudy: 'Переменная облачность',
        weatherHumidity: 'Влажность: {value}%',
        weatherWind: 'Ветер: {value} м/с',
        schedule: {
          teamMeeting: 'Командная встреча',
          projectReview: 'Обзор проекта',
          clientCall: 'Звонок клиенту'
        },
        notesPlaceholder: 'Напишите вашу заметку здесь...',
        pomodoro: {
          ready: 'Готовы сосредоточиться?',
          start: 'Старт',
          pause: 'Пауза',
          reset: 'Сброс',
          focusing: 'Фокусировка...',
          breakTime: 'Время перерыва!',
          paused: 'Пауза'
        },
        quickTools: {
          screenshot: 'Скриншот',
          files: 'Файлы',
          settings: 'Настройки',
          calc: 'Калькулятор',
          ai: 'AI',
          calendar: 'Календарь'
        },
        chat: {
          greeting: 'Здравствуйте! Чем я могу помочь вам сегодня?',
          placeholder: 'Введите ваше сообщение...',
          thinking: 'AI думает...',
          noKeyTitle: '⚠️ API ключ не установлен',
          noKeyDesc: 'Для реальных AI ответов установите API ключ в Настройки > AI Assistant.'
        },
        quickActionAlert: 'Открытие: {action}'
      }
    },
    en: {
      nav: {
        boxes: 'Boxes',
        wallpapers: 'Wallpapers',
        personalization: 'Personalization',
        widgets: 'Widgets',
        aiAssistant: 'AI Assistant',
        settings: 'Settings',
        desktopMode: 'Desktop Mode'
      },
      boxes: {
        title: 'Boxes',
        subtitle: 'Organize your desktop with customizable boxes',
        enableBoxes: 'Enable Boxes',
        createNewBox: 'Create New Box',
        fromPanel: 'From Panel',
        drawRectangle: 'Draw Rectangle',
        contextMenu: 'Context Menu',
        forSelectedIcons: 'For Selected Icons',
        folderPortal: 'Folder Portal',
        folderPortalDesc: 'Create a portal to access a folder directly from desktop',
        createFolderPortal: 'Create Folder Portal',
        privateBox: 'Private Box',
        privateBoxTitle: 'Protect your private files with password',
        privateBoxDesc: 'Only 1 private box per account. Password recovery via email.',
        createPrivateBox: 'Create Private Box',
        proBadge: 'PRO',
        freeAccountLimit: 'Free accounts: 3 boxes max. Upgrade to Pro for unlimited boxes.',
        itemsCount: 'items',
        boxesCount: 'boxes',
        searchPlaceholder: 'Search boxes...',
        tabs: {
          box: 'Box',
          appearance: 'Appearance',
          organization: 'Organization',
          quickActions: 'Quick Actions',
          layout: 'Layout',
          snapshot: 'Snapshot'
        }
      },
      wallpapers: {
        title: 'Wallpapers',
        subtitle: 'Discover stunning wallpapers for your desktop',
        liveWallpapers: 'Live Wallpapers',
        staticWallpapers: 'Static Wallpapers',
        myWallpapers: 'My Wallpapers',
        searchPlaceholder: 'Search wallpapers...',
        popular: '🔥 Popular This Week',
        playlistSettings: 'Playlist Settings',
        playlist: {
          singleLoop: 'Single Loop',
          shuffle: 'Shuffle',
          order: 'Order'
        },
        lockScreen: 'Apply to Lock Screen',
        lockScreenDesc: 'Use static wallpaper on Windows lock screen',
        createCustom: 'Create Custom Wallpaper',
        selectLocal: 'Select Local Wallpaper',
        playLive: 'Play Live Wallpaper',
        liveWallpaperControls: 'Live Wallpaper Controls',
        pause: 'Pause',
        stop: 'Stop',
        volume: 'Volume'
      },
      widgets: {
        title: 'Widgets',
        subtitle: 'Enable and customize desktop widgets',
        globalSettings: 'Global Widget Settings',
        enableWidgets: 'Enable Widgets',
        enableWidgetsDesc: 'Show widgets on desktop',
        showInDesktopMode: 'Show in Desktop Mode',
        showInDesktopModeDesc: 'Display widgets when desktop mode is active',
        alwaysOnTop: 'Always on Top',
        alwaysOnTopDesc: 'Keep widgets above other windows',
        blurEffect: 'Blur Effect',
        blurEffectDesc: 'Enable background blur effect',
        animations: 'Animations',
        animationsDesc: 'Enable widget animations',
        transparency: 'Transparency',
        transparencyDesc: 'Widget background transparency',
        scale: 'Scale',
        scaleDesc: 'Global widget scale',
        schedule: 'Schedule',
        scheduleDesc: 'Remind you of important events',
        inotes: 'iNotes',
        inotesDesc: 'Take notes for important things',
        clock: 'Clock',
        clockDesc: 'Dial Clock and Digital Clock styles',
        weather: 'Weather',
        weatherDesc: 'Keep updated on weather',
        quickTools: 'Quick Tools',
        quickToolsDesc: 'Instantly launch core features',
        'quick-tools': 'Quick Tools',
        'quick-toolsDesc': 'Instantly launch core features',
        ipomodoro: 'iPomodoro',
        ipomodoroDesc: 'Stay focused on any task',
        chatAi: 'Chat AI',
        chatAiDesc: 'AI chat, writing, translate, summary',
        'chat-ai': 'Chat AI',
        'chat-aiDesc': 'AI chat, writing, translate, summary',
        settings: 'Settings',
        addToDesktop: 'Add to Desktop'
      },
      settings: {
        title: 'Settings',
        general: 'General',
        language: 'Language',
        languageDesc: 'Select application language',
        autoStart: 'Auto Start',
        autoStartDesc: 'Launch app on system startup',
        replaceDesktop: 'Replace Desktop',
        replaceDesktopDesc: 'Hide Windows desktop icons and use iTop boxes',
        showTray: 'Show in System Tray',
        showTrayDesc: 'Keep application running in system tray',
        about: 'About',
        version: 'Version',
        checkUpdate: 'Check for Update',
        russian: 'Русский',
        english: 'English'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        ok: 'OK'
      },
      widgetWindow: {
        title: 'Desktop Widget',
        settings: 'Settings',
        close: 'Close',
        refresh: 'Refresh',
        defaultTitle: 'Widget',
        titles: {
          clock: 'Clock',
          weather: 'Weather',
          schedule: 'Schedule',
          notes: 'iNotes',
          pomodoro: 'iPomodoro',
          quickTools: 'Quick Tools',
          chatAI: 'Chat AI'
        },
        clockLoading: 'Loading time...',
        weatherPartlyCloudy: 'Partly Cloudy',
        weatherHumidity: 'Humidity: {value}%',
        weatherWind: 'Wind: {value} m/s',
        schedule: {
          teamMeeting: 'Team Meeting',
          projectReview: 'Project Review',
          clientCall: 'Client Call'
        },
        notesPlaceholder: 'Write your note here...',
        pomodoro: {
          ready: 'Ready to focus?',
          start: 'Start',
          pause: 'Pause',
          reset: 'Reset',
          focusing: 'Focusing...',
          breakTime: 'Break time!',
          paused: 'Paused'
        },
        quickTools: {
          screenshot: 'Screenshot',
          files: 'Files',
          settings: 'Settings',
          calc: 'Calculator',
          ai: 'AI',
          calendar: 'Calendar'
        },
        chat: {
          greeting: 'Hello! How can I help you today?',
          placeholder: 'Type your message...',
          thinking: 'AI is thinking...',
          noKeyTitle: '⚠️ No API Key Set',
          noKeyDesc: 'To enable real AI responses, please set your API key in Settings > AI Assistant.'
        },
        quickActionAlert: 'Opening {action}...'
      }
    }
  };
}

// State
const state = {
  currentTab: 'boxes',
  currentSubtab: 'box',
  boxes: [],
  wallpapers: [
    { id: '1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', title: 'Mountain Sunrise', resolution: '4K', downloads: 12500, favorites: 3200, category: 'nature' },
    { id: '2', url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400', title: 'Ocean Waves', resolution: '4K', downloads: 8900, favorites: 2100, category: 'nature' },
    { id: '3', url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400', title: 'Aurora Borealis', resolution: '4K', downloads: 15200, favorites: 4500, category: 'space' },
    { id: '4', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400', title: 'Starry Night', resolution: '4K', downloads: 22100, favorites: 6800, category: 'space' },
    { id: '5', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400', title: 'City Lights', resolution: '4K', downloads: 7800, favorites: 1900, category: 'city' },
    { id: '6', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', title: 'Gaming Setup', resolution: '4K', downloads: 11300, favorites: 2800, category: 'gaming' }
  ],
  themes: [
    { id: 'default', name: 'Default', color: '#3b82f6', preview: 'linear-gradient(135deg, #1a1d2e 0%, #252a3d 100%)' },
    { id: 'dark', name: 'Dark', color: '#1f2937', preview: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' },
    { id: 'light', name: 'Light', color: '#f3f4f6', preview: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)' },
    { id: 'nature', name: 'Nature', color: '#10b981', preview: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)' },
    { id: 'gaming', name: 'Gaming', color: '#8b5cf6', preview: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)' },
    { id: 'professional', name: 'Professional', color: '#64748b', preview: 'linear-gradient(135deg, #334155 0%, #64748b 100%)' }
  ],
  widgets: [
    { id: 'schedule', name: 'Schedule', description: 'Remind you of important events', icon: 'calendar', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', enabled: true },
    { id: 'inotes', name: 'iNotes', description: 'Take notes for important things', icon: 'note', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', enabled: false },
    { id: 'clock', name: 'Clock', description: 'Dial Clock and Digital Clock styles', icon: 'clock', gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', enabled: true },
    { id: 'weather', name: 'Weather', description: 'Keep updated on weather', icon: 'cloud', gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', enabled: false },
    { id: 'quick-tools', name: 'Quick Tools', description: 'Instantly launch core features', icon: 'zap', gradient: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)', enabled: true },
    { id: 'ipomodoro', name: 'iPomodoro', description: 'Stay focused on any task', icon: 'timer', gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', enabled: false },
    { id: 'chat-ai', name: 'Chat AI', description: 'AI chat, writing, translate, summary', icon: 'message', gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', enabled: true }
  ],
  aiFeatures: [
    { id: 'chat-ai', name: 'ChatAI', description: 'Chat with AI, get instant answers to your questions', icon: 'bot', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', enabled: true, hotkey: 'Ctrl + Shift + C' },
    { id: 'search', name: 'Search', description: 'Smart search across your desktop and files', icon: 'search', gradient: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)', enabled: true, hotkey: 'Ctrl + Shift + S' },
    { id: 'screenshot', name: 'Screenshot', description: 'Capture and edit screenshots with AI enhancement', icon: 'camera', gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)', enabled: false, hotkey: 'Ctrl + Shift + A' }
  ],
  isDesktopMode: false,
  
  // Новые состояния для редактирования
  selectedBox: null,
  editingBoxId: null,
  editingName: '',
  searchQuery: '',
  iconPickerOpen: false,
  deleteDialogOpen: false,
  boxToDelete: null,
  contextMenu: null
};

// Icons SVG
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  note: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  cloud: '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  timer: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  bot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  // Новые иконки
  grid3x3: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><line x1="3" y1="11" x2="21" y2="11"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="11" y1="3" x2="11" y2="21"/><line x1="18" y1="3" x2="18" y2="21"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  video: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
  gamepad: '<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="16" y1="18" x2="16" y2="18"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="12" y1="18" x2="12" y2="18"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  settings: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
};

// DOM Elements
let elements = {};

// Initialize
async function init() {
  // Load locales first
  await loadLocales();

  // Load saved language preference
  const savedLang = loadLanguagePreference();
  setLanguage(savedLang);

  // Initialize boxes with translated names
  state.boxes = [
    { id: '1', name: t('boxes.box1Name') || 'Programs', icon: 'grid', color: '#8b5cf6', items: [], rules: [], layoutMode: 'list' },
    { id: '2', name: t('boxes.box2Name') || 'Folders', icon: 'folder', color: '#3b82f6', items: [], rules: [], layoutMode: 'list' },
    { id: '3', name: t('boxes.box3Name') || 'Files & Documents', icon: 'file', color: '#10b981', items: [], rules: [], layoutMode: 'list' }
  ];

  cacheElements();
  setupEventListeners();
  setupLanguageSwitcher();
  renderBoxes();
  renderWallpapers();
  renderThemes();
  // renderWidgets() будет вызван в setupElectronAPI() после загрузки конфигурации
  renderAIFeatures();
  setupElectronAPI();

  // Load snapshots
  loadSnapshots();

  // Initialize Organization tab
  initOrganizationTab();

  // Load personalization settings
  loadPersonalizationSettings();

  // Initialize AI Assistant
  initAIAssistant();

  // Apply translations after all rendering is complete
  applyTranslations();
}

// Cache DOM Elements
function cacheElements() {
  elements = {
    minimizeBtn: document.getElementById('minimizeBtn'),
    maximizeBtn: document.getElementById('maximizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    desktopModeBtn: document.getElementById('desktopModeBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    panels: document.querySelectorAll('.panel'),
    tabButtons: document.querySelectorAll('.tab-button'),
    subtabContents: document.querySelectorAll('.subtab-content'),
    boxesGrid: document.getElementById('boxesGrid'),
    wallpapersGrid: document.getElementById('wallpapersGrid'),
    themesGrid: document.getElementById('themesGrid'),
    widgetsGrid: document.getElementById('widgetsGrid'),
    aiFeatures: document.getElementById('aiFeatures'),
    boxSubtab: document.getElementById('box-subtab')
  };
}

// Setup Event Listeners
function setupEventListeners() {
  // Window controls
  if (elements.minimizeBtn) {
    elements.minimizeBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.minimizeWindow();
      }
    });
  }

  if (elements.maximizeBtn) {
    elements.maximizeBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.maximizeWindow();
      }
    });
  }

  if (elements.closeBtn) {
    elements.closeBtn.addEventListener('click', () => {
      if (window.electronAPI) {
        window.electronAPI.closeWindow();
      }
    });
  }

  // Desktop mode button
  if (elements.desktopModeBtn) {
    elements.desktopModeBtn.addEventListener('click', async () => {
      if (window.electronAPI) {
        const isActive = await window.electronAPI.toggleDesktopMode();
        state.isDesktopMode = isActive;
        elements.desktopModeBtn.classList.toggle('active', isActive);
      }
    });
  }

  // Navigation
  elements.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      if (tab) {
        switchTab(tab);
      }
    });
  });

  // Tab buttons
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.dataset.subtab;
      if (subtab) {
        switchSubtab(subtab);
      }
    });
  });

  // Global click to close context menu
  document.addEventListener('click', () => {
    if (state.contextMenu) {
      state.contextMenu = null;
      // Удаляем контекстное меню из DOM
      const menu = document.getElementById('contextMenu');
      if (menu) menu.remove();
      renderBoxes();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.iconPickerOpen) {
        state.iconPickerOpen = false;
        renderIconPickerModal();
      }
      if (state.deleteDialogOpen) {
        state.deleteDialogOpen = false;
        renderDeleteDialog();
      }
      if (state.editingBoxId) {
        cancelEditing();
      }
      if (state.contextMenu) {
        state.contextMenu = null;
        renderBoxes();
      }
    }
  });
}

// Setup Language Switcher
function setupLanguageSwitcher() {
  // Language button click handlers
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
    });
  });

  // Check update button
  const checkUpdateBtn = document.getElementById('checkUpdateBtn');
  if (checkUpdateBtn) {
    checkUpdateBtn.addEventListener('click', () => {
      alert(t('settings.upToDate'));
    });
  }
}

// Setup Electron API
function setupElectronAPI() {
  if (window.electronAPI) {
    // Listen for desktop mode changes
    window.electronAPI.onDesktopModeChanged((isActive) => {
      state.isDesktopMode = isActive;
      if (elements.desktopModeBtn) {
        elements.desktopModeBtn.classList.toggle('active', isActive);
      }
    });

    // Listen for navigation from tray
    window.electronAPI.onNavigateTo((page) => {
      switchTab(page);
    });

    // Listen for widget settings changes
    window.electronAPI.onWidgetSettingsChanged((settings) => {
      console.log('Widget settings changed:', settings);
    });

    // Listen for open-widget-settings event from widget window
    window.electronAPI.on('open-widget-settings', (widgetType) => {
      console.log('Received open-widget-settings for:', widgetType);
      // Map widgetType from widget.html to widgetId in state.widgets
      const widgetIdMap = {
        'clock': 'clock',
        'weather': 'weather',
        'schedule': 'schedule',
        'notes': 'inotes',
        'pomodoro': 'ipomodoro',
        'quickTools': 'quick-tools',
        'chatAI': 'chat-ai'
      };
      const widgetId = widgetIdMap[widgetType] || widgetType;
      console.log('Mapped widgetType:', widgetType, '-> widgetId:', widgetId);
      if (window.openWidgetSettings) {
        window.openWidgetSettings(widgetId);
      }
    });

    // Listen for global settings changes
    window.electronAPI.onGlobalSettingsChanged((settings) => {
      globalWidgetSettings = settings;
      console.log('Global widget settings changed:', settings);
    });

    // Listen for box config changes (from desktop windows)
    window.electronAPI.onBoxConfigUpdated((boxId, updates) => {
      const index = state.boxes.findIndex(b => b.id === boxId);
      if (index !== -1) {
        state.boxes[index] = normalizeBoxFromConfig({ ...state.boxes[index], ...updates });
        renderBoxes();
        initOrganizationTab();
      }
    });

    // Check initial desktop mode
    window.electronAPI.getDesktopMode().then((isActive) => {
      state.isDesktopMode = isActive;
      if (elements.desktopModeBtn) {
        elements.desktopModeBtn.classList.toggle('active', isActive);
      }
    });

    // Load boxes config from main process on startup
    refreshBoxesFromConfig();

    // Load widgets config from main process on startup
    window.electronAPI.getWidgetsConfig().then((config) => {
      if (config && config.length > 0) {
        // Sync with existing state
        config.forEach((cfg) => {
          const existingWidget = state.widgets.find(w => w.id === cfg.id);
          if (existingWidget) {
            existingWidget.enabled = cfg.enabled;
          }
        });
        renderWidgets();
      }
    });

    // Load global widget settings
    loadGlobalWidgetSettings();

    // Listen for snapshot restored event
    window.electronAPI.onSnapshotRestored((snapshot) => {
      console.log('Snapshot restored:', snapshot.name);
      // Перезагружаем список снимков
      loadSnapshots();
      // Обновляем боксы
      refreshBoxesFromConfig();
    });
  }
}

function computeBoxItemCount(box) {
  const baseCount = Array.isArray(box.items) ? box.items.length : 0;
  const tabCount = Array.isArray(box.tabs)
    ? box.tabs.reduce((sum, tab) => sum + (Array.isArray(tab.items) ? tab.items.length : 0), 0)
    : 0;
  return baseCount + tabCount;
}

function updateBoxCounts() {
  state.boxes.forEach(box => {
    box.itemCount = computeBoxItemCount(box);
  });
}

function normalizeBoxFromConfig(cfg) {
  const normalized = { ...cfg };
  normalized.items = Array.isArray(cfg.items) ? cfg.items : [];
  normalized.rules = Array.isArray(cfg.rules) ? cfg.rules : [];
  normalized.tabs = Array.isArray(cfg.tabs) ? cfg.tabs : [];
  normalized.layoutMode = cfg.layoutMode || 'list';
  normalized.icon = cfg.icon || 'folder';
  normalized.color = cfg.color || '#8b5cf6';
  normalized.name = cfg.name || 'Box';
  normalized.itemCount = computeBoxItemCount(normalized);
  return normalized;
}

async function refreshBoxesFromConfig() {
  if (!window.electronAPI) return;
  const config = await window.electronAPI.getBoxesConfig();
  if (config && config.length > 0) {
    state.boxes = config.map(normalizeBoxFromConfig);
    renderBoxes();
    initOrganizationTab();
  }
}

// Sync boxes config with main process
function syncBoxesConfig() {
  if (window.electronAPI) {
    updateBoxCounts();
    window.electronAPI.updateBoxesConfig(state.boxes);
  }
}

// Switch Tab
function switchTab(tab) {
  state.currentTab = tab;

  // Update nav items
  elements.navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });

  // Update panels
  elements.panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tab}-panel`);
  });
}

// Switch Subtab
function switchSubtab(subtab) {
  state.currentSubtab = subtab;

  // Update tab buttons
  elements.tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.subtab === subtab);
  });

  // Update subtab contents
  elements.subtabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${subtab}-subtab`);
  });

  // Render appearance tab if switching to it
  if (subtab === 'appearance') {
    renderAppearanceTab();
  }
}

// ========================================
// Box Functions with Edit Support
// ========================================

// Render Boxes
function renderBoxes() {
  if (!elements.boxesGrid) return;

  updateBoxCounts();

  const filteredBoxes = state.boxes.filter(box =>
    box.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  let html = `
    <div class="boxes-search-row">
      <div class="search-input-wrapper">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="boxes-search-input"
          placeholder="${t('boxes.searchPlaceholder') || 'Search boxes...'}"
          value="${state.searchQuery}"
          onchange="handleSearchChange(this.value)"
          onclick="event.stopPropagation()"
        >
      </div>
      <span class="boxes-count">${filteredBoxes.length} ${t('boxes.boxesCount') || 'boxes'}</span>
    </div>
  `;

  html += filteredBoxes.map(box => {
    const isSelected = state.selectedBox === box.id;
    const isEditing = state.editingBoxId === box.id;
    const iconSvg = icons[box.icon] || icons.folder;
    const hasTabs = box.tabs && box.tabs.length > 0;

    return `
      <div
        class="box-card ${isSelected ? 'selected' : ''} ${hasTabs ? 'has-tabs' : ''}"
        data-box-id="${box.id}"
        onclick="selectBox('${box.id}')"
        oncontextmenu="showContextMenu(event, '${box.id}')"
        style="--box-color: ${box.color}"
      >
        ${hasTabs ? `
          <div class="box-tabs-header">
            ${box.tabs.map((tab, index) => `
              <div
                class="box-tab ${box.activeTab === index ? 'active' : ''}"
                onclick="event.stopPropagation(); window.switchBoxTab('${box.id}', ${index})"
                oncontextmenu="event.stopPropagation(); window.showTabContextMenu(event, '${box.id}', ${index})"
                style="background-color: ${box.activeTab === index ? box.color : 'rgba(255,255,255,0.1)'}"
                title="${tab.name} (${tab.itemCount || 0} items)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  ${icons[tab.icon] || icons.folder}
                </svg>
                <span>${tab.name}</span>
                <button
                  class="close-tab-btn"
                  onclick="event.stopPropagation(); window.splitTabFromBox('${box.id}', ${index})"
                  title="Split tab to separate box"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            `).join('')}
            <button
              class="add-tab-btn"
              onclick="event.stopPropagation(); window.addTabToBox('${box.id}')"
              title="Add new tab"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        ` : ''}
        
        <div
          class="box-icon-wrapper"
          style="background-color: ${box.color};"
          ondblclick="event.stopPropagation(); openIconPicker('${box.id}')"
          title="Double-click to change icon"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${iconSvg}
          </svg>
        </div>
        <div class="box-info">
          ${isEditing ? `
            <div class="box-edit-wrapper" onclick="event.stopPropagation()">
              <input
                type="text"
                class="box-name-input"
                value="${state.editingName}"
                oninput="state.editingName = this.value"
                onkeydown="handleEditKeydown(event, '${box.id}')"
                onblur="saveName('${box.id}')"
              >
              <div class="box-edit-actions">
                <button class="edit-action-btn save" onclick="saveName('${box.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button class="edit-action-btn cancel" onclick="cancelEditing()">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ` : `
            <div class="box-name-row">
              <span
                class="box-name"
                ondblclick="event.stopPropagation(); startEditing('${box.id}')"
                title="Double-click to edit name"
              >${box.name}</span>
              <button
                class="edit-name-btn"
                onclick="event.stopPropagation(); startEditing('${box.id}')"
                title="Edit name"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <span class="box-count">${box.itemCount} ${hasTabs ? `+ ${box.tabs.length} tabs` : ''} items</span>
          `}
        </div>
        <button
          class="delete-box-btn"
          onclick="event.stopPropagation(); confirmDelete('${box.id}')"
          title="Delete box"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');

  html += `
    <button class="add-box-card" onclick="addNewBox()">
      <div class="add-box-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </div>
      <span class="add-box-text">${t('boxes.addBox') || 'Add a Box'}</span>
    </button>
  `;

  elements.boxesGrid.innerHTML = html;

  // Auto-focus edit input if editing
  if (state.editingBoxId) {
    const input = elements.boxesGrid.querySelector('.box-name-input');
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// Search handler
window.handleSearchChange = (value) => {
  state.searchQuery = value;
  renderBoxes();
};

// Select box
window.selectBox = (boxId) => {
  console.log('selectBox called with:', boxId);
  state.selectedBox = boxId;
  renderBoxes();
  
  // Если мы на вкладке Appearance, перерисовать её
  if (state.currentSubtab === 'appearance') {
    renderAppearanceTab();
  }
};

// Start editing
window.startEditing = (boxId) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (box) {
    state.editingBoxId = boxId;
    state.editingName = box.name;
    renderBoxes();
  }
};

// Save name
window.saveName = (boxId) => {
  if (state.editingName.trim()) {
    const box = state.boxes.find(b => b.id === boxId);
    if (box) {
      box.name = state.editingName.trim();
      syncBoxesConfig(); // Sync with main process
    }
  }
  state.editingBoxId = null;
  state.editingName = '';
  renderBoxes();
};

// Cancel editing
window.cancelEditing = () => {
  state.editingBoxId = null;
  state.editingName = '';
  renderBoxes();
};

// Handle edit keydown
window.handleEditKeydown = (event, boxId) => {
  if (event.key === 'Enter') {
    saveName(boxId);
  } else if (event.key === 'Escape') {
    cancelEditing();
  }
};

// Open icon picker
window.openIconPicker = (boxId) => {
  state.selectedBox = boxId;
  state.iconPickerOpen = true;
  renderIconPickerModal();
};

// Select icon
window.selectIcon = (iconName) => {
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.icon = iconName;
      syncBoxesConfig(); // Sync with main process
    }
  }
  state.iconPickerOpen = false;
  renderIconPickerModal();
  renderBoxes();
};

// Select color for box
window.selectColorForBox = (color) => {
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.color = color;
      syncBoxesConfig(); // Sync with main process
      renderBoxes();
      renderAppearanceTab(); // Перерисовать вкладку Appearance
    }
  }
};

// Confirm delete
window.confirmDelete = (boxId) => {
  state.boxToDelete = boxId;
  state.deleteDialogOpen = true;
  state.contextMenu = null;
  renderDeleteDialog();
};

// Delete box
window.deleteBox = () => {
  if (state.boxToDelete) {
    state.boxes = state.boxes.filter(b => b.id !== state.boxToDelete);
    if (state.selectedBox === state.boxToDelete) {
      state.selectedBox = null;
    }
    syncBoxesConfig(); // Sync with main process
  }
  state.deleteDialogOpen = false;
  state.boxToDelete = null;
  renderDeleteDialog();
  renderBoxes();
  initOrganizationTab();
};

// Cancel delete
window.cancelDelete = () => {
  state.deleteDialogOpen = false;
  state.boxToDelete = null;
  renderDeleteDialog();
};

// Duplicate box
window.duplicateBox = (boxId) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (box) {
    const newBox = {
      ...box,
      id: Date.now().toString(),
      name: `${box.name} (Copy)`
    };
    state.boxes.push(newBox);
    syncBoxesConfig(); // Sync with main process
    renderBoxes();
    initOrganizationTab();
  }
  state.contextMenu = null;
};

// Show context menu
window.showContextMenu = (event, boxId) => {
  event.preventDefault();
  event.stopPropagation();
  state.contextMenu = { x: event.clientX, y: event.clientY, boxId };
  renderContextMenu();
  renderBoxes();
};

// Render context menu
function renderContextMenu() {
  // Remove existing context menu
  const existingMenu = document.getElementById('contextMenu');
  if (existingMenu) existingMenu.remove();

  if (!state.contextMenu) return;

  // Get other boxes for merge option
  const currentBox = state.boxes.find(b => b.id === state.contextMenu.boxId);
  const otherBoxes = state.boxes.filter(b => b.id !== state.contextMenu.boxId);

  const menu = document.createElement('div');
  menu.id = 'contextMenu';
  menu.className = 'context-menu';
  menu.style.left = `${state.contextMenu.x}px`;
  menu.style.top = `${state.contextMenu.y}px`;
  menu.innerHTML = `
    <button class="context-menu-item" onclick="event.stopPropagation(); editBoxFromContext('${state.contextMenu.boxId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      <span>Rename</span>
    </button>
    <button class="context-menu-item" onclick="event.stopPropagation(); openIconPicker('${state.contextMenu.boxId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      <span>Change Icon</span>
    </button>
    <button class="context-menu-item" onclick="event.stopPropagation(); duplicateBox('${state.contextMenu.boxId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span>Duplicate</span>
    </button>
    ${otherBoxes.length > 0 ? `
      <div class="context-menu-submenu">
        <button class="context-menu-item submenu-toggle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          </svg>
          <span>Merge into Tab</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: auto;">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <div class="context-menu-submenu-content">
          ${otherBoxes.map(box => `
            <button class="context-menu-item" onclick="event.stopPropagation(); window.mergeBoxesToTabs('${state.contextMenu.boxId}', '${box.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: ${box.color}">
                ${icons[box.icon] || icons.folder}
              </svg>
              <span>${box.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    ` : ''}
    <div class="context-menu-divider"></div>
    <button class="context-menu-item delete" onclick="event.stopPropagation(); confirmDelete('${state.contextMenu.boxId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
      <span>Delete</span>
    </button>
  `;
  document.body.appendChild(menu);
}

// Edit box from context menu
window.editBoxFromContext = (boxId) => {
  startEditing(boxId);
  state.contextMenu = null;
  const menu = document.getElementById('contextMenu');
  if (menu) menu.remove();
};

// Add New Box
window.addNewBox = () => {
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];
  const iconsList = ['grid', 'folder', 'file', 'calendar', 'clock', 'cloud', 'zap'];
  const newBox = {
    id: Date.now().toString(),
    name: 'New Box',
    icon: iconsList[Math.floor(Math.random() * iconsList.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    itemCount: 0
  };
  state.boxes.push(newBox);
  syncBoxesConfig(); // Sync with main process
  renderBoxes();
};

// ========================================
// Icon Picker Modal
// ========================================

const iconList = Object.keys(icons);

function renderIconPickerModal() {
  let modal = document.getElementById('iconPickerModal');
  
  if (!state.iconPickerOpen) {
    if (modal) modal.remove();
    return;
  }

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'iconPickerModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const filteredIcons = iconList.filter(icon =>
    icon.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  modal.innerHTML = `
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Choose an Icon</h3>
        <p>Select an icon for your box</p>
        <button class="modal-close" onclick="state.iconPickerOpen = false; renderIconPickerModal()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="icon-picker-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text" 
          placeholder="Search icons..." 
          value="${state.searchQuery}"
          oninput="state.searchQuery = this.value; renderIconPickerModal()"
        >
      </div>
      <div class="icon-picker-grid">
        ${filteredIcons.map(iconName => {
          const box = state.boxes.find(b => b.id === state.selectedBox);
          const isSelected = box?.icon === iconName;
          return `
            <button 
              class="icon-picker-item ${isSelected ? 'selected' : ''}"
              onclick="selectIcon('${iconName}')"
              style="--icon-color: ${box?.color || '#8b5cf6'}"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${icons[iconName]}
              </svg>
              <span class="icon-name">${iconName}</span>
            </button>
          `;
        }).join('')}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="state.iconPickerOpen = false; renderIconPickerModal()">Cancel</button>
      </div>
    </div>
  `;
}

// ========================================
// Delete Dialog
// ========================================

function renderDeleteDialog() {
  let dialog = document.getElementById('deleteDialog');
  
  if (!state.deleteDialogOpen) {
    if (dialog) dialog.remove();
    return;
  }

  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = 'deleteDialog';
    dialog.className = 'modal-overlay';
    document.body.appendChild(dialog);
  }

  dialog.innerHTML = `
    <div class="modal-content alert-dialog" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Delete Box</h3>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this box? This action cannot be undone and all items in this box will be unassigned.</p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="cancelDelete()">Cancel</button>
        <button class="btn-danger" onclick="deleteBox()">Delete</button>
      </div>
    </div>
  `;
}

// ========================================
// Appearance Tab
// ========================================

const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#6b7280', '#1f2937'];

function renderAppearanceTab() {
  const appearanceSubtab = document.getElementById('appearance-subtab');
  if (!appearanceSubtab) {
    console.error('appearance-subtab not found');
    return;
  }

  const selectedBox = state.boxes.find(b => b.id === state.selectedBox);
  
  // Если бокс не выбран, используем первый бокс для отображения настроек
  const activeBox = selectedBox || (state.boxes.length > 0 ? state.boxes[0] : null);
  
  console.log('renderAppearanceTab - selectedBox:', selectedBox, 'activeBox:', activeBox);

  appearanceSubtab.innerHTML = `
    <div class="preview-section">
      <h3 class="section-title">Colors & Fonts</h3>
      <div class="box-preview">
        <div class="preview-box" id="appearancePreviewBox">
          <div class="preview-box-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span>${activeBox ? activeBox.name : 'Default'}</span>
          </div>
          <div class="preview-box-content">
            <div class="preview-icon" style="background-color: ${activeBox ? activeBox.color : '#8b5cf6'};">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div class="preview-icon" style="background-color: ${activeBox ? activeBox.color : '#10b981'};">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="preview-icon" style="background-color: ${activeBox ? activeBox.color : '#3b82f6'};">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      ${!selectedBox ? '<p style="text-align: center; color: rgba(255,255,255,0.6); font-size: 12px; margin-top: 10px;">ℹ️ Настройки применяются ко всем боксам</p>' : ''}
    </div>

    <div class="settings-section">
      <h3 class="section-title">Background Colors</h3>
      <div class="color-picker">
        ${colors.map(color => `
          <button
            class="color-option ${(activeBox && activeBox.color === color) || (!activeBox && color === '#8b5cf6') ? 'active' : ''}"
            style="background-color: ${color};"
            onclick="window.selectBoxColor('${color}')"
          >
          </button>
        `).join('')}
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">Background Transparency</h3>
      <input type="range" class="slider-control" id="transparencySlider" min="0" max="100" value="${activeBox ? activeBox.transparency || 50 : 50}" oninput="window.updateTransparency(this.value)">
      <span class="slider-value" id="transparencyValue">${activeBox ? activeBox.transparency || 50 : 50}%</span>
    </div>
  `;
  
  // Установим фон preview
  if (activeBox) {
    const previewBox = document.getElementById('appearancePreviewBox');
    if (previewBox) {
      previewBox.style.background = `linear-gradient(135deg, ${activeBox.color}CC, ${activeBox.color}88)`;
      previewBox.style.opacity = 1 - ((activeBox.transparency || 50) / 100) * 0.8;
    }
  }
}

// ========================================
// Other Render Functions
// ========================================

// Render Wallpapers
function renderWallpapers() {
  if (!elements.wallpapersGrid) return;

  elements.wallpapersGrid.innerHTML = state.wallpapers.map(wallpaper => `
    <div class="wallpaper-card" data-wallpaper-id="${wallpaper.id}">
      <div class="wallpaper-image">
        <img src="${wallpaper.url}" alt="${wallpaper.title}" loading="lazy">
        <div class="wallpaper-overlay">
          <button class="overlay-btn play">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </button>
          <button class="overlay-btn favorite">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>
        <div class="wallpaper-meta">
          <span class="resolution">${wallpaper.resolution}</span>
          <div class="stats">
            <span>${wallpaper.downloads.toLocaleString()}</span>
            <span>${wallpaper.favorites.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div class="wallpaper-info">
        <span class="wallpaper-title">${wallpaper.title}</span>
        <button class="more-btn" onclick="event.stopPropagation(); window.showWallpaperMenu('${wallpaper.id}', event)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

// ========================================
// Wallpaper Menu Functions (три точки)
// ========================================

window.showWallpaperMenu = async (wallpaperId, event) => {
  event.stopPropagation();

  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (!wallpaper) return;

  // Удаляем существующее меню
  const existingMenu = document.getElementById('wallpaperContextMenu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.id = 'wallpaperContextMenu';
  menu.className = 'wallpaper-context-menu';
  
  menu.innerHTML = `
    <button class="wallpaper-menu-item" onclick="window.addToFavorites('${wallpaperId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <span>Add to Favorites</span>
    </button>
    <button class="wallpaper-menu-item" onclick="window.addToPlaylist('${wallpaperId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9v6l4-2 4 2V9"/><line x1="9" y1="9" x2="9" y2="3"/>
      </svg>
      <span>Add to Playlist</span>
    </button>
    <div class="wallpaper-menu-divider"></div>
    <button class="wallpaper-menu-item" onclick="window.viewWallpaperDetails('${wallpaperId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>View Details</span>
    </button>
    <button class="wallpaper-menu-item" onclick="window.copyWallpaperId('${wallpaperId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      <span>Copy ID</span>
    </button>
    <div class="wallpaper-menu-divider"></div>
    <button class="wallpaper-menu-item delete" onclick="window.deleteWallpaper('${wallpaperId}')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </svg>
      <span>Delete</span>
    </button>
  `;

  // Позиционирование меню
  const rect = event.target.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.left = rect.left + 'px';
  menu.style.top = (rect.bottom + 5) + 'px';
  menu.style.zIndex = '10000';

  document.body.appendChild(menu);

  // Закрыть меню по клику вне
  setTimeout(() => {
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    document.addEventListener('click', closeMenu);
  }, 100);
};

window.addToFavorites = (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (wallpaper) {
    wallpaper.favorited = !wallpaper.favorited;
    wallpaper.favorites += wallpaper.favorited ? 1 : -1;
    
    // Сохраняем в localStorage
    const favorites = JSON.parse(localStorage.getItem('wallpaperFavorites') || '[]');
    if (wallpaper.favorited) {
      if (!favorites.includes(wallpaperId)) favorites.push(wallpaperId);
    } else {
      const index = favorites.indexOf(wallpaperId);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('wallpaperFavorites', JSON.stringify(favorites));
    
    renderWallpapers();
    
    // Уведомление
    const menu = document.getElementById('wallpaperContextMenu');
    if (menu) menu.remove();
    
    alert(`"${wallpaper.title}" ${wallpaper.favorited ? 'added to' : 'removed from'} favorites!`);
  }
};

window.addToPlaylist = (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (wallpaper) {
    // Добавляем в плейлист
    const playlist = JSON.parse(localStorage.getItem('wallpaperPlaylist') || '[]');
    if (!playlist.includes(wallpaperId)) {
      playlist.push(wallpaperId);
      localStorage.setItem('wallpaperPlaylist', JSON.stringify(playlist));
    }
    
    // Уведомление
    const menu = document.getElementById('wallpaperContextMenu');
    if (menu) menu.remove();
    
    alert(`"${wallpaper.title}" added to playlist!\n\nGo to Wallpapers → My Wallpapers → Playlist to manage.`);
  }
};

window.viewWallpaperDetails = (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (wallpaper) {
    const menu = document.getElementById('wallpaperContextMenu');
    if (menu) menu.remove();
    
    alert(`Wallpaper Details:\n\n` +
          `Title: ${wallpaper.title}\n` +
          `Resolution: ${wallpaper.resolution}\n` +
          `Category: ${wallpaper.category || 'General'}\n` +
          `Downloads: ${wallpaper.downloads.toLocaleString()}\n` +
          `Favorites: ${wallpaper.favorites.toLocaleString()}\n` +
          `ID: ${wallpaperId}`);
  }
};

window.copyWallpaperId = (wallpaperId) => {
  navigator.clipboard.writeText(wallpaperId).then(() => {
    const menu = document.getElementById('wallpaperContextMenu');
    if (menu) menu.remove();
    
    alert(`Wallpaper ID copied to clipboard!\n\nID: ${wallpaperId}`);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
};

window.deleteWallpaper = (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  
  if (confirm(`Delete "${wallpaper ? wallpaper.title : wallpaperId}"?\n\nThis action cannot be undone.`)) {
    state.wallpapers = state.wallpapers.filter(w => w.id !== wallpaperId);
    renderWallpapers();
    
    const menu = document.getElementById('wallpaperContextMenu');
    if (menu) menu.remove();
  }
};

// Render Themes
function renderThemes() {
  if (!elements.themesGrid) return;

  elements.themesGrid.innerHTML = state.themes.map(theme => `
    <div class="theme-card ${state.personalization.theme === theme.id ? 'selected' : ''}" data-theme-id="${theme.id}" onclick="window.selectTheme('${theme.id}')">
      <div class="theme-preview" style="background: ${theme.preview};">
        <div style="display: flex; gap: 8px;">
          <div style="width: 24px; height: 24px; background-color: ${theme.color}; border-radius: 6px;"></div>
          <div style="width: 24px; height: 24px; background-color: ${theme.color}; opacity: 0.7; border-radius: 6px;"></div>
          <div style="width: 24px; height: 24px; background-color: ${theme.color}; opacity: 0.5; border-radius: 6px;"></div>
        </div>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px;">
        <span style="font-size: 13px; color: var(--text-primary);">${theme.name}</span>
        ${state.personalization.theme === theme.id ? `
          <div style="width: 20px; height: 20px; border-radius: 50%; background: var(--accent-purple); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        ` : ''}
      </div>
    </div>
  `).join('');
}

// Render Widgets
function renderWidgets() {
  if (!elements.widgetsGrid) return;

  // Маппинг ID виджетов на ключи переводов
  const widgetTranslations = {
    'schedule': { name: 'widgets.schedule', desc: 'widgets.scheduleDesc' },
    'inotes': { name: 'widgets.inotes', desc: 'widgets.inotesDesc' },
    'clock': { name: 'widgets.clock', desc: 'widgets.clockDesc' },
    'weather': { name: 'widgets.weather', desc: 'widgets.weatherDesc' },
    'quick-tools': { name: 'widgets.quick-tools', desc: 'widgets.quick-toolsDesc' },
    'ipomodoro': { name: 'widgets.ipomodoro', desc: 'widgets.ipomodoroDesc' },
    'chat-ai': { name: 'widgets.chat-ai', desc: 'widgets.chat-aiDesc' }
  };

  elements.widgetsGrid.innerHTML = state.widgets.map(widget => {
    const trans = widgetTranslations[widget.id];
    const widgetName = trans ? t(trans.name) : widget.name;
    const widgetDesc = trans ? t(trans.desc) : widget.description;
    
    return `
    <div class="widget-card ${widget.enabled ? 'enabled' : ''}" data-widget-id="${widget.id}">
      <div class="widget-header">
        <div class="widget-icon-wrapper" style="background: ${widget.gradient};">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            ${icons[widget.icon]}
          </svg>
        </div>
        <div class="widget-info">
          <span class="widget-name">${widgetName}</span>
          <span class="widget-description">${widgetDesc}</span>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="widget-action-btn" onclick="openWidgetSettings('${widget.id}')" title="${t('widgets.settings') || 'Settings'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24 4.24l-4.24-4.24M6.34 6.34L2.1 2.1"/>
            </svg>
          </button>
          <button class="widget-settings-btn" onclick="openWidgetOnDesktop('${widget.id}')" title="${t('widgets.addToDesktop') || 'Add to Desktop'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
          <label class="switch">
            <input type="checkbox" ${widget.enabled ? 'checked' : ''} data-widget="${widget.id}">
            <span class="slider"></span>
          </label>
        </div>
      </div>
    </div>
  `;
  }).join('');

  // Widget toggle listeners
  document.querySelectorAll('[data-widget]').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const widgetId = e.target.dataset.widget;
      const widget = state.widgets.find(w => w.id === widgetId);
      if (widget) {
        widget.enabled = e.target.checked;
        
        // Сохранить конфигурацию через main процесс
        if (window.electronAPI) {
          try {
            await window.electronAPI.toggleWidget(widgetId, e.target.checked);
          } catch (error) {
            console.error('Error toggling widget:', error);
          }
        }
        
        renderWidgets();
      }
    });
  });
}

// Open widget on desktop
window.openWidgetOnDesktop = async (widgetId) => {
  const widget = state.widgets.find(w => w.id === widgetId);
  if (!widget) return;

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

  const widgetType = widgetTypeMap[widgetId] || 'clock';

  if (window.electronAPI) {
    try {
      await window.electronAPI.openWidget(widgetType);
      // Включить виджет при добавлении
      widget.enabled = true;
      await window.electronAPI.toggleWidget(widgetId, true);
      renderWidgets();
    } catch (error) {
      console.error('Error opening widget:', error);
    }
  }
};

// Render AI Features
function renderAIFeatures() {
  if (!elements.aiFeatures) return;

  const featureTranslations = {
    'chat-ai': { name: 'aiAssistant.chatAI', desc: 'aiAssistant.chatAIDesc' },
    'search': { name: 'aiAssistant.search', desc: 'aiAssistant.searchDesc' },
    'screenshot': { name: 'aiAssistant.screenshot', desc: 'aiAssistant.screenshotDesc' }
  };

  elements.aiFeatures.innerHTML = state.aiFeatures.map(feature => {
    const trans = featureTranslations[feature.id];
    const nameKey = trans ? trans.name : null;
    const descKey = trans ? trans.desc : null;
    const featureName = nameKey ? t(nameKey) : feature.name;
    const featureDesc = descKey ? t(descKey) : feature.description;
    const nameAttr = nameKey ? ` data-i18n="${nameKey}"` : '';
    const descAttr = descKey ? ` data-i18n="${descKey}"` : '';

    return `
    <div class="ai-feature-card ${feature.enabled ? 'enabled' : ''}" data-feature-id="${feature.id}">
      <div class="feature-glow" style="background: ${feature.gradient};"></div>
      <div class="feature-content">
        <div class="feature-header">
          <div class="feature-icon-wrapper" style="background: ${feature.gradient};">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              ${icons[feature.icon]}
            </svg>
          </div>
          <div class="feature-info">
            <span class="feature-name"${nameAttr}>${featureName}</span>
            <span class="feature-description"${descAttr}>${featureDesc}</span>
          </div>
          <label class="switch">
            <input type="checkbox" ${feature.enabled ? 'checked' : ''} data-feature="${feature.id}">
            <span class="slider"></span>
          </label>
        </div>
        ${feature.enabled ? `
          <div class="feature-settings">
            <div class="setting-row">
              <div class="setting-row-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M6 12h.01M6 16h.01"/>
                </svg>
                <span data-i18n="aiAssistant.hotkey">Hotkey</span>
              </div>
              <button class="hotkey-btn">${feature.hotkey}</button>
            </div>
            <div class="setting-row">
              <div class="setting-row-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <span data-i18n="aiAssistant.launchOnStartup">Launch on startup</span>
              </div>
              <label class="switch">
                <input type="checkbox" ${feature.id === 'chat-ai' ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            <div class="setting-row">
              <div class="setting-row-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <span data-i18n="aiAssistant.desktopAccess">Desktop access</span>
              </div>
              <label class="switch">
                <input type="checkbox" checked>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  }).join('');

  // Feature toggle listeners
  document.querySelectorAll('[data-feature]').forEach(toggle => {
    toggle.addEventListener('change', (e) => {
      const featureId = e.target.dataset.feature;
      const feature = state.aiFeatures.find(f => f.id === featureId);
      if (feature) {
        feature.enabled = e.target.checked;
        renderAIFeatures();
      }
    });
  });
}

// ========================================
// BOX CREATION FUNCTIONS
// ========================================

window.createBoxFromPanel = () => {
  const newBox = {
    id: Date.now().toString(),
    name: `Box ${state.boxes.length + 1}`,
    icon: 'grid',
    color: getRandomColor(),
    items: [],
    rules: [],
    layoutMode: 'list'
  };
  state.boxes.push(newBox);
  syncBoxesConfig();
  renderBoxes();
  initOrganizationTab();
};

window.createBoxByDrawing = async () => {
  try {
    if (!window.electronAPI) {
      alert('Electron API not available');
      return;
    }

    // Запустить режим выделения
    const rect = await window.electronAPI.startBoxSelection();

    if (rect && rect.width > 50 && rect.height > 50) {
      // Создать бокс с координатами
      const newBox = {
        id: Date.now().toString(),
        name: `Box ${state.boxes.length + 1}`,
        icon: 'grid',
        color: getRandomColor(),
        items: [],
        rules: [],
        layoutMode: 'list',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      };

      state.boxes.push(newBox);
      syncBoxesConfig();
      renderBoxes();
      initOrganizationTab();

      // Уведомление
      console.log(`Box created at position (${rect.x}, ${rect.y}), Size: ${rect.width}x${rect.height}`);
    } else if (rect) {
      // Слишком маленькое выделение
      console.log('Selection too small, minimum size is 50x50');
    }
  } catch (error) {
    console.error('Error creating box by drawing:', error);
    alert('Error: ' + error.message);
  }
};

window.createBoxFromContextMenu = () => {
  console.log('Right-click on desktop and select "Create Box" from context menu.');
};

window.createBoxForSelected = () => {
  alert('Select icons on desktop first, then use this option to create a box for them.');
};

// ========================================
// FOLDER PORTAL FUNCTIONS
// ========================================

window.createFolderPortal = async () => {
  try {
    if (!window.electronAPI) {
      alert('Electron API not available');
      return;
    }

    // Выбрать папку
    const folderPath = await window.electronAPI.selectFolder();
    if (!folderPath) return;

    // Создать Folder Portal бокс
    const folderName = folderPath.split('\\').pop() || folderPath;
    const newBox = {
      id: 'portal-' + Date.now().toString(),
      name: folderName,
      type: 'folder-portal',
      folderPath: folderPath,
      icon: 'folder',
      color: '#ffd43b',
      items: [],
      rules: [],
      layoutMode: 'grid',
      width: 300,
      height: 400
    };

    state.boxes.push(newBox);
    syncBoxesConfig();
    renderBoxes();

    console.log('Folder Portal created:', folderPath);
  } catch (error) {
    console.error('Error creating Folder Portal:', error);
  }
};

// ========================================
// DOUBLE-CLICK TO HIDE ALL BOXES
// ========================================

let boxesHidden = false;

document.addEventListener('dblclick', (e) => {
  // Проверяем что клик был по рабочему столу (не по боксу или виджету)
  if (e.target === document.body || e.target.classList.contains('desktop-area')) {
    boxesHidden = !boxesHidden;

    // Скрыть/показать все боксы
    const boxes = document.querySelectorAll('.box-window, .box-container');
    boxes.forEach(box => {
      box.style.display = boxesHidden ? 'none' : '';
    });

    // Уведомить main process
    if (window.electronAPI && window.electronAPI.toggleAllBoxes) {
      window.electronAPI.toggleAllBoxes();
    }

    console.log('Boxes visibility:', boxesHidden ? 'hidden' : 'visible');
  }
});

// Слушатель изменения видимости из main process
if (window.electronAPI && window.electronAPI.onBoxesVisibilityChanged) {
  window.electronAPI.onBoxesVisibilityChanged((visible) => {
    boxesHidden = !visible;
    const boxes = document.querySelectorAll('.box-window, .box-container');
    boxes.forEach(box => {
      box.style.display = visible ? '' : 'none';
    });
  });
}

// ========================================
// TAB MODE FUNCTIONS (объединение коробок во вкладки)
// ========================================

window.mergeBoxesToTabs = async (sourceBoxId, targetBoxId) => {
  const sourceBox = state.boxes.find(b => b.id === sourceBoxId);
  const targetBox = state.boxes.find(b => b.id === targetBoxId);

  if (!sourceBox || !targetBox) {
    console.error('Source or target box not found');
    return;
  }

  if (sourceBoxId === targetBoxId) {
    console.error('Cannot merge box with itself');
    return;
  }

  // Добавить sourceBox как вкладку в targetBox
  if (!targetBox.tabs) {
    targetBox.tabs = [];
  }

  targetBox.tabs.push({
    id: sourceBox.id,
    name: sourceBox.name,
    icon: sourceBox.icon,
    color: sourceBox.color,
    itemCount: sourceBox.itemCount,
    items: sourceBox.items || []
  });

  // Удалить sourceBox из списка
  state.boxes = state.boxes.filter(b => b.id !== sourceBoxId);

  syncBoxesConfig();
  renderBoxes();
  initOrganizationTab();

  console.log(`Merged box "${sourceBox.name}" into "${targetBox.name}" as tab`);
};

window.splitTabFromBox = (boxId, tabIndex) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs || !box.tabs[tabIndex]) {
    console.error('Box or tab not found');
    return;
  }

  const tab = box.tabs[tabIndex];

  // Создать новый бокс из вкладки
  const newBox = {
    id: Date.now().toString(),
    name: tab.name,
    icon: tab.icon,
    color: tab.color,
    itemCount: tab.itemCount,
    items: tab.items || [],
    layoutMode: box.layoutMode || 'list'
  };

  state.boxes.push(newBox);

  // Удалить вкладку
  box.tabs.splice(tabIndex, 1);
  if (box.tabs.length === 0) {
    delete box.tabs;
    delete box.activeTab;
  } else if (box.activeTab >= box.tabs.length) {
    box.activeTab = box.tabs.length - 1;
  }

  syncBoxesConfig();
  renderBoxes();

  console.log(`Split tab "${tab.name}" from box "${box.name}"`);
};

window.switchBoxTab = (boxId, tabIndex) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs) return;

  // Обновить активную вкладку
  box.activeTab = tabIndex;

  // Обновить UI
  renderBoxes();
};

// Добавить новую вкладку в существующий бокс
window.addTabToBox = async (boxId) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box) {
    console.error('Box not found');
    return;
  }

  // Создать новую пустую вкладку
  if (!box.tabs) {
    box.tabs = [];
  }

  const newTab = {
    id: Date.now().toString(),
    name: `Tab ${box.tabs.length + 1}`,
    icon: 'folder',
    color: box.color,
    itemCount: 0,
    items: []
  };

  box.tabs.push(newTab);
  box.activeTab = box.tabs.length - 1;

  syncBoxesConfig();
  renderBoxes();

  console.log(`Added new tab to box "${box.name}"`);
};

// Переименовать вкладку
window.renameTab = (boxId, tabIndex, newName) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs || !box.tabs[tabIndex]) return;

  box.tabs[tabIndex].name = newName;
  syncBoxesConfig();
  renderBoxes();
};

// Изменить иконку вкладки
window.changeTabIcon = (boxId, tabIndex, newIcon) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs || !box.tabs[tabIndex]) return;

  box.tabs[tabIndex].icon = newIcon;
  syncBoxesConfig();
  renderBoxes();
};

// Переместить вкладку (drag & drop)
window.moveTab = (boxId, fromIndex, toIndex) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs) return;

  const [movedTab] = box.tabs.splice(fromIndex, 1);
  box.tabs.splice(toIndex, 0, movedTab);

  // Обновить активную вкладку если она переместилась
  if (box.activeTab === fromIndex) {
    box.activeTab = toIndex;
  } else if (box.activeTab > fromIndex && box.activeTab <= toIndex) {
    box.activeTab--;
  } else if (box.activeTab < fromIndex && box.activeTab >= toIndex) {
    box.activeTab++;
  }

  syncBoxesConfig();
  renderBoxes();
};

// Контекстное меню для вкладки
window.showTabContextMenu = (event, boxId, tabIndex) => {
  event.preventDefault();
  event.stopPropagation();

  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs || !box.tabs[tabIndex]) return;

  const tab = box.tabs[tabIndex];

  // Удалить существующее меню
  const existingMenu = document.querySelector('.tab-context-menu');
  if (existingMenu) existingMenu.remove();

  const menu = document.createElement('div');
  menu.className = 'tab-context-menu';
  menu.style.left = `${event.clientX}px`;
  menu.style.top = `${event.clientY}px`;

  menu.innerHTML = `
    <div class="tab-context-menu-header">
      <span>${tab.name}</span>
    </div>
    <button class="tab-context-menu-item" onclick="window.renameTabFromMenu('${boxId}', ${tabIndex})">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Rename
    </button>
    <button class="tab-context-menu-item" onclick="window.changeTabIconFromMenu('${boxId}', ${tabIndex})">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      Change Icon
    </button>
    <div class="tab-context-menu-divider"></div>
    <button class="tab-context-menu-item danger" onclick="window.splitTabFromBox('${boxId}', ${tabIndex})">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
      Split to Box
    </button>
  `;

  document.body.appendChild(menu);

  // Закрыть меню при клике вне
  const closeMenu = () => {
    menu.remove();
    document.removeEventListener('click', closeMenu);
  };
  setTimeout(() => {
    document.addEventListener('click', closeMenu);
  }, 100);
};

window.renameTabFromMenu = (boxId, tabIndex) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.tabs || !box.tabs[tabIndex]) return;

  const newName = prompt('Enter new tab name:', box.tabs[tabIndex].name);
  if (newName && newName.trim()) {
    window.renameTab(boxId, tabIndex, newName.trim());
  }
};

window.changeTabIconFromMenu = (boxId, tabIndex) => {
  alert('Icon picker for tabs will be implemented soon.\n\nFor now, use the default icon.');
};

// ========================================
// FOLDER PORTAL & PRIVATE BOX
// ========================================

window.createFolderPortal = () => {
  if (window.electronAPI) {
    window.electronAPI.selectFolder().then(folderPath => {
      if (folderPath) {
        const folderName = folderPath.split(/[\\/]/).pop() || 'Folder';
        const newBox = {
          id: Date.now().toString(),
          name: folderName,
          icon: 'folder',
          color: '#3b82f6',
          items: [],
          rules: [],
          layoutMode: 'list',
          isPortal: true,
          folderPath: folderPath
        };
        state.boxes.push(newBox);
        syncBoxesConfig();
        renderBoxes();
        initOrganizationTab();
      }
    });
  }
};

window.createPrivateBox = async () => {
  try {
    // Проверяем существует ли уже Private Box
    const exists = await window.electronAPI.privateBoxExists();
    
    if (exists) {
      // Проверяем статус
      const status = await window.electronAPI.getPrivateBoxStatus();
      if (status.success && status.locked) {
        // Нужно разблокировать
        const result = await window.electronAPI.openPrivateBoxModal('unlock');
        if (result.success) {
          console.log('Private Box unlock modal opened');
        }
      } else {
        // Уже разблокирован, показываем содержимое
        showPrivateBoxContents();
      }
    } else {
      // Создаём новый Private Box
      const result = await window.electronAPI.openPrivateBoxModal('create');
      if (result.success) {
        console.log('Private Box create modal opened');
      }
    }
  } catch (error) {
    console.error('Error opening Private Box:', error);
    alert('Error: ' + error.message);
  }
};

function getRandomColor() {
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// ========================================
// APPEARANCE FUNCTIONS
// ========================================

window.updateAppearanceSettings = () => {
  const showHeaders = document.getElementById('showBoxHeaders').checked;
  // Apply to preview
  const previewHeader = document.querySelector('#appearancePreviewBox .preview-box-header');
  if (previewHeader) {
    previewHeader.style.display = showHeaders ? 'flex' : 'none';
  }
};

window.selectBoxColor = (color) => {
  console.log('selectBoxColor called with:', color);
  
  // Update active state in color picker
  document.querySelectorAll('.color-option').forEach(btn => {
    // Сравниваем нормализованные цвета
    const btnColor = rgbToHex(btn.style.backgroundColor);
    const isSame = btnColor.toLowerCase() === color.toLowerCase();
    btn.classList.toggle('active', isSame);
  });

  // Если выбран конкретный бокс - применяем только к нему
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.color = color;
      console.log('Box color updated:', box.id, color);
      
      // Обновляем конфигурацию через main процесс
      if (window.electronAPI) {
        window.electronAPI.updateBoxConfig(box.id, { color: color });
      }
      
      renderBoxes();
      renderAppearanceTab(); // Перерисовать вкладку Appearance
    }
  } else {
    // Если бокс не выбран - применяем ко ВСЕМ боксам
    console.log('No box selected, applying color to ALL boxes');
    state.boxes.forEach(box => {
      box.color = color;
      console.log('Box color updated:', box.id, color);
      
      // Обновляем конфигурацию через main процесс
      if (window.electronAPI) {
        window.electronAPI.updateBoxConfig(box.id, { color: color });
      }
    });
    
    renderBoxes();
    renderAppearanceTab();
  }

  // Update preview
  const previewBox = document.getElementById('appearancePreviewBox');
  if (previewBox) {
    previewBox.style.background = `linear-gradient(135deg, ${color}, ${adjustColor(color, 20)})`;
  }
};

// Helper function to convert RGB to Hex
function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  if (rgb.startsWith('#')) return rgb;
  
  const match = rgb.match(/\d+/g);
  if (!match) return '#000000';
  
  const [r, g, b] = match.map(Number);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Helper function to adjust color brightness
function adjustColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

window.updateTransparency = (value) => {
  const valueEl = document.getElementById('transparencyValue');
  if (valueEl) {
    valueEl.textContent = `${value}%`;
  }

  console.log('updateTransparency called with:', value);

  // Если выбран конкретный бокс - применяем только к нему
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.transparency = parseInt(value);
      console.log('Box transparency updated:', box.id, value);
      
      // Обновляем конфигурацию через main процесс
      if (window.electronAPI) {
        window.electronAPI.updateBoxConfig(box.id, { transparency: parseInt(value) });
      }

      // Обновляем preview с новой прозрачностью
      const previewBox = document.getElementById('appearancePreviewBox');
      if (previewBox) {
        const opacity = 1 - (value / 100) * 0.8;
        previewBox.style.opacity = opacity;
      }
    }
  } else {
    // Если бокс не выбран - применяем ко ВСЕМ боксам
    console.log('No box selected, applying transparency to ALL boxes');
    state.boxes.forEach(box => {
      box.transparency = parseInt(value);
      console.log('Box transparency updated:', box.id, value);
      
      // Обновляем конфигурацию через main процесс
      if (window.electronAPI) {
        window.electronAPI.updateBoxConfig(box.id, { transparency: parseInt(value) });
      }
    });
    
    // Обновляем preview
    const previewBox = document.getElementById('appearancePreviewBox');
    if (previewBox) {
      const opacity = 1 - (value / 100) * 0.8;
      previewBox.style.opacity = opacity;
    }
  }

  console.log('Transparency updated to:', value);
};

window.updateShowTitles = (value) => {
  console.log('Show titles:', value);
  // Здесь можно сохранить настройку в localStorage или config
};

window.updateHeaderFont = (font) => {
  const previewHeader = document.querySelector('#appearancePreviewBox .preview-box-header span');
  if (previewHeader) {
    previewHeader.style.fontFamily = font;
  }
  
  // Сохраняем в выбранный бокс
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.fontFamily = font;
      syncBoxesConfig();
    }
  }
};

window.updateHeaderFontSize = (size) => {
  document.getElementById('headerFontSizeValue').textContent = `${size}px`;
  const previewHeader = document.querySelector('#appearancePreviewBox .preview-box-header span');
  if (previewHeader) {
    previewHeader.style.fontSize = `${size}px`;
  }
  
  // Сохраняем в выбранный бокс
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.fontSize = parseInt(size);
      syncBoxesConfig();
    }
  }
};

window.updateHeaderFontWeight = (weight) => {
  document.querySelectorAll('.font-weight-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.weight === weight);
  });
  const previewHeader = document.querySelector('#appearancePreviewBox .preview-box-header span');
  if (previewHeader) {
    previewHeader.style.fontWeight = weight;
  }
  
  // Сохраняем в выбранный бокс
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.fontWeight = weight;
      syncBoxesConfig();
    }
  }
};

window.selectHeaderTextColor = (color) => {
  const previewHeader = document.querySelector('#appearancePreviewBox .preview-box-header');
  if (previewHeader) {
    previewHeader.style.color = color;
    previewHeader.style.setProperty('--header-text-color', color);
  }
  
  // Сохраняем в выбранный бокс
  if (state.selectedBox) {
    const box = state.boxes.find(b => b.id === state.selectedBox);
    if (box) {
      box.headerTextColor = color;
      syncBoxesConfig();
    }
  }
};

function adjustColor(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// ========================================
// ORGANIZATION FUNCTIONS
// ========================================

// Инициализация Organization subtab
window.initOrganizationTab = () => {
  const boxRuleSelect = document.getElementById('boxRuleSelect');
  if (!boxRuleSelect) return;

  // Заполняем селект боксами
  boxRuleSelect.innerHTML = '<option value="">-- Select a Box --</option>' +
    state.boxes.map(box => `<option value="${box.id}">${box.name}</option>`).join('');
};

window.loadBoxRules = (boxId) => {
  const container = document.getElementById('rulesListContainer');
  const boxName = document.getElementById('currentBoxName');

  if (!boxId) {
    container.style.display = 'none';
    return;
  }

  const box = state.boxes.find(b => b.id === boxId);
  if (box) {
    boxName.textContent = box.name;
    container.style.display = 'block';
    renderRulesList(boxId);
  }
};

function renderRulesList(boxId) {
  const rulesList = document.getElementById('rulesList');
  
  // Находим бокс и его правила
  const box = state.boxes.find(b => b.id === boxId);
  const rules = box?.rules || [];

  if (rules.length === 0) {
    rulesList.innerHTML = `
      <div class="no-rules-info">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p>No rules configured yet. Add your first rule below.</p>
      </div>
    `;
    return;
  }

  const priorityLabels = { '1': 'High', '2': 'Medium', '3': 'Low' };
  const typeLabels = { 'extension': 'Extension', 'name': 'Name Pattern', 'size': 'Size', 'date': 'Date' };

  rulesList.innerHTML = rules.map(rule => `
    <div class="rule-item">
      <div class="rule-item-info">
        <div class="rule-item-name">${rule.name}</div>
        <div class="rule-item-desc">${typeLabels[rule.type] || rule.type}: ${rule.pattern}</div>
      </div>
      <div class="rule-item-priority ${rule.priority === '1' ? 'high' : rule.priority === '2' ? 'medium' : 'low'}">
        ${priorityLabels[rule.priority] || 'Medium'}
      </div>
      <div class="rule-item-actions">
        <button class="rule-action-btn" title="Edit" onclick="editRule('${boxId}', '${rule.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="rule-action-btn delete" title="Delete" onclick="deleteRule('${boxId}', '${rule.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

window.addNewRule = () => {
  const boxId = document.getElementById('boxRuleSelect').value;
  const name = document.getElementById('ruleName').value.trim();
  const type = document.getElementById('ruleFileType').value;
  const pattern = document.getElementById('rulePattern').value.trim();
  const priority = document.getElementById('rulePriority').value;

  if (!boxId) {
    alert('Please select a box first');
    return;
  }

  if (!name || !pattern) {
    alert('Please fill in Rule Name and Pattern');
    return;
  }

  const box = state.boxes.find(b => b.id === boxId);
  if (box) {
    if (!box.rules) box.rules = [];
    
    const newRule = {
      id: Date.now().toString(),
      name,
      type,
      pattern,
      priority
    };
    
    box.rules.push(newRule);
    syncBoxesConfig();
    renderRulesList(boxId);
    
    // Очищаем форму
    document.getElementById('ruleName').value = '';
    document.getElementById('rulePattern').value = '';
    
    alert(`Rule "${name}" added successfully!`);
  }
};

window.deleteRule = (boxId, ruleId) => {
  if (confirm('Delete this rule?')) {
    const box = state.boxes.find(b => b.id === boxId);
    if (box && box.rules) {
      box.rules = box.rules.filter(r => r.id !== ruleId);
      syncBoxesConfig();
      renderRulesList(boxId);
    }
  }
};

window.editRule = (boxId, ruleId) => {
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || !box.rules) return;
  
  const rule = box.rules.find(r => r.id === ruleId);
  if (!rule) return;
  
  // Заполняем форму значениями правила
  document.getElementById('ruleName').value = rule.name;
  document.getElementById('ruleFileType').value = rule.type;
  document.getElementById('rulePattern').value = rule.pattern;
  document.getElementById('rulePriority').value = rule.priority;
  
  // Удаляем старое правило (пользователь добавит новое)
  box.rules = box.rules.filter(r => r.id !== ruleId);
  syncBoxesConfig();
  renderRulesList(boxId);
};

window.applyRulesToUnassigned = () => {
  if (!window.electronAPI) return;
  window.electronAPI.applyBoxRules('unassigned').then(async (result) => {
    if (result?.success) {
      await refreshBoxesFromConfig();
      alert(`Rules applied to unassigned icons.\n\nAssigned: ${result.assigned}`);
    } else {
      alert('Failed to apply rules.');
    }
  }).catch((error) => {
    console.error('Error applying rules:', error);
    alert('Error applying rules: ' + error.message);
  });
};

window.applyRulesToAll = () => {
  if (!window.electronAPI) return;
  if (confirm('This will re-organize all desktop icons according to the rules. Continue?')) {
    window.electronAPI.applyBoxRules('all').then(async (result) => {
      if (result?.success) {
        await refreshBoxesFromConfig();
        alert(`Rules applied to all icons.\n\nAssigned: ${result.assigned}`);
      } else {
        alert('Failed to apply rules.');
      }
    }).catch((error) => {
      console.error('Error applying rules:', error);
      alert('Error applying rules: ' + error.message);
    });
  }
};

// ========================================
// QUICK ACTIONS FUNCTIONS
// ========================================

window.updateQuickActions = () => {
  const singleClick = document.getElementById('singleClickOpen').checked;
  const doubleClick = document.getElementById('doubleClickRequired').checked;
  const quickAccess = document.getElementById('showQuickAccess').checked;
  const shortcuts = document.getElementById('enableKeyboardShortcuts').checked;
  
  // Update state
  state.quickActions = { singleClick, doubleClick, quickAccess, shortcuts };
};

window.autoArrangeIcons = () => {
  window.applyRulesToAll();
};

window.alignToGrid = () => {
  state.boxes.forEach(box => {
    box.layoutMode = 'grid';
  });
  syncBoxesConfig();
  renderBoxes();
  alert('Boxes aligned to grid view.');
};

window.sortByName = () => {
  if (!window.electronAPI) return;
  window.electronAPI.sortBoxItems('name').then(async (result) => {
    if (result?.success) {
      await refreshBoxesFromConfig();
      alert('Boxes sorted by name.');
    }
  }).catch((error) => {
    console.error('Error sorting:', error);
  });
};

window.sortByType = () => {
  if (!window.electronAPI) return;
  window.electronAPI.sortBoxItems('type').then(async (result) => {
    if (result?.success) {
      await refreshBoxesFromConfig();
      alert('Boxes sorted by type.');
    }
  }).catch((error) => {
    console.error('Error sorting:', error);
  });
};

window.sortByDate = () => {
  if (!window.electronAPI) return;
  window.electronAPI.sortBoxItems('date').then(async (result) => {
    if (result?.success) {
      await refreshBoxesFromConfig();
      alert('Boxes sorted by date.');
    }
  }).catch((error) => {
    console.error('Error sorting:', error);
  });
};

window.hideDesktopIcons = () => {
  if (!window.electronAPI) return;
  window.electronAPI.setDesktopIconsVisible(false).then((result) => {
    if (result?.success) {
      alert('Desktop icons hidden.');
    } else {
      alert('Failed to hide desktop icons.');
    }
  }).catch((error) => {
    console.error('Error hiding desktop icons:', error);
    alert('Error hiding desktop icons: ' + error.message);
  });
};

// ========================================
// LAYOUT FUNCTIONS
// ========================================

window.updateLayoutSettings = () => {
  const lockPositions = document.getElementById('lockBoxPositions').checked;
  const autoArrange = document.getElementById('autoArrangeOnResize').checked;
  const gridSize = document.getElementById('gridSizeSelect').value;
  const spacing = document.getElementById('boxSpacingSlider').value;
  const spanMonitors = document.getElementById('spanMonitors').checked;
  const perMonitor = document.getElementById('rememberPerMonitor').checked;
  
  state.layout = { lockPositions, autoArrange, gridSize, spacing, spanMonitors, perMonitor };
};

window.saveLayoutAsDefault = () => {
  alert('Layout saved as default!');
};

// ========================================
// SNAPSHOT FUNCTIONS
// ========================================

// Хранилище снимков
state.snapshots = [];

// Загрузить снимки из main процесса
window.loadSnapshots = async () => {
  try {
    if (window.electronAPI) {
      const snapshots = await window.electronAPI.getSnapshots();
      state.snapshots = snapshots;
      console.log(`Loaded ${snapshots.length} snapshots`);
    }
    renderSnapshotsList();
  } catch (error) {
    console.error('Error loading snapshots:', error);
  }
};

// Сохранить снимки (для совместимости)
window.saveSnapshots = () => {
  // В новой реализации не используется, данные хранятся в main процессе
};

// ========================================
// TAB MODE FUNCTIONS
// ========================================

// Хранилище табов
state.tabs = [];
state.tabSettings = {
  autoCollapse: false,
  showIcons: true
};

// Инициализация Tab Mode
window.initTabMode = async () => {
  try {
    // Загружаем конфигурацию боксов
    const boxes = await window.electronAPI.getBoxesConfig();
    
    // Находим боксы с groupId (принадлежащие табам)
    const tabsMap = new Map();
    
    boxes.forEach(box => {
      if (box.tabId) {
        if (!tabsMap.has(box.tabId)) {
          tabsMap.set(box.tabId, {
            id: box.tabId,
            name: box.tabName || 'Tab',
            boxes: [],
            activeBoxId: box.id
          });
        }
        tabsMap.get(box.tabId).boxes.push(box);
      }
    });
    
    state.tabs = Array.from(tabsMap.values());
    renderTabsList();
    populateMergeBoxSelects(boxes);
  } catch (error) {
    console.error('Error initializing tab mode:', error);
  }
};

// Рендеринг списка табов
window.renderTabsList = () => {
  const list = document.getElementById('tabsList');
  if (!list) return;
  
  if (state.tabs.length === 0) {
    list.innerHTML = `
      <div class="no-tabs-info">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <p data-i18n="boxes.noTabsYet">No tabs yet. Create your first tab!</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = state.tabs.map(tab => `
    <div class="tab-item" data-tab-id="${tab.id}">
      <div class="tab-item-header">
        <div class="tab-item-info">
          <span class="tab-item-name">${tab.name}</span>
          <span class="tab-item-count" data-i18n="boxes.tabBoxesCount">${tab.boxes.length} боксов</span>
        </div>
        <div class="tab-item-actions">
          <button class="tab-action-btn" onclick="viewTab('${tab.id}')" title="View Tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <button class="tab-action-btn" onclick="ungroupTab('${tab.id}')" title="Ungroup">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
            </svg>
          </button>
          <button class="tab-action-btn danger" onclick="deleteTab('${tab.id}')" title="Delete Tab">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="tab-boxes-preview">
        ${tab.boxes.map(box => `
          <span class="tab-box-chip" style="background-color: ${box.color}40; border-color: ${box.color};">
            ${box.name}
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');
};

// Создание нового таба
window.createNewTab = async () => {
  const nameInput = document.getElementById('newTabName');
  const name = nameInput?.value.trim();
  
  if (!name) {
    alert('Please enter a tab name');
    return;
  }
  
  const tabId = 'tab_' + Date.now();
  
  state.tabs.push({
    id: tabId,
    name: name,
    boxes: [],
    activeBoxId: null
  });
  
  // Обновляем UI
  renderTabsList();
  populateMergeBoxSelects();
  
  // Очищаем поле
  if (nameInput) {
    nameInput.value = '';
  }
  
  alert(`Tab "${name}" created! Now merge boxes into it.`);
};

// Заполнение селектов для объединения боксов
window.populateMergeBoxSelects = (boxes) => {
  const select1 = document.getElementById('mergeBoxSelect1');
  const select2 = document.getElementById('mergeBoxSelect2');
  
  if (!select1 || !select2) return;
  
  // Если боксы не переданы, загружаем их
  if (!boxes) {
    window.electronAPI.getBoxesConfig().then(allBoxes => {
      populateSelects(allBoxes);
    });
    return;
  }
  
  populateSelects(boxes);
  
  function populateSelects(allBoxes) {
    // Фильтруем только боксы, которые не в табах
    const freeBoxes = allBoxes.filter(b => !b.tabId);
    
    const options = freeBoxes.map(box => 
      `<option value="${box.id}" data-color="${box.color}">${box.name}</option>`
    ).join('');
    
    select1.innerHTML = `<option value="" data-i18n="boxes.selectFirstBox">Select first box...</option>${options}`;
    select2.innerHTML = `<option value="" data-i18n="boxes.selectSecondBox">Select second box...</option>${options}`;
  }
};

// Объединение боксов в таб
window.mergeBoxesIntoTab = async () => {
  const select1 = document.getElementById('mergeBoxSelect1');
  const select2 = document.getElementById('mergeBoxSelect2');
  
  const boxId1 = select1?.value;
  const boxId2 = select2?.value;
  
  if (!boxId1 || !boxId2) {
    alert('Please select two boxes to merge');
    return;
  }
  
  if (boxId1 === boxId2) {
    alert('Please select two different boxes');
    return;
  }
  
  // Находим или создаем таб
  let tab = state.tabs.find(t => t.boxes.length === 0) || state.tabs[0];
  
  if (!tab) {
    alert('Please create a tab first');
    return;
  }
  
  // Обновляем конфигурацию боксов
  const boxes = await window.electronAPI.getBoxesConfig();
  const box1 = boxes.find(b => b.id === boxId1);
  const box2 = boxes.find(b => b.id === boxId2);
  
  if (box1) {
    box1.tabId = tab.id;
    box1.tabName = tab.name;
    await window.electronAPI.updateBoxConfig(boxId1, { tabId: tab.id, tabName: tab.name });
  }
  
  if (box2) {
    box2.tabId = tab.id;
    box2.tabName = tab.name;
    await window.electronAPI.updateBoxConfig(boxId2, { tabId: tab.id, tabName: tab.name });
  }
  
  // Обновляем состояние табов
  tab.boxes.push(box1, box2);
  
  // Обновляем UI
  renderTabsList();
  populateMergeBoxSelects();
  
  alert(`Boxes "${box1?.name}" and "${box2?.name}" merged into tab "${tab.name}"!`);
};

// Разгруппировка таба
window.ungroupTab = async (tabId) => {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  if (confirm(`Ungroup tab "${tab.name}"? Boxes will be restored to desktop.`)) {
    // Удаляем tabId из всех боксов этого таба
    const boxes = await window.electronAPI.getBoxesConfig();
    for (const box of tab.boxes) {
      await window.electronAPI.updateBoxConfig(box.id, { tabId: null, tabName: null });
    }
    
    // Удаляем таб из списка
    state.tabs = state.tabs.filter(t => t.id !== tabId);
    
    renderTabsList();
    populateMergeBoxSelects();
    
    alert(`Tab "${tab.name}" ungrouped!`);
  }
};

// Удаление таба
window.deleteTab = async (tabId) => {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  if (confirm(`Delete tab "${tab.name}"? This will not delete the boxes, just ungroup them.`)) {
    await window.ungroupTab(tabId);
  }
};

// Просмотр таба
window.viewTab = (tabId) => {
  const tab = state.tabs.find(t => t.id === tabId);
  if (!tab) return;
  
  alert(`Tab "${tab.name}" contains ${tab.boxes.length} boxes:\n${tab.boxes.map(b => b.name).join(', ')}`);
};

// Обновление настроек табов
window.updateTabSettings = () => {
  const autoCollapse = document.getElementById('autoCollapseTabs')?.checked;
  const showIcons = document.getElementById('showTabIcons')?.checked;
  
  state.tabSettings = { autoCollapse, showIcons };
  console.log('Tab settings updated:', state.tabSettings);
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  // Инициализируем Tab Mode при переключении на вкладку
  const tabModeButton = document.querySelector('[data-subtab="tab-mode"]');
  if (tabModeButton) {
    tabModeButton.addEventListener('click', () => {
      window.initTabMode();
    });
  }
});

// ========================================
// SNAPSHOT FUNCTIONS (continued)
// ========================================

window.createSnapshot = async () => {
  updateBoxCounts();
  const name = document.getElementById('snapshotName').value.trim();
  const description = document.getElementById('snapshotDescription').value.trim();
  const includeWallpaper = document.getElementById('includeWallpaper').checked;
  const includeWidgets = document.getElementById('includeWidgetPositions').checked;

  if (!name) {
    alert('Please enter a snapshot name');
    return;
  }

  if (!window.electronAPI) {
    alert('Electron API not available');
    return;
  }

  try {
    const result = await window.electronAPI.createSnapshot({
      name,
      description,
      includeWallpaper,
      includeWidgets
    });

    if (result.success) {
      // Добавляем в локальный список
      const snapshot = result.snapshot;
      state.snapshots.unshift({
        id: snapshot.id,
        name: snapshot.name,
        description: snapshot.description,
        createdAt: snapshot.createdAt,
        date: new Date(snapshot.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
        boxesCount: snapshot.boxes?.length || 0,
        iconsCount: snapshot.boxes?.reduce((sum, b) => sum + (b.itemCount || 0), 0) || 0
      });

      renderSnapshotsList();

      alert(`Snapshot "${name}" created successfully!\n\nBoxes: ${snapshot.boxes?.length || 0}\nWallpaper: ${includeWallpaper ? 'Included' : 'Not included'}\nWidgets: ${includeWidgets ? 'Included' : 'Not included'}`);

      // Очистка полей
      document.getElementById('snapshotName').value = '';
      document.getElementById('snapshotDescription').value = '';
    } else {
      alert(`Error creating snapshot: ${result.error}`);
    }
  } catch (error) {
    console.error('Error creating snapshot:', error);
    alert(`Error creating snapshot: ${error.message}`);
  }
};

// ========================================
// WALLPAPERS FUNCTIONS
// ========================================

function renderSnapshotsList() {
  const list = document.getElementById('snapshotsList');
  if (!list) return;

  if (state.snapshots.length === 0) {
    list.innerHTML = `
      <div class="no-snapshots-info">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        <p>No snapshots yet. Create your first desktop snapshot!</p>
      </div>
    `;
    return;
  }

  list.innerHTML = state.snapshots.map(s => `
    <div class="snapshot-item">
      <div class="snapshot-info">
        <div class="snapshot-name">${s.name}</div>
        <div class="snapshot-meta">
          ${s.description ? `<span class="snapshot-desc">${s.description}</span>` : ''}
          <span>Created: ${s.date} • ${s.boxesCount} boxes • ${s.iconsCount} icons</span>
        </div>
      </div>
      <div class="snapshot-actions">
        <button class="snapshot-btn restore" onclick="restoreSnapshot('${s.id}')" title="Restore">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button class="snapshot-btn export" onclick="exportSnapshot('${s.id}')" title="Export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        <button class="snapshot-btn delete" onclick="deleteSnapshot('${s.id}')" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
}

window.restoreSnapshot = async (snapshotId) => {
  const snapshot = state.snapshots.find(s => s.id === snapshotId);
  if (!snapshot) {
    alert('Snapshot not found');
    return;
  }

  if (confirm(`Restore snapshot "${snapshot.name}"?\n\nThis will replace your current desktop configuration with the saved one.`)) {
    if (!window.electronAPI) {
      alert('Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.restoreSnapshot(snapshotId);

      if (result.success) {
        // Обновляем локальное состояние
        state.boxes = result.snapshot.boxes || [];
        renderBoxes();

        alert(`Snapshot "${snapshot.name}" restored successfully!`);
      } else {
        alert(`Error restoring snapshot: ${result.error}`);
      }
    } catch (error) {
      console.error('Error restoring snapshot:', error);
      alert(`Error restoring snapshot: ${error.message}`);
    }
  }
};

window.exportSnapshot = async (snapshotId) => {
  if (!window.electronAPI) {
    alert('Electron API not available');
    return;
  }

  try {
    const result = await window.electronAPI.exportSnapshot(snapshotId);

    if (result.success) {
      alert(`Snapshot exported successfully!\n\nSaved to: ${result.path}`);
    } else if (!result.canceled) {
      alert(`Error exporting snapshot: ${result.error}`);
    }
  } catch (error) {
    console.error('Error exporting snapshot:', error);
    alert(`Error exporting snapshot: ${error.message}`);
  }
};

window.deleteSnapshot = async (snapshotId) => {
  const snapshot = state.snapshots.find(s => s.id === snapshotId);
  if (!snapshot) return;

  if (confirm(`Delete snapshot "${snapshot.name}"?\n\nThis action cannot be undone.`)) {
    if (!window.electronAPI) {
      alert('Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.deleteSnapshot(snapshotId);

      if (result.success) {
        // Удаляем из локального списка
        state.snapshots = state.snapshots.filter(s => s.id !== snapshotId);
        renderSnapshotsList();
      } else {
        alert(`Error deleting snapshot: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting snapshot:', error);
      alert(`Error deleting snapshot: ${error.message}`);
    }
  }
};

window.importSnapshot = async () => {
  if (!window.electronAPI) {
    alert('Electron API not available');
    return;
  }

  try {
    const result = await window.electronAPI.importSnapshot();

    if (result.success) {
      // Добавляем в локальный список
      const snapshot = result.snapshot;
      state.snapshots.unshift({
        id: snapshot.id,
        name: snapshot.name + ' (Imported)',
        description: snapshot.description,
        createdAt: snapshot.importedAt || snapshot.createdAt,
        date: new Date(snapshot.importedAt || snapshot.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
        boxesCount: snapshot.boxes?.length || 0,
        iconsCount: snapshot.boxes?.reduce((sum, b) => sum + (b.itemCount || 0), 0) || 0
      });

      renderSnapshotsList();

      alert(`Snapshot "${snapshot.name}" imported successfully!`);
    } else if (!result.canceled) {
      alert(`Error importing snapshot: ${result.error}`);
    }
  } catch (error) {
    console.error('Error importing snapshot:', error);
    alert(`Error importing snapshot: ${error.message}`);
  }
};

// ========================================
// WALLPAPERS FUNCTIONS
// ========================================

let currentWallpaperTab = 'live';

window.switchWallpaperTab = (tab) => {
  currentWallpaperTab = tab;
  
  // Update tabs
  document.querySelectorAll('.wallpaper-tab').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab === 'my' ? 'my' : tab));
  });
  
  // Show/hide playlist settings
  const playlistSettings = document.getElementById('playlistSettings');
  if (playlistSettings) {
    playlistSettings.style.display = tab === 'live' ? 'block' : 'none';
  }
  
  renderWallpapers();
};

window.filterWallpapers = () => {
  const search = document.getElementById('wallpaperSearch')?.value.toLowerCase() || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const resolution = document.getElementById('resolutionFilter')?.value || '';
  
  let filtered = state.wallpapers;
  
  if (search) {
    filtered = filtered.filter(w => w.title.toLowerCase().includes(search));
  }
  
  if (category) {
    filtered = filtered.filter(w => w.category === category);
  }
  
  if (resolution) {
    filtered = filtered.filter(w => w.resolution.toLowerCase().includes(resolution));
  }
  
  renderWallpapers(filtered);
};

window.renderWallpapers = (wallpapersToRender) => {
  const grid = document.getElementById('wallpapersGrid');
  if (!grid) return;
  
  const wallpapers = wallpapersToRender || state.wallpapers;
  
  grid.innerHTML = wallpapers.map(wp => `
    <div class="wallpaper-card">
      <div class="wallpaper-image">
        <img src="${wp.url}" alt="${wp.title}" loading="lazy">
        <div class="wallpaper-overlay">
          <div class="wallpaper-actions">
            <button class="wallpaper-action-btn set-as-wallpaper" onclick="setAsWallpaper('${wp.id}')">
              Set as Wallpaper
            </button>
            <button class="wallpaper-action-btn" onclick="addToFavorites('${wp.id}')" title="Add to Favorites">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </button>
            <button class="wallpaper-action-btn" onclick="downloadWallpaper('${wp.id}')" title="Download">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div class="wallpaper-info">
        <div class="wallpaper-title">${wp.title}</div>
        <div class="wallpaper-meta">
          <span class="wallpaper-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            ${wp.downloads.toLocaleString()}
          </span>
          <span class="wallpaper-meta-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            ${wp.favorites.toLocaleString()}
          </span>
          <span class="wallpaper-meta-item">${wp.resolution}</span>
        </div>
      </div>
    </div>
  `).join('');
  
  // Render popular wallpapers
  renderPopularWallpapers();
};

window.renderPopularWallpapers = () => {
  const container = document.getElementById('popularWallpapers');
  if (!container) return;
  
  const popular = state.wallpapers
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 4);
  
  container.innerHTML = popular.map(wp => `
    <div class="popular-wallpaper-item" onclick="setAsWallpaper('${wp.id}')">
      <img src="${wp.url}" alt="${wp.title}" loading="lazy">
      <div class="popular-badge">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${(wp.downloads / 1000).toFixed(1)}k
      </div>
    </div>
  `).join('');
};

window.setAsWallpaper = (wallpaperId) => {
  const wp = state.wallpapers.find(w => w.id === wallpaperId);
  if (wp) {
    alert(`Setting "${wp.title}" as wallpaper...\n\nType: ${currentWallpaperTab === 'live' ? 'Live' : 'Static'}`);
  }
};

window.downloadWallpaper = async (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (!wallpaper) return;

  try {
    // В реальной реализации - загрузка файла
    alert(`Downloading "${wallpaper.title}"...\n\nSaved to: Pictures/Wallpapers/`);
  } catch (error) {
    alert('Error downloading wallpaper: ' + error.message);
  }
};

window.addToFavorites = (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (wallpaper) {
    wallpaper.favorites++;
    alert(`"${wallpaper.title}" added to favorites!`);
    renderWallpapers();
  }
};

window.openCreateWallpaper = () => {
  alert('Create Custom Wallpaper\n\nFeatures:\n• Particle Effects\n• Filters\n• Mouse Effects\n• Preview & Apply\n• Publish to Community');
};

// ========================================
// WALLPAPER MANAGER INTEGRATION
// ========================================

// Установить обои
window.setAsWallpaper = async (wallpaperId) => {
  const wallpaper = state.wallpapers.find(w => w.id === wallpaperId);
  if (!wallpaper) return;

  try {
    if (window.electronAPI) {
      // Для демо используем URL, в реальности - локальный путь
      const result = await window.electronAPI.setStaticWallpaper(wallpaper.url);
      
      if (result.success) {
        alert(`"${wallpaper.title}" set as desktop wallpaper!`);
      } else {
        alert('Error setting wallpaper: ' + result.error);
      }
    } else {
      alert(`"${wallpaper.title}" set as wallpaper! (demo mode)`);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Выбрать локальные обои
window.selectLocalWallpaper = async () => {
  if (!window.electronAPI) {
    alert('Electron API not available');
    return;
  }

  try {
    const result = await window.electronAPI.selectWallpaperFile({
      name: 'Wallpapers',
      extensions: ['jpg', 'jpeg', 'png', 'mp4', 'webm', 'gif']
    });

    if (result.success) {
      const isVideo = result.path.match(/\.(mp4|webm|gif)$/i);
      
      if (isVideo) {
        const liveResult = await window.electronAPI.setLiveWallpaper(result.path, {
          muted: true,
          loop: true
        });
        
        if (liveResult.success) {
          alert('Live wallpaper applied!');
          showLiveWallpaperControls();
        }
      } else {
        const staticResult = await window.electronAPI.setStaticWallpaper(result.path);
        
        if (staticResult.success) {
          alert('Wallpaper applied!');
        }
      }
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Показать/скрыть контролы живых обоев
window.showLiveWallpaperControls = () => {
  const controls = document.getElementById('liveWallpaperControls');
  if (controls) {
    controls.style.display = 'block';
  }
};

window.hideLiveWallpaperControls = () => {
  const controls = document.getElementById('liveWallpaperControls');
  if (controls) {
    controls.style.display = 'none';
  }
};

window.toggleLiveWallpaperControls = () => {
  const controls = document.getElementById('liveWallpaperControls');
  if (controls) {
    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
  }
};

// Пауза/возобновление
window.toggleWallpaperPause = async () => {
  if (!window.electronAPI) return;

  try {
    const result = await window.electronAPI.toggleWallpaperPause();
    
    if (result.success) {
      const btn = document.getElementById('pausePlayBtn');
      if (btn) {
        const isPaused = result.paused;
        btn.innerHTML = isPaused ? 
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>Play</span>` :
          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          <span>Pause</span>`;
      }
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Остановить обои
window.stopWallpaper = async () => {
  if (!window.electronAPI) return;

  try {
    await window.electronAPI.stopWallpaper();
    hideLiveWallpaperControls();
    alert('Wallpaper stopped');
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Громкость
window.setWallpaperVolume = async (value) => {
  if (!window.electronAPI) return;

  try {
    await window.electronAPI.setWallpaperVolume(value / 100);
  } catch (error) {
    console.error('Error setting volume:', error);
  }
};

// Запустить плейлист
window.startWallpaperPlaylist = async (wallpapers, options = {}) => {
  if (!window.electronAPI) return;

  try {
    const result = await window.electronAPI.startWallpaperPlaylist(wallpapers, {
      interval: options.interval || 300000, // 5 минут по умолчанию
      shuffle: options.shuffle || false,
      loop: options.loop || true
    });

    if (result.success) {
      alert('Wallpaper playlist started!');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Остановить плейлист
window.stopWallpaperPlaylist = async () => {
  if (!window.electronAPI) return;

  try {
    await window.electronAPI.stopWallpaperPlaylist();
    alert('Playlist stopped');
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// ========================================
// PERSONALIZATION FUNCTIONS
// ========================================

// Состояние персонализации
state.personalization = {
  theme: 'default',
  taskbarStyle: 'default',
  startMenuStyle: 'default',
  desktopIconsMode: 'default',
  mouseCursor: 'default'
};

window.switchPersonalizationTab = (tab) => {
  // Обновляем вкладки
  document.querySelectorAll('.personalization-tab').forEach(btn => {
    const tabMap = {
      'themes': 'themes',
      'taskbar': 'taskbar',
      'startmenu': 'start',
      'desktopicons': 'desktop',
      'mouse': 'mouse'
    };
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tabMap[tab] || tab));
  });

  // Обновляем контент
  document.querySelectorAll('.personalization-content').forEach(content => {
    content.classList.toggle('active', content.id === `${tab}-content`);
  });
};

window.selectTaskbarStyle = (style) => {
  state.personalization.taskbarStyle = style;
  
  // Обновляем UI
  document.querySelectorAll('.taskbar-style-card').forEach(card => {
    card.classList.toggle('selected', card.onclick.toString().includes(style));
  });

  // Обновляем preview
  const preview = document.getElementById('taskbarPreview');
  if (preview) {
    if (style === 'default') {
      preview.style.justifyContent = 'flex-start';
      preview.style.gap = '8px';
    } else if (style === 'centered') {
      preview.style.justifyContent = 'center';
      preview.style.gap = '8px';
    } else if (style === 'floating') {
      preview.style.justifyContent = 'center';
      preview.style.gap = '8px';
      preview.style.padding = '8px';
    } else if (style === 'minimal') {
      preview.style.justifyContent = 'space-between';
      preview.style.gap = '16px';
    }
  }
  
  // Сохраняем в конфигурацию
  savePersonalizationSettings();
};

window.selectStartMenuStyle = (style) => {
  state.personalization.startMenuStyle = style;
  
  document.querySelectorAll('.start-menu-style-card').forEach(card => {
    card.classList.toggle('selected', card.onclick.toString().includes(style));
  });
  
  savePersonalizationSettings();
};

window.selectDesktopIconsMode = (mode) => {
  state.personalization.desktopIconsMode = mode;
  
  document.querySelectorAll('.desktop-icons-card').forEach(card => {
    card.classList.toggle('selected', card.onclick.toString().includes(mode));
  });
  
  savePersonalizationSettings();
};

window.selectMouseCursor = (cursor) => {
  state.personalization.mouseCursor = cursor;
  
  document.querySelectorAll('.mouse-cursor-card').forEach(card => {
    card.classList.toggle('selected', card.onclick.toString().includes(cursor));
  });
  
  savePersonalizationSettings();
};

window.selectTheme = (themeId) => {
  state.personalization.theme = themeId;
  
  // Обновляем UI
  document.querySelectorAll('.theme-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.themeId === themeId);
  });
  
  // Применяем тему
  applyTheme(themeId);
  savePersonalizationSettings();
};

// Применить тему
function applyTheme(themeId) {
  const theme = state.themes.find(t => t.id === themeId);
  if (!theme) return;
  
  // Применяем цвета через CSS переменные
  const root = document.documentElement;
  
  if (themeId === 'dark') {
    root.style.setProperty('--bg-primary', '#111827');
    root.style.setProperty('--bg-secondary', '#1f2937');
    root.style.setProperty('--bg-tertiary', '#374151');
  } else if (themeId === 'light') {
    root.style.setProperty('--bg-primary', '#f9fafb');
    root.style.setProperty('--bg-secondary', '#f3f4f6');
    root.style.setProperty('--bg-tertiary', '#e5e7eb');
    root.style.setProperty('--text-primary', '#111827');
    root.style.setProperty('--text-secondary', '#6b7280');
  } else if (themeId === 'nature') {
    root.style.setProperty('--bg-primary', '#064e3b');
    root.style.setProperty('--bg-secondary', '#065f46');
    root.style.setProperty('--bg-tertiary', '#047857');
    root.style.setProperty('--accent-purple', '#10b981');
  } else if (themeId === 'gaming') {
    root.style.setProperty('--bg-primary', '#4c1d95');
    root.style.setProperty('--bg-secondary', '#5b21b6');
    root.style.setProperty('--bg-tertiary', '#6d28d9');
    root.style.setProperty('--accent-purple', '#8b5cf6');
    root.style.setProperty('--accent-pink', '#ec4899');
  } else if (themeId === 'professional') {
    root.style.setProperty('--bg-primary', '#334155');
    root.style.setProperty('--bg-secondary', '#475569');
    root.style.setProperty('--bg-tertiary', '#64748b');
  }
  // Default theme
  else {
    root.style.setProperty('--bg-primary', '#0f111a');
    root.style.setProperty('--bg-secondary', '#161b28');
    root.style.setProperty('--bg-tertiary', '#1e2538');
    root.style.setProperty('--accent-purple', '#a855f7');
  }
}

// Сохранить настройки персонализации
function savePersonalizationSettings() {
  try {
    localStorage.setItem('personalizationSettings', JSON.stringify(state.personalization));
    console.log('Personalization settings saved');
  } catch (error) {
    console.error('Error saving personalization settings:', error);
  }
}

// Загрузить настройки персонализации
function loadPersonalizationSettings() {
  try {
    const saved = localStorage.getItem('personalizationSettings');
    if (saved) {
      state.personalization = JSON.parse(saved);
      
      // Применяем сохраненные настройки
      if (state.personalization.theme) {
        applyTheme(state.personalization.theme);
      }
      
      console.log('Personalization settings loaded');
    }
  } catch (error) {
    console.error('Error loading personalization settings:', error);
  }
}

// ========================================
// WIDGETS FUNCTIONS
// ========================================

// Глобальные настройки виджетов
let globalWidgetSettings = {};
let widgetsEnabledGlobally = true;

// Загрузить глобальные настройки
async function loadGlobalWidgetSettings() {
  if (!window.electronAPI) return;
  
  try {
    globalWidgetSettings = await window.electronAPI.getGlobalWidgetSettings();
    console.log('Loaded global widget settings:', globalWidgetSettings);
    
    // Обновить UI
    const transparency = globalWidgetSettings.transparency ?? 85;
    const scale = globalWidgetSettings.scale ?? 100;
    
    document.getElementById('showInDesktopMode').checked = globalWidgetSettings.showInDesktopMode ?? true;
    document.getElementById('alwaysOnTop').checked = globalWidgetSettings.alwaysOnTop ?? true;
    document.getElementById('blurEffect').checked = globalWidgetSettings.blurEffect ?? true;
    document.getElementById('animationEnabled').checked = globalWidgetSettings.animationEnabled ?? true;
    
    // Widget sliders
    const widgetTransparencySlider = document.getElementById('widgetTransparencySlider');
    const widgetTransparencyValue = document.getElementById('widgetTransparencyValue');
    const widgetScaleSlider = document.getElementById('widgetScaleSlider');
    const widgetScaleValue = document.getElementById('widgetScaleValue');
    
    if (widgetTransparencySlider) {
      widgetTransparencySlider.value = transparency;
      widgetTransparencyValue.textContent = transparency + '%';
    }
    if (widgetScaleSlider) {
      widgetScaleSlider.value = scale;
      widgetScaleValue.textContent = scale + '%';
    }
    
    console.log('UI updated - transparency:', transparency, 'scale:', scale);
  } catch (error) {
    console.error('Error loading global widget settings:', error);
  }
}

// Обновить глобальные настройки
window.updateGlobalWidgetSettings = async () => {
  const widgetTransparencySlider = document.getElementById('widgetTransparencySlider');
  const widgetTransparencyValue = document.getElementById('widgetTransparencyValue');
  const widgetScaleSlider = document.getElementById('widgetScaleSlider');
  const widgetScaleValue = document.getElementById('widgetScaleValue');
  
  const newSettings = {
    showInDesktopMode: document.getElementById('showInDesktopMode').checked,
    alwaysOnTop: document.getElementById('alwaysOnTop').checked,
    blurEffect: document.getElementById('blurEffect').checked,
    animationEnabled: document.getElementById('animationEnabled').checked,
    transparency: widgetTransparencySlider ? parseInt(widgetTransparencySlider.value) : 85,
    scale: widgetScaleSlider ? parseInt(widgetScaleSlider.value) : 100
  };
  
  // Обновить отображаемые значения
  if (widgetTransparencyValue) widgetTransparencyValue.textContent = newSettings.transparency + '%';
  if (widgetScaleValue) widgetScaleValue.textContent = newSettings.scale + '%';
  
  if (window.electronAPI) {
    try {
      await window.electronAPI.updateGlobalWidgetSettings(newSettings);
      globalWidgetSettings = newSettings;
      console.log('Global widget settings updated:', newSettings);
    } catch (error) {
      console.error('Error updating global widget settings:', error);
    }
  }
};

// Включить/выключить все виджеты
window.toggleWidgets = async () => {
  const enabled = document.getElementById('enableWidgets').checked;
  widgetsEnabledGlobally = enabled;
  settings.widgetsEnabled = enabled;
  
  // Сохранить настройку
  if (window.electronAPI) {
    try {
      await window.electronAPI.updateGlobalWidgetSettings({ widgetsEnabled: enabled });
      
      // Если выключаем - закрыть все виджеты
      if (!enabled) {
        // Отправляем событие на закрытие всех виджетов
        const widgets = state.widgets.filter(w => w.enabled);
        for (const widget of widgets) {
          await window.electronAPI.toggleWidget(widget.id, false);
        }
      }
    } catch (error) {
      console.error('Error toggling widgets:', error);
    }
  }
  
  console.log(`Widgets ${enabled ? 'enabled' : 'disabled'}`);
};

window.openWidgetSettings = async (widgetId) => {
  console.log('🔧 openWidgetSettings called with widgetId:', widgetId);
  
  const widget = state.widgets.find(w => w.id === widgetId);
  if (!widget) {
    console.error('❌ Widget not found:', widgetId);
    return;
  }

  // Загрузить настройки виджета
  let widgetSettings = {};
  if (window.electronAPI) {
    widgetSettings = await window.electronAPI.getWidgetSettings(widgetId);
    console.log('📋 Loaded widget settings:', widgetSettings);
  }

  const modal = document.getElementById('widgetDetailsModal');
  const title = document.getElementById('widgetDetailTitle');
  const body = document.getElementById('widgetDetailBody');

  console.log('🔍 Modal elements:', { modal, title, body });

  if (!modal || !title || !body) {
    console.error('❌ Modal elements not found!', { modal: !!modal, title: !!title, body: !!body });
    return;
  }

  title.textContent = `${widget.name} Settings`;

  let settingsHtml = '';

  switch(widgetId) {
    case 'schedule':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">Calendar Source</label>
            <select class="form-select" id="scheduleCalendarSource" onchange="saveWidgetSettings('${widgetId}')">
              <option value="windows" ${widgetSettings.calendarSource === 'windows' ? 'selected' : ''}>Windows Calendar</option>
              <option value="google" ${widgetSettings.calendarSource === 'google' ? 'selected' : ''}>Google Calendar</option>
              <option value="outlook" ${widgetSettings.calendarSource === 'outlook' ? 'selected' : ''}>Outlook</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Reminder Time</label>
            <select class="form-select" id="scheduleReminderTime" onchange="saveWidgetSettings('${widgetId}')">
              <option value="5" ${widgetSettings.reminderTime === '5' ? 'selected' : ''}>5 minutes before</option>
              <option value="10" ${widgetSettings.reminderTime === '10' ? 'selected' : ''}>10 minutes before</option>
              <option value="15" ${widgetSettings.reminderTime === '15' ? 'selected' : ''}>15 minutes before</option>
              <option value="30" ${widgetSettings.reminderTime === '30' ? 'selected' : ''}>30 minutes before</option>
              <option value="60" ${widgetSettings.reminderTime === '60' ? 'selected' : ''}>1 hour before</option>
            </select>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show All-Day Events</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="scheduleAllDayEvents" ${widgetSettings.allDayEvents ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Past Events</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="schedulePastEvents" ${widgetSettings.pastEvents ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    case 'inotes':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">Default Note Color</label>
            <input type="color" class="form-input" id="inotesNoteColor" value="${widgetSettings.noteColor || '#ffffff'}" onchange="saveWidgetSettings('${widgetId}')" style="width: 100px; height: 40px;">
          </div>
          <div class="form-group">
            <label class="form-label">Font Size</label>
            <select class="form-select" id="inotesFontSize" onchange="saveWidgetSettings('${widgetId}')">
              <option value="12" ${widgetSettings.fontSize === '12' ? 'selected' : ''}>Small (12px)</option>
              <option value="14" ${widgetSettings.fontSize === '14' ? 'selected' : ''}>Medium (14px)</option>
              <option value="16" ${widgetSettings.fontSize === '16' ? 'selected' : ''}>Large (16px)</option>
              <option value="18" ${widgetSettings.fontSize === '18' ? 'selected' : ''}>Extra Large (18px)</option>
            </select>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Auto-save Notes</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="inotesAutoSave" ${widgetSettings.autoSave !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    case 'clock':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">Clock Style</label>
            <select class="form-select" id="clockStyle" onchange="saveWidgetSettings('${widgetId}')">
              <option value="dial" ${widgetSettings.style === 'dial' ? 'selected' : ''}>Dial Clock (Analog)</option>
              <option value="digital" ${widgetSettings.style === 'digital' ? 'selected' : ''}>Digital Clock</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Time Format</label>
            <select class="form-select" id="clockFormat" onchange="saveWidgetSettings('${widgetId}')">
              <option value="12" ${widgetSettings.timeFormat === '12' ? 'selected' : ''}>12-hour (AM/PM)</option>
              <option value="24" ${widgetSettings.timeFormat === '24' ? 'selected' : ''}>24-hour</option>
            </select>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Seconds</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="clockSeconds" ${widgetSettings.showSeconds ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Date</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="clockDate" ${widgetSettings.showDate !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Timezone</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="clockTimezone" ${widgetSettings.showTimezone ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    case 'weather':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input type="text" class="form-input" id="weatherLocation" value="${widgetSettings.location || ''}" placeholder="Enter city name" onchange="saveWidgetSettings('${widgetId}')">
          </div>
          <div class="form-group">
            <label class="form-label">Temperature Unit</label>
            <select class="form-select" id="weatherUnit" onchange="saveWidgetSettings('${widgetId}')">
              <option value="celsius" ${widgetSettings.unit === 'celsius' ? 'selected' : ''}>Celsius (°C)</option>
              <option value="fahrenheit" ${widgetSettings.unit === 'fahrenheit' ? 'selected' : ''}>Fahrenheit (°F)</option>
            </select>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Forecast</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="weatherForecast" ${widgetSettings.showForecast !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Humidity</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="weatherHumidity" ${widgetSettings.showHumidity ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Wind Speed</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="weatherWind" ${widgetSettings.showWind ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    case 'quickTools':
      settingsHtml = `
        <div class="widget-settings-form">
          <h4 style="margin-bottom: 12px; color: var(--text-primary);">Visible Tools</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolScreenshot" ${widgetSettings.showScreenshot !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">Screenshot</span>
            </div>
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolFiles" ${widgetSettings.showFiles !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">Files</span>
            </div>
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolSettings" ${widgetSettings.showSettings !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">Settings</span>
            </div>
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolCalculator" ${widgetSettings.showCalculator ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">Calculator</span>
            </div>
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolAI" ${widgetSettings.showAI !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">AI</span>
            </div>
            <div class="setting-item toggle" style="flex-direction: column; align-items: flex-start;">
              <label class="switch">
                <input type="checkbox" id="toolCalendar" ${widgetSettings.showCalendar !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
                <span class="slider"></span>
              </label>
              <span style="font-size: 12px; margin-top: 4px;">Calendar</span>
            </div>
          </div>
        </div>
      `;
      break;
    case 'ipomodoro':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">Work Duration (minutes)</label>
            <input type="number" class="form-input" id="pomodoroWork" value="${widgetSettings.workDuration || 25}" min="1" max="60" onchange="saveWidgetSettings('${widgetId}')">
          </div>
          <div class="form-group">
            <label class="form-label">Short Break (minutes)</label>
            <input type="number" class="form-input" id="pomodoroShortBreak" value="${widgetSettings.shortBreak || 5}" min="1" max="30" onchange="saveWidgetSettings('${widgetId}')">
          </div>
          <div class="form-group">
            <label class="form-label">Long Break (minutes)</label>
            <input type="number" class="form-input" id="pomodoroLongBreak" value="${widgetSettings.longBreak || 15}" min="1" max="60" onchange="saveWidgetSettings('${widgetId}')">
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Auto-start Breaks</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pomodoroAutoStart" ${widgetSettings.autoStartBreaks ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Notifications</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pomodoroNotifications" ${widgetSettings.notifications !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Play Sound</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="pomodoroSound" ${widgetSettings.sound ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    case 'chatAI':
      settingsHtml = `
        <div class="widget-settings-form">
          <div class="form-group">
            <label class="form-label">AI Model</label>
            <select class="form-select" id="chatAIModel" onchange="saveWidgetSettings('${widgetId}')">
              <option value="gpt-4" ${widgetSettings.model === 'gpt-4' ? 'selected' : ''}>GPT-4</option>
              <option value="gpt-3.5" ${widgetSettings.model === 'gpt-3.5' ? 'selected' : ''}>GPT-3.5 Turbo</option>
              <option value="claude" ${widgetSettings.model === 'claude' ? 'selected' : ''}>Claude</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Max Response Length</label>
            <select class="form-select" id="chatAILength" onchange="saveWidgetSettings('${widgetId}')">
              <option value="short" ${widgetSettings.maxLength === 'short' ? 'selected' : ''}>Short</option>
              <option value="medium" ${widgetSettings.maxLength === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="long" ${widgetSettings.maxLength === 'long' ? 'selected' : ''}>Long</option>
            </select>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Show Suggestions</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="chatAISuggestions" ${widgetSettings.showSuggestions !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
          <div class="setting-item toggle">
            <div>
              <span class="setting-name">Save Chat History</span>
            </div>
            <label class="switch">
              <input type="checkbox" id="chatAIHistory" ${widgetSettings.saveHistory !== false ? 'checked' : ''} onchange="saveWidgetSettings('${widgetId}')">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      `;
      break;
    default:
      settingsHtml = `<p style="text-align: center; color: var(--text-secondary);">No additional settings for this widget</p>`;
  }

  body.innerHTML = settingsHtml;
  modal.style.display = 'flex';
  console.log('✅ Modal displayed:', modal.style.display);
  
  // Force bring to front
  modal.style.zIndex = '9999';
  console.log('🔍 Modal element:', modal);
  console.log('🔍 Modal computed style:', window.getComputedStyle(modal).display);
};

// Сохранить настройки виджета
window.saveWidgetSettings = async (widgetId) => {
  const settings = {};
  
  // Собрать настройки в зависимости от виджета
  switch(widgetId) {
    case 'schedule':
      settings.calendarSource = document.getElementById('scheduleCalendarSource')?.value;
      settings.reminderTime = document.getElementById('scheduleReminderTime')?.value;
      settings.allDayEvents = document.getElementById('scheduleAllDayEvents')?.checked;
      settings.pastEvents = document.getElementById('schedulePastEvents')?.checked;
      break;
    case 'inotes':
      settings.noteColor = document.getElementById('inotesNoteColor')?.value;
      settings.fontSize = document.getElementById('inotesFontSize')?.value;
      settings.autoSave = document.getElementById('inotesAutoSave')?.checked;
      break;
    case 'clock':
      settings.style = document.getElementById('clockStyle')?.value;
      settings.timeFormat = document.getElementById('clockFormat')?.value;
      settings.showSeconds = document.getElementById('clockSeconds')?.checked;
      settings.showDate = document.getElementById('clockDate')?.checked;
      settings.showTimezone = document.getElementById('clockTimezone')?.checked;
      break;
    case 'weather':
      settings.location = document.getElementById('weatherLocation')?.value;
      settings.unit = document.getElementById('weatherUnit')?.value;
      settings.showForecast = document.getElementById('weatherForecast')?.checked;
      settings.showHumidity = document.getElementById('weatherHumidity')?.checked;
      settings.showWind = document.getElementById('weatherWind')?.checked;
      break;
    case 'quickTools':
      settings.showScreenshot = document.getElementById('toolScreenshot')?.checked;
      settings.showFiles = document.getElementById('toolFiles')?.checked;
      settings.showSettings = document.getElementById('toolSettings')?.checked;
      settings.showCalculator = document.getElementById('toolCalculator')?.checked;
      settings.showAI = document.getElementById('toolAI')?.checked;
      settings.showCalendar = document.getElementById('toolCalendar')?.checked;
      break;
    case 'ipomodoro':
      settings.workDuration = parseInt(document.getElementById('pomodoroWork')?.value);
      settings.shortBreak = parseInt(document.getElementById('pomodoroShortBreak')?.value);
      settings.longBreak = parseInt(document.getElementById('pomodoroLongBreak')?.value);
      settings.autoStartBreaks = document.getElementById('pomodoroAutoStart')?.checked;
      settings.notifications = document.getElementById('pomodoroNotifications')?.checked;
      settings.sound = document.getElementById('pomodoroSound')?.checked;
      break;
    case 'chatAI':
      settings.model = document.getElementById('chatAIModel')?.value;
      settings.maxLength = document.getElementById('chatAILength')?.value;
      settings.showSuggestions = document.getElementById('chatAISuggestions')?.checked;
      settings.saveHistory = document.getElementById('chatAIHistory')?.checked;
      break;
  }
  
  if (window.electronAPI) {
    try {
      await window.electronAPI.updateWidgetSettings(widgetId, settings);
      console.log(`Widget ${widgetId} settings saved:`, settings);
    } catch (error) {
      console.error('Error saving widget settings:', error);
    }
  }
};

window.closeWidgetDetails = () => {
  document.getElementById('widgetDetailsModal').style.display = 'none';
};

window.updateClockStyle = (style) => {
  console.log('Clock style:', style);
};

// ========================================
// AI ASSISTANT FUNCTIONS
// ========================================

window.openAISettings = (featureId) => {
  const feature = state.aiFeatures.find(f => f.id === featureId);
  if (!feature) return;
  
  const modal = document.getElementById('aiSettingsModal');
  const title = document.getElementById('aiSettingTitle');
  const body = document.getElementById('aiSettingBody');
  
  title.textContent = `${feature.name} Settings`;
  
  let settingsHtml = `
    <div class="ai-settings-form">
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Enable ${feature.name}</span>
          <span class="setting-desc">Turn on this AI feature</span>
        </div>
        <label class="switch">
          <input type="checkbox" ${feature.enabled ? 'checked' : ''} onchange="toggleAIFeature('${featureId}')">
          <span class="slider"></span>
        </label>
      </div>
  `;
  
  if (featureId === 'chat-ai') {
    settingsHtml += `
      <div class="form-group">
        <label class="form-label">Hotkey</label>
        <input type="text" class="form-input" value="${feature.hotkey}" readonly>
        <button class="action-button secondary" style="margin-top: 8px;" onclick="changeHotkey('${featureId}')">Change Hotkey</button>
      </div>
      <div class="form-group">
        <label class="form-label">AI Model</label>
        <select class="form-select">
          <option>GPT-4</option>
          <option>GPT-3.5</option>
          <option>Claude</option>
        </select>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Auto-launch on Startup</span>
          <span class="setting-desc">Start ChatAI when Windows starts</span>
        </div>
        <label class="switch">
          <input type="checkbox">
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Desktop Access</span>
          <span class="setting-desc">Allow quick access from desktop</span>
        </div>
        <label class="switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>
    `;
  } else if (featureId === 'search') {
    settingsHtml += `
      <div class="form-group">
        <label class="form-label">Search Hotkey</label>
        <input type="text" class="form-input" value="${feature.hotkey}" readonly>
        <button class="action-button secondary" style="margin-top: 8px;" onclick="changeHotkey('${featureId}')">Change Hotkey</button>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Search History</span>
          <span class="setting-desc">Remember recent searches</span>
        </div>
        <label class="switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Include Cloud Files</span>
          <span class="setting-desc">Search OneDrive and Google Drive</span>
        </div>
        <label class="switch">
          <input type="checkbox">
          <span class="slider"></span>
        </label>
      </div>
    `;
  } else if (featureId === 'screenshot') {
    settingsHtml += `
      <div class="form-group">
        <label class="form-label">Full Screen Hotkey</label>
        <input type="text" class="form-input" value="Ctrl + Shift + A" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Window Hotkey</label>
        <input type="text" class="form-input" value="Ctrl + Shift + W" readonly>
      </div>
      <div class="form-group">
        <label class="form-label">Scrolling Window Hotkey</label>
        <input type="text" class="form-input" value="Ctrl + Shift + S" readonly>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">Auto-copy to Clipboard</span>
          <span class="setting-desc">Automatically copy screenshots</span>
        </div>
        <label class="switch">
          <input type="checkbox" checked>
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item toggle">
        <div>
          <span class="setting-name">AI Enhancement</span>
          <span class="setting-desc">Enhance screenshots with AI</span>
        </div>
        <label class="switch">
          <input type="checkbox">
          <span class="slider"></span>
        </label>
      </div>
    `;
  }
  
  settingsHtml += `</div>`;
  body.innerHTML = settingsHtml;
  modal.style.display = 'flex';
};

window.closeAISettings = () => {
  document.getElementById('aiSettingsModal').style.display = 'none';
};

window.toggleAIFeature = (featureId) => {
  const feature = state.aiFeatures.find(f => f.id === featureId);
  if (feature) {
    feature.enabled = !feature.enabled;
    renderAIFeatures();
  }
};

window.changeHotkey = (featureId) => {
  alert('Press the new hotkey combination...\n\n(Hotkey change dialog would appear here)');
};

// ========================================
// OPTIONS FUNCTIONS
// ========================================

window.checkForUpdates = () => {
  const statusEl = document.getElementById('updateStatus');
  statusEl.textContent = t('options.checkForUpdates') === 'Check for Updates' ? 'Checking...' : t('ai.testing') || 'Checking...';
  statusEl.style.color = 'var(--accent-blue)';

  setTimeout(() => {
    statusEl.textContent = t('options.upToDate') || 'Up to date';
    statusEl.style.color = 'var(--accent-green)';
    alert(t('settings.upToDate') || 'You are running the latest version (1.0.0)');
  }, 1500);
};

// Language change function (global, works with i18n)
window.changeLanguage = (lang) => {
  // Update active state on buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });

  // Use i18n system if available
  if (window.i18n) {
    window.i18n.setLanguage(lang);
  }

  // Save language preference
  localStorage.setItem('iTopLanguage', lang);

  // Обновляем все тексты в главном окне
  applyTranslationToCurrentPage();

  // Уведомляем открытые окна (виджеты, Private Box) о смене языка
  if (window.electronAPI) {
    window.electronAPI.languageChanged(lang);
  }

  // Показываем уведомление без перезагрузки
  showLanguageChangedNotification(lang);
};

// Применить перевод к текущей странице
function applyTranslationToCurrentPage() {
  // Обновляем все элементы с data-i18n
  if (window.i18n) {
    window.i18n.applyTranslations();
  }
  
  // Обновляем динамический контент
  if (typeof renderBoxes === 'function') renderBoxes();
  if (typeof renderWallpapers === 'function') renderWallpapers();
  if (typeof renderThemes === 'function') renderThemes();
  if (typeof renderWidgets === 'function') renderWidgets();
  if (typeof renderAIFeatures === 'function') renderAIFeatures();
}

// Показать уведомление о смене языка
function showLanguageChangedNotification(lang) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    z-index: 100000;
    animation: slideInRight 0.3s ease;
    font-size: 14px;
    font-weight: 500;
  `;
  
  const langName = lang === 'ru' ? 'Русский' : 'English';
  const msg = lang === 'ru' ? 'Язык изменён' : 'Language changed';
  
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="vertical-align: middle; margin-right: 8px;">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    ${msg}: ${langName}
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Добавим CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Old function for compatibility (removed from Options)
window.selectLanguage = window.changeLanguage;

window.sendFeedback = () => {
  // Открываем модальное окно feedback
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 500px;" onclick="event.stopPropagation()">
      <div class="modal-header">
        <h3>Send Feedback</h3>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Feedback Type</label>
          <select class="form-select" id="feedbackType">
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="improvement">Improvement</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Your Email (optional)</label>
          <input type="email" class="form-input" id="feedbackEmail" placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <textarea class="form-textarea" id="feedbackMessage" rows="5" placeholder="Describe your feedback..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn-primary" onclick="window.submitFeedback()">Send Feedback</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

// Отправить feedback
window.submitFeedback = async () => {
  const type = document.getElementById('feedbackType')?.value;
  const email = document.getElementById('feedbackEmail')?.value;
  const message = document.getElementById('feedbackMessage')?.value;

  if (!message || message.trim().length < 10) {
    alert('Please enter a message (at least 10 characters)');
    return;
  }

  const feedbackData = {
    type,
    email,
    message,
    timestamp: new Date().toISOString(),
    appVersion: '1.0.0'
  };

  try {
    // В реальной реализации - отправка на сервер
    console.log('Submitting feedback:', feedbackData);
    alert('Thank you for your feedback!\n\nWe appreciate your input and will review it shortly.');
    
    // Закрыть модальное окно
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
  } catch (error) {
    alert('Error sending feedback: ' + error.message);
  }
};

window.reportBug = () => {
  alert('Bug Report\n\nPlease describe the issue:\n1. What were you doing?\n2. What happened?\n3. What did you expect?\n\nEmail: support@itopclone.com');
};

window.requestFeature = () => {
  const feature = prompt('Describe the feature you would like to see:');
  if (feature) {
    alert('Thank you for your feature request!');
  }
};

window.exportMyData = () => {
  alert('Exporting your data...\n\nA file will be saved to your Downloads folder with:\n• Settings\n• Box configurations\n• Snapshots\n• Preferences');
};

window.resetSettings = () => {
  if (confirm('Reset all settings to default? This action cannot be undone.')) {
    alert('Settings reset to default. Application will restart.');
  }
};

// ========================================
// ACCOUNT FUNCTIONS
// ========================================

let isLoggedIn = false;

window.openSignUp = () => {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authModalTitle');
  const form = document.getElementById('authForm');

  title.textContent = t('account.signUp') || 'Create Account';
  form.innerHTML = `
    <div class="auth-form">
      <div class="form-group">
        <label class="form-label">${t('account.name') || 'Full Name'}</label>
        <input type="text" class="form-input" placeholder="${t('account.namePlaceholder') || 'John Doe'}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('account.email') || 'Email'}</label>
        <input type="email" class="form-input" placeholder="${t('account.emailPlaceholder') || 'john@example.com'}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('account.password') || 'Password'}</label>
        <input type="password" class="form-input" placeholder="••••••••">
      </div>
      <div class="form-group">
        <label class="form-label">${t('account.confirmPassword') || 'Confirm Password'}</label>
        <input type="password" class="form-input" placeholder="••••••••">
      </div>
      <button class="submit-btn" onclick="submitSignUp()">${t('account.signUp') || 'Sign Up'}</button>
      <div class="divider">${t('common.or') || 'or'}</div>
      <div class="toggle-auth">
        ${t('account.haveAccount') || 'Already have an account?'} <button onclick="openLogin()">${t('account.logIn') || 'Log In'}</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
};

window.openLogin = () => {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authModalTitle');
  const form = document.getElementById('authForm');

  title.textContent = t('account.logIn') || 'Sign In';
  form.innerHTML = `
    <div class="auth-form">
      <div class="form-group">
        <label class="form-label">${t('account.email') || 'Email'}</label>
        <input type="email" class="form-input" placeholder="${t('account.emailPlaceholder') || 'john@example.com'}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('account.password') || 'Password'}</label>
        <input type="password" class="form-input" placeholder="••••••••">
      </div>
      <button class="submit-btn" onclick="submitLogin()">Log In</button>
      <div class="divider">or</div>
      <div class="toggle-auth">
        Don't have an account? <button onclick="openSignUp()">Sign Up</button>
      </div>
      <div class="toggle-auth" style="margin-top: 8px;">
        <button onclick="forgotPassword()">Forgot Password?</button>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
};

window.closeAuthModal = () => {
  document.getElementById('authModal').style.display = 'none';
};

window.submitSignUp = () => {
  alert('Account created successfully! Please check your email to verify your account.');
  closeAuthModal();
};

window.submitLogin = () => {
  isLoggedIn = true;
  updateAccountUI();
  closeAuthModal();
  alert('Logged in successfully!');
};

window.loginWithGoogle = () => {
  isLoggedIn = true;
  updateAccountUI();
  alert('Logged in with Google!');
};

window.loginWithMicrosoft = () => {
  isLoggedIn = true;
  updateAccountUI();
  alert('Logged in with Microsoft!');
};

window.logout = () => {
  isLoggedIn = false;
  updateAccountUI();
  alert('Logged out successfully');
};

window.updateAccountUI = () => {
  const notLoggedIn = document.getElementById('notLoggedIn');
  const loggedIn = document.getElementById('loggedIn');
  
  if (isLoggedIn) {
    notLoggedIn.style.display = 'none';
    loggedIn.style.display = 'block';
    document.getElementById('accountName').textContent = t('account.namePlaceholder') || 'John Doe';
    document.getElementById('accountEmail').textContent = t('account.emailPlaceholder') || 'john@example.com';
  } else {
    notLoggedIn.style.display = 'block';
    loggedIn.style.display = 'none';
  }
};

window.upgradeToPro = () => {
  alert(`${t('account.upgradeToPro') || 'Upgrade to Pro'}\n\n${t('account.proFeatureUnlimitedBoxes') || '• Unlimited Boxes'}\n${t('account.proFeaturePrivateBox') || '• Private Box'}\n${t('account.proFeaturePersonalization') || '• Full Personalization'}\n${t('account.proFeatureWallpapers') || '• Premium Wallpapers'}\n${t('account.proFeatureSupport') || '• Priority Support'}\n\n${t('account.proPrice') || 'Price: $9.99/month or $99.99/year'}`);
};

window.changePassword = () => {
  const currentPassword = prompt(t('account.enterCurrentPassword') || 'Enter current password:');
  if (currentPassword) {
    const newPassword = prompt(t('account.enterNewPassword') || 'Enter new password:');
    if (newPassword) {
      alert(t('account.passwordChanged') || 'Password changed successfully!');
    }
  }
};

window.manageSubscription = () => {
  alert(`${t('account.managingSubscription') || 'Managing subscription...'}\n\n${t('account.subscriptionRedirect') || 'You will be redirected to the subscription management page.'}`);
};

window.activatePro = () => {
  const licenseKey = prompt(t('account.enterLicenseKey') || 'Enter your Pro license key:');
  if (licenseKey) {
    alert(t('account.licenseActivated') || 'Pro license activated successfully!');
    document.getElementById('accountBadge').textContent = t('account.pro') || 'Pro';
    document.getElementById('accountBadge').classList.add('pro');
  }
};

window.forgotPassword = () => {
  const email = prompt(t('account.enterEmail') || 'Enter your email address:');
  if (email) {
    alert(`${t('account.resetLinkSent') || 'Password reset link sent to'} ${email}`);
  }
};

// ========================================
// API KEY / PRO ACTIVATION FUNCTIONS
// ========================================

let adminKeyRevealCount = 0;
let adminKeyRevealTimer = null;

// Secret key combination to reveal admin section
// Listen globally on document
document.addEventListener('keydown', (e) => {
  console.log('Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
  
  // Ctrl+Shift+A pressed 5 times reveals admin section
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyA') {
    e.preventDefault();
    adminKeyRevealCount++;
    
    console.log('Admin key reveal count:', adminKeyRevealCount);
    
    clearTimeout(adminKeyRevealTimer);
    adminKeyRevealTimer = setTimeout(() => {
      adminKeyRevealCount = 0;
      console.log('Admin key reveal reset');
    }, 2000);
    
    if (adminKeyRevealCount >= 5) {
      const apiKeySection = document.getElementById('apiKeySection');
      if (apiKeySection) {
        apiKeySection.style.display = 'block';
        adminKeyRevealCount = 0;
        
        // Show notification
        if (window.i18n) {
          alert('🔓 ' + i18n.t('admin.revealed') || 'Administrator PRO Activation section revealed!\n\nEnter your admin API key to unlock all PRO features.');
        } else {
          alert('🔓 Administrator PRO Activation section revealed!\n\nEnter your admin API key to unlock all PRO features.');
        }
      }
    }
  }
});

window.openActivateProModal = () => {
  const modal = document.getElementById('authModal');
  const title = document.getElementById('authModalTitle');
  const form = document.getElementById('authForm');

  title.textContent = t('account.activatePro') || 'Activate Pro License';
  form.innerHTML = `
    <div class="auth-form">
      <div class="form-group">
        <label class="form-label">${t('account.licenseKey') || 'License Key or Admin API Key'}</label>
        <input type="text" class="form-input" id="proLicenseKeyInput" placeholder="${t('account.adminKeyPlaceholder') || 'ITOP-XXXX-XXXX-XXXX-XXXXXXXX'}">
      </div>
      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 16px;">
        ${t('account.adminKeyDesc') || 'Enter your Pro license key or administrator API key to unlock all PRO features.'}
      </p>
      <button class="submit-btn" onclick="activateProWithApiKey()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        ${t('account.activateProButton') || 'Activate PRO'}
      </button>
      <div class="divider">${t('common.or') || 'or'}</div>
      <button class="auth-btn secondary" style="width: 100%; margin-top: 8px;" onclick="upgradeToPro()">
        ${t('account.upgradeToPro') || 'Purchase Pro License'}
      </button>
    </div>
  `;
  
  modal.style.display = 'flex';
};

window.activateProWithApiKey = () => {
  const apiKeyInput = document.getElementById('adminApiKeyInput') || document.getElementById('proLicenseKeyInput');
  
  if (!apiKeyInput) {
    openActivateProModal();
    return;
  }
  
  const apiKey = apiKeyInput.value.trim();
  
  console.log('Attempting to activate with key:', apiKey);
  
  if (!apiKey) {
    const msg = window.i18n ? i18n.t('admin.invalidKey') : 'Please enter an API key';
    alert('❌ ' + msg);
    return;
  }
  
  // Validate the API key
  const validation = validateApiKey(apiKey);
  console.log('Validation result:', validation);
  
  if (validation.valid) {
    // Store the activated key
    const result = storeActivatedKey(apiKey);
    
    if (result.success) {
      // Update UI
      updateAccountUI();
      updateProFeatures();
      
      // Close modals
      closeAuthModal();
      
      // Show success message
      const successMsg = window.i18n ? i18n.t('admin.proActivated') : 'PRO Activated Successfully!';
      alert(`✅ ${successMsg}\n\nKey Type: ${validation.keyType.toUpperCase()}\n\nAll PRO features are now unlocked:\n• Unlimited Boxes\n• Private Box\n• Full Personalization\n• Premium Wallpapers\n• Priority Support\n\nThank you for using iTop Easy Desktop Clone!`);
      
      // Show admin section if not already visible
      const apiKeySection = document.getElementById('apiKeySection');
      if (apiKeySection) {
        apiKeySection.style.display = 'block';
      }
    } else {
      alert(`❌ Failed to activate PRO: ${result.error}`);
    }
  } else {
    alert(`❌ Invalid API Key: ${validation.error}\n\nPlease check your key and try again.\n\nFormat: ITOP-XXXX-XXXX-XXXX-XXXXXXXX`);
  }
};

window.updateProFeatures = () => {
  // Check if PRO is activated
  const license = getStoredLicense();
  
  if (license) {
    // Update account badge
    const badge = document.getElementById('accountBadge');
    if (badge) {
      badge.textContent = 'Pro';
      badge.classList.add('pro');
    }
    
    // Update subscription card
    const subscriptionCard = document.getElementById('subscriptionCard');
    if (subscriptionCard) {
      subscriptionCard.innerHTML = `
        <div class="subscription-info">
          <span class="subscription-name">Pro Plan</span>
          <span class="subscription-status" style="color: #fbbf24;">Active ${license.keyType ? '(' + license.keyType.toUpperCase() + ')' : ''}</span>
        </div>
        <button class="action-button secondary" onclick="deactivateProLicense()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Deactivate
        </button>
      `;
    }
    
    // Update pro features preview
    const proFeaturesPreview = document.querySelector('.pro-features-preview');
    if (proFeaturesPreview) {
      const activatedDate = new Date(license.activatedAt).toLocaleDateString();
      proFeaturesPreview.innerHTML = `
        <h5>PRO Features Activated:</h5>
        <ul>
          <li>✓ Unlimited Boxes</li>
          <li>✓ Private Box with Password</li>
          <li>✓ Full Personalization</li>
          <li>✓ Premium Wallpapers</li>
          <li>✓ Priority Support</li>
        </ul>
        <p style="font-size: 11px; color: var(--text-muted); margin-top: 12px;">
          Activated: ${activatedDate}
          ${license.expiresAt ? `<br>Expires: ${new Date(license.expiresAt).toLocaleDateString()}` : ''}
        </p>
      `;
    }
  }
};

window.deactivateProLicense = () => {
  if (confirm('Are you sure you want to deactivate PRO?\n\nAll PRO features will be disabled.')) {
    const result = deactivateProLicense();
    
    if (result.success) {
      // Update UI
      const badge = document.getElementById('accountBadge');
      if (badge) {
        badge.textContent = 'Free';
        badge.classList.remove('pro');
      }
      
      // Hide admin section
      const apiKeySection = document.getElementById('apiKeySection');
      if (apiKeySection) {
        apiKeySection.style.display = 'none';
      }
      
      // Clear input
      const input = document.getElementById('adminApiKeyInput');
      if (input) {
        input.value = '';
      }
      
      alert('PRO has been deactivated.\n\nYou can reactivate it anytime with your license key.');
      
      // Reload page to apply changes
      location.reload();
    }
  }
};

// Check PRO status on load
function checkProStatus() {
  const license = getStoredLicense();
  if (license) {
    updateProFeatures();
    
    // Show admin section if admin key was used
    if (license.keyType === 'master' || license.keyType === 'developer') {
      const apiKeySection = document.getElementById('apiKeySection');
      if (apiKeySection) {
        apiKeySection.style.display = 'block';
      }
    }
  }
}

// Close modals on outside click
window.onclick = (event) => {
  const widgetModal = document.getElementById('widgetDetailsModal');
  const aiModal = document.getElementById('aiSettingsModal');
  const authModal = document.getElementById('authModal');
  
  if (event.target === widgetModal) {
    closeWidgetDetails();
  }
  if (event.target === aiModal) {
    closeAISettings();
  }
  if (event.target === authModal) {
    closeAuthModal();
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  init();
  checkProStatus();
  initTooltips();
  initPrivateBox(); // Инициализация Private Box
  initAISettings(); // Инициализация AI настроек
  initWallpaperControls(); // Инициализация управления обоями
});

// ========================================
// Wallpaper Control Functions
// ========================================

// Инициализация управления обоями
async function initWallpaperControls() {
  try {
    if (window.electronAPI && window.electronAPI.getCurrentWallpaper) {
      const current = await window.electronAPI.getCurrentWallpaper();
      if (current) {
        showLiveWallpaperControls(current.type === 'live');
      }
    }
  } catch (error) {
    console.error('Error initializing wallpaper controls:', error);
  }
}

// Переключить видимость контролов живых обоев
window.toggleLiveWallpaperControls = () => {
  const controls = document.getElementById('liveWallpaperControls');
  const isVisible = controls.style.display !== 'none';
  
  if (!isVisible) {
    controls.style.display = 'block';
  } else {
    controls.style.display = 'none';
  }
};

// Показать контролы живых обоев
function showLiveWallpaperControls(isLive) {
  const controls = document.getElementById('liveWallpaperControls');
  const btn = document.getElementById('liveWallpaperBtn');
  
  if (isLive) {
    controls.style.display = 'block';
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Live Wallpaper Active
      `;
    }
  } else {
    controls.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        Play Live Wallpaper
      `;
    }
  }
}

// Выбрать локальные обои
window.selectLocalWallpaper = async () => {
  try {
    const result = await window.electronAPI.selectWallpaperFile();
    
    if (result.success) {
      const isVideo = result.path.endsWith('.mp4') || result.path.endsWith('.webm') || 
                      result.path.endsWith('.mov') || result.path.endsWith('.gif');
      
      if (isVideo) {
        // Установить как живые обои
        const wallpaperResult = await window.electronAPI.setLiveWallpaper(result.path, {
          muted: true,
          loop: true
        });
        
        if (wallpaperResult.success) {
          alert('Live wallpaper installed successfully!');
          showLiveWallpaperControls(true);
        } else {
          alert('Error: ' + wallpaperResult.error);
        }
      } else {
        // Установить как статические обои
        const wallpaperResult = await window.electronAPI.setStaticWallpaper(result.path);
        
        if (wallpaperResult.success) {
          alert('Wallpaper installed successfully!');
        } else {
          alert('Error: ' + wallpaperResult.error);
        }
      }
    }
  } catch (error) {
    console.error('Error selecting wallpaper:', error);
    alert('Error: ' + error.message);
  }
};

// Пауза/возобновление живых обоев
window.toggleWallpaperPause = async () => {
  try {
    const result = await window.electronAPI.toggleWallpaperPause();
    const btn = document.getElementById('pausePlayBtn');
    
    if (result.success) {
      if (btn.textContent.includes('Pause')) {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/><line x1="19" y1="3" x2="19" y2="21"/>
          </svg>
          Play
        `;
      } else {
        btn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
          Pause
        `;
      }
    }
  } catch (error) {
    console.error('Error toggling wallpaper pause:', error);
  }
};

// Остановить обои
window.stopWallpaper = async () => {
  try {
    const result = await window.electronAPI.stopWallpaper();
    
    if (result.success) {
      showLiveWallpaperControls(false);
      alert('Wallpaper stopped');
    }
  } catch (error) {
    console.error('Error stopping wallpaper:', error);
    alert('Error: ' + error.message);
  }
};

// Установить громкость
window.setWallpaperVolume = async (value) => {
  try {
    const volume = value / 100;
    await window.electronAPI.setWallpaperVolume(volume);
  } catch (error) {
    console.error('Error setting volume:', error);
  }
};

// Запустить плейлист обоев
window.startWallpaperPlaylist = async (wallpapers, options = {}) => {
  try {
    const result = await window.electronAPI.startWallpaperPlaylist(wallpapers, {
      interval: options.interval || 300000, // 5 минут
      shuffle: options.shuffle || false
    });
    
    if (result.success) {
      alert('Wallpaper playlist started!');
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error starting playlist:', error);
    alert('Error: ' + error.message);
  }
};

// Остановить плейлист
window.stopWallpaperPlaylist = async () => {
  try {
    await window.electronAPI.stopWallpaperPlaylist();
    alert('Wallpaper playlist stopped');
  } catch (error) {
    console.error('Error stopping playlist:', error);
    alert('Error: ' + error.message);
  }
};

// Открыть создание обоев
window.openCreateWallpaper = async () => {
  try {
    if (window.electronAPI && window.electronAPI.openWallpaperCreator) {
      const result = await window.electronAPI.openWallpaperCreator();
      if (result.success) {
        console.log('Wallpaper Creator opened:', result.windowId);
      } else {
        alert('Error opening Wallpaper Creator: ' + (result.error || 'Unknown error'));
      }
    } else {
      alert('Create Custom Wallpaper feature requires Electron app.\n\nFeatures:\n• Particle effects\n• Color filters\n• Cursor effects\n• Gradient backgrounds');
    }
  } catch (error) {
    console.error('Error opening Wallpaper Creator:', error);
    alert('Error: ' + error.message);
  }
};

// Переключить вкладку обоев
window.switchWallpaperTab = (type) => {
  document.querySelectorAll('.wallpaper-tab').forEach(tab => {
    tab.classList.toggle('active', tab.textContent.toLowerCase().includes(type));
  });
  
  // Filter wallpapers based on type
  const grid = document.getElementById('wallpapersGrid');
  // Implementation depends on your data structure
  console.log('Switched to wallpaper tab:', type);
};

// Фильтр обоев
window.filterWallpapers = () => {
  const search = document.getElementById('wallpaperSearch')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || '';
  const resolution = document.getElementById('resolutionFilter')?.value || '';
  
  console.log('Filtering wallpapers:', { search, category, resolution });
  // Implementation depends on your data structure
};

// ========================================
// AI ASSISTANT FUNCTIONS
// ========================================

// Тестировать подключение к AI
window.testAIConnection = async () => {
  const provider = document.getElementById('apiProviderSelect')?.value || 'openai';
  const apiKey = document.getElementById('apiKeyInput')?.value;
  const resultEl = document.getElementById('testResult');

  if (!apiKey) {
    resultEl.innerHTML = '<span class="test-error">Please enter API key</span>';
    return;
  }

  try {
    if (window.electronAPI && window.electronAPI.getAIApiKeyStatus) {
      // Сохраняем ключ временно
      await window.electronAPI.setAIApiKey(provider, apiKey);
      
      // Тестируем подключение
      const result = await window.electronAPI.chatWithAI(provider, 'Reply with just "OK" to test.', 'test-session', { maxTokens: 10 });
      
      if (result.success) {
        resultEl.innerHTML = '<span class="test-success">✓ Connection successful!</span>';
      } else {
        resultEl.innerHTML = `<span class="test-error">✗ Error: ${result.error || 'Unknown error'}</span>`;
      }
    } else {
      // Demo mode
      resultEl.innerHTML = '<span class="test-success">✓ Demo mode - API key accepted</span>';
    }
  } catch (error) {
    resultEl.innerHTML = `<span class="test-error">✗ Error: ${error.message}</span>`;
  }
};

// Сохранить настройки AI
window.saveAISettings = async (provider) => {
  const apiKey = document.getElementById('apiKeyInput')?.value;
  const model = document.getElementById('modelSelect')?.value;

  if (!apiKey) {
    alert('Please enter API key');
    return;
  }

  try {
    if (window.electronAPI && window.electronAPI.setAIApiKey) {
      await window.electronAPI.setAIApiKey(provider, apiKey);
      await window.electronAPI.updateAIConfig({ provider, model });
      
      alert('AI settings saved successfully!');
      closeAISettings();
    } else {
      alert('Settings saved (demo mode)');
      closeAISettings();
    }
  } catch (error) {
    alert('Error saving settings: ' + error.message);
  }
};

// Закрыть настройки AI
window.closeAISettings = () => {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Изменить AI провайдер
window.changeAIProvider = (provider) => {
  // Перерисовать форму с новым провайдером
  window.openAISettingsModal(provider);
};

// Чат с AI
window.chatWithAI = async (provider, message, sessionId = 'default') => {
  try {
    if (!window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    const result = await window.electronAPI.chatWithAI(provider, message, sessionId);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Анализ изображения с AI
window.analyzeImageWithAI = async (provider, base64Image, prompt = 'Describe this image') => {
  try {
    if (!window.electronAPI) {
      return { success: false, error: 'Electron API not available' };
    }

    const result = await window.electronAPI.analyzeImage(provider, base64Image, prompt);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Очистить историю чата
window.clearChatHistory = async (sessionId = 'default') => {
  try {
    if (window.electronAPI && window.electronAPI.clearChatHistory) {
      await window.electronAPI.clearChatHistory(sessionId);
      return { success: true };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Получить историю чата
window.getChatHistory = async (sessionId = 'default') => {
  try {
    if (window.electronAPI && window.electronAPI.getChatHistory) {
      return await window.electronAPI.getChatHistory(sessionId);
    }
    return { success: true, history: [] };
  } catch (error) {
    return { success: false, error: error.message, history: [] };
  }
};

// Открыть ChatAI на рабочем столе
window.openChatAIOnDesktop = async () => {
  try {
    if (window.electronAPI && window.electronAPI.openWidget) {
      await window.electronAPI.openWidget('chat-ai');
    }
  } catch (error) {
    console.error('Error opening ChatAI:', error);
  }
};

// Сделать скриншот с AI анализом
window.takeScreenshotWithAI = async () => {
  try {
    if (!window.electronAPI) return;

    const result = await window.electronAPI.takeScreenshot({ analyzeWithAI: true });
    
    if (result.success && result.analysis) {
      console.log('Screenshot analysis:', result.analysis);
      // Показать результат пользователю
      alert('Screenshot captured and analyzed!\n\n' + result.analysis.substring(0, 200) + '...');
    } else if (result.success) {
      alert('Screenshot captured!');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// AI Search
window.openAISearch = async () => {
  try {
    if (window.electronAPI && window.electronAPI.openWidget) {
      await window.electronAPI.openWidget('search');
    }
  } catch (error) {
    console.error('Error opening AI Search:', error);
  }
};

// Инициализация AI при загрузке
async function initAIAssistant() {
  try {
    if (window.electronAPI && window.electronAPI.getAIConfig) {
      const config = await window.electronAPI.getAIConfig();
      console.log('AI Config loaded:', config);
      
      // Установить API ключи если есть
      if (config?.providers) {
        for (const [provider, settings] of Object.entries(config.providers)) {
          if (settings.apiKey) {
            await window.electronAPI.setAIApiKey(provider, settings.apiKey);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error initializing AI Assistant:', error);
  }
}

// Открыть настройки AI API
window.openAISettingsModal = (provider) => {
  const modal = document.getElementById('aiSettingsModal');
  const body = document.getElementById('aiSettingBody');
  
  const providerLabels = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google'
  };

  body.innerHTML = `
    <div class="ai-api-settings">
      <div class="form-group">
        <label class="form-label">API Provider</label>
        <select class="form-select" id="apiProviderSelect" onchange="changeAIProvider(this.value)">
          <option value="openai" ${provider === 'openai' ? 'selected' : ''}>OpenAI (GPT-4, GPT-3.5)</option>
          <option value="anthropic" ${provider === 'anthropic' ? 'selected' : ''}>Anthropic (Claude 3)</option>
          <option value="google" ${provider === 'google' ? 'selected' : ''}>Google (Gemini)</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">${providerLabels[provider] || 'OpenAI'} API Key</label>
        <input type="password" class="form-input" id="apiKeyInput" placeholder="sk-..." autocomplete="off">
        <p class="form-help">Your API key is stored locally and never sent to our servers</p>
      </div>

      <div class="form-group">
        <label class="form-label">Model</label>
        <select class="form-select" id="modelSelect">
          ${provider === 'openai' ? `
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo" selected>GPT-3.5 Turbo</option>
            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
          ` : provider === 'anthropic' ? `
            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
            <option value="claude-3-sonnet-20240229" selected>Claude 3 Sonnet</option>
            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
          ` : `
            <option value="gemini-pro" selected>Gemini Pro</option>
            <option value="gemini-pro-vision">Gemini Pro Vision</option>
          `}
        </select>
      </div>

      <div class="ai-test-section">
        <button class="btn-primary" onclick="testAIConnection()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Test Connection
        </button>
        <div id="testResult" class="test-result"></div>
      </div>

      <div class="ai-links">
        <p>Don't have an API key?</p>
        <a href="https://platform.openai.com/api-keys" target="_blank" id="getApiKeyLink">Get OpenAI API Key</a>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick="closeAISettings()">Cancel</button>
      <button class="btn-primary" onclick="saveAISettings('${provider}')">Save API Key</button>
    </div>
  `;

  // Update link based on provider
  const linkEl = document.getElementById('getApiKeyLink');
  if (provider === 'anthropic') {
    linkEl.href = 'https://console.anthropic.com/settings/keys';
    linkEl.textContent = t('ai.getAnthropicKey') || 'Get Anthropic API Key';
  } else if (provider === 'google') {
    linkEl.href = 'https://makersuite.google.com/app/apikey';
    linkEl.textContent = t('ai.getGoogleKey') || 'Get Google API Key';
  }

  if (modal) {
    modal.style.display = 'flex';
  }
};

// Изменить провайдера
window.changeAIProvider = (provider) => {
  openAISettingsModal(provider);
};

// Сохранить настройки AI
window.saveAISettings = async (provider) => {
  const apiKey = document.getElementById('apiKeyInput').value.trim();
  
  if (!apiKey) {
    alert('Please enter your API key');
    return;
  }

  try {
    const result = await window.electronAPI.setAIApiKey(provider, apiKey);
    
    if (result.success) {
      alert('API key saved successfully!');
      closeAISettings();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};

// Тестировать соединение
window.testAIConnection = async () => {
  const provider = document.getElementById('apiProviderSelect').value;
  const apiKey = document.getElementById('apiKeyInput').value.trim();
  const resultEl = document.getElementById('testResult');

  if (!apiKey) {
    alert('Please enter your API key first');
    return;
  }

  // Сначала сохраним ключ
  await window.electronAPI.setAIApiKey(provider, apiKey);

  resultEl.innerHTML = '<em>Testing connection...</em>';
  resultEl.className = 'test-result testing';

  try {
    const result = await window.electronAPI.chatWithAI(provider, 'Hello! Reply with just "OK" to test.', 'test-session');

    if (result.success) {
      resultEl.innerHTML = '✓ Connection successful!';
      resultEl.className = 'test-result success';
    } else {
      resultEl.innerHTML = '✗ Error: ' + result.error;
      resultEl.className = 'test-result error';
    }
  } catch (error) {
    resultEl.innerHTML = '✗ Error: ' + error.message;
    resultEl.className = 'test-result error';
  }
};

// Закрыть настройки AI
window.closeAISettings = () => {
  const modal = document.getElementById('aiSettingsModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// ========================================
// Private Box Functions
// ========================================

// Инициализация Private Box
async function initPrivateBox() {
  try {
    if (window.electronAPI && window.electronAPI.privateBoxExists) {
      const exists = await window.electronAPI.privateBoxExists();
      const createBtn = document.getElementById('createPrivateBoxBtn');
      
      if (exists) {
        // Private Box существует - показываем кнопку открытия
        if (createBtn) {
          createBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
            Open Private Box
          `;
          createBtn.onclick = openPrivateBox;
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Private Box:', error);
  }
}

// Открыть Private Box (создание или разблокировка)
async function createPrivateBox() {
  try {
    const exists = await window.electronAPI.privateBoxExists();
    
    if (exists) {
      // Уже существует - открываем диалог разблокировки
      await openPrivateBox();
    } else {
      // Не существует - открываем диалог создания
      if (window.electronAPI && window.electronAPI.openPrivateBoxModal) {
        await window.electronAPI.openPrivateBoxModal('create');
      } else {
        // Fallback: открываем в новом окне
        window.open('private-box.html?type=create', '_blank', 'width=480,height=680');
      }
    }
  } catch (error) {
    console.error('Error creating Private Box:', error);
    alert('Error: ' + error.message);
  }
}

// Открыть Private Box (разблокировка)
async function openPrivateBox() {
  try {
    const status = await window.electronAPI.getPrivateBoxStatus();
    
    if (!status.exists) {
      // Не существует - создаём
      await createPrivateBox();
      return;
    }
    
    if (status.unlocked) {
      // Уже разблокирован - показываем содержимое
      showPrivateBoxContents();
    } else {
      // Заблокирован - открываем диалог разблокировки
      if (window.electronAPI && window.electronAPI.openPrivateBoxModal) {
        await window.electronAPI.openPrivateBoxModal('unlock');
      } else {
        window.open('private-box.html?type=unlock', '_blank', 'width=480,height=420');
      }
    }
  } catch (error) {
    console.error('Error opening Private Box:', error);
    alert('Error: ' + error.message);
  }
}

// Показать содержимое Private Box
async function showPrivateBoxContents() {
  try {
    const result = await window.electronAPI.getPrivateBoxItems();
    
    if (!result.success) {
      alert('Private Box is locked');
      await openPrivateBox();
      return;
    }
    
    // Создаём модальное окно с содержимым
    const modal = document.createElement('div');
    modal.className = 'private-box-modal';
    modal.innerHTML = `
      <div class="private-box-modal-content">
        <div class="private-box-modal-header">
          <h3>Private Box Contents</h3>
          <button class="modal-close-btn" onclick="closePrivateBoxModal()">×</button>
        </div>
        <div class="private-box-modal-body">
          ${result.items.length === 0 
            ? '<p class="empty-state">No items in Private Box</p>'
            : result.items.map(item => `
              <div class="private-box-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  ${item.type === 'folder' 
                    ? '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
                    : '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'
                  }
                </svg>
                <span class="item-name">${item.path}</span>
                <button class="remove-item-btn" onclick="removePrivateBoxItem('${item.path}')">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            `).join('')
          }
        </div>
        <div class="private-box-modal-footer">
          <button class="btn-secondary" onclick="lockPrivateBox()">Lock Box</button>
          <button class="btn-primary" onclick="closePrivateBoxModal()">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Error showing Private Box contents:', error);
    alert('Error: ' + error.message);
  }
}

// Закрыть модальное окно Private Box
function closePrivateBoxModal() {
  const modal = document.querySelector('.private-box-modal');
  if (modal) {
    modal.remove();
  }
}

// Удалить элемент из Private Box
async function removePrivateBoxItem(itemPath) {
  try {
    const result = await window.electronAPI.removeItemFromPrivateBox(itemPath);
    
    if (result.success) {
      // Обновляем список
      showPrivateBoxContents();
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('Error removing item:', error);
    alert('Error: ' + error.message);
  }
}

// Заблокировать Private Box
async function lockPrivateBox() {
  try {
    await window.electronAPI.lockPrivateBox();
    closePrivateBoxModal();
    alert('Private Box locked');
  } catch (error) {
    console.error('Error locking Private Box:', error);
    alert('Error: ' + error.message);
  }
}

// Стили для Private Box модального окна
const privateBoxStyles = document.createElement('style');
privateBoxStyles.textContent = `
  .private-box-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  
  .private-box-modal-content {
    background: linear-gradient(135deg, #252a3d 0%, #1a1d2e 100%);
    border-radius: 16px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    padding: 24px;
    width: 100%;
    max-width: 500px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .private-box-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  
  .private-box-modal-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
  }
  
  .modal-close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 28px;
    cursor: pointer;
    transition: color 0.2s;
  }
  
  .modal-close-btn:hover {
    color: #ffffff;
  }
  
  .private-box-modal-body {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  
  .private-box-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    margin-bottom: 8px;
  }
  
  .private-box-item .item-name {
    flex: 1;
    color: #e2e8f0;
    font-size: 14px;
    word-break: break-all;
  }
  
  .remove-item-btn {
    background: transparent;
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
    border-radius: 6px;
    padding: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .remove-item-btn:hover {
    background: rgba(239, 68, 68, 0.1);
  }
  
  .private-box-modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .empty-state {
    text-align: center;
    color: #64748b;
    padding: 40px 20px;
  }
`;
document.head.appendChild(privateBoxStyles);

// Initialize tooltips
function initTooltips() {
  // Add tooltips to navigation items
  document.querySelectorAll('.nav-item').forEach(item => {
    const tooltip = item.querySelector('.nav-tooltip');
    if (tooltip && !item.hasAttribute('data-tooltip')) {
      item.setAttribute('data-tooltip', tooltip.textContent);
      item.classList.add('tooltip');
    }
  });
  
  // Add tooltips to footer items
  document.querySelectorAll('.footer-item').forEach(item => {
    const tooltip = item.querySelector('.nav-tooltip');
    if (tooltip && !item.hasAttribute('data-tooltip')) {
      item.setAttribute('data-tooltip', tooltip.textContent);
      item.classList.add('tooltip');
    }
  });
  
  // Add tooltips to buttons with title attribute
  document.querySelectorAll('button[title]').forEach(btn => {
    if (!btn.hasAttribute('data-tooltip')) {
      btn.setAttribute('data-tooltip', btn.getAttribute('title'));
      btn.classList.add('tooltip');
    }
  });
  
  // Add tooltips to action buttons
  document.querySelectorAll('.action-button, .widget-settings-btn, .snapshot-btn').forEach(btn => {
    const text = btn.textContent.trim() || btn.getAttribute('title');
    if (text && !btn.hasAttribute('data-tooltip')) {
      btn.setAttribute('data-tooltip', text);
      btn.classList.add('tooltip');
    }
  });
}
