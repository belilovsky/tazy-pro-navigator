# TAZY.PRO Project Navigator

Интерактивная инвестиционно-инженерная модель проекта TAZY.PRO: заводская схема, этапы запуска, инженерные точки, финансовый симулятор, паспорт партии и document room.

Это отдельный проект. Он не заменяет и не смешивает сайт про породу тазы.

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

## Structure

- `index.html` — shell приложения.
- `styles.css` — AV DS-подобный light industrial UI.
- `src/data.js` — проектные данные и справочники.
- `src/app.js` — render/state/interactions.
- `assets/drafts/` — текущие визуальные зарисовки как временные ассеты.
- `docs/product-brief.md` — решение по границам продукта и следующим шагам.
- `docs/deploy-readiness.md` — что готово к деплою и что решается после выбора домена.
- `ops/nginx-basic-auth.conf.example` — пример закрытого доступа на nginx.
