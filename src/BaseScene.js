        class BaseScene extends Phaser.Scene {
            constructor(config) {
                super(config);

                // Scene configuration (override in subclasses)
                this.worldWidth = 1280;
                this.screenWidth = 1280;
                this.screenHeight = 720;
                this.walkableArea = { minY: 0.62, maxY: 0.88 };

                // Player state
                this.player = null;
                this.isWalking = false;
                this.walkTween = null;
                this.bobTween = null;
                this.leftLeg = null;
                this.rightLeg = null;

                // Movement
                this.lastClickTime = 0;
                this.doubleClickThreshold = 300;
                this.isRunningHold = false;
                this.runningHoldStartTime = 0;
                this.interactionRange = 80;

                // Verb coin system
                this.verbCoinDelay = 200;
                this.pressTimer = null;
                this.pressedHotspot = null;
                this.verbCoinVisible = false;
                this.pointerDownPos = null;
                this.verbCoin = null;
                this.verbCoinActions = [];
                this.activeHotspot = null;
                this.hoveredAction = null;
                this.isHoldingOnHotspot = false;

                // Verb coin sizes (set in create based on device)
                // Uses 4x4 pixel minimum standard
                this.isMobile = false;
                this.verbCoinSize = 96; // 24 * 4px
                this.verbActionSize = 32; // 8 * 4px
                this.verbCoinScale = 1;

                // Inventory verb coin
                this.pressedInventoryItem = null;
                this.pressedInventorySlot = null;
                this.inventoryItemPressTimer = null;
                this.activeInventoryItem = null;

                // Inventory UI
                this.inventoryPanel = null;
                this.inventoryOpen = false;
                this.inventorySlots = [];
                this.selectedSlotHighlight = null;
                this.itemOutsideInventoryTimer = null;
                this.itemCursor = null;

                // Selected item for "use on" actions (scene-local, not persisted)
                this.selectedItem = null;

                // Cursor
                this.crosshairCursor = null;
                this.crosshairGraphics = null;
                this.arrowCursor = null;
                this.arrowGraphics = null;
                this.arrowDirection = null;
                this.hotspotLabel = null;
                this.currentHoveredHotspot = null;

                // Dialogue
                this.speechBubble = null;
                this.dialogText = null;
                this.dialogTimer = null;
                this.dialogQueue = [];
                this.dialogCallback = null;
                this.dialogActive = false;
                this.dialogSkipReady = false;

                // Conversation mode (dialogue trees with NPCs)
                this.conversationActive = false;
                this.conversationNPC = null;
                this.conversationData = null;
                this.conversationState = null;
                this.dialogueOptionsUI = null;
                this.dialogueOptionTexts = [];
                this.npcSpeechBubble = null;
                this.npcDialogText = null;
                this.awaitingNPCResponse = false;
                this.justClickedDialogueOption = false;
                this.conversationLineTimer = null;
                this.conversationLineCallback = null;
                this.conversationLineSpeaker = null;

                // Hotspots
                this.hotspots = [];
                this.itemCursorHighlight = null;

                // UI tracking
                this.clickedUI = false;
            }

            // ========== GAME STATE MANAGEMENT ==========
            // Now uses TSH.State as the single source of truth.
            // See ARCHITECTURE_GUIDE.md for API documentation.

            // Get flag value. Supports both grouped ('clock.has_spring') and
            // flat ('alien_talked') notation for backwards compatibility.
            getFlag(flagName) {
                // If already has a dot, use it directly
                if (flagName.includes('.')) {
                    return TSH.State.getFlag(flagName);
                }
                // Flat flag name - store under 'misc' group for backwards compatibility
                return TSH.State.getFlag('misc.' + flagName);
            }

            // Set flag value. Supports both grouped and flat notation.
            setFlag(flagName, value = true) {
                if (flagName.includes('.')) {
                    TSH.State.setFlag(flagName, value);
                } else {
                    // Flat flag name - store under 'misc' group
                    TSH.State.setFlag('misc.' + flagName, value);
                }
            }

            // Get item object from ID (looks up in TSH.Items)
            getItemById(itemId) {
                return TSH.Items[itemId] || { id: itemId, name: itemId, description: 'Unknown item' };
            }

            // Get current inventory as array of item objects
            getInventoryItems() {
                const ids = TSH.State.getInventory();
                return ids.map(id => this.getItemById(id));
            }

            // Get spawn point for current scene transition
            getSpawnPoint() {
                return TSH.State._spawnPoint || 'default';
            }

            // Promise-based delay for async sequences
            // Usage: await this.delay(1000);
            delay(ms) {
                return new Promise(resolve => this.time.delayedCall(ms, resolve));
            }

            // ========== SCENE LIFECYCLE ==========

            create() {
                const { width, height } = this.scale;

                // Reset scene-specific state (constructor doesn't re-run on scene.start())
                this.inventorySlots = [];
                this.hotspots = [];
                this.verbCoinVisible = false;
                this.inventoryOpen = false;
                this.dialogActive = false;
                this.dialogQueue = [];
                this.isWalking = false;

                // Detect mobile/touch device and set verb coin sizes
                // Uses 4x4 pixel minimum standard
                this.isMobile = this.sys.game.device.input.touch;
                if (this.isMobile) {
                    this.verbCoinSize = 192; // 48 * 4px
                    this.verbActionSize = 64; // 16 * 4px
                    this.verbCoinScale = 2;
                } else {
                    this.verbCoinSize = 96; // 24 * 4px
                    this.verbActionSize = 32; // 8 * 4px
                    this.verbCoinScale = 1;
                }

                // Create pixel texture for player if needed
                if (!this.textures.exists('pixel')) {
                    const g = this.make.graphics({ add: false });
                    g.fillStyle(0xbbbbbb);
                    g.fillRect(0, 0, 6, 6);
                    g.generateTexture('pixel', 6, 6);
                    g.destroy();
                }

                // Hide browser cursor
                this.game.canvas.style.cursor = 'none';

                // Setup input handlers
                this.setupInputHandlers();

                // Create UI systems
                this.createCrosshairCursor(width, height);
                this.createVerbCoin(width, height);
                this.createInventoryUI(width, height);
                this.createItemCursor();
                this.createDialogUI(width, height);
                this.createConversationUI(width, height);

                // Restore inventory from game state
                this.rebuildInventoryFromState();

                // Fade in
                this.cameras.main.fadeIn(500, 0, 0, 0);
            }

            rebuildInventoryFromState() {
                const items = this.getInventoryItems();

                console.log('[' + this.scene.key + '] Rebuilding inventory from TSH.State:', {
                    inventory: items.map(i => i.id),
                    slotsAvailable: this.inventorySlots.length
                });

                if (items.length === 0) {
                    console.log('[' + this.scene.key + '] No items in inventory to restore');
                    return;
                }

                // Re-add each item to inventory UI (slots are fresh, so just add to UI)
                items.forEach(item => {
                    // Check if slot already has this item (shouldn't happen but be safe)
                    const existingSlot = this.inventorySlots.find(s => s.item && s.item.id === item.id);
                    if (!existingSlot) {
                        console.log('[' + this.scene.key + '] Adding item to slot:', item.id);
                        this.addItemToSlot(item);
                    } else {
                        console.log('[' + this.scene.key + '] Item already in slot:', item.id);
                    }
                });

                // Note: selectedItem is scene-local and doesn't persist across scene transitions
            }

            // ========== INPUT HANDLERS ==========

            setupInputHandlers() {
                // Left click
                this.input.on('pointerdown', (pointer) => {
                    if (pointer.leftButtonDown()) {
                        // Check mobile inventory button first (uses screen coords, ignores camera scroll)
                        if (this.isClickOnInventoryButton(pointer)) {
                            this.clickedUI = true;
                            this.toggleInventory();
                            return;
                        }
                        if (this.dialogActive) {
                            this.skipToNextDialog();
                            return;
                        }
                        if (this.conversationActive) {
                            // Allow clicking to skip conversation dialogue
                            // But not if we just clicked a dialogue option (that would skip the hero's line)
                            if (this.conversationLineCallback && !this.justClickedDialogueOption) {
                                this.skipConversationLine();
                            }
                            return;
                        }
                        this.handleBackgroundPress(pointer);
                    }
                    if (pointer.rightButtonDown()) {
                        if (this.conversationActive) return;
                        if (this.verbCoinVisible) {
                            this.hideVerbCoin();
                            return;
                        }
                        if (this.selectedItem) {
                            this.deselectItem();
                            return;
                        }
                        this.toggleInventory();
                    }
                });

                this.input.on('pointerup', (pointer) => {
                    this.handlePointerUp(pointer);
                });

                this.input.on('pointermove', (pointer) => {
                    this.updateVerbCoinHover(pointer);
                    if (this.inventoryOpen && this.selectedItem) {
                        this.checkItemOutsideInventory(pointer);
                    }
                });

                // Period key for dialogue skip
                this.input.keyboard.on('keydown-PERIOD', () => {
                    if (this.dialogActive) this.skipToNextDialog();
                    if (this.conversationActive && this.conversationLineCallback) {
                        this.skipConversationLine();
                    }
                });

                // Prevent context menu
                this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            }

            // Check if pointer is on the mobile inventory button (screen coordinates)
            isClickOnInventoryButton(pointer) {
                if (!this.inventoryButtonArea) return false;
                const btn = this.inventoryButtonArea;
                return pointer.x >= btn.x - btn.size/2 && pointer.x <= btn.x + btn.size/2 &&
                       pointer.y >= btn.y - btn.size/2 && pointer.y <= btn.y + btn.size/2;
            }

            handleBackgroundPress(pointer) {
                if (this.clickedUI) return;

                if (this.verbCoinVisible) {
                    this.hideVerbCoin();
                    return;
                }

                if (this.inventoryOpen) {
                    const { width, height } = this.scale;
                    const panelWidth = width - 100;
                    const panelHeight = height - 120;
                    const panelLeft = (width - panelWidth) / 2;
                    const panelRight = panelLeft + panelWidth;
                    const panelTop = (height - panelHeight) / 2;
                    const panelBottom = panelTop + panelHeight;

                    if (pointer.x < panelLeft || pointer.x > panelRight ||
                        pointer.y < panelTop || pointer.y > panelBottom) {
                        this.toggleInventory();
                    }
                    return;
                }

                if (this.selectedItem) {
                    this.deselectItem();
                    return;
                }

                // Double-click to run
                const currentTime = Date.now();
                const isDoubleClick = (currentTime - this.lastClickTime) < this.doubleClickThreshold;
                this.lastClickTime = currentTime;

                if (isDoubleClick) {
                    this.isRunningHold = true;
                    this.runningHoldStartTime = Date.now();
                    this.runToPointer(pointer);
                    return;
                }

                this.pointerDownPos = { x: pointer.x, y: pointer.y };
                this.isHoldingOnHotspot = false;
            }

            handlePointerUp(pointer) {
                // Clear running hold
                if (this.isRunningHold) {
                    const wasHolding = (Date.now() - this.runningHoldStartTime) > 150;
                    this.isRunningHold = false;
                    if (wasHolding) {
                        this.isWalking = false;
                        this.stopWalkAnimation();
                    }
                }

                // Cancel timers
                if (this.pressTimer) {
                    this.pressTimer.remove();
                    this.pressTimer = null;
                }
                if (this.inventoryItemPressTimer) {
                    this.inventoryItemPressTimer.remove();
                    this.inventoryItemPressTimer = null;
                }

                // Handle inventory item verb coin
                if (this.verbCoinVisible && this.activeInventoryItem) {
                    const action = this.hoveredAction;
                    const item = this.activeInventoryItem;
                    this.hideVerbCoin();
                    if (action) this.performInventoryItemAction(action, item);
                    this.pressedInventoryItem = null;
                    this.pressedInventorySlot = null;
                    this.clickedUI = false;
                    return;
                }

                if (this.clickedUI) {
                    this.clickedUI = false;
                    this.pressedHotspot = null;
                    this.verbCoinVisible = false;
                    this.isHoldingOnHotspot = false;
                    this.pointerDownPos = null;
                    return;
                }

                // Don't handle normal interactions during conversation
                if (this.conversationActive) {
                    this.pressedHotspot = null;
                    this.isHoldingOnHotspot = false;
                    this.pointerDownPos = null;
                    return;
                }

                // Handle hotspot verb coin
                if (this.verbCoinVisible && this.hoveredAction && this.activeHotspot) {
                    const action = this.hoveredAction;
                    const hotspot = this.activeHotspot;
                    this.hideVerbCoin();
                    if (!this.isPlayerNearHotspot(hotspot)) {
                        this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                            this.executeAction(action, hotspot);
                        });
                    } else {
                        this.executeAction(action, hotspot);
                    }
                } else if (this.verbCoinVisible) {
                    this.hideVerbCoin();
                } else if (this.isHoldingOnHotspot && this.pressedHotspot) {
                    this.walkTo(this.pressedHotspot.interactX, this.pressedHotspot.interactY);
                } else if (!this.isHoldingOnHotspot && this.pointerDownPos) {
                    this.handleBackgroundClick(this.pointerDownPos.x, this.pointerDownPos.y);
                }

                this.pressedHotspot = null;
                this.isHoldingOnHotspot = false;
                this.pointerDownPos = null;
            }

            handleBackgroundClick(x, y) {
                if (this.dialogActive || this.conversationActive) return;

                const { height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                const worldX = x + scrollX;
                const worldY = y + scrollY;

                const minY = height * this.walkableArea.minY;
                const maxY = height * this.walkableArea.maxY;
                const targetY = Phaser.Math.Clamp(worldY, minY, maxY);

                if (this.isRunningHold) return;

                this.walkTo(worldX, targetY, null, false);
            }

            runToPointer(pointer) {
                const { height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                const worldX = pointer.x + scrollX;
                const worldY = pointer.y + scrollY;

                const minY = height * this.walkableArea.minY;
                const maxY = height * this.walkableArea.maxY;
                const targetY = Phaser.Math.Clamp(worldY, minY, maxY);

                this.walkTo(worldX, targetY, null, true);
            }

            handleHotspotPress(hotspot, pointer) {
                if (!pointer.leftButtonDown()) return;
                if (this.isRunningHold) return;
                if (this.conversationActive) return;

                if (this.verbCoinVisible) {
                    this.hideVerbCoin();
                    return;
                }

                const selectedItem = this.selectedItem;
                if (selectedItem) {
                    this.clickedUI = true;
                    if (this.isPlayerNearHotspot(hotspot)) {
                        this.useItemOnHotspot(selectedItem, hotspot);
                    } else {
                        this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                            this.useItemOnHotspot(selectedItem, hotspot);
                        });
                    }
                    return;
                }

                this.isHoldingOnHotspot = true;
                this.pressedHotspot = hotspot;

                this.pressTimer = this.time.delayedCall(this.verbCoinDelay, () => {
                    this.showVerbCoin(hotspot, pointer.x, pointer.y);
                });
            }

            // ========== PLAYER ==========

            createPlayer(spawnX, spawnY) {
                const { height } = this.scale;
                const playerY = spawnY || height * 0.75;

                this.player = this.add.container(spawnX, playerY);

                const p = 6; // Pixel size
                const pixel = (x, y, color) => {
                    const sprite = this.add.sprite(x * p, -y * p, 'pixel');
                    sprite.setTint(color);
                    sprite.setPipeline('Light2D');
                    return sprite;
                };

                // Colors
                const SKIN = 0xeabc8e, SKIN_DARK = 0xd4a574;
                const HAIR = 0x2ecc71, HAIR_DARK = 0x1fa855;
                const VEST = 0x3366aa, VEST_DARK = 0x254a7a;
                const SHIRT = 0xeeeeee, SHIRT_DARK = 0xcccccc;
                const PANTS = 0x2c3e50, PANTS_DARK = 0x1a252f;
                const SHOES = 0x1a1a1a, BLACK = 0x000000, WHITE = 0xffffff;

                const pixels = [];

                // Shoes
                for (let x = -5; x <= -2; x++) { pixels.push(pixel(x, 0, SHOES)); pixels.push(pixel(x, 1, SHOES)); }
                for (let x = 2; x <= 5; x++) { pixels.push(pixel(x, 0, SHOES)); pixels.push(pixel(x, 1, SHOES)); }

                // Legs
                this.leftLegPixels = [];
                this.rightLegPixels = [];
                for (let y = 2; y <= 18; y++) {
                    for (let x = -4; x <= -2; x++) this.leftLegPixels.push(pixel(x, y, x === -4 ? PANTS_DARK : PANTS));
                    for (let x = 2; x <= 4; x++) this.rightLegPixels.push(pixel(x, y, x === 4 ? PANTS_DARK : PANTS));
                }
                this.leftLeg = this.add.container(0, 0, this.leftLegPixels);
                this.rightLeg = this.add.container(0, 0, this.rightLegPixels);

                // Torso
                for (let y = 19; y <= 28; y++) {
                    pixels.push(pixel(-6, y, SHIRT)); pixels.push(pixel(-5, y, SHIRT_DARK));
                    pixels.push(pixel(5, y, SHIRT_DARK)); pixels.push(pixel(6, y, SHIRT));
                }
                for (let y = 18; y <= 30; y++) {
                    for (let x = -4; x <= 4; x++) {
                        if (x === -4 || x === 4) pixels.push(pixel(x, y, VEST_DARK));
                        else if (x === 0 && y >= 20) pixels.push(pixel(x, y, SHIRT));
                        else pixels.push(pixel(x, y, VEST));
                    }
                }
                for (let x = -3; x <= 3; x++) pixels.push(pixel(x, 31, VEST));
                pixels.push(pixel(-2, 32, VEST)); pixels.push(pixel(2, 32, VEST));

                // Hands
                for (let y = 19; y <= 21; y++) {
                    pixels.push(pixel(-6, y, SKIN)); pixels.push(pixel(-7, y, SKIN_DARK));
                    pixels.push(pixel(6, y, SKIN)); pixels.push(pixel(7, y, SKIN_DARK));
                }

                // Neck & Head
                for (let i = 0; i < 2; i++) for (let x = -1; x <= 1; x++) pixels.push(pixel(x, 32 + i, SKIN));
                for (let y = 34; y <= 42; y++) {
                    let w = y >= 37 && y <= 39 ? 5 : (y >= 36 && y <= 40 ? 4 : 3);
                    for (let x = -w; x <= w; x++) pixels.push(pixel(x, y, (x === -w || x === w) ? SKIN_DARK : SKIN));
                }

                // Eyes
                [-3, -2].forEach(x => { pixels.push(pixel(x, 38, BLACK)); pixels.push(pixel(x, 39, BLACK)); });
                [2, 3].forEach(x => { pixels.push(pixel(x, 38, BLACK)); pixels.push(pixel(x, 39, BLACK)); });
                pixels.push(pixel(-3, 39, WHITE)); pixels.push(pixel(2, 39, WHITE));
                for (let x = -4; x <= 4; x++) if (x !== 0) pixels.push(pixel(x, 40, BLACK));
                [-1, 0, 1].forEach(x => pixels.push(pixel(x, 36, SKIN_DARK)));

                // Hair
                for (let y = 41; y <= 45; y++) {
                    let w = y >= 44 ? 4 : (y >= 43 ? 5 : 4);
                    if (y >= 45) w = 3;
                    for (let x = -w; x <= w; x++) pixels.push(pixel(x, y, (x === -w || x === w || y === 45) ? HAIR_DARK : HAIR));
                }
                pixels.push(pixel(-3, 46, HAIR)); pixels.push(pixel(-2, 46, HAIR)); pixels.push(pixel(-2, 47, HAIR_DARK));
                pixels.push(pixel(0, 46, HAIR)); pixels.push(pixel(0, 47, HAIR)); pixels.push(pixel(0, 48, HAIR_DARK));
                pixels.push(pixel(2, 46, HAIR)); pixels.push(pixel(3, 46, HAIR)); pixels.push(pixel(2, 47, HAIR_DARK));
                for (let y = 38; y <= 41; y++) { pixels.push(pixel(-5, y, HAIR_DARK)); pixels.push(pixel(5, y, HAIR_DARK)); }

                this.player.add([this.leftLeg, this.rightLeg, ...pixels]);
                this.player.setDepth(100);
            }

            // ========== WALKING ==========

            // Check if a point is inside the walkable polygon (or bounding box if no polygon)
            isPointInWalkableArea(x, y) {
                const { height } = this.scale;

                if (this.walkableArea.polygon && this.walkableArea.polygon.length >= 3) {
                    // Convert polygon to pixel coordinates
                    const points = this.walkableArea.polygon.map(p => ({
                        x: p.x,
                        y: height * p.y
                    }));
                    return this.pointInPolygon(x, y, points);
                } else {
                    // Fallback to bounding box
                    const minY = height * this.walkableArea.minY;
                    const maxY = height * this.walkableArea.maxY;
                    return y >= minY && y <= maxY;
                }
            }

            // Point-in-polygon test using ray casting algorithm
            pointInPolygon(x, y, polygon) {
                let inside = false;
                for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                    const xi = polygon[i].x, yi = polygon[i].y;
                    const xj = polygon[j].x, yj = polygon[j].y;

                    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
                        inside = !inside;
                    }
                }
                return inside;
            }

            // Find the nearest point inside/on the walkable area
            getNearestWalkablePoint(x, y) {
                const { height } = this.scale;

                if (this.walkableArea.polygon && this.walkableArea.polygon.length >= 3) {
                    // Convert polygon to pixel coordinates
                    const points = this.walkableArea.polygon.map(p => ({
                        x: p.x,
                        y: height * p.y
                    }));

                    // If already inside, return the point
                    if (this.pointInPolygon(x, y, points)) {
                        return { x, y };
                    }

                    // Find nearest point on polygon edge
                    let nearestPoint = { x, y };
                    let nearestDist = Infinity;

                    for (let i = 0; i < points.length; i++) {
                        const p1 = points[i];
                        const p2 = points[(i + 1) % points.length];

                        const nearest = this.nearestPointOnSegment(x, y, p1.x, p1.y, p2.x, p2.y);
                        const dist = Phaser.Math.Distance.Between(x, y, nearest.x, nearest.y);

                        if (dist < nearestDist) {
                            nearestDist = dist;
                            nearestPoint = nearest;
                        }
                    }

                    return nearestPoint;
                } else {
                    // Fallback to bounding box clamping
                    const minY = height * this.walkableArea.minY;
                    const maxY = height * this.walkableArea.maxY;
                    return {
                        x: x,
                        y: Phaser.Math.Clamp(y, minY, maxY)
                    };
                }
            }

            // Find nearest point on a line segment
            nearestPointOnSegment(px, py, x1, y1, x2, y2) {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const lengthSq = dx * dx + dy * dy;

                if (lengthSq === 0) {
                    return { x: x1, y: y1 };
                }

                let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
                t = Phaser.Math.Clamp(t, 0, 1);

                return {
                    x: x1 + t * dx,
                    y: y1 + t * dy
                };
            }

            // Walk to a position. Returns a Promise for async/await support.
            // Also supports legacy callback pattern via onComplete parameter.
            walkTo(targetX, targetY, onComplete = null, isRunning = false) {
                return new Promise((resolve) => {
                    const done = () => {
                        if (onComplete) onComplete();
                        resolve();
                    };

                    if (this.dialogActive || this.conversationActive) {
                        done();
                        return;
                    }

                    const { height } = this.scale;
                    targetX = Phaser.Math.Clamp(targetX, 30, this.worldWidth - 30);

                    // Use polygon-aware movement if available
                    const walkablePoint = this.getNearestWalkablePoint(targetX, targetY);
                    targetX = walkablePoint.x;
                    targetY = walkablePoint.y;

                    if (this.walkTween) this.walkTween.stop();
                    if (this.bobTween) this.bobTween.stop();

                    const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
                    if (distance < 5) {
                        done();
                        return;
                    }

                    if (targetX < this.player.x) this.player.setScale(-1, 1);
                    else if (targetX > this.player.x) this.player.setScale(1, 1);

                    this.isWalking = true;
                    this.startWalkAnimation(isRunning);

                    const speed = isRunning ? 500 : 300;
                    const duration = (distance / speed) * 1000;

                    this.walkTween = this.tweens.add({
                        targets: this.player,
                        x: targetX,
                        y: targetY,
                        duration: duration,
                        ease: 'Linear',
                        onUpdate: () => {
                            // Constrain to walkable area every frame
                            if (!this.isPointInWalkableArea(this.player.x, this.player.y)) {
                                const corrected = this.getNearestWalkablePoint(this.player.x, this.player.y);
                                this.player.x = corrected.x;
                                this.player.y = corrected.y;
                            }

                            this.player.setDepth(100 + this.player.y);
                            // Camera follow for wide rooms
                            if (this.worldWidth > this.screenWidth) {
                                this.cameras.main.scrollX = Phaser.Math.Clamp(
                                    this.player.x - this.screenWidth / 2,
                                    0,
                                    this.worldWidth - this.screenWidth
                                );
                            }
                        },
                        onComplete: () => {
                            this.isWalking = false;
                            this.stopWalkAnimation();
                            done();
                        }
                    });
                });
            }

            startWalkAnimation(isRunning = false) {
                const animDuration = isRunning ? 100 : 200;
                const legSwing = isRunning ? 8 : 5;

                this.bobTween = this.tweens.add({
                    targets: { progress: 0 },
                    progress: 1,
                    duration: animDuration,
                    repeat: -1,
                    yoyo: true,
                    onUpdate: (tween) => {
                        const progress = tween.getValue();
                        if (this.leftLeg) this.leftLeg.x = Math.sin(progress * Math.PI) * legSwing;
                        if (this.rightLeg) this.rightLeg.x = -Math.sin(progress * Math.PI) * legSwing;
                    }
                });
            }

            stopWalkAnimation() {
                if (this.bobTween) this.bobTween.stop();
                if (this.leftLeg) this.leftLeg.x = 0;
                if (this.rightLeg) this.rightLeg.x = 0;
            }

            // Stop character movement when UI opens (verb coin, inventory)
            stopCharacterMovement() {
                if (this.walkTween) {
                    this.walkTween.stop();
                    this.walkTween = null;
                }
                this.isWalking = false;
                this.stopWalkAnimation();
            }

            isPlayerNearHotspot(hotspot) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    hotspot.interactX, hotspot.interactY
                );
                return dist < this.interactionRange;
            }

            // ========== HOTSPOTS ==========

            createHotspots(hotspotData) {
                this.hotspots = [];

                hotspotData.forEach(spot => {
                    let zone;

                    if (spot.polygon && spot.polygon.length >= 3) {
                        // Polygon hotspot - create zone with polygon hitArea
                        // Calculate bounding box for the zone size
                        const xs = spot.polygon.map(p => p.x);
                        const ys = spot.polygon.map(p => p.y);
                        const minX = Math.min(...xs);
                        const minY = Math.min(...ys);
                        const maxX = Math.max(...xs);
                        const maxY = Math.max(...ys);

                        // Create polygon points relative to zone center
                        const centerX = (minX + maxX) / 2;
                        const centerY = (minY + maxY) / 2;
                        const relativePoints = [];
                        spot.polygon.forEach(p => {
                            relativePoints.push(p.x - centerX + (maxX - minX) / 2);
                            relativePoints.push(p.y - centerY + (maxY - minY) / 2);
                        });

                        const polygon = new Phaser.Geom.Polygon(relativePoints);

                        zone = this.add.zone(centerX, centerY, maxX - minX, maxY - minY)
                            .setInteractive(polygon, Phaser.Geom.Polygon.Contains)
                            .setOrigin(0.5);
                    } else {
                        // Rectangle hotspot
                        zone = this.add.zone(spot.x, spot.y, spot.w, spot.h)
                            .setInteractive()
                            .setOrigin(0.5);
                    }

                    const hotspot = { zone, ...spot };
                    this.hotspots.push(hotspot);

                    zone.on('pointerover', () => {
                        if (this.inventoryOpen || this.conversationActive) return;
                        this.setCrosshairHover(hotspot);
                    });

                    zone.on('pointerout', () => {
                        if (this.inventoryOpen || this.conversationActive) return;
                        this.setCrosshairHover(null);
                    });

                    zone.on('pointerdown', (pointer) => {
                        if (this.inventoryOpen) return;
                        this.handleHotspotPress(hotspot, pointer);
                    });
                });
            }

            // Override in subclass for room-specific actions
            executeAction(action, hotspot) {
                if (action === 'Look At') {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Use') {
                    this.showDialog(hotspot.useResponse);
                } else if (action === 'Talk To') {
                    this.showDialog(hotspot.talkResponse);
                }
            }

            // Override in subclass for room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                this.showDialog(`That doesn't work.`);
            }

            // Remove a hotspot from the scene (e.g., after picking up an item)
            removeHotspot(hotspotId) {
                const index = this.hotspots.findIndex(h => h.id === hotspotId || h._data?.id === hotspotId);
                if (index === -1) {
                    console.warn('[BaseScene] removeHotspot: hotspot not found:', hotspotId);
                    return false;
                }

                const hotspot = this.hotspots[index];

                // Destroy the interactive zone
                if (hotspot.zone) {
                    hotspot.zone.destroy();
                }

                // Remove from array
                this.hotspots.splice(index, 1);

                console.log('[BaseScene] Removed hotspot:', hotspotId);
                return true;
            }

            // ========== VERB COIN ==========

            createVerbCoin(width, height) {
                this.verbCoin = this.add.container(0, 0);
                this.verbCoin.setVisible(false);
                this.verbCoin.setDepth(5000);

                const p = 4; // Pixel size minimum
                const s = this.verbCoinScale;
                const coinSize = this.verbCoinSize;
                const actionSize = this.verbActionSize;
                const halfCoin = coinSize / 2;

                // Gold coin background - octagonal pixel-art style
                const coinBg = this.add.graphics();

                // Main coin body
                coinBg.fillStyle(0x8b6914, 1);
                // Draw octagon using rectangles
                coinBg.fillRect(-halfCoin + p*2*s, -halfCoin, coinSize - p*4*s, coinSize);
                coinBg.fillRect(-halfCoin, -halfCoin + p*2*s, coinSize, coinSize - p*4*s);
                // Corner fills for octagon shape
                coinBg.fillRect(-halfCoin + p*s, -halfCoin + p*s, p*s, p*s);
                coinBg.fillRect(halfCoin - p*2*s, -halfCoin + p*s, p*s, p*s);
                coinBg.fillRect(-halfCoin + p*s, halfCoin - p*2*s, p*s, p*s);
                coinBg.fillRect(halfCoin - p*2*s, halfCoin - p*2*s, p*s, p*s);

                // Outer border (gold highlight)
                coinBg.fillStyle(0xd4a84b, 1);
                coinBg.fillRect(-halfCoin + p*2*s, -halfCoin, coinSize - p*4*s, p*s);
                coinBg.fillRect(-halfCoin + p*2*s, halfCoin - p*s, coinSize - p*4*s, p*s);
                coinBg.fillRect(-halfCoin, -halfCoin + p*2*s, p*s, coinSize - p*4*s);
                coinBg.fillRect(halfCoin - p*s, -halfCoin + p*2*s, p*s, coinSize - p*4*s);

                // Inner border (darker inset)
                coinBg.fillStyle(0x5c4a0f, 0.6);
                const inset = p*3*s;
                coinBg.fillRect(-halfCoin + inset + p*s, -halfCoin + inset, coinSize - inset*2 - p*2*s, p*s);
                coinBg.fillRect(-halfCoin + inset + p*s, halfCoin - inset - p*s, coinSize - inset*2 - p*2*s, p*s);
                coinBg.fillRect(-halfCoin + inset, -halfCoin + inset + p*s, p*s, coinSize - inset*2 - p*2*s);
                coinBg.fillRect(halfCoin - inset - p*s, -halfCoin + inset + p*s, p*s, coinSize - inset*2 - p*2*s);

                this.verbCoin.add(coinBg);

                // Action buttons - positioned around coin
                const actionOffset = p*15*s; // 60px on desktop, 120px on mobile
                const halfAction = actionSize / 2;
                const actions = [
                    { name: 'Use', icon: 'hand', color: 0x4CAF50, x: -actionOffset, y: 0 },
                    { name: 'Look At', icon: 'eye', color: 0x2196F3, x: 0, y: -actionOffset },
                    { name: 'Talk To', icon: 'mouth', color: 0xFFC107, x: actionOffset, y: 0 }
                ];

                this.verbCoinActions = [];
                actions.forEach(action => {
                    const container = this.add.container(action.x, action.y);
                    const bg = this.add.graphics();

                    // Square button with pixel-art border
                    bg.fillStyle(0x3d2817, 0.9);
                    bg.fillRect(-halfAction, -halfAction, actionSize, actionSize);
                    // Border
                    bg.fillStyle(action.color, 0.8);
                    bg.fillRect(-halfAction, -halfAction, actionSize, p*s);
                    bg.fillRect(-halfAction, halfAction - p*s, actionSize, p*s);
                    bg.fillRect(-halfAction, -halfAction, p*s, actionSize);
                    bg.fillRect(halfAction - p*s, -halfAction, p*s, actionSize);

                    container.add(bg);

                    const icon = this.add.graphics();
                    this.drawVerbIcon(icon, action.icon, action.color);
                    container.add(icon);

                    this.verbCoinActions.push({
                        name: action.name,
                        bg: bg,
                        icon: icon,
                        color: action.color,
                        x: action.x,
                        y: action.y,
                        size: actionSize
                    });
                    this.verbCoin.add(container);
                });
            }

            drawVerbIcon(graphics, type, color) {
                graphics.clear();
                const p = 4; // Pixel size minimum
                const s = this.verbCoinScale;
                graphics.fillStyle(color, 1);

                // Icons using 4x4 pixel grid
                switch (type) {
                    case 'hand':
                        // Palm
                        graphics.fillRect(-p*2*s, -p*s, p*4*s, p*4*s);
                        // Fingers (4 rectangular fingers)
                        graphics.fillRect(-p*3*s, -p*3*s, p*s, p*3*s);
                        graphics.fillRect(-p*s, -p*4*s, p*s, p*4*s);
                        graphics.fillRect(p*s, -p*4*s, p*s, p*4*s);
                        graphics.fillRect(p*3*s, -p*3*s, p*s, p*3*s);
                        // Thumb
                        graphics.fillRect(-p*3*s, p*s, p*s, p*2*s);
                        break;
                    case 'eye':
                        // Eye shape (horizontal diamond/hexagon)
                        graphics.fillRect(-p*2*s, -p*s, p*4*s, p*2*s);
                        graphics.fillRect(-p*3*s, 0, p*s, p*s);
                        graphics.fillRect(p*2*s, 0, p*s, p*s);
                        graphics.fillRect(-p*s, -p*2*s, p*2*s, p*s);
                        graphics.fillRect(-p*s, p*s, p*2*s, p*s);
                        // Pupil (dark center)
                        graphics.fillStyle(0x000000, 1);
                        graphics.fillRect(-p*s, -p*s, p*2*s, p*2*s);
                        // Highlight
                        graphics.fillStyle(0xffffff, 1);
                        graphics.fillRect(-p*s, -p*s, p*s, p*s);
                        break;
                    case 'mouth':
                        // Speech bubble shape
                        graphics.fillRect(-p*2*s, -p*2*s, p*5*s, p*3*s);
                        graphics.fillRect(-p*3*s, -p*s, p*s, p*s);
                        // Speech bubble tail
                        graphics.fillRect(-p*2*s, p*s, p*s, p*s);
                        graphics.fillRect(-p*3*s, p*2*s, p*s, p*s);
                        // Lines inside (speech lines)
                        graphics.fillStyle(0x000000, 1);
                        graphics.fillRect(-p*s, -p*s, p*3*s, p*s);
                        graphics.fillRect(0, 0, p*2*s, p*s);
                        break;
                }
            }

            showVerbCoin(hotspot, x, y) {
                // Stop character movement when verb coin appears
                this.stopCharacterMovement();

                const { width, height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                this.activeHotspot = hotspot;
                this.verbCoinVisible = true;
                this.hoveredAction = null;

                const p = 4; // Pixel size minimum
                const s = this.verbCoinScale;
                const halfCoin = this.verbCoinSize / 2;
                // Don't let verb coin overlap the hotspot label text at bottom
                const textBuffer = this.isMobile ? p*20 : p*12;
                const maxY = (this.hotspotLabelY || (height - p*6)) - textBuffer - halfCoin;
                let coinX = Phaser.Math.Clamp(x, halfCoin + p*2, width - halfCoin - p*2) + scrollX;
                let coinY = Phaser.Math.Clamp(y, halfCoin + p*2, maxY) + scrollY;

                this.verbCoin.setPosition(coinX, coinY);
                this.hotspotLabel.setText(hotspot.name);

                const actionSize = this.verbActionSize;
                const halfAction = actionSize / 2;
                this.verbCoinActions.forEach(action => {
                    action.bg.clear();
                    // Square button with pixel-art border
                    action.bg.fillStyle(0x3d2817, 0.9);
                    action.bg.fillRect(-halfAction, -halfAction, actionSize, actionSize);
                    // Border
                    action.bg.fillStyle(action.color, 0.8);
                    action.bg.fillRect(-halfAction, -halfAction, actionSize, p*s);
                    action.bg.fillRect(-halfAction, halfAction - p*s, actionSize, p*s);
                    action.bg.fillRect(-halfAction, -halfAction, p*s, actionSize);
                    action.bg.fillRect(halfAction - p*s, -halfAction, p*s, actionSize);
                });

                this.verbCoin.setVisible(true);
                this.verbCoin.setScale(0.3);
                this.verbCoin.setAlpha(0);

                this.tweens.add({
                    targets: this.verbCoin,
                    scale: 1,
                    alpha: 1,
                    duration: 120,
                    ease: 'Back.out'
                });
            }

            hideVerbCoin() {
                this.verbCoinVisible = false;
                this.hoveredAction = null;
                this.hotspotLabel.setText('');

                this.tweens.add({
                    targets: this.verbCoin,
                    scale: 0.3,
                    alpha: 0,
                    duration: 80,
                    ease: 'Power2',
                    onComplete: () => {
                        this.verbCoin.setVisible(false);
                        this.activeHotspot = null;
                        this.activeInventoryItem = null;
                    }
                });
            }

            updateVerbCoinHover(pointer) {
                if (!this.verbCoinVisible) return;

                const coinX = this.verbCoin.x;
                const coinY = this.verbCoin.y;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;
                const pointerX = pointer.x + scrollX;
                const pointerY = pointer.y + scrollY;

                const p = 4; // Pixel size minimum
                const s = this.verbCoinScale;
                const actionSize = this.verbActionSize;
                const halfAction = actionSize / 2;
                const hoverSize = actionSize + p*2*s; // Slightly larger on hover
                const halfHover = hoverSize / 2;

                let foundHover = null;

                this.verbCoinActions.forEach(action => {
                    const actionX = coinX + action.x;
                    const actionY = coinY + action.y;

                    // Check if pointer is within square bounds
                    const inBounds = pointerX >= actionX - halfAction - p*s &&
                                     pointerX <= actionX + halfAction + p*s &&
                                     pointerY >= actionY - halfAction - p*s &&
                                     pointerY <= actionY + halfAction + p*s;

                    if (inBounds) {
                        foundHover = action.name;
                        action.bg.clear();
                        // Highlighted square button
                        action.bg.fillStyle(action.color, 0.4);
                        action.bg.fillRect(-halfHover, -halfHover, hoverSize, hoverSize);
                        // Border (brighter on hover)
                        action.bg.fillStyle(action.color, 1);
                        action.bg.fillRect(-halfHover, -halfHover, hoverSize, p*s);
                        action.bg.fillRect(-halfHover, halfHover - p*s, hoverSize, p*s);
                        action.bg.fillRect(-halfHover, -halfHover, p*s, hoverSize);
                        action.bg.fillRect(halfHover - p*s, -halfHover, p*s, hoverSize);
                    } else {
                        action.bg.clear();
                        // Normal square button
                        action.bg.fillStyle(0x3d2817, 0.9);
                        action.bg.fillRect(-halfAction, -halfAction, actionSize, actionSize);
                        // Border
                        action.bg.fillStyle(action.color, 0.8);
                        action.bg.fillRect(-halfAction, -halfAction, actionSize, p*s);
                        action.bg.fillRect(-halfAction, halfAction - p*s, actionSize, p*s);
                        action.bg.fillRect(-halfAction, -halfAction, p*s, actionSize);
                        action.bg.fillRect(halfAction - p*s, -halfAction, p*s, actionSize);
                    }
                });

                this.hoveredAction = foundHover;
                this.updateActionSentence(foundHover);
            }

            updateActionSentence(action) {
                let targetName = '';
                if (this.activeHotspot) targetName = this.activeHotspot.name;
                else if (this.activeInventoryItem) targetName = this.activeInventoryItem.name;

                if (!action || !targetName) {
                    this.hotspotLabel.setText(targetName);
                    return;
                }

                // Get custom verb labels from hotspot, or use defaults
                const verbLabels = this.activeHotspot?.verbLabels || {};
                let verbText = '';

                switch (action) {
                    case 'Use':
                        verbText = verbLabels.actionVerb || 'Use';
                        break;
                    case 'Look At':
                        verbText = verbLabels.lookVerb || 'Examine';
                        break;
                    case 'Talk To':
                        verbText = verbLabels.talkVerb || 'Talk to';
                        break;
                    default:
                        verbText = action;
                }

                this.hotspotLabel.setText(`${verbText} ${targetName}`);
            }

            showInventoryVerbCoin(item, x, y) {
                const { width, height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                this.activeInventoryItem = item;
                this.activeHotspot = null;
                this.verbCoinVisible = true;
                this.hoveredAction = null;

                this.verbCoin.setDepth(5000);

                const p = 4; // Pixel size minimum
                const s = this.verbCoinScale;
                const halfCoin = this.verbCoinSize / 2;
                // Don't let verb coin overlap the hotspot label text at bottom
                const textBuffer = this.isMobile ? p*20 : p*12;
                const maxY = (this.hotspotLabelY || (height - p*6)) - textBuffer - halfCoin;
                let coinX = Phaser.Math.Clamp(x, halfCoin + p*2, width - halfCoin - p*2) + scrollX;
                let coinY = Phaser.Math.Clamp(y, halfCoin + p*2, maxY) + scrollY;

                this.verbCoin.setPosition(coinX, coinY);
                this.hotspotLabel.setText(item.name);

                const actionSize = this.verbActionSize;
                const halfAction = actionSize / 2;
                this.verbCoinActions.forEach(action => {
                    action.bg.clear();
                    // Square button with pixel-art border
                    action.bg.fillStyle(0x3d2817, 0.9);
                    action.bg.fillRect(-halfAction, -halfAction, actionSize, actionSize);
                    // Border
                    action.bg.fillStyle(action.color, 0.8);
                    action.bg.fillRect(-halfAction, -halfAction, actionSize, p*s);
                    action.bg.fillRect(-halfAction, halfAction - p*s, actionSize, p*s);
                    action.bg.fillRect(-halfAction, -halfAction, p*s, actionSize);
                    action.bg.fillRect(halfAction - p*s, -halfAction, p*s, actionSize);
                });

                this.verbCoin.setVisible(true);
                this.verbCoin.setScale(0.3);
                this.verbCoin.setAlpha(0);

                this.tweens.add({
                    targets: this.verbCoin,
                    scale: 1,
                    alpha: 1,
                    duration: 120,
                    ease: 'Back.out'
                });
            }

            performInventoryItemAction(action, item) {
                if (action === 'Use') {
                    this.selectItem(item, this.pressedInventorySlot);
                } else if (action === 'Look At') {
                    this.showDialog(item.description || `It's a ${item.name}.`);
                } else if (action === 'Talk To') {
                    this.showDialog(`The ${item.name} isn't much of a conversationalist.`);
                }
            }

            // ========== CURSOR ==========

            createCrosshairCursor(width, height) {
                this.crosshairCursor = this.add.container(width / 2, height / 2);
                this.crosshairCursor.setDepth(9000);
                this.crosshairGraphics = this.add.graphics();
                this.drawCrosshair(0xffffff);
                this.crosshairCursor.add(this.crosshairGraphics);

                // Create arrow cursor (for edge zone transitions)
                this.arrowCursor = this.add.container(width / 2, height / 2);
                this.arrowCursor.setDepth(6000);
                this.arrowCursor.setVisible(false);
                this.arrowGraphics = this.add.graphics();
                this.arrowCursor.add(this.arrowGraphics);

                // Larger text on mobile for readability
                const fontSize = this.isMobile ? '24px' : '14px';
                const strokeThickness = this.isMobile ? 5 : 3;
                const bottomPadding = this.isMobile ? 45 : 25;
                this.hotspotLabelY = height - bottomPadding;

                this.hotspotLabel = this.add.text(width / 2, this.hotspotLabelY, '', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: fontSize,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: strokeThickness,
                    align: 'center'
                }).setOrigin(0.5).setDepth(6000);
            }

            drawCrosshair(color) {
                this.crosshairGraphics.clear();
                // Larger crosshair on mobile
                const scale = this.isMobile ? 2 : 1;
                const lineWidth = 4 * scale;
                const outer = 20 * scale;
                const inner = 8 * scale;
                this.crosshairGraphics.lineStyle(lineWidth, color, 1);
                this.crosshairGraphics.moveTo(-outer, 0); this.crosshairGraphics.lineTo(-inner, 0);
                this.crosshairGraphics.moveTo(inner, 0); this.crosshairGraphics.lineTo(outer, 0);
                this.crosshairGraphics.moveTo(0, -outer); this.crosshairGraphics.lineTo(0, -inner);
                this.crosshairGraphics.moveTo(0, inner); this.crosshairGraphics.lineTo(0, outer);
                this.crosshairGraphics.strokePath();
            }

            // Draw pixelated arrow cursor for edge zones
            drawArrowCursor(direction) {
                this.arrowGraphics.clear();
                const scale = this.isMobile ? 2 : 1;
                const p = 4 * scale; // Pixel size for pixelated look

                this.arrowGraphics.fillStyle(0xff0000, 1);

                if (direction === 'left') {
                    // Pixelated left-pointing arrow
                    // Arrow tip
                    this.arrowGraphics.fillRect(-6 * p, -1 * p, p, 2 * p);
                    this.arrowGraphics.fillRect(-5 * p, -2 * p, p, 4 * p);
                    this.arrowGraphics.fillRect(-4 * p, -3 * p, p, 6 * p);
                    this.arrowGraphics.fillRect(-3 * p, -4 * p, p, 8 * p);
                    // Arrow shaft
                    this.arrowGraphics.fillRect(-2 * p, -2 * p, 6 * p, 4 * p);
                } else if (direction === 'up') {
                    // Pixelated up-pointing arrow
                    // Arrow tip
                    this.arrowGraphics.fillRect(-1 * p, -6 * p, 2 * p, p);
                    this.arrowGraphics.fillRect(-2 * p, -5 * p, 4 * p, p);
                    this.arrowGraphics.fillRect(-3 * p, -4 * p, 6 * p, p);
                    this.arrowGraphics.fillRect(-4 * p, -3 * p, 8 * p, p);
                    // Arrow shaft
                    this.arrowGraphics.fillRect(-2 * p, -2 * p, 4 * p, 6 * p);
                } else {
                    // Pixelated right-pointing arrow
                    // Arrow tip
                    this.arrowGraphics.fillRect(5 * p, -1 * p, p, 2 * p);
                    this.arrowGraphics.fillRect(4 * p, -2 * p, p, 4 * p);
                    this.arrowGraphics.fillRect(3 * p, -3 * p, p, 6 * p);
                    this.arrowGraphics.fillRect(2 * p, -4 * p, p, 8 * p);
                    // Arrow shaft
                    this.arrowGraphics.fillRect(-4 * p, -2 * p, 6 * p, 4 * p);
                }

                this.arrowDirection = direction;
            }

            // Show arrow cursor (hide crosshair)
            showArrowCursor(direction) {
                this.drawArrowCursor(direction);
                this.crosshairCursor.setVisible(false);
                this.arrowCursor.setVisible(true);
            }

            // Hide arrow cursor (show crosshair)
            hideArrowCursor() {
                this.arrowCursor.setVisible(false);
                if (!this.selectedItem) {
                    this.crosshairCursor.setVisible(true);
                }
                this.arrowDirection = null;
            }

            setCrosshairHover(hotspot) {
                this.currentHoveredHotspot = hotspot;
                const selectedItem = this.selectedItem;

                if (hotspot) {
                    this.drawCrosshair(0xff0000);
                    if (selectedItem) {
                        this.hotspotLabel.setText(`Use ${selectedItem.name} on ${hotspot.name}`);
                        // Show red outline on item cursor when over a hotspot
                        this.showItemCursorHighlight();
                    } else {
                        this.hotspotLabel.setText(hotspot.name);
                        this.hideItemCursorHighlight();
                    }
                } else {
                    this.drawCrosshair(0xffffff);
                    this.hideItemCursorHighlight();
                    if (selectedItem) {
                        this.hotspotLabel.setText(selectedItem.name);
                    } else {
                        this.hotspotLabel.setText('');
                    }
                }
            }

            showItemCursorHighlight() {
                if (!this.itemCursorHighlight) return;
                this.itemCursorHighlight.setVisible(true);
            }

            hideItemCursorHighlight() {
                if (!this.itemCursorHighlight) return;
                this.itemCursorHighlight.setVisible(false);
            }

            createItemCursor() {
                this.itemCursor = this.add.container(0, 0);
                this.itemCursor.setDepth(5000);
                this.itemCursor.setVisible(false);
            }

            // ========== INVENTORY ==========

            createInventoryUI(width, height) {
                this.inventoryPanel = this.add.container(width / 2, height / 2);
                this.inventoryPanel.setVisible(false);
                this.inventoryPanel.setDepth(2500);

                const panelWidth = width - 100;
                const panelHeight = height - 120;

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

                // Slots (5x3 grid)
                const slotSize = 80, slotPadding = 15;
                const gridCols = 5, gridRows = 3;
                const gridWidth = gridCols * (slotSize + slotPadding) - slotPadding;
                const gridHeight = gridRows * (slotSize + slotPadding) - slotPadding;
                const startX = -gridWidth / 2 + slotSize / 2;
                const startY = -gridHeight / 2 + slotSize / 2 + 25;

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

                this.selectedSlotHighlight = this.add.graphics();
                this.selectedSlotHighlight.setDepth(2501);
                this.selectedSlotHighlight.setVisible(false);

                // Mobile inventory button (top right corner)
                if (this.isMobile) {
                    const btnSize = 90;
                    this.inventoryButtonArea = { x: width - btnSize/2 - 15, y: btnSize/2 + 15, size: btnSize };

                    this.inventoryButton = this.add.container(this.inventoryButtonArea.x, this.inventoryButtonArea.y);
                    this.inventoryButton.setDepth(4000);
                    this.inventoryButton.setScrollFactor(0);

                    // Button background
                    const btnBg = this.add.graphics();
                    btnBg.fillStyle(0x4a3728, 0.9);
                    btnBg.fillRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 12);
                    btnBg.lineStyle(4, 0x8b6914, 1);
                    btnBg.strokeRoundedRect(-btnSize/2, -btnSize/2, btnSize, btnSize, 12);
                    this.inventoryButton.add(btnBg);

                    // Backpack icon (scaled up)
                    const icon = this.add.graphics();
                    icon.fillStyle(0xc9a227, 1);
                    // Bag body
                    icon.fillRoundedRect(-24, -10, 48, 36, 8);
                    // Bag flap
                    icon.fillRoundedRect(-18, -22, 36, 16, 5);
                    // Bag clasp
                    icon.fillStyle(0x8b6914, 1);
                    icon.fillCircle(0, -8, 7);
                    icon.fillStyle(0x4a3728, 1);
                    icon.fillCircle(0, -8, 3);
                    this.inventoryButton.add(icon);

                }
            }

            toggleInventory() {
                this.inventoryOpen = !this.inventoryOpen;

                if (this.inventoryOpen) {
                    // Stop character movement when inventory opens
                    this.stopCharacterMovement();
                    this.setCrosshairHover(null);

                    const { width, height } = this.scale;
                    const scrollX = this.cameras.main.scrollX || 0;
                    const scrollY = this.cameras.main.scrollY || 0;
                    this.inventoryPanel.setPosition(scrollX + width / 2, scrollY + height / 2);

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
                } else {
                    this.selectedSlotHighlight.setVisible(false);
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

                    this.drawCrosshair(0xffffff);
                    this.hotspotLabel.setText('');

                    this.tweens.add({
                        targets: this.inventoryPanel,
                        scale: 0.8,
                        alpha: 0,
                        duration: 100,
                        ease: 'Power2',
                        onComplete: () => this.inventoryPanel.setVisible(false)
                    });
                }
            }

            checkItemOutsideInventory(pointer) {
                const { width, height } = this.scale;
                const panelWidth = width - 100;
                const panelHeight = height - 120;
                const panelLeft = (width - panelWidth) / 2;
                const panelRight = panelLeft + panelWidth;
                const panelTop = (height - panelHeight) / 2;
                const panelBottom = panelTop + panelHeight;

                const isOutside = pointer.x < panelLeft || pointer.x > panelRight ||
                                  pointer.y < panelTop || pointer.y > panelBottom;

                if (isOutside) {
                    if (!this.itemOutsideInventoryTimer) {
                        this.itemOutsideInventoryTimer = this.time.delayedCall(100, () => {
                            if (this.inventoryOpen && this.selectedItem) this.toggleInventory();
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

            addToInventory(item) {
                // Prevent duplicates
                if (this.hasItem(item.id)) {
                    console.log('[' + this.scene.key + '] Item already in inventory:', item.id);
                    return false;
                }

                // Add to TSH.State (stores just the ID)
                TSH.State.addItem(item.id);

                console.log('[' + this.scene.key + '] Added to inventory:', item.id, 'Total items:', TSH.State.getInventory().length);

                this.addItemToSlot(item);

                if (this.cache.audio.exists('pickupSound')) {
                    this.sound.play('pickupSound', { volume: 0.7 });
                }

                return true;
            }

            hasItem(itemId) {
                return TSH.State.hasItem(itemId);
            }

            removeFromInventory(itemId) {
                if (!TSH.State.hasItem(itemId)) return false;

                TSH.State.removeItem(itemId);

                const slot = this.inventorySlots.find(s => s.item && s.item.id === itemId);
                if (slot) {
                    slot.display.removeAll(true);
                    slot.item = null;
                }

                return true;
            }

            tryCombineItems(itemA, itemB) {
                // itemA = selected item (cursor), itemB = clicked item (in slot)
                console.log('[Inventory] Trying to combine:', itemA.id, '+', itemB.id);

                // Try the combination
                const result = TSH.Combinations.tryCombine(itemA.id, itemB.id);

                if (!result) {
                    // No combination exists
                    this.showDialog(`I can't combine the ${itemA.name} with the ${itemB.name}.`);
                    this.deselectItem();
                    return;
                }

                if (!result.success) {
                    // Combination exists but condition not met
                    this.showDialog(result.dialogue || "Something's missing...");
                    this.deselectItem();
                    return;
                }

                // Find slot containing itemB (the clicked item)
                const slotB = this.inventorySlots.find(s => s.item && s.item.id === itemB.id);

                // Determine what happens to each item
                const itemAConsumed = result.consumes.includes(itemA.id);
                const itemBConsumed = result.consumes.includes(itemB.id);
                const producedItem = result.produces ? TSH.Items[result.produces] : null;

                // Update game state
                for (const consumedId of result.consumes) {
                    TSH.State.removeItem(consumedId);
                }
                if (result.produces) {
                    TSH.State.addItem(result.produces);
                }
                if (result.setFlags) {
                    for (const [path, value] of Object.entries(result.setFlags)) {
                        TSH.State.setFlag(path, value);
                    }
                }

                // Update UI in-place
                if (itemAConsumed && itemBConsumed) {
                    // Both consumed: clear cursor, put produced item in slotB
                    this.deselectItem();
                    if (slotB && producedItem) {
                        this.updateSlotItem(slotB, producedItem);
                    }
                } else if (itemAConsumed) {
                    // Selected item consumed: cursor becomes produced item
                    if (producedItem) {
                        this.selectedItem = producedItem;
                        this.updateItemCursor(producedItem);
                    } else {
                        this.deselectItem();
                    }
                } else if (itemBConsumed) {
                    // Clicked item consumed: its slot becomes produced item, cursor stays
                    if (slotB && producedItem) {
                        this.updateSlotItem(slotB, producedItem);
                    } else if (slotB) {
                        // Just clear the slot
                        slotB.display.removeAll(true);
                        slotB.item = null;
                    }
                }
                // If neither consumed, both stay where they are (produced goes to new slot)

                // Show success dialogue
                this.showDialog(result.dialogue);

                console.log('[Inventory] Combination successful! Produced:', result.produces);
            }

            updateSlotItem(slot, newItem) {
                // Update a slot's item in-place (preserves slot position)
                slot.display.removeAll(true);
                slot.item = newItem;

                const itemSize = 50;
                const itemGraphic = this.add.graphics();
                itemGraphic.fillStyle(newItem.color || 0xffd700, 1);
                itemGraphic.fillRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                itemGraphic.lineStyle(2, 0x000000, 0.3);
                itemGraphic.strokeRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                slot.display.add(itemGraphic);

                const slotSize = slot.size;
                const hitArea = this.add.rectangle(0, 0, slotSize - 4, slotSize - 4, 0x000000, 0).setInteractive();

                hitArea.on('pointerdown', (pointer) => {
                    if (!pointer.leftButtonDown()) return;
                    this.clickedUI = true;
                    this.pressedInventoryItem = newItem;
                    this.pressedInventorySlot = slot;

                    if (this.inventoryItemPressTimer) this.inventoryItemPressTimer.remove();
                    this.inventoryItemPressTimer = this.time.delayedCall(this.verbCoinDelay, () => {
                        this.showInventoryVerbCoin(newItem, pointer.x, pointer.y);
                    });
                });

                hitArea.on('pointerup', () => {
                    if (!this.verbCoinVisible && this.pressedInventoryItem && this.pressedInventoryItem.id === newItem.id) {
                        if (this.selectedItem && this.selectedItem.id !== newItem.id) {
                            this.tryCombineItems(this.selectedItem, newItem);
                        } else {
                            this.selectItem(newItem, slot);
                        }
                        this.pressedInventoryItem = null;
                        this.pressedInventorySlot = null;
                    }
                });

                hitArea.on('pointerover', () => {
                    this.drawCrosshair(0xff0000);
                    this.hotspotLabel.setText(newItem.name);
                });

                hitArea.on('pointerout', () => {
                    this.drawCrosshair(0xffffff);
                    this.hotspotLabel.setText('');
                });

                slot.display.add(hitArea);
            }

            updateItemCursor(item) {
                // Update the cursor to show a new item (when selected item transforms)
                this.itemCursor.removeAll(true);

                const cursorBg = this.add.graphics();
                cursorBg.fillStyle(item.color || 0xffd700, 1);
                cursorBg.fillRoundedRect(-25, -25, 50, 50, 8);
                cursorBg.lineStyle(2, 0xffffff, 0.8);
                cursorBg.strokeRoundedRect(-25, -25, 50, 50, 8);
                this.itemCursor.add(cursorBg);

                this.itemCursorHighlight = this.add.graphics();
                this.itemCursorHighlight.lineStyle(4, 0xff0000, 1);
                this.itemCursorHighlight.strokeRoundedRect(-29, -29, 58, 58, 10);
                this.itemCursorHighlight.setVisible(false);
                this.itemCursor.add(this.itemCursorHighlight);

                this.hotspotLabel.setText(item.name);
            }

            refreshInventoryUI() {
                // Clear all slots
                this.inventorySlots.forEach(slot => {
                    slot.display.removeAll(true);
                    slot.item = null;
                });

                // Rebuild from state
                const items = this.getInventoryItems();
                items.forEach(item => {
                    const emptySlot = this.inventorySlots.find(slot => slot.item === null);
                    if (emptySlot) {
                        this.addItemToSlot(item, emptySlot);
                    }
                });
            }

            addItemToSlot(item, slot = null) {
                // Find an empty slot if none provided
                if (!slot) {
                    slot = this.inventorySlots.find(s => s.item === null);
                    if (!slot) {
                        console.warn('[Inventory] No empty slot for item:', item.id);
                        return false;
                    }
                }

                slot.item = item;
                slot.display.removeAll(true);

                const itemSize = 50;
                const itemGraphic = this.add.graphics();
                itemGraphic.fillStyle(item.color || 0xffd700, 1);
                itemGraphic.fillRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                itemGraphic.lineStyle(2, 0x000000, 0.3);
                itemGraphic.strokeRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                slot.display.add(itemGraphic);

                const slotSize = slot.size;
                const hitArea = this.add.rectangle(0, 0, slotSize - 4, slotSize - 4, 0x000000, 0).setInteractive();

                hitArea.on('pointerdown', (pointer) => {
                    if (!pointer.leftButtonDown()) return;
                    this.clickedUI = true;
                    this.pressedInventoryItem = item;
                    this.pressedInventorySlot = slot;

                    if (this.inventoryItemPressTimer) this.inventoryItemPressTimer.remove();
                    this.inventoryItemPressTimer = this.time.delayedCall(this.verbCoinDelay, () => {
                        this.showInventoryVerbCoin(item, pointer.x, pointer.y);
                    });
                });

                hitArea.on('pointerup', () => {
                    if (!this.verbCoinVisible && this.pressedInventoryItem && this.pressedInventoryItem.id === item.id) {
                        // If another item is selected, try to combine
                        if (this.selectedItem && this.selectedItem.id !== item.id) {
                            this.tryCombineItems(this.selectedItem, item);
                        } else {
                            this.selectItem(item, slot);
                        }
                        this.pressedInventoryItem = null;
                        this.pressedInventorySlot = null;
                    }
                });

                hitArea.on('pointerover', () => {
                    this.drawCrosshair(0xff0000);
                    this.hotspotLabel.setText(item.name);
                });

                hitArea.on('pointerout', () => {
                    this.drawCrosshair(0xffffff);
                    this.hotspotLabel.setText('');
                });

                slot.display.add(hitArea);
            }

            selectItem(item, slot) {
                // Toggle off if clicking the same item
                if (this.selectedItem && this.selectedItem.id === item.id) {
                    this.deselectItem();
                    return;
                }

                this.selectedItem = item;

                this.crosshairCursor.setVisible(false);

                this.itemCursor.removeAll(true);
                const cursorBg = this.add.graphics();
                cursorBg.fillStyle(item.color || 0xffd700, 1);
                cursorBg.fillRoundedRect(-25, -25, 50, 50, 8);
                cursorBg.lineStyle(2, 0xffffff, 0.8);
                cursorBg.strokeRoundedRect(-25, -25, 50, 50, 8);
                this.itemCursor.add(cursorBg);

                // Red outline highlight (shown when over hotspot)
                this.itemCursorHighlight = this.add.graphics();
                this.itemCursorHighlight.lineStyle(4, 0xff0000, 1);
                this.itemCursorHighlight.strokeRoundedRect(-29, -29, 58, 58, 10);
                this.itemCursorHighlight.setVisible(false);
                this.itemCursor.add(this.itemCursorHighlight);

                this.itemCursor.setVisible(true);

                this.hotspotLabel.setText(item.name);
            }

            deselectItem() {
                this.selectedItem = null;

                this.itemCursor.setVisible(false);
                this.itemCursor.removeAll(true);
                this.selectedSlotHighlight.setVisible(false);
                this.crosshairCursor.setVisible(true);
                this.hotspotLabel.setText('');
                this.hideItemCursorHighlight();
            }

            // ========== DIALOGUE ==========

            createDialogUI(width, height) {
                this.speechBubble = this.add.container(0, 0);
                this.speechBubble.setDepth(7000);
                this.speechBubble.setVisible(false);

                // Larger text on mobile for readability
                const fontSize = this.isMobile ? '24px' : '14px';
                const strokeThickness = this.isMobile ? 5 : 3;
                const lineSpacing = this.isMobile ? 12 : 8;

                this.dialogText = this.add.text(0, 0, '', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: fontSize,
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: width * 0.7 },
                    lineSpacing: lineSpacing,
                    stroke: '#000000',
                    strokeThickness: strokeThickness
                }).setOrigin(0.5);
                this.speechBubble.add(this.dialogText);
            }

            // Show dialog text. Returns a Promise for async/await support.
            // Also supports legacy callback pattern via onComplete parameter.
            showDialog(text, onComplete = null) {
                return new Promise((resolve) => {
                    if (this.dialogTimer) this.dialogTimer.remove();
                    this.dialogQueue = [];

                    // Store both callback and resolver
                    this.dialogCallback = () => {
                        if (onComplete) onComplete();
                        resolve();
                    };

                    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

                    if (sentences.length > 1) {
                        this.dialogQueue = sentences.slice(1).map(s => s.trim());
                        this.startDialogSequence();
                        this.showSingleDialog(sentences[0].trim(), true);
                    } else {
                        this.showSingleDialog(text, false);
                    }
                });
            }

            startDialogSequence() {
                this.dialogActive = true;
                this.dialogSkipReady = false;
                if (this.walkTween) { this.walkTween.stop(); this.walkTween = null; }
                this.isWalking = false;
                this.stopWalkAnimation();
                if (this.crosshairCursor) this.crosshairCursor.setVisible(false);
                this.time.delayedCall(200, () => { this.dialogSkipReady = true; });
            }

            endDialogSequence() {
                this.dialogActive = false;
                this.dialogSkipReady = false;
                if (this.crosshairCursor && !this.selectedItem) this.crosshairCursor.setVisible(true);
            }

            skipToNextDialog() {
                if (!this.dialogActive || !this.dialogSkipReady) return;
                if (this.dialogTimer) { this.dialogTimer.remove(); this.dialogTimer = null; }

                if (this.dialogQueue.length > 0) {
                    this.dialogSkipReady = false;
                    this.showSingleDialog(this.dialogQueue.shift(), true);
                    this.time.delayedCall(150, () => { this.dialogSkipReady = true; });
                } else {
                    this.speechBubble.setVisible(false);
                    this.dialogText.setText('');
                    this.endDialogSequence();
                    // Call callback if provided
                    if (this.dialogCallback) {
                        const callback = this.dialogCallback;
                        this.dialogCallback = null;
                        callback();
                    }
                }
            }

            showSingleDialog(text, isSequence = false) {
                if (isSequence && !this.dialogActive) {
                    this.startDialogSequence();
                }

                this.dialogText.setText(text);
                this.updateSpeechBubblePosition();
                this.speechBubble.setVisible(true);

                const displayTime = Math.max(1500, text.length * 40);
                this.dialogTimer = this.time.delayedCall(displayTime, () => {
                    if (this.dialogQueue.length > 0) {
                        this.showSingleDialog(this.dialogQueue.shift(), true);
                    } else {
                        this.speechBubble.setVisible(false);
                        this.dialogText.setText('');
                        if (isSequence) this.endDialogSequence();
                        // Call callback if provided
                        if (this.dialogCallback) {
                            const callback = this.dialogCallback;
                            this.dialogCallback = null;
                            callback();
                        }
                    }
                });
            }

            updateSpeechBubblePosition() {
                if (!this.speechBubble || !this.player) return;

                const { width } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;

                let textX = this.player.x;
                let textY = this.player.y - 310;

                const halfWidth = this.dialogText.width / 2;
                const camLeft = scrollX + halfWidth + 10;
                const camRight = scrollX + width - halfWidth - 10;
                textX = Phaser.Math.Clamp(textX, camLeft, camRight);

                this.speechBubble.setPosition(textX, textY);
            }

            // ========== CONVERSATION SYSTEM (NPC Dialogue Trees) ==========

            createConversationUI(width, height) {
                // Dialogue options panel (bottom-left)
                this.dialogueOptionsUI = this.add.container(0, 0);
                this.dialogueOptionsUI.setDepth(8000);
                this.dialogueOptionsUI.setScrollFactor(0);
                this.dialogueOptionsUI.setVisible(false);

                // NPC speech bubble (positioned above NPC)
                this.npcSpeechBubble = this.add.container(0, 0);
                this.npcSpeechBubble.setDepth(7000);
                this.npcSpeechBubble.setVisible(false);

                const fontSize = this.isMobile ? '22px' : '13px';
                const strokeThickness = this.isMobile ? 4 : 3;

                this.npcDialogText = this.add.text(0, 0, '', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: fontSize,
                    color: '#aaffaa',
                    align: 'center',
                    wordWrap: { width: width * 0.6 },
                    lineSpacing: this.isMobile ? 10 : 6,
                    stroke: '#000000',
                    strokeThickness: strokeThickness
                }).setOrigin(0.5);
                this.npcSpeechBubble.add(this.npcDialogText);
            }

            enterConversation(npcData, dialogueTree) {
                console.log('[Conversation] enterConversation called');
                console.log('[Conversation] npcData:', npcData);
                console.log('[Conversation] dialogueTree:', dialogueTree);

                this.conversationActive = true;
                this.conversationNPC = npcData;
                this.conversationData = dialogueTree;
                this.conversationState = 'start';

                // Freeze movement and hide normal UI
                this.stopCharacterMovement();
                if (this.verbCoin) this.verbCoin.setVisible(false);
                this.verbCoinVisible = false;

                // Keep crosshair visible during conversation
                if (this.crosshairCursor) this.crosshairCursor.setVisible(true);
                this.drawCrosshair(0xffffff); // White cursor

                // Show initial dialogue options
                console.log('[Conversation] Calling showDialogueOptions with start');
                this.showDialogueOptions('start');
            }

            exitConversation() {
                this.conversationActive = false;
                this.conversationNPC = null;
                this.conversationData = null;
                this.conversationState = null;
                this.awaitingNPCResponse = false;

                // Hide conversation UI
                this.dialogueOptionsUI.setVisible(false);
                this.npcSpeechBubble.setVisible(false);
                this.speechBubble.setVisible(false);

                // Clear dialogue option texts
                this.dialogueOptionTexts.forEach(t => t.destroy());
                this.dialogueOptionTexts = [];

                // Clear hotspot label
                if (this.hotspotLabel) this.hotspotLabel.setText('');

                // Restore normal cursor state
                if (this.crosshairCursor && !this.selectedItem) {
                    this.crosshairCursor.setVisible(true);
                    this.drawCrosshair(0xffffff);
                }
            }

            showDialogueOptions(nodeKey) {
                console.log('[Conversation] showDialogueOptions called with nodeKey:', nodeKey);
                const { width, height } = this.scale;
                console.log('[Conversation] conversationData:', this.conversationData);

                // Clear previous options
                this.dialogueOptionTexts.forEach(t => t.destroy());
                this.dialogueOptionTexts = [];
                this.dialogueOptionsUI.removeAll(true);

                const node = this.conversationData[nodeKey];
                console.log('[Conversation] node found:', node);
                if (!node || !node.options) {
                    console.log('[Conversation] No node or options, exiting');
                    this.exitConversation();
                    return;
                }

                // Filter out options that shouldn't show
                const visibleOptions = node.options.filter(opt => {
                    if (opt.condition) {
                        return opt.condition(this);
                    }
                    return true;
                });

                console.log('[Conversation] visibleOptions:', visibleOptions.length, visibleOptions);
                if (visibleOptions.length === 0) {
                    console.log('[Conversation] No visible options, exiting');
                    this.exitConversation();
                    return;
                }

                // Panel background
                const panelPadding = this.isMobile ? 20 : 15;
                const optionHeight = this.isMobile ? 50 : 32;
                const panelWidth = this.isMobile ? width * 0.85 : width * 0.45;
                const panelHeight = panelPadding * 2 + visibleOptions.length * optionHeight;
                const panelX = panelPadding;
                const panelY = height - panelHeight - panelPadding;

                const bg = this.add.graphics();
                bg.fillStyle(0x1a1a2a, 0.95);
                bg.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
                bg.lineStyle(2, 0x4a4a6a, 1);
                bg.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
                bg.setScrollFactor(0);
                this.dialogueOptionsUI.add(bg);

                // Add options as clickable text
                const fontSize = this.isMobile ? '18px' : '11px';
                visibleOptions.forEach((opt, index) => {
                    const optY = panelY + panelPadding + index * optionHeight + optionHeight / 2;
                    const optX = panelX + panelPadding + 15;

                    // Bullet point
                    const bullet = this.add.text(panelX + panelPadding, optY, '>', {
                        fontFamily: '"Press Start 2P", cursive',
                        fontSize: fontSize,
                        color: '#ffcc00'
                    }).setOrigin(0, 0.5).setScrollFactor(0);
                    this.dialogueOptionsUI.add(bullet);

                    const optText = this.add.text(optX, optY, opt.text, {
                        fontFamily: '"Press Start 2P", cursive',
                        fontSize: fontSize,
                        color: opt.used ? '#666666' : '#ffffff',
                        wordWrap: { width: panelWidth - panelPadding * 2 - 20 }
                    }).setOrigin(0, 0.5).setScrollFactor(0);

                    optText.setInteractive();

                    optText.on('pointerover', () => {
                        if (!opt.used) optText.setColor('#ffcc00');
                        bullet.setColor('#ffffff');
                        this.drawCrosshair(0xff0000); // Red cursor on hover
                    });

                    optText.on('pointerout', () => {
                        optText.setColor(opt.used ? '#666666' : '#ffffff');
                        bullet.setColor('#ffcc00');
                        this.drawCrosshair(0xffffff); // White cursor
                    });

                    optText.on('pointerdown', () => {
                        // Set flag to prevent the global click handler from immediately skipping
                        this.justClickedDialogueOption = true;
                        this.handleDialogueChoice(opt, nodeKey);
                        // Clear the flag after a short delay
                        this.time.delayedCall(100, () => {
                            this.justClickedDialogueOption = false;
                        });
                    });

                    this.dialogueOptionTexts.push(optText);
                    this.dialogueOptionTexts.push(bullet);
                    this.dialogueOptionsUI.add(optText);
                });

                // Position at (0,0) since scrollFactor is 0 (screen-fixed)
                this.dialogueOptionsUI.setPosition(0, 0);
                this.dialogueOptionsUI.setVisible(true);
                console.log('[Conversation] dialogueOptionsUI visible:', this.dialogueOptionsUI.visible);
                console.log('[Conversation] dialogueOptionsUI position:', this.dialogueOptionsUI.x, this.dialogueOptionsUI.y);
            }

            handleDialogueChoice(option, currentNode) {
                console.log('[Conversation] handleDialogueChoice called');
                console.log('[Conversation] option:', option);
                console.log('[Conversation] option.heroLine:', option.heroLine);
                console.log('[Conversation] currentNode:', currentNode);

                // Hide options while dialogue plays
                this.dialogueOptionsUI.setVisible(false);
                this.awaitingNPCResponse = true;

                // Mark option as used if it has a flag
                if (option.setFlag) {
                    this.setFlag(option.setFlag, true);
                }
                option.used = true;

                // Hero says their line
                console.log('[Conversation] About to call showConversationLine with heroLine:', option.heroLine);
                this.showConversationLine(option.heroLine, 'hero', () => {
                    // Then NPC responds
                    if (option.npcResponse) {
                        this.showConversationLine(option.npcResponse, 'npc', () => {
                            this.awaitingNPCResponse = false;
                            // Move to next node or show options again
                            if (option.exit) {
                                this.exitConversation();
                            } else if (option.nextNode) {
                                this.conversationState = option.nextNode;
                                this.showDialogueOptions(option.nextNode);
                            } else {
                                // Stay on current node
                                this.showDialogueOptions(currentNode);
                            }
                        });
                    } else {
                        this.awaitingNPCResponse = false;
                        if (option.exit) {
                            this.exitConversation();
                        } else if (option.nextNode) {
                            this.conversationState = option.nextNode;
                            this.showDialogueOptions(option.nextNode);
                        } else {
                            this.showDialogueOptions(currentNode);
                        }
                    }
                });
            }

            showConversationLine(text, speaker, onComplete) {
                const { width } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;

                console.log('[Conversation] showConversationLine called:', { text, speaker });

                // Store callback for skip functionality
                this.conversationLineCallback = onComplete;
                this.conversationLineSpeaker = speaker;

                if (speaker === 'hero') {
                    // Use existing speech bubble for hero
                    console.log('[Conversation] Showing hero line:', text);
                    console.log('[Conversation] speechBubble:', this.speechBubble);
                    console.log('[Conversation] dialogText:', this.dialogText);
                    this.dialogText.setText(text);
                    this.updateSpeechBubblePosition();
                    this.speechBubble.setVisible(true);
                    this.npcSpeechBubble.setVisible(false);
                    console.log('[Conversation] Hero speech bubble visible:', this.speechBubble.visible);
                    console.log('[Conversation] Hero speech bubble position:', this.speechBubble.x, this.speechBubble.y);
                } else {
                    // Use NPC speech bubble
                    this.npcDialogText.setText(text);

                    // Position above NPC (use conversationNPC position)
                    let npcX = this.conversationNPC.x;
                    let npcY = this.conversationNPC.y - 280;

                    const halfWidth = this.npcDialogText.width / 2;
                    const camLeft = scrollX + halfWidth + 10;
                    const camRight = scrollX + width - halfWidth - 10;
                    npcX = Phaser.Math.Clamp(npcX, camLeft, camRight);

                    this.npcSpeechBubble.setPosition(npcX, npcY);
                    this.npcSpeechBubble.setVisible(true);
                    this.speechBubble.setVisible(false);
                }

                // Auto-advance after delay
                const displayTime = Math.max(1500, text.length * 45);
                this.conversationLineTimer = this.time.delayedCall(displayTime, () => {
                    this.finishConversationLine();
                });
            }

            finishConversationLine() {
                if (this.conversationLineTimer) {
                    this.conversationLineTimer.remove();
                    this.conversationLineTimer = null;
                }

                if (this.conversationLineSpeaker === 'hero') {
                    this.speechBubble.setVisible(false);
                } else {
                    this.npcSpeechBubble.setVisible(false);
                }

                const callback = this.conversationLineCallback;
                this.conversationLineCallback = null;
                this.conversationLineSpeaker = null;

                if (callback) callback();
            }

            skipConversationLine() {
                if (this.conversationActive && this.conversationLineCallback) {
                    this.finishConversationLine();
                }
            }

            // ========== SCENE TRANSITION ==========

            transitionToScene(targetScene, spawnPoint) {
                console.log('[' + this.scene.key + '] Transitioning to', targetScene, 'with state:', {
                    inventory: TSH.State.getInventory(),
                    currentRoom: TSH.State.getCurrentRoom()
                });

                // Store spawn point and update room in TSH.State
                TSH.State._spawnPoint = spawnPoint;
                TSH.State.setCurrentRoom(targetScene);

                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    // Prefer RoomScene for data-driven rooms, fall back to legacy scenes
                    if (TSH.Rooms && TSH.Rooms[targetScene]) {
                        this.scene.start('RoomScene', { roomId: targetScene });
                    } else {
                        this.scene.start(targetScene);
                    }
                });
            }

            // ========== UPDATE ==========

            update() {
                const pointer = this.input.activePointer;
                const { width, height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                // Update crosshair position
                if (this.crosshairCursor && this.crosshairCursor.visible) {
                    this.crosshairCursor.setPosition(pointer.x + scrollX, pointer.y + scrollY);
                }

                // Update arrow cursor position
                if (this.arrowCursor && this.arrowCursor.visible) {
                    this.arrowCursor.setPosition(pointer.x + scrollX, pointer.y + scrollY);
                }

                // Update item cursor position
                const selectedItem = this.selectedItem;
                if (selectedItem && this.itemCursor && this.itemCursor.visible) {
                    this.itemCursor.setPosition(pointer.x + scrollX + 20, pointer.y + scrollY + 20);
                }

                // Update hotspot label position - follows cursor/verb coin/item cursor
                if (this.hotspotLabel) {
                    let labelX, labelY;
                    const p = 4; // Pixel size minimum
                    const labelOffset = this.isMobile ? p*20 : p*12;

                    if (this.verbCoinVisible && this.verbCoin) {
                        // Position above verb coin
                        labelX = this.verbCoin.x;
                        labelY = this.verbCoin.y - (this.verbCoinSize / 2) - labelOffset;
                    } else if (selectedItem && this.itemCursor && this.itemCursor.visible) {
                        // Position above item cursor
                        labelX = pointer.x + scrollX + 20;
                        labelY = pointer.y + scrollY - labelOffset;
                    } else {
                        // Position above crosshair cursor
                        labelX = pointer.x + scrollX;
                        labelY = pointer.y + scrollY - labelOffset;
                    }

                    // Keep label on screen
                    const halfWidth = this.hotspotLabel.width / 2 || 100;
                    labelX = Phaser.Math.Clamp(labelX, scrollX + halfWidth + 10, scrollX + width - halfWidth - 10);
                    labelY = Math.max(labelY, scrollY + 30);

                    this.hotspotLabel.setPosition(labelX, labelY);
                }

                // Continuous running
                if (this.isRunningHold && pointer.isDown && (Date.now() - this.runningHoldStartTime) > 150) {
                    if (!this.dialogActive) {
                        const targetX = pointer.x + scrollX;
                        let targetY = pointer.y + scrollY;

                        const minY = height * this.walkableArea.minY;
                        const maxY = height * this.walkableArea.maxY;
                        targetY = Phaser.Math.Clamp(targetY, minY, maxY);

                        const dx = targetX - this.player.x;
                        const dy = targetY - this.player.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist > 5) {
                            if (this.walkTween) { this.walkTween.stop(); this.walkTween = null; }

                            const speed = 500;
                            const delta = this.game.loop.delta / 1000;
                            const moveSpeed = speed * delta;
                            const moveX = (dx / dist) * Math.min(moveSpeed, dist);
                            const moveY = (dy / dist) * Math.min(moveSpeed, dist);

                            this.player.x += moveX;
                            this.player.y += moveY;

                            if (dx < -1) this.player.setScale(-1, 1);
                            else if (dx > 1) this.player.setScale(1, 1);

                            this.player.setDepth(100 + this.player.y);

                            if (this.worldWidth > this.screenWidth) {
                                this.cameras.main.scrollX = Phaser.Math.Clamp(
                                    this.player.x - this.screenWidth / 2,
                                    0,
                                    this.worldWidth - this.screenWidth
                                );
                            }

                            if (!this.isWalking) {
                                this.isWalking = true;
                                this.startWalkAnimation(true);
                            }
                        }
                    }
                }
            }
        }

        // ============================================================================
        // GAME SCENE - House Interior (extends BaseScene)
        // Only contains room-specific content: background, hotspots, lighting
        // ============================================================================
