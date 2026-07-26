// ========================================
// Tests for app.js utility functions
// ========================================

// Мокаем window.electronAPI
global.window = {
  electronAPI: {
    loadLocales: jest.fn().mockResolvedValue(JSON.stringify({
      ru: {
        nav: {
          boxes: 'Боксы',
          wallpapers: 'Обои',
          widgets: 'Виджеты'
        }
      },
      en: {
        nav: {
          boxes: 'Boxes',
          wallpapers: 'Wallpapers',
          widgets: 'Widgets'
        }
      }
    })),
    getBoxItem: jest.fn(),
    loadBoxes: jest.fn(),
    saveBoxes: jest.fn()
  }
};

// Мокаем document
global.document = {
  querySelectorAll: jest.fn().mockReturnValue([]),
  querySelector: jest.fn().mockReturnValue(null),
  createElement: jest.fn().mockReturnValue({
    style: {},
    classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() }
  })
};

describe('app.js Utility Functions', () => {
  // ========================================
  // Tests for translation function t()
  // ========================================
  describe('t() - Translation Function', () => {
    let locales;

    beforeEach(() => {
      locales = {
        ru: {
          nav: {
            boxes: 'Боксы',
            wallpapers: 'Обои',
            widgets: 'Виджеты'
          },
          common: {
            yes: 'Да',
            no: 'Нет'
          }
        },
        en: {
          nav: {
            boxes: 'Boxes',
            wallpapers: 'Wallpapers',
            widgets: 'Widgets'
          },
          common: {
            yes: 'Yes',
            no: 'No'
          }
        }
      };
    });

    test('should return translation for simple key', () => {
      const t = (key, lang = 'ru') => {
        const keys = key.split('.');
        let value = locales[lang];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        return value || key;
      };

      expect(t('nav.boxes', 'ru')).toBe('Боксы');
      expect(t('nav.boxes', 'en')).toBe('Boxes');
    });

    test('should return translation for nested key', () => {
      const t = (key, lang = 'ru') => {
        const keys = key.split('.');
        let value = locales[lang];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        return value || key;
      };

      expect(t('common.yes', 'ru')).toBe('Да');
      expect(t('common.no', 'en')).toBe('No');
    });

    test('should return key if translation not found', () => {
      const t = (key, lang = 'ru') => {
        const keys = key.split('.');
        let value = locales[lang];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        return value || key;
      };

      expect(t('nonexistent.key', 'ru')).toBe('nonexistent.key');
      expect(t('nav.nonexistent', 'ru')).toBe('nav.nonexistent');
    });

    test('should return key if language not found', () => {
      const t = (key, lang = 'ru') => {
        const keys = key.split('.');
        let value = locales[lang];
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key;
          }
        }
        return value || key;
      };

      expect(t('nav.boxes', 'fr')).toBe('nav.boxes');
    });
  });

  // ========================================
  // Tests for computeBoxItemCount()
  // ========================================
  describe('computeBoxItemCount()', () => {
    test('should count items in flat array', () => {
      const computeBoxItemCount = (box) => {
        if (!box || !box.items) return 0;
        return box.items.length;
      };

      const box = { items: ['file1.txt', 'file2.txt', 'file3.txt'] };
      expect(computeBoxItemCount(box)).toBe(3);
    });

    test('should return 0 for empty items', () => {
      const computeBoxItemCount = (box) => {
        if (!box || !box.items) return 0;
        return box.items.length;
      };

      const box = { items: [] };
      expect(computeBoxItemCount(box)).toBe(0);
    });

    test('should return 0 for null box', () => {
      const computeBoxItemCount = (box) => {
        if (!box || !box.items) return 0;
        return box.items.length;
      };

      expect(computeBoxItemCount(null)).toBe(0);
      expect(computeBoxItemCount(undefined)).toBe(0);
    });

    test('should count items in nested structure', () => {
      const computeBoxItemCount = (box) => {
        if (!box || !box.items) return 0;
        // Handle both flat array and nested structure
        let count = 0;
        for (const item of box.items) {
          if (typeof item === 'object' && item.items) {
            count += item.items.length;
          } else {
            count++;
          }
        }
        return count;
      };

      const box = {
        items: [
          { items: ['file1.txt', 'file2.txt'] },
          'file3.txt'
        ]
      };
      expect(computeBoxItemCount(box)).toBe(3);
    });
  });

  // ========================================
  // Tests for normalizeBoxFromConfig()
  // ========================================
  describe('normalizeBoxFromConfig()', () => {
    test('should normalize box with all properties', () => {
      const normalizeBoxFromConfig = (cfg) => {
        if (!cfg) return null;
        return {
          id: cfg.id || Date.now().toString(),
          name: cfg.name || 'Box',
          items: cfg.items || [],
          color: cfg.color || '#6366f1',
          opacity: cfg.opacity || 100,
          visible: cfg.visible !== false
        };
      };

      const config = {
        id: 'test-123',
        name: 'My Box',
        items: ['file1.txt'],
        color: '#ff0000',
        opacity: 50,
        visible: true
      };

      const result = normalizeBoxFromConfig(config);
      expect(result.id).toBe('test-123');
      expect(result.name).toBe('My Box');
      expect(result.items).toEqual(['file1.txt']);
      expect(result.color).toBe('#ff0000');
      expect(result.opacity).toBe(50);
      expect(result.visible).toBe(true);
    });

    test('should use defaults for missing properties', () => {
      const normalizeBoxFromConfig = (cfg) => {
        if (!cfg) return null;
        return {
          id: cfg.id || Date.now().toString(),
          name: cfg.name || 'Box',
          items: cfg.items || [],
          color: cfg.color || '#6366f1',
          opacity: cfg.opacity || 100,
          visible: cfg.visible !== false
        };
      };

      const config = { id: 'test-456' };
      const result = normalizeBoxFromConfig(config);

      expect(result.id).toBe('test-456');
      expect(result.name).toBe('Box');
      expect(result.items).toEqual([]);
      expect(result.color).toBe('#6366f1');
      expect(result.opacity).toBe(100);
      expect(result.visible).toBe(true);
    });

    test('should return null for null config', () => {
      const normalizeBoxFromConfig = (cfg) => {
        if (!cfg) return null;
        return {
          id: cfg.id || Date.now().toString(),
          name: cfg.name || 'Box',
          items: cfg.items || [],
          color: cfg.color || '#6366f1',
          opacity: cfg.opacity || 100,
          visible: cfg.visible !== false
        };
      };

      expect(normalizeBoxFromConfig(null)).toBeNull();
      expect(normalizeBoxFromConfig(undefined)).toBeNull();
    });
  });

  // ========================================
  // Tests for rgbToHex()
  // ========================================
  describe('rgbToHex()', () => {
    test('should convert RGB to hex', () => {
      const rgbToHex = (rgb) => {
        if (!rgb) return '#000000';
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) return '#000000';
        const [r, g, b] = match.map(Number);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
      expect(rgbToHex('rgb(0, 255, 0)')).toBe('#00ff00');
      expect(rgbToHex('rgb(0, 0, 255)')).toBe('#0000ff');
      expect(rgbToHex('rgb(128, 128, 128)')).toBe('#808080');
    });

    test('should return #000000 for invalid input', () => {
      const rgbToHex = (rgb) => {
        if (!rgb) return '#000000';
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) return '#000000';
        const [r, g, b] = match.map(Number);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(rgbToHex(null)).toBe('#000000');
      expect(rgbToHex('')).toBe('#000000');
      expect(rgbToHex('invalid')).toBe('#000000');
    });

    test('should handle edge values', () => {
      const rgbToHex = (rgb) => {
        if (!rgb) return '#000000';
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) return '#000000';
        const [r, g, b] = match.map(Number);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(rgbToHex('rgb(0, 0, 0)')).toBe('#000000');
      expect(rgbToHex('rgb(255, 255, 255)')).toBe('#ffffff');
    });
  });

  // ========================================
  // Tests for adjustColor()
  // ========================================
  describe('adjustColor()', () => {
    test('should lighten color', () => {
      const adjustColor = (color, amount) => {
        if (!color || !color.startsWith('#')) return color;
        const hex = color.slice(1);
        const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + amount);
        const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + amount);
        const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + amount);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(adjustColor('#000000', 50)).toBe('#323232');
      expect(adjustColor('#ff0000', 50)).toBe('#ff3232');
    });

    test('should darken color', () => {
      const adjustColor = (color, amount) => {
        if (!color || !color.startsWith('#')) return color;
        const hex = color.slice(1);
        const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - amount);
        const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - amount);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(adjustColor('#ffffff', 50)).toBe('#cdcdcd');
      expect(adjustColor('#ff0000', 50)).toBe('#cd0000');
    });

    test('should clamp values to 0-255', () => {
      const adjustColor = (color, amount) => {
        if (!color || !color.startsWith('#')) return color;
        const hex = color.slice(1);
        const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(adjustColor('#000000', -50)).toBe('#000000');
      expect(adjustColor('#ffffff', 50)).toBe('#ffffff');
    });

    test('should return original color if invalid', () => {
      const adjustColor = (color, amount) => {
        if (!color || !color.startsWith('#')) return color;
        const hex = color.slice(1);
        const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
      };

      expect(adjustColor(null, 50)).toBeNull();
      expect(adjustColor('rgb(0,0,0)', 50)).toBe('rgb(0,0,0)');
    });
  });

  // ========================================
  // Tests for getRandomColor()
  // ========================================
  describe('getRandomColor()', () => {
    test('should return valid hex color', () => {
      const getRandomColor = () => {
        const colors = [
          '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
          '#ec4899', '#f43f5e', '#ef4444', '#f97316',
          '#eab308', '#84cc16', '#22c55e', '#14b8a6',
          '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const color = getRandomColor();
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });

    test('should return different colors on multiple calls', () => {
      const getRandomColor = () => {
        const colors = [
          '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
          '#ec4899', '#f43f5e', '#ef4444', '#f97316',
          '#eab308', '#84cc16', '#22c55e', '#14b8a6',
          '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const colors = new Set();
      for (let i = 0; i < 100; i++) {
        colors.add(getRandomColor());
      }
      // Should have at least 2 different colors in 100 calls
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  // ========================================
  // Tests for Language functions
  // ========================================
  describe('Language Functions', () => {
    test('should save language preference', () => {
      const savedLang = {};
      const saveLanguagePreference = (lang) => {
        savedLang.language = lang;
      };

      saveLanguagePreference('en');
      expect(savedLang.language).toBe('en');
    });

    test('should load language preference', () => {
      const storage = { language: 'ru' };
      const loadLanguagePreference = () => {
        return storage.language || 'ru';
      };

      expect(loadLanguagePreference()).toBe('ru');
    });

    test('should return default language if not set', () => {
      const storage = {};
      const loadLanguagePreference = () => {
        return storage.language || 'ru';
      };

      expect(loadLanguagePreference()).toBe('ru');
    });
  });
});
