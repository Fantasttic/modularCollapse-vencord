/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { DataStore } from "@api/index";
import { definePluginSettings } from "@api/Settings";
import { OptionType } from "@utils/types";

import { CollapseSettingsPanel } from "./CollapseSettingsPanel";

const STORE_KEY = "ModularCollapse";

export interface CUISettings {
    transitionSpeed: number;
    collapseToolbar: false | "cui" | "all";
    collapseSettings: boolean;
    messageInputCollapse: boolean;
    keyboardShortcuts: boolean;
    shortcutList: string[][];
    collapseDisabledButtons: boolean;
    buttonIndexes: number[];
    floatingPanels: boolean;
    floatingEnabled: (false | "hover" | "always" | null)[];
    expandOnHover: boolean;
    expandOnHoverEnabled: boolean[];
    sizeCollapse: boolean;
    sizeCollapseThreshold: number[];
    conditionalCollapse: boolean;
    collapseConditionals: string[];
    collapseSize: number;
    buttonCollapseFudgeFactor: number;
    expandOnHoverFudgeFactor: number;
    messageInputButtonWidth: number;
    toolbarElementMaxWidth: number;
    userAreaMaxHeight: number;
    buttonsActive: boolean[];
    channelListWidth: number;
    membersListWidth: number;
    userProfileWidth: number;
    searchPanelWidth: number;
    forumPopoutWidth: number;
    activityPanelWidth: number;
    defaultChannelListWidth: number;
    defaultMembersListWidth: number;
    defaultUserProfileWidth: number;
    defaultSearchPanelWidth: number;
    defaultForumPopoutWidth: number;
    defaultActivityPanelWidth: number;
}

const DEFAULTS: CUISettings = {
    transitionSpeed: 200,
    collapseToolbar: "cui",
    collapseSettings: true,
    messageInputCollapse: true,
    keyboardShortcuts: true,
    shortcutList: [
        ["Alt", "s"], ["Alt", "c"], ["Alt", "m"], ["Alt", "p"],
        ["Alt", "i"], ["Alt", "w"], ["Alt", "v"], ["Alt", "u"],
        ["Alt", "q"], ["Alt", "f"], ["Alt", "a"],
    ],
    collapseDisabledButtons: false,
    buttonIndexes: [1, 2, 4, 5, 3, 0, 9, 0, 6, 7, 8],
    floatingPanels: true,
    floatingEnabled: ["hover", "hover", "hover", "hover", "hover", "hover", null, null, "hover", "hover", "hover"],
    expandOnHover: true,
    expandOnHoverEnabled: [true, true, true, true, true, true, true, true, true, true, true],
    sizeCollapse: false,
    sizeCollapseThreshold: [500, 600, 950, 1200, 400, 200, 550, 400, 950, 950, 950],
    conditionalCollapse: false,
    collapseConditionals: ["", "", "", "", "", "", "", "", "", "", ""],
    collapseSize: 0,
    buttonCollapseFudgeFactor: 10,
    expandOnHoverFudgeFactor: 15,
    messageInputButtonWidth: 40,
    toolbarElementMaxWidth: 400,
    userAreaMaxHeight: 420,
    buttonsActive: [true, true, true, true, true, true, true, true, true, true, true],
    channelListWidth: 240,
    membersListWidth: 240,
    userProfileWidth: 340,
    searchPanelWidth: 418,
    forumPopoutWidth: 450,
    activityPanelWidth: 360,
    defaultChannelListWidth: 240,
    defaultMembersListWidth: 240,
    defaultUserProfileWidth: 340,
    defaultSearchPanelWidth: 418,
    defaultForumPopoutWidth: 450,
    defaultActivityPanelWidth: 360,
};

const ARRAY_LENGTHS: Partial<Record<keyof CUISettings, number>> = {
    shortcutList: 11,
    buttonIndexes: 11,
    floatingEnabled: 11,
    expandOnHoverEnabled: 11,
    sizeCollapseThreshold: 11,
    collapseConditionals: 11,
    buttonsActive: 11,
};

export const settings = definePluginSettings({
    config: {
        type: OptionType.COMPONENT,
        component: CollapseSettingsPanel,
    },
    transitionSpeed: {
        type: OptionType.NUMBER,
        description: "Transition speed in milliseconds",
        default: 200,
        hidden: true,
    },
    collapseToolbar: {
        type: OptionType.CUSTOM,
        default: "cui" as false | "cui" | "all",
    },
    collapseSettings: {
        type: OptionType.BOOLEAN,
        description: "Collapse Settings Button",
        default: true,
        hidden: true,
    },
    messageInputCollapse: {
        type: OptionType.BOOLEAN,
        description: "Message Input Collapse",
        default: true,
        hidden: true,
    },
    keyboardShortcuts: {
        type: OptionType.BOOLEAN,
        description: "Keyboard Shortcuts",
        default: true,
        hidden: true,
    },
    shortcutList: {
        type: OptionType.CUSTOM,
        default: [
            ["Alt", "s"], ["Alt", "c"], ["Alt", "m"], ["Alt", "p"],
            ["Alt", "i"], ["Alt", "w"], ["Alt", "v"], ["Alt", "u"],
            ["Alt", "q"], ["Alt", "f"], ["Alt", "a"],
        ] as string[][],
    },
    collapseDisabledButtons: {
        type: OptionType.BOOLEAN,
        description: "Collapse Disabled Buttons",
        default: false,
        hidden: true,
    },
    buttonIndexes: {
        type: OptionType.CUSTOM,
        default: [1, 2, 4, 5, 3, 0, 9, 0, 6, 7, 8] as number[],
    },
    floatingPanels: {
        type: OptionType.BOOLEAN,
        description: "Floating Panels",
        default: true,
        hidden: true,
    },
    floatingEnabled: {
        type: OptionType.CUSTOM,
        default: ["hover", "hover", "hover", "hover", "hover", "hover", null, null, "hover", "hover", "hover"] as (false | "hover" | "always" | null)[],
    },
    expandOnHover: {
        type: OptionType.BOOLEAN,
        description: "Expand On Hover",
        default: true,
        hidden: true,
    },
    expandOnHoverEnabled: {
        type: OptionType.CUSTOM,
        default: [true, true, true, true, true, true, true, true, true, true, true] as boolean[],
    },
    sizeCollapse: {
        type: OptionType.BOOLEAN,
        description: "Size Collapse",
        default: false,
        hidden: true,
    },
    sizeCollapseThreshold: {
        type: OptionType.CUSTOM,
        default: [500, 600, 950, 1200, 400, 200, 550, 400, 950, 950, 950] as number[],
    },
    conditionalCollapse: {
        type: OptionType.BOOLEAN,
        description: "Conditional Collapse",
        default: false,
        hidden: true,
    },
    collapseConditionals: {
        type: OptionType.CUSTOM,
        default: ["", "", "", "", "", "", "", "", "", "", ""] as string[],
    },
    collapseSize: {
        type: OptionType.NUMBER,
        description: "Collapse Size",
        default: 0,
        hidden: true,
    },
    buttonCollapseFudgeFactor: {
        type: OptionType.NUMBER,
        description: "Button Collapse Fudge Factor",
        default: 10,
        hidden: true,
    },
    expandOnHoverFudgeFactor: {
        type: OptionType.NUMBER,
        description: "Expand On Hover Fudge Factor",
        default: 15,
        hidden: true,
    },
    messageInputButtonWidth: {
        type: OptionType.NUMBER,
        description: "Message Input Button Width",
        default: 40,
        hidden: true,
    },
    toolbarElementMaxWidth: {
        type: OptionType.NUMBER,
        description: "Toolbar Element Max Width",
        default: 400,
        hidden: true,
    },
    userAreaMaxHeight: {
        type: OptionType.NUMBER,
        description: "User Area Max Height",
        default: 420,
        hidden: true,
    },
    buttonsActive: {
        type: OptionType.CUSTOM,
        default: [true, true, true, true, true, true, true, true, true, true, true] as boolean[],
    },
    channelListWidth: {
        type: OptionType.NUMBER,
        description: "Channel List Width",
        default: 240,
        hidden: true,
    },
    membersListWidth: {
        type: OptionType.NUMBER,
        description: "Members List Width",
        default: 240,
        hidden: true,
    },
    userProfileWidth: {
        type: OptionType.NUMBER,
        description: "User Profile Width",
        default: 340,
        hidden: true,
    },
    searchPanelWidth: {
        type: OptionType.NUMBER,
        description: "Search Panel Width",
        default: 418,
        hidden: true,
    },
    forumPopoutWidth: {
        type: OptionType.NUMBER,
        description: "Forum Popout Width",
        default: 450,
        hidden: true,
    },
    activityPanelWidth: {
        type: OptionType.NUMBER,
        description: "Activity Panel Width",
        default: 360,
        hidden: true,
    },
    defaultChannelListWidth: {
        type: OptionType.NUMBER,
        description: "Default Channel List Width",
        default: 240,
        hidden: true,
    },
    defaultMembersListWidth: {
        type: OptionType.NUMBER,
        description: "Default Members List Width",
        default: 240,
        hidden: true,
    },
    defaultUserProfileWidth: {
        type: OptionType.NUMBER,
        description: "Default User Profile Width",
        default: 340,
        hidden: true,
    },
    defaultSearchPanelWidth: {
        type: OptionType.NUMBER,
        description: "Default Search Panel Width",
        default: 418,
        hidden: true,
    },
    defaultForumPopoutWidth: {
        type: OptionType.NUMBER,
        description: "Default Forum Popout Width",
        default: 450,
        hidden: true,
    },
    defaultActivityPanelWidth: {
        type: OptionType.NUMBER,
        description: "Default Activity Panel Width",
        default: 360,
        hidden: true,
    },
});

function repairSchema(store: any): void {
    for (const [key, expectedLen] of Object.entries(ARRAY_LENGTHS) as [keyof CUISettings, number][]) {
        const val = Reflect.get(store, key);
        const def = Reflect.get(DEFAULTS, key) as unknown[];
        if (!Array.isArray(val)) {
            Reflect.set(store, key, [...def]);
            continue;
        }
        if (val.length < expectedLen) {
            Reflect.set(store, key, [...val, ...def.slice(val.length)]);
        } else if (val.length > expectedLen) {
            Reflect.set(store, key, val.slice(0, expectedLen));
        }
    }
}

let _shortcutSets: Set<string>[] | null = null;

type SettingsListener = () => void;
const _listeners = new Set<SettingsListener>();

export function addSettingsListener(listener: SettingsListener): () => void {
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
}

function notifySettingsListeners(): void {
    for (const listener of _listeners) {
        try {
            listener();
        } catch (e) {
            console.error("[ModularCollapse] Settings listener error:", e);
        }
    }
}

export async function loadSettings(): Promise<CUISettings> {
    try {
        const stored = await DataStore.get(STORE_KEY) as Partial<CUISettings> | undefined;
        if (stored) {
            for (const [key, val] of Object.entries(stored)) {
                if (key in DEFAULTS) {
                    Reflect.set(settings.store, key, val);
                }
            }
            await DataStore.del(STORE_KEY);
            console.info("[ModularCollapse] Migrated legacy DataStore settings to Vencord settings");
        }
    } catch (e) {
        console.error("[ModularCollapse] Error migrating settings:", e);
    }

    repairSchema(settings.store);
    _shortcutSets = null;
    return settings.store as unknown as CUISettings;
}

export function getSettings(): CUISettings {
    return settings.store as unknown as CUISettings;
}

export async function setSetting<K extends keyof CUISettings>(key: K, value: CUISettings[K]): Promise<void> {
    Reflect.set(settings.store, key, value);
    if (key === "shortcutList") _shortcutSets = null;
    notifySettingsListeners();
}

export async function setSettingArrayIndex<K extends keyof CUISettings>(
    key: K,
    index: number,
    value: unknown
): Promise<void> {
    const arr = Reflect.get(settings.store, key);
    if (Array.isArray(arr)) {
        const copy = [...arr];
        copy.splice(index, 1, value);
        Reflect.set(settings.store, key, copy);
        if (key === "shortcutList") _shortcutSets = null;
        notifySettingsListeners();
    }
}

export function getShortcutSets(): Set<string>[] {
    if (!_shortcutSets) {
        const s = getSettings();
        _shortcutSets = s.shortcutList.map(keys => new Set(keys));
    }
    return _shortcutSets;
}
