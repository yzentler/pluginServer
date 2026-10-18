import test from 'node:test';
import assert from 'node:assert/strict';
import { updateOrAddPlugin, formatReleaseToPlugin } from './update-registry.js';

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

test('updateOrAddPlugin - supports webapp target with openUrl', () => {
  const initialRegistry = { plugins: [] };
  const webapp = {
    id: 'family-shopping-list',
    target: 'webapp',
    name: 'Family Shopping List',
    version: '1.0.0',
    description: 'Shared real-time shopping list PWA',
    openUrl: 'https://zentler-shopping--list.web.app'
  };

  const result = updateOrAddPlugin(initialRegistry, webapp);
  assert.equal(result.plugins.length, 1);
  assert.equal(result.plugins[0].target, 'webapp');
  assert.equal(result.plugins[0].openUrl, 'https://zentler-shopping--list.web.app');
});

test('formatReleaseToPlugin - automatically matches .dmg asset for mac target', async () => {
  const { formatReleaseToPlugin } = await import('./update-registry.js');
  const release = {
    tag_name: 'v1.0.0',
    assets: [
      {
        name: 'SuperTool-1.0.0.dmg',
        browser_download_url: 'https://github.com/yzentler/superTool/releases/download/v1.0.0/SuperTool-1.0.0.dmg'
      }
    ]
  };

  const trackedConfig = {
    id: 'super-tool',
    target: 'mac',
    name: 'Super Tool',
    description: 'A native macOS utility.'
  };

  const formatted = formatReleaseToPlugin(release, trackedConfig);
  assert.equal(formatted.id, 'super-tool');
  assert.equal(formatted.target, 'mac');
  assert.equal(formatted.version, '1.0.0');
  assert.equal(formatted.downloadUrl, 'https://github.com/yzentler/superTool/releases/download/v1.0.0/SuperTool-1.0.0.dmg');
});

test('updateOrAddPlugin - supports mac target with dmg downloadUrl', () => {
  const initialRegistry = { plugins: [] };
  const macApp = {
    id: 'super-tool',
    target: 'mac',
    name: 'Super Tool',
    version: '1.0.0',
    description: 'A native macOS utility.',
    downloadUrl: 'plugins/mac/SuperTool.dmg'
  };

  const result = updateOrAddPlugin(initialRegistry, macApp);
  assert.equal(result.plugins.length, 1);
  assert.equal(result.plugins[0].id, 'super-tool');
  assert.equal(result.plugins[0].target, 'mac');
  assert.equal(result.plugins[0].downloadUrl, 'plugins/mac/SuperTool.dmg');
  assert.ok(result.plugins[0].updatedAt);
});

test('formatReleaseToPlugin - extracts asset download_count into downloads field', async () => {
  const { formatReleaseToPlugin } = await import('./update-registry.js');
  const release = {
    tag_name: 'v2.3.0',
    assets: [
      {
        name: 'clickbait-remover.zip',
        browser_download_url: 'https://github.com/yzentler/clickbaitRemover/releases/download/v2.3.0/clickbait-remover.zip',
        download_count: 85
      }
    ]
  };

  const trackedConfig = {
    id: 'clickbait-remover',
    target: 'chrome',
    name: 'Spoiler (Clickbait Remover)',
    description: 'Right-click any headline.'
  };

  const formatted = formatReleaseToPlugin(release, trackedConfig);
  assert.equal(formatted.downloads, 85);
});

test('updateOrAddPlugin - retains and updates downloads count', () => {
  const initialRegistry = {
    plugins: [
      {
        id: 'clickbait-remover',
        name: 'Spoiler',
        target: 'chrome',
        version: '1.0.0',
        downloads: 10
      }
    ]
  };

  const updatedPlugin = {
    id: 'clickbait-remover',
    name: 'Spoiler',
    target: 'chrome',
    version: '1.1.0',
    downloads: 42
  };

  const result = updateOrAddPlugin(initialRegistry, updatedPlugin);
  assert.equal(result.plugins.length, 1);
  assert.equal(result.plugins[0].downloads, 42);
  assert.equal(result.plugins[0].version, '1.1.0');
});

test('formatReleaseToPlugin - accepts totalDownloads across releases when provided', () => {
  const release = {
    tag_name: 'v2.0.0',
    assets: [
      {
        name: 'app.zip',
        browser_download_url: 'https://example.com/app.zip',
        download_count: 5
      }
    ]
  };

  const trackedConfig = {
    id: 'app',
    target: 'chrome',
    name: 'App',
    description: 'An app'
  };

  const formatted = formatReleaseToPlugin(release, trackedConfig, 120);
  assert.equal(formatted.downloads, 120);
});





