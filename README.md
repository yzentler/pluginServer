# Personal Plugin Server

A lightweight, zero-cost personal plugin and extension registry powered by GitHub Pages.

Live URL: **https://yzentler.github.io/pluginServer/**

---

## Directory Structure

```text
├── index.html            # Web portal for 1-click downloads & instructions
├── registry.json         # Machine-readable catalog for scripts and future apps
├── plugins/              # Categorized plugin packages
│   └── chrome/           # Chrome extensions (.zip archives)
├── scripts/              # Tested registry management scripts
│   ├── update-registry.js
│   └── update-registry.test.js
└── .github/workflows/    # CI/CD and sync workflows
```

---

## How to Install Plugins on a New PC

1. Open Chrome on the new machine and navigate to:
   **[https://yzentler.github.io/pluginServer/](https://yzentler.github.io/pluginServer/)**
2. Click **Download .zip** next to the desired extension.
3. Unzip the downloaded file.
4. Go to `chrome://extensions` in Chrome.
5. Enable **Developer mode** (toggle in the top-right corner).
6. Click **Load unpacked** and select the unzipped folder.

---

## How to Add or Update a Plugin

There are two easy ways to add or update an extension:

### Method 1: Local Packaging & Registry Update (Immediate)

Run these two commands from `pluginServer`:

1. **Package the extension into a zip:**
   ```bash
   zip -r plugins/chrome/<extension-name>.zip /path/to/<extension-folder> -x "*.git*" -x ".DS_Store"
   ```

2. **Register or bump the extension:**
   ```bash
   node --input-type=module -e "
   import { updateRegistryFile } from './scripts/update-registry.js';
   updateRegistryFile('./registry.json', {
     id: '<extension-id>',
     target: 'chrome',
     name: '<Extension Name>',
     version: '<new-version>',
     description: '<description>',
     downloadUrl: 'plugins/chrome/<extension-name>.zip'
   });
   "
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add/update <extension-name> to v<new-version>"
   git push
   ```

---

### Method 2: Fully Automated via Git Tags (Zero Secrets Required)

Each extension repository can have its own GitHub Release workflow (`.github/workflows/release.yml`).

1. In your extension repo, tag your commit and push tags:
   ```bash
   git tag v1.0.0
   git push --tags
   ```
2. The GitHub Action in the extension repo automatically builds and attaches `your-extension.zip` to a public GitHub Release.
3. Point the `downloadUrl` in `registry.json` to the release asset URL:
   `https://github.com/yzentler/<repo-name>/releases/latest/download/<repo-name>.zip`

---

## Running Tests

To verify the registry updater logic before committing:

```bash
npm test
```
