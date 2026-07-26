// ========================================
// Jest Global Setup
// Моки для Electron и Supabase
// ========================================

// Мок Electron IPC
global.window = {
  electronAPI: {
    checkProStatus: jest.fn().mockResolvedValue({ active: false }),
    checkAdminStatus: jest.fn().mockResolvedValue({ isAdmin: false, role: 'user' })
  },
  ADMIN_CONFIG: {
    PRO_FEATURES: ['unlimited_boxes', 'private_box'],
    ROLE_PERMISSIONS: {
      user: { canActivatePro: false },
      admin: { canActivatePro: true },
      superadmin: { canActivatePro: true, canManageUsers: true }
    }
  }
};

// Мок localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => localStorageMock.store[key] || null),
  setItem: jest.fn((key, value) => { localStorageMock.store[key] = value; }),
  removeItem: jest.fn((key) => { delete localStorageMock.store[key]; }),
  clear: jest.fn(() => { localStorageMock.store = {}; })
};
global.localStorage = localStorageMock;

// Мок console для тестов
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
