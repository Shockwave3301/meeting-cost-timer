(() => {
  'use strict';

  /* ==========================================================
     Config & comedy material
     ========================================================== */

  const LOCALE = 'ru-RU';

  const KEYS = {
    roster: 'mct.roster',
    meetings: 'mct.meetings',
    draft: 'mct.draft',
    active: 'mct.active',
    settings: 'mct.settings',
  };

  // 40 hours × 52 weeks. Nobody actually works exactly this, which is the point.
  const HOURS_PER = { year: 2080, month: 2080 / 12, hour: 1 };
  const UNIT_LABEL = { year: '/год', month: '/мес', hour: '/час' };
  const AVATAR_COLORS = ['#ff5ca8', '#ffd93d', '#b8f04a', '#4fd8ff', '#ff8c42', '#9b7bff'];
  const RAIN = ['💸', '💵', '💰', '🪙', '🔥', '💸', '💶', '💷'];

  // Employer's insurance contributions on top of gross salary (RU general rate): 30% + 0.2% injury insurance.
  // Personal income tax (НДФЛ) is already inside the gross salary, so it is not added again.
  const DEFAULT_TAX_RATE = 30.2;

  // Rough units of each currency per 1 USD. Only used to scale the jokes
  // (milestones, price comparisons, verdicts), never the actual meeting cost.
  const PER_USD = { RUB: 90, USD: 1, EUR: 0.9, KZT: 500, BYN: 3.2, CNY: 7.2, GBP: 0.78, CHF: 0.88, JPY: 150 };
  const fromRub = (rub) => (rub / PER_USD.RUB) * (PER_USD[state.settings.currency] ?? 1);

  const QUIPS = [
    'Ждём, пока кто-нибудь включит микрофон…',
    '«Вам видно мой экран?»',
    '«Давайте обсудим это отдельно». (Спойлер: не обсудят.)',
    '«Я тут дополню коллегу…»',
    'Возвращаемся к вопросу, к которому уже возвращались.',
    '«Извините, говорите». — «Нет, вы говорите». — «Нет, вы…»',
    'Кто-то прямо сейчас отвечает на почту. Точно.',
    '«Давайте это запаркуем». 📌',
    'Синергия деливерблов в процессе…',
    '«Быстрый вопрос» — не быстрый и не вопрос.',
    'Синхронизируемся по поводу синхронизации.',
    '«Я коротко». — знаменитые последние слова',
    'К созвону подключилась чья-то собака. 🐕',
    '«Как я уже писал в письме…»',
    'Планируем встречу, чтобы обсудить эту встречу.',
    '«У вас микрофон выключен».',
    '«Меня слышно?»',
    'Кто-то только что сказал «зафоллоуапить» без тени иронии.',
    'Один говорит. Девять сидят на мьюте и страдают.',
    '«Давайте подождём ещё пять минут, пока все подключатся».',
    'Где-то плачет письмо, на которое ушло бы две минуты.',
    '«Мы уже по времени, но ещё буквально одно…»',
    '«Давайте сделаем ресёрч и вернёмся с фидбеком».',
    '«Коллеги, давайте не растекаться по древу».',
    '«Кто ведёт протокол?» Тишина.',
    '«Пошарь экран». — «Какой из?»',
    'Обсуждаем, кто будет ответственным за ответственность.',
    'Мог быть письмом. Письмо могло быть сообщением в чатике. Сообщения могло не быть.',
  ];

  const PAUSE_QUIPS = [
    '⏸ Пауза. Зарплаты, увы, на паузу не ставятся.',
    '⏸ Перерыв. Все уткнулись в телефоны.',
    '⏸ «Давайте пять минут». Будет пятнадцать.',
  ];

  // [threshold in ₽, message] — converted to the chosen currency at runtime.
  const MILESTONES = [
    [500, 'Минус кофе для всего отдела. ☕'],
    [2000, 'Это был бизнес-ланч на четверых. Просто к сведению. 🍱'],
    [5000, 'Достижение разблокировано: «Можно было письмом» 📧'],
    [15000, 'Чья-то квартальная премия нервно вздрогнула.'],
    [50000, 'Бухгалтерия уже в курсе. 🚨'],
    [100000, 'Финдиректор почувствовал возмущение в Силе.'],
    [250000, 'Этот созвон уже обошёлся дороже стажёра. 🧑‍🎓'],
    [900000, 'Поздравляем, вы профинансировали подержанный «Солярис». 🚗'],
    [2000000, 'Пожалуйста. Остановитесь. 🙏'],
    [4000000, 'Это уже не созвон. Это образ жизни.'],
    [8000000, 'На эти деньги можно было взять однушку в Подмосковье. 🏚️'],
  ];

  // Prices in ₽, ascending. Forms: [one, few, many, fraction] — fraction defaults to `few`.
  const THINGS = [
    { emoji: '🌻', price: 80, forms: ['пачка семечек', 'пачки семечек', 'пачек семечек'] },
    { emoji: '☕', price: 350, forms: ['раф на кокосовом', 'рафа на кокосовом', 'рафов на кокосовом'] },
    { emoji: '🌯', price: 400, forms: ['шаурма', 'шаурмы', 'шаурм'] },
    { emoji: '🍱', price: 650, forms: ['бизнес-ланч', 'бизнес-ланча', 'бизнес-ланчей'] },
    { emoji: '🍕', price: 1000, forms: ['пицца', 'пиццы', 'пицц'] },
    { emoji: '🚕', price: 3000, forms: ['поездка в аэропорт на такси', 'поездки в аэропорт на такси', 'поездок в аэропорт на такси'] },
    { emoji: '🪑', price: 45000, forms: ['эргономичное кресло', 'эргономичных кресла', 'эргономичных кресел', 'эргономичного кресла'] },
    { emoji: '🏖️', price: 150000, forms: ['путёвка в Турцию', 'путёвки в Турцию', 'путёвок в Турцию'] },
    { emoji: '🚗', price: 900000, forms: ['подержанный «Солярис»', 'подержанных «Соляриса»', 'подержанных «Солярисов»', 'подержанного «Соляриса»'] },
    { emoji: '🏠', price: 8000000, forms: ['однушка в Подмосковье', 'однушки в Подмосковье', 'однушек в Подмосковье'] },
  ];

  const WORDS = {
    meeting: ['встреча', 'встречи', 'встреч'],
    victim: ['жертва', 'жертвы', 'жертв'],
    human: ['человек', 'человека', 'человек'],
    crime: ['преступление', 'преступления', 'преступлений'],
  };

  // Adjective + masculine noun + tail, e.g. «Срочный синк про синергию».
  const TITLE_A = ['Быстрый', 'Срочный', 'Обязательный', 'Необязательный (но приходите)', 'Еженедельный', 'Экстренный', 'Регулярный', 'Кросс-функциональный', 'Стратегический', 'Короткий (на час)', 'Внеплановый', 'Финальный (ещё не финальный)'];
  const TITLE_B = ['созвон', 'синк', 'брейншторм', 'дейлик', 'статус', 'разбор полётов', 'митинг', 'стендап (сидя)', 'кикофф', 'чек-ин', 'груминг', 'воркшоп'];
  const TITLE_C = ['по поводу другого созвона', 'про синергию', 'по итогам квартала', 'перед настоящей встречей', 'про корпоратив', 'который мог быть письмом', '(с камерами 📸)', 'без повестки', 'часть 7', 'про усталость от созвонов', 'про шрифт на третьем слайде', 'о следующих шагах по следующим шагам'];

  /* ==========================================================
     Storage
     ========================================================== */

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        if (value == null) localStorage.removeItem(key);
        else localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked — the meeting goes on regardless */
      }
    },
  };

  const asArray = (v) => (Array.isArray(v) ? v : []);
  const isRate = (v) => Number.isFinite(v) && v >= 0 && v <= 100;
  const isPerson = (p) => p && typeof p.name === 'string' && Number.isFinite(p.salary) && p.unit in HOURS_PER;

  const savedDraft = store.get(KEYS.draft, {}) || {};
  const savedActive = store.get(KEYS.active, null);

  const state = {
    roster: asArray(store.get(KEYS.roster, [])).filter(isPerson),
    meetings: asArray(store.get(KEYS.meetings, [])).filter((m) => m && Number.isFinite(m.startedAt) && Number.isFinite(m.cost)),
    draft: {
      title: typeof savedDraft.title === 'string' ? savedDraft.title : '',
      people: asArray(savedDraft.people).filter(isPerson),
    },
    active: savedActive && Array.isArray(savedActive.people) && savedActive.people.length ? savedActive : null,
    settings: { currency: 'RUB', group: 'day', metric: 'money', taxRate: DEFAULT_TAX_RATE, ...(store.get(KEYS.settings, {}) || {}) },
  };
  if (!isRate(state.settings.taxRate)) state.settings.taxRate = DEFAULT_TAX_RATE;
  if (!['money', 'tax', 'time'].includes(state.settings.metric)) state.settings.metric = 'money';

  const save = {
    roster: () => store.set(KEYS.roster, state.roster),
    meetings: () => store.set(KEYS.meetings, state.meetings),
    draft: () => store.set(KEYS.draft, state.draft),
    active: () => store.set(KEYS.active, state.active),
    settings: () => store.set(KEYS.settings, state.settings),
  };

  /* ==========================================================
     Helpers
     ========================================================== */

  const $ = (id) => document.getElementById(id);
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const norm = (name) => name.trim().toLowerCase();
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const PAGE_TITLE = document.title;

  const hourlyOf = (p) => (Number.isFinite(p.hourly) ? p.hourly : p.salary / HOURS_PER[p.unit]);
  const burnPerHour = (people) => people.reduce((sum, p) => sum + hourlyOf(p), 0);
  const costFor = (people, ms) => (burnPerHour(people) * ms) / 3.6e6;
  const personHours = (m) => (m.durationMs * m.people.length) / 3.6e6;
  // Meetings remember the rate they were held at; older ones fall back to the current setting.
  const rateOf = (m) => (isRate(m.taxRate) ? m.taxRate : state.settings.taxRate);
  const taxOf = (m) => (m.cost * rateOf(m)) / 100;

  const formatters = new Map();
  function money(n, opts = {}) {
    const key = state.settings.currency + JSON.stringify(opts);
    if (!formatters.has(key)) {
      const base = { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts };
      let f;
      try {
        f = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: state.settings.currency, ...base });
      } catch {
        f = new Intl.NumberFormat(LOCALE, base);
      }
      formatters.set(key, f);
    }
    return formatters.get(key).format(n);
  }
  const moneyWhole = (n) => money(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const moneyCompact = (n) => money(n, { notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const num = (n, digits = 0) => n.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const rateText = (r) => r.toLocaleString(LOCALE, { maximumFractionDigits: 2 });
  const percent = (r) => `${rateText(r)}%`;

  function clock(ms) {
    const s = Math.floor(ms / 1000);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
  }

  function duration(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s} с`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m} мин ${s % 60} с`;
    return `${Math.floor(m / 60)} ч ${m % 60} мин`;
  }

  function humanHours(h) {
    if (h < 1) return `${Math.round(h * 60)} чел.-мин`;
    return `${num(h, 1)} чел.-ч`;
  }

  // Russian has three plural forms (1 встреча, 2 встречи, 5 встреч), plus fractions (2,5 встречи).
  const pluralRules = new Intl.PluralRules(LOCALE);
  function word(n, [one, few, many, fraction = few]) {
    if (!Number.isInteger(n)) return fraction;
    return { one, few, many }[pluralRules.select(n)] ?? many;
  }
  const plural = (n, forms) => `${num(n)} ${word(n, forms)}`;

  function initials(name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2);
    return letters.toUpperCase();
  }

  function colorFor(name) {
    let h = 0;
    for (const ch of norm(name)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }

  function randomTitle() {
    return `${pick(TITLE_A)} ${pick(TITLE_B)} ${pick(TITLE_C)}`;
  }

  // "🌯 3,4 шаурмы" — picks the priciest thing we can afford at least one of.
  function equivalents(cost, howMany = 1) {
    const affordable = THINGS.filter((t) => cost >= fromRub(t.price)).reverse();
    return affordable.slice(0, howMany).map((t) => {
      const n = cost / fromRub(t.price);
      const shown = n < 10 ? Math.floor(n * 10) / 10 : Math.floor(n);
      const label = n < 10 ? num(shown, 1) : num(shown);
      // "3,0 шаурмы" is still read as a fraction, so anything under 10 takes the fraction form.
      return `${t.emoji} ${label} ${n < 10 ? word(0.5, t.forms) : word(shown, t.forms)}`;
    });
  }

  function verdict(m) {
    if (m.durationMs < 60e3) return 'Меньше минуты?! Подозрительно эффективно. HR уже выехал.';
    if (m.cost < fromRub(2000)) return 'В целом безобидно. Можно было написать в чатик.';
    if (m.cost < fromRub(8000)) return 'Вердикт: это можно было письмом.';
    if (m.cost < fromRub(40000)) return 'Вердикт: это можно было коротким письмом. С буллетами.';
    if (m.cost < fromRub(150000)) return 'Вердикт: на эти деньги весь отдел мог взять отгул.';
    return 'Об этом созвоне сообщено куда следует. 🚔';
  }

  /* ==========================================================
     Elements
     ========================================================== */

  const els = {
    currency: $('currency'),
    stage: $('stage'),
    setupView: $('setup-view'),
    liveView: $('live-view'),
    rosterView: $('roster-view'),
    title: $('meeting-title'),
    randomTitle: $('random-title'),
    addForm: $('add-person'),
    attendees: $('attendees'),
    attendeesEmpty: $('attendees-empty'),
    previewMinute: $('preview-minute'),
    previewHour: $('preview-hour'),
    previewCount: $('preview-count'),
    previewCountNote: $('preview-count-note'),
    taxRate: $('tax-rate'),
    taxPreview: $('tax-preview'),
    start: $('start-btn'),
    rec: $('rec-label'),
    liveTitle: $('live-title'),
    counter: $('counter'),
    taxMeter: $('tax-meter'),
    taxCounter: $('tax-counter'),
    taxRateLabel: $('tax-rate-label'),
    sticker: $('sticker'),
    elapsed: $('elapsed'),
    liveMinute: $('live-minute'),
    liveCount: $('live-count'),
    equiv: $('equiv'),
    quip: $('quip'),
    pause: $('pause-btn'),
    stop: $('stop-btn'),
    discard: $('discard-btn'),
    roster: $('roster'),
    rosterEmpty: $('roster-empty'),
    addAll: $('add-all'),
    chart: $('chart'),
    chartTip: $('chart-tip'),
    chartTitle: $('chart-title'),
    chartEmpty: $('chart-empty'),
    chartTable: $('chart-table'),
    history: $('history'),
    historyEmpty: $('history-empty'),
    nuke: $('nuke-btn'),
    more: $('more-btn'),
    receipt: $('receipt'),
    ask: $('ask'),
    askText: $('ask-text'),
    askOk: $('ask-ok'),
    rain: $('rain'),
  };

  /* ==========================================================
     Setup view: draft meeting + roster
     ========================================================== */

  function personRow(p, { action, inMeeting = false, disabled = false }) {
    const pay = `${moneyWhole(p.salary)}${UNIT_LABEL[p.unit]}`;
    const perMin = money(hourlyOf(p) / 60);
    const button =
      action === 'remove'
        ? `<button type="button" class="chip-btn chip-btn--remove" data-remove="${esc(p.id)}" aria-label="Убрать ${esc(p.name)} со встречи" title="Отпустить на волю">✕</button>`
        : inMeeting
          ? `<span class="person__tag">Уже тут</span>`
          : `<button type="button" class="chip-btn chip-btn--add" data-add="${esc(p.id)}" aria-label="Добавить ${esc(p.name)} на встречу" title="Затащить на созвон" ${disabled ? 'disabled' : ''}>+</button>
             <button type="button" class="chip-btn chip-btn--remove" data-forget="${esc(p.id)}" aria-label="Забыть ${esc(p.name)}" title="Забыть навсегда">✕</button>`;
    return `<li class="person${inMeeting ? ' is-in' : ''}" data-id="${esc(p.id)}">
      <span class="avatar" style="background:${colorFor(p.name)}" aria-hidden="true">${esc(initials(p.name))}</span>
      <span class="person__info">
        <span class="person__name">${esc(p.name)}</span>
        <span class="person__pay">${pay} · ${perMin}/мин</span>
      </span>
      ${button}
    </li>`;
  }

  function renderDraft() {
    const people = state.draft.people;
    if (document.activeElement !== els.title) els.title.value = state.draft.title;
    els.attendees.innerHTML = people.map((p) => personRow(p, { action: 'remove' })).join('');
    els.attendeesEmpty.hidden = people.length > 0;

    const perHour = burnPerHour(people);
    els.previewMinute.textContent = people.length ? money(perHour / 60) : '—';
    els.previewHour.textContent = people.length ? moneyWhole(perHour) : '—';
    els.previewCount.textContent = num(people.length);
    els.previewCountNote.textContent = people.length === 1 ? 'человек (говорит сам с собой?)' : word(people.length, WORDS.human);
    els.start.disabled = people.length === 0;

    if (document.activeElement !== els.taxRate) els.taxRate.value = rateText(state.settings.taxRate);
    const taxPerMinute = (perHour / 60) * (state.settings.taxRate / 100);
    els.taxPreview.textContent = people.length && taxPerMinute > 0 ? `Для этой встречи это ещё +${money(taxPerMinute)} в минуту.` : '';
  }

  els.taxRate.addEventListener('change', () => {
    const rate = parseFloat(els.taxRate.value.replace(',', '.').replace(/[%\s]/g, ''));
    if (!isRate(rate)) {
      els.taxRate.setCustomValidity('Ставка от 0 до 100%. Даже у государства есть границы. Наверное.');
      els.taxRate.reportValidity();
      return;
    }
    state.settings.taxRate = Math.round(rate * 100) / 100;
    save.settings();
    renderDraft();
    renderStats();
  });
  els.taxRate.addEventListener('input', () => els.taxRate.setCustomValidity(''));
  els.taxRate.addEventListener('blur', () => {
    if (els.taxRate.validity.valid) renderDraft();
  });

  function renderRoster() {
    const inMeeting = new Set(state.draft.people.map((p) => norm(p.name)));
    const live = Boolean(state.active);
    const sorted = [...state.roster].sort((a, b) => a.name.localeCompare(b.name));
    els.roster.innerHTML = sorted.map((p) => personRow(p, { inMeeting: inMeeting.has(norm(p.name)), disabled: live })).join('');
    els.rosterEmpty.hidden = sorted.length > 0;
    const remaining = sorted.filter((p) => !inMeeting.has(norm(p.name))).length;
    els.addAll.hidden = sorted.length < 2 || remaining === 0 || live;
  }

  function rememberPerson(person) {
    const existing = state.roster.find((p) => norm(p.name) === norm(person.name));
    if (existing) Object.assign(existing, { name: person.name, salary: person.salary, unit: person.unit });
    else state.roster.push({ ...person, id: uid() });
    save.roster();
  }

  function addToDraft(person, { flash = true } = {}) {
    const existing = state.draft.people.find((p) => norm(p.name) === norm(person.name));
    let id;
    if (existing) {
      Object.assign(existing, { name: person.name, salary: person.salary, unit: person.unit });
      id = existing.id;
    } else {
      id = uid();
      state.draft.people.push({ id, name: person.name, salary: person.salary, unit: person.unit });
    }
    save.draft();
    renderDraft();
    renderRoster();
    if (flash && existing) {
      const row = els.attendees.querySelector(`[data-id="${CSS.escape(id)}"]`);
      row?.classList.add('is-flash');
    }
  }

  els.title.addEventListener('input', () => {
    state.draft.title = els.title.value;
    save.draft();
  });

  els.randomTitle.addEventListener('click', () => {
    state.draft.title = randomTitle();
    els.title.value = state.draft.title;
    save.draft();
  });

  // The form is `novalidate`: the browser's own messages come in the browser's language,
  // so we validate here and show our own (Russian) text in the native bubble.
  function complain(input, message) {
    input.setCustomValidity(message);
    input.reportValidity();
  }

  els.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { name: nameInput, salary: salaryInput, unit: unitInput } = els.addForm.elements;
    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const salary = parseFloat(salaryInput.value);
    if (!name) return complain(nameInput, 'Как зовут жертву? Анонимов на созвоны не зовём.');
    if (salaryInput.validity.badInput) return complain(salaryInput, 'Это не похоже на число.');
    if (salaryInput.value === '') return complain(salaryInput, 'Сколько получает? Без зарплаты ущерб не посчитать.');
    if (!Number.isFinite(salary) || salary <= 0) return complain(salaryInput, 'Всем что-то платят. Даже стажёрам. (Обычно.)');
    const person = { name, salary, unit: unitInput.value };
    rememberPerson(person);
    addToDraft(person);
    nameInput.value = '';
    salaryInput.value = '';
    nameInput.focus();
  });

  for (const input of [els.addForm.elements.name, els.addForm.elements.salary]) {
    input.addEventListener('input', () => input.setCustomValidity(''));
  }

  els.attendees.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    state.draft.people = state.draft.people.filter((p) => p.id !== btn.dataset.remove);
    save.draft();
    renderDraft();
    renderRoster();
  });

  els.roster.addEventListener('click', async (e) => {
    const add = e.target.closest('[data-add]');
    const forget = e.target.closest('[data-forget]');
    if (add) {
      const p = state.roster.find((r) => r.id === add.dataset.add);
      if (p) addToDraft(p, { flash: false });
    } else if (forget) {
      const p = state.roster.find((r) => r.id === forget.dataset.forget);
      if (!p || !(await ask(`Забыть «${p.name}» навсегда? Никто не узнает. Наверное.`, 'Забыть'))) return;
      state.roster = state.roster.filter((r) => r.id !== p.id);
      save.roster();
      renderRoster();
    }
  });

  els.addAll.addEventListener('click', () => {
    for (const p of state.roster) addToDraft(p, { flash: false });
  });

  /* ==========================================================
     Live meeting
     ========================================================== */

  let rafId = 0;
  let titleTimer = 0;
  let quipTimer = 0;
  let nextDropAt = 0;
  let lastCounterLen = 0;
  let lastTaxLen = 0;

  const elapsedMs = (a) => a.accumulatedMs + (a.runningSince ? Date.now() - a.runningSince : 0);

  function startMeeting() {
    if (!state.draft.people.length) return;
    const title = state.draft.title.trim() || randomTitle();
    const now = Date.now();
    state.active = {
      id: uid(),
      title,
      people: state.draft.people.map((p) => ({ name: p.name, hourly: hourlyOf(p) })),
      startedAt: now,
      accumulatedMs: 0,
      runningSince: now,
      milestone: -1,
      taxRate: state.settings.taxRate,
    };
    save.active();
    enterLive();
    window.scrollTo({ top: els.stage.offsetTop - 16, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }

  function togglePause() {
    const a = state.active;
    if (!a) return;
    if (a.runningSince) {
      a.accumulatedMs += Date.now() - a.runningSince;
      a.runningSince = null;
    } else {
      a.runningSince = Date.now();
    }
    save.active();
    syncLiveState();
  }

  function stopMeeting() {
    const a = state.active;
    if (!a) return;
    const durationMs = elapsedMs(a);
    const meeting = {
      id: a.id,
      title: a.title,
      startedAt: a.startedAt,
      endedAt: Date.now(),
      durationMs,
      cost: costFor(a.people, durationMs),
      taxRate: rateOf(a),
      people: a.people,
    };
    state.meetings.push(meeting);
    save.meetings();
    leaveLive();
    renderStats();
    showReceipt(meeting);
  }

  async function discardMeeting() {
    if (!state.active) return;
    if (!(await ask('Отменить встречу без сохранения? Деньги всё равно потрачены — просто не будем об этом.', 'Отменить встречу'))) return;
    if (state.active) leaveLive();
  }

  function leaveLive() {
    state.active = null;
    save.active();
    state.draft.title = '';
    save.draft();
    cancelAnimationFrame(rafId);
    clearInterval(titleTimer);
    clearInterval(quipTimer);
    document.title = PAGE_TITLE;
    els.stage.classList.remove('is-live', 'is-running', 'is-paused');
    els.liveView.hidden = true;
    els.setupView.hidden = false;
    els.rosterView.hidden = false;
    renderDraft();
    renderRoster();
  }

  function enterLive() {
    const a = state.active;
    els.stage.classList.add('is-live');
    els.setupView.hidden = true;
    els.rosterView.hidden = true;
    els.liveView.hidden = false;
    els.liveTitle.textContent = a.title;
    els.liveMinute.textContent = money(burnPerHour(a.people) / 60);
    els.liveCount.textContent = num(a.people.length);
    els.taxMeter.hidden = rateOf(a) === 0;
    els.taxRateLabel.textContent = percent(rateOf(a));
    els.sticker.hidden = true;
    if (a.milestone >= 0) showSticker(MILESTONES[a.milestone][1], false);
    lastCounterLen = 0;
    lastTaxLen = 0;
    syncLiveState();
  }

  function syncLiveState() {
    const a = state.active;
    const running = Boolean(a.runningSince);
    els.stage.classList.toggle('is-running', running);
    els.stage.classList.toggle('is-paused', !running);
    els.liveView.classList.toggle('is-running', running);
    els.liveView.classList.toggle('is-paused', !running);
    els.rec.textContent = running ? 'ЭФИР' : 'ПАУЗА';
    els.pause.textContent = running ? '⏸ Пауза' : '▶ Продолжить';

    cancelAnimationFrame(rafId);
    clearInterval(titleTimer);
    clearInterval(quipTimer);
    updateTitle();
    newQuip();
    if (running) {
      rafId = requestAnimationFrame(tick);
      titleTimer = setInterval(updateTitle, 1000);
      quipTimer = setInterval(newQuip, 8000);
    } else {
      tick(performance.now());
    }
  }

  function tick(now) {
    const a = state.active;
    if (!a) return;
    const ms = elapsedMs(a);
    const cost = costFor(a.people, ms);
    const text = money(cost);
    els.counter.textContent = text;
    if (text.length !== lastCounterLen) {
      lastCounterLen = text.length;
      els.counter.style.setProperty('--len', String(text.length));
    }
    const taxText = money((cost * rateOf(a)) / 100);
    els.taxCounter.textContent = taxText;
    if (taxText.length !== lastTaxLen) {
      lastTaxLen = taxText.length;
      els.taxCounter.style.setProperty('--len', String(taxText.length));
    }
    els.elapsed.textContent = clock(ms);
    const eq = equivalents(cost)[0];
    els.equiv.textContent = eq ? `Это уже ≈ ${eq}` : 'Даже на пачку семечек пока не набежало. Подождите минутку. 🌻';
    checkMilestone(cost);

    if (a.runningSince) {
      if (!reducedMotion.matches && now >= nextDropAt) {
        dropMoney();
        // Higher burn rate → heavier money rain.
        const perMinute = burnPerHour(a.people) / 60;
        nextDropAt = now + Math.min(2500, Math.max(110, 3000 / (1 + perMinute / 20)));
      }
      rafId = requestAnimationFrame(tick);
    }
  }

  function updateTitle() {
    const a = state.active;
    if (!a) return;
    document.title = `🔥 ${money(costFor(a.people, elapsedMs(a)))} сожжено · ${a.title}`;
  }

  function newQuip() {
    const a = state.active;
    if (!a) return;
    const list = a.runningSince ? QUIPS : PAUSE_QUIPS;
    let next = pick(list);
    if (next === els.quip.textContent && list.length > 1) next = pick(list);
    els.quip.textContent = next;
    els.quip.classList.remove('is-new');
    void els.quip.offsetWidth;
    els.quip.classList.add('is-new');
  }

  function checkMilestone(cost) {
    const a = state.active;
    let reached = -1;
    MILESTONES.forEach(([threshold], i) => {
      if (cost >= fromRub(threshold)) reached = i;
    });
    if (reached > a.milestone) {
      a.milestone = reached;
      save.active();
      showSticker(MILESTONES[reached][1], true);
    }
  }

  function showSticker(text, animate) {
    els.sticker.textContent = text;
    els.sticker.hidden = false;
    els.sticker.classList.remove('is-new');
    if (animate) {
      void els.sticker.offsetWidth;
      els.sticker.classList.add('is-new');
    }
  }

  function dropMoney() {
    if (els.rain.childElementCount > 70) return;
    const el = document.createElement('span');
    el.className = 'drop';
    el.textContent = pick(RAIN);
    el.style.left = `${Math.random() * 100}vw`;
    el.style.fontSize = `${1.3 + Math.random() * 1.7}rem`;
    el.style.animationDuration = `${3 + Math.random() * 3}s`;
    el.style.setProperty('--spin', `${Math.round(Math.random() * 720 - 360)}deg`);
    el.style.setProperty('--drift', `${Math.round(Math.random() * 120 - 60)}px`);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    els.rain.appendChild(el);
  }

  els.start.addEventListener('click', startMeeting);
  els.pause.addEventListener('click', togglePause);
  els.stop.addEventListener('click', stopMeeting);
  els.discard.addEventListener('click', discardMeeting);

  /* ==========================================================
     Dialogs: confirmations & the receipt
     ========================================================== */

  // A Russian stand-in for confirm(), whose title and OK/Cancel buttons follow the browser's language.
  function ask(text, okLabel) {
    if (typeof els.ask.showModal !== 'function') return Promise.resolve(confirm(text));
    els.askText.textContent = text;
    els.askOk.textContent = okLabel;
    els.ask.returnValue = '';
    els.ask.showModal();
    return new Promise((resolve) => {
      els.ask.addEventListener('close', () => resolve(els.ask.returnValue === 'ok'), { once: true });
    });
  }

  function showReceipt(m) {
    const started = new Date(m.startedAt);
    $('r-title').textContent = m.title;
    $('r-meta').innerHTML = `${esc(started.toLocaleDateString(LOCALE, { dateStyle: 'medium' }))} · ${esc(
      started.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' }),
    )}<br>Длительность: ${esc(duration(m.durationMs))} · ${esc(plural(m.people.length, WORDS.victim))}`;

    $('r-lines').innerHTML = [...m.people]
      .map((p) => ({ ...p, cost: (p.hourly * m.durationMs) / 3.6e6 }))
      .sort((a, b) => b.cost - a.cost)
      .map(
        (p) => `<tr><td>${esc(p.name)}<small>@ ${esc(money(p.hourly))}/час</small></td><td>${esc(money(p.cost))}</td></tr>`,
      )
      .join('');

    const rate = rateOf(m);
    const tax = taxOf(m);
    $('r-salaries').textContent = money(m.cost);
    $('r-tax-label').textContent = `Налоги и взносы (${percent(rate)})`;
    $('r-tax').textContent = money(tax);
    $('r-tax-row').hidden = rate === 0;
    $('r-total').textContent = money(m.cost + tax);
    $('r-hours').textContent = humanHours(personHours(m));
    const eq = equivalents(m.cost, 3);
    $('r-equiv').innerHTML = (eq.length ? eq : ['🌻 меньше пачки семечек. Впечатляет.']).map((t) => `<li>${esc(t)}</li>`).join('');
    $('r-verdict').textContent = verdict(m);

    if (typeof els.receipt.showModal === 'function') els.receipt.showModal();
    else els.receipt.setAttribute('open', '');
  }

  // Clicking the backdrop closes a dialog (and, for confirmations, counts as "no").
  for (const dialog of [els.receipt, els.ask]) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ==========================================================
     Stats: tiles, chart, history
     ========================================================== */

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const startOfWeek = (d) => {
    const x = startOfDay(d);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // Monday, like a civilised calendar
    return x;
  };
  const startOfMonth = (d) => {
    const x = startOfDay(d);
    x.setDate(1);
    return x;
  };
  const START_OF = { day: startOfDay, week: startOfWeek, month: startOfMonth };
  const BUCKETS = { day: 14, week: 12, month: 12 };

  function addPeriod(d, group, n) {
    const x = new Date(d);
    if (group === 'day') x.setDate(x.getDate() + n);
    else if (group === 'week') x.setDate(x.getDate() + 7 * n);
    else x.setMonth(x.getMonth() + n);
    return x;
  }

  function summarize(fromMs) {
    const list = state.meetings.filter((m) => m.startedAt >= fromMs);
    return {
      count: list.length,
      cost: list.reduce((s, m) => s + m.cost, 0),
      tax: list.reduce((s, m) => s + taxOf(m), 0),
      ms: list.reduce((s, m) => s + m.durationMs, 0),
      hours: list.reduce((s, m) => s + personHours(m), 0),
    };
  }

  function renderTiles() {
    const now = new Date();
    const ranges = {
      'tile-today': startOfDay(now).getTime(),
      'tile-week': startOfWeek(now).getTime(),
      'tile-month': startOfMonth(now).getTime(),
      'tile-all': 0,
    };
    for (const [id, from] of Object.entries(ranges)) {
      const s = summarize(from);
      const tile = $(id);
      tile.querySelector('.tile__money').textContent = money(s.cost);
      tile.querySelector('.tile__tax').textContent = s.tax > 0 ? `+ ${money(s.tax)} налогов сверху` : '';
      tile.querySelector('.tile__meta').textContent = s.count
        ? `${plural(s.count, WORDS.meeting)} · ${duration(s.ms)} · ${humanHours(s.hours)}`
        : 'Пока ничего. Наслаждайтесь, пока можете.';
    }
  }

  function buildBuckets(group) {
    const n = BUCKETS[group];
    const first = addPeriod(START_OF[group](new Date()), group, -(n - 1));
    const buckets = Array.from({ length: n }, (_, i) => ({
      start: addPeriod(first, group, i).getTime(),
      end: addPeriod(first, group, i + 1).getTime(),
      cost: 0,
      tax: 0,
      hours: 0,
      count: 0,
      current: i === n - 1,
    }));
    for (const m of state.meetings) {
      const b = buckets.find((bk) => m.startedAt >= bk.start && m.startedAt < bk.end);
      if (!b) continue;
      b.cost += m.cost;
      b.tax += taxOf(m);
      b.hours += personHours(m);
      b.count += 1;
    }
    return buckets;
  }

  function bucketLabel(b, group, i, narrow) {
    const d = new Date(b.start);
    if (group === 'day') {
      return {
        top: d.toLocaleDateString(LOCALE, { weekday: narrow ? 'narrow' : 'short' }),
        bottom: String(d.getDate()),
        full: cap(d.toLocaleDateString(LOCALE, { weekday: 'long', month: 'short', day: 'numeric' })),
      };
    }
    if (group === 'week') {
      return {
        top: d.toLocaleDateString(LOCALE, { month: 'short' }),
        bottom: String(d.getDate()),
        full: `Неделя с ${d.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' })}`,
      };
    }
    return {
      top: d.toLocaleDateString(LOCALE, { month: narrow ? 'narrow' : 'short' }),
      bottom: i === 0 || d.getMonth() === 0 ? `'${String(d.getFullYear()).slice(2)}` : '',
      full: cap(d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })),
    };
  }

  function niceStep(max, ticks) {
    const raw = max / ticks;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }

  let chartBuckets = [];

  function renderChart() {
    const { group, metric } = state.settings;
    const isMoney = metric !== 'time';
    const buckets = buildBuckets(group);
    chartBuckets = buckets;
    const value = (b) => (metric === 'tax' ? b.tax : metric === 'time' ? b.hours : b.cost);
    const fmtValue = (v) => (isMoney ? money(v) : humanHours(v));
    const fmtAxis = (v) => (isMoney ? moneyCompact(v) : `${num(v, v % 1 ? 1 : 0)} ч`);

    document.querySelectorAll('[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === group)));
    document.querySelectorAll('[data-metric]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.metric === metric)));
    const span = { day: 'последние 14 дней', week: 'последние 12 недель', month: 'последние 12 месяцев' }[group];
    els.chartTitle.textContent = {
      money: `Сожжённые деньги · ${span}`,
      tax: `Налоги и взносы сверху · ${span}`,
      time: `Безвозвратно потерянные человеко-часы · ${span}`,
    }[metric];

    const W = Math.max(280, Math.round(els.chart.clientWidth || 600));
    const H = 280;
    const pad = { top: 26, right: 6, bottom: 44, left: isMoney ? 78 : 48 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    const max = Math.max(...buckets.map(value));
    const step = niceStep(max > 0 ? max : isMoney ? fromRub(10000) : 2, 4);
    const yMax = max > 0 ? Math.ceil(max / step) * step : step * 4;
    const y = (v) => pad.top + innerH - (v / yMax) * innerH;

    const band = innerW / buckets.length;
    const barW = Math.max(6, band * 0.66);
    const narrow = band < 34;

    const parts = [];
    parts.push('<g class="grid">');
    for (let k = 0; k * step <= yMax + step / 2; k++) {
      const v = k * step;
      const yy = y(v).toFixed(1);
      parts.push(`<line x1="${pad.left}" x2="${W - pad.right}" y1="${yy}" y2="${yy}" class="${k === 0 ? 'zero' : ''}"/>`);
      parts.push(`<text class="y-label" x="${pad.left - 8}" y="${yy}" text-anchor="end" dominant-baseline="middle">${esc(fmtAxis(v))}</text>`);
    }
    parts.push('</g>');

    const maxIndex = max > 0 ? buckets.findIndex((b) => value(b) === max) : -1;
    buckets.forEach((b, i) => {
      const v = value(b);
      const cx = pad.left + band * i + band / 2;
      const x = cx - barW / 2;
      const label = bucketLabel(b, group, i, narrow);
      b.label = label;
      if (v > 0) {
        const top = y(v);
        const h = Math.max(3, pad.top + innerH - top);
        parts.push(
          `<rect class="bar${b.current ? ' is-current' : ''}" data-bar="${i}" x="${x.toFixed(1)}" y="${(pad.top + innerH - h).toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}"/>`,
        );
        // Label only the tallest bar and the current one — the rest live in the tooltip.
        if (i === maxIndex || (b.current && band >= 40)) {
          const txt = isMoney ? moneyCompact(v) : `${num(v, 1)} ч`;
          parts.push(`<text class="bar-value" x="${cx.toFixed(1)}" y="${(pad.top + innerH - h - 7).toFixed(1)}" text-anchor="middle">${esc(txt)}</text>`);
        }
      }
      const showLabel = band >= 22 || i % 2 === buckets.length % 2 || b.current;
      if (showLabel) {
        const cls = `x-label${b.current ? ' is-current' : ''}`;
        parts.push(`<text class="${cls}" x="${cx.toFixed(1)}" y="${H - pad.bottom + 18}" text-anchor="middle">${esc(label.top)}</text>`);
        if (label.bottom) parts.push(`<text class="${cls}" x="${cx.toFixed(1)}" y="${H - pad.bottom + 34}" text-anchor="middle">${esc(label.bottom)}</text>`);
      }
      const desc = `${label.full}: ${fmtValue(v)}, ${plural(b.count, WORDS.meeting)}`;
      parts.push(
        `<rect class="hit" data-i="${i}" x="${(pad.left + band * i).toFixed(1)}" y="${pad.top}" width="${band.toFixed(1)}" height="${innerH}" tabindex="0" role="img" aria-label="${esc(desc)}"/>`,
      );
    });

    const svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(els.chartTitle.textContent)}">${parts.join('')}</svg>`;
    els.chart.querySelector('svg')?.remove();
    els.chart.insertAdjacentHTML('afterbegin', svg);
    els.chartTip.hidden = true;
    els.chartEmpty.hidden = max > 0;

    els.chartTable.innerHTML = [...buckets]
      .reverse()
      .map(
        (b) =>
          `<tr><td>${esc(b.label.full)}</td><td>${num(b.count)}</td><td>${esc(money(b.cost))}</td><td>${esc(money(b.tax))}</td><td>${esc(num(b.hours, 1))}</td></tr>`,
      )
      .join('');
  }

  function showTip(i) {
    const b = chartBuckets[i];
    const hit = els.chart.querySelector(`.hit[data-i="${i}"]`);
    if (!b || !hit) return;
    const [main, ...details] = {
      money: [money(b.cost), `+ ${money(b.tax)} налогов`, humanHours(b.hours)],
      tax: [money(b.tax), `зарплаты ${money(b.cost)}`],
      time: [humanHours(b.hours), money(b.cost)],
    }[state.settings.metric];
    els.chartTip.innerHTML = `${esc(b.label.full)}<br><strong>${esc(main)}</strong><br>${esc([plural(b.count, WORDS.meeting), ...details].join(' · '))}`;
    els.chartTip.hidden = false;

    els.chart.querySelectorAll('.bar.is-hover').forEach((r) => r.classList.remove('is-hover'));
    const bar = els.chart.querySelector(`.bar[data-bar="${i}"]`);
    bar?.classList.add('is-hover');

    const svg = els.chart.querySelector('svg');
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const hx = (parseFloat(hit.getAttribute('x')) + parseFloat(hit.getAttribute('width')) / 2) * scale;
    const anchor = bar ? parseFloat(bar.getAttribute('y')) : parseFloat(hit.getAttribute('y')) + parseFloat(hit.getAttribute('height'));
    const tipW = els.chartTip.offsetWidth;
    const chartW = els.chart.clientWidth;
    const left = Math.min(Math.max(hx, tipW / 2), chartW - tipW / 2);
    els.chartTip.style.left = `${left}px`;
    els.chartTip.style.top = `${Math.max(anchor * scale, els.chartTip.offsetHeight + 10)}px`;
  }

  function hideTip() {
    els.chartTip.hidden = true;
    els.chart.querySelectorAll('.bar.is-hover').forEach((r) => r.classList.remove('is-hover'));
  }

  els.chart.addEventListener('pointerover', (e) => {
    const hit = e.target.closest('.hit');
    if (hit) showTip(Number(hit.dataset.i));
  });
  els.chart.addEventListener('pointerleave', hideTip);
  els.chart.addEventListener('focusin', (e) => {
    const hit = e.target.closest('.hit');
    if (hit) showTip(Number(hit.dataset.i));
  });
  els.chart.addEventListener('focusout', hideTip);

  document.querySelectorAll('[data-group]').forEach((btn) =>
    btn.addEventListener('click', () => {
      state.settings.group = btn.dataset.group;
      save.settings();
      renderChart();
    }),
  );
  document.querySelectorAll('[data-metric]').forEach((btn) =>
    btn.addEventListener('click', () => {
      state.settings.metric = btn.dataset.metric;
      save.settings();
      renderChart();
    }),
  );

  let resizeFrame = 0;
  let lastChartWidth = 0;
  new ResizeObserver(() => {
    const w = els.chart.clientWidth;
    if (w === lastChartWidth) return;
    lastChartWidth = w;
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(renderChart);
  }).observe(els.chart);

  const HISTORY_PAGE = 8;
  let historyLimit = HISTORY_PAGE;

  function renderHistory() {
    const list = [...state.meetings].sort((a, b) => b.startedAt - a.startedAt);
    const worst = list.reduce((w, m) => (!w || m.cost > w.cost ? m : w), null);
    const shownList = list.slice(0, historyLimit);
    // The most expensive meeting always gets its moment in the spotlight.
    if (worst && !shownList.includes(worst)) shownList.push(worst);
    els.history.innerHTML = shownList
      .map((m) => {
        const d = new Date(m.startedAt);
        const when = `${d.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}`;
        const names = m.people.map((p) => p.name);
        const shown = names.slice(0, 4).join(', ') + (names.length > 4 ? ` и ещё ${names.length - 4}` : '');
        const isWorst = m === worst && list.length > 1;
        return `<li class="shame${isWorst ? ' is-worst' : ''}">
          <span class="shame__rank" aria-hidden="true">${isWorst ? '👑' : '💸'}</span>
          <div class="shame__main">
            <span class="shame__title">${esc(m.title)}${isWorst ? ' <small>(самая дорогая)</small>' : ''}</span>
            <span class="shame__meta">${esc(when)} · ${esc(duration(m.durationMs))} · ${esc(humanHours(personHours(m)))}${taxOf(m) > 0 ? ` · налоги +${esc(money(taxOf(m)))}` : ''}</span>
            <span class="shame__people">${esc(shown)}</span>
          </div>
          <span class="shame__cost">${esc(money(m.cost))}</span>
          <button type="button" class="chip-btn chip-btn--remove" data-delete="${esc(m.id)}" aria-label="Удалить ${esc(m.title)}" title="Уничтожить улику">✕</button>
        </li>`;
      })
      .join('');
    els.historyEmpty.hidden = list.length > 0;
    els.nuke.hidden = list.length === 0;
    const hiddenCount = list.length - shownList.length;
    els.more.hidden = hiddenCount <= 0;
    els.more.textContent = `👀 Показать ещё ${plural(Math.min(hiddenCount, HISTORY_PAGE), WORDS.crime)} (скрыто: ${num(hiddenCount)})`;
  }

  els.more.addEventListener('click', () => {
    historyLimit += HISTORY_PAGE;
    renderHistory();
  });

  els.history.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const m = state.meetings.find((x) => x.id === btn.dataset.delete);
    if (!m || !(await ask(`Удалить «${m.title}» с доски позора? Заметаем следы?`, 'Удалить'))) return;
    state.meetings = state.meetings.filter((x) => x !== m);
    save.meetings();
    renderStats();
  });

  els.nuke.addEventListener('click', async () => {
    if (!(await ask('Удалить ВСЮ историю встреч? Сохранённые участники останутся. Это нельзя отменить (в отличие от приглашений в календаре).', '☢️ Сжечь всё'))) return;
    state.meetings = [];
    save.meetings();
    renderStats();
  });

  function renderStats() {
    renderTiles();
    renderChart();
    renderHistory();
  }

  /* ==========================================================
     Settings & boot
     ========================================================== */

  els.currency.value = state.settings.currency;
  if (els.currency.value !== state.settings.currency) state.settings.currency = els.currency.value = 'USD';
  els.currency.addEventListener('change', () => {
    state.settings.currency = els.currency.value;
    save.settings();
    renderDraft();
    renderRoster();
    renderStats();
    if (state.active) enterLive();
  });

  // Keep the stats fresh if the page sits open past midnight / across tabs.
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.meetings) {
      state.meetings = asArray(store.get(KEYS.meetings, []));
      renderStats();
    } else if (e.key === KEYS.roster) {
      state.roster = asArray(store.get(KEYS.roster, [])).filter(isPerson);
      renderRoster();
    }
  });
  setInterval(renderTiles, 60e3);

  els.title.placeholder = randomTitle();
  renderDraft();
  renderRoster();
  renderStats();
  if (state.active) enterLive();
})();
