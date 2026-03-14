// ========================================
// Calendar Sync Module
// Синхронизация с Google Calendar и Windows Calendar
// ========================================

const { ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

// Путь к конфигурации календаря
const calendarConfigPath = path.join(
  require('os').homedir(),
  '.itop-desktop-clone',
  'calendar-config.json'
);

// Конфигурация по умолчанию
const defaultCalendarConfig = {
  googleCalendar: {
    enabled: false,
    accessToken: null,
    refreshToken: null,
    calendarId: 'primary'
  },
  windowsCalendar: {
    enabled: false,
    calendars: []
  },
  syncInterval: 300000, // 5 минут
  lastSync: null
};

// Загрузить конфигурацию
async function loadCalendarConfig() {
  try {
    const data = await fs.readFile(calendarConfigPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return defaultCalendarConfig;
  }
}

// Сохранить конфигурацию
async function saveCalendarConfig(config) {
  try {
    const dir = path.dirname(calendarConfigPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(calendarConfigPath, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving calendar config:', error);
    return false;
  }
}

// Получить события из Windows Calendar (через COM)
async function getWindowsCalendarEvents(startDate, endDate) {
  // Примечание: Для работы с Windows Calendar требуется node-win32-api или аналогичный модуль
  // В данной реализации возвращаем демо-данные
  
  return {
    success: true,
    demo: true,
    events: [
      {
        id: '1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        location: 'Conference Room A',
        calendar: 'Work'
      },
      {
        id: '2',
        title: 'Lunch with Client',
        description: 'Discuss project requirements',
        startTime: new Date(Date.now() + 7200000).toISOString(),
        endTime: new Date(Date.now() + 10800000).toISOString(),
        location: 'Restaurant',
        calendar: 'Work'
      },
      {
        id: '3',
        title: 'Gym',
        description: 'Workout session',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 90000000).toISOString(),
        location: 'Fitness Center',
        calendar: 'Personal'
      }
    ]
  };
}

// Получить события из Google Calendar
async function getGoogleCalendarEvents(accessToken, calendarId, startDate, endDate) {
  try {
    const axios = require('axios');
    
    const response = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        params: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description || '',
      startTime: event.start.dateTime || event.start.date,
      endTime: event.end.dateTime || event.end.date,
      location: event.location || '',
      calendar: calendarId,
      color: event.colorId || 'blue'
    }));

    return {
      success: true,
      demo: false,
      events: events
    };
  } catch (error) {
    console.error('Google Calendar API error:', error.message);
    return {
      success: false,
      error: error.message,
      events: []
    };
  }
}

// Получить URL для OAuth авторизации Google
function getGoogleOAuthURL() {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
  const redirectUri = 'http://localhost:3000/oauth2callback';
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly'
  ].join(' ');

  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `access_type=offline&` +
    `prompt=consent`;
}

// Обменять код авторизации на токены
async function exchangeGoogleCode(code) {
  try {
    const axios = require('axios');
    
    const clientId = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
    const redirectUri = 'http://localhost:3000/oauth2callback';

    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }
    );

    return {
      success: true,
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    };
  } catch (error) {
    console.error('Token exchange error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Экспорт функций
module.exports = {
  loadCalendarConfig,
  saveCalendarConfig,
  getWindowsCalendarEvents,
  getGoogleCalendarEvents,
  getGoogleOAuthURL,
  exchangeGoogleCode
};
