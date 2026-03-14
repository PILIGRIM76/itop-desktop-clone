// ========================================
// Account Manager Module
// Управление аккаунтами пользователей
// ========================================

const { ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const fs = require('fs').promises;
const { getSupabaseClient } = require('./supabase-client');

// Путь к хранилищу сессии
const sessionPath = path.join(
  os.homedir(),
  '.itop-desktop-clone',
  'session.json'
);

// Текущая сессия
let currentSession = null;
let currentUser = null;

// Загрузить сессию из файла
async function loadSession() {
  try {
    const data = await fs.readFile(sessionPath, 'utf-8');
    const session = JSON.parse(data);
    
    // Проверка истечения сессии
    if (session.expires_at && new Date(session.expires_at) > new Date()) {
      currentSession = session;
      currentUser = session.user;
      console.log('[Account] Session loaded from file');
      return true;
    } else {
      console.log('[Account] Session expired');
      await clearSession();
      return false;
    }
  } catch (error) {
    console.log('[Account] No session file found');
    return false;
  }
}

// Сохранить сессию в файл
async function saveSession(session) {
  try {
    const dir = path.dirname(sessionPath);
    await fs.mkdir(dir, { recursive: true });
    
    const sessionData = {
      ...session,
      saved_at: new Date().toISOString()
    };
    
    await fs.writeFile(sessionPath, JSON.stringify(sessionData, null, 2), 'utf-8');
    console.log('[Account] Session saved');
    return true;
  } catch (error) {
    console.error('[Account] Error saving session:', error);
    return false;
  }
}

// Очистить сессию
async function clearSession() {
  currentSession = null;
  currentUser = null;
  
  try {
    await fs.unlink(sessionPath);
  } catch (error) {
    // Файл может не существовать
  }
  
  console.log('[Account] Session cleared');
}

// Регистрация нового пользователя
async function signUp(email, password, fullName = '') {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        },
        emailRedirectTo: 'itop-desktop-clone://auth-callback'
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Создать профиль в базе
    if (data.user) {
      await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
          account_type: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    }
    
    return {
      success: true,
      user: data.user,
      message: 'Registration successful. Please check your email to confirm your account.'
    };
  } catch (error) {
    console.error('[Account] Sign up error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Вход пользователя
async function signIn(email, password) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Получить профиль пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    // Сохранить сессию
    currentSession = {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: new Date(Date.now() + data.session.expires_in * 1000).toISOString(),
      user: {
        ...data.user,
        ...profile
      }
    };
    
    currentUser = currentSession.user;
    
    await saveSession(currentSession);
    
    console.log('[Account] User signed in:', currentUser.email);
    
    return {
      success: true,
      session: currentSession,
      user: currentUser
    };
  } catch (error) {
    console.error('[Account] Sign in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Выход
async function signOut() {
  try {
    const supabase = getSupabaseClient();
    
    await supabase.auth.signOut();
    await clearSession();
    
    console.log('[Account] User signed out');
    
    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('[Account] Sign out error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Восстановление пароля
async function resetPassword(email) {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'itop-desktop-clone://reset-password'
    });
    
    if (error) {
      throw error;
    }
    
    console.log('[Account] Password reset email sent to:', email);
    
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error) {
    console.error('[Account] Reset password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Смена пароля (требует авторизации)
async function changePassword(currentPassword, newPassword) {
  try {
    if (!currentSession) {
      throw new Error('Not authenticated');
    }
    
    const supabase = getSupabaseClient();
    
    // Сначала нужно войти заново для подтверждения текущего пароля
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword
    });
    
    if (signInError) {
      throw new Error('Current password is incorrect');
    }
    
    // Обновить пароль
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('[Account] Password changed successfully');
    
    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('[Account] Change password error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Активация лицензии (Pro)
async function activateLicense(licenseKey) {
  try {
    if (!currentSession) {
      throw new Error('Not authenticated');
    }
    
    const supabase = getSupabaseClient();
    
    // Проверка формата ключа
    const licenseFormat = /^ITOP-PRO-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    if (!licenseFormat.test(licenseKey)) {
      return {
        success: false,
        error: 'Invalid license key format. Expected: ITOP-PRO-XXXXX-XXXXX-XXXXX'
      };
    }
    
    // Проверка ключа в базе
    const { data: keyData, error: keyError } = await supabase
      .from('license_keys')
      .select('*')
      .eq('key', licenseKey)
      .single();
    
    if (keyError || !keyData) {
      return {
        success: false,
        error: 'License key not found or invalid'
      };
    }
    
    if (keyData.is_used) {
      return {
        success: false,
        error: 'License key already activated'
      };
    }
    
    // Активация лицензии
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + keyData.duration_days);
    
    // Обновить профиль
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_type: 'pro',
        license_key: licenseKey,
        license_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id);
    
    if (updateError) {
      throw updateError;
    }
    
    // Пометить ключ как использованный
    await supabase
      .from('license_keys')
      .update({
        is_used: true,
        used_by: currentUser.id,
        activated_at: new Date().toISOString()
      })
      .eq('id', keyData.id);
    
    // Обновить локальную сессию
    currentUser.account_type = 'pro';
    currentUser.license_key = licenseKey;
    currentUser.license_expires_at = expiresAt.toISOString();
    
    if (currentSession) {
      currentSession.user = currentUser;
      await saveSession(currentSession);
    }
    
    console.log('[Account] License activated:', licenseKey);
    
    return {
      success: true,
      license: {
        type: 'pro',
        expires_at: expiresAt.toISOString()
      },
      message: 'Pro license activated successfully!'
    };
  } catch (error) {
    console.error('[Account] Activate license error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Получить текущего пользователя
function getCurrentUser() {
  return currentUser;
}

// Проверка авторизации
function isAuthenticated() {
  return currentSession !== null && currentUser !== null;
}

// Проверка Pro статуса
function isProUser() {
  return currentUser?.account_type === 'pro';
}

// Получить приватные боксы пользователя
async function getPrivateBoxes() {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('private_boxes')
      .select('*')
      .eq('user_id', currentUser.id);
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      boxes: data || []
    };
  } catch (error) {
    console.error('[Account] Get private boxes error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Создать приватный бокс
async function createPrivateBox(name, passwordHash, recoveryEmail = '') {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    // Проверка: уже есть приватный бокс
    const existingBoxes = await getPrivateBoxes();
    if (existingBoxes.success && existingBoxes.boxes.length > 0) {
      return {
        success: false,
        error: 'You can only have one private box per account'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('private_boxes')
      .insert({
        user_id: currentUser.id,
        name: name,
        password_hash: passwordHash,
        recovery_email: recoveryEmail,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('[Account] Private box created:', name);
    
    return {
      success: true,
      box: data
    };
  } catch (error) {
    console.error('[Account] Create private box error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Обновить приватный бокс
async function updatePrivateBox(boxId, updates) {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('private_boxes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', boxId)
      .eq('user_id', currentUser.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('[Account] Private box updated:', boxId);
    
    return {
      success: true,
      box: data
    };
  } catch (error) {
    console.error('[Account] Update private box error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Сохранить снимок рабочего стола в облако
async function saveSnapshot(name, description, snapshotData) {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('desktop_snapshots')
      .insert({
        user_id: currentUser.id,
        name: name,
        description: description,
        snapshot_data: snapshotData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('[Account] Snapshot saved:', name);
    
    return {
      success: true,
      snapshot: data
    };
  } catch (error) {
    console.error('[Account] Save snapshot error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Получить снимки пользователя
async function getSnapshots() {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('desktop_snapshots')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      snapshots: data || []
    };
  } catch (error) {
    console.error('[Account] Get snapshots error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Удалить снимок
async function deleteSnapshot(snapshotId) {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { error } = await supabase
      .from('desktop_snapshots')
      .delete()
      .eq('id', snapshotId)
      .eq('user_id', currentUser.id);
    
    if (error) {
      throw error;
    }
    
    console.log('[Account] Snapshot deleted:', snapshotId);
    
    return {
      success: true,
      message: 'Snapshot deleted'
    };
  } catch (error) {
    console.error('[Account] Delete snapshot error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Обновить профиль пользователя
async function updateProfile(updates) {
  try {
    if (!currentSession) {
      return {
        success: false,
        error: 'Not authenticated'
      };
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentUser.id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Обновить локальную сессию
    currentUser = { ...currentUser, ...data };
    if (currentSession) {
      currentSession.user = currentUser;
      await saveSession(currentSession);
    }
    
    console.log('[Account] Profile updated');
    
    return {
      success: true,
      profile: data
    };
  } catch (error) {
    console.error('[Account] Update profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ========================================
// IPC Обработчики
// ========================================

function registerAccountIPC() {
  // Загрузить сессию при старте
  ipcMain.handle('account-load-session', async () => {
    await loadSession();
    return {
      isAuthenticated: isAuthenticated(),
      user: currentUser
    };
  });
  
  // Регистрация
  ipcMain.handle('account-signup', async (event, email, password, fullName) => {
    return await signUp(email, password, fullName);
  });
  
  // Вход
  ipcMain.handle('account-signin', async (event, email, password) => {
    return await signIn(email, password);
  });
  
  // Выход
  ipcMain.handle('account-signout', async () => {
    return await signOut();
  });
  
  // Восстановление пароля
  ipcMain.handle('account-reset-password', async (event, email) => {
    return await resetPassword(email);
  });
  
  // Смена пароля
  ipcMain.handle('account-change-password', async (event, currentPassword, newPassword) => {
    return await changePassword(currentPassword, newPassword);
  });
  
  // Активация лицензии
  ipcMain.handle('account-activate-license', async (event, licenseKey) => {
    return await activateLicense(licenseKey);
  });
  
  // Получить текущего пользователя
  ipcMain.handle('account-get-current-user', () => {
    return getCurrentUser();
  });
  
  // Проверка авторизации
  ipcMain.handle('account-is-authenticated', () => {
    return isAuthenticated();
  });
  
  // Проверка Pro статуса
  ipcMain.handle('account-is-pro-user', () => {
    return isProUser();
  });
  
  // Приватные боксы
  ipcMain.handle('account-get-private-boxes', async () => {
    return await getPrivateBoxes();
  });
  
  ipcMain.handle('account-create-private-box', async (event, name, passwordHash, recoveryEmail) => {
    return await createPrivateBox(name, passwordHash, recoveryEmail);
  });
  
  ipcMain.handle('account-update-private-box', async (event, boxId, updates) => {
    return await updatePrivateBox(boxId, updates);
  });
  
  // Снимки
  ipcMain.handle('account-save-snapshot', async (event, name, description, snapshotData) => {
    return await saveSnapshot(name, description, snapshotData);
  });
  
  ipcMain.handle('account-get-snapshots', async () => {
    return await getSnapshots();
  });
  
  ipcMain.handle('account-delete-snapshot', async (event, snapshotId) => {
    return await deleteSnapshot(snapshotId);
  });
  
  // Профиль
  ipcMain.handle('account-update-profile', async (event, updates) => {
    return await updateProfile(updates);
  });
  
  console.log('[Account] IPC handlers registered');
}

// Экспорт
module.exports = {
  loadSession,
  signUp,
  signIn,
  signOut,
  resetPassword,
  changePassword,
  activateLicense,
  getCurrentUser,
  isAuthenticated,
  isProUser,
  getPrivateBoxes,
  createPrivateBox,
  updatePrivateBox,
  saveSnapshot,
  getSnapshots,
  deleteSnapshot,
  updateProfile,
  registerAccountIPC
};
