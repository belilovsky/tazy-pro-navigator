# Repository Ops

Основной GitHub-репозиторий проекта: `belilovsky/tazy-pro-navigator`.

## Remotes

- `origin` — канонический репозиторий навигатора.
- `legacy-tazy-pro` — старый репозиторий `belilovsky/tazy-pro`, сохранён только как reference-remote, потому что там живёт другой продукт.

Проверка:

```bash
git remote -v
git branch -vv
```

## Рабочий цикл

1. Локальная проверка:

```bash
./scripts/check.sh
node scripts/build-static.mjs
```

2. Публикация кода:

```bash
git push origin main
```

3. Деплой на VPS:

```bash
./scripts/deploy-tazy-pro.sh
```

4. Проверка live:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js ./scripts/verify-live.sh
```

## Release model

- Каждая выкладка уходит в `/var/www/tazy.pro/releases/<timestamp>`.
- Активный релиз переключается через symlink `/var/www/tazy.pro/current`.
- Предыдущие релизы остаются на сервере для быстрого rollback.

## Важная граница

`tazy-pro-navigator` и `tazy.dog` не смешиваются ни по репозиторию, ни по `main`, ни по деплой-потоку.
