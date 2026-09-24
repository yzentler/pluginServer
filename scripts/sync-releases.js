import { formatReleaseToPlugin, updateRegistryFile } from './update-registry.js';

// Repositories tracked by pluginServer for automated syncing
const TRACKED_REPOSITORIES = [
  {
    repo: 'yzentler/clickbaitRemover',
    id: 'clickbait-remover',
    target: 'chrome',
    name: 'Spoiler (Clickbait Remover)',
    description: 'Right-click any headline or press Alt+V to reveal the hidden answer behind clickbait.',
    assetPattern: /clickbait.*\.zip$/i
  },
  {
    repo: 'yzentler/focusMaster',
    id: 'focusMaster',
    target: 'chrome',
    name: 'FocusMaster',
    description: 'Bypass Chrome background throttling and macOS occlusion. Keeps tabs active and running at full speed when hidden.',
    assetPattern: /focusMaster.*\.zip$/i
  }
];

async function syncAll() {
  const registryPath = './registry.json';
  const headers = { 'User-Agent': 'pluginServer-sync' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  for (const config of TRACKED_REPOSITORIES) {
    try {
      console.log(`Checking latest release for ${config.repo}...`);
      const res = await fetch(`https://api.github.com/repos/${config.repo}/releases/latest`, { headers });
      if (!res.ok) {
        console.warn(`Could not fetch release for ${config.repo}: ${res.statusText}`);
        continue;
      }

      const release = await res.json();
      const pluginEntry = formatReleaseToPlugin(release, config);
      if (!pluginEntry.downloadUrl) {
        console.warn(`No matching zip asset found in latest release for ${config.repo}`);
        continue;
      }

      updateRegistryFile(registryPath, pluginEntry);
      console.log(`✓ Updated ${config.id} to version ${pluginEntry.version}`);
    } catch (err) {
      console.error(`Error syncing ${config.repo}:`, err.message);
    }
  }
}

syncAll();
