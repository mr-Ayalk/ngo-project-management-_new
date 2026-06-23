'use client';

import { useEffect } from 'react';
import { getSuggestions, rememberFieldValue } from '@/lib/form-memory';
import { resolveOptionFromQuery } from '@/lib/searchable-select-utils';

const ENHANCEABLE = 'input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=file]):not([type=password]):not(.searchable-select-input), textarea';
const ENHANCEABLE_SELECT = 'select:not([multiple]):not(.no-search-enhance)';

function fieldKey(el) {
  return el.getAttribute('name') || el.getAttribute('id') || el.getAttribute('placeholder') || 'field';
}

function ensureSuggestionsBox(el) {
  let box = el.parentElement?.querySelector('.smart-suggest-box');
  if (box) return box;
  const wrap = el.closest('.form-field') || el.parentElement;
  if (!wrap) return null;
  if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
  box = document.createElement('div');
  box.className = 'smart-suggest-box';
  box.hidden = true;
  wrap.appendChild(box);
  return box;
}

function enhanceElement(el) {
  if (el.dataset.smartEnhanced === '1') return;
  el.dataset.smartEnhanced = '1';
  el.spellcheck = true;
  el.setAttribute('lang', 'en');
  el.setAttribute('autocomplete', 'off');
  el.classList.add('smart-field');

  const showSuggestions = () => {
    const box = ensureSuggestionsBox(el);
    if (!box) return;
    const list = getSuggestions(el.value, fieldKey(el));
    if (!list.length) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    box.hidden = false;
    box.innerHTML = list.map((s) => `<button type="button" class="smart-suggest-item" data-value="${s.replace(/"/g, '&quot;')}">${s}</button>`).join('');
  };

  el.addEventListener('input', showSuggestions);
  el.addEventListener('focus', showSuggestions);
  el.addEventListener('blur', () => {
    rememberFieldValue(el.value, fieldKey(el));
    setTimeout(() => {
      const box = el.parentElement?.querySelector('.smart-suggest-box');
      if (box) { box.hidden = true; box.innerHTML = ''; }
    }, 180);
  });

  el.addEventListener('keydown', (e) => {
    const box = el.parentElement?.querySelector('.smart-suggest-box:not([hidden])');
    if (!box) return;
    const items = [...box.querySelectorAll('.smart-suggest-item')];
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[0]?.focus();
    }
  });
}

function enhanceSelect(select) {
  if (select.dataset.searchEnhanced === '1') return;
  if (select.closest('.searchable-select-wrap') || select.closest('.native-enhanced-select')) return;

  select.dataset.searchEnhanced = '1';

  const field = select.closest('.form-field') || select.parentElement;
  if (!field) return;

  const wrap = document.createElement('div');
  wrap.className = 'searchable-select native-enhanced-select';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'searchable-select-input smart-field';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('spellcheck', 'false');
  if (select.required) input.required = true;
  const firstOpt = select.options[select.selectedIndex] || select.options[0];
  input.placeholder = firstOpt?.text ? `Search ${firstOpt.text}…` : 'Type to search…';

  const chevron = document.createElement('button');
  chevron.type = 'button';
  chevron.className = 'searchable-select-chevron';
  chevron.tabIndex = -1;
  chevron.setAttribute('aria-label', 'Toggle options');
  chevron.innerHTML = '<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg>';

  const list = document.createElement('ul');
  list.className = 'searchable-select-list';
  list.setAttribute('role', 'listbox');
  list.hidden = true;

  select.classList.add('searchable-select-native');
  field.insertBefore(wrap, select);
  wrap.appendChild(input);
  wrap.appendChild(chevron);
  wrap.appendChild(list);
  wrap.appendChild(select);

  const getOptions = () => [...select.options].filter((o) => o.value !== '');

  const syncFromSelect = () => {
    const opt = select.options[select.selectedIndex];
    input.value = opt && opt.value ? opt.text : '';
  };

  const commitInput = () => {
    const typed = input.value.trim();
    if (!typed) {
      if (select.value) {
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      input.value = '';
      return;
    }

    const opts = getOptions().map((o) => ({ value: o.value, label: o.text }));
    const resolved = resolveOptionFromQuery(typed, opts);
    if (resolved) {
      select.value = resolved.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      input.value = resolved.label;
      return;
    }

    // Keep typed text visible if it matches current selection label
    const current = select.options[select.selectedIndex];
    if (current?.value && current.text.toLowerCase() === typed.toLowerCase()) {
      input.value = current.text;
      return;
    }

    syncFromSelect();
  };

  const renderList = (filter = '') => {
    const q = filter.trim().toLowerCase();
    const opts = getOptions().filter((o) => !q || o.text.toLowerCase().includes(q));
    list.innerHTML = opts.map((o) => {
      const active = o.value === select.value ? ' class="active"' : '';
      return `<li><button type="button" data-value="${o.value.replace(/"/g, '&quot;')}"${active}>${o.text}</button></li>`;
    }).join('');
    list.hidden = opts.length === 0;
  };

  const closeList = () => { list.hidden = true; };

  const openList = () => {
    renderList(input.value);
    list.hidden = getOptions().length === 0;
  };

  syncFromSelect();

  input.addEventListener('input', () => {
    openList();
    if (!input.value.trim()) {
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  input.addEventListener('focus', openList);
  input.addEventListener('blur', () => {
    setTimeout(() => {
      commitInput();
      closeList();
    }, 180);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !list.hidden) {
      const first = list.querySelector('button[data-value]');
      if (first) {
        e.preventDefault();
        select.value = first.dataset.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        input.value = first.textContent || '';
        closeList();
      }
    }
  });

  chevron.addEventListener('mousedown', (e) => e.preventDefault());
  chevron.addEventListener('click', () => {
    if (list.hidden) {
      input.focus();
      openList();
    } else {
      closeList();
    }
  });

  list.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('button[data-value]');
    if (!btn) return;
    e.preventDefault();
    select.value = btn.dataset.value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    input.value = btn.textContent || '';
    closeList();
  });

  select.addEventListener('change', () => {
    if (document.activeElement !== input) syncFromSelect();
  });

  const observer = new MutationObserver(() => {
    if (document.activeElement === input) return;
    syncFromSelect();
    if (!list.hidden) renderList(input.value);
  });
  observer.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['value'] });
}

function handleSuggestClick(e) {
  const btn = e.target.closest('.smart-suggest-item');
  if (!btn) return;
  const wrap = btn.closest('.form-field') || btn.parentElement?.parentElement;
  const input = wrap?.querySelector('.smart-field:not(.searchable-select-input)') || wrap?.querySelector('.smart-field');
  if (!input) return;
  input.value = btn.dataset.value || btn.textContent || '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  btn.parentElement.hidden = true;
  input.focus();
}

export default function FormEnhancer() {
  useEffect(() => {
    document.querySelectorAll(ENHANCEABLE).forEach(enhanceElement);
    document.querySelectorAll(ENHANCEABLE_SELECT).forEach(enhanceSelect);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(ENHANCEABLE)) enhanceElement(node);
          if (node.matches?.(ENHANCEABLE_SELECT)) enhanceSelect(node);
          node.querySelectorAll?.(ENHANCEABLE).forEach(enhanceElement);
          node.querySelectorAll?.(ENHANCEABLE_SELECT).forEach(enhanceSelect);
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('mousedown', handleSuggestClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('mousedown', handleSuggestClick);
    };
  }, []);

  return null;
}
