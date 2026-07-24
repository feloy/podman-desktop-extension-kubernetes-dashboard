---
name: interactive-podman-desktop
description: >-
  Guides launching Podman Desktop interactively inside a Linux container with
  the Kubernetes Dashboard extension loaded, and connecting to it via
  Playwright's CDP protocol. Useful for manual exploration, AI-assisted
  interaction (e.g. via a Playwright MCP server), or ad-hoc scripting.
  Triggers when launching Podman Desktop for interactive use in a container,
  connecting via CDP, or using a Playwright MCP server with the extension.
---

# Running Podman Desktop Interactively with Playwright

Instead of running the E2E test suite, you can launch Podman Desktop with the
extension loaded and interact with it programmatically through Playwright's CDP
connection. This is useful for manual exploration, AI-assisted interaction (e.g.
with a Playwright MCP server), or ad-hoc scripting.

All executable scripts are in the `scripts/` directory alongside this file.

## Prerequisites

Complete the following from the `e2e-container` skill before proceeding:

1. Install prerequisites (`scripts/install-prerequisites.sh`)
2. Step 1: Install a Podman Desktop testing binary (`scripts/install-pd-binary.sh`)
3. Step 2: Build the extension plugin (`scripts/build-extension-plugin.sh`)
4. Step 3: Start the envtest Kubernetes cluster (`scripts/start-envtest.sh`)

## Verify Shared Library Dependencies

Before launching Podman Desktop, check that all shared libraries required by
the Electron binary are available:

```sh
ldd tests/playwright/tests/PodmanDesktop/podman-desktop.real | grep "not found"
```

If any libraries are missing, install them using the prerequisites script from
the `e2e-container` skill.

## Launch Podman Desktop

### Step 1: Start Xvfb and D-Bus

```sh
bash .agents/skills/interactive-podman-desktop/scripts/start-xvfb.sh
```

### Step 2: Create the Podman Desktop profile and launch

This creates a profile with unnecessary extensions disabled, copies the
kubeconfig, and launches Podman Desktop with remote debugging on port 9222:

```sh
bash .agents/skills/interactive-podman-desktop/scripts/launch-podman-desktop.sh
```

Wait a few seconds for the application to start. Verify the CDP endpoint is
available:

```sh
curl -s http://127.0.0.1:9222/json
```

## Connecting with Playwright

### From a Node.js script

```js
const { chromium } = require('playwright');

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const pages = browser.contexts()[0].pages();
// pages[0] is the Podman Desktop shell
// pages[1] is the Kubernetes Dashboard extension webview (available after
//          clicking the "Kubernetes" link in the sidebar)
const page = pages[0];

await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### From a Playwright MCP server

Connect the MCP server to the same `http://127.0.0.1:9222` CDP endpoint. After
clicking the **Kubernetes** link in the sidebar, the extension webview opens as
a separate tab (tab index 1) — switch to it to interact with the Kubernetes
Dashboard.
