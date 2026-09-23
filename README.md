# Plugin Server

A lightweight, zero-cost personal plugin and extension registry powered by GitHub Pages.

## Directory Structure

```text
├── index.html            # Web portal for browsing & 1-click downloads
├── registry.json         # Machine-readable catalog for scripts / future apps
├── plugins/              # Categorized plugin artifacts
│   ├── chrome/           # Chrome extensions (.zip / .crx)
│   └── vscode/           # Future: VS Code extensions (.vsix), etc.
└── scripts/              # Helper packaging/release scripts
```

## How to Install on a New PC

### Google Chrome Extensions
1. Visit your GitHub Pages URL (e.g., `https://<your-username>.github.io/pluginServer/`).
2. Download the `.zip` archive for your extension.
3. Unzip the downloaded file.
4. In Chrome, navigate to `chrome://extensions/`.
5. Enable **Developer mode** (toggle in the top-right corner).
6. Click **Load unpacked** and select the unzipped directory.
