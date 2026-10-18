# Design Specification: Download Count Display & GitHub Releases Integration

**Date:** 2026-10-18  
**Status:** Approved  
**Author:** AI Pair Programmer & User  

---

## 1. Overview & Objective

The personal plugin server (`pluginServer`) hosts and distributes personal developer tools, browser extensions, and webapps. The goal of this feature is to display download counters for items on the plugin server by integrating directly with GitHub Releases' native `download_count` tracking:
1. Support `downloads` metadata in `registry.json` for all downloadable packages.
2. Update the release formatting and registry updating scripts (`scripts/update-registry.js` & `scripts/sync-releases.js`) to extract and track `download_count` from GitHub Releases.
3. Update the web portal (`index.html`) to display a download counter badge on each downloadable tool card and refresh live download stats during manual update checks.
4. Establish a release organization path for existing and future tools to take full advantage of GitHub Release download analytics.

---

## 2. Testing Seams & TDD Verification

Per Test-Driven Development (TDD) rules, changes will be built in vertical red-green slices against public seam interfaces before touching internal code.

### Seam 1: `formatReleaseToPlugin` in `scripts/update-registry.js`
- **Interface**: `formatReleaseToPlugin(release, trackedConfig)`
- **Behavior**:
  - Extracts the matching asset's `download_count` from `release.assets` and assigns it to `downloads`.
  - If `download_count` is 0 or missing, it cleanly defaults to `0`.
- **Verification**: Node.js test runner unit test in `scripts/update-registry.test.js`.

### Seam 2: `updateOrAddPlugin` in `scripts/update-registry.js`
- **Interface**: `updateOrAddPlugin(registry, plugin)`
- **Behavior**:
  - Given a plugin entry containing `downloads: <number>`, it preserves/updates `downloads` on the registry entry.
  - Updates `updatedAt` timestamp and does not disrupt other fields.
- **Verification**: Node.js test runner unit test in `scripts/update-registry.test.js`.

---

## 3. Data Model & Registry Schema

In `registry.json`, downloadable tools will have a `downloads` integer property:

```json
{
  "id": "clickbait-remover",
  "target": "chrome",
  "name": "Spoiler (Clickbait Remover)",
  "version": "2.3.0",
  "description": "Right-click any headline or press Alt+V to reveal the hidden answer behind clickbait.",
  "downloadUrl": "https://github.com/yzentler/clickbaitRemover/releases/download/v2.3.0/clickbait-remover.zip",
  "downloads": 0,
  "updatedAt": "2026-10-18"
}
```

- `downloads`: Integer count of total downloads (or 0 if newly released / local).
- For web applications (`target: "webapp"`), `downloads` is omitted.

---

## 4. Web Portal UI (`index.html`)

### 4.1 Card Header & Download Badge
- In `renderPlugins(plugins)`:
  - When `plugin.downloads !== undefined && plugin.downloads !== null`, render:
    ```html
    <span class="download-tag">📥 ${Number(plugin.downloads).toLocaleString()} downloads</span>
    ```
- Styling (`.download-tag`):
  - Dark-mode complementary pill badge styled with `--accent` color, border, and comfortable padding.
- Web apps (`target: "webapp"`) omit the download tag.

### 4.2 Live Update Sync (`checkForLiveUpdates`)
- When the user clicks **🔄 Check for Updates**:
  - The script queries `https://api.github.com/repos/{repo}/releases/latest`.
  - Captures `asset.download_count` and updates `existing.downloads`.
  - Re-renders the cards with the latest download count.

---

## 5. Automation & Release Workflow

1. **`scripts/sync-releases.js`**:
   - Passes GitHub release data through `formatReleaseToPlugin`, populating `downloads` for all tracked repositories into `registry.json`.
2. **`README.md`**:
   - Documents how GitHub Releases track downloads automatically and how to publish/track tools.
