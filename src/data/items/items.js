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
        
        crowbar: {
            id: 'crowbar',
            name: 'Crowbar',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        },

        broken_moon_shoes: {
            id: 'broken_moon_shoes',
            name: 'Broken Moon Shoes',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        // ── Lab / Hector Items ──────────────────────────────────────────
        
        keycard: {
            id: 'keycard',
            name: 'Keycard',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },

        lab_coat: {
            id: 'lab_coat',
            name: 'Lab Coat',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['goggles']
        },
        
        dusty_book: {
            id: 'dusty_book',
            name: 'Dusty Book',
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

        damage_report: {
            id: 'damage_report',
            name: 'Damage Report',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        // ── Clock Puzzle Items ──────────────────────────────────────────
        
        spring: {
            id: 'spring',
            name: 'Spring',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['satellite_shoes']
        },
        
        spring_2: {
            id: 'spring_2',
            name: 'Spring',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['satellite_shoes']
        },
        
        satellite_shoes: {
            id: 'satellite_shoes',
            name: 'Satellite Shoes',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['spring', 'spring_2']
        },
        
        repaired_shoes: {
            id: 'repaired_shoes',
            name: 'Satellite Shoes (Fixed)',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['ladder']
        },
        
        ladder: {
            id: 'ladder',
            name: 'Ladder',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['repaired_shoes']
        },

        borrowed_item: {
            id: 'borrowed_item',
            name: 'Borrowed Item',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        },
        
        scalpel: {
            id: 'scalpel',
            name: 'Scalpel',
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
        },
        
        // ── Power Puzzle Items ──────────────────────────────────────────
        
        padlock: {
            id: 'padlock',
            name: 'Padlock',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        monkey: {
            id: 'monkey',
            name: 'Cymbal Monkey',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        fuse: {
            id: 'fuse',
            name: 'Fuse',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        },
        
        // ── Screen Puzzle Items ─────────────────────────────────────────
        
        tv_guide: {
            id: 'tv_guide',
            name: 'TV Guide',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        wrench: {
            id: 'wrench',
            name: 'Wrench',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        tv: {
            id: 'tv',
            name: 'TV',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        },
        
        // ── Brain Puzzle Items ──────────────────────────────────────────
        
        brain: {
            id: 'brain',
            name: "Victor's Brain",
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        trophy_item_1: {
            id: 'trophy_item_1',
            name: 'Trophy Base',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['trophy_item_2']
        },
        
        trophy_item_2: {
            id: 'trophy_item_2',
            name: 'Trophy Top',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['trophy_item_1']
        },
        
        trophy_assembled: {
            id: 'trophy_assembled',
            name: 'Makeshift Trophy',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['spray_paint']
        },
        
        spray_paint: {
            id: 'spray_paint',
            name: 'Gold Spray Paint',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['trophy_assembled']
        },
        
        trophy_painted: {
            id: 'trophy_painted',
            name: 'Gold Trophy',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['sharpie']
        },
        
        sharpie: {
            id: 'sharpie',
            name: 'Sharpie',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['trophy_painted']
        },
        
        fake_trophy: {
            id: 'fake_trophy',
            name: "Victor's Trophy",
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        },
        
        goggles: {
            id: 'goggles',
            name: "Hector's Goggles",
            description: "",
            failDefault: "",
            consumable: false,
            combinable: ['lab_coat']
        },
        
        hector_disguise: {
            id: 'hector_disguise',
            name: 'Hector Disguise',
            description: "",
            failDefault: "",
            consumable: false,
            combinable: []
        },
        
        // ── Finale Items ────────────────────────────────────────────────
        
        mirror: {
            id: 'mirror',
            name: 'Mirror',
            description: "",
            failDefault: "",
            consumable: true,
            combinable: []
        }
    };
    
})();
