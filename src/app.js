import {
  audiences,
  batch,
  careLoop,
  coreKpis,
  documents,
  engineeringSystems,
  financeDefaults,
  gates,
  markets,
  modules,
  navigation,
  products,
  qualityTrace,
  stageTabs
} from './data.js';

const state = {
  audience: 'investor',
  stage: 'full',
  module: 'M8',
  system: 'P1',
  finance: { ...financeDefaults }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const fmt = new Intl.NumberFormat('ru-RU');

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatMoney(value) {
  return `${fmt.format(Math.round(value))} млн ₸`;
}

function icon(name) {
  const icons = {
    home: '<path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8.5Z"/>',
    factory: '<path d="M3 21V9l5 3V9l5 3V7h8v14H3Z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
    system: '<path d="M12 3v4M12 17v4M4.2 7.5l3.4 2M16.4 14l3.4 2M19.8 7.5l-3.4 2M7.6 14l-3.4 2"/><circle cx="12" cy="12" r="4"/>',
    finance: '<path d="M4 19V5h16v14H4Z"/><path d="M8 15v-3M12 15V8M16 15v-5"/>',
    document: '<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    quality: '<path d="M12 3 5 6v5c0 4.3 2.8 7.8 7 10 4.2-2.2 7-5.7 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
    market: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    product: '<path d="M8 4h8l2 17H6L8 4Z"/><path d="M9 8h6M10 13h4"/>',
    care: '<path d="M5 20c8-1 12-6 14-16-8 1-13 5-14 16Z"/><path d="M5 20c3-5 7-8 12-10"/>',
    gate: '<path d="M5 21V5h14v16"/><path d="M9 21v-8h6v8M8 8h8"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] ?? icons.document}</svg>`;
}

function activeAudience() {
  return audiences.find((item) => item.id === state.audience) ?? audiences[0];
}

function activeStage() {
  return stageTabs.find((item) => item.id === state.stage) ?? stageTabs[0];
}

function getModule(id = state.module) {
  return modules.find((item) => item.id === id) ?? modules[0];
}

function getSystem(id = state.system) {
  return engineeringSystems.find((item) => item.id === id) ?? engineeringSystems[0];
}

function renderNavigation() {
  $('#sideNav').innerHTML = navigation.map(([id, number, label]) => `
    <a class="side-nav__link" href="#${id}" data-nav-link="${id}">
      <span class="side-nav__number">${number}</span>
      <span>${escapeHtml(label)}</span>
    </a>
  `).join('');
}

function renderAudienceControls() {
  $('#audienceControls').innerHTML = audiences.map((item) => `
    <button
      class="segment ${state.audience === item.id ? 'is-active' : ''}"
      type="button"
      role="tab"
      aria-selected="${state.audience === item.id}"
      data-audience="${item.id}"
    >
      ${escapeHtml(item.label)}
    </button>
  `).join('');

  $('#audienceSummary').textContent = activeAudience().focus;
}

function renderStageControls() {
  $('#stageControls').innerHTML = stageTabs.map((item) => `
    <button
      class="segment ${state.stage === item.id ? 'is-active' : ''}"
      type="button"
      role="tab"
      aria-selected="${state.stage === item.id}"
      data-stage="${item.id}"
    >
      ${escapeHtml(item.label)}
    </button>
  `).join('');
}

function renderHeroMetrics() {
  const audience = activeAudience();
  $('#heroMetrics').innerHTML = [
    ['Фокус', audience.primaryMetric],
    ['Первый транш', '60–70 млн ₸'],
    ['Базовый CAPEX', '≈162 млн ₸'],
    ['Режим', audience.label]
  ].map(([label, value]) => `
    <div class="hero-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join('');
}

function renderKpis() {
  const cards = coreKpis.map((item) => `
    <article class="kpi-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)} <small>${escapeHtml(item.unit)}</small></strong>
      <p>${escapeHtml(item.note)}</p>
    </article>
  `).join('');

  $('#kpiCards').innerHTML = cards;
}

function renderChain() {
  const stage = activeStage();
  const moduleSet = new Set(stage.modules);
  const chainModules = modules.filter((item) => moduleSet.has(item.id));

  $('#chainMap').dataset.stage = stage.color;
  $('#chainMap').innerHTML = `
    <div class="chain-map__summary">
      <strong>${escapeHtml(stage.title)}</strong>
      <p>${escapeHtml(stage.summary)}</p>
    </div>
    <figure class="hero-factory-preview">
      <img src="./assets/drafts/factory-cutaway.png" alt="Изометрический cutaway-макет завода TAZY.PRO с сырьевой зоной, рендерингом, линией лакомств, кормовой линией и экологическим контуром.">
      <figcaption>Главная производственная модель: клик по модулю ниже открывает инженерную карточку.</figcaption>
    </figure>
    <div class="chain-chip-grid" aria-label="Модули выбранного этапа">
      ${chainModules.slice(0, 14).map((item) => `
        <button class="chain-chip" type="button" data-module="${item.id}">
          <span>${escapeHtml(item.id)}</span>
          <strong>${escapeHtml(item.name)}</strong>
        </button>
      `).join('')}
    </div>
    <details class="reference-toggle">
      <summary>Полная технологическая схема</summary>
      <img src="./assets/drafts/production-chain.png" alt="Полная производственная цепочка TAZY.PRO от сырья до готового корма и экспортной доставки.">
    </details>
  `;
}

function renderModuleHotspots() {
  const stage = activeStage();
  const moduleSet = new Set(stage.modules);

  $('#moduleHotspots').innerHTML = modules.map((item) => {
    const isAvailable = moduleSet.has(item.id);
    const isActive = state.module === item.id;
    const disabled = isAvailable ? '' : ' aria-disabled="true"';
    return `
      <button
        class="hotspot ${isActive ? 'is-active' : ''} ${isAvailable ? '' : 'is-muted'}"
        type="button"
        style="left:${item.position[0]}%; top:${item.position[1]}%;"
        data-module="${item.id}"
        ${disabled}
      >
        ${escapeHtml(item.id)}
      </button>
    `;
  }).join('');
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderModuleDetail() {
  const item = getModule();
  $('#moduleDetail').innerHTML = `
    <div class="detail-panel__eyebrow">${escapeHtml(item.stage)} · ${escapeHtml(item.zone)}</div>
    <h3>${escapeHtml(item.id)} — ${escapeHtml(item.name)}</h3>
    <p>${escapeHtml(item.purpose)}</p>
    <div class="detail-columns">
      <div>
        <h4>Оборудование</h4>
        ${list(item.equipment)}
      </div>
      <div>
        <h4>Коммуникации</h4>
        ${list(item.utilities)}
      </div>
      <div>
        <h4>Риски</h4>
        ${list(item.risks)}
      </div>
      <div>
        <h4>Контроль</h4>
        ${list(item.controls)}
      </div>
    </div>
  `;
}

function renderSystemList() {
  $('#systemList').innerHTML = engineeringSystems.map((item) => `
    <button
      class="system-pill ${state.system === item.id ? 'is-active' : ''}"
      type="button"
      data-system="${item.id}"
    >
      <span>${escapeHtml(item.id)}</span>
      <strong>${escapeHtml(item.name)}</strong>
    </button>
  `).join('');
}

function renderSystemDetail() {
  const item = getSystem();
  $('#systemDetail').innerHTML = `
    <div class="detail-panel__eyebrow">${escapeHtml(item.group)} · ${escapeHtml(item.priority)}</div>
    <h3>${escapeHtml(item.id)} — ${escapeHtml(item.name)}</h3>
    <p>${escapeHtml(item.detail)}</p>
  `;
}

function renderEquipmentTable() {
  const rows = modules
    .filter((item) => !['Поддержка', 'Инженерия / ESG'].includes(item.stage))
    .map((item) => `
      <tr>
        <th scope="row">${escapeHtml(item.id)}</th>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.stage)}</td>
        <td>${escapeHtml(item.equipment.slice(0, 4).join(', '))}</td>
        <td>${escapeHtml(item.utilities.join(', '))}</td>
      </tr>
    `).join('');

  $('#equipmentTable').innerHTML = `
    <thead>
      <tr>
        <th>Модуль</th>
        <th>Назначение</th>
        <th>Этап</th>
        <th>Ключевое оборудование</th>
        <th>Коммуникации</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
}

function calculateFinance() {
  const f = state.finance;
  const scale = f.carcasses / financeDefaults.carcasses;
  const treatsFactor = f.treatsPrice / financeDefaults.treatsPrice;
  const feedFactor = f.feedPrice / financeDefaults.feedPrice;
  const priceFactor = treatsFactor * 0.34 + feedFactor * 0.66;
  const rawPenalty = (100 - f.freeRaw) * 0.31 * scale;
  const fxFactor = 1 + Math.max(-0.15, Math.min(0.2, (f.fx - financeDefaults.fx) / financeDefaults.fx * 0.45));
  const capex = f.capex * fxFactor;
  const revenue = 321 * scale * priceFactor;
  const ebitda = Math.max(12, 79 * scale * priceFactor - rawPenalty);
  const payback = capex / ebitda;
  const debtPressure = f.loanRate > 16 ? (f.loanRate - 16) * 0.025 : 0;
  const dscr = Math.max(0.8, 1.72 - debtPressure - Math.max(0, f.stage3Month - 14) * 0.025 + (f.vendorDelay * 0.02));
  const liquidityNeed = 129 + Math.max(0, f.stage3Month - 14) * 2.4 - f.vendorDelay * 1.6 + (100 - f.freeRaw) * 0.22;

  return {
    capex,
    revenue,
    ebitda,
    payback,
    dscr,
    liquidityNeed
  };
}

function renderSimulator() {
  const controls = [
    ['carcasses', 'Туш в сутки', 8, 48, 1, 'шт.'],
    ['freeRaw', 'Доля бесплатного сырья', 0, 100, 5, '%'],
    ['treatsPrice', 'Цена лакомств', 4500, 14000, 250, '₸/кг'],
    ['feedPrice', 'Цена сухого корма', 900, 3600, 50, '₸/кг'],
    ['capex', 'CAPEX по этапам', 130, 230, 1, 'млн ₸'],
    ['loanRate', 'Ставка кредита', 8, 28, 0.5, '%'],
    ['vendorDelay', 'Отсрочка поставщика', 0, 8, 1, 'мес.'],
    ['stage3Month', 'Запуск Stage 3', 8, 24, 1, 'мес.'],
    ['fx', 'Курс валюты для оборудования', 440, 650, 5, '₸/$'],
    ['b2cShare', 'Доля B2C', 10, 80, 5, '%']
  ];

  $('#simulator').innerHTML = controls.map(([key, label, min, max, step, unit]) => `
    <label class="range-field">
      <span>
        <strong>${escapeHtml(label)}</strong>
        <output for="${key}" id="${key}Output">${fmt.format(state.finance[key])} ${escapeHtml(unit)}</output>
      </span>
      <input
        id="${key}"
        name="${key}"
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${state.finance[key]}"
      >
    </label>
  `).join('');
}

function sparkline(values, type = 'line') {
  const width = 560;
  const height = 180;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = 26 + index * ((width - 52) / (values.length - 1));
    const y = height - 28 - ((value - min) / range) * (height - 62);
    return [x, y, value];
  });

  if (type === 'bar') {
    const barWidth = Math.max(22, (width - 70) / values.length - 10);
    const zeroY = height - 28 - ((0 - min) / range) * (height - 62);
    return `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Столбчатый график cash flow">
        <line x1="24" y1="${zeroY}" x2="${width - 24}" y2="${zeroY}" />
        ${points.map(([x, y, value]) => `
          <rect x="${x - barWidth / 2}" y="${Math.min(y, zeroY)}" width="${barWidth}" height="${Math.abs(zeroY - y)}" rx="5" class="${value < 0 ? 'is-negative' : ''}"></rect>
        `).join('')}
      </svg>
    `;
  }

  const path = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Линейный график выручки и EBITDA">
      <path d="${path}" />
      ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4"></circle>`).join('')}
    </svg>
  `;
}

function renderFinanceOutput() {
  const result = calculateFinance();
  const years = [0.18, 0.46, 0.74, 1, 1.12].map((factor) => Math.round(result.revenue * factor));
  const cashflow = [-result.capex * 0.18, -result.liquidityNeed * 0.28, result.ebitda * 0.18, result.ebitda * 0.52, result.ebitda * 0.9, result.ebitda * 1.08];

  $('#scenarioCards').innerHTML = [
    ['CAPEX', formatMoney(result.capex), 'с учётом валютной чувствительности'],
    ['Выручка год 3', formatMoney(result.revenue), 'управленческая модель'],
    ['EBITDA', formatMoney(result.ebitda), 'при текущих параметрах'],
    ['Payback', `${result.payback.toFixed(1).replace('.', ',')} года`, `DSCR ${result.dscr.toFixed(2).replace('.', ',')}`]
  ].map(([label, value, note]) => `
    <article class="scenario-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <p>${escapeHtml(note)}</p>
    </article>
  `).join('');

  $('#revenueChart').innerHTML = `
    <div class="chart-card__head">
      <h3>Выручка по годам</h3>
      <span>Y1–Y5</span>
    </div>
    ${sparkline(years)}
    <div class="chart-legend">${years.map((value, index) => `<span>Y${index + 1}: ${formatMoney(value)}</span>`).join('')}</div>
  `;

  $('#cashflowChart').innerHTML = `
    <div class="chart-card__head">
      <h3>Cash flow 18–24 мес.</h3>
      <span>демо</span>
    </div>
    ${sparkline(cashflow, 'bar')}
    <div class="chart-legend">${cashflow.map((value, index) => `<span>M${(index + 1) * 4}: ${formatMoney(value)}</span>`).join('')}</div>
  `;
}

function updateFinanceOutputs() {
  Object.entries(state.finance).forEach(([key, value]) => {
    const output = $(`#${key}Output`);
    const input = $(`#${key}`);
    if (output && input) {
      const unit = output.textContent.split(' ').slice(1).join(' ');
      output.textContent = `${fmt.format(value)} ${unit}`;
      input.value = value;
    }
  });
  renderFinanceOutput();
}

function renderMarkets() {
  $('#marketGrid').innerHTML = markets.map((item) => `
    <article class="market-card">
      ${icon('market')}
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.emphasis)}</p>
      <dl>
        <div><dt>Горизонт</dt><dd>${escapeHtml(item.horizon)}</dd></div>
        <div><dt>Каналы</dt><dd>${escapeHtml(item.channels.join(', '))}</dd></div>
      </dl>
    </article>
  `).join('');
}

function renderProducts() {
  $('#productGrid').innerHTML = products.map((item) => `
    <article class="product-card">
      ${icon('product')}
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <dl>
        <div><dt>Роль</dt><dd>${escapeHtml(item.role)}</dd></div>
        <div><dt>Этап</dt><dd>${escapeHtml(item.stage)}</dd></div>
        <div><dt>Маржа</dt><dd>${escapeHtml(item.margin)}</dd></div>
      </dl>
    </article>
  `).join('');
}

function renderQuality() {
  $('#batchPassport').innerHTML = `
    <div class="passport-head">
      <div>
        <span>Партия</span>
        <strong>${escapeHtml(batch.id)}</strong>
      </div>
      <div class="qr-mark" aria-label="Демо QR-паспорта партии"></div>
    </div>
    <dl class="passport-list">
      <div><dt>Продукт</dt><dd>${escapeHtml(batch.product)}</dd></div>
      <div><dt>Сырьё</dt><dd>${escapeHtml(batch.source)}</dd></div>
      <div><dt>Kill-step</dt><dd>${escapeHtml(batch.killStep)}</dd></div>
      <div><dt>Aw</dt><dd>${escapeHtml(batch.aw)}</dd></div>
      <div><dt>Лаборатория</dt><dd>${escapeHtml(batch.lab)}</dd></div>
      <div><dt>Вес партии</dt><dd>${escapeHtml(batch.weight)}</dd></div>
    </dl>
  `;

  $('#traceList').innerHTML = qualityTrace.map((item, index) => `
    <article class="trace-item">
      <span>${fmt.format(index + 1)}</span>
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.evidence)}</p>
      </div>
    </article>
  `).join('');
}

function renderCare() {
  $('#careFlow').innerHTML = careLoop.map(([title, description], index) => `
    <article class="care-node">
      ${icon(index === 0 ? 'factory' : index === 4 ? 'care' : 'system')}
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </article>
  `).join('');
}

function renderGates() {
  $('#gateList').innerHTML = gates.map((item) => `
    <article class="gate-card" data-priority="${item.status}">
      ${icon('gate')}
      <div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.note)}</p>
      </div>
      <span>${escapeHtml(item.status)}</span>
    </article>
  `).join('');
}

function renderDocuments() {
  $('#documentRoom').innerHTML = documents.map((item) => `
    <article class="document-card">
      <div class="document-card__head">
        ${icon('document')}
        <h3>${escapeHtml(item.folder)}</h3>
        <span>${fmt.format(item.count)}</span>
      </div>
      <p>${escapeHtml(item.items.join(' · '))}</p>
    </article>
  `).join('');
}

function renderStaticSections() {
  renderNavigation();
  renderAudienceControls();
  renderStageControls();
  renderHeroMetrics();
  renderKpis();
  renderChain();
  renderModuleHotspots();
  renderModuleDetail();
  renderSystemList();
  renderSystemDetail();
  renderEquipmentTable();
  renderSimulator();
  renderFinanceOutput();
  renderMarkets();
  renderProducts();
  renderQuality();
  renderCare();
  renderGates();
  renderDocuments();
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const scrollButton = event.target.closest('[data-scroll-target]');
    if (scrollButton) {
      $(`#${scrollButton.dataset.scrollTarget}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const audienceButton = event.target.closest('[data-audience]');
    if (audienceButton) {
      state.audience = audienceButton.dataset.audience;
      renderAudienceControls();
      renderHeroMetrics();
    }

    const stageButton = event.target.closest('[data-stage]');
    if (stageButton) {
      state.stage = stageButton.dataset.stage;
      renderStageControls();
      renderChain();
      renderModuleHotspots();
    }

    const moduleButton = event.target.closest('[data-module]');
    if (moduleButton) {
      state.module = moduleButton.dataset.module;
      renderModuleHotspots();
      renderModuleDetail();
    }

    const systemButton = event.target.closest('[data-system]');
    if (systemButton) {
      state.system = systemButton.dataset.system;
      renderSystemList();
      renderSystemDetail();
    }
  });

  $('#simulator').addEventListener('input', (event) => {
    if (event.target.matches('input[type="range"]')) {
      state.finance[event.target.name] = Number(event.target.value);
      updateFinanceOutputs();
    }
  });

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      $$('[data-nav-link]').forEach((link) => {
        link.classList.toggle('is-active', link.dataset.navLink === visible.target.id);
      });
    }
  }, { rootMargin: '-20% 0px -60% 0px', threshold: [0.1, 0.35, 0.6] });

  navigation.forEach(([id]) => {
    const section = $(`#${id}`);
    if (section) observer.observe(section);
  });
}

function boot() {
  renderStaticSections();
  bindEvents();
}

boot();
