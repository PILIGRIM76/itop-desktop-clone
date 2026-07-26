# Marketing Site - Astro Setup

**Статус:** ⚠️ 20% (шаблон, не кастомизирован)

---

## Стек

- Astro 5
- Cloudflare Workers (деплой)
- MDX для контента

## Текущее состояние

Стартовый шаблон Astro с базовыми страницами:
- Homepage
- About
- Blog (5 статей-шаблонов)

## Что нужно доработать

1. Переименовать под iTop branding
2. Создать Landing Page (Features, Screenshots, Download, Pricing)
3. Настроить Dark Theme
4. Добавить страницы: Features, Download, Documentation
5. SEO мета-теги, OG tags
6. Формы обратной связи

## Деплой

```bash
cd damp-breeze-714d
npm run build
npx wrangler deploy
```

## Конфигурация

- `astro.config.mjs` — конфигурация Astro
- `wrangler.json` — конфигурация Cloudflare Workers
