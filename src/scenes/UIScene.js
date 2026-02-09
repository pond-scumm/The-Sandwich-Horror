// ============================================================================
// UI SCENE
// ============================================================================
// Persistent scene that renders on top of game scenes.
// Manages cursors, inventory panel, and UI buttons.
//
// This scene runs parallel to game scenes (RoomScene, etc.) and listens to
// TSH.State events to update UI reactively.
//
// Usage:
//   - Launched once at game start, never stopped
//   - Listens to TSH.State.on('uiStateChanged', ...) for reactive updates
//   - Listens to TSH.State.on('inventoryChanged', ...) for inventory updates
//   - Game scenes can set UI state via TSH.State.setUIState()
// ============================================================================

class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });

        // Cursor references
        this.crosshairCursor = null;
        this.crosshairGraphics = null;
        this.arrowCursor = null;
        this.arrowGraphics = null;
        this.itemCursor = null;
        this.itemCursorHighlight = null;

        // State
        this.isMobile = false;
        this.currentEdgeZone = null;  // 'left', 'right', or null

        // Track last pointer position for cursor positioning
        this.lastPointerX = 0;
        this.lastPointerY = 0;

        // Button references
        this.inventoryButton = null;
        this.inventoryBtnHollow = null;
        this.inventoryBtnFilled = null;
        this.inventoryButtonArea = null;
        this.inventoryButtonHovered = false;

        this.settingsButton = null;
        this.settingsBtnHollow = null;
        this.settingsBtnFilled = null;
        this.settingsButtonArea = null;
        this.settingsButtonHovered = false;

        // Inventory panel references
        this.inventoryPanel = null;
        this.inventorySlots = [];
        this.inventoryPanelWidth = 0;
        this.inventoryPanelHeight = 0;
        this.selectedSlotHighlight = null;

        // Selection state
        this.selectedItem = null;
        this.selectedSlot = null;

        // Mobile inventory tracking
        this.pressedInventoryItem = null;
        this.pressedInventorySlot = null;
        this.inventoryItemPressTimer = null;
        this.itemOutsideInventoryTimer = null;

        // Track last hovered item during drag-with-item (for mobile combine tolerance)
        this.lastHoveredInventoryItem = null;

        // Hotspot label (shows above inventory panel)
        this.hotspotLabel = null;

        // Dialog overlay (shows speech text above inventory when open)
        this.dialogOverlay = null;
        this.dialogOverlayText = null;
    }

    create() {
        const { width, height } = this.scale;

        // Detect mobile
        this.isMobile = window.matchMedia('(pointer: coarse)').matches;

        // Initialize pointer position to center of screen
        this.lastPointerX = width / 2;
        this.lastPointerY = height / 2;

        // Hide browser cursor
        this.game.canvas.style.cursor = 'none';

        // Create cursors
        this.createCrosshairCursor(width, height);
        this.createArrowCursor(width, height);
        this.createItemCursor();

        // Create inventory panel (always owned by UIScene)
        this.createInventoryPanel(width, height);

        // Create hotspot label (above inventory panel)
        this.createHotspotLabel(width, height);

        // Create dialog overlay (for speech text above inventory)
        this.createDialogOverlay(width, height);

        // Listen to pointer events for position tracking
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointerup', this.onPointerUp, this);

        // Listen to state changes
        TSH.State.on('uiStateChanged', this.onUIStateChanged.bind(this));
        TSH.State.on('inventoryChanged', this.onInventoryChanged.bind(this));

        // Initialize cursor state from current TSH.State
        this.syncCursorState();

        // Sync inventory display with current state
        this.syncInventoryDisplay();

        // Create UI buttons
        this.createInventoryButton(width, height);
        this.createSettingsButton(width, height);

        console.log('[UIScene] Created - cursors, buttons, and inventory panel initialized');
    }

    // ── Cursor Creation ─────────────────────────────────────────────────────

    createCrosshairCursor(width, height) {
        this.crosshairCursor = this.add.container(width / 2, height / 2);
        this.crosshairCursor.setDepth(9000);

        this.crosshairGraphics = this.add.graphics();
        this.crosshairCursor.add(this.crosshairGraphics);
        this.drawCrosshair(0xffffff);

        // Hide cursor on mobile (no mouse pointer)
        if (this.isMobile) {
            this.crosshairCursor.setVisible(false);
        }
    }

    createArrowCursor(width, height) {
        this.arrowCursor = this.add.container(width / 2, height / 2);
        this.arrowCursor.setDepth(6000);
        this.arrowCursor.setVisible(false);

        this.arrowGraphics = this.add.graphics();
        this.arrowCursor.add(this.arrowGraphics);
    }

    createItemCursor() {
        this.itemCursor = this.add.container(0, 0);
        this.itemCursor.setDepth(5000);
        this.itemCursor.setVisible(false);
    }

    // ── Cursor Drawing ──────────────────────────────────────────────────────

    drawCrosshair(color = 0xffffff) {
        const g = this.crosshairGraphics;
        g.clear();

        // Match BaseScene's crosshair style
        const scale = this.isMobile ? 2 : 1;
        const lineWidth = 4 * scale;
        const outer = 20 * scale;
        const inner = 8 * scale;

        g.lineStyle(lineWidth, color, 1);
        g.moveTo(-outer, 0); g.lineTo(-inner, 0);
        g.moveTo(inner, 0); g.lineTo(outer, 0);
        g.moveTo(0, -outer); g.lineTo(0, -inner);
        g.moveTo(0, inner); g.lineTo(0, outer);
        g.strokePath();
    }

    drawArrowCursor(direction) {
        const g = this.arrowGraphics;
        g.clear();

        const p = 4;  // Pixel size for chunky look
        const color = 0xffffff;
        const shadow = 0x000000;

        // Horizontal arrow matching BaseScene style but with shadow
        // flip: 1 for right, -1 for left
        const flip = direction === 'left' ? -1 : 1;

        // Shadow offset
        const so = 2;

        // Draw shadow first (red-tinted shadow for better visibility)
        g.fillStyle(0x330000, 0.8);

        if (direction === 'left') {
            // Left-pointing arrow shadow
            g.fillRect(-6 * p + so, -1 * p + so, p, 2 * p);
            g.fillRect(-5 * p + so, -2 * p + so, p, 4 * p);
            g.fillRect(-4 * p + so, -3 * p + so, p, 6 * p);
            g.fillRect(-3 * p + so, -4 * p + so, p, 8 * p);
            g.fillRect(-3 * p + so, -2 * p + so, 6 * p, 4 * p);  // Shaft connects to triangle base
        } else {
            // Right-pointing arrow shadow
            g.fillRect(5 * p + so, -1 * p + so, p, 2 * p);
            g.fillRect(4 * p + so, -2 * p + so, p, 4 * p);
            g.fillRect(3 * p + so, -3 * p + so, p, 6 * p);
            g.fillRect(2 * p + so, -4 * p + so, p, 8 * p);
            g.fillRect(-3 * p + so, -2 * p + so, 6 * p, 4 * p);  // Shaft connects to triangle base
        }

        // Draw main arrow (white with red tint for exit indicator)
        g.fillStyle(0xff4444, 1);

        if (direction === 'left') {
            // Left-pointing arrow
            g.fillRect(-6 * p, -1 * p, p, 2 * p);
            g.fillRect(-5 * p, -2 * p, p, 4 * p);
            g.fillRect(-4 * p, -3 * p, p, 6 * p);
            g.fillRect(-3 * p, -4 * p, p, 8 * p);
            g.fillRect(-3 * p, -2 * p, 6 * p, 4 * p);  // Shaft connects to triangle base
        } else {
            // Right-pointing arrow
            g.fillRect(5 * p, -1 * p, p, 2 * p);
            g.fillRect(4 * p, -2 * p, p, 4 * p);
            g.fillRect(3 * p, -3 * p, p, 6 * p);
            g.fillRect(2 * p, -4 * p, p, 8 * p);
            g.fillRect(-3 * p, -2 * p, 6 * p, 4 * p);  // Shaft connects to triangle base
        }
    }

    // ── Item Cursor ─────────────────────────────────────────────────────────

    updateItemCursor(item) {
        if (!item) {
            this.itemCursor.setVisible(false);
            this.itemCursor.removeAll(true);
            this.itemCursorHighlight = null;
            return;
        }

        this.itemCursor.removeAll(true);

        // Draw item icon (50px size)
        const cursorIcon = this.drawItemIcon(item, 50);
        this.itemCursor.add(cursorIcon);

        // Create highlight ring
        this.itemCursorHighlight = this.add.graphics();
        this.itemCursorHighlight.lineStyle(4, 0xff0000, 1);
        this.itemCursorHighlight.strokeRoundedRect(-29, -29, 58, 58, 10);
        this.itemCursorHighlight.setVisible(false);
        this.itemCursor.add(this.itemCursorHighlight);

        // Scale cursor 3x larger on mobile for better visibility behind finger
        const cursorScale = this.isMobile ? 3.0 : 1.0;
        this.itemCursor.setScale(cursorScale);

        // Position at last known pointer location before showing
        this.itemCursor.setPosition(this.lastPointerX, this.lastPointerY);

        // Show item cursor on both desktop and mobile (follows finger on mobile)
        this.itemCursor.setVisible(true);
    }

    drawItemIcon(item, size) {
        const itemGraphic = this.add.graphics();

        if (TSH.ItemIcons && TSH.ItemIcons[item.id]) {
            TSH.ItemIcons[item.id](itemGraphic, 0, 0, size);
        } else {
            // Fallback: colored rounded rectangle
            itemGraphic.fillStyle(item.color || 0xffd700, 1);
            itemGraphic.fillRoundedRect(-size / 2, -size / 2, size, size, 10);

            // Add item initial
            const initial = this.add.text(0, 0, item.name.charAt(0).toUpperCase(), {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#000000'
            }).setOrigin(0.5);
            itemGraphic.add ? itemGraphic.add(initial) : null;
        }

        return itemGraphic;
    }

    showItemCursorHighlight() {
        if (this.itemCursorHighlight) {
            this.itemCursorHighlight.setVisible(true);
        }
    }

    hideItemCursorHighlight() {
        if (this.itemCursorHighlight) {
            this.itemCursorHighlight.setVisible(false);
        }
    }

    // ── Cursor State Management ─────────────────────────────────────────────

    showArrowCursor(direction) {
        this.currentEdgeZone = direction;
        this.drawArrowCursor(direction);
        this.crosshairCursor.setVisible(false);
        this.arrowCursor.setVisible(true);
    }

    hideArrowCursor() {
        this.currentEdgeZone = null;
        this.arrowCursor.setVisible(false);
        if (!TSH.State.getSelectedItem() && !this.isMobile) {
            this.crosshairCursor.setVisible(true);
        }
    }

    syncCursorState() {
        const selectedItemId = TSH.State.getSelectedItem();

        if (selectedItemId) {
            // Get item data
            const item = TSH.Items[selectedItemId];
            if (item) {
                this.selectedItem = item;
                this.updateItemCursor(item);
                this.crosshairCursor.setVisible(false);
            }
        } else {
            this.selectedItem = null;
            this.updateItemCursor(null);
            if (!this.isMobile && !this.currentEdgeZone) {
                // Position crosshair at last known pointer position before showing
                this.crosshairCursor.setPosition(this.lastPointerX, this.lastPointerY);
                this.crosshairCursor.setVisible(true);
            }
        }
    }

    // ── Inventory Panel Creation ────────────────────────────────────────────

    createInventoryPanel(width, height) {
        this.inventoryPanel = this.add.container(width / 2, height / 2);
        this.inventoryPanel.setVisible(false);
        this.inventoryPanel.setDepth(2500);

        // Grid configuration
        const gridCols = 5, gridRows = 3;
        const slotPadding = 20;
        const titleSpace = 60;  // Space for title at top
        const edgeBuffer = 40;  // Buffer around edges (40px on each side)

        // Calculate slot size based on available HEIGHT (keep height fixed)
        const panelHeight = height - 240;
        const availableHeight = panelHeight - titleSpace - edgeBuffer * 2;
        const slotSize = Math.floor((availableHeight - (gridRows - 1) * slotPadding) / gridRows);

        // Calculate grid dimensions
        const gridWidth = gridCols * slotSize + (gridCols - 1) * slotPadding;
        const gridHeight = gridRows * slotSize + (gridRows - 1) * slotPadding;

        // Panel width = grid width + 40px buffer on each side
        const panelWidth = gridWidth + edgeBuffer * 2;

        // Store panel dimensions for boundary checks
        this.inventoryPanelWidth = panelWidth;
        this.inventoryPanelHeight = panelHeight;
        this.slotSize = slotSize;

        const panelBg = this.add.graphics();
        panelBg.fillStyle(0x1a1a2e, 0.95);
        panelBg.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 15);
        panelBg.lineStyle(3, 0x4a4a6a, 1);
        panelBg.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 15);
        this.inventoryPanel.add(panelBg);

        const title = this.add.text(0, -panelHeight / 2 + 30, 'INVENTORY', {
            fontFamily: '"Press Start 2P", cursive',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.inventoryPanel.add(title);

        // Position grid
        const startX = -gridWidth / 2 + slotSize / 2;
        const startY = -gridHeight / 2 + slotSize / 2 + titleSpace / 2;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                const slotX = startX + col * (slotSize + slotPadding);
                const slotY = startY + row * (slotSize + slotPadding);

                const slotBg = this.add.graphics();
                slotBg.fillStyle(0x2a2a4a, 1);
                slotBg.fillRoundedRect(slotX - slotSize / 2, slotY - slotSize / 2, slotSize, slotSize, 6);
                slotBg.lineStyle(2, 0x4a4a6a, 1);
                slotBg.strokeRoundedRect(slotX - slotSize / 2, slotY - slotSize / 2, slotSize, slotSize, 6);
                this.inventoryPanel.add(slotBg);

                const display = this.add.container(slotX, slotY);
                this.inventoryPanel.add(display);

                this.inventorySlots.push({ x: slotX, y: slotY, size: slotSize, display, item: null });
            }
        }

        // Selection highlight (yellow border around selected slot)
        this.selectedSlotHighlight = this.add.graphics();
        this.selectedSlotHighlight.setDepth(2501);
        this.selectedSlotHighlight.setVisible(false);
    }

    // ── Inventory Display Sync ──────────────────────────────────────────────

    syncInventoryDisplay() {
        // Smart sync: preserve slot positions, only update what changed
        const stateItemIds = TSH.State.getInventory();
        const stateItemSet = new Set(stateItemIds);

        // First pass: remove items that are no longer in state
        this.inventorySlots.forEach(slot => {
            if (slot.item && !stateItemSet.has(slot.item.id)) {
                slot.display.removeAll(true);
                slot.item = null;
            }
        });

        // Second pass: add items that aren't in any slot
        const slottedItemIds = new Set(
            this.inventorySlots.filter(s => s.item).map(s => s.item.id)
        );

        stateItemIds.forEach(itemId => {
            if (!slottedItemIds.has(itemId)) {
                const item = TSH.Items[itemId];
                if (!item) return;

                const emptySlot = this.inventorySlots.find(slot => slot.item === null);
                if (emptySlot) {
                    this.addItemToSlot(item, emptySlot);
                }
            }
        });

        // Update selection if item no longer exists
        if (this.selectedItem && !stateItemSet.has(this.selectedItem.id)) {
            this.deselectItem();
        }
    }

    // Handle specific inventory change events for in-place updates
    handleInventoryAdd(itemId) {
        const item = TSH.Items[itemId];
        if (!item) return;

        // Check if already in a slot (shouldn't happen, but be safe)
        const existingSlot = this.inventorySlots.find(s => s.item && s.item.id === itemId);
        if (existingSlot) return;

        // Add to first empty slot
        const emptySlot = this.inventorySlots.find(slot => slot.item === null);
        if (emptySlot) {
            this.addItemToSlot(item, emptySlot);
        }
    }

    handleInventoryRemove(itemId) {
        const slot = this.inventorySlots.find(s => s.item && s.item.id === itemId);
        if (slot) {
            slot.display.removeAll(true);
            slot.item = null;
        }

        // If this was the selected item, clear selection
        if (this.selectedItem && this.selectedItem.id === itemId) {
            this.deselectItem();
        }
    }

    addItemToSlot(item, slot) {
        slot.item = item;
        slot.display.removeAll(true);

        // Icon size is 70% of slot size
        const itemSize = Math.floor(slot.size * 0.7);
        const itemGraphic = this.drawItemIcon(item, itemSize);
        slot.display.add(itemGraphic);

        // Create hit area for interactions
        const slotSize = slot.size;
        const hitArea = this.add.rectangle(0, 0, slotSize - 4, slotSize - 4, 0x000000, 0).setInteractive();

        hitArea.on('pointerdown', (pointer) => {
            // On mobile, we handle via gesture detection
            if (this.isMobile) return;

            // Right-click = deselect item if holding one, otherwise examine
            if (pointer.rightButtonDown()) {
                if (this.selectedItem) {
                    this.deselectItem();
                } else {
                    this.examineItem(item);
                }
                return;
            }

            // Left-click = select or combine
            if (pointer.leftButtonDown()) {
                if (this.selectedItem && this.selectedItem.id !== item.id) {
                    // Clear label and highlight immediately when combining
                    this.setHotspotLabel('');
                    this.hideItemCursorHighlight();
                    this.tryCombineItems(this.selectedItem, item);
                } else {
                    this.selectItem(item, slot);
                }
            }
        });

        hitArea.on('pointerover', () => {
            // Skip hover effects on mobile (no mouse cursor)
            if (this.isMobile) return;
            this.drawCrosshair(0xff0000);
            // Don't show labels while dialog is active
            if (TSH.State.getUIState('dialogActive')) return;
            if (this.selectedItem && this.selectedItem.id !== item.id) {
                this.setHotspotLabel(`Use ${this.selectedItem.name} on ${item.name}`);
                this.showItemCursorHighlight();
            } else {
                this.setHotspotLabel(item.name);
            }
        });

        hitArea.on('pointerout', () => {
            this.drawCrosshair(0xffffff);
            this.setHotspotLabel('');
            this.hideItemCursorHighlight();
        });

        slot.display.add(hitArea);
    }

    // ── Selection Handling ──────────────────────────────────────────────────

    selectItem(item, slot) {
        // Toggle off if clicking the same item
        if (this.selectedItem && this.selectedItem.id === item.id) {
            this.deselectItem();
            return;
        }

        // Play item select sound
        TSH.Audio.playSFX('item_select');

        this.selectedItem = item;
        this.selectedSlot = slot;

        // Notify TSH.State (triggers cursor update)
        TSH.State.setSelectedItem(item.id);

        // Update item cursor
        this.updateItemCursor(item);
        this.crosshairCursor.setVisible(false);
    }

    deselectItem() {
        this.selectedItem = null;
        this.selectedSlot = null;

        // Clear mobile drag tracking
        this.lastHoveredInventoryItem = null;

        // Notify TSH.State
        TSH.State.clearSelectedItem();

        // Update cursor
        this.updateItemCursor(null);
        if (!this.isMobile && !this.currentEdgeZone) {
            this.crosshairCursor.setVisible(true);
        }

        // Hide selection highlight
        this.selectedSlotHighlight.setVisible(false);
        this.setHotspotLabel('');
    }

    // Get the last inventory item the pointer hovered over during drag (for mobile combine tolerance)
    getLastHoveredInventoryItem() {
        const item = this.lastHoveredInventoryItem;
        this.lastHoveredInventoryItem = null;  // Clear after reading
        return item;
    }

    examineItem(item) {
        const description = item.description || `It's a ${item.name}.`;
        // Get the active game scene to show dialog
        const gameScene = this.getActiveGameScene();
        if (gameScene && gameScene.showDialog) {
            gameScene.showDialog(description);
        }
    }

    tryCombineItems(itemA, itemB) {
        // Execute combination via TSH.Combinations (handles state changes)
        // itemA is the held/selected item (for failDefault fallback)
        const result = TSH.Combinations.executeCombine(itemA.id, itemB.id, itemA.id);

        // Play the sound effect
        if (result.sfx) {
            TSH.Audio.playSFX(result.sfx);
        }

        // Update cursor selection based on result
        if (result.success) {
            const itemAConsumed = result.consumes.includes(itemA.id);
            const itemBConsumed = result.consumes.includes(itemB.id);
            const producedItem = result.produces ? TSH.Items[result.produces] : null;

            if (itemAConsumed && itemBConsumed) {
                // Both consumed: clear cursor
                this.deselectItem();
            } else if (itemAConsumed) {
                // Selected item (cursor) consumed: cursor becomes produced item
                if (producedItem) {
                    this.selectedItem = producedItem;
                    TSH.State.setSelectedItem(producedItem.id);
                } else {
                    this.deselectItem();
                }
            }
            // If itemB consumed but not itemA, cursor stays the same
        }

        // Show dialog via event (BaseScene listens and displays)
        TSH.State.emit('showDialog', { text: result.dialogue });
    }

    // ── Panel Show/Hide ─────────────────────────────────────────────────────

    showInventoryPanel() {
        if (!this.inventoryPanel) return;

        const { width, height } = this.scale;

        // Position panel at center of screen
        this.inventoryPanel.setPosition(width / 2, height / 2);

        // Animate panel open
        this.inventoryPanel.setVisible(true);
        this.inventoryPanel.setScale(0.8);
        this.inventoryPanel.setAlpha(0);
        this.tweens.add({
            targets: this.inventoryPanel,
            scale: 1,
            alpha: 1,
            duration: 150,
            ease: 'Back.out'
        });

        // Play sound
        TSH.Audio.playSFX('inventory_open');
    }

    hideInventoryPanel() {
        if (!this.inventoryPanel) return;

        // Hide selection highlight
        this.selectedSlotHighlight.setVisible(false);

        // Clear any pending timers
        if (this.inventoryItemPressTimer) {
            this.inventoryItemPressTimer.remove();
            this.inventoryItemPressTimer = null;
        }
        this.pressedInventoryItem = null;
        this.pressedInventorySlot = null;

        if (this.itemOutsideInventoryTimer) {
            this.itemOutsideInventoryTimer.remove();
            this.itemOutsideInventoryTimer = null;
        }

        // Reset crosshair color and label
        this.drawCrosshair(0xffffff);
        this.setHotspotLabel('');

        // Play sound
        TSH.Audio.playSFX('inventory_close');

        // Animate panel close
        this.tweens.add({
            targets: this.inventoryPanel,
            scale: 0.8,
            alpha: 0,
            duration: 100,
            ease: 'Power2',
            onComplete: () => this.inventoryPanel.setVisible(false)
        });
    }

    // ── Hotspot Label ─────────────────────────────────────────────────────────

    createHotspotLabel(width, height) {
        // Match BaseScene's label sizes
        const fontSize = this.isMobile ? '60px' : '35px';
        const strokeThickness = this.isMobile ? 5 : 3;

        // Label follows cursor - positioned in onPointerMove
        // Word wrap prevents text from going off-screen on the right
        this.hotspotLabel = this.add.text(0, 0, '', {
            fontFamily: '"LucasArts SCUMM Solid", cursive',
            fontSize: fontSize,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: strokeThickness,
            align: 'center',
            wordWrap: { width: width - 40 }  // 20px padding on each side
        }).setOrigin(0.5, 1).setDepth(3000).setVisible(false);  // Above inventory panel (2500)
    }

    // Clamp label x position to keep it on screen
    clampLabelX(x) {
        if (!this.hotspotLabel || !this.hotspotLabel.text) return x;

        const padding = 10;
        const labelWidth = this.hotspotLabel.width;
        const screenWidth = this.cameras.main.width;

        // Label origin is (0.5, 1), so it extends labelWidth/2 in each direction from x
        const minX = labelWidth / 2 + padding;
        const maxX = screenWidth - labelWidth / 2 - padding;

        return Math.max(minX, Math.min(maxX, x));
    }

    // Get appropriate position for hotspot label based on inventory state
    getLabelPosition(pointerX, pointerY) {
        if (TSH.State.isInventoryOpen()) {
            // When inventory is open, position label fixed above inventory box
            // Centered horizontally, just above the panel top (panel top is at Y=120)
            const x = this.cameras.main.width / 2;
            const y = 110;  // Just above inventory panel
            return { x, y };
        } else {
            // When inventory is closed, follow cursor as before
            const x = this.clampLabelX(pointerX);
            const y = pointerY - 30;
            return { x, y };
        }
    }

    setHotspotLabel(text) {
        // When inventory is open, use UIScene's label (follows cursor)
        if (TSH.State.isInventoryOpen()) {
            if (this.hotspotLabel) {
                this.hotspotLabel.setText(text);
                this.hotspotLabel.setVisible(text !== '');
                // Position based on inventory state (fixed when open, follows cursor when closed)
                const pos = this.getLabelPosition(this.lastPointerX, this.lastPointerY);
                this.hotspotLabel.setPosition(pos.x, pos.y);
            }
            // Hide game scene's label when inventory is open
            const gameScene = this.getActiveGameScene();
            if (gameScene && gameScene.hotspotLabel) {
                gameScene.hotspotLabel.setText('');
            }
        } else {
            // When inventory is closed, use game scene's label
            if (this.hotspotLabel) {
                this.hotspotLabel.setVisible(false);
            }
            const gameScene = this.getActiveGameScene();
            if (gameScene && gameScene.hotspotLabel) {
                gameScene.hotspotLabel.setText(text);
            }
        }
    }

    // ── Dialog Overlay ───────────────────────────────────────────────────────

    createDialogOverlay(width, height) {
        // Dialog text that appears above inventory panel (depth 2600, above panel at 2500)
        const fontSize = this.isMobile ? '60px' : '35px';
        const strokeThickness = this.isMobile ? 5 : 3;
        const lineSpacing = this.isMobile ? 4 : 2;

        this.dialogOverlayText = this.add.text(width / 2, 30, '', {
            fontFamily: '"LucasArts SCUMM Solid", cursive',
            fontSize: fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.85 },
            lineSpacing: lineSpacing,
            stroke: '#000000',
            strokeThickness: strokeThickness
        }).setOrigin(0.5, 0).setDepth(2600).setVisible(false);
    }

    // Called by BaseScene to show dialog text above inventory
    showDialogOverlay(text) {
        if (this.dialogOverlayText) {
            this.dialogOverlayText.setText(text);
            this.dialogOverlayText.setVisible(text !== '');
        }
    }

    hideDialogOverlay() {
        if (this.dialogOverlayText) {
            this.dialogOverlayText.setVisible(false);
            this.dialogOverlayText.setText('');
        }
    }

    getActiveGameScene() {
        // Try to get the active game scene
        const scenes = ['RoomScene', 'FrontOfHouseScene', 'InteriorScene', 'WoodsScene',
                        'LaboratoryScene', 'BackyardScene', 'EarlsYardScene', 'AlienRoomScene'];
        for (const key of scenes) {
            const scene = this.scene.get(key);
            if (scene && scene.scene.isActive()) {
                return scene;
            }
        }
        return null;
    }

    // ── Event Handlers ──────────────────────────────────────────────────────

    onPointerDown(pointer) {
        // Track pointer position on touch/click start (important for mobile)
        this.lastPointerX = pointer.x;
        this.lastPointerY = pointer.y;

        // Update item cursor position immediately if visible
        if (this.itemCursor && this.itemCursor.visible) {
            this.itemCursor.setPosition(pointer.x + 20, pointer.y + 20);
        }

        // Handle button clicks (only left click / primary touch)
        if (pointer.leftButtonDown() || this.isMobile) {
            if (this.handleButtonClick(pointer)) {
                return; // Button handled the click
            }
        }

        // Handle mobile inventory interactions
        if (this.isMobile && TSH.State.isInventoryOpen()) {
            this.handleMobileInventoryPointerDown(pointer);
        }
    }

    onPointerUp(pointer) {
        // Handle mobile inventory release
        if (this.isMobile && TSH.State.isInventoryOpen()) {
            // Check if we're in drag-with-item mode (need to handle combine here because
            // BaseScene may not receive the pointerUp when releasing on UIScene's interactive elements)
            const gameScene = this.getActiveGameScene();
            if (gameScene && gameScene.mobileGesture &&
                gameScene.mobileGesture.dragWithItem && gameScene.mobileGesture.draggedItem) {

                const draggedItem = gameScene.mobileGesture.draggedItem;

                // Reset gesture state and mark as handled so BaseScene skips processing
                gameScene.mobileGesture.dragWithItem = false;
                gameScene.mobileGesture.draggedItem = null;
                gameScene.clickedUI = true;  // Prevent BaseScene from processing this pointerUp

                // Find target item (at pointer or last hovered)
                let targetItem = null;
                const slot = this.getSlotAtPointer(pointer);
                if (slot && slot.item) {
                    targetItem = slot.item;
                } else if (this.lastHoveredInventoryItem) {
                    targetItem = this.lastHoveredInventoryItem;
                }
                this.lastHoveredInventoryItem = null;

                // Clear the label
                this.setHotspotLabel('');

                // Combine if valid target
                if (targetItem && targetItem.id !== draggedItem.id) {
                    this.tryCombineItems(draggedItem, targetItem);
                }

                // Deselect
                this.deselectItem();
                return;
            }

            this.handleMobileInventoryPointerUp(pointer);
        }
    }

    onPointerMove(pointer) {
        // Track pointer position for cursor positioning on state changes
        this.lastPointerX = pointer.x;
        this.lastPointerY = pointer.y;

        // Update crosshair position
        if (this.crosshairCursor && this.crosshairCursor.visible) {
            this.crosshairCursor.setPosition(pointer.x, pointer.y);
        }

        // Update arrow cursor position
        if (this.arrowCursor && this.arrowCursor.visible) {
            this.arrowCursor.setPosition(pointer.x, pointer.y);
        }

        // Update item cursor position (centered on pointer)
        if (this.itemCursor && this.itemCursor.visible) {
            this.itemCursor.setPosition(pointer.x, pointer.y);
        }

        // Update hotspot label position (fixed when inventory open, follows cursor when closed)
        if (this.hotspotLabel && this.hotspotLabel.visible) {
            const pos = this.getLabelPosition(pointer.x, pointer.y);
            this.hotspotLabel.setPosition(pos.x, pos.y);
        }

        // Handle button hover (desktop only)
        if (!this.isMobile) {
            this.handleButtonHover(pointer);
        }

        // Check for item dragged outside inventory panel (both desktop and mobile)
        if (TSH.State.isInventoryOpen() && this.selectedItem) {
            this.checkItemOutsideInventory(pointer);

            // Track last hovered inventory item during drag (for mobile combine tolerance)
            if (this.isMobile) {
                const slot = this.getSlotAtPointer(pointer);
                if (slot && slot.item && slot.item.id !== this.selectedItem.id) {
                    this.lastHoveredInventoryItem = slot.item;
                    // Show "Use X on Y" label during drag
                    this.setHotspotLabel(`Use ${this.selectedItem.name} on ${slot.item.name}`);
                } else if (slot && !slot.item) {
                    // Over empty slot - clear label
                    this.setHotspotLabel('');
                }
            }
        }
    }

    onUIStateChanged(data) {
        const { key, value } = data;

        if (key === 'selectedItem') {
            if (value) {
                const item = TSH.Items[value];
                if (item) {
                    this.selectedItem = item;
                    this.updateItemCursor(item);
                    this.crosshairCursor.setVisible(false);
                }
            } else {
                this.selectedItem = null;
                this.updateItemCursor(null);
                if (!this.isMobile && !this.currentEdgeZone) {
                    // Position crosshair at current pointer location before showing
                    this.crosshairCursor.setPosition(this.lastPointerX, this.lastPointerY);
                    this.crosshairCursor.setVisible(true);
                }
            }
        } else if (key === 'edgeZone') {
            if (value) {
                this.showArrowCursor(value);
            } else {
                this.hideArrowCursor();
            }
        } else if (key === 'itemCursorHighlight') {
            if (value) {
                this.showItemCursorHighlight();
            } else {
                this.hideItemCursorHighlight();
            }
        } else if (key === 'crosshairColor') {
            this.drawCrosshair(value || 0xffffff);
        } else if (key === 'dialogActive' || key === 'conversationActive') {
            // Hide cursors when dialog/conversation is active
            if (value) {
                this.crosshairCursor.setVisible(false);
                this.itemCursor.setVisible(false);
            } else {
                // Restore cursor state based on other UI state
                this.syncCursorState();
            }
        } else if (key === 'settingsOpen') {
            // Hide item cursor when settings is open, show crosshair
            if (value) {
                this.itemCursor.setVisible(false);
                this.arrowCursor.setVisible(false);
                if (!this.isMobile) {
                    this.crosshairCursor.setVisible(true);
                }
            } else {
                this.syncCursorState();
            }
            // Update settings button visual
            this.updateSettingsButtonState();
        } else if (key === 'inventoryOpen') {
            // Handle inventory panel visibility
            if (value) {
                this.showInventoryPanel();
            } else {
                this.hideInventoryPanel();
            }
            // Update inventory button visual
            this.updateInventoryButtonState();
        }
    }

    onInventoryChanged(data) {
        console.log('[UIScene] Inventory changed:', data.type, data.itemId);

        // Handle specific change types to preserve slot positions
        if (data.type === 'added') {
            this.handleInventoryAdd(data.itemId);
        } else if (data.type === 'removed' || data.type === 'consumed') {
            this.handleInventoryRemove(data.itemId);
        } else {
            // Fallback: full sync for unknown event types
            this.syncInventoryDisplay();
        }
    }

    // ── Mobile Inventory Handling ───────────────────────────────────────────

    handleMobileInventoryPointerDown(pointer) {
        const slot = this.getSlotAtPointer(pointer);
        if (slot && slot.item) {
            this.pressedInventoryItem = slot.item;
            this.pressedInventorySlot = slot;

            // Start timer for long-press (select/pick up item) - 300ms for responsive mobile UX
            this.inventoryItemPressTimer = this.time.delayedCall(300, () => {
                // Long press = select item (pick up)
                if (this.selectedItem && this.selectedItem.id !== slot.item.id) {
                    // Already have an item selected - combine
                    this.tryCombineItems(this.selectedItem, slot.item);
                } else {
                    this.selectItem(slot.item, slot);

                    // Set BaseScene's gesture state so drag-with-item works on release
                    const gameScene = this.getActiveGameScene();
                    if (gameScene && gameScene.mobileGesture) {
                        gameScene.mobileGesture.dragWithItem = true;
                        gameScene.mobileGesture.draggedItem = slot.item;
                    }
                }
                this.pressedInventoryItem = null;
                this.pressedInventorySlot = null;
            });
        }
    }

    handleMobileInventoryPointerUp(pointer) {
        // Cancel long-press timer
        if (this.inventoryItemPressTimer) {
            this.inventoryItemPressTimer.remove();
            this.inventoryItemPressTimer = null;
        }

        const pressedItem = this.pressedInventoryItem;
        const pressedSlot = this.pressedInventorySlot;
        this.pressedInventoryItem = null;
        this.pressedInventorySlot = null;

        if (!pressedItem) return;

        // Check if we're still over the same slot (tap)
        const slot = this.getSlotAtPointer(pointer);
        if (slot && slot.item && slot.item.id === pressedItem.id) {
            // Tap on item = examine
            this.examineItem(pressedItem);
        }
    }

    getSlotAtPointer(pointer) {
        if (!this.inventoryPanel || !this.inventoryPanel.visible) return null;

        const { width, height } = this.scale;
        const panelX = width / 2;
        const panelY = height / 2;

        // Convert screen coords to panel-relative coords
        const localX = pointer.x - panelX;
        const localY = pointer.y - panelY;

        for (const slot of this.inventorySlots) {
            const halfSize = slot.size / 2;
            if (localX >= slot.x - halfSize && localX <= slot.x + halfSize &&
                localY >= slot.y - halfSize && localY <= slot.y + halfSize) {
                return slot;
            }
        }
        return null;
    }

    checkItemOutsideInventory(pointer) {
        const { width, height } = this.scale;
        const panelLeft = (width - this.inventoryPanelWidth) / 2;
        const panelRight = panelLeft + this.inventoryPanelWidth;
        const panelTop = (height - this.inventoryPanelHeight) / 2;
        const panelBottom = panelTop + this.inventoryPanelHeight;

        const isOutside = pointer.x < panelLeft || pointer.x > panelRight ||
                          pointer.y < panelTop || pointer.y > panelBottom;

        if (isOutside) {
            if (!this.itemOutsideInventoryTimer) {
                this.itemOutsideInventoryTimer = this.time.delayedCall(100, () => {
                    // Close silently when dragging item out
                    if (TSH.State.isInventoryOpen() && this.selectedItem) {
                        // Close inventory silently (we already have the item selected)
                        TSH.State._state.ui.inventoryOpen = false;
                        TSH.State.emit('uiStateChanged', { key: 'inventoryOpen', value: false, previousValue: true });
                    }
                    this.itemOutsideInventoryTimer = null;
                });
            }
        } else {
            if (this.itemOutsideInventoryTimer) {
                this.itemOutsideInventoryTimer.remove();
                this.itemOutsideInventoryTimer = null;
            }
        }
    }

    // ── Public API for Game Scenes ──────────────────────────────────────────
    // These provide direct control when event-based updates aren't suitable

    setCrosshairColor(color) {
        this.drawCrosshair(color);
    }

    setCrosshairVisible(visible) {
        if (!this.isMobile) {
            this.crosshairCursor.setVisible(visible);
        }
    }

    setItemCursorVisible(visible) {
        if (!this.isMobile && TSH.State.getSelectedItem()) {
            this.itemCursor.setVisible(visible);
        }
    }

    isClickOnInventoryPanel(pointer) {
        if (!TSH.State.isInventoryOpen()) return false;
        const { width, height } = this.scale;
        const panelLeft = (width - this.inventoryPanelWidth) / 2;
        const panelRight = panelLeft + this.inventoryPanelWidth;
        const panelTop = (height - this.inventoryPanelHeight) / 2;
        const panelBottom = panelTop + this.inventoryPanelHeight;
        return pointer.x >= panelLeft && pointer.x <= panelRight &&
               pointer.y >= panelTop && pointer.y <= panelBottom;
    }

    // ── UI Buttons ──────────────────────────────────────────────────────────

    canInteractWithUI() {
        // Block all UI interactions if debug mode is active
        const gameScene = this.getActiveGameScene();
        if (gameScene && gameScene.debugEnabled) {
            return false;
        }

        const ui = TSH.State._state.ui;
        return !ui.transitioning && !ui.dialogActive && !ui.conversationActive;
    }

    createInventoryButton(width, height) {
        const btnSize = 90;
        this.inventoryButtonArea = { x: btnSize/2 + 15, y: height - btnSize/2 - 15, size: btnSize };

        this.inventoryButton = this.add.container(this.inventoryButtonArea.x, this.inventoryButtonArea.y);
        this.inventoryButton.setDepth(4000);

        // Create hollow (outline) version - shown by default
        this.inventoryBtnHollow = this.add.graphics();
        this.inventoryBtnHollow.lineStyle(3, 0x8b6914, 0.7);
        this.inventoryBtnHollow.strokeRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 12);
        // Hollow backpack icon (outline only)
        this.inventoryBtnHollow.lineStyle(2, 0xc9a227, 0.7);
        this.inventoryBtnHollow.strokeRoundedRect(-24, -10, 48, 36, 8);
        this.inventoryBtnHollow.strokeRoundedRect(-18, -22, 36, 16, 5);
        this.inventoryBtnHollow.strokeCircle(0, -8, 7);
        this.inventoryButton.add(this.inventoryBtnHollow);

        // Create filled version - shown on hover/open
        this.inventoryBtnFilled = this.add.graphics();
        this.inventoryBtnFilled.fillStyle(0x4a3728, 0.9);
        this.inventoryBtnFilled.fillRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 12);
        this.inventoryBtnFilled.lineStyle(4, 0x8b6914, 1);
        this.inventoryBtnFilled.strokeRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 12);
        // Filled backpack icon
        this.inventoryBtnFilled.fillStyle(0xc9a227, 1);
        this.inventoryBtnFilled.fillRoundedRect(-24, -10, 48, 36, 8);
        this.inventoryBtnFilled.fillRoundedRect(-18, -22, 36, 16, 5);
        this.inventoryBtnFilled.fillStyle(0x8b6914, 1);
        this.inventoryBtnFilled.fillCircle(0, -8, 7);
        this.inventoryBtnFilled.fillStyle(0x4a3728, 1);
        this.inventoryBtnFilled.fillCircle(0, -8, 3);
        this.inventoryBtnFilled.setVisible(false);
        this.inventoryButton.add(this.inventoryBtnFilled);
    }

    createSettingsButton(width, height) {
        const btnSize = 70;
        this.settingsButtonArea = { x: width - btnSize/2 - 15, y: btnSize/2 + 15, size: btnSize };

        this.settingsButton = this.add.container(this.settingsButtonArea.x, this.settingsButtonArea.y);
        this.settingsButton.setDepth(4000);

        // Create hollow (outline) version - shown by default
        this.settingsBtnHollow = this.add.graphics();
        this.settingsBtnHollow.lineStyle(3, 0x6a6a8a, 0.7);
        this.settingsBtnHollow.strokeRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 10);
        // Hollow gear icon (outline only)
        this.drawGearIcon(this.settingsBtnHollow, 0, 0, 22, false);
        this.settingsButton.add(this.settingsBtnHollow);

        // Create filled version - shown on hover/open
        this.settingsBtnFilled = this.add.graphics();
        this.settingsBtnFilled.fillStyle(0x3a3a5a, 0.9);
        this.settingsBtnFilled.fillRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 10);
        this.settingsBtnFilled.lineStyle(3, 0x6a6a8a, 1);
        this.settingsBtnFilled.strokeRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 10);
        // Filled gear icon
        this.drawGearIcon(this.settingsBtnFilled, 0, 0, 22, true);
        this.settingsBtnFilled.setVisible(false);
        this.settingsButton.add(this.settingsBtnFilled);
    }

    drawGearIcon(graphics, x, y, radius, filled) {
        const teeth = 8;
        const innerRadius = radius * 0.5;
        const outerRadius = radius;
        const toothDepth = radius * 0.25;

        if (filled) {
            graphics.fillStyle(0xaaaacc, 1);
        } else {
            graphics.lineStyle(2, 0xaaaacc, 0.7);
        }

        // Draw gear teeth
        graphics.beginPath();
        for (let i = 0; i < teeth; i++) {
            const angle1 = (i / teeth) * Math.PI * 2;
            const angle2 = ((i + 0.35) / teeth) * Math.PI * 2;
            const angle3 = ((i + 0.65) / teeth) * Math.PI * 2;
            const angle4 = ((i + 1) / teeth) * Math.PI * 2;

            const x1 = x + Math.cos(angle1) * (outerRadius - toothDepth);
            const y1 = y + Math.sin(angle1) * (outerRadius - toothDepth);
            const x2 = x + Math.cos(angle2) * outerRadius;
            const y2 = y + Math.sin(angle2) * outerRadius;
            const x3 = x + Math.cos(angle3) * outerRadius;
            const y3 = y + Math.sin(angle3) * outerRadius;
            const x4 = x + Math.cos(angle4) * (outerRadius - toothDepth);
            const y4 = y + Math.sin(angle4) * (outerRadius - toothDepth);

            if (i === 0) {
                graphics.moveTo(x1, y1);
            }
            graphics.lineTo(x2, y2);
            graphics.lineTo(x3, y3);
            graphics.lineTo(x4, y4);
        }
        graphics.closePath();

        if (filled) {
            graphics.fill();
            // Center hole
            graphics.fillStyle(0x3a3a5a, 1);
            graphics.fillCircle(x, y, innerRadius);
        } else {
            graphics.strokePath();
            // Center hole outline
            graphics.strokeCircle(x, y, innerRadius);
        }
    }

    updateInventoryButtonState() {
        const showFilled = this.inventoryButtonHovered || TSH.State.isInventoryOpen();
        if (this.inventoryBtnHollow) this.inventoryBtnHollow.setVisible(!showFilled);
        if (this.inventoryBtnFilled) this.inventoryBtnFilled.setVisible(showFilled);
    }

    updateSettingsButtonState() {
        const showFilled = this.settingsButtonHovered || TSH.State.getUIState('settingsOpen');
        if (this.settingsBtnHollow) this.settingsBtnHollow.setVisible(!showFilled);
        if (this.settingsBtnFilled) this.settingsBtnFilled.setVisible(showFilled);
    }

    isClickOnInventoryButton(pointer) {
        if (!this.inventoryButtonArea) return false;
        const btn = this.inventoryButtonArea;
        const dx = pointer.x - btn.x;
        const dy = pointer.y - btn.y;
        return Math.abs(dx) < btn.size/2 && Math.abs(dy) < btn.size/2;
    }

    isClickOnSettingsButton(pointer) {
        if (!this.settingsButtonArea) return false;
        const btn = this.settingsButtonArea;
        const dx = pointer.x - btn.x;
        const dy = pointer.y - btn.y;
        return Math.abs(dx) < btn.size/2 && Math.abs(dy) < btn.size/2;
    }

    handleButtonHover(pointer) {
        // Inventory button hover
        if (this.inventoryButtonArea) {
            const btn = this.inventoryButtonArea;
            const wasHovered = this.inventoryButtonHovered;
            this.inventoryButtonHovered =
                Math.abs(pointer.x - btn.x) < btn.size/2 &&
                Math.abs(pointer.y - btn.y) < btn.size/2;
            if (wasHovered !== this.inventoryButtonHovered) {
                this.updateInventoryButtonState();
            }
        }

        // Settings button hover
        if (this.settingsButtonArea) {
            const btn = this.settingsButtonArea;
            const wasHovered = this.settingsButtonHovered;
            this.settingsButtonHovered =
                Math.abs(pointer.x - btn.x) < btn.size/2 &&
                Math.abs(pointer.y - btn.y) < btn.size/2;
            if (wasHovered !== this.settingsButtonHovered) {
                this.updateSettingsButtonState();
            }
        }
    }

    handleButtonClick(pointer) {
        if (!this.canInteractWithUI()) return false;

        // Check inventory button
        if (this.isClickOnInventoryButton(pointer)) {
            const currentOpen = TSH.State.isInventoryOpen();
            TSH.State.setInventoryOpen(!currentOpen);
            this.updateInventoryButtonState();
            return true;
        }

        // Check settings button
        if (this.isClickOnSettingsButton(pointer)) {
            // Toggle settings menu - if already open, close it
            const isOpen = TSH.State.getUIState('settingsOpen');
            TSH.State.setUIState('settingsOpen', !isOpen);
            this.updateSettingsButtonState();
            return true;
        }

        return false;
    }
}

// Make available globally
window.UIScene = UIScene;
