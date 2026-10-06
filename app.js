(() => {
  'use strict';

  /* ==========================================================
     Config & comedy material
     ========================================================== */

  const KEYS = {
    roster: 'mct.roster',
    meetings: 'mct.meetings',
    draft: 'mct.draft',
    active: 'mct.active',
    settings: 'mct.settings',
  };

  // 40 hours × 52 weeks. Nobody actually works exactly this, which is the point.
  const HOURS_PER = { year: 2080, month: 2080 / 12, hour: 1 };
  const UNIT_LABEL = { year: '/yr', month: '/mo', hour: '/hr' };
  const AVATAR_COLORS = ['#ff5ca8', '#ffd93d', '#b8f04a', '#4fd8ff', '#ff8c42', '#9b7bff'];
  const RAIN = ['💸', '💵', '💰', '🪙', '🔥', '💸', '💶', '💷'];

  const QUIPS = [
    'Waiting for someone to unmute…',
    '"Can everyone see my screen?"',
    '"Let\'s take this offline." (Narrator: they did not.)',
    '"Just to piggyback on that…"',
    'Circling back to the thing we already circled back to.',
    '"Sorry, you go." "No, you go." "No, you go."',
    'Someone is definitely answering emails right now.',
    '"Let\'s put a pin in that." 📌',
    'Synergizing the deliverables…',
    '"Quick question" — it is neither quick nor a question.',
    'Aligning on the alignment.',
    '"I\'ll keep this brief." — famous last words',
    'Somebody\'s dog has joined the call. 🐕',
    '"Per my last email…"',
    'Scheduling a follow-up meeting to discuss this meeting.',
    '"You\'re on mute."',
    'Leveraging core competencies at scale.',
    'Someone just said "bandwidth" unironically.',
    'The real agenda was the friends we made along the way.',
    '"Let\'s give people 5 more minutes to join."',
    '"Can you hear me now?"',
    'One person is talking. Nine people are muted and suffering.',
    '"This is a great question for the parking lot." 🅿️',
    '"Let\'s double-click on that."',
    'Somewhere, an email that would have taken 2 minutes weeps.',
    '"Sorry, I was on mute. As I was saying…"',
    '"We\'re at time, but just one more thing…"',
    'Moving the needle. Boiling the ocean. Peeling the onion.',
  ];

  const PAUSE_QUIPS = [
    '⏸ Paused. The salaries, sadly, are not.',
    '⏸ Bio break. Everyone is checking their phone.',
    '⏸ "Let\'s take five." It will be fifteen.',
  ];

  // [threshold, message] — currency-agnostic, because pain is universal.
  const MILESTONES = [
    [10, 'Coffee money: gone. ☕'],
    [50, 'That was a team lunch. Just saying. 🌯'],
    [100, 'Achievement unlocked: Could\'ve Been An Email 📧'],
    [250, 'Somebody\'s bonus just flinched.'],
    [500, 'Finance has been notified. 🚨'],
    [1000, 'FOUR DIGITS. The CFO felt a disturbance in the force.'],
    [2500, 'This meeting now costs more than the intern. 🧑‍🎓'],
    [5000, 'Congrats, you\'ve funded a used car. 🚗'],
    [10000, 'Please. Stop. 🙏'],
    [25000, 'This is no longer a meeting. It\'s a lifestyle.'],
    [100000, 'You could have bought a house. A small one. In a field. 🏚️'],
  ];

  // Sorted by price, ascending.
  const THINGS = [
    { emoji: '🦆', name: 'rubber ducks', price: 2 },
    { emoji: '☕', name: 'oat-milk lattes', price: 6 },
    { emoji: '🥑', name: 'avocado toasts', price: 14 },
    { emoji: '🍕', name: 'large pizzas', price: 22 },
    { emoji: '🎮', name: 'video games', price: 70 },
    { emoji: '🎧', name: 'noise-cancelling headphones', price: 350 },
    { emoji: '🪑', name: 'ergonomic chairs', price: 900 },
    { emoji: '🏝️', name: 'beach vacations', price: 2500 },
    { emoji: '🚗', name: 'used Honda Civics', price: 12000 },
    { emoji: '🏠', name: 'tiny houses', price: 60000 },
  ];

  const TITLE_A = ['Quick', 'Urgent', 'Mandatory', 'Optional (Not Really)', 'Weekly', 'Emergency', 'Recurring', 'Cross-Functional', 'Pre-', 'Post-', 'Strategic', 'Casual'];
  const TITLE_B = ['Sync', 'Alignment', 'Touch Base', 'Brainstorm', 'Deep Dive', 'Stand-up (Sitting Down)', 'Retro', 'Huddle', 'All-Hands', 'Kickoff', 'Check-in', 'Jam Session'];
  const TITLE_C = ['About the Other Meeting', 'on Synergy', 're: Q3 Vibes', 'Before the Real Meeting', 'to Plan the Offsite', 'That Could Be an Email', '(Cameras On 📸)', 'With No Agenda', 'Part 7', 'on Meeting Fatigue', 'About the Font on Slide 3', 'to Discuss Next Steps on Next Steps'];

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
    settings: { currency: 'USD', group: 'day', metric: 'money', ...(store.get(KEYS.settings, {}) || {}) },
  };

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
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const hourlyOf = (p) => (Number.isFinite(p.hourly) ? p.hourly : p.salary / HOURS_PER[p.unit]);
  const burnPerHour = (people) => people.reduce((sum, p) => sum + hourlyOf(p), 0);
  const costFor = (people, ms) => (burnPerHour(people) * ms) / 3.6e6;
  const personHours = (m) => (m.durationMs * m.people.length) / 3.6e6;

  const formatters = new Map();
  function money(n, opts = {}) {
    const key = state.settings.currency + JSON.stringify(opts);
    if (!formatters.has(key)) {
      const base = { minimumFractionDigits: 2, maximumFractionDigits: 2, ...opts };
      let f;
      try {
        f = new Intl.NumberFormat(undefined, { style: 'currency', currency: state.settings.currency, ...base });
      } catch {
        f = new Intl.NumberFormat(undefined, base);
      }
      formatters.set(key, f);
    }
    return formatters.get(key).format(n);
  }
  const moneyWhole = (n) => money(n, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const moneyCompact = (n) => money(n, { notation: 'compact', minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const num = (n, digits = 0) => n.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

  function clock(ms) {
    const s = Math.floor(ms / 1000);
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
  }

  function duration(ms) {
    const s = Math.round(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }

  function humanHours(h) {
    if (h < 1) return `${Math.round(h * 60)} human-min`;
    return `${num(h, 1)} human-hrs`;
  }

  const plural = (n, word, many = word + 's') => `${num(n)} ${n === 1 ? word : many}`;

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
    const a = pick(TITLE_A);
    const glue = a.endsWith('-') ? '' : ' ';
    return `${a}${glue}${pick(TITLE_B)} ${pick(TITLE_C)}`;
  }

  // "≈ 3.4 🍕 large pizzas" — picks the priciest thing we can afford at least one of.
  function equivalents(cost, howMany = 1) {
    const affordable = THINGS.filter((t) => cost >= t.price).reverse();
    return affordable.slice(0, howMany).map((t) => {
      const n = cost / t.price;
      return `${t.emoji} ${n < 10 ? num(n, 1) : num(Math.floor(n))} ${t.name}`;
    });
  }

  function verdict(m) {
    if (m.durationMs < 60e3) return 'Under a minute?! Suspiciously efficient. HR has been alerted.';
    if (m.cost < 25) return 'Mostly harmless. Could have been a Slack message.';
    if (m.cost < 100) return 'Verdict: this could have been an email.';
    if (m.cost < 500) return 'Verdict: this could have been an email. A short one. With bullet points.';
    if (m.cost < 2000) return 'Verdict: this could have been a PTO day for everyone involved.';
    return 'This meeting has been reported to the authorities. 🚔';
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
    start: $('start-btn'),
    rec: $('rec-label'),
    liveTitle: $('live-title'),
    counter: $('counter'),
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
        ? `<button type="button" class="chip-btn chip-btn--remove" data-remove="${esc(p.id)}" aria-label="Remove ${esc(p.name)} from the meeting" title="Set them free">✕</button>`
        : inMeeting
          ? `<span class="person__tag">In the room</span>`
          : `<button type="button" class="chip-btn chip-btn--add" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to the meeting" title="Drag them in" ${disabled ? 'disabled' : ''}>+</button>
             <button type="button" class="chip-btn chip-btn--remove" data-forget="${esc(p.id)}" aria-label="Forget ${esc(p.name)}" title="Forget forever">✕</button>`;
    return `<li class="person${inMeeting ? ' is-in' : ''}" data-id="${esc(p.id)}">
      <span class="avatar" style="background:${colorFor(p.name)}" aria-hidden="true">${esc(initials(p.name))}</span>
      <span class="person__info">
        <span class="person__name">${esc(p.name)}</span>
        <span class="person__pay">${pay} · ${perMin}/min</span>
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
    els.previewCountNote.textContent = people.length === 1 ? 'human (talking to themself?)' : 'humans';
    els.start.disabled = people.length === 0;
  }

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

  els.addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = els.addForm;
    const name = form.elements.name.value.trim().replace(/\s+/g, ' ');
    const salary = parseFloat(form.elements.salary.value);
    const unit = form.elements.unit.value;
    if (!name) return form.elements.name.focus();
    if (!Number.isFinite(salary) || salary <= 0) {
      form.elements.salary.setCustomValidity('Everyone gets paid something. Even interns. (Usually.)');
      form.elements.salary.reportValidity();
      return;
    }
    const person = { name, salary, unit };
    rememberPerson(person);
    addToDraft(person);
    form.elements.name.value = '';
    form.elements.salary.value = '';
    form.elements.name.focus();
  });

  els.addForm.elements.salary.addEventListener('input', (e) => e.target.setCustomValidity(''));

  els.attendees.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    state.draft.people = state.draft.people.filter((p) => p.id !== btn.dataset.remove);
    save.draft();
    renderDraft();
    renderRoster();
  });

  els.roster.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    const forget = e.target.closest('[data-forget]');
    if (add) {
      const p = state.roster.find((r) => r.id === add.dataset.add);
      if (p) addToDraft(p, { flash: false });
    } else if (forget) {
      const p = state.roster.find((r) => r.id === forget.dataset.forget);
      if (!p || !confirm(`Forget ${p.name} forever? They'll never know. Or will they?`)) return;
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
      people: a.people,
    };
    state.meetings.push(meeting);
    save.meetings();
    leaveLive();
    renderStats();
    showReceipt(meeting);
  }

  function discardMeeting() {
    if (!state.active) return;
    if (!confirm("Abort this meeting without saving? The money is still gone — we just won't talk about it.")) return;
    leaveLive();
  }

  function leaveLive() {
    state.active = null;
    save.active();
    state.draft.title = '';
    save.draft();
    cancelAnimationFrame(rafId);
    clearInterval(titleTimer);
    clearInterval(quipTimer);
    document.title = 'Meeting Cost Timer 💸';
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
    els.sticker.hidden = true;
    if (a.milestone >= 0) showSticker(MILESTONES[a.milestone][1], false);
    lastCounterLen = 0;
    syncLiveState();
  }

  function syncLiveState() {
    const a = state.active;
    const running = Boolean(a.runningSince);
    els.stage.classList.toggle('is-running', running);
    els.stage.classList.toggle('is-paused', !running);
    els.liveView.classList.toggle('is-running', running);
    els.liveView.classList.toggle('is-paused', !running);
    els.rec.textContent = running ? 'REC' : 'PAUSED';
    els.pause.textContent = running ? '⏸ Pause' : '▶ Resume';

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
    els.elapsed.textContent = clock(ms);
    const eq = equivalents(cost)[0];
    els.equiv.textContent = eq ? `That's ≈ ${eq}` : 'Not even a rubber duck yet. Give it a minute. 🦆';
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
    document.title = `🔥 ${money(costFor(a.people, elapsedMs(a)))} burned · ${a.title}`;
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
      if (cost >= threshold) reached = i;
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
     Receipt
     ========================================================== */

  function showReceipt(m) {
    const started = new Date(m.startedAt);
    $('r-title').textContent = m.title;
    $('r-meta').innerHTML = `${esc(started.toLocaleDateString(undefined, { dateStyle: 'medium' }))} · ${esc(
      started.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
    )}<br>Duration: ${esc(duration(m.durationMs))} · ${esc(plural(m.people.length, 'victim'))}`;

    $('r-lines').innerHTML = [...m.people]
      .map((p) => ({ ...p, cost: (p.hourly * m.durationMs) / 3.6e6 }))
      .sort((a, b) => b.cost - a.cost)
      .map(
        (p) => `<tr><td>${esc(p.name)}<small>@ ${esc(money(p.hourly))}/hr</small></td><td>${esc(money(p.cost))}</td></tr>`,
      )
      .join('');

    $('r-total').textContent = money(m.cost);
    $('r-hours').textContent = humanHours(personHours(m));
    const eq = equivalents(m.cost, 3);
    $('r-equiv').innerHTML = (eq.length ? eq : ['🦆 less than one rubber duck. Impressive.']).map((t) => `<li>${esc(t)}</li>`).join('');
    $('r-verdict').textContent = verdict(m);

    if (typeof els.receipt.showModal === 'function') els.receipt.showModal();
    else els.receipt.setAttribute('open', '');
  }

  // Clicking the pink backdrop also closes the receipt.
  els.receipt.addEventListener('click', (e) => {
    if (e.target === els.receipt) els.receipt.close();
  });

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
      tile.querySelector('.tile__meta').textContent = s.count
        ? `${plural(s.count, 'meeting')} · ${duration(s.ms)} · ${humanHours(s.hours)}`
        : 'Nothing yet. Enjoy it while it lasts.';
    }
  }

  function buildBuckets(group) {
    const n = BUCKETS[group];
    const first = addPeriod(START_OF[group](new Date()), group, -(n - 1));
    const buckets = Array.from({ length: n }, (_, i) => ({
      start: addPeriod(first, group, i).getTime(),
      end: addPeriod(first, group, i + 1).getTime(),
      cost: 0,
      hours: 0,
      count: 0,
      current: i === n - 1,
    }));
    for (const m of state.meetings) {
      const b = buckets.find((bk) => m.startedAt >= bk.start && m.startedAt < bk.end);
      if (!b) continue;
      b.cost += m.cost;
      b.hours += personHours(m);
      b.count += 1;
    }
    return buckets;
  }

  function bucketLabel(b, group, i, narrow) {
    const d = new Date(b.start);
    if (group === 'day') {
      return {
        top: d.toLocaleDateString(undefined, { weekday: narrow ? 'narrow' : 'short' }),
        bottom: String(d.getDate()),
        full: d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      };
    }
    if (group === 'week') {
      return {
        top: d.toLocaleDateString(undefined, { month: 'short' }),
        bottom: String(d.getDate()),
        full: `Week of ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
      };
    }
    return {
      top: d.toLocaleDateString(undefined, { month: narrow ? 'narrow' : 'short' }),
      bottom: i === 0 || d.getMonth() === 0 ? `'${String(d.getFullYear()).slice(2)}` : '',
      full: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
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
    const isMoney = metric === 'money';
    const buckets = buildBuckets(group);
    chartBuckets = buckets;
    const value = (b) => (isMoney ? b.cost : b.hours);
    const fmtValue = (v) => (isMoney ? money(v) : humanHours(v));
    const fmtAxis = (v) => (isMoney ? moneyCompact(v) : `${num(v, v % 1 ? 1 : 0)}h`);

    document.querySelectorAll('[data-group]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.group === group)));
    document.querySelectorAll('[data-metric]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.metric === metric)));
    const span = { day: 'last 14 days', week: 'last 12 weeks', month: 'last 12 months' }[group];
    els.chartTitle.textContent = isMoney ? `Money set on fire · ${span}` : `Human-hours lost forever · ${span}`;

    const W = Math.max(280, Math.round(els.chart.clientWidth || 600));
    const H = 280;
    const pad = { top: 26, right: 6, bottom: 44, left: isMoney ? 58 : 44 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    const max = Math.max(...buckets.map(value));
    const step = max > 0 ? niceStep(max, 4) : isMoney ? 25 : 0.5;
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
          const txt = isMoney ? moneyCompact(v) : `${num(v, 1)}h`;
          parts.push(`<text class="bar-value" x="${cx.toFixed(1)}" y="${(pad.top + innerH - h - 7).toFixed(1)}" text-anchor="middle">${esc(txt)}</text>`);
        }
      }
      const showLabel = band >= 22 || i % 2 === buckets.length % 2 || b.current;
      if (showLabel) {
        const cls = `x-label${b.current ? ' is-current' : ''}`;
        parts.push(`<text class="${cls}" x="${cx.toFixed(1)}" y="${H - pad.bottom + 18}" text-anchor="middle">${esc(label.top)}</text>`);
        if (label.bottom) parts.push(`<text class="${cls}" x="${cx.toFixed(1)}" y="${H - pad.bottom + 34}" text-anchor="middle">${esc(label.bottom)}</text>`);
      }
      const desc = `${label.full}: ${fmtValue(v)}, ${plural(b.count, 'meeting')}`;
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
          `<tr><td>${esc(b.label.full)}</td><td>${num(b.count)}</td><td>${esc(money(b.cost))}</td><td>${esc(num(b.hours, 1))}</td></tr>`,
      )
      .join('');
  }

  function showTip(i) {
    const b = chartBuckets[i];
    const hit = els.chart.querySelector(`.hit[data-i="${i}"]`);
    if (!b || !hit) return;
    const isMoney = state.settings.metric === 'money';
    const main = isMoney ? money(b.cost) : humanHours(b.hours);
    const secondary = isMoney ? humanHours(b.hours) : money(b.cost);
    els.chartTip.innerHTML = `${esc(b.label.full)}<br><strong>${esc(main)}</strong><br>${esc(plural(b.count, 'meeting'))} · ${esc(secondary)}`;
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
        const when = `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
        const names = m.people.map((p) => p.name);
        const shown = names.slice(0, 4).join(', ') + (names.length > 4 ? ` +${names.length - 4} more` : '');
        const isWorst = m === worst && list.length > 1;
        return `<li class="shame${isWorst ? ' is-worst' : ''}">
          <span class="shame__rank" aria-hidden="true">${isWorst ? '👑' : '💸'}</span>
          <div class="shame__main">
            <span class="shame__title">${esc(m.title)}${isWorst ? ' <small>(most expensive)</small>' : ''}</span>
            <span class="shame__meta">${esc(when)} · ${esc(duration(m.durationMs))} · ${esc(humanHours(personHours(m)))}</span>
            <span class="shame__people">${esc(shown)}</span>
          </div>
          <span class="shame__cost">${esc(money(m.cost))}</span>
          <button type="button" class="chip-btn chip-btn--remove" data-delete="${esc(m.id)}" aria-label="Delete ${esc(m.title)}" title="Destroy evidence">✕</button>
        </li>`;
      })
      .join('');
    els.historyEmpty.hidden = list.length > 0;
    els.nuke.hidden = list.length === 0;
    const hiddenCount = list.length - shownList.length;
    els.more.hidden = hiddenCount <= 0;
    els.more.textContent = `👀 Show ${plural(Math.min(hiddenCount, HISTORY_PAGE), 'more crime')} (${num(hiddenCount)} hidden)`;
  }

  els.more.addEventListener('click', () => {
    historyLimit += HISTORY_PAGE;
    renderHistory();
  });

  els.history.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-delete]');
    if (!btn) return;
    const m = state.meetings.find((x) => x.id === btn.dataset.delete);
    if (!m || !confirm(`Delete "${m.title}" from the Hall of Shame? Destroying evidence, are we?`)) return;
    state.meetings = state.meetings.filter((x) => x !== m);
    save.meetings();
    renderStats();
  });

  els.nuke.addEventListener('click', () => {
    if (!confirm('Delete ALL meeting history? Your saved participants stay. This cannot be undone (unlike your calendar invites).')) return;
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
