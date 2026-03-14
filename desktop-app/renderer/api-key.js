// ========================================
// Secret API Key Configuration
// For Administrator PRO Activation
// ========================================

// SECRET API KEY FOR PRO ACTIVATION
// Admin can use this key to unlock all PRO features
const ADMIN_CONFIG = {
  // Secret API Key - Change this in production!
  secretApiKey: 'ITOP-ADMIN-PRO-2026-X7K9M3Q2',

  // Alternative keys for different admin levels
  adminKeys: {
    // Full PRO access
    master: 'ITOP-MASTER-ADMIN-2026-A1B2C3D4',
    // PRO access with expiration (90 days)
    temporary: 'ITOP-TEMP-ADMIN-2026-E5F6G7H8',
    // Developer key with all features
    developer: 'ITOP-DEV-ADMIN-2026-I9J0K1L2'
  },

  // Key validation settings
  validation: {
    // Keys are case-insensitive
    caseInsensitive: true,
    // Key format: ITOP-{TYPE}-{ROLE}-{YEAR}-{8CHARS}
    format: /^ITOP-[A-Z]+-[A-Z]+-\d{4}-[A-Z0-9]{8}$/i,
    // Minimum key length
    minLength: 30,
    // Maximum key length
    maxLength: 35
  },

  // Features unlocked by admin key
  unlockedFeatures: [
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
  ],

  // Admin permissions
  permissions: {
    canActivatePro: true,
    canDeactivatePro: true,
    canExportData: true,
    canResetSettings: true,
    canAccessDebug: true,
    canManageUsers: false
  }
};

// Generate a new random API key (for admin use)
function generateApiKey(type = 'master') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPart = Array(8).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  const year = new Date().getFullYear();
  return `ITOP-${type.toUpperCase()}-ADMIN-${year}-${randomPart}`;
}

// Validate API key format
function isValidApiKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  
  const trimmedKey = key.trim();
  
  // Check length
  if (trimmedKey.length < ADMIN_CONFIG.validation.minLength || 
      trimmedKey.length > ADMIN_CONFIG.validation.maxLength) {
    return false;
  }
  
  // Check format
  return ADMIN_CONFIG.validation.format.test(trimmedKey);
}

// Validate API key
function validateApiKey(key) {
  if (!key || typeof key !== 'string') {
    return { valid: false, error: 'Key is required' };
  }
  
  const normalizedKey = key.trim().toUpperCase();
  
  // Check against known keys
  const allKeys = [
    ADMIN_CONFIG.secretApiKey,
    ADMIN_CONFIG.adminKeys.master,
    ADMIN_CONFIG.adminKeys.temporary,
    ADMIN_CONFIG.adminKeys.developer
  ];
  
  console.log('Validating key:', normalizedKey);
  console.log('Known keys:', allKeys);
  
  if (allKeys.includes(normalizedKey)) {
    const keyType = getKeyType(normalizedKey);
    return {
      valid: true,
      keyType: keyType,
      features: ADMIN_CONFIG.unlockedFeatures,
      permissions: ADMIN_CONFIG.permissions
    };
  }
  
  return { valid: false, error: 'Invalid API key' };
}

// Get key type from key string
function getKeyType(key) {
  const parts = key.split('-');
  if (parts.length >= 2) {
    return parts[1].toLowerCase();
  }
  return 'unknown';
}

// Store activated key in localStorage
function storeActivatedKey(key) {
  try {
    const validation = validateApiKey(key);
    console.log('Validation result:', validation);
    
    if (validation.valid) {
      const keyData = {
        key: key.trim().toUpperCase(),
        activatedAt: new Date().toISOString(),
        keyType: validation.keyType,
        features: validation.features,
        permissions: validation.permissions,
        expiresAt: validation.keyType === 'temporary' ? 
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() : null
      };
      localStorage.setItem('itopProLicense', JSON.stringify(keyData));
      console.log('Stored license:', keyData);
      return { success: true, data: keyData };
    }
    return { success: false, error: validation.error };
  } catch (e) {
    console.error('Error storing key:', e);
    return { success: false, error: 'Failed to store key: ' + e.message };
  }
}

// Get stored license data
function getStoredLicense() {
  try {
    const stored = localStorage.getItem('itopProLicense');
    if (stored) {
      const data = JSON.parse(stored);
      
      // Check if temporary key has expired
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
  return license !== null && license.valid !== false;
}

// Deactivate PRO license
function deactivateProLicense() {
  localStorage.removeItem('itopProLicense');
  return { success: true };
}

// Make available globally for renderer
window.ADMIN_CONFIG = ADMIN_CONFIG;
window.generateApiKey = generateApiKey;
window.isValidApiKeyFormat = isValidApiKeyFormat;
window.validateApiKey = validateApiKey;
window.storeActivatedKey = storeActivatedKey;
window.getStoredLicense = getStoredLicense;
window.isProActivated = isProActivated;
window.deactivateProLicense = deactivateProLicense;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ADMIN_CONFIG,
    generateApiKey,
    isValidApiKeyFormat,
    validateApiKey,
    storeActivatedKey,
    getStoredLicense,
    isProActivated,
    deactivateProLicense
  };
}
