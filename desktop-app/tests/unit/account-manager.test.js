// ========================================
// Account Manager Tests
// ========================================

describe('Account Manager', () => {
  test('should have checkProStatus function', () => {
    // Тест базовой функциональности
    expect(typeof global.window.electronAPI.checkProStatus).toBe('function');
  });

  test('should have checkAdminStatus function', () => {
    expect(typeof global.window.electronAPI.checkAdminStatus).toBe('function');
  });

  test('checkProStatus should return default false', async () => {
    const result = await global.window.electronAPI.checkProStatus();
    expect(result).toEqual({ active: false });
  });

  test('checkAdminStatus should return default user role', async () => {
    const result = await global.window.electronAPI.checkAdminStatus();
    expect(result).toEqual({ isAdmin: false, role: 'user' });
  });
});
