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
                this.isMobile = false;
                this.verbCoinRadius = 100;
                this.verbActionRadius = 32;
                this.verbActionHoverRadius = 38;
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

            getGameState() {
                let state = this.registry.get('gameState');
                if (!state) {
                    // Initialize default state ONCE and save it
                    console.log('[GameState] Initializing fresh state (first time)');
                    state = {
                        inventory: [],
                        selectedItem: null,
                        flags: {},
                        visitedRooms: []
                    };
                    this.registry.set('gameState', state);
                }
                return state;
            }

            setGameState(state) {
                this.registry.set('gameState', state);
            }

            getFlag(flagName) {
                const state = this.getGameState();
                return state.flags[flagName] || false;
            }

            setFlag(flagName, value = true) {
                const state = this.getGameState();
                state.flags[flagName] = value;
                this.setGameState(state);
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
                this.isMobile = this.sys.game.device.input.touch;
                if (this.isMobile) {
                    this.verbCoinRadius = 200;
                    this.verbActionRadius = 64;
                    this.verbActionHoverRadius = 76;
                    this.verbCoinScale = 2;
                } else {
                    this.verbCoinRadius = 100;
                    this.verbActionRadius = 32;
                    this.verbActionHoverRadius = 38;
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
                const state = this.getGameState();

                console.log('[' + this.scene.key + '] Rebuilding inventory from state:', {
                    inventory: state.inventory ? state.inventory.map(i => i.id) : [],
                    flags: state.flags,
                    selectedItem: state.selectedItem ? state.selectedItem.id : null,
                    slotsAvailable: this.inventorySlots.length
                });

                if (!state.inventory || state.inventory.length === 0) {
                    console.log('[' + this.scene.key + '] No items in inventory to restore');
                    return;
                }

                // Re-add each item to inventory UI (slots are fresh, so just add to UI)
                state.inventory.forEach(item => {
                    // Check if slot already has this item (shouldn't happen but be safe)
                    const existingSlot = this.inventorySlots.find(s => s.item && s.item.id === item.id);
                    if (!existingSlot) {
                        console.log('[' + this.scene.key + '] Adding item to slot:', item.id);
                        this.addItemToSlot(item);
                    } else {
                        console.log('[' + this.scene.key + '] Item already in slot:', item.id);
                    }
                });

                // Restore selected item cursor
                if (state.selectedItem) {
                    const slot = this.inventorySlots.find(s => s.item && s.item.id === state.selectedItem.id);
                    if (slot) {
                        this.selectItem(state.selectedItem, slot);
                    }
                }
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
                        if (this.getGameState().selectedItem) {
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
                    if (this.inventoryOpen && this.getGameState().selectedItem) {
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

                if (this.getGameState().selectedItem) {
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

                const selectedItem = this.getGameState().selectedItem;
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

            walkTo(targetX, targetY, onComplete = null, isRunning = false) {
                if (this.dialogActive || this.conversationActive) return;

                const { height } = this.scale;
                targetX = Phaser.Math.Clamp(targetX, 30, this.worldWidth - 30);
                targetY = Phaser.Math.Clamp(targetY, height * this.walkableArea.minY, height * this.walkableArea.maxY);

                if (this.walkTween) this.walkTween.stop();
                if (this.bobTween) this.bobTween.stop();

                const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, targetX, targetY);
                if (distance < 5) {
                    if (onComplete) onComplete();
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
                        if (onComplete) onComplete();
                    }
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
                    const zone = this.add.zone(spot.x, spot.y, spot.w, spot.h)
                        .setInteractive()
                        .setOrigin(0.5);

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

            // ========== VERB COIN ==========

            createVerbCoin(width, height) {
                this.verbCoin = this.add.container(0, 0);
                this.verbCoin.setVisible(false);
                this.verbCoin.setDepth(5000);

                const scale = this.verbCoinScale;
                const coinRadius = this.verbCoinRadius;
                const actionRadius = this.verbActionRadius;

                // Gold coin background
                const coinBg = this.add.graphics();
                coinBg.fillStyle(0x8b6914, 1);
                coinBg.fillCircle(0, 0, coinRadius);
                coinBg.lineStyle(5 * scale, 0xd4a84b, 1);
                coinBg.strokeCircle(0, 0, coinRadius);
                coinBg.lineStyle(3 * scale, 0x5c4a0f, 0.6);
                coinBg.strokeCircle(0, 0, coinRadius - 10 * scale);
                this.verbCoin.add(coinBg);

                // Action buttons - positioned around top of coin so finger doesn't block them
                // Spread out enough to prevent overlap (actionRadius is 32 on desktop, 64 on mobile)
                const actions = [
                    { name: 'Use', icon: 'hand', color: 0x4CAF50, x: -62 * scale, y: 0 },
                    { name: 'Look At', icon: 'eye', color: 0x2196F3, x: 0, y: -62 * scale },
                    { name: 'Talk To', icon: 'mouth', color: 0xFFC107, x: 62 * scale, y: 0 }
                ];

                this.verbCoinActions = [];
                actions.forEach(action => {
                    const container = this.add.container(action.x, action.y);
                    const bg = this.add.graphics();
                    bg.fillStyle(0x3d2817, 0.9);
                    bg.fillCircle(0, 0, actionRadius);
                    bg.lineStyle(3 * scale, action.color, 0.8);
                    bg.strokeCircle(0, 0, actionRadius);
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
                        radius: actionRadius
                    });
                    this.verbCoin.add(container);
                });
            }

            drawVerbIcon(graphics, type, color) {
                graphics.clear();
                const s = this.verbCoinScale;
                graphics.lineStyle(3 * s, color, 1);
                graphics.fillStyle(color, 1);

                // Icons scaled based on device
                switch (type) {
                    case 'hand':
                        graphics.fillRoundedRect(-12 * s, -9 * s, 24 * s, 21 * s, 4 * s);
                        graphics.fillCircle(-9 * s, -15 * s, 4.5 * s);
                        graphics.fillCircle(-3 * s, -18 * s, 4.5 * s);
                        graphics.fillCircle(3 * s, -18 * s, 4.5 * s);
                        graphics.fillCircle(9 * s, -15 * s, 4.5 * s);
                        break;
                    case 'eye':
                        graphics.fillEllipse(0, 0, 27 * s, 15 * s);
                        graphics.fillStyle(0x000000, 1);
                        graphics.fillCircle(0, 0, 6 * s);
                        graphics.fillStyle(0xffffff, 1);
                        graphics.fillCircle(-1.5 * s, -1.5 * s, 2 * s);
                        break;
                    case 'mouth':
                        graphics.fillRoundedRect(-13 * s, -9 * s, 26 * s, 18 * s, 6 * s);
                        graphics.fillStyle(0x000000, 1);
                        graphics.fillRect(-8 * s, -3 * s, 5 * s, 3 * s);
                        graphics.fillRect(-1 * s, -3 * s, 5 * s, 3 * s);
                        graphics.fillRect(5 * s, -3 * s, 5 * s, 3 * s);
                        graphics.fillStyle(color, 1);
                        graphics.fillTriangle(-13 * s, 6 * s, -7 * s, 6 * s, -18 * s, 15 * s);
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

                const coinRadius = this.verbCoinRadius;
                // Don't let verb coin overlap the hotspot label text at bottom
                const textBuffer = this.isMobile ? 80 : 50;
                const maxY = (this.hotspotLabelY || (height - 25)) - textBuffer - coinRadius;
                let coinX = Phaser.Math.Clamp(x, coinRadius + 10, width - coinRadius - 10) + scrollX;
                let coinY = Phaser.Math.Clamp(y, coinRadius + 10, maxY) + scrollY;

                this.verbCoin.setPosition(coinX, coinY);
                this.hotspotLabel.setText(hotspot.name);

                const actionRadius = this.verbActionRadius;
                const scale = this.verbCoinScale;
                this.verbCoinActions.forEach(action => {
                    action.bg.clear();
                    action.bg.fillStyle(0x3d2817, 0.9);
                    action.bg.fillCircle(0, 0, actionRadius);
                    action.bg.lineStyle(3 * scale, action.color, 0.8);
                    action.bg.strokeCircle(0, 0, actionRadius);
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

                let foundHover = null;

                this.verbCoinActions.forEach(action => {
                    const actionX = coinX + action.x;
                    const actionY = coinY + action.y;
                    const dist = Phaser.Math.Distance.Between(pointerX, pointerY, actionX, actionY);

                    const actionRadius = this.verbActionRadius;
                    const hoverRadius = this.verbActionHoverRadius;
                    const scale = this.verbCoinScale;
                    if (dist <= action.radius + 5) {
                        foundHover = action.name;
                        action.bg.clear();
                        action.bg.fillStyle(action.color, 0.4);
                        action.bg.fillCircle(0, 0, hoverRadius);
                        action.bg.lineStyle(3 * scale, action.color, 1);
                        action.bg.strokeCircle(0, 0, hoverRadius);
                    } else {
                        action.bg.clear();
                        action.bg.fillStyle(0x3d2817, 0.9);
                        action.bg.fillCircle(0, 0, actionRadius);
                        action.bg.lineStyle(3 * scale, action.color, 0.8);
                        action.bg.strokeCircle(0, 0, actionRadius);
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

                const coinRadius = this.verbCoinRadius;
                // Don't let verb coin overlap the hotspot label text at bottom
                const textBuffer = this.isMobile ? 80 : 50;
                const maxY = (this.hotspotLabelY || (height - 25)) - textBuffer - coinRadius;
                let coinX = Phaser.Math.Clamp(x, coinRadius + 10, width - coinRadius - 10) + scrollX;
                let coinY = Phaser.Math.Clamp(y, coinRadius + 10, maxY) + scrollY;

                this.verbCoin.setPosition(coinX, coinY);
                this.hotspotLabel.setText(item.name);

                const actionRadius = this.verbActionRadius;
                const scale = this.verbCoinScale;
                this.verbCoinActions.forEach(action => {
                    action.bg.clear();
                    action.bg.fillStyle(0x3d2817, 0.9);
                    action.bg.fillCircle(0, 0, actionRadius);
                    action.bg.lineStyle(3 * scale, action.color, 0.8);
                    action.bg.strokeCircle(0, 0, actionRadius);
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
                const state = this.getGameState();
                if (!state.selectedItem) {
                    this.crosshairCursor.setVisible(true);
                }
                this.arrowDirection = null;
            }

            setCrosshairHover(hotspot) {
                this.currentHoveredHotspot = hotspot;
                const selectedItem = this.getGameState().selectedItem;

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
                            if (this.inventoryOpen && this.getGameState().selectedItem) this.toggleInventory();
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

                const state = this.getGameState();
                state.inventory.push(item);
                this.setGameState(state);

                console.log('[' + this.scene.key + '] Added to inventory:', item.id, 'Total items:', state.inventory.length);

                this.addItemToSlot(item);

                if (this.cache.audio.exists('pickupSound')) {
                    this.sound.play('pickupSound', { volume: 0.7 });
                }

                return true;
            }

            addItemToSlot(item) {
                const emptySlot = this.inventorySlots.find(slot => slot.item === null);
                if (!emptySlot) return false;

                emptySlot.item = item;
                emptySlot.display.removeAll(true);

                const itemSize = 50;
                const itemGraphic = this.add.graphics();
                itemGraphic.fillStyle(item.color || 0xffd700, 1);
                itemGraphic.fillRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                itemGraphic.lineStyle(2, 0x000000, 0.3);
                itemGraphic.strokeRoundedRect(-itemSize / 2, -itemSize / 2, itemSize, itemSize, 8);
                emptySlot.display.add(itemGraphic);

                const slotSize = emptySlot.size;
                const hitArea = this.add.rectangle(0, 0, slotSize - 4, slotSize - 4, 0x000000, 0).setInteractive();

                hitArea.on('pointerdown', (pointer) => {
                    if (!pointer.leftButtonDown()) return;
                    this.clickedUI = true;
                    this.pressedInventoryItem = item;
                    this.pressedInventorySlot = emptySlot;

                    if (this.inventoryItemPressTimer) this.inventoryItemPressTimer.remove();
                    this.inventoryItemPressTimer = this.time.delayedCall(this.verbCoinDelay, () => {
                        this.showInventoryVerbCoin(item, pointer.x, pointer.y);
                    });
                });

                hitArea.on('pointerup', () => {
                    if (!this.verbCoinVisible && this.pressedInventoryItem && this.pressedInventoryItem.id === item.id) {
                        this.selectItem(item, emptySlot);
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

                emptySlot.display.add(hitArea);
                return true;
            }

            hasItem(itemId) {
                return this.getGameState().inventory.some(item => item.id === itemId);
            }

            removeFromInventory(itemId) {
                const state = this.getGameState();
                const index = state.inventory.findIndex(item => item.id === itemId);
                if (index === -1) return false;

                state.inventory.splice(index, 1);
                this.setGameState(state);

                const slot = this.inventorySlots.find(s => s.item && s.item.id === itemId);
                if (slot) {
                    slot.display.removeAll(true);
                    slot.item = null;
                }

                return true;
            }

            selectItem(item, slot) {
                const state = this.getGameState();

                if (state.selectedItem && state.selectedItem.id === item.id) {
                    this.deselectItem();
                    return;
                }

                state.selectedItem = item;
                this.setGameState(state);

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
                const state = this.getGameState();
                state.selectedItem = null;
                this.setGameState(state);

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

            showDialog(text, onComplete = null) {
                if (this.dialogTimer) this.dialogTimer.remove();
                this.dialogQueue = [];
                this.dialogCallback = onComplete;

                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

                if (sentences.length > 1) {
                    this.dialogQueue = sentences.slice(1).map(s => s.trim());
                    this.startDialogSequence();
                    this.showSingleDialog(sentences[0].trim(), true);
                } else {
                    this.showSingleDialog(text, false);
                }
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
                const state = this.getGameState();
                if (this.crosshairCursor && !state.selectedItem) this.crosshairCursor.setVisible(true);
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
                const state = this.getGameState();
                if (this.crosshairCursor && !state.selectedItem) {
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
                const state = this.getGameState();
                console.log('[' + this.scene.key + '] Transitioning to', targetScene, 'with state:', {
                    inventory: state.inventory ? state.inventory.map(i => i.id) : [],
                    flags: state.flags
                });

                this.registry.set('spawnPoint', spawnPoint);

                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start(targetScene);
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
                const selectedItem = this.getGameState().selectedItem;
                if (selectedItem && this.itemCursor && this.itemCursor.visible) {
                    this.itemCursor.setPosition(pointer.x + scrollX + 20, pointer.y + scrollY + 20);
                }

                // Update hotspot label position - follows cursor/verb coin/item cursor
                if (this.hotspotLabel) {
                    let labelX, labelY;
                    const labelOffset = this.isMobile ? 80 : 50;

                    if (this.verbCoinVisible && this.verbCoin) {
                        // Position above verb coin
                        labelX = this.verbCoin.x;
                        labelY = this.verbCoin.y - this.verbCoinRadius - labelOffset;
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
