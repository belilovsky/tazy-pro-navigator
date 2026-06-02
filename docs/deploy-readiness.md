# Deploy Readiness

Канонический домен: `https://tazy.pro/`.

Проект разворачивается как статический release в `/var/www/tazy.pro/releases/<timestamp>` с переключением symlink `/var/www/tazy.pro/current`. Старый релиз остаётся на сервере для быстрого отката.

## Что уже готово

- Статический shell без внешних CDN и без сборки.
- Данные вынесены в `src/data.js`.
- Smoke-проверка desktop/tablet/mobile вынесена в `scripts/browser-smoke.mjs`.
- Smoke проверяет режим аудитории, выбор этапа и модуля, финансовый сценарий и отсутствие горизонтального overflow.
- Рабочие визуальные ассеты лежат в `assets/generated/`: страница использует WebP, PNG сохранены как исходники и OG-изображение.
- Статическая сборка в `dist/tazy-pro-navigator`.
- Пример nginx basic auth + CSP: `ops/nginx-basic-auth.conf.example`.
- Deploy-скрипт для текущего VPS: `scripts/deploy-tazy-pro.sh`.
- Фактический nginx-фрагмент для домена: `ops/tazy-pro-nginx.conf`.

## Что нужно решить перед публичным доступом

1. Контур закрытого доступа: Cloudflare Access, nginx basic auth или qdev auth gateway.
2. Где хранится настоящая комната документов: qdev-хранилище, серверный API или защищённая папка.
3. Реальная финансовая модель как отдельный JSON/таблица.
4. При необходимости добрать отдельный пакет визуалов под инвесторскую презентацию, PDF-экспорт и реальные документы комнаты документов.
5. Журнал просмотров/скачиваний для фиксации интереса инвесторов.

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

По умолчанию сборка оставляет `robots.txt` с `Disallow: /`, потому что это инвестиционно-инженерный навигатор, а не публичный SEO-лендинг. Для публичной индексации собирать так:

```bash
TAZY_ROBOTS=public node scripts/build-static.mjs
```

## GitHub

Код навигатора вынесен в отдельный репозиторий `belilovsky/tazy-pro-navigator`, ветка `main`.

Старый репозиторий `belilovsky/tazy-pro` сохранён локально как `legacy-tazy-pro`, потому что его `main` относится к TAZY.DOG / породной платформе и не должен смешиваться с инвестиционно-инженерным навигатором.

## Security notes

Клиентский пароль внутри HTML/JS не является защитой. Если навигатор должен быть закрытым, доступ нужно закрывать на уровне edge, nginx или серверного контура, а не в браузере.
