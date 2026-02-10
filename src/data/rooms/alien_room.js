// ============================================================================
// ALIEN'S ROOM - Harry the Alien's Bedroom
// ============================================================================
// A second floor bedroom where the alien (Harry) has been living since crash-
// landing. Feels like a teenager's den - messy, dark, dominated by the TV -
// but with subtle alien touches.
//
// Connects to: second_floor (via doorway, no door)
//
// Layout (left to right): Entrance/doorway, dresser with lava lamp,
// couch, coffee table, TV, mass extinction device
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.alien_room = {
        id: 'alien_room',
        name: "Harry's Room",

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
            ambient: 0x5a5565, // TV-lit room
            ambientMobile: 0x7a7585,
            sources: [
                // TV glow (dominant, blue-white flicker)
                { id: 'tv_glow', x: 1050, y: 0.55, radius: 380, color: 0x88aaff, intensity: 1.2 },
                { id: 'tv_flicker', x: 1050, y: 0.65, radius: 230, color: 0xaaccff, intensity: 0.8 },
                // Lava lamp (warm colored glow)
                { id: 'lava_lamp', x: 310, y: 0.50, radius: 180, color: 0xff6688, intensity: 0.7 },
                // Alien's subtle eerie glow (behind couch)
                { id: 'alien_glow', x: 533, y: 0.45, radius: 150, color: 0x88ff88, intensity: 0.25 }
            ]
        },

        audio: {
            // Main background music
            music: {
                key: 'alien_theme',
                volume: 0.25,
                fade: 0,  // Start immediately
                loop: true
            },
            // Additional audio layers (play simultaneously)
            layers: [
                {
                    key: 'tv_theme',
                    channel: 'ambient',
                    volume: 1.0,
                    fade: 0  // Start immediately
                }
            ],
            continueFrom: ['second_floor'],
            // Pause audio (instead of stopping) when going to these rooms
            // This allows resuming from the exact position when returning
            pauseIn: ['second_floor']
        },

        layers: [
            {
                name: 'background',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawBackground
            },
            {
                name: 'furniture',
                scrollFactor: 1.0,
                depth: 60,
                draw: drawFurniture
            }
        ],

        spawns: {
            default: { x: 150, y: 0.82 },
            from_second_floor: { x: 150, y: 0.82 },
            from_hallway: { x: 150, y: 0.82 }
        },

        exits: [],

        // Flags that trigger hotspot refresh when changed (for Step 3 test)
        relevantFlags: ['story.test_action_complete'],

        npcs: [
            {
                id: 'alien_harry',
                name: 'Harry',
                sprite: 'harry_placeholder',
                position: { x: 520, y: 0.740 },  // Feet hidden by extended couch seat
                heightRatio: 1.0,
                depth: 55,  // Above room layer (50), below furniture (60)
                interactX: 520,
                interactY: 0.85
            }
        ],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        // Dynamic hotspot function for conditional hotspots (Step 2 test)
        getHotspotData(height) {
            const hotspots = [];

            // TEST: Conditional hotspot - only appears if flag is not set
            if (!TSH.State.getFlag('story.test_action_complete')) {
                hotspots.push({
                    id: 'test_conditional',
                    x: 640, y: 0.50, w: 40, h: 0.10,
                    interactX: 640, interactY: 0.85,
                    name: 'Test Hotspot',
                    verbs: { action: 'Touch', look: 'Look at' },
                    responses: {
                        look: "A test hotspot that disappears when you use the candle on the lava lamp.",
                        action: "It's just a test!"
                    }
                });
            }

            // All static hotspots (unchanged)
            const staticHotspots = [
            // === ENTRANCE/DOORWAY ===
            {
                id: 'doorway_exit',
                x: 90, y: 0.485, w: 140, h: 0.47,
                interactX: 80, interactY: 0.82,
                name: 'Hallway',
                verbs: { action: 'Leave', look: 'Look at' },
                responses: {
                    look: "The doorway back to the second floor hallway. No door - just an opening. Privacy doesn't seem to be a priority here."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'second_floor',
                    spawnPoint: 'from_alien_room'
                }
            },

            // === DRESSER (25% larger, moved right and down) ===
            {
                id: 'dresser_alien',
                x: 329, y: 0.62, w: 138, h: 0.17,
                interactX: 300, interactY: 0.88,
                name: 'Dresser',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A medium-sized dresser. The drawers are stuffed with what looks like old newspapers, TV guides, and... is that tinfoil? Lots of tinfoil.",
                    action: "I pull open a drawer. More TV guides, organized by date going back YEARS. This is dedication."
                }
            },

            // === LAVA LAMP (on larger dresser) ===
            {
                id: 'lamp_lava',
                x: 328, y: 0.48, w: 24, h: 0.17,
                interactX: 320, interactY: 0.88,
                name: 'Lava Lamp',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A lava lamp with pinkish-purple blobs slowly rising and falling. The glow is hypnotic. Very... groovy? Is that the word?",
                    action: "Warm to the touch. The blobs inside seem to move faster when I'm near it. Probably just a coincidence. Probably."
                }
            },

            // === COUCH (profile view, 1.5x bigger, moved right) ===
            {
                id: 'couch_alien',
                x: 533, y: 0.56, w: 206, h: 0.33,
                interactX: 410, interactY: 0.85,
                name: 'Couch',
                verbs: { action: 'Sit', look: 'Examine' },
                responses: {
                    look: "A beat-up old couch, clearly the alien's throne. The cushions are molded to a very specific shape - one that's definitely not human. Surrounded by snack debris.",
                    action: "I'd have to get past Harry to sit there. And he's standing RIGHT behind it, staring at the TV. It's... unsettling."
                }
            },

            // === ALIEN NPC (Harry) - standing behind couch ===
            {
                id: 'alien_harry',
                x: 517, y: 0.4165, w: 74, h: 0.255,
                interactX: 520, interactY: 0.85,
                name: 'Alien',
                type: 'npc',
                verbs: { action: 'Talk to', look: 'Look at' },
                responses: {
                    look: "A tall gray alien with an oversized head and huge, dark eyes. He's standing behind the couch, fixated on the TV. His tiny mouth is set in a neutral line - impossible to read his expression.",
                    action: null // Opens conversation
                }
                // TODO: When alien is on roof, hotspot changes or disappears
            },

            // === COFFEE TABLE (between couch and TV) ===
            {
                id: 'table_coffee',
                x: 807, y: 0.685, w: 177, h: 0.072,
                interactX: 810, interactY: 0.85,
                name: 'Coffee Table',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A coffee table buried under clutter: a TV remote, half-eaten snacks, soda cans, and a well-worn TV Guide.",
                    action: "I search through the mess. Just snack wrappers and old magazines. Nothing useful."
                }
            },

            // === TV (smaller, more right) ===
            {
                id: 'tv_soap',
                x: 1062, y: 0.56, w: 164, h: 0.29,
                interactX: 960, interactY: 0.85,
                name: 'Television',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A chunky CRT television, currently displaying 'Days of Our Parallel Dimensions' - apparently Harry's favorite soap. The screen casts a blue-white glow over the entire room. Hector needs this for the experiment...",
                    action: "I reach for the TV and Harry LEAPS off the couch. 'WHAT ARE YOU DOING?! Miranda is about to find out that Rafael is actually her clone from dimension 7!' He's not letting me anywhere near that TV while he's in here."
                }
                // TODO: When alien is on roof, can take TV
            },

            // === VHS TAPES / DVDS (below TV stand) ===
            {
                id: 'tapes_vhs',
                x: 1063, y: 0.721, w: 177, h: 0.075,
                interactX: 1030, interactY: 0.85,
                name: 'Video Tapes',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A towering pile of VHS tapes and DVDs. All soap operas. 'General Hospital', 'The Young and the Restless', 'Bold and the Beautiful'... Harry has recorded EVERYTHING. There are tapes going back decades.",
                    action: "I flip through some cases. Each one is labeled with neat alien handwriting - episode numbers, air dates, plot summaries. Harry takes his soaps VERY seriously."
                }
            },

            // === MASS EXTINCTION DEVICE ===
            {
                id: 'device_extinction',
                x: 1180, y: 0.42, w: 80, h: 0.10,
                interactX: 1180, interactY: 0.82,
                name: 'Strange Device',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "What the... is that a MASS EXTINCTION DEVICE?! Just sitting on a shelf, gathering dust like an old trophy?! It's labeled 'PLANET STERILIZER MK-IV' with a little biohazard symbol. It's covered in dust and has a coffee ring on it. Harry used an EXTINCTION DEVICE as a COASTER.",
                    action: "I look at the control panel. Big red button labeled 'ACTIVATE'. Safety switch set to 'OFF'. Last calibrated date: 15 years ago. This thing could END ALL LIFE ON EARTH and it's sitting next to empty soda cans. I feel sick."
                }
            },

            // === WALL POSTERS (2.5x bigger, centered over dresser) ===
            {
                id: 'posters_wall',
                x: 329, y: 0.295, w: 176, h: 0.31,
                interactX: 325, interactY: 0.82,
                name: 'Wall Poster',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "A faded poster of what appears to be a human soap opera actor. 'RAFAEL MENDOZA - Dreamiest Eyes 1987'. Harry has drawn little hearts around his face. In green marker.",
                    action: "'To Harry, my biggest fan! - Rafael (printed signature)'. This is a mass-produced poster. Rafael didn't actually sign this. Should I tell Harry? ...No. I should not tell Harry."
                }
            },
            {
                id: 'poster_2',
                x: 838, y: 0.295, w: 176, h: 0.31,
                interactX: 830, interactY: 0.82,
                name: 'Movie Poster',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "A poster for 'INVASION FROM BEYOND' - a cheesy 1950s sci-fi movie. Harry has written notes all over it in alien script, with arrows pointing to various 'inaccuracies'.",
                    action: "I can't read alien, but based on the aggressive underlining and exclamation marks, Harry has STRONG opinions about this film's portrayal of extraterrestrial visitors."
                }
            },

            // === SNACK DEBRIS ===
            {
                id: 'snacks_floor',
                x: 543, y: 0.747, w: 167, h: 0.041,
                interactX: 510, interactY: 0.85,
                name: 'Snack Debris',
                verbs: { action: 'Clean up', look: 'Examine' },
                responses: {
                    look: "Empty chip bags, candy wrappers, crushed soda cans. The floor around the couch is a graveyard of processed snacks. There's also some kind of... purple residue I don't recognize.",
                    action: "I pick up a few wrappers. Whoever was here sure likes their snacks."
                }
            }
            ];

            // Add all static hotspots to the dynamic array
            hotspots.push(...staticHotspots);

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
            // TEST ACTION OBJECT (Step 1 implementation test)
            lamp_lava: {
                candle: {
                    dialogue: "I hold the candle up to the lava lamp. They glow in harmony for a moment. Very zen.",
                    giveItem: "spring",  // Test item pickup
                    setFlag: "story.test_action_complete"  // Test flag setting
                }
            },
            // TEST ACTION FUNCTION (Step 4 implementation test)
            dresser_alien: {
                spring: {
                    action: "test_sequence"  // Calls TSH.Actions.test_sequence
                }
            },
            tv_soap: {
                default: "I can't do anything with the TV while Harry is watching it. He'd probably vaporize me."
            },
            remote_control: {
                default: "Harry's grip on that remote is tighter than my grip on reality right now."
            },
            tvguide: {
                default: "That TV Guide is sacred to Harry. I'd have better luck stealing the crown jewels."
            },
            device_extinction: {
                crowbar: "I am NOT hitting the mass extinction device with a crowbar. That seems like a very bad idea.",
                default: "I don't want to mess with this thing. What if I accidentally activate it?"
            },
            alien_harry: {
                snacks: "Harry accepts the snacks without looking away from the TV. 'Thanks.' Wow, manners! Sort of.",
                default: "Harry ignores my attempt to use the {item}. The soap opera is clearly more important."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

        firstVisit: {
            delay: 800,
            dialogue: "Whoa. It's like a time capsule in here. A messy, snack-covered, alien-occupied time capsule."
        },

        features: {
            alienRoom: true,
            tvGlow: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Wall colors (darker, different from rest of house)
        WALL_DARK: 0x1a1825,
        WALL_MID: 0x2a2840,
        WALL_LIGHT: 0x3a3855,
        WALL_HIGHLIGHT: 0x4a4865,

        // No wainscoting - just wallpaper
        WALLPAPER_DARK: 0x2a2545,
        WALLPAPER_MID: 0x3a3560,
        WALLPAPER_PATTERN: 0x4a4575,

        // Floor (carpet, not hardwood)
        CARPET_DARK: 0x2a2535,
        CARPET_MID: 0x3a3545,
        CARPET_LIGHT: 0x4a4555,

        // Wood (furniture)
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,

        // Metal/Tech
        METAL_DARK: 0x3a3a3a,
        METAL_MID: 0x5a5a5a,
        METAL_LIGHT: 0x7a7a7a,

        // TV glow
        TV_GLOW_DARK: 0x3355aa,
        TV_GLOW_MID: 0x5577cc,
        TV_GLOW_LIGHT: 0x88aaff,

        // Lava lamp colors
        LAVA_DARK: 0x882255,
        LAVA_MID: 0xaa4477,
        LAVA_LIGHT: 0xdd6699,
        LAVA_GLOW: 0xff88aa,

        // Snack/clutter colors
        CHIP_BAG: 0x8a6030,
        SODA_CAN: 0xaa3333,
        WRAPPER: 0xccaa55,

        // Alien colors
        ALIEN_SKIN: 0x889988,
        ALIEN_SKIN_LIGHT: 0xaabbaa,
        ALIEN_EYES: 0x1a1a1a,
        ALIEN_ROBE: 0x5a4a6a,

        // Moonlight
        MOONLIGHT: 0xaabbdd
    };

    const p = 2; // Pixel unit for backgrounds

    function drawWallsNoCeiling(g, worldWidth, floorY) {
        // Wall base (no wainscoting - just wallpaper)
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        // Wallpaper pattern (subtle, repeating)
        const patternSize = p * 20;
        for (let py = p * 10; py < floorY - p * 10; py += patternSize) {
            for (let px = p * 10; px < worldWidth - p * 10; px += patternSize) {
                g.fillStyle(COLORS.WALLPAPER_MID);
                // Small diamond shapes
                g.fillRect(px + patternSize / 2 - p * 2, py, p * 4, p * 4);
                g.fillRect(px, py + patternSize / 2 - p * 2, p * 4, p * 4);
                // Tiny dots
                g.fillStyle(COLORS.WALLPAPER_PATTERN);
                g.fillRect(px + patternSize / 2, py + patternSize / 2, p * 2, p * 2);
            }
        }

        // Ceiling (simple, flat)
        g.fillStyle(COLORS.WALL_LIGHT);
        g.fillRect(0, 0, worldWidth, p * 8);
        g.fillStyle(COLORS.WALL_MID);
        g.fillRect(0, p * 6, worldWidth, p * 2);

        // Baseboard (simple)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, floorY - p * 8, worldWidth, p * 8);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, floorY - p * 6, worldWidth, p * 2);
    }

    function drawCarpetFloor(g, worldWidth, height, floorY) {
        // Carpet base
        g.fillStyle(COLORS.CARPET_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Carpet texture (subtle variation)
        for (let py = floorY; py < height; py += p * 3) {
            for (let px = 0; px < worldWidth; px += p * 5) {
                if ((px + py) % (p * 15) < p * 3) {
                    g.fillStyle(COLORS.CARPET_MID);
                    g.fillRect(px, py, p * 2, p);
                }
            }
        }
    }

    function drawDoorway(g, x, y, floorY) {
        // Open doorway (no door) - just the frame
        const doorWidth = p * 70;
        const doorHeight = floorY - y;
        const frameWidth = p * 6;

        // Door frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, y - p * 5, frameWidth, doorHeight + p * 5);
        g.fillRect(x + doorWidth + frameWidth, y - p * 5, frameWidth, doorHeight + p * 5);
        g.fillRect(x, y - p * 5, doorWidth + frameWidth * 2, p * 6);

        // Frame highlights
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p, y - p * 4, p * 2, doorHeight + p * 3);
        g.fillRect(x + doorWidth + frameWidth + p, y - p * 4, p * 2, doorHeight + p * 3);
        g.fillRect(x + p, y - p * 4, doorWidth + frameWidth * 2 - p * 2, p * 2);

        // Hallway visible through door (darker)
        g.fillStyle(0x1a1520);
        g.fillRect(x + frameWidth, y, doorWidth, doorHeight);
    }

    function drawDresser(g, x, floorY) {
        // 25% larger dresser
        const dresserWidth = p * 69;  // Was p * 55
        const dresserHeight = p * 62; // Was p * 50
        const dresserY = floorY - dresserHeight;

        // Side depth
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 10, dresserY + p * 5, p * 10, dresserHeight - p * 5);

        // Main body
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x, dresserY, dresserWidth, dresserHeight);

        // Drawers (3 drawers)
        const drawerHeight = (dresserHeight - p * 12) / 3;
        for (let i = 0; i < 3; i++) {
            const drawerY = dresserY + p * 5 + i * (drawerHeight + p);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(x + p * 5, drawerY, dresserWidth - p * 10, drawerHeight);
            // Drawer handle
            g.fillStyle(COLORS.METAL_MID);
            g.fillRect(x + dresserWidth / 2 - p * 5, drawerY + drawerHeight / 2 - p, p * 10, p * 3);
        }

        // Top surface
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 3, dresserY - p * 4, dresserWidth + p * 6, p * 5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p * 2, dresserY - p * 3, dresserWidth + p * 4, p * 3);
    }

    function drawLavaLamp(g, x, dresserY) {
        // Lava lamp 1.5x bigger
        // Base
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 12, dresserY - p * 9, p * 24, p * 12);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p * 8, dresserY - p * 8, p * 16, p * 8);

        // Glass body
        g.fillStyle(COLORS.LAVA_DARK);
        g.fillRect(x - p * 8, dresserY - p * 57, p * 16, p * 50);
        g.fillStyle(COLORS.LAVA_MID);
        g.fillRect(x - p * 6, dresserY - p * 53, p * 12, p * 42);

        // Lava blobs (static representation)
        g.fillStyle(COLORS.LAVA_LIGHT);
        g.fillRect(x - p * 5, dresserY - p * 48, p * 9, p * 12);
        g.fillRect(x - p * 3, dresserY - p * 30, p * 6, p * 10);
        g.fillStyle(COLORS.LAVA_GLOW);
        g.fillRect(x - p * 3, dresserY - p * 20, p * 8, p * 8);

        // Top cap
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 9, dresserY - p * 63, p * 18, p * 8);
    }

    function drawWindow(g, x, y, w, h) {
        // Window frame (25% larger)
        const scale = 1.25;
        const sw = w * scale;
        const sh = h * scale;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 5, y - p * 5, sw + p * 10, sh + p * 10);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p * 3, y - p * 3, sw + p * 6, sh + p * 6);

        // Glass (night sky)
        g.fillStyle(0x0a0a18);
        g.fillRect(x, y, sw, sh);

        // Window panes (cross)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + sw / 2 - p, y, p * 2, sh);
        g.fillRect(x, y + sh / 2 - p, sw, p * 2);

        // Moon visible through window
        g.fillStyle(0xd8d8e8);
        g.fillRect(x + sw - p * 15, y + p * 10, p * 8, p * 8);
        g.fillStyle(0xe8e8f8);
        g.fillRect(x + sw - p * 14, y + p * 11, p * 6, p * 6);

        // Stars
        g.fillStyle(0xffffff);
        g.fillRect(x + p * 8, y + p * 6, p, p);
        g.fillRect(x + p * 20, y + p * 15, p, p);
        g.fillRect(x + p * 10, y + sh - p * 12, p, p);

        // Dusty curtains (simple)
        g.fillStyle(0x4a4a5a);
        g.fillRect(x - p * 8, y - p * 8, p * 12, sh + p * 16);
        g.fillRect(x + sw - p * 4, y - p * 8, p * 12, sh + p * 16);
        g.fillStyle(0x5a5a6a);
        g.fillRect(x - p * 7, y - p * 7, p * 4, sh + p * 14);
        g.fillRect(x + sw - p * 3, y - p * 7, p * 4, sh + p * 14);
    }

    function drawCouch(g, x, floorY) {
        // Profile view couch - 1.5x bigger, no arm on right side
        // Back on left (door side), seat comes up to about half back height
        const backWidth = p * 28;       // Wider back (was p*16, now 1.5x and a bit wider)
        const backHeight = p * 120;     // 1.5x taller (was p*80)
        const seatWidth = p * 75;       // 1.5x wider (was p*50)
        const seatHeight = p * 60;      // Seat comes up to ~half back height
        const legSize = p * 8;          // 1.5x legs

        const couchTop = floorY - backHeight;

        // Back leg (behind, on left)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p * 4, floorY - legSize * 2, legSize, legSize * 2);
        // Front leg (on right, no arm)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + backWidth + seatWidth - legSize - p * 4, floorY - legSize * 2, legSize, legSize * 2);

        // Back of couch (left side, tall)
        g.fillStyle(0x4a3a4a);
        g.fillRect(x, couchTop, backWidth, backHeight - legSize * 2);
        g.fillStyle(0x5a4a5a);
        g.fillRect(x + p * 3, couchTop + p * 6, backWidth - p * 6, backHeight - legSize * 2 - p * 12);
        // Back highlight
        g.fillStyle(0x6a5a6a);
        g.fillRect(x + p * 3, couchTop + p * 6, p * 3, backHeight - legSize * 2 - p * 18);

        // Seat cushion - higher (comes up to about half of back)
        const seatTop = floorY - seatHeight - legSize * 2;
        g.fillStyle(0x4a3a4a);
        g.fillRect(x + backWidth - p * 3, seatTop, seatWidth + p * 3, seatHeight);
        g.fillStyle(0x5a4a5a);
        g.fillRect(x + backWidth, seatTop + p * 4, seatWidth - p * 6, seatHeight - p * 8);
        // Cushion highlight
        g.fillStyle(0x6a5a6a);
        g.fillRect(x + backWidth + p * 6, seatTop + p * 6, seatWidth - p * 18, p * 3);

        // No arm on right side - just a clean edge

        // Wear marks on seat
        g.fillStyle(0x3a2a3a);
        g.fillRect(x + backWidth + p * 12, seatTop + p * 10, p * 30, p * 8);
    }

    // PROCEDURAL ALIEN DRAWING - REPLACED WITH SPRITE (harry_placeholder.png)
    // Kept for reference
    /*
    function drawAlien(g, x, floorY) {
        // Harry the Alien standing behind the couch, facing forward/toward TV
        // About as tall as Nate (315px for MEDIUM camera)
        // Extra large head compared to body

        const totalHeight = p * 158;  // ~316px, about Nate's height
        const headHeight = p * 70;    // Extra large head
        const headWidth = p * 55;
        const bodyHeight = p * 70;
        const bodyWidth = p * 35;
        const neckHeight = p * 12;
        const shoulderWidth = p * 50;

        // Alien colors - grays and dark grays
        const GRAY_DARK = 0x3a3a3a;
        const GRAY_MID = 0x5a5a5a;
        const GRAY_LIGHT = 0x7a7a7a;
        const GRAY_HIGHLIGHT = 0x8a8a8a;
        const EYE_BLACK = 0x0a0a0a;

        const alienTop = floorY - totalHeight;
        const headTop = alienTop;
        const neckTop = headTop + headHeight;
        const bodyTop = neckTop + neckHeight;

        // === BODY (behind couch, mostly hidden but shoulders visible) ===
        // Shoulders
        g.fillStyle(GRAY_DARK);
        g.fillRect(x - shoulderWidth / 2, bodyTop, shoulderWidth, p * 20);
        g.fillStyle(GRAY_MID);
        g.fillRect(x - shoulderWidth / 2 + p * 3, bodyTop + p * 3, shoulderWidth - p * 6, p * 14);

        // Upper body (visible above couch back)
        g.fillStyle(GRAY_DARK);
        g.fillRect(x - bodyWidth / 2, bodyTop + p * 15, bodyWidth, p * 25);
        g.fillStyle(GRAY_MID);
        g.fillRect(x - bodyWidth / 2 + p * 4, bodyTop + p * 18, bodyWidth - p * 8, p * 18);

        // === NECK (thin) ===
        g.fillStyle(GRAY_MID);
        g.fillRect(x - p * 8, neckTop, p * 16, neckHeight);
        g.fillStyle(GRAY_LIGHT);
        g.fillRect(x - p * 6, neckTop + p * 2, p * 12, neckHeight - p * 4);

        // === HEAD (extra large, oval-ish) ===
        // Main head shape - wider at top, narrower at chin
        g.fillStyle(GRAY_MID);
        g.fillRect(x - headWidth / 2, headTop, headWidth, headHeight);

        // Head shading - lighter center
        g.fillStyle(GRAY_LIGHT);
        g.fillRect(x - headWidth / 2 + p * 6, headTop + p * 8, headWidth - p * 12, headHeight - p * 16);

        // Head highlight
        g.fillStyle(GRAY_HIGHLIGHT);
        g.fillRect(x - headWidth / 2 + p * 10, headTop + p * 12, headWidth - p * 24, p * 15);

        // Forehead dome (rounder top)
        g.fillStyle(GRAY_MID);
        g.fillRect(x - headWidth / 2 + p * 8, headTop - p * 5, headWidth - p * 16, p * 8);
        g.fillStyle(GRAY_LIGHT);
        g.fillRect(x - headWidth / 2 + p * 12, headTop - p * 3, headWidth - p * 24, p * 5);

        // Chin taper
        g.fillStyle(GRAY_MID);
        g.fillRect(x - p * 18, headTop + headHeight - p * 10, p * 36, p * 10);
        g.fillRect(x - p * 12, headTop + headHeight - p * 5, p * 24, p * 8);

        // === EYES (large, black, almond-shaped) ===
        const eyeWidth = p * 18;
        const eyeHeight = p * 22;
        const eyeY = headTop + p * 22;
        const eyeSpacing = p * 8;

        // Left eye
        g.fillStyle(EYE_BLACK);
        g.fillRect(x - eyeSpacing - eyeWidth, eyeY, eyeWidth, eyeHeight);
        // Left eye inner (slightly less black for depth)
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - eyeSpacing - eyeWidth + p * 3, eyeY + p * 4, eyeWidth - p * 6, eyeHeight - p * 8);
        // Left eye shine (TV reflection)
        g.fillStyle(COLORS.TV_GLOW_LIGHT);
        g.fillRect(x - eyeSpacing - eyeWidth + p * 4, eyeY + p * 5, p * 4, p * 4);

        // Right eye
        g.fillStyle(EYE_BLACK);
        g.fillRect(x + eyeSpacing, eyeY, eyeWidth, eyeHeight);
        // Right eye inner
        g.fillStyle(0x1a1a1a);
        g.fillRect(x + eyeSpacing + p * 3, eyeY + p * 4, eyeWidth - p * 6, eyeHeight - p * 8);
        // Right eye shine
        g.fillStyle(COLORS.TV_GLOW_LIGHT);
        g.fillRect(x + eyeSpacing + p * 4, eyeY + p * 5, p * 4, p * 4);

        // === MOUTH (tiny thin line, just a couple pixels) ===
        g.fillStyle(0x2a2a2a);
        g.fillRect(x - p * 3, headTop + headHeight - p * 18, p * 6, p);
    }
    */

    function drawCoffeeTable(g, x, floorY) {
        // Coffee table (25% narrower than before)
        const tableWidth = p * 90;   // Was p * 120, now 25% narrower
        const tableHeight = p * 36;
        const tableY = floorY - tableHeight;

        // Table top
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableY, tableWidth, p * 8);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p * 4, tableY + p * 2, tableWidth - p * 8, p * 4);

        // Legs
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p * 6, tableY + p * 8, p * 8, tableHeight - p * 8);
        g.fillRect(x + tableWidth - p * 14, tableY + p * 8, p * 8, tableHeight - p * 8);

        // Clutter on table
        // Remote control
        g.fillStyle(0x2a2a2a);
        g.fillRect(x + p * 12, tableY - p * 6, p * 20, p * 8);
        g.fillStyle(0x4a4a4a);
        g.fillRect(x + p * 14, tableY - p * 4, p * 4, p * 4);
        g.fillStyle(0xff4444);
        g.fillRect(x + p * 22, tableY - p * 4, p * 4, p * 2);

        // TV Guide
        g.fillStyle(0xddddcc);
        g.fillRect(x + p * 38, tableY - p * 8, p * 24, p * 10);
        g.fillStyle(0x2a2a4a);
        g.fillRect(x + p * 40, tableY - p * 6, p * 20, p * 6);

        // Snack debris
        g.fillStyle(COLORS.CHIP_BAG);
        g.fillRect(x + tableWidth - p * 24, tableY - p * 6, p * 12, p * 8);
        g.fillStyle(COLORS.SODA_CAN);
        g.fillRect(x + tableWidth - p * 14, tableY - p * 12, p * 8, p * 14);
    }

    function drawTV(g, x, floorY) {
        // CRT TV on a stand - 1.5x size (25% smaller than 2x)
        const tvWidth = p * 82;
        const tvHeight = p * 68;
        const standHeight = p * 38;
        const tvY = floorY - tvHeight - standHeight;

        // TV Stand
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 8, floorY - standHeight, tvWidth + p * 16, standHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p * 5, floorY - standHeight + p * 3, tvWidth + p * 10, standHeight - p * 6);

        // TV body (chunky CRT)
        g.fillStyle(0x2a2a2a);
        g.fillRect(x, tvY, tvWidth, tvHeight);
        g.fillStyle(0x3a3a3a);
        g.fillRect(x + p * 3, tvY + p * 3, tvWidth - p * 6, tvHeight - p * 6);

        // Screen (side view - facing left)
        const screenInset = p * 8;
        g.fillStyle(COLORS.TV_GLOW_DARK);
        g.fillRect(x + screenInset, tvY + screenInset, tvWidth - screenInset * 2 - p * 15, tvHeight - screenInset * 2);
        g.fillStyle(COLORS.TV_GLOW_MID);
        g.fillRect(x + screenInset + p * 3, tvY + screenInset + p * 3, tvWidth - screenInset * 2 - p * 21, tvHeight - screenInset * 2 - p * 6);

        // Soap opera on screen (abstract shapes representing people)
        g.fillStyle(0x88aa88);
        g.fillRect(x + p * 15, tvY + p * 18, p * 12, p * 22);
        g.fillStyle(0xaa8888);
        g.fillRect(x + p * 33, tvY + p * 18, p * 12, p * 22);
        // Faces
        g.fillStyle(0xccaa88);
        g.fillRect(x + p * 16, tvY + p * 20, p * 9, p * 9);
        g.fillRect(x + p * 34, tvY + p * 20, p * 9, p * 9);

        // Screen glare
        g.fillStyle(COLORS.TV_GLOW_LIGHT);
        g.globalAlpha = 0.3;
        g.fillRect(x + screenInset + p * 2, tvY + screenInset + p * 2, p * 12, p * 4);
        g.globalAlpha = 1.0;

        // Control panel (right side of TV)
        g.fillStyle(0x1a1a1a);
        g.fillRect(x + tvWidth - p * 15, tvY + p * 12, p * 12, tvHeight - p * 24);
        // Buttons
        g.fillStyle(0x4a4a4a);
        g.fillRect(x + tvWidth - p * 12, tvY + p * 18, p * 6, p * 6);
        g.fillRect(x + tvWidth - p * 12, tvY + p * 27, p * 6, p * 6);

        // Antenna
        g.fillStyle(0x5a5a5a);
        g.fillRect(x + p * 22, tvY - p * 22, p * 3, p * 24);
        g.fillRect(x + p * 38, tvY - p * 18, p * 3, p * 20);
        // Antenna tips
        g.fillStyle(0x7a7a7a);
        g.fillRect(x + p * 21, tvY - p * 27, p * 6, p * 6);
        g.fillRect(x + p * 36, tvY - p * 23, p * 6, p * 6);
    }

    function drawExtinctionDevice(g, x, y) {
        // Mass extinction device on a shelf - looks like alien tech
        const deviceWidth = p * 40;
        const deviceHeight = p * 35;

        // Shelf
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 10, y, deviceWidth + p * 20, p * 5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p * 8, y + p, deviceWidth + p * 16, p * 3);

        // Device base
        g.fillStyle(0x3a3a4a);
        g.fillRect(x, y - deviceHeight, deviceWidth, deviceHeight);
        g.fillStyle(0x4a4a5a);
        g.fillRect(x + p * 4, y - deviceHeight + p * 4, deviceWidth - p * 8, deviceHeight - p * 8);

        // Ominous center piece
        g.fillStyle(0x2a2a3a);
        g.fillRect(x + deviceWidth / 2 - p * 8, y - deviceHeight + p * 10, p * 16, p * 15);
        g.fillStyle(0x885533);
        g.fillRect(x + deviceWidth / 2 - p * 5, y - deviceHeight + p * 13, p * 10, p * 9);

        // Big red button
        g.fillStyle(0x881111);
        g.fillRect(x + deviceWidth / 2 - p * 4, y - deviceHeight + p * 15, p * 8, p * 5);
        g.fillStyle(0xaa2222);
        g.fillRect(x + deviceWidth / 2 - p * 3, y - deviceHeight + p * 16, p * 6, p * 3);

        // Warning labels
        g.fillStyle(0xaaaa22);
        g.fillRect(x + p * 2, y - deviceHeight + p * 2, p * 8, p * 4);
        g.fillRect(x + deviceWidth - p * 10, y - deviceHeight + p * 2, p * 8, p * 4);

        // Biohazard symbol (simplified)
        g.fillStyle(0x1a1a1a);
        g.fillRect(x + p * 3, y - deviceHeight + p * 3, p * 2, p * 2);
        g.fillRect(x + p * 5, y - deviceHeight + p * 3, p * 2, p * 2);

        // Dust accumulation
        g.fillStyle(0x6a6a6a);
        g.globalAlpha = 0.4;
        g.fillRect(x + p * 2, y - p * 3, deviceWidth - p * 4, p * 3);
        g.globalAlpha = 1.0;

        // Coffee ring stain
        g.fillStyle(0x5a4a3a);
        g.globalAlpha = 0.5;
        g.fillRect(x + deviceWidth - p * 15, y - p * 8, p * 10, p * 6);
        g.globalAlpha = 1.0;
    }

    function drawVHSTapes(g, x, floorY) {
        // Pile of VHS tapes - black with thin white label strips
        // These go below the TV stand

        for (let i = 0; i < 6; i++) {
            const tapeX = x + (i % 3) * p * 22 + (i % 2) * p * 6;
            const tapeY = floorY - p * 16 - Math.floor(i / 3) * p * 14;
            // Black tape body
            g.fillStyle(0x1a1a1a);
            g.fillRect(tapeX, tapeY, p * 18, p * 10);
            // Thin white label strip
            g.fillStyle(0xeeeeee);
            g.fillRect(tapeX + p * 2, tapeY + p * 3, p * 14, p * 2);
        }

        // Some DVDs scattered
        g.fillStyle(0x4a4a5a);
        g.fillRect(x + p * 68, floorY - p * 8, p * 20, p * 3);
        g.fillRect(x + p * 72, floorY - p * 13, p * 20, p * 3);
    }

    function drawPoster(g, x, y, variant) {
        // 2.5x bigger posters
        const posterWidth = p * 88;  // Was p * 35
        const posterHeight = p * 112; // Was p * 45

        // Poster
        if (variant === 1) {
            // Rafael Mendoza poster
            g.fillStyle(0xaa8866);
            g.fillRect(x, y, posterWidth, posterHeight);
            // Face
            g.fillStyle(0xccaa88);
            g.fillRect(x + p * 25, y + p * 20, p * 38, p * 45);
            // Hair
            g.fillStyle(0x2a2a2a);
            g.fillRect(x + p * 25, y + p * 12, p * 38, p * 15);
            // Hearts drawn by Harry
            g.fillStyle(0x88ff88);
            g.fillRect(x + p * 8, y + p * 12, p * 10, p * 10);
            g.fillRect(x + posterWidth - p * 20, y + p * 20, p * 10, p * 10);
            g.fillRect(x + p * 12, y + posterHeight - p * 25, p * 10, p * 10);
        } else {
            // Sci-fi movie poster
            g.fillStyle(0x2a3a5a);
            g.fillRect(x, y, posterWidth, posterHeight);
            // UFO
            g.fillStyle(0x7a7a8a);
            g.fillRect(x + p * 20, y + p * 25, p * 45, p * 20);
            g.fillStyle(0x5a5a6a);
            g.fillRect(x + p * 30, y + p * 15, p * 25, p * 12);
            // Alien notes (angry scribbles)
            g.fillStyle(0xff4444);
            g.fillRect(x + p * 5, y + p * 62, p * 30, p * 5);
            g.fillRect(x + p * 10, y + p * 75, p * 25, p * 5);
            g.fillRect(x + posterWidth - p * 38, y + p * 70, p * 30, p * 5);
        }

        // Tape holding poster
        g.fillStyle(0xcccc99);
        g.globalAlpha = 0.7;
        g.fillRect(x - p * 2, y - p * 2, p * 15, p * 8);
        g.fillRect(x + posterWidth - p * 12, y - p * 2, p * 15, p * 8);
        g.globalAlpha = 1.0;
    }

    function drawGlowStars(g, worldWidth) {
        // Glow-in-dark stars on ceiling (constellation pattern)
        const starPositions = [
            { x: 500, y: 15 }, { x: 520, y: 25 }, { x: 540, y: 20 },
            { x: 560, y: 35 }, { x: 580, y: 28 }, { x: 600, y: 22 },
            { x: 620, y: 30 }, { x: 640, y: 18 },
            { x: 700, y: 40 }, { x: 750, y: 35 }, { x: 800, y: 25 }
        ];

        g.fillStyle(0xaaffaa);
        starPositions.forEach(star => {
            g.fillRect(star.x, star.y, p * 2, p * 2);
        });

        // Special star (home?)
        g.fillStyle(0xffff88);
        g.fillRect(640, 18, p * 3, p * 3);
    }

    function drawSnackDebris(g, x, floorY) {
        // Scattered snack debris on floor around couch
        // Chip bags
        g.fillStyle(COLORS.CHIP_BAG);
        g.fillRect(x, floorY - p * 5, p * 14, p * 8);
        g.fillRect(x + p * 50, floorY - p * 4, p * 12, p * 6);

        // Soda cans
        g.fillStyle(COLORS.SODA_CAN);
        g.fillRect(x + p * 20, floorY - p * 6, p * 6, p * 9);
        g.fillRect(x + p * 70, floorY - p * 5, p * 6, p * 9);

        // Wrappers
        g.fillStyle(COLORS.WRAPPER);
        g.fillRect(x + p * 35, floorY - p * 3, p * 10, p * 4);

        // Purple residue (alien?)
        g.fillStyle(0x6a4a7a);
        g.globalAlpha = 0.5;
        g.fillRect(x + p * 45, floorY - p, p * 18, p * 2);
        g.globalAlpha = 1.0;
    }

    // =========================================================================
    // ROOM DRAWING FUNCTIONS - SPLIT INTO LAYERS
    // =========================================================================
    // Background layer (depth 50): walls, floor, architectural elements
    // Furniture layer (depth 60): all furniture and props
    // Harry sprite renders at depth 55 (between the two layers)

    function drawBackground(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera

        // === WALLS AND FLOOR ===
        drawWallsNoCeiling(g, worldWidth, floorY);
        drawCarpetFloor(g, worldWidth, height, floorY);

        // === GLOW STARS ON CEILING ===
        drawGlowStars(g, worldWidth);

        // === DOORWAY (left side) ===
        drawDoorway(g, 20, 180, floorY);

        // === POSTERS (2.5x bigger, positioned correctly) ===
        drawPoster(g, 241, 85, 1);   // Rafael poster - centered over dresser
        drawPoster(g, 750, 85, 2);   // Sci-fi movie poster
    }

    function drawFurniture(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera

        // === DRESSER WITH LAVA LAMP (15% below wall line) ===
        const dresserX = 260;
        const dresserDepth = p * 10;  // 15% below wall
        drawDresser(g, dresserX, floorY + dresserDepth);
        drawLavaLamp(g, dresserX + p * 34, floorY + dresserDepth - p * 62);

        // === ALIEN (now using sprite - see npcs array) ===
        const couchDepth = p * 16;  // 20% below wall
        const couchX = 430;  // Moved right to not touch dresser
        // Couch center: couchX + (backWidth + seatWidth)/2 = 430 + (56 + 150)/2 = 430 + 103 = 533
        // Harry sprite renders at depth 55 (between background and furniture)

        // === COUCH (profile view, 20% below wall, moved right) ===
        drawCouch(g, couchX, floorY + couchDepth);

        // === SNACK DEBRIS ===
        drawSnackDebris(g, couchX + p * 20, floorY + couchDepth);

        // === COFFEE TABLE (between couch and TV) ===
        const tableDepth = p * 25;
        // Couch right edge: 430 + backWidth(28*2) + seatWidth(75*2) = 430 + 56 + 150 = 636
        // TV left edge: 980
        // Center table between them: (636 + 980) / 2 = 808, minus half table width (90) = 718
        drawCoffeeTable(g, 720, floorY + tableDepth);

        // === TV (25% smaller, more right, 25% below wall) ===
        const tvDepth = p * 20;  // 25% below wall
        drawTV(g, 980, floorY + tvDepth);

        // === VHS TAPES (below TV stand) ===
        drawVHSTapes(g, 980, floorY + tvDepth);

        // === MASS EXTINCTION DEVICE ===
        drawExtinctionDevice(g, 1140, height * 0.45);
    }

})();
