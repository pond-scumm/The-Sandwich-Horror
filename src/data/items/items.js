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
// ============================================================================

(function() {
    'use strict';

    TSH.Items = {
        
        // ── Starting / Intro Items ──────────────────────────────────────
        
        help_wanted_ad: {
            id: 'help_wanted_ad',
            name: 'Help Wanted Ad',
            description: "A small ad torn from a magazine. 'HELP WANTED: Assistant needed for groundbreaking scientific research. Must be willing to relocate to the middle of nowhere. Apply in person.'",
            consumable: true,
            combinable: []
        },
        
        crowbar: {
            id: 'crowbar',
            name: 'Crowbar',
            description: "A trusty crowbar. Found under the welcome mat where a key should have been.",
            consumable: true,
            combinable: []
        },
        
        // ── Lab / Hector Items ──────────────────────────────────────────
        
        keycard: {
            id: 'keycard',
            name: 'Keycard',
            description: "Hector's security keycard. Found in his lab coat pocket. Should unlock the doors.",
            consumable: false,
            combinable: []
        },
        
        lab_coat: {
            id: 'lab_coat',
            name: 'Lab Coat',
            description: "Hector's lab coat. Smells like ozone and pipe tobacco. A bit big on me.",
            consumable: false,
            combinable: ['goggles']
        },
        
        dusty_book: {
            id: 'dusty_book',
            name: 'Dusty Book',
            description: "A dusty book of scientific ethics. Hasn't been opened in years. Maybe decades.",
            consumable: false,
            combinable: []
        },

        matches: {
            id: 'matches',
            name: 'Matches',
            description: "A box of matches. 'Strike anywhere' it says. Challenge accepted.",
            consumable: false,
            combinable: ['candle'],
            color: 0xcc6633
        },

        candle: {
            id: 'candle',
            name: 'Candle',
            description: "A simple wax candle. Not lit yet.",
            consumable: false,
            combinable: ['matches'],
            color: 0xffdd44
        },

        lit_candle: {
            id: 'lit_candle',
            name: 'Lit Candle',
            description: "A candle with a warm, flickering flame. Very atmospheric!",
            consumable: false,
            combinable: [],
            color: 0xff4422
        },

        damage_report: {
            id: 'damage_report',
            name: 'Damage Report',
            description: "A printout listing four damaged components: Temporal Synchronizer, Nuclear Energy Resonator, Interdimensional Relay Service, and Stabilizer Cortex.",
            consumable: false,
            combinable: []
        },
        
        // ── Clock Puzzle Items ──────────────────────────────────────────
        
        spring: {
            id: 'spring',
            name: 'Spring',
            description: "A coiled metal spring. I need two of these for the satellite shoes.",
            consumable: false,
            combinable: ['satellite_shoes']
        },
        
        spring_2: {
            id: 'spring_2',
            name: 'Spring',
            description: "Another spring, pulled from a mattress. Together with the first one, these should fix the shoes.",
            consumable: false,
            combinable: ['satellite_shoes']
        },
        
        satellite_shoes: {
            id: 'satellite_shoes',
            name: 'Satellite Shoes',
            description: "A pair of Satellite Shoes. The box says they're for 'jumping' and 'getting some height'. But they're broken — missing their springs.",
            consumable: false,
            combinable: ['spring', 'spring_2']
        },
        
        repaired_shoes: {
            id: 'repaired_shoes',
            name: 'Satellite Shoes (Fixed)',
            description: "Satellite Shoes with springs installed. Ready for launch. Maybe.",
            consumable: false,
            combinable: ['ladder']
        },
        
        ladder: {
            id: 'ladder',
            name: 'Ladder',
            description: "A ladder borrowed from Earl. Not tall enough to reach the clock on its own.",
            consumable: false,
            combinable: ['repaired_shoes']
        },

        borrowed_item: {
            id: 'borrowed_item',
            name: 'Borrowed Item',
            description: "Something Hector borrowed from Earl three years ago. Earl wants it back.",
            consumable: true,
            combinable: []
        },
        
        scalpel: {
            id: 'scalpel',
            name: 'Scalpel',
            description: "A sharp scalpel from the lab. Could cut through something soft.",
            consumable: false,
            combinable: []
        },

        clock: {
            id: 'clock',
            name: 'Clock',
            description: "A clock that fell off the wall and hit me in the head. Newton would be furious. Should work as a Temporal Synchronizer replacement.",
            consumable: true,
            combinable: []
        },
        
        // ── Power Puzzle Items ──────────────────────────────────────────
        
        padlock: {
            id: 'padlock',
            name: 'Padlock',
            description: "A heavy padlock. Could lock something shut... or lock something IN.",
            consumable: false,
            combinable: []
        },
        
        monkey: {
            id: 'monkey',
            name: 'Cymbal Monkey',
            description: "One of those old wind-up monkeys that bangs cymbals together. Creepy little thing.",
            consumable: false,
            combinable: []
        },
        
        fuse: {
            id: 'fuse',
            name: 'Fuse',
            description: "A spare fuse pulled from the security robot's back panel. Should fix the nuclear generator.",
            consumable: true,
            combinable: []
        },
        
        // ── Screen Puzzle Items ─────────────────────────────────────────
        
        tv_guide: {
            id: 'tv_guide',
            name: 'TV Guide',
            description: "This week's TV Guide. Frank had it in the basement, circling shows he wants to watch.",
            consumable: false,
            combinable: []
        },
        
        wrench: {
            id: 'wrench',
            name: 'Wrench',
            description: "A heavy wrench. Good for tightening things. Or jamming things.",
            consumable: false,
            combinable: []
        },
        
        tv: {
            id: 'tv',
            name: 'TV',
            description: "The alien's TV set. Should work as a replacement Interdimensional Relay. It's basically just a monitor anyway.",
            consumable: true,
            combinable: []
        },
        
        // ── Brain Puzzle Items ──────────────────────────────────────────
        
        brain: {
            id: 'brain',
            name: "Victor's Brain",
            description: "A brain in a jar. Labeled 'Abnormal'. It's Victor — Hector's old college rival.",
            consumable: false,
            combinable: []
        },
        
        trophy_item_1: {
            id: 'trophy_item_1',
            name: 'Trophy Base',
            description: "Could be the base of a makeshift trophy with a little work.",
            consumable: false,
            combinable: ['trophy_item_2']
        },
        
        trophy_item_2: {
            id: 'trophy_item_2',
            name: 'Trophy Top',
            description: "This could go on top of something to make a trophy-ish shape.",
            consumable: false,
            combinable: ['trophy_item_1']
        },
        
        trophy_assembled: {
            id: 'trophy_assembled',
            name: 'Makeshift Trophy',
            description: "Two items haphazardly taped together into a vaguely trophy-shaped object. Needs paint.",
            consumable: false,
            combinable: ['spray_paint']
        },
        
        spray_paint: {
            id: 'spray_paint',
            name: 'Gold Spray Paint',
            description: "A can of gold spray paint. Found in the shed.",
            consumable: false,
            combinable: ['trophy_assembled']
        },
        
        trophy_painted: {
            id: 'trophy_painted',
            name: 'Gold Trophy',
            description: "A gold-painted makeshift trophy. Looks almost convincing. Just needs a name on it.",
            consumable: false,
            combinable: ['sharpie']
        },
        
        sharpie: {
            id: 'sharpie',
            name: 'Sharpie',
            description: "A permanent marker. Good for writing names on things. Or drawing mustaches.",
            consumable: false,
            combinable: ['trophy_painted']
        },
        
        fake_trophy: {
            id: 'fake_trophy',
            name: "Victor's Trophy",
            description: "A spray-painted makeshift trophy with 'VICTOR' written on it in Sharpie. Nailed it.",
            consumable: true,
            combinable: []
        },
        
        goggles: {
            id: 'goggles',
            name: "Hector's Goggles",
            description: "Hector's iconic safety goggles. Part of the essential Hector look.",
            consumable: false,
            combinable: ['lab_coat']
        },
        
        hector_disguise: {
            id: 'hector_disguise',
            name: 'Hector Disguise',
            description: "A lab coat, goggles, and a Sharpie mustache. I am definitely Hector. No one will question this.",
            consumable: false,
            combinable: []
        },
        
        // ── Finale Items ────────────────────────────────────────────────
        
        mirror: {
            id: 'mirror',
            name: 'Mirror',
            description: "A mirror. Could deflect something, maybe.",
            consumable: true,
            combinable: []
        }
    };
    
})();
