# Widgets (Виджеты)

**Статус:** ✅ 90%  
**Файлы:** `renderer/widget.html`, `main.js`

---

## Доступные виджеты

| Виджет | Описание | Статус |
|--------|----------|--------|
| Clock | Аналоговые/цифровые часы | ✅ |
| Weather | Погода (OpenWeatherMap API) | ✅ Требует API ключ |
| Calendar | Расписание (Google/Windows Calendar) | ✅ Требует OAuth |
| iPomodoro | Таймер Pomodoro | ✅ |
| iNotes | Заметки | ✅ |
| Quick Tools | 6 инструментов (калькулятор, и т.д.) | ✅ |
| Chat AI | AI-ассистент | ✅ Требует API ключ |

## Глобальные настройки

- Transparency (прозрачность)
- Scale (масштаб)
- Always on Top (поверх окон)
- Show in Desktop Mode
- Blur Effect (размытие)
- Animation Enabled

## Добавление нового виджета

1. Создать HTML в `renderer/widget.html`
2. Добавить IPC обработчик в `main.js`
3. Добавить UI переключатель в `renderer/index.html`
