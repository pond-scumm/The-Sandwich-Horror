// ============================================================================
// SAVE SYSTEM
// ============================================================================
// Saves and loads game state to/from localStorage.
// 3 save slots. Version field for future migration.
//
// Usage:
//   TSH.Save.save(1)          → saves current state to slot 1
//   TSH.Save.load(1)          → loads slot 1, returns true/false
//   TSH.Save.listSaves()      → returns array of save info
//   TSH.Save.deleteSave(1)    → deletes slot 1
//   TSH.Save.hasSave(1)       → true/false
// ============================================================================

(function() {
    'use strict';
    
    const SAVE_PREFIX = 'tsh_save_';
    const MAX_SLOTS = 3;
    const CURRENT_VERSION = '1.0';
    
    // Room display names for save screen
    const ROOM_NAMES = {
        bus_stop: 'Bus Stop',
        woods: 'Woods',
        front_of_house: 'Front of House',
        interior: 'Interior',
        laboratory: 'Laboratory',
        back_lab: 'Back Lab',
        storage_room: 'Storage Room',
        side_lab: 'Side Lab',
        hectors_bedroom: "Hector's Bedroom",
        second_floor: '2nd Floor',
        alien_room: "Alien's Room",
        franks_room: "Frank's Room",
        roof: 'Roof',
        attic: 'Attic',
        backyard: 'Backyard',
        shed: 'Shed',
        earls_yard: "Earl's Yard",
        basement: 'Basement'
    };
    
    const SaveSystem = {
        
        // Save current game state to a slot (1-3)
        save(slot) {
            if (slot < 1 || slot > MAX_SLOTS) {
                console.error('Invalid save slot:', slot);
                return false;
            }
            
            try {
                const data = TSH.State.toJSON();
                data.saveTimestamp = Date.now();
                data.version = CURRENT_VERSION;
                
                localStorage.setItem(
                    SAVE_PREFIX + slot,
                    JSON.stringify(data)
                );
                
                console.log('Game saved to slot', slot);
                return true;
            } catch (e) {
                console.error('Save failed:', e);
                return false;
            }
        },
        
        // Load a save slot. Returns true if successful.
        load(slot) {
            if (slot < 1 || slot > MAX_SLOTS) {
                console.error('Invalid save slot:', slot);
                return false;
            }
            
            try {
                const raw = localStorage.getItem(SAVE_PREFIX + slot);
                if (!raw) {
                    console.warn('No save in slot', slot);
                    return false;
                }
                
                const data = JSON.parse(raw);
                
                // Future: version migration logic goes here
                // if (data.version === '0.9') { migrate_0_9_to_1_0(data); }
                
                TSH.State.loadFromJSON(data);
                console.log('Game loaded from slot', slot);
                return true;
            } catch (e) {
                console.error('Load failed:', e);
                return false;
            }
        },
        
        // Check if a slot has a save
        hasSave(slot) {
            return localStorage.getItem(SAVE_PREFIX + slot) !== null;
        },
        
        // Get info about all save slots (for save/load menu)
        listSaves() {
            const saves = [];
            
            for (let i = 1; i <= MAX_SLOTS; i++) {
                const raw = localStorage.getItem(SAVE_PREFIX + i);
                if (raw) {
                    try {
                        const data = JSON.parse(raw);
                        saves.push({
                            slot: i,
                            room: ROOM_NAMES[data.currentRoom] || data.currentRoom,
                            roomId: data.currentRoom,
                            playtime: data.playtime || 0,
                            timestamp: data.saveTimestamp,
                            version: data.version,
                            itemCount: (data.inventory || []).length
                        });
                    } catch (e) {
                        // Corrupted save
                        saves.push({
                            slot: i,
                            room: 'Corrupted Save',
                            corrupted: true
                        });
                    }
                } else {
                    saves.push({
                        slot: i,
                        empty: true
                    });
                }
            }
            
            return saves;
        },
        
        // Delete a save slot
        deleteSave(slot) {
            if (slot < 1 || slot > MAX_SLOTS) return false;
            localStorage.removeItem(SAVE_PREFIX + slot);
            console.log('Save deleted from slot', slot);
            return true;
        },
        
        // Format playtime for display (e.g., "1h 23m")
        formatPlaytime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            if (hours > 0) return hours + 'h ' + mins + 'm';
            return mins + 'm';
        },
        
        // Format timestamp for display
        formatTimestamp(timestamp) {
            if (!timestamp) return 'Unknown';
            const d = new Date(timestamp);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    };
    
    // Attach to namespace
    TSH.Save = SaveSystem;
    
})();
