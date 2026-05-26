/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { findCssClassesLazy } from "@webpack";

export const sidebar = findCssClassesLazy(
    "sidebar", "guilds", "panels", "sidebarList"
);

export const guilds = findCssClassesLazy(
    "chatContent", "noChat", "form", "title"
);

export const icons = findCssClassesLazy(
    "iconWrapper", "clickable", "selected"
);

export const input = findCssClassesLazy(
    "channelTextArea", "attachButton", "buttons"
);

export const scroller = findCssClassesLazy("tree", "scroller");
export const members = findCssClassesLazy("members", "member");
export const toolbar = findCssClassesLazy("search", "searchBar");
export const search = findCssClassesLazy("searchResultsWrap");
export const channels = findCssClassesLazy("channel", "iconWrapper");

export const panel = findCssClassesLazy("outer", "inner");
export const frame = findCssClassesLazy("bar", "winButtons");
export const calls = findCssClassesLazy("callContainer");
export const social = findCssClassesLazy("inviteToolbar", "peopleColumn");
export const user = findCssClassesLazy("nameTag", "avatarWrapper");
export const popout = findCssClassesLazy("chatLayerWrapper");
export const effects = findCssClassesLazy("profileEffects");
export const tooltip = findCssClassesLazy("menu", "caret");
export const preview = findCssClassesLazy("popout", "timestamp");
export const activity = findCssClassesLazy("itemCard", "emptyCard");
export const game = findCssClassesLazy("openOnHover", "container");
export const callButtons = findCssClassesLazy("controlButton");
export const userAreaButtons = findCssClassesLazy("actionButtons");
export const threads = findCssClassesLazy("grid", "uploadArea");
export const layers = findCssClassesLazy("layer", "layers");
export const profileWrappers = findCssClassesLazy("header", "footerButton");
