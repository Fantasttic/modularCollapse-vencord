#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ModularCollapse — Developer Linker & Applicator                     ║
# ║  Links this local folder directly to Vencord and recompiles it.     ║
# ╚══════════════════════════════════════════════════════════════════════╝
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[  OK]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }

VENCORD_DIR="${HOME}/Vencord"
PLUGIN_DIR="${VENCORD_DIR}/src/userplugins/modularCollapse"

echo -e "${BOLD}${CYAN}  ╔══════════════════════════════════════════════╗"
echo -e "  ║          Applying ModularCollapse            ║"
echo -e "  ╚══════════════════════════════════════════════╝${NC}"
echo ""

# 1. Symlink directory
info "Linking this repository to Vencord..."
mkdir -p "${VENCORD_DIR}/src/userplugins"

# Remove folder or link if it exists
rm -rf "$PLUGIN_DIR"

# Link
ln -s "$(pwd)" "$PLUGIN_DIR"
success "Created symlink: $PLUGIN_DIR -> $(pwd)"

# 2. Add Developer credits if missing
CONSTANTS_FILE="${VENCORD_DIR}/src/utils/constants.ts"
if [ -f "$CONSTANTS_FILE" ]; then
    if ! grep -q "programmer2514" "$CONSTANTS_FILE"; then
        info "Adding developer credits to Vencord constants..."
        node -e '
            const fs = require("fs");
            const file = process.argv[1];
            let content = fs.readFileSync(file, "utf8");
            if (!content.includes("programmer2514")) {
                content = content.replace(
                    /} satisfies Record<string, Dev>\);/,
                    `    programmer2514: { name: "programmer2514", id: 563652755814875146n },\n    Fantasttic: { name: "Fantasttic", id: 0n },\n} satisfies Record<string, Dev>);`
                );
                fs.writeFileSync(file, content, "utf8");
            }
        ' "$CONSTANTS_FILE"
        success "Developer credits added."
    else
        info "Developer credits already present in Vencord constants."
    fi
fi

# 3. Compile Vencord
info "Installing dependencies and building Vencord..."
cd "$VENCORD_DIR"
pnpm install --no-frozen-lockfile
pnpm build
success "Rebuild completed!"

# 4. Inject to Discord
info "Verifying Vencord injection..."
pnpm inject
success "Injection completed!"

echo ""
echo -e "${BOLD}${GREEN}🎉 Successfully applied local changes! Please restart Discord to reload.${NC}"
echo ""
