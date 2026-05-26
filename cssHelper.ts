/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

const STYLE_PREFIX = "collapsibleui-";

export function addStyle(id: string, css: string): void {
    const fullId = `${STYLE_PREFIX}${id}`;
    let el = document.getElementById(fullId) as HTMLStyleElement | null;
    if (el) {
        el.textContent = css;
    } else {
        el = document.createElement("style");
        el.id = fullId;
        el.textContent = css;
        document.head.appendChild(el);
    }
}

export function removeStyle(id: string): void {
    document.getElementById(`${STYLE_PREFIX}${id}`)?.remove();
}

export function clearAllStyles(): void {
    document.querySelectorAll(`style[id^="${STYLE_PREFIX}"]`).forEach(el => el.remove());
}
