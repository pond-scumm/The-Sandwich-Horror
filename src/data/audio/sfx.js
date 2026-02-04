// ============================================================================
// SFX - Sound Effect Definitions
// ============================================================================
// Central registry of all sound effects in the game.
// Each SFX has a key, file path, and default volume.
//
// Usage:
//   TSH.Audio.playSFX('pickup')
//   TSH.Audio.playSFX('door_open', { volume: 0.5 })
//
// To add a new sound:
//   1. Add the MP3 to assets/audio/sfx/
//   2. Add an entry here
//   3. The sound will be auto-preloaded by scenes
// ============================================================================

(function() {
    'use strict';

    TSH.SFX = {
        // ========== INVENTORY & ITEMS ==========
        pickup: {
            key: 'sfx_pickup',
            path: 'assets/audio/sfx/pickup.wav',
            volume: 0.7
        },
        item_select: {
            key: 'sfx_item_select',
            path: 'assets/audio/sfx/item_pickup.wav',
            volume: 0.5
        },
        item_combine: {
            key: 'sfx_item_combine',
            path: 'assets/audio/sfx/item_combine.wav',
            volume: 0.6
        },
        item_fail: {
            key: 'sfx_item_fail',
            path: 'assets/audio/sfx/item_fail.wav',
            volume: 0.4
        },

        // ========== UI ==========
        inventory_open: {
            key: 'sfx_inventory_open',
            path: 'assets/audio/sfx/inventory_open.wav',
            volume: 0.4
        },
        inventory_close: {
            key: 'sfx_inventory_close',
            path: 'assets/audio/sfx/inventory_close.wav',
            volume: 0.4
        },
        menu_hover: {
            key: 'sfx_menu_hover',
            path: 'assets/audio/sfx/menu_hover.wav',
            volume: 0.3
        },
        menu_select: {
            key: 'sfx_menu_select',
            path: 'assets/audio/sfx/menu_select.wav',
            volume: 0.5
        },

        // ========== ENVIRONMENT ==========
        door_open: {
            key: 'sfx_door_open',
            path: 'assets/audio/sfx/door_open.wav',
            volume: 0.6
        },
        door_close: {
            key: 'sfx_door_close',
            path: 'assets/audio/sfx/door_close.wav',
            volume: 0.6
        },
        door_locked: {
            key: 'sfx_door_locked',
            path: 'assets/audio/sfx/door_locked.wav',
            volume: 0.5
        },
        switch_click: {
            key: 'sfx_switch_click',
            path: 'assets/audio/sfx/switch_click.wav',
            volume: 0.5
        },

        // ========== CHARACTER ==========
        // Default footsteps (left/right alternating)
        footstep_left: {
            key: 'sfx_footstep_left',
            path: 'assets/audio/sfx/footstep_left.wav',
            volume: 0.3
        },
        footstep_right: {
            key: 'sfx_footstep_right',
            path: 'assets/audio/sfx/footstep_right.wav',
            volume: 0.3
        },
        // Surface-specific footsteps (for future use)
        footstep_wood_left: {
            key: 'sfx_footstep_wood_left',
            path: 'assets/audio/sfx/footstep_wood_left.wav',
            volume: 0.3
        },
        footstep_wood_right: {
            key: 'sfx_footstep_wood_right',
            path: 'assets/audio/sfx/footstep_wood_right.wav',
            volume: 0.3
        },
        footstep_stone_left: {
            key: 'sfx_footstep_stone_left',
            path: 'assets/audio/sfx/footstep_stone_left.wav',
            volume: 0.3
        },
        footstep_stone_right: {
            key: 'sfx_footstep_stone_right',
            path: 'assets/audio/sfx/footstep_stone_right.wav',
            volume: 0.3
        },

        // ========== DIALOGUE ==========
        dialogue_appear: {
            key: 'sfx_dialogue_appear',
            path: 'assets/audio/sfx/dialogue_appear.wav',
            volume: 0.3
        },
        dialogue_option: {
            key: 'sfx_dialogue_option',
            path: 'assets/audio/sfx/dialogue_option.wav',
            volume: 0.4
        },

        // ========== PUZZLE / SPECIAL ==========
        success: {
            key: 'sfx_success',
            path: 'assets/audio/sfx/success.wav',
            volume: 0.6
        },
        fail: {
            key: 'sfx_fail',
            path: 'assets/audio/sfx/fail.wav',
            volume: 0.5
        },
        discovery: {
            key: 'sfx_discovery',
            path: 'assets/audio/sfx/discovery.wav',
            volume: 0.6
        }
    };

    // ========== HELPER FUNCTIONS ==========

    /**
     * Get all SFX keys for preloading
     * @returns {Array} Array of {key, path} objects
     */
    TSH.SFX.getAllForPreload = function() {
        return Object.values(TSH.SFX)
            .filter(sfx => sfx && sfx.key && sfx.path)
            .map(sfx => ({ key: sfx.key, path: sfx.path }));
    };

    /**
     * Get SFX definition by name
     * @param {string} name - SFX name (e.g., 'pickup', 'door_open')
     * @returns {object|null} SFX definition or null
     */
    TSH.SFX.get = function(name) {
        return TSH.SFX[name] || null;
    };

})();
