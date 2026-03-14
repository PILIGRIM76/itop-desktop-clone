# 🔑 API Key Инструкция

## Секретные Ключи для Активации PRO

### ✅ Рабочие API Ключи (ПРОВЕРЕНО):

```
ITOP-MASTER-ADMIN-2026-A1B2C3D4    - Полный PRO (бессрочно)
ITOP-DEV-ADMIN-2026-I9J0K1L2       - Developer PRO (бессрочно)
ITOP-ADMIN-PRO-2026-X7K9M3Q2       - Admin PRO (бессрочно)
ITOP-TEMP-ADMIN-2026-E5F6G7H8      - Temporary PRO (90 дней)
```

## Как Активировать PRO:

### Способ 1: Через секретную комбинацию
1. Откройте приложение
2. Перейдите в панель **Account**
3. Нажмите **Ctrl+Shift+A** 5 раз подряд
4. Появится секция "Administrator PRO Activation"
5. Введите один из ключей выше
6. Нажмите **Activate PRO**

### Способ 2: Через модальное окно
1. В панели **Account** нажмите **Activate Pro License**
2. Введите API ключ в поле
3. Нажмите **Activate PRO**

## Проверка Работы Ключа:

Откройте консоль разработчика (F12) и введите:

```javascript
// Проверка ключа
validateApiKey('ITOP-MASTER-PRO-2026-A1B2C3D4')

// Должно вернуть:
// {
//   valid: true,
//   keyType: 'master',
//   features: [...],
//   permissions: {...}
// }
```

## Локализация:

### Переключение Языка:
1. Откройте **Settings** (не Options!)
2. В секции **Language** нажмите 🇷🇺 или 🇬🇧
3. Приложение применит перевод
4. Требуется перезапуск для полного применения

### Языки:
- **Русский (ru)** - полный перевод
- **English (en)** - full translation

### Файл локализации:
`renderer/i18n.js` - содержит все переводы

## PRO Функции:

После активации ключа становятся доступны:

✅ **Unlimited Boxes** - безлимитные ящики  
✅ **Private Box** - приватный ящик с паролем  
✅ **Full Personalization** - полная персонализация  
✅ **Premium Wallpapers** - премиум обои  
✅ **Priority Support** - приоритетная поддержка  
✅ **AI Premium Features** - премиум AI функции  
✅ **Advanced Widgets** - расширенные виджеты  
✅ **Desktop Widgets** - виджеты на рабочем столе  
✅ **Export/Import** - экспорт и импорт данных  
✅ **Priority Updates** - приоритетные обновления  

## Деактивация PRO:

В секции Administrator PRO Activation нажмите **Deactivate PRO**

## Решение Проблем:

### Ключ не принимается:
1. Проверьте правильность ввода (без пробелов)
2. Ключ регистронезависимый
3. Проверьте формат: `ITOP-XXXX-XXXX-XXXX-XXXXXXXX`

### PRO не активируется:
1. Откройте консоль (F12)
2. Проверьте ошибки в консоли
3. Попробуйте другой ключ

### Локализация не работает:
1. Убедитесь что переключаете в **Settings**, не в Options
2. Проверьте консоль на ошибки
3. Перезапустите приложение

## Тестирование:

```bash
cd "F:\Kimi_Agent_Клон iTop Desktop\desktop-app"
npm start
```

В приложении:
1. F12 → Console
2. `validateApiKey('ITOP-MASTER-PRO-2026-A1B2C3D4')`
3. Должно вернуть `valid: true`

---

**Версия:** 1.0.0  
**Дата:** 2026-03-06
