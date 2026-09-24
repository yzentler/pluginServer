import test from 'node:test';
import assert from 'node:assert/strict';
import { updateOrAddPlugin } from './update-registry.js';

test('updateOrAddPlugin - adds a new plugin to registry', () => {
  const initialRegistry = {
    plugins: [
      { id: 'plugin-a', name: 'Plugin A', version: '1.0.0', target: 'chrome' }
    ]
  };

  const newPlugin = {
    id: 'auto-clicker-extension',
    target: 'chrome',
    name: 'Targeted Auto-Clicker',
    version: '1.0',
    description: 'Auto clicks elements',
    downloadUrl: 'plugins/chrome/auto-clicker-extension.zip'
  };

  const result = updateOrAddPlugin(initialRegistry, newPlugin);

  assert.equal(result.plugins.length, 2);
  const added = result.plugins.find(p => p.id === 'auto-clicker-extension');
  assert.ok(added);
  assert.equal(added.name, 'Targeted Auto-Clicker');
  assert.equal(added.version, '1.0');
  assert.ok(added.updatedAt);
});

test('updateOrAddPlugin - updates existing plugin without duplicates', () => {
  const initialRegistry = {
    plugins: [
      {
        id: 'auto-clicker-extension',
        target: 'chrome',
        name: 'Targeted Auto-Clicker',
        version: '1.0',
        description: 'Auto clicks elements',
        downloadUrl: 'old-url.zip',
        updatedAt: '2026-01-01'
      }
    ]
  };

  const updatedPlugin = {
    id: 'auto-clicker-extension',
    target: 'chrome',
    name: 'Targeted Auto-Clicker Pro',
    version: '1.1',
    description: 'Updated description',
    downloadUrl: 'new-url.zip'
  };

  const result = updateOrAddPlugin(initialRegistry, updatedPlugin);

  assert.equal(result.plugins.length, 1);
  assert.equal(result.plugins[0].name, 'Targeted Auto-Clicker Pro');
  assert.equal(result.plugins[0].version, '1.1');
  assert.equal(result.plugins[0].downloadUrl, 'new-url.zip');
  assert.notEqual(result.plugins[0].updatedAt, '2026-01-01');
});

test('updateOrAddPlugin - rejects invalid plugin without id or name', () => {
  const initialRegistry = { plugins: [] };
  assert.throws(() => updateOrAddPlugin(initialRegistry, {}), /Missing required plugin fields/);
});

test('formatReleaseToPlugin - extracts plugin info from release metadata', async () => {
  const { formatReleaseToPlugin } = await import('./update-registry.js');
  const release = {
    tag_name: 'v2.2.0',
    assets: [
      {
        name: 'clickbait-remover.zip',
        browser_download_url: 'https://github.com/yzentler/clickbaitRemover/releases/download/v2.2.0/clickbait-remover.zip'
      }
    ]
  };

  const trackedConfig = {
    id: 'clickbait-remover',
    target: 'chrome',
    name: 'Spoiler (Clickbait Remover)',
    description: 'Right-click any headline to reveal the hidden answer behind clickbait.',
    assetPattern: /\.zip$/i
  };

  const formatted = formatReleaseToPlugin(release, trackedConfig);
  assert.equal(formatted.id, 'clickbait-remover');
  assert.equal(formatted.version, '2.2.0');
  assert.equal(formatted.downloadUrl, 'https://github.com/yzentler/clickbaitRemover/releases/download/v2.2.0/clickbait-remover.zip');
});
