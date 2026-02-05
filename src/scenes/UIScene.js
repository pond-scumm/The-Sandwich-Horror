// ============================================================================
// UI SCENE
// ============================================================================
// Persistent scene that renders on top of game scenes.
// Manages cursors, and will eventually handle inventory, dialogs, settings.
//
// This scene runs parallel to game scenes (RoomScene, etc.) and listens to
// TSH.State events to update UI reactively.
//
// Usage:
//   - Launched once at game start, never stopped
//   - Listens to TSH.State.on('uiStateChanged', ...) for reactive updates
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
    }

    create() {
        const { width, height } = this.scale;

        // Detect mobile
        this.isMobile = !this.sys.game.device.os.desktop;

        // Initialize pointer position to center of screen
        this.lastPointerX = width / 2;
        this.lastPointerY = height / 2;

        // Hide browser cursor
        this.game.canvas.style.cursor = 'none';

        // Create cursors
        this.createCrosshairCursor(width, height);
        this.createArrowCursor(width, height);
        this.createItemCursor();

        // Listen to pointer events for position tracking
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerdown', this.onPointerDown, this);

        // Listen to state changes
        TSH.State.on('uiStateChanged', this.onUIStateChanged.bind(this));

        // Initialize cursor state from current TSH.State
        this.syncCursorState();

        // Create UI buttons
        this.createInventoryButton(width, height);
        this.createSettingsButton(width, height);

        console.log('[UIScene] Created - cursors and buttons initialized');
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

        const p = 3;  // Pixel size for chunky look
        const color = 0xffffff;
        const shadow = 0x000000;

        // Arrow pointing in the given direction
        // Base arrow points right, we'll flip for left
        const flip = direction === 'left' ? -1 : 1;

        g.fillStyle(shadow, 0.5);
        // Shadow offset
        const so = 2;

        // Draw shadow first
        g.fillRect(flip * 0 * p + so, -1 * p + so, p, p);
        g.fillRect(flip * 1 * p + so, -2 * p + so, p, p);
        g.fillRect(flip * 2 * p + so, -3 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, -4 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, -3 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, -2 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, -1 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, 0 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, 1 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, 2 * p + so, p, p);
        g.fillRect(flip * 3 * p + so, 3 * p + so, p, p);
        g.fillRect(flip * 2 * p + so, 2 * p + so, p, p);
        g.fillRect(flip * 1 * p + so, 1 * p + so, p, p);
        g.fillRect(flip * 0 * p + so, 0 * p + so, p, p);

        // Draw arrow
        g.fillStyle(color, 1);
        g.fillRect(flip * 0 * p, -1 * p, p, p);
        g.fillRect(flip * 1 * p, -2 * p, p, p);
        g.fillRect(flip * 2 * p, -3 * p, p, p);
        g.fillRect(flip * 3 * p, -4 * p, p, p);
        g.fillRect(flip * 3 * p, -3 * p, p, p);
        g.fillRect(flip * 3 * p, -2 * p, p, p);
        g.fillRect(flip * 3 * p, -1 * p, p, p);
        g.fillRect(flip * 3 * p, 0 * p, p, p);
        g.fillRect(flip * 3 * p, 1 * p, p, p);
        g.fillRect(flip * 3 * p, 2 * p, p, p);
        g.fillRect(flip * 3 * p, 3 * p, p, p);
        g.fillRect(flip * 2 * p, 2 * p, p, p);
        g.fillRect(flip * 1 * p, 1 * p, p, p);
        g.fillRect(flip * 0 * p, 0 * p, p, p);
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

        // Position at last known pointer location before showing
        this.itemCursor.setPosition(this.lastPointerX + 20, this.lastPointerY + 20);

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
        const selectedItem = TSH.State.getSelectedItem();

        if (selectedItem) {
            // Get item data
            const item = TSH.Items[selectedItem];
            if (item) {
                this.updateItemCursor(item);
                this.crosshairCursor.setVisible(false);
            }
        } else {
            this.updateItemCursor(null);
            if (!this.isMobile && !this.currentEdgeZone) {
                // Position crosshair at last known pointer position before showing
                this.crosshairCursor.setPosition(this.lastPointerX, this.lastPointerY);
                this.crosshairCursor.setVisible(true);
            }
        }
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
            this.handleButtonClick(pointer);
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

        // Update item cursor position (offset from pointer)
        if (this.itemCursor && this.itemCursor.visible) {
            this.itemCursor.setPosition(pointer.x + 20, pointer.y + 20);
        }

        // Handle button hover (desktop only)
        if (!this.isMobile) {
            this.handleButtonHover(pointer);
        }
    }

    onUIStateChanged(data) {
        const { key, value } = data;

        if (key === 'selectedItem') {
            if (value) {
                const item = TSH.Items[value];
                if (item) {
                    this.updateItemCursor(item);
                    this.crosshairCursor.setVisible(false);
                }
            } else {
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
            // Update inventory button visual
            this.updateInventoryButtonState();
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

    // ── UI Buttons ──────────────────────────────────────────────────────────

    canInteractWithUI() {
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
            TSH.State.setUIState('settingsOpen', true);
            this.updateSettingsButtonState();
            return true;
        }

        return false;
    }
}

// Make available globally
window.UIScene = UIScene;
