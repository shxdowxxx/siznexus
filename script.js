const intelItems = [
  {
    title: 'Site rework completed',
    category: 'announcement',
    date: '2026-03-30',
    summary: 'Main interface redesigned to a faster, cleaner intel dashboard architecture.'
  },
  {
    title: 'How to join and rank up',
    category: 'guide',
    date: '2026-03-29',
    summary: 'Read onboarding checklist, complete entry steps, then request role verification.'
  },
  {
    title: 'Operation Nightwatch',
    category: 'operation',
    date: '2026-03-28',
    summary: 'Weekly squad event focused on map control, comm discipline, and recovery drills.'
  },
  {
    title: 'Credential safety update',
    category: 'security',
    date: '2026-03-27',
    summary: 'Never share passwords or access keys. Use unique credentials for every platform.'
  },
  {
    title: 'Intel etiquette standards',
    category: 'guide',
    date: '2026-03-24',
    summary: 'Tag sources, keep reports concise, and attach clear mission impact statements.'
  }
];

const operations = [
  { name: 'Comms Relay', status: 'online', details: 'Voice coordination and briefing updates are active.' },
  { name: 'Loadout Audit', status: 'monitoring', details: 'Template cleanup in progress for shared item kits.' },
  { name: 'Legacy Index', status: 'offline', details: 'Old records are being migrated to knowledge base cards.' }
];

const knowledgeBase = [
  {
    title: 'Recruit Onboarding',
    body: 'Entry requirements, behavior standards, and first-week training objectives.'
  },
  {
    title: 'Operations Playbook',
    body: 'Squad roles, callouts, and recovery loops to increase raid consistency.'
  },
  {
    title: 'Content Contribution Guide',
    body: 'How to submit guides and updates in a structured, searchable format.'
  }
];

const dom = {
  intelList: document.getElementById('intelList'),
  opsGrid: document.getElementById('opsGrid'),
  kbGrid: document.getElementById('kbGrid'),
  snapshot: document.getElementById('snapshot'),
  searchInput: document.getElementById('searchInput'),
  categoryFilter: document.getElementById('categoryFilter'),
  menuBtn: document.getElementById('menuBtn'),
  primaryNav: document.getElementById('primaryNav')
};

const formatDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
});

function renderIntel(items) {
  dom.intelList.innerHTML = '';

  if (!items.length) {
    dom.intelList.innerHTML = '<p>No intel matches your current filter.</p>';
    return;
  }

  const cards = items
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map((item) => `
      <article class="intel-item">
        <span class="badge badge--${item.category}">${item.category}</span>
        <h3>${item.title}</h3>
        <p>${item.summary}</p>
        <p class="meta">${formatDate(item.date)}</p>
      </article>
    `)
    .join('');

  dom.intelList.innerHTML = cards;
}

function renderOps() {
  dom.opsGrid.innerHTML = operations
    .map((op) => `
      <article class="ops-card">
        <h3>${op.name}</h3>
        <p class="status status--${op.status}">● ${op.status.toUpperCase()}</p>
        <p>${op.details}</p>
      </article>
    `)
    .join('');
}

function renderKnowledgeBase() {
  dom.kbGrid.innerHTML = knowledgeBase
    .map((entry) => `
      <article class="kb-card">
        <h3>${entry.title}</h3>
        <p>${entry.body}</p>
      </article>
    `)
    .join('');
}

function renderSnapshot() {
  const totalIntel = intelItems.length;
  const openOps = operations.filter((item) => item.status !== 'offline').length;
  const guides = intelItems.filter((item) => item.category === 'guide').length;

  dom.snapshot.innerHTML = `
    <li>Intel entries: <strong>${totalIntel}</strong></li>
    <li>Active operations: <strong>${openOps}</strong></li>
    <li>Guide records: <strong>${guides}</strong></li>
  `;
}

function applyFilters() {
  const search = dom.searchInput.value.trim().toLowerCase();
  const category = dom.categoryFilter.value;

  const filtered = intelItems.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    const matchesSearch = search.length === 0 || haystack.includes(search);
    return matchesCategory && matchesSearch;
  });

  renderIntel(filtered);
}

function initMenu() {
  dom.menuBtn.addEventListener('click', () => {
    const isOpen = dom.primaryNav.classList.toggle('open');
    dom.menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  dom.primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      dom.primaryNav.classList.remove('open');
      dom.menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

function init() {
  renderSnapshot();
  renderIntel(intelItems);
  renderOps();
  renderKnowledgeBase();

  dom.searchInput.addEventListener('input', applyFilters);
  dom.categoryFilter.addEventListener('change', applyFilters);

  initMenu();
}

document.addEventListener('DOMContentLoaded', init);
