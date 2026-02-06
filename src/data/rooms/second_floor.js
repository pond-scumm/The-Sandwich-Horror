// ============================================================================
// SECOND FLOOR HALLWAY - Upstairs connecting hallway
// ============================================================================
// Transitional space connecting bedrooms and attic access. Victorian aesthetic
// matching the interior room with wainscoting, patterned wallpaper, runner rug.
// Connects to: interior (stairs down), franks_room, alien_room, attic
//
// Layout (left to right): Frank's door, Alien's door, Stairwell, more hallway,
// Bathroom door, Attic pull-string
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.second_floor = {
        id: 'second_floor',
        name: "Second Floor Hallway",

        worldWidth: 1920,
        screenWidth: 1280,
        cameraPreset: 'MEDIUM',

        walkableArea: {
            // MEDIUM camera preset: walkable band 0.72-0.92
            polygon: [
                { x: 0, y: 0.72 },
                { x: 1920, y: 0.72 },
                { x: 1920, y: 0.92 },
                { x: 0, y: 0.92 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0x5a5060,
            ambientMobile: 0x7a7080,
            sources: [
                // Wall sconces (warm, dim) - drawn at height * 0.25, bulb extends down ~50px
                { id: 'sconce_1', x: 300, y: 0.32, radius: 180, color: 0xffcc88, intensity: 0.7 },
                { id: 'sconce_2', x: 600, y: 0.32, radius: 180, color: 0xffcc88, intensity: 0.7 },
                { id: 'sconce_3', x: 1200, y: 0.32, radius: 180, color: 0xffcc88, intensity: 0.7 },
                // Stairwell glow (warm light from below) - stairwell at x: 850
                { id: 'stair_glow', x: 850, y: 0.68, radius: 250, color: 0xffaa66, intensity: 1.0 },
                // Moonlight (cool, from off-screen window)
                { id: 'moonlight', x: 1600, y: 0.35, radius: 300, color: 0xaabbdd, intensity: 0.5 },
                // Alien door glow (subtle, eerie) - door at x: 380
                { id: 'alien_glow', x: 380, y: 0.60, radius: 100, color: 0x88ff88, intensity: 0.4 }
            ]
        },

        audio: {
            music: {
                key: 'interior_theme',
                volume: 0.5,
                fade: 1000,
                loop: true
            },
            layers: [],
            continueFrom: ['interior', 'franks_room', 'alien_room', 'attic', 'hectors_room']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawSecondFloorRoom
            }
        ],

        spawns: {
            default: { x: 850, y: 0.82 },
            from_interior: { x: 850, y: 0.82 },
            from_franks_room: { x: 150, y: 0.82 },
            from_alien_room: { x: 450, y: 0.82 },
            from_hectors_room: { x: 1770, y: 0.82, direction: 'left' }
        },

        exits: [],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === FRANK'S BEDROOM DOOR (far left) ===
            {
                id: 'door_frank',
                x: 80, y: 0.35, w: 140, h: 0.45,
                interactX: 150, interactY: 0.82,
                name: "Frank's Room",
                verbs: { action: 'Enter', look: 'Examine' },
                responses: {
                    look: "A bedroom door with a crayon drawing taped to it. 'FRANKS ROOM' is written in wobbly letters. There's a crude picture of... a flower? Or maybe a sun with legs.",
                    action: "I should probably focus on the task at hand. I can explore Frank's room later."
                }
            },

            // === ALIEN'S BEDROOM DOOR ===
            {
                id: 'door_alien',
                x: 380, y: 0.35, w: 140, h: 0.45,
                interactX: 450, interactY: 0.82,
                name: 'Bedroom Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Something's off about this door. There are scorch marks around the frame, and I can see a faint green glow from underneath. Is that... humming? Or beeping? It's definitely not silence.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'alien_room',
                    spawnPoint: 'from_hallway'
                }
            },

            // === STAIRWELL DOWN (railing spans 750-1150) ===
            {
                id: 'stairs_down',
                x: 750, y: 0.50, w: 400, h: 0.40,
                interactX: 950, interactY: 0.82,
                name: 'Stairwell',
                verbs: { action: 'Go down', look: 'Look at' },
                responses: {
                    look: "Stairs leading down to the foyer. Warm light spills up from below. The banister is polished smooth from decades of use."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'interior',
                    spawnPoint: 'from_second_floor'
                }
            },

            // === BATHROOM DOOR ===
            {
                id: 'door_bathroom',
                x: 1280, y: 0.35, w: 140, h: 0.45,
                interactX: 1350, interactY: 0.82,
                name: 'Bathroom',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "A bathroom door. Plain, unassuming, currently representing my only hope of relief.",
                    action: "Locked! Of course it's locked. I really need to use this bathroom and it's LOCKED. This is a nightmare."
                }
            },

            // === HECTOR'S BEDROOM DOOR (far right) ===
            {
                id: 'door_hector',
                x: 1700, y: 0.35, w: 140, h: 0.45,
                interactX: 1770, interactY: 0.82,
                name: "Hector's Room",
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Hector's bedroom door. Looks like a pretty standard door, but knowing this house, who knows what's behind it."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'hectors_room',
                    spawnPoint: 'from_second_floor'
                }
            },

            // === ATTIC PULL STRING ===
            {
                id: 'pullstring_attic',
                x: 1620, y: 0.28, w: 60, h: 0.25,
                interactX: 1650, interactY: 0.82,
                name: 'Attic Pull-String',
                verbs: { action: 'Pull', look: 'Look at' },
                responses: {
                    look: "A pull-string dangling from a ceiling hatch. I can hear faint sounds from above... scratching? Footsteps? TV static? Something's up there.",
                    action: "Hmm... maybe later. I've got enough going on down here without adding 'mysterious attic' to my to-do list."
                }
                // TODO: Eventually transitions to attic
            },

            // === PORTRAITS (2.5x larger: 176w x 224h pixels, centered at x) ===
            {
                id: 'portrait_1',
                x: 632, y: 0.12, w: 176, h: 0.31,
                interactX: 720, interactY: 0.82,
                name: 'Portrait',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "A woman in Victorian dress. She's holding what appears to be a beaker. Her hair is... suspiciously wild. Science clearly runs in this family.",
                    action: "'Henrietta Manzana, 1870-???'. The death date is scratched out. That's... concerning."
                }
            },
            {
                id: 'portrait_2',
                x: 912, y: 0.12, w: 176, h: 0.31,
                interactX: 1000, interactY: 0.82,
                name: 'Portrait',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "Wait, is he wearing GOGGLES? In the 1800s? Those look exactly like Hector's. This family has a very specific aesthetic.",
                    action: "'Herbert Manzana'. No dates. His eyes seem to follow me. I'm choosing to believe that's just good painting technique."
                }
            },
            {
                id: 'portrait_3',
                x: 1462, y: 0.12, w: 176, h: 0.31,
                interactX: 1550, interactY: 0.82,
                name: 'Unusual Portrait',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "This one's different. The subject has very large eyes, unusually smooth skin, and... are those ANTENNAE painted over with hair? Someone tried to cover them up with brown paint.",
                    action: "The nameplate just says 'Cousin'. There's no date. The more I look at this portrait, the less human it appears. I'm going to stop looking at it now."
                }
            },

            // === THERMOSTAT ===
            {
                id: 'thermostat',
                x: 1150, y: 0.45, w: 40, h: 0.08,
                interactX: 1170, interactY: 0.82,
                name: 'Thermostat',
                verbs: { action: 'Adjust', look: 'Check' },
                responses: {
                    look: "An old dial thermostat. It's set to... 147 degrees?! No wonder Hector wears that lab coat everywhere. He's acclimated to the surface of the sun.",
                    action: "I try to turn it down but it's stuck. Or maybe welded in place? Someone REALLY likes it hot in here."
                }
            },

            // === WALL SCONCE ===
            {
                id: 'sconce_wall',
                x: 1195, y: 0.38, w: 30, h: 0.12,
                interactX: 1200, interactY: 0.82,
                name: 'Wall Sconce',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A brass wall sconce with a flickering electric bulb. Very period-appropriate. The glow is warm but dim.",
                    action: "Still warm. The bulb flickers when I touch it but stays on. These things have been burning for who knows how long."
                }
            },

            // === BANISTER ===
            {
                id: 'banister_rail',
                x: 950, y: 0.58, w: 100, h: 0.08,
                interactX: 1000, interactY: 0.82,
                name: 'Banister',
                verbs: { action: 'Slide down', look: 'Examine' },
                responses: {
                    look: "A well-worn wooden banister. Polished to a shine from countless hands. It curves down toward the foyer.",
                    action: "Tempting, but I'm here on a trial basis. Probably shouldn't break any bones until I'm officially hired."
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
            door_bathroom: {
                key: "Nope, wrong key. This one's definitely for something else.",
                crowbar: "I'm not breaking down a bathroom door. That's a line I'm not crossing tonight.",
                default: "I don't think {item} is going to get me into a locked bathroom."
            },
            thermostat: {
                screwdriver: "The cover comes off, but the dial is still stuck. This thing has been welded in place. Hector is COMMITTED to this temperature.",
                default: "The {item} isn't going to convince this thermostat to cooperate."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

        firstVisit: {
            delay: 800,
            dialogue: "The second floor. Creaky floorboards, dim lighting, and way too many portraits staring at me."
        },

        features: {
            secondFloor: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Wall colors (matching interior)
        WALL_DARK: 0x1a1520,
        WALL_MID: 0x2a2535,
        WALL_LIGHT: 0x3a3545,
        WALL_HIGHLIGHT: 0x4a4555,

        // Wood (wainscoting, doors, floor)
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,
        WOOD_HIGHLIGHT: 0x8a6840,

        // Floor (hardwood)
        FLOOR_DARK: 0x2a1a12,
        FLOOR_MID: 0x3a2a20,
        FLOOR_LIGHT: 0x4a3a2a,

        // Rug colors
        RUG_DARK: 0x3a1515,
        RUG_MID: 0x5a2525,
        RUG_PATTERN: 0x6a3030,
        RUG_GOLD: 0x8a7530,

        // Metal (sconces, hardware)
        BRASS: 0x9a8540,
        GOLD: 0x8a7530,
        METAL_DARK: 0x3a3a3a,

        // Lighting effects
        WARM_GLOW: 0xffcc88,
        STAIR_LIGHT: 0xffaa66,
        MOONLIGHT: 0xaabbdd,

        // Portrait colors
        FRAME_DARK: 0x3a2a1a,
        FRAME_GOLD: 0x8a7530,
        CANVAS: 0x5a4a3a
    };

    const p = 2;

    function drawWallPanelsWithWallpaper(g, worldWidth, floorY) {
        const wainscotHeight = p * 70; // Wainscoting height
        const wainscotY = floorY - wainscotHeight;

        // Upper wall (patterned wallpaper area)
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(0, 0, worldWidth, wainscotY);

        // Wall panels
        const panelWidth = p * 40;
        for (let px = 0; px < worldWidth; px += panelWidth) {
            g.fillStyle(COLORS.WALL_MID);
            g.fillRect(px + p * 2, p * 10, panelWidth - p * 4, wainscotY - p * 14);
            g.fillStyle(COLORS.WALL_LIGHT);
            g.fillRect(px + p * 2, p * 10, p, wainscotY - p * 14);
            g.fillStyle(COLORS.WALL_DARK);
            g.fillRect(px + panelWidth - p * 3, p * 10, p, wainscotY - p * 14);
        }

        // Wallpaper pattern (subtle repeating motif)
        for (let py = p * 15; py < wainscotY - p * 5; py += p * 16) {
            for (let px = p * 8; px < worldWidth - p * 8; px += p * 24) {
                if ((px + py) % (p * 48) < p * 8) {
                    g.fillStyle(COLORS.WALL_LIGHT);
                    g.fillRect(px, py, p * 2, p * 2);
                    g.fillRect(px + p * 4, py + p * 4, p, p);
                }
            }
        }

        // Crown molding
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, 0, worldWidth, p * 10);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, p * 8, worldWidth, p * 2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, p * 6, worldWidth, p);

        // Chair rail (above wainscoting)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, wainscotY - p * 4, worldWidth, p * 4);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, wainscotY - p * 3, worldWidth, p * 2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, wainscotY - p * 3, worldWidth, p);

        // Wainscoting panels
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, wainscotY, worldWidth, wainscotHeight);

        const wainscotPanelWidth = p * 56;
        for (let px = 0; px < worldWidth; px += wainscotPanelWidth) {
            // Panel recess
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(px + p * 6, wainscotY + p * 8, wainscotPanelWidth - p * 12, wainscotHeight - p * 16);
            // Panel highlights
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(px + p * 6, wainscotY + p * 8, wainscotPanelWidth - p * 12, p);
            g.fillRect(px + p * 6, wainscotY + p * 8, p, wainscotHeight - p * 17);
            // Panel shadows
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(px + p * 6, wainscotY + wainscotHeight - p * 9, wainscotPanelWidth - p * 12, p);
            g.fillRect(px + wainscotPanelWidth - p * 7, wainscotY + p * 9, p, wainscotHeight - p * 18);
        }
    }

    function drawFloorWithRunner(g, worldWidth, height, floorY) {
        // Hardwood floor base
        g.fillStyle(COLORS.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Floor boards
        const boardWidth = p * 30;
        for (let bx = 0; bx < worldWidth; bx += boardWidth) {
            g.fillStyle(COLORS.FLOOR_MID);
            g.fillRect(bx + p, floorY, p, height - floorY);
            g.fillStyle(COLORS.FLOOR_LIGHT);
            g.fillRect(bx + p * 6, floorY + p * 4, p * 15, p);
            g.fillRect(bx + p * 10, floorY + p * 12, p * 10, p);
        }

        // Runner rug down the center
        const rugLeft = p * 50;
        const rugWidth = worldWidth - p * 100;
        const rugTop = floorY + p * 12;
        const rugHeight = p * 50;

        // Rug base
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(rugLeft, rugTop, rugWidth, rugHeight);

        // Rug border pattern
        g.fillStyle(COLORS.RUG_GOLD);
        g.fillRect(rugLeft + p * 3, rugTop + p * 3, rugWidth - p * 6, p * 3);
        g.fillRect(rugLeft + p * 3, rugTop + rugHeight - p * 6, rugWidth - p * 6, p * 3);
        g.fillRect(rugLeft + p * 3, rugTop + p * 3, p * 3, rugHeight - p * 6);
        g.fillRect(rugLeft + rugWidth - p * 6, rugTop + p * 3, p * 3, rugHeight - p * 6);

        // Inner border
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(rugLeft + p * 8, rugTop + p * 8, rugWidth - p * 16, p * 2);
        g.fillRect(rugLeft + p * 8, rugTop + rugHeight - p * 10, rugWidth - p * 16, p * 2);
        g.fillRect(rugLeft + p * 8, rugTop + p * 8, p * 2, rugHeight - p * 16);
        g.fillRect(rugLeft + rugWidth - p * 10, rugTop + p * 8, p * 2, rugHeight - p * 16);

        // Central pattern
        g.fillStyle(COLORS.RUG_PATTERN);
        for (let px = rugLeft + p * 20; px < rugLeft + rugWidth - p * 20; px += p * 40) {
            g.fillRect(px, rugTop + p * 18, p * 20, p * 14);
        }
    }

    // Door drawing matches interior.js style with p=4
    function drawDoor(g, x, y, floorY, isSpecial, specialType) {
        const p = 4;  // Match interior.js door pixel scale
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

        // Door surface
        g.fillStyle(isSpecial ? COLORS.WOOD_MID : COLORS.WOOD_DARK);
        g.fillRect(x, y, doorWidth, doorHeight);

        // Door panels (4-panel design)
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

        // Panel highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + panelInset, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, p, bottomPanelHeight);

        // Panel shadows
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + panelInset, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, bottomPanelY, p, bottomPanelHeight);

        // Door handle
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
        // Keyhole
        g.fillStyle(0x1a1a1a);
        g.fillRect(handleX, handleY + p*6, p*2, p*2);
        g.fillRect(handleX + p/2, handleY + p*7, p, p*2);

        // Special door decorations
        if (isSpecial && specialType === 'frank') {
            // Crayon drawing taped to door - centered and larger
            const paperWidth = p * 14;
            const paperHeight = p * 10;
            const paperX = x + (doorWidth - paperWidth) / 2;  // Centered on door
            const paperY = topPanelY + p * 2;  // Higher up on door
            g.fillStyle(0xeeeeee);
            g.fillRect(paperX, paperY, paperWidth, paperHeight);
            // Crayon scribbles - a sun/flower thing
            g.fillStyle(0xff6666);
            g.fillRect(paperX + p*4, paperY + p*3, p*6, p*5);
            g.fillStyle(0xffff66);
            g.fillRect(paperX + p*5, paperY + p*2, p*4, p*2);
            g.fillRect(paperX + p*6, paperY + p*6, p*2, p*2);
            g.fillStyle(0x66ff66);
            g.fillRect(paperX + p*6, paperY + p*7, p*2, p*2);
            // Tape
            g.fillStyle(0xcccc99);
            g.globalAlpha = 0.7;
            g.fillRect(paperX - p, paperY - p, p*4, p*2);
            g.fillRect(paperX + paperWidth - p*3, paperY - p, p*4, p*2);
            g.globalAlpha = 1.0;
        }

        if (isSpecial && specialType === 'alien') {
            // Scorch marks around frame
            g.fillStyle(0x2a2a2a);
            g.globalAlpha = 0.5;
            g.fillRect(x - frameWidth - p*2, y - p*4, p*4, p*20);
            g.fillRect(x + doorWidth + frameWidth - p*2, y - p*4, p*4, p*20);
            g.fillRect(x - frameWidth - p, floorY - p*10, p*3, p*10);
            g.fillRect(x + doorWidth + frameWidth - p*2, floorY - p*10, p*3, p*10);
            g.globalAlpha = 1.0;

            // Green glow from under door
            g.fillStyle(0x88ff88);
            g.globalAlpha = 0.4;
            g.fillRect(x + p*2, floorY - p*2, doorWidth - p*4, p*2);
            g.globalAlpha = 1.0;
        }
    }

    function drawStairwell(g, x, floorY, height) {
        // No black opening - just the railing
        // Runner rug top is at floorY + p * 12, so railing bottom should touch that

        // === RAILING (1.5x taller, 2x wider extending right) ===
        const rugTop = floorY + p * 12;  // Where the runner rug starts
        const railingLeft = x - p * 50;  // Left side of railing
        const railingRight = x + p * 150; // 2x wider, extending right
        const railingTop = floorY - p * 68; // 1.5x taller (was -45, now -68)
        const railingBottom = rugTop;  // Touch the top of the runner rug
        const postWidth = p * 10;  // Slightly wider posts
        const postHeight = railingBottom - railingTop;

        // Left newel post
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingLeft, railingTop, postWidth, postHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(railingLeft + p, railingTop + p * 2, postWidth - p * 2, postHeight - p * 4);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(railingLeft + p, railingTop + p * 2, p, postHeight - p * 6);

        // Left post finial (decorative top)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingLeft - p, railingTop - p * 5, postWidth + p * 2, p * 6);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(railingLeft + p * 2, railingTop - p * 9, p * 6, p * 5);

        // Right newel post
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingRight - postWidth, railingTop, postWidth, postHeight);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(railingRight - postWidth + p, railingTop + p * 2, postWidth - p * 2, postHeight - p * 4);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(railingRight - postWidth + p, railingTop + p * 2, p, postHeight - p * 6);

        // Right post finial
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingRight - postWidth - p, railingTop - p * 5, postWidth + p * 2, p * 6);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(railingRight - postWidth + p * 2, railingTop - p * 9, p * 6, p * 5);

        // Horizontal bannister (top rail)
        const bannisterWidth = railingRight - postWidth - (railingLeft + postWidth);
        const bannisterY = railingTop + p * 2;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingLeft + postWidth, bannisterY, bannisterWidth, p * 6);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(railingLeft + postWidth, bannisterY, bannisterWidth, p * 3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(railingLeft + postWidth + p * 2, bannisterY + p, bannisterWidth - p * 4, p);

        // Vertical balusters (slim rails between posts)
        const numBalusters = 10;  // More balusters for wider railing
        const balusterSpacing = bannisterWidth / (numBalusters + 1);
        const balusterWidth = p * 2;
        const balusterTop = bannisterY + p * 6;
        const balusterHeight = railingBottom - balusterTop - p * 4;

        for (let i = 1; i <= numBalusters; i++) {
            const balusterX = railingLeft + postWidth + (i * balusterSpacing) - balusterWidth / 2;
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(balusterX, balusterTop, balusterWidth, balusterHeight);
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(balusterX, balusterTop, p, balusterHeight);
        }

        // Bottom rail connecting balusters
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(railingLeft + postWidth, railingBottom - p * 4, bannisterWidth, p * 4);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(railingLeft + postWidth, railingBottom - p * 3, bannisterWidth, p * 2);
    }

    function drawWallSconce(g, x, y) {
        // Sconce at 0.5x size
        // Brass mounting plate
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p * 4, y, p * 8, p * 10);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x - p * 3, y + p, p * 6, p * 2);

        // Arm extending out
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p * 2, y + p * 5, p * 4, p * 12);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x - p, y + p * 6, p * 2, p);

        // Lamp shade / bulb holder
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p * 4, y + p * 16, p * 8, p * 4);

        // Bulb (glowing)
        g.fillStyle(COLORS.WARM_GLOW);
        g.fillRect(x - p * 3, y + p * 19, p * 6, p * 7);
        g.fillStyle(0xffffcc);
        g.fillRect(x - p * 2, y + p * 20, p * 4, p * 5);
        // No glow rectangle - let Phaser Light2D handle the glow
    }

    function drawPortrait(g, x, y, variant) {
        // Portrait at 2.5x size
        const frameWidth = p * 88;  // Was p*35, now 2.5x
        const frameHeight = p * 112; // Was p*45, now 2.5x

        // Outer frame
        g.fillStyle(COLORS.FRAME_DARK);
        g.fillRect(x - frameWidth / 2, y, frameWidth, frameHeight);

        // Gold inner frame
        g.fillStyle(COLORS.FRAME_GOLD);
        g.fillRect(x - frameWidth / 2 + p * 6, y + p * 6, frameWidth - p * 12, frameHeight - p * 12);

        // Canvas
        g.fillStyle(COLORS.CANVAS);
        g.fillRect(x - frameWidth / 2 + p * 12, y + p * 12, frameWidth - p * 24, frameHeight - p * 24);

        // Portrait figure (varies by variant) - CENTERED in canvas
        const canvasX = x - frameWidth / 2 + p * 16;
        const canvasY = y + p * 16;
        const canvasW = frameWidth - p * 32;
        const canvasH = frameHeight - p * 32;
        const centerX = canvasX + canvasW / 2;  // Center point for figures

        // Background
        g.fillStyle(0x4a3a2a);
        g.fillRect(canvasX, canvasY, canvasW, canvasH);

        if (variant === 1) {
            // Stern gentleman - CENTERED
            g.fillStyle(0x8a7a6a); // Face
            g.fillRect(centerX - p * 10, canvasY + p * 10, p * 20, p * 25);
            g.fillStyle(0x2a2a2a); // Suit
            g.fillRect(centerX - p * 14, canvasY + p * 35, p * 28, p * 30);
            g.fillStyle(0x1a1a1a); // Eyes
            g.fillRect(centerX - p * 7, canvasY + p * 18, p * 5, p * 5);
            g.fillRect(centerX + p * 2, canvasY + p * 18, p * 5, p * 5);
        } else if (variant === 2) {
            // Victorian woman with wild hair - CENTERED
            g.fillStyle(0x8a7a6a); // Face
            g.fillRect(centerX - p * 10, canvasY + p * 12, p * 20, p * 22);
            g.fillStyle(0x4a3a2a); // Wild hair
            g.fillRect(centerX - p * 14, canvasY + p * 5, p * 28, p * 14);
            g.fillRect(centerX - p * 17, canvasY + p * 10, p * 8, p * 10);
            g.fillRect(centerX + p * 9, canvasY + p * 10, p * 8, p * 10);
            g.fillStyle(0x5a4a5a); // Dress
            g.fillRect(centerX - p * 12, canvasY + p * 34, p * 24, p * 30);
            // Beaker in hand
            g.fillStyle(0x88aaaa);
            g.fillRect(centerX + p * 8, canvasY + p * 40, p * 8, p * 12);
        } else if (variant === 3) {
            // Man with goggles - CENTERED
            g.fillStyle(0x8a7a6a); // Face
            g.fillRect(centerX - p * 10, canvasY + p * 12, p * 20, p * 25);
            g.fillStyle(0x3a3a3a); // Goggles
            g.fillRect(centerX - p * 12, canvasY + p * 15, p * 12, p * 10);
            g.fillRect(centerX, canvasY + p * 15, p * 12, p * 10);
            g.fillStyle(0x6a6a7a); // Goggles lens
            g.fillRect(centerX - p * 10, canvasY + p * 17, p * 8, p * 6);
            g.fillRect(centerX + p * 2, canvasY + p * 17, p * 8, p * 6);
            g.fillStyle(0x2a2a2a); // Suit
            g.fillRect(centerX - p * 12, canvasY + p * 37, p * 24, p * 28);
        } else if (variant === 4) {
            // Unusual "cousin" - CENTERED
            g.fillStyle(0x9a9a8a); // Smooth pale face
            g.fillRect(centerX - p * 10, canvasY + p * 12, p * 20, p * 25);
            g.fillStyle(0x1a1a1a); // Large eyes
            g.fillRect(centerX - p * 9, canvasY + p * 17, p * 8, p * 8);
            g.fillRect(centerX + p * 1, canvasY + p * 17, p * 8, p * 8);
            g.fillStyle(0x4a3a2a); // Painted over antennae (brown)
            g.fillRect(centerX - p * 7, canvasY + p * 5, p * 5, p * 10);
            g.fillRect(centerX + p * 2, canvasY + p * 5, p * 5, p * 10);
            g.fillStyle(0x5a5a5a); // Suit
            g.fillRect(centerX - p * 12, canvasY + p * 37, p * 24, p * 28);
        }

        // Frame highlights
        g.fillStyle(COLORS.FRAME_GOLD);
        g.globalAlpha = 0.5;
        g.fillRect(x - frameWidth / 2 + p * 8, y + p * 8, frameWidth - p * 16, p * 2);
        g.fillRect(x - frameWidth / 2 + p * 8, y + p * 8, p * 2, frameHeight - p * 16);
        g.globalAlpha = 1.0;
    }

    function drawThermostat(g, x, y) {
        // Mounting plate
        g.fillStyle(0xccccbb);
        g.fillRect(x - p * 10, y, p * 20, p * 25);
        g.fillStyle(0xddddcc);
        g.fillRect(x - p * 8, y + p * 2, p * 16, p * 21);

        // Dial
        g.fillStyle(0x888888);
        g.fillRect(x - p * 5, y + p * 6, p * 10, p * 10);
        g.fillStyle(0xaaaaaa);
        g.fillRect(x - p * 3, y + p * 8, p * 6, p * 6);

        // Dial indicator (pointing way up - set too high!)
        g.fillStyle(0xff4444);
        g.fillRect(x - p, y + p * 8, p * 2, p * 5);

        // Temperature markings
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p * 7, y + p * 18, p * 14, p * 4);
    }

    function drawAtticPullString(g, x, y) {
        // Ceiling hatch outline
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p * 30, 0, p * 60, p * 6);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p * 28, p * 2, p * 56, p * 2);

        // String
        g.fillStyle(0xddddcc);
        g.fillRect(x - p, p * 6, p * 2, y - p * 6);

        // Pull ring
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p * 4, y, p * 8, p * 10);
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p * 2, y + p * 3, p * 4, p * 4);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawSecondFloorRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera

        // === WALLS AND FLOOR ===
        drawWallPanelsWithWallpaper(g, worldWidth, floorY);
        drawFloorWithRunner(g, worldWidth, height, floorY);

        // === DOORS (left to right) ===
        // Frank's bedroom door (far left) - y=180 matches interior.js door positioning
        drawDoor(g, 80, 180, floorY, true, 'frank');

        // Alien's bedroom door
        drawDoor(g, 380, 180, floorY, true, 'alien');

        // Bathroom door (right side)
        drawDoor(g, 1280, 180, floorY, false, null);

        // Hector's bedroom door (far right)
        drawDoor(g, 1700, 180, floorY, false, null);

        // === STAIRWELL ===
        drawStairwell(g, p * 425, floorY, height);

        // === WALL SCONCES ===
        drawWallSconce(g, 300, height * 0.25);   // Between Frank's door (ends ~220) and Alien's door (starts 380)
        drawWallSconce(g, 600, height * 0.25);   // Between Alien's door and stairwell
        drawWallSconce(g, 1200, height * 0.25);  // Between stairwell and bathroom

        // === PORTRAITS (raised up, not touching wainscoting) ===
        // Portrait 1 removed - was overlapping with Frank's door
        drawPortrait(g, 720, height * 0.12, 2);   // Between alien door and stairwell, right of sconce
        drawPortrait(g, 1000, height * 0.12, 3);  // Moved left, away from thermostat
        drawPortrait(g, 1550, height * 0.12, 4);  // Between bathroom door and final sconce

        // === THERMOSTAT ===
        drawThermostat(g, p * 575, height * 0.38);

        // === ATTIC PULL STRING ===
        drawAtticPullString(g, p * 825, height * 0.22);
    }

})();
