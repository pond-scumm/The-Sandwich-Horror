// ============================================================================
// GAME STATE MANAGER
// ============================================================================
// Single source of truth for everything that has happened in the game.
// Every room, NPC, hotspot, and dialogue checks this to decide what to show.
//
// Usage:
//   TSH.State.getFlag('has_clock')        → true/false
//   TSH.State.setFlag('has_clock', true)
//   TSH.State.addItem('crowbar')
//   TSH.State.removeItem('crowbar')
//   TSH.State.hasItem('crowbar')           → true/false
//   TSH.State.getNPCState('alien')         → 'watching_tv'
//   TSH.State.setNPCState('alien', 'on_roof')
//   TSH.State.toJSON()                     → serializable save data
//   TSH.State.loadFromJSON(data)           → restore from save
//
// Event System:
//   TSH.State.on('inventoryChanged', (data) => { ... })
//   TSH.State.on('flagChanged', (data) => { ... })
//   TSH.State.on('npcStateChanged', (data) => { ... })
//   TSH.State.on('roomChanged', (data) => { ... })
//   TSH.State.on('uiStateChanged', (data) => { ... })
//   TSH.State.off('inventoryChanged', callback)  → remove listener
//
// Event Data:
//   inventoryChanged: { type: 'added'|'removed'|'consumed', itemId }
//   flagChanged:      { path, value }
//   npcStateChanged:  { npcId, state, previousState }
//   roomChanged:      { from, to }
//   uiStateChanged:   { key, value, previousValue }
//
// UI State (for reactive UI):
//   TSH.State.getUIState('selectedItem')         → item ID or null
//   TSH.State.setUIState('selectedItem', 'key')
//   TSH.State.getSelectedItem()                  → convenience getter
//   TSH.State.setSelectedItem('key')             → convenience setter
//   TSH.State.clearSelectedItem()
//   TSH.State.isInventoryOpen()
//   TSH.State.setInventoryOpen(true)
//   TSH.State.resetTransientUIState()            → clears dialogs/settings
// ============================================================================

(function() {
    'use strict';
    
    // ── Default State Template ──────────────────────────────────────────
    // This defines the initial state of a brand new game.
    // Every flag starts false, every inventory starts empty.
    
    function createDefaultState() {
        return {
            // Current location
            currentRoom: 'interior',
            previousRoom: null,
            
            // Player inventory (array of item IDs)
            inventory: ['help_wanted_ad', 'candle'],
            
            // Items that have been permanently consumed/used
            usedItems: [],
            
            // ── Puzzle Flags ────────────────────────────────────────────
            // Grouped by concept. Each flag represents a FACT about
            // something that has happened. Not an intention or plan.
            
            flags: {
                // Story progression
                story: {
                    entered_house: false,
                    hired_by_hector: false,
                    experiment_failed: false,
                    title_card_shown: false,
                    found_hector: false,
                    damage_report_printed: false,
                    lab_unlocked: false,
                    all_components_installed: false,
                    polarity_reversed: false,
                    clone_created: false,
                    experiment_rerun: false,
                    game_complete: false
                },
                
                // Hector's body/coat/keycard puzzle chain
                hector: {
                    head_found: false,
                    body_running: false,
                    locker_closed: false,        // Player closed locker to sneak past
                    sneezed_on_book: false,
                    coat_dropped: false,
                    body_captured: false,
                    has_keycard: false,
                    has_lab_coat: false
                },

                // Laboratory (Main Lab) items and interactions
                lab: {
                    panel_open: false            // Electrical panel state
                },

                // Computer / password puzzle
                computer: {
                    tried_login: false,
                    security_q1_found: false,
                    security_q2_found: false,
                    security_q3_found: false,
                    password_reset: false,
                    logged_in: false
                },
                
                // Clock puzzle chain (Temporal Synchronizer)
                clock: {
                    has_spring_1: false,         // From lab cabinet
                    has_spring_2: false,         // From Frank's mattress
                    has_shoes: false,            // Satellite shoes
                    shoes_repaired: false,       // Springs + shoes
                    met_earl: false,
                    earl_invited: false,          // Got invite to yard
                    returned_borrowed_item: false,
                    has_ladder: false,
                    has_clock: false              // Got the clock!
                },
                
                // Power puzzle chain (Nuclear Energy Resonator)
                power: {
                    found_generator: false,
                    generator_unplugged: false,
                    has_padlock: false,
                    robot_locked_in: false,      // Padlocked charging station
                    monkey_placed: false,        // Monkey in storage room
                    robot_unlocked: false,       // Let robot out to chase monkey
                    robot_locked_out: false,     // Locked station while robot is out
                    generator_plugged_back: false,
                    robot_bumping: false,        // Robot trying to return
                    has_fuse: false              // Pulled fuse from robot
                },
                
                // Screen puzzle chain (Interdimensional Relay)
                screen: {
                    met_alien: false,
                    knows_hated_channel: false,
                    has_tv_guide: false,
                    found_satellite: false,
                    channel_changed: false,
                    satellite_sabotaged: false,  // Wrench in satellite
                    correct_channel_set: false,
                    alien_on_roof: false,
                    window_locked: false,        // Trapped alien outside
                    has_tv: false                // Got the TV!
                },
                
                // Brain puzzle chain (Stabilizer Cortex)
                brain: {
                    found_brain: false,
                    tried_brain_in_machine: false,
                    knows_about_victor: false,
                    met_frank: false,
                    frank_offered_swap: false,
                    brains_swapped_to_victor: false,
                    talked_to_rival: false,
                    rival_demands_known: false,
                    has_trophy_item_1: false,
                    has_trophy_item_2: false,
                    trophy_built: false,
                    has_spray_paint: false,
                    trophy_painted: false,
                    trophy_named: false,         // Wrote name with sharpie
                    has_goggles: false,
                    has_sharpie: false,
                    has_disguise: false,          // Lab coat + goggles + mustache
                    glasses_removed: false,       // Frank's glasses off
                    brains_swapped_back: false,   // Swapped back to get glasses off
                    brains_swapped_final: false,  // Swapped to Victor for presentation
                    rival_convinced: false        // Victor bought it!
                },
                
                // Clone / finale
                finale: {
                    found_teleporter: false,
                    knows_teleporter_truth: false,
                    has_mirror: false,
                    death_ray_disabled: false,
                    clone_created: false
                },

                // Miscellaneous flags (for backwards compatibility with flat flag names)
                // Scenes using flat names like setFlag('alien_talked') will store here
                misc: {}
            },

            // ── NPC States ──────────────────────────────────────────────
            // String enums tracking what each NPC is currently doing.
            // Valid states documented here for reference.
            
            npcStates: {
                // 'running_loose' | 'coat_dropped' | 'captured' | 'reunited'
                hector_body: 'pre_experiment',
                
                // 'pre_experiment' | 'in_locker' | 'locker_closed' | 'on_shelf' | 'reunited'
                hector_head: 'pre_experiment',
                
                // 'watching_tv' | 'angry' | 'on_roof' | 'locked_out'
                alien: 'watching_tv',
                
                // 'reading' | 'strapped_down' | 'victor_brain'
                frank: 'reading',
                
                // 'in_jar' | 'in_frank' | 'back_in_jar'
                victor: 'in_jar',
                
                // 'in_station' | 'deployed' | 'chasing_monkey' | 'locked_out' | 'bumping' | 'disabled'
                robot: 'in_station',
                
                // 'plugged_in' | 'unplugged'
                generator: 'plugged_in',
                
                // 'behind_fence' | 'visible'
                earl: 'behind_fence'
            },
            
            // ── Dialogue History ────────────────────────────────────────
            // Tracks which conversations have occurred.
            // Used to prevent repeats and unlock new dialogue options.

            dialogueHistory: {},

            // ── Once-Choice Tracking ────────────────────────────────────────
            // Tracks dialogue options marked with # once that have been chosen.
            // Format: { 'npcId:nodeKey:optionIndex': true }

            onceChoices: {},

            // ── Asked Labels ──────────────────────────────────────────────
            // Tracks dialogue nodes/options marked with # id: that have been visited.
            // Format: { 'label': true }

            askedLabels: {},
            
            // ── Rooms Visited ───────────────────────────────────────────
            visitedRooms: [],
            
            // ── UI State ───────────────────────────────────────────────────
            // Tracks UI-related state that needs to be consistent across scenes.
            // Persistent state survives room transitions; transient state resets.
            ui: {
                // Persistent UI state (survives room changes)
                selectedItem: null,      // Currently selected inventory item ID

                // Transient UI state (may reset on room change)
                inventoryOpen: false,    // Is inventory panel expanded?
                dialogActive: false,     // Is an examine/action dialog showing?
                conversationActive: false, // Is NPC conversation in progress?
                settingsOpen: false,     // Is settings menu open?

                // Cursor state (managed by UIScene)
                edgeZone: null,          // 'left', 'right', or null (for arrow cursor)
                itemCursorHighlight: false, // Show red highlight on item cursor
                crosshairColor: 0xffffff, // Crosshair color (white default, red on hover)

                // Scene state (blocks UI interactions)
                transitioning: false     // True during scene transitions, cutscenes
            },

            // ── Save Metadata ───────────────────────────────────────────
            playtime: 0,
            saveTimestamp: null,
            version: '1.0'
        };
    }
    
    // ── GameState Manager Object ────────────────────────────────────────
    
    const GameState = {
        _state: null,
        _listeners: {},

        // Initialize with default state (new game)
        init() {
            this._state = createDefaultState();
            this._listeners = {};
            return this;
        },

        // ── Event Emitter ────────────────────────────────────────────────
        // Simple pub/sub for state change notifications.
        // Events: inventoryChanged, flagChanged, npcStateChanged, roomChanged

        on(event, callback) {
            if (!this._listeners[event]) {
                this._listeners[event] = [];
            }
            this._listeners[event].push(callback);
        },

        off(event, callback) {
            if (!this._listeners[event]) return;
            const idx = this._listeners[event].indexOf(callback);
            if (idx !== -1) {
                this._listeners[event].splice(idx, 1);
            }
        },

        emit(event, data) {
            if (!this._listeners[event]) return;
            for (const callback of this._listeners[event]) {
                callback(data);
            }
        },
        
        // ── Flag Methods ────────────────────────────────────────────────
        
        // Get a flag value. Uses dot notation: 'clock.has_spring_1'
        getFlag(path) {
            const parts = path.split('.');
            let obj = this._state.flags;
            for (const part of parts) {
                if (obj === undefined || obj === null) return false;
                obj = obj[part];
            }
            return obj === true;
        },
        
        // Set a flag value
        setFlag(path, value) {
            const parts = path.split('.');
            let obj = this._state.flags;
            for (let i = 0; i < parts.length - 1; i++) {
                if (obj[parts[i]] === undefined) obj[parts[i]] = {};
                obj = obj[parts[i]];
            }
            obj[parts[parts.length - 1]] = value;
            this.emit('flagChanged', { path, value });
        },
        
        // Get all flags (for debug display)
        getAllFlags() {
            return this._state.flags;
        },
        
        // ── Inventory Methods ───────────────────────────────────────────
        
        addItem(itemId) {
            if (!this._state.inventory.includes(itemId)) {
                this._state.inventory.push(itemId);
                this.emit('inventoryChanged', { type: 'added', itemId });
            }
        },

        removeItem(itemId) {
            const idx = this._state.inventory.indexOf(itemId);
            if (idx !== -1) {
                this._state.inventory.splice(idx, 1);
                this.emit('inventoryChanged', { type: 'removed', itemId });
            }
        },
        
        hasItem(itemId) {
            return this._state.inventory.includes(itemId);
        },
        
        getInventory() {
            return [...this._state.inventory];
        },
        
        // Mark an item as permanently consumed
        consumeItem(itemId) {
            const wasInInventory = this._state.inventory.includes(itemId);
            this.removeItem(itemId);  // This emits 'inventoryChanged' if item was present
            if (!this._state.usedItems.includes(itemId)) {
                this._state.usedItems.push(itemId);
            }
            // Emit consumed event (distinct from removed, for UI that cares)
            if (wasInInventory) {
                this.emit('inventoryChanged', { type: 'consumed', itemId });
            }
        },
        
        wasItemUsed(itemId) {
            return this._state.usedItems.includes(itemId);
        },
        
        // ── NPC State Methods ───────────────────────────────────────────
        
        getNPCState(npcId) {
            return this._state.npcStates[npcId] || null;
        },
        
        setNPCState(npcId, state) {
            const previousState = this._state.npcStates[npcId];
            this._state.npcStates[npcId] = state;
            this.emit('npcStateChanged', { npcId, state, previousState });
        },

        // ── Room Methods ────────────────────────────────────────────────

        getCurrentRoom() {
            return this._state.currentRoom;
        },

        setCurrentRoom(roomId) {
            const fromRoom = this._state.currentRoom;
            this._state.previousRoom = fromRoom;
            this._state.currentRoom = roomId;
            this.emit('roomChanged', { from: fromRoom, to: roomId });
        },
        
        getPreviousRoom() {
            return this._state.previousRoom;
        },
        
        hasVisitedRoom(roomId) {
            return this._state.visitedRooms.includes(roomId);
        },
        
        markRoomVisited(roomId) {
            if (!this._state.visitedRooms.includes(roomId)) {
                this._state.visitedRooms.push(roomId);
            }
        },

        // ── UI State Methods ────────────────────────────────────────────
        // For tracking UI state that needs to be consistent across scenes.
        // This enables the future UIScene to react to state changes.

        getUIState(key) {
            return this._state.ui[key];
        },

        setUIState(key, value) {
            const previousValue = this._state.ui[key];
            if (previousValue === value) return; // No change
            this._state.ui[key] = value;
            this.emit('uiStateChanged', { key, value, previousValue });
        },

        // Convenience methods for common UI state operations
        getSelectedItem() {
            return this._state.ui.selectedItem;
        },

        setSelectedItem(itemId) {
            this.setUIState('selectedItem', itemId);
        },

        clearSelectedItem() {
            this.setUIState('selectedItem', null);
        },

        isInventoryOpen() {
            return this._state.ui.inventoryOpen;
        },

        setInventoryOpen(open) {
            this.setUIState('inventoryOpen', open);
        },

        // Reset transient UI state (called on room transitions, etc.)
        resetTransientUIState() {
            this.setUIState('dialogActive', false);
            this.setUIState('conversationActive', false);
            this.setUIState('settingsOpen', false);
            // Note: selectedItem and inventoryOpen persist across room changes
        },

        // ── Dialogue Methods ────────────────────────────────────────────
        
        hasSeenDialogue(dialogueId) {
            return this._state.dialogueHistory[dialogueId] === true;
        },

        markDialogueSeen(dialogueId) {
            this._state.dialogueHistory[dialogueId] = true;
        },

        // Once-choice tracking for dialogue options
        hasChosenOnce(npcId, nodeKey, optionIndex) {
            const key = `${npcId}:${nodeKey}:${optionIndex}`;
            return this._state.onceChoices[key] === true;
        },

        markOnceChosen(npcId, nodeKey, optionIndex) {
            const key = `${npcId}:${nodeKey}:${optionIndex}`;
            this._state.onceChoices[key] = true;
        },

        // Asked-label tracking for dialogue # id: annotations
        hasAskedLabel(label) {
            return this._state.askedLabels[label] === true;
        },

        markAskedLabel(label) {
            this._state.askedLabels[label] = true;
        },

        // ── Playtime ────────────────────────────────────────────────────
        
        addPlaytime(seconds) {
            this._state.playtime += seconds;
        },
        
        getPlaytime() {
            return this._state.playtime;
        },
        
        // ── Serialization (for save/load) ───────────────────────────────
        
        toJSON() {
            return JSON.parse(JSON.stringify(this._state));
        },
        
        loadFromJSON(data) {
            this._state = data;
        },
        
        // ── Debug ───────────────────────────────────────────────────────
        
        // Dump current state to console in a readable format
        dump() {
            console.group('🎮 Game State');
            console.log('Room:', this._state.currentRoom);
            console.log('Inventory:', this._state.inventory);
            console.log('NPC States:', this._state.npcStates);
            console.group('Flags');
            for (const [group, flags] of Object.entries(this._state.flags)) {
                const trueFlags = Object.entries(flags)
                    .filter(([k, v]) => v === true)
                    .map(([k]) => k);
                if (trueFlags.length > 0) {
                    console.log(`${group}:`, trueFlags.join(', '));
                }
            }
            console.groupEnd();
            console.log('Visited rooms:', this._state.visitedRooms);
            console.log('Playtime:', Math.round(this._state.playtime) + 's');
            console.groupEnd();
        }
    };
    
    // Initialize and attach to namespace
    TSH.State = GameState.init();
    
})();
