'use client';

import { useEffect } from 'react';
import { getSuggestions, rememberFieldValue } from '@/lib/form-memory';

const ENHANCEABLE = 'input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=submit]):not([type=button]):not([type=file]):not([type=password]), textarea';

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

function handleSuggestClick(e) {
  const btn = e.target.closest('.smart-suggest-item');
  if (!btn) return;
  const wrap = btn.closest('.form-field') || btn.parentElement?.parentElement;
  const input = wrap?.querySelector('.smart-field');
  if (!input) return;
  input.value = btn.dataset.value || btn.textContent || '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  btn.parentElement.hidden = true;
  input.focus();
}

export default function FormEnhancer() {
  useEffect(() => {
    document.querySelectorAll(ENHANCEABLE).forEach(enhanceElement);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches?.(ENHANCEABLE)) enhanceElement(node);
          node.querySelectorAll?.(ENHANCEABLE).forEach(enhanceElement);
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
