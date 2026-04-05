#!/bin/bash
# Build .xpi package for Firefox Tab Index extension
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT="tab-index.xpi"

# Remove old build
rm -f "$OUTPUT"

# Package as .xpi (just a zip with .xpi extension)
zip -r "$OUTPUT" \
  manifest.json \
  background.js \
  popup/ \
  icons/ \
  -x "*.DS_Store"

echo "Built: $OUTPUT"
echo ""
echo "To install:"
echo "  1. Open Firefox → about:addons"
echo "  2. Click the gear icon → 'Install Add-on From File...'"
echo "  3. Select $OUTPUT"
