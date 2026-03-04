#!/bin/bash
# Verify which icon is inside an IPA (e.g. the one you download from EAS).
# Usage: ./verify-ipa-icon.sh path/to/your.ipa

set -e
IPA="$1"
if [ -z "$IPA" ] || [ ! -f "$IPA" ]; then
  echo "Usage: $0 path/to/your.ipa"
  echo "Download the .ipa from your EAS build page first."
  exit 1
fi

DIR=$(mktemp -d)
trap "rm -rf $DIR" EXIT
unzip -q -o "$IPA" -d "$DIR"
APP=$(find "$DIR/Payload" -maxdepth 1 -type d -name "*.app" | head -1)
if [ -z "$APP" ]; then
  echo "No .app found in IPA."
  exit 1
fi
echo "App bundle: $APP"
echo "---"
if [ -d "$APP/AppIcon.appiconset" ]; then
  echo "AppIcon.appiconset contents:"
  ls -la "$APP/AppIcon.appiconset/"
  ICON=$(find "$APP/AppIcon.appiconset" -name "*.png" | head -1)
  if [ -n "$ICON" ]; then
    echo "---"
    echo "Icon file: $ICON"
    ls -la "$ICON"
    echo "Opening icon in Preview..."
    open "$ICON"
  fi
else
  echo "No AppIcon.appiconset (icon is in Assets.car in release builds)."
  echo ""
  echo "To see the actual icon: install this build on the iOS Simulator."
  echo "Boot a simulator (Xcode → Open Developer Tool → Simulator), then run:"
  echo "  xcrun simctl install booted \"$APP\""
  echo ""
  read -p "Install this app on the booted simulator now? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    if xcrun simctl install booted "$APP" 2>/dev/null; then
      echo "Installed. Check the simulator home screen for the app icon."
    else
      echo "Install failed. Is a simulator running? (Xcode → Open Developer Tool → Simulator)"
    fi
  fi
fi
