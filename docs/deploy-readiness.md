# Deploy Readiness

Домен будет добавлен позже. До этого проект должен оставаться готовым к безопасному переносу на любой статический хостинг или в qdev-контур.

## Что уже готово

- Статический shell без внешних CDN и без сборки.
- Данные вынесены в `src/data.js`.
- Smoke-проверка desktop/tablet/mobile вынесена в `scripts/browser-smoke.mjs`.
- Smoke проверяет audience mode, stage/module selection, finance preset и отсутствие горизонтального overflow.
- Черновые визуальные ассеты лежат локально в `assets/drafts/`.
- Статическая сборка в `dist/tazy-pro-navigator`.
- Пример nginx basic auth + CSP: `ops/nginx-basic-auth.conf.example`.

## Что нужно решить перед публичным доступом

1. Контур закрытого доступа: Cloudflare Access, nginx basic auth или qdev auth gateway.
2. Канонический домен и базовый URL.
3. Где хранится настоящая document room: qdev storage, backend API или защищённая папка.
4. Реальная финансовая модель как отдельный JSON/таблица.
5. Финальные рендеры производственной схемы вместо GPT-черновиков.
6. Журнал просмотров/скачиваний для investor interest tracking.

## Минимальный preflight перед деплоем

```bash
./scripts/check.sh
node scripts/build-static.mjs
python3 -m http.server 4181
PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright/index.js node scripts/browser-smoke.mjs
```

## Security notes

Клиентский пароль внутри HTML/JS не является защитой. Если навигатор должен быть закрытым, доступ нужно закрывать на уровне edge/nginx/backend, а не в браузере.
