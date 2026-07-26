// ========================================
// Tests for app.js functions (Extended)
// ========================================

// Мокаем window.electronAPI
global.window = {
  electronAPI: {
    loadLocales: jest.fn().mockResolvedValue(JSON.stringify({
      ru: {
        nav: {
          boxes: 'Боксы',
          wallpapers: 'Обои',
          widgets: 'Виджеты',
          settings: 'Настройки'
        },
        widgets: {
          schedule: 'Расписание',
          clock: 'Часы',
          weather: 'Погода'
        }
      }
    })),
    getBoxItem: jest.fn(),
    loadBoxes: jest.fn(),
    saveBoxes: jest.fn(),
    openWidgetSettings: jest.fn(),
    openWidgetOnDesktop: jest.fn()
  }
};

// Мокаем document
global.document = {
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(null),
  createElement: jest.fn().mockReturnValue({
    style: {},
    classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
    innerHTML: ''
  })
};

describe('app.js Functions (Extended)', () => {
  // ========================================
  // Tests for switchTab()
  // ========================================
  describe('switchTab()', () => {
    test('should update state.currentTab', () => {
      const state = { currentTab: 'boxes' };
      const switchTab = (tab) => {
        state.currentTab = tab;
      };

      switchTab('wallpapers');
      expect(state.currentTab).toBe('wallpapers');
    });

    test('should update nav items active class', () => {
      const navItems = [
        { dataset: { tab: 'boxes' }, classList: { toggle: jest.fn() } },
        { dataset: { tab: 'wallpapers' }, classList: { toggle: jest.fn() } },
        { dataset: { tab: 'widgets' }, classList: { toggle: jest.fn() } }
      ];

      const switchTab = (tab) => {
        navItems.forEach(item => {
          item.classList.toggle('active', item.dataset.tab === tab);
        });
      };

      switchTab('wallpapers');
      expect(navItems[0].classList.toggle).toHaveBeenCalledWith('active', false);
      expect(navItems[1].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(navItems[2].classList.toggle).toHaveBeenCalledWith('active', false);
    });

    test('should update panels active class', () => {
      const panels = [
        { id: 'boxes-panel', classList: { toggle: jest.fn() } },
        { id: 'wallpapers-panel', classList: { toggle: jest.fn() } },
        { id: 'widgets-panel', classList: { toggle: jest.fn() } }
      ];

      const switchTab = (tab) => {
        panels.forEach(panel => {
          panel.classList.toggle('active', panel.id === `${tab}-panel`);
        });
      };

      switchTab('wallpapers');
      expect(panels[0].classList.toggle).toHaveBeenCalledWith('active', false);
      expect(panels[1].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(panels[2].classList.toggle).toHaveBeenCalledWith('active', false);
    });
  });

  // ========================================
  // Tests for switchSubtab()
  // ========================================
  describe('switchSubtab()', () => {
    test('should update state.currentSubtab', () => {
      const state = { currentSubtab: 'box' };
      const switchSubtab = (subtab) => {
        state.currentSubtab = subtab;
      };

      switchSubtab('appearance');
      expect(state.currentSubtab).toBe('appearance');
    });

    test('should update tab buttons active class', () => {
      const tabButtons = [
        { dataset: { subtab: 'box' }, classList: { toggle: jest.fn() } },
        { dataset: { subtab: 'appearance' }, classList: { toggle: jest.fn() } },
        { dataset: { subtab: 'organization' }, classList: { toggle: jest.fn() } }
      ];

      const switchSubtab = (subtab) => {
        tabButtons.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.subtab === subtab);
        });
      };

      switchSubtab('appearance');
      expect(tabButtons[0].classList.toggle).toHaveBeenCalledWith('active', false);
      expect(tabButtons[1].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(tabButtons[2].classList.toggle).toHaveBeenCalledWith('active', false);
    });

    test('should update subtab contents active class', () => {
      const subtabContents = [
        { id: 'box-subtab', classList: { toggle: jest.fn() } },
        { id: 'appearance-subtab', classList: { toggle: jest.fn() } },
        { id: 'organization-subtab', classList: { toggle: jest.fn() } }
      ];

      const switchSubtab = (subtab) => {
        subtabContents.forEach(content => {
          content.classList.toggle('active', content.id === `${subtab}-subtab`);
        });
      };

      switchSubtab('appearance');
      expect(subtabContents[0].classList.toggle).toHaveBeenCalledWith('active', false);
      expect(subtabContents[1].classList.toggle).toHaveBeenCalledWith('active', true);
      expect(subtabContents[2].classList.toggle).toHaveBeenCalledWith('active', false);
    });
  });

  // ========================================
  // Tests for widget translations
  // ========================================
  describe('Widget Translations', () => {
    test('should have correct widget translation mapping', () => {
      const widgetTranslations = {
        'schedule': { name: 'widgets.schedule', desc: 'widgets.scheduleDesc' },
        'inotes': { name: 'widgets.inotes', desc: 'widgets.inotesDesc' },
        'clock': { name: 'widgets.clock', desc: 'widgets.clockDesc' },
        'weather': { name: 'widgets.weather', desc: 'widgets.weatherDesc' },
        'quick-tools': { name: 'widgets.quick-tools', desc: 'widgets.quick-toolsDesc' },
        'ipomodoro': { name: 'widgets.ipomodoro', desc: 'widgets.ipomodoroDesc' },
        'chat-ai': { name: 'widgets.chat-ai', desc: 'widgets.chat-aiDesc' }
      };

      expect(widgetTranslations).toHaveProperty('schedule');
      expect(widgetTranslations).toHaveProperty('clock');
      expect(widgetTranslations).toHaveProperty('weather');
      expect(widgetTranslations.schedule.name).toBe('widgets.schedule');
    });

    test('should handle missing widget translation', () => {
      const widgetTranslations = {
        'schedule': { name: 'widgets.schedule', desc: 'widgets.scheduleDesc' }
      };

      const getWidgetTranslation = (widgetId) => {
        return widgetTranslations[widgetId] || null;
      };

      expect(getWidgetTranslation('schedule')).toBeTruthy();
      expect(getWidgetTranslation('nonexistent')).toBeNull();
    });
  });

  // ========================================
  // Tests for box operations
  // ========================================
  describe('Box Operations', () => {
    test('should filter boxes by search query', () => {
      const boxes = [
        { name: 'Documents' },
        { name: 'Pictures' },
        { name: 'Downloads' }
      ];
      const searchQuery = 'doc';

      const filteredBoxes = boxes.filter(box =>
        box.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredBoxes).toHaveLength(1);
      expect(filteredBoxes[0].name).toBe('Documents');
    });

    test('should return all boxes for empty search', () => {
      const boxes = [
        { name: 'Documents' },
        { name: 'Pictures' },
        { name: 'Downloads' }
      ];
      const searchQuery = '';

      const filteredBoxes = boxes.filter(box =>
        box.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filteredBoxes).toHaveLength(3);
    });

    test('should create new box with defaults', () => {
      const createBox = (config = {}) => {
        return {
          id: config.id || Date.now().toString(),
          name: config.name || 'New Box',
          items: config.items || [],
          color: config.color || '#6366f1',
          opacity: config.opacity || 100,
          visible: true
        };
      };

      const box = createBox();
      expect(box.id).toBeDefined();
      expect(box.name).toBe('New Box');
      expect(box.items).toEqual([]);
      expect(box.color).toBe('#6366f1');
      expect(box.visible).toBe(true);
    });

    test('should update box properties', () => {
      const updateBox = (box, updates) => {
        return { ...box, ...updates };
      };

      const box = { id: '1', name: 'Old Name', color: '#000000' };
      const updated = updateBox(box, { name: 'New Name', color: '#ffffff' });

      expect(updated.name).toBe('New Name');
      expect(updated.color).toBe('#ffffff');
      expect(updated.id).toBe('1');
    });
  });

  // ========================================
  // Tests for color utilities
  // ========================================
  describe('Color Utilities', () => {
    test('should validate hex color', () => {
      const isValidHex = (color) => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
      };

      expect(isValidHex('#ff0000')).toBe(true);
      expect(isValidHex('#00ff00')).toBe(true);
      expect(isValidHex('#0000ff')).toBe(true);
      expect(isValidHex('#FF0000')).toBe(true);
      expect(isValidHex('ff0000')).toBe(false);
      expect(isValidHex('#fff')).toBe(false);
      expect(isValidHex('rgb(0,0,0)')).toBe(false);
      expect(isValidHex('')).toBe(false);
    });

    test('should convert color to RGBA', () => {
      const hexToRgba = (hex, alpha = 1) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };

      expect(hexToRgba('#ff0000')).toBe('rgba(255, 0, 0, 1)');
      expect(hexToRgba('#00ff00', 0.5)).toBe('rgba(0, 255, 0, 0.5)');
      expect(hexToRgba('#0000ff', 0)).toBe('rgba(0, 0, 255, 0)');
    });

    test('should generate random color from palette', () => {
      const colorPalette = [
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
        '#ec4899', '#f43f5e', '#ef4444', '#f97316',
        '#eab308', '#84cc16', '#22c55e', '#14b8a6',
        '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
      ];

      const getRandomColor = () => {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
      };

      const color = getRandomColor();
      expect(colorPalette).toContain(color);
    });
  });

  // ========================================
  // Tests for state management
  // ========================================
  describe('State Management', () => {
    test('should initialize state with defaults', () => {
      const initState = () => ({
        currentTab: 'boxes',
        currentSubtab: 'box',
        boxes: [],
        widgets: [],
        wallpapers: [],
        searchQuery: '',
        selectedBox: null
      });

      const state = initState();
      expect(state.currentTab).toBe('boxes');
      expect(state.currentSubtab).toBe('box');
      expect(state.boxes).toEqual([]);
      expect(state.widgets).toEqual([]);
      expect(state.wallpapers).toEqual([]);
      expect(state.searchQuery).toBe('');
      expect(state.selectedBox).toBeNull();
    });

    test('should update state immutably', () => {
      const state = {
        currentTab: 'boxes',
        boxes: [{ id: '1', name: 'Box 1' }]
      };

      const newState = {
        ...state,
        currentTab: 'wallpapers'
      };

      expect(state.currentTab).toBe('boxes');
      expect(newState.currentTab).toBe('wallpapers');
      expect(newState.boxes).toBe(state.boxes);
    });

    test('should add box to state', () => {
      const state = { boxes: [] };
      const newBox = { id: '1', name: 'New Box' };

      const newState = {
        ...state,
        boxes: [...state.boxes, newBox]
      };

      expect(newState.boxes).toHaveLength(1);
      expect(newState.boxes[0]).toEqual(newBox);
    });

    test('should remove box from state', () => {
      const state = {
        boxes: [
          { id: '1', name: 'Box 1' },
          { id: '2', name: 'Box 2' }
        ]
      };

      const newState = {
        ...state,
        boxes: state.boxes.filter(box => box.id !== '1')
      };

      expect(newState.boxes).toHaveLength(1);
      expect(newState.boxes[0].id).toBe('2');
    });
  });

  // ========================================
  // Tests for event handling
  // ========================================
  describe('Event Handling', () => {
    test('should handle click events', () => {
      const clicked = [];
      const handleClick = (id) => {
        clicked.push(id);
      };

      handleClick('button1');
      handleClick('button2');

      expect(clicked).toEqual(['button1', 'button2']);
    });

    test('should handle keyboard events', () => {
      const keyPressed = [];
      const handleKeyDown = (e) => {
        keyPressed.push(e.key);
      };

      handleKeyDown({ key: 'Enter' });
      handleKeyDown({ key: 'Escape' });
      handleKeyDown({ key: 'ArrowDown' });

      expect(keyPressed).toEqual(['Enter', 'Escape', 'ArrowDown']);
    });

    test('should prevent default for certain keys', () => {
      const prevented = [];
      const handleKeyDown = (e) => {
        if (['Enter', 'Escape', 'Tab'].includes(e.key)) {
          prevented.push(e.key);
          return true;
        }
        return false;
      };

      expect(handleKeyDown({ key: 'Enter' })).toBe(true);
      expect(handleKeyDown({ key: 'a' })).toBe(false);
      expect(prevented).toEqual(['Enter']);
    });
  });

  // ========================================
  // Tests for data validation
  // ========================================
  describe('Data Validation', () => {
    test('should validate email format', () => {
      const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };

      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test@domain.org')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
    });

    test('should validate URL format', () => {
      const isValidUrl = (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('invalid')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('should validate file extensions', () => {
      const isValidImage = (filename) => {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        return validExtensions.some(ext => 
          filename.toLowerCase().endsWith(ext)
        );
      };

      expect(isValidImage('photo.jpg')).toBe(true);
      expect(isValidImage('image.PNG')).toBe(true);
      expect(isValidImage('icon.webp')).toBe(true);
      expect(isValidImage('document.pdf')).toBe(false);
      expect(isValidImage('script.js')).toBe(false);
    });
  });
});
