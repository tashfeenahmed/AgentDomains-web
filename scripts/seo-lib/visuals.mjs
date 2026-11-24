// Shared Neo-Brutalist visual components & inline SVG helpers for all 7 SEO clusters
import { esc } from './layout.mjs';

const ICONS = {
  bolt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  tag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.42 0l8.58-8.58a1 1 0 0 0 0-1.42L12 2Z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>',
  card: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  plug: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>',
  globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  terminal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',
  layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
};

export function renderSpecStrip(tiles) {
  return `<div class="spec-strip" role="region" aria-label="Key specifications">
  ${tiles
    .map(
      (t) => `<div class="spec-tile${t.tone ? ' ' + esc(t.tone) : ''}">
    <div class="spec-icon">${ICONS[t.icon] || ICONS.bolt}</div>
    <div class="spec-body">
      <span class="spec-label">${esc(t.label)}</span>
      <span class="spec-val">${esc(t.value)}</span>
    </div>
  </div>`
    )
    .join('\n  ')}
</div>`;
}

export function renderFilterPills(gridId, categories) {
  const unique = [...new Set(categories.filter(Boolean))];
  return `<div class="filter-pills" data-filter-pills="${esc(gridId)}" role="group" aria-label="Filter by category">
  <button type="button" class="filter-pill active" data-cat="all">All</button>
  ${unique
    .map(
      (cat) =>
        `<button type="button" class="filter-pill" data-cat="${esc(cat.toLowerCase())}">${esc(cat)}</button>`
    )
    .join('\n  ')}
</div>`;
}

export function trunc(str, max = 26) {
  const s = String(str ?? '');
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
