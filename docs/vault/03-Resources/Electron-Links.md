# Electron - Полезные ссылки

## Документация

- [Electron Docs](https://www.electronjs.org/docs)
- [Electron API](https://www.electronjs.org/docs/api/)
- [Electron Builder](https://www.electron.build/)

## Туториалы

- [Electron Tutorial](https://www.electronjs.org/docs/latest/tutorial/quick-start)
- [Electron Security](https://www.electronjs.org/docs/latest/tutorial/security)

## Пакеты

- `electron-store` — хранилище данных
- `electron-updater` — автообновление
- `electron-log` — логирование
- `ffi-napi` — вызовы WinAPI

## Best Practices

- Изолировать main и renderer процессы
- Использовать Context Bridge (не nodeIntegration)
- Валидировать IPC сообщения
- Не хранить секреты в renderer
