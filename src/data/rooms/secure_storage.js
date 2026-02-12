// ============================================================================
// SECURE STORAGE (BACK LAB) - Laser Grid and Robot Security
// ============================================================================
// An extension of the main laboratory. More utilitarian and security-focused.
// Houses secure storage protected by a laser grid and backup security robot.
// The fuses Nate needs are locked behind the lasers. The robot deploys from
// the "AUX SEC" hatch when the generator is unplugged (Puzzle #8).
//
// Connects to: laboratory (center-left door)
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
        // Far left - fire extinguisher on wall
        fire_ext:       { x: 140, y: 0.457, w: 53, h: 0.172 },

        // Left - Large workbench (all items aligned to actual drawing positions)
        workbench:      { x: 321, y: 0.582, w: 234, h: 0.092 },
        beaker_holder:  { x: 345, y: 0.395, w: 141, h: 0.062 },  // Tall stand with jar
        microscope:     { x: 546, y: 0.395, w: 40, h: 0.062 },   // On top of cabinet

        // Center-left - Equipment cabinet
        cabinet:        { x: 548, y: 0.598, w: 106, h: 0.316 },

        // Center-right - Laser doorway and grid (visual only, no hotspot for doorway)
        laser_doorway:  { x: 780, y: 0.52, w: 240, h: 0.44 },
        lasers_grid:    { x: 779, y: 0.465, w: 258, h: 0.506 },

        // Far right - "AUX SEC" robot hatch
        hatch_robot:    { x: 1101, y: 0.527, w: 154, h: 0.373 }
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.secure_storage = {
        id: 'secure_storage',
        name: "Back Lab",

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
            ambient: 0x7a8890,
            ambientMobile: 0x9aaa9a,
            sources: [
                { id: 'overhead_workbench', x: 320, y: 0.12, radius: 500, color: 0xffffdd, intensity: 1.3 },
                { id: 'overhead_auxsec', x: 1100, y: 0.12, radius: 500, color: 0xffffdd, intensity: 1.3 },
                { id: 'laser_glow_red', x: 780, y: 0.35, radius: 300, color: 0xff2222, intensity: 0.7 }
            ]
        },

        audio: {
            music: {
                key: 'lab_theme',
                volume: 0.5,
                fade: 500
            },
            continueFrom: ['laboratory']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawSecureStorageRoom
            }
        ],

        spawns: {
            default: { x: 120, y: 0.82 },
            from_laboratory: { x: 120, y: 0.82 }
        },

        exits: [
            {
                edge: 'left',
                x: 0,
                width: 80,
                target: 'laboratory',
                spawnPoint: 'from_secure_storage'
            }
        ],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================
        // Order: bottom to top (large background first, overlapping items after)

        hotspots: [
            // === LARGE WORKBENCH (left side) ===
            {
                id: 'workbench_lab',
                ...LAYOUT.workbench,
                interactX: LAYOUT.workbench.x, interactY: 0.82,
                name: 'Large Workbench',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A large metal workbench covered in colorful beakers, test tubes, papers, and equipment. The organized chaos of active research.",
                    action: "I carefully look through the clutter. Lots of interesting chemistry happening here, but nothing I can use right now."
                }
            },
            {
                id: 'beaker_holder',
                ...LAYOUT.beaker_holder,
                interactX: LAYOUT.beaker_holder.x, interactY: 0.82,
                name: 'Beaker Holder',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "",
                    action: ""
                }
            },
            {
                id: 'microscope',
                ...LAYOUT.microscope,
                interactX: LAYOUT.microscope.x, interactY: 0.82,
                name: 'Microscope',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "A professional-grade microscope. There's already a slide loaded. I can see something... moving?",
                    action: "I peer through the eyepiece. Whatever's on that slide is definitely alive. And angry."
                }
            },

            // === LASER GRID (center) ===
            {
                id: 'lasers_security',
                ...LAYOUT.lasers_grid,
                interactX: LAYOUT.lasers_grid.x, interactY: 0.82,
                name: 'Laser Grid',
                verbs: { action: 'Touch', look: 'Look at' },
                responses: {
                    look: "Red laser beams crisscrossing the doorway. They hum ominously. Probably the kind that vaporize things. Or at minimum, really hurt.",
                    action: "I hold my hand near one of the beams. The air gets warm. Yeah, I'm not testing that theory."
                }
            },

            // === ROBOT HATCH (next to laser doorway) ===
            {
                id: 'hatch_robot',
                ...LAYOUT.hatch_robot,
                interactX: LAYOUT.hatch_robot.x, interactY: 0.82,
                name: 'AUX SEC Hatch',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "A small panel labeled 'AUX SEC' - looks like some kind of charging station or deployment hatch. Military-grade, very utilitarian.",
                    action: "It's locked shut. There's a slot that looks like it could fit a padlock..."
                }
            },

            // === OTHER EQUIPMENT ===
            {
                id: 'cabinet_metal',
                ...LAYOUT.cabinet,
                interactX: LAYOUT.cabinet.x, interactY: 0.82,
                name: 'Equipment Cabinet',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "A metal cabinet with a glass door. Inside I can see various tools and parts. Pretty standard lab equipment.",
                    action: "It's locked. The door rattles but won't budge."
                }
            },
            {
                id: 'fire_extinguisher',
                ...LAYOUT.fire_ext,
                interactX: LAYOUT.fire_ext.x, interactY: 0.82,
                name: 'Fire Extinguisher',
                verbs: { action: 'Take', look: 'Look at' },
                responses: {
                    look: "A red fire extinguisher mounted on the wall. Required by law. Probably hasn't been inspected in years.",
                    action: "It's bolted to the wall. Plus I don't have a fire. Yet."
                }
            }
        ]
    };

    // =========================================================================
    // DRAWING CODE
    // =========================================================================

    function drawSecureStorageRoom(graphics, scene, worldWidth, height) {
        const g = graphics;
        const p = 4;  // Pixel unit
        const floorY = height * 0.72;

        // Industrial/Lab color palette
        const COLORS = {
            // Metals
            METAL_DARK:      0x2a2a2a,
            METAL_MID:       0x3a3a3a,
            METAL_LIGHT:     0x5a5a5a,
            METAL_HIGHLIGHT: 0x7a7a7a,

            // Concrete
            CONCRETE_DARK:   0x3a3a3a,
            CONCRETE_MID:    0x4a4a4a,
            CONCRETE_LIGHT:  0x5a5a5a,

            // Lab equipment colors
            LAB_GREEN:       0x2a8a4a,
            LAB_BLUE:        0x2a4a8a,
            LAB_PURPLE:      0x6a2a8a,
            LAB_CYAN:        0x2a8a8a,

            // Laser red
            LASER_RED:       0xff2222,
            LASER_GLOW:      0xff4444,

            // Accents
            YELLOW:          0xd0c030,
            RED:             0xa03020,
            WHITE:           0xe0e0e0,
            PAPER:           0xdad5c0,

            // Wood
            WOOD_DARK:       0x2a1a10,
            WOOD_MID:        0x4a3520
        };

        // =====================================================================
        // BACK WALL
        // =====================================================================

        g.fillStyle(COLORS.CONCRETE_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        // Wall panels (industrial aesthetic)
        for (let x = 0; x < worldWidth; x += p * 80) {
            g.fillStyle(COLORS.CONCRETE_MID);
            g.fillRect(x + p * 4, p * 10, p * 72, floorY - p * 20);

            // Panel edges
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(x + p * 4, p * 10, p * 2, floorY - p * 20);
            g.fillRect(x + p * 74, p * 10, p * 2, floorY - p * 20);
        }

        // Exposed conduit along ceiling
        g.fillStyle(COLORS.METAL_MID);
        for (let x = p * 20; x < worldWidth; x += p * 100) {
            g.fillRect(x, p * 5, p * 3, p * 3);
            g.fillRect(x + p * 3, p * 6, p * 30, p * 2);
        }

        // Two harsh overhead fluorescents (workbench and AUX SEC)
        const lightY = height * 0.12;
        const lightPositions = [320, 1100];  // Over workbench and AUX SEC

        lightPositions.forEach(lightX => {
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(lightX - p * 15, lightY, p * 30, p * 3);
            g.fillStyle(0xffffdd);
            g.fillRect(lightX - p * 14, lightY + p, p * 28, p);
        });

        // =====================================================================
        // FLOOR
        // =====================================================================

        g.fillStyle(COLORS.CONCRETE_MID);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Concrete texture
        for (let y = floorY + p * 8; y < height; y += p * 16) {
            for (let x = p * 10; x < worldWidth; x += p * 30) {
                if (Math.random() > 0.7) {
                    g.fillStyle(COLORS.CONCRETE_DARK);
                    g.fillRect(x, y, p * 12, p);
                }
            }
        }

        // =====================================================================
        // FURNITURE & PROPS (using LAYOUT for positions)
        // =====================================================================

        // Draw in depth order: back to front
        drawLargeWorkbench(g, LAYOUT.workbench.x, floorY, p, COLORS);
        drawSecureDoorway(g, LAYOUT.laser_doorway.x, floorY, p, COLORS);
        drawLaserGrid(g, LAYOUT.lasers_grid.x, floorY, p, COLORS);
        drawRobotHatch(g, LAYOUT.hatch_robot.x, floorY, p, COLORS);
        drawEquipmentCabinet(g, LAYOUT.cabinet.x, floorY, p, COLORS);
        drawFireExtinguisher(g, LAYOUT.fire_ext.x, floorY, p, COLORS);
    }

    // =========================================================================
    // FURNITURE DRAWING FUNCTIONS
    // =========================================================================

    function drawLargeWorkbench(g, x, floorY, p, C) {
        const benchWidth = p * 60;
        const benchHeight = p * 20;
        const legHeight = p * 25;
        const depthOffset = p * 10;
        const baseY = floorY - legHeight - benchHeight + depthOffset;

        // Metal tabletop
        g.fillStyle(C.METAL_MID);
        g.fillRect(x - benchWidth/2, baseY, benchWidth, benchHeight);

        // Edge highlight
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - benchWidth/2, baseY, benchWidth, p);

        // Table legs
        g.fillStyle(C.METAL_DARK);
        const legWidth = p * 3;
        g.fillRect(x - benchWidth/2 + p * 5, baseY + benchHeight, legWidth, legHeight);
        g.fillRect(x + benchWidth/2 - p * 8, baseY + benchHeight, legWidth, legHeight);

        // === ITEMS ON WORKBENCH ===
        // Beaker holder with glass jar (left side)
        drawBeakerHolder(g, x - benchWidth/2 + p * 20, baseY, p, C);

        // Papers evenly spaced on bench (4 stacks)
        g.fillStyle(C.PAPER);
        const paperWidth = p * 8;
        const paperHeight = p * 10;
        const numPapers = 4;
        const spacing = benchWidth / (numPapers + 1);

        for (let i = 0; i < numPapers; i++) {
            const paperX = x - benchWidth/2 + spacing * (i + 1) - paperWidth/2;
            g.fillRect(paperX, baseY + p * 4, paperWidth, paperHeight);

            // Lines on paper (consistent)
            g.fillStyle(C.METAL_DARK);
            for (let j = 0; j < 3; j++) {
                g.fillRect(paperX + p, baseY + p * 6 + j * p * 2, p * 6, p);
            }
            g.fillStyle(C.PAPER);
        }
    }

    function drawSecureDoorway(g, x, floorY, p, C) {
        const doorWidth = p * 60;   // 1.5x wider (was 40)
        const doorHeight = p * 90;
        const frameWidth = p * 4;
        const baseY = floorY - doorHeight;

        // Heavy reinforced frame
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 3, doorWidth + frameWidth * 2, doorHeight + frameWidth * 3);

        // Door opening (dark interior/storage area beyond)
        g.fillStyle(0x0a0a0a);  // Very dark - storage behind lasers
        g.fillRect(x - doorWidth/2, baseY, doorWidth, doorHeight);

        // Frame highlights (industrial look)
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 3, frameWidth, doorHeight + frameWidth * 3);
        g.fillRect(x + doorWidth/2, baseY - frameWidth * 3, frameWidth, doorHeight + frameWidth * 3);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 3, doorWidth + frameWidth * 2, frameWidth);

        // Warning stripes on frame (more of them for wider door)
        g.fillStyle(C.YELLOW);
        for (let i = 0; i < 4; i++) {
            g.fillRect(x - doorWidth/2 - frameWidth, baseY + i * p * 20, frameWidth, p * 8);
            g.fillRect(x + doorWidth/2, baseY + i * p * 20, frameWidth, p * 8);
        }
    }

    function drawLaserGrid(g, x, floorY, p, C) {
        const gridWidth = p * 60;   // Match full door width (was 40)
        const gridHeight = p * 90;  // Match full door height (was 80)
        const baseY = floorY - gridHeight;

        // Red laser beams (vertical) - 7 beams across wider door
        g.fillStyle(C.LASER_RED);
        for (let i = 0; i < 7; i++) {
            const laserX = x - gridWidth/2 + i * (gridWidth / 6);
            g.fillRect(laserX, baseY, p, gridHeight);
        }

        // Red laser beams (horizontal) - 8 beams for full height
        for (let i = 0; i < 8; i++) {
            const laserY = baseY + i * (gridHeight / 7);
            g.fillRect(x - gridWidth/2, laserY, gridWidth, p);
        }

        // Extended red glow effect - multiple layers covering whole grid area
        const glowLayers = [
            { color: 0x1a0505, width: p * 8 },  // Very wide atmospheric glow (darkest)
            { color: 0x2a0808, width: p * 6 },  // Wide atmospheric glow
            { color: 0x3a0c0c, width: p * 5 },  // Medium-wide glow
            { color: 0x4a1010, width: p * 4 },  // Outer glow
            { color: 0x6a1818, width: p * 3 },  // Mid glow
            { color: 0x9a2020, width: p * 2 },  // Inner glow
            { color: 0xcc3030, width: p }       // Closest to beam (brightest)
        ];

        // Apply glow layers (draw from widest to narrowest)
        glowLayers.forEach(layer => {
            g.fillStyle(layer.color);

            // Vertical beam glows
            for (let i = 0; i < 7; i++) {
                const laserX = x - gridWidth/2 + i * (gridWidth / 6);
                const offset = Math.floor(layer.width / 2);
                g.fillRect(laserX - offset, baseY, layer.width, gridHeight);
            }

            // Horizontal beam glows
            for (let i = 0; i < 8; i++) {
                const laserY = baseY + i * (gridHeight / 7);
                const offset = Math.floor(layer.width / 2);
                g.fillRect(x - gridWidth/2, laserY - offset, gridWidth, layer.width);
            }
        });

        // Emitters at intersection points (small nodes)
        g.fillStyle(C.RED);
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 8; j++) {
                const nodeX = x - gridWidth/2 + i * (gridWidth / 6);
                const nodeY = baseY + j * (gridHeight / 7);
                g.fillRect(nodeX - p, nodeY - p, p * 2, p * 2);
            }
        }
    }

    function drawRobotHatch(g, x, floorY, p, C) {
        const hatchWidth = p * 40;
        const hatchHeight = p * 70;
        const baseY = floorY - hatchHeight;  // Flat against wall, no depth offset

        // "AUX SEC" text painted on wall ABOVE the door (properly centered at x)
        g.fillStyle(C.YELLOW);
        const textY = baseY - p * 12;
        // Total width of "AUX SEC" = 51p, so start at x - 25.5p to center
        const textStartX = x - p * 26;

        // A
        g.fillRect(textStartX, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 2, textY, p * 4, p * 2);
        g.fillRect(textStartX + p * 6, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 2, textY + p * 4, p * 4, p * 2);
        // U
        g.fillRect(textStartX + p * 10, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 16, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 12, textY + p * 6, p * 4, p * 2);
        // X
        g.fillRect(textStartX + p * 20, textY, p * 2, p * 2);
        g.fillRect(textStartX + p * 22, textY + p * 2, p * 2, p * 2);
        g.fillRect(textStartX + p * 24, textY + p * 4, p * 2, p * 2);
        g.fillRect(textStartX + p * 26, textY + p * 6, p * 2, p * 2);
        g.fillRect(textStartX + p * 26, textY, p * 2, p * 2);
        g.fillRect(textStartX + p * 24, textY + p * 2, p * 2, p * 2);
        g.fillRect(textStartX + p * 20, textY + p * 6, p * 2, p * 2);

        // (space) then SEC on same line
        // S
        g.fillRect(textStartX + p * 30, textY, p * 6, p * 2);
        g.fillRect(textStartX + p * 30, textY, p * 2, p * 4);
        g.fillRect(textStartX + p * 30, textY + p * 3, p * 6, p * 2);
        g.fillRect(textStartX + p * 34, textY + p * 4, p * 2, p * 4);
        g.fillRect(textStartX + p * 30, textY + p * 6, p * 6, p * 2);
        // E
        g.fillRect(textStartX + p * 38, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 38, textY, p * 6, p * 2);
        g.fillRect(textStartX + p * 38, textY + p * 3, p * 5, p * 2);
        g.fillRect(textStartX + p * 38, textY + p * 6, p * 6, p * 2);
        // C
        g.fillRect(textStartX + p * 46, textY, p * 5, p * 2);
        g.fillRect(textStartX + p * 46, textY, p * 2, p * 8);
        g.fillRect(textStartX + p * 46, textY + p * 6, p * 5, p * 2);

        // ===== HATCH DOOR (flat against wall) =====

        // Outer frame (thick border)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - hatchWidth/2 - p * 3, baseY - p * 3, hatchWidth + p * 6, hatchHeight + p * 3);

        // Main door panel
        g.fillStyle(C.METAL_MID);
        g.fillRect(x - hatchWidth/2, baseY, hatchWidth, hatchHeight);

        // Door edge highlight
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - hatchWidth/2 + p, baseY + p, hatchWidth - p * 2, p * 2);
        g.fillRect(x - hatchWidth/2 + p, baseY + p, p * 2, hatchHeight - p * 2);

        // Inset panel
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - hatchWidth/2 + p * 4, baseY + p * 4, hatchWidth - p * 8, hatchHeight - p * 8);

        // Rivets/bolts around door (3 on top, 3 on bottom - evenly spaced)
        g.fillStyle(C.METAL_HIGHLIGHT);
        const rivetSize = p * 2;

        // Top row - 3 rivets evenly spaced
        g.fillRect(x - p * 12, baseY + p * 2, rivetSize, rivetSize);  // Left
        g.fillRect(x - p, baseY + p * 2, rivetSize, rivetSize);        // Center
        g.fillRect(x + p * 10, baseY + p * 2, rivetSize, rivetSize);   // Right

        // Bottom row - 3 rivets evenly spaced (same x positions)
        g.fillRect(x - p * 12, baseY + hatchHeight - p * 4, rivetSize, rivetSize);  // Left
        g.fillRect(x - p, baseY + hatchHeight - p * 4, rivetSize, rivetSize);        // Center
        g.fillRect(x + p * 10, baseY + hatchHeight - p * 4, rivetSize, rivetSize);   // Right

        // Handle/lock mechanism (centered)
        g.fillStyle(C.METAL_HIGHLIGHT);
        g.fillRect(x - p * 6, baseY + hatchHeight - p * 20, p * 12, p * 8);
        g.fillStyle(C.METAL_DARK);
        // Keyhole/padlock slot
        g.fillRect(x - p * 3, baseY + hatchHeight - p * 18, p * 6, p * 4);
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - p * 2, baseY + hatchHeight - p * 17, p * 4, p * 2);

        // ===== WARNING STRIPES (full height, symmetrical) =====
        const stripeWidth = p * 3;
        const stripeHeight = p * 8;
        const numStripes = Math.ceil(hatchHeight / stripeHeight);

        // Left side stripes (full height)
        for (let i = 0; i < numStripes; i++) {
            g.fillStyle((i % 2 === 0) ? C.YELLOW : 0x000000);
            g.fillRect(x - hatchWidth/2 - p * 6, baseY + i * stripeHeight, stripeWidth, stripeHeight);
        }

        // Right side stripes (full height, mirror)
        for (let i = 0; i < numStripes; i++) {
            g.fillStyle((i % 2 === 0) ? C.YELLOW : 0x000000);
            g.fillRect(x + hatchWidth/2 + p * 3, baseY + i * stripeHeight, stripeWidth, stripeHeight);
        }
    }

    function drawEquipmentCabinet(g, x, floorY, p, C) {
        const cabWidth = p * 25;
        const cabHeight = p * 60;
        const depthOffset = p * 8;  // Reduced from p * 12 for less depth
        const baseY = floorY - cabHeight + depthOffset;
        const sideWidth = p * 3;

        // Left side panel (depth effect)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - cabWidth/2 - sideWidth, baseY, sideWidth, cabHeight);

        // Main body
        g.fillStyle(C.METAL_MID);
        g.fillRect(x - cabWidth/2, baseY, cabWidth, cabHeight);

        // Glass door
        g.fillStyle(0x3a4a5a);
        g.fillRect(x - cabWidth/2 + p * 2, baseY + p * 2, cabWidth - p * 4, cabHeight - p * 4);

        // Glass shine
        g.fillStyle(0x5a6a7a);
        g.fillRect(x - cabWidth/2 + p * 3, baseY + p * 3, p * 2, p * 10);

        // Items visible inside (vague shapes)
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - p * 6, baseY + p * 10, p * 12, p * 4);
        g.fillRect(x - p * 8, baseY + p * 20, p * 8, p * 6);
        g.fillRect(x, baseY + p * 30, p * 6, p * 8);

        // Door handle
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x + cabWidth/2 - p * 6, baseY + cabHeight/2, p * 3, p * 6);

        // === MICROSCOPE ON TOP OF CABINET ===
        const microX = x;
        const microY = baseY - p * 10;
        g.fillStyle(C.METAL_MID);
        g.fillRect(microX - p * 4, microY, p * 8, p * 10);
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(microX - p * 2, microY - p * 2, p * 4, p * 2);
        g.fillStyle(C.METAL_DARK);
        g.fillRect(microX - p, microY - p * 4, p * 2, p * 2);
    }

    function drawBeakerHolder(g, x, baseY, p, C) {
        const standWidth = p * 2;
        const standHeight = p * 24;
        const baseWidth = p * 12;      // 2x larger
        const baseHeight = p * 4;      // 2x larger
        const armLength = p * 18;      // Length to jar start
        const armThickness = p * 2;    // 2x thicker
        const jarWidth = p * 10;       // 2x larger
        const jarHeight = p * 14;      // 2x larger

        // Base (on workbench surface) - 2x larger
        g.fillStyle(0x1a1a1a);  // Black
        g.fillRect(x - baseWidth/2, baseY - baseHeight, baseWidth, baseHeight);

        // Tall stand
        g.fillStyle(0x1a1a1a);  // Black
        g.fillRect(x - standWidth/2, baseY - standHeight, standWidth, standHeight);

        // Glass jar - positioned on the arm
        const jarX = x + armLength;
        const armY = baseY - standHeight - armThickness/2;
        const jarY = armY + armThickness/2 - jarHeight/2;  // Center jar on arm

        // Jar body (glass - semi-transparent blue-ish)
        g.fillStyle(0x4a6a7a);
        g.fillRect(jarX, jarY, jarWidth, jarHeight);

        // Liquid inside (greenish/cyan chemical)
        g.fillStyle(C.LAB_CYAN);
        g.fillRect(jarX + p, jarY + p * 3, jarWidth - p * 2, jarHeight - p * 5);

        // Glass highlight
        g.fillStyle(0x8aaaaa);
        g.fillRect(jarX, jarY, p, jarHeight - p);
        g.fillRect(jarX, jarY, jarWidth - p, p);

        // Jar rim (darker)
        g.fillStyle(0x2a3a4a);
        g.fillRect(jarX, jarY, jarWidth, p);

        // Arm extending through/over the glass (drawn last so it's on top)
        const totalArmLength = armLength + jarWidth + p * 4;  // Extends through jar and beyond
        g.fillStyle(0x1a1a1a);
        g.fillRect(x, armY, totalArmLength, armThickness);
    }

    function drawFireExtinguisher(g, x, floorY, p, C) {
        const extWidth = p * 8;
        const extHeight = p * 24;
        const baseY = floorY - p * 60;  // Wall-mounted

        // Wall bracket
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - p * 6, baseY - p * 2, p * 12, p * 30);

        // Extinguisher body
        g.fillStyle(C.RED);
        g.fillRect(x - extWidth/2, baseY, extWidth, extHeight);

        // Highlight
        g.fillStyle(0xc04030);
        g.fillRect(x - extWidth/2, baseY, p * 2, extHeight);

        // Nozzle
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - p * 2, baseY - p * 4, p * 4, p * 4);
        g.fillRect(x + p * 2, baseY - p * 2, p * 8, p * 2);

        // Handle
        g.fillStyle(C.METAL_HIGHLIGHT);
        g.fillRect(x - p * 3, baseY + p * 4, p * 6, p * 2);
        g.fillRect(x - p * 3, baseY + p * 4, p, p * 6);
        g.fillRect(x + p * 2, baseY + p * 4, p, p * 6);

        // Gauge
        g.fillStyle(C.WHITE);
        g.fillRect(x - p * 2, baseY + p * 12, p * 4, p * 4);
        g.fillStyle(C.YELLOW);
        g.fillRect(x - p, baseY + p * 13, p * 2, p * 2);
    }

})();
