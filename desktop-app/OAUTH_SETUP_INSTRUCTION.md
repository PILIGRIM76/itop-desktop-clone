# 🔐 OAuth 2.0 Настройка

## Инструкция по настройке Google OAuth для Calendar Sync

---

## 📋 Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com)
2. Нажмите **"Create Project"** (Создать проект)
3. Введите название проекта (например, "iTop Desktop Clone")
4. Нажмите **"Create"**

---

## 📋 Шаг 2: Включение Google Calendar API

1. В меню слева выберите **"APIs & Services"** → **"Library"**
2. В поиске введите "Google Calendar API"
3. Нажмите на **"Google Calendar API"**
4. Нажмите **"Enable"**

---

## 📋 Шаг 3: Создание OAuth 2.0 Credentials

1. Перейдите в **"APIs & Services"** → **"Credentials"**
2. Нажмите **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Если появляется предупреждение о consent screen:
   - Нажмите **"CONFIGURE CONSENT SCREEN"**
   - Выберите **"External"** → **"Create"**
   - Заполните:
     - App name: iTop Desktop Clone
     - User support email: ваш email
     - Developer contact: ваш email
   - Нажмите **"SAVE AND CONTINUE"**
   - Пропустите Scopes (нажмите SAVE AND CONTINUE)
   - Пропустите Test users (нажмите SAVE AND CONTINUE)

4. Создайте OAuth client ID:
   - Application type: **Web application**
   - Name: iTop Desktop Local
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/oauth2callback`
   - Нажмите **"Create"**

5. Скопируйте:
   - **Client ID** (выглядит как: `123456789-abc123def456.apps.googleusercontent.com`)
   - **Client Secret** (выглядит как: `GOCSPX-abc123def456`)

---

## 📋 Шаг 4: Настройка в приложении

### Вариант A: Через .env файл (рекомендуется)

1. Создайте файл `.env` в папке `desktop-app`:

```bash
# .env
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
```

2. Установите пакет dotenv:
```bash
npm install dotenv
```

3. Добавьте в начало `main.js`:
```javascript
require('dotenv').config();
```

### Вариант B: Прямое редактирование oauth-server.js

Откройте `desktop-app/oauth-server.js` и замените:

```javascript
const config = {
  port: 3000,
  googleClientId: 'YOUR_CLIENT_ID_HERE',
  googleClientSecret: 'YOUR_CLIENT_SECRET_HERE',
  redirectUri: 'http://localhost:3000/oauth2callback'
};
```

---

## 📋 Шаг 5: Проверка настройки

1. Запустите приложение:
```bash
npm start
```

2. Откройте консоль (F12) и выполните:
```javascript
const result = await window.electronAPI.checkOAuthConfiguration();
console.log(result);
```

3. Ожидаемый результат:
```javascript
{
  valid: true,
  issues: [],
  config: {
    port: 3000,
    redirectUri: 'http://localhost:3000/oauth2callback',
    clientIdSet: true,
    clientSecretSet: true
  }
}
```

---

## 📋 Шаг 6: Подключение календаря

1. В приложении откройте **Widgets** → **Schedule**
2. Нажмите **Settings** (⚙️)
3. Нажмите **Connect Google Calendar**
4. Откроется браузер с Google OAuth страницей
5. Выберите аккаунт Google и разрешите доступ
6. Браузер закроется автоматически
7. Календарь подключён!

---

## 🔧 Решение проблем

### Ошибка: "redirect_uri_mismatch"

**Проблема:** Redirect URI не совпадает

**Решение:**
1. Проверьте в Google Cloud Console → Credentials
2. Убедитесь, что redirect URI точно совпадает:
   - `http://localhost:3000/oauth2callback`
3. Проверьте порт (должен быть 3000)

### Ошибка: "invalid_client"

**Проблема:** Неверный Client ID или Secret

**Решение:**
1. Проверьте, что скопировали Client ID и Secret без пробелов
2. Пересоздайте credentials если нужно
3. Убедитесь, что используете правильный тип: Web application

### Ошибка: "access_denied"

**Проблема:** Пользователь отклонил доступ

**Решение:**
1. Попробуйте снова
2. Убедитесь, что аккаунт Google активен
3. Проверьте, что Calendar API включён в проекте

### Сервер не запускается (порт 3000 занят)

**Проблема:** Порт 3000 используется другим приложением

**Решение:**
1. Измените порт в `oauth-server.js`:
```javascript
const config = {
  port: 3001, // Измените на другой
  // ...
};
```
2. Обновите redirect URI в Google Cloud Console на `http://localhost:3001/oauth2callback`

---

## 🔐 Безопасность

### Хранение токенов

Токены сохраняются в:
```
~/.itop-desktop-clone/oauth-tokens.json
```

**Структура:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresIn": 3599,
  "scope": "https://www.googleapis.com/auth/calendar.readonly",
  "createdAt": 1234567890000
}
```

### Отзыв токенов

Для отзыва доступа:
```javascript
await window.electronAPI.revokeOAuthTokens();
```

Или через Google:
1. Перейдите в [Google Account Security](https://myaccount.google.com/permissions)
2. Найдите "iTop Desktop Clone"
3. Нажмите **"Remove Access"**

### Ограничения доступа

Приложение запрашивает только:
- `calendar.readonly` - чтение календарей
- `calendar.events.readonly` - чтение событий

**Приложение НЕ может:**
- Изменять события
- Создавать новые события
- Удалять события
- Получать доступ к другим данным Google

---

## 📊 Мониторинг использования API

### Квоты Google Calendar API

- **Бесплатный лимит:** 1,000,000 запросов в день
- **Rate limit:** 500 запросов в 100 секунд на пользователя

### Проверка использования

1. Google Cloud Console → APIs & Services → Dashboard
2. Выберите Google Calendar API
3. Просмотрите графики использования

---

## 🚀 Дополнительные возможности

### Автоматическое обновление токенов

Приложение автоматически обновляет access токен когда он истекает (через 1 час).

Refresh токен не истекает пока вы не отзовёте доступ.

### Работа с несколькими аккаунтами

Для подключения нескольких аккаунтов Google:
1. Отключите текущий аккаунт (Revoke tokens)
2. Подключите новый аккаунт через OAuth flow
3. Токены сохраняются по одному

Для одновременной работы с несколькими аккаунтами требуется модификация `oauth-server.js`.

---

## 📞 Поддержка

### Логи OAuth сервера

Включите логирование в `oauth-server.js`:
```javascript
// Добавьте в начало файла
const DEBUG = true;

function log(message) {
  if (DEBUG) console.log('[OAuth]', message);
}
```

### Проверка статуса сервера

```javascript
const status = await window.electronAPI.getOAuthServerStatus();
console.log(status);
```

---

**✅ Готово! Теперь Google Calendar полностью интегрирован!**
