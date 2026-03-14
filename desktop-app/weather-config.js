// ========================================
// Weather API Configuration
// ========================================
// 
// Инструкция по получению API ключа:
// 1. Зарегистрируйтесь на https://openweathermap.org/api
// 2. Перейдите в раздел API keys
// 3. Скопируйте ваш ключ
// 4. Вставьте ключ ниже вместо 'YOUR_API_KEY_HERE'
//
// Бесплатный тариф: 60 вызовов/минуту, 1 000 000 вызовов/месяц
// ========================================

module.exports = {
  apiKey: process.env.OPENWEATHERMAP_API_KEY || 'YOUR_API_KEY_HERE',
  baseURL: 'https://api.openweathermap.org/data/2.5',
  units: 'metric', // Celsius (metric) или Fahrenheit (imperial)
  lang: 'ru', // Язык описания погоды (ru, en, es, fr, de, и т.д.)
  
  // Кэширование данных (в миллисекундах)
  cacheTimeout: 600000, // 10 минут
  
  // Города по умолчанию
  defaultCities: [
    { name: 'Moscow', country: 'RU', lat: 55.7558, lon: 37.6173 },
    { name: 'Saint Petersburg', country: 'RU', lat: 59.9343, lon: 30.3351 },
    { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 },
    { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 }
  ]
};
