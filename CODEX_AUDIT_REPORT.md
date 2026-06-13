# Codex Audit Report — tazy-pro-navigator

**Дата:** 2026-06-01 22:30 Asia/Almaty
**Проверено билдов:** 10 (сборка + static-check + Python Playwright audit matrix + deep-audit + overflow-audit)
**Часов:** ~1.4

## TL;DR
Проект tazy-pro-navigator после доработок прошёл стабильный проход основных production-checks на ключевых breakpoints: пересмотровые проверки не выявили overflow/обрезки, консольных ошибок и регрессий в сценариях взаимодействия. Основные доработки направлены на более устойчивую адаптивность таблицы оборудования и стабильность мобильной навигации.

## 1. Технический и визуальный аудит
### Проверено
- Статические проверки: `node --check src/data.js`, `node --check src/app.js`, `node scripts/static-check.mjs`.
- Сборка: `node scripts/build-static.mjs`.
- UI smoke на ширинах: 375, 390, 768, 1024, 1440, 1920 с Python Playwright.
- Расширенный Python-browser audit на 320, 375, 390, 768, 1024, 1440, 1920 с проверками кнопок/ссылок/изображений/а11y-метрик.
- Проверены метрики на каждом брейкпоинте:
  - переполнение по горизонтали (`overflow`/`scrollWidth`),
  - количество заголовков,
  - состояние деталей схемы,
  - состояние активных этапов/модулей,
  - переключение вкладок в интерактивных блоках,
  - скриншоты `top/mid/bot` в `/tmp/codex-audit/tazy/`.

### Найдено
- Блокеров не обнаружено.
- Нестабильных падений в консоли инициализации/рендера не зафиксировано.
- Критичных визуальных утечек за контейнеры на проверенных ширинах не обнаружено.

### Исправлено
- Оптимизация загрузки крупных изображений:
  - `index.html`: первая карта завода переведена на `loading="eager"`, добавлены `decoding="async"`, `fetchpriority="high"`.
  - `index.html`: вторичный план инженерии — `decoding="async"`.
  - `src/app.js`: изображения в динамической схеме и расширенном блоке получили `decoding="async"`.
- После изменений повторный audit показал 0 ошибок, 0 переполнений и 0 случаев обрезки текста по критериям проверки.
- UX-улучшение навигации на узких разрешениях:
  - `styles.css`: у `.side-nav__link` добавлен безопасный `text-overflow: ellipsis`, `min-width: 0` и ограничение ширины в media-query (<=1040px), чтобы длинные подписи не раздували ячейку.
  - `styles.css`: увеличен `scroll-margin-top` секций до `86px` для стабильного якорного скролла под sticky-панель.
- Таблица оборудования сделана адаптивной:
  - `styles.css`: `.equipment-table` переведена на `table-layout: fixed` и `min-width: 0`;
  - `th/td` получили переносные значения (`overflow-wrap: anywhere`, `word-break: break-word`), что убрало флаговые horizontal-overflow даже на 320px.
- Аудиторская правка семантики и полноты данных:
  - `index.html`: заголовок в блоке быстрых действий переведён из `<h3>` в нейтральный текстовый элемент (`.quick-panel__title`), чтобы сохранить корректный иерархический порядок заголовков (ровно один `<h1>` на странице).
  - `src/app.js`: убрано искусственное ограничение `slice(0, 14)` для `chainModules`, теперь в блоке цепочки отображаются все модули этапа (`21` для full stage), без потери данных в интерфейсе.

### Известные ограничения
- В окружении отсутствует npm (поэтому `@axe-core/playwright` и Lighthouse не запускались здесь), поэтому полноценный Axe/Lighthouse проход в этом стенде не выполнен.
- Включены только проверки домена проекта и его внутренней структуры; интеграция c внешним API/бекендом пока не затрагивалась (по требованию проекта: это cockpit-модель).

## 2. Мобильная адаптация
### Проверено
- Проверка на 375/390/768/1024/1440/1920 пикселей.
- Отдельные скриншоты для каждого брейкпоинта в `/tmp/codex-audit/tazy/`.

### Результат
- Значимые элементы не вылезают за границы контейнеров.
- Рекомендуемая сетка (двух/четырёхколоночных секций) в текущих брейкпоинтах выдержана.
- Дополнительно для обновлённого прохода проверены размеры chain-chip-блоков на 320–1920px: переполнения по ширине не обнаружены.

## 3. Структура и корректность данных
### Проверено
- Чтение и валидность `src/data.js` через `static-check.mjs`.
- Проверка наличия данных в ключевых секциях (массивы и словари): `navigation, audiences, stageTabs, modules, engineeringSystems, documents, criticalPath, thesis, dealBreakers, markets, products, qualityTrace, financePresets, fundingStack`.

### Результат
- Ни в одном из проверенных массивов не обнаружено «пустых» записей.

## 4. Готовность к деплою
### Проверено
- Сборка `dist/tazy-pro-navigator` проходит.
- Ресурсы сборки включают `assets`, `fonts`, `src`, `index.html`, стили и манифест.

### Итог
- Репозиторий остаётся в рабочем состоянии; изменения минимальны и обратимы.
- Рекомендую один обязательный следующий шаг после вашего разрешения: запуск полного production-аудита в CI/сервере с Lighthouse + Axe (после доступности npm-цепочки).

## 5. Визуальные ассеты и image pack
### Проверено
- Рабочая страница и OG-метаданные переведены с `assets/drafts/` на новый пакет изображений в `assets/generated/`.
- Повторно пройдены локальные проверки:
  - `node --check src/app.js`
  - `node --check src/data.js`
  - `node scripts/static-check.mjs`
  - `node scripts/build-static.mjs`
- Отдельно проверено в in-app browser:
  - `http://127.0.0.1:4181/` открывается без console errors/warnings;
  - на странице ровно один `<h1>`;
  - `og:image` указывает на `assets/generated/overview-og.jpg`;
  - производственные и инженерные блоки используют только новые изображения.

### Исправлено
- `index.html`:
  - `og:image` переведён на `assets/generated/overview-og.jpg`;
  - блоки `Завод` и `Инженерия` переведены на `factory-cutaway.webp` и `engineering-plan.webp` из `assets/generated/`.
- `src/app.js`:
  - референс цепочки переведён на `assets/generated/production-chain.webp`.
- `scripts/static-check.mjs`:
  - обновлён список обязательных ассетов под новый production-набор, чтобы проверка отражала реальную страницу, а не исторические черновики.
- `README.md`, `docs/deploy-readiness.md`, `docs/product-brief.md`:
  - документация синхронизирована с новым статусом изображений: `assets/generated/` — рабочий набор, `assets/drafts/` — архив ранних референсов.

### Известные ограничения
- Текущий пакет закрывает ключевые визуальные поверхности сайта, но не является финальной бренд-библиотекой. Для следующего прохода остаётся отдельный image pack под investor deck, PDF-экспорт и реальные документы data room.

## 6. Второй image pack и мобильная навигация
### Проверено
- Сгенерирован второй пакет изображений через `gpt image 2` для секций:
  - рынки и экспортные маршруты;
  - продуктовая архитектура;
  - QR-паспорт партии и quality/digital;
  - защищённая document room.
- PNG-исходники конвертированы в WebP через Pillow: новые WebP-файлы весят примерно 84–136 КБ вместо 1.7–2.2 МБ PNG.
- Release-pass на `390 / 1024 / 1440`:
  - console/page errors: 0;
  - horizontal overflow: 0;
  - `<h1>`: 1;
  - `.section-visual`: 4;
  - рабочих WebP-изображений на странице: 7.
- Скриншоты сохранены в `/tmp/codex-audit/tazy-second-pack-release/`.

### Исправлено
- `index.html`: добавлены визуальные панели для `markets`, `products`, `quality`, `documents`.
- `styles.css`: добавлен единый `.section-visual` с desktop/mobile-поведением; на мобильном подпись уходит под картинку и не перекрывает важные детали.
- `styles.css`: мобильная навигация на `<=720px` переведена из высокой двухколоночной сетки в компактный горизонтальный rail.
- `src/app.js`: scroll-spy заменён на детерминированный расчёт по позиции секций; активный пункт навигации теперь корректен для длинных нижних разделов.
- `scripts/static-check.mjs`: обязательные ассеты обновлены под WebP-набор и оптимизированный OG JPEG.

### Известные ограничения
- Блокирующих визуальных ограничений по проверенным брейкпоинтам не осталось. Следующий качественный слой — не исправление поломки, а продуктовая работа: реальные документы data room, отдельная PDF/инвесторская презентация и закрытый доступ.

## 7. Продовый проход 2026-06-13
### Проверено
- Локальные проверки:
  - `./scripts/check.sh`;
  - `node scripts/build-static.mjs`;
  - `node scripts/browser-smoke.mjs` на `375, 390, 768, 1024, 1440, 1920`.
- Live-проверка:
  - `./scripts/verify-live.sh` против `https://tazy.pro/`;
  - HTTP/2 200;
  - CSP согласован с qdev public analytics suite;
  - live HTML использует свежий release token `20260613-nav2`.
- Быстрый DOM/a11y sanity-check:
  - ровно один `<h1>`;
  - нет пропущенной иерархии заголовков;
  - нет unnamed buttons/links;
  - у всех изображений есть `alt`;
  - duplicate `id` не обнаружены.

### Найдено
- На tablet-ширинах `768/1024px` верхняя навигация визуально уходила вправо как горизонтальная лента. Страница не получала общий horizontal overflow, но часть пунктов была за пределами текущего viewport.
- На мобильной ширине `375px` compact stage-tabs в блоке «Карта стоимости» могли визуально обрезать подпись «Полный цикл».
- Cache-busting token оставался `20260612-sections3` после новых CSS/JS-изменений.

### Исправлено
- `styles.css`:
  - навигация на `<=1040px` переведена с горизонтального scroll-rail на переносимые компактные chips;
  - compact segmented controls на `<=720px` теперь переносятся и не клипают длинные подписи.
- `scripts/browser-smoke.mjs`:
  - добавлена проверка `offscreenNavLinks === 0`, чтобы ловить пункты навигации, которые уходят за viewport без общего page overflow.
- `scripts/check.sh`:
  - современный `tidy` теперь делает HTML validation строгой: найденные ошибки валят check.
- `index.html`, `src/app.js`, `scripts/static-check.mjs`:
  - release token обновлён до `20260613-nav2`.

### Production state
- GitHub `main`: `abdf50a chore(release): refresh navigator asset token`.
- Последний UI-fix: `c6c8609 fix(ui): prevent tablet navigation clipping`.
- VPS release после деплоя: `/var/www/tazy.pro/releases/20260613T021057Z`.
- `verify-live: ok https://tazy.pro/`.

## 8. Open Graph и вес production bundle
### Проверено
- Состав `dist/tazy-pro-navigator/assets/generated`.
- Размеры и габариты OG-изображения.
- Наличие `og:image`, `og:image:width`, `og:image:height`, `og:image:type`, `twitter:card` и `twitter:image`.

### Найдено
- В production bundle попадал `overview-hero.png` размером около 2.0 МБ только ради Open Graph. Видимая страница использует WebP, поэтому PNG был избыточен для live release.

### Исправлено
- Добавлен отдельный `assets/generated/overview-og.jpg`:
  - размер: 1200×675;
  - вес: около 192 КБ;
  - формат: progressive JPEG.
- `index.html`:
  - Open Graph и Twitter/X preview переведены на `overview-og.jpg`;
  - добавлены явные размеры и MIME type.
- `scripts/build-static.mjs`:
  - production whitelist больше не копирует тяжёлый `overview-hero.png`;
  - в release попадает только `overview-og.jpg` плюс WebP-ассеты страницы.
- `scripts/static-check.mjs`:
  - проверяет наличие оптимизированного OG-изображения и обязательных social meta.

### Результат
- Production image payload уменьшен примерно на 1.8 МБ без изменения видимого интерфейса.
