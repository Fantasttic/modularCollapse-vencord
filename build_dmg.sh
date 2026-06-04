#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  build_dmg.sh                                                      ║
# ║  Builds Vencord + ModularCollapse and packages as a macOS DMG      ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# This script:
#   1. Clones the Vencord fork with ModularCollapse built-in
#   2. Installs dependencies and builds
#   3. Downloads the official VencordInstaller binary
#   4. Creates a macOS .app bundle that runs the installer
#   5. Packages everything into a DMG
#
# Requirements: git, node (v20+), pnpm, hdiutil (macOS)
#
# Usage:
#   ./build_dmg.sh
#   ./build_dmg.sh --output ~/Desktop/MyInstaller.dmg
#
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FORK_REPO="git@github.com:Fantasttic/Vencord.git"
FORK_BRANCH="feat/modular-collapse"
LOCAL_VENCORD="${HOME}/Printrbot/Vencord"
BUILD_DIR="/tmp/vencord-mc-build"
DMG_STAGING="/tmp/vencord-mc-dmg"
DMG_OUTPUT="${SCRIPT_DIR}/VencordModularCollapse.dmg"
VOL_NAME="Vencord + ModularCollapse"
APP_NAME="Install Vencord + ModularCollapse"
USE_LOCAL=false

# ── Colors ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[  OK]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()     { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ── Parse Args ────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        -o|--output) DMG_OUTPUT="$2"; shift 2 ;;
        -l|--local)  LOCAL_VENCORD="$2"; USE_LOCAL=true; shift 2 ;;
        --use-local) USE_LOCAL=true; shift ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -o, --output <path>     Output DMG path (default: ./VencordModularCollapse.dmg)"
            echo "  -l, --local <path>      Path to local Vencord repo (default: ~/Printrbot/Vencord)"
            echo "  --use-local             Use the default local Vencord repo instead of cloning"
            echo "  -h, --help              Show this help"
            exit 0 ;;
        *) shift ;;
    esac
done

# Auto-detect: use local if it exists and user didn't explicitly request clone
if [[ "$USE_LOCAL" == false ]] && [[ -d "$LOCAL_VENCORD/src/plugins/modularCollapse" ]]; then
    info "Detected local Vencord with ModularCollapse at: $LOCAL_VENCORD"
    USE_LOCAL=true
fi

# ── Pre-flight ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║  Vencord + ModularCollapse — DMG Builder        ║${NC}"
echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════╝${NC}"
echo ""

for cmd in git node pnpm hdiutil; do
    command -v "$cmd" &>/dev/null || die "Missing required tool: $cmd"
done
success "All tools available (git, node $(node -v), pnpm, hdiutil)"

# ── Step 1: Prepare Vencord source & Build ───────────────────────────
info "Cleaning previous build artifacts..."
rm -rf "$BUILD_DIR" "$DMG_STAGING"
mkdir -p "$BUILD_DIR" "$DMG_STAGING"

if [[ "$USE_LOCAL" == true ]]; then
    # ── Use local Vencord copy ────────────────────────────────────
    [[ -d "$LOCAL_VENCORD" ]] || die "Local Vencord not found at: $LOCAL_VENCORD"
    info "Copying local Vencord from: $LOCAL_VENCORD"
    cp -R "$LOCAL_VENCORD" "$BUILD_DIR/Vencord"
    success "Local copy ready"
else
    # ── Clone from remote ─────────────────────────────────────────
    info "Cloning Vencord fork (branch: ${FORK_BRANCH})..."
    git clone --branch "$FORK_BRANCH" --single-branch --depth 1 "$FORK_REPO" "$BUILD_DIR/Vencord"
    success "Clone complete"
fi

cd "$BUILD_DIR/Vencord"

info "Installing dependencies (pnpm install)..."
pnpm install --no-frozen-lockfile
success "Dependencies installed"

info "Building Vencord (this may take a minute)..."
pnpm build
success "Build complete"

# ── Step 2: Download VencordInstaller binary ─────────────────────────
info "Downloading VencordInstaller binary for macOS..."
INSTALLER_ZIP_URL="https://github.com/Vencord/Installer/releases/latest/download/VencordInstaller.MacOS.zip"
INSTALLER_ZIP="$BUILD_DIR/VencordInstaller.MacOS.zip"
INSTALLER_BIN="$BUILD_DIR/VencordInstaller"

curl -fSL -o "$INSTALLER_ZIP" "$INSTALLER_ZIP_URL"
success "Downloaded VencordInstaller zip"

# Extract the binary from inside the .app structure in the zip
cd "$BUILD_DIR"
unzip -o "$INSTALLER_ZIP" -d "$BUILD_DIR/installer_extracted"

# The zip contains VencordInstaller.app/Contents/MacOS/VencordInstaller
EXTRACTED_BIN="$BUILD_DIR/installer_extracted/VencordInstaller.app/Contents/MacOS/VencordInstaller"
if [[ -f "$EXTRACTED_BIN" ]]; then
    cp "$EXTRACTED_BIN" "$INSTALLER_BIN"
else
    # Fallback: search for it
    EXTRACTED_BIN=$(find "$BUILD_DIR/installer_extracted" -name "VencordInstaller" -type f | head -1)
    [[ -n "$EXTRACTED_BIN" ]] || die "Could not find VencordInstaller binary in zip"
    cp "$EXTRACTED_BIN" "$INSTALLER_BIN"
fi
chmod +x "$INSTALLER_BIN"
success "Extracted VencordInstaller binary"

# ── Step 3: Create .app bundle ───────────────────────────────────────
info "Creating macOS application bundle..."

APP_DIR="${DMG_STAGING}/${APP_NAME}.app"
mkdir -p "${APP_DIR}/Contents/MacOS"
mkdir -p "${APP_DIR}/Contents/Resources/vencord/dist"

# Copy the built dist files (only the essential ones, no .map files for size)
for f in patcher.js preload.js renderer.js renderer.css \
         vencordDesktopMain.js vencordDesktopPreload.js \
         vencordDesktopRenderer.js vencordDesktopRenderer.css; do
    [[ -f "$BUILD_DIR/Vencord/dist/$f" ]] && cp "$BUILD_DIR/Vencord/dist/$f" "${APP_DIR}/Contents/Resources/vencord/dist/"
done

# Copy LEGAL files
cp "$BUILD_DIR/Vencord/dist/"*.LEGAL.txt "${APP_DIR}/Contents/Resources/vencord/dist/" 2>/dev/null || true

# Copy the package.json (some installer versions check it)
cp "$BUILD_DIR/Vencord/package.json" "${APP_DIR}/Contents/Resources/vencord/"

# Copy the installer binary
cp "$INSTALLER_BIN" "${APP_DIR}/Contents/Resources/VencordInstaller"
chmod +x "${APP_DIR}/Contents/Resources/VencordInstaller"

# ── Create the launcher script ────────────────────────────────────────
cat > "${APP_DIR}/Contents/MacOS/launcher" << 'LAUNCHER_SCRIPT'
#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
#  Vencord + ModularCollapse Installer
#  This script injects Vencord (with ModularCollapse) into Discord
# ──────────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

APP_RESOURCES="$(cd "$(dirname "$0")/../Resources" && pwd)"
VENCORD_DATA="$APP_RESOURCES/vencord"
INSTALLER_BIN="$APP_RESOURCES/VencordInstaller"

clear
echo ""
echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}  ║  Vencord + ModularCollapse — Installer              ║${NC}"
echo -e "${BOLD}${CYAN}  ╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  This will install ${BOLD}Vencord${NC} with the ${BOLD}ModularCollapse${NC} plugin"
echo -e "  pre-configured into your Discord application."
echo ""
echo -e "  ${YELLOW}⚠  Make sure Discord is completely closed before proceeding.${NC}"
echo ""

# ── Check installer binary exists ─────────────────────────────────
if [[ ! -x "$INSTALLER_BIN" ]]; then
    echo -e "${RED}Error: VencordInstaller binary not found at expected path.${NC}"
    echo "  Expected: $INSTALLER_BIN"
    echo ""
    read -rp "Press Enter to exit..."
    exit 1
fi

# ── Confirm ───────────────────────────────────────────────────────
read -rp "$(echo -e "${CYAN}Press Enter to install, or Ctrl+C to cancel...${NC}")"
echo ""

# ── Remove quarantine attributes ──────────────────────────────────
echo -e "${CYAN}[1/3]${NC} Preparing installer..."
xattr -rd com.apple.quarantine "$INSTALLER_BIN" 2>/dev/null || true
xattr -rd com.apple.quarantine "$VENCORD_DATA" 2>/dev/null || true

# ── Copy to a writable location ──────────────────────────────────
#    DMG volumes are read-only, so we copy the data to a temp location
TEMP_VENCORD_DIR="$(mktemp -d)/vencord-install"
mkdir -p "$TEMP_VENCORD_DIR"
cp -R "$VENCORD_DATA/"* "$TEMP_VENCORD_DIR/"

echo -e "${CYAN}[2/3]${NC} Running VencordInstaller..."
echo ""

# ── Run the installer binary ─────────────────────────────────────
#    VENCORD_USER_DATA_DIR tells the installer where to find dist/
#    VENCORD_DEV_INSTALL tells it this is a dev (source) install
export VENCORD_USER_DATA_DIR="$TEMP_VENCORD_DIR"
export VENCORD_DEV_INSTALL="1"

"$INSTALLER_BIN" --install || {
    echo ""
    echo -e "${RED}Installation encountered an error.${NC}"
    echo -e "You can try running the installer manually:"
    echo -e "  ${CYAN}VENCORD_USER_DATA_DIR=\"$TEMP_VENCORD_DIR\" VENCORD_DEV_INSTALL=1 \"$INSTALLER_BIN\" --install${NC}"
    echo ""
    read -rp "Press Enter to exit..."
    exit 1
}

echo ""
echo -e "${CYAN}[3/3]${NC} Cleaning up..."
rm -rf "$TEMP_VENCORD_DIR"

echo ""
echo -e "${GREEN}${BOLD}  ✅  Installation complete!${NC}"
echo ""
echo -e "  ${BOLD}Next steps:${NC}"
echo -e "    1. Open (or restart) Discord"
echo -e "    2. Go to ${CYAN}Settings → Vencord → Plugins${NC}"
echo -e "    3. Search ${BOLD}\"ModularCollapse\"${NC} → Enable ✅"
echo ""
echo -e "  ${BOLD}ModularCollapse features:${NC}"
echo -e "    • Collapse 11 UI panels via toolbar buttons"
echo -e "    • Drag-resize panel edges, right-click to reset"
echo -e "    • Floating panels, hover expansion, keyboard shortcuts"
echo -e "    • Conditional auto-collapse based on window size"
echo ""
read -rp "Press Enter to close this window..."
LAUNCHER_SCRIPT

chmod +x "${APP_DIR}/Contents/MacOS/launcher"

# ── Create uninstaller script ─────────────────────────────────────
cat > "${APP_DIR}/Contents/MacOS/uninstall" << 'UNINSTALL_SCRIPT'
#!/usr/bin/env bash
set -euo pipefail

APP_RESOURCES="$(cd "$(dirname "$0")/../Resources" && pwd)"
INSTALLER_BIN="$APP_RESOURCES/VencordInstaller"

clear
echo ""
echo "  Vencord — Uninstaller"
echo "  ====================="
echo ""
echo "  This will remove Vencord from your Discord installation."
echo ""
read -rp "Press Enter to uninstall, or Ctrl+C to cancel..."
echo ""

xattr -rd com.apple.quarantine "$INSTALLER_BIN" 2>/dev/null || true
"$INSTALLER_BIN" --uninstall || true

echo ""
echo "  ✅  Vencord has been removed. Restart Discord."
echo ""
read -rp "Press Enter to close..."
UNINSTALL_SCRIPT

chmod +x "${APP_DIR}/Contents/MacOS/uninstall"

# ── Info.plist ────────────────────────────────────────────────────
cat > "${APP_DIR}/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>launcher</string>
    <key>CFBundleIdentifier</key>
    <string>dev.fantasttic.vencord-modular-installer</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleDisplayName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.15</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
PLIST

# ── Also add an Uninstall shortcut as a .command file in the DMG ──
cat > "${DMG_STAGING}/Uninstall Vencord.command" << 'UNINSTALL_CMD'
#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="${DIR}/Install Vencord + ModularCollapse.app"
"${APP_DIR}/Contents/MacOS/uninstall"
UNINSTALL_CMD
chmod +x "${DMG_STAGING}/Uninstall Vencord.command"

# ── Add a README ──────────────────────────────────────────────────
cat > "${DMG_STAGING}/README.txt" << 'README'
═══════════════════════════════════════════════════════
  Vencord + ModularCollapse Installer
═══════════════════════════════════════════════════════

  INSTALL
  -------
  1. Close Discord completely
  2. Double-click "Install Vencord + ModularCollapse"
  3. Follow the on-screen instructions
  4. Open Discord → Settings → Vencord → Plugins
  5. Search "ModularCollapse" → Enable

  UNINSTALL
  ---------
  Double-click "Uninstall Vencord.command"

  ABOUT
  -----
  ModularCollapse is a Vencord plugin that lets you
  collapse, resize, and float Discord's UI panels.

  • Collapse 11 panels via toolbar buttons
  • Drag to resize, right-click to reset
  • Floating panels over chat
  • Expand on hover
  • Keyboard shortcuts
  • Conditional auto-collapse

  Credits:
  • programmer2514 — Original BetterDiscord CollapsibleUI
  • Fantasttic — Vencord port & modernization

  License: GPL-3.0
═══════════════════════════════════════════════════════
README

success "Application bundle created"

# ── Step 4: Create DMG ───────────────────────────────────────────
info "Creating DMG image..."

# Remove old DMG if exists
rm -f "$DMG_OUTPUT"

hdiutil create \
    -volname "$VOL_NAME" \
    -srcfolder "$DMG_STAGING" \
    -ov \
    -format UDZO \
    -imagekey zlib-level=9 \
    "$DMG_OUTPUT"

success "DMG created: $DMG_OUTPUT"

# ── Step 5: Show summary ─────────────────────────────────────────
DMG_SIZE=$(du -sh "$DMG_OUTPUT" | awk '{print $1}')

echo ""
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}${GREEN}  DMG Build Complete!${NC}"
echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}Output:${NC}  $DMG_OUTPUT"
echo -e "  ${BOLD}Size:${NC}    $DMG_SIZE"
echo ""
echo -e "  ${BOLD}DMG contents:${NC}"
echo -e "    📦 ${APP_NAME}.app    — Double-click to install"
echo -e "    🗑  Uninstall Vencord.command  — Double-click to remove"
echo -e "    📄 README.txt"
echo ""
echo -e "  ${BOLD}Distribution:${NC}"
echo -e "    Share the DMG file. Users just need to:"
echo -e "    1. Close Discord"
echo -e "    2. Open the DMG"
echo -e "    3. Double-click the installer app"
echo ""

# ── Cleanup ───────────────────────────────────────────────────────
info "Cleaning up build directory..."
rm -rf "$BUILD_DIR" "$DMG_STAGING"
success "Done!"
