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
                // Moonlight from above
                { id: 'moon_main', x: 400, y: 0.10, radius: 500, color: 0xaabbdd, intensity: 0.8 },
                { id: 'moon_secondary', x: 1400, y: 0.15, radius: 450, color: 0x99aacc, intensity: 0.6 },
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
                { id: 'window_glow', x: 300, y: 0.40, radius: 120, color: 0xffe0a0, intensity: 0.4 }
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
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawBackyardRoom
            }
        ],

        spawns: {
            default: { x: 250, y: 0.82 },
            from_interior: { x: 250, y: 0.82 },
            from_basement: { x: 650, y: 0.82 },
            from_earls_yard: { x: 1400, y: 0.82 },
            from_shed: { x: 2300, y: 0.82 }
        },

        exits: [
            {
                edge: 'left',
                x: 0,
                width: 60,
                target: 'interior',
                spawnPoint: 'from_backyard'
            }
        ],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === HOUSE EXTERIOR (left side - fills full height) ===
            {
                id: 'window_house',
                x: 300, y: 0.35, w: 120, h: 0.18,
                interactX: 300, interactY: 0.82,
                name: 'Window',
                verbs: { action: 'Peek through', look: 'Examine' },
                responses: {
                    look: "A window into the house. Warm light spills out. I can see the living room from here.",
                    action: "Huh, it's messier than I thought. And is that... a floating head? Oh right, that's Hector."
                }
            },
            {
                id: 'clock_wall',
                x: 450, y: 0.18, w: 80, h: 0.12,
                interactX: 450, interactY: 0.82,
                name: 'Wall Clock',
                verbs: { action: 'Reach for', look: 'Examine' },
                responses: {
                    look: "An old clock mounted WAY up on the exterior wall. Why would anyone put a clock there? It's like 15 feet up!",
                    action: "I can't reach that. I'd need... I don't know, a ladder? Spring-loaded shoes? A really tall friend?"
                }
                // TODO: State-driven - after clock falls, this hotspot changes position
            },
            {
                id: 'house_wall',
                x: 300, y: 0.45, w: 350, h: 0.25,
                interactX: 300, interactY: 0.82,
                name: 'House Exterior',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "Weathered siding. A little overgrown with vines. Could use some love.",
                    action: "Yep, that's a wall alright. Solid."
                }
            },

            // === BULKHEAD (attached to end of house) ===
            {
                id: 'bulkhead_basement',
                x: 620, y: 0.65, w: 100, h: 0.12,
                interactX: 650, interactY: 0.82,
                name: 'Basement Bulkhead',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Metal bulkhead doors leading down to the basement. They look heavy but not locked.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'basement',
                    spawnPoint: 'from_backyard'
                }
                // Note: basement not built yet - placeholder
            },

            // === YARD ITEMS ===
            {
                id: 'clothesline',
                x: 850, y: 0.45, w: 180, h: 0.20,
                interactX: 850, interactY: 0.82,
                name: 'Clothesline',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "An old clothesline. There's a lab coat hanging on it, flapping in the breeze. Been here a while.",
                    action: "A spare lab coat! Hector must have forgotten about it. Could come in handy..."
                }
                // TODO: May be a way to get a lab coat for the disguise puzzle
            },
            {
                id: 'garden_wild',
                x: 1100, y: 0.62, w: 180, h: 0.15,
                interactX: 1100, interactY: 0.82,
                name: 'Overgrown Garden',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "What was once a garden is now a jungle. Stakes have labels like 'Specimen 7-B' and 'Do Not Consume'. Scientist gardening.",
                    action: "Plants everywhere. Some of them are glowing? Others look like they're... breathing? I'm going to pretend I didn't see that."
                }
            },
            {
                id: 'doghouse',
                x: 1000, y: 0.64, w: 70, h: 0.12,
                interactX: 1000, interactY: 0.82,
                name: 'Doghouse',
                verbs: { action: 'Look inside', look: 'Examine' },
                responses: {
                    look: "'FLUFFY' is painted on the side. Where's Fluffy? Actually... do I want to know?",
                    action: "Empty. Just some old dog toys and... is that a tiny lab coat? What happened to Fluffy?!"
                }
            },
            {
                id: 'gnome',
                x: 1300, y: 0.66, w: 40, h: 0.10,
                interactX: 1300, interactY: 0.82,
                name: 'Garden Gnome',
                verbs: { action: 'Pick up', look: 'Examine' },
                responses: {
                    look: "Classic gnome. Guarding nothing. Living the dream.",
                    action: "I'm not stealing a man's gnome. That's where I draw the line."
                }
            },
            {
                id: 'telescope',
                x: 1500, y: 0.58, w: 60, h: 0.16,
                interactX: 1500, interactY: 0.82,
                name: 'Telescope',
                verbs: { action: 'Look through', look: 'Examine' },
                responses: {
                    look: "An old brass telescope on a tripod. Pointed at the sky.",
                    action: "Wow, that's a lot of stars! Wait, is that one moving? And... blinking? Probably just a plane. Definitely just a plane."
                }
            },
            {
                id: 'trash_cans',
                x: 1700, y: 0.66, w: 80, h: 0.10,
                interactX: 1700, interactY: 0.82,
                name: 'Garbage Cans',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Standard garbage cans. One's overflowing with failed experiment notes.",
                    action: "Let's see... old coffee filters, some kind of glowing residue, and... oh! Is that a trophy?"
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
                x: 1200, y: 0.48, w: 800, h: 0.08,
                interactX: 1200, interactY: 0.82,
                name: 'String Lights',
                verbs: { action: 'Admire', look: 'Look at' },
                responses: {
                    look: "Festive string lights draped along the fence. Red, green, blue, yellow... someone's having a party over there.",
                    action: "So pretty! Whoever lives over there really knows how to set a mood."
                }
            },
            {
                id: 'door_fence_hidden',
                x: 1400, y: 0.56, w: 60, h: 0.20,
                interactX: 1400, interactY: 0.82,
                name: 'Gate',
                visible: false,
                verbs: { action: 'Go through', look: 'Examine' },
                responses: {
                    look: "A hidden gate in the fence! Earl must have opened it from his side.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'earls_yard',
                    spawnPoint: 'from_backyard'
                }
                // TODO: State-driven visibility - only appears after Earl invites Nate over
            },

            // === SHED (perpendicular, mostly off-screen right) ===
            {
                id: 'shed_entrance',
                x: 2450, y: 0.50, w: 120, h: 0.28,
                interactX: 2400, interactY: 0.82,
                name: 'Garden Shed',
                verbs: { action: 'Enter', look: 'Examine' },
                responses: {
                    look: "A rickety old shed. The door faces this way. Smells like fertilizer and regret.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'shed_interior',
                    spawnPoint: 'from_backyard'
                }
                // Note: shed_interior not built yet - placeholder
            },

            // === SKY ELEMENTS ===
            {
                id: 'moon',
                x: 200, y: 0.08, w: 80, h: 0.10,
                interactX: 200, interactY: 0.82,
                name: 'Moon',
                verbs: { action: 'Wave at', look: 'Look at' },
                responses: {
                    look: "Beautiful full moon tonight. Perfect weather for mad science.",
                    action: "Hi moon! ...The moon did not wave back."
                }
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
            clock_wall: {
                ladder: "The ladder helps, but it's not tall enough to reach the clock.",
                moon_shoes: "The shoes give me some bounce, but I can't reach it from down here.",
                ladder_shoes: "I climb the ladder, put on the moon shoes, and JUMP! Whoa— *CRASH* I hit the ceiling! But hey, the clock fell off the wall. Newton would be furious."
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
        const bulkheadWidth = p * 55;
        const bulkheadHeight = p * 28;

        // Metal frame
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - bulkheadWidth/2, floorY - bulkheadHeight, bulkheadWidth, bulkheadHeight);

        // Door panels (angled into ground)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - bulkheadWidth/2 + p*3, floorY - bulkheadHeight + p*3, bulkheadWidth/2 - p*4, bulkheadHeight - p*5);
        g.fillRect(x + p*2, floorY - bulkheadHeight + p*3, bulkheadWidth/2 - p*4, bulkheadHeight - p*5);

        // Highlights
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - bulkheadWidth/2 + p*4, floorY - bulkheadHeight + p*4, bulkheadWidth/2 - p*6, p*2);
        g.fillRect(x + p*3, floorY - bulkheadHeight + p*4, bulkheadWidth/2 - p*6, p*2);

        // Handle
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*4, floorY - bulkheadHeight/2 - p*3, p*8, p*5);
    }

    function drawFence(g, x, floorY, width, height) {
        const fenceTop = floorY - height;

        // Fence posts
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

        // Fence slats
        const slatWidth = p * 10;
        const slatSpacing = p * 12;
        for (let sx = x + postWidth; sx < x + width - postWidth; sx += slatSpacing) {
            // Skip if we're at a post position
            if (Math.abs((sx - x) % postSpacing) < postWidth + p*2) continue;

            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(sx, fenceTop, slatWidth, height);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(sx + p, fenceTop + p*3, p, height - p*6);
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(sx + slatWidth - p*2, fenceTop + p*3, p, height - p*6);
        }

        // Horizontal rails
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, fenceTop + p*12, width, p*5);
        g.fillRect(x, floorY - p*25, width, p*5);
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
        const houseWidth = p * 40;
        const houseHeight = p * 30;
        const houseTop = floorY - houseHeight;
        const roofHeight = p * 14;

        // Base
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - houseWidth/2, houseTop + roofHeight, houseWidth, houseHeight - roofHeight);

        // Front face
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - houseWidth/2 + p*3, houseTop + roofHeight + p*3, houseWidth - p*6, houseHeight - roofHeight - p*5);

        // Entrance hole
        g.fillStyle(0x0a0a0a);
        g.fillRect(x - p*10, floorY - p*22, p*20, p*20);

        // Roof
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - houseWidth/2 - p*4, houseTop, houseWidth + p*8, roofHeight);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - houseWidth/2, houseTop + p*3, houseWidth, p*3);

        // "FLUFFY" text representation
        g.fillStyle(0xffffff);
        g.fillRect(x - p*12, houseTop + roofHeight + p*5, p*24, p*4);
    }

    function drawTelescope(g, x, floorY) {
        const legHeight = p * 38;
        const tubeLength = p * 30;

        // Tripod legs
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*12, floorY - legHeight, p*3, legHeight);
        g.fillRect(x + p*10, floorY - legHeight, p*3, legHeight);
        g.fillRect(x - p, floorY - legHeight + p*8, p*3, legHeight - p*8);

        // Telescope tube
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*3, floorY - legHeight - p*6, tubeLength, p*8);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x, floorY - legHeight - p*5, tubeLength - p*5, p*6);

        // Eyepiece
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p*6, floorY - legHeight - p*4, p*4, p*3);

        // Lens
        g.fillStyle(0x4a6a8a);
        g.fillRect(x + tubeLength - p*3, floorY - legHeight - p*5, p*4, p*6);
    }

    function drawGnome(g, x, floorY) {
        const gnomeHeight = p * 22;

        // Body
        g.fillStyle(0x4a3a6a);
        g.fillRect(x - p*5, floorY - gnomeHeight + p*10, p*10, p*12);

        // Head
        g.fillStyle(0xd8c0a0);
        g.fillRect(x - p*4, floorY - gnomeHeight + p*5, p*8, p*6);

        // Hat (pointy red)
        g.fillStyle(0x8a2020);
        g.fillRect(x - p*4, floorY - gnomeHeight, p*8, p*6);
        g.fillRect(x - p*3, floorY - gnomeHeight - p*3, p*6, p*3);
        g.fillRect(x - p*2, floorY - gnomeHeight - p*5, p*4, p*3);
        g.fillRect(x - p, floorY - gnomeHeight - p*6, p*2, p*2);

        // Beard
        g.fillStyle(0xd8d8d8);
        g.fillRect(x - p*3, floorY - gnomeHeight + p*10, p*6, p*5);
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
        const canWidth = p * 16;
        const canHeight = p * 24;

        for (let i = 0; i < 2; i++) {
            const cx = x + i * (canWidth + p*5);
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
        g.fillRect(x + p*3, floorY - canHeight - p*8, p*10, p*5);
        g.fillRect(x + canWidth + p*8, floorY - canHeight - p*5, p*8, p*4);
        g.fillStyle(0xe0d8c8);
        g.fillRect(x + p*5, floorY - canHeight - p*6, p*6, p*3);
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

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawBackyardRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera
        const skyHeight = floorY;

        // === NIGHT SKY ===
        g.fillStyle(COLORS.SKY_DARK);
        g.fillRect(0, 0, worldWidth, skyHeight * 0.4);
        g.fillStyle(COLORS.SKY_MID);
        g.fillRect(0, skyHeight * 0.4, worldWidth, skyHeight * 0.4);
        g.fillStyle(COLORS.SKY_HORIZON);
        g.fillRect(0, skyHeight * 0.8, worldWidth, skyHeight * 0.2);

        // Stars
        drawStars(g, worldWidth, skyHeight);

        // Moon
        drawMoon(g, 200, height * 0.08);

        // === FENCE (spans full width, behind everything) ===
        const fenceHeight = p * 85;
        drawFence(g, 0, floorY, worldWidth, fenceHeight);

        // === STRING LIGHTS (above fence) ===
        drawStringLights(g, 50, floorY - fenceHeight - p*15, worldWidth - 100);

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

        // Window on house
        drawWindow(g, p*120, height * 0.28, p*50, p*40);

        // Clock HIGH on wall
        drawClock(g, p*220, height * 0.15);

        // === BULKHEAD (attached to end of house) ===
        drawBulkhead(g, houseWidth + p*40, floorY);

        // === YARD ITEMS (middle section) ===
        drawClothesline(g, p*350, p*420, height * 0.38, floorY);
        drawDoghouse(g, p*500, floorY);
        drawGarden(g, p*550, floorY, p*90);
        drawGnome(g, p*680, floorY);
        drawTelescope(g, p*780, floorY);
        drawTrashCans(g, p*880, floorY);

        // === SHED (perpendicular, mostly off-screen right) ===
        drawShedPerpendicular(g, worldWidth - p*80, floorY, height);
    }

})();
