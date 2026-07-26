// ========================================
// Start Menu - Renderer Logic
// Логика меню Пуск
// ========================================

// Состояние
let allApps = [];
let pinnedApps = [];
let filteredApps = [];
let selectedIndex = -1;

// DOM элементы
const searchInput = document.getElementById('searchInput');
const pinnedContainer = document.getElementById('pinnedApps');
const allAppsContainer = document.getElementById('allApps');
const powerBtn = document.getElementById('powerBtn');
const powerMenu = document.getElementById('powerMenu');
const userNameEl = document.getElementById('userName');

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  initStartMenu();
  initEventListeners();
});

// Инициализация меню
async function initStartMenu() {
  try {
    // Загрузка имени пользователя
    if (window.electronAPI && window.electronAPI.getUserName) {
      const name = await window.electronAPI.getUserName();
      if (name) {
        userNameEl.textContent = name;
      }
    }

    // Загрузка приложений
    await loadApps();
  } catch (e) {
    console.error('Failed to init start menu:', e);
  }
}

// Загрузка приложений
async function loadApps() {
  try {
    if (window.electronAPI && window.electronAPI.getStartMenuApps) {
      allApps = await window.electronAPI.getStartMenuApps();
    } else {
      allApps = [];
    }

    // Загрузка закреплённых
    if (window.electronAPI && window.electronAPI.getPinnedApps) {
      pinnedApps = await window.electronAPI.getPinnedApps();
    } else {
      pinnedApps = [];
    }

    renderPinnedApps();
    renderAllApps(allApps);
  } catch (e) {
    console.error('Failed to load apps:', e);
  }
}

// Отрисовка закреплённых приложений
function renderPinnedApps() {
  pinnedContainer.innerHTML = '';

  // Получение закреплённых приложений
  const pinnedItems = pinnedApps
    .map(path => allApps.find(app => app.path === path))
    .filter(Boolean)
    .slice(0, 12); // Макс 12 закреплённых

  if (pinnedItems.length === 0) {
    pinnedContainer.innerHTML = '<div style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center; padding: 8px;">Нет закреплённых приложений</div>';
    return;
  }

  pinnedItems.forEach(app => {
    const el = createPinnedAppElement(app);
    pinnedContainer.appendChild(el);
  });
}

// Создание элемента закреплённого приложения
function createPinnedAppElement(app) {
  const el = document.createElement('div');
  el.className = 'pinned-app';
  el.title = app.name;
  el.innerHTML = `
    <div class="app-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
    </div>
    <div class="app-name">${escapeHtml(app.name)}</div>
  `;

  el.addEventListener('click', () => launchApp(app));
  return el;
}

// Отрисовка всех приложений
function renderAllApps(apps) {
  allAppsContainer.innerHTML = '';

  // Группировка по первой букве
  const groups = {};
  apps.forEach(app => {
    const letter = app.name.charAt(0).toUpperCase();
    if (!groups[letter]) {
      groups[letter] = [];
    }
    groups[letter].push(app);
  });

  // Сортировка групп
  const sortedLetters = Object.keys(groups).sort();

  sortedLetters.forEach(letter => {
    const group = document.createElement('div');
    group.className = 'letter-group';

    const header = document.createElement('div');
    header.className = 'letter-header';
    header.textContent = letter;
    group.appendChild(header);

    groups[letter].forEach(app => {
      const item = createAppItemElement(app);
      group.appendChild(item);
    });

    allAppsContainer.appendChild(group);
  });
}

// Создание элемента приложения
function createAppItemElement(app) {
  const el = document.createElement('div');
  el.className = 'app-item';
  el.dataset.path = app.path;

  const isPinned = pinnedApps.includes(app.path);

  el.innerHTML = `
    <div class="app-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="9" y1="3" x2="9" y2="21"></line>
      </svg>
    </div>
    <div class="app-info">
      <div class="app-name">${escapeHtml(app.name)}</div>
      ${app.category ? `<div class="app-category">${escapeHtml(app.category)}</div>` : ''}
    </div>
    <div class="pin-btn ${isPinned ? 'pinned' : ''}" title="${isPinned ? 'Открепить' : 'Закрепить'}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 17v5"></path>
        <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1z"></path>
      </svg>
    </div>
  `;

  // Клик по приложению
  el.addEventListener('click', (e) => {
    if (!e.target.closest('.pin-btn')) {
      launchApp(app);
    }
  });

  // Клик по кнопке pin
  const pinBtn = el.querySelector('.pin-btn');
  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePinApp(app);
  });

  return el;
}

// Запуск приложения
async function launchApp(app) {
  try {
    if (window.electronAPI && window.electronAPI.launchStartMenuApp) {
      await window.electronAPI.launchStartMenuApp(app.path);
    }
    closeMenu();
  } catch (e) {
    console.error('Failed to launch app:', e);
  }
}

// Закрепление/открепление
async function togglePinApp(app) {
  try {
    if (window.electronAPI && window.electronAPI.togglePinApp) {
      await window.electronAPI.togglePinApp(app.path);
    }

    // Обновление локального состояния
    const index = pinnedApps.indexOf(app.path);
    if (index === -1) {
      pinnedApps.push(app.path);
    } else {
      pinnedApps.splice(index, 1);
    }

    renderPinnedApps();
    renderAllApps(filteredApps.length > 0 ? filteredApps : allApps);
  } catch (e) {
    console.error('Failed to toggle pin:', e);
  }
}

// Инициализация обработчиков событий
function initEventListeners() {
  // Поиск
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keydown', handleSearchKeydown);

  // Power menu
  powerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    powerMenu.classList.toggle('show');
  });

  // Power actions
  document.querySelectorAll('.power-menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = item.dataset.action;
      handlePowerAction(action);
    });
  });

  // Quick links
  document.querySelectorAll('.quick-link').forEach(link => {
    link.addEventListener('click', () => {
      const action = link.dataset.action;
      handleQuickLink(action);
    });
  });

  // Закрытие по клику вне меню
  document.addEventListener('click', () => {
    closeMenu();
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
}

// Обработка поиска
function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();

  if (query === '') {
    filteredApps = [];
    allAppsContainer.style.display = '';
    document.querySelector('.pinned-section').style.display = '';
    renderAllApps(allApps);
    return;
  }

  // Фильтрация приложений
  filteredApps = allApps.filter(app => {
    const nameMatch = app.name.toLowerCase().includes(query);
    const categoryMatch = app.category && app.category.toLowerCase().includes(query);
    return nameMatch || categoryMatch;
  });

  document.querySelector('.pinned-section').style.display = 'none';
  renderAllApps(filteredApps);
}

// Обработка клавиш в поиске
function handleSearchKeydown(e) {
  const items = allAppsContainer.querySelectorAll('.app-item');

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    updateSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = Math.max(selectedIndex - 1, -1);
    updateSelection(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && items[selectedIndex]) {
      const path = items[selectedIndex].dataset.path;
      const app = allApps.find(a => a.path === path);
      if (app) {
        launchApp(app);
      }
    }
  }
}

// Обновление выделения
function updateSelection(items) {
  items.forEach((item, i) => {
    item.style.background = i === selectedIndex ? 'rgba(255,255,255,0.1)' : '';
  });

  if (selectedIndex >= 0 && items[selectedIndex]) {
    items[selectedIndex].scrollIntoView({ block: 'nearest' });
  }
}

// Обработка power actions
async function handlePowerAction(action) {
  try {
    if (window.electronAPI && window.electronAPI.powerAction) {
      await window.electronAPI.powerAction(action);
    }
    closeMenu();
  } catch (e) {
    console.error('Power action failed:', e);
  }
}

// Обработка быстрых ссылок
function handleQuickLink(action) {
  const paths = {
    documents: process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Documents` : '',
    pictures: process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Pictures` : '',
    downloads: process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Downloads` : '',
    music: process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Music` : '',
    videos: process.env.USERPROFILE ? `${process.env.USERPROFILE}\\Videos` : '',
    settings: 'ms-settings:',
    filemanager: 'explorer.exe'
  };

  const target = paths[action];
  if (target) {
    if (window.electronAPI && window.electronAPI.openFolder) {
      window.electronAPI.openFolder(target);
    }
  }

  closeMenu();
}

// Закрытие меню
function closeMenu() {
  if (window.electronAPI && window.electronAPI.closeStartMenu) {
    window.electronAPI.closeStartMenu();
  }
}

// Экранирование HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
