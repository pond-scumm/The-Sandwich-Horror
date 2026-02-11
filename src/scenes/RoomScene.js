// ============================================================================
// ROOM SCENE - Generic Data-Driven Room Renderer
// ============================================================================
// A single scene class that can render any room by reading its definition
// from TSH.Rooms. This replaces the need for per-room scene classes.
//
// Features:
//   - Parallax layer system (multiple layers with different scroll speeds)
//   - Supports both procedural and image-based layers
//   - Data-driven hotspots, exits, spawns
//   - Integrates with TSH.Style for consistent visuals
// ============================================================================

class RoomScene extends BaseScene {
    constructor() {
        super({ key: 'RoomScene' });
        this.roomId = null;
        this.roomData = null;
        this.layers = [];  // Stores rendered layer sprites
    }

    // Called before create() - receives data passed from scene.start()
    init(data) {
        // Get room ID from: passed data > saved state > default
        this.roomId = data?.roomId || TSH.State.getCurrentRoom() || 'interior';
        this.roomData = TSH.Rooms[this.roomId];

        // If no room data exists, redirect to legacy scene
        if (!this.roomData) {
            console.log('[RoomScene] No room data for:', this.roomId, '- redirecting to legacy scene');
            this.shouldRedirect = true;
            this.redirectTarget = this.roomId;
            // Use minimal default data to prevent errors during redirect
            this.roomData = this.getDefaultRoomData();
            return;
        }

        this.shouldRedirect = false;

        // Apply room config to scene
        this.worldWidth = this.roomData.worldWidth || 1280;
        this.screenWidth = this.roomData.screenWidth || 1280;

        // Handle walkable area - compute minY/maxY from polygon if needed
        const wa = this.roomData.walkableArea || { minY: 0.72, maxY: 0.92 };
        if (wa.polygon && wa.polygon.length >= 3) {
            // Compute bounding box from polygon for backwards compatibility
            const ys = wa.polygon.map(p => p.y);
            this.walkableArea = {
                polygon: wa.polygon,
                minY: Math.min(...ys),
                maxY: Math.max(...ys)
            };
        } else {
            this.walkableArea = wa;
        }
    }

    // Preload image-based layers and audio
    preload() {
        super.preload();  // Load Nate sprite from BaseScene
        if (this.shouldRedirect) return;

        const room = this.roomData;

        // Load any image-based layers
        if (room.layers) {
            room.layers.forEach((layerDef, index) => {
                if (layerDef.type === 'image' && layerDef.src) {
                    const key = layerDef.src;
                    if (!this.textures.exists(key)) {
                        console.log('[RoomScene] Preloading layer image:', key);
                        this.load.image(key, key);
                    }
                }
            });
        }

        // Preload room audio
        this.preloadRoomAudio(room);

        // Preload common SFX
        this.preloadCommonSFX();
    }

    // Preload common sound effects used across all scenes
    preloadCommonSFX() {
        // Skip if running via file:// protocol
        if (window.location.protocol === 'file:') return;

        // Get all SFX from registry
        if (!TSH.SFX || !TSH.SFX.getAllForPreload) return;

        const sfxList = TSH.SFX.getAllForPreload();

        sfxList.forEach(sfx => {
            if (!this.cache.audio.exists(sfx.key)) {
                this.load.audio(sfx.key, sfx.path);
            }
        });
    }

    // Preload audio assets defined in room data
    preloadRoomAudio(room) {
        if (!room.audio) return;

        // Skip audio preload if running via file:// protocol (CORS issues)
        if (window.location.protocol === 'file:') {
            if (TSH.debug) {
                console.log('[RoomScene] Skipping audio preload (file:// protocol - use a local server for audio)');
            }
            return;
        }

        const audioToLoad = [];

        // Main music track
        if (room.audio.music?.key) {
            audioToLoad.push(room.audio.music.key);
        }

        // Additional station tracks (for radio cycling)
        if (room.audio.music?.stations && Array.isArray(room.audio.music.stations)) {
            room.audio.music.stations.forEach(station => {
                if (station.key && !audioToLoad.includes(station.key)) {
                    audioToLoad.push(station.key);
                }
            });
        }

        // Additional audio layers (ambient, etc.)
        if (room.audio.layers && Array.isArray(room.audio.layers)) {
            room.audio.layers.forEach(layer => {
                if (layer.key) {
                    audioToLoad.push(layer.key);
                }
            });
        }

        // Load each audio file if not already cached
        audioToLoad.forEach(key => {
            if (!this.cache.audio.exists(key)) {
                const musicPath = `assets/audio/music/${key}.mp3`;

                if (TSH.debug) {
                    console.log('[RoomScene] Preloading audio:', key);
                }

                // Add error handler to prevent console spam
                this.load.audio(key, musicPath);
                this.load.on('loaderror', (file) => {
                    if (file.key === key && TSH.debug) {
                        console.log(`[Audio] Could not load "${key}" - file may not exist yet`);
                    }
                });
            }
        });
    }

    // Clean up ALL interactive objects from previous room before creating new ones
    // This is critical for scene reuse - Phaser's input system retains old zone references
    cleanupPreviousRoom() {
        console.log('[RoomScene] Cleaning up previous room...');

        // CRITICAL: Cancel ALL tweens to prevent callbacks from old scene executing
        // This fixes the bug where walkTo callbacks persist across scene transitions
        if (this.walkTween) {
            this.walkTween.stop();
            this.walkTween = null;
        }
        if (this.bobTween) {
            this.bobTween.stop();
            this.bobTween = null;
        }
        // Cancel ALL tweens in the scene to be safe
        this.tweens.killAll();

        // Reset walking state
        this.isWalking = false;

        // Clean up hotspots (from BaseScene)
        if (this.cleanupHotspots) {
            this.cleanupHotspots();
        }

        // Clean up exit zones
        if (this.exitZones && this.exitZones.length > 0) {
            this.exitZones.forEach(zone => {
                if (zone) {
                    if (zone.input) zone.input.enabled = false;
                    zone.removeAllListeners();
                    zone.destroy();
                }
            });
        }
        this.exitZones = [];

        // Clean up NPC sprites
        if (this.npcSprites && Object.keys(this.npcSprites).length > 0) {
            Object.values(this.npcSprites).forEach(sprite => {
                if (sprite) sprite.destroy();
            });
        }
        this.npcSprites = {};

        // Clean up pickup overlays
        if (this.pickupOverlays && Object.keys(this.pickupOverlays).length > 0) {
            Object.values(this.pickupOverlays).forEach(overlay => {
                if (overlay) overlay.destroy();
            });
        }
        this.pickupOverlays = {};

        // Clean up layers (rendered graphics/sprites)
        if (this.layers && this.layers.length > 0) {
            this.layers.forEach(layer => {
                if (layer) layer.destroy();
            });
        }
        this.layers = [];

        // Clean up player sprite
        if (this.player) {
            this.player.destroy();
            this.player = null;
        }

        // Clean up any lingering graphics
        if (this.walkableAreaDebug) {
            this.walkableAreaDebug.destroy();
            this.walkableAreaDebug = null;
        }

        console.log('[RoomScene] Previous room cleanup complete');
    }

    create() {
        // Redirect to legacy scene if no room data exists
        if (this.shouldRedirect) {
            console.log('[RoomScene] Redirecting to legacy scene:', this.redirectTarget);
            this.scene.start(this.redirectTarget);
            return;
        }

        // CRITICAL: Clean up ALL interactive objects from previous room FIRST
        // This fixes bugs where hotspots/zones from previous rooms persist
        this.cleanupPreviousRoom();

        const { width, height } = this.scale;
        const room = this.roomData;

        console.log('[RoomScene] Creating room:', this.roomId);

        // Reset transition flags
        this.transitionInProgress = false;

        // Startup lockout - prevent transitions for first 500ms after scene creation
        // This prevents old input events from triggering immediate transitions
        this.startupLockout = true;
        this.time.delayedCall(500, () => {
            this.startupLockout = false;
            console.log('[RoomScene] Startup lockout released');
        });

        // Launch UIScene in parallel if not already running
        if (!this.scene.isActive('UIScene')) {
            this.scene.launch('UIScene');
            this.scene.bringToTop('UIScene');
        }

        // Camera setup for scrolling rooms
        this.cameras.main.setBounds(0, 0, this.worldWidth, height);

        // Setup lighting if enabled
        this.setupLighting(room);

        // Render all layers (parallax background system)
        this.renderLayers(this.worldWidth, height);

        // Call parent create (sets up UI systems)
        super.create();

        // Create hotspots from room data
        this.createHotspotsFromData(height);

        // Create pickup overlays (dynamic graphics for pickable items)
        this.createPickupOverlays(height);

        // Create exit zones
        this.createExitZones(height);

        // Create NPC sprites from room data
        this.createNPCs(height);

        // Spawn player at correct position
        this.spawnPlayer(height);

        // Center camera on player
        if (this.worldWidth > this.screenWidth) {
            this.cameras.main.scrollX = Phaser.Math.Clamp(
                this.player.x - this.screenWidth / 2,
                0,
                this.worldWidth - this.screenWidth
            );
        }

        // Handle first visit
        // DISABLED FOR FASTER TESTING - uncomment to restore first-time dialogue
        // this.handleFirstVisit();

        // Handle room audio (music, ambient)
        this.handleRoomAudio();

        // Set footstep surface from room data
        this.setFootstepSurface(this.roomData.footstepSurface || null);

        // Setup debug overlay (toggle with ` key)
        this.setupDebugOverlay();

        // Setup flag listener for dynamic hotspot updates
        if (room.relevantFlags && Array.isArray(room.relevantFlags)) {
            this.flagChangedHandler = (data) => {
                if (room.relevantFlags.includes(data.path)) {
                    console.log('[RoomScene] Relevant flag changed:', data.path, '- refreshing hotspots');
                    this.refreshHotspots();
                }
            };
            TSH.State.on('flagChanged', this.flagChangedHandler);

            // Clean up listener when scene shuts down
            this.events.once('shutdown', () => {
                if (this.flagChangedHandler) {
                    TSH.State.off('flagChanged', this.flagChangedHandler);
                }
            });
        }

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    // ========== LIGHTING SETUP ==========

    setupLighting(room) {
        if (!room.lighting?.enabled) return;

        this.lights.enable();
        const isMobile = this.isMobile;

        // Get ambient color from room data or TSH.Style
        let ambientColor;
        if (room.lighting.ambient) {
            ambientColor = isMobile
                ? (room.lighting.ambientMobile || room.lighting.ambient)
                : room.lighting.ambient;
        } else if (room.lighting.preset) {
            // Use preset from TSH.Style
            const preset = room.lighting.preset;
            ambientColor = isMobile
                ? TSH.Style.lighting.ambientMobile[preset]
                : TSH.Style.lighting.ambient[preset];
        } else {
            ambientColor = 0x888888;
        }

        this.lights.setAmbientColor(ambientColor);

        // Create dynamic light sources defined in room data
        if (room.lighting.sources) {
            room.lighting.sources.forEach(source => {
                this.createLightSource(source);
            });
        }
    }

    createLightSource(source) {
        const { height } = this.scale;
        const x = source.x;
        const y = typeof source.y === 'number' && source.y <= 1 ? height * source.y : source.y;
        const radius = source.radius || 200;
        const color = source.color || TSH.Style.lighting.sources[source.type] || 0xffffff;
        const intensity = source.intensity || 1;

        const light = this.lights.addLight(x, y, radius, color, intensity);

        // Store reference for animations
        if (source.id) {
            this[`light_${source.id}`] = light;
        }

        return light;
    }

    // ========== PARALLAX LAYER SYSTEM ==========

    renderLayers(worldWidth, height) {
        const room = this.roomData;
        this.layers = [];

        // Check if room has layer definitions
        if (room.layers && room.layers.length > 0) {
            // Render each defined layer
            room.layers.forEach((layerDef, index) => {
                const layer = this.renderLayer(layerDef, worldWidth, height, index);
                if (layer) {
                    this.layers.push(layer);
                }
            });
        } else if (room.drawRoom && typeof room.drawRoom === 'function') {
            // Legacy: single drawRoom function (no parallax)
            this.renderLegacyRoom(room, worldWidth, height);
        } else {
            // Fallback: placeholder background
            this.renderPlaceholderLayer(worldWidth, height);
        }
    }

    renderLayer(layerDef, worldWidth, height, index) {
        const {
            type = 'procedural',
            name = `layer_${index}`,
            scrollFactor = 1.0,
            depth = index * 10,
            draw,           // For procedural: function(graphics, scene, width, height)
            src,            // For image: path to image file
            x = 0,
            y = 0
        } = layerDef;

        let sprite;

        if (type === 'image' && src) {
            // Image-based layer
            sprite = this.renderImageLayer(src, x, y, worldWidth, height);
        } else if (type === 'procedural' && draw) {
            // Procedural layer with custom draw function
            sprite = this.renderProceduralLayer(name, draw, worldWidth, height);
        } else {
            console.warn(`[RoomScene] Invalid layer definition:`, layerDef);
            return null;
        }

        if (sprite) {
            sprite.setDepth(depth);
            sprite.setScrollFactor(scrollFactor);

            // Enable lighting on this layer
            if (this.roomData.lighting?.enabled) {
                sprite.setPipeline('Light2D');
            }

            // Store metadata
            sprite._layerName = name;
            sprite._layerDef = layerDef;
        }

        return sprite;
    }

    renderImageLayer(src, x, y, worldWidth, height) {
        // Check if texture exists
        if (!this.textures.exists(src)) {
            console.warn(`[RoomScene] Image not found: ${src}`);
            return null;
        }

        const sprite = this.add.image(x, y, src);
        sprite.setOrigin(0, 0);

        return sprite;
    }

    renderProceduralLayer(name, drawFn, worldWidth, height) {
        // Create unique texture name for this layer
        const textureName = `${this.roomId}_${name}`;

        // Clean up existing texture if present
        if (this.textures.exists(textureName)) {
            this.textures.remove(textureName);
        }

        // Create render texture
        const renderTexture = this.add.renderTexture(0, 0, worldWidth, height);
        const graphics = this.make.graphics({ add: false });

        // Call the draw function
        try {
            drawFn(graphics, this, worldWidth, height);
        } catch (e) {
            console.error(`[RoomScene] Error drawing layer "${name}":`, e);
        }

        // Commit to texture
        renderTexture.draw(graphics);
        graphics.destroy();

        // Save as reusable texture
        renderTexture.saveTexture(textureName);
        renderTexture.destroy();

        // Create sprite from texture
        const sprite = this.add.sprite(0, 0, textureName);
        sprite.setOrigin(0, 0);

        return sprite;
    }

    renderLegacyRoom(room, worldWidth, height) {
        // Handle old-style single drawRoom function
        const textureName = `${this.roomId}_background`;

        if (this.textures.exists(textureName)) {
            this.textures.remove(textureName);
        }

        const renderTexture = this.add.renderTexture(0, 0, worldWidth, height);
        const graphics = this.make.graphics({ add: false });

        room.drawRoom(graphics, this, worldWidth, height);

        renderTexture.draw(graphics);
        graphics.destroy();
        renderTexture.saveTexture(textureName);
        renderTexture.destroy();

        const sprite = this.add.sprite(0, 0, textureName);
        sprite.setOrigin(0, 0);
        sprite.setDepth(0);

        if (this.roomData.lighting?.enabled) {
            sprite.setPipeline('Light2D');
        }

        this.layers.push(sprite);
    }

    renderPlaceholderLayer(worldWidth, height) {
        const textureName = `${this.roomId}_placeholder`;

        if (this.textures.exists(textureName)) {
            this.textures.remove(textureName);
        }

        const graphics = this.add.graphics();
        const p = TSH.Style.pixelSize;

        // Gradient background using style colors
        const colorTop = TSH.Style.palette.wall.dark;
        const colorBottom = TSH.Style.palette.wall.mid;

        for (let y = 0; y < height; y += p) {
            const ratio = y / height;
            const r = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.IntegerToColor(colorTop),
                Phaser.Display.Color.IntegerToColor(colorBottom),
                1, ratio
            );
            graphics.fillStyle(Phaser.Display.Color.GetColor(r.r, r.g, r.b));
            graphics.fillRect(0, y, worldWidth, p);
        }

        // Floor
        const floorY = height * this.walkableArea.minY;
        graphics.fillStyle(TSH.Style.palette.floor.dark);
        graphics.fillRect(0, floorY, worldWidth, height - floorY);

        // Room name label
        const text = this.add.text(worldWidth / 2, height / 2, this.roomData.name || this.roomId, {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0.5).setDepth(5);

        graphics.setDepth(0);
        this.layers.push(graphics);
    }

    // ========== HOTSPOTS ==========

    createHotspotsFromData(height) {
        const room = this.roomData;

        // Support dynamic hotspot generation via getHotspotData function
        let hotspots;
        if (typeof room.getHotspotData === 'function') {
            console.log('[RoomScene] Using getHotspotData function');
            hotspots = room.getHotspotData(height);
            console.log('[RoomScene] getHotspotData returned:', hotspots?.length, 'hotspots');
        } else {
            console.log('[RoomScene] Using static hotspots array');
            hotspots = room.hotspots;
        }

        if (!hotspots || hotspots.length === 0) {
            console.log('[RoomScene] No hotspots to create');
            return;
        }

        const hotspotData = hotspots.map(hs => {
            const data = {
                id: hs.id,
                interactX: hs.interactX,
                interactY: height * hs.interactY,
                interactFacing: hs.interactFacing,
                name: hs.name,
                type: hs.type,
                verbLabels: hs.verbs ? {
                    actionVerb: hs.verbs.action || 'Use',
                    lookVerb: hs.verbs.look || 'Look at',
                    talkVerb: hs.verbs.talk || 'Talk to'
                } : undefined,
                lookResponse: hs.responses?.look,
                useResponse: hs.responses?.action,
                talkResponse: hs.responses?.talk,
                // Optional manual highlight position (for irregular shapes)
                _highlightX: hs.highlightX,
                _highlightY: hs.highlightY !== undefined ? height * hs.highlightY : undefined,
                _data: hs
            };

            // Check if this is a polygon or rectangle hotspot
            if (hs.polygon && hs.polygon.length >= 3) {
                // Polygon hotspot - convert y percentages to pixels
                data.polygon = hs.polygon.map(pt => ({
                    x: pt.x,
                    y: height * pt.y
                }));
                // Calculate bounding box for quick rejection tests
                const xs = data.polygon.map(p => p.x);
                const ys = data.polygon.map(p => p.y);
                data.x = (Math.min(...xs) + Math.max(...xs)) / 2;
                data.y = (Math.min(...ys) + Math.max(...ys)) / 2;
                data.w = Math.max(...xs) - Math.min(...xs);
                data.h = Math.max(...ys) - Math.min(...ys);
            } else {
                // Rectangle hotspot
                data.x = hs.x;
                data.y = height * hs.y;
                data.w = hs.w;
                data.h = height * hs.h;
            }

            return data;
        });

        this.createHotspots(hotspotData);
    }

    createPickupOverlays(height) {
        const room = this.roomData;
        this.pickupOverlays = {};

        // Check if room defines pickup overlays
        if (!room.pickupOverlays) return;

        room.pickupOverlays.forEach(overlay => {
            // Skip if item already picked up
            if (overlay.itemId && TSH.State.hasItem(overlay.itemId)) return;

            const g = this.add.graphics();
            const y = overlay.y * height;

            // Call the overlay's draw function
            if (overlay.draw && typeof overlay.draw === 'function') {
                overlay.draw(g, overlay.x, y, height);
            }

            g.setDepth(overlay.depth || 50);

            // Store reference by hotspot ID for later removal
            if (overlay.hotspotId) {
                this.pickupOverlays[overlay.hotspotId] = g;
            }
        });
    }

    // Refresh hotspots when state changes mid-room (e.g., puzzle progress)
    refreshHotspots() {
        console.log('[RoomScene] Refreshing hotspots for:', this.roomId);

        // Clean up existing hotspots
        this.cleanupHotspots();

        // Recreate hotspots with current state
        this.createHotspotsFromData(this.scale.height);

        // Recreate pickup overlays
        this.createPickupOverlays(this.scale.height);

        // Refresh debug overlay if active
        if (this.debugWorldContainer && this.debugWorldContainer.visible) {
            this.debugWorldContainer.removeAll(true);
            this.drawDebugWalkable(this.scale.height);
            this.drawDebugHotspots(this.scale.height);
            this.drawDebugExits(this.scale.height);
        }
    }

    _getNPCIdFromHotspot(hotspotId) {
        // Strip '_npc' suffix if present (earl_npc → earl)
        if (hotspotId.endsWith('_npc')) {
            return hotspotId.slice(0, -4);
        }
        // Otherwise use as-is (alien_harry → alien_harry)
        return hotspotId;
    }

    _getNPCDataForConversation(npcId, hotspot) {
        // Try sprite registry first (has current position)
        const sprite = this.npcSprites?.[npcId];
        if (sprite) {
            const npcDef = this.roomData.npcs?.find(n => n.id === npcId);
            return {
                name: npcDef?.name || hotspot.name || 'NPC',
                x: sprite.x,
                y: sprite.y
            };
        }

        // Fall back to room NPC definition
        const npcDef = this.roomData.npcs?.find(n => n.id === npcId);
        if (npcDef) {
            const x = npcDef.position.x;
            const y = typeof npcDef.position.y === 'number' && npcDef.position.y <= 1
                ? this.scale.height * npcDef.position.y
                : npcDef.position.y;
            return {
                name: npcDef.name || hotspot.name || 'NPC',
                x: x,
                y: y
            };
        }

        // Ultimate fallback: use hotspot position
        return {
            name: hotspot.name || 'NPC',
            x: hotspot.interactX || hotspot.x,
            y: hotspot.interactY || hotspot.y
        };
    }

    async executeAction(action, hotspot) {
        const hsData = hotspot._data;

        console.log('[RoomScene] executeAction:', action, 'hotspot:', hsData?.id, 'name:', hotspot.name);
        console.log('[RoomScene] Current room:', this.roomId, 'Hotspot trigger:', hsData?.actionTrigger);

        // CRITICAL: Check if this hotspot belongs to the current room
        // This prevents stale callbacks from previous rooms executing actions
        let currentRoomHotspots;
        if (typeof this.roomData?.getHotspotData === 'function') {
            currentRoomHotspots = this.roomData.getHotspotData(this.scale.height);
        } else {
            currentRoomHotspots = this.roomData?.hotspots || [];
        }
        const hotspotBelongsToRoom = currentRoomHotspots.some(h => h.id === hsData?.id);
        if (!hotspotBelongsToRoom) {
            console.warn('[RoomScene] Rejecting action from stale hotspot:', hsData?.id, '- not in current room:', this.roomId);
            return;
        }

        // Handle actionTrigger (transitions, custom actions)
        if ((action === 'Use' || action === hotspot.verbLabels?.actionVerb) && hsData?.actionTrigger) {
            const trigger = hsData.actionTrigger;

            if (trigger.type === 'transition') {
                console.log('[RoomScene] Transition action from hotspot:', hsData?.id, '-> target:', trigger.target);
                this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                    this.transitionToScene(trigger.target, trigger.spawnPoint);
                }, false, hotspot.interactFacing);
                return;
            }

            if (trigger.type === 'action') {
                const actionFn = TSH.Actions[trigger.action];
                if (actionFn) {
                    actionFn(this, hotspot);
                    return;
                }
            }
        }

        // Handle item pickup
        if ((action === 'Use' || action === hotspot.verbLabels?.actionVerb) && hsData?.giveItem) {
            const itemId = hsData.giveItem;
            const item = TSH.Items[itemId];

            if (!item) {
                console.warn('[RoomScene] giveItem references unknown item:', itemId);
                this.showDialog("I can't pick that up.");
                return;
            }

            // Check if already picked up
            if (TSH.State.hasItem(itemId)) {
                this.showDialog("I already have that.");
                return;
            }

            // Add item to inventory
            this.addToInventory(item);

            // Show pickup response
            const response = hsData.responses?.action || hsData.useResponse || `Got ${item.name}!`;
            this.showDialog(response);

            // Set flag if specified
            if (hsData.pickupFlag) {
                TSH.State.setFlag(hsData.pickupFlag, true);
            }

            // Remove hotspot if specified
            if (hsData.removeAfterPickup) {
                this.removeHotspot(hsData.id);
                // Also remove associated pickup overlay if it exists
                if (this.pickupOverlays && this.pickupOverlays[hsData.id]) {
                    this.pickupOverlays[hsData.id].destroy();
                    delete this.pickupOverlays[hsData.id];
                }
            }

            return;
        }

        // Default verb responses
        if (action === 'Use' || action === hotspot.verbLabels?.actionVerb) {
            this.showDialog(hotspot.useResponse || TSH.Defaults.use);
        } else if (action === 'Look At' || action === hotspot.verbLabels?.lookVerb) {
            this.showDialog(hotspot.lookResponse || TSH.Defaults.examine);
        } else if (action === 'Talk To' || action === hotspot.verbLabels?.talkVerb) {
            // Check if this is an NPC hotspot
            if (hotspot.type === 'npc') {
                const npcId = this._getNPCIdFromHotspot(hsData.id);

                try {
                    // Attempt to load dialogue file
                    const dialogueTree = await TSH.DialogueLoader.load(npcId);

                    // Get NPC data for conversation
                    const npcData = this._getNPCDataForConversation(npcId, hotspot);

                    // Enter conversation mode
                    this.enterConversation(npcData, dialogueTree, npcId);
                    return;
                } catch (error) {
                    // Fall through to standard dialogue on error
                    console.error('[RoomScene] Failed to load dialogue for', npcId, '- using fallback. Error:', error);
                }
            }

            // Standard dialogue fallback
            this.showDialog(hotspot.talkResponse || TSH.Defaults.talkTo);
        }
    }

    useItemOnHotspot(item, hotspot) {
        const room = this.roomData;
        const interactions = room.itemInteractions || {};
        const hsId = hotspot._data?.id || hotspot.id;

        // 1. Check for specific item + hotspot interaction
        if (interactions[hsId] && interactions[hsId][item.id]) {
            const response = interactions[hsId][item.id];

            // Handle string responses (backwards compatible)
            if (typeof response === 'string') {
                const msg = response.replace('{item}', item.name).replace('{hotspot}', hotspot.name);
                this.showDialog(msg);
                return;
            }

            // Handle action objects
            if (typeof response === 'object') {
                // Check condition first (if present)
                if (response.condition && typeof response.condition === 'function') {
                    if (!response.condition()) {
                        // Condition failed - show failDialogue
                        const failMsg = response.failDialogue || '';
                        if (failMsg) {
                            this.showDialog(failMsg.replace('{item}', item.name).replace('{hotspot}', hotspot.name));
                        } else {
                            // No failDialogue provided - use fallback chain
                            this.useFallbackDialogue(item, hotspot);
                        }
                        return;
                    }
                }

                // Condition passed or no condition - execute action

                // Complex action function (if specified)
                if (response.action) {
                    if (TSH.Actions && typeof TSH.Actions[response.action] === 'function') {
                        TSH.Actions[response.action](this, hotspot, item);
                    } else {
                        console.error(`[RoomScene] Action function not found: TSH.Actions.${response.action}`);
                        this.showDialog("Something went wrong."); // Graceful failure
                    }
                    return;
                }

                // Simple side effects (no custom action function)

                // Show dialogue first
                const dialogue = response.dialogue || '';
                if (dialogue) {
                    this.showDialog(dialogue.replace('{item}', item.name).replace('{hotspot}', hotspot.name));
                } else {
                    // Empty dialogue string - use fallback chain
                    this.useFallbackDialogue(item, hotspot);
                }

                // Apply side effects
                if (response.giveItem) {
                    TSH.State.addItem(response.giveItem);
                }

                if (response.consumeItem) {
                    TSH.State.removeItem(item.id);
                }

                if (response.setFlag) {
                    TSH.State.setFlag(response.setFlag, true);
                }

                if (response.setFlags) {
                    for (const [flag, value] of Object.entries(response.setFlags)) {
                        TSH.State.setFlag(flag, value);
                    }
                }

                if (response.removeHotspot) {
                    this.removeHotspot(hsId);
                }

                if (response.pickupOverlay) {
                    this.removePickupOverlay(response.pickupOverlay);
                }

                return;
            }
        }

        // 2. Check item's failDefault
        this.useFallbackDialogue(item, hotspot);
    }

    useFallbackDialogue(item, hotspot) {
        const itemDef = TSH.Items[item.id];
        if (itemDef && itemDef.failDefault) {
            const msg = itemDef.failDefault
                .replace('{hotspot}', hotspot.name)
                .replace('{item}', item.name);
            this.showDialog(msg);
            return;
        }

        // Final fallback to global default
        const msg = TSH.Defaults.use
            .replace('{item}', item.name)
            .replace('{hotspot}', hotspot.name);
        this.showDialog(msg);
    }

    // ========== EXIT ZONES ==========

    createExitZones(height) {
        const room = this.roomData;
        this.exitZones = [];  // Initialize array to store exit zones for cleanup

        if (!room.exits || room.exits.length === 0) return;

        room.exits.forEach(exit => {
            let x, w, h;
            h = height;

            if (exit.edge === 'left') {
                x = exit.x || 40;
                w = exit.width || 80;
            } else if (exit.edge === 'right') {
                x = exit.x || (this.worldWidth - 40);
                w = exit.width || 80;
            } else {
                x = exit.x;
                w = exit.width || 80;
            }

            const zone = this.add.zone(x, height * 0.5, w, h)
                .setInteractive()
                .setOrigin(0.5);

            // Store zone for cleanup
            this.exitZones.push(zone);

            zone.on('pointerdown', (pointer) => {
                if (this.debugEnabled) return;
                if (this.inventoryOpen) return;
                if (this.conversationActive || this.dialogActive) return;

                // Mark as UI click to prevent background walk on pointerup
                this.clickedUI = true;

                const targetY = height * ((this.walkableArea.minY + this.walkableArea.maxY) / 2);
                let targetX = exit.edge === 'left' ? 100 : this.worldWidth - 100;

                this.walkTo(targetX, targetY, () => {
                    this.transitionToScene(exit.target, exit.spawnPoint);
                }, true);
            });

            zone.on('pointerover', () => {
                if (this.inventoryOpen || this.conversationActive) return;
                const direction = exit.edge === 'left' ? 'left' : 'right';
                this.showArrowCursor(direction);
            });

            zone.on('pointerout', () => {
                this.hideArrowCursor();
            });
        });
    }

    // ========== NPC SPRITES ==========

    createNPCs(height) {
        const room = this.roomData;
        if (!room.npcs || room.npcs.length === 0) return;

        this.npcSprites = {};

        room.npcs.forEach(npc => {
            // Check condition if specified
            if (npc.condition && typeof npc.condition === 'function') {
                if (!npc.condition(TSH.State.flags)) return;
            }

            const x = npc.position.x;
            const y = typeof npc.position.y === 'number' && npc.position.y <= 1
                ? height * npc.position.y
                : npc.position.y;

            // Get scale from camera preset
            const baseScale = BaseScene.PLAYER_SCALES[this.roomData.cameraPreset] ||
                              BaseScene.PLAYER_SCALES[this.cameraPreset] ||
                              BaseScene.PLAYER_SCALES.MEDIUM;

            // Check if sprite texture exists
            const spriteKey = npc.sprite || `${npc.id}_placeholder`;
            if (this.textures.exists(spriteKey)) {
                const sprite = this.add.sprite(x, y, spriteKey);
                sprite.setOrigin(0.5, 1);  // Bottom-center anchor (feet on ground)
                sprite.setScale(baseScale);
                sprite.setPipeline('Light2D');

                // Use custom depth if specified, otherwise default to 100
                sprite.setDepth(npc.depth !== undefined ? npc.depth : 100);

                // Adjust scale if NPC has specific height ratio
                if (npc.heightRatio) {
                    sprite.setScale(baseScale * npc.heightRatio);
                }

                this.npcSprites[npc.id] = sprite;
                console.log('[RoomScene] Created NPC sprite:', npc.id, 'at', x, y);
            } else {
                console.warn('[RoomScene] NPC sprite not found:', spriteKey);
            }
        });
    }

    // ========== PLAYER SPAWNING ==========

    spawnPlayer(height) {
        const room = this.roomData;
        const spawnPoint = this.getSpawnPoint();

        let spawnX = 250;
        let spawnY = 0.82;
        let spawnDirection = null;

        if (room.spawns) {
            const spawn = room.spawns[spawnPoint] || room.spawns.default;
            if (spawn) {
                spawnX = spawn.x;
                spawnY = spawn.y;
                spawnDirection = spawn.direction;
            }
        }

        this.createPlayer(spawnX, height * spawnY);

        // Handle spawn direction (use setFlipX for consistency with walkTo)
        if (spawnDirection && this.playerSprite && this.playerSprite.setFlipX) {
            if (spawnDirection === 'left') {
                this.playerSprite.setFlipX(true);
            } else if (spawnDirection === 'right') {
                this.playerSprite.setFlipX(false);
            }
        }
    }

    // ========== FIRST VISIT ==========

    handleFirstVisit() {
        const room = this.roomData;

        if (!TSH.State.hasVisitedRoom(this.roomId)) {
            TSH.State.markRoomVisited(this.roomId);

            if (room.firstVisit?.dialogue) {
                const delay = room.firstVisit.delay || 500;
                this.time.delayedCall(delay, () => {
                    this.showDialog(room.firstVisit.dialogue);
                });
            }
        }
    }

    // ========== ROOM AUDIO ==========

    handleRoomAudio() {
        const room = this.roomData;
        if (!room.audio || !TSH.Audio?.isReady()) return;

        const previousRoom = TSH.State.getPreviousRoom();
        const continueFrom = room.audio.continueFrom || [];

        // Save previous room's audio position if it has pauseIn for this room
        this.savePreviousRoomAudioPosition(previousRoom);

        // Check if we should continue current music (same track already playing from allowed room)
        const shouldContinueMusic = previousRoom &&
            continueFrom.includes(previousRoom) &&
            room.audio.music?.key &&
            TSH.Audio.isPlaying(room.audio.music.key);

        // Check if we have a saved position to resume from
        const savedMainPos = TSH.Audio.getSavedPosition('main', this.roomId);
        const savedAmbientPos = TSH.Audio.getSavedPosition('ambient', this.roomId);

        // Handle main music track
        if (room.audio.music) {
            // If room has stations and player has a saved station, use that instead of default key
            let musicKey = room.audio.music.key;
            if (room.audio.music.stations && room.audio.music.stations.length > 0) {
                // Access raw state (getFlag coerces to boolean, we need the integer index)
                const parts = (this.roomId + '.radioStation').split('.');
                let flagObj = TSH.State._state.flags;
                for (const part of parts) {
                    if (flagObj === undefined || flagObj === null) break;
                    flagObj = flagObj[part];
                }
                const savedStation = typeof flagObj === 'number' ? flagObj : undefined;
                if (savedStation !== undefined) {
                    const station = room.audio.music.stations[savedStation];
                    if (station) {
                        musicKey = station.key;
                    }
                }
            }

            const { volume = 0.7, fade = 1000, effects = [] } = room.audio.music;
            const key = musicKey;

            if (shouldContinueMusic) {
                // Music continues - just adjust volume if needed
                if (TSH.debug) {
                    console.log(`[RoomScene] Music "${key}" continues from ${previousRoom}`);
                }
                TSH.Audio.setChannelVolume('main', volume);
                this.applyMusicEffects('main', effects);
            } else {
                // Stop any currently playing music first
                TSH.Audio.stopMusic('main', { fade: 0 });

                // Start music (possibly from saved position)
                const sound = TSH.Audio.playMusic(key, {
                    channel: 'main',
                    volume: volume,
                    fade: fade
                });

                // Resume from saved position if available
                if (savedMainPos && savedMainPos.key === key && sound) {
                    try {
                        sound.setSeek(savedMainPos.seek);
                        if (TSH.debug) {
                            console.log(`[RoomScene] Resumed "${key}" from ${savedMainPos.seek.toFixed(2)}s`);
                        }
                    } catch (e) {
                        console.warn('Could not seek audio:', e);
                    }
                    TSH.Audio.clearSavedPosition('main', this.roomId);
                }

                // Resume from radio station saved position (stored in state flags)
                if (sound && room.audio.music.stations) {
                    // Access raw state (getFlag coerces to boolean, we need the object)
                    const rParts = (this.roomId + '.radioPositions').split('.');
                    let rObj = TSH.State._state.flags;
                    for (const rp of rParts) {
                        if (rObj === undefined || rObj === null) break;
                        rObj = rObj[rp];
                    }
                    const radioPositions = (typeof rObj === 'object' && rObj !== null) ? rObj : null;
                    if (radioPositions && radioPositions[key] > 0) {
                        try {
                            sound.setSeek(radioPositions[key]);
                            if (TSH.debug) {
                                console.log(`[RoomScene] Resumed radio station "${key}" from ${radioPositions[key].toFixed(2)}s`);
                            }
                        } catch (e) {
                            console.warn('Could not seek radio station audio:', e);
                        }
                    }
                }

                // Apply audio effects after a short delay
                if (effects.length > 0) {
                    this.time.delayedCall(100, () => {
                        this.applyMusicEffects('main', effects);
                    });
                }
            }
        } else {
            // No music defined for this room - stop main channel
            TSH.Audio.stopMusic('main', { fade: 1000 });
        }

        // Handle additional audio layers (ambient sounds)
        if (room.audio.layers && Array.isArray(room.audio.layers)) {
            // Track which channels are used by this room
            const usedChannels = new Set(['main']);

            room.audio.layers.forEach(layer => {
                const {
                    key,
                    channel = 'ambient',
                    volume = 0.5,
                    fade = 500
                } = layer;

                usedChannels.add(channel);

                // Check if this layer should continue
                const layerContinues = previousRoom &&
                    continueFrom.includes(previousRoom) &&
                    TSH.Audio.isPlaying(key);

                if (layerContinues) {
                    TSH.Audio.setChannelVolume(channel, volume);
                } else {
                    // Stop current audio on this channel
                    TSH.Audio.stopMusic(channel, { fade: 0 });

                    // Start the layer
                    const sound = TSH.Audio.playMusic(key, {
                        channel: channel,
                        volume: volume,
                        fade: fade
                    });

                    // Resume from saved position if available
                    const savedPos = TSH.Audio.getSavedPosition(channel, this.roomId);
                    if (savedPos && savedPos.key === key && sound) {
                        try {
                            sound.setSeek(savedPos.seek);
                            if (TSH.debug) {
                                console.log(`[RoomScene] Resumed layer "${key}" from ${savedPos.seek.toFixed(2)}s`);
                            }
                        } catch (e) {
                            console.warn('Could not seek audio:', e);
                        }
                        TSH.Audio.clearSavedPosition(channel, this.roomId);
                    }
                }
            });

            // Stop any ambient channels not used by this room
            ['ambient', 'ambient2'].forEach(ch => {
                if (!usedChannels.has(ch) && TSH.Audio.channels[ch]) {
                    TSH.Audio.stopMusic(ch, { fade: 500 });
                }
            });
        } else {
            // No layers defined - stop ambient channels
            TSH.Audio.stopMusic('ambient', { fade: 500 });
            TSH.Audio.stopMusic('ambient2', { fade: 500 });
        }

        if (TSH.debug) {
            console.log(`[RoomScene] Audio setup complete for ${this.roomId}`);
            TSH.Audio.dump();
        }
    }

    /**
     * Save the previous room's audio position if it wants to persist to this room.
     */
    savePreviousRoomAudioPosition(previousRoom) {
        if (!previousRoom) return;

        // Get the previous room's data
        const prevRoomData = TSH.Rooms[previousRoom];
        if (!prevRoomData?.audio?.pauseIn) return;

        const pauseIn = prevRoomData.audio.pauseIn;

        // Check if current room is in the pauseIn list
        if (pauseIn.includes(this.roomId)) {
            // Save audio positions for the previous room
            TSH.Audio.savePositionForRoom('main', previousRoom);
            TSH.Audio.savePositionForRoom('ambient', previousRoom);

            if (TSH.debug) {
                console.log(`[RoomScene] Saved audio position for ${previousRoom}`);
            }
        }
    }

    // Apply audio effects to a music channel
    applyMusicEffects(channel, effects) {
        if (!effects || effects.length === 0) return;

        effects.forEach(effect => {
            if (effect === 'radio' && TSH.Audio.applyRadioEffect) {
                TSH.Audio.applyRadioEffect(channel);
            }
            // Add more effects here as needed
        });
    }

    // ========== DEFAULT DATA ==========

    getDefaultRoomData() {
        return {
            id: 'unknown',
            name: 'Unknown Room',
            worldWidth: 1280,
            screenWidth: 1280,
            walkableArea: { minY: 0.72, maxY: 0.92 },
            spawns: { default: { x: 640, y: 0.82 } },
            exits: [],
            hotspots: []
        };
    }

    // ========== SCENE TRANSITION ==========

    transitionToScene(targetRoomId, spawnPoint) {
        // Prevent multiple transitions
        if (this.transitionInProgress) {
            console.log('[RoomScene] Transition blocked - already in progress');
            return;
        }

        // Prevent transitions during startup (first 500ms after create)
        if (this.startupLockout) {
            console.log('[RoomScene] Transition blocked - startup lockout');
            return;
        }

        console.log('[RoomScene] Transitioning to:', targetRoomId, 'spawn:', spawnPoint);
        console.log('[RoomScene] Current room:', this.roomId);
        console.log('[RoomScene] Transition triggered from:', new Error().stack);

        this.transitionInProgress = true;

        // Hide arrow cursor before transition
        this.hideArrowCursor();

        TSH.State._spawnPoint = spawnPoint;
        TSH.State.setCurrentRoom(targetRoomId);

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (TSH.Rooms[targetRoomId]) {
                this.scene.start('RoomScene', { roomId: targetRoomId });
            } else {
                this.scene.start(targetRoomId);
            }
        });
    }

    // ========== LAYER EXPORT (for locking in procedural art) ==========
    //
    // Usage from browser console:
    //   game.scene.scenes[0].exportLayerAsImage('room')     // Export single layer
    //   game.scene.scenes[0].exportAllLayers()              // Export all layers
    //   game.scene.scenes[0].listLayers()                   // See available layers
    //
    // Exported PNGs can be placed in assets/rooms/[roomId]/ and referenced
    // by changing layer type from 'procedural' to 'image' with src path.
    // ========================================================================

    listLayers() {
        console.log('[RoomScene] Available layers for', this.roomId + ':');
        this.layers.forEach((layer, i) => {
            const def = layer._layerDef || {};
            console.log(`  ${i}: "${layer._layerName}" (scrollFactor: ${def.scrollFactor}, depth: ${def.depth})`);
        });
        return this.layers.map(l => l._layerName);
    }

    exportLayerAsImage(layerName, download = true) {
        const layer = this.layers.find(l => l._layerName === layerName);
        if (!layer) {
            console.error(`[RoomScene] Layer not found: ${layerName}`);
            console.log('Available layers:', this.layers.map(l => l._layerName));
            return null;
        }

        const textureKey = layer.texture.key;
        const texture = this.textures.get(textureKey);

        if (!texture || texture.key === '__MISSING') {
            console.error(`[RoomScene] Texture not found: ${textureKey}`);
            return null;
        }

        // Get the source image (canvas or image element)
        const source = texture.getSourceImage();

        // Create a canvas to draw the texture
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(source, 0, 0);

        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/png');

        if (download) {
            // Trigger download
            const filename = `${this.roomId}_${layerName}.png`;
            this.downloadDataUrl(dataUrl, filename);
            console.log(`[RoomScene] Exported: ${filename} (${canvas.width}x${canvas.height})`);
        }

        return dataUrl;
    }

    exportAllLayers(download = true) {
        console.log(`[RoomScene] Exporting ${this.layers.length} layers for room: ${this.roomId}`);

        const exports = {};
        this.layers.forEach(layer => {
            const name = layer._layerName;
            if (name) {
                exports[name] = this.exportLayerAsImage(name, download);
            }
        });

        console.log('[RoomScene] Export complete. To use as images, update room data:');
        console.log(`
// In src/data/rooms/${this.roomId}.js, change layers from:
{
    name: 'layerName',
    type: 'procedural',
    draw: function(g, scene, w, h) { ... }
}

// To:
{
    name: 'layerName',
    type: 'image',
    src: 'assets/rooms/${this.roomId}/${this.roomId}_layerName.png'
}
        `);

        return exports;
    }

    downloadDataUrl(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Re-render a single layer (useful for iteration)
    refreshLayer(layerName) {
        const layerIndex = this.layers.findIndex(l => l._layerName === layerName);
        if (layerIndex === -1) {
            console.error(`[RoomScene] Layer not found: ${layerName}`);
            return;
        }

        const oldLayer = this.layers[layerIndex];
        const layerDef = oldLayer._layerDef;

        if (!layerDef || layerDef.type === 'image') {
            console.error(`[RoomScene] Cannot refresh non-procedural layer: ${layerName}`);
            return;
        }

        // Destroy old layer
        oldLayer.destroy();

        // Re-render
        const { height } = this.scale;
        const newLayer = this.renderLayer(layerDef, this.worldWidth, height, layerIndex);

        if (newLayer) {
            this.layers[layerIndex] = newLayer;
            console.log(`[RoomScene] Refreshed layer: ${layerName}`);
        }
    }

    // ========== DEBUG OVERLAY ==========
    //
    // Toggle with backtick (`) key
    // Shows: coordinates, hotspots, interact points, spawns, exits, walkable area
    // ====================================

    setupDebugOverlay() {
        // debugEnabled inherited from BaseScene
        this.debugContainer = null;
        this.debugCoordText = null;

        // Listen for backtick key (keyCode 192)
        this.debugKey = this.input.keyboard.addKey(192);
        this.debugKey.on('down', () => {
            this.toggleDebugOverlay();
        });

        // Track mouse position for coordinate display
        this.input.on('pointermove', (pointer) => {
            if (this.debugEnabled && this.debugCoordText) {
                const worldX = Math.round(pointer.worldX);
                const worldY = Math.round(pointer.worldY);
                const screenX = Math.round(pointer.x);
                const screenY = Math.round(pointer.y);
                const { height } = this.scale;
                const yPercent = (worldY / height).toFixed(3);

                this.debugCoordText.setText(
                    `World: ${worldX}, ${worldY}\n` +
                    `Screen: ${screenX}, ${screenY}\n` +
                    `Y%: ${yPercent}`
                );
            }
        });

        // Log coordinates on click when debug is active
        this.input.on('pointerdown', (pointer) => {
            if (this.debugEnabled) {
                const worldX = Math.round(pointer.worldX);
                const worldY = Math.round(pointer.worldY);
                const { height } = this.scale;
                const yPercent = (worldY / height).toFixed(3);

                console.log(`[Debug] Click at: x=${worldX}, y=${worldY}, y%=${yPercent}`);
                console.log(`  Hotspot format: { x: ${worldX}, y: ${yPercent}, ... }`);
            }
        });
    }

    toggleDebugOverlay() {
        this.debugEnabled = !this.debugEnabled;

        if (this.debugEnabled) {
            this.renderDebugOverlay();
            console.log('[Debug] Overlay enabled - press ` to hide');
        } else {
            this.destroyDebugOverlay();
            console.log('[Debug] Overlay disabled');
        }
    }

    renderDebugOverlay() {
        const { width, height } = this.scale;

        // Create container for all debug visuals (fixed to camera)
        this.debugContainer = this.add.container(0, 0);
        this.debugContainer.setDepth(9999);
        this.debugContainer.setScrollFactor(0);

        // Create container for world-space debug visuals (moves with camera)
        this.debugWorldContainer = this.add.container(0, 0);
        this.debugWorldContainer.setDepth(9998);

        // Coordinate display (top-left, fixed to screen)
        this.debugCoordText = this.add.text(10, 10, 'Move mouse...', {
            fontFamily: 'monospace',
            fontSize: '14px',
            fill: '#00ff00',
            backgroundColor: '#000000aa',
            padding: { x: 8, y: 6 }
        });
        this.debugContainer.add(this.debugCoordText);

        // Room info (top-right)
        const roomInfo = this.add.text(width - 10, 10,
            `Room: ${this.roomId}\nWorld: ${this.worldWidth}x${height}`, {
            fontFamily: 'monospace',
            fontSize: '12px',
            fill: '#ffff00',
            backgroundColor: '#000000aa',
            padding: { x: 6, y: 4 }
        }).setOrigin(1, 0);
        this.debugContainer.add(roomInfo);

        // Draw walkable area bounds
        this.drawDebugWalkableArea(height);

        // Draw hotspots
        this.drawDebugHotspots(height);

        // Draw spawn points
        this.drawDebugSpawns(height);

        // Draw exits
        this.drawDebugExits(height);
    }

    drawDebugWalkableArea(height) {
        const graphics = this.add.graphics();
        const room = this.roomData;

        // Check if walkable area has a polygon defined
        if (room.walkableArea?.polygon && room.walkableArea.polygon.length >= 3) {
            // Draw polygon walkable area
            const points = room.walkableArea.polygon.map(pt => ({
                x: pt.x,
                y: height * pt.y
            }));

            // Draw polygon outline (cyan)
            graphics.lineStyle(2, 0x00ffff, 0.9);
            graphics.beginPath();
            graphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }
            graphics.closePath();
            graphics.strokePath();

            // Semi-transparent fill
            graphics.fillStyle(0x00ffff, 0.1);
            graphics.beginPath();
            graphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }
            graphics.closePath();
            graphics.fillPath();

            // Draw vertex markers with numbers
            points.forEach((pt, i) => {
                // Vertex dot
                graphics.fillStyle(0x00ffff, 1);
                graphics.fillCircle(pt.x, pt.y, 5);
                graphics.lineStyle(2, 0x000000, 1);
                graphics.strokeCircle(pt.x, pt.y, 5);

                // Vertex number label
                const label = this.add.text(pt.x + 8, pt.y - 8, `${i}`, {
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    fill: '#00ffff',
                    backgroundColor: '#000000cc',
                    padding: { x: 3, y: 1 }
                });
                this.debugWorldContainer.add(label);
            });

            // Label
            const labelText = this.add.text(10, points[0].y - 25, `walkable polygon (${points.length} points)`, {
                fontFamily: 'monospace',
                fontSize: '11px',
                fill: '#00ffff',
                backgroundColor: '#000000aa',
                padding: { x: 4, y: 2 }
            });
            this.debugWorldContainer.add(labelText);

        } else {
            // Fallback: draw old minY/maxY horizontal lines
            graphics.lineStyle(2, 0x00ffff, 0.8);

            const minY = height * this.walkableArea.minY;
            const maxY = height * this.walkableArea.maxY;

            // Draw horizontal lines for walkable bounds
            graphics.lineBetween(0, minY, this.worldWidth, minY);
            graphics.lineBetween(0, maxY, this.worldWidth, maxY);

            // Semi-transparent fill between lines
            graphics.fillStyle(0x00ffff, 0.1);
            graphics.fillRect(0, minY, this.worldWidth, maxY - minY);

            // Labels
            const minLabel = this.add.text(5, minY - 18, `walkable minY: ${this.walkableArea.minY}`, {
                fontFamily: 'monospace',
                fontSize: '11px',
                fill: '#00ffff',
                backgroundColor: '#000000aa',
                padding: { x: 4, y: 2 }
            });

            const maxLabel = this.add.text(5, maxY + 2, `walkable maxY: ${this.walkableArea.maxY}`, {
                fontFamily: 'monospace',
                fontSize: '11px',
                fill: '#00ffff',
                backgroundColor: '#000000aa',
                padding: { x: 4, y: 2 }
            });

            this.debugWorldContainer.add(minLabel);
            this.debugWorldContainer.add(maxLabel);
        }

        this.debugWorldContainer.add(graphics);
    }

    drawDebugHotspots(height) {
        const room = this.roomData;

        // Support dynamic hotspot generation via getHotspotData function
        let hotspots;
        if (typeof room.getHotspotData === 'function') {
            hotspots = room.getHotspotData(height);
        } else {
            hotspots = room.hotspots;
        }

        if (!hotspots || hotspots.length === 0) return;

        const graphics = this.add.graphics();

        hotspots.forEach((hs, index) => {
            // Interact point (yellow dot) - same for both types
            const interactX = hs.interactX;
            const interactY = height * hs.interactY;
            graphics.fillStyle(0xffff00, 1);
            graphics.fillCircle(interactX, interactY, 6);
            graphics.lineStyle(2, 0x000000, 1);
            graphics.strokeCircle(interactX, interactY, 6);

            let labelX, labelY;

            if (hs.polygon && hs.polygon.length >= 3) {
                // Polygon hotspot - draw polygon shape
                const points = hs.polygon.map(pt => ({
                    x: pt.x,
                    y: height * pt.y
                }));

                // Draw polygon outline (magenta)
                graphics.lineStyle(2, 0xff00ff, 0.9);
                graphics.beginPath();
                graphics.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    graphics.lineTo(points[i].x, points[i].y);
                }
                graphics.closePath();
                graphics.strokePath();

                // Semi-transparent fill
                graphics.fillStyle(0xff00ff, 0.15);
                graphics.beginPath();
                graphics.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    graphics.lineTo(points[i].x, points[i].y);
                }
                graphics.closePath();
                graphics.fillPath();

                // Draw vertex markers (small circles at each point)
                graphics.fillStyle(0xff00ff, 1);
                points.forEach((pt, i) => {
                    graphics.fillCircle(pt.x, pt.y, 4);
                });

                // Calculate label position (top of polygon)
                const minY = Math.min(...points.map(p => p.y));
                const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
                labelX = avgX;
                labelY = minY - 4;
            } else {
                // Rectangle hotspot
                const x = hs.x;
                const y = height * hs.y;
                const w = hs.w;
                const h = height * hs.h;

                // Hotspot bounding box (magenta)
                graphics.lineStyle(2, 0xff00ff, 0.9);
                graphics.strokeRect(x - w/2, y - h/2, w, h);

                // Semi-transparent fill
                graphics.fillStyle(0xff00ff, 0.15);
                graphics.fillRect(x - w/2, y - h/2, w, h);

                labelX = x;
                labelY = y - h/2 - 4;
            }

            // Label for hotspot
            const label = this.add.text(labelX, labelY,
                `${hs.id || 'hs' + index}\n"${hs.name}"`, {
                fontFamily: 'monospace',
                fontSize: '10px',
                fill: '#ff00ff',
                backgroundColor: '#000000cc',
                padding: { x: 4, y: 2 },
                align: 'center'
            }).setOrigin(0.5, 1);
            this.debugWorldContainer.add(label);

            // Label for interact point
            const interactLabel = this.add.text(interactX + 10, interactY - 10,
                `interact: ${hs.id}`, {
                fontFamily: 'monospace',
                fontSize: '9px',
                fill: '#ffff00',
                backgroundColor: '#000000aa',
                padding: { x: 2, y: 1 }
            });
            this.debugWorldContainer.add(interactLabel);
        });

        this.debugWorldContainer.add(graphics);
    }

    drawDebugSpawns(height) {
        const room = this.roomData;
        if (!room.spawns) return;

        const graphics = this.add.graphics();

        Object.entries(room.spawns).forEach(([spawnId, spawn]) => {
            const x = spawn.x;
            const y = height * spawn.y;

            // Spawn point marker (green diamond)
            graphics.fillStyle(0x00ff00, 1);
            graphics.beginPath();
            graphics.moveTo(x, y - 10);
            graphics.lineTo(x + 8, y);
            graphics.lineTo(x, y + 10);
            graphics.lineTo(x - 8, y);
            graphics.closePath();
            graphics.fillPath();

            graphics.lineStyle(2, 0x000000, 1);
            graphics.beginPath();
            graphics.moveTo(x, y - 10);
            graphics.lineTo(x + 8, y);
            graphics.lineTo(x, y + 10);
            graphics.lineTo(x - 8, y);
            graphics.closePath();
            graphics.strokePath();

            // Label
            const label = this.add.text(x, y - 16, `spawn: ${spawnId}`, {
                fontFamily: 'monospace',
                fontSize: '10px',
                fill: '#00ff00',
                backgroundColor: '#000000aa',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5, 1);
            this.debugWorldContainer.add(label);
        });

        this.debugWorldContainer.add(graphics);
    }

    drawDebugExits(height) {
        const room = this.roomData;
        if (!room.exits) return;

        const graphics = this.add.graphics();

        room.exits.forEach((exit, index) => {
            let x, w;
            const h = height;
            const zoneY = height * 0.5;

            if (exit.edge === 'left') {
                x = exit.x || 40;
                w = exit.width || 80;
            } else if (exit.edge === 'right') {
                x = exit.x || (this.worldWidth - 40);
                w = exit.width || 80;
            } else {
                x = exit.x;
                w = exit.width || 80;
            }

            // Exit zone (orange rectangle)
            graphics.lineStyle(3, 0xff8800, 0.9);
            graphics.strokeRect(x - w/2, 0, w, h);

            // Semi-transparent fill
            graphics.fillStyle(0xff8800, 0.1);
            graphics.fillRect(x - w/2, 0, w, h);

            // Arrow indicating direction
            const arrowX = exit.edge === 'left' ? x - w/2 + 20 : x + w/2 - 20;
            const arrowDir = exit.edge === 'left' ? -1 : 1;

            graphics.fillStyle(0xff8800, 1);
            graphics.beginPath();
            graphics.moveTo(arrowX + arrowDir * 15, zoneY);
            graphics.lineTo(arrowX - arrowDir * 5, zoneY - 15);
            graphics.lineTo(arrowX - arrowDir * 5, zoneY + 15);
            graphics.closePath();
            graphics.fillPath();

            // Label
            const labelX = exit.edge === 'left' ? x - w/2 + 5 : x + w/2 - 5;
            const labelOriginX = exit.edge === 'left' ? 0 : 1;

            const label = this.add.text(labelX, 60,
                `EXIT: ${exit.edge}\n→ ${exit.target}\nspawn: ${exit.spawnPoint || 'default'}`, {
                fontFamily: 'monospace',
                fontSize: '10px',
                fill: '#ff8800',
                backgroundColor: '#000000cc',
                padding: { x: 4, y: 2 }
            }).setOrigin(labelOriginX, 0);
            this.debugWorldContainer.add(label);
        });

        this.debugWorldContainer.add(graphics);
    }

    destroyDebugOverlay() {
        if (this.debugContainer) {
            this.debugContainer.destroy();
            this.debugContainer = null;
        }
        if (this.debugWorldContainer) {
            this.debugWorldContainer.destroy();
            this.debugWorldContainer = null;
        }
        this.debugCoordText = null;
    }
}
