import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCounterUrl, combineDownloadCounts } from './download-tracker.js';

test('formatCounterUrl - constructs get and hit URLs', () => {
  const getUrl = formatCounterUrl('yzentler-pluginServer', 'multiclip', 'get');
  assert.equal(getUrl, 'https://abacus.jasoncameron.dev/get/yzentler-pluginServer/multiclip');

  const hitUrl = formatCounterUrl('yzentler-pluginServer', 'multiclip', 'hit');
  assert.equal(hitUrl, 'https://abacus.jasoncameron.dev/hit/yzentler-pluginServer/multiclip');
});

test('formatCounterUrl - sanitizes plugin id characters', () => {
  const url = formatCounterUrl('yzentler-pluginServer', 'focus Master v1.0', 'hit');
  assert.equal(url, 'https://abacus.jasoncameron.dev/hit/yzentler-pluginServer/focus-Master-v1.0');
});

test('combineDownloadCounts - combines base and live clicks safely', () => {
  assert.equal(combineDownloadCounts(0, 5), 5);
  assert.equal(combineDownloadCounts(10, 5), 15);
  assert.equal(combineDownloadCounts(10, null), 10);
  assert.equal(combineDownloadCounts(undefined, 2), 2);
  assert.equal(combineDownloadCounts(undefined, undefined), 0);
  assert.equal(combineDownloadCounts(5, -1), 5);
});
