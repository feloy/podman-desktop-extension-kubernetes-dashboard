#!/bin/bash
# Start Xvfb and D-Bus for headless Electron operation.

set -euo pipefail

Xvfb :99 -screen 0 1920x1080x24 &
echo "Xvfb started on display :99"

sudo mkdir -p /run/dbus
sudo dbus-daemon --system --fork
echo "D-Bus system bus started"
