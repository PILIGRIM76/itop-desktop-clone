// ========================================
// Admin PRO Activation - RBAC Based
// Uses Supabase role-based access control
// ========================================

// PRO Features list
const PRO_FEATURES = [
  'unlimited_boxes',
  'private_box',
  'full_personalization',
  'premium_wallpapers',
  'priority_support',
  'ai_premium_features',
  'advanced_widgets',
  'desktop_widgets',
  'export_import',
  'priority_updates'
];

// Admin permissions by role
const ROLE_PERMISSIONS = {
  user: {
    canActivatePro: false,
    canDeactivatePro: false,
    canExportData: false,
    canResetSettings: false,
    canAccessDebug: false,
    canManageUsers: false
  },
  admin: {
    canActivatePro: true,
    canDeactivatePro: true,
    canExportData: true,
    canResetSettings: true,
    canAccessDebug: true,
    canManageUsers: false
  },
  superadmin: {
    canActivatePro: true,
    canDeactivatePro: true,
    canExportData: true,
    canResetSettings: true,
    canAccessDebug: true,
    canManageUsers: true
  }
};

// Check if user has PRO status via Supabase
async function checkProStatus() {
  try {
    // Используем window.electronAPI для проверки через main process
    if (window.electronAPI && window.electronAPI.checkProStatus) {
      return await window.electronAPI.checkProStatus();
    }
    
    // Fallback: проверяем localStorage
    const stored = localStorage.getItem('itopProLicense');
    if (stored) {
      const data = JSON.parse(stored);
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        localStorage.removeItem('itopProLicense');
        return { active: false, reason: 'expired' };
      }
      return { active: true, data };
    }
    
    return { active: false, reason: 'no_license' };
  } catch (e) {
    console.error('Error checking PRO status:', e);
    return { active: false, error: e.message };
  }
}

// Check if current user is admin via Supabase
async function checkAdminStatus() {
  try {
    if (window.electronAPI && window.electronAPI.checkAdminStatus) {
      return await window.electronAPI.checkAdminStatus();
    }
    return { isAdmin: false, role: 'user' };
  } catch (e) {
    console.error('Error checking admin status:', e);
    return { isAdmin: false, role: 'user', error: e.message };
  }
}

// Get permissions for current user role
function getPermissions(role = 'user') {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
}

// Activate PRO license (stores in localStorage)
function activateProLicense(licenseData) {
  try {
    const keyData = {
      ...licenseData,
      activatedAt: new Date().toISOString()
    };
    localStorage.setItem('itopProLicense', JSON.stringify(keyData));
    return { success: true, data: keyData };
  } catch (e) {
    console.error('Error activating license:', e);
    return { success: false, error: e.message };
  }
}

// Get stored license data
function getStoredLicense() {
  try {
    const stored = localStorage.getItem('itopProLicense');
    if (stored) {
      const data = JSON.parse(stored);
      
      // Check if license has expired
      if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
        localStorage.removeItem('itopProLicense');
        return null;
      }
      
      return data;
    }
  } catch (e) {
    console.error('Error reading license:', e);
  }
  return null;
}

// Check if PRO is activated
function isProActivated() {
  const license = getStoredLicense();
  return license !== null;
}

// Deactivate PRO license
function deactivateProLicense() {
  localStorage.removeItem('itopProLicense');
  return { success: true };
}

// Export functions
window.ADMIN_CONFIG = { PRO_FEATURES, ROLE_PERMISSIONS };
window.checkProStatus = checkProStatus;
window.checkAdminStatus = checkAdminStatus;
window.getPermissions = getPermissions;
window.activateProLicense = activateProLicense;
window.getStoredLicense = getStoredLicense;
window.isProActivated = isProActivated;
window.deactivateProLicense = deactivateProLicense;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PRO_FEATURES,
    ROLE_PERMISSIONS,
    checkProStatus,
    checkAdminStatus,
    getPermissions,
    activateProLicense,
    getStoredLicense,
    isProActivated,
    deactivateProLicense
  };
}
