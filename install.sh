#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ModularCollapse — Vencord Installer                               ║
# ║  Installs Vencord from source with ModularCollapse pre-configured  ║
# ╚══════════════════════════════════════════════════════════════════════╝
set -euo pipefail

# ── Colors ────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ── Defaults ──────────────────────────────────────────────────────────
INSTALL_DIR="${HOME}/Vencord"
VENCORD_REPO="https://github.com/Vendicated/Vencord.git"
FORK_REPO="https://github.com/Fantasttic/Vencord.git"
FORK_BRANCH="feat/modular-collapse"
PLUGIN_REPO="https://github.com/Fantasttic/modularCollapse-vencord.git"
SKIP_INJECT=false
METHOD=""

# ── Helpers ───────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[  OK]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

banner() {
    echo ""
    echo -e "${BOLD}${CYAN}"
    echo "  ╔══════════════════════════════════════════════╗"
    echo "  ║     ModularCollapse — Vencord Installer      ║"
    echo "  ╚══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --method <fork|userplugin>   Installation method (skip prompt)"
    echo "  -d, --dir <path>                 Installation directory (default: ~/Vencord)"
    echo "  -s, --skip-inject                Skip Discord injection step"
    echo "  -h, --help                       Show this help message"
    echo ""
    echo "Methods:"
    echo "  fork        Clone the Fantasttic/Vencord fork with the plugin built-in"
    echo "  userplugin  Clone official Vencord + add ModularCollapse as a userplugin"
    exit 0
}

# ── Parse Arguments ───────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
    case "$1" in
        -m|--method)    METHOD="$2"; shift 2 ;;
        -d|--dir)       INSTALL_DIR="$2"; shift 2 ;;
        -s|--skip-inject) SKIP_INJECT=true; shift ;;
        -h|--help)      usage ;;
        *)              warn "Unknown option: $1"; shift ;;
    esac
done

# ── Pre-flight Checks ────────────────────────────────────────────────
check_dependencies() {
    local missing=()

    if ! command -v git &>/dev/null; then
        missing+=("git")
    fi

    if ! command -v node &>/dev/null; then
        missing+=("node (Node.js >= 20)")
    else
        local node_major
        node_major=$(node -v | sed 's/v//' | cut -d. -f1)
        if [[ "$node_major" -lt 20 ]]; then
            warn "Node.js version $(node -v) detected. Version 20+ is recommended."
        fi
    fi

    if ! command -v pnpm &>/dev/null; then
        missing+=("pnpm")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required tools: ${missing[*]}
  Install them first:
    • git:  https://git-scm.com/
    • node: https://nodejs.org/ (v20+)
    • pnpm: npm install -g pnpm"
    fi

    success "All dependencies found: git, node $(node -v), pnpm $(pnpm -v)"
}

# ── Method Selection ──────────────────────────────────────────────────
select_method() {
    if [[ -n "$METHOD" ]]; then
        case "$METHOD" in
            fork|userplugin) return ;;
            *) error "Invalid method: $METHOD. Use 'fork' or 'userplugin'." ;;
        esac
    fi

    echo ""
    echo -e "${BOLD}Choose installation method:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} ${BOLD}Fork (recommended)${NC}"
    echo "     Clones the Fantasttic/Vencord fork with ModularCollapse"
    echo "     already integrated as a built-in plugin."
    echo "     ✓ Includes extended CSS class mappings"
    echo "     ✓ Includes Devs entry for author credits"
    echo "     ✓ Settings panel fully wired"
    echo ""
    echo -e "  ${CYAN}2)${NC} ${BOLD}Userplugin${NC}"
    echo "     Clones official Vencord + adds ModularCollapse as a"
    echo "     userplugin from the standalone repository."
    echo "     ✓ Stays on official Vencord upstream"
    echo "     ✓ Easy to update plugin independently"
    echo ""
    while true; do
        read -rp "$(echo -e "${YELLOW}Select [1/2]: ${NC}")" choice
        case "$choice" in
            1) METHOD="fork"; break ;;
            2) METHOD="userplugin"; break ;;
            *) warn "Please enter 1 or 2." ;;
        esac
    done
}

# ── Installation: Fork Method ────────────────────────────────────────
install_fork() {
    info "Installing via Vencord fork (Fantasttic/Vencord)..."

    if [[ -d "$INSTALL_DIR" ]]; then
        warn "Directory already exists: $INSTALL_DIR"
        read -rp "$(echo -e "${YELLOW}Overwrite? [y/N]: ${NC}")" confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            error "Installation cancelled."
        fi
    fi

    info "Cloning Vencord fork..."
    git clone --branch "$FORK_BRANCH" --single-branch "$FORK_REPO" "$INSTALL_DIR"
    success "Cloned Vencord fork (branch: $FORK_BRANCH)"

    # Also add official upstream as a remote for future updates
    cd "$INSTALL_DIR"
    git remote add upstream "$VENCORD_REPO" 2>/dev/null || true
    success "Added upstream remote (Vendicated/Vencord)"
}

# ── Installation: Userplugin Method ──────────────────────────────────
install_userplugin() {
    info "Installing via official Vencord + userplugin..."

    if [[ -d "$INSTALL_DIR" ]]; then
        warn "Directory already exists: $INSTALL_DIR"
        read -rp "$(echo -e "${YELLOW}Overwrite? [y/N]: ${NC}")" confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            rm -rf "$INSTALL_DIR"
        else
            error "Installation cancelled."
        fi
    fi

    info "Cloning official Vencord..."
    git clone "$VENCORD_REPO" "$INSTALL_DIR"
    success "Cloned official Vencord"

    cd "$INSTALL_DIR"

    # Create userplugins directory if it doesn't exist
    mkdir -p src/userplugins

    info "Cloning ModularCollapse plugin..."
    git clone "$PLUGIN_REPO" src/userplugins/modularCollapse
    success "Cloned ModularCollapse into src/userplugins/modularCollapse"

    # Register dev entries in constants.ts so the plugin compiles
    info "Adding developer entries to Vencord constants..."
    local constants_file="src/utils/constants.ts"
    if [[ -f "$constants_file" ]]; then
        # Check if entries already exist
        if ! grep -q "programmer2514" "$constants_file"; then
            # Insert before the closing "} satisfies Record<string, Dev>);"
            sed -i.bak '/} satisfies Record<string, Dev>);/i\
    programmer2514: {\
        name: "programmer2514",\
        id: 563652755814875146n,\
    },\
    Fantasttic: {\
        name: "Fantasttic",\
        id: 0n,\
    },
' "$constants_file"
            rm -f "${constants_file}.bak"
            success "Added programmer2514 and Fantasttic to Devs"
        else
            info "Dev entries already exist, skipping."
        fi
    else
        warn "Could not find $constants_file — you may need to add Devs entries manually."
    fi
}

# ── Build ─────────────────────────────────────────────────────────────
build_vencord() {
    cd "$INSTALL_DIR"

    info "Installing dependencies with pnpm..."
    pnpm install --no-frozen-lockfile
    success "Dependencies installed"

    info "Building Vencord..."
    pnpm build
    success "Build complete"
}

# ── Inject ────────────────────────────────────────────────────────────
inject_discord() {
    if [[ "$SKIP_INJECT" == true ]]; then
        warn "Skipping Discord injection (--skip-inject)"
        return
    fi

    echo ""
    echo -e "${BOLD}Ready to inject Vencord into Discord.${NC}"
    echo "Make sure Discord is completely closed before proceeding."
    echo ""
    read -rp "$(echo -e "${YELLOW}Inject now? [Y/n]: ${NC}")" confirm
    if [[ "$confirm" =~ ^[Nn]$ ]]; then
        info "Skipping injection. Run it later with:"
        echo -e "  ${CYAN}cd $INSTALL_DIR && pnpm inject${NC}"
        return
    fi

    cd "$INSTALL_DIR"
    info "Injecting Vencord into Discord..."
    pnpm inject
    success "Vencord injected into Discord!"
}

# ── Post-install Info ─────────────────────────────────────────────────
print_summary() {
    echo ""
    echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${GREEN}  Installation Complete!${NC}"
    echo -e "${BOLD}${GREEN}══════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${BOLD}Install directory:${NC}  $INSTALL_DIR"
    echo -e "  ${BOLD}Method:${NC}             $METHOD"
    echo ""
    echo -e "  ${BOLD}Next steps:${NC}"
    echo "    1. Restart Discord"
    echo "    2. Go to Settings → Vencord → Plugins"
    echo "    3. Search for \"ModularCollapse\" → Enable ✅"
    echo ""
    echo -e "  ${BOLD}Useful commands:${NC}"
    echo -e "    ${CYAN}cd $INSTALL_DIR${NC}"
    echo -e "    ${CYAN}pnpm build${NC}        # Rebuild after changes"
    echo -e "    ${CYAN}pnpm inject${NC}       # Re-inject into Discord"

    if [[ "$METHOD" == "userplugin" ]]; then
        echo ""
        echo -e "  ${BOLD}Update plugin:${NC}"
        echo -e "    ${CYAN}cd $INSTALL_DIR/src/userplugins/modularCollapse${NC}"
        echo -e "    ${CYAN}git pull${NC}"
        echo -e "    ${CYAN}cd $INSTALL_DIR && pnpm build${NC}"
    else
        echo ""
        echo -e "  ${BOLD}Update from upstream Vencord:${NC}"
        echo -e "    ${CYAN}cd $INSTALL_DIR${NC}"
        echo -e "    ${CYAN}git fetch upstream${NC}"
        echo -e "    ${CYAN}git merge upstream/main${NC}"
        echo -e "    ${CYAN}pnpm build${NC}"
    fi
    echo ""
}

# ── Main ──────────────────────────────────────────────────────────────
main() {
    banner
    check_dependencies
    select_method

    case "$METHOD" in
        fork)       install_fork ;;
        userplugin) install_userplugin ;;
    esac

    build_vencord
    inject_discord
    print_summary
}

main
