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

    const LAYOUT = {
        woods:            { x: 640,  y: 0.35, w: 1280, h: 0.35 },
        tree_left:        { x: 120,  y: 0.38, w: 120, h: 0.60 },
        tree_right:       { x: 1160, y: 0.38, w: 110, h: 0.60 },
        string_lights:    { x: 640,  y: 0.22, w: 1000, h: 0.08 },
        flamingo:         { x: 320,  y: 0.66, w: 40,  h: 0.18 },
        airstream:        { x: 640,  y: 0.42, w: 550, h: 0.45 },
        airstream_door:   { x: 464,  y: 0.52, w: 100, h: 0.34 },
        airstream_window: { x: 781,  y: 0.36, w: 150, h: 0.15 },
        cooler:           { x: 1040, y: 0.69, w: 90,  h: 0.18 },
        radio:            { x: 650,  y: 0.63, w: 70,  h: 0.19 },
        grill:            { x: 780,  y: 0.61, w: 110, h: 0.24 },
        earl:             { x: 920,  y: 0.46, w: 80,  h: 0.50 },
        ladder:           { x: 1160, y: 0.52, w: 50,  h: 0.32 },
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
            // MEDIUM camera preset: walkable band 0.72-0.92
            polygon: [
                { x: 0, y: 0.72 },
                { x: 1280, y: 0.72 },
                { x: 1280, y: 0.92 },
                { x: 0, y: 0.92 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0xaa9070,
            ambientMobile: 0xbaa080,
            sources: [
                // Moonlight filtered through trees
                { id: 'moon_filtered', x: 640, y: 0.10, radius: 400, color: 0xaabbdd, intensity: 0.5 },
                // String lights warm glow
                { id: 'string_1', x: 200, y: 0.45, radius: 120, color: 0xffcc66, intensity: 0.6 },
                { id: 'string_2', x: 400, y: 0.48, radius: 120, color: 0xffcc66, intensity: 0.6 },
                { id: 'string_3', x: 600, y: 0.45, radius: 120, color: 0xffcc66, intensity: 0.6 },
                { id: 'string_4', x: 800, y: 0.48, radius: 120, color: 0xffcc66, intensity: 0.6 },
                { id: 'string_5', x: 1000, y: 0.45, radius: 120, color: 0xffcc66, intensity: 0.6 },
                // Grill coals - warm orange glow
                { id: 'grill_coals', x: 950, y: 0.72, radius: 180, color: 0xff8844, intensity: 1.2 },
                // Airstream interior warm light
                { id: 'airstream_interior', x: 640, y: 0.55, radius: 250, color: 0xffddaa, intensity: 0.8 },
                // Earl illumination - makes Earl visible in the lighting
                { id: 'earl_light', x: 920, y: 0.60, radius: 180, color: 0xffcc66, intensity: 0.8 }
            ]
        },

        audio: {
            music: {
                key: 'earl_theme',
                volume: 0.25,
                fade: 1000,
                effects: ['radio']  // Tinny radio sound effect
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
                sprite: 'earl_placeholder',
                position: { x: 920, y: 0.82 },  // Well to the right of the grill
                heightRatio: 1.15,  // Just slightly taller than Nate
                interactX: 920,
                interactY: 0.82
            }
        ],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
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
                    look: "A vintage Airstream trailer, lovingly maintained. Warm light glows from inside. This is Earl's home, and it's beautiful.",
                    action: "I knock on the door. No answer—Earl's out here with me. Feels rude to go in without permission."
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
                    look: "A big old oak tree. Provides nice shade during the day, I bet.",
                    action: "I'm not much of a tree climber. Plus, Earl might think that's weird."
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
                    action: "Still not climbing it."
                }
            },
            {
                id: 'string_lights',
                ...LAYOUT.string_lights,
                interactX: LAYOUT.string_lights.x, interactY: 0.82,
                name: 'String Lights',
                verbs: { action: 'Admire', look: 'Look at' },
                responses: {
                    look: "Warm yellow string lights strung between the trees and across the Airstream. So cozy!",
                    action: "This is perfect ambiance. Earl's got style."
                }
            },
            {
                id: 'airstream_door',
                ...LAYOUT.airstream_door,
                interactX: LAYOUT.airstream_door.x, interactY: 0.82,
                name: 'Airstream Door',
                verbs: { action: 'Knock', look: 'Examine' },
                responses: {
                    look: "The Airstream's front door. An aluminum door with a warm glow coming through the window. Steps lead up to it.",
                    action: "I knock on the door. No answer from inside. Earl's out here by the grill."
                }
            },
            {
                id: 'airstream_window',
                ...LAYOUT.airstream_window,
                interactX: LAYOUT.airstream_window.x, interactY: 0.82,
                name: 'Airstream Window',
                verbs: { action: 'Peek', look: 'Look at' },
                responses: {
                    look: "A large window on the side of the Airstream. Warm light spills out. Looks cozy in there.",
                    action: "I peek through the window. Nice curtains. A small kitchen. Some photos on the wall. Feels wrong to snoop."
                }
            },

            // === LAWN ITEMS ===
            {
                id: 'flamingo_pink',
                ...LAYOUT.flamingo,
                interactX: LAYOUT.flamingo.x, interactY: 0.82,
                name: 'Pink Flamingo',
                verbs: { action: 'Poke', look: 'Examine' },
                responses: {
                    look: "A bright pink plastic lawn flamingo. Tacky, beloved, and absolutely perfect.",
                    action: "I give it a little pat on the head. The flamingo does not react. Still perfect."
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
                    look: "A green cooler, probably full of drinks. Condensation on the outside—it's cold.",
                    action: "I peek inside. Sodas! Root beer, cola, lemon-lime... Earl's prepared for company."
                }
            },
            {
                id: 'radio_table',
                ...LAYOUT.radio,
                interactX: LAYOUT.radio.x, interactY: 0.82,
                name: 'Old Radio',
                verbs: { action: 'Turn on', look: 'Examine' },
                responses: {
                    look: "An old red radio sitting on a small wooden table. The antenna is fully extended. It's playing Earl's favorite tunes.",
                    action: "The radio's already on, playing some mellow music. The sound has that warm, tinny quality of vintage electronics."
                }
            },
            {
                id: 'grill_charcoal',
                ...LAYOUT.grill,
                interactX: LAYOUT.grill.x, interactY: 0.82,
                name: 'Charcoal Grill',
                verbs: { action: 'Check', look: 'Examine' },
                responses: {
                    look: "A classic charcoal grill with glowing coals inside. Smells AMAZING. Burgers are definitely happening.",
                    action: "I lean in and feel the heat. Those coals are perfect. Earl knows what he's doing."
                }
            },
            {
                id: 'ladder_earl',
                ...LAYOUT.ladder,
                interactX: LAYOUT.ladder.x, interactY: 0.82,
                name: "Earl's Ladder",
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A sturdy aluminum ladder leaning against the Airstream. That would be really useful for reaching high places...",
                    action: null
                },
                actionTrigger: {
                    type: 'custom',
                    script: (scene, hotspot) => {
                        // TODO: State-driven - Check if Hector returned Earl's borrowed item
                        // For now, Earl always stops Nate
                        scene.showDialogue("Earl stops me. \"Hold on there, friend. I'd be happy to lend you that ladder, but Hector still has my [ITEM]. Once I get that back, it's all yours!\"");
                    }
                }
                // TODO: Once player returns Earl's item, this becomes available to take
            },

            // === EARL ===
            {
                id: 'earl_npc',
                ...LAYOUT.earl,
                interactX: LAYOUT.earl.x, interactY: 0.82,
                name: 'Earl',
                type: 'npc',
                verbs: { action: 'Talk to', look: 'Look at' },
                responses: {
                    look: "A large, friendly-looking fellow in a fisherman's hat. He's got an easy smile and smells faintly of charcoal and pine.",
                    action: null
                }
                // TODO: Wire up Earl's conversation tree
            }
        ],

        // =====================================================================
        // PICKUP OVERLAYS
        // =====================================================================

        pickupOverlays: [],

        // =====================================================================
        // ITEM INTERACTIONS
        // =====================================================================

        itemInteractions: {
            grill_charcoal: {
                default: "I'm not putting my {item} on the grill. Earl would never forgive me."
            },
            flamingo_pink: {
                default: "The flamingo doesn't want my {item}. It's a flamingo."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

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
        GRASS_DARK: 0x2a4a25,
        GRASS_MID: 0x3a5a30,
        GRASS_LIGHT: 0x4a6a3a,
        GRASS_BRIGHT: 0x5a7a45,

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
            { main: 0x4444ff, glow: 0x6666ff },  // Blue
            { main: 0xffff44, glow: 0xffff66 },  // Yellow
            { main: 0xff44ff, glow: 0xff66ff },  // Magenta
            { main: 0x44ffff, glow: 0x66ffff },  // Cyan
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

    function drawEarl(g, x, floorY) {
        // Earl the bigfoot - subtle, just slightly taller/wider than Nate (1.15x)
        const earlHeight = p * 181;  // ~362px tall (1.15x Nate's ~315px)
        const torsoWidth = p * 24;   // Same width as head for better proportions
        const feetY = floorY;

        // Legs (same width as torso with gap in middle)
        g.fillStyle(0x4a3020);  // Brown fur
        g.fillRect(x - p*12, feetY - p*70, p*10, p*70);  // Left leg
        g.fillRect(x + p*2, feetY - p*70, p*10, p*70);   // Right leg (gap in middle)

        // Feet
        g.fillStyle(0x3a2010);
        g.fillRect(x - p*13, feetY - p*8, p*12, p*8);    // Left foot
        g.fillRect(x + p*2, feetY - p*8, p*12, p*8);     // Right foot

        // Body/torso (longer, same width as head)
        g.fillStyle(0x5a4030);
        g.fillRect(x - p*12, feetY - p*130, torsoWidth, p*62);  // Longer torso

        // Arms (connected to torso edges, bump out slightly)
        g.fillStyle(0x4a3020);
        g.fillRect(x - p*18, feetY - p*120, p*6, p*40);  // Left arm (connects to left edge of torso)
        g.fillRect(x + p*12, feetY - p*120, p*6, p*40);  // Right arm (connects to right edge of torso)

        // Hands
        g.fillStyle(0x3a2010);
        g.fillRect(x - p*19, feetY - p*80, p*7, p*8);    // Left hand
        g.fillRect(x + p*12, feetY - p*80, p*7, p*8);    // Right hand

        // Head (same width as torso)
        g.fillStyle(0x5a4030);
        g.fillRect(x - p*12, feetY - p*158, p*24, p*30);  // Head

        // Fur texture (subtle lighter patch on chest)
        g.fillStyle(0x6a5040);
        g.fillRect(x - p*12, feetY - p*120, p*24, p*8);

        // Gray fisherman's hat with wider brim, smaller/lower crown
        g.fillStyle(0x5a5a5a);  // Gray crown (smaller, lower)
        g.fillRect(x - p*11, feetY - p*167, p*22, p*10);  // Hat crown (smaller)
        g.fillStyle(0x4a4a4a);  // Darker gray brim (wider)
        g.fillRect(x - p*20, feetY - p*158, p*40, p*3);   // Brim (wider)

        // Hat band detail
        g.fillStyle(0x3a3a3a);
        g.fillRect(x - p*11, feetY - p*158, p*22, p*2);

        // Simple dot eyes (right eye moved left so he's looking left)
        g.fillStyle(0x2a1a0a);
        g.fillRect(x - p*8, feetY - p*148, p*3, p*3);    // Left eye dot
        g.fillRect(x + p*2, feetY - p*148, p*3, p*3);    // Right eye dot (moved from +5 to +2)

        // Simple line mouth (smaller)
        g.fillStyle(0x2a1a0a);
        g.fillRect(x - p*4, feetY - p*138, p*8, p*2);    // Mouth line (smaller, 8px instead of 12px)
    }

    function drawLadder(g, x, floorY, leanHeight) {
        const ladderTop = floorY - leanHeight;
        const rungSpacing = p * 18;
        const railWidth = p * 3;

        // Left rail
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*8, ladderTop, railWidth, leanHeight);

        // Right rail
        g.fillRect(x + p*5, ladderTop, railWidth, leanHeight);

        // Rungs
        for (let ry = ladderTop + p*12; ry < floorY - p*8; ry += rungSpacing) {
            g.fillStyle(COLORS.METAL_LIGHT);
            g.fillRect(x - p*8, ry, p*16, p*2);
        }

        // Highlights on rails
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - p*7, ladderTop + p*2, p, leanHeight - p*4);
        g.fillRect(x + p*6, ladderTop + p*2, p, leanHeight - p*4);
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

        // === AIRSTREAM (centerpiece - large but not overwhelming, ~1.25x Nate's height) ===
        const airstreamWidth = worldWidth * 0.55;  // ~704px - prominent but leaves room
        const airstreamHeight = p * 197;  // ~394px, about 1.25x Nate's height
        drawAirstream(g, LAYOUT.airstream.x, floorY, airstreamWidth, airstreamHeight);

        // === LARGE TREES (framing the scene, in front of Airstream, pulled forward for depth) ===
        drawTree(g, LAYOUT.tree_left.x, floorY, height);
        drawTree(g, LAYOUT.tree_right.x, floorY, height);

        // === STRING LIGHTS (in front of Airstream, raised high) ===
        drawStringLights(g, LAYOUT.tree_left.x, height * 0.20, 1040);

        // === YARD ITEMS (in front of Airstream) ===
        drawFlamingo(g, LAYOUT.flamingo.x, floorY);
        drawCooler(g, LAYOUT.cooler.x, floorY, 1.5);

        // === TABLE WITH RADIO (between door and grill) ===
        drawTableWithRadio(g, LAYOUT.radio.x, floorY);

        // === GRILL (under the Airstream window) ===
        drawGrill(g, LAYOUT.grill.x, floorY);

        // === EARL THE BIGFOOT (well to the right of the grill) ===
        drawEarl(g, LAYOUT.earl.x, floorY);

        // === LADDER (centered on right tree) ===
        drawLadder(g, LAYOUT.ladder.x, floorY, p*120);
    }

})();
