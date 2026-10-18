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
  },
  {
    repo: 'yzentler/captchaSolver',
    id: 'captcha-solver',
    target: 'chrome',
    name: 'Captcha Solver',
    description: 'Privacy-preserving, zero-cost client-side distorted text challenge recognition and autofill.',
    assetPattern: /captcha.*\.zip$/i
  }
];

// Tracked webapps where the deployment URL or repo homepage is monitored
const TRACKED_WEBAPPS = [
  {
    repo: 'yzentler/family-shopping-list',
    id: 'family-shopping-list',
    target: 'webapp',
    name: 'Family Shopping List',
    description: 'Real-time collaborative shopping list PWA with offline support and instant sync.',
    fallbackUrl: 'https://zentler-shopping--list.web.app'
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
      
      // Calculate lifetime downloads across all releases of this repository
      let totalDownloads = undefined;
      try {
        const allReleasesRes = await fetch(`https://api.github.com/repos/${config.repo}/releases?per_page=100`, { headers });
        if (allReleasesRes.ok) {
          const allReleases = await allReleasesRes.json();
          const defaultPattern = config.target === 'mac' ? /\.(dmg|pkg|zip)$/i : /\.zip$/i;
          const assetPattern = config.assetPattern || defaultPattern;
          let sum = 0;
          for (const rel of allReleases) {
            for (const asset of rel.assets || []) {
              if (assetPattern.test(asset.name)) {
                sum += (asset.download_count || 0);
              }
            }
          }
          totalDownloads = sum;
        }
      } catch (e) {
        console.warn(`Could not compute lifetime downloads for ${config.repo}:`, e.message);
      }

      const pluginEntry = formatReleaseToPlugin(release, config, totalDownloads);
      if (!pluginEntry.downloadUrl) {
        console.warn(`No matching release asset found in latest release for ${config.repo}`);
        continue;
      }

      updateRegistryFile(registryPath, pluginEntry);
      console.log(`✓ Updated ${config.id} to version ${pluginEntry.version} (${pluginEntry.downloads} total downloads)`);
    } catch (err) {
      console.error(`Error syncing ${config.repo}:`, err.message);
    }
  }

  // Sync webapps
  for (const webapp of TRACKED_WEBAPPS) {
    try {
      console.log(`Checking repository metadata for webapp ${webapp.repo}...`);
      let liveUrl = webapp.fallbackUrl;

      const res = await fetch(`https://api.github.com/repos/${webapp.repo}`, { headers });
      if (res.ok) {
        const repoData = await res.json();
        if (repoData.homepage && repoData.homepage.trim() !== '') {
          liveUrl = repoData.homepage.trim();
        }
      }

      updateRegistryFile(registryPath, {
        id: webapp.id,
        target: webapp.target,
        name: webapp.name,
        version: 'live',
        description: webapp.description,
        openUrl: liveUrl
      });
      console.log(`✓ Updated webapp ${webapp.id} with URL: ${liveUrl}`);
    } catch (err) {
      console.error(`Error syncing webapp ${webapp.repo}:`, err.message);
    }
  }
}

syncAll();

