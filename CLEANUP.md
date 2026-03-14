# 🧹 ОЧИСТКА ПРОЕКТА / CLEANUP GUIDE

## Проблема / Issue
Файлы не удаляются автоматически из-за кириллицы в пути (`Клон`).

Files cannot be deleted automatically due to Cyrillic characters in path (`Клон`).

---

## Ручное удаление / Manual Deletion

### Откройте проводник Windows и перейдите в:
### Open Windows Explorer and navigate to:
```
F:\Kimi_Agent_Клон iTop Desktop\
```

### Удалите следующие файлы из корневой папки:
### Delete these files from root folder:

- `AI_AGENTS_GUIDE.md`
- `itop-easy-desktop-clone-source.tar.gz`
- Все `.png` файлы (скриншоты / screenshots)
- `$null`
- `ziiVzj58`

### Удалите следующие файлы из desktop-app/:
### Delete these files from desktop-app/:

- Все `.md` файлы (кроме `README.md`)
- Все `.log` файлы
- `test-app.js`
- `test-full.js`
- `test-json.js`
- `test-locales.js`
- `test-widgets.js`
- `find-widgets.js`

---

## PowerShell команды (если работает кириллица):
### PowerShell commands (if Cyrillic works):

```powershell
# Очистка корня / Clean root
cd "F:\Kimi_Agent_Клон iTop Desktop"
Get-ChildItem -File | Where-Object { $_.Extension -eq '.md' -and $_.Name -ne 'README.md' } | Remove-Item -Force
Get-ChildItem -File -Filter '*.png' | Remove-Item -Force
Get-ChildItem -File -Filter '*.tar.gz' | Remove-Item -Force
Remove-Item 'ziiVzj58' -Force
Remove-Item '$null' -Force

# Очистка desktop-app / Clean desktop-app
Get-ChildItem 'desktop-app' -File -Filter '*.md' | Remove-Item -Force
Get-ChildItem 'desktop-app' -File -Filter '*.log' | Remove-Item -Force
Get-ChildItem 'desktop-app' -File -Filter 'test-*.js' | Remove-Item -Force
Remove-Item 'desktop-app\find-widgets.js' -Force
```

---

## Результат / Expected Result

После очистки останется:
After cleanup will remain:

```
F:\Kimi_Agent_Клон iTop Desktop\
├── README.md           # Документация проекта
├── CLEANUP.md          # Эта инструкция
├── desktop-app\        # Исходный код приложения
│   ├── main.js
│   ├── preload.js
│   ├── package.json
│   ├── locales.json
│   ├── renderer\
│   │   ├── index.html
│   │   ├── app.js
│   │   ├── styles.css
│   │   ├── box.html
│   │   └── widget.html
│   └── ... (остальные файлы кода)
└── app\                # Дополнительные модули
```
