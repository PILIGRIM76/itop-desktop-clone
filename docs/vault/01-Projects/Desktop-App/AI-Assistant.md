# AI Assistant

**Статус:** ✅ 95%  
**Файлы:** `ai-client.js`, `ai-config.js`, `renderer/widget.html`

---

## Поддерживаемые провайдеры

| Провайдер | Модель | Статус |
|-----------|--------|--------|
| Google Gemini | gemini-pro | ✅ |
| OpenAI | gpt-4 | ✅ |
| Anthropic | claude-3 | ✅ |

## Функционал

- Чат с AI (автозапуск, горячие клавиши)
- Анализ изображений (скриншоты)
- Контекстный диалог

## Горячие клавиши

- ChatAI: `Ctrl + Shift + C` (настраивается)
- Search: `Ctrl + Shift + S`
- Screenshot: `Ctrl + Shift + A`

## Конфигурация

Файл `ai-config.js`:
```javascript
{
  provider: 'gemini', // или 'openai', 'anthropic'
  apiKey: 'YOUR_API_KEY',
  model: 'gemini-pro',
  systemPrompt: 'Ты помощник...'
}
```
