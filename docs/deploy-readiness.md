# Deploy Readiness

Канонический домен: `https://tazy.pro/`.

Проект разворачивается как статический release в `/var/www/tazy.pro/releases/<timestamp>` с переключением symlink `/var/www/tazy.pro/current`. Старый релиз остаётся на сервере для быстрого отката.

## Что уже готово

- Статический shell без внешних CDN и без сборки.
- Данные вынесены в `src/data.js`.
- Smoke-проверка desktop/tablet/mobile вынесена в `scripts/browser-smoke.mjs`.
- Smoke проверяет режим аудитории, выбор этапа и модуля, финансовый сценарий и отсутствие горизонтального overflow.
- Рабочие визуальные ассеты лежат в `assets/generated/`: страница использует WebP, PNG сохранены как исходники, Open Graph использует оптимизированный `overview-og.jpg`.
- Manifest включает SVG favicon и PNG-иконки `192x192`/`512x512`; `index.html` подключает `apple-touch-icon`.
- Статическая сборка в `dist/tazy-pro-navigator`.
- Пример nginx basic auth + CSP: `ops/nginx-basic-auth.conf.example`.
- Deploy-скрипт для текущего VPS: `scripts/deploy-tazy-pro.sh`.
- Фактический nginx-фрагмент для домена: `ops/tazy-pro-nginx.conf`.

## Что остаётся закрывать вне SEO-контура

1. Где хранится настоящая комната документов: qdev-хранилище, серверный API или защищённая папка.
2. Реальная финансовая модель как отдельный JSON/таблица.
3. При необходимости добрать отдельный пакет визуалов под инвесторскую презентацию, PDF-экспорт и реальные документы комнаты документов.
4. Журнал просмотров/скачиваний для фиксации интереса инвесторов.

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

Сборка по умолчанию публично индексируемая: `robots.txt` содержит `Allow: /` и ссылку на `https://tazy.pro/sitemap.xml`, а HTML не должен содержать `noindex`. Если навигатор нужно временно закрыть, закрывать доступ надо на уровне edge/nginx/auth, чтобы следующий деплой не расходился с WM public-scope решением.

## GitHub

Код навигатора вынесен в отдельный репозиторий `belilovsky/tazy-pro-navigator`, ветка `main`.

Старый репозиторий `belilovsky/tazy-pro` сохранён локально как `legacy-tazy-pro`, потому что его `main` относится к TAZY.DOG / породной платформе и не должен смешиваться с инвестиционно-инженерным навигатором.

## Security notes

Клиентский пароль внутри HTML/JS не является защитой. Если навигатор должен быть закрытым, доступ нужно закрывать на уровне edge, nginx или серверного контура, а не в браузере.
