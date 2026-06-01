# Deploy Readiness

Канонический домен: `https://tazy.pro/`.

Проект разворачивается как статический release в `/var/www/tazy.pro/releases/<timestamp>` с переключением symlink `/var/www/tazy.pro/current`. Старый релиз остаётся на сервере для быстрого отката.

## Что уже готово

- Статический shell без внешних CDN и без сборки.
- Данные вынесены в `src/data.js`.
- Smoke-проверка desktop/tablet/mobile вынесена в `scripts/browser-smoke.mjs`.
- Smoke проверяет audience mode, stage/module selection, finance preset и отсутствие горизонтального overflow.
- Черновые визуальные ассеты лежат локально в `assets/drafts/`.
- Статическая сборка в `dist/tazy-pro-navigator`.
- Пример nginx basic auth + CSP: `ops/nginx-basic-auth.conf.example`.
- Deploy-скрипт для текущего VPS: `scripts/deploy-tazy-pro.sh`.

## Что нужно решить перед публичным доступом

1. Контур закрытого доступа: Cloudflare Access, nginx basic auth или qdev auth gateway.
2. Где хранится настоящая document room: qdev storage, backend API или защищённая папка.
3. Реальная финансовая модель как отдельный JSON/таблица.
4. Финальные рендеры производственной схемы вместо GPT-черновиков.
5. Журнал просмотров/скачиваний для investor interest tracking.

## Минимальный preflight перед деплоем

```bash
./scripts/check.sh
node scripts/build-static.mjs
python3 -m http.server 4181
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js node scripts/browser-smoke.mjs
```

## Deploy

```bash
./scripts/deploy-tazy-pro.sh
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js ./scripts/verify-live.sh
```

По умолчанию сборка оставляет `robots.txt` с `Disallow: /`, потому что это инвестиционно-инженерный cockpit, а не публичный SEO-лендинг. Для публичной индексации собирать так:

```bash
TAZY_ROBOTS=public node scripts/build-static.mjs
```

## GitHub

Код навигатора отправлен в `belilovsky/tazy-pro` отдельной веткой `project-navigator-static`.

Это сделано намеренно: `main` существующего репозитория сейчас содержит TAZY.DOG / породную платформу, а TAZY.PRO Project Navigator является отдельным investment-engineering cockpit. Мержить ветку в `main` стоит только после решения о структуре репозиториев: отдельный private repo, monorepo-папка или замена текущего публичного сайта.

## Security notes

Клиентский пароль внутри HTML/JS не является защитой. Если навигатор должен быть закрытым, доступ нужно закрывать на уровне edge/nginx/backend, а не в браузере.
