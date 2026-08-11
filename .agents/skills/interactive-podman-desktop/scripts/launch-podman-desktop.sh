#!/bin/bash
# Create a Podman Desktop profile with unnecessary extensions disabled,
# copy the kubeconfig, and launch with CDP remote debugging on port 9222.

set -euo pipefail

CUSTOM_FOLDER="$(pwd)/tests/playwright/tests/playwright/output/kubernetes-dashboard-tests"
mkdir -p "$CUSTOM_FOLDER/configuration"

cat > "$CUSTOM_FOLDER/configuration/settings.json" << 'EOF'
{
  "extensions.disabled": [
    "podman-desktop.compose",
    "podman-desktop.docker",
    "podman-desktop.kind",
    "podman-desktop.kube-context",
    "podman-desktop.kubectl-cli",
    "podman-desktop.lima",
    "podman-desktop.minikube",
    "podman-desktop.onboarding",
    "podman-desktop.podman"
  ]
}
EOF

mkdir -p ~/.kube
cp /tmp/envtest-kubeconfig ~/.kube/config

DISPLAY=:99 \
PODMAN_DESKTOP_HOME_DIR="$CUSTOM_FOLDER" \
XDG_SESSION_TYPE=x11 \
$(pwd)/tests/playwright/tests/PodmanDesktop/podman-desktop \
  --remote-debugging-port=9222 &

echo "Podman Desktop launching with CDP on port 9222"
echo "Verify with: curl -s http://127.0.0.1:9222/json"
