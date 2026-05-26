/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { PANEL_COUNT } from "./constants";
import { addStyle, removeStyle } from "./cssHelper";
import * as el from "./elements";
import * as m from "./modules";
import { getSettings } from "./settings";

// Clamp a setting value to a safe CSS number. Returns 0 for NaN/Infinity.
function cssNum(val: number, min = 0, max = 9999): number {
    if (!Number.isFinite(val)) return min;
    return Math.max(min, Math.min(max, val));
}

// Robust fallback selector helper. If the Webpack class name is missing,
// it uses a wildcard attribute selector.
function cls(className: string | undefined, fallbackSelector: string): string {
    return className ? `.${className}` : fallbackSelector;
}

export function initRootStyles(): void {
    const iconsWrapperSelected = `${cls(m.icons?.iconWrapper, '[class*="iconWrapper_"]')}${cls(m.icons?.selected, '[class*="selected_"]')}`;
    const threadsGrid = cls(m.threads?.grid, '[class*="grid_"]');
    const threadsList = cls(m.threads?.list, '[class*="list_"]');
    const threadsHeader = cls(m.threads?.headerRow, '[class*="headerRow_"]');
    const sidebarList = cls(m.sidebar?.sidebarList, '[class*="sidebarList_"]');

    addStyle("root", `
        :root {
            --fst-server-list-collapsed: 0;
        }
        ::-webkit-scrollbar {
            width: 0px;
            background: transparent;
        }
        .cui-toolbar {
            align-items: right;
            display: flex;
            gap: var(--space-xs);
            transition: gap var(--cui-transition-speed) !important;
        }
        ${iconsWrapperSelected}:not([id*="cui"]):has([d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1ZM18.44 17.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.63a9.53 9.53 0 0 1 3.83 4.78ZM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5a.2.2 0 0 1-.2-.16c-.2-.96-.56-1.87-.88-2.54-.1-.23-.42-.15-.42.1v2.1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5Z"]),
        ${iconsWrapperSelected}:not([id*="cui"]):has([d="M23 12.38c-.02.38-.45.58-.78.4a6.97 6.97 0 0 0-6.27-.08.54.54 0 0 1-.44 0 8.97 8.97 0 0 0-11.16 3.55c-.1.15-.1.35 0 .5.37.58.8 1.13 1.28 1.61.24.24.64.15.8-.15.19-.38.39-.73.58-1.02.14-.21.43-.1.4.15l-.19 1.96c-.02.19.07.37.23.47A8.96 8.96 0 0 0 12 21a.4.4 0 0 1 .38.27c.1.33.25.65.4.95.18.34-.02.76-.4.77L12 23a11 11 0 1 1 11-10.62ZM15.5 7.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"]) {
            display: none;
        }
        ${threadsGrid}>div:first-child,
        ${threadsList}>div:first-child,
        ${threadsHeader} {
            min-width: 0px !important;
        }
        ${sidebarList} {
            container-type: unset !important;
        }
    `.replace(/\s+/g, " "));

    updateVariables();
}

export function updateVariables(): void {
    const s = getSettings();
    addStyle("vars", `
        :root {
            --cui-transition-speed: ${cssNum(s.transitionSpeed, 0, 5000)}ms;
            --cui-collapse-size: ${cssNum(s.collapseSize, 0, 500)}px;
            --cui-channel-list-width: ${cssNum(s.channelListWidth || s.defaultChannelListWidth, 80, 2000)}px;
            --cui-members-list-width: ${cssNum(s.membersListWidth || s.defaultMembersListWidth, 80, 2000)}px;
            --cui-user-profile-width: ${cssNum(s.userProfileWidth || s.defaultUserProfileWidth, 80, 2000)}px;
            --cui-search-panel-width: ${cssNum(s.searchPanelWidth || s.defaultSearchPanelWidth, 80, 2000)}px;
            --cui-forum-popout-width: ${cssNum(s.forumPopoutWidth || s.defaultForumPopoutWidth, 80, 2000)}px;
            --cui-activity-panel-width: ${cssNum(s.activityPanelWidth || s.defaultActivityPanelWidth, 80, 2000)}px;
            --cui-forum-panel-top: ${(el.getNoChat()) ? "0px" : "var(--custom-channel-header-height)"};
            --cui-compat-hsl: 1;
        }
    `.replace(/\s+/g, " "));
}

export function clearRootStyles(): void {
    removeStyle("root");
    removeStyle("vars");
}

interface PanelStyleState {
    toggled: boolean;
}

const panelStates: PanelStyleState[] = Array.from({ length: PANEL_COUNT }, () => ({ toggled: true }));

export function getPanelState(index: number): PanelStyleState {
    return panelStates.at(index)!;
}

function serverListInit(): void {
    const s = getSettings();
    const guildsSelector = cls(m.sidebar?.guilds, '[class*="guilds_"]');
    const sidebarContent = cls(m.sidebar?.content, '[class*="sidebar_"] [class*="content_"]');
    const treeScroller = cls(m.scroller?.tree, '[class*="tree_"]');

    addStyle("serverList_init", `
        :root { --cui-server-list-toggled: 1; }
        ${guildsSelector} {
            transition: width var(--cui-transition-speed);
            border-right: calc(1px * var(--cui-channel-list-toggled)) solid var(--border-subtle) !important;
            border-top: 1px solid var(--app-border-frame) !important;
        }
        ${treeScroller} { padding-top: var(--space-xs) !important; }
        ${sidebarContent} { transition: margin-top var(--cui-transition-speed); }
    `.replace(/\s+/g, " "));
}

function serverListToggleCSS(): string {
    const guildsSelector = cls(m.sidebar?.guilds, '[class*="guilds_"]');
    const sidebarContent = cls(m.sidebar?.content, '[class*="sidebar_"] [class*="content_"]');

    return `
        :root { --cui-server-list-toggled: 0; }
        ${guildsSelector} { width: var(--cui-collapse-size) !important; border: 0 !important; }
        ${sidebarContent} { margin-top: 0px !important; }
    `.replace(/\s+/g, " ");
}

function serverListFloatCSS(): string {
    const guildsSelector = cls(m.sidebar?.guilds, '[class*="guilds_"]');

    return `
        :root { --cui-server-list-toggled: 0; }
        ${guildsSelector} {
            position: absolute !important; z-index: 192 !important;
            min-height: 100% !important; height: 100% !important; max-height: 100% !important;
            overflow-y: scroll !important;
        }
    `.replace(/\s+/g, " ");
}

function channelListInit(): void {
    const s = getSettings();
    const sidebarList = cls(m.sidebar?.sidebarList, '[class*="sidebarList_"]');
    const sidebarResizeHandle = cls(m.sidebar?.sidebarResizeHandle, '[class*="sidebarResizeHandle_"]');
    const sidebarContainer = cls(m.sidebar?.sidebar, '[class*="sidebar_"]');
    const guildsSubtitle = cls(m.guilds?.subtitleContainer, '[class*="subtitleContainer_"]');
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const socialTabBody = cls(m.social?.tabBody, '[class*="tabBody_"]');
    const channelsChannel = cls(m.channels?.channel, '[class*="channel_"]');
    const iconsContainer = cls(m.icons?.container, '[class*="iconsContainer_"]');

    addStyle("channelList_init", `
        :root {
            --cui-channel-list-handle-offset: calc(var(--cui-channel-list-width) - 12px);
            --cui-channel-list-handle-transition: left var(--cui-transition-speed);
            --cui-channel-list-toggled: 1;
        }
        ${sidebarList} {
            max-width: var(--cui-channel-list-width) !important;
            width: var(--cui-channel-list-width) !important;
            min-width: var(--cui-channel-list-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
            min-height: 100% !important;
            overflow: visible !important;
            border-right: 1px solid var(--border-subtle) !important;
            border-left: none !important;
            border-radius: 0 !important;
        }
        ${sidebarList} > * { overflow: hidden !important; margin-left: 0 !important; }
        ${sidebarResizeHandle} { display: none !important; }
        ${sidebarContainer} { overflow: visible !important; border: none !important; }
        ${guildsSubtitle}, ${guildsContent}, ${socialTabBody} { border-left: none !important; }
        ${channelsChannel} { max-width: 100% !important; }
        ${iconsContainer} { border-left: 0 !important; }
        ${cssNum(s.channelListWidth) ? `
            ${sidebarList}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; left: var(--cui-channel-list-handle-offset);
                transition: var(--cui-channel-list-handle-transition);
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function channelListToggleCSS(): string {
    const s = getSettings();
    const sidebarList = cls(m.sidebar?.sidebarList, '[class*="sidebarList_"]');

    return `
        :root { --cui-channel-list-toggled: 0; }
        ${sidebarList} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
        }
        ${s.channelListWidth ? `${sidebarList}:before { left: -4px; }` : ""}
    `.replace(/\s+/g, " ");
}

function channelListFloatCSS(): string {
    const sidebarList = cls(m.sidebar?.sidebarList, '[class*="sidebarList_"]');

    return `
        ${sidebarList} {
            position: absolute !important; z-index: 190 !important;
            max-height: 100% !important; height: 100% !important;
        }
    `.replace(/\s+/g, " ");
}

function membersListInit(): void {
    const s = getSettings();
    const membersList = cls(m.members?.members, '[class*="members_"]');
    const membersMember = cls(m.members?.member, '[class*="member_"]');
    const gameContainer = cls(m.game?.container, '[class*="gameContainer_"]');

    addStyle("membersList_init", `
        ${membersList} {
            max-width: var(--cui-members-list-width) !important;
            width: var(--cui-members-list-width) !important;
            min-width: var(--cui-members-list-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed), padding var(--cui-transition-speed);
            min-height: 100% !important;
        }
        ${membersList} > * { width: 100% !important; }
        ${membersMember}, ${gameContainer} { max-width: 100% !important; }
        ${cssNum(s.membersListWidth) ? `
            ${membersList}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; left: -4px;
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function membersListToggleCSS(): string {
    const membersList = cls(m.members?.members, '[class*="members_"]');

    return `
        ${membersList} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
            padding-left: 0 !important; padding-right: 0 !important;
        }
    `.replace(/\s+/g, " ");
}

function membersListFloatCSS(): string {
    const membersList = cls(m.members?.members, '[class*="members_"]');

    return `
        ${membersList} {
            position: absolute !important; z-index: 190 !important;
            max-height: 100% !important; height: 100% !important;
            right: 0 !important; border-left: 1px solid var(--border-subtle) !important;
        }
    `.replace(/\s+/g, " ");
}

function userProfileInit(): void {
    const s = getSettings();
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const panelOuter = '[class*="userProfileOuter_"], [class*="profilePanel_"], [class*="outer_"]';
    const panelInner = '[class*="userProfileInner_"], [class*="inner_"]';
    const panelPath = `${guildsContent} ${panelOuter}`;

    addStyle("userProfile_init", `
        ${panelPath} {
            max-width: var(--cui-user-profile-width) !important;
            width: var(--cui-user-profile-width) !important;
            min-width: var(--cui-user-profile-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
            min-height: 100% !important;
        }
        ${panelPath} ${panelInner} { border-left: 1px solid var(--border-subtle) !important; }
        ${panelPath} > * { width: 100% !important; }
        ${cssNum(s.userProfileWidth) ? `
            ${panelPath}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; left: -4px;
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function userProfileToggleCSS(): string {
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const panelOuter = '[class*="userProfileOuter_"], [class*="profilePanel_"], [class*="outer_"]';

    return `
        ${guildsContent} ${panelOuter} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
        }
    `.replace(/\s+/g, " ");
}

function userProfileFloatCSS(): string {
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const panelOuter = '[class*="userProfileOuter_"], [class*="profilePanel_"], [class*="outer_"]';

    return `
        ${guildsContent} ${panelOuter} {
            position: absolute !important; z-index: 190 !important;
            max-height: 100% !important; height: 100% !important; right: 0 !important;
        }
    `.replace(/\s+/g, " ");
}

function messageInputInit(): void {
    const guildsForm = cls(m.guilds?.form, 'form[class*="form_"]');

    addStyle("messageInput_init", `
        ${guildsForm} {
            max-height: calc(var(--custom-channel-textarea-text-area-max-height) + 24px) !important;
            transition: max-height var(--cui-transition-speed) !important;
        }
    `.replace(/\s+/g, " "));
}

function messageInputToggleCSS(): string {
    const guildsForm = cls(m.guilds?.form, 'form[class*="form_"]');

    return `
        ${guildsForm}:not(:has([data-slate-string="true"])):not(:has([data-list-id="attachments"])) {
            max-height: var(--cui-collapse-size) !important; overflow: hidden !important;
        }
    `.replace(/\s+/g, " ");
}

function messageInputFloatCSS(): string {
    const guildsForm = cls(m.guilds?.form, 'form[class*="form_"]');

    return `
        ${guildsForm} {
            position: absolute !important;
            filter: drop-shadow(0px 0px 2px var(--opacity-black-16));
            left: 0 !important; right: 0 !important; bottom: 0 !important;
        }
    `.replace(/\s+/g, " ");
}

function windowBarInit(): void {
    const frameBar = cls(m.frame?.bar, '[class*="titleBar_"]');
    const sidebarBase = cls(m.sidebar?.base, '[class*="base_"]');

    addStyle("windowBar_init", `
        ${frameBar} {
            min-height: var(--custom-app-top-bar-height) !important;
            height: var(--custom-app-top-bar-height) !important;
            max-height: var(--custom-app-top-bar-height) !important;
            transition: min-height var(--cui-transition-speed), height var(--cui-transition-speed), max-height var(--cui-transition-speed) !important;
        }
        ${sidebarBase} { transition: grid-template-rows var(--cui-transition-speed) !important; }
    `.replace(/\s+/g, " "));
}

function windowBarToggleCSS(): string {
    const frameBar = cls(m.frame?.bar, '[class*="titleBar_"]');
    const sidebarBase = cls(m.sidebar?.base, '[class*="base_"]');

    return `
        ${frameBar} {
            overflow: hidden !important;
            min-height: var(--cui-collapse-size) !important;
            height: var(--cui-collapse-size) !important;
            max-height: var(--cui-collapse-size) !important;
            --custom-app-top-bar-height: calc(24px + var(--space-8));
        }
        ${sidebarBase} { --custom-app-top-bar-height: var(--cui-collapse-size); }
    `.replace(/\s+/g, " ");
}

function windowBarFloatCSS(): string {
    const frameBar = cls(m.frame?.bar, '[class*="titleBar_"]');
    const sidebarBase = cls(m.sidebar?.base, '[class*="base_"]');

    return `
        ${frameBar} {
            position: absolute !important; top: 0 !important; left: 0 !important;
            right: 0 !important; background: var(--bg-base-tertiary) !important;
            z-index: 200 !important; --custom-app-top-bar-height: calc(24px + var(--space-8));
            border-bottom: 1px solid var(--app-border-frame) !important;
        }
        ${sidebarBase} { --custom-app-top-bar-height: var(--cui-collapse-size); }
    `.replace(/\s+/g, " ");
}

function callWindowInit(): void {
    const callsWrapper = cls(m.calls?.wrapper, '[class*="callContainer_"]');
    const callsNoChat = cls(m.calls?.noChat, '[class*="noChat_"]');
    const callContainer = cls(m.calls?.callContainer, '[class*="callContainer_"]');

    addStyle("callWindow_init", `
        ${callsWrapper}:not(${callsNoChat}) {
            transition: min-height var(--cui-transition-speed), max-height var(--cui-transition-speed) !important;
        }
        ${callsWrapper}:not(${callsNoChat}) > ${callContainer} {
            border-left: none !important; border-top: none !important;
            border-bottom: 1px solid var(--border-subtle) !important;
        }
    `.replace(/\s+/g, " "));
}

function callWindowToggleCSS(): string {
    const callsWrapper = cls(m.calls?.wrapper, '[class*="callContainer_"]');
    const callsNoChat = cls(m.calls?.noChat, '[class*="noChat_"]');

    return `
        ${callsWrapper}:not(${callsNoChat}) {
            min-height: var(--cui-collapse-size) !important;
            max-height: var(--cui-collapse-size) !important;
        }
    `.replace(/\s+/g, " ");
}

function userAreaInit(): void {
    const s = getSettings();
    const sidebarPanels = cls(m.sidebar?.panels, '[class*="panels_"]');
    const userAreaActions = cls(m.userAreaButtons?.actionButtons, '[class*="actionButtons_"]');

    addStyle("userArea_init", `
        ${sidebarPanels} {
            transition: max-height var(--cui-transition-speed), width var(--cui-transition-speed), border var(--cui-transition-speed) !important;
            max-height: ${cssNum(s.userAreaMaxHeight, 80, 2000)}px !important;
            width: calc((var(--cui-channel-list-width) * var(--cui-channel-list-toggled)) + (var(--custom-guild-list-width) * var(--cui-server-list-toggled) * var(--cui-compat-hsl) * (1 - var(--fst-server-list-collapsed))) - (var(--space-xs) * 2)) !important;
            border-left-width: clamp(0px, calc(1px * ((var(--cui-server-list-toggled) * var(--cui-compat-hsl) * (1 - var(--fst-server-list-collapsed))) + var(--cui-channel-list-toggled))), 1px) !important;
            border-right-width: clamp(0px, calc(1px * ((var(--cui-server-list-toggled) * var(--cui-compat-hsl) * (1 - var(--fst-server-list-collapsed))) + var(--cui-channel-list-toggled))), 1px) !important;
            opacity: clamp(0, calc((var(--cui-server-list-toggled) * var(--cui-compat-hsl) * (1 - var(--fst-server-list-collapsed))) + var(--cui-channel-list-toggled)), 1) !important;
            z-index: 191 !important;
            overflow: hidden !important;
        }
        ${userAreaActions} button { padding: 0 !important; }
    `.replace(/\s+/g, " "));
}

function userAreaToggleCSS(): string {
    const sidebarPanels = cls(m.sidebar?.panels, '[class*="panels_"]');

    return `
        ${sidebarPanels} {
            max-height: var(--cui-collapse-size) !important;
            border-top-width: 0px !important; border-bottom-width: 0px !important;
            overflow: hidden !important;
        }
    `.replace(/\s+/g, " ");
}

function searchPanelInit(): void {
    const s = getSettings();
    const searchResultsWrap = cls(m.search?.searchResultsWrap, '[class*="searchResultsWrap_"]');

    addStyle("searchPanel_init", `
        ${searchResultsWrap} {
            max-width: var(--cui-search-panel-width) !important;
            width: var(--cui-search-panel-width) !important;
            min-width: var(--cui-search-panel-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
            overflow: visible !important;
            border-left: 1px solid var(--border-subtle) !important;
        }
        ${searchResultsWrap} > header > div:last-child { justify-content: end !important; }
        ${cssNum(s.searchPanelWidth) ? `
            ${searchResultsWrap}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; left: -4px;
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function searchPanelToggleCSS(): string {
    const searchResultsWrap = cls(m.search?.searchResultsWrap, '[class*="searchResultsWrap_"]');

    return `
        ${searchResultsWrap} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
        }
    `.replace(/\s+/g, " ");
}

function searchPanelFloatCSS(): string {
    const searchResultsWrap = cls(m.search?.searchResultsWrap, '[class*="searchResultsWrap_"]');

    return `
        ${searchResultsWrap} {
            position: absolute !important; z-index: 190 !important;
            max-height: 100% !important; height: 100% !important; right: 0 !important;
        }
    `.replace(/\s+/g, " ");
}

function forumPopoutInit(): void {
    const s = getSettings();
    const chatLayerWrapper = cls(m.popout?.chatLayerWrapper, '[class*="chatLayerWrapper_"]');
    const popoutContainer = cls(m.popout?.container, '[class*="popoutContainer_"]');
    const threadSidebarOpen = cls(m.guilds?.threadSidebarOpen, '[class*="threadSidebarOpen_"]');
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const callsNoChat = cls(m.calls?.noChat, '[class*="noChat_"]');

    addStyle("forumPopout_init", `
        ${chatLayerWrapper} {
            max-width: var(--cui-forum-popout-width) !important;
            width: var(--cui-forum-popout-width) !important;
            min-width: var(--cui-forum-popout-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
            position: absolute !important; z-index: 190 !important;
            top: var(--cui-forum-panel-top) !important;
            height: calc(100% - var(--cui-forum-panel-top)) !important;
            max-height: 100% !important; overflow: hidden !important;
        }
        ${popoutContainer} {
            border-top: 1px solid var(--border-subtle) !important;
            border-left: 1px solid var(--border-subtle) !important;
        }
        ${chatLayerWrapper} > * { width: 100% !important; border-radius: 0 !important; }
        ${threadSidebarOpen} { flex-shrink: 999999999 !important; }
        ${guildsContent}, ${callsNoChat} {
            --width: var(--cui-forum-popout-width);
            --transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
        }
        ${guildsContent}:after, ${callsNoChat}:after {
            content: ""; display: ${el.getForumPopout() ? "block" : "none"};
            height: 100%; max-width: var(--width); width: var(--width);
            min-width: var(--width); transition: var(--transition);
        }
        ${cssNum(s.forumPopoutWidth) ? `
            ${chatLayerWrapper}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; left: -4px;
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function forumPopoutToggleCSS(): string {
    const chatLayerWrapper = cls(m.popout?.chatLayerWrapper, '[class*="chatLayerWrapper_"]');
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const callsNoChat = cls(m.calls?.noChat, '[class*="noChat_"]');

    return `
        ${chatLayerWrapper} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
        }
        ${guildsContent}:after, ${callsNoChat}:after {
            max-width: var(--cui-collapse-size);
            width: var(--cui-collapse-size);
            min-width: var(--cui-collapse-size);
        }
    `.replace(/\s+/g, " ");
}

function forumPopoutFloatCSS(): string {
    const guildsContent = cls(m.guilds?.content, '[class*="content_"]');
    const callsNoChat = cls(m.calls?.noChat, '[class*="noChat_"]');

    return `
        ${guildsContent}:after, ${callsNoChat}:after {
            max-width: 0 !important; width: 0 !important; min-width: 0 !important;
        }
    `.replace(/\s+/g, " ");
}

function activityPanelInit(): void {
    const s = getSettings();
    const nowPlayingColumn = cls(m.social?.nowPlayingColumn, '[class*="nowPlayingColumn_"]');
    const activityItemCard = cls(m.activity?.itemCard, '[class*="itemCard_"]');

    addStyle("activityPanel_init", `
        ${nowPlayingColumn} {
            max-width: var(--cui-activity-panel-width) !important;
            width: var(--cui-activity-panel-width) !important;
            min-width: var(--cui-activity-panel-width) !important;
            transition: max-width var(--cui-transition-speed), width var(--cui-transition-speed), min-width var(--cui-transition-speed);
            display: initial !important;
        }
        ${activityItemCard} { overflow: hidden !important; }
        ${cssNum(s.activityPanelWidth) ? `
            ${nowPlayingColumn}:before {
                cursor: e-resize; z-index: 200; position: absolute; content: "";
                width: 16px; height: 100%; transform: translateX(-4px);
            }
        ` : ""}
    `.replace(/\s+/g, " "));
}

function activityPanelToggleCSS(): string {
    const nowPlayingColumn = cls(m.social?.nowPlayingColumn, '[class*="nowPlayingColumn_"]');

    return `
        ${nowPlayingColumn} {
            max-width: var(--cui-collapse-size) !important;
            width: var(--cui-collapse-size) !important;
            min-width: var(--cui-collapse-size) !important;
        }
    `.replace(/\s+/g, " ");
}

function activityPanelFloatCSS(): string {
    const nowPlayingColumn = cls(m.social?.nowPlayingColumn, '[class*="nowPlayingColumn_"]');

    return `
        ${nowPlayingColumn} {
            position: absolute !important; z-index: 190 !important;
            right: 0 !important; height: 100% !important; max-height: 100% !important;
        }
    `.replace(/\s+/g, " ");
}

const panelNames = [
    "serverList", "channelList", "membersList", "userProfile",
    "messageInput", "windowBar", "callWindow", "userArea",
    "searchPanel", "forumPopout", "activityPanel",
];

const panelInits = [
    serverListInit, channelListInit, membersListInit, userProfileInit,
    messageInputInit, windowBarInit, callWindowInit, userAreaInit,
    searchPanelInit, forumPopoutInit, activityPanelInit,
];

const panelToggleCSS = [
    serverListToggleCSS, channelListToggleCSS, membersListToggleCSS, userProfileToggleCSS,
    messageInputToggleCSS, windowBarToggleCSS, callWindowToggleCSS, userAreaToggleCSS,
    searchPanelToggleCSS, forumPopoutToggleCSS, activityPanelToggleCSS,
];

const panelFloatCSS: ((() => string) | null)[] = [
    serverListFloatCSS, channelListFloatCSS, membersListFloatCSS, userProfileFloatCSS,
    messageInputFloatCSS, windowBarFloatCSS, null, null,
    searchPanelFloatCSS, forumPopoutFloatCSS, activityPanelFloatCSS,
];

export function initPanel(index: number): void {
    const fn = panelInits.at(index);
    if (fn) fn();
}

export function togglePanel(index: number): void {
    const s = getSettings();
    const state = panelStates.at(index);
    const name = panelNames.at(index);
    if (!state || !name) return;

    if (!s.collapseDisabledButtons && s.buttonIndexes.at(index) === 0) {
        state.toggled = !state.toggled;
        return;
    }

    updateVariables();

    const toggleFn = panelToggleCSS.at(index);
    if (!toggleFn) return;

    if (!s.expandOnHover || !s.expandOnHoverEnabled.at(index)) {
        if (state.toggled) addStyle(`${name}_toggle`, toggleFn());
        else removeStyle(`${name}_toggle`);
    } else {
        if (state.toggled) {
            addStyle(`${name}_toggle_dynamic`, toggleFn());
            const floatFn = panelFloatCSS.at(index);
            if (floatFn && s.floatingPanels && s.floatingEnabled.at(index) === "hover")
                setTimeout(() => addStyle(`${name}_float`, floatFn()), s.transitionSpeed);
        } else {
            removeStyle(`${name}_toggle_dynamic`);
            const floatFn = panelFloatCSS.at(index);
            if (floatFn && s.floatingPanels && s.floatingEnabled.at(index) === "hover")
                removeStyle(`${name}_float`);
        }
    }

    state.toggled = !state.toggled;
}

export function floatPanel(index: number): void {
    const floatFn = panelFloatCSS.at(index);
    const name = panelNames.at(index);
    if (floatFn && name) addStyle(`${name}_float`, floatFn());
}

export function clearPanel(index: number): void {
    const name = panelNames.at(index);
    if (!name) return;
    removeStyle(`${name}_init`);
    removeStyle(`${name}_toggle`);
    removeStyle(`${name}_toggle_dynamic`);
    removeStyle(`${name}_float`);
    removeStyle(`${name}_queryToggle`);
    const state = panelStates.at(index);
    if (state) state.toggled = true;
}

export function collapseElementDynamic(index: number, collapsed: boolean, collapsedStates: boolean[]): void {
    const name = panelNames.at(index);
    const toggleFn = panelToggleCSS.at(index);
    if (!name || !toggleFn) return;
    if (collapsed) addStyle(`${name}_toggle_dynamic`, toggleFn());
    else removeStyle(`${name}_toggle_dynamic`);
    collapsedStates.splice(index, 1, collapsed);
}

export function initSettingsButtons(): void {
    const s = getSettings();
    const avatarWrapper = cls(m.user?.avatarWrapper, '[class*="avatarWrapper_"]');
    const buttons = cls(m.user?.buttons, '[class*="buttons_"]');

    addStyle("settingsButtons_init", `
        ${avatarWrapper} { flex-grow: 1 !important; }
        ${buttons} {
            transition: gap var(--cui-transition-speed) !important;
            transform: translateX(calc((1 - var(--cui-channel-list-toggled)) * 1000000000px));
        }
        ${buttons} > *:not(:last-child):not([class*="gameActivityToggle"]) {
            transition: width var(--cui-transition-speed) !important;
            overflow: hidden !important;
        }
    `.replace(/\s+/g, " "));
    if (s.collapseSettings) hideSettingsButtons();
}

export function hideSettingsButtons(): void {
    const buttons = cls(m.user?.buttons, '[class*="buttons_"]');
    addStyle("settingsButtons_hide", `
        ${buttons} { gap: 0px !important; }
        ${buttons} > *:not(:last-child):not([class*="gameActivityToggle"]) { width: 0px !important; }
    `.replace(/\s+/g, " "));
}

export function showSettingsButtons(): void {
    removeStyle("settingsButtons_hide");
}

export function clearSettingsButtons(): void {
    showSettingsButtons();
    removeStyle("settingsButtons_init");
}

export function initMessageInputButtons(): void {
    const s = getSettings();
    const buttons = cls(m.input?.buttons, '[class*="buttons_"]');

    addStyle("messageInputButtons_init", `
        ${buttons} { transition: gap var(--cui-transition-speed) !important; }
        ${buttons} > *:not(:last-child) {
            transition: max-width var(--cui-transition-speed) !important;
            max-width: ${cssNum(s.messageInputButtonWidth, 20, 200)}px !important;
            overflow: hidden !important;
        }
    `.replace(/\s+/g, " "));
    if (s.messageInputCollapse) hideMessageInputButtons();
}

export function hideMessageInputButtons(): void {
    const buttons = cls(m.input?.buttons, '[class*="buttons_"]');
    addStyle("messageInputButtons_hide", `
        ${buttons} { gap: 0px !important; }
        ${buttons} > *:not(:last-child) { max-width: 0px !important; }
    `.replace(/\s+/g, " "));
}

export function showMessageInputButtons(): void {
    removeStyle("messageInputButtons_hide");
}

export function clearMessageInputButtons(): void {
    showMessageInputButtons();
    removeStyle("messageInputButtons_init");
}

export function initToolbarButtons(): void {
    const s = getSettings();
    addStyle("toolbarButtons_init", `
        .cui-toolbar > *:not(:last-child) {
            transition: width var(--cui-transition-speed) !important;
            width: var(--space-32) !important;
            overflow: hidden !important;
        }
    `.replace(/\s+/g, " "));
    if (s.collapseToolbar === "cui") hideToolbarButtons();
}

export function hideToolbarButtons(): void {
    addStyle("toolbarButtons_hide", `
        .cui-toolbar { gap: 0 !important; }
        .cui-toolbar > *:not(:last-child) { width: 0px !important; margin: 0px !important; }
    `.replace(/\s+/g, " "));
}

export function showToolbarButtons(): void {
    removeStyle("toolbarButtons_hide");
}

export function clearToolbarButtons(): void {
    showToolbarButtons();
    removeStyle("toolbarButtons_init");
}

export function initToolbarFull(): void {
    const s = getSettings();
    const guildsTitle = cls(m.guilds?.title, '[class*="titleContainer_"] [class*="title_"]');
    const iconsToolbar = cls(m.icons?.toolbar, '[class*="toolbar_"]');

    addStyle("toolbarFull_init", `
        ${guildsTitle} ${iconsToolbar} > *:not(:last-child):not(.cui-toolbar) {
            transition: max-width var(--cui-transition-speed) !important;
            max-width: ${cssNum(s.toolbarElementMaxWidth, 40, 2000)}px !important;
            overflow: hidden !important;
        }
    `.replace(/\s+/g, " "));
    if (s.collapseToolbar === "all") hideToolbarFull();
}

export function hideToolbarFull(): void {
    const guildsTitle = cls(m.guilds?.title, '[class*="titleContainer_"] [class*="title_"]');
    const iconsToolbar = cls(m.icons?.toolbar, '[class*="toolbar_"]');

    addStyle("toolbarFull_hide", `
        ${guildsTitle} ${iconsToolbar} > *:not(:last-child):not(.cui-toolbar) { max-width: 0px !important; }
    `.replace(/\s+/g, " "));
}

export function showToolbarFull(): void {
    removeStyle("toolbarFull_hide");
}

export function clearToolbarFull(): void {
    showToolbarFull();
    removeStyle("toolbarFull_init");
}

export function initAllStyles(): void {
    const s = getSettings();
    initRootStyles();

    for (let i = 0; i < PANEL_COUNT; i++) {
        initPanel(i);
        if (!s.buttonsActive.at(i)) togglePanel(i);
    }

    initSettingsButtons();
    initMessageInputButtons();
    initToolbarButtons();
    initToolbarFull();
}

export function clearAllStyles(): void {
    clearRootStyles();

    for (let i = 0; i < PANEL_COUNT; i++) {
        clearPanel(i);
    }

    clearSettingsButtons();
    clearMessageInputButtons();
    clearToolbarButtons();
    clearToolbarFull();
}
