# Design Specification: Live Download Click Tracking via Serverless Counter API

**Date:** 2026-10-18  
**Status:** Approved  
**Author:** AI Pair Programmer & User  

---

## 1. Overview & Objective

Static files hosted directly on GitHub Pages (such as `MultiClip-0.3.0.dmg` and other local packages) do not have server access logs or native download tracking. To provide real-time, persistent download counters that update immediately when a user clicks "Download":
1. Implement a client-side click tracker using a serverless Counter API (`abacus.jasoncameron.dev`).
2. Implement optimistic UI updates so clicking "Download" immediately updates the badge on screen (`+1`).
3. Combine base downloads from `registry.json` with the live click counter values.
4. Seed MultiClip with 2 downloads to account for the user's completed downloads.

---

## 2. Testing Seams & TDD Verification

Per strict Test-Driven Development (TDD) rules, helper logic is tested at public seams:

### Seam 1: `formatCounterUrl(namespace, pluginId, action)` in `scripts/download-tracker.js`
- **Behavior**: Constructs valid, sanitized URLs for `hit` (increment) and `get` (fetch) operations.
- **Verification**: Node.js test runner unit test in `scripts/download-tracker.test.js`.

### Seam 2: `combineDownloadCounts(baseDownloads, liveClicks)` in `scripts/download-tracker.js`
- **Behavior**: Safely computes total downloads:
  - If `liveClicks` is a valid positive number, sums `baseDownloads + liveClicks`.
  - Handles `null`, `undefined`, or error responses without failing or producing NaN.
- **Verification**: Node.js test runner unit test in `scripts/download-tracker.test.js`.

---

## 3. Web Portal Integration (`index.html`)

### 3.1 Download Button Handler
- Download buttons bind an `onclick="handleDownloadClick('${plugin.id}')"` handler.
- When clicked:
  1. The card's badge text increments immediately in the DOM (+1).
  2. A non-blocking background `fetch()` calls `https://abacus.jasoncameron.dev/hit/yzentler-pluginServer/${plugin.id}`.

### 3.2 Page Load & Live Sync
- On `loadRegistry()` and `checkForLiveUpdates()`, the portal queries the counter service for all downloadable plugins and updates the displayed counts.

### 3.3 MultiClip Historical Seed
- MultiClip's counter in the counter service is seeded with 2 to reflect the initial downloads.
