/**
 * SWOT Analysis App
 * Manages four quadrants: Strengths, Weaknesses, Opportunities, Threats.
 * Data is persisted to localStorage so the analysis survives page reloads.
 */

(function () {
  'use strict';

  const QUADRANTS = ['strengths', 'weaknesses', 'opportunities', 'threats'];
  const STORAGE_KEY = 'swot-analysis-data';

  /* -------------------------------------------------------
     State
  ------------------------------------------------------- */
  let state = {
    title: '',
    items: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
  };

  /* -------------------------------------------------------
     Persistence helpers
  ------------------------------------------------------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state = parsed;
          // Ensure all quadrant arrays exist after migration
          QUADRANTS.forEach(function (q) {
            if (!Array.isArray(state.items[q])) {
              state.items[q] = [];
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not load SWOT data from localStorage:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save SWOT data to localStorage:', e);
    }
  }

  /* -------------------------------------------------------
     DOM helpers
  ------------------------------------------------------- */
  function getList(quadrant) {
    return document.getElementById('list-' + quadrant);
  }

  function getInput(quadrant) {
    return document.getElementById('input-' + quadrant);
  }

  /**
   * Creates a <li> element for a SWOT item.
   * @param {string} text   - item text
   * @param {string} quadrant
   * @param {number} index  - position in state.items[quadrant]
   */
  function createItemElement(text, quadrant, index) {
    const li = document.createElement('li');
    li.className = 'swot-item';
    li.dataset.index = index;

    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = text;
    span.contentEditable = 'true';
    span.setAttribute('aria-label', 'Edit item');
    span.addEventListener('blur', function () {
      const newText = span.textContent.trim();
      if (newText === '') {
        removeItem(quadrant, Number(li.dataset.index));
      } else {
        state.items[quadrant][Number(li.dataset.index)] = newText;
        saveState();
      }
    });
    span.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        span.blur();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = '×';
    delBtn.setAttribute('aria-label', 'Remove item');
    delBtn.addEventListener('click', function () {
      removeItem(quadrant, Number(li.dataset.index));
    });

    li.appendChild(span);
    li.appendChild(delBtn);
    return li;
  }

  /* -------------------------------------------------------
     Render
  ------------------------------------------------------- */
  function renderQuadrant(quadrant) {
    const ul = getList(quadrant);
    ul.innerHTML = '';
    state.items[quadrant].forEach(function (text, idx) {
      ul.appendChild(createItemElement(text, quadrant, idx));
    });
  }

  function renderAll() {
    document.getElementById('analysis-title').value = state.title || '';
    QUADRANTS.forEach(renderQuadrant);
  }

  /* -------------------------------------------------------
     CRUD operations
  ------------------------------------------------------- */
  function addItem(quadrant) {
    const input = getInput(quadrant);
    const text = input.value.trim();
    if (!text) return;

    state.items[quadrant].push(text);
    saveState();
    renderQuadrant(quadrant);
    input.value = '';
    input.focus();
  }

  function removeItem(quadrant, index) {
    state.items[quadrant].splice(index, 1);
    saveState();
    renderQuadrant(quadrant);
  }

  function clearAll() {
    if (!window.confirm('Clear all items in every quadrant? This cannot be undone.')) return;
    QUADRANTS.forEach(function (q) {
      state.items[q] = [];
    });
    saveState();
    renderAll();
  }

  /* -------------------------------------------------------
     Event wiring
  ------------------------------------------------------- */
  function wireAddButtons() {
    document.querySelectorAll('.btn-add').forEach(function (btn) {
      const quadrant = btn.dataset.quadrant;
      btn.addEventListener('click', function () {
        addItem(quadrant);
      });
    });
  }

  function wireInputEnter() {
    QUADRANTS.forEach(function (quadrant) {
      const input = getInput(quadrant);
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          addItem(quadrant);
        }
      });
    });
  }

  function wireTitleInput() {
    const titleInput = document.getElementById('analysis-title');
    titleInput.addEventListener('input', function () {
      state.title = titleInput.value;
      saveState();
    });
  }

  function wireClearButton() {
    document.getElementById('btn-clear').addEventListener('click', clearAll);
  }

  function wirePrintButton() {
    document.getElementById('btn-print').addEventListener('click', function () {
      window.print();
    });
  }

  /* -------------------------------------------------------
     Boot
  ------------------------------------------------------- */
  function init() {
    loadState();
    renderAll();
    wireAddButtons();
    wireInputEnter();
    wireTitleInput();
    wireClearButton();
    wirePrintButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
