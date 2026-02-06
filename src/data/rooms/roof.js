// ============================================================================
// ROOF - Above the Front Porch
// ============================================================================
// The roof over the front porch. Dramatic and exposed - a massive satellite
// dish dominates the left side, the house wall with Frank's window on the right.
// The sense of height and openness is unsettling after so many interior spaces.
//
// Connects to: franks_room (via window)
// Width: 1280px (single screen), Camera: MEDIUM
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // SHARED LAYOUT (MANDATORY - Section 7A)
    // =========================================================================
    // Single source of truth for all element positions.
    // Both drawing functions and hotspots reference this object.

    const LAYOUT = {
        // Window: drawn at windowY=180 to floorY=518.4, width=140px+frame
        window:          { x: 1130, y: 0.485, w: 152, h: 0.47 },

        // Satellite dish: dishY=38 to 358, width=600px (150 to 750)
        satellite_dish:  { x: 450, y: 0.275, w: 600, h: 0.445 },

        // Control panel: panelY=398 to 538, width=112px (enlarged to fit buttons)
        panel_control:   { x: 180, y: 0.651, w: 112, h: 0.195 },

        // Gears: gearY-40=418 to gearY+32=490, width=240px (460 to 700)
        gears_satellite: { x: 580, y: 0.631, w: 240, h: 0.100 },

        // Framework (not used in hotspots but kept for reference)
        framework:       { x: 450, y: 0.58, w: 140, h: 0.34 },

        // Background elements (not used in hotspots)
        sky_background:  { x: 640, y: 0.35, w: 800, h: 0.50 },
        trees_distant:   { x: 640, y: 0.62, w: 1000, h: 0.10 },
        roof_surface:    { x: 640, y: 0.82, w: 1280, h: 0.20 }
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.roof = {
        id: 'roof',
        name: "Roof",

        worldWidth: 1280,
        screenWidth: 1280,
        cameraPreset: 'MEDIUM',

        walkableArea: {
            polygon: [
                { x: 0, y: 0.72 },
                { x: 1280, y: 0.72 },
                { x: 1280, y: 0.92 },
                { x: 0, y: 0.92 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0x6a6a7a,
            ambientMobile: 0x8a8a9a,
            sources: [
                { id: 'moonlight_main', x: 900, y: 0.25, radius: 600, color: 0xaabbdd, intensity: 1.2 },
                { id: 'starlight', x: 400, y: 0.20, radius: 300, color: 0x9999aa, intensity: 0.4 },
                { id: 'window_glow', x: 1130, y: 0.40, radius: 250, color: 0xffdd88, intensity: 0.8 },
                { id: 'panel_light', x: 180, y: 0.68, radius: 120, color: 0x66ff66, intensity: 0.6 }
            ]
        },

        audio: {
            music: {
                key: 'exterior_theme',
                volume: 0.4,
                fade: 1000
            },
            continueFrom: ['franks_room']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawRoof
            }
        ],

        spawns: {
            default: { x: 1050, y: 0.82, direction: 'left' },
            from_franks_room: { x: 1050, y: 0.82, direction: 'left' }
        },

        exits: [],

        npcs: [],

        firstVisit: {
            delay: 600,
            dialogue: "Whoa. I'm on the ROOF. That's... that's a big satellite dish. And that's a long way down."
        },

        // =====================================================================
        // HOTSPOTS
        // =====================================================================
        // Order: bottom to top (large background first, overlapping items after)

        hotspots: [
            // === WINDOW & EXIT ===
            {
                id: 'window_frank',
                ...LAYOUT.window,
                interactX: LAYOUT.window.x, interactY: 0.82,
                name: "Frank's Window",
                verbs: { action: 'Climb through', look: 'Look through' },
                responses: {
                    look: "Frank's window. I can see his room from here - the plants, the bed, the warm lamplight. It looks so cozy compared to being out here on this roof."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'franks_room',
                    spawnPoint: 'from_roof'
                }
            },

            // === SATELLITE DISH & COMPONENTS ===
            {
                id: 'satellite_dish',
                ...LAYOUT.satellite_dish,
                interactX: 450, interactY: 0.82,
                name: 'Satellite Dish',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "This thing is MASSIVE. It's pointed at the sky, tracking something - or broadcasting? The dish itself is at least 12 feet across, covered in metal panels and rivets. This is serious custom equipment. Way beyond consumer grade.",
                    action: "I run my hand along the dish's surface. Cold metal, precision engineering. There are markings I don't recognize - coordinates? Frequencies? Whatever this is picking up, it's not your standard satellite TV."
                }
            },
            {
                id: 'panel_control',
                ...LAYOUT.panel_control,
                interactX: LAYOUT.panel_control.x, interactY: 0.82,
                name: 'Control Panel',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "The control panel. There's a small screen showing current coordinates, a numeric keypad for input, and a big 'ADJUST DISH' button. The screen reads 'CURRENT: 42.3601° N, 71.0589° W - CHANNEL: 847.3 MHz'. A piece of duct tape on the side says 'DO NOT TOUCH - H.M.'",
                    action: "The keypad is responsive. I could enter new coordinates if I knew where to point this thing. There's also a manual that's been duct-taped to the panel. The cover says 'INTERDIMENSIONAL RELAY CALIBRATION GUIDE' in Hector's handwriting."
                }
                // TODO: When player enters coordinates, trigger satellite movement and change alien's TV
            },
            {
                id: 'gears_satellite',
                ...LAYOUT.gears_satellite,
                interactX: LAYOUT.gears_satellite.x, interactY: 0.82,
                name: 'Mechanical Gears',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "The satellite's rotation mechanism. Big heavy gears, pistons, servos - all working together to swivel this massive dish around. Currently moving slowly, tracking something in the sky. It's mesmerizing to watch.",
                    action: "I watch the gears turn. They're well-oiled, smooth, powerful. If I wanted to STOP this thing from moving... I'd need to jam something in there. Something metal. Like a wrench."
                }
                // TODO: When player jams with wrench, satellite can't be adjusted by alien
            },

            // === SATELLITE DETAILS ===
            {
                id: 'warning_signs',
                x: 180, y: 0.476, w: 96, h: 0.067,
                interactX: 180, interactY: 0.82,
                name: 'Warning Signs',
                verbs: { action: 'Read', look: 'Look at' },
                responses: {
                    look: "'DANGER: HIGH VOLTAGE' and 'CAUTION: MOVING PARTS' and my personal favorite: 'IF YOU CAN READ THIS YOU'RE TOO CLOSE.' Thanks, Hector.",
                    action: "'Unauthorized adjustment of interdimensional relay may result in: signal corruption, dimensional bleed-through, or accidental contact with hostile civilizations. -H.M.' That last one is... specific."
                }
            },

            // === ENVIRONMENTAL DETAILS ===
            {
                id: 'moon_bright',
                x: 900, y: 0.125, w: 80, h: 0.112,
                interactX: 900, interactY: 0.82,
                name: 'Moon',
                verbs: { action: 'Howl at', look: 'Look at' },
                responses: {
                    look: "The moon is HUGE tonight. Almost full, bright enough to read by. It's beautiful up here. The whole roof is bathed in silver light.",
                    action: "AWOOOOO! ...okay, that was embarrassing. Good thing nobody's around to hear that."
                }
            },
        ]
    };

    // =========================================================================
    // DRAWING CODE
    // =========================================================================

    function drawRoof(graphics, scene, worldWidth, height) {
        const g = graphics;
        const p = 4;
        const horizonY = height * 0.60;  // Where sky meets treeline
        const roofY = height * 0.72;     // Where roof surface starts

        // Night sky color palette
        const C = {
            // Sky gradient (top to horizon)
            SKY_TOP:         0x0a0a18,
            SKY_MID:         0x1a1a28,
            SKY_HORIZON:     0x2a2a38,

            // Stars and moon
            STAR:            0xeeeedd,
            STAR_BRIGHT:     0xffffee,
            MOON:            0xeeeedd,
            MOON_GLOW:       0xffffee,

            // Treeline
            TREE_DARK:       0x0a0a0a,
            TREE_MID:        0x1a1a1a,
            TREE_EDGE:       0x3a3a4a,

            // Roof shingles
            SHINGLE_DARK:    0x2a2520,
            SHINGLE_MID:     0x3a3530,
            SHINGLE_LIGHT:   0x4a4540,
            SHINGLE_EDGE:    0x1a1510,

            // House wall
            WALL_DARK:       0x2a2a25,
            WALL_MID:        0x3a3a30,
            WALL_LIGHT:      0x4a4a40,

            // Window (Frank's room)
            WINDOW_FRAME:    0x2a1a10,
            WINDOW_GLASS:    0x1a1a10,
            WINDOW_GLOW:     0xffdd88,

            // Satellite dish
            DISH_DARK:       0x3a3a3a,
            DISH_MID:        0x5a5a5a,
            DISH_LIGHT:      0x7a7a7a,
            DISH_SHINE:      0x9a9a9a,

            // Metal framework
            METAL_DARK:      0x2a2a2a,
            METAL_MID:       0x4a4a4a,
            METAL_LIGHT:     0x6a6a6a,

            // Control panel
            PANEL_DARK:      0x2a2a2a,
            PANEL_SCREEN:    0x1a3a1a,
            PANEL_GREEN:     0x66ff66,
            PANEL_TEXT:      0x88ff88,

            // Gears
            GEAR_DARK:       0x3a3a3a,
            GEAR_MID:        0x5a5a5a,
            GEAR_BRONZE:     0x8a6a4a,

            // Cables
            CABLE_RUBBER:    0x1a1a1a,
            CABLE_COPPER:    0x8a5a3a
        };

        // =================================================================
        // SKY (gradient from top to horizon)
        // =================================================================

        // Top section (darkest)
        g.fillStyle(C.SKY_TOP);
        g.fillRect(0, 0, worldWidth, height * 0.25);

        // Mid section (gradient)
        g.fillStyle(C.SKY_MID);
        g.fillRect(0, height * 0.25, worldWidth, height * 0.25);

        // Horizon section (lightest)
        g.fillStyle(C.SKY_HORIZON);
        g.fillRect(0, height * 0.50, worldWidth, horizonY - height * 0.50);

        // =================================================================
        // STARS (scattered across upper sky)
        // =================================================================

        const starPositions = [
            { x: 120, y: 30 }, { x: 280, y: 50 }, { x: 340, y: 80 }, { x: 520, y: 40 },
            { x: 680, y: 70 }, { x: 740, y: 110 }, { x: 880, y: 50 }, { x: 960, y: 90 },
            { x: 1040, y: 60 }, { x: 1180, y: 100 }, { x: 200, y: 140 }, { x: 460, y: 120 },
            { x: 620, y: 160 }, { x: 820, y: 140 }, { x: 1100, y: 130 }
        ];

        g.fillStyle(C.STAR);
        starPositions.forEach(star => {
            g.fillRect(star.x, star.y, p, p);
        });

        // Brighter stars
        g.fillStyle(C.STAR_BRIGHT);
        g.fillRect(340, 80, p * 2, p * 2);
        g.fillRect(880, 50, p * 2, p * 2);
        g.fillRect(1040, 60, p * 2, p * 2);

        // =================================================================
        // MOON (large, bright, right side)
        // =================================================================

        const moonX = 900;
        const moonY = 90;
        const moonSize = p * 20;

        // Moon glow (outer)
        g.fillStyle(C.SKY_HORIZON);
        g.globalAlpha = 0.5;
        g.fillRect(moonX - moonSize / 2 - p * 6, moonY - moonSize / 2 - p * 6, moonSize + p * 12, moonSize + p * 12);
        g.globalAlpha = 1.0;

        // Moon body
        g.fillStyle(C.MOON);
        g.fillRect(moonX - moonSize / 2, moonY - moonSize / 2, moonSize, moonSize);

        // Moon highlight (bright center)
        g.fillStyle(C.MOON_GLOW);
        g.fillRect(moonX - moonSize / 2 + p * 4, moonY - moonSize / 2 + p * 4, moonSize - p * 8, moonSize - p * 8);

        // =================================================================
        // DISTANT TREELINE (silhouette at horizon)
        // =================================================================

        // Jagged treeline
        g.fillStyle(C.TREE_DARK);
        for (let x = 0; x < worldWidth; x += p * 8) {
            const treeHeight = p * (8 + Math.floor(Math.random() * 12));
            g.fillRect(x, horizonY - treeHeight, p * 8, treeHeight);
        }

        // Tree edge highlight (moonlight on tops)
        g.fillStyle(C.TREE_EDGE);
        g.globalAlpha = 0.4;
        for (let x = 0; x < worldWidth; x += p * 16) {
            g.fillRect(x, horizonY - p * 16, p * 4, p * 2);
        }
        g.globalAlpha = 1.0;

        // =================================================================
        // HOUSE WALL (right 30% of screen)
        // =================================================================

        const wallLeft = worldWidth - p * 80;  // Right 30%

        // Wall surface
        g.fillStyle(C.WALL_DARK);
        g.fillRect(wallLeft, 0, worldWidth - wallLeft, roofY);

        // Wall texture (simple panel lines)
        g.fillStyle(C.WALL_MID);
        for (let py = p * 10; py < roofY; py += p * 40) {
            g.fillRect(wallLeft, py, worldWidth - wallLeft, p * 30);
        }

        // Wall highlights
        g.fillStyle(C.WALL_LIGHT);
        for (let py = p * 12; py < roofY; py += p * 40) {
            g.fillRect(wallLeft + p * 2, py, worldWidth - wallLeft - p * 4, p);
        }

        // =================================================================
        // FRANK'S WINDOW (using LAYOUT)
        // =================================================================

        drawWindow(g, LAYOUT.window.x, roofY, p, C);

        // =================================================================
        // ROOF SURFACE (shingled, slight perspective)
        // =================================================================

        g.fillStyle(C.SHINGLE_DARK);
        g.fillRect(0, roofY, worldWidth, height - roofY);

        // Shingles (overlapping rows)
        const shingleHeight = p * 6;
        for (let py = roofY; py < height; py += shingleHeight) {
            for (let px = 0; px < worldWidth; px += p * 16) {
                const offset = (Math.floor((py - roofY) / shingleHeight) % 2 === 0) ? 0 : p * 8;
                g.fillStyle(C.SHINGLE_MID);
                g.fillRect(px + offset, py, p * 15, shingleHeight);
                g.fillStyle(C.SHINGLE_EDGE);
                g.fillRect(px + offset, py + shingleHeight - p, p * 15, p);
                // Highlights on some shingles (moonlight)
                if ((px + py) % (p * 32) === 0) {
                    g.fillStyle(C.SHINGLE_LIGHT);
                    g.globalAlpha = 0.5;
                    g.fillRect(px + offset + p, py + p, p * 10, p);
                    g.globalAlpha = 1.0;
                }
            }
        }

        // =================================================================
        // SATELLITE DISH & ASSEMBLY (using LAYOUT)
        // =================================================================

        drawSatelliteAssembly(g, LAYOUT, roofY, p, C);
    }

    // =========================================================================
    // FURNITURE/OBJECT DRAWING FUNCTIONS
    // =========================================================================

    function drawWindow(g, centerX, floorY, p, C) {
        const windowWidth = p * 35;
        const windowHeight = floorY - 180;
        const frameWidth = p * 3;
        const windowY = 180;
        const x = centerX - windowWidth / 2;

        // Frame
        g.fillStyle(C.WINDOW_FRAME);
        g.fillRect(x - frameWidth, windowY - p * 5, windowWidth + frameWidth * 2, windowHeight + p * 5);

        // Glass (warm glow from inside - solid, no transparency)
        g.fillStyle(C.WINDOW_GLOW);
        g.fillRect(x, windowY, windowWidth, windowHeight);

        // Window muntins (4 panes) - drawn on top
        g.fillStyle(C.WINDOW_FRAME);
        g.fillRect(x + windowWidth / 2 - p, windowY, p * 2, windowHeight);
        g.fillRect(x, windowY + windowHeight / 2 - p, windowWidth, p * 2);

        // Note: Additional window glow atmosphere is handled by Phaser Light2D (see lighting.sources.window_glow)
    }

    function drawSatelliteAssembly(g, LAYOUT, roofY, p, C) {
        const dishCenterX = LAYOUT.satellite_dish.x;
        const dishCenterY = roofY - p * 60;  // Mounted on roof, extending up

        // =================================================================
        // BASE FRAMEWORK (support structure on roof)
        // =================================================================

        const baseWidth = p * 80;
        const baseHeight = p * 20;
        const baseY = roofY - baseHeight;

        // Framework base
        g.fillStyle(C.METAL_DARK);
        g.fillRect(dishCenterX - baseWidth / 2, baseY, baseWidth, baseHeight);

        // Cross beams
        g.fillStyle(C.METAL_MID);
        g.fillRect(dishCenterX - baseWidth / 2 + p * 4, baseY + p * 2, p * 6, baseHeight - p * 4);
        g.fillRect(dishCenterX + baseWidth / 2 - p * 10, baseY + p * 2, p * 6, baseHeight - p * 4);
        g.fillRect(dishCenterX - baseWidth / 2 + p * 4, baseY + baseHeight / 2 - p * 2, baseWidth - p * 8, p * 4);

        // Rivets
        g.fillStyle(C.METAL_LIGHT);
        for (let i = 0; i < 6; i++) {
            g.fillRect(dishCenterX - baseWidth / 2 + p * (12 + i * 12), baseY + p * 4, p * 2, p * 2);
        }

        // =================================================================
        // VERTICAL SUPPORT POST
        // =================================================================

        const postWidth = p * 12;
        const postHeight = p * 60;
        const postY = baseY - postHeight;

        g.fillStyle(C.METAL_DARK);
        g.fillRect(dishCenterX - postWidth / 2, postY, postWidth, postHeight);

        g.fillStyle(C.METAL_MID);
        g.fillRect(dishCenterX - postWidth / 2 + p * 2, postY + p * 2, postWidth - p * 4, postHeight - p * 4);

        // =================================================================
        // ROTATION MECHANISM (gears at base of dish)
        // =================================================================

        const gearCenterX = LAYOUT.gears_satellite.x;
        const gearY = roofY - p * 15;

        // Housing
        g.fillStyle(C.GEAR_DARK);
        g.fillRect(gearCenterX - p * 30, gearY - p * 10, p * 60, p * 18);

        // Large gear (visible through housing)
        g.fillStyle(C.GEAR_MID);
        g.fillRect(gearCenterX - p * 16, gearY - p * 6, p * 32, p * 12);

        // Gear teeth
        g.fillStyle(C.GEAR_BRONZE);
        for (let i = 0; i < 8; i++) {
            const toothX = gearCenterX - p * 16 + i * p * 4;
            g.fillRect(toothX, gearY - p * 8, p * 3, p * 2);
            g.fillRect(toothX, gearY + p * 6, p * 3, p * 2);
        }

        // Smaller interlocking gear
        g.fillStyle(C.GEAR_MID);
        g.fillRect(gearCenterX + p * 20, gearY - p * 4, p * 16, p * 8);
        g.fillStyle(C.GEAR_BRONZE);
        for (let i = 0; i < 4; i++) {
            g.fillRect(gearCenterX + p * 20 + i * p * 4, gearY - p * 6, p * 2, p);
        }

        // Pistons/servos
        g.fillStyle(C.METAL_DARK);
        g.fillRect(gearCenterX - p * 8, gearY - p * 20, p * 4, p * 10);
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(gearCenterX - p * 7, gearY - p * 18, p * 2, p * 6);

        // =================================================================
        // SATELLITE DISH (massive, angled upward)
        // =================================================================

        const dishWidth = p * 150;  // 600px - HUGE
        const dishHeight = p * 80;
        const dishY = postY - p * 40;

        // Dish back support arm
        g.fillStyle(C.METAL_DARK);
        g.fillRect(dishCenterX - p * 6, postY, p * 12, dishHeight);

        // Main dish surface (curved approximation with rectangles)
        g.fillStyle(C.DISH_DARK);
        g.fillRect(dishCenterX - dishWidth / 2, dishY, dishWidth, dishHeight);

        // Dish panels (concentric rings suggesting curve)
        g.fillStyle(C.DISH_MID);
        g.fillRect(dishCenterX - dishWidth / 2 + p * 10, dishY + p * 8, dishWidth - p * 20, dishHeight - p * 16);
        g.fillRect(dishCenterX - dishWidth / 2 + p * 20, dishY + p * 16, dishWidth - p * 40, dishHeight - p * 32);

        // Center dish highlight (focal point)
        g.fillStyle(C.DISH_LIGHT);
        g.fillRect(dishCenterX - p * 20, dishY + dishHeight / 2 - p * 10, p * 40, p * 20);

        // Dish shine (moonlight reflection)
        g.fillStyle(C.DISH_SHINE);
        g.globalAlpha = 0.5;
        g.fillRect(dishCenterX - p * 30, dishY + p * 12, p * 60, p * 8);
        g.globalAlpha = 1.0;

        // Rivet pattern
        g.fillStyle(C.METAL_DARK);
        for (let py = dishY + p * 12; py < dishY + dishHeight - p * 12; py += p * 12) {
            for (let px = dishCenterX - dishWidth / 2 + p * 16; px < dishCenterX + dishWidth / 2 - p * 16; px += p * 16) {
                g.fillRect(px, py, p * 2, p * 2);
            }
        }

        // Feed horn (at focal point, pointing at dish)
        g.fillStyle(C.METAL_MID);
        g.fillRect(dishCenterX - p * 6, dishY + dishHeight + p * 20, p * 12, p * 24);
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(dishCenterX - p * 8, dishY + dishHeight + p * 42, p * 16, p * 6);

        // =================================================================
        // CONTROL PANEL (on roof surface, near base)
        // =================================================================

        const panelX = LAYOUT.panel_control.x;
        const panelY = roofY - p * 30;
        const panelWidth = p * 28;
        const panelHeight = p * 35;  // Increased to contain all buttons

        // Panel housing
        g.fillStyle(C.PANEL_DARK);
        g.fillRect(panelX - panelWidth / 2, panelY, panelWidth, panelHeight);

        // Screen
        g.fillStyle(C.PANEL_SCREEN);
        g.fillRect(panelX - panelWidth / 2 + p * 2, panelY + p * 2, panelWidth - p * 4, p * 10);

        // Screen text (coordinate readout)
        g.fillStyle(C.PANEL_TEXT);
        g.fillRect(panelX - panelWidth / 2 + p * 4, panelY + p * 4, p * 20, p);
        g.fillRect(panelX - panelWidth / 2 + p * 4, panelY + p * 7, p * 18, p);

        // Keypad (3x3 grid)
        g.fillStyle(C.METAL_DARK);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const keyX = panelX - panelWidth / 2 + p * 4 + col * p * 7;
                const keyY = panelY + p * 14 + row * p * 6;
                g.fillRect(keyX, keyY, p * 6, p * 5);
                g.fillStyle(C.METAL_MID);
                g.fillRect(keyX + p, keyY + p, p * 4, p * 3);
                g.fillStyle(C.METAL_DARK);
            }
        }

        // ADJUST DISH button (bottom right)
        g.fillStyle(0x4a6a4a);
        g.fillRect(panelX + panelWidth / 2 - p * 10, panelY + panelHeight - p * 8, p * 8, p * 6);
        g.fillStyle(C.PANEL_GREEN);
        g.fillRect(panelX + panelWidth / 2 - p * 9, panelY + panelHeight - p * 7, p * 6, p * 4);

        // Panel indicator light (green, active)
        g.fillStyle(C.PANEL_GREEN);
        g.fillRect(panelX + panelWidth / 2 - p * 4, panelY + p * 4, p * 2, p * 2);

        // =================================================================
        // WARNING SIGNS (above control panel)
        // =================================================================

        const signY = panelY - p * 20;
        const signWidth = p * 24;
        const signHeight = p * 12;

        // Yellow warning sign background
        g.fillStyle(0xccaa22);
        g.fillRect(panelX - signWidth / 2, signY, signWidth, signHeight);

        // Black border
        g.fillStyle(0x1a1a1a);
        g.fillRect(panelX - signWidth / 2, signY, signWidth, p);
        g.fillRect(panelX - signWidth / 2, signY + signHeight - p, signWidth, p);
        g.fillRect(panelX - signWidth / 2, signY, p, signHeight);
        g.fillRect(panelX + signWidth / 2 - p, signY, p, signHeight);

        // Warning text (simplified - just bars representing text)
        g.fillStyle(0x1a1a1a);
        g.fillRect(panelX - signWidth / 2 + p * 2, signY + p * 2, signWidth - p * 4, p);
        g.fillRect(panelX - signWidth / 2 + p * 2, signY + p * 5, signWidth - p * 4, p);
        g.fillRect(panelX - signWidth / 2 + p * 2, signY + p * 8, signWidth - p * 6, p);

        // Warning stickers on panel
        g.fillStyle(0xaaaa22);
        g.globalAlpha = 0.8;
        g.fillRect(panelX - panelWidth / 2, panelY - p * 2, p * 8, p * 2);
        g.globalAlpha = 1.0;
    }

})();
