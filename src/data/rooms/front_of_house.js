// ============================================================================
// FRONT OF HOUSE - Hector's Victorian Home Exterior
// ============================================================================
// The exterior front of the house at night. Where Nate arrives after walking
// through the woods. A charming New England Victorian with warm light glowing
// from the windows.
//
// Connects to: interior (front door), woods (left edge - not yet built)
//
// Structure: Room data first (for easy editing), drawing code below.
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // SHARED LAYOUT (single source of truth for all positions)
    // =========================================================================

    const LAYOUT = {
        // House section (right 30% - starts around x:1790)
        house_wall:       { x: 2175, y: 0.36, w: 770, h: 0.72 },
        door_front:       { x: 2175, y: 0.476, w: 146, h: 0.474 },
        window_left:      { x: 1930, y: 0.39, w: 120, h: 0.32 },
        window_right:     { x: 2420, y: 0.39, w: 120, h: 0.32 },
        porch_light:      { x: 2295, y: 0.332, w: 30, h: 0.08 },

        // Warning signs along path
        sign_toxic:       { x: 400, y: 0.70, w: 70, h: 0.12 },
        sign_vaporize:    { x: 800, y: 0.72, w: 80, h: 0.12 },
        sign_solicitors:  { x: 1200, y: 0.71, w: 80, h: 0.12 },
        sign_help_wanted: { x: 1600, y: 0.73, w: 70, h: 0.12 }
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.front_of_house = {
        id: 'front_of_house',
        name: "Front of House",

        worldWidth: 2560,
        screenWidth: 1280,
        walkableArea: {
            minY: 0.72,
            maxY: 0.92
        },

        lighting: {
            enabled: true,
            ambient: 0x4a5565,        // Cool night ambient
            ambientMobile: 0x6a7585,  // Slightly brighter for mobile
            sources: [
                { id: 'moon', x: 300, y: 0.25, radius: 500, color: 0x8a95b5, intensity: 1.2 },
                { id: 'window_left_glow', x: 2020, y: 0.50, radius: 200, color: 0xffa566, intensity: 1.2 },
                { id: 'window_right_glow', x: 2330, y: 0.50, radius: 200, color: 0xffa566, intensity: 1.2 },
                { id: 'porch_light', x: 2280, y: 0.38, radius: 160, type: 'lamp', intensity: 0.7 }
            ]
        },

        audio: {
            music: {
                key: 'exterior_theme',
                volume: 0.5,
                fade: 1500
            },
            continueFrom: []
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawFrontOfHouse
            }
        ],

        spawns: {
            default: { x: 200, y: 0.82 },
            from_woods: { x: 200, y: 0.82 },
            from_interior: { x: 2175, y: 0.82, direction: 'left' }
        },

        exits: [
            {
                edge: 'left',
                x: 0,
                width: 100,
                target: 'woods',
                spawnPoint: 'from_front_of_house'
            }
        ],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === WARNING SIGNS ===
            {
                id: 'sign_toxic',
                ...LAYOUT.sign_toxic,
                interactX: 400, interactY: 0.82,
                name: 'Warning Sign',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "A wooden sign staked into the ground. Looks hand-painted.",
                    action: "\"Beware of Toxic Sludge.\" Yikes. Noted!"
                }
            },
            {
                id: 'sign_vaporize',
                ...LAYOUT.sign_vaporize,
                interactX: 800, interactY: 0.82,
                name: 'Warning Sign',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "Another wooden sign. The paint's a little messier on this one.",
                    action: "\"Trespassers Will Be Vaporized.\" I'm here for the job posting, so... I'm not trespassing. Right?"
                }
            },
            {
                id: 'sign_solicitors',
                ...LAYOUT.sign_solicitors,
                interactX: 1200, interactY: 0.82,
                name: 'Warning Sign',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "Yet another sign. This guy really likes signs.",
                    action: "\"No Solicitors (This Means You).\" Buddy, I'm not selling anything. Just... applying for a job."
                }
            },
            {
                id: 'sign_help_wanted',
                ...LAYOUT.sign_help_wanted,
                interactX: 1600, interactY: 0.82,
                name: 'Help Wanted Sign',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "Oh! This one looks newer. And less threatening.",
                    action: "\"Help Wanted.\" That's the one! This is definitely the right place."
                }
            },

            // === HOUSE ELEMENTS (front layer) ===
            {
                id: 'window_left',
                ...LAYOUT.window_left,
                interactX: 1930, interactY: 0.82,
                name: 'Left Window',
                verbs: { action: 'Peek', look: 'Look through' },
                responses: {
                    look: "Warm light glowing from inside. I can see a coat rack, some furniture... very cozy!",
                    action: "Someone's definitely home. The place looks lived-in and loved."
                }
            },
            {
                id: 'door_front',
                ...LAYOUT.door_front,
                interactX: 2175, interactY: 0.82,
                name: 'Front Door',
                verbs: { action: 'Enter', look: 'Examine' },
                responses: {
                    look: "Beautiful oak door with brass fixtures. Classic Victorian craftsmanship. The ad said to come right in..."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'interior',
                    spawnPoint: 'from_front_of_house'
                }
            },
            {
                id: 'window_right',
                ...LAYOUT.window_right,
                interactX: 2420, interactY: 0.82,
                name: 'Right Window',
                verbs: { action: 'Peek', look: 'Look through' },
                responses: {
                    look: "More warm light! I can see a fireplace through this one. Score.",
                    action: "This place is everything the ad promised. Cozy scientist's home indeed!"
                }
            },
            {
                id: 'porch_light',
                ...LAYOUT.porch_light,
                interactX: 2295, interactY: 0.82,
                name: 'Porch Light',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A simple brass porch light. Keeping the darkness at bay, one bulb at a time.",
                    action: "It's doing its job. Better leave it alone."
                }
            }
        ],

        pickupOverlays: [],

        itemInteractions: {
            door_front: {
                default: "I don't think I need to use {item} on the door. The ad said to just come in."
            },
            _default: "Not sure what {item} would do with {hotspot}."
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Sky & Night
        SKY_DARK: 0x0a0a18,
        SKY_MID: 0x1a1a28,
        MOON_BRIGHT: 0xe8e8f8,
        MOON_MID: 0xd8d8e8,
        STAR_COLOR: 0xffffff,

        // Victorian House
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,
        WOOD_HIGHLIGHT: 0x8a6840,
        SIDING_DARK: 0x3a3a42,
        SIDING_MID: 0x4a4a52,
        SIDING_LIGHT: 0x5a5a62,

        // Warm Window Glow
        WINDOW_GLOW: 0xffa550,
        WINDOW_MID: 0xd08540,
        WINDOW_DARK: 0x8a5020,

        // Ground & Nature
        GRASS_DARK: 0x1a2a1a,
        GRASS_MID: 0x2a3a2a,
        DIRT_DARK: 0x2a2520,
        DIRT_MID: 0x3a3530,
        FLOWER_STEM: 0x3a4a2a,
        FLOWER_PETAL: 0x6a4a5a,

        // Metal & Fixtures
        BRASS: 0x9a8540,
        GOLD: 0x8a7530
    };

    function drawNightSky(g, width, height, floorY) {
        const p = 4;

        // Gradient sky (covers entire top)
        g.fillStyle(COLORS.SKY_DARK);
        g.fillRect(0, 0, width, floorY * 0.4);
        g.fillStyle(COLORS.SKY_MID);
        g.fillRect(0, floorY * 0.4, width, floorY * 0.32);

        // Moon (left side, above woods)
        const moonX = 250;
        const moonY = 80;
        g.fillStyle(COLORS.MOON_MID);
        g.fillRect(moonX, moonY, p*10, p*10);
        g.fillStyle(COLORS.MOON_BRIGHT);
        g.fillRect(moonX + p, moonY + p, p*8, p*8);
        g.fillStyle(0xffffff);
        g.fillRect(moonX + p*2, moonY + p*2, p*5, p*5);
        g.fillRect(moonX + p*3, moonY + p*3, p*3, p*3);

        // Stars (scattered across left 70% - avoid house area)
        const starPositions = [
            { x: 100, y: 50 }, { x: 380, y: 90 }, { x: 620, y: 45 },
            { x: 850, y: 110 }, { x: 1100, y: 70 }, { x: 1350, y: 95 },
            { x: 450, y: 140 }, { x: 720, y: 85 }, { x: 980, y: 55 },
            { x: 300, y: 125 }, { x: 1250, y: 100 }, { x: 1500, y: 65 },
            { x: 180, y: 180 }, { x: 540, y: 160 }, { x: 890, y: 145 },
            { x: 1180, y: 130 }, { x: 1420, y: 170 }, { x: 1650, y: 120 }
        ];

        starPositions.forEach(star => {
            g.fillStyle(COLORS.STAR_COLOR);
            g.fillRect(star.x, star.y, p, p);
        });
    }

    function drawWoodsBackground(g, floorY) {
        const p = 4;
        const TREE_TRUNK = 0x2a2520;
        const TREE_DARK = 0x1a2a1a;
        const TREE_MID = 0x2a3a2a;
        const TREE_LIGHT = 0x3a4a3a;
        const WOODS_BG = 0x0a0a0a;  // Nearly black background behind trees

        // STEP 1: Dark background behind the trees (below treeline)
        const treelineY = floorY - p * 50;  // Where canopy starts
        g.fillStyle(WOODS_BG);
        g.fillRect(0, treelineY, 1790, floorY - treelineY);  // Cover woods area only

        // STEP 2: Draw all trunks (so they appear BEHIND the canopy)
        // Shorter trunks that don't extend above canopy, but extend across full woods
        g.fillStyle(TREE_TRUNK);
        for (let i = 0; i < 35; i++) {  // More trunks to cover full width
            const trunkX = 40 + i * 50;  // Start earlier, closer spacing
            const trunkWidth = p * (3 + (i % 3));
            const trunkHeight = p * (30 + (i % 3) * 8);  // Shorter - won't stick out
            const treeY = floorY - trunkHeight;

            g.fillRect(trunkX, treeY, trunkWidth, trunkHeight);

            // Add some variation with darker trunk edges
            g.fillStyle(0x1a1510);
            g.fillRect(trunkX + trunkWidth - p, treeY, p, trunkHeight);
            g.fillStyle(TREE_TRUNK);
        }

        // STEP 3: Draw canopy layers ON TOP (wider, shorter - horizontal coverage)
        // Canopy stays in lower half so sky is visible above

        // Dark green background canopy layer - start well before x=0 to ensure full coverage
        g.fillStyle(TREE_DARK);
        for (let i = 0; i < 38; i++) {
            const canopyX = -30 + i * 50;  // Start further left, tighter spacing
            const canopyY = floorY - p * (35 + (i % 4) * 8);
            const canopyWidth = p * (35 + (i % 4) * 15);
            const canopyHeight = p * (18 + (i % 3) * 6);

            g.fillRect(canopyX, canopyY - canopyHeight, canopyWidth, canopyHeight);
        }

        // Mid-green middle canopy layer
        g.fillStyle(TREE_MID);
        for (let i = 0; i < 32; i++) {
            const canopyX = -20 + i * 56;  // Start further left
            const canopyY = floorY - p * (33 + (i % 3) * 7);
            const canopyWidth = p * (32 + (i % 3) * 12);
            const canopyHeight = p * (16 + (i % 3) * 5);

            g.fillRect(canopyX, canopyY - canopyHeight, canopyWidth, canopyHeight);
        }

        // Light green foreground canopy layer
        g.fillStyle(TREE_LIGHT);
        for (let i = 0; i < 29; i++) {
            const canopyX = -10 + i * 62;  // Start left of 0
            const canopyY = floorY - p * (30 + (i % 3) * 6);
            const canopyWidth = p * (28 + (i % 3) * 10);
            const canopyHeight = p * (14 + (i % 2) * 4);

            g.fillRect(canopyX, canopyY - canopyHeight, canopyWidth, canopyHeight);
        }
    }

    function drawGround(g, width, height, floorY) {
        const p = 4;

        // Base grass ground
        g.fillStyle(COLORS.GRASS_DARK);
        g.fillRect(0, floorY, width, height - floorY);

        // Grass texture (more visible)
        for (let py = floorY + p*2; py < height - p*2; py += p*3) {
            for (let px = p*4; px < width - p*4; px += p*6) {
                if ((px + py) % (p*12) < p*3) {
                    g.fillStyle(COLORS.GRASS_MID);
                    g.fillRect(px, py, p, p);
                }
            }
        }

        // Add some variation to grass
        for (let py = floorY + p*4; py < height - p*4; py += p*5) {
            for (let px = p*8; px < width - p*8; px += p*10) {
                if ((px * 3 + py * 2) % (p*20) < p*4) {
                    g.fillStyle(COLORS.GRASS_MID);
                    g.fillRect(px, py, p*2, p);
                }
            }
        }
    }

    function drawVictorianHouse(g, width, height, floorY) {
        const p = 4;
        const houseX = 1790;  // Right 30% starts here
        const houseWidth = 770;  // 30% of 2560px
        const houseTop = 0;  // Stretches to top of screen

        // Main house body (painted siding)
        g.fillStyle(COLORS.SIDING_DARK);
        g.fillRect(houseX, houseTop, houseWidth, floorY - houseTop);

        // Horizontal siding texture
        for (let py = houseTop + p*2; py < floorY; py += p*4) {
            g.fillStyle(COLORS.SIDING_MID);
            g.fillRect(houseX, py, houseWidth, p);
            // Subtle highlight
            if (py % (p*8) === 0) {
                g.fillStyle(COLORS.SIDING_LIGHT);
                g.fillRect(houseX, py, houseWidth, p/2);
            }
        }

        // Roof peak at very top
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(houseX, 0, houseWidth, p*8);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(houseX, p*6, houseWidth, p*2);

        // Decorative trim
        const trimY = p*40;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(houseX, trimY, houseWidth, p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(houseX, trimY, houseWidth, p*2);
    }

    function drawSign(g, x, y, height, hotspotHeight) {
        const p = 4;
        const WOOD_DARK = 0x2a1a10;
        const WOOD_MID = 0x4a3520;
        const WOOD_LIGHT = 0x6a5030;
        const TEXT_DARK = 0x8a0a0a;

        const totalHeight = hotspotHeight * height;  // Total height = hotspot height
        const signHeight = totalHeight * 0.55;  // Sign takes up 55% of total height
        const poleHeight = totalHeight * 0.45;  // Pole takes up 45% of total height
        const signWidth = p * 18;  // 72px
        const poleWidth = p * 2;   // 8px

        // Position sign at top of hotspot box
        const boxTop = (y - hotspotHeight/2) * height;
        const signY = boxTop;
        const poleY = signY + signHeight;

        // Wooden pole/stake (shorter, fits in hotspot)
        g.fillStyle(WOOD_DARK);
        g.fillRect(x + signWidth/2 - poleWidth/2, poleY, poleWidth, poleHeight);
        g.fillStyle(WOOD_MID);
        g.fillRect(x + signWidth/2 - poleWidth/2, poleY, p/2, poleHeight);

        // Sign board
        g.fillStyle(WOOD_MID);
        g.fillRect(x, signY, signWidth, signHeight);

        // Sign board frame
        g.fillStyle(WOOD_DARK);
        g.fillRect(x, signY, signWidth, p);  // Top edge
        g.fillRect(x, signY + signHeight - p, signWidth, p);  // Bottom edge
        g.fillRect(x, signY, p, signHeight);  // Left edge
        g.fillRect(x + signWidth - p, signY, p, signHeight);  // Right edge

        // Sign board highlight
        g.fillStyle(WOOD_LIGHT);
        g.fillRect(x + p, signY + p, signWidth - p*2, p);

        // Text area (dark rectangle to suggest text)
        const textHeight = Math.max(p*6, signHeight - p*6);
        g.fillStyle(TEXT_DARK);
        g.fillRect(x + p*2, signY + p*3, signWidth - p*4, textHeight);
    }

    function drawWalkway(g, floorY, height) {
        const p = 4;
        const DIRT_DARK = 0x2a2520;
        const DIRT_MID = 0x3a3530;

        const doorX = 2102;
        const doorWidth = p * 35;  // 140px - same as door width
        const pathX = doorX;
        const pathWidth = doorWidth;

        // Draw simple dirt path from door to bottom of screen
        g.fillStyle(DIRT_DARK);
        g.fillRect(pathX, floorY, pathWidth, height - floorY);

        // Add subtle dirt texture
        for (let py = floorY + p*2; py < height; py += p*5) {
            for (let px = pathX; px < pathX + pathWidth; px += p*8) {
                if ((px + py) % (p*20) < p*4) {
                    g.fillStyle(DIRT_MID);
                    g.fillRect(px, py, p*2, p);
                }
            }
        }
    }

    function drawHorizontalWalkway(g, floorY, height) {
        const p = 4;
        const DIRT_DARK = 0x2a2520;
        const DIRT_MID = 0x3a3530;

        const doorX = 2102;
        const pathHeight = height * 0.07;  // About 50px tall
        const pathWidth = doorX;    // From left edge (0) to vertical path
        const pathX = 0;
        const pathY = height * 0.81;  // Position below signs (which end at ~0.79), with grass gap

        // Draw horizontal dirt path from left edge to vertical path
        g.fillStyle(DIRT_DARK);
        g.fillRect(pathX, pathY, pathWidth, pathHeight);

        // Add subtle dirt texture
        for (let py = pathY + p*2; py < pathY + pathHeight; py += p*5) {
            for (let px = pathX; px < pathX + pathWidth; px += p*8) {
                if ((px + py) % (p*20) < p*4) {
                    g.fillStyle(DIRT_MID);
                    g.fillRect(px, py, p*2, p);
                }
            }
        }
    }

    function drawBushes(g, floorY, height) {
        const p = 4;
        const BUSH_DARK = 0x1a2a1a;
        const BUSH_MID = 0x2a3a2a;
        const BUSH_LIGHT = 0x3a4a3a;

        // Door drawn position (from drawFrontDoor)
        const doorX = 2102;
        const doorWidth = p * 35;  // 140px
        const doorLeftEdge = doorX;  // 2102
        const doorRightEdge = doorX + doorWidth;  // 2242

        // Left side bushes (from before house to door left edge)
        const leftBushStartX = 1750;
        const leftBushEndX = doorLeftEdge;  // Reach exactly to door
        const leftBushWidth = leftBushEndX - leftBushStartX;

        // Draw left bushes - no random positioning, only random size
        for (let i = 0; i < 12; i++) {
            const bushX = leftBushStartX + (i / 12) * leftBushWidth;
            const bushWidth = p * (15 + Math.random() * 10);
            const bushHeight = p * (15 + Math.random() * 7);
            const bushY = floorY - bushHeight;

            // Clamp bush to not exceed door edge
            const actualWidth = Math.min(bushWidth, doorLeftEdge - bushX);

            if (actualWidth > 0) {
                // Dark layer
                g.fillStyle(BUSH_DARK);
                g.fillRect(bushX, bushY, actualWidth, bushHeight);

                // Mid layer
                if (actualWidth > p*4) {
                    g.fillStyle(BUSH_MID);
                    g.fillRect(bushX + p*2, bushY + p*2, actualWidth - p*4, bushHeight - p*4);
                }

                // Light highlights
                if (actualWidth > p*6) {
                    g.fillStyle(BUSH_LIGHT);
                    g.fillRect(bushX + p*3, bushY + p*3, actualWidth - p*6, bushHeight - p*6);
                }
            }
        }

        // Right side bushes (from door right edge to end)
        const rightBushStartX = doorRightEdge;  // Start exactly at door
        const rightBushEndX = 2560;
        const rightBushWidth = rightBushEndX - rightBushStartX;

        // Draw right bushes - no random positioning, only random size
        for (let i = 0; i < 12; i++) {
            const bushX = rightBushStartX + (i / 12) * rightBushWidth;
            const bushWidth = p * (15 + Math.random() * 10);
            const bushHeight = p * (15 + Math.random() * 7);
            const bushY = floorY - bushHeight;

            // Dark layer
            g.fillStyle(BUSH_DARK);
            g.fillRect(bushX, bushY, bushWidth, bushHeight);

            // Mid layer
            g.fillStyle(BUSH_MID);
            g.fillRect(bushX + p*2, bushY + p*2, bushWidth - p*4, bushHeight - p*4);

            // Light highlights
            g.fillStyle(BUSH_LIGHT);
            g.fillRect(bushX + p*3, bushY + p*3, bushWidth - p*6, bushHeight - p*6);
        }
    }

    function drawFrontDoor(g, doorX, floorY) {
        const p = 4;
        const doorY = p*50;  // Door starts partway down the house
        const doorHeight = floorY - doorY;  // Door extends to floor (no steps)
        const doorWidth = p * 35;
        const frameWidth = p * 3;

        // Door frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(doorX - frameWidth, doorY - p*5, doorWidth + frameWidth*2, doorHeight + p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(doorX - frameWidth, doorY - p*5, p*2, doorHeight + p*5);
        g.fillRect(doorX + doorWidth + p, doorY - p*5, p*2, doorHeight + p*5);
        g.fillRect(doorX - frameWidth, doorY - p*5, doorWidth + frameWidth*2, p*2);

        // Door body
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(doorX, doorY, doorWidth, doorHeight);

        // Door panels (4-panel Victorian design)
        const panelInset = p*4;
        const panelWidth = p*12;
        const panelGap = p*3;
        const topPanelHeight = p*20;
        const bottomPanelHeight = p*25;
        const topPanelY = doorY + p*5;
        const bottomPanelY = doorY + p*30;

        // Panel recesses
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(doorX + panelInset, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(doorX + panelInset, bottomPanelY, panelWidth, bottomPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, bottomPanelHeight);

        // Panel highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(doorX + panelInset, topPanelY, panelWidth, p);
        g.fillRect(doorX + panelInset, topPanelY, p, topPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, topPanelY, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, topPanelY, p, topPanelHeight);
        g.fillRect(doorX + panelInset, bottomPanelY, panelWidth, p);
        g.fillRect(doorX + panelInset, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, bottomPanelY, p, bottomPanelHeight);

        // Panel shadows
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(doorX + panelInset, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth - p, topPanelY, p, topPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth*2 + panelGap - p, topPanelY, p, topPanelHeight);
        g.fillRect(doorX + panelInset, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth - p, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(doorX + panelInset + panelWidth + panelGap, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(doorX + panelInset + panelWidth*2 + panelGap - p, bottomPanelY, p, bottomPanelHeight);

        // Brass door handle
        const handleY = bottomPanelY + bottomPanelHeight + p*8;
        const handleX = doorX + doorWidth - p*10;
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
    }

    function drawWindow(g, windowX, floorY) {
        const p = 4;
        const windowY = p*55;  // Windows at same height as door top area
        const windowWidth = p*28;
        const windowHeight = p*50;

        // Window frame (dark wood)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(windowX - p*3, windowY - p*3, windowWidth + p*6, windowHeight + p*6);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(windowX - p*4, windowY - p*2, p*2, windowHeight + p*4);
        g.fillRect(windowX - p, windowY - p, windowWidth + p*2, windowHeight + p*2);

        // Window glass with warm interior glow
        g.fillStyle(COLORS.WINDOW_DARK);
        g.fillRect(windowX, windowY, windowWidth, windowHeight);

        // Layered warm glow (simulating interior light)
        g.fillStyle(COLORS.WINDOW_MID);
        g.fillRect(windowX + p*2, windowY + p*2, windowWidth - p*4, windowHeight - p*4);
        g.fillStyle(COLORS.WINDOW_GLOW);
        g.fillRect(windowX + p*4, windowY + p*4, windowWidth - p*8, windowHeight - p*8);

        // Window muntins (cross dividers)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(windowX + windowWidth/2 - p, windowY, p*2, windowHeight);
        g.fillRect(windowX, windowY + windowHeight/2 - p, windowWidth, p*2);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(windowX + windowWidth/2 - p, windowY + p, p, windowHeight - p*2);
        g.fillRect(windowX + p, windowY + windowHeight/2 - p, windowWidth - p*2, p);

        // Window sill
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(windowX - p*4, windowY + windowHeight + p*2, windowWidth + p*8, p*4);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(windowX - p*3, windowY + windowHeight + p*2, windowWidth + p*6, p*2);
    }

    function drawPorchLight(g, lightX, lightY) {
        const p = 4;

        // Wall mount bracket
        g.fillStyle(COLORS.BRASS);
        g.fillRect(lightX - p*2, lightY, p*4, p*4);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(lightX - p, lightY + p, p*2, p);

        // Lantern body
        g.fillStyle(COLORS.BRASS);
        g.fillRect(lightX - p*3, lightY + p*4, p*6, p*10);
        g.fillStyle(0x2a2520);
        g.fillRect(lightX - p*2, lightY + p*5, p*4, p*8);

        // Warm light glow
        g.fillStyle(COLORS.WINDOW_MID);
        g.fillRect(lightX - p, lightY + p*6, p*2, p*6);
        g.fillStyle(COLORS.WINDOW_GLOW);
        g.fillRect(lightX, lightY + p*7, p, p*4);

        // Top cap
        g.fillStyle(COLORS.BRASS);
        g.fillRect(lightX - p*3, lightY + p*3, p*6, p*2);
        g.fillRect(lightX - p*2, lightY + p, p*4, p*3);
        // Peak
        g.fillStyle(COLORS.GOLD);
        g.fillRect(lightX - p, lightY, p*2, p*2);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawFrontOfHouse(g, scene, worldWidth, height) {
        const p = 4;
        const floorY = height * 0.72;

        // === LAYER 1: Night sky with moon and stars ===
        drawNightSky(g, worldWidth, height, floorY);

        // === LAYER 2: Woods background (left 70%) ===
        drawWoodsBackground(g, floorY);

        // === LAYER 3: Victorian house (right 30%, full height) ===
        drawVictorianHouse(g, worldWidth, height, floorY);

        // === LAYER 4: House details ===
        // Door (centered in house section)
        const doorX = 2102;
        drawFrontDoor(g, doorX, floorY);

        // Left window (further left from door)
        const leftWindowX = 1870;
        drawWindow(g, leftWindowX, floorY);

        // Right window (further right from door)
        const rightWindowX = 2380;
        drawWindow(g, rightWindowX, floorY);

        // Porch light (repositioned)
        const lightX = 2295;
        const lightY = height * 0.332;
        drawPorchLight(g, lightX, lightY);

        // === LAYER 5: Ground with grass ===
        drawGround(g, worldWidth, height, floorY);

        // === LAYER 6: Warning signs ===
        drawSign(g, 365, 0.70, height, 0.12);
        drawSign(g, 760, 0.72, height, 0.12);
        drawSign(g, 1160, 0.71, height, 0.12);
        drawSign(g, 1565, 0.73, height, 0.12);

        // === LAYER 7: Walkways (horizontal path + vertical path to door) ===
        drawHorizontalWalkway(g, floorY, height);
        drawWalkway(g, floorY, height);

        // === LAYER 8: Bushes in front of house (foreground) ===
        drawBushes(g, floorY, height);
    }

})();
