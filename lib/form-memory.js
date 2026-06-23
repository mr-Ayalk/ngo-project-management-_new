const STORAGE_KEY = 'ena-form-memory-v1';
const MAX_PHRASES = 400;
const MAX_WORDS = 800;

function loadStore() {
  if (typeof window === 'undefined') return { phrases: [], words: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { phrases: [], words: [] };
    const parsed = JSON.parse(raw);
    return {
      phrases: Array.isArray(parsed.phrases) ? parsed.phrases : [],
      words: Array.isArray(parsed.words) ? parsed.words : [],
    };
  } catch {
    return { phrases: [], words: [] };
  }
}

function saveStore(store) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function uniqPush(list, value, max) {
  const next = [value, ...list.filter((v) => v.toLowerCase() !== value.toLowerCase())];
  return next.slice(0, max);
}

export function rememberFieldValue(value, fieldKey = 'global') {
  const text = String(value || '').trim();
  if (!text || text.length < 2) return;

  const store = loadStore();
  store.phrases = uniqPush(store.phrases, `${fieldKey}::${text}`, MAX_PHRASES);

  text.split(/\s+/).forEach((word) => {
    const w = word.replace(/[^\w'-]/g, '');
    if (w.length >= 3) store.words = uniqPush(store.words, w, MAX_WORDS);
  });

  saveStore(store);
}

export function getSuggestions(inputValue, fieldKey = 'global', limit = 8) {
  const q = String(inputValue || '').trim().toLowerCase();
  if (q.length < 2) return [];

  const store = loadStore();
  const scoped = store.phrases
    .filter((p) => p.startsWith(`${fieldKey}::`))
    .map((p) => p.slice(fieldKey.length + 2));

  const pool = [...scoped, ...store.phrases.map((p) => p.split('::').pop())];
  const seen = new Set();
  const out = [];

  for (const item of pool) {
    const val = String(item || '').trim();
    if (!val || val.toLowerCase() === q) continue;
    if (!val.toLowerCase().includes(q) && !val.toLowerCase().startsWith(q)) continue;
    const key = val.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(val);
    if (out.length >= limit) break;
  }

  if (out.length < limit) {
    for (const word of store.words) {
      if (!word.toLowerCase().startsWith(q)) continue;
      const key = word.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(word);
      if (out.length >= limit) break;
    }
  }

  return out;
}
