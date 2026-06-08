export const CONFIG_PAGES = [
  { id: 'units', label: 'Units', description: 'Organizational units, program areas, and operational divisions.' },
  { id: 'indicators', label: 'Indicators', description: 'M&E indicators, targets, and measurement frameworks.' },
];

export const CONFIG_EXTRA = [];

export function isConfigPage(pageId) {
  return pageId === 'units' || pageId === 'indicators';
}

export function getConfigPageMeta(pageId) {
  return CONFIG_PAGES.find((p) => p.id === pageId) || null;
}
