# 🌤️ Weather API Инструкция

## Как получить API ключ OpenWeatherMap

### Шаг 1: Регистрация

1. Перейдите на сайт [OpenWeatherMap](https://openweathermap.org/api)
2. Нажмите **"Sign Up"** (в правом верхнем углу)
3. Заполните форму регистрации:
   - Email
   - Пароль
   - Имя пользователя
4. Подтвердите email (проверьте папку Spam)

### Шаг 2: Получение API ключа

1. Войдите в свой аккаунт
2. Перейдите в раздел **"API keys"** (в меню сверху)
3. Скопируйте ваш API ключ (выглядит как: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Шаг 3: Настройка в приложении

1. Откройте файл `desktop-app/weather-config.js`
2. Замените `'YOUR_API_KEY_HERE'` на ваш API ключ:

```javascript
module.exports = {
  apiKey: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', // Ваш ключ здесь
  baseURL: 'https://api.openweathermap.org/data/2.5',
  units: 'metric',
  lang: 'ru'
};
```

### Шаг 4: Проверка работы

1. Запустите приложение: `npm start`
2. Откройте виджет Weather на рабочем столе
3. Должны отобразиться данные о погоде

---

## 📊 Тарифы OpenWeatherMap

### Бесплатный план (Free)

- **60 вызовов/минуту**
- **1 000 000 вызовов/месяц**
- Текущая погода
- Прогноз на 5 дней
- Исторические данные

**Более чем достаточно для личного использования!**

---

## 🔧 Настройки

### Единицы измерения

```javascript
units: 'metric'     // Цельсий (°C)
units: 'imperial'   // Фаренгейт (°F)
units: 'standard'   // Кельвин (K)
```

### Язык описания

```javascript
lang: 'ru'    // Русский
lang: 'en'    // English
lang: 'es'    // Español
lang: 'fr'    // Français
lang: 'de'    // Deutsch
```

---

## 🧪 Тестирование API

### Проверка ключа

Откройте консоль приложения (F12) и выполните:

```javascript
const result = await window.electronAPI.getWeather('Moscow');
console.log(result);
```

**Ожидаемый результат:**
```javascript
{
  success: true,
  demo: false,
  data: {
    city: 'Moscow',
    temp: 20,
    description: 'clear sky',
    humidity: 65,
    windSpeed: 5,
    icon: '01d'
  }
}
```

### Если `demo: true`

Значит API ключ не настроен, работают тестовые данные.

---

## ❌ Решение проблем

### Ошибка: "Invalid API key"

1. Проверьте, что ключ скопирован полностью
2. Убедитесь, что нет лишних пробелов
3. Подождите 10-15 минут после создания ключа (активация)

### Ошибка: "API key not set"

1. Убедитесь, что файл `weather-config.js` сохранён
2. Перезапустите приложение
3. Проверьте путь к файлу конфигурации

### Нет данных о погоде

1. Проверьте подключение к интернету
2. Убедитесь, что город введён правильно
3. Попробуйте использовать английское название города

---

## 📚 API Документация

- [Current Weather Data](https://openweathermap.org/current)
- [5 Day / 3 Hour Forecast](https://openweathermap.org/forecast5)
- [Cities Search](https://openweathermap.org/find)

---

## 🔐 Безопасность

**Важно:**
- Не публикуйте API ключ в открытом доступе
- Не коммитьте файл `weather-config.js` в git с реальным ключом
- Используйте `.gitignore` для исключения файла

**Добавьте в `.gitignore`:**
```
weather-config.js
.env
```

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте [официальную документацию](https://openweathermap.org/faq)
2. Проверьте лимиты использования в личном кабинете
3. Убедитесь, что аккаунт активирован (email подтверждён)

---

**Приятного использования! 🌤️**
