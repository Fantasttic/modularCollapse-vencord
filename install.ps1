# ╔══════════════════════════════════════════════════════════════════════╗
# ║  ModularCollapse — Vencord Installer (Windows)                     ║
# ║  Installs Vencord from source with ModularCollapse pre-configured  ║
# ╚══════════════════════════════════════════════════════════════════════╝
#
# Usage:
#   .\install.ps1                          # Interactive mode
#   .\install.ps1 -Method userplugin       # Skip method selection
#   .\install.ps1 -Method fork -SkipInject # Skip injection step
#   .\install.ps1 -Dir "C:\MyVencord"      # Custom install directory
#
# Requirements: git, node (v20+), pnpm
#
# Run in PowerShell:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\install.ps1

[CmdletBinding()]
param(
    [ValidateSet("fork", "userplugin", "")]
    [string]$Method = "",

    [string]$Dir = "$env:USERPROFILE\Vencord",

    [switch]$SkipInject,

    [switch]$Help
)

# ── Colors & Helpers ──────────────────────────────────────────────────
function Write-Info    { param([string]$Msg) Write-Host "[INFO]  $Msg" -ForegroundColor Cyan }
function Write-Success { param([string]$Msg) Write-Host "[  OK]  $Msg" -ForegroundColor Green }
function Write-Warn    { param([string]$Msg) Write-Host "[WARN]  $Msg" -ForegroundColor Yellow }
function Write-Fail    { param([string]$Msg) Write-Host "[FAIL]  $Msg" -ForegroundColor Red; exit 1 }

$VencordRepo = "https://github.com/Vendicated/Vencord.git"
$ForkRepo    = "https://github.com/Fantasttic/Vencord.git"
$ForkBranch  = "feat/modular-collapse"
$PluginRepo  = "https://github.com/Fantasttic/modularCollapse-vencord.git"

# ── Banner ────────────────────────────────────────────────────────────
function Show-Banner {
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║     ModularCollapse — Vencord Installer      ║" -ForegroundColor Cyan
    Write-Host "  ║              Windows Edition                 ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# ── Help ──────────────────────────────────────────────────────────────
if ($Help) {
    Write-Host "Usage: .\install.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Method <fork|userplugin>   Installation method (skip prompt)"
    Write-Host "  -Dir <path>                 Installation directory (default: ~\Vencord)"
    Write-Host "  -SkipInject                 Skip Discord injection step"
    Write-Host "  -Help                       Show this help message"
    Write-Host ""
    Write-Host "Methods:"
    Write-Host "  fork        Clone the Fantasttic/Vencord fork with the plugin built-in"
    Write-Host "  userplugin  Clone official Vencord + add ModularCollapse as a userplugin"
    exit 0
}

# ── Dependency Checks ────────────────────────────────────────────────
function Test-Dependencies {
    $missing = @()

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        $missing += "git"
    }

    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        $missing += "node (Node.js >= 20)"
    } else {
        $nodeVersion = (node -v) -replace "v", ""
        $nodeMajor = [int]($nodeVersion.Split(".")[0])
        if ($nodeMajor -lt 20) {
            Write-Warn "Node.js version v$nodeVersion detected. Version 20+ is recommended."
        }
    }

    if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
        $missing += "pnpm"
    }

    if ($missing.Count -gt 0) {
        Write-Fail "Missing required tools: $($missing -join ', ')
  Install them first:
    - git:  https://git-scm.com/
    - node: https://nodejs.org/ (v20+)
    - pnpm: npm install -g pnpm"
    }

    $nodeVer = node -v
    $pnpmVer = pnpm -v
    Write-Success "All dependencies found: git, node $nodeVer, pnpm $pnpmVer"
}

# ── Method Selection ─────────────────────────────────────────────────
function Select-Method {
    if ($Method -ne "") { return }

    Write-Host ""
    Write-Host "Choose installation method:" -NoNewline -ForegroundColor White
    Write-Host ""
    Write-Host ""
    Write-Host "  1) Fork (recommended)" -ForegroundColor Cyan
    Write-Host "     Clones the Fantasttic/Vencord fork with ModularCollapse"
    Write-Host "     already integrated as a built-in plugin."
    Write-Host "     + Includes extended CSS class mappings"
    Write-Host "     + Includes Devs entry for author credits"
    Write-Host "     + Settings panel fully wired"
    Write-Host ""
    Write-Host "  2) Userplugin" -ForegroundColor Cyan
    Write-Host "     Clones official Vencord + adds ModularCollapse as a"
    Write-Host "     userplugin from the standalone repository."
    Write-Host "     + Stays on official Vencord upstream"
    Write-Host "     + Easy to update plugin independently"
    Write-Host ""

    do {
        $choice = Read-Host "Select [1/2]"
        switch ($choice) {
            "1" { $script:Method = "fork"; return }
            "2" { $script:Method = "userplugin"; return }
            default { Write-Warn "Please enter 1 or 2." }
        }
    } while ($true)
}

# ── Install: Fork ────────────────────────────────────────────────────
function Install-Fork {
    Write-Info "Installing via Vencord fork (Fantasttic/Vencord)..."

    if (Test-Path $Dir) {
        Write-Warn "Directory already exists: $Dir"
        $confirm = Read-Host "Overwrite? [y/N]"
        if ($confirm -match "^[Yy]$") {
            Remove-Item -Recurse -Force $Dir
        } else {
            Write-Fail "Installation cancelled."
        }
    }

    Write-Info "Cloning Vencord fork..."
    git clone --branch $ForkBranch --single-branch $ForkRepo $Dir
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to clone Vencord fork." }
    Write-Success "Cloned Vencord fork (branch: $ForkBranch)"

    Push-Location $Dir
    git remote add upstream $VencordRepo 2>$null
    Pop-Location
    Write-Success "Added upstream remote (Vendicated/Vencord)"
}

# ── Install: Userplugin ──────────────────────────────────────────────
function Install-Userplugin {
    Write-Info "Installing via official Vencord + userplugin..."

    if (Test-Path $Dir) {
        Write-Warn "Directory already exists: $Dir"
        $confirm = Read-Host "Overwrite? [y/N]"
        if ($confirm -match "^[Yy]$") {
            Remove-Item -Recurse -Force $Dir
        } else {
            Write-Fail "Installation cancelled."
        }
    }

    Write-Info "Cloning official Vencord..."
    git clone $VencordRepo $Dir
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to clone Vencord." }
    Write-Success "Cloned official Vencord"

    # Create userplugins directory
    $userpluginDir = Join-Path $Dir "src\userplugins"
    New-Item -ItemType Directory -Path $userpluginDir -Force | Out-Null

    Write-Info "Cloning ModularCollapse plugin..."
    git clone $PluginRepo (Join-Path $userpluginDir "modularCollapse")
    if ($LASTEXITCODE -ne 0) { Write-Fail "Failed to clone ModularCollapse." }
    Write-Success "Cloned ModularCollapse into src\userplugins\modularCollapse"

    # Register dev entries
    Write-Info "Adding developer entries to Vencord constants..."
    $constantsFile = Join-Path $Dir "src\utils\constants.ts"
    if (Test-Path $constantsFile) {
        $content = Get-Content $constantsFile -Raw
        if ($content -notmatch "programmer2514") {
            $devEntry = @"
    programmer2514: {
        name: "programmer2514",
        id: 563652755814875146n,
    },
    Fantasttic: {
        name: "Fantasttic",
        id: 0n,
    },
"@
            $content = $content -replace '(\}\s*satisfies\s*Record<string,\s*Dev>)', "$devEntry`n`$1"
            Set-Content -Path $constantsFile -Value $content -NoNewline
            Write-Success "Added programmer2514 and Fantasttic to Devs"
        } else {
            Write-Info "Dev entries already exist, skipping."
        }
    } else {
        Write-Warn "Could not find constants.ts — you may need to add Devs entries manually."
    }
}

# ── Build ─────────────────────────────────────────────────────────────
function Build-Vencord {
    Push-Location $Dir

    Write-Info "Installing dependencies with pnpm..."
    pnpm install --no-frozen-lockfile
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Fail "pnpm install failed." }
    Write-Success "Dependencies installed"

    Write-Info "Building Vencord..."
    pnpm build
    if ($LASTEXITCODE -ne 0) { Pop-Location; Write-Fail "pnpm build failed." }
    Write-Success "Build complete"

    Pop-Location
}

# ── Inject ────────────────────────────────────────────────────────────
function Invoke-Inject {
    if ($SkipInject) {
        Write-Warn "Skipping Discord injection (--SkipInject)"
        return
    }

    Write-Host ""
    Write-Host "Ready to inject Vencord into Discord." -ForegroundColor White
    Write-Host "Make sure Discord is completely closed before proceeding."
    Write-Host ""
    $confirm = Read-Host "Inject now? [Y/n]"
    if ($confirm -match "^[Nn]$") {
        Write-Info "Skipping injection. Run it later with:"
        Write-Host "  cd $Dir; pnpm inject" -ForegroundColor Cyan
        return
    }

    Push-Location $Dir
    Write-Info "Injecting Vencord into Discord..."
    pnpm inject
    if ($LASTEXITCODE -ne 0) {
        Pop-Location
        Write-Warn "Injection may have failed. Try running manually:"
        Write-Host "  cd $Dir; pnpm inject" -ForegroundColor Cyan
        return
    }
    Pop-Location
    Write-Success "Vencord injected into Discord!"
}

# ── Summary ───────────────────────────────────────────────────────────
function Show-Summary {
    Write-Host ""
    Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  Installation Complete!" -ForegroundColor Green
    Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Install directory:  $Dir"
    Write-Host "  Method:             $Method"
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor White
    Write-Host "    1. Restart Discord"
    Write-Host "    2. Go to Settings -> Vencord -> Plugins"
    Write-Host '    3. Search for "ModularCollapse" -> Enable'
    Write-Host ""
    Write-Host "  Useful commands:" -ForegroundColor White
    Write-Host "    cd $Dir" -ForegroundColor Cyan
    Write-Host "    pnpm build        # Rebuild after changes" -ForegroundColor Cyan
    Write-Host "    pnpm inject       # Re-inject into Discord" -ForegroundColor Cyan

    if ($Method -eq "userplugin") {
        Write-Host ""
        Write-Host "  Update plugin:" -ForegroundColor White
        Write-Host "    cd $Dir\src\userplugins\modularCollapse" -ForegroundColor Cyan
        Write-Host "    git pull" -ForegroundColor Cyan
        Write-Host "    cd $Dir; pnpm build" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "  Update from upstream Vencord:" -ForegroundColor White
        Write-Host "    cd $Dir" -ForegroundColor Cyan
        Write-Host "    git fetch upstream" -ForegroundColor Cyan
        Write-Host "    git merge upstream/main" -ForegroundColor Cyan
        Write-Host "    pnpm build" -ForegroundColor Cyan
    }
    Write-Host ""
}

# ── Main ──────────────────────────────────────────────────────────────
Show-Banner
Test-Dependencies
Select-Method

switch ($Method) {
    "fork"       { Install-Fork }
    "userplugin" { Install-Userplugin }
}

Build-Vencord
Invoke-Inject
Show-Summary
