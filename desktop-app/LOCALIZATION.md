# 🌐 Система локализации (i18n)

## ✅ Реализованные функции

### Выбор языка
Приложение поддерживает **два языка**:
- 🇬🇧 **English** (EN)
- 🇷🇺 **Русский** (RU)

### Переключение языка
1. Откройте **Settings** (Настройки)
2. В разделе **Language** нажмите на кнопку **RU** или **EN**
3. Язык приложения изменится мгновенно
4. Выбор сохраняется в localStorage и восстанавливается при следующем запуске

---

## 📁 Файлы локализации

### locales.json
Полный файл переводов находится в:
```
desktop-app/locales.json
```

Структура файла:
```json
{
  "en": {
    "nav": { "boxes": "Boxes", ... },
    "settings": { "title": "Settings", ... },
    ...
  },
  "ru": {
    "nav": { "boxes": "Боксы", ... },
    "settings": { "title": "Настройки", ... },
    ...
  }
}
```

---

## 🔧 Как использовать

### В HTML (data-i18n атрибуты)
```html
<h2 data-i18n="settings.title">Settings</h2>
<span class="nav-tooltip" data-i18n="nav.boxes">Boxes</span>
```

### В JavaScript (функция t())
```javascript
// Получить перевод
const title = t('settings.title');

// Применить к элементу
element.textContent = t('nav.boxes');
```

### Доступные ключи переводов

#### Навигация (nav)
| Ключ | English | Русский |
|------|---------|---------|
| nav.boxes | Boxes | Боксы |
| nav.wallpapers | Wallpapers | Обои |
| nav.personalization | Personalization | Персонализация |
| nav.widgets | Widgets | Виджеты |
| nav.aiAssistant | AI Assistant | AI Ассистент |
| nav.settings | Settings | Настройки |
| nav.desktopMode | Desktop Mode | Режим рабочего стола |

#### Настройки (settings)
| Ключ | English | Русский |
|------|---------|---------|
| settings.title | Settings | Настройки |
| settings.general | General | Общие |
| settings.language | Language | Язык |
| settings.languageDesc | Select application language | Выберите язык приложения |
| settings.autoStart | Auto Start | Автозапуск |
| settings.autoStartDesc | Launch app on system startup | Запускать приложение при старте системы |
| settings.about | About | О приложении |
| settings.version | Version | Версия |
| settings.checkUpdate | Check for Update | Проверить обновление |

---

## 💾 Хранение предпочтений

Выбранный язык сохраняется в **localStorage**:
```javascript
localStorage.setItem('preferredLanguage', 'ru');
```

При следующем запуске приложение автоматически загрузит сохранённый язык.

---

## 🎨 UI переключателя языка

```
┌─────────────────────────────────┐
│ Language / Язык                 │
│ Select application language     │
│                                 │
│ [🇷🇺 RU]  [🇬🇧 EN]              │
└─────────────────────────────────┘
```

- Активный язык подсвечивается фиолетовой рамкой
- При наведении меняется фон
- Мгновенное применение перевода

---

## 📝 Добавление новых переводов

1. Откройте `locales.json`
2. Добавьте новый ключ в обе секции (en и ru):
```json
{
  "en": {
    "newSection": {
      "newKey": "New Translation"
    }
  },
  "ru": {
    "newSection": {
      "newKey": "Новый перевод"
    }
  }
}
```
3. Используйте в HTML: `data-i18n="newSection.newKey"`

---

## 🐛 Отладка

Если переводы не работают:
1. Проверьте консоль на ошибки загрузки `locales.json`
2. Убедитесь, что `data-i18n` атрибуты указаны правильно
3. Проверьте, что ключи существуют в `locales.json`
4. Функция `t()` вернёт ключ, если перевод не найден

---

## ✅ Готово!

Приложение теперь поддерживает русский и английский языки с возможностью переключения в любое время.
