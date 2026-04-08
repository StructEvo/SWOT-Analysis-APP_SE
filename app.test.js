/**
 * Unit tests for the SWOT Analysis App logic.
 *
 * Jest runs with the jsdom test environment so global document/window
 * are available. We set up the DOM before each test, then evaluate app.js
 * in that context.
 */

const fs   = require('fs');
const path = require('path');

const APP_SRC = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

const QUADRANTS   = ['strengths', 'weaknesses', 'opportunities', 'threats'];
const STORAGE_KEY = 'swot-analysis-data';

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function buildDOM() {
  const sections = QUADRANTS.map(q =>
    `<section class="quadrant ${q}" data-quadrant="${q}">
      <ul class="item-list" id="list-${q}"></ul>
      <div class="add-item-row">
        <input type="text" class="item-input" id="input-${q}" />
        <button class="btn-add" data-quadrant="${q}">+</button>
      </div>
    </section>`
  ).join('');

  return `
    <input id="analysis-title" />
    <button id="btn-clear">Clear</button>
    <button id="btn-print">Print</button>
    <div id="swot-grid">${sections}</div>`;
}

function setStorageData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getStorageData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Reset DOM and run app.js in current window context. */
function loadApp(preloadStorage) {
  if (preloadStorage) {
    setStorageData(preloadStorage);
  }
  document.body.innerHTML = buildDOM();
  // eslint-disable-next-line no-new-func
  const fn = new Function(APP_SRC);
  fn.call(window);
}

function click(element) {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

function pressEnter(element) {
  element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
}

/* -------------------------------------------------------
   Test lifecycle
------------------------------------------------------- */
beforeEach(() => {
  localStorage.clear();
  jest.spyOn(window, 'confirm').mockReturnValue(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

/* ---- Initialisation ---- */
describe('Initialisation', () => {
  test('renders with empty quadrants when localStorage is empty', () => {
    loadApp();
    QUADRANTS.forEach(q => {
      expect(document.getElementById('list-' + q).children.length).toBe(0);
    });
  });

  test('restores persisted items on load', () => {
    loadApp({
      title: 'My Analysis',
      items: {
        strengths: ['Strong brand'],
        weaknesses: [],
        opportunities: ['New market'],
        threats: [],
      },
    });

    expect(document.getElementById('list-strengths').children.length).toBe(1);
    expect(document.getElementById('list-opportunities').children.length).toBe(1);
    expect(document.getElementById('analysis-title').value).toBe('My Analysis');
  });
});

/* ---- Adding items ---- */
describe('Adding items', () => {
  test('add button inserts item into the correct list', () => {
    loadApp();

    const input = document.getElementById('input-strengths');
    input.value = 'Great team';
    click(document.querySelector('.btn-add[data-quadrant="strengths"]'));

    const ul = document.getElementById('list-strengths');
    expect(ul.children.length).toBe(1);
    expect(ul.children[0].querySelector('.item-text').textContent).toBe('Great team');
  });

  test('pressing Enter in the input adds the item', () => {
    loadApp();

    const input = document.getElementById('input-weaknesses');
    input.value = 'Limited budget';
    pressEnter(input);

    expect(document.getElementById('list-weaknesses').children.length).toBe(1);
  });

  test('empty (whitespace-only) input does not add an item', () => {
    loadApp();

    const input = document.getElementById('input-threats');
    input.value = '   ';
    click(document.querySelector('.btn-add[data-quadrant="threats"]'));

    expect(document.getElementById('list-threats').children.length).toBe(0);
  });

  test('item is saved to localStorage after adding', () => {
    loadApp();

    const input = document.getElementById('input-opportunities');
    input.value = 'Market expansion';
    click(document.querySelector('.btn-add[data-quadrant="opportunities"]'));

    const saved = getStorageData();
    expect(saved.items.opportunities).toContain('Market expansion');
  });

  test('input is cleared after adding an item', () => {
    loadApp();

    const input = document.getElementById('input-strengths');
    input.value = 'Some strength';
    click(document.querySelector('.btn-add[data-quadrant="strengths"]'));

    expect(input.value).toBe('');
  });
});

/* ---- Removing items ---- */
describe('Removing items', () => {
  test('clicking delete removes the item from the list', () => {
    loadApp({
      title: '',
      items: { strengths: ['Item A', 'Item B'], weaknesses: [], opportunities: [], threats: [] },
    });

    const ul = document.getElementById('list-strengths');
    expect(ul.children.length).toBe(2);

    click(ul.children[0].querySelector('.btn-delete'));

    expect(ul.children.length).toBe(1);
  });

  test('removing an item updates localStorage', () => {
    loadApp({
      title: '',
      items: { strengths: ['Only item'], weaknesses: [], opportunities: [], threats: [] },
    });

    const ul = document.getElementById('list-strengths');
    click(ul.children[0].querySelector('.btn-delete'));

    const saved = getStorageData();
    expect(saved.items.strengths).toHaveLength(0);
  });
});

/* ---- Title persistence ---- */
describe('Title persistence', () => {
  test('typing in the title input saves it to localStorage', () => {
    loadApp();

    const titleInput = document.getElementById('analysis-title');
    titleInput.value = 'Q3 Strategy';
    titleInput.dispatchEvent(new Event('input', { bubbles: true }));

    const saved = getStorageData();
    expect(saved.title).toBe('Q3 Strategy');
  });
});

/* ---- Clear all ---- */
describe('Clear all', () => {
  test('clear button removes all items from every quadrant', () => {
    loadApp({
      title: 'Test',
      items: {
        strengths: ['S1'],
        weaknesses: ['W1'],
        opportunities: ['O1'],
        threats: ['T1'],
      },
    });

    click(document.getElementById('btn-clear'));

    QUADRANTS.forEach(q => {
      expect(document.getElementById('list-' + q).children.length).toBe(0);
    });
  });
});
