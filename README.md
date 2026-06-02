# TAZY.PRO — навигатор проекта

Интерактивная инвестиционно-инженерная модель проекта TAZY.PRO: заводская схема, этапы запуска, инженерные точки, финансовый симулятор, паспорт партии и комната документов.

Это отдельный проект. Он не заменяет и не смешивает сайт про породу тазы.

Текущий прототип устроен как рабочий навигатор: режимы аудитории, логика сделки, блокеры сделки, критический путь `G0–G7`, сценарии финансирования и навигационная комната документов.

## Local

```bash
./scripts/check.sh
node scripts/build-static.mjs
python3 -m http.server 4181
```

Локальный адрес по умолчанию: `http://127.0.0.1:4181/`.

Опциональный browser smoke, если Playwright уже установлен:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js node scripts/browser-smoke.mjs
```

## Production

Канонический домен: `https://tazy.pro/`.
Основной GitHub-репозиторий: `https://github.com/belilovsky/tazy-pro-navigator`.

```bash
./scripts/deploy-tazy-pro.sh
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js ./scripts/verify-live.sh
```

Локально сохранён legacy-remote `legacy-tazy-pro`, чтобы не потерять связь с историческим репозиторием `belilovsky/tazy-pro`, где `main` относится к TAZY.DOG.

## Structure

- `index.html` — shell приложения.
- `styles.css` — AV DS-подобный light industrial UI.
- `src/data.js` — проектные данные и справочники.
- `src/app.js` — render/state/interactions.
- `assets/generated/` — рабочие визуальные ассеты, сгенерированные через `gpt image 2`; WebP используется на странице, PNG сохранены как исходники/OG.
- `assets/drafts/` — сохранённые ранние зарисовки и исторические референсы.
- `docs/product-brief.md` — решение по границам продукта и следующим шагам.
- `docs/deploy-readiness.md` — что готово к деплою и что решается после выбора домена.
- `docs/repository-ops.md` — рабочая схема GitHub/remotes/release-прохода.
- `ops/nginx-basic-auth.conf.example` — пример закрытого доступа на nginx.
- `ops/tazy-pro-nginx.conf` — воспроизводимый фрагмент текущего server block для `tazy.pro`.

## Repository Workflow

```bash
git status
./scripts/check.sh
node scripts/build-static.mjs
git push origin main
```

Для live-проверки после деплоя:

```bash
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js ./scripts/verify-live.sh
```
