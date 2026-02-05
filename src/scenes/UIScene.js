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

        console.log('[UIScene] Created - cursors initialized');
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
}

// Make available globally
window.UIScene = UIScene;
