# Design Specification: Mac Apps Support for Personal Plugin Server

**Date:** 2026-10-15  
**Status:** Approved  
**Author:** AI Pair Programmer & User  

---

## 1. Overview & Objective

The personal plugin server (`pluginServer`) hosts and distributes personal developer tools, browser extensions, and webapps. The goal of this feature is to add comprehensive support for native macOS applications (`.dmg`, `.zip`, `.pkg`), providing:
1. A new `mac` target schema for `registry.json`.
2. Public API and script updates for registering and syncing Mac applications from GitHub Releases.
3. Enhanced web portal UI (`index.html`) featuring a "Mac Apps" filter button, dynamic download labels (`Download .dmg`, `Download .zip`, etc.), and a dedicated macOS installation guide covering Gatekeeper bypass techniques (`xattr -cr`).
4. Directory structure updates (`plugins/mac/`) and updated `README.md` documentation.

---

## 2. Testing Seams & TDD Verification

Per strict Test-Driven Development (TDD) rules, changes will be built in vertical red-green slices against public seam interfaces before touching internal code.

### Seam 1: `updateOrAddPlugin` in `scripts/update-registry.js`
- **Interface**: `updateOrAddPlugin(registry, plugin)`
- **Behavior**:
  - Accepts plugin objects with `target: 'mac'`.
  - Merges into the registry without altering unrelated targets.
  - Correctly retains `downloadUrl` with Mac package extensions (`.dmg`, `.zip`, `.pkg`).
  - Sets `updatedAt` timestamp.
- **Verification**: Node.js test runner unit test in `scripts/update-registry.test.js`.

### Seam 2: `formatReleaseToPlugin` in `scripts/update-registry.js`
- **Interface**: `formatReleaseToPlugin(release, trackedConfig)`
- **Behavior**:
  - Automatically matches `.dmg`, `.pkg`, or `.zip` assets when `target: 'mac'` and no custom `assetPattern` is specified (or when specified with Mac patterns).
  - Resolves `browser_download_url` for Mac binary assets from GitHub Release payloads.
- **Verification**: Node.js test runner unit test in `scripts/update-registry.test.js`.

---

## 3. Data Model & Registry Schema

In `registry.json`, Mac entries conform to the following schema:

```json
{
  "id": "sample-mac-app",
  "target": "mac",
  "name": "Sample Mac App",
  "version": "1.0.0",
  "description": "Native macOS productivity application.",
  "downloadUrl": "plugins/mac/sample-mac-app.dmg",
  "updatedAt": "2026-10-15"
}
```

- `target`: String literal `"mac"`.
- `downloadUrl`: Local relative path (e.g. `plugins/mac/<file>.dmg`) or full remote GitHub Release URL (e.g. `https://github.com/.../releases/download/.../<file>.dmg`).

---

## 4. Web Portal UI (`index.html`)

### 4.1 Filter Bar
- Add a new filter tab:
  ```html
  <button class="filter-btn" data-target="mac" onclick="filterPlugins('mac')">Mac Apps</button>
  ```
- Ensure active class toggle correctly matches target `'mac'` $\leftrightarrow$ `'Mac Apps'`.

### 4.2 Card Rendering
- **Target Badge**: When `plugin.target === 'mac'`, display `Mac App`.
- **Dynamic Download Button**: Instead of a hardcoded "Download .zip" label:
  - If URL ends with `.dmg` $\rightarrow$ `Download .dmg`
  - If URL ends with `.pkg` $\rightarrow$ `Download .pkg`
  - If URL ends with `.zip` $\rightarrow$ `Download .zip`
  - Fallback for `mac` target $\rightarrow$ `Download Mac App`

### 4.3 macOS Installation Guide Card
A new card in the instructions section:
- **Title**: "How to install on macOS"
- **Steps**:
  1. Download `.dmg` or `.zip` package.
  2. For `.dmg`, double-click to mount and drag `.app` to `/Applications`. For `.zip`, extract and move `.app` to `/Applications`.
  3. **Gatekeeper / Unsigned Developer Handling**:
     - *GUI*: Right-click (or Control-click) `.app` in Finder $\rightarrow$ Open $\rightarrow$ Open.
     - *Terminal*: Run `xattr -cr /Applications/<App>.app` to clear the quarantine flag.

---

## 5. File System & Documentation Changes

1. **`plugins/mac/`**:
   - Create directory with `.gitkeep` for tracking local archives.
2. **`README.md`**:
   - Add `plugins/mac/` to directory layout.
   - Add installation instructions for macOS apps.
   - Add packaging and registry instructions for macOS apps.
3. **`scripts/sync-releases.js`**:
   - Document how to add tracked Mac repositories.
