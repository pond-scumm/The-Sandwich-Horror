// ============================================================================
// ITEM DEFINITIONS
// ============================================================================
// Every item that can appear in the player's inventory.
// 
// Properties:
//   id          - Unique identifier (used in state and code)
//   name        - Display name in inventory
//   description - What Nate says when examining the item
//   icon        - Asset path for inventory icon (placeholder for now)
//   consumable  - If true, item is removed when used successfully
//   combinable  - List of item IDs this can be combined with
//   failDefault - What Nate says when using this item on something with no interaction
// ============================================================================

(function() {
    'use strict';

    TSH.Items = {

        // ── Starting / Intro Items ──────────────────────────────────────

        help_wanted_ad: {
            id: 'help_wanted_ad',
            name: 'Help Wanted Ad',
            description: "\"HELP WANTED: Assistant needed for questionable scientific research. Must be willing to relocate to the middle of nowhere. Apply in person. Safety not guaranteed.\"",
            failDefault: "I don't think this Help Wanted ad wants to help here.",
            consumable: true,
            combinable: []
        },

        broken_moon_shoes: {
            id: 'broken_moon_shoes',
            name: 'Broken Moon Shoes',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['spring_1', 'spring_2']
        },

        half_broken_moon_shoes: {
            id: 'half_broken_moon_shoes',
            name: 'Half-Broken Moon Shoes',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['spring_1', 'spring_2']
        },

        moon_shoes: {
            id: 'moon_shoes',
            name: 'Moon Shoes',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        matches: {
            id: 'matches',
            name: 'Matches',
            description: "A box of matches. 'Strike anywhere' it says. Challenge accepted.",
            failDefault: "Surprisingly, I don't think lighting that on fire will help",
            consumable: false,
            combinable: ['candle'],
            color: 0xcc6633
        },

        candle: {
            id: 'candle',
            name: 'Candle',
            description: "An unlit candle. I forgot I had this!",
            failDefault: "",
            consumable: false,
            combinable: ['matches'],
            color: 0xffdd44
        },

        lit_candle: {
            id: 'lit_candle',
            name: 'Lit Candle',
            description: "I'm glad I have this in my pocket.",
            failDefault: "I don't want to singe that with this ember.",
            consumable: false,
            combinable: [],
            color: 0xff4422
        },

        // ── Clock Puzzle Items ──────────────────────────────────────────

        spring_1: {
            id: 'spring_1',
            name: 'Spring 1',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['broken_moon_shoes']
        },

        spring_2: {
            id: 'spring_2',
            name: 'Spring 2',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['broken_moon_shoes']
        },

        ladder: {
            id: 'ladder',
            name: 'Ladder',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        scalpel: {
            id: 'scalpel',
            name: 'Scalpel',
            description: "As sharp as the devil himself.",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        tongs: {
            id: 'tongs',
            name: 'Tongs',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        clock: {
            id: 'clock',
            name: 'Clock',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        }
    };
    
})();
