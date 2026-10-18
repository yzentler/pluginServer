export const COUNTER_BASE_URL = 'https://abacus.jasoncameron.dev';

/**
 * Formats a clean counter URL for hit (increment) or get (fetch).
 *
 * @param {string} namespace
 * @param {string} pluginId
 * @param {'get'|'hit'} action
 * @returns {string}
 */
export function formatCounterUrl(namespace, pluginId, action = 'get') {
  const sanitizedId = String(pluginId || '').trim().replace(/\s+/g, '-');
  const sanitizedNamespace = String(namespace || '').trim().replace(/\s+/g, '-');
  const validAction = action === 'hit' ? 'hit' : 'get';
  return `${COUNTER_BASE_URL}/${validAction}/${sanitizedNamespace}/${sanitizedId}`;
}

/**
 * Combines registry base downloads with live serverless counter clicks.
 *
 * @param {number|undefined|null} baseDownloads
 * @param {number|undefined|null} liveClicks
 * @returns {number}
 */
export function combineDownloadCounts(baseDownloads, liveClicks) {
  const base = typeof baseDownloads === 'number' && !isNaN(baseDownloads) && baseDownloads > 0 ? baseDownloads : 0;
  const clicks = typeof liveClicks === 'number' && !isNaN(liveClicks) && liveClicks > 0 ? liveClicks : 0;
  return base + clicks;
}
