// ============================================================================
// DEBUG PANEL (F9)
// ============================================================================
// Developer debug panel for inspecting and modifying game state at runtime.
// Renders as native Phaser objects (graphics + text) on the UIScene.
// Separate from the spatial debug overlay (backtick key) in BaseScene.
//
// Usage:
//   const panel = new DebugPanel(uiScene);
//   panel.toggle();   // F9 — show/hide
//   panel.destroy();  // cleanup
// ============================================================================

(function() {
    'use strict';

    // ── NPC valid states (from Architecture Guide §9) ────────────────────
    const NPC_VALID_STATES = {
        hector_body: ['pre_experiment', 'running_loose', 'coat_dropped', 'captured', 'reunited'],
        hector_head: ['pre_experiment', 'in_locker', 'locker_closed', 'on_shelf', 'reunited'],
        alien:       ['watching_tv', 'angry', 'on_roof', 'locked_out'],
        frank:       ['reading', 'strapped_down', 'victor_brain'],
        victor:      ['in_jar', 'in_frank', 'back_in_jar'],
        robot:       ['in_station', 'deployed', 'chasing_monkey', 'locked_out', 'bumping', 'disabled'],
        earl:        ['behind_fence', 'visible'],
        generator:   ['plugged_in', 'unplugged']
    };

    // ── Inventory item groups ────────────────────────────────────────────
    const ITEM_GROUPS = {
        'General': ['help_wanted_ad', 'crowbar', 'matches', 'candle', 'lit_candle', 'damage_report'],
        'Lab / Hector': ['keycard', 'lab_coat', 'dusty_book'],
        'Clock': ['broken_moon_shoes', 'spring', 'spring_2', 'satellite_shoes', 'repaired_shoes', 'ladder', 'borrowed_item', 'scalpel', 'clock'],
        'Power': ['padlock', 'monkey', 'fuse'],
        'Screen': ['tv_guide', 'wrench', 'tv'],
        'Brain': ['brain', 'trophy_item_1', 'trophy_item_2', 'trophy_assembled', 'spray_paint', 'trophy_painted', 'sharpie', 'fake_trophy', 'goggles', 'hector_disguise'],
        'Finale': ['mirror']
    };

    // ── Layout constants ─────────────────────────────────────────────────
    const PANEL_WIDTH = 380;
    const PANEL_DEPTH = 8000;
    const FONT_SIZE = 14;
    const LINE_HEIGHT = 22;
    const TAB_HEIGHT = 32;
    const TITLE_HEIGHT = 36;
    const PADDING = 12;
    const INDENT = 20;
    const FONT = 'Courier New, monospace';
    const MAX_LOG_ENTRIES = 50;

    class DebugPanel {
        constructor(scene) {
            this.scene = scene;  // UIScene reference
            this.visible = false;
            this.activeTab = 'flags';  // 'flags' | 'inventory' | 'npcs' | 'log'

            // Container for all panel objects
            this.container = null;
            this.bg = null;
            this.contentObjects = [];  // objects created by tab renderers
            this.tabButtons = [];

            // Scroll state per tab
            this.scrollY = { flags: 0, inventory: 0, npcs: 0, log: 0 };
            this.contentHeight = 0;  // total height of current tab content

            // Collapse state per group (persists across tab switches)
            this.collapsed = {};  // key → boolean

            // Event log
            this.eventLog = [];

            // Content mask
            this.contentMask = null;
            this.maskGraphics = null;

            // Bound event listeners (for removal)
            this._onFlagChanged = (data) => this._handleFlagChanged(data);
            this._onInventoryChanged = (data) => this._handleInventoryChanged(data);
            this._onNPCStateChanged = (data) => this._handleNPCStateChanged(data);
            this._onRoomChanged = (data) => this._handleRoomChanged(data);

            // Register state listeners
            TSH.State.on('flagChanged', this._onFlagChanged);
            TSH.State.on('inventoryChanged', this._onInventoryChanged);
            TSH.State.on('npcStateChanged', this._onNPCStateChanged);
            TSH.State.on('roomChanged', this._onRoomChanged);

            // Mouse wheel listener
            this._onWheel = (e) => this._handleWheel(e);

            this._build();
        }

        // ── Build panel structure ────────────────────────────────────────

        _build() {
            const { width, height } = this.scene.scale;
            const x = width - PANEL_WIDTH;

            this.container = this.scene.add.container(0, 0);
            this.container.setDepth(PANEL_DEPTH);
            this.container.setVisible(false);

            // Semi-transparent background
            this.bg = this.scene.add.graphics();
            this.bg.fillStyle(0x000000, 0.88);
            this.bg.fillRect(x, 0, PANEL_WIDTH, height);
            this.bg.lineStyle(2, 0x444466, 1);
            this.bg.lineBetween(x, 0, x, height);
            this.container.add(this.bg);

            // Title bar
            const titleText = this.scene.add.text(x + PADDING, 10, 'Game State', {
                fontFamily: FONT,
                fontSize: '16px',
                color: '#aaccff',
                fontStyle: 'bold'
            });
            this.container.add(titleText);

            // Tab bar
            this._buildTabs(x);

            // Content mask (clips scrollable area)
            this._buildMask(x, height);

            // Initial render
            this._renderTab();
        }

        _buildTabs(x) {
            const tabs = ['Flags', 'Inventory', 'NPCs', 'Log'];
            const tabWidth = (PANEL_WIDTH - PADDING * 2) / tabs.length;
            const tabY = TITLE_HEIGHT;

            tabs.forEach((label, i) => {
                const tabKey = label.toLowerCase();
                const tx = x + PADDING + i * tabWidth;

                const tabBg = this.scene.add.graphics();
                const tabText = this.scene.add.text(
                    tx + tabWidth / 2, tabY + TAB_HEIGHT / 2, label,
                    { fontFamily: FONT, fontSize: '13px', color: '#888888' }
                ).setOrigin(0.5);

                // Hit area
                const hitArea = this.scene.add.rectangle(
                    tx + tabWidth / 2, tabY + TAB_HEIGHT / 2,
                    tabWidth, TAB_HEIGHT, 0x000000, 0
                ).setInteractive({ useHandCursor: true });

                hitArea.on('pointerdown', () => {
                    this.activeTab = tabKey;
                    this.scrollY[tabKey] = this.scrollY[tabKey] || 0;
                    this._updateTabVisuals();
                    this._renderTab();
                });

                this.container.add(tabBg);
                this.container.add(tabText);
                this.container.add(hitArea);

                this.tabButtons.push({ key: tabKey, bg: tabBg, text: tabText, x: tx, width: tabWidth, y: tabY });
            });

            this._updateTabVisuals();
        }

        _updateTabVisuals() {
            const x = this.scene.scale.width - PANEL_WIDTH;

            this.tabButtons.forEach(tab => {
                tab.bg.clear();
                if (tab.key === this.activeTab) {
                    tab.bg.fillStyle(0x222244, 1);
                    tab.bg.fillRect(tab.x, tab.y, tab.width, TAB_HEIGHT);
                    tab.bg.lineStyle(2, 0x6666aa, 1);
                    tab.bg.lineBetween(tab.x, tab.y, tab.x + tab.width, tab.y);
                    tab.text.setColor('#ffffff');
                } else {
                    tab.bg.fillStyle(0x111122, 1);
                    tab.bg.fillRect(tab.x, tab.y, tab.width, TAB_HEIGHT);
                    tab.text.setColor('#666688');
                }
            });
        }

        _buildMask(x, height) {
            const contentTop = TITLE_HEIGHT + TAB_HEIGHT + 4;
            this.contentTop = contentTop;
            this.contentAreaHeight = height - contentTop - 4;

            this.maskGraphics = this.scene.add.graphics();
            this.maskGraphics.fillStyle(0xffffff);
            this.maskGraphics.fillRect(x, contentTop, PANEL_WIDTH, this.contentAreaHeight);
            this.contentMask = this.maskGraphics.createGeometryMask();
            this.maskGraphics.setVisible(false);
        }

        // ── Tab Rendering ────────────────────────────────────────────────

        _clearContent() {
            this.contentObjects.forEach(obj => {
                if (obj && obj.destroy) obj.destroy();
            });
            this.contentObjects = [];
        }

        _renderTab() {
            this._clearContent();
            switch (this.activeTab) {
                case 'flags': this._renderFlags(); break;
                case 'inventory': this._renderInventory(); break;
                case 'npcs': this._renderNPCs(); break;
                case 'log': this._renderLog(); break;
            }
        }

        _addText(textStr, xOffset, yPos, color, opts) {
            const x = this.scene.scale.width - PANEL_WIDTH + PADDING + xOffset;
            const text = this.scene.add.text(x, yPos, textStr, {
                fontFamily: FONT,
                fontSize: FONT_SIZE + 'px',
                color: color || '#cccccc',
                wordWrap: { width: PANEL_WIDTH - PADDING * 2 - xOffset },
                ...opts
            });
            text.setMask(this.contentMask);
            this.container.add(text);
            this.contentObjects.push(text);
            return text;
        }

        _addInteractiveText(textStr, xOffset, yPos, color, callback) {
            const text = this._addText(textStr, xOffset, yPos, color);
            text.setInteractive({ useHandCursor: true });
            text.on('pointerdown', callback);
            text.on('pointerover', () => text.setAlpha(0.7));
            text.on('pointerout', () => text.setAlpha(1));
            return text;
        }

        // ── Flags Tab ────────────────────────────────────────────────────

        _renderFlags() {
            const flags = TSH.State.getAllFlags();
            const scrollOffset = this.scrollY.flags || 0;
            let y = this.contentTop + 8 - scrollOffset;

            for (const [groupKey, groupFlags] of Object.entries(flags)) {
                if (groupKey === 'misc') {
                    // Only show misc if it has entries
                    const miscEntries = Object.entries(groupFlags);
                    if (miscEntries.length === 0) continue;
                }

                const flagEntries = Object.entries(groupFlags);
                const trueCount = flagEntries.filter(([, v]) => v === true).length;
                const total = flagEntries.length;
                const isCollapsed = this.collapsed['flags_' + groupKey] !== false;

                // Default all groups to collapsed
                if (this.collapsed['flags_' + groupKey] === undefined) {
                    this.collapsed['flags_' + groupKey] = true;
                }

                // Group header
                const arrow = isCollapsed ? '\u25B6' : '\u25BC';
                const headerStr = `${arrow} ${groupKey} (${trueCount}/${total})`;
                const header = this._addInteractiveText(headerStr, 0, y, '#88aaff', () => {
                    this.collapsed['flags_' + groupKey] = !this.collapsed['flags_' + groupKey];
                    this._renderTab();
                });
                y += LINE_HEIGHT;

                if (!isCollapsed) {
                    for (const [flagName, flagValue] of flagEntries) {
                        const check = flagValue ? '[\u2713]' : '[ ]';
                        const flagColor = flagValue ? '#66ff66' : '#888888';
                        const path = groupKey + '.' + flagName;

                        this._addInteractiveText(`${check} ${flagName}`, INDENT, y, flagColor, () => {
                            TSH.State.setFlag(path, !TSH.State.getFlag(path));
                            this._renderTab();
                        });
                        y += LINE_HEIGHT;
                    }
                    y += 4;  // spacing between groups
                }
            }

            this.contentHeight = y + scrollOffset - this.contentTop;
        }

        // ── Inventory Tab ────────────────────────────────────────────────

        _renderInventory() {
            const inventory = TSH.State.getInventory();
            const inventorySet = new Set(inventory);
            const scrollOffset = this.scrollY.inventory || 0;
            let y = this.contentTop + 8 - scrollOffset;

            for (const [groupName, itemIds] of Object.entries(ITEM_GROUPS)) {
                const ownedCount = itemIds.filter(id => inventorySet.has(id)).length;
                const total = itemIds.length;
                const isCollapsed = this.collapsed['inv_' + groupName] !== false;

                if (this.collapsed['inv_' + groupName] === undefined) {
                    this.collapsed['inv_' + groupName] = true;
                }

                const arrow = isCollapsed ? '\u25B6' : '\u25BC';
                const headerStr = `${arrow} ${groupName} (${ownedCount}/${total})`;
                this._addInteractiveText(headerStr, 0, y, '#ffaa44', () => {
                    this.collapsed['inv_' + groupName] = !this.collapsed['inv_' + groupName];
                    this._renderTab();
                });
                y += LINE_HEIGHT;

                if (!isCollapsed) {
                    for (const itemId of itemIds) {
                        const item = TSH.Items[itemId];
                        if (!item) continue;

                        const hasIt = inventorySet.has(itemId);
                        const check = hasIt ? '[\u2713]' : '[ ]';
                        const color = hasIt ? '#66ff66' : '#888888';

                        this._addInteractiveText(`${check} ${item.name}`, INDENT, y, color, () => {
                            if (TSH.State.hasItem(itemId)) {
                                TSH.State.removeItem(itemId);
                            } else {
                                TSH.State.addItem(itemId);
                            }
                            this._renderTab();
                        });
                        y += LINE_HEIGHT;
                    }
                    y += 4;
                }
            }

            this.contentHeight = y + scrollOffset - this.contentTop;
        }

        // ── NPCs Tab ─────────────────────────────────────────────────────

        _renderNPCs() {
            const scrollOffset = this.scrollY.npcs || 0;
            let y = this.contentTop + 8 - scrollOffset;

            for (const [npcId, validStates] of Object.entries(NPC_VALID_STATES)) {
                const currentState = TSH.State.getNPCState(npcId) || 'unknown';
                const isCollapsed = this.collapsed['npc_' + npcId] !== false;

                if (this.collapsed['npc_' + npcId] === undefined) {
                    this.collapsed['npc_' + npcId] = true;
                }

                const arrow = isCollapsed ? '\u25B6' : '\u25BC';
                const headerStr = `${arrow} ${npcId} (${currentState})`;
                this._addInteractiveText(headerStr, 0, y, '#ff88cc', () => {
                    this.collapsed['npc_' + npcId] = !this.collapsed['npc_' + npcId];
                    this._renderTab();
                });
                y += LINE_HEIGHT;

                if (!isCollapsed) {
                    for (const state of validStates) {
                        const isActive = currentState === state;
                        const radio = isActive ? '(\u25CF)' : '( )';
                        const color = isActive ? '#66ff66' : '#888888';

                        this._addInteractiveText(`${radio} ${state}`, INDENT, y, color, () => {
                            TSH.State.setNPCState(npcId, state);
                            this._renderTab();
                        });
                        y += LINE_HEIGHT;
                    }
                    y += 4;
                }
            }

            this.contentHeight = y + scrollOffset - this.contentTop;
        }

        // ── Log Tab ──────────────────────────────────────────────────────

        _renderLog() {
            const scrollOffset = this.scrollY.log || 0;
            let y = this.contentTop + 8 - scrollOffset;

            if (this.eventLog.length === 0) {
                this._addText('No events recorded yet.', 0, y, '#666666');
                y += LINE_HEIGHT;
            } else {
                // Newest first
                for (let i = this.eventLog.length - 1; i >= 0; i--) {
                    const entry = this.eventLog[i];
                    this._addText(entry, 0, y, '#aaaacc', { fontSize: '12px' });
                    y += LINE_HEIGHT;
                }
            }

            this.contentHeight = y + scrollOffset - this.contentTop;
        }

        // ── Event Handlers ───────────────────────────────────────────────

        _timestamp() {
            const d = new Date();
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            const s = String(d.getSeconds()).padStart(2, '0');
            return `${h}:${m}:${s}`;
        }

        _logEvent(msg) {
            this.eventLog.push(`[${this._timestamp()}] ${msg}`);
            if (this.eventLog.length > MAX_LOG_ENTRIES) {
                this.eventLog.shift();
            }
            if (this.visible && this.activeTab === 'log') {
                this._renderTab();
            }
        }

        _handleFlagChanged(data) {
            this._logEvent(`flag: ${data.path} = ${data.value}`);
            if (this.visible && this.activeTab === 'flags') {
                this._renderTab();
            }
        }

        _handleInventoryChanged(data) {
            this._logEvent(`inv: ${data.type} ${data.itemId}`);
            if (this.visible && this.activeTab === 'inventory') {
                this._renderTab();
            }
        }

        _handleNPCStateChanged(data) {
            this._logEvent(`npc: ${data.npcId} ${data.previousState} -> ${data.state}`);
            if (this.visible && this.activeTab === 'npcs') {
                this._renderTab();
            }
        }

        _handleRoomChanged(data) {
            this._logEvent(`room: ${data.from} -> ${data.to}`);
        }

        // ── Scrolling ────────────────────────────────────────────────────

        _handleWheel(e) {
            if (!this.visible) return;

            // Check if pointer is over the panel area
            const pointer = this.scene.input.activePointer;
            const panelLeft = this.scene.scale.width - PANEL_WIDTH;
            if (pointer.x < panelLeft) return;

            e.preventDefault();
            const tab = this.activeTab;
            const delta = e.deltaY > 0 ? 40 : -40;
            this.scrollY[tab] = Math.max(0, (this.scrollY[tab] || 0) + delta);

            // Clamp to content
            const maxScroll = Math.max(0, this.contentHeight - this.contentAreaHeight);
            this.scrollY[tab] = Math.min(this.scrollY[tab], maxScroll);

            this._renderTab();
        }

        // ── Toggle / Destroy ─────────────────────────────────────────────

        toggle() {
            this.visible = !this.visible;
            this.container.setVisible(this.visible);

            const gameScene = this.scene.getActiveGameScene();

            if (this.visible) {
                // Block game scene interactions
                if (gameScene) {
                    this._prevDebugEnabled = gameScene.debugEnabled;
                    gameScene.debugEnabled = true;
                }

                // Hide game cursors, show system cursor
                this.scene.crosshairCursor.setVisible(false);
                this.scene.itemCursor.setVisible(false);
                this.scene.arrowCursor.setVisible(false);
                this.scene.game.canvas.style.cursor = 'default';

                this._renderTab();
                this.scene.game.canvas.addEventListener('wheel', this._onWheel, { passive: false });
            } else {
                // Restore game scene interactions
                if (gameScene) {
                    gameScene.debugEnabled = this._prevDebugEnabled || false;
                }

                // Hide system cursor, restore game cursors
                this.scene.game.canvas.style.cursor = 'none';
                this.scene.syncCursorState();

                this.scene.game.canvas.removeEventListener('wheel', this._onWheel);
            }

            // Notify UIScene about panel state for interaction blocking
            this.scene.debugPanelOpen = this.visible;
        }

        destroy() {
            // Remove state listeners
            TSH.State.off('flagChanged', this._onFlagChanged);
            TSH.State.off('inventoryChanged', this._onInventoryChanged);
            TSH.State.off('npcStateChanged', this._onNPCStateChanged);
            TSH.State.off('roomChanged', this._onRoomChanged);

            // Remove wheel listener
            this.scene.game.canvas.removeEventListener('wheel', this._onWheel);

            // Destroy all objects
            this._clearContent();
            if (this.container) this.container.destroy(true);
            if (this.maskGraphics) this.maskGraphics.destroy();

            this.scene.debugPanelOpen = false;
        }
    }

    // Export to TSH namespace
    TSH.DebugPanel = DebugPanel;

})();
