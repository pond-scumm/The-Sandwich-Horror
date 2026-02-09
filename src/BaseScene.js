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
                this.playerSprite = null;  // Reference to the actual sprite (for tinting, etc.)
                this.isWalking = false;
                this.walkTween = null;
                this.bobTween = null;
                this.leftLeg = null;
                this.rightLeg = null;

                // Camera preset for character scaling (FAR, MEDIUM, CLOSE)
                this.cameraPreset = 'MEDIUM';

                // Movement
                this.lastClickTime = 0;
                this.doubleClickThreshold = 300;
                this.isRunningHold = false;
                this.runningHoldStartTime = 0;
                this.interactionRange = 80;

                // Footsteps
                this.footstepTimer = null;
                this.footstepIsLeft = true;  // Alternates left/right
                this.footstepIsRunning = false;  // Track walk vs run for sounds

                // Input tracking
                this.pointerDownPos = null;

                // Device detection (set in create)
                this.isMobile = false;

                // Inventory UI state (synced from TSH.State, UIScene owns the panel)
                this.inventoryOpen = false;
                this.itemCursor = null;

                // Selected item for "use on" actions (synced from TSH.State)
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

                // Hotspot highlighting (Shift on desktop, long-press on mobile)
                this.hotspotHighlightsVisible = false;
                this.hotspotHighlightGraphics = null;
                this.longPressTimer = null;
                this.longPressStartPos = null;

                // Mobile gesture detection
                this.mobileGesture = {
                    startPos: null,           // {x, y} where touch started
                    startTime: 0,             // Timestamp of touch start
                    isDragging: false,        // True if moved beyond threshold
                    isLongPress: false,       // True if held beyond long-press threshold
                    lastTapTime: 0,           // For double-tap detection
                    lastTapPos: null,         // Position of last tap
                    dragThreshold: 10,        // Pixels before drag is recognized
                    doubleTapThreshold: 300,  // ms for double-tap
                    longPressThreshold: 500,  // ms for long-press (inventory item pickup)
                    longPressTimer: null,     // Timer for long-press detection
                    hoveredHotspot: null,     // Hotspot under finger during drag
                    dragWithItem: false,      // True if dragging with inventory item
                    draggedItem: null         // The item being dragged
                };

                // UI tracking
                this.clickedUI = false;

                // Debug mode (disables all player actions)
                this.debugEnabled = false;

                // Settings menu
                this.settingsMenuOpen = false;
                this.settingsPanel = null;
                this.settingsBlurOverlay = null;
                this.settingsButton = null;
                this.settingsButtonArea = null;
                this.settingsButtonHovered = false;
                this.settingsBtnHollow = null;
                this.settingsBtnFilled = null;
                this.draggingVolumeSlider = null;
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

            preload() {
                // Load character placeholder sprites
                if (!this.textures.exists('nate_placeholder')) {
                    this.load.image('nate_placeholder', 'assets/sprites/nate_placeholder.png');
                }

                // Load spritesheet for walk animation (6 frames horizontal, 180x610 each)
                if (!this.textures.exists('nate_walk')) {
                    this.load.spritesheet('nate_walk',
                        'assets/sprites/nate/HeroWalkingRight1-Sheet.png', {
                        frameWidth: 180,
                        frameHeight: 610
                    });
                }

                // Load separate idle texture
                if (!this.textures.exists('nate_idle')) {
                    this.load.image('nate_idle', 'assets/sprites/nate/nate_idle.png');
                }
                if (!this.textures.exists('hector_placeholder')) {
                    this.load.image('hector_placeholder', 'assets/sprites/hector_placeholder.png');
                }
                if (!this.textures.exists('earl_placeholder')) {
                    this.load.image('earl_placeholder', 'assets/sprites/earl_placeholder.png');
                }
                if (!this.textures.exists('frank_placeholder')) {
                    this.load.image('frank_placeholder', 'assets/sprites/frank_placeholder.png');
                }
                if (!this.textures.exists('harry_placeholder')) {
                    this.load.image('harry_placeholder', 'assets/sprites/harry_placeholder.png');
                }
            }

            create() {
                const { width, height } = this.scale;

                // Register walk animation once (checks if already exists to avoid re-creating)
                if (!this.anims.exists('nate_walk') && this.textures.exists('nate_walk')) {
                    this.anims.create({
                        key: 'nate_walk',
                        frames: this.anims.generateFrameNumbers('nate_walk', {
                            start: 0,
                            end: 5
                        }),
                        frameRate: 10,  // Starting point - will tune by eye
                        repeat: -1      // Loop indefinitely
                    });
                }

                // CRITICAL: Destroy all old hotspot zones BEFORE resetting the array
                // This fixes the bug where hotspots from previous rooms persist in Phaser's input system
                this.cleanupHotspots();

                // Register shutdown handler to clean up when scene stops
                this.events.once('shutdown', this.cleanupHotspots, this);

                // Reset scene-specific state (constructor doesn't re-run on scene.start())
                this.hotspots = [];
                this.inventoryOpen = TSH.State.isInventoryOpen();
                this.selectedItem = TSH.State.getSelectedItem() ? TSH.Items[TSH.State.getSelectedItem()] : null;
                this.dialogActive = false;
                this.dialogQueue = [];
                this.isWalking = false;

                // Detect mobile/touch device
                // Use pointer: coarse to detect if primary input is touch (not just touch-capable)
                // This correctly identifies touchscreen laptops as desktop when using mouse
                this.isMobile = window.matchMedia('(pointer: coarse)').matches;

                // Create pixel texture for player if needed
                if (!this.textures.exists('pixel')) {
                    const g = this.make.graphics({ add: false });
                    g.fillStyle(0xbbbbbb);
                    g.fillRect(0, 0, 6, 6);
                    g.generateTexture('pixel', 6, 6);
                    g.destroy();
                }

                // Hide browser cursor (UIScene also does this, but be safe)
                this.game.canvas.style.cursor = 'none';

                // Setup input handlers
                this.setupInputHandlers();

                // Check if UIScene exists (it handles cursors and inventory panel)
                // Use scene.get() instead of isActive() because UIScene may not be fully active yet
                const uiScene = this.scene.get('UIScene');
                this.uiSceneActive = uiScene !== null;
                console.log('[BaseScene] UIScene check:', {
                    uiSceneExists: uiScene !== null,
                    uiSceneActive: this.uiSceneActive,
                    sceneKey: this.scene.key
                });

                // Create UI systems
                // Skip cursor creation if UIScene is handling it
                if (!this.uiSceneActive) {
                    console.log('[BaseScene] Creating cursors (UIScene not found)');
                    this.createCrosshairCursor(width, height);
                    this.createItemCursor();
                } else {
                    console.log('[BaseScene] Skipping cursor creation (UIScene handling)');
                }

                // Always create hotspot label (it's not a cursor, just UI text)
                this.createHotspotLabel(width, height);
                this.createDialogUI(width, height);
                this.createConversationUI(width, height);
                this.createSettingsUI(width, height);

                // Listen to UI state changes (sync local state from TSH.State)
                if (this.uiSceneActive) {
                    TSH.State.on('uiStateChanged', this.onUIStateChanged.bind(this));
                }

                // Listen for dialog requests from UIScene
                TSH.State.on('showDialog', this.onShowDialogEvent.bind(this));

                // Fade in
                this.cameras.main.fadeIn(500, 0, 0, 0);
            }

            onUIStateChanged(data) {
                const { key, value } = data;

                if (key === 'inventoryOpen') {
                    // Sync local state (UIScene manages the panel)
                    this.inventoryOpen = value;
                    if (value) {
                        // Stop character movement when inventory opens
                        this.stopCharacterMovement();
                        this.setCrosshairHover(null);
                    }
                } else if (key === 'selectedItem') {
                    // Sync selected item from state
                    this.selectedItem = value ? TSH.Items[value] : null;
                } else if (key === 'settingsOpen') {
                    // Toggle settings panel visibility
                    if (value) {
                        this.showSettingsPanel();
                    } else {
                        this.hideSettingsPanel();
                    }
                }
            }

            // Handle showDialog events from UIScene (for inventory combinations, etc.)
            onShowDialogEvent(data) {
                if (data && data.text) {
                    this.showDialog(data.text, data.speaker);
                }
            }

            showSettingsPanel() {
                // Sync local state with TSH.State
                this.settingsMenuOpen = true;

                // Close inventory if open
                if (this.inventoryOpen) {
                    TSH.State.setInventoryOpen(false);
                }

                // Stop character movement
                this.stopCharacterMovement();

                // Reset crosshair and hide hotspot label
                this.drawCrosshair(0xffffff);
                if (this.hotspotLabel) {
                    this.hotspotLabel.setVisible(false);
                    this.hotspotLabel.setText('');
                }

                // Sync fullscreen checkbox state
                this.updateFullscreenCheckbox();

                // Sync volume sliders with current audio volumes
                this.syncVolumeSliders();

                // Show the panel
                this.settingsBlurOverlay.setVisible(true);
                this.settingsPanel.setVisible(true);

                // Pause the game
                this.pauseGame();
            }

            hideSettingsPanel() {
                // Sync local state with TSH.State
                this.settingsMenuOpen = false;
                // Ensure TSH.State is synced (defensive - state should already be false)
                TSH.State._state.ui.settingsOpen = false;

                // Reset hover states to prevent stale state on next open
                this.settingsReturnBtnHovered = false;

                // Hide overlay and panel
                this.settingsBlurOverlay.setVisible(false);
                this.settingsPanel.setVisible(false);

                // Restore hotspot label visibility
                if (this.hotspotLabel) {
                    this.hotspotLabel.setVisible(true);
                }

                // Resume the game
                this.resumeGame();
            }

            // ========== INPUT HANDLERS ==========

            setupInputHandlers() {
                // ========== POINTER DOWN ==========
                this.input.on('pointerdown', (pointer) => {
                    // Tap/click to skip dialogue (highest priority, works on all platforms)
                    if (this.dialogActive && !this.settingsMenuOpen) {
                        this.skipToNextDialog();
                        this.clickedUI = true;  // Prevent pointerup from processing as hotspot click
                        return;
                    }

                    // Settings menu has its own handlers
                    if (this.settingsMenuOpen) {
                        this.handleSettingsPointerDown(pointer);
                        return;
                    }

                    // Mobile vs Desktop handling
                    if (this.isMobile) {
                        this.handleMobilePointerDown(pointer);
                    } else {
                        this.handleDesktopPointerDown(pointer);
                    }
                });

                // ========== POINTER UP ==========
                this.input.on('pointerup', (pointer) => {
                    // Stop any volume slider dragging
                    this.stopVolumeSliderDrag();

                    if (this.settingsMenuOpen) {
                        return;
                    }

                    // Mobile vs Desktop handling
                    if (this.isMobile) {
                        this.handleMobilePointerUp(pointer);
                    } else {
                        this.handleDesktopPointerUp(pointer);
                    }
                });

                // ========== POINTER MOVE ==========
                this.input.on('pointermove', (pointer) => {
                    // Handle volume slider dragging (both platforms)
                    if (this.settingsMenuOpen && this.draggingVolumeSlider) {
                        this.updateVolumeSliderDrag(pointer);
                        return;
                    }

                    // Mobile vs Desktop handling
                    if (this.isMobile) {
                        this.handleMobilePointerMove(pointer);
                    }
                    // Note: UIScene handles checking if item is dragged outside inventory panel
                });

                // Period key for dialogue skip
                this.input.keyboard.on('keydown-PERIOD', () => {
                    if (this.dialogActive) this.skipToNextDialog();
                    if (this.conversationActive && this.conversationLineCallback) {
                        this.skipConversationLine();
                    }
                });

                // Shift key for hotspot highlighting (desktop)
                this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
                this.shiftKey.on('down', () => this.showHotspotHighlights());
                this.shiftKey.on('up', () => this.hideHotspotHighlights());

                // Prevent context menu
                this.game.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
            }

            // Check if pointer is on the inventory button (delegates to UIScene)
            isClickOnInventoryButton(pointer) {
                const uiScene = this.scene.get('UIScene');
                return uiScene ? uiScene.isClickOnInventoryButton(pointer) : false;
            }

            handleBackgroundPress(pointer) {
                if (this.debugEnabled) return;
                if (this.clickedUI) return;

                // When UIScene is active, ignore clicks on UIScene buttons
                if (this.uiSceneActive) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && (uiScene.isClickOnInventoryButton(pointer) || uiScene.isClickOnSettingsButton(pointer))) {
                        return;
                    }
                }

                // Right-click with item selected = deselect (works even when inventory is open)
                if (this.selectedItem && pointer.rightButtonDown()) {
                    console.log('[BaseScene] Right-click with item selected, deselecting:', this.selectedItem.id);
                    this.deselectItem();
                    return;
                }

                // Close inventory if clicking outside panel
                if (this.inventoryOpen) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && !uiScene.isClickOnInventoryPanel(pointer)) {
                        this.toggleInventory();
                    }
                    return;
                }

                // Left-click on background with item selected = deselect
                if (this.selectedItem) {
                    console.log('[BaseScene] Left-click with item selected, deselecting:', this.selectedItem.id);
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

                if (this.clickedUI) {
                    this.clickedUI = false;
                    this.pointerDownPos = null;
                    return;
                }

                // Don't handle normal interactions during conversation
                if (this.conversationActive) {
                    this.pointerDownPos = null;
                    return;
                }

                // Handle background click for walking
                if (this.pointerDownPos) {
                    this.handleBackgroundClick(this.pointerDownPos.x, this.pointerDownPos.y);
                }

                this.pointerDownPos = null;
            }

            // ========== SETTINGS MENU INPUT ==========

            handleSettingsPointerDown(pointer) {
                // Block all settings interactions in debug mode
                if (this.debugEnabled) return;

                // Check if clicking Return button (coordinate-based only, no hover state)
                if (this.isClickOnSettingsReturnButton(pointer)) {
                    // Use state-driven approach when UIScene handles buttons
                    if (this.uiSceneActive) {
                        TSH.State.setUIState('settingsOpen', false);
                    } else {
                        this.closeSettingsMenu();
                    }
                    return;
                }

                // Check fullscreen checkbox (coordinate-based only, no hover state)
                if (this.isClickOnFullscreenCheckbox(pointer)) {
                    this.toggleFullscreen();
                    return;
                }

                // Check volume slider interaction (coordinate-based only)
                this.isClickOnVolumeMuteButton(pointer) || this.isClickOnVolumeSlider(pointer);
            }

            // ========== DESKTOP INPUT HANDLERS ==========

            handleDesktopPointerDown(pointer) {
                // Click to skip dialogue (highest priority)
                if (this.dialogActive) {
                    this.skipToNextDialog();
                    return;
                }

                // When UIScene is active, let it handle button clicks
                if (this.uiSceneActive) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && (uiScene.isClickOnInventoryButton(pointer) || uiScene.isClickOnSettingsButton(pointer))) {
                        this.clickedUI = true;
                        return;
                    }
                }

                // Check for settings button click (legacy, use hover state from update loop)
                if (this.settingsButtonHovered) {
                    this.openSettingsMenu();
                    return;
                }

                // Check inventory button (mobile only, but check anyway)
                if (this.isClickOnInventoryButton(pointer)) {
                    this.clickedUI = true;
                    this.toggleInventory();
                    return;
                }

                // Inventory item clicks are handled by the slot hitArea handlers (setInteractive)
                // Don't duplicate here

                // Check hotspots (use hover state set by zone pointerover)
                const hotspot = this.currentHoveredHotspot;
                if (hotspot) {
                    // Validate hotspot belongs to current room (prevents stale hotspots from previous rooms)
                    const hotspotId = hotspot._data?.id || hotspot.id;
                    const isValidHotspot = this.hotspots.some(h => (h._data?.id || h.id) === hotspotId);
                    if (!isValidHotspot) {
                        console.warn('[BaseScene] Ignoring stale hotspot:', hotspotId);
                        this.currentHoveredHotspot = null;
                        this.setCrosshairHover(null);
                        return;
                    }

                    if (pointer.rightButtonDown()) {
                        this.clickedUI = true;
                        // Right-click with item selected = deselect item
                        if (this.selectedItem) {
                            console.log('[BaseScene] Right-click on hotspot with item, deselecting');
                            this.deselectItem();
                        } else {
                            // Right-click without item = examine hotspot
                            this.examineHotspot(hotspot);
                        }
                    } else {
                        this.handleHotspotPress(hotspot, pointer);
                    }
                    return;
                }

                // Background interaction
                this.handleBackgroundPress(pointer);
            }

            handleDesktopPointerUp(pointer) {
                this.handlePointerUp(pointer);
            }

            // ========== MOBILE INPUT HANDLERS ==========

            handleMobilePointerDown(pointer) {
                const gesture = this.mobileGesture;
                const currentTime = Date.now();

                // Store touch start position and time
                gesture.startPos = { x: pointer.x, y: pointer.y };
                gesture.startTime = currentTime;
                gesture.isDragging = false;
                gesture.isLongPress = false;
                gesture.hoveredHotspot = null;

                // Clear any existing long-press timer
                if (gesture.longPressTimer) {
                    gesture.longPressTimer.destroy();
                    gesture.longPressTimer = null;
                }

                // Tap to skip dialogue (highest priority)
                if (this.dialogActive) {
                    this.skipToNextDialog();
                    return;
                }

                // When UIScene is active, let it handle button clicks
                if (this.uiSceneActive) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && (uiScene.isClickOnInventoryButton(pointer) || uiScene.isClickOnSettingsButton(pointer))) {
                        this.clickedUI = true;  // Mark as UI click for pointerup
                        return;
                    }
                }

                // Check for settings button (legacy, when UIScene not active)
                if (this.isClickOnSettingsButton(pointer)) {
                    this.openSettingsMenu();
                    return;
                }

                // Note: UIScene handles inventory button clicks

                // When inventory is open, block any interaction on the panel area
                if (TSH.State.isInventoryOpen()) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && uiScene.isClickOnInventoryPanel(pointer)) {
                        // UIScene handles inventory panel interactions
                        this.clickedUI = true;
                        return;
                    }
                }

                // Check if touching an inventory item (for long-press pickup or tap to examine)
                // Note: This is legacy code when UIScene is not active
                if (this.inventoryOpen) {
                    const clickedItem = this.getInventoryItemAtPointer(pointer);
                    if (clickedItem) {
                        // Don't set clickedUI here - we handle inventory items explicitly
                        // via touchedInventoryItem in pointerup
                        gesture.touchedInventoryItem = clickedItem;

                        // Start long-press timer for item pickup
                        gesture.longPressTimer = this.time.delayedCall(gesture.longPressThreshold, () => {
                            gesture.isLongPress = true;
                            gesture.dragWithItem = true;
                            gesture.draggedItem = clickedItem;
                            this.selectItem(clickedItem);
                            // Visual feedback - could add haptic or sound here
                        });
                        return;
                    }
                }

                // Check for double-tap to start continuous running (on background only)
                const timeSinceLastTap = currentTime - gesture.lastTapTime;
                const isDoubleTap = timeSinceLastTap < gesture.doubleTapThreshold &&
                                    gesture.lastTapPos &&
                                    this.getDistance(pointer, gesture.lastTapPos) < 30;

                if (isDoubleTap && !this.inventoryOpen && !this.dialogActive && !this.conversationActive) {
                    const hotspot = this.getHotspotAtPointer(pointer);
                    if (!hotspot) {
                        // Double-tap on background - start continuous running
                        this.isRunningHold = true;
                        this.runningHoldStartTime = currentTime;
                        this.runToPointer(pointer);
                        // Clear last tap so triple-tap doesn't re-trigger
                        gesture.lastTapTime = 0;
                        gesture.lastTapPos = null;
                        return;
                    }
                }

                // Not touching inventory - start long-press timer for hotspot highlights
                if (!this.inventoryOpen && !this.selectedItem) {
                    gesture.longPressTimer = this.time.delayedCall(1000, () => {
                        gesture.isLongPress = true;
                        this.showHotspotHighlights();
                    });
                }
            }

            handleMobilePointerUp(pointer) {
                const gesture = this.mobileGesture;
                const touchDuration = Date.now() - gesture.startTime;

                // Clear long-press timer
                if (gesture.longPressTimer) {
                    gesture.longPressTimer.destroy();
                    gesture.longPressTimer = null;
                }

                // Hide hotspot highlights if they were shown
                if (this.hotspotHighlightsVisible) {
                    this.hideHotspotHighlights();
                }

                // If a UI element was clicked in pointerdown, don't process as tap
                // UNLESS we're in drag-with-item mode (UIScene may have started a drag)
                if (this.clickedUI && !(gesture.dragWithItem && gesture.draggedItem)) {
                    this.clickedUI = false;
                    return;
                }
                this.clickedUI = false;

                // When UIScene is active, check if tap was on UIScene buttons and skip processing
                if (this.uiSceneActive) {
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && (uiScene.isClickOnInventoryButton(pointer) || uiScene.isClickOnSettingsButton(pointer))) {
                        return;
                    }
                }

                // Stop continuous running if active
                if (this.isRunningHold) {
                    this.isRunningHold = false;
                    this.isWalking = false;
                    this.stopWalkAnimation();
                    return;
                }

                // Handle drag-with-item release
                if (gesture.dragWithItem && gesture.draggedItem) {
                    // Capture item before resetting gesture state (needed for walkTo callback)
                    const draggedItem = gesture.draggedItem;

                    // Reset drag state immediately
                    gesture.dragWithItem = false;
                    gesture.draggedItem = null;
                    gesture.touchedInventoryItem = null;
                    this.clickedUI = false;

                    // If inventory is open, check for inventory item drop first (for combining)
                    if (TSH.State.isInventoryOpen()) {
                        let targetItem = this.getInventoryItemAtPointer(pointer);

                        // Mobile fallback: if release position is on empty slot, use last hovered item
                        if (!targetItem && this.isMobile) {
                            const uiScene = this.scene.get('UIScene');
                            if (uiScene && uiScene.getLastHoveredInventoryItem) {
                                targetItem = uiScene.getLastHoveredInventoryItem();
                            }
                        }

                        if (targetItem && targetItem.id !== draggedItem.id) {
                            this.combineItems(draggedItem, targetItem);
                        }
                        // Clear selection immediately on release (mobile UX)
                        this.deselectItem();
                        return;
                    }

                    // Inventory is closed - check for hotspot
                    const hotspot = this.getHotspotAtPointer(pointer);

                    // Clear selection immediately on release (mobile UX)
                    this.deselectItem();

                    if (hotspot) {
                        // Use item on hotspot
                        if (this.isPlayerNearHotspot(hotspot)) {
                            this.useItemOnHotspot(draggedItem, hotspot);
                        } else {
                            this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                                this.useItemOnHotspot(draggedItem, hotspot);
                            }, true);
                        }
                    }
                    return;
                }

                // Handle inventory item tap (examine on quick tap)
                if (gesture.touchedInventoryItem && !gesture.isDragging && !gesture.isLongPress) {
                    if (touchDuration < gesture.longPressThreshold) {
                        this.examineItem(gesture.touchedInventoryItem);
                    }
                    gesture.touchedInventoryItem = null;
                    this.clickedUI = false;
                    return;
                }

                // Handle drag release on hotspot (lift finger to use)
                if (gesture.isDragging && !gesture.isLongPress) {
                    const hotspot = this.getHotspotAtPointer(pointer);
                    if (hotspot) {
                        // Lift on hotspot after drag = use/interact
                        if (this.selectedItem) {
                            // Use selected item on hotspot
                            if (this.isPlayerNearHotspot(hotspot)) {
                                this.useItemOnHotspot(this.selectedItem, hotspot);
                            } else {
                                this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                                    this.useItemOnHotspot(this.selectedItem, hotspot);
                                }, true);
                            }
                        } else {
                            // Normal use action
                            const isNPC = hotspot.type === 'npc' || hotspot.isNPC;
                            const action = isNPC ? 'Talk To' : 'Use';
                            if (this.isPlayerNearHotspot(hotspot)) {
                                this.executeAction(action, hotspot);
                            } else {
                                this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                                    this.executeAction(action, hotspot);
                                }, true);
                            }
                        }
                        // Hide label after use
                        this.setCrosshairHover(null);
                        gesture.hoveredHotspot = null;
                    }
                    gesture.isDragging = false;
                    return;
                }

                // Handle taps (not drags)
                if (!gesture.isDragging) {
                    const currentTime = Date.now();
                    const timeSinceLastTap = currentTime - gesture.lastTapTime;
                    const isDoubleTap = timeSinceLastTap < gesture.doubleTapThreshold &&
                                        gesture.lastTapPos &&
                                        this.getDistance(pointer, gesture.lastTapPos) < 30;

                    // When inventory is open, tapping outside panel ONLY closes inventory
                    // No other action should be processed until user taps again
                    if (this.inventoryOpen) {
                        const uiScene = this.scene.get('UIScene');
                        if (uiScene && !uiScene.isClickOnInventoryPanel(pointer)) {
                            this.toggleInventory();
                        }
                        // Store tap info but don't process any action
                        gesture.lastTapTime = currentTime;
                        gesture.lastTapPos = { x: pointer.x, y: pointer.y };
                        gesture.isDragging = false;
                        gesture.isLongPress = false;
                        return;
                    }

                    // Check what was tapped
                    const hotspot = this.getHotspotAtPointer(pointer);

                    if (hotspot) {
                        if (isDoubleTap) {
                            // Double-tap on hotspot = examine
                            this.examineHotspot(hotspot);
                        } else {
                            // Single tap on hotspot = run + use
                            if (this.selectedItem) {
                                if (this.isPlayerNearHotspot(hotspot)) {
                                    this.useItemOnHotspot(this.selectedItem, hotspot);
                                } else {
                                    this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                                        this.useItemOnHotspot(this.selectedItem, hotspot);
                                    }, true);
                                }
                            } else {
                                const isNPC = hotspot.type === 'npc' || hotspot.isNPC;
                                const action = isNPC ? 'Talk To' : 'Use';
                                if (this.isPlayerNearHotspot(hotspot)) {
                                    this.executeAction(action, hotspot);
                                } else {
                                    this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                                        this.executeAction(action, hotspot);
                                    }, true);
                                }
                            }
                        }
                    } else {
                        // Tapped on background (inventory already closed above if it was open)
                        if (this.selectedItem) {
                            // Tap background with item = deselect
                            this.deselectItem();
                        } else {
                            // Single tap = walk (double-tap handled in pointerdown)
                            const { height } = this.scale;
                            const scrollX = this.cameras.main.scrollX || 0;
                            const scrollY = this.cameras.main.scrollY || 0;
                            const worldX = pointer.x + scrollX;
                            const worldY = pointer.y + scrollY;
                            const minY = height * this.walkableArea.minY;
                            const maxY = height * this.walkableArea.maxY;
                            const targetY = Phaser.Math.Clamp(worldY, minY, maxY);
                            this.walkTo(worldX, targetY, null, false);
                        }
                    }

                    // Store tap info for double-tap detection
                    gesture.lastTapTime = currentTime;
                    gesture.lastTapPos = { x: pointer.x, y: pointer.y };
                }

                // Reset gesture state
                gesture.isDragging = false;
                gesture.isLongPress = false;
            }

            handleMobilePointerMove(pointer) {
                const gesture = this.mobileGesture;

                // If no start position, ignore
                if (!gesture.startPos) return;

                // Calculate distance moved
                const distance = this.getDistance(pointer, gesture.startPos);

                // Check if we've moved beyond drag threshold
                if (!gesture.isDragging && distance > gesture.dragThreshold) {
                    gesture.isDragging = true;

                    // Cancel long-press timer if dragging
                    if (gesture.longPressTimer && !gesture.isLongPress) {
                        gesture.longPressTimer.destroy();
                        gesture.longPressTimer = null;
                    }
                }

                // Handle drag-with-item (moving item cursor)
                if (gesture.dragWithItem && gesture.draggedItem) {
                    // Note: Item cursor position is handled by UIScene

                    // If inventory is open, check if over another inventory item
                    if (this.inventoryOpen) {
                        // UIScene handles item-outside-inventory detection and combine labels
                        return;
                    }

                    // Check hotspot under finger for visual feedback
                    const hotspot = this.getHotspotAtPointer(pointer);
                    if (hotspot !== gesture.hoveredHotspot) {
                        gesture.hoveredHotspot = hotspot;
                        this.setCrosshairHover(hotspot);
                    }
                    return;
                }

                // Handle drag-to-explore (show hotspot labels)
                if (gesture.isDragging && !gesture.isLongPress) {
                    const hotspot = this.getHotspotAtPointer(pointer);

                    // Update label if hotspot changed
                    if (hotspot !== gesture.hoveredHotspot) {
                        gesture.hoveredHotspot = hotspot;
                        this.setCrosshairHover(hotspot);
                    }
                }
            }

            // Helper to calculate distance between two points
            getDistance(p1, p2) {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                return Math.sqrt(dx * dx + dy * dy);
            }

            // Find hotspot at pointer position (uses world coordinates)
            // Note: hotspot coordinates are already in pixels (converted in RoomScene.createHotspotsFromData)
            getHotspotAtPointer(pointer) {
                if (!this.hotspots || this.hotspots.length === 0) return null;

                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;
                const worldX = pointer.x + scrollX;
                const worldY = pointer.y + scrollY;

                for (const hotspot of this.hotspots) {
                    if (hotspot.polygon && hotspot.polygon.length >= 3) {
                        // Polygon hotspot - coordinates already in pixels
                        if (this.pointInPolygon(worldX, worldY, hotspot.polygon)) {
                            return hotspot;
                        }
                    } else {
                        // Rectangle hotspot - coordinates already in pixels
                        const w = hotspot.w || 80;
                        const h = hotspot.h || 80;
                        const left = hotspot.x - w / 2;
                        const right = hotspot.x + w / 2;
                        const top = hotspot.y - h / 2;
                        const bottom = hotspot.y + h / 2;

                        if (worldX >= left && worldX <= right && worldY >= top && worldY <= bottom) {
                            return hotspot;
                        }
                    }
                }

                return null;
            }

            // Find inventory item at pointer position (delegates to UIScene)
            getInventoryItemAtPointer(pointer) {
                if (!TSH.State.isInventoryOpen()) return null;
                const uiScene = this.scene.get('UIScene');
                if (!uiScene) return null;
                const slot = uiScene.getSlotAtPointer(pointer);
                return slot ? slot.item : null;
            }

            // Examine a hotspot (show look description)
            examineHotspot(hotspot) {
                if (this.debugEnabled) return;
                const lookText = hotspot.lookResponse || hotspot.look || TSH.Defaults.examine;
                this.showDialog(lookText);
            }

            // Examine an inventory item (show description)
            examineItem(item) {
                const description = item.description || `It's a ${item.name}.`;
                this.showDialog(description);
            }

            // Combine two inventory items
            combineItems(itemA, itemB) {
                this.tryCombineItems(itemA, itemB);
            }

            handleBackgroundClick(x, y) {
                if (this.debugEnabled) return;
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
                if (this.debugEnabled) return;
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
                if (this.debugEnabled) return;
                if (!pointer.leftButtonDown()) return;
                if (this.isRunningHold) return;
                if (this.conversationActive) return;
                if (this.dialogActive) return;

                // If item is selected, use it on the hotspot
                const selectedItem = this.selectedItem;
                if (selectedItem) {
                    this.clickedUI = true;
                    if (this.isPlayerNearHotspot(hotspot)) {
                        this.useItemOnHotspot(selectedItem, hotspot);
                    } else {
                        this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                            this.useItemOnHotspot(selectedItem, hotspot);
                        }, true);  // true = running
                    }
                    return;
                }

                // Determine default action: NPCs get "Talk To", objects get "Use"
                const isNPC = hotspot.type === 'npc' || hotspot.isNPC;
                const action = isNPC ? 'Talk To' : 'Use';

                // Run to hotspot and execute action
                this.clickedUI = true;
                if (this.isPlayerNearHotspot(hotspot)) {
                    this.executeAction(action, hotspot);
                } else {
                    this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                        this.executeAction(action, hotspot);
                    }, true);  // true = running
                }
            }

            // ========== PLAYER ==========

            // Scale factors for Nate sprite (180x610 native) at each camera distance
            // Adjusted 2.25x from original ROOM_DESIGN_BIBLE targets for proper visual scale
            static PLAYER_SCALES = {
                FAR: 0.37,       // ~225px tall
                MEDIUM: 0.52,    // ~315px tall
                CLOSE: 0.66     // ~405px tall
            };

            createPlayer(spawnX, spawnY) {
                const { height } = this.scale;
                const playerY = spawnY || height * 0.75;

                // Get scale based on camera preset (default MEDIUM)
                const scale = BaseScene.PLAYER_SCALES[this.cameraPreset] || BaseScene.PLAYER_SCALES.MEDIUM;

                // Create container at spawn position (maintains compatibility with existing code)
                this.player = this.add.container(spawnX, playerY);

                // Check if sprite texture is loaded
                if (this.textures.exists('nate_idle')) {
                    // Create sprite with origin at bottom-center (feet) - default to idle
                    this.playerSprite = this.add.sprite(0, 0, 'nate_idle');
                    this.playerSprite.setOrigin(0.5, 1);  // Bottom-center
                    this.playerSprite.setScale(scale);
                    this.playerSprite.setPipeline('Light2D');

                    this.player.add(this.playerSprite);
                } else {
                    // Fallback: colored rectangle if sprite not loaded
                    console.warn('[BaseScene] nate_placeholder texture not found, using fallback rectangle');
                    const fallbackHeight = 140 * scale / BaseScene.PLAYER_SCALES.MEDIUM;  // Scale relative to MEDIUM
                    const fallbackWidth = fallbackHeight * (180 / 610);  // Maintain aspect ratio
                    const fallback = this.add.rectangle(0, -fallbackHeight / 2, fallbackWidth, fallbackHeight, 0x2ecc71);
                    fallback.setPipeline('Light2D');
                    this.player.add(fallback);
                    this.playerSprite = fallback;
                }

                // Clear leg references (no leg animation with sprite)
                this.leftLeg = null;
                this.rightLeg = null;

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

                    // Set facing direction using sprite flip (not container scale)
                    if (this.playerSprite && this.playerSprite.setFlipX) {
                        const facingLeft = targetX < this.player.x;
                        this.playerSprite.setFlipX(facingLeft);  // true = flip horizontally
                    }

                    this.isWalking = true;
                    this.startWalkAnimation(isRunning);

                    const speed = isRunning ? 750 : 450;
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
                if (!this.playerSprite || !this.playerSprite.anims) return;

                // Check if walk animation exists
                if (this.anims.exists('nate_walk')) {
                    // Calculate frameRate based on speed
                    // Walk: 450px/s at 10fps (base)
                    // Run: 750px/s at 16.67fps (1.67x faster)
                    const baseFrameRate = 10;  // Starting point for tuning
                    const frameRate = isRunning ? baseFrameRate * (750 / 450) : baseFrameRate;

                    // Play walk animation at appropriate speed
                    this.playerSprite.play('nate_walk', false);  // false = don't restart if already playing
                    this.playerSprite.anims.msPerFrame = 1000 / frameRate;  // Adjust speed dynamically
                }

                // Start footstep sounds
                this.startFootsteps(isRunning);
            }

            stopWalkAnimation() {
                if (this.playerSprite && this.playerSprite.anims) {
                    this.playerSprite.stop();  // Stop animation
                    if (this.textures.exists('nate_idle')) {
                        this.playerSprite.setTexture('nate_idle');  // Return to idle texture
                    }
                }

                this.stopFootsteps();
            }

            // Stop character movement when UI opens (inventory, dialogue, etc.)
            stopCharacterMovement() {
                if (this.walkTween) {
                    this.walkTween.stop();
                    this.walkTween = null;
                }
                this.isWalking = false;
                this.stopWalkAnimation();
                this.stopFootsteps();
            }

            // ========== FOOTSTEPS ==========

            startFootsteps(isRunning = false) {
                this.stopFootsteps(); // Clear any existing timer

                // Track running state for sound selection
                this.footstepIsRunning = isRunning;

                // Interval: walking ~400ms, running ~250ms
                const interval = isRunning ? 250 : 400;

                // Play first footstep immediately
                this.playFootstep();

                // Set up repeating timer
                this.footstepTimer = this.time.addEvent({
                    delay: interval,
                    callback: () => this.playFootstep(),
                    loop: true
                });
            }

            stopFootsteps() {
                if (this.footstepTimer) {
                    this.footstepTimer.remove();
                    this.footstepTimer = null;
                }
            }

            playFootstep() {
                // Determine which foot (alternating left/right)
                const foot = this.footstepIsLeft ? 'l' : 'r';
                this.footstepIsLeft = !this.footstepIsLeft;

                // Select variant: 75% chance of 1, 25% chance of 2
                const variant = Math.random() < 0.75 ? '1' : '2';

                // Build sound name: stepwlkl1, stepwlkr2, steprunl1, etc.
                const action = this.footstepIsRunning ? 'run' : 'wlk';
                const sfxName = `step${action}${foot}${variant}`;

                TSH.Audio.playSFX(sfxName);
            }

            // Set footstep surface type (for future surface-specific sounds)
            setFootstepSurface(surface) {
                // Currently unused - footsteps use generic walk/run sounds
                // Could be extended later for wood, stone, grass, etc.
            }

            isPlayerNearHotspot(hotspot) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    hotspot.interactX, hotspot.interactY
                );
                return dist < this.interactionRange;
            }

            // ========== HOTSPOTS ==========

            // Clean up all hotspot zones - removes them from Phaser's input system
            cleanupHotspots() {
                if (this.hotspots && this.hotspots.length > 0) {
                    console.log('[BaseScene] Cleaning up', this.hotspots.length, 'hotspots');
                    this.hotspots.forEach(hotspot => {
                        if (hotspot.zone) {
                            try {
                                // CRITICAL: disableInteractive() removes zone from Phaser's input manager
                                // This is required to stop it from receiving pointer events
                                if (hotspot.zone.input) {
                                    hotspot.zone.disableInteractive();
                                }
                                if (hotspot.zone.removeAllListeners) {
                                    hotspot.zone.removeAllListeners();
                                }
                                if (hotspot.zone.scene) {
                                    hotspot.zone.destroy();
                                }
                            } catch (e) {
                                // Zone may already be destroyed during scene transition
                                console.log('[BaseScene] Zone cleanup error (safe to ignore):', e.message);
                            }
                        }
                    });
                    this.hotspots = [];
                }

                // Clear the current hover state directly (without calling setCrosshairHover
                // which may try to draw on graphics that don't exist yet during early cleanup)
                this.currentHoveredHotspot = null;
            }

            createHotspots(hotspotData) {
                // Ensure old hotspots are cleaned up first
                this.cleanupHotspots();
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
                        if (this.inventoryOpen || this.conversationActive || this.settingsMenuOpen) return;
                        this.setCrosshairHover(hotspot);
                    });

                    zone.on('pointerout', () => {
                        if (this.inventoryOpen || this.conversationActive || this.settingsMenuOpen) return;
                        this.setCrosshairHover(null);
                    });

                    // Note: pointerdown is now handled manually in handleDesktopPointerDown/handleMobilePointerDown
                    // to support mobile gestures and consistent cross-platform behavior
                });
            }

            // Override in subclass for room-specific actions
            executeAction(action, hotspot) {
                if (this.debugEnabled) return;
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
                if (this.debugEnabled) return;
                this.showDialog(TSH.Defaults.use.replace('{item}', item.name).replace('{hotspot}', hotspot.name));
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

            // ========== CURSOR ==========

            createCrosshairCursor(width, height) {
                this.crosshairCursor = this.add.container(width / 2, height / 2);
                this.crosshairCursor.setDepth(9000);
                this.crosshairCursor.setScrollFactor(0);  // Fix to screen, not world
                this.crosshairGraphics = this.add.graphics();
                this.drawCrosshair(0xffffff);
                this.crosshairCursor.add(this.crosshairGraphics);

                // Hide cursor on mobile (no mouse pointer)
                if (this.isMobile) {
                    this.crosshairCursor.setVisible(false);
                }

                // Create arrow cursor (for edge zone transitions)
                this.arrowCursor = this.add.container(width / 2, height / 2);
                this.arrowCursor.setDepth(6000);
                this.arrowCursor.setScrollFactor(0);  // Fix to screen, not world
                this.arrowCursor.setVisible(false);
                this.arrowGraphics = this.add.graphics();
                this.arrowCursor.add(this.arrowGraphics);

            }

            createHotspotLabel(width, height) {
                // Larger text on mobile for readability
                const fontSize = this.isMobile ? '60px' : '35px';
                const strokeThickness = this.isMobile ? 5 : 3;
                const bottomPadding = this.isMobile ? 200 : 160;
                this.hotspotLabelY = height - bottomPadding;

                this.hotspotLabel = this.add.text(width / 2, this.hotspotLabelY, '', {
                    fontFamily: '"LucasArts SCUMM Solid", cursive',
                    fontSize: fontSize,
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: strokeThickness,
                    align: 'center'
                }).setOrigin(0.5).setDepth(6000).setScrollFactor(0);  // Fix to screen
            }

            drawCrosshair(color) {
                // Delegate to UIScene via state when active
                if (this.uiSceneActive) {
                    TSH.State.setUIState('crosshairColor', color);
                    return;
                }

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
                // Delegate to UIScene via state when active
                if (this.uiSceneActive) {
                    TSH.State.setUIState('edgeZone', direction);
                    return;
                }

                this.drawArrowCursor(direction);
                this.crosshairCursor.setVisible(false);
                this.arrowCursor.setVisible(true);
            }

            // Hide arrow cursor (show crosshair)
            hideArrowCursor() {
                // Delegate to UIScene via state when active
                if (this.uiSceneActive) {
                    TSH.State.setUIState('edgeZone', null);
                    return;
                }

                this.arrowCursor.setVisible(false);
                if (!this.selectedItem && !this.isMobile) {
                    this.crosshairCursor.setVisible(true);
                }
                this.arrowDirection = null;
            }

            setCrosshairHover(hotspot) {
                // Validate hotspot belongs to current room (prevents stale hotspots from previous rooms)
                if (hotspot) {
                    const hotspotId = hotspot._data?.id || hotspot.id;
                    const isValidHotspot = this.hotspots && this.hotspots.some(h => (h._data?.id || h.id) === hotspotId);
                    if (!isValidHotspot) {
                        // Stale hotspot - ignore it
                        hotspot = null;
                    }
                }

                this.currentHoveredHotspot = hotspot;
                const selectedItem = this.selectedItem;

                // Don't show hotspot labels while dialog is active, inventory is open, or settings menu is open
                if (this.dialogActive || this.inventoryOpen || this.settingsMenuOpen) {
                    this.hotspotLabel.setText('');
                    return;
                }

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
                    this.hotspotLabel.setText('');
                }
            }

            showItemCursorHighlight() {
                // Delegate to UIScene via state when active
                if (this.uiSceneActive) {
                    TSH.State.setUIState('itemCursorHighlight', true);
                    return;
                }

                if (!this.itemCursorHighlight) return;
                this.itemCursorHighlight.setVisible(true);
            }

            hideItemCursorHighlight() {
                // Delegate to UIScene via state when active
                if (this.uiSceneActive) {
                    TSH.State.setUIState('itemCursorHighlight', false);
                    return;
                }

                if (!this.itemCursorHighlight) return;
                this.itemCursorHighlight.setVisible(false);
            }

            createItemCursor() {
                this.itemCursor = this.add.container(0, 0);
                this.itemCursor.setDepth(5000);
                this.itemCursor.setScrollFactor(0);  // Fix to screen, not world
                this.itemCursor.setVisible(false);
            }

            // ========== SETTINGS MENU ==========

            createSettingsUI(width, height) {
                // Skip button creation if UIScene handles it
                if (!this.uiSceneActive) {
                    // Settings button (top right corner) - legacy, when UIScene not active
                    const btnSize = 70;
                    this.settingsButtonArea = { x: width - btnSize/2 - 15, y: btnSize/2 + 15, size: btnSize };

                    this.settingsButton = this.add.container(this.settingsButtonArea.x, this.settingsButtonArea.y);
                    this.settingsButton.setDepth(4000);
                    this.settingsButton.setScrollFactor(0);

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

                // Create blur overlay (covers entire screen when menu is open)
                this.settingsBlurOverlay = this.add.graphics();
                this.settingsBlurOverlay.fillStyle(0x000000, 0.7);
                this.settingsBlurOverlay.fillRect(0, 0, width, height);
                this.settingsBlurOverlay.setDepth(5500);
                this.settingsBlurOverlay.setScrollFactor(0);
                this.settingsBlurOverlay.setVisible(false);

                // Create settings panel
                // Responsive panel sizing
                const panelWidth = this.isMobile ? 400 : 320;
                const panelHeight = this.isMobile ? 640 : 520;
                // Store for click detection
                this.settingsPanelWidth = panelWidth;
                this.settingsPanelHeight = panelHeight;

                // Responsive sizing for mobile - larger touch targets
                const useLargeTouchTargets = this.isMobile;
                const closeSize = useLargeTouchTargets ? 56 : 32;      // 48→56 on mobile
                const checkboxSize = useLargeTouchTargets ? 48 : 24;   // 40→48 on mobile (meets standard!)
                const muteButtonSize = useLargeTouchTargets ? 52 : 28; // 44→52 on mobile
                const sliderTrackHeight = useLargeTouchTargets ? 16 : 8;
                const sliderHandleRadius = useLargeTouchTargets ? 18 : 12; // 16→18 on mobile (36px diameter)

                // Store checkbox size for later use
                this.checkboxSize = checkboxSize;

                this.settingsPanel = this.add.container(width / 2, height / 2);
                this.settingsPanel.setDepth(5600);
                this.settingsPanel.setScrollFactor(0);
                this.settingsPanel.setVisible(false);

                // Panel background
                const panelBg = this.add.graphics();
                panelBg.fillStyle(0x1a1a2e, 0.98);
                panelBg.fillRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
                panelBg.lineStyle(3, 0x6a6a8a, 1);
                panelBg.strokeRoundedRect(-panelWidth/2, -panelHeight/2, panelWidth, panelHeight, 15);
                this.settingsPanel.add(panelBg);

                // Title
                const title = this.add.text(0, -panelHeight/2 + 30, 'SETTINGS', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: this.isMobile ? '12px' : '14px',  // Smaller on mobile for space
                    color: '#ffffff'
                }).setOrigin(0.5);
                this.settingsPanel.add(title);

                // Full Screen checkbox - larger on mobile (most important control)
                this.fullscreenCheckboxSize = this.isMobile ? 64 : checkboxSize;
                const checkboxY = -panelHeight/2 + 80;

                // Create label first to measure its width
                const fullscreenLabel = this.add.text(0, 0, 'Full Screen', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: this.isMobile ? '16px' : '12px',  // Larger on mobile
                    color: '#ffffff'
                }).setOrigin(0, 0.5);

                // Center the checkbox + label group horizontally
                const gap = 15;
                const totalWidth = this.fullscreenCheckboxSize + gap + fullscreenLabel.width;
                const checkboxX = -(totalWidth / 2) + (this.fullscreenCheckboxSize / 2);
                const labelX = checkboxX + this.fullscreenCheckboxSize/2 + gap;

                const fullscreenCheckboxBg = this.add.graphics();
                this.drawCheckbox(fullscreenCheckboxBg, checkboxX, checkboxY, this.fullscreenCheckboxSize, false, false);
                this.settingsPanel.add(fullscreenCheckboxBg);

                fullscreenLabel.setPosition(labelX, checkboxY);
                this.settingsPanel.add(fullscreenLabel);

                this.fullscreenCheckboxBg = fullscreenCheckboxBg;
                this.fullscreenCheckboxHovered = false;
                this.fullscreenChecked = false;
                this.fullscreenCheckboxArea = {
                    x: checkboxX,
                    y: checkboxY,
                    width: totalWidth,
                    height: this.fullscreenCheckboxSize
                };

                // ========== VOLUME SECTION ==========
                const volumeSectionY = this.isMobile ? -panelHeight/2 + 190 : -panelHeight/2 + 130;  // More breathing room on mobile

                // Volume header
                const volumeHeader = this.add.text(0, volumeSectionY, 'VOLUME', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: '12px',
                    color: '#aaaacc'
                }).setOrigin(0.5);
                this.settingsPanel.add(volumeHeader);

                // Slider configuration - labels above, controls below
                const sliderConfig = {
                    startX: -panelWidth/2 + (this.isMobile ? 30 : 25),  // More margin on mobile
                    trackWidth: this.isMobile ? 200 : 180,              // Wider track on mobile
                    trackHeight: sliderTrackHeight,      // 16px mobile, 8px desktop
                    handleRadius: sliderHandleRadius,    // 18px mobile, 12px desktop
                    rowHeight: this.isMobile ? 105 : 70,                // More spacing on mobile (85→105)
                    muteSize: muteButtonSize             // 52px mobile, 28px desktop
                };

                // Initialize volume slider state
                this.volumeSliders = {};
                this.volumeMuted = {
                    master: false,
                    music: false,
                    sfx: false
                };
                this.volumeBeforeMute = {
                    master: 1.0,
                    music: 0.7,
                    sfx: 0.8
                };

                // Create sliders for each volume category
                const volumeCategories = [
                    { key: 'master', label: 'Master', y: volumeSectionY + 50 },
                    { key: 'music', label: 'Music', y: volumeSectionY + 50 + sliderConfig.rowHeight },
                    { key: 'sfx', label: 'Effects', y: volumeSectionY + 50 + sliderConfig.rowHeight * 2 }
                ];

                volumeCategories.forEach(cat => {
                    this.createVolumeSlider(cat.key, cat.label, cat.y, sliderConfig, panelWidth);
                });

                // Return to Game button
                const btnWidth = this.isMobile ? 280 : 220;  // Wider on mobile
                const btnHeight = this.isMobile ? 60 : 50;   // Taller on mobile
                const btnY = panelHeight/2 - 50;

                const returnBtn = this.add.container(0, btnY);

                const returnBtnBg = this.add.graphics();
                returnBtnBg.fillStyle(0x4a6a4a, 1);
                returnBtnBg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                returnBtnBg.lineStyle(2, 0x6a8a6a, 1);
                returnBtnBg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                returnBtn.add(returnBtnBg);

                const returnBtnText = this.add.text(0, 0, 'Return to Game', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: this.isMobile ? '14px' : '12px',  // Larger on mobile
                    color: '#ffffff'
                }).setOrigin(0.5);
                returnBtn.add(returnBtnText);

                // Make button interactive
                const hitArea = new Phaser.Geom.Rectangle(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight);
                returnBtn.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

                this.settingsPanel.add(returnBtn);
                this.settingsReturnBtn = returnBtn;
                this.settingsReturnBtnBg = returnBtnBg;
                this.settingsReturnBtnHovered = false;

                // Version number above Return button
                const versionText = this.add.text(0, btnY - 45, 'v0.1.19', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: '14px',
                    color: '#ffffff'
                }).setOrigin(0.5);
                this.settingsPanel.add(versionText);

                // Listen for fullscreen changes (user might exit via Escape or browser controls)
                this.scale.on('fullscreenchange', () => {
                    this.updateFullscreenCheckbox();
                });

                // Initialize checkbox state
                this.fullscreenChecked = this.scale.isFullscreen;
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

            drawCheckbox(graphics, x, y, size, checked, hovered) {
                graphics.clear();

                // Background
                const bgColor = hovered ? 0x5a5a7a : 0x3a3a5a;
                graphics.fillStyle(bgColor, 1);
                graphics.fillRoundedRect(x - size/2, y - size/2, size, size, 4);

                // Border
                const borderColor = hovered ? 0x8a8aaa : 0x6a6a8a;
                graphics.lineStyle(2, borderColor, 1);
                graphics.strokeRoundedRect(x - size/2, y - size/2, size, size, 4);

                // Checkmark if checked
                if (checked) {
                    graphics.lineStyle(3, 0x88ff88, 1);
                    graphics.beginPath();
                    graphics.moveTo(x - size/4, y);
                    graphics.lineTo(x - size/12, y + size/4);
                    graphics.lineTo(x + size/3, y - size/4);
                    graphics.strokePath();
                }
            }

            createVolumeSlider(key, label, y, config, panelWidth) {
                const slider = {
                    key: key,
                    y: y,
                    config: config,
                    hovered: false,
                    muteHovered: false,
                    dragging: false
                };

                // Label above the controls (left-aligned)
                const labelOffset = this.isMobile ? -38 : -22;  // More space on mobile for larger controls
                const labelText = this.add.text(config.startX, y + labelOffset, label, {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: '10px',
                    color: '#ffffff'
                }).setOrigin(0, 0.5);
                this.settingsPanel.add(labelText);
                slider.label = labelText;

                // Mute button (left side)
                const muteX = config.startX + config.muteSize/2;
                const muteBg = this.add.graphics();
                this.drawMuteButton(muteBg, muteX, y, config.muteSize, false, false);
                this.settingsPanel.add(muteBg);
                slider.muteBg = muteBg;
                slider.muteArea = { x: muteX, y: y, size: config.muteSize };

                // Slider track (after mute button)
                const trackX = config.startX + config.muteSize + 15;
                const trackBg = this.add.graphics();
                this.drawSliderTrack(trackBg, trackX, y, config.trackWidth, config.trackHeight, TSH.Audio.getVolume(key));
                this.settingsPanel.add(trackBg);
                slider.trackBg = trackBg;
                slider.trackX = trackX;

                // Slider handle
                const handleBg = this.add.graphics();
                const handleX = trackX + TSH.Audio.getVolume(key) * config.trackWidth;
                this.drawSliderHandle(handleBg, handleX, y, config.handleRadius, false);
                this.settingsPanel.add(handleBg);
                slider.handleBg = handleBg;

                // Percentage text (after track, right-aligned within panel)
                const percentText = this.add.text(panelWidth/2 - 25, y, Math.round(TSH.Audio.getVolume(key) * 100) + '%', {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: '10px',
                    color: '#aaaaaa'
                }).setOrigin(1, 0.5);  // Right-aligned
                this.settingsPanel.add(percentText);
                slider.percentText = percentText;

                // Define hit areas - extend beyond track to include handle at edges
                slider.trackArea = {
                    x: trackX - config.handleRadius,
                    y: y,
                    width: config.trackWidth + config.handleRadius * 2,
                    height: config.trackHeight + config.handleRadius * 2
                };
                // Store actual track bounds for value calculation
                slider.trackBounds = {
                    x: trackX,
                    width: config.trackWidth
                };

                this.volumeSliders[key] = slider;
            }

            drawMuteButton(graphics, x, y, size, muted, hovered) {
                graphics.clear();

                // Background
                const bgColor = hovered ? 0x5a5a7a : 0x3a3a5a;
                graphics.fillStyle(bgColor, 1);
                graphics.fillRoundedRect(x - size/2, y - size/2, size, size, 4);

                // Border
                const borderColor = hovered ? 0x8a8aaa : 0x6a6a8a;
                graphics.lineStyle(2, borderColor, 1);
                graphics.strokeRoundedRect(x - size/2, y - size/2, size, size, 4);

                // Icon (speaker) - scale relative to original 28px design
                const iconScale = size / 28;
                const iconColor = muted ? 0x888888 : 0xffffff;
                graphics.fillStyle(iconColor, 1);

                // Speaker body (rectangle) - scaled
                const bodyWidth = (28/5) * iconScale;
                const bodyHeight = (28/3) * iconScale;
                graphics.fillRect(x - (28/5) * iconScale, y - (28/6) * iconScale, bodyWidth, bodyHeight);

                // Speaker cone (triangle) - scaled
                graphics.beginPath();
                graphics.moveTo(x, y - (28/6) * iconScale);
                graphics.lineTo(x + (28/4) * iconScale, y - (28/3) * iconScale);
                graphics.lineTo(x + (28/4) * iconScale, y + (28/3) * iconScale);
                graphics.lineTo(x, y + (28/6) * iconScale);
                graphics.closePath();
                graphics.fill();

                // Sound waves or X for muted - scaled
                if (muted) {
                    // Draw X
                    graphics.lineStyle(2, 0xff6666, 1);
                    graphics.beginPath();
                    graphics.moveTo(x - (28/3) * iconScale, y - (28/4) * iconScale);
                    graphics.lineTo(x + (28/3) * iconScale, y + (28/4) * iconScale);
                    graphics.moveTo(x + (28/3) * iconScale, y - (28/4) * iconScale);
                    graphics.lineTo(x - (28/3) * iconScale, y + (28/4) * iconScale);
                    graphics.strokePath();
                }
            }

            drawSliderTrack(graphics, x, y, width, height, value) {
                graphics.clear();

                // Background track
                graphics.fillStyle(0x2a2a4a, 1);
                graphics.fillRoundedRect(x, y - height/2, width, height, height/2);

                // Filled portion
                const filledWidth = value * width;
                if (filledWidth > 0) {
                    graphics.fillStyle(0x6a8aaa, 1);
                    graphics.fillRoundedRect(x, y - height/2, filledWidth, height, height/2);
                }

                // Border
                graphics.lineStyle(1, 0x4a4a6a, 1);
                graphics.strokeRoundedRect(x, y - height/2, width, height, height/2);
            }

            drawSliderHandle(graphics, x, y, radius, hovered) {
                graphics.clear();

                // Outer circle
                const outerColor = hovered ? 0x8aaacc : 0x6a8aaa;
                graphics.fillStyle(outerColor, 1);
                graphics.fillCircle(x, y, radius);

                // Inner circle
                graphics.fillStyle(0xffffff, 1);
                graphics.fillCircle(x, y, radius * 0.6);

                // Border
                graphics.lineStyle(1, 0x4a6a8a, 1);
                graphics.strokeCircle(x, y, radius);
            }

            updateVolumeSlider(key, value, updateAudio = true) {
                const slider = this.volumeSliders[key];
                if (!slider) return;

                const config = slider.config;

                // Clamp value
                value = Phaser.Math.Clamp(value, 0, 1);

                // Update track fill
                this.drawSliderTrack(slider.trackBg, slider.trackX, slider.y, config.trackWidth, config.trackHeight, value);

                // Update handle position
                const handleX = slider.trackX + value * config.trackWidth;
                this.drawSliderHandle(slider.handleBg, handleX, slider.y, config.handleRadius, slider.hovered);

                // Update percentage text
                slider.percentText.setText(Math.round(value * 100) + '%');

                // Update audio system
                if (updateAudio) {
                    TSH.Audio.setVolume(key, value);
                }

                // Update mute state if volume > 0
                if (value > 0 && this.volumeMuted[key]) {
                    this.volumeMuted[key] = false;
                    this.drawMuteButton(slider.muteBg, slider.muteArea.x, slider.y, config.muteSize, false, false);
                }
            }

            toggleVolumeMute(key) {
                const slider = this.volumeSliders[key];
                if (!slider) return;

                if (this.volumeMuted[key]) {
                    // Unmute - restore previous volume
                    this.volumeMuted[key] = false;
                    this.updateVolumeSlider(key, this.volumeBeforeMute[key]);
                } else {
                    // Mute - save current volume and set to 0
                    this.volumeBeforeMute[key] = TSH.Audio.getVolume(key);
                    this.volumeMuted[key] = true;
                    this.updateVolumeSlider(key, 0);
                }

                // Redraw mute button
                this.drawMuteButton(slider.muteBg, slider.muteArea.x, slider.y, slider.config.muteSize, this.volumeMuted[key], false);
            }

            updateSettingsButtonState() {
                const showFilled = this.settingsButtonHovered || this.settingsMenuOpen;
                if (this.settingsBtnHollow) this.settingsBtnHollow.setVisible(!showFilled);
                if (this.settingsBtnFilled) this.settingsBtnFilled.setVisible(showFilled);
            }

            isClickOnSettingsButton(pointer) {
                if (!this.settingsButtonArea) return false;
                const btn = this.settingsButtonArea;
                return pointer.x >= btn.x - btn.size/2 && pointer.x <= btn.x + btn.size/2 &&
                       pointer.y >= btn.y - btn.size/2 && pointer.y <= btn.y + btn.size/2;
            }

            isClickOnSettingsReturnButton(pointer) {
                if (!this.settingsReturnBtn || !this.settingsPanel) return false;
                const { width, height } = this.scale;
                // Panel is centered on screen
                const panelX = width / 2;
                const panelY = height / 2;
                // Button is at bottom of panel
                const panelHeight = this.settingsPanelHeight || 520;
                const btnY = panelY + (panelHeight / 2 - 50);
                const btnWidth = 220;
                const btnHeight = 50;

                return pointer.x >= panelX - btnWidth/2 && pointer.x <= panelX + btnWidth/2 &&
                       pointer.y >= btnY - btnHeight/2 && pointer.y <= btnY + btnHeight/2;
            }

            isClickOnSettingsCloseButton(pointer) {
                // Close button removed - always return false
                return false;
            }

            isClickOnFullscreenCheckbox(pointer) {
                if (!this.fullscreenCheckboxArea || !this.settingsPanel) return false;
                const { width, height } = this.scale;
                // Panel is centered on screen
                const panelX = width / 2;
                const panelY = height / 2;
                // Checkbox position relative to panel
                const cb = this.fullscreenCheckboxArea;
                const cbLeft = panelX + cb.x - cb.height/2;
                const cbTop = panelY + cb.y - cb.height/2;

                return pointer.x >= cbLeft && pointer.x <= cbLeft + cb.width &&
                       pointer.y >= cbTop && pointer.y <= cbTop + cb.height;
            }

            toggleFullscreen() {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                    // Update checkbox immediately (don't wait for event)
                    this.fullscreenChecked = false;
                } else {
                    this.scale.startFullscreen();
                    // Update checkbox immediately (don't wait for event)
                    this.fullscreenChecked = true;
                }
                // Redraw checkbox with new state
                if (this.fullscreenCheckboxBg && this.fullscreenCheckboxArea) {
                    const cb = this.fullscreenCheckboxArea;
                    this.drawCheckbox(this.fullscreenCheckboxBg, cb.x, cb.y, this.fullscreenCheckboxSize, this.fullscreenChecked, this.fullscreenCheckboxHovered);
                }
            }

            updateFullscreenCheckbox() {
                this.fullscreenChecked = this.scale.isFullscreen;
                if (this.fullscreenCheckboxBg && this.fullscreenCheckboxArea) {
                    const cb = this.fullscreenCheckboxArea;
                    this.drawCheckbox(this.fullscreenCheckboxBg, cb.x, cb.y, this.fullscreenCheckboxSize, this.fullscreenChecked, this.fullscreenCheckboxHovered);
                }
            }

            isClickOnVolumeMuteButton(pointer) {
                if (!this.volumeSliders || !this.settingsPanel) return false;
                const { width, height } = this.scale;
                const panelX = width / 2;
                const panelY = height / 2;

                for (const key of Object.keys(this.volumeSliders)) {
                    const slider = this.volumeSliders[key];
                    const muteArea = slider.muteArea;
                    const btnX = panelX + muteArea.x;
                    const btnY = panelY + muteArea.y;
                    const halfSize = muteArea.size / 2;

                    if (pointer.x >= btnX - halfSize && pointer.x <= btnX + halfSize &&
                        pointer.y >= btnY - halfSize && pointer.y <= btnY + halfSize) {
                        this.toggleVolumeMute(key);
                        return true;
                    }
                }
                return false;
            }

            isClickOnVolumeSlider(pointer) {
                if (!this.volumeSliders || !this.settingsPanel) return false;
                const { width, height } = this.scale;
                const panelX = width / 2;
                const panelY = height / 2;

                for (const key of Object.keys(this.volumeSliders)) {
                    const slider = this.volumeSliders[key];
                    const track = slider.trackArea;
                    const trackLeft = panelX + track.x;
                    const trackTop = panelY + track.y - track.height / 2;

                    if (pointer.x >= trackLeft && pointer.x <= trackLeft + track.width &&
                        pointer.y >= trackTop && pointer.y <= trackTop + track.height) {
                        // Start dragging
                        this.draggingVolumeSlider = key;
                        // Immediately update to clicked position
                        this.updateVolumeSliderDrag(pointer);
                        return true;
                    }
                }
                return false;
            }

            updateVolumeSliderDrag(pointer) {
                if (this.debugEnabled) return;
                if (!this.draggingVolumeSlider) return;

                const key = this.draggingVolumeSlider;
                const slider = this.volumeSliders[key];
                if (!slider) return;

                const { width, height } = this.scale;
                const panelX = width / 2;
                // Use trackBounds for value calculation (actual track, not hit area)
                const bounds = slider.trackBounds || slider.trackArea;
                const trackLeft = panelX + bounds.x;
                const trackWidth = bounds.width;

                // Calculate value from pointer position
                const relativeX = pointer.x - trackLeft;
                const value = Phaser.Math.Clamp(relativeX / trackWidth, 0, 1);

                this.updateVolumeSlider(key, value);
            }

            stopVolumeSliderDrag() {
                this.draggingVolumeSlider = null;
            }

            checkVolumeSliderClickByHover() {
                if (!this.volumeSliders) return false;

                for (const key of Object.keys(this.volumeSliders)) {
                    const slider = this.volumeSliders[key];

                    // Check if mute button is hovered
                    if (slider.muteHovered) {
                        this.toggleVolumeMute(key);
                        return true;
                    }

                    // Check if slider track is hovered (start drag)
                    if (slider.hovered && !slider.muteHovered) {
                        this.draggingVolumeSlider = key;
                        // Immediately update to clicked position using activePointer
                        this.updateVolumeSliderDrag(this.input.activePointer);
                        return true;
                    }
                }
                return false;
            }

            syncVolumeSliders() {
                if (!this.volumeSliders) return;

                for (const key of Object.keys(this.volumeSliders)) {
                    const currentVolume = TSH.Audio.getVolume(key);
                    // Check if muted (volume is 0 but was previously set)
                    if (currentVolume === 0 && !this.volumeMuted[key]) {
                        // Assume it was muted externally
                        this.volumeMuted[key] = true;
                    }
                    this.updateVolumeSlider(key, currentVolume, false);

                    // Update mute button visual
                    const slider = this.volumeSliders[key];
                    this.drawMuteButton(slider.muteBg, slider.muteArea.x, slider.y, slider.config.muteSize, this.volumeMuted[key], false);
                }
            }

            openSettingsMenu() {
                // Block if debug mode is active or if dialogue or conversation is active
                if (this.debugEnabled) return;
                if (this.dialogActive || this.conversationActive) return;
                if (this.settingsMenuOpen) return;

                // When UIScene handles buttons, use state-driven approach
                if (this.uiSceneActive) {
                    TSH.State.setUIState('settingsOpen', true);
                    return;
                }

                // Legacy path when UIScene not active
                this.settingsMenuOpen = true;
                TSH.State.setUIState('settingsOpen', true);
                this.updateSettingsButtonState();

                // Close inventory if open
                if (this.inventoryOpen) {
                    this.toggleInventory(true);
                }

                // Stop character movement
                this.stopCharacterMovement();

                // Reset crosshair and hide hotspot label
                this.drawCrosshair(0xffffff);
                if (this.hotspotLabel) {
                    this.hotspotLabel.setVisible(false);
                    this.hotspotLabel.setText('');
                }

                // Sync fullscreen checkbox state
                this.updateFullscreenCheckbox();

                // Sync volume sliders with current audio volumes
                this.syncVolumeSliders();

                // Show overlay and panel (before pausing, so tween works)
                this.settingsBlurOverlay.setVisible(true);
                this.settingsPanel.setVisible(true);
                this.settingsPanel.setScale(1);
                this.settingsPanel.setAlpha(1);

                // Pause the game
                this.pauseGame();
            }

            closeSettingsMenu() {
                // Block all settings menu actions in debug mode
                if (this.debugEnabled) return;
                if (!this.settingsMenuOpen) return;

                // When UIScene handles buttons, use state-driven approach
                if (this.uiSceneActive) {
                    TSH.State.setUIState('settingsOpen', false);
                    return;
                }

                // Legacy path when UIScene not active
                this.settingsMenuOpen = false;
                TSH.State.setUIState('settingsOpen', false);
                this.updateSettingsButtonState();

                // Hide overlay and panel
                this.settingsBlurOverlay.setVisible(false);
                this.settingsPanel.setVisible(false);

                // Restore crosshair cursor (if no item selected, and not mobile)
                if (this.crosshairCursor && !this.selectedItem && !this.isMobile) {
                    this.crosshairCursor.setVisible(true);
                }
                // Restore item cursor if item is selected (desktop only)
                if (this.itemCursor && this.selectedItem && !this.isMobile) {
                    this.itemCursor.setVisible(true);
                }

                // Restore hotspot label visibility
                if (this.hotspotLabel) {
                    this.hotspotLabel.setVisible(true);
                }

                // Resume the game
                this.resumeGame();
            }

            updateSettingsMenuHover(pointer) {
                const btnWidth = 220;
                const btnHeight = 50;

                // Check if hovering over return button
                let overBtn = false;
                if (this.settingsReturnBtn && this.settingsPanel && this.settingsPanel.visible) {
                    const panel = this.settingsPanel;
                    const btn = this.settingsReturnBtn;
                    // Convert pointer to panel-local coordinates
                    const localX = pointer.x - panel.x;
                    const localY = pointer.y - panel.y - btn.y;

                    overBtn = localX >= -btnWidth/2 && localX <= btnWidth/2 &&
                              localY >= -btnHeight/2 && localY <= btnHeight/2;
                }

                // Update button visual state if hover changed
                if (overBtn !== this.settingsReturnBtnHovered) {
                    this.settingsReturnBtnHovered = overBtn;
                    if (this.settingsReturnBtnBg) {
                        this.settingsReturnBtnBg.clear();
                        if (overBtn) {
                            this.settingsReturnBtnBg.fillStyle(0x5a8a5a, 1);
                            this.settingsReturnBtnBg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                            this.settingsReturnBtnBg.lineStyle(2, 0x7aaa7a, 1);
                            this.settingsReturnBtnBg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                        } else {
                            this.settingsReturnBtnBg.fillStyle(0x4a6a4a, 1);
                            this.settingsReturnBtnBg.fillRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                            this.settingsReturnBtnBg.lineStyle(2, 0x6a8a6a, 1);
                            this.settingsReturnBtnBg.strokeRoundedRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 8);
                        }
                    }
                }

                if (overBtn) {
                    this.drawCrosshair(0xff0000);
                    return;
                }

                // Check if hovering over fullscreen checkbox
                let overFullscreen = false;
                if (this.fullscreenCheckboxArea && this.settingsPanel && this.settingsPanel.visible) {
                    const panel = this.settingsPanel;
                    const cb = this.fullscreenCheckboxArea;
                    // Convert pointer to panel-local coordinates
                    const localX = pointer.x - panel.x;
                    const localY = pointer.y - panel.y;

                    overFullscreen = localX >= cb.x - cb.height/2 && localX <= cb.x - cb.height/2 + cb.width &&
                                     localY >= cb.y - cb.height/2 && localY <= cb.y + cb.height/2;
                }

                // Update fullscreen checkbox visual state if hover changed
                if (overFullscreen !== this.fullscreenCheckboxHovered) {
                    this.fullscreenCheckboxHovered = overFullscreen;
                    if (this.fullscreenCheckboxBg) {
                        const cb = this.fullscreenCheckboxArea;
                        this.drawCheckbox(this.fullscreenCheckboxBg, cb.x, cb.y, this.fullscreenCheckboxSize, this.fullscreenChecked, overFullscreen);
                    }
                }

                if (overFullscreen) {
                    this.drawCrosshair(0xff0000);
                    return;
                }

                // Check if hovering over volume sliders or mute buttons
                let overVolumeControl = false;
                if (this.volumeSliders && this.settingsPanel && this.settingsPanel.visible) {
                    const panel = this.settingsPanel;
                    const localX = pointer.x - panel.x;
                    const localY = pointer.y - panel.y;

                    for (const key of Object.keys(this.volumeSliders)) {
                        const slider = this.volumeSliders[key];

                        // Check mute button
                        const muteArea = slider.muteArea;
                        const muteDx = localX - muteArea.x;
                        const muteDy = localY - muteArea.y;
                        const overMute = Math.abs(muteDx) <= muteArea.size/2 && Math.abs(muteDy) <= muteArea.size/2;

                        // Check slider track
                        const track = slider.trackArea;
                        const overTrack = localX >= track.x && localX <= track.x + track.width &&
                                          localY >= track.y - track.height/2 && localY <= track.y + track.height/2;

                        const wasHovered = slider.hovered;
                        slider.hovered = overMute || overTrack;

                        // Update mute button visual if hover changed
                        if (overMute !== slider.muteHovered) {
                            slider.muteHovered = overMute;
                            this.drawMuteButton(slider.muteBg, muteArea.x, slider.y, slider.config.muteSize, this.volumeMuted[key], overMute);
                        }

                        // Update slider handle visual if hover changed
                        if (wasHovered !== slider.hovered) {
                            const value = TSH.Audio.getVolume(key);
                            const handleX = slider.trackX + value * slider.config.trackWidth;
                            this.drawSliderHandle(slider.handleBg, handleX, slider.y, slider.config.handleRadius, slider.hovered);
                        }

                        if (overMute || overTrack) {
                            overVolumeControl = true;
                        }
                    }
                }

                if (overVolumeControl) {
                    this.drawCrosshair(0xff0000);
                    return;
                }

                // Check settings button (gear icon)
                if (this.settingsButtonArea) {
                    const btn = this.settingsButtonArea;
                    const overGear = pointer.x >= btn.x - btn.size/2 && pointer.x <= btn.x + btn.size/2 &&
                                     pointer.y >= btn.y - btn.size/2 && pointer.y <= btn.y + btn.size/2;
                    if (overGear) {
                        this.drawCrosshair(0xff0000);
                        return;
                    }
                }

                // Default to white
                this.drawCrosshair(0xffffff);
            }

            pauseGame() {
                // Don't pause audio - let it play so volume changes can be heard
                // TSH.Audio.pauseAll();

                // Pause all tweens
                this.tweens.pauseAll();

                // Pause scene time (affects time.addEvent timers)
                this.time.paused = true;
            }

            resumeGame() {
                // Audio wasn't paused, so no need to resume
                // TSH.Audio.resumeAll();

                // Resume all tweens
                this.tweens.resumeAll();

                // Resume scene time
                this.time.paused = false;
            }

            toggleInventory(silent = false) {
                // Block all inventory actions in debug mode
                if (this.debugEnabled) return;

                // State-driven approach - UIScene handles the panel
                const newState = !TSH.State.isInventoryOpen();
                TSH.State.setInventoryOpen(newState);
                // Local state is synced via onUIStateChanged
            }

            addToInventory(item) {
                // Prevent duplicates
                if (this.hasItem(item.id)) {
                    console.log('[' + this.scene.key + '] Item already in inventory:', item.id);
                    return false;
                }

                // Add to TSH.State - UIScene updates display via inventoryChanged event
                TSH.State.addItem(item.id);

                console.log('[' + this.scene.key + '] Added to inventory:', item.id, 'Total items:', TSH.State.getInventory().length);

                return true;
            }

            hasItem(itemId) {
                return TSH.State.hasItem(itemId);
            }

            removeFromInventory(itemId) {
                if (!TSH.State.hasItem(itemId)) return false;

                // Remove from TSH.State - UIScene updates display via inventoryChanged event
                TSH.State.removeItem(itemId);

                // If this was the selected item, clear selection
                if (this.selectedItem && this.selectedItem.id === itemId) {
                    this.selectedItem = null;
                    TSH.State.clearSelectedItem();
                }

                return true;
            }

            tryCombineItems(itemA, itemB) {
                // itemA = selected item (cursor), itemB = clicked item (in slot)
                console.log('[Inventory] Trying to combine:', itemA.id, '+', itemB.id);

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
                    console.log('[Inventory] Combination successful! Produced:', result.produces);
                }

                // Show dialogue
                this.showDialog(result.dialogue);
            }

            selectItem(item) {
                // Block all item selection actions in debug mode
                if (this.debugEnabled) return;

                // Toggle off if clicking the same item
                if (this.selectedItem && this.selectedItem.id === item.id) {
                    this.deselectItem();
                    return;
                }

                // Update local state
                this.selectedItem = item;

                // Notify TSH.State (triggers UIScene to update cursor)
                TSH.State.setSelectedItem(item.id);
            }

            deselectItem() {
                // Block all item deselection actions in debug mode
                if (this.debugEnabled) return;
                console.log('[BaseScene] deselectItem called');
                this.selectedItem = null;

                // Notify TSH.State (triggers UIScene to update cursor)
                TSH.State.clearSelectedItem();

                // Clear hotspot label
                if (this.hotspotLabel) {
                    this.hotspotLabel.setText('');
                }
            }

            // ========== DIALOGUE ==========

            createDialogUI(width, height) {
                this.speechBubble = this.add.container(0, 0);
                this.speechBubble.setDepth(7000);
                this.speechBubble.setVisible(false);

                // Larger text on mobile for readability
                const fontSize = this.isMobile ? '60px' : '35px';
                const strokeThickness = this.isMobile ? 5 : 3;
                const lineSpacing = this.isMobile ? 4 : 2;

                this.dialogText = this.add.text(0, 0, '', {
                    fontFamily: '"LucasArts SCUMM Solid", cursive',
                    fontSize: fontSize,
                    color: '#ffffff',
                    align: 'center',
                    wordWrap: { width: width * 0.85 },
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
                TSH.State.setUIState('dialogActive', true);
                this.dialogSkipReady = false;
                if (this.walkTween) { this.walkTween.stop(); this.walkTween = null; }
                this.isWalking = false;
                this.stopWalkAnimation();
                if (this.crosshairCursor) this.crosshairCursor.setVisible(false);
                if (this.hotspotLabel) this.hotspotLabel.setText('');
                this.time.delayedCall(200, () => { this.dialogSkipReady = true; });
            }

            endDialogSequence() {
                this.dialogActive = false;
                TSH.State.setUIState('dialogActive', false);
                this.dialogSkipReady = false;
                if (this.crosshairCursor && !this.selectedItem && !this.isMobile) {
                    this.crosshairCursor.setVisible(true);
                }
                // Refresh hotspot label if cursor is over a hotspot
                if (this.currentHoveredHotspot) {
                    this.setCrosshairHover(this.currentHoveredHotspot);
                }
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
                    // Hide UIScene's dialog overlay too
                    const uiScene = this.scene.get('UIScene');
                    if (uiScene && uiScene.hideDialogOverlay) {
                        uiScene.hideDialogOverlay();
                    }
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
                if (!this.dialogActive) {
                    this.startDialogSequence();
                }

                // When inventory is open, use UIScene's dialog overlay (renders above inventory)
                const uiScene = this.scene.get('UIScene');
                if (TSH.State.isInventoryOpen() && uiScene && uiScene.showDialogOverlay) {
                    uiScene.showDialogOverlay(text);
                    this.speechBubble.setVisible(false);
                } else {
                    if (uiScene && uiScene.hideDialogOverlay) {
                        uiScene.hideDialogOverlay();
                    }
                    this.dialogText.setText(text);
                    this.updateSpeechBubblePosition();
                    this.speechBubble.setVisible(true);
                }

                const displayTime = Math.max(1500, text.length * 40);
                this.dialogTimer = this.time.delayedCall(displayTime, () => {
                    if (this.dialogQueue.length > 0) {
                        this.showSingleDialog(this.dialogQueue.shift(), true);
                    } else {
                        this.speechBubble.setVisible(false);
                        this.dialogText.setText('');
                        // Hide UIScene's dialog overlay too
                        const uiScene = this.scene.get('UIScene');
                        if (uiScene && uiScene.hideDialogOverlay) {
                            uiScene.hideDialogOverlay();
                        }
                        this.endDialogSequence();
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

                const { width, height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;

                // When inventory is open, position text at top of screen above the inventory box
                if (this.inventoryOpen) {
                    const textY = 30;  // Near top of screen
                    const textX = scrollX + width / 2;

                    // Wide word wrap - can extend past inventory box
                    this.dialogText.setWordWrapWidth(width * 0.85);
                    this.dialogText.setOrigin(0.5, 0);  // Top-center origin so text expands downward

                    this.speechBubble.setPosition(textX, textY);
                    return;
                }

                // Normal positioning: above the player
                // Reset word wrap to default
                this.dialogText.setWordWrapWidth(width * 0.85);
                this.dialogText.setOrigin(0.5, 0);

                let textX = this.player.x;
                let textY = this.player.y - 480;

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
                TSH.State.setUIState('conversationActive', true);
                this.conversationNPC = npcData;
                this.conversationData = dialogueTree;
                this.conversationState = 'start';

                // Freeze movement and hide normal UI
                this.stopCharacterMovement();

                // Keep crosshair visible during conversation (desktop only)
                if (this.crosshairCursor && !this.isMobile) {
                    this.crosshairCursor.setVisible(true);
                    this.drawCrosshair(0xffffff); // White cursor
                }

                // Show initial dialogue options
                console.log('[Conversation] Calling showDialogueOptions with start');
                this.showDialogueOptions('start');
            }

            exitConversation() {
                this.conversationActive = false;
                TSH.State.setUIState('conversationActive', false);
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

                // Restore normal cursor state (desktop only)
                if (this.crosshairCursor && !this.selectedItem && !this.isMobile) {
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

            // ========== HOTSPOT HIGHLIGHTING ==========

            showHotspotHighlights() {
                if (this.hotspotHighlightsVisible) return;
                if (!this.hotspots || this.hotspots.length === 0) return;

                this.hotspotHighlightsVisible = true;

                const { height } = this.scale;

                // Create graphics layer for highlights (high depth to be above most scene elements)
                this.hotspotHighlightGraphics = this.add.graphics();
                this.hotspotHighlightGraphics.setDepth(5000);

                // Draw circle for each hotspot
                this.hotspots.forEach(hotspot => {
                    const center = this.getHotspotCenter(hotspot, height);

                    // Small white circle with transparency
                    this.hotspotHighlightGraphics.fillStyle(0xffffff, 0.6);
                    this.hotspotHighlightGraphics.fillCircle(center.x, center.y, 8);

                    // Subtle outer ring
                    this.hotspotHighlightGraphics.lineStyle(1, 0xffffff, 0.3);
                    this.hotspotHighlightGraphics.strokeCircle(center.x, center.y, 12);
                });
            }

            hideHotspotHighlights() {
                if (!this.hotspotHighlightsVisible) return;
                this.hotspotHighlightsVisible = false;

                if (this.hotspotHighlightGraphics) {
                    this.hotspotHighlightGraphics.destroy();
                    this.hotspotHighlightGraphics = null;
                }
            }

            getHotspotCenter(hotspot, height) {
                // Check for manually specified highlight position first
                // (highlightX/highlightY in original data, converted to _highlightX/_highlightY in pixels)
                if (hotspot._highlightX !== undefined && hotspot._highlightY !== undefined) {
                    return { x: hotspot._highlightX, y: hotspot._highlightY };
                }

                // Note: hotspot.x, hotspot.y are already in pixels (converted in RoomScene.createHotspotsFromData)
                if (hotspot.polygon && hotspot.polygon.length > 0) {
                    // For polygon hotspots, find a point that's actually inside the polygon
                    const polygon = hotspot.polygon;

                    // First try: centroid (average of all vertices)
                    let centroidX = 0, centroidY = 0;
                    polygon.forEach(p => {
                        centroidX += p.x;
                        centroidY += p.y;
                    });
                    centroidX /= polygon.length;
                    centroidY /= polygon.length;

                    // Check if centroid is inside the polygon
                    if (this.pointInPolygon(centroidX, centroidY, polygon)) {
                        return { x: centroidX, y: centroidY };
                    }

                    // Fallback: try midpoints of each edge until we find one inside
                    for (let i = 0; i < polygon.length; i++) {
                        const p1 = polygon[i];
                        const p2 = polygon[(i + 1) % polygon.length];
                        const midX = (p1.x + p2.x) / 2;
                        const midY = (p1.y + p2.y) / 2;

                        if (this.pointInPolygon(midX, midY, polygon)) {
                            return { x: midX, y: midY };
                        }
                    }

                    // Last resort: use the first vertex (guaranteed to be on the boundary)
                    return { x: polygon[0].x, y: polygon[0].y };
                } else {
                    // Rectangle hotspot - x and y are already pixel coordinates
                    return {
                        x: hotspot.x,
                        y: hotspot.y
                    };
                }
            }

            // ========== UPDATE ==========

            update() {
                const pointer = this.input.activePointer;
                const { width, height } = this.scale;
                const scrollX = this.cameras.main.scrollX || 0;
                const scrollY = this.cameras.main.scrollY || 0;

                // Note: UIScene handles inventory button hover
                // Check settings button hover (screen coordinates) - only used when UIScene not active
                if (this.settingsButtonArea) {
                    const btn = this.settingsButtonArea;
                    const wasHovered = this.settingsButtonHovered;
                    this.settingsButtonHovered =
                        pointer.x >= btn.x - btn.size/2 && pointer.x <= btn.x + btn.size/2 &&
                        pointer.y >= btn.y - btn.size/2 && pointer.y <= btn.y + btn.size/2;

                    if (wasHovered !== this.settingsButtonHovered) {
                        this.updateSettingsButtonState();
                    }
                }

                // When settings menu is open, still update crosshair but skip game updates
                if (this.settingsMenuOpen) {
                    // Hide item/arrow cursors, keep crosshair (desktop only)
                    if (this.arrowCursor) this.arrowCursor.setVisible(false);
                    if (this.itemCursor) this.itemCursor.setVisible(false);
                    if (this.crosshairCursor && !this.isMobile) {
                        this.crosshairCursor.setVisible(true);
                        this.crosshairCursor.setPosition(pointer.x, pointer.y);
                    }
                    // Check if hovering over settings UI elements
                    this.updateSettingsMenuHover(pointer);
                    return;
                }

                // Update crosshair position (screen coordinates - scrollFactor 0)
                if (this.crosshairCursor && this.crosshairCursor.visible) {
                    this.crosshairCursor.setPosition(pointer.x, pointer.y);
                }

                // Update arrow cursor position (screen coordinates - scrollFactor 0)
                if (this.arrowCursor && this.arrowCursor.visible) {
                    this.arrowCursor.setPosition(pointer.x, pointer.y);
                }

                // Update item cursor position (screen coordinates - scrollFactor 0)
                const selectedItem = this.selectedItem;
                if (selectedItem && this.itemCursor && this.itemCursor.visible) {
                    this.itemCursor.setPosition(pointer.x + 20, pointer.y + 20);
                }

                // Update hotspot label position (screen coordinates - scrollFactor 0)
                if (this.hotspotLabel) {
                    let labelX, labelY;
                    const p = 4; // Pixel size minimum
                    const labelOffset = this.isMobile ? p*35 : p*25;

                    if (selectedItem && this.itemCursor && this.itemCursor.visible) {
                        // Position above item cursor
                        labelX = pointer.x + 20;
                        labelY = pointer.y - labelOffset;
                    } else {
                        // Position above crosshair cursor
                        labelX = pointer.x;
                        labelY = pointer.y - labelOffset;
                    }

                    // Keep label on screen
                    const halfWidth = this.hotspotLabel.width / 2 || 100;
                    labelX = Phaser.Math.Clamp(labelX, halfWidth + 10, width - halfWidth - 10);
                    labelY = Math.max(labelY, 30);

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

                            const speed = 750;
                            const delta = this.game.loop.delta / 1000;
                            const moveSpeed = speed * delta;
                            const moveX = (dx / dist) * Math.min(moveSpeed, dist);
                            const moveY = (dy / dist) * Math.min(moveSpeed, dist);

                            this.player.x += moveX;
                            this.player.y += moveY;

                            // Set facing direction using sprite flip (not container scale)
                            if (this.playerSprite && this.playerSprite.setFlipX) {
                                if (dx < -1) this.playerSprite.setFlipX(true);  // Face left
                                else if (dx > 1) this.playerSprite.setFlipX(false);  // Face right
                            }

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
