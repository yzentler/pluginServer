import fs from 'node:fs';
import path from 'node:path';

/**
 * Updates an existing plugin entry or adds a new one in the registry object.
 *
 * @param {Object} registry - The current registry object with a `plugins` array.
 * @param {Object} plugin - Plugin metadata. Must contain at least `id`, `name`, `target`, and `version`.
 * @returns {Object} The updated registry object.
 */
export function updateOrAddPlugin(registry, plugin) {
  if (!plugin || !plugin.id || !plugin.name) {
    throw new Error('Missing required plugin fields: id and name are mandatory.');
  }

  const existingPlugins = Array.isArray(registry?.plugins) ? [...registry.plugins] : [];
  const index = existingPlugins.findIndex(p => p.id === plugin.id);

  const updatedEntry = {
    ...(index >= 0 ? existingPlugins[index] : {}),
    ...plugin,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  if (index >= 0) {
    existingPlugins[index] = updatedEntry;
  } else {
    existingPlugins.push(updatedEntry);
  }

  return {
    ...registry,
    plugins: existingPlugins
  };
}

/**
 * Formats a GitHub Release API response into a plugin registry entry.
 *
 * @param {Object} release - GitHub release object with `tag_name` and `assets`.
 * @param {Object} trackedConfig - Configuration containing `id`, `name`, `target`, `description`, and optional `assetPattern`.
 * @returns {Object} Plugin entry ready for updateOrAddPlugin.
 */
export function formatReleaseToPlugin(release, trackedConfig) {
  const version = release.tag_name ? release.tag_name.replace(/^v/, '') : '1.0.0';
  const assetPattern = trackedConfig.assetPattern || /\.zip$/i;
  const asset = (release.assets || []).find(a => assetPattern.test(a.name));

  return {
    id: trackedConfig.id,
    target: trackedConfig.target,
    name: trackedConfig.name,
    version,
    description: trackedConfig.description,
    downloadUrl: asset ? asset.browser_download_url : undefined
  };
}

/**
 * Reads registry.json, updates/adds a plugin, and writes back formatted JSON.
 */
export function updateRegistryFile(registryFilePath, plugin) {
  const absolutePath = path.resolve(registryFilePath);
  const raw = fs.readFileSync(absolutePath, 'utf-8');
  const registry = JSON.parse(raw);
  const updated = updateOrAddPlugin(registry, plugin);
  fs.writeFileSync(absolutePath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  return updated;
}
