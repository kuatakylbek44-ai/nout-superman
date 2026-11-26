import { localized, getLanguage } from './i18n.js?v=dashboard-20261127';

/** Summaries describe the bundled catalogue, never sales or visitor activity. */
export function summarizeCatalog(data) {
  const laptops = Array.isArray(data) ? data : Array.isArray(data?.laptops) ? data.laptops : [];
  const counts = new Map();
  let photos = 0;
  for (const laptop of laptops) {
    if (typeof laptop?.brand === 'string' && laptop.brand.trim()) {
      const brand = laptop.brand.trim();
      counts.set(brand, (counts.get(brand) || 0) + 1);
    }
    if (typeof laptop?.image === 'string' && laptop.image.trim()) photos++;
  }
  return {
    total: laptops.length,
    brands: counts.size,
    photos,
    coverage: laptops.length ? photos / laptops.length * 100 : 0,
    topBrands: [...counts].map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count || a.brand.localeCompare(b.brand, 'en'))
      .slice(0, 8),
  };
}

const locale = () => ({ kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' }[getLanguage()] || 'kk-KZ');
const number = value => new Intl.NumberFormat(locale()).format(value);
const boundedCount = value => Number.isFinite(Number(value)) ? Math.max(0, Math.floor(Number(value))) : 0;

export default function initDashboard() {
  if (typeof document === 'undefined') return () => {};
  const $ = selector => document.querySelector(selector);
  const abort = new AbortController();
  const listen = (target, event, callback) => target?.addEventListener(event, callback, { signal: abort.signal });
  const motion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
  const mobile = globalThis.matchMedia?.('(max-width: 760px)');
  const counterFrames = new Map();
  let state = null;
  let summary = null;
  let previousData = null;
  let hasAnimated = false;
  let activeLink = null;
  let observer;

  function counter(selector, value, animate) {
    const element = $(selector);
    if (!element) return;
    const previous = counterFrames.get(element);
    if (previous) cancelAnimationFrame(previous);
    element.setAttribute('aria-label', number(value));
    if (!animate || motion?.matches || typeof requestAnimationFrame !== 'function') {
      element.textContent = number(value);
      return;
    }
    const began = performance.now();
    const frame = now => {
      const progress = motion?.matches ? 1 : Math.min(1, (now - began) / 700);
      const ease = 1 - (1 - progress) ** 3;
      element.textContent = number(Math.round(value * ease));
      if (progress < 1) counterFrames.set(element, requestAnimationFrame(frame));
      else counterFrames.delete(element);
    };
    counterFrames.set(element, requestAnimationFrame(frame));
  }

  function updateStats(animate = false) {
    if (!summary) return;
    counter('#dash-total', summary.total, animate);
    counter('#dash-brands', summary.brands, animate);
    counter('#dash-photos', summary.photos, animate);
    counter('#dash-saved', boundedCount(state?.savedCount), animate);
    const catalogBadge = $('.sidebar-tag');
    if (catalogBadge) catalogBadge.textContent = number(summary.total);
    const savedBadge = $('#sidebar-saved-count');
    if (savedBadge) savedBadge.textContent = number(boundedCount(state?.savedCount));
    const comparedBadge = $('#sidebar-compare-count');
    if (comparedBadge) comparedBadge.textContent = number(boundedCount(state?.comparedCount));
  }

  function updateChart(rebuild = false) {
    const chart = $('#brand-chart');
    if (!chart || !summary) return;
    if (rebuild || !chart.children.length) {
      const max = Math.max(1, ...summary.topBrands.map(item => item.count));
      const bars = summary.topBrands.map(({ brand, count }, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'dash-bar-column bar-button';
        button.dataset.brand = brand;
        button.style.setProperty('--bar-height', `${count / max * 100}%`);
        button.style.setProperty('--bar-delay', `${index * 65}ms`);
        const countLabel = document.createElement('span');
        countLabel.className = 'bar-count dash-bar-value';
        countLabel.textContent = number(count);
        const track = document.createElement('span');
        track.className = 'bar-track dash-bar-track';
        track.setAttribute('aria-hidden', 'true');
        const fill = document.createElement('span');
        fill.className = 'bar-fill dash-bar-fill';
        track.append(fill);
        const label = document.createElement('span');
        label.className = 'bar-label dash-bar-label';
        label.textContent = brand;
        button.append(countLabel, track, label);
        button.setAttribute('aria-label', localized(
          `${brand}: ${number(count)} конфигурация. Осы брендті көрсету.`,
          `${brand}: ${number(count)} конфигураций. Показать этот бренд.`,
          `${brand}: ${number(count)} configurations. Show this brand.`,
        ));
        button.title = localized(`${brand} брендін таңдау`, `Выбрать ${brand}`, `Filter by ${brand}`);
        return button;
      });
      chart.replaceChildren(...bars);
      chart.setAttribute('aria-label', localized(
        'Каталогтағы конфигурациялар саны бойынша алғашқы сегіз бренд',
        'Восемь брендов с наибольшим числом конфигураций в каталоге',
        'Top eight brands by number of configurations in the catalogue',
      ));
    }
    const selected = Array.isArray(state?.filters?.brands) ? state.filters.brands : [];
    for (const button of chart.querySelectorAll('[data-brand]')) {
      const isSelected = selected.includes(button.dataset.brand);
      button.classList.toggle('selected', isSelected);
      button.setAttribute('aria-pressed', String(isSelected));
    }
  }

  function updateCoverage() {
    if (!summary) return;
    const gauge = $('#coverage-gauge');
    const percent = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(summary.coverage);
    if (gauge) {
      const segments = 32;
      const filledSegments = summary.coverage / 100 * segments;
      const paths = Array.from({ length: segments }, (_, index) => {
        const angle = Math.PI - (index + 0.5) / segments * Math.PI;
        const point = radius => `${(120 + Math.cos(angle) * radius).toFixed(2)} ${(118 - Math.sin(angle) * radius).toFixed(2)}`;
        const path = `M${point(88)} L${point(104)}`;
        const fraction = Math.max(0, Math.min(1, filledSegments - index));
        return `<path class="gauge-track gauge-segment coverage-arc-track" d="${path}"/>${fraction > 0 ? `<path class="gauge-fill gauge-segment coverage-arc-fill draw" d="${path}" pathLength="1" style="stroke-dasharray:${fraction} 1;--segment-delay:${index * 35}ms"/>` : ''}`;
      }).join('');
      gauge.innerHTML = `<svg viewBox="0 0 240 140" aria-hidden="true">${paths}</svg>`;
      gauge.setAttribute('role', 'img');
      gauge.setAttribute('aria-label', localized(
        `Каталогтағы конфигурациялардың ${percent}%-ында нақты фото бар`,
        `Настоящие фото есть у ${percent}% конфигураций каталога`,
        `${percent}% of catalogue configurations have verified photos`,
      ));
    }
    const label = $('#coverage-percent');
    if (label) label.textContent = `${percent}%`;
    const detail = $('#coverage-detail');
    if (detail) detail.textContent = localized(
      `${number(summary.total)} конфигурацияның ${number(summary.photos)}-інде нақты фото бар.`,
      `Настоящие фото есть у ${number(summary.photos)} из ${number(summary.total)} конфигураций.`,
      `${number(summary.photos)} of ${number(summary.total)} configurations have verified photos.`,
    );
  }

  function applyTheme(theme, persist = false) {
    const chosen = theme === 'light' ? 'light' : 'dark';
    document.body.dataset.theme = chosen;
    const button = $('#theme-toggle');
    const dark = chosen === 'dark';
    if (button) {
      const label = dark
        ? localized('Ашық тақырыпқа ауысу', 'Включить светлую тему', 'Switch to light theme')
        : localized('Қараңғы тақырыпқа ауысу', 'Включить тёмную тему', 'Switch to dark theme');
      button.setAttribute('aria-label', label);
      button.title = label;
      button.setAttribute('aria-pressed', String(!dark));
      const svg = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${dark ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>' : '<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>'}</svg>`;
      const icon = button.querySelector('[data-icon]');
      if (icon) icon.innerHTML = svg;
      else button.innerHTML = svg;
      const text = button.querySelector('.sr-only');
      if (text) text.textContent = label;
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#131719' : '#edf0f3';
    if (persist) { try { localStorage.setItem('nout-theme', chosen); } catch {} }
  }

  function clock() {
    const now = new Date();
    const time = $('#sidebar-clock');
    const date = $('#sidebar-date');
    if (time) time.textContent = new Intl.DateTimeFormat(locale(), { timeZone: 'Asia/Qyzylorda', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
    if (date) {
      if (getLanguage() === 'kk') {
        const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Qyzylorda', day: 'numeric', month: 'numeric', weekday: 'short',
        }).formatToParts(now).map(part => [part.type, part.value]));
        const months = ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'];
        const weekdays = { Mon: 'дүйсенбі', Tue: 'сейсенбі', Wed: 'сәрсенбі', Thu: 'бейсенбі', Fri: 'жұма', Sat: 'сенбі', Sun: 'жексенбі' };
        date.textContent = `${parts.day} ${months[Number(parts.month) - 1]} · ${weekdays[parts.weekday]}`;
      } else {
        date.textContent = new Intl.DateTimeFormat(locale(), { timeZone: 'Asia/Qyzylorda', day: 'numeric', month: 'long', weekday: 'short' }).format(now);
      }
    }
  }

  function setSidebar(open, restoreFocus = false) {
    const isMobile = !!mobile?.matches;
    const expanded = isMobile && open;
    document.body.classList.toggle('sidebar-open', expanded);
    const sidebar = $('.dashboard-sidebar');
    const toggle = $('#sidebar-toggle');
    const backdrop = $('#sidebar-backdrop');
    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
    if (backdrop) backdrop.hidden = !expanded;
    if (sidebar) {
      sidebar.inert = isMobile && !expanded;
      if (isMobile && !expanded) sidebar.setAttribute('aria-hidden', 'true');
      else sidebar.removeAttribute('aria-hidden');
      if (expanded) sidebar.querySelector('button,a[href]')?.focus({ preventScroll: true });
    }
    if (!expanded && restoreFocus) toggle?.focus({ preventScroll: true });
  }

  function setActiveLink(link) {
    if (!link || link === activeLink) return;
    activeLink = link;
    for (const item of document.querySelectorAll('[data-dashboard-link]')) {
      item.classList.toggle('active', item === link);
      if (item === link) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    }
  }

  const links = [...document.querySelectorAll('[data-dashboard-link]')];
  const sections = links.map(link => {
    const href = link.getAttribute('href') || '';
    return /^#[\w-]+$/.test(href) ? { link, element: $(href) } : null;
  }).filter(item => item?.element)
    .sort((a, b) => a.element === b.element ? 0 : a.element.compareDocumentPosition(b.element) & 4 ? -1 : 1);
  if (typeof IntersectionObserver === 'function' && sections.length) {
    observer = new IntersectionObserver(() => {
      const current = sections.filter(item => item.element.getBoundingClientRect().top <= 180).at(-1) || sections[0];
      setActiveLink(current.link);
    }, { rootMargin: '-80px 0px -40% 0px', threshold: [0, 0.15, 0.4, 0.7] });
    sections.forEach(item => observer.observe(item.element));
    setActiveLink(sections[0].link);
  }

  listen(document, 'nout:catalog', event => {
    state = event.detail || {};
    if (!state.data) return;
    const changed = state.data !== previousData;
    if (changed || !summary) summary = summarizeCatalog(state.data);
    previousData = state.data;
    updateStats(!hasAnimated);
    updateChart(changed);
    if (changed) updateCoverage();
    hasAnimated = true;
  });
  listen(document, 'nout:language', () => {
    updateStats();
    updateChart(true);
    updateCoverage();
    applyTheme(document.body.dataset.theme);
    clock();
  });
  listen($('#theme-toggle'), 'click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark', true));
  listen($('#sidebar-toggle'), 'click', () => setSidebar(!document.body.classList.contains('sidebar-open')));
  listen($('#sidebar-close'), 'click', () => setSidebar(false, true));
  listen($('#sidebar-backdrop'), 'click', () => setSidebar(false, true));
  listen($('.dashboard-sidebar'), 'click', event => {
    const link = event.target.closest('[data-dashboard-link]');
    if (link) setActiveLink(link);
    if (link || event.target.closest('a[href],[data-action]')) setSidebar(false);
  });
  listen(document, 'keydown', event => {
    if (!document.body.classList.contains('sidebar-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setSidebar(false, true); return; }
    if (event.key !== 'Tab') return;
    const focusable = [...($('.dashboard-sidebar')?.querySelectorAll('a[href],button:not([disabled]),select,input,[tabindex="0"]') || [])].filter(element => element.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (!first) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  listen(mobile, 'change', () => setSidebar(false));
  let chosenTheme = 'dark';
  try { chosenTheme = localStorage.getItem('nout-theme') || 'dark'; } catch {}
  applyTheme(chosenTheme);
  setSidebar(false);
  clock();
  const interval = setInterval(clock, 30000);

  return () => {
    abort.abort();
    observer?.disconnect();
    clearInterval(interval);
    counterFrames.forEach(id => cancelAnimationFrame(id));
    counterFrames.clear();
  };
}
