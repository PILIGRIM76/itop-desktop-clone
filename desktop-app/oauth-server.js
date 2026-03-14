// ========================================
// Local OAuth Server Module
// Локальный сервер для обработки OAuth callback
// ========================================

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs').promises;

// Конфигурация
const config = {
  port: 3000,
  googleClientId: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  redirectUri: 'http://localhost:3000/oauth2callback'
};

let server = null;
let authCallback = null;

// Конфигурационный файл
const configPath = path.join(
  require('os').homedir(),
  '.itop-desktop-clone',
  'oauth-tokens.json'
);

// Загрузить токены
async function loadTokens() {
  try {
    const data = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// Сохранить токены
async function saveTokens(tokens) {
  try {
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(tokens, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving tokens:', error);
    return false;
  }
}

// Получить URL для OAuth авторизации
function getGoogleOAuthURL(state) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ].join(' ');

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(config.googleClientId)}&` +
    `redirect_uri=${encodeURIComponent(config.redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent&` +
    `state=${encodeURIComponent(state)}`;
}

// Обменять код на токены
async function exchangeCodeForTokens(code) {
  try {
    const axios = require('axios');
    
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code: code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      }
    );

    return {
      success: true,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      scope: response.data.scope
    };
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Обновить access токен
async function refreshAccessToken(refreshToken) {
  try {
    const axios = require('axios');
    
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        refresh_token: refreshToken,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        grant_type: 'refresh_token'
      }
    );

    return {
      success: true,
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Запустить локальный сервер
function startServer() {
  return new Promise((resolve, reject) => {
    if (server) {
      resolve({ success: true, message: 'Server already running' });
      return;
    }

    server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url, true);
      
      // OAuth callback
      if (parsedUrl.pathname === '/oauth2callback') {
        const { code, state, error } = parsedUrl.query;
        
        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>OAuth Error</title></head>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>❌ OAuth Error</h1>
                <p>${error}</p>
                <p>You can close this window.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);
          
          if (authCallback) {
            authCallback({ success: false, error });
          }
          return;
        }

        // Обменять код на токены
        const tokenResult = await exchangeCodeForTokens(code);
        
        if (tokenResult.success) {
          // Сохранить токены
          await saveTokens({
            accessToken: tokenResult.accessToken,
            refreshToken: tokenResult.refreshToken,
            expiresIn: tokenResult.expiresIn,
            scope: tokenResult.scope,
            createdAt: Date.now()
          });

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Success!</title></head>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>✅ Success!</h1>
                <p>Google Calendar connected successfully!</p>
                <p>You can close this window and return to the app.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);

          if (authCallback) {
            authCallback(tokenResult);
          }
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <head><title>Error</title></head>
              <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>❌ Error</h1>
                <p>${tokenResult.error}</p>
                <p>You can close this window.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
              </body>
            </html>
          `);

          if (authCallback) {
            authCallback(tokenResult);
          }
        }
        return;
      }

      // Health check
      if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', port: config.port }));
        return;
      }

      // 404
      res.writeHead(404);
      res.end('Not Found');
    });

    server.listen(config.port, () => {
      console.log(`OAuth server running on http://localhost:${config.port}`);
      resolve({ success: true, port: config.port });
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
      reject({ success: false, error: error.message });
    });
  });
}

// Остановить сервер
function stopServer() {
  return new Promise((resolve) => {
    if (!server) {
      resolve({ success: true, message: 'Server not running' });
      return;
    }

    server.close(() => {
      server = null;
      console.log('OAuth server stopped');
      resolve({ success: true, message: 'Server stopped' });
    });
  });
}

// Проверить статус сервера
function getServerStatus() {
  return {
    running: server !== null,
    port: config.port,
    redirectUri: config.redirectUri
  };
}

// Начать OAuth flow
async function startOAuthFlow() {
  const state = `oauth_state_${Date.now()}`;
  const oauthUrl = getGoogleOAuthURL(state);
  
  return new Promise((resolve) => {
    authCallback = (result) => {
      authCallback = null;
      resolve(result);
    };

    // Открыть браузер
    const { shell } = require('electron');
    shell.openExternal(oauthUrl);
  });
}

// Получить текущие токены
async function getCurrentTokens() {
  const tokens = await loadTokens();
  
  if (!tokens) {
    return { success: false, error: 'No tokens found' };
  }

  // Проверить истёк ли access токен
  const now = Date.now();
  const expiresAt = tokens.createdAt + (tokens.expiresIn * 1000);
  
  if (now >= expiresAt - 60000) { // 1 минута до истечения
    // Обновить токен
    const refreshResult = await refreshAccessToken(tokens.refreshToken);
    
    if (refreshResult.success) {
      tokens.accessToken = refreshResult.accessToken;
      tokens.expiresIn = refreshResult.expiresIn;
      tokens.createdAt = now;
      await saveTokens(tokens);
    } else {
      return refreshResult;
    }
  }

  return {
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.createdAt + (tokens.expiresIn * 1000),
    scope: tokens.scope
  };
}

// Отозвать токены
async function revokeTokens() {
  const tokens = await loadTokens();
  
  if (!tokens || !tokens.refreshToken) {
    return { success: true, message: 'No tokens to revoke' };
  }

  try {
    const axios = require('axios');
    
    await axios.post(
      'https://oauth2.googleapis.com/revoke',
      null,
      {
        params: { token: tokens.refreshToken }
      }
    );

    await fs.unlink(configPath);
    
    return { success: true, message: 'Tokens revoked' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Проверить конфигурацию
function checkConfiguration() {
  const issues = [];
  
  if (config.googleClientId === 'YOUR_GOOGLE_CLIENT_ID') {
    issues.push('GOOGLE_CLIENT_ID not set');
  }
  
  if (config.googleClientSecret === 'YOUR_GOOGLE_CLIENT_SECRET') {
    issues.push('GOOGLE_CLIENT_SECRET not set');
  }
  
  return {
    valid: issues.length === 0,
    issues,
    config: {
      port: config.port,
      redirectUri: config.redirectUri,
      clientIdSet: config.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID',
      clientSecretSet: config.googleClientSecret !== 'YOUR_GOOGLE_CLIENT_SECRET'
    }
  };
}

module.exports = {
  startServer,
  stopServer,
  getServerStatus,
  startOAuthFlow,
  getCurrentTokens,
  revokeTokens,
  checkConfiguration,
  loadTokens,
  saveTokens,
  getGoogleOAuthURL,
  exchangeCodeForTokens,
  refreshAccessToken,
  config
};
