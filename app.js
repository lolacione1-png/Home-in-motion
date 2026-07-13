const STORAGE_KEY = 'homeInMotionV01';
const defaultState = {
  coverSeen: false,
  currentChapter: 0,
  declaration: 'The Ciones are brave.',
  focus: ['Go to the gym', 'Pick up library books', 'Protect quiet hour'],
  adventure: 'Library',
  dinner: 'Not planned yet.',
  nudge: 'Hey girl… the Walmart return has lived here for a while.',
  brain: [],
  upcoming: []
};

const chapterNames = ['Rise', 'Family Launch', 'Momentum', 'Adventure', 'Restore', 'Gather', 'Rest'];
const weeklyThemes = {
  0: ['Be', 'How can we simply enjoy today?'],
  1: ['Refill', 'What can I do today that makes the rest of the week easier?'],
  2: ['To Be Written', 'What does this Tuesday need to become?'],
  3: ['Explore', 'Where can curiosity take us today?'],
  4: ['Create', 'What can we create together today?'],
  5: ['Celebrate', 'What is one thing worth celebrating this week?'],
  6: ['Home', 'How can we make our house feel like home today?']
};

let state = loadState();

function loadState() {
  try {
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
  } catch {
    return { ...defaultState };
  }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function byId(id) { return document.getElementById(id); }

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning, Lola.';
  if (hour < 17) return 'Good Afternoon, Lola.';
  return 'Good Evening, Lola.';
}

function renderStory() {
  const now = new Date();
  const [theme, intention] = weeklyThemes[now.getDay()];
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  byId('greeting').textContent = greeting();
  byId('dayTheme').textContent = `${dayName} • ${theme}`;
  byId('dayIntention').textContent = intention;

  const chapterContainer = byId('chapters');
  chapterContainer.innerHTML = '';
  chapterNames.forEach((name, index) => {
    const btn = document.createElement('button');
    btn.className = `chapter-pill ${index === state.currentChapter ? 'current' : ''}`;
    btn.textContent = name;
    btn.addEventListener('click', () => {
      state.currentChapter = index;
      saveState();
      renderStory();
    });
    chapterContainer.appendChild(btn);
  });

  const focusList = byId('focusList');
  focusList.innerHTML = '';
  const items = state.focus.filter(Boolean).slice(0, 3);
  (items.length ? items : ['Choose one thing that matters today.']).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    focusList.appendChild(li);
  });
  byId('adventureDisplay').textContent = state.adventure || 'Not planned yet.';
  byId('dinnerDisplay').textContent = state.dinner || 'Not planned yet.';
  byId('nudgeDisplay').textContent = state.nudge || 'Nothing urgent is chasing you today.';
}

function renderBrain() {
  const list = byId('brainList');
  list.innerHTML = '';
  byId('brainCount').textContent = `${state.brain.length} ${state.brain.length === 1 ? 'thought' : 'thoughts'}`;
  if (!state.brain.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'Your brain dump is empty. Enjoy the suspicious silence.';
    list.appendChild(li);
    return;
  }
  state.brain.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const text = document.createElement('span');
    text.textContent = item.text;
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    const promote = document.createElement('button');
    promote.textContent = 'Focus';
    promote.addEventListener('click', () => {
      const next = [...state.focus.filter(Boolean), item.text].slice(-3);
      state.focus = next;
      state.brain.splice(index, 1);
      saveState(); renderBrain(); renderStory(); populateCEO();
    });
    const remove = document.createElement('button');
    remove.textContent = 'Done';
    remove.addEventListener('click', () => {
      state.brain.splice(index, 1);
      saveState(); renderBrain();
    });
    actions.append(promote, remove);
    li.append(text, actions);
    list.appendChild(li);
  });
}

function renderUpcoming() {
  const list = byId('upcomingList');
  list.innerHTML = '';
  if (!state.upcoming.length) {
    const li = document.createElement('li');
    li.className = 'muted';
    li.textContent = 'Nothing upcoming has been added yet.';
    list.appendChild(li);
    return;
  }
  [...state.upcoming].sort((a,b) => a.date.localeCompare(b.date)).forEach(item => {
    const li = document.createElement('li');
    li.className = 'task-item';
    const date = new Date(`${item.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    li.innerHTML = `<span><strong>${date}</strong><br>${escapeHtml(item.text)}</span>`;
    list.appendChild(li);
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}

function populateCEO() {
  byId('declarationInput').value = state.declaration || '';
  byId('focus1').value = state.focus[0] || '';
  byId('focus2').value = state.focus[1] || '';
  byId('focus3').value = state.focus[2] || '';
  byId('adventureInput').value = state.adventure || '';
  byId('dinnerInput').value = state.dinner || '';
  byId('nudgeInput').value = state.nudge || '';
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active-view', v.id === viewId));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active-nav', b.dataset.view === viewId));
  const titles = { storyView: 'Today’s Story', shelfView: 'Shelf View', brainView: 'Brain Dump', ceoView: 'CEO HQ' };
  byId('pageTitle').textContent = titles[viewId];
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterApp() {
  state.coverSeen = true; saveState();
  byId('cover').classList.remove('active');
  byId('mainApp').classList.remove('hidden');
  renderAll();
}
function openCover() {
  byId('mainApp').classList.add('hidden');
  byId('cover').classList.add('active');
}
function renderAll() { renderStory(); renderBrain(); renderUpcoming(); populateCEO(); }

byId('enterApp').addEventListener('click', enterApp);
byId('openCover').addEventListener('click', openCover);
byId('nextChapter').addEventListener('click', () => {
  state.currentChapter = (state.currentChapter + 1) % chapterNames.length;
  saveState(); renderStory();
});

document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

byId('addBrainItem').addEventListener('click', addBrainItem);
byId('brainInput').addEventListener('keydown', e => { if (e.key === 'Enter') addBrainItem(); });
function addBrainItem() {
  const input = byId('brainInput');
  const text = input.value.trim();
  if (!text) return;
  state.brain.push({ text, createdAt: new Date().toISOString() });
  input.value = '';
  saveState(); renderBrain();
}

byId('ceoForm').addEventListener('submit', e => {
  e.preventDefault();
  state.declaration = byId('declarationInput').value.trim();
  state.focus = [byId('focus1').value.trim(), byId('focus2').value.trim(), byId('focus3').value.trim()];
  state.adventure = byId('adventureInput').value.trim();
  state.dinner = byId('dinnerInput').value.trim();
  state.nudge = byId('nudgeInput').value.trim();
  const date = byId('upcomingDate').value;
  const text = byId('upcomingText').value.trim();
  if (date && text) {
    state.upcoming.push({ date, text });
    byId('upcomingDate').value = '';
    byId('upcomingText').value = '';
  }
  saveState(); renderAll();
  byId('saveMessage').textContent = 'Saved. Living Lola can take it from here.';
  setTimeout(() => byId('saveMessage').textContent = '', 2600);
});

if (state.coverSeen) enterApp(); else renderAll();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
