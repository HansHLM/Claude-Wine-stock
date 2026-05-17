'use strict';

const STORAGE_KEY = 'wine_cellar_v1';

const TYPE_BADGE = {
  Red: 'badge-red',
  White: 'badge-white',
  'Rosé': 'badge-rose',
  Sparkling: 'badge-sparkling',
  Dessert: 'badge-dessert',
  Fortified: 'badge-fortified',
};

let wines = load();

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wines));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --- Stats ---

function renderStats() {
  const total = wines.reduce((s, w) => s + w.quantity, 0);
  const types = [...new Set(wines.map(w => w.type))].length;
  const value = wines.reduce((s, w) => s + (w.price || 0) * w.quantity, 0);

  document.getElementById('stats').innerHTML = `
    <div class="stat"><div class="stat-value">${wines.length}</div><div class="stat-label">Labels</div></div>
    <div class="stat"><div class="stat-value">${total}</div><div class="stat-label">Bottles</div></div>
    <div class="stat"><div class="stat-value">${types}</div><div class="stat-label">Types</div></div>
    ${value > 0 ? `<div class="stat"><div class="stat-value">€${value.toFixed(0)}</div><div class="stat-label">Value</div></div>` : ''}
  `;
}

const ICON_EDIT = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
const ICON_DELETE = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>';

// --- Render list ---

function getFiltered() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const type = document.getElementById('filterType').value;
  const sort = document.getElementById('sortBy').value;

  let list = wines.filter(w => {
    const matchText = !q ||
      w.name.toLowerCase().includes(q) ||
      (w.region || '').toLowerCase().includes(q) ||
      (w.notes || '').toLowerCase().includes(q);
    const matchType = !type || w.type === type;
    return matchText && matchType;
  });

  list.sort((a, b) => {
    if (sort === 'vintage') return (b.vintage || 0) - (a.vintage || 0);
    if (sort === 'type') return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
    if (sort === 'quantity') return b.quantity - a.quantity;
    return a.name.localeCompare(b.name);
  });

  return list;
}

function renderList() {
  const list = getFiltered();
  const el = document.getElementById('wineList');

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">∅</div>
        <p>${wines.length ? 'No wines match your search.' : 'Your cellar is empty — add your first wine.'}</p>
      </div>`;
    return;
  }

  el.innerHTML = list.map(w => cardHTML(w)).join('');

  el.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleCardAction);
  });
}

function cardHTML(w) {
  const badge = TYPE_BADGE[w.type] || 'badge-red';
  const stockClass = w.quantity === 0 ? 'out-of-stock' : w.quantity <= 2 ? 'low-stock' : '';
  const stockPill = w.quantity === 0
    ? '<span class="stock-pill out">Out</span>'
    : w.quantity <= 2 ? '<span class="stock-pill">Low</span>' : '';

  return `
    <div class="wine-card ${stockClass}" data-id="${w.id}">
      ${stockPill}
      <div class="card-header">
        <div class="wine-name">${esc(w.name)}</div>
        <div class="card-header-actions">
          <button class="btn-icon" data-action="edit" data-id="${w.id}" title="Edit" aria-label="Edit">${ICON_EDIT}</button>
          <button class="btn-icon" data-action="delete" data-id="${w.id}" title="Delete" aria-label="Delete">${ICON_DELETE}</button>
        </div>
      </div>
      <div class="wine-meta">
        <span class="badge ${badge}">${esc(w.type)}</span>
        ${w.vintage ? `<span class="vintage-tag">${w.vintage}</span>` : ''}
        ${w.region ? `<span class="region-tag">${esc(w.region)}</span>` : ''}
      </div>
      ${w.notes ? `<div class="wine-notes">${esc(w.notes)}</div>` : ''}
      <div class="card-footer">
        <div class="quantity-control">
          <button class="qty-btn" data-action="dec" data-id="${w.id}" ${w.quantity === 0 ? 'disabled' : ''} aria-label="Decrease">−</button>
          <span class="qty-value">${w.quantity}</span>
          <button class="qty-btn" data-action="inc" data-id="${w.id}" aria-label="Increase">+</button>
          <span class="quantity-label">bottles</span>
        </div>
        ${w.price ? `<div class="price-tag"><strong>€${w.price.toFixed(2)}</strong> / btl</div>` : ''}
      </div>
    </div>`;
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function handleCardAction(e) {
  const { action, id } = e.currentTarget.dataset;
  if (action === 'edit') openModal(id);
  if (action === 'delete') confirmDelete(id);
  if (action === 'inc') adjustQuantity(id, 1);
  if (action === 'dec') adjustQuantity(id, -1);
}

function adjustQuantity(id, delta) {
  const wine = wines.find(w => w.id === id);
  if (!wine) return;
  wine.quantity = Math.max(0, wine.quantity + delta);
  save();
  renderAll();
}

// --- Modal ---

function openModal(id) {
  const wine = id ? wines.find(w => w.id === id) : null;
  document.getElementById('modalTitle').textContent = wine ? 'Edit Wine' : 'Add Wine';
  document.getElementById('wineId').value = wine ? wine.id : '';
  document.getElementById('wineName').value = wine ? wine.name : '';
  document.getElementById('wineType').value = wine ? wine.type : '';
  document.getElementById('wineVintage').value = wine ? (wine.vintage || '') : '';
  document.getElementById('wineRegion').value = wine ? (wine.region || '') : '';
  document.getElementById('wineQuantity').value = wine ? wine.quantity : '';
  document.getElementById('winePrice').value = wine ? (wine.price || '') : '';
  document.getElementById('wineNotes').value = wine ? (wine.notes || '') : '';
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('wineName').focus();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('wineForm').reset();
}

document.getElementById('btnAdd').addEventListener('click', () => openModal(null));
document.getElementById('btnCancel').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('wineForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('wineId').value;
  const name = document.getElementById('wineName').value.trim();
  const type = document.getElementById('wineType').value;
  const quantity = parseInt(document.getElementById('wineQuantity').value, 10);

  if (!name || !type || isNaN(quantity) || quantity < 1) return;

  const entry = {
    id: id || uid(),
    name,
    type,
    vintage: parseInt(document.getElementById('wineVintage').value, 10) || null,
    region: document.getElementById('wineRegion').value.trim() || null,
    quantity,
    price: parseFloat(document.getElementById('winePrice').value) || null,
    notes: document.getElementById('wineNotes').value.trim() || null,
  };

  if (id) {
    const idx = wines.findIndex(w => w.id === id);
    if (idx !== -1) wines[idx] = entry;
  } else {
    wines.push(entry);
  }

  save();
  closeModal();
  renderAll();
});

// --- Overview ---

function renderOverview() {
  const totalLabels = wines.length;
  const totalBottles = wines.reduce((s, w) => s + w.quantity, 0);
  const totalValue = wines.reduce((s, w) => s + (w.price || 0) * w.quantity, 0);
  const lowStock = wines.filter(w => w.quantity > 0 && w.quantity <= 2).length;
  const outOfStock = wines.filter(w => w.quantity === 0).length;

  const byType = wines.reduce((acc, w) => {
    if (!acc[w.type]) acc[w.type] = { labels: 0, bottles: 0, value: 0 };
    acc[w.type].labels += 1;
    acc[w.type].bottles += w.quantity;
    acc[w.type].value += (w.price || 0) * w.quantity;
    return acc;
  }, {});

  const typeRows = Object.entries(byType)
    .sort((a, b) => b[1].bottles - a[1].bottles)
    .map(([type, s]) => `
      <tr>
        <td><span class="badge ${TYPE_BADGE[type] || 'badge-red'}">${esc(type)}</span></td>
        <td>${s.labels}</td>
        <td>${s.bottles}</td>
        <td>${s.value > 0 ? `€${s.value.toFixed(2)}` : '—'}</td>
      </tr>`).join('');

  const wineRows = [...wines]
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
    .map(w => `
      <tr>
        <td>${esc(w.name)}</td>
        <td><span class="badge ${TYPE_BADGE[w.type] || 'badge-red'}">${esc(w.type)}</span></td>
        <td>${w.vintage || '—'}</td>
        <td>${esc(w.region || '—')}</td>
        <td>${w.quantity}</td>
        <td>${w.price ? `€${w.price.toFixed(2)}` : '—'}</td>
        <td>${w.price ? `€${(w.price * w.quantity).toFixed(2)}` : '—'}</td>
      </tr>`).join('');

  document.getElementById('overviewContent').innerHTML = `
    <div class="overview-summary">
      <div class="stat"><div class="stat-value">${totalLabels}</div><div class="stat-label">Labels</div></div>
      <div class="stat"><div class="stat-value">${totalBottles}</div><div class="stat-label">Bottles</div></div>
      <div class="stat"><div class="stat-value">${Object.keys(byType).length}</div><div class="stat-label">Types</div></div>
      ${totalValue > 0 ? `<div class="stat"><div class="stat-value">€${totalValue.toFixed(2)}</div><div class="stat-label">Est. Value</div></div>` : ''}
      <div class="stat"><div class="stat-value">${lowStock}</div><div class="stat-label">Low stock</div></div>
      <div class="stat"><div class="stat-value">${outOfStock}</div><div class="stat-label">Out of stock</div></div>
    </div>

    ${totalLabels === 0 ? `
      <p class="overview-empty">Your cellar is empty. Add your first wine to see the overview.</p>
    ` : `
      <h3 class="overview-section">By type</h3>
      <div class="overview-table-wrap">
        <table class="overview-table">
          <thead>
            <tr><th>Type</th><th>Labels</th><th>Bottles</th><th>Value</th></tr>
          </thead>
          <tbody>${typeRows}</tbody>
        </table>
      </div>

      <h3 class="overview-section">All wines</h3>
      <div class="overview-table-wrap">
        <table class="overview-table">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Vintage</th><th>Region</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
          </thead>
          <tbody>${wineRows}</tbody>
        </table>
      </div>
    `}
  `;
}

function openOverview() {
  renderOverview();
  document.getElementById('overviewModal').classList.remove('hidden');
}

function closeOverview() {
  document.getElementById('overviewModal').classList.add('hidden');
}

document.getElementById('btnOverview').addEventListener('click', openOverview);
document.getElementById('overviewClose').addEventListener('click', closeOverview);
document.getElementById('overviewModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeOverview();
});

// --- Delete confirm ---

let pendingDeleteId = null;

function confirmDelete(id) {
  const wine = wines.find(w => w.id === id);
  if (!wine) return;
  pendingDeleteId = id;
  document.getElementById('confirmMsg').textContent =
    `Remove "${wine.name}" from your cellar?`;
  document.getElementById('confirmModal').classList.remove('hidden');
}

document.getElementById('confirmNo').addEventListener('click', () => {
  document.getElementById('confirmModal').classList.add('hidden');
  pendingDeleteId = null;
});

document.getElementById('confirmYes').addEventListener('click', () => {
  if (pendingDeleteId) {
    wines = wines.filter(w => w.id !== pendingDeleteId);
    save();
    renderAll();
  }
  document.getElementById('confirmModal').classList.add('hidden');
  pendingDeleteId = null;
});

document.getElementById('confirmModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) {
    document.getElementById('confirmModal').classList.add('hidden');
    pendingDeleteId = null;
  }
});

// --- Search / filter listeners ---

['search', 'filterType', 'sortBy'].forEach(id => {
  document.getElementById(id).addEventListener('input', renderList);
});

// Keyboard close modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeOverview();
    document.getElementById('confirmModal').classList.add('hidden');
    pendingDeleteId = null;
  }
});

function renderAll() {
  renderStats();
  renderList();
}

// --- Seed demo data if empty ---
if (wines.length === 0) {
  wines = [
    { id: uid(), name: 'Château Margaux', type: 'Red', vintage: 2015, region: 'Bordeaux, France', quantity: 3, price: 120, notes: 'Elegant, complex tannins. Perfect with aged beef.' },
    { id: uid(), name: 'Cloudy Bay Sauvignon Blanc', type: 'White', vintage: 2022, region: 'Marlborough, NZ', quantity: 6, price: 22, notes: null },
    { id: uid(), name: 'Moët & Chandon Impérial', type: 'Sparkling', vintage: null, region: 'Champagne, France', quantity: 2, price: 45, notes: 'Reserve for celebrations.' },
    { id: uid(), name: 'Whispering Angel', type: 'Rosé', vintage: 2023, region: 'Provence, France', quantity: 4, price: 28, notes: null },
    { id: uid(), name: 'Penfolds Grange', type: 'Red', vintage: 2018, region: 'Barossa Valley, Australia', quantity: 1, price: 380, notes: 'Iconic Australian Shiraz. Do not open before 2028.' },
  ];
  save();
}

renderAll();
