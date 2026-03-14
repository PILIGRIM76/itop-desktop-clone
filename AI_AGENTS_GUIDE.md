# 🤖 AI-Агенты для SmartDesk Organizer

## 📋 Обзор

Этот документ описывает доступные AI-агенты для разработки и сопровождения проекта SmartDesk Organizer.

---

## ⚠️ Проблема с g3 на Windows

К сожалению, **g3** требует сложную настройку среды разработки на Windows:
- Visual Studio C++ компилятор
- CMake  
- llama.cpp для локальных моделей

### ✅ Альтернативные решения

---

## 🚀 Рекомендуемые AI-Агенты

### 1. **Ollama + Cursor/Claude** (Рекомендуется)

У вас уже установлен **Ollama**! Используйте его с AI-редакторами:

#### Установка Cursor (VS Code fork с AI)
```bash
winget install Cursor.Cursor
```

#### Настройка Ollama в Cursor
1. Откройте Cursor Settings → AI
2. Выберите "Ollama" как провайдера
3. URL: `http://localhost:11434`
4. Модель: `qwen2.5-coder:7b` или `deepcoder:14b`

#### Доступные модели в Ollama
```bash
# Посмотреть доступные модели
ollama list

# Установить модель для кодинга
ollama pull qwen2.5-coder:7b
ollama pull deepcoder:14b
ollama pull codellama:13b
```

---

### 2. **GitHub Copilot**

#### Установка
```bash
# В VS Code / Cursor
# Extensions → GitHub Copilot → Install
```

#### Требования
- Подписка GitHub Pro ($10/месяц)
- Или бесплатная для студентов

---

### 3. **Continue.dev** (Open Source альтернатива)

#### Установка в VS Code
```
Extensions → Continue → Install
```

#### Настройка для Ollama
```json
// .continue/config.json
{
  "models": [
    {
      "title": "Ollama",
      "provider": "ollama",
      "model": "qwen2.5-coder:7b",
      "apiBase": "http://localhost:11434"
    }
  ]
}
```

---

### 4. **Kiro** (У вас уже установлен!)

Kiro - AI CLI агент от Amazon

#### Использование
```bash
# Запустить в проекте
cd f:\DescTop\SmartDesk
kiro

# Или с задачей
kiro "добавить функцию экспорта в CSV"
```

---

## 📝 AGENTS.md для SmartDesk

Создайте файл `f:\DescTop\SmartDesk\AGENTS.md`:

```markdown
# AI Agent Instructions for SmartDesk Organizer

## Project Overview
SmartDesk Organizer - организатор рабочего стола на .NET 8 / WPF

## Tech Stack
- **.NET 8**
- **WPF** (UI Framework)
- **CommunityToolkit.Mvvm** (MVVM)
- **SQLite + EF Core** (Database)
- **Serilog** (Logging)
- **AES-256-GCM** (Encryption)

## Build Commands
```bash
# Сборка
dotnet build

# Запуск
dotnet run

# Тесты
dotnet test

# Публикация
dotnet publish -c Release
```

## Code Style
- Использовать C# 12 features
- MVVM паттерн
- Асинхронные методы с суффиксом `Async`
- Dependency Injection через constructor

## Key Directories
- `src/SmartDesk/` - основной код
- `src/SmartDesk.Core/` - бизнес-логика
- `tests/` - тесты
- `docs/` - документация

## AI Guidelines
1. Всегда проверяй null-безопасность
2. Используй `async/await` для UI операций
3. Логируй ошибки через Serilog
4. Следуй принципам SOLID
```

---

## 🔧 Настройка Claude Code (альтернатива g3)

### Установка
```bash
npm install -g @anthropic-ai/claude-code
```

### Использование
```bash
# В директории проекта
cd f:\DescTop\SmartDesk
claude

# С задачей
claude "создать модель для хранения настроек темы"
```

---

## 📊 Сравнение AI-агентов

| Агент | Цена | Локально | Качество | Скорость |
|-------|------|----------|----------|----------|
| **Ollama + Cursor** | Бесплатно | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **GitHub Copilot** | $10/мес | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Continue.dev** | Бесплатно | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Kiro** | Бесплатно | ❌ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Claude Code** | $20/мес | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🎯 Рекомендации для SmartDesk

### Для разработки
1. **Cursor + Ollama** - основная среда
2. **GitHub Copilot** - для автодополнения
3. **Kiro** - для сложных задач рефакторинга

### Для код-ревью
1. **Claude Code** - анализ архитектуры
2. **Continue.dev** - поиск багов

### Для документации
1. **Ollama** с моделью `mistral:7b`
2. **Claude Code**

---

## 📚 Полезные команды Ollama

```bash
# Запуск модели для кодинга
ollama run qwen2.5-coder:7b

# В контексте проекта
ollama run qwen2.5-coder:7b "проанализируй архитектуру SmartDesk"

# Генерация тестов
ollama run qwen2.5-coder:7b "создай юнит-тесты для ViewModel"
```

---

## 🔗 Ссылки

- [Cursor IDE](https://cursor.sh/)
- [Continue.dev](https://continue.dev/)
- [Ollama](https://ollama.ai/)
- [Kiro](https://kiro.dev/)
- [GitHub Copilot](https://github.com/features/copilot)

---

*Последнее обновление: Март 2026*
