// ========================================
// API Key (RBAC) Tests
// ========================================

describe('API Key RBAC', () => {
  test('should have PRO_FEATURES defined', () => {
    expect(global.window.ADMIN_CONFIG.PRO_FEATURES).toBeDefined();
    expect(Array.isArray(global.window.ADMIN_CONFIG.PRO_FEATURES)).toBe(true);
  });

  test('should have ROLE_PERMISSIONS defined', () => {
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS).toBeDefined();
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.user).toBeDefined();
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.admin).toBeDefined();
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.superadmin).toBeDefined();
  });

  test('user role should not have activatePro permission', () => {
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.user.canActivatePro).toBe(false);
  });

  test('admin role should have activatePro permission', () => {
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.admin.canActivatePro).toBe(true);
  });

  test('superadmin role should have manageUsers permission', () => {
    expect(global.window.ADMIN_CONFIG.ROLE_PERMISSIONS.superadmin.canManageUsers).toBe(true);
  });
});
