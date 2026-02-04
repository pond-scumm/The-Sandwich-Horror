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
            
            // ── Rooms Visited ───────────────────────────────────────────
            visitedRooms: [],
            
            // ── Save Metadata ───────────────────────────────────────────
            playtime: 0,
            saveTimestamp: null,
            version: '1.0'
        };
    }
    
    // ── GameState Manager Object ────────────────────────────────────────
    
    const GameState = {
        _state: null,
        
        // Initialize with default state (new game)
        init() {
            this._state = createDefaultState();
            return this;
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
        },
        
        // Get all flags (for debug display)
        getAllFlags() {
            return this._state.flags;
        },
        
        // ── Inventory Methods ───────────────────────────────────────────
        
        addItem(itemId) {
            if (!this._state.inventory.includes(itemId)) {
                this._state.inventory.push(itemId);
            }
        },
        
        removeItem(itemId) {
            const idx = this._state.inventory.indexOf(itemId);
            if (idx !== -1) {
                this._state.inventory.splice(idx, 1);
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
            this.removeItem(itemId);
            if (!this._state.usedItems.includes(itemId)) {
                this._state.usedItems.push(itemId);
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
            this._state.npcStates[npcId] = state;
        },
        
        // ── Room Methods ────────────────────────────────────────────────
        
        getCurrentRoom() {
            return this._state.currentRoom;
        },
        
        setCurrentRoom(roomId) {
            this._state.previousRoom = this._state.currentRoom;
            this._state.currentRoom = roomId;
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
        
        // ── Dialogue Methods ────────────────────────────────────────────
        
        hasSeenDialogue(dialogueId) {
            return this._state.dialogueHistory[dialogueId] === true;
        },
        
        markDialogueSeen(dialogueId) {
            this._state.dialogueHistory[dialogueId] = true;
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
