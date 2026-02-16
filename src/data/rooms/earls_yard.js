// ============================================================================
// EARL'S YARD - Earl's Cozy Oasis
// ============================================================================
// A warm, welcoming single-screen space behind the fence. Earl (a bigfoot)
// has made this his personal paradise: tiki vibes, good grilling, and a
// vintage Airstream home. A stark contrast to Hector's neglected property.
// Connects to: backyard (left edge - through fence gate)
//
// Structure: Room data first (for easy editing), drawing code below.
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // SHARED LAYOUT — Single source of truth for all interactive element positions.
    // Both drawing functions and hotspot definitions reference this object.
    // When an element moves, change it here and both systems stay in sync.
    // =========================================================================

    // Depth offsets from floorY (0.72) for MEDIUM camera:
    //   Back wall = 0.72 (floorY), Mid-floor = 0.76, Foreground = 0.79-0.80
    //   Drawing uses: treeFloorY = 0.72 + 60px, midFloorY = 0.72 + 30px, foregroundY = 0.72 + 50px
    //   LAYOUT y-values match where visual elements actually appear after offsets.
    const LAYOUT = {
        woods:            { x: 640,  y: 0.35, w: 1280, h: 0.35 },
        tree_left:        { x: 120,  y: 0.48, w: 120, h: 0.60 },  // Foreground: drawn at treeFloorY (0.80)
        tree_right:       { x: 1160, y: 0.48, w: 110, h: 0.60 },  // Foreground: drawn at treeFloorY (0.80)
        string_lights:    { x: 640,  y: 0.22, w: 1000, h: 0.08 },
        flamingo:         { x: 320,  y: 0.70, w: 40,  h: 0.18 },  // Mid-floor (drawn at midFloorY ~0.76)
        airstream:        { x: 637,  y: 0.42, w: 695, h: 0.53 },  // Back wall (against tree line)
        airstream_door:   { x: 464,  y: 0.52, w: 100, h: 0.34 },
        airstream_window: { x: 781,  y: 0.36, w: 150, h: 0.15 },
        cooler:           { x: 1040, y: 0.73, w: 89,  h: 0.09 },  // Foreground (drawn at foregroundY ~0.79)
        radio:            { x: 650,  y: 0.67, w: 70,  h: 0.19 },  // Mid-floor (drawn at midFloorY ~0.76)
        grill:            { x: 780,  y: 0.69, w: 110, h: 0.24 },  // Mid-floor (drawn at midFloorY+5 ~0.78)
        earl:             { x: 920,  y: 0.50, w: 80,  h: 0.50 },  // Mid-floor (drawn at midFloorY ~0.76)
        ladder:           { x: 1160, y: 0.70, w: 60,  h: 0.38 },  // Foreground (drawn at treeFloorY ~0.80)
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.earls_yard = {
        id: 'earls_yard',
        name: "Earl's Yard",

        worldWidth: 1280,
        screenWidth: 1280,
        cameraPreset: 'MEDIUM',

        walkableArea: {
            // Custom polygon tracing the walkable yard area
            polygon: [
                { x: 107, y: 0.839 },
                { x: 239, y: 0.815 },
                { x: 380, y: 0.829 },
                { x: 387, y: 0.750 },
                { x: 535, y: 0.740 },
                { x: 585, y: 0.740 },
                { x: 590, y: 0.800 },
                { x: 635, y: 0.826 },
                { x: 767, y: 0.826 },
                { x: 891, y: 0.829 },
                { x: 1036, y: 0.822 },
                { x: 1151, y: 0.810 },
                { x: 1256, y: 0.806 },
                { x: 1261, y: 0.908 },
                { x: 1247, y: 0.965 },
                { x: 819, y: 0.985 },
                { x: 573, y: 0.968 },
                { x: 189, y: 0.982 },
                { x: 119, y: 0.975 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0xaa9070,
            ambientMobile: 0xbaa080,
            sources: [
                // Moonlight filtered through trees
                { id: 'moon_filtered', x: 640, y: 0.10, radius: 400, color: 0xaabbdd, intensity: 0.5 },
                // String lights - colored bulbs at actual positions
                { id: 'string_red', x: 191, y: 0.222, radius: 100, color: 0xff4444, intensity: 0.5 },
                { id: 'string_green', x: 330, y: 0.222, radius: 100, color: 0x44ff44, intensity: 0.5 },
                { id: 'string_purple', x: 475, y: 0.215, radius: 100, color: 0xaa44ff, intensity: 0.5 },
                { id: 'string_yellow', x: 609, y: 0.222, radius: 100, color: 0xffff44, intensity: 0.5 },
                { id: 'string_pink', x: 747, y: 0.225, radius: 100, color: 0xff44ff, intensity: 0.5 },
                { id: 'string_blue', x: 891, y: 0.222, radius: 100, color: 0x4444ff, intensity: 0.5 },
                { id: 'string_orange', x: 1027, y: 0.225, radius: 100, color: 0xffaa44, intensity: 0.5 },
                // Airstream door warm light
                { id: 'airstream_door', x: 463, y: 0.442, radius: 140, color: 0xffddaa, intensity: 0.9 },
                // Airstream window warm light
                { id: 'airstream_window', x: 774, y: 0.356, radius: 120, color: 0xffddaa, intensity: 0.7 },
                // Grill coals - warm orange glow
                { id: 'grill_coals', x: 783, y: 0.68, radius: 200, color: 0xff6633, intensity: 1.4 }
            ]
        },

        audio: {
            music: {
                key: 'earl_theme',
                volume: 0.25,
                fade: 1000,
                effects: ['radio'],  // Tinny radio sound effect
                stations: [
                    { key: 'earl_theme' },
                    { key: 'earl_theme_2' }
                ]
            },
            layers: [
                {
                    key: 'night_ambience',
                    channel: 'ambient',
                    volume: 0.2,
                    fade: 500
                }
            ]
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawEarlsYardRoom
            }
        ],

        spawns: {
            default: { x: 150, y: 0.82 },
            from_backyard: { x: 150, y: 0.82 }
        },

        exits: [
            {
                edge: 'left',
                width: 80,
                target: 'backyard',
                spawnPoint: 'from_earls_yard'
            }
        ],

        npcs: [
            {
                id: 'earl',
                name: 'Earl',
                sprite: 'earl_idle',
                position: { x: 920, y: 0.82 },  // Well to the right of the grill
                heightRatio: 1.15,  // Just slightly taller than Nate
                interactX: 920,
                interactY: 0.82
            }
        ],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        getHotspotData(height) {
            const hotspots = [
                // === BACKGROUND (lowest priority — must be first in array) ===
                {
                    id: 'woods_background',
                    ...LAYOUT.woods,
                    interactX: LAYOUT.woods.x, interactY: 0.82,
                    name: 'Dark Woods',
                    verbs: { action: 'Walk into', look: 'Peer into' },
                    responses: {
                        look: "Dense, dark woods surround this cozy clearing. Pretty sure I'd get lost immediately.",
                        action: "No thanks. I like it here where there's light and burgers."
                    }
                },

                // === AIRSTREAM (large fallback — created first, sits underneath) ===
                {
                    id: 'airstream_home',
                    ...LAYOUT.airstream,
                    interactX: LAYOUT.airstream.x, interactY: 0.82,
                    name: "Earl's Airstream",
                    verbs: { action: 'Knock', look: 'Examine' },
                    responses: {
                        look: "This thing is a classic!",
                        action: "I'd love to hit the road in this."
                    }
                },

                // === SPECIFIC HOTSPOTS (created after backgrounds — sit on top) ===
                {
                    id: 'tree_left',
                    ...LAYOUT.tree_left,
                    interactX: LAYOUT.tree_left.x, interactY: 0.82,
                    name: 'Large Tree',
                    verbs: { action: 'Climb', look: 'Examine' },
                    responses: {
                        look: "A big old oak tree. Probably provides nice shade during the day.",
                        action: "Tree climbing was never my strong suit."
                    }
                },
                {
                    id: 'tree_right',
                    ...LAYOUT.tree_right,
                    interactX: LAYOUT.tree_right.x, interactY: 0.82,
                    name: 'Large Tree',
                    verbs: { action: 'Climb', look: 'Examine' },
                    responses: {
                        look: "Another big tree. This place is framed beautifully.",
                        action: "Still a no on the tree climbing."
                    }
                },
                {
                    id: 'string_lights',
                    ...LAYOUT.string_lights,
                    interactX: LAYOUT.string_lights.x, interactY: 0.82,
                    name: 'String Lights',
                    verbs: { action: 'Admire', look: 'Look at' },
                    responses: {
                        look: "These lights really create a vibe!",
                        action: "I'm not going to steal a man's vibe. "
                    }
                },
                {
                    id: 'airstream_door',
                    ...LAYOUT.airstream_door,
                    interactX: LAYOUT.airstream_door.x, interactY: 0.82,
                    name: 'Airstream Door',
                    verbs: { action: 'Knock', look: 'Examine' },
                    responses: {
                        look: "It's the door to the Airstream.",
                        action: "No reason to go inside, everyone is out here."
                    }
                },
                {
                    id: 'airstream_window',
                    ...LAYOUT.airstream_window,
                    interactX: LAYOUT.airstream_window.x, interactY: 0.82,
                    name: 'Airstream Window',
                    verbs: { action: 'Peek', look: 'Look at' },
                    responses: {
                        look: "Looks cozy in there. ",
                        action: "If I want to go inside, i'll just use the door."
                    }
                },

                // === LAWN ITEMS ===
                {
                    id: 'flamingo_pink',
                    ...LAYOUT.flamingo,
                    interactX: LAYOUT.flamingo.x, interactY: 0.82,
                    name: 'Pink Flamingo',
                    verbs: { action: 'Pat', look: 'Examine' },
                    responses: {
                        look: "A bright pink plastic lawn flamingo. Tacky, beloved, and absolutely perfect.",
                        action: "Hey there, flamingo!"
                    }
                },

                // === GRILL AREA ===
                {
                    id: 'cooler_green',
                    ...LAYOUT.cooler,
                    interactX: LAYOUT.cooler.x, interactY: 0.82,
                    name: 'Cooler',
                    verbs: { action: 'Open', look: 'Examine' },
                    responses: {
                        look: "It's a green cooler full of drinks.",
                        action: "Hey, a root beer!"
                    }
                },
                {
                    id: 'radio_table',
                    ...LAYOUT.radio,
                    interactX: LAYOUT.radio.x, interactY: 0.82,
                    name: 'Old Radio',
                    verbs: { action: 'Listen', look: 'Examine' },
                    responses: {
                        look: "It's a old tube radio with great reception.",
                        action: "I'll change the station."
                    },
                    actionTrigger: { type: 'action', action: 'cycle_radio_station' }
                },
                {
                    id: 'grill_charcoal',
                    ...LAYOUT.grill,
                    interactX: LAYOUT.grill.x, interactY: 0.82,
                    name: 'Charcoal Grill',
                    verbs: { action: 'Check', look: 'Examine' },
                    responses: {
                        look: "That smells AMAZING. Burgers are definitely happening.",
                        action: "YEEEOUCH. Why'd I do that?"
                    }
                },

                // === EARL ===
                {
                    id: 'earl_npc',
                    ...LAYOUT.earl,
                    interactX: 744, interactY: 0.828,
                    interactFacing: 'right',  // Force Nate to face right (toward Earl)
                    name: 'Earl',
                    type: 'npc',
                    verbs: { action: 'Talk to', look: 'Look at' },
                    responses: {
                        look: "A large, friendly-looking sasquatch in a chef's hat. He's smells faintly of charcoal and pine.",
                        action: null
                    }
                    // TODO: Wire up Earl's conversation tree
                }
            ];

            // === LADDER (conditional based on tongs returned AND not yet picked up) ===
            if (TSH.State.hasItem('ladder')) {
                // Ladder already picked up - don't show hotspot at all
                // (visual is also hidden by drawing function checking same item)
            } else if (TSH.State.getFlag('clock.returned_borrowed_item')) {
                // After returning tongs but before pickup - ladder is pickupable
                hotspots.push({
                    id: 'ladder_earl_unlocked',
                    ...LAYOUT.ladder,
                    interactX: LAYOUT.ladder.x, interactY: 0.82,
                    name: "Earl's Ladder",
                    verbs: { action: 'Take', look: 'Examine' },
                    responses: {
                        look: "A sturdy aluminum ladder. That would be really useful for reaching high places...",
                        action: "Thanks again for the ladder! | earl: No problemo!"  // Success - Earl gave permission
                    },
                    giveItem: 'ladder',
                    removeAfterPickup: true
                });
            } else {
                // Before returning tongs - ladder visible but not pickupable
                hotspots.push({
                    id: 'ladder_earl_locked',
                    ...LAYOUT.ladder,
                    interactX: LAYOUT.ladder.x, interactY: 0.82,
                    name: "Earl's Ladder",
                    verbs: { action: 'Take', look: 'Examine' },
                    responses: {
                        look: "A sturdy aluminum ladder. That would be really useful for reaching high places...",
                        action: "earl: Hang on there, neighbor! | earl: I can't let old stretch out of my sight. | I should really ask permission before stea- er, borrowing the ladder."
                    }
                });
            }

            return hotspots;
        },

        // =====================================================================
        // PICKUP OVERLAYS
        // =====================================================================

        pickupOverlays: [],

        // =====================================================================
        // ITEM INTERACTIONS
        // =====================================================================

        itemInteractions: {
            grill_charcoal: {
                default: "I'm not putting my {item} on the grill. Earl would never forgive me.",
                lit_candle: "It's already lit and cooking nicely.",
                matches: "It's already lit and smelling good.",
},
            flamingo_pink: {
                default: "The flamingo doesn't want my {item}. It's a flamingo.",
                help_wanted_ad: "Hey flamingo, did you publish this ad?",
},
            _default: "I don't think the {item} works with the {hotspot}.",
            woods_background: {
                lit_candle: "Only we can prevent forest fires!",
            },

            airstream_home: {
                lit_candle: "That's a bit extreme.",
                            matches: "I'm no arsonist.",
},

            tree_left: {
                lit_candle: "Only we can prevent forest fires!",
            },

            tree_right: {
                lit_candle: "Only we can prevent forest fires!",
            },

            earl_npc: {
                help_wanted_ad: "I don't think he's the one who's looking for help. He seems to have it all figured out.",
                tongs: {
                    dialogue: "earl: My grill claws! | earl: I never thought I'd see them again! | earl: Thanks bud.",
                    consumeItem: true,
                    setFlag: "clock.returned_borrowed_item"
                }
},
},

        // Flags that trigger automatic hotspot refresh
        relevantFlags: ['clock.returned_borrowed_item'],

        firstVisit: {
            delay: 600,
            dialogue: "Whoa. This place is... cozy! Smells incredible too."
        },

        features: {
            tikoVibes: true,
            grillActive: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Sky & Woods
        SKY_DARK: 0x0a0a18,
        SKY_MID: 0x141428,
        WOODS_DARK: 0x0a1a0a,
        WOODS_MID: 0x152515,
        WOODS_LIGHT: 0x1a3a1a,

        // Grass (well-maintained)
        GRASS_DARK: 0x1a2a15,
        GRASS_MID: 0x2a3a20,
        GRASS_LIGHT: 0x3a4a2a,
        GRASS_BRIGHT: 0x4a5a35,

        // Tree bark
        BARK_DARK: 0x2a1a10,
        BARK_MID: 0x3a2a15,
        BARK_LIGHT: 0x4a3a20,

        // String lights
        LIGHT_WIRE: 0x2a2a2a,
        LIGHT_YELLOW: 0xffcc66,
        LIGHT_YELLOW_BRIGHT: 0xffeeaa,

        // Airstream metal
        METAL_DARK: 0x6a6a6a,
        METAL_MID: 0x8a8a8a,
        METAL_LIGHT: 0xaaaaaa,
        METAL_BRIGHT: 0xcccccc,

        // Wood (furniture, ladder)
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,

        // Grill
        GRILL_DARK: 0x1a1a1a,
        GRILL_MID: 0x3a3a3a,
        FIRE_ORANGE: 0xff6633,
        FIRE_YELLOW: 0xffaa44,
        COAL_DARK: 0x2a1510,
        COAL_GLOW: 0xff8844,

        // Cooler
        COOLER_GREEN: 0x3a6a4a,
        COOLER_GREEN_LIGHT: 0x5a8a6a,

        // Lawn chair & flamingo
        CHAIR_FABRIC: 0x5a7a8a,
        CHAIR_FRAME: 0x4a4a4a,
        FLAMINGO_PINK: 0xff6699,
        FLAMINGO_DARK: 0xcc4477,

        // Metal accents
        BRASS: 0xb5a642
    };

    const p = 2;

    function drawTree(g, x, floorY, totalHeight) {
        // Large tree trunk extending from top of screen down into the yard
        // Trunk extends PAST the floor line to show it's in the foreground
        const trunkWidth = p * 40;
        const trunkX = x - trunkWidth/2;
        const trunkBottom = floorY + p*40;  // Extends down into grass area

        // Trunk extends from top to below floor
        g.fillStyle(COLORS.BARK_DARK);
        g.fillRect(trunkX, 0, trunkWidth, trunkBottom);
        g.fillStyle(COLORS.BARK_MID);
        g.fillRect(trunkX + p*3, p*10, trunkWidth - p*6, trunkBottom - p*20);

        // Bark texture (vertical grooves)
        for (let py = p*15; py < trunkBottom - p*10; py += p*15) {
            g.fillStyle(COLORS.BARK_DARK);
            g.fillRect(trunkX + p*4, py, trunkWidth - p*8, p*2);
            // Vertical grooves
            for (let px = trunkX + p*8; px < trunkX + trunkWidth - p*8; px += p*10) {
                g.fillStyle(COLORS.BARK_LIGHT);
                g.fillRect(px, py - p*6, p, p*12);
            }
        }

        // Grass at base of tree (showing it's planted in the yard)
        const grassBaseWidth = trunkWidth + p*30;
        const grassBaseX = x - grassBaseWidth/2;
        const grassBaseY = floorY;
        const grassBaseHeight = p*45;

        // Dark grass shadow around trunk
        g.fillStyle(COLORS.GRASS_DARK);
        g.fillRect(grassBaseX, grassBaseY, grassBaseWidth, grassBaseHeight);

        // Grass texture at base
        for (let gx = grassBaseX; gx < grassBaseX + grassBaseWidth; gx += p*8) {
            g.fillStyle(COLORS.GRASS_MID);
            g.fillRect(gx + p*2, grassBaseY + p*2, p*4, p*3);
            g.fillStyle(COLORS.GRASS_LIGHT);
            g.fillRect(gx + p*4, grassBaseY + p*6, p*3, p*2);
        }

        // Taller grass blades around base
        for (let bx = grassBaseX + p*5; bx < grassBaseX + grassBaseWidth - p*5; bx += p*12) {
            const bladeHeight = p * (4 + ((bx * 3) % 5));
            g.fillStyle(COLORS.GRASS_BRIGHT);
            g.fillRect(bx, grassBaseY - bladeHeight, p*2, bladeHeight + grassBaseHeight);
        }

        // Foliage - large canopy reaching top of screen
        const foliageWidth = p * 160;
        const foliageX = x - foliageWidth/2;

        // Main foliage mass at top
        g.fillStyle(COLORS.WOODS_DARK);
        g.fillRect(foliageX, 0, foliageWidth, totalHeight * 0.35);

        g.fillStyle(COLORS.WOODS_MID);
        g.fillRect(foliageX + p*15, p*8, foliageWidth - p*30, totalHeight * 0.3);

        // Irregular leaf clusters
        const clusters = [
            { x: foliageX + p*20, y: p*15, w: p*50, h: p*40 },
            { x: foliageX + p*80, y: p*5, w: p*60, h: p*50 },
            { x: foliageX + p*40, y: p*60, w: p*45, h: p*35 },
            { x: foliageX + p*100, y: p*55, w: p*40, h: p*30 }
        ];

        clusters.forEach(cluster => {
            g.fillStyle(COLORS.WOODS_LIGHT);
            g.fillRect(cluster.x, cluster.y, cluster.w, cluster.h);
        });
    }

    function drawWoodsBackground(g, worldWidth, skyHeight, floorY) {
        // Dense dark woods behind everything
        const woodsTop = skyHeight * 0.3;
        const woodsHeight = floorY - woodsTop;

        g.fillStyle(COLORS.WOODS_DARK);
        g.fillRect(0, woodsTop, worldWidth, woodsHeight);

        // Tree silhouettes in background
        const treeSilhouettes = [
            { x: 100, w: 40 },
            { x: 220, w: 50 },
            { x: 400, w: 35 },
            { x: 580, w: 45 },
            { x: 750, w: 55 },
            { x: 900, w: 40 },
            { x: 1050, w: 50 },
            { x: 1180, w: 45 }
        ];

        treeSilhouettes.forEach(tree => {
            g.fillStyle(COLORS.WOODS_MID);
            g.fillRect(tree.x - tree.w/2, woodsTop, tree.w, woodsHeight);
        });
    }

    function drawStringLights(g, x, y, width) {
        // Wire
        g.fillStyle(COLORS.LIGHT_WIRE);
        g.fillRect(x, y, width, p);

        // Colorful light bulbs along the wire
        const bulbColors = [
            { main: 0xff4444, glow: 0xff6666 },  // Red
            { main: 0x44ff44, glow: 0x66ff66 },  // Green
            { main: 0xaa44ff, glow: 0xcc66ff },  // Purple
            { main: 0xffff44, glow: 0xffff66 },  // Yellow
            { main: 0xff44ff, glow: 0xff66ff },  // Pink
            { main: 0x4444ff, glow: 0x6666ff },  // Blue
            { main: 0xffaa44, glow: 0xffcc66 }   // Orange
        ];

        const bulbSpacing = p * 70;
        let colorIndex = 0;

        for (let bx = x + p*35; bx < x + width - p*35; bx += bulbSpacing) {
            const color = bulbColors[colorIndex % bulbColors.length];

            // Bulb glow (outer) - brighter and more visible
            g.fillStyle(color.glow);
            g.globalAlpha = 0.7;
            g.fillRect(bx - p*6, y + p*2, p*12, p*14);
            g.globalAlpha = 0.9;
            g.fillRect(bx - p*4, y + p*3, p*8, p*12);
            g.globalAlpha = 1.0;

            // Bulb main - bright color
            g.fillStyle(color.main);
            g.fillRect(bx - p*3, y + p*4, p*6, p*9);

            // Highlight
            g.fillStyle(0xffffff);
            g.fillRect(bx - p, y + p*5, p*2, p*3);

            // Socket
            g.fillStyle(COLORS.LIGHT_WIRE);
            g.fillRect(bx - p, y, p*2, p*3);

            colorIndex++;
        }
    }


    function drawFlamingo(g, x, floorY) {
        const flamingoHeight = p * 45;
        const bodyY = floorY - flamingoHeight + p*10;

        // Legs (thin stakes)
        g.fillStyle(COLORS.FLAMINGO_DARK);
        g.fillRect(x - p*3, bodyY + p*20, p*2, flamingoHeight - p*20);
        g.fillRect(x + p, bodyY + p*20, p*2, flamingoHeight - p*20);

        // Body (oval-ish)
        g.fillStyle(COLORS.FLAMINGO_PINK);
        g.fillRect(x - p*6, bodyY, p*12, p*18);
        g.fillStyle(COLORS.FLAMINGO_DARK);
        g.fillRect(x - p*5, bodyY + p*2, p*10, p*14);

        // Neck (curved up)
        g.fillStyle(COLORS.FLAMINGO_PINK);
        g.fillRect(x + p*4, bodyY - p*8, p*3, p*12);

        // Head
        g.fillRect(x + p*3, bodyY - p*12, p*5, p*5);

        // Beak
        g.fillStyle(COLORS.FLAMINGO_DARK);
        g.fillRect(x + p*7, bodyY - p*10, p*3, p*2);
    }

    function drawAirstream(g, x, floorY, width, height) {
        const airstreamBottom = floorY - p*10; // Leave room for wheels
        const airstreamTop = airstreamBottom - height;

        // Main body - smooth aluminum (no ribbing)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - width/2, airstreamTop, width, height);

        // Light/dark panels for dimension (vertical sections instead of horizontal)
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - width/2, airstreamTop + p*5, width * 0.3, height - p*10);
        g.fillRect(x + width * 0.2, airstreamTop + p*5, width * 0.3, height - p*10);

        // Darker shading on edges
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - width/2, airstreamTop, p*4, height);
        g.fillRect(x + width/2 - p*4, airstreamTop, p*4, height);

        // Rounded front end (classic Airstream curve)
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - width/2 - p*5, airstreamTop + p*10, p*5, height - p*20);
        g.fillRect(x - width/2 - p*8, airstreamTop + p*20, p*3, height - p*40);

        // Steps leading up to door (wood)
        const doorX = x - width * 0.25;
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(doorX - p*28, airstreamBottom - p*4, p*56, p*5);
        g.fillRect(doorX - p*22, airstreamBottom - p*12, p*44, p*5);

        // Door - aluminum like the Airstream, bigger
        const doorWidth = p * 50;
        const doorHeight = p * 120;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(doorX - doorWidth/2, airstreamBottom - doorHeight, doorWidth, doorHeight);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(doorX - doorWidth/2 + p*3, airstreamBottom - doorHeight + p*3, doorWidth - p*6, doorHeight - p*6);

        // Door frame detail
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(doorX - doorWidth/2 + p*6, airstreamBottom - doorHeight + p*6, doorWidth - p*12, p*4);
        g.fillRect(doorX - doorWidth/2 + p*6, airstreamBottom - p*6, doorWidth - p*12, p*4);

        // Door window (glowing) - larger
        g.fillStyle(0xffddaa);
        g.fillRect(doorX - p*16, airstreamBottom - doorHeight + p*18, p*32, p*26);

        // Window frame around door window
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(doorX - p*18, airstreamBottom - doorHeight + p*16, p*36, p*2);
        g.fillRect(doorX - p*18, airstreamBottom - doorHeight + p*44, p*36, p*2);

        // Door handle
        g.fillStyle(COLORS.BRASS);
        g.fillRect(doorX + doorWidth/2 - p*12, airstreamBottom - p*65, p*5, p*12);

        // Large window next to door - bigger and lower
        const windowX = x + width * 0.2;
        const windowWidth = p * 75;
        const windowHeight = p * 52;
        const windowY = airstreamTop + p*50;

        // Window frame
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(windowX - windowWidth/2 - p*2, windowY - p*2, windowWidth + p*4, windowHeight + p*4);

        // Window glass (glowing)
        g.fillStyle(0xffddaa);
        g.fillRect(windowX - windowWidth/2, windowY, windowWidth, windowHeight);

        // Window mullions (cross pattern)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(windowX - p*2, windowY, p*4, windowHeight);
        g.fillRect(windowX - windowWidth/2, windowY + windowHeight/2 - p*2, windowWidth, p*4);

        // Wheels - 2 large wheels facing camera
        const wheelPositions = [
            x - width * 0.25,  // Left wheel
            x + width * 0.25   // Right wheel
        ];

        wheelPositions.forEach(wheelX => {
            // Tire - black and more pronounced
            g.fillStyle(0x000000);
            g.fillRect(wheelX - p*12, floorY - p*18, p*24, p*18);

            // Tire tread detail
            g.fillStyle(0x1a1a1a);
            g.fillRect(wheelX - p*10, floorY - p*16, p*20, p*14);

            // Hubcap - silver center
            g.fillStyle(COLORS.METAL_MID);
            g.fillRect(wheelX - p*6, floorY - p*12, p*12, p*10);
            g.fillStyle(COLORS.METAL_LIGHT);
            g.fillRect(wheelX - p*4, floorY - p*10, p*8, p*6);

            // Wheel well shadow
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(wheelX - p*13, airstreamBottom, p*26, p*4);
        });

        // Chrome trim along bottom
        g.fillStyle(COLORS.METAL_BRIGHT);
        g.fillRect(x - width/2, airstreamBottom - p*2, width, p*2);
    }

    function drawCooler(g, x, floorY, scale) {
        scale = scale || 1;
        const s = p * scale;  // Scaled pixel unit
        const coolerWidth = s * 30;
        const coolerHeight = s * 20;
        const coolerTop = floorY - coolerHeight;

        // Main body
        g.fillStyle(COLORS.COOLER_GREEN);
        g.fillRect(x - coolerWidth/2, coolerTop, coolerWidth, coolerHeight);

        // Lid
        g.fillStyle(COLORS.COOLER_GREEN_LIGHT);
        g.fillRect(x - coolerWidth/2, coolerTop - s*3, coolerWidth, s*3);

        // Handle
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - coolerWidth/2 - s*2, coolerTop + s*5, s*2, s*8);
        g.fillRect(x + coolerWidth/2, coolerTop + s*5, s*2, s*8);
        g.fillRect(x - coolerWidth/2 - s*2, coolerTop + s*5, coolerWidth/2 + s*2, s*2);
        g.fillRect(x, coolerTop + s*5, coolerWidth/2 + s*2, s*2);

        // Condensation drops
        g.fillStyle(0x99bbdd);
        g.fillRect(x - s*8, coolerTop + s*8, s, s*2);
        g.fillRect(x + s*5, coolerTop + s*12, s, s*2);
        g.fillRect(x - s*2, coolerTop + s*15, s, s*2);
    }

    function drawGrill(g, x, floorY) {
        // Classic 50s Weber kettle grill - smaller, iconic round design
        const kettleRadius = p * 22;
        const kettleHeight = p * 40;
        const legHeight = p * 30;

        // Three legs (tripod)
        g.fillStyle(COLORS.GRILL_DARK);
        const legPositions = [
            { x: x - p*25, y: floorY },
            { x: x + p*25, y: floorY },
            { x: x, y: floorY + p*5 }
        ];

        legPositions.forEach(leg => {
            g.fillRect(leg.x - p*2, leg.y - legHeight, p*4, legHeight);
        });

        // Kettle bottom (bowl) - rounded shape approximated with rectangles
        const bowlBottom = floorY - legHeight + p*10;
        const bowlTop = bowlBottom - kettleHeight * 0.4;

        g.fillStyle(COLORS.GRILL_DARK);
        // Main bowl body
        g.fillRect(x - kettleRadius, bowlTop, kettleRadius * 2, kettleHeight * 0.4);

        // Bowl shading
        g.fillStyle(COLORS.GRILL_MID);
        g.fillRect(x - kettleRadius + p*3, bowlTop + p*2, kettleRadius * 2 - p*6, kettleHeight * 0.4 - p*4);

        // Round off bottom edge
        g.fillStyle(COLORS.GRILL_DARK);
        g.fillRect(x - kettleRadius + p*8, bowlBottom - p*3, kettleRadius * 2 - p*16, p*3);

        // Dome lid - classic Weber rounded top
        const lidTop = bowlTop - kettleHeight * 0.6;
        const lidBottom = bowlTop + p*5;

        // Lid main body
        g.fillStyle(COLORS.GRILL_DARK);
        g.fillRect(x - kettleRadius - p*2, lidTop, kettleRadius * 2 + p*4, lidBottom - lidTop);

        // Lid highlight
        g.fillStyle(COLORS.GRILL_MID);
        g.fillRect(x - kettleRadius, lidTop + p*3, kettleRadius * 2, lidBottom - lidTop - p*6);

        // Round off top of dome
        g.fillStyle(COLORS.GRILL_DARK);
        g.fillRect(x - kettleRadius + p*10, lidTop, kettleRadius * 2 - p*20, p*5);
        g.fillRect(x - kettleRadius + p*20, lidTop - p*3, kettleRadius * 2 - p*40, p*3);

        // Top vent/handle
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*6, lidTop - p*8, p*12, p*8);
        g.fillRect(x - p*3, lidTop - p*12, p*6, p*5);

        // Vent holes on lid
        g.fillStyle(COLORS.GRILL_MID);
        for (let i = 0; i < 3; i++) {
            const ventX = x - p*10 + i * p*10;
            g.fillRect(ventX, lidTop + p*15, p*4, p*2);
        }

        // Lower vent holes on bowl
        for (let i = 0; i < 3; i++) {
            const ventX = x - p*12 + i * p*12;
            g.fillRect(ventX, bowlBottom - p*15, p*5, p*3);
        }

        // Glowing coals inside (visible through vents)
        g.fillStyle(COLORS.COAL_GLOW);
        g.globalAlpha = 0.9;
        g.fillRect(x - p*8, bowlBottom - p*16, p*16, p*4);
        g.fillStyle(COLORS.FIRE_YELLOW);
        g.fillRect(x - p*5, bowlBottom - p*15, p*10, p*2);
        g.globalAlpha = 1.0;

        // Smoke wisps
        g.fillStyle(0x6a6a6a);
        g.globalAlpha = 0.4;
        g.fillRect(x - p*4, lidTop - p*20, p*8, p*12);
        g.fillRect(x + p*2, lidTop - p*30, p*5, p*15);
        g.globalAlpha = 1.0;

        // Side handle
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + kettleRadius, bowlTop + p*10, p*8, p*15);
    }

    function drawTableWithRadio(g, x, floorY) {
        // Small table with an old red radio
        const tableHeight = p * 45;
        const tableWidth = p * 35;
        const tableTop = floorY - tableHeight;

        // Table legs (wood)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - tableWidth/2 + p*3, tableTop, p*4, tableHeight);      // Left front leg
        g.fillRect(x + tableWidth/2 - p*7, tableTop, p*4, tableHeight);      // Right front leg
        g.fillRect(x - tableWidth/2 + p*3, tableTop + p*5, p*4, tableHeight - p*5);  // Left back leg (shorter perspective)
        g.fillRect(x + tableWidth/2 - p*7, tableTop + p*5, p*4, tableHeight - p*5);  // Right back leg (shorter perspective)

        // Table top
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - tableWidth/2, tableTop - p*3, tableWidth, p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - tableWidth/2 + p*2, tableTop - p*2, tableWidth - p*4, p);  // Wood grain highlight

        // Old red radio on table
        const radioWidth = p * 25;
        const radioHeight = p * 18;
        const radioX = x;
        const radioY = tableTop - p*3 - radioHeight;

        // Radio body (red)
        g.fillStyle(0xaa3333);  // Dark red
        g.fillRect(radioX - radioWidth/2, radioY, radioWidth, radioHeight);

        // Radio speaker grille (darker)
        g.fillStyle(0x662222);
        g.fillRect(radioX - radioWidth/2 + p*3, radioY + p*4, radioWidth - p*14, radioHeight - p*8);

        // Speaker holes pattern
        g.fillStyle(0x441111);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                g.fillRect(
                    radioX - radioWidth/2 + p*5 + col * p*3,
                    radioY + p*6 + row * p*3,
                    p, p
                );
            }
        }

        // Radio dial (right side)
        g.fillStyle(0x884444);
        g.fillRect(radioX + radioWidth/2 - p*8, radioY + p*4, p*5, p*5);  // Dial
        g.fillStyle(0xaa6666);
        g.fillRect(radioX + radioWidth/2 - p*7, radioY + p*5, p*3, p*3);  // Dial highlight

        // Antenna (thin metal rod)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(radioX + radioWidth/2 - p*3, radioY - p*20, p, p*20);  // Antenna extends up

        // Radio top edge highlight
        g.fillStyle(0xcc5555);
        g.fillRect(radioX - radioWidth/2, radioY, radioWidth, p*2);
    }

    function drawLadder(g, x, floorY, leanHeight) {
        const ladderTop = floorY - leanHeight;
        const rungSpacing = p * 18;
        const railWidth = p * 4;       // Thicker rails
        const ladderWidth = p * 24;    // Wider spread between rails
        const halfW = ladderWidth / 2;

        // Left rail
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - halfW, ladderTop, railWidth, leanHeight);

        // Right rail
        g.fillRect(x + halfW - railWidth, ladderTop, railWidth, leanHeight);

        // Rungs (thicker, spanning full width)
        for (let ry = ladderTop + p*12; ry < floorY - p*8; ry += rungSpacing) {
            g.fillStyle(COLORS.METAL_LIGHT);
            g.fillRect(x - halfW, ry, ladderWidth, p*3);
        }

        // Highlights on rails
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - halfW + p, ladderTop + p*2, p, leanHeight - p*4);
        g.fillRect(x + halfW - railWidth + p, ladderTop + p*2, p, leanHeight - p*4);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawEarlsYardRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera
        const skyHeight = floorY;

        // === NIGHT SKY ===
        g.fillStyle(COLORS.SKY_DARK);
        g.fillRect(0, 0, worldWidth, skyHeight * 0.5);
        g.fillStyle(COLORS.SKY_MID);
        g.fillRect(0, skyHeight * 0.5, worldWidth, skyHeight * 0.5);

        // Stars
        for (let i = 0; i < 80; i++) {
            const sx = ((i * 37 + 13) * 73) % worldWidth;
            const sy = ((i * 23 + 7) * 47) % (skyHeight * 0.7);
            g.fillStyle(i % 3 === 0 ? 0xffffff : 0xccccdd);
            g.fillRect(sx, sy, p, p);
        }

        // === WOODS BACKGROUND ===
        drawWoodsBackground(g, worldWidth, skyHeight, floorY);

        // === GRASS (well-maintained) ===
        g.fillStyle(COLORS.GRASS_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Grass texture
        for (let gx = 0; gx < worldWidth; gx += p*20) {
            g.fillStyle(COLORS.GRASS_MID);
            g.fillRect(gx + p*3, floorY + p*2, p*8, p*2);
            g.fillStyle(COLORS.GRASS_LIGHT);
            g.fillRect(gx + p*12, floorY + p*4, p*6, p);
        }

        // Some taller grass blades
        for (let tx = 0; tx < worldWidth; tx += p*30) {
            const bladeHeight = p * (3 + ((tx * 3) % 4));
            g.fillStyle(COLORS.GRASS_BRIGHT);
            g.fillRect(tx + p*5, floorY - bladeHeight, p*2, bladeHeight);
        }

        // === AIRSTREAM (centerpiece - at back wall / tree line) ===
        const airstreamWidth = worldWidth * 0.55;  // ~704px - prominent but leaves room
        const airstreamHeight = p * 197;  // ~394px, about 1.25x Nate's height
        drawAirstream(g, LAYOUT.airstream.x, floorY, airstreamWidth, airstreamHeight);

        // === LARGE TREES (foreground framing — extend well below floorY into the grass) ===
        const treeFloorY = floorY + p * 30;  // Trees are closer to camera, bases sit lower
        drawTree(g, LAYOUT.tree_left.x, treeFloorY, height);
        drawTree(g, LAYOUT.tree_right.x, treeFloorY, height);

        // === STRING LIGHTS (in front of Airstream, raised high) ===
        drawStringLights(g, LAYOUT.tree_left.x, height * 0.20, 1040);

        // === YARD ITEMS — mid-floor depth zone (below floorY) ===
        const midFloorY = floorY + p * 15;    // Mid-floor: items in the yard, not against wall
        const foregroundY = floorY + p * 25;   // Foreground: closest to camera

        drawFlamingo(g, LAYOUT.flamingo.x, midFloorY);
        drawTableWithRadio(g, LAYOUT.radio.x, midFloorY);
        drawGrill(g, LAYOUT.grill.x, midFloorY + p * 5);  // Grill slightly in front of table
        drawCooler(g, LAYOUT.cooler.x, foregroundY, 1.5);  // Cooler in foreground

        // === LADDER (in front of right tree, base below tree line) ===
        // Only draw if player hasn't picked it up yet
        if (!TSH.State.hasItem('ladder')) {
            drawLadder(g, LAYOUT.ladder.x, treeFloorY, p*120);
        }
    }

})();
