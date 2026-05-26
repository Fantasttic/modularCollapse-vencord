/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./CollapseSettingsPanel.css";

import { ExpandableSection } from "@components/ExpandableCard";
import { FormSwitch } from "@components/FormSwitch";
import { Forms, Select, TextInput, useState, useMemo } from "@webpack/common";

import { getCurrentLabels, ICONS, PANEL_COUNT } from "./constants";
import { getSettings, setSetting, setSettingArrayIndex, settings } from "./settings";

type Tab = "general" | "panels";

export function CollapseSettingsPanel() {
    const s = settings.use();
    const [activeTab, setActiveTab] = useState<Tab>("general");

    const labels = useMemo(() => getCurrentLabels(), []);

    const renderGeneralTab = () => (
        <div className="cui-settings-tab-panel">
            <div className="cui-settings-section-card">
                <Forms.FormTitle tag="h3">Animations & Transitions</Forms.FormTitle>
                <div className="cui-settings-grid">
                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Transition Speed (ms)</label>
                        <TextInput
                            type="number"
                            value={String(s.transitionSpeed)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("transitionSpeed", val);
                            }}
                            placeholder="200"
                        />
                        <span className="cui-settings-input-desc">Speed of panel collapse/expand animations.</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Toolbar Collapse Mode</label>
                        <Select
                            placeholder="Select Mode"
                            options={[
                                { label: "Disabled", value: false },
                                { label: "CUI Buttons Only", value: "cui" },
                                { label: "All Toolbar Buttons", value: "all" },
                            ]}
                            closeOnSelect={true}
                            select={v => setSetting("collapseToolbar", v as any)}
                            isSelected={v => v === s.collapseToolbar}
                            serialize={v => String(v)}
                        />
                        <span className="cui-settings-input-desc">Choose which toolbar buttons collapse automatically.</span>
                    </div>
                </div>
            </div>

            <div className="cui-settings-section-card">
                <Forms.FormTitle tag="h3">Toggles & Features</Forms.FormTitle>
                <div className="cui-settings-grid">
                    <FormSwitch
                        title="Collapse Settings Buttons"
                        description="Hide User Settings and Profile buttons in the user area when not focused."
                        value={s.collapseSettings}
                        onChange={v => setSetting("collapseSettings", v)}
                    />
                    <FormSwitch
                        title="Message Input Collapse"
                        description="Hide accessory buttons inside the chat message input until hovered."
                        value={s.messageInputCollapse}
                        onChange={v => setSetting("messageInputCollapse", v)}
                    />
                    <FormSwitch
                        title="Keyboard Shortcuts"
                        description="Enable hotkeys to toggle individual panels collapsible state."
                        value={s.keyboardShortcuts}
                        onChange={v => setSetting("keyboardShortcuts", v)}
                    />
                    <FormSwitch
                        title="Collapse Disabled Buttons"
                        description="Remove panel toggles from the CUI toolbar if their panels are disabled."
                        value={s.collapseDisabledButtons}
                        onChange={v => setSetting("collapseDisabledButtons", v)}
                    />
                    <FormSwitch
                        title="Floating Panels"
                        description="Allow panels to overlap the chat area instead of shifting it."
                        value={s.floatingPanels}
                        onChange={v => setSetting("floatingPanels", v)}
                    />
                    <FormSwitch
                        title="Expand on Hover"
                        description="Expand panels automatically when placing your cursor near the screen edges."
                        value={s.expandOnHover}
                        onChange={v => setSetting("expandOnHover", v)}
                    />
                    <FormSwitch
                        title="Size-Based Auto Collapse"
                        description="Collapse panels automatically if window width is below a panel's threshold."
                        value={s.sizeCollapse}
                        onChange={v => setSetting("sizeCollapse", v)}
                    />
                    <FormSwitch
                        title="Conditional Auto Collapse"
                        description="Auto-collapse panels based on custom evaluation conditions (width/height)."
                        value={s.conditionalCollapse}
                        onChange={v => setSetting("conditionalCollapse", v)}
                    />
                </div>
            </div>

            <div className="cui-settings-section-card">
                <Forms.FormTitle tag="h3">Advanced Calibration & Sizes</Forms.FormTitle>
                <div className="cui-settings-grid">
                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Button Collapse Fudge Factor (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.buttonCollapseFudgeFactor)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("buttonCollapseFudgeFactor", val);
                            }}
                            placeholder="10"
                        />
                        <span className="cui-settings-input-desc">Hover margin to trigger settings/toolbar expansion.</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Hover Expand Fudge Factor (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.expandOnHoverFudgeFactor)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("expandOnHoverFudgeFactor", val);
                            }}
                            placeholder="15"
                        />
                        <span className="cui-settings-input-desc">Hover margin to expand side panels on screen edges.</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Collapsed Panel Size (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.collapseSize)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("collapseSize", val);
                            }}
                            placeholder="0"
                        />
                        <span className="cui-settings-input-desc">The width/height of panels when collapsed (usually 0).</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">Chat Button Width (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.messageInputButtonWidth)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("messageInputButtonWidth", val);
                            }}
                            placeholder="40"
                        />
                        <span className="cui-settings-input-desc">Reserved width per button inside the chat box container.</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">CUI Toolbar Max Width (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.toolbarElementMaxWidth)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("toolbarElementMaxWidth", val);
                            }}
                            placeholder="400"
                        />
                        <span className="cui-settings-input-desc">Max horizontal size limit of CUI button toolbar.</span>
                    </div>

                    <div className="cui-settings-form-group">
                        <label className="cui-settings-input-label">User Area Max Height (px)</label>
                        <TextInput
                            type="number"
                            value={String(s.userAreaMaxHeight)}
                            onChange={v => {
                                const val = parseInt(v);
                                if (!isNaN(val) && val >= 0) setSetting("userAreaMaxHeight", val);
                            }}
                            placeholder="420"
                        />
                        <span className="cui-settings-input-desc">Max vertical height of user identity and status zone.</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPanelsTab = () => (
        <div className="cui-settings-tab-panel">
            <Forms.FormText>Configure settings for each individual panel section.</Forms.FormText>
            {Array.from({ length: PANEL_COUNT }).map((_, index) => {
                const isActive = s.buttonsActive.at(index);
                const label = labels.at(index) || `Panel ${index}`;

                return (
                    <ExpandableSection
                        key={index}
                        initialExpanded={false}
                        renderContent={() => (
                            <div className="cui-panel-settings-grid">
                                <FormSwitch
                                    title="Toolbar Toggle Button"
                                    description="Show this panel's toggle icon in the top toolbar."
                                    value={isActive}
                                    onChange={v => setSettingArrayIndex("buttonsActive", index, v)}
                                />

                                <div className="cui-settings-form-group">
                                    <label className="cui-settings-input-label">Floating Mode</label>
                                    {s.floatingEnabled.at(index) === null ? (
                                        <div className="cui-sub-text">Floating is not supported for this panel.</div>
                                    ) : (
                                        <Select
                                            placeholder="Select Floating Mode"
                                            options={[
                                                { label: "Disabled", value: false },
                                                { label: "Float on Hover", value: "hover" },
                                                { label: "Always Float", value: "always" },
                                            ]}
                                            closeOnSelect={true}
                                            select={v => setSettingArrayIndex("floatingEnabled", index, v as any)}
                                            isSelected={v => v === s.floatingEnabled.at(index)}
                                            serialize={v => String(v)}
                                        />
                                    )}
                                </div>

                                <FormSwitch
                                    title="Expand on Hover"
                                    description="Trigger hover expansion for this specific panel."
                                    value={s.expandOnHoverEnabled.at(index)}
                                    onChange={v => setSettingArrayIndex("expandOnHoverEnabled", index, v)}
                                />

                                <div className="cui-settings-form-group">
                                    <label className="cui-settings-input-label">Size Collapse Threshold (px)</label>
                                    <TextInput
                                        type="number"
                                        value={String(s.sizeCollapseThreshold.at(index))}
                                        onChange={v => {
                                            const val = parseInt(v);
                                            if (!isNaN(val) && val >= 0) {
                                                setSettingArrayIndex("sizeCollapseThreshold", index, val);
                                            }
                                        }}
                                        placeholder="950"
                                    />
                                    <span className="cui-settings-input-desc">Collapse panel below this screen width (requires Size-Based Auto Collapse enabled).</span>
                                </div>

                                <div className="cui-settings-form-group">
                                    <label className="cui-settings-input-label">Keyboard Shortcut</label>
                                    <TextInput
                                        type="text"
                                        value={s.shortcutList.at(index)?.join("+") || ""}
                                        onChange={v => {
                                            const keys = v.split("+").map(k => k.trim()).filter(Boolean);
                                            setSettingArrayIndex("shortcutList", index, keys);
                                        }}
                                        placeholder="e.g. Alt+s"
                                    />
                                    <span className="cui-settings-input-desc">Keys combined with + (e.g. Alt+s).</span>
                                </div>

                                <div className="cui-settings-form-group">
                                    <label className="cui-settings-input-label">Conditional Collapse Expression</label>
                                    <TextInput
                                        type="text"
                                        value={s.collapseConditionals.at(index) || ""}
                                        onChange={v => setSettingArrayIndex("collapseConditionals", index, v)}
                                        placeholder="e.g. innerWidth < 1200"
                                    />
                                    <span className="cui-settings-input-desc">Custom expression (e.g. innerWidth &lt; 1000).</span>
                                </div>
                            </div>
                        )}
                    >
                        <div className="cui-panel-card-header">
                            <div
                                className="cui-panel-icon"
                                dangerouslySetInnerHTML={{
                                    __html: `<svg width="20" height="20" fill="none" viewBox="0 0 24 24">${ICONS.at(index)}</svg>`
                                }}
                            />
                            <span className="cui-panel-title">{label}</span>
                            <span className={`cui-panel-badge ${isActive ? "active" : "inactive"}`}>
                                {isActive ? "ACTIVE" : "INACTIVE"}
                            </span>
                        </div>
                    </ExpandableSection>
                );
            })}
        </div>
    );

    return (
        <div className="cui-settings-root">
            <div className="cui-settings-header">
                <div className="cui-settings-title">ModularCollapse Panel Control</div>
                <div className="cui-settings-subtitle">
                    A beautiful, interactive console to design the fluidity and response of Discord's UI components.
                </div>
            </div>

            <div className="cui-settings-tabs">
                <button
                    className={`cui-settings-tab-btn ${activeTab === "general" ? "active" : ""}`}
                    onClick={() => setActiveTab("general")}
                >
                    General Settings
                </button>
                <button
                    className={`cui-settings-tab-btn ${activeTab === "panels" ? "active" : ""}`}
                    onClick={() => setActiveTab("panels")}
                >
                    Panels Configuration
                </button>
            </div>

            {activeTab === "general" ? renderGeneralTab() : renderPanelsTab()}
        </div>
    );
}
