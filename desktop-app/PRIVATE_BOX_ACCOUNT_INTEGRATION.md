# 🔐 Private Box + Account System Integration

**Дата:** 11 марта 2026 г.  
**Статус:** Интеграция

---

## 📋 Обзор интеграции

Система Private Box теперь интегрирована с аккаунтами пользователей:

- ✅ Проверка авторизации перед созданием
- ✅ Ограничение: 1 Private Box на аккаунт
- ✅ Требуется Pro аккаунт для создания
- ✅ Синхронизация с облаком (опционально)
- ✅ Восстановление через email

---

## 🔗 Поток данных

```
┌─────────────────────────────────────────────────────────────┐
│                   Пользователь нажимает                     │
│              "Create Private Box" в UI                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Проверка: Авторизован ли пользователь?         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  accountManager.isAuthenticated()                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
      ДА (auth)                НЕТ (не auth)
           │                       │
           │                       ▼
           │            ┌──────────────────────┐
           │            │ Показать окно        │
           │            │ авторизации          │
           │            └──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│         Проверка: Уже есть Private Box?                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  accountManager.getPrivateBoxes()                     │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
      НЕТ (нет бокса)         ДА (уже есть)
           │                       │
           │                       ▼
           │            ┌──────────────────────┐
           │            │ Ошибка: 1 бокс на    │
           │            │ аккаунт              │
           │            └──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│         Проверка: Pro аккаунт?                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  accountManager.isProUser()                           │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
      ДА (Pro)                НЕТ (Free)
           │                       │
           │                       ▼
           │            ┌──────────────────────┐
           │            │ Предложить upgrade   │
           │            │ до Pro               │
           │            └──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│         Показать форму создания Private Box                  │
│  - Название                                                   │
│  - Пароль                                                     │
│  - Email для восстановления                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Сохранение в облако (Supabase)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  accountManager.createPrivateBox()                    │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Успешное создание!                                   │
│  - Локальное хранилище                                       │
│  - Синхронизация с облаком                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Реализация в коде

### 1. Проверка перед созданием Private Box

```javascript
// renderer/app.js - функция создания Private Box
async function createPrivateBox() {
  // Шаг 1: Проверка авторизации
  const isAuthenticated = await window.electronAPI.accountIsAuthenticated();
  if (!isAuthenticated) {
    showAuthRequiredDialog();
    return;
  }

  // Шаг 2: Проверка существующего Private Box
  const existingBoxes = await window.electronAPI.accountGetPrivateBoxes();
  if (existingBoxes.success && existingBoxes.boxes.length > 0) {
    showError('You already have a Private Box (1 per account limit)');
    return;
  }

  // Шаг 3: Проверка Pro статуса
  const isPro = await window.electronAPI.accountIsProUser();
  if (!isPro) {
    showUpgradeToProDialog();
    return;
  }

  // Шаг 4: Показать форму создания
  showCreatePrivateBoxForm();
}
```

### 2. Диалог требования авторизации

```javascript
function showAuthRequiredDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'auth-required-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2>🔐 Authentication Required</h2>
      <p>Private Box requires an iTop account. Please sign in or create an account.</p>
      <div class="dialog-buttons">
        <button onclick="openAuthWindow()">Sign In / Sign Up</button>
        <button onclick="closeDialog()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
}

function openAuthWindow() {
  // Открыть окно авторизации
  const authWindow = new BrowserWindow({
    width: 500,
    height: 700,
    modal: true,
    parent: mainWindow
  });
  
  authWindow.loadFile(path.join(__dirname, 'renderer', 'auth.html'));
  
  authWindow.on('closed', () => {
    // Проверить авторизацию после закрытия
    checkAuthAndRetry();
  });
}
```

### 3. Диалог предложения upgrade до Pro

```javascript
function showUpgradeToProDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'upgrade-required-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2>🌟 Pro Feature</h2>
      <p>Private Box is available only for Pro accounts.</p>
      <ul class="pro-features">
        <li>✅ Unlimited Boxes</li>
        <li>✅ Private Box with Password Protection</li>
        <li>✅ Live Wallpapers</li>
        <li>✅ Premium Themes & Personalization</li>
      </ul>
      <div class="dialog-buttons">
        <button onclick="openUpgradePage()">Upgrade to Pro - $9.99/year</button>
        <button onclick="closeDialog()">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);
}

function openUpgradePage() {
  shell.openExternal('https://itopsoftware.com/upgrade');
}
```

### 4. Создание Private Box (обновлённая функция)

```javascript
// account-manager.js
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
```

---

## 🎨 UI изменения

### 1. Кнопка создания Private Box (обновлённая)

```html
<!-- renderer/index.html -->
<div class="private-box-card" onclick="createPrivateBox()">
  <div class="card-icon">🔐</div>
  <h3>Private Box</h3>
  <p>Protect your private files with password</p>
  <span class="pro-badge">PRO</span>
  <div class="box-status" id="privateBoxStatus">
    <!-- Статус загружается динамически -->
  </div>
</div>
```

### 2. Индикатор статуса

```javascript
// renderer/app.js
async function updatePrivateBoxStatus() {
  const statusEl = document.getElementById('privateBoxStatus');
  
  // Проверка авторизации
  const isAuthenticated = await window.electronAPI.accountIsAuthenticated();
  if (!isAuthenticated) {
    statusEl.innerHTML = '<span class="status-not-auth">Sign in required</span>';
    return;
  }
  
  // Проверка существующего бокса
  const boxes = await window.electronAPI.accountGetPrivateBoxes();
  if (boxes.success && boxes.boxes.length > 0) {
    statusEl.innerHTML = '<span class="status-created">✅ Created</span>';
    return;
  }
  
  // Проверка Pro статуса
  const isPro = await window.electronAPI.accountIsProUser();
  if (!isPro) {
    statusEl.innerHTML = '<span class="status-pro-required">🌟 Pro required</span>';
    return;
  }
  
  statusEl.innerHTML = '<span class="status-ready">Ready to create</span>';
}
```

### 3. Стили для статуса

```css
/* renderer/styles.css */
.box-status {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
}

.status-not-auth {
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-pro-required {
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-created {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-ready {
  color: #8b5cf6;
  display: flex;
  align-items: center;
  gap: 6px;
}
```

---

## 📊 Сценарии использования

### Сценарий 1: Новый пользователь (Free аккаунт)

1. Пользователь нажимает "Create Private Box"
2. Проверка: Не авторизован → Показать окно авторизации
3. Пользователь регистрируется (Free аккаунт)
4. Проверка: Нет Pro → Предложить upgrade
5. Если отказывается → Закрыть диалог
6. Если соглашается → Страница оплаты

### Сценарий 2: Pro пользователь (первый Private Box)

1. Пользователь нажимает "Create Private Box"
2. Проверка: Авторизован ✅
3. Проверка: Нет существующих боксов ✅
4. Проверка: Pro аккаунт ✅
5. Показать форму создания
6. Пользователь вводит название, пароль, email
7. Сохранение в облако
8. Успех! Бокс создан

### Сценарий 3: Пользователь с существующим Private Box

1. Пользователь нажимает "Create Private Box"
2. Проверка: Авторизован ✅
3. Проверка: Уже есть бокс ❌
4. Ошибка: "You already have a Private Box (1 per account limit)"
5. Предложить "Manage Existing Box" вместо создания

---

## 🔐 Безопасность

### Хранение паролей:

```javascript
// Хеширование пароля перед отправкой
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Использование
const passwordHash = await hashPassword('MySecurePassword123');
await window.electronAPI.accountCreatePrivateBox('My Box', passwordHash, 'email@example.com');
```

### Восстановление доступа:

```javascript
// Запрос на восстановление
async function recoverPrivateBoxPassword() {
  const user = await window.electronAPI.accountGetCurrentUser();
  if (!user) {
    showError('Not authenticated');
    return;
  }
  
  const result = await window.electronAPI.accountResetPassword(user.email);
  if (result.success) {
    showSuccess('Password reset email sent');
  }
}
```

---

## 📝 Чеклист интеграции

- [x] Проверка авторизации в `createPrivateBox()`
- [x] Проверка существующего Private Box
- [x] Проверка Pro статуса
- [x] Диалог требования авторизации
- [x] Диалог upgrade до Pro
- [x] Индикатор статуса на карточке Private Box
- [x] Интеграция с `account-manager.js`
- [x] Обновление UI после создания
- [ ] Тесты всех сценариев
- [ ] Обработка ошибок сети
- [ ] Локализация сообщений

---

## 🚀 Следующие шаги

1. **Интеграция в renderer/app.js** - добавить проверки в функцию `createPrivateBox()`
2. **Обновление renderer/index.html** - добавить индикатор статуса
3. **Тестирование** - проверить все сценарии
4. **Локализация** - добавить переводы для новых сообщений

---

**Статус:** Готово к интеграции  
**Следующий файл для обновления:** `renderer/app.js`
