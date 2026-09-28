const treeContainer = document.getElementById('tree');
const searchInput = document.getElementById('searchInput');
const treeViewBtn = document.getElementById('treeViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');
const expandAllBtn = document.getElementById('expandAllBtn');
const resetViewBtn = document.getElementById('resetViewBtn');

const state = { view: 'tree' };
let treeRoot = null;

function getPersonName(person) {
  if (!person) return 'Unknown';
  return person['english-name'] || person.name || 'Unknown';
}

function getAvatar(person) {
  if (person && person.image && String(person.image).trim()) {
    return String(person.image).trim();
  }
  return person && person.isFemale ? './images/placeholder-female.png' : './images/placeholder.png';
}

function fallbackAvatar(person, element) {
  const fallback = person && person.isFemale ? './images/placeholder-female.png' : './images/placeholder.png';
  if (element && element.tagName === 'IMG') {
    element.src = fallback;
  }
  return fallback;
}

function normalizeBio(person) {
  if (!person || !person.bio) return '';
  return String(person.bio).trim() || '';
}

async function loadJson(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to fetch ${path}: ${response.status}`);
  }
  return response.json();
}

async function resolveNode(node) {
  if (!node || typeof node !== 'object') return node;

  let resolved = { ...node };

  if (typeof resolved.source === 'string') {
    const sourceData = await loadJson(resolved.source);
    const merged = await resolveNode(sourceData);
    resolved = { ...merged, ...resolved };
    delete resolved.source;
  }

  if (Array.isArray(resolved.children)) {
    resolved.children = await Promise.all(resolved.children.map((child) => resolveNode(child)));
  }

  return resolved;
}

function walkTree(node, callback) {
  if (!node || typeof node !== 'object') return;
  callback(node);

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => walkTree(child, callback));
  }
  if (Array.isArray(node._children)) {
    node._children.forEach((child) => walkTree(child, callback));
  }
}

function renderViewButtons() {
  const isTree = state.view === 'tree';
  treeViewBtn.classList.toggle('active', isTree);
  listViewBtn.classList.toggle('active', !isTree);
  treeViewBtn.setAttribute('aria-pressed', String(isTree));
  listViewBtn.setAttribute('aria-pressed', String(!isTree));

  collapseAllBtn.style.display = isTree ? 'inline-flex' : 'none';
  expandAllBtn.style.display = isTree ? 'inline-flex' : 'none';
  resetViewBtn.style.display = isTree ? 'inline-flex' : 'none';
}

function setView(mode) {
  state.view = mode;
  renderViewButtons();
  if (mode === 'tree') renderTree();
  else renderList();
}

function toggleNode(node) {
  if (!node) return;

  if (Array.isArray(node.children) && node.children.length) {
    node._children = node.children;
    node.children = [];
  } else if (Array.isArray(node._children) && node._children.length) {
    node.children = node._children;
    node._children = [];
  }

  renderTree();
}

function collapseAll() {
  walkTree(treeRoot, (node) => {
    if (Array.isArray(node.children) && node.children.length) {
      node._children = node.children;
      node.children = [];
    }
  });

  renderTree();
}

function expandAll() {
  walkTree(treeRoot, (node) => {
    if (Array.isArray(node._children) && node._children.length) {
      node.children = node._children;
      node._children = [];
    }
  });

  renderTree();
}

function resetView() {
  expandAll();
}

function applySearch(query) {
  const value = query.trim().toLowerCase();

  if (state.view === 'tree') {
    const nodes = [...treeContainer.querySelectorAll('.tree-node')];
    nodes.forEach((node) => {
      const label = (node.dataset.name || '').toLowerCase();
      node.classList.toggle('hidden', !!value && !label.includes(value));
    });
    return;
  }

  const items = [...treeContainer.querySelectorAll('.list-node')];
  items.forEach((node) => {
    const label = (node.dataset.name || '').toLowerCase();
    node.classList.toggle('hidden', !!value && !label.includes(value));
  });
}

function buildTreeNode(person, depth = 0, isRoot = false) {
  const item = document.createElement('li');
  item.className = 'tree-node';
  item.dataset.name = getPersonName(person);

  const children = Array.isArray(person.children) ? person.children : [];
  const hiddenChildren = Array.isArray(person._children) ? person._children : [];
  const hasChildren = children.length > 0 || hiddenChildren.length > 0;
  const expanded = children.length > 0;

  const row = document.createElement('div');
  row.className = 'node-row';

  if (hasChildren) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'node-toggle';
    toggle.textContent = expanded ? '−' : '+';
    toggle.setAttribute('aria-label', `Toggle ${getPersonName(person)}`);
    toggle.addEventListener('click', () => toggleNode(person));
    row.appendChild(toggle);
  }

  const card = document.createElement('div');
  card.className = `node-card${isRoot ? ' root' : ''}`;
  card.style.marginLeft = `${depth * 8}px`;

  const img = document.createElement('img');
  img.src = getAvatar(person);
  img.alt = getPersonName(person);
  img.onerror = () => fallbackAvatar(person, img);

  const details = document.createElement('div');
  details.className = 'node-copy';

  const name = document.createElement('h3');
  name.textContent = getPersonName(person);

  const bio = document.createElement('p');
  const bioText = normalizeBio(person);
  bio.textContent = bioText || 'Family member';

  details.appendChild(name);
  if (bioText) details.appendChild(bio);

  card.appendChild(img);
  card.appendChild(details);
  row.appendChild(card);
  item.appendChild(row);

  if (expanded && children.length) {
    const childrenList = document.createElement('ul');
    children.forEach((child) => childrenList.appendChild(buildTreeNode(child, depth + 1)));
    item.appendChild(childrenList);
  }

  return item;
}

function renderTree() {
  if (!treeRoot) return;

  treeContainer.innerHTML = '';
  const rootList = document.createElement('ul');
  rootList.className = 'tree-root';
  rootList.appendChild(buildTreeNode(treeRoot, 0, true));
  treeContainer.appendChild(rootList);
}

function buildListNode(person, depth = 0) {
  const item = document.createElement('li');
  item.className = 'list-node';
  item.dataset.name = getPersonName(person);

  const children = Array.isArray(person.children) ? person.children : [];
  const hiddenChildren = Array.isArray(person._children) ? person._children : [];
  const hasChildren = children.length > 0 || hiddenChildren.length > 0;
  const expanded = children.length > 0;

  const row = document.createElement('div');
  row.className = 'list-row';

  if (hasChildren) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'list-toggle';
    toggle.textContent = expanded ? '−' : '+';
    toggle.addEventListener('click', () => toggleNode(person));
    row.appendChild(toggle);
  }

  const card = document.createElement('div');
  card.className = 'list-card';
  card.style.marginLeft = `${depth * 12}px`;

  const img = document.createElement('img');
  img.src = getAvatar(person);
  img.alt = getPersonName(person);
  img.onerror = () => fallbackAvatar(person, img);

  const details = document.createElement('div');
  const name = document.createElement('h3');
  name.className = 'list-name';
  name.textContent = getPersonName(person);

  const bio = document.createElement('p');
  bio.className = 'list-bio';
  const bioText = normalizeBio(person);
  bio.textContent = bioText || 'Family member';

  details.appendChild(name);
  if (bioText) details.appendChild(bio);

  card.appendChild(img);
  card.appendChild(details);
  row.appendChild(card);
  item.appendChild(row);

  if (expanded && children.length) {
    const childrenList = document.createElement('ul');
    childrenList.className = 'list-children';
    children.forEach((child) => childrenList.appendChild(buildListNode(child, depth + 1)));
    item.appendChild(childrenList);
  }

  return item;
}

function renderList() {
  if (!treeRoot) return;

  treeContainer.innerHTML = '';
  const list = document.createElement('ul');
  list.className = 'list-view';
  list.appendChild(buildListNode(treeRoot));
  treeContainer.appendChild(list);
}

async function initTree() {
  try {
    const rootData = await loadJson('./json/mantriprivar.json');
    const resolvedRoot = await resolveNode(rootData);
    treeRoot = resolvedRoot;
    setView('tree');
  } catch (error) {
    treeContainer.innerHTML = '<div class="error-box">Unable to load the family tree data.</div>';
    console.error(error);
  }
}

treeViewBtn.addEventListener('click', () => setView('tree'));
listViewBtn.addEventListener('click', () => setView('list'));
collapseAllBtn.addEventListener('click', collapseAll);
expandAllBtn.addEventListener('click', expandAll);
resetViewBtn.addEventListener('click', resetView);
searchInput.addEventListener('input', (event) => {
  applySearch(event.target.value);
});

initTree();
