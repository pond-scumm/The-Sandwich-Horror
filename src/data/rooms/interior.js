// ============================================================================
// INTERIOR - Hector's Foyer/Living Room
// ============================================================================
// The main hub of the house. First room the player explores after entering.
// Connects to: laboratory (right), front_of_house (left - via front door later)
//
// Structure: Room data first (for easy editing), drawing code below.
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.interior = {
        id: 'interior',
        name: "Hector's Foyer",

        worldWidth: 2560,
        screenWidth: 1280,
        walkableArea: {
            polygon: [
                { x: 0, y: 0.736 },
                { x: 426, y: 0.729 },
                { x: 503, y: 0.747 },
                { x: 614, y: 0.744 },
                { x: 802, y: 0.740 },
                { x: 1033, y: 0.740 },
                { x: 1311, y: 0.739 },
                { x: 1584, y: 0.744 },
                { x: 1636, y: 0.764 },
                { x: 1808, y: 0.749 },
                { x: 1835, y: 0.733 },
                { x: 2040, y: 0.738 },
                { x: 2076, y: 0.747 },
                { x: 2130, y: 0.747 },
                { x: 2178, y: 0.735 },
                { x: 2467, y: 0.731 },
                { x: 2544, y: 0.726 },
                { x: 2542, y: 0.985 },
                { x: 1862, y: 0.985 },
                { x: 1234, y: 0.969 },
                { x: 612, y: 0.974 },
                { x: 18, y: 0.974 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0x9a8878,
            ambientMobile: 0xb8a090,
            sources: [
                { id: 'moon_left', x: 380, y: 0.50, radius: 350, color: 0xaabbdd, intensity: 0.8 },
                { id: 'moon_right', x: 1920, y: 0.50, radius: 320, color: 0xaabbdd, intensity: 0.7 },
                { id: 'fireplace', x: 900, y: 0.60, radius: 450, type: 'fireplace', intensity: 2.0 },
                { id: 'fireplace2', x: 900, y: 0.72, radius: 300, color: 0xffaa66, intensity: 1.5 },
                { id: 'stairway_light', x: 1400, y: 0.40, radius: 200, color: 0xffcc88, intensity: 0.6 },
                { id: 'lab_glow', x: 2400, y: 0.60, radius: 350, color: 0xaaffaa, intensity: 1.0 },
                { id: 'desk_lamp', x: 1750, y: 0.45, radius: 200, type: 'lamp', intensity: 0.8 }
            ]
        },

        audio: {
            music: {
                key: 'interior_theme',
                volume: 0.6,
                fade: 1000
            },
            continueFrom: ['laboratory', 'second_floor', 'backyard']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawInteriorRoom
            }
        ],

        spawns: {
            default: { x: 250, y: 0.82 },
            from_lab: { x: 2200, y: 0.82 },
            from_laboratory: { x: 2200, y: 0.82 },
            from_outside: { x: 250, y: 0.82 },
            from_front_of_house: { x: 250, y: 0.82 },
            from_backyard: { x: 2338, y: 0.869 },
            from_attic: { x: 1280, y: 0.82 },
            from_alien_room: { x: 1280, y: 0.82 },
            from_second_floor: { x: 1450, y: 0.82 }
        },

        exits: [
            {
                edge: 'right',
                x: 2520,
                width: 80,
                target: 'backyard',
                spawnPoint: 'from_interior'
            }
        ],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === BACK ROW (behind furniture) ===
            {
                id: 'front_door',
                x: 169, y: 0.476, w: 146, h: 0.474,
                interactX: 220, interactY: 0.82,
                name: 'Front Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Solid oak! They don't make 'em like this anymore.",
                    action: "Nope. Didn't hike through those creepy woods just to chicken out now."
                }
            },
            {
                id: 'window_left',
                x: 402, y: 0.39, w: 185, h: 0.458,
                interactX: 402, interactY: 0.82,
                name: 'Window',
                verbs: { action: 'Open', look: 'Look through' },
                responses: {
                    look: "Wow, look at that moon! The garden's a mess though. Very... wild.",
                    action: "Painted shut. Like, really painted shut."
                }
            },
            {
                id: 'coat_rack',
                x: 38, y: 0.508, w: 61, h: 0.377,
                interactX: 80, interactY: 0.82,
                name: 'Coat Rack',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Ooh, vintage! The moths think so too, apparently.",
                    action: "Receipt from 1987: 'eggs, assorted beakers.' That's a grocery list I can respect."
                }
            },
            {
                id: 'small_table',
                x: 541, y: 0.678, w: 72, h: 0.097,
                interactX: 541, interactY: 0.82,
                name: 'Small Table',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "That's not a table, that's a mail fort. Years of 'Science Monthly'! Jealous.",
                    action: "All addressed to 'Dr. H. Manzana.' Someone's popular with the post office."
                }
            },
            {
                id: 'grandfather_clock',
                x: 670, y: 0.483, w: 77, h: 0.464,
                interactX: 650, interactY: 0.82,
                name: 'Grandfather Clock',
                verbs: { action: 'Check time', look: 'Examine' },
                responses: {
                    look: "What a beauty! The second hand's doing something funky though. Tick-tick... tick.",
                    action: "Almost midnight. Spooky! I love it."
                }
            },
            {
                id: 'fireplace',
                x: 895, y: 0.563, w: 186, h: 0.303,
                interactX: 895, interactY: 0.82,
                name: 'Fireplace',
                verbs: { action: 'Warm hands', look: 'Examine' },
                responses: {
                    look: "Now THAT'S a fireplace. Mantle's got all sorts of stuff on it.",
                    action: "Ohhh yes. Toasty. My fingers were basically icicles."
                }
            },
            {
                id: 'mantle_photos',
                x: 862, y: 0.36, w: 101, h: 0.05,
                interactX: 862, interactY: 0.82,
                name: 'Mantle Photos',
                verbs: { action: 'Pick up', look: 'Examine' },
                responses: {
                    look: "Old photos! Awards, colleagues... the guy smiled more back then. Wonder what happened.",
                    action: "Better not. Those aren't mine."
                }
            },
            {
                id: 'candle',
                x: 960, y: 0.344, w: 17, h: 0.076,
                interactX: 960, interactY: 0.82,
                name: 'Candle',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "Ooh, fancy brass candlestick! Very atmospheric.",
                    action: "Nah, that'd be rude. Can't just steal a guy's ambiance."
                }
            },
            {
                id: 'matches',
                x: 991, y: 0.377, w: 20, h: 0.022,
                interactX: 960, interactY: 0.82,
                name: 'Matches',
                verbs: { action: 'Take', look: 'Examine' },
                giveItem: 'matches',
                removeAfterPickup: true,
                responses: {
                    look: "A little box of matches. Could come in handy!",
                    action: "I'll take these. You never know when you need fire."
                }
            },
            {
                id: 'bookshelf',
                x: 1173, y: 0.473, w: 177, h: 0.454,
                interactX: 1100, interactY: 0.82,
                name: 'Bookshelf',
                verbs: { action: 'Search', look: 'Browse' },
                responses: {
                    look: "Floor to ceiling! Science, philosophy, everything. This is my kind of chaos.",
                    action: "'Interdimensional Postal Services'?! I need to work here."
                }
            },
            {
                id: 'stairway_door',
                x: 1410, y: 0.476, w: 146, h: 0.474,
                interactX: 1450, interactY: 0.82,
                name: 'Stairway',
                verbs: { action: 'Go up', look: 'Examine' },
                responses: {
                    look: "A stairway leading up to the second floor. I can hear the floorboards creaking up there."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'second_floor',
                    spawnPoint: 'from_interior'
                }
            },
            {
                id: 'window_right',
                x: 1926, y: 0.394, w: 174, h: 0.46,
                interactX: 1926, interactY: 0.82,
                name: 'Right Window',
                verbs: { action: 'Open', look: 'Look through' },
                responses: {
                    look: "I can see the town from here! Little twinkling lights. Cute.",
                    action: "Also painted shut. This guy really hates fresh air, huh."
                }
            },
            {
                id: 'desk',
                x: 1716, y: 0.659, w: 163, h: 0.145,
                interactX: 1716, interactY: 0.82,
                name: 'Desk',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Whoa. Papers, blueprints, weird gizmos everywhere. This is a WORKING desk.",
                    action: "Calculations I don't understand, diagrams I don't understand... I love it."
                }
            },
            {
                id: 'blueprints',
                x: 1701, y: 0.362, w: 109, h: 0.104,
                interactX: 1701, interactY: 0.82,
                name: 'Blueprints',
                verbs: { action: 'Take', look: 'Study' },
                responses: {
                    look: "Portal Mark VII? What happened to marks one through six?",
                    action: "Can't just take someone's portal blueprints. That's Portal Theft."
                }
            },
            {
                id: 'strange_device',
                x: 2109, y: 0.614, w: 46, h: 0.199,
                interactX: 2109, interactY: 0.82,
                name: 'Strange Device',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "Brass, glass, glowing, humming... I have no idea what this is but I want one.",
                    action: "So tempting. But I should probably not get vaporized before my interview."
                }
            },
            {
                id: 'laboratory_door',
                x: 2352, y: 0.477, w: 143, h: 0.466,
                interactX: 2352, interactY: 0.82,
                name: 'Laboratory Door',
                verbs: { action: 'Enter', look: 'Examine' },
                responses: {
                    look: "Green light, electrical hum... this is it! The lab!"
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'laboratory',
                    spawnPoint: 'from_interior'
                }
            },

            // === FRONT ROW (in front of back row) ===
            {
                id: 'left_armchair',
                polygon: [
                    { x: 644, y: 0.588 },
                    { x: 669, y: 0.588 },
                    { x: 674, y: 0.732 },
                    { x: 749, y: 0.739 },
                    { x: 750, y: 0.792 },
                    { x: 641, y: 0.793 }
                ],
                highlightX: 679, highlightY: 0.757,
                interactX: 695, interactY: 0.88,
                name: 'Left Armchair',
                verbs: { action: 'Sit in', look: 'Examine' },
                responses: {
                    look: "Ooh, fancy! Burgundy leather, faces the fire. Prime napping real estate.",
                    action: "Oh wow. OH wow. This is comfortable. I could live here."
                }
            },
            {
                id: 'right_armchair',
                polygon: [
                    { x: 1164, y: 0.589 },
                    { x: 1186, y: 0.565 },
                    { x: 1190, y: 0.794 },
                    { x: 1080, y: 0.792 },
                    { x: 1085, y: 0.735 },
                    { x: 1159, y: 0.733 }
                ],
                highlightX: 1149, highlightY: 0.761,
                interactX: 1135, interactY: 0.88,
                name: 'Right Armchair',
                verbs: { action: 'Sit in', look: 'Examine' },
                responses: {
                    look: "The matching chair! Two seats, facing the fire. Perfect for brainstorming. Or arguing.",
                    action: "Also very comfortable. Hard to pick a favorite."
                }
            },
            {
                id: 'coffee_table',
                x: 910, y: 0.766, w: 177, h: 0.068,
                interactX: 907, interactY: 0.88,
                name: 'Coffee Table',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "'Quantum Tunneling for Beginners,' 'Dimensional Theory,' and... 'TV Guide.' A well-rounded reader.",
                    action: "Way over my head. But give me a few months!"
                }
            }
        ],

        // =====================================================================
        // PICKUP OVERLAYS
        // =====================================================================

        pickupOverlays: [
            {
                hotspotId: 'matches',
                itemId: 'matches',
                x: 984,
                y: 0.365,
                depth: 55,
                draw: (g, x, y) => {
                    const p = 4;
                    g.fillStyle(0x8B4513);
                    g.fillRect(x, y, p*5, p*3);
                    g.fillStyle(0xA0522D);
                    g.fillRect(x, y, p*5, p);
                    g.fillStyle(0x654321);
                    g.fillRect(x + p*4, y, p, p*3);
                    g.fillStyle(0x8B0000);
                    g.fillRect(x, y + p, p*4, p);
                }
            }
        ],

        // =====================================================================
        // ITEM INTERACTIONS
        // =====================================================================

        itemInteractions: {
            fireplace: {
                default: "I'm not throwing my {item} into the fire. That seems wasteful."
            },
            strange_device: {
                default: "I wave my {item} near the device. It hums appreciatively but nothing happens."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

        firstVisit: {
            delay: 800,
            dialogue: "Hello? Is anyone home?"
        },

        features: {
            fireplace: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        WALL_DARK: 0x1a1520,
        WALL_MID: 0x2a2535,
        WALL_LIGHT: 0x3a3545,
        WALL_HIGHLIGHT: 0x4a4555,
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,
        WOOD_HIGHLIGHT: 0x8a6840,
        FLOOR_DARK: 0x1a1512,
        FLOOR_MID: 0x2a2520,
        FLOOR_LIGHT: 0x3a352a,
        MOON_DARK: 0x2a3545,
        MOON_MID: 0x4a5565,
        MOON_LIGHT: 0x6a7585,
        MOON_BRIGHT: 0x8a95a5,
        FIRE_DARK: 0x4a2010,
        FIRE_MID: 0x8a4020,
        FIRE_LIGHT: 0xca6030,
        FIRE_BRIGHT: 0xffa050,
        LAB_DARK: 0x1a3a2a,
        LAB_MID: 0x2a5a3a,
        LAB_LIGHT: 0x4a8a5a,
        RUG_DARK: 0x3a1515,
        RUG_MID: 0x5a2525,
        RUG_PATTERN: 0x6a3030,
        GOLD: 0x8a7530,
        BRASS: 0x9a8540
    };

    function drawDoor(g, x, y, floorY, isLabDoor) {
        const p = 4;
        const doorHeight = floorY - y;
        const doorWidth = p * 35;
        const frameWidth = p * 3;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, doorHeight + p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - frameWidth, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x + doorWidth + p, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, p*2);

        g.fillStyle(isLabDoor ? COLORS.WOOD_MID : COLORS.WOOD_DARK);
        g.fillRect(x, y, doorWidth, doorHeight);

        const panelInset = p*4;
        const panelWidth = p*12;
        const panelGap = p*3;
        const topPanelHeight = p*20;
        const bottomPanelHeight = p*25;
        const topPanelY = y + p*5;
        const bottomPanelY = y + p*30;

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + panelInset, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY, panelWidth, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, bottomPanelHeight);

        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + panelInset, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, p, bottomPanelHeight);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + panelInset, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, bottomPanelY, p, bottomPanelHeight);

        const handleY = bottomPanelY + bottomPanelHeight + p*6;
        const handleX = x + doorWidth - p*10;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(handleX - p*2, handleY - p*5, p*6, p*14);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(handleX - p, handleY - p*4, p*4, p);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(handleX - p, handleY, p*4, p*4);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(handleX, handleY + p, p*2, p*2);
        g.fillStyle(0x1a1a1a);
        g.fillRect(handleX, handleY + p*6, p*2, p*2);
        g.fillRect(handleX + p/2, handleY + p*7, p, p*2);

        if (isLabDoor) {
            g.fillStyle(COLORS.LAB_MID);
            g.fillRect(x + doorWidth - p, y + p*2, p*4, doorHeight - p*4);
            g.fillStyle(COLORS.LAB_LIGHT);
            g.fillRect(x + doorWidth, y + p*4, p*2, doorHeight - p*8);
        }
    }

    function drawWindow(g, x, y, w, h, lightType) {
        const p = 4;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*3, y - p*3, w + p*6, h + p*6);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p*4, y - p*2, p*2, h + p*4);
        g.fillRect(x - p, y - p, w + p*2, h + p*2);

        g.fillStyle(0x0a0a18);
        g.fillRect(x, y, w, h);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + w/2 - p, y, p*2, h);
        g.fillRect(x, y + h/2 - p, w, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + w/2 - p, y + p, p, h - p*2);
        g.fillRect(x + p, y + h/2 - p, w - p*2, p);

        if (lightType === 'moon') {
            g.fillStyle(0xffffff);
            g.fillRect(x + p*4, y + p*4, p, p);
            g.fillRect(x + w - p*8, y + p*6, p, p);
            g.fillRect(x + p*6, y + h - p*12, p, p);
            g.fillRect(x + w - p*6, y + h/2 + p*2, p, p);

            const moonX = x + w - p*10;
            const moonY = y + p*5;
            g.fillStyle(0xd8d8e8);
            g.fillRect(moonX, moonY, p*5, p*5);
            g.fillStyle(0xe8e8f8);
            g.fillRect(moonX + p, moonY + p, p*3, p*3);
            g.fillStyle(0xf8f8ff);
            g.fillRect(moonX + p, moonY + p, p*2, p*2);
        }

        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x - p*6, y - p*4, p*6, h + p*8);
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x - p*5, y - p*3, p*2, h + p*6);
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x - p*4, y - p*2, p, h + p*4);

        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x + w, y - p*4, p*6, h + p*8);
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x + w + p*3, y - p*3, p*2, h + p*6);
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x + w + p*3, y - p*2, p, h + p*4);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*8, y - p*6, w + p*16, p*2);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x - p*10, y - p*7, p*3, p*4);
        g.fillRect(x + w + p*7, y - p*7, p*3, p*4);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*4, y + h + p*2, w + p*8, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p*3, y + h + p*2, w + p*6, p*2);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*5, y + h + p*2, p*2, p*3);
    }

    function drawCoatRack(g, x, floorY) {
        const p = 4;
        const rackHeight = 300;
        const rackY = floorY + 15;
        const rackTop = rackY - rackHeight;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*4, rackY - p*3, p*4, p*3);
        g.fillRect(x - p*2, rackY - p*2, p*5, p*2);
        g.fillRect(x + p*9, rackY - p*2, p*5, p*2);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, rackY - p*4, p*2, p*2);
        g.fillRect(x + p*8, rackY - p*4, p*2, p*2);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*4, rackTop, p*4, rackHeight - p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*4, rackTop, p, rackHeight - p*4);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*3, rackTop - p*2, p*6, p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*4, rackTop - p, p*4, p);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*2, rackTop + p*8, p*6, p*2);
        g.fillRect(x - p*3, rackTop + p*9, p*2, p*3);
        g.fillRect(x + p*8, rackTop + p*8, p*6, p*2);
        g.fillRect(x + p*13, rackTop + p*9, p*2, p*3);
        g.fillRect(x - p*2, rackTop + p*20, p*6, p*2);
        g.fillRect(x - p*3, rackTop + p*21, p*2, p*3);
        g.fillRect(x + p*8, rackTop + p*20, p*6, p*2);
        g.fillRect(x + p*13, rackTop + p*21, p*2, p*3);
        g.fillRect(x, rackTop + p*35, p*4, p*2);
        g.fillRect(x - p, rackTop + p*36, p*2, p*2);
        g.fillRect(x + p*8, rackTop + p*35, p*4, p*2);
        g.fillRect(x + p*11, rackTop + p*36, p*2, p*2);

        g.fillStyle(0x2a2a2a);
        g.fillRect(x - p*6, rackTop + p*12, p*10, p*28);
        g.fillStyle(0x222222);
        for (let py = rackTop + p*14; py < rackTop + p*38; py += p*4) {
            g.fillRect(x - p*5, py, p*2, p);
        }
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p*4, rackTop + p*11, p*6, p*3);

        g.fillStyle(0x4a4540);
        g.fillRect(x + p*8, rackTop + p*12, p*9, p*24);
        for (let py = rackTop + p*14; py < rackTop + p*34; py += p*3) {
            for (let px = x + p*9; px < x + p*16; px += p*3) {
                if ((px + py) % (p*6) < p*2) {
                    g.fillStyle(0x5a5550);
                    g.fillRect(px, py, p, p);
                }
            }
        }

        g.fillStyle(0x3a3535);
        g.fillRect(x + p*9, rackTop + p*6, p*8, p*4);
        g.fillRect(x + p*11, rackTop + p*3, p*4, p*4);
    }

    function drawSmallTable(g, x, floorY) {
        const p = 4;
        const tableWidth = 80;
        const tableHeight = 28;
        const tableDepth = 20;
        const legHeight = 56;
        const tableTop = floorY - legHeight - tableHeight;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - tableDepth, tableTop, tableDepth, tableHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - tableDepth + p, tableTop + p, tableDepth - p*2, p*2);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop + tableHeight, p*3, legHeight);
        g.fillRect(x + tableWidth - p*3, tableTop + tableHeight, p*3, legHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - tableDepth + p, tableTop + tableHeight, p*3, legHeight);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop, tableWidth, tableHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p, tableTop + p, tableWidth - p*2, tableHeight - p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*2, tableTop + p*2, tableWidth - p*4, p);

        const mailColors = [0xd8d0c0, 0xc8c0b0, 0xe0d8c8, 0xd0c8b8];
        for (let i = 0; i < 5; i++) {
            g.fillStyle(mailColors[i % mailColors.length]);
            g.fillRect(x + p*2 + (i % 2) * p, tableTop - p*2 - i * p, p*10, p*2);
        }
        g.fillStyle(0xe8e0d0);
        g.fillRect(x + p*3, tableTop - p*4, p*8, p);

        const potX = x + tableWidth - p*8;
        g.fillStyle(0x6a4030);
        g.fillRect(potX, tableTop - p*6, p*6, p*6);
        g.fillStyle(0x5a3525);
        g.fillRect(potX + p, tableTop - p*5, p*4, p*4);
        g.fillStyle(0x7a5040);
        g.fillRect(potX - p/2, tableTop - p*6, p*7, p);
        g.fillStyle(0x4a3a20);
        g.fillRect(potX + p, tableTop - p*10, p, p*5);
        g.fillRect(potX + p*3, tableTop - p*12, p, p*7);
        g.fillRect(potX + p*4, tableTop - p*9, p, p*4);
        g.fillStyle(0x5a4a25);
        g.fillRect(potX + p*3, tableTop - p*12, p*3, p);
        g.fillRect(potX, tableTop - p*10, p*2, p);
    }

    function drawGrandfatherClock(g, x, floorY) {
        const p = 4;
        const clockTop = floorY - 360;
        const clockWidth = 80;
        const clockDepth = 24;
        const clockY = floorY + 20;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth, clockTop + p*2, clockDepth, 360 - p*4);
        for (let py = clockTop + p*4; py < clockY - p*4; py += p*6) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - clockDepth + p, py, clockDepth - p*2, p);
        }

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, clockTop, clockWidth, 360);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p, clockTop + p, clockWidth - p*2, 360 - p*2);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*2, clockTop - p*3, clockWidth + p*4, p*4);
        g.fillRect(x + p*4, clockTop - p*5, clockWidth - p*8, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p, clockTop - p*2, clockWidth + p*2, p*2);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth - p*2, clockTop - p*3, clockDepth, p*4);

        const faceTop = clockTop + p*4;
        const faceHeight = p*24;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*2, faceTop, clockWidth - p*4, faceHeight);

        const faceInset = p*3;
        g.fillStyle(0xd8d0b8);
        g.fillRect(x + faceInset, faceTop + p*2, clockWidth - faceInset*2, faceHeight - p*4);

        const centerX = x + clockWidth/2;
        const centerY = faceTop + faceHeight/2;
        const radius = p*6;
        g.fillStyle(0xc8c0a8);
        g.fillRect(centerX - radius, centerY - radius, radius*2, radius*2);
        g.fillStyle(0xd8d0b8);
        g.fillRect(centerX - radius + p, centerY - radius + p, radius*2 - p*2, radius*2 - p*2);

        g.fillStyle(0x1a1a1a);
        g.fillRect(centerX - p/2, centerY - p*4, p, p*4);
        g.fillRect(centerX, centerY - p/2, p*5, p);

        g.fillStyle(0x2a2a2a);
        g.fillRect(centerX - p/2, faceTop + p*3, p, p*2);
        g.fillRect(centerX - p/2, faceTop + faceHeight - p*5, p, p*2);
        g.fillRect(x + faceInset + p, centerY - p/2, p*2, p);
        g.fillRect(x + clockWidth - faceInset - p*3, centerY - p/2, p*2, p);

        const windowTop = faceTop + faceHeight + p*3;
        const windowHeight = p*20;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*4, windowTop, clockWidth - p*8, windowHeight);
        g.fillStyle(0x1a1520);
        g.fillRect(x + p*5, windowTop + p, clockWidth - p*10, windowHeight - p*2);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(centerX - p/2, windowTop + p*2, p, p*12);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(centerX - p*3, windowTop + p*13, p*6, p*5);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(centerX - p*2, windowTop + p*14, p*4, p*3);

        const baseTop = windowTop + windowHeight + p*3;
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, baseTop, clockWidth - p*4, clockY - baseTop - p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, baseTop + p, clockWidth - p*6, p);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*3, baseTop + p*8, clockWidth - p*6, p);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p, clockY - p*3, clockWidth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x, clockY - p*2, clockWidth, p);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth - p, clockY - p*3, clockDepth, p*3);
    }

    function drawArmchair(g, x, floorY, facingRight) {
        const CHAIR_DARK = 0x4a1a1a;
        const CHAIR_MID = 0x6a2525;
        const CHAIR_LIGHT = 0x8a3535;
        const CHAIR_HIGHLIGHT = 0x9a4040;

        const chairHeight = 200;
        const seatDepth = 80;
        const seatHeight = 50;
        const backWidth = 32;
        const legSize = 12;
        const p = 4;

        const chairY = floorY;
        const backTop = chairY - chairHeight;
        const seatTop = chairY - seatHeight - 40;

        if (facingRight) {
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(x, chairY - 36, legSize, 36);
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x + seatDepth + backWidth - legSize, chairY - 40, legSize, 40);

            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, backTop, backWidth, chairHeight - 40);
            g.fillStyle(CHAIR_MID);
            g.fillRect(x + p, backTop + p*2, backWidth - p*2, chairHeight - 56);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + p*2, backTop + p*3, p*2, chairHeight - 68);
            for (let py = backTop + p*5; py < seatTop - p*2; py += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(x + p*2, py, p*3, p);
            }

            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop + 28, seatDepth + backWidth, 16);
            g.fillStyle(CHAIR_MID);
            g.fillRect(x + backWidth - p, seatTop, seatDepth + p, 32);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + backWidth, seatTop + p, seatDepth - p*2, p*2);
            for (let px = x + backWidth + p*2; px < x + backWidth + seatDepth - p*2; px += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(px, seatTop + p*3, p*2, p);
            }

            g.fillStyle(CHAIR_DARK);
            g.fillRect(x - p*2, seatTop - p*3, backWidth + p*4, p*4);
            g.fillStyle(CHAIR_MID);
            g.fillRect(x - p, seatTop - p*2, backWidth + p*2, p*2);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x, seatTop - p*2 + 2, backWidth, p);
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x + backWidth + seatDepth - p*3, seatTop, p*3, 32);
        } else {
            const chairRight = x + seatDepth + backWidth;

            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(chairRight - legSize, chairY - 36, legSize, 36);
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x, chairY - 40, legSize, 40);

            g.fillStyle(CHAIR_DARK);
            g.fillRect(chairRight - backWidth, backTop, backWidth, chairHeight - 40);
            g.fillStyle(CHAIR_MID);
            g.fillRect(chairRight - backWidth + p, backTop + p*2, backWidth - p*2, chairHeight - 56);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(chairRight - p*4, backTop + p*3, p*2, chairHeight - 68);
            for (let py = backTop + p*5; py < seatTop - p*2; py += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(chairRight - backWidth + p*2, py, p*3, p);
            }

            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop + 28, seatDepth + backWidth, 16);
            g.fillStyle(CHAIR_MID);
            g.fillRect(x, seatTop, seatDepth + p, 32);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + p*2, seatTop + p, seatDepth - p*2, p*2);
            for (let px = x + p*2; px < x + seatDepth - p*2; px += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(px, seatTop + p*3, p*2, p);
            }

            g.fillStyle(CHAIR_DARK);
            g.fillRect(chairRight - backWidth - p*2, seatTop - p*3, backWidth + p*4, p*4);
            g.fillStyle(CHAIR_MID);
            g.fillRect(chairRight - backWidth - p, seatTop - p*2, backWidth + p*2, p*2);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(chairRight - backWidth, seatTop - p*2 + 2, backWidth, p);
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop, p*3, 32);
        }
    }

    function drawFire(g, x, y, w, h) {
        g.fillStyle(0x2a1508);
        g.fillRect(x - 5, y - 8, w + 10, 15);
        g.fillStyle(0x1a0a04);
        g.fillRect(x, y - 5, 25, 10);
        g.fillRect(x + 35, y - 6, 30, 12);

        g.fillStyle(COLORS.FIRE_DARK);
        g.fillRect(x + 5, y - 4, 15, 6);
        g.fillRect(x + 40, y - 5, 20, 8);

        g.fillStyle(COLORS.FIRE_MID);
        g.beginPath();
        g.moveTo(x + 10, y - 5);
        g.lineTo(x + 25, y - h + 10);
        g.lineTo(x + 40, y - 5);
        g.closePath();
        g.fill();

        g.beginPath();
        g.moveTo(x + 30, y - 5);
        g.lineTo(x + 50, y - h + 5);
        g.lineTo(x + 70, y - 5);
        g.closePath();
        g.fill();

        g.fillStyle(COLORS.FIRE_LIGHT);
        g.beginPath();
        g.moveTo(x + 15, y - 5);
        g.lineTo(x + 27, y - h + 25);
        g.lineTo(x + 38, y - 5);
        g.closePath();
        g.fill();

        g.beginPath();
        g.moveTo(x + 38, y - 5);
        g.lineTo(x + 52, y - h + 20);
        g.lineTo(x + 65, y - 5);
        g.closePath();
        g.fill();

        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.beginPath();
        g.moveTo(x + 20, y - 5);
        g.lineTo(x + 28, y - h + 40);
        g.lineTo(x + 35, y - 5);
        g.closePath();
        g.fill();

        g.beginPath();
        g.moveTo(x + 45, y - 5);
        g.lineTo(x + 53, y - h + 35);
        g.lineTo(x + 60, y - 5);
        g.closePath();
        g.fill();
    }

    function drawFireplace(g, x, floorY) {
        const p = 4;
        const fireplaceHeight = 220;
        const mantleY = floorY - fireplaceHeight;

        const stoneW = p*6;
        const stoneH = p*4;
        const stoneGap = p;
        const stoneUnit = stoneW + stoneGap;
        const numColumns = 7;
        const fireplaceWidth = numColumns * stoneUnit;

        const fireboxX = x + stoneUnit;
        const fireboxWidth = stoneUnit * 5 - stoneGap;
        const fireboxTop = mantleY + p*12;
        const fireboxHeight = fireplaceHeight - p*16;

        g.fillStyle(0x4a4540);
        g.fillRect(x, mantleY, fireplaceWidth - stoneGap, fireplaceHeight);

        g.fillStyle(0x0a0505);
        g.fillRect(fireboxX, fireboxTop, fireboxWidth, fireboxHeight);
        g.fillStyle(0x050202);
        g.fillRect(fireboxX + p*2, fireboxTop + p*2, fireboxWidth - p*4, fireboxHeight - p*4);

        for (let py = mantleY + p*2; py < floorY - p*2; py += stoneH + stoneGap) {
            g.fillStyle(0x5a5550);
            g.fillRect(x + p, py, stoneW, stoneH);
            g.fillStyle(0x6a6560);
            g.fillRect(x + p + p, py + p, stoneW - p*2, p);
            g.fillStyle(0x3a3530);
            g.fillRect(x + p + p, py + stoneH - p, stoneW - p*2, p);
        }

        const rightColX = x + stoneUnit * 6;
        for (let py = mantleY + p*2; py < floorY - p*2; py += stoneH + stoneGap) {
            g.fillStyle(0x5a5550);
            g.fillRect(rightColX, py, stoneW, stoneH);
            g.fillStyle(0x6a6560);
            g.fillRect(rightColX + p, py + p, stoneW - p*2, p);
            g.fillStyle(0x3a3530);
            g.fillRect(rightColX + p, py + stoneH - p, stoneW - p*2, p);
        }

        for (let py = mantleY + p*2; py < fireboxTop - stoneGap; py += stoneH + stoneGap) {
            for (let col = 1; col < 6; col++) {
                const px = x + col * stoneUnit;
                g.fillStyle(0x5a5550);
                g.fillRect(px, py, stoneW, stoneH);
                g.fillStyle(0x6a6560);
                g.fillRect(px + p, py + p, stoneW - p*2, p);
                g.fillStyle(0x3a3530);
                g.fillRect(px + p, py + stoneH - p, stoneW - p*2, p);
            }
        }

        const mantleThickness = p*5;
        const mantleOverhang = p*4;
        const mantleWidth = fireplaceWidth - stoneGap + mantleOverhang * 2;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - mantleOverhang, mantleY - mantleThickness, mantleWidth, mantleThickness);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - mantleOverhang, mantleY - mantleThickness, mantleWidth, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - mantleOverhang + p, mantleY - mantleThickness + p, mantleWidth - p*2, p);

        const itemBaseY = mantleY - mantleThickness;
        const mantelCenterX = x + (fireplaceWidth - stoneGap) / 2;

        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, itemBaseY - p*10, p*8, p*10);
        g.fillStyle(0x2a2520);
        g.fillRect(x + p*3, itemBaseY - p*9, p*6, p*8);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*14, itemBaseY - p*8, p*7, p*8);
        g.fillStyle(0x2a2520);
        g.fillRect(x + p*15, itemBaseY - p*7, p*5, p*6);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(mantelCenterX - p*4, itemBaseY - p*7, p*8, p*7);
        g.fillStyle(0xd0c8b0);
        g.fillRect(mantelCenterX - p*3, itemBaseY - p*6, p*6, p*5);
        g.fillStyle(0x1a1a1a);
        g.fillRect(mantelCenterX - p/2, itemBaseY - p*5, p, p*2);
        g.fillRect(mantelCenterX, itemBaseY - p*4, p*2, p);

        const candleX = x + fireplaceWidth - stoneGap - p*12;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(candleX + p*2, itemBaseY - p*7, p*2, p*7);
        g.fillRect(candleX, itemBaseY - p*2, p*6, p*2);
        g.fillStyle(0xeae0c0);
        g.fillRect(candleX + p*2, itemBaseY - p*12, p*2, p*5);
        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.fillRect(candleX + p*2, itemBaseY - p*15, p*2, p*3);
        g.fillStyle(COLORS.FIRE_LIGHT);
        g.fillRect(candleX + p*2, itemBaseY - p*14, p, p*2);

        const fireWidth = fireboxWidth - p*8;
        const fireX = fireboxX + (fireboxWidth - fireWidth) / 2;
        drawFire(g, fireX, floorY - p*6, fireWidth, p*14);

        g.fillStyle(0x1a1a1a);
        const grateWidth = fireboxWidth - p*6;
        const grateX = fireboxX + p*3;
        const numBars = 5;
        const barSpacing = grateWidth / (numBars - 1);
        for (let i = 0; i < numBars; i++) {
            g.fillRect(grateX + i * barSpacing - p/2, floorY - p*3, p, p*3);
        }
        g.fillRect(grateX - p, floorY - p*2, grateWidth + p*2, p);
    }

    function drawCoffeeTable(g, x, floorY) {
        const tableY = floorY - 5;
        const tableTop = tableY - 50;
        const tableWidth = 180;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + 12, tableTop + 8, 10, 40);
        g.fillRect(x + tableWidth - 22, tableTop + 8, 10, 40);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + 8, tableTop + 12, 12, 43);
        g.fillRect(x + tableWidth - 20, tableTop + 12, 12, 43);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop - 5, tableWidth, 18);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + 3, tableTop - 3, tableWidth - 6, 12);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + 8, tableTop - 1, tableWidth - 16, 4);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop + 10, tableWidth, 4);

        g.fillStyle(0x8a4030);
        g.fillRect(x + 20, tableTop - 20, 45, 12);
        g.fillStyle(0x2a4a3a);
        g.fillRect(x + 24, tableTop - 30, 40, 10);
        g.fillStyle(0x3a3a5a);
        g.fillRect(x + 28, tableTop - 38, 35, 8);

        g.fillStyle(0xd0c8b0);
        g.fillRect(x + 70, tableTop - 14, 50, 10);
        g.fillStyle(0xe0d8c0);
        g.fillRect(x + 72, tableTop - 12, 22, 7);
        g.fillRect(x + 96, tableTop - 12, 22, 7);
        g.fillStyle(0x2a2a3a);
        for (let i = 0; i < 4; i++) {
            g.fillRect(x + 74, tableTop - 10 + i * 2, 18, 1);
            g.fillRect(x + 98, tableTop - 10 + i * 2, 18, 1);
        }

        g.fillStyle(0x6a6560);
        g.fillRect(x + 135, tableTop - 24, 22, 20);
        g.fillStyle(0x3a2010);
        g.fillRect(x + 138, tableTop - 22, 16, 10);
        g.fillStyle(0x6a6560);
        g.fillRect(x + 155, tableTop - 20, 7, 4);
        g.fillRect(x + 159, tableTop - 20, 4, 14);
        g.fillRect(x + 155, tableTop - 10, 7, 4);

        g.fillStyle(0x5a5a5a);
        g.fillRect(x + 130, tableTop - 10, 18, 6);
        g.fillStyle(0x4a4a4a);
        g.fillRect(x + 132, tableTop - 9, 14, 4);
    }

    function drawBooksOnShelf(g, x, y, w, h) {
        const p = 4;
        const bookColors = [0x8a3030, 0x2a5a3a, 0x3a3a6a, 0x6a5a2a, 0x5a2a4a, 0x2a4a5a, 0x6a3a2a, 0x3a5a5a];

        let currentX = x;
        let colorIndex = Math.floor(y / 10) % bookColors.length;

        while (currentX < x + w - p*3) {
            const bookWidth = p * (2 + Math.floor((currentX * 7) % 3));
            const bookHeight = h - p * (Math.floor((currentX * 3) % 3));
            const bookColor = bookColors[colorIndex % bookColors.length];

            g.fillStyle(bookColor);
            g.fillRect(currentX, y + (h - bookHeight), bookWidth, bookHeight);

            const highlight = bookColor + 0x202020;
            g.fillStyle(highlight > 0xffffff ? 0xffffff : highlight);
            g.fillRect(currentX, y + (h - bookHeight) + p, p, bookHeight - p*2);

            const shadow = bookColor - 0x151515;
            g.fillStyle(shadow < 0 ? 0x000000 : shadow);
            g.fillRect(currentX + bookWidth - p, y + (h - bookHeight) + p, p, bookHeight - p*2);

            if ((currentX * 13) % 17 < 3 && currentX < x + w - p*12) {
                g.fillStyle(bookColors[(colorIndex + 3) % bookColors.length]);
                g.fillRect(currentX, y + (h - bookHeight) - p*2, p*8, p*2);
            }

            currentX += bookWidth + p;
            colorIndex++;
        }
    }

    function drawBookshelf(g, x, floorY) {
        const p = 4;
        const shelfWidth = 160;
        const shelfHeight = 340;
        const shelfTop = floorY - shelfHeight;
        const shelfDepth = 20;
        const numShelves = 5;
        const shelfSpacing = (shelfHeight - p*8) / numShelves;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - shelfDepth, shelfTop, shelfDepth, shelfHeight);
        for (let py = shelfTop + p*2; py < floorY - p*2; py += p*8) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - shelfDepth + p, py, shelfDepth - p*2, p);
        }

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, shelfTop, shelfWidth, shelfHeight);
        g.fillStyle(0x1a1510);
        g.fillRect(x + p*2, shelfTop + p*2, shelfWidth - p*4, shelfHeight - p*4);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - shelfDepth - p, shelfTop - p*2, shelfWidth + shelfDepth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - shelfDepth, shelfTop - p, shelfWidth + shelfDepth, p);

        for (let i = 0; i < numShelves; i++) {
            const shelfY = shelfTop + p*4 + i * shelfSpacing;

            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x, shelfY + shelfSpacing - p*3, shelfWidth, p*3);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(x + p, shelfY + shelfSpacing - p*3, shelfWidth - p*2, p);
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(x - shelfDepth, shelfY + shelfSpacing - p*3, shelfDepth, p*3);

            drawBooksOnShelf(g, x + p*2, shelfY, shelfWidth - p*4, shelfSpacing - p*4);
        }

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + shelfWidth - p, shelfTop, p*2, shelfHeight);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - shelfDepth - p, floorY - p*3, shelfWidth + shelfDepth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - shelfDepth, floorY - p*2, shelfWidth + shelfDepth, p);
    }

    function drawRug(g, x, y, w, h) {
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x, y, w, h);

        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + 4, y + 4, w - 8, 6);
        g.fillRect(x + 4, y + h - 10, w - 8, 6);
        g.fillRect(x + 4, y + 4, 6, h - 8);
        g.fillRect(x + w - 10, y + 4, 6, h - 8);

        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x + 14, y + 14, w - 28, 4);
        g.fillRect(x + 14, y + h - 18, w - 28, 4);
        g.fillRect(x + 14, y + 14, 4, h - 28);
        g.fillRect(x + w - 18, y + 14, 4, h - 28);

        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x + 22, y + 22, w - 44, h - 44);

        const centerX = x + w / 2;
        const centerY = y + h / 2;

        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(centerX - 30, centerY - 15, 60, 30);
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(centerX - 24, centerY - 10, 48, 20);
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(centerX - 18, centerY - 6, 36, 12);

        const cornerOffset = 50;
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x + cornerOffset - 10, y + 30, 20, 12);
        g.fillRect(x + w - cornerOffset - 10, y + 30, 20, 12);
        g.fillRect(x + cornerOffset - 10, y + h - 42, 20, 12);
        g.fillRect(x + w - cornerOffset - 10, y + h - 42, 20, 12);

        for (let py = y + 24; py < y + h - 24; py += 8) {
            for (let px = x + 24; px < x + w - 24; px += 12) {
                if ((px + py) % 32 < 4) {
                    g.fillStyle(COLORS.RUG_MID);
                    g.fillRect(px, py, 3, 2);
                }
            }
        }

        for (let py = y + 30; py < y + h - 30; py += 6) {
            for (let px = centerX - 40; px < centerX + 40; px += 10) {
                if ((px + py) % 18 < 4) {
                    g.fillStyle(COLORS.RUG_MID);
                    g.fillRect(px, py, 4, 2);
                }
            }
        }

        g.fillStyle(COLORS.RUG_PATTERN);
        for (let px = x + 8; px < x + w - 8; px += 6) {
            g.fillRect(px, y - 8, 3, 10);
            g.fillRect(px, y + h - 2, 3, 10);
        }
    }

    function drawStairwayUp(g, x, y, floorY) {
        const p = 4;
        const doorHeight = floorY - y;
        const doorWidth = p * 35;
        const frameWidth = p * 3;

        // Door frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, doorHeight + p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - frameWidth, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x + doorWidth + p, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, p*2);

        // Opening (dark, recessed)
        g.fillStyle(0x1a1520);
        g.fillRect(x, y, doorWidth, doorHeight);

        // Visible stairs going up (perspective, receding into darkness)
        const numVisibleSteps = 6;
        const stepHeight = p * 6;
        const stepDepth = p * 12;
        for (let i = 0; i < numVisibleSteps; i++) {
            const stepY = floorY - (i + 1) * stepHeight;
            const stepX = x + i * p * 2; // Steps appear to go up and left
            const stepWidth = doorWidth - i * p * 4;

            // Step riser
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(stepX, stepY, stepWidth, stepHeight);

            // Step tread (top surface)
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(stepX, stepY, stepWidth, p*2);

            // Shadow at back
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(stepX + stepWidth - p*2, stepY + p, p*2, stepHeight - p*2);
        }

        // Railing (left side, visible through doorway)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*2, y + p*10, p*3, doorHeight - p*20);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*3, y + p*12, p, doorHeight - p*24);

        // Top newel post
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p, y + p*6, p*6, p*6);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*2, y + p*4, p*4, p*3);

        // No glow rectangle - let Phaser Light2D handle the glow
    }

    function drawDesk(g, x, floorY) {
        const p = 4;
        const deskWidth = 180;
        const deskHeight = 100;
        const deskDepth = 24;
        const deskY = floorY + 15;
        const deskTop = deskY - deskHeight;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - deskDepth, deskTop, deskDepth, deskHeight);
        for (let py = deskTop + p*2; py < deskY - p*2; py += p*5) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - deskDepth + p, py, deskDepth - p*2, p);
        }

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, deskTop, deskWidth, deskHeight);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - deskDepth - p*2, deskTop - p*3, deskWidth + deskDepth + p*4, p*4);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - deskDepth - p, deskTop - p*2, deskWidth + deskDepth + p*2, p);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, deskTop + p*4, p*18, p*9);
        g.fillRect(x + p*2, deskTop + p*15, p*18, p*9);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, deskTop + p*5, p*16, p);
        g.fillRect(x + p*3, deskTop + p*16, p*16, p);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*9, deskTop + p*7, p*4, p*2);
        g.fillRect(x + p*9, deskTop + p*18, p*4, p*2);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*24, deskTop + p*4, p*18, p*20);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*25, deskTop + p*5, p*16, p);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*31, deskTop + p*12, p*4, p*3);

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p, deskY - p*3, p*3, p*3);
        g.fillRect(x + deskWidth - p*4, deskY - p*3, p*3, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - deskDepth + p, deskY - p*3, p*3, p*3);

        const surfaceY = deskTop - p*3;
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0xd8d0c0);
            g.fillRect(x + p*4 + i * p*5, surfaceY - p*2 - i * p, p*12, p*2);
        }

        g.fillStyle(0x8a4030);
        g.fillRect(x + p*20, surfaceY - p*4, p*14, p*4);
        g.fillStyle(0xd8d0c0);
        g.fillRect(x + p*21, surfaceY - p*3, p*5, p*2);
        g.fillRect(x + p*27, surfaceY - p*3, p*5, p*2);

        const lampX = x + deskWidth - p*12;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(lampX, surfaceY - p*3, p*6, p*3);
        g.fillRect(lampX + p*2, surfaceY - p*16, p*2, p*14);
        g.fillStyle(0x3a6a4a);
        g.fillRect(lampX - p*3, surfaceY - p*20, p*12, p*5);
        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.fillRect(lampX - p, surfaceY - p*17, p*8, p*2);

        const bpX = x + p*6;
        const bpY = surfaceY - p*50;
        g.fillStyle(0x8090a0);
        g.fillRect(bpX, bpY, p*28, p*20);
        g.fillStyle(0x6080a0);
        g.fillRect(bpX + p, bpY + p, p*26, p);
        g.fillRect(bpX + p, bpY + p*18, p*26, p);
        g.fillRect(bpX + p, bpY + p, p, p*18);
        g.fillRect(bpX + p*26, bpY + p, p, p*18);
        g.fillStyle(0x4060a0);
        g.fillRect(bpX + p*8, bpY + p*4, p*12, p*12);
        g.fillStyle(0x8090a0);
        g.fillRect(bpX + p*10, bpY + p*6, p*8, p*8);
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0x5070a0);
            g.fillRect(bpX + p*3, bpY + p*4 + i * p*4, p*4, p);
        }
    }

    function drawStrangeDevice(g, x, floorY) {
        const p = 4;
        const deviceY = floorY + 15;
        const pedestalHeight = p*28;
        const pedestalWidth = p*14;
        const pedestalDepth = p*5;
        const pedestalTop = deviceY - pedestalHeight;

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - pedestalDepth, pedestalTop + p*2, pedestalDepth, pedestalHeight - p*2);
        g.fillRect(x, pedestalTop, pedestalWidth, pedestalHeight);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - pedestalDepth - p, pedestalTop - p, pedestalWidth + pedestalDepth + p*2, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - pedestalDepth, pedestalTop, pedestalWidth + pedestalDepth, p);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - pedestalDepth - p, deviceY - p*2, pedestalWidth + pedestalDepth + p*2, p*2);

        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, pedestalTop + p*4, pedestalWidth - p*4, pedestalHeight - p*8);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, pedestalTop + p*5, pedestalWidth - p*6, p);

        const deviceBaseY = pedestalTop - p*2;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p, deviceBaseY, pedestalWidth - p*2, p*3);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, deviceBaseY + p, pedestalWidth - p*4, p);

        const domeWidth = pedestalWidth - p*4;
        const domeHeight = p*10;
        const domeX = x + p*2;
        const domeY = deviceBaseY - domeHeight;

        g.fillStyle(0x3a5a6a);
        g.fillRect(domeX, domeY, domeWidth, domeHeight);
        g.fillStyle(0x4a7a8a);
        g.fillRect(domeX + p, domeY + p, p*2, domeHeight - p*2);
        g.fillStyle(0x4a6a7a);
        g.fillRect(domeX + p, domeY - p, domeWidth - p*2, p*2);

        const coreX = domeX + domeWidth/2 - p*2;
        const coreY = domeY + domeHeight/2 - p*2;
        g.fillStyle(COLORS.LAB_MID);
        g.fillRect(coreX - p, coreY - p, p*6, p*6);
        g.fillStyle(COLORS.LAB_LIGHT);
        g.fillRect(coreX, coreY, p*4, p*4);
        g.fillStyle(0xaaffaa);
        g.fillRect(coreX + p, coreY + p, p*2, p*2);

        g.fillStyle(COLORS.BRASS);
        g.fillRect(domeX - p, domeY - p*2, domeWidth + p*2, p);
        g.fillRect(domeX - p, deviceBaseY - p, domeWidth + p*2, p);

        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, deviceBaseY + p*2, p*2, p);
        g.fillRect(x + pedestalWidth - p*4, deviceBaseY + p*2, p*2, p);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawInteriorRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72;
        const p = 4;
        const wainscotHeight = p * 35;

        // === BACK WALL ===
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        const panelWidth = p * 20;
        for (let px = 0; px < worldWidth; px += panelWidth) {
            g.fillStyle(COLORS.WALL_MID);
            g.fillRect(px + p, p*5, panelWidth - p*2, floorY - wainscotHeight - p*6);
            g.fillStyle(COLORS.WALL_LIGHT);
            g.fillRect(px + p, p*5, p, floorY - wainscotHeight - p*6);
            g.fillStyle(COLORS.WALL_DARK);
            g.fillRect(px + panelWidth - p*2, p*5, p, floorY - wainscotHeight - p*6);
        }

        for (let py = p*6; py < floorY - wainscotHeight - p*2; py += p*8) {
            for (let px = p*4; px < worldWidth - p*4; px += p*12) {
                if ((px + py) % (p*24) < p*4) {
                    g.fillStyle(COLORS.WALL_LIGHT);
                    g.fillRect(px, py, p, p);
                }
            }
        }

        const wainscotY = floorY - wainscotHeight;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, wainscotY, worldWidth, wainscotHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, wainscotY, worldWidth, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, wainscotY, worldWidth, p);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, floorY - p*2, worldWidth, p*2);

        const wainscotPanelWidth = p * 28;
        for (let px = 0; px < worldWidth; px += wainscotPanelWidth) {
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(px + p*3, wainscotY + p*5, wainscotPanelWidth - p*6, wainscotHeight - p*10);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(px + p*3, wainscotY + p*5, wainscotPanelWidth - p*6, p);
            g.fillRect(px + p*3, wainscotY + p*5, p, wainscotHeight - p*11);
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(px + p*3, wainscotY + wainscotHeight - p*6, wainscotPanelWidth - p*6, p);
            g.fillRect(px + wainscotPanelWidth - p*4, wainscotY + p*6, p, wainscotHeight - p*12);
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(px + p*6, wainscotY + p*10, p*4, p);
            g.fillRect(px + p*12, wainscotY + p*16, p*6, p);
            g.fillRect(px + p*8, wainscotY + p*22, p*5, p);
        }

        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, 0, worldWidth, p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, p*4, worldWidth, p);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, p*3, worldWidth, p);

        // === FLOOR ===
        g.fillStyle(COLORS.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        const boardWidth = p * 15;
        for (let bx = 0; bx < worldWidth; bx += boardWidth) {
            g.fillStyle(0x1a1510);
            g.fillRect(bx, floorY, p, height - floorY);
            g.fillStyle(COLORS.FLOOR_MID);
            g.fillRect(bx + p, floorY, p, height - floorY);
            g.fillStyle(COLORS.FLOOR_LIGHT);
            g.fillRect(bx + p*4, floorY + p*3, p*8, p);
            g.fillRect(bx + p*6, floorY + p*10, p*6, p);
        }

        // === LEFT SIDE - ENTRANCE AREA ===
        drawDoor(g, 100, 180, floorY, false);
        drawWindow(g, 320, 120, 160, floorY - 200, 'moon');
        drawCoatRack(g, 15, floorY);
        drawSmallTable(g, 500, floorY + 15);

        // === CENTER - LIVING AREA ===
        drawRug(g, 700, floorY + 35, 420, 120);
        drawGrandfatherClock(g, 630, floorY + 25);
        drawFireplace(g, 800, floorY);
        drawBookshelf(g, 1100, floorY);
        drawStairwayUp(g, 1340, 180, floorY);
        drawArmchair(g, 640, floorY + 100, true);
        drawCoffeeTable(g, 820, floorY + 100);
        drawArmchair(g, 1080, floorY + 100, false);

        // === RIGHT SIDE - TRANSITION TO LAB ===
        drawDesk(g, 1620, floorY);
        drawWindow(g, 1850, 120, 150, floorY - 200, 'moon');
        drawStrangeDevice(g, 2080, floorY);
        drawDoor(g, 2280, 180, floorY, true);
    }

})();
