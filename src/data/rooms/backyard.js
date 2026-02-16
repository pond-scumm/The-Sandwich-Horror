// ============================================================================
// BACKYARD - Behind Hector's House
// ============================================================================
// Wide exterior nighttime scene. Key location for the clock puzzle chain —
// the Temporal Synchronizer is mounted HIGH on the exterior wall, out of reach.
// Connects to: interior (left edge), basement (bulkhead), earls_yard (fence), shed (right)
//
// Layout: House exterior fills left side vertically, bulkhead at end of house,
// fence spans full width with string lights, shed perpendicular on far right.
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // SHARED LAYOUT (single source of truth for all positions)
    // =========================================================================
    // Hotspot x,y is the center of the clickable area.
    // Hotspot y should match the visual center of the drawn object.

    const LAYOUT = {
        // House elements (positioned relative to house structure)
        back_door:   { x: 120, y: 0.51, w: 160, h: 0.42 },     // Door spans 0.30 to 0.72
        window:      { x: 430, y: 0.370, w: 123, h: 0.139 },   // Visual center of window
        clock:       { x: 340, y: 0.06, w: 80, h: 0.12 },      // High on wall near roof
        bulkhead:    { x: 446, y: 0.65, w: 220, h: 0.16 },     // Flush with right side of house
        ladder:      { x: 270, y: 0.575, w: 40, h: 0.30 },     // Deployed ladder below clock

        // Yard items (hotspot y = visual center of each object)
        clothesline: { x: 770, y: 0.55, w: 180, h: 0.34 },     // Center of coat/line area
        doghouse:    { x: 1000, y: 0.64, w: 160, h: 0.16 },    // Center of doghouse
        garden:      { x: 1100, y: 0.69, w: 400, h: 0.06 },    // Low plants
        gnome:       { x: 1360, y: 0.65, w: 100, h: 0.14 },    // Center of gnome
        telescope:   { x: 1560, y: 0.58, w: 120, h: 0.28 },    // Center of telescope
        trash:       { x: 1760, y: 0.64, w: 180, h: 0.16 },    // Center of trash cans

        // Fence elements
        string_lights: { x: 1200, y: 0.36, w: 800, h: 0.06 },  // Above fence top
        fence_gate:  { x: 2000, y: 0.64, w: 180, h: 0.32 },    // Covers full gate

        // Far elements
        shed:        { x: 2450, y: 0.50, w: 120, h: 0.28 },
        moon:        { x: 2100, y: 0.08, w: 80, h: 0.10 }
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.backyard = {
        id: 'backyard',
        name: "Hector's Backyard",

        worldWidth: 2560,
        screenWidth: 1280,
        cameraPreset: 'MEDIUM',

        walkableArea: {
            // MEDIUM camera preset: walkable band 0.72-0.92
            polygon: [
                { x: 0, y: 0.72 },
                { x: 200, y: 0.72 },
                { x: 400, y: 0.73 },
                { x: 700, y: 0.72 },
                { x: 1000, y: 0.73 },
                { x: 1300, y: 0.72 },
                { x: 1600, y: 0.73 },
                { x: 1900, y: 0.72 },
                { x: 2200, y: 0.73 },
                { x: 2560, y: 0.72 },
                { x: 2560, y: 0.92 },
                { x: 0, y: 0.92 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0x4a5068,
            ambientMobile: 0x6a7088,
            sources: [
                // Moonlight from above (positioned far right, not blocked by house)
                { id: 'moon_main', x: 2100, y: 0.10, radius: 500, color: 0xaabbdd, intensity: 0.8 },
                { id: 'moon_secondary', x: 2200, y: 0.15, radius: 450, color: 0x99aacc, intensity: 0.6 },
                // String lights glow along fence
                { id: 'string_1', x: 400, y: 0.55, radius: 150, color: 0xff6666, intensity: 0.4 },
                { id: 'string_2', x: 700, y: 0.54, radius: 150, color: 0x66ff66, intensity: 0.4 },
                { id: 'string_3', x: 1000, y: 0.55, radius: 150, color: 0x6666ff, intensity: 0.4 },
                { id: 'string_4', x: 1300, y: 0.54, radius: 150, color: 0xffff66, intensity: 0.4 },
                { id: 'string_5', x: 1600, y: 0.55, radius: 150, color: 0xff66ff, intensity: 0.4 },
                { id: 'string_6', x: 1900, y: 0.54, radius: 150, color: 0x66ffff, intensity: 0.4 },
                { id: 'string_7', x: 2200, y: 0.55, radius: 150, color: 0xffaa66, intensity: 0.4 },
                // Warm tiki glow from Earl's yard (behind fence)
                { id: 'tiki_glow_1', x: 800, y: 0.60, radius: 200, color: 0xffaa66, intensity: 0.5 },
                { id: 'tiki_glow_2', x: 1400, y: 0.60, radius: 200, color: 0xff9955, intensity: 0.5 },
                { id: 'tiki_glow_3', x: 2000, y: 0.60, radius: 200, color: 0xffaa66, intensity: 0.5 },
                // Window glow from house
                { id: 'window_glow', x: 300, y: 0.40, radius: 120, color: 0xffe0a0, intensity: 0.4 },
                // Back door light
                { id: 'door_light', x: 200, y: 0.65, radius: 100, color: 0xffe0a0, intensity: 0.3 }
            ]
        },

        audio: {
            music: {
                key: 'interior_theme',
                volume: 0.6,
                fade: 1000
            },
            layers: [
                {
                    key: 'night_ambience',
                    channel: 'ambient',
                    volume: 0.3,
                    fade: 500
                }
            ],
            continueFrom: ['interior', 'basement', 'earls_yard']
        },

        layers: [
            {
                name: 'background',
                scrollFactor: 1.0,
                depth: 40,
                draw: drawBackyardBackground
            },
            {
                name: 'foreground',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawBackyardForeground
            }
        ],

        spawns: {
            default: { x: 200, y: 0.82 },
            from_interior: { x: 200, y: 0.82 },
            from_basement: { x: 595, y: 0.750 },
            from_earls_yard: { x: 1997, y: 0.796, direction: 'left' },
            from_shed: { x: 2300, y: 0.82 }
        },

        exits: [],

        npcs: [
            {
                id: 'earl_at_fence',
                name: 'Earl',
                sprite: 'earl_idle',
                position: { x: LAYOUT.fence_gate.x, y: 0.85 },  // Just eyes peeking above fence
                heightRatio: 1.15,
                depth: 45,  // Between background (40) and foreground/fence (50)
                hidden: true,  // Controlled by conversation system
                interactX: LAYOUT.fence_gate.x,
                interactY: 0.82
            }
        ],

        // =====================================================================
        // HOTSPOTS (State-Driven)
        // =====================================================================

        getHotspotData(height) {
            const hotspots = [
            // === HOUSE EXTERIOR (left side - fills full height) ===
            {
                id: 'window_house',
                ...LAYOUT.window,
                interactX: LAYOUT.window.x, interactY: 0.82,
                name: 'Window',
                verbs: { action: 'Peek through', look: 'Examine' },
                responses: {
                    look: "A window into the house. Warm light spills out. I can see the living room from here.",
                    action: "Huh, it's messier than I thought. And is that... a floating head? Oh right, that's Hector."
                }
            },
            {
                id: 'back_door',
                ...LAYOUT.back_door,
                interactX: LAYOUT.back_door.x, interactY: 0.82,
                name: 'Back Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "A sturdy wooden door leading back into the house. Two steps lead up to it, and a warm light glows above the entrance.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'interior',
                    spawnPoint: 'from_backyard'
                }
            },

            // === BULKHEAD (bottom right corner of house) ===
            {
                id: 'bulkhead_basement',
                ...LAYOUT.bulkhead,
                interactX: LAYOUT.bulkhead.x, interactY: 0.82,
                name: 'Basement Bulkhead',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Large metal bulkhead doors leading down to the basement. They look heavy but not locked.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'basement',
                    spawnPoint: 'from_backyard'
                }
            },

            // === YARD ITEMS (mid-floor and foreground depth zones) ===
            {
                id: 'clothesline',
                ...LAYOUT.clothesline,
                interactX: LAYOUT.clothesline.x, interactY: 0.82,
                name: 'Clothesline',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "An old clothesline. There's a lab coat hanging on it, flapping in the breeze. Been here a while.",
                    action: "This coat is soaking wet. "
                }
                // TODO: May be a way to get a lab coat for the disguise puzzle
            },
            {
                id: 'garden_wild',
                ...LAYOUT.garden,
                interactX: LAYOUT.garden.x, interactY: 0.82,
                name: 'Overgrown Garden',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "What was once a garden is now a jungle. Stakes have labels like 'Specimen 7-B' and 'Do Not Consume'. Scientist gardening.",
                    action: "Plants everywhere. Some of them are glowing? Others look like they're... breathing? I'm going to pretend I didn't see that."
                }
            },
            {
                id: 'doghouse',
                ...LAYOUT.doghouse,
                interactX: LAYOUT.doghouse.x, interactY: 0.82,
                name: 'Doghouse',
                verbs: { action: 'Look inside', look: 'Examine' },
                responses: {
                    look: "Where's Fluffy?",
                    action: "Empty. Just some old dog toys and... is that a tiny lab coat? "
                }
            },
            {
                id: 'gnome',
                ...LAYOUT.gnome,
                interactX: LAYOUT.gnome.x, interactY: 0.82,
                name: 'Garden Gnome',
                verbs: { action: 'Pick up', look: 'Examine' },
                responses: {
                    look: "Classic gnome. Guarding nothing. Living the dream.",
                    action: "I'm not stealing a man's gnome. That's where I draw the line."
                }
            },
            {
                id: 'telescope',
                ...LAYOUT.telescope,
                interactX: LAYOUT.telescope.x, interactY: 0.82,
                name: 'Telescope',
                verbs: { action: 'Look through', look: 'Examine' },
                responses: {
                    look: "An old brass telescope on a tripod. Pointed at the sky.",
                    action: "Wow, that's a lot of stars! Wait, is that one moving? And... blinking? Probably just a plane. Definitely just a plane."
                }
            },
            {
                id: 'trash_cans',
                ...LAYOUT.trash,
                interactX: LAYOUT.trash.x, interactY: 0.82,
                name: 'Garbage Cans',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Standard garbage cans. One's overflowing with failed experiment notes.",
                    action: "Let's see... old coffee filters and some kind of glowing residue."
                }
                // TODO: This is where Hector threw the rival's trophy - puzzle item
            },

            // === FENCE (spans full width, with string lights) ===
            {
                id: 'fence_earl',
                x: 1200, y: 0.52, w: 600, h: 0.20,
                interactX: 1200, interactY: 0.82,
                name: 'Wooden Fence',
                isNPC: true,
                verbs: { action: 'Talk to', look: 'Examine' },
                responses: {
                    look: "A tall wooden fence separating Hector's yard from the neighbor's. Colorful string lights hang above it. Smells like... burgers?",
                    action: null
                }
                // TODO: Talking to fence shows Earl's eyes and starts conversation
            },
            {
                id: 'string_lights',
                ...LAYOUT.string_lights,
                interactX: LAYOUT.string_lights.x, interactY: 0.82,
                name: 'String Lights',
                verbs: { action: 'Admire', look: 'Look at' },
                responses: {
                    look: "Festive string lights draped along the fence. Red, green, blue, yellow... someone's having a party over there.",
                    action: "So pretty! Whoever lives over there really knows how to set a mood."
                }
            },

            // === SHED (perpendicular, mostly off-screen right) ===
            {
                id: 'shed_entrance',
                ...LAYOUT.shed,
                interactX: 2400, interactY: 0.82,
                name: 'Garden Shed',
                verbs: { action: 'Enter', look: 'Examine' },
                responses: {
                    look: "A rickety old shed. The door faces this way. Smells like fertilizer and regret.",
                    action: "The door's stuck. Must not be implemented yet."
                }
            },

            // === SKY ELEMENTS ===
            {
                id: 'moon',
                ...LAYOUT.moon,
                interactX: LAYOUT.moon.x, interactY: 0.82,
                name: 'Moon',
                verbs: { action: 'Wave at', look: 'Look at' },
                responses: {
                    look: "Beautiful full moon tonight. Perfect weather for mad science.",
                    action: "Hi moon! ...The moon did not wave back."
                }
            }
            ];

            // === CONDITIONAL HOTSPOTS (based on game state) ===

            // Fence gate - locked (before invitation)
            if (!TSH.State.getFlag('clock.earl_invited')) {
                hotspots.push({
                    id: 'fence_gate_locked',
                    ...LAYOUT.fence_gate,
                    interactX: LAYOUT.fence_gate.x, interactY: 0.82,
                    name: 'Fence Gate',
                    verbs: { action: 'Open', look: 'Examine' },
                    responses: {
                        look: "A wooden gate in the fence leading to the neighbor's yard. I can hear music and smell BBQ from the other side.",
                        action: "Hello? Is anyone over there?"
                    },
                    actionTrigger: {
                        type: 'npc_conversation',
                        npcId: 'earl_at_fence',
                        dialogue: 'earl_fence'
                    }
                });
            }

            // Fence gate - open (after invitation)
            if (TSH.State.getFlag('clock.earl_invited')) {
                hotspots.push({
                    id: 'fence_gate_unlocked',
                    ...LAYOUT.fence_gate,
                    interactX: LAYOUT.fence_gate.x, interactY: 0.82,
                    name: 'Fence Gate',
                    verbs: { action: 'Open', look: 'Examine' },
                    responses: {
                        look: "The gate to the neighbor's yard. He said I'm welcome any time. ",
                        action: null
                    },
                    actionTrigger: {
                        type: 'transition',
                        target: 'earls_yard',
                        spawnPoint: 'from_backyard'
                    }
                });
            }

            // Clock on wall (only if not taken yet)
            if (!TSH.State.hasItem('clock')) {
                hotspots.push({
                    id: 'clock_wall',
                    ...LAYOUT.clock,
                    interactX: LAYOUT.clock.x, interactY: 0.82,
                    name: 'Wall Clock',
                    verbs: { action: 'Reach for', look: 'Examine' },
                    responses: {
                        look: "An old clock mounted WAY up on the exterior wall. Why would anyone put a clock there? It's like 15 feet up!",
                        action: "I can't reach that. I'd need... I don't know, a ladder? Spring-loaded shoes? A really tall friend?"
                    }
                });
            }

            // Deployed ladder (appears after using ladder on clock)
            if (TSH.State.getFlag('clock.ladder_deployed')) {
                hotspots.push({
                    id: 'ladder_deployed',
                    ...LAYOUT.ladder,
                    interactX: LAYOUT.ladder.x, interactY: 0.82,
                    name: 'Ladder',
                    verbs: { action: 'Take', look: 'Examine' },
                    responses: {
                        look: "The ladder I placed here. Still not tall enough to reach the clock.",
                        action: "I should leave it here for now. I think I'm onto something."
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
        // RELEVANT FLAGS (triggers automatic hotspot refresh)
        // =====================================================================

        relevantFlags: ['clock.ladder_deployed', 'clock.earl_invited', 'clock.obtained'],

        // =====================================================================
        // ITEM INTERACTIONS
        // =====================================================================

        itemInteractions: {
            clock_wall: {
                ladder: {
                    dialogue: "The ladder helps, but it's not tall enough to reach the clock.",
                    consumeItem: true,
                    setFlag: "clock.ladder_deployed"
                },
                moon_shoes: "The shoes give me some bounce, but I still can't reach it from down here.",
                ladder_shoes: "I climb the ladder, put on the moon shoes, and JUMP! Whoa— *CRASH* I hit the ceiling! But hey, the clock fell off the wall. Newton would be furious.",
                broken_moon_shoes: "These would be perfect if they weren't broken.",
                half_broken_moon_shoes: "These would be perfect if they weren't still broken. ",
                spring_1: "I'm not sure throwing a spring at the clock is going to be enough.",
                spring_2: "I'm not sure throwing a spring at the clock is going to be enough.",
                tongs: "Definitely not long enough to reach the clock. Plus the clock seems firmly attached to the wall.",
},
            ladder_deployed: {
                moon_shoes: {
                    dialogue: "I climb the ladder, put on the moon shoes, and JUMP! *CRASH* I grab the clock as I bounce off the wall. Success!",
                    consumeItem: true,
                    giveItem: "clock",
                    setFlag: "clock.obtained"
                },
                broken_moon_shoes: "{\"dialogue\":\"I climb the ladder, put on the moon shoes, and JUMP! *CRASH* I grab the clock as I bounce off the wall. Success!\",\"consumeItem\":true,\"giveItem\":\"clock\",\"setFlag\":\"clock.obtained\"}",
                half_broken_moon_shoes: "Not a bad idea... IF the shoes weren't still broken.",
                spring_1: "I don't think the spring alone is enough to help here.",
                spring_2: "I don't think the spring alone is enough to help here.",
},
            fence_earl: {
                default: "I don't think waving my {item} at the fence will help."
            },
            trash_cans: {
                default: "I'm not throwing my {item} in the trash."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

        firstVisit: {
            delay: 600,
            dialogue: "Wow, neglected is an understatement. But those lights over the fence look festive!"
        },

        features: {
            exteriorNight: true,
            stringLights: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Sky colors (night)
        SKY_DARK: 0x0a0a18,
        SKY_MID: 0x141428,
        SKY_HORIZON: 0x1a1a30,

        // Moon
        MOON_DARK: 0xc8c8d8,
        MOON_LIGHT: 0xe8e8f8,
        MOON_BRIGHT: 0xf8f8ff,

        // Grass
        GRASS_DARK: 0x1a2a15,
        GRASS_MID: 0x2a3a20,
        GRASS_LIGHT: 0x3a4a2a,
        GRASS_WILD: 0x4a5a35,

        // House exterior
        SIDING_DARK: 0x3a3535,
        SIDING_MID: 0x4a4545,
        SIDING_LIGHT: 0x5a5555,
        SIDING_HIGHLIGHT: 0x6a6565,

        // Wood (fence, shed, trim)
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,
        WOOD_HIGHLIGHT: 0x8a6840,

        // Door
        DOOR_DARK: 0x3a2515,
        DOOR_MID: 0x5a3a25,

        // Metal
        METAL_DARK: 0x3a3a3a,
        METAL_MID: 0x5a5a5a,
        METAL_LIGHT: 0x7a7a7a,

        // Brass/Gold accents
        BRASS: 0x9a8540,
        GOLD: 0x8a7530,

        // Window glow
        WINDOW_GLOW: 0xffe0a0,

        // String light colors
        LIGHT_RED: 0xff4444,
        LIGHT_GREEN: 0x44ff44,
        LIGHT_BLUE: 0x4444ff,
        LIGHT_YELLOW: 0xffff44,
        LIGHT_PINK: 0xff44ff,
        LIGHT_CYAN: 0x44ffff,
        LIGHT_ORANGE: 0xffaa44
    };

    const p = 2;

    function drawStars(g, worldWidth, skyHeight) {
        for (let i = 0; i < 100; i++) {
            const x = ((i * 37 + 13) * 73) % worldWidth;
            const y = ((i * 23 + 7) * 47) % (skyHeight * 0.6);
            const brightness = ((i * 11) % 3);

            if (brightness === 0) {
                g.fillStyle(0xffffff);
            } else if (brightness === 1) {
                g.fillStyle(0xccccdd);
            } else {
                g.fillStyle(0x9999aa);
            }
            g.fillRect(x, y, p, p);
        }
    }

    function drawMoon(g, x, y) {
        const moonRadius = p * 22;

        g.fillStyle(COLORS.MOON_DARK);
        g.fillRect(x - moonRadius, y - moonRadius, moonRadius * 2, moonRadius * 2);

        g.fillStyle(COLORS.MOON_LIGHT);
        g.fillRect(x - moonRadius + p*4, y - moonRadius + p*4, moonRadius * 2 - p*8, moonRadius * 2 - p*8);

        g.fillStyle(COLORS.MOON_BRIGHT);
        g.fillRect(x - moonRadius + p*6, y - moonRadius + p*6, p*10, p*8);
        g.fillRect(x + p*4, y - p*2, p*8, p*5);

        g.fillStyle(COLORS.MOON_DARK);
        g.fillRect(x - p*5, y + p*3, p*5, p*4);
        g.fillRect(x + p*7, y + p*8, p*4, p*3);
        g.fillRect(x - p*10, y - p*8, p*3, p*3);
    }

    function drawHouseExterior(g, x, floorY, width, height) {
        // House fills full vertical height on left side
        const wallTop = 0;

        // Main siding - full height
        g.fillStyle(COLORS.SIDING_DARK);
        g.fillRect(x, wallTop, width, floorY);

        // Siding horizontal lines
        const sidingHeight = p * 10;
        for (let py = p*10; py < floorY - p*4; py += sidingHeight) {
            g.fillStyle(COLORS.SIDING_MID);
            g.fillRect(x + p*4, py, width - p*8, sidingHeight - p*2);
            g.fillStyle(COLORS.SIDING_LIGHT);
            g.fillRect(x + p*4, py, width - p*8, p);
            g.fillStyle(COLORS.SIDING_DARK);
            g.fillRect(x + p*4, py + sidingHeight - p*3, width - p*8, p);
        }

        // Roof edge at top
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, 0, width + p*10, p*8);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x, p*6, width + p*10, p*3);

        // Vines/overgrowth
        g.fillStyle(0x2a4a2a);
        for (let vy = floorY - p*40; vy < floorY; vy += p*8) {
            const vx = x + width - p*20 + ((vy * 7) % 30);
            g.fillRect(vx, vy, p*3, p*12);
        }
        for (let vy = floorY - p*60; vy < floorY - p*20; vy += p*10) {
            const vx = x + ((vy * 5) % 40) + p*10;
            g.fillRect(vx, vy, p*2, p*14);
        }
    }

    function drawBackDoor(g, x, y, floorY) {
        // Matching interior door size
        const doorWidth = p * 80;  // 160px door width
        const doorHeight = floorY - y;
        const frameWidth = p * 3;

        // Steps leading up to door (2 steps)
        const stepWidth = doorWidth + p*20;
        const stepHeight = p*8;
        const stepDepth = p*12;

        // Bottom step
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - stepWidth/2, floorY + stepDepth, stepWidth, stepHeight);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - stepWidth/2, floorY + stepDepth, stepWidth, p*2);

        // Top step
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - stepWidth/2, floorY, stepWidth, stepHeight);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - stepWidth/2, floorY, stepWidth, p*2);

        // Door frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - doorWidth/2 - frameWidth, y - p*5, doorWidth + frameWidth*2, doorHeight + p*5);

        // Frame highlights
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - doorWidth/2 - frameWidth, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x + doorWidth/2 + p, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x - doorWidth/2 - frameWidth, y - p*5, doorWidth + frameWidth*2, p*2);

        // Door panel (main body)
        g.fillStyle(COLORS.DOOR_DARK);
        g.fillRect(x - doorWidth/2, y, doorWidth, doorHeight);

        // Door panels (two columns, centered and properly aligned)
        const panelInset = p*8;  // More centered
        const panelWidth = p*24;  // Wider panels
        const panelGap = p*6;
        const topPanelHeight = p*35;
        const bottomPanelHeight = p*45;
        const topPanelY = y + p*8;
        const bottomPanelY = y + p*50;

        // Calculate center position for two columns
        const leftPanelX = x - panelWidth - panelGap/2;
        const rightPanelX = x + panelGap/2;

        // Draw panels with highlights
        g.fillStyle(COLORS.DOOR_MID);
        // Top panels
        g.fillRect(leftPanelX, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(rightPanelX, topPanelY, panelWidth, topPanelHeight);
        // Bottom panels
        g.fillRect(leftPanelX, bottomPanelY, panelWidth, bottomPanelHeight);
        g.fillRect(rightPanelX, bottomPanelY, panelWidth, bottomPanelHeight);

        // Panel highlights (on all four panels)
        g.fillStyle(COLORS.WOOD_LIGHT);
        // Top left
        g.fillRect(leftPanelX, topPanelY, panelWidth, p);
        g.fillRect(leftPanelX, topPanelY, p, topPanelHeight);
        // Top right
        g.fillRect(rightPanelX, topPanelY, panelWidth, p);
        g.fillRect(rightPanelX, topPanelY, p, topPanelHeight);

        // Door knob
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + doorWidth/2 - p*8, y + doorHeight/2, p*3, p*4);

        // Light above door with glow
        const lightX = x;
        const lightY = y - p*14;

        // Glow effect (multiple layers)
        g.fillStyle(0xffe0a0);
        g.globalAlpha = 0.3;
        g.fillRect(lightX - p*12, lightY - p*6, p*24, p*20);
        g.globalAlpha = 0.5;
        g.fillRect(lightX - p*8, lightY - p*2, p*16, p*14);
        g.globalAlpha = 1.0;

        // Light fixture
        g.fillStyle(COLORS.WINDOW_GLOW);
        g.fillRect(lightX - p*6, lightY, p*12, p*8);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(lightX - p*7, lightY - p, p*14, p*2);
    }

    function drawWindow(g, x, y, w, h) {
        // Window frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*4, y - p*4, w + p*8, h + p*8);

        // Window panes with interior glow
        g.fillStyle(COLORS.WINDOW_GLOW);
        g.fillRect(x, y, w, h);

        // Cross muntins
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + w/2 - p, y, p*2, h);
        g.fillRect(x, y + h/2 - p, w, p*2);

        // Frame highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - p*3, y - p*3, p, h + p*6);
    }

    function drawClock(g, x, y) {
        const clockSize = p * 28;

        // Clock face backing
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockSize/2 - p*3, y - clockSize/2 - p*3, clockSize + p*6, clockSize + p*6);

        // Clock face
        g.fillStyle(0xd8d0b8);
        g.fillRect(x - clockSize/2, y - clockSize/2, clockSize, clockSize);

        // Inner ring
        g.fillStyle(0xc8c0a8);
        g.fillRect(x - clockSize/2 + p*3, y - clockSize/2 + p*3, clockSize - p*6, clockSize - p*6);

        // Clock hands
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p/2, y - p*8, p, p*8);
        g.fillRect(x, y - p/2, p*10, p);

        // Hour markers
        g.fillStyle(0x2a2a2a);
        g.fillRect(x - p/2, y - clockSize/2 + p*3, p, p*3);
        g.fillRect(x - p/2, y + clockSize/2 - p*6, p, p*3);
        g.fillRect(x - clockSize/2 + p*3, y - p/2, p*3, p);
        g.fillRect(x + clockSize/2 - p*6, y - p/2, p*3, p);

        // Brass frame
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - clockSize/2 - p*4, y - clockSize/2 - p*4, clockSize + p*8, p*2);
        g.fillRect(x - clockSize/2 - p*4, y + clockSize/2 + p*2, clockSize + p*8, p*2);
        g.fillRect(x - clockSize/2 - p*4, y - clockSize/2 - p*4, p*2, clockSize + p*8);
        g.fillRect(x + clockSize/2 + p*2, y - clockSize/2 - p*4, p*2, clockSize + p*8);
    }

    function drawBulkhead(g, x, floorY) {
        const bulkheadWidth = p * 110;  // Much bigger
        const bulkheadHeight = p * 55;  // Much bigger

        // Metal frame (larger, at bottom right corner of house)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - bulkheadWidth/2, floorY - bulkheadHeight, bulkheadWidth, bulkheadHeight);

        // Door panels (angled into ground)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - bulkheadWidth/2 + p*4, floorY - bulkheadHeight + p*4, bulkheadWidth/2 - p*6, bulkheadHeight - p*6);
        g.fillRect(x + p*3, floorY - bulkheadHeight + p*4, bulkheadWidth/2 - p*6, bulkheadHeight - p*6);

        // Highlights
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - bulkheadWidth/2 + p*5, floorY - bulkheadHeight + p*5, bulkheadWidth/2 - p*8, p*2);
        g.fillRect(x + p*4, floorY - bulkheadHeight + p*5, bulkheadWidth/2 - p*8, p*2);

        // Handle (larger)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*5, floorY - bulkheadHeight/2 - p*4, p*10, p*6);

        // Rust/weathering
        g.fillStyle(0x8b4513);
        g.fillRect(x - bulkheadWidth/2 + p*2, floorY - p*8, p*2, p*3);
        g.fillRect(x + bulkheadWidth/2 - p*4, floorY - p*12, p*2, p*4);
    }

    function drawFence(g, x, floorY, width, height) {
        const fenceTop = floorY - height;

        // Horizontal rails (draw first, behind everything)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, fenceTop + p*12, width, p*5);
        g.fillRect(x, floorY - p*25, width, p*5);

        // Fence slats (solid - fully continuous, no gaps)
        const slatWidth = p * 11;
        const slatSpacing = p * 10;  // Overlapping to fill completely
        for (let sx = x; sx < x + width; sx += slatSpacing) {
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(sx, fenceTop, slatWidth, height);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(sx + p, fenceTop + p*3, p, height - p*6);
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(sx + slatWidth - p*2, fenceTop + p*3, p, height - p*6);
        }

        // Fence posts (draw on top of slats)
        const postWidth = p * 8;
        const postSpacing = p * 50;
        for (let px = x; px < x + width; px += postSpacing) {
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(px, fenceTop - p*12, postWidth, height + p*12);
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(px + p, fenceTop - p*10, postWidth - p*2, height + p*8);
            // Post cap (pointed)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(px, fenceTop - p*16, postWidth, p*5);
            g.fillRect(px + p*2, fenceTop - p*18, p*4, p*3);
        }
    }

    function drawFenceGate(g, x, floorY, fenceHeight) {
        const fenceTop = floorY - fenceHeight;
        const gateWidth = p * 65;  // Wider, more normal door-sized
        const gateHeight = fenceHeight - p*5;

        // Gate posts (darker/sturdier than fence posts)
        const postWidth = p * 10;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - gateWidth/2 - postWidth, fenceTop - p*12, postWidth, fenceHeight + p*12);
        g.fillRect(x + gateWidth/2, fenceTop - p*12, postWidth, fenceHeight + p*12);

        // Post caps
        g.fillRect(x - gateWidth/2 - postWidth, fenceTop - p*16, postWidth, p*5);
        g.fillRect(x + gateWidth/2, fenceTop - p*16, postWidth, p*5);
        g.fillRect(x - gateWidth/2 - postWidth + p*2, fenceTop - p*18, p*6, p*3);
        g.fillRect(x + gateWidth/2 + p*2, fenceTop - p*18, p*6, p*3);

        // Gate frame
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - gateWidth/2, fenceTop + p*2, gateWidth, gateHeight);

        // Gate slats (vertical)
        g.fillStyle(COLORS.WOOD_DARK);
        const slatWidth = p * 6;
        const slatSpacing = p * 8;
        for (let sx = x - gateWidth/2 + p*3; sx < x + gateWidth/2 - p*3; sx += slatSpacing) {
            g.fillRect(sx, fenceTop + p*4, slatWidth, gateHeight - p*4);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(sx + p, fenceTop + p*5, p, gateHeight - p*6);
            g.fillStyle(COLORS.WOOD_DARK);
        }

        // Gate cross-brace (diagonal)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - gateWidth/2 + p*4, fenceTop + gateHeight/2 - p*2, gateWidth - p*8, p*4);

        // Handle/latch
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + gateWidth/2 - p*10, floorY - fenceHeight/2, p*4, p*8);

        // Hinges
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - gateWidth/2 - p*2, fenceTop + p*15, p*6, p*4);
        g.fillRect(x - gateWidth/2 - p*2, floorY - p*30, p*6, p*4);
    }

    function drawStringLights(g, x, y, width) {
        const lightColors = [
            COLORS.LIGHT_RED, COLORS.LIGHT_GREEN, COLORS.LIGHT_BLUE,
            COLORS.LIGHT_YELLOW, COLORS.LIGHT_PINK, COLORS.LIGHT_CYAN,
            COLORS.LIGHT_ORANGE
        ];

        // Wire
        g.fillStyle(0x2a2a2a);
        g.fillRect(x, y, width, p);

        // Light bulbs
        const spacing = p * 30;
        let colorIdx = 0;
        for (let lx = x + p*10; lx < x + width - p*10; lx += spacing) {
            // Bulb glow (larger, semi-transparent effect simulated)
            g.fillStyle(lightColors[colorIdx % lightColors.length]);
            g.fillRect(lx - p*3, y + p, p*6, p*8);

            // Bulb highlight
            const highlight = lightColors[colorIdx % lightColors.length] + 0x333333;
            g.fillStyle(highlight > 0xffffff ? 0xffffff : highlight);
            g.fillRect(lx - p*2, y + p*2, p*4, p*3);

            colorIdx++;
        }

        // Draping effect - slight sag between posts
        const sagPoints = 5;
        const sagSpacing = width / sagPoints;
        for (let i = 1; i < sagPoints; i++) {
            const sagX = x + i * sagSpacing;
            g.fillStyle(0x2a2a2a);
            g.fillRect(sagX - p*5, y + p*2, p*10, p);
            g.fillRect(sagX - p*3, y + p*3, p*6, p);
        }
    }

    function drawShedPerpendicular(g, x, floorY, height) {
        // Shed is perpendicular to camera - we see the side of it
        // Most of it extends off-screen to the right
        const shedDepth = p * 80; // How much we see
        const shedHeight = height * 0.45;
        const shedTop = floorY - shedHeight;
        const roofHeight = p * 20;

        // Shed side wall (what we see)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, shedTop + roofHeight, shedDepth, shedHeight - roofHeight);

        // Siding boards
        const boardHeight = p * 12;
        for (let by = shedTop + roofHeight + p*4; by < floorY - p*4; by += boardHeight) {
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x + p*2, by, shedDepth - p*4, boardHeight - p*2);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(x + p*3, by + p, shedDepth - p*6, p);
        }

        // Roof (slanted, extends off screen)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*6, shedTop, shedDepth + p*12, roofHeight);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*4, shedTop + p*2, shedDepth + p*8, p*4);

        // Door opening (we can see it from the side)
        g.fillStyle(0x1a1a1a);
        g.fillRect(x, shedTop + roofHeight + p*10, p*8, shedHeight - roofHeight - p*12);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*6, shedTop + roofHeight + p*12, p*3, shedHeight - roofHeight - p*16);
    }

    function drawDoghouse(g, x, floorY) {
        const houseWidth = p * 80;  // Much larger
        const houseHeight = p * 60;  // Much larger
        const houseTop = floorY - houseHeight;
        const roofHeight = p * 28;

        // Base
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - houseWidth/2, houseTop + roofHeight, houseWidth, houseHeight - roofHeight);

        // Front face
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - houseWidth/2 + p*3, houseTop + roofHeight + p*3, houseWidth - p*6, houseHeight - roofHeight - p*5);

        // Entrance hole
        g.fillStyle(0x0a0a0a);
        g.fillRect(x - p*20, floorY - p*44, p*40, p*40);

        // Roof
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - houseWidth/2 - p*4, houseTop, houseWidth + p*8, roofHeight);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - houseWidth/2, houseTop + p*3, houseWidth, p*3);

        // "FLUFFY" text representation
        g.fillStyle(0xffffff);
        g.fillRect(x - p*24, houseTop + roofHeight + p*8, p*48, p*6);
    }

    function drawTelescope(g, x, floorY) {
        const legHeight = p * 76;  // Much larger
        const tubeLength = p * 60;  // Much larger

        // Tripod legs
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*24, floorY - legHeight, p*6, legHeight);
        g.fillRect(x + p*20, floorY - legHeight, p*6, legHeight);
        g.fillRect(x - p*2, floorY - legHeight + p*16, p*6, legHeight - p*16);

        // Telescope tube
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*6, floorY - legHeight - p*12, tubeLength, p*16);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x, floorY - legHeight - p*10, tubeLength - p*10, p*12);

        // Eyepiece
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p*12, floorY - legHeight - p*8, p*8, p*6);

        // Lens
        g.fillStyle(0x4a6a8a);
        g.fillRect(x + tubeLength - p*6, floorY - legHeight - p*10, p*8, p*12);
    }

    function drawGnome(g, x, floorY) {
        const gnomeHeight = p * 50;  // Much larger

        // Body
        g.fillStyle(0x4a3a6a);
        g.fillRect(x - p*12, floorY - gnomeHeight + p*22, p*24, p*28);

        // Head
        g.fillStyle(0xd8c0a0);
        g.fillRect(x - p*10, floorY - gnomeHeight + p*10, p*20, p*14);

        // Hat (pointy red)
        g.fillStyle(0x8a2020);
        g.fillRect(x - p*10, floorY - gnomeHeight, p*20, p*12);
        g.fillRect(x - p*8, floorY - gnomeHeight - p*6, p*16, p*6);
        g.fillRect(x - p*6, floorY - gnomeHeight - p*10, p*12, p*6);
        g.fillRect(x - p*3, floorY - gnomeHeight - p*14, p*6, p*5);

        // Beard
        g.fillStyle(0xd8d8d8);
        g.fillRect(x - p*8, floorY - gnomeHeight + p*22, p*16, p*12);
    }

    function drawClothesline(g, x1, x2, y, floorY) {
        // Posts
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x1 - p*3, y, p*5, floorY - y);
        g.fillRect(x2 - p*3, y, p*5, floorY - y);

        // Post tops
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x1 - p*4, y - p*3, p*7, p*4);
        g.fillRect(x2 - p*4, y - p*3, p*7, p*4);

        // Line
        g.fillStyle(0x8a8a8a);
        g.fillRect(x1, y + p*3, x2 - x1, p);

        // Lab coat hanging
        const coatX = (x1 + x2) / 2;
        const coatY = y + p*6;
        g.fillStyle(0xd8d8d8);
        g.fillRect(coatX - p*15, coatY, p*30, p*38);
        g.fillStyle(0xc8c8c8);
        g.fillRect(coatX - p*13, coatY + p*3, p*26, p*32);
        // Sleeves
        g.fillRect(coatX - p*22, coatY + p*6, p*10, p*20);
        g.fillRect(coatX + p*12, coatY + p*6, p*10, p*20);
        // Collar
        g.fillStyle(0xe8e8e8);
        g.fillRect(coatX - p*8, coatY, p*16, p*5);
        // Coat flapping effect
        g.fillStyle(0xd0d0d0);
        g.fillRect(coatX + p*10, coatY + p*25, p*8, p*10);
    }

    function drawTrashCans(g, x, floorY) {
        const canWidth = p * 36;  // Much larger
        const canHeight = p * 52;  // Much larger

        for (let i = 0; i < 2; i++) {
            const cx = x + i * (canWidth + p*10);
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(cx, floorY - canHeight, canWidth, canHeight);
            g.fillStyle(COLORS.METAL_MID);
            g.fillRect(cx + p*2, floorY - canHeight + p*3, canWidth - p*4, canHeight - p*5);

            // Lid
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(cx - p*2, floorY - canHeight - p*4, canWidth + p*4, p*5);
            g.fillStyle(COLORS.METAL_MID);
            g.fillRect(cx + canWidth/2 - p*3, floorY - canHeight - p*6, p*5, p*4);
        }

        // Overflowing papers
        g.fillStyle(0xd8d0c0);
        g.fillRect(x + p*6, floorY - canHeight - p*16, p*20, p*10);
        g.fillRect(x + canWidth + p*16, floorY - canHeight - p*10, p*16, p*8);
        g.fillStyle(0xe0d8c8);
        g.fillRect(x + p*10, floorY - canHeight - p*12, p*12, p*6);
    }

    function drawGarden(g, x, floorY, width) {
        // Dirt base
        g.fillStyle(0x3a2a1a);
        g.fillRect(x, floorY - p*5, width, p*5);

        // Wild plants
        const plantColors = [0x2a5a2a, 0x3a6a3a, 0x4a7a4a, 0x3a7a5a, 0x5a8a5a];
        for (let px = x; px < x + width; px += p*10) {
            const plantHeight = p * (12 + ((px * 7) % 24));
            const colorIdx = Math.floor(px / p) % plantColors.length;
            g.fillStyle(plantColors[colorIdx]);
            g.fillRect(px, floorY - plantHeight, p*4, plantHeight);
            g.fillRect(px - p*3, floorY - plantHeight + p*3, p*10, p*5);
            g.fillRect(px - p*2, floorY - plantHeight - p*2, p*8, p*4);
        }

        // Glowing specimen
        g.fillStyle(0x4afa4a);
        const glowX = x + width/2;
        g.fillRect(glowX, floorY - p*22, p*5, p*20);
        g.fillRect(glowX - p*3, floorY - p*25, p*11, p*5);

        // Stakes with labels
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*25, floorY - p*30, p*3, p*26);
        g.fillStyle(0xe8e0d0);
        g.fillRect(x + p*20, floorY - p*34, p*16, p*7);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + width - p*35, floorY - p*28, p*3, p*24);
        g.fillStyle(0xe8e0d0);
        g.fillRect(x + width - p*42, floorY - p*32, p*16, p*7);
    }

    function drawLadder(g, x, bottomY, height) {
        const railWidth = p * 5;      // Thicker rails (was p * 3)
        const rungWidth = p * 20;     // Wider overall (was p * 12)
        const rungHeight = p * 3;     // Thicker rungs (was p * 2)
        const rungSpacing = p * 14;

        // Silver/metal colors
        const SILVER_DARK = 0x6a6a6a;
        const SILVER_MID = 0x9a9a9a;
        const SILVER_LIGHT = 0xc0c0c0;

        // Left rail
        g.fillStyle(SILVER_MID);
        g.fillRect(x - rungWidth/2, bottomY - height, railWidth, height);

        // Right rail
        g.fillRect(x + rungWidth/2 - railWidth, bottomY - height, railWidth, height);

        // Rail highlights
        g.fillStyle(SILVER_LIGHT);
        g.fillRect(x - rungWidth/2, bottomY - height, p, height);
        g.fillRect(x + rungWidth/2 - railWidth, bottomY - height, p, height);

        // Rail shadows
        g.fillStyle(SILVER_DARK);
        g.fillRect(x - rungWidth/2 + railWidth - p, bottomY - height, p, height);
        g.fillRect(x + rungWidth/2 - p, bottomY - height, p, height);

        // Rungs
        g.fillStyle(SILVER_DARK);
        for (let ry = bottomY - rungSpacing; ry > bottomY - height; ry -= rungSpacing) {
            g.fillRect(x - rungWidth/2, ry, rungWidth, rungHeight);
            g.fillStyle(SILVER_LIGHT);
            g.fillRect(x - rungWidth/2 + p, ry + p/2, rungWidth - p*2, p);
            g.fillStyle(SILVER_DARK);
        }
    }

    // =========================================================================
    // BACKGROUND LAYER (sky, stars, moon, ground)
    // =========================================================================

    function drawBackyardBackground(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera
        const skyHeight = floorY;

        // === NIGHT SKY (single dark color) ===
        g.fillStyle(COLORS.SKY_DARK);
        g.fillRect(0, 0, worldWidth, skyHeight);

        // Stars
        drawStars(g, worldWidth, skyHeight);

        // Moon (positioned far right, not blocked by house)
        drawMoon(g, LAYOUT.moon.x, height * LAYOUT.moon.y);
    }

    // =========================================================================
    // FOREGROUND LAYER (fence, house, yard items)
    // =========================================================================

    function drawBackyardForeground(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera

        // === GROUND/GRASS (drawn first in foreground to cover Earl's feet) ===
        g.fillStyle(COLORS.GRASS_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Grass texture
        for (let gx = 0; gx < worldWidth; gx += p*25) {
            g.fillStyle(COLORS.GRASS_MID);
            g.fillRect(gx + p*3, floorY + p*3, p*10, p*3);
            g.fillStyle(COLORS.GRASS_LIGHT);
            g.fillRect(gx + p*14, floorY + p*5, p*8, p*2);
        }

        // Overgrown grass tufts
        for (let tx = 0; tx < worldWidth; tx += p*35) {
            const tHeight = p * (5 + ((tx * 3) % 8));
            g.fillStyle(COLORS.GRASS_WILD);
            g.fillRect(tx + p*6, floorY - tHeight, p*3, tHeight);
            g.fillRect(tx + p*10, floorY - tHeight + p, p*2, tHeight - p);
        }

        // === FENCE (spans full width, behind everything - taller to reach eye level) ===
        const fenceHeight = p * 115;
        drawFence(g, 0, floorY, worldWidth, fenceHeight);

        // === STRING LIGHTS (above fence) ===
        drawStringLights(g, 50, floorY - fenceHeight - p*15, worldWidth - 100);

        // === FENCE GATE (to Earl's yard) ===
        drawFenceGate(g, LAYOUT.fence_gate.x, floorY, fenceHeight);

        // === HOUSE EXTERIOR (left side - fills full vertical height) ===
        const houseWidth = p * 280;
        drawHouseExterior(g, 0, floorY, houseWidth, floorY);

        // Back door on house — derive top Y from hotspot center and height
        const doorTopY = LAYOUT.back_door.y - LAYOUT.back_door.h / 2; // 0.30
        drawBackDoor(g, LAYOUT.back_door.x, height * doorTopY, floorY);

        // Window on house (convert center to top-left for drawing)
        const windowW = LAYOUT.window.w;
        const windowH = height * LAYOUT.window.h;
        const windowX = LAYOUT.window.x - windowW / 2;
        const windowY = height * LAYOUT.window.y - windowH / 2;
        drawWindow(g, windowX, windowY, windowW, windowH);

        // Clock on wall (only if not taken yet)
        if (!TSH.State.hasItem('clock')) {
            drawClock(g, LAYOUT.clock.x, height * LAYOUT.clock.y);
        }

        // Deployed ladder (conditional - only when flag is set)
        if (TSH.State.getFlag('clock.ladder_deployed')) {
            const ladderHeight = height * LAYOUT.ladder.h;
            const ladderBottomY = height * (LAYOUT.ladder.y + LAYOUT.ladder.h / 2);
            drawLadder(g, LAYOUT.ladder.x, ladderBottomY, ladderHeight);
        }

        // === BULKHEAD (on house, below window) ===
        drawBulkhead(g, LAYOUT.bulkhead.x, floorY);

        // === YARD ITEMS (all sitting on grass, slightly in front of fence) ===
        drawClothesline(g, LAYOUT.clothesline.x - p*35, LAYOUT.clothesline.x + p*35, height * 0.38, floorY);
        drawDoghouse(g, LAYOUT.doghouse.x, floorY);
        drawGarden(g, LAYOUT.garden.x - p*100, floorY, p*200);
        drawGnome(g, LAYOUT.gnome.x, floorY);
        drawTelescope(g, LAYOUT.telescope.x, floorY);
        drawTrashCans(g, LAYOUT.trash.x, floorY);

        // === SHED (perpendicular, mostly off-screen right) ===
        drawShedPerpendicular(g, LAYOUT.shed.x, floorY, height);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION (DEPRECATED - kept for reference)
    // =========================================================================

    function drawBackyardRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera
        const skyHeight = floorY;

        // === NIGHT SKY (single dark color) ===
        g.fillStyle(COLORS.SKY_DARK);
        g.fillRect(0, 0, worldWidth, skyHeight);

        // Stars
        drawStars(g, worldWidth, skyHeight);

        // Moon (positioned far right, not blocked by house)
        drawMoon(g, LAYOUT.moon.x, height * LAYOUT.moon.y);

        // === FENCE (spans full width, behind everything - taller to reach eye level) ===
        const fenceHeight = p * 115;
        drawFence(g, 0, floorY, worldWidth, fenceHeight);

        // === STRING LIGHTS (above fence) ===
        drawStringLights(g, 50, floorY - fenceHeight - p*15, worldWidth - 100);

        // === FENCE GATE (to Earl's yard) ===
        drawFenceGate(g, LAYOUT.fence_gate.x, floorY, fenceHeight);

        // === GROUND/GRASS ===
        g.fillStyle(COLORS.GRASS_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Grass texture
        for (let gx = 0; gx < worldWidth; gx += p*25) {
            g.fillStyle(COLORS.GRASS_MID);
            g.fillRect(gx + p*3, floorY + p*3, p*10, p*3);
            g.fillStyle(COLORS.GRASS_LIGHT);
            g.fillRect(gx + p*14, floorY + p*5, p*8, p*2);
        }

        // Overgrown grass tufts
        for (let tx = 0; tx < worldWidth; tx += p*35) {
            const tHeight = p * (5 + ((tx * 3) % 8));
            g.fillStyle(COLORS.GRASS_WILD);
            g.fillRect(tx + p*6, floorY - tHeight, p*3, tHeight);
            g.fillRect(tx + p*10, floorY - tHeight + p, p*2, tHeight - p);
        }

        // === HOUSE EXTERIOR (left side - fills full vertical height) ===
        const houseWidth = p * 280;
        drawHouseExterior(g, 0, floorY, houseWidth, floorY);

        // Back door on house — derive top Y from hotspot center and height
        const doorTopY = LAYOUT.back_door.y - LAYOUT.back_door.h / 2; // 0.30
        drawBackDoor(g, LAYOUT.back_door.x, height * doorTopY, floorY);

        // Window on house (convert center to top-left for drawing)
        const windowW = LAYOUT.window.w;
        const windowH = height * LAYOUT.window.h;
        const windowX = LAYOUT.window.x - windowW / 2;
        const windowY = height * LAYOUT.window.y - windowH / 2;
        drawWindow(g, windowX, windowY, windowW, windowH);

        // Clock on wall (only if not taken yet)
        if (!TSH.State.hasItem('clock')) {
            drawClock(g, LAYOUT.clock.x, height * LAYOUT.clock.y);
        }

        // Deployed ladder (conditional - only when flag is set)
        if (TSH.State.getFlag('clock.ladder_deployed')) {
            const ladderHeight = height * LAYOUT.ladder.h;
            const ladderBottomY = height * (LAYOUT.ladder.y + LAYOUT.ladder.h / 2);
            drawLadder(g, LAYOUT.ladder.x, ladderBottomY, ladderHeight);
        }

        // === BULKHEAD (on house, below window) ===
        drawBulkhead(g, LAYOUT.bulkhead.x, floorY);

        // === YARD ITEMS (all sitting on grass, slightly in front of fence) ===
        drawClothesline(g, LAYOUT.clothesline.x - p*35, LAYOUT.clothesline.x + p*35, height * 0.38, floorY);
        drawDoghouse(g, LAYOUT.doghouse.x, floorY);
        drawGarden(g, LAYOUT.garden.x - p*100, floorY, p*200);
        drawGnome(g, LAYOUT.gnome.x, floorY);
        drawTelescope(g, LAYOUT.telescope.x, floorY);
        drawTrashCans(g, LAYOUT.trash.x, floorY);

        // === SHED (perpendicular, mostly off-screen right) ===
        drawShedPerpendicular(g, LAYOUT.shed.x, floorY, height);
    }

})();
