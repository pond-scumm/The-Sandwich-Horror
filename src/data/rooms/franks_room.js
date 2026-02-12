// ============================================================================
// FRANK'S ROOM - The Gardener's Sanctuary
// ============================================================================
// A cozy bedroom with a gentle, nurturing feel. Frank's love for gardening
// is evident everywhere - potted plants on every surface, a watering can,
// seed packets, and botanical drawings. This is where the caretaker rests.
//
// Connects to: second_floor (door left), roof (window right)
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
        door:          { x: 110, y: 0.48, w: 146, h: 0.474 },    // Door to hallway, far left
        window:        { x: 1170, y: 0.40, w: 146, h: 0.38 },    // Window to roof, far right
        bed:           { x: 640, y: 0.60, w: 440, h: 0.28 },     // Full bed, centered between door and window
        nightstand:    { x: 340, y: 0.64, w: 180, h: 0.22 },     // Nightstand on left of bed (2x larger)
        dresser:       { x: 950, y: 0.58, w: 140, h: 0.32 },     // Dresser, right side
        plant_floor_r: { x: 1070, y: 0.66, w: 60, h: 0.20 },     // Floor plant, between dresser and window
        botanical:     { x: 640, y: 0.28, w: 110, h: 0.18 }      // Botanical drawing, centered over bed
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.franks_room = {
        id: 'franks_room',
        name: "Frank's Room",

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
            ambient: 0x7a8070,
            ambientMobile: 0x9a9888,
            sources: [
                { id: 'lamp', x: 340, y: 0.54, radius: 280, color: 0xffdd88, intensity: 1.0 },
                { id: 'moonlight', x: 1170, y: 0.40, radius: 220, color: 0xaabbdd, intensity: 0.6 }
            ]
        },

        audio: {
            music: {
                key: 'interior_theme',
                volume: 0.4,
                fade: 1000
            },
            continueFrom: ['second_floor']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawFranksRoom
            }
        ],

        spawns: {
            default: { x: 134, y: 0.815, direction: 'right' },
            from_second_floor: { x: 134, y: 0.815, direction: 'right' },
            from_roof: { x: 1100, y: 0.815, direction: 'left' }
        },

        exits: [],

        npcs: [],

        firstVisit: {
            delay: 600,
            dialogue: "Frank's room. There are plants everywhere. This is someone who really cares about growing things."
        },

        // =====================================================================
        // HOTSPOTS
        // =====================================================================
        // Order: bottom to top (large background first, overlapping items after)

        hotspots: [
            // === BACK ROW (wall-mounted, large) ===
            {
                id: 'door_hallway',
                ...LAYOUT.door,
                interactX: LAYOUT.door.x, interactY: 0.82,
                name: 'Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "The door back to the hallway. I can hear the old house settling through it."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'second_floor',
                    spawnPoint: 'from_franks_room'
                }
            },
            {
                id: 'window_roof',
                ...LAYOUT.window,
                interactX: LAYOUT.window.x, interactY: 0.82,
                name: 'Window',
                verbs: { action: 'Climb out', look: 'Look through' },
                responses: {
                    look: "A window overlooking the roof. The moonlight's coming in through here. I can see the shingles, a chimney... and is that a SATELLITE DISH? A huge one. What is Hector using that for?"
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'roof',
                    spawnPoint: 'from_franks_room'
                }
            },
            {
                id: 'botanical_drawing',
                ...LAYOUT.botanical,
                interactX: LAYOUT.botanical.x, interactY: 0.82,
                name: 'Botanical Drawing',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A framed botanical illustration. Hand-drawn, detailed. It's a tomato plant at various stages - seedling, flowering, fruiting. Someone spent a lot of time on this.",
                    action: "It's not mine to take. But it's really well done. Frank has talent."
                }
            },

            // === MID ROW (furniture) ===
            {
                id: 'bed_frank',
                ...LAYOUT.bed,
                interactX: LAYOUT.bed.x, interactY: 0.82,
                name: 'Bed',
                verbs: { action: 'Lie down', look: 'Examine' },
                responses: {
                    look: "A simple twin bed with a patchwork quilt. It's made up neatly - hospital corners and everything. The pillow has a faint green stain on it. Grass? Fertilizer? Something plant-related.",
                    action: "Not my bed. I'm not that tired yet."
                }
            },
            {
                id: 'nightstand_frank',
                ...LAYOUT.nightstand,
                interactX: LAYOUT.nightstand.x, interactY: 0.82,
                name: 'Nightstand',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A small wooden nightstand with a reading lamp. There's a well-worn gardening book, a mug with cold tea, and a pencil. The book is bristling with bookmarks.",
                    action: "The book is 'Companion Planting for the Home Gardener.' Every page has notes in the margins. 'Basil next to tomatoes - yes!' 'Tried this - works!' This person really loves their plants."
                }
            },
            {
                id: 'dresser_frank',
                ...LAYOUT.dresser,
                interactX: LAYOUT.dresser.x, interactY: 0.82,
                name: 'Dresser',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A solid wooden dresser. The top is covered with small potted plants - succulents mostly, all thriving. There's also a collection of seed packets organized by season.",
                    action: "Drawers are full of neatly folded clothes. Everything smells like fresh soil and lavender. There's a pair of worn gardening gloves tucked in the corner."
                }
            },

            // === FRONT ROW (floor items) ===
            {
                id: 'plant_floor_right',
                ...LAYOUT.plant_floor_r,
                interactX: LAYOUT.plant_floor_r.x, interactY: 0.82,
                name: 'Potted Plant',
                verbs: { action: 'Water', look: 'Examine' },
                responses: {
                    look: "A rubber plant in a ceramic pot. Glossy leaves, healthy stem. There's a little hand-written tag stuck in the soil: 'Ruby - doing great!'",
                    action: "Ruby is doing great. She doesn't need my help."
                }
            }
        ]
    };

    // =========================================================================
    // DRAWING CODE
    // =========================================================================

    function drawFranksRoom(graphics, scene, worldWidth, height) {
        const g = graphics;
        const p = 4;
        const floorY = height * 0.72;
        const wainscotHeight = p * 35;

        // Warm, earthy color palette with green accents
        const C = {
            // Walls (slightly green-tinged)
            WALL_DARK:       0x1a1a15,
            WALL_MID:        0x2a2a25,
            WALL_LIGHT:      0x3a3a30,
            WALLPAPER:       0x2a2a20,
            WALLPAPER_LIGHT: 0x3a3a2a,

            // Wood (consistent with house)
            WOOD_DARK:       0x2a1a10,
            WOOD_MID:        0x4a3520,
            WOOD_LIGHT:      0x6a5030,
            WOOD_HIGHLIGHT:  0x8a6840,

            // Floor
            FLOOR_DARK:      0x2a1a12,
            FLOOR_MID:       0x3a2a20,
            FLOOR_LIGHT:     0x4a3a2a,

            // Quilt (patchwork colors)
            QUILT_GREEN:     0x3a4a35,
            QUILT_BLUE:      0x3a3a4a,
            QUILT_TAN:       0x5a4a3a,
            QUILT_DARK:      0x2a2a25,

            // Plants
            PLANT_DARK:      0x2a3a20,
            PLANT_MID:       0x3a5a30,
            PLANT_LIGHT:     0x5a7a50,
            PLANT_BRIGHT:    0x6a9a60,

            // Terracotta
            POT_DARK:        0x6a3a2a,
            POT_MID:         0x8a4a3a,
            POT_LIGHT:       0xaa5a4a,

            // Cream (pillows, lampshades)
            CREAM_DARK:      0xc0b8a0,
            CREAM_MID:       0xd8d0b8,
            CREAM_LIGHT:     0xe8e0d0,

            // Metals
            BRASS:           0x9a8540,
            GOLD:            0x8a7530,
            METAL_DARK:      0x5a5a5a,

            // Night sky
            SKY_DARK:        0x0a0a18,
            SKY_STAR:        0xeeeedd
        };

        // =================================================================
        // BACK WALL
        // =================================================================

        g.fillStyle(C.WALL_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        // Wall panels
        const panelWidth = p * 20;
        for (let px = 0; px < worldWidth; px += panelWidth) {
            g.fillStyle(C.WALL_MID);
            g.fillRect(px + p, p * 5, panelWidth - p * 2, floorY - wainscotHeight - p * 6);
            g.fillStyle(C.WALL_LIGHT);
            g.fillRect(px + p, p * 5, p, floorY - wainscotHeight - p * 6);
            g.fillStyle(C.WALL_DARK);
            g.fillRect(px + panelWidth - p * 2, p * 5, p, floorY - wainscotHeight - p * 6);
        }

        // Subtle wallpaper texture
        for (let py = p * 8; py < floorY - wainscotHeight - p * 2; py += p * 10) {
            for (let px = p * 6; px < worldWidth - p * 4; px += p * 16) {
                const offset = (Math.floor(py / (p * 10)) % 2 === 0) ? 0 : p * 8;
                if (Math.random() > 0.4) {
                    g.fillStyle(C.WALLPAPER);
                    g.fillRect(px + offset, py, p * 2, p * 2);
                }
            }
        }

        // Wainscoting
        const wainscotY = floorY - wainscotHeight;
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(0, wainscotY, worldWidth, wainscotHeight);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(0, wainscotY, worldWidth, p * 2);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(0, wainscotY, worldWidth, p);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(0, floorY - p * 2, worldWidth, p * 2);

        // Wainscot panels
        const wainscotPanelWidth = p * 28;
        for (let px = 0; px < worldWidth; px += wainscotPanelWidth) {
            g.fillStyle(C.WOOD_MID);
            g.fillRect(px + p * 3, wainscotY + p * 5, wainscotPanelWidth - p * 6, wainscotHeight - p * 10);
            g.fillStyle(C.WOOD_LIGHT);
            g.fillRect(px + p * 3, wainscotY + p * 5, wainscotPanelWidth - p * 6, p);
            g.fillRect(px + p * 3, wainscotY + p * 5, p, wainscotHeight - p * 11);
            g.fillStyle(C.WOOD_DARK);
            g.fillRect(px + p * 3, wainscotY + wainscotHeight - p * 6, wainscotPanelWidth - p * 6, p);
            g.fillRect(px + wainscotPanelWidth - p * 4, wainscotY + p * 6, p, wainscotHeight - p * 12);
        }

        // Crown molding
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(0, 0, worldWidth, p * 5);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(0, p * 4, worldWidth, p);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(0, p * 3, worldWidth, p);

        // =================================================================
        // FLOOR (hardwood)
        // =================================================================

        g.fillStyle(C.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        const boardWidth = p * 15;
        for (let bx = 0; bx < worldWidth; bx += boardWidth) {
            g.fillStyle(0x1a1510);
            g.fillRect(bx, floorY, p, height - floorY);
            g.fillStyle(C.FLOOR_MID);
            g.fillRect(bx + p, floorY, p, height - floorY);
            g.fillStyle(C.FLOOR_LIGHT);
            g.fillRect(bx + p * 4, floorY + p * 3, p * 8, p);
            g.fillRect(bx + p * 6, floorY + p * 10, p * 6, p);
        }

        // =================================================================
        // FURNITURE & PROPS (using LAYOUT)
        // =================================================================

        drawDoor(g, LAYOUT.door.x, floorY, p, C);
        drawWindow(g, LAYOUT.window.x, floorY, p, C);
        drawBotanicalDrawing(g, LAYOUT.botanical.x, floorY, p, C);
        drawFullBed(g, LAYOUT.bed.x, floorY, p, C);
        drawLargeNightstand(g, LAYOUT.nightstand.x, floorY, p, C);
        drawDresser(g, LAYOUT.dresser.x, floorY, p, C);
        drawFloorPlant(g, LAYOUT.plant_floor_r.x, floorY, p, C, 'rubber');
    }

    // =========================================================================
    // FURNITURE DRAWING FUNCTIONS
    // =========================================================================

    function drawDoor(g, x, floorY, p, C) {
        const doorHeight = floorY - 180;
        const doorWidth = p * 35;
        const frameWidth = p * 3;
        const doorY = 180;

        // Frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - doorWidth / 2 - frameWidth, doorY - p * 5, doorWidth + frameWidth * 2, doorHeight + p * 5);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - doorWidth / 2 - frameWidth, doorY - p * 5, p * 2, doorHeight + p * 5);
        g.fillRect(x + doorWidth / 2 + p, doorY - p * 5, p * 2, doorHeight + p * 5);
        g.fillRect(x - doorWidth / 2 - frameWidth, doorY - p * 5, doorWidth + frameWidth * 2, p * 2);

        // Door panel
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - doorWidth / 2, doorY, doorWidth, doorHeight);

        // Door panel insets (4-panel design)
        const panelInset = p * 4;
        const panelWidth = p * 12;
        const panelGap = p * 3;
        const topPanelHeight = p * 20;
        const bottomPanelHeight = p * 25;
        const topPanelY = doorY + p * 5;
        const bottomPanelY = doorY + p * 30;

        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - doorWidth / 2 + panelInset, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, topPanelY, panelWidth, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset, bottomPanelY, panelWidth, bottomPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, bottomPanelHeight);

        // Panel highlights
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - doorWidth / 2 + panelInset, topPanelY, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset, topPanelY, p, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, topPanelY, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, topPanelY, p, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset, bottomPanelY, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, bottomPanelY, p, bottomPanelHeight);

        // Panel shadows
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - doorWidth / 2 + panelInset, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth - p, topPanelY, p, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth * 2 + panelGap - p, topPanelY, p, topPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth - p, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth + panelGap, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x - doorWidth / 2 + panelInset + panelWidth * 2 + panelGap - p, bottomPanelY, p, bottomPanelHeight);

        // Brass handle
        const handleY = bottomPanelY + bottomPanelHeight + p * 6;
        const handleX = x + doorWidth / 2 - p * 10;
        g.fillStyle(C.BRASS);
        g.fillRect(handleX - p * 2, handleY - p * 5, p * 6, p * 14);
        g.fillStyle(C.GOLD);
        g.fillRect(handleX - p, handleY - p * 4, p * 4, p);
        g.fillStyle(C.BRASS);
        g.fillRect(handleX - p, handleY, p * 4, p * 4);
        g.fillStyle(C.GOLD);
        g.fillRect(handleX, handleY + p, p * 2, p * 2);
        g.fillStyle(0x1a1a1a);
        g.fillRect(handleX, handleY + p * 6, p * 2, p * 2);
        g.fillRect(handleX + p / 2, handleY + p * 7, p, p * 2);
    }

    function drawWindow(g, x, floorY, p, C) {
        const windowHeight = floorY - 180;
        const windowWidth = p * 35;
        const frameWidth = p * 3;
        const windowY = 180;

        // Frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - windowWidth / 2 - frameWidth, windowY - p * 5, windowWidth + frameWidth * 2, windowHeight + p * 5);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - windowWidth / 2 - frameWidth, windowY - p * 5, p * 2, windowHeight + p * 5);
        g.fillRect(x + windowWidth / 2 + p, windowY - p * 5, p * 2, windowHeight + p * 5);
        g.fillRect(x - windowWidth / 2 - frameWidth, windowY - p * 5, windowWidth + frameWidth * 2, p * 2);

        // Night sky through glass
        g.fillStyle(C.SKY_DARK);
        g.fillRect(x - windowWidth / 2, windowY, windowWidth, windowHeight);

        // Moon
        g.fillStyle(0xeeeedd);
        g.fillRect(x - p * 8, windowY + p * 12, p * 10, p * 10);
        g.fillStyle(0xffffee);
        g.fillRect(x - p * 6, windowY + p * 14, p * 6, p * 6);

        // Stars
        g.fillStyle(C.SKY_STAR);
        g.fillRect(x - p * 12, windowY + p * 6, p, p);
        g.fillRect(x + p * 8, windowY + p * 10, p, p);
        g.fillRect(x + p * 4, windowY + p * 25, p, p);
        g.fillRect(x - p * 15, windowY + p * 30, p, p);
        g.fillRect(x + p * 12, windowY + p * 35, p, p);

        // Window muntins (crossbars creating 4 panes)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - p * 2, windowY, p * 4, windowHeight);
        g.fillRect(x - windowWidth / 2, windowY + windowHeight / 2 - p * 2, windowWidth, p * 4);

        // Windowsill
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - windowWidth / 2 - p * 4, floorY - p * 4, windowWidth + p * 8, p * 4);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - windowWidth / 2 - p * 3, floorY - p * 3, windowWidth + p * 6, p * 2);
    }

    function drawBotanicalDrawing(g, x, floorY, p, C) {
        const frameWidth = p * 26;
        const frameHeight = p * 32;
        const frameY = p * 28;

        // Frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - frameWidth / 2 - p * 2, frameY - p * 2, frameWidth + p * 4, frameHeight + p * 4);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - frameWidth / 2, frameY, frameWidth, frameHeight);

        // Paper
        g.fillStyle(0xe8e0d0);
        g.fillRect(x - frameWidth / 2 + p * 2, frameY + p * 2, frameWidth - p * 4, frameHeight - p * 4);

        // Tomato plant drawing (simple botanical style)
        const plantX = x;
        const plantY = frameY + p * 6;

        // Stem
        g.fillStyle(0x3a4a30);
        g.fillRect(plantX - p, plantY + p * 4, p * 2, p * 14);

        // Leaves
        g.fillStyle(0x4a6a40);
        g.fillRect(plantX - p * 5, plantY + p * 6, p * 4, p * 3);
        g.fillRect(plantX + p * 2, plantY + p * 8, p * 4, p * 3);
        g.fillRect(plantX - p * 6, plantY + p * 11, p * 4, p * 3);
        g.fillRect(plantX + p * 3, plantY + p * 13, p * 4, p * 3);

        // Tomatoes
        g.fillStyle(0x9a3a2a);
        g.fillRect(plantX - p * 3, plantY + p * 16, p * 3, p * 3);
        g.fillRect(plantX + p * 2, plantY + p * 18, p * 3, p * 3);
    }

    function drawFullBed(g, x, floorY, p, C) {
        const bedWidth = p * 83;   // 0.75 of 2x width
        const bedHeight = p * 23;  // 1.25x taller
        const headboardHeight = p * 30;  // 1.25x taller
        const depthOffset = p * 10;
        const baseY = floorY - bedHeight + depthOffset;
        const sideWidth = p * 3;

        // Headboard (against wall)
        const hbY = baseY - headboardHeight;
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2, hbY, bedWidth, headboardHeight);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - bedWidth / 2 + p * 2, hbY + p * 2, bedWidth - p * 4, headboardHeight - p * 4);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - bedWidth / 2 + p * 3, hbY + p * 3, bedWidth - p * 6, p);

        // Left side panel (depth effect)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2 - sideWidth, baseY, sideWidth, bedHeight);

        // Bed frame (front face)
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - bedWidth / 2, baseY, bedWidth, bedHeight);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - bedWidth / 2 + p, baseY + p, bedWidth - p * 2, p);

        // Mattress visible above frame
        g.fillStyle(C.CREAM_DARK);
        g.fillRect(x - bedWidth / 2 + p * 2, baseY - p * 3, bedWidth - p * 4, p * 3);

        // Pillow
        g.fillStyle(C.CREAM_MID);
        g.fillRect(x - p * 10, baseY - p * 14, p * 20, p * 5);
        g.fillStyle(C.CREAM_LIGHT);
        g.fillRect(x - p * 8, baseY - p * 13, p * 4, p * 2);

        // Grass stain on pillow (subtle green)
        g.fillStyle(C.PLANT_DARK);
        g.globalAlpha = 0.3;
        g.fillRect(x - p * 4, baseY - p * 13, p * 6, p * 2);
        g.globalAlpha = 1.0;
    }

    function drawLargeNightstand(g, x, floorY, p, C) {
        const standWidth = p * 32;  // 2x wider
        const standHeight = p * 23;  // 1.25x taller
        const depthOffset = p * 10;
        const baseY = floorY - standHeight + depthOffset;
        const sideWidth = p * 3;

        // Left side panel (depth effect)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - standWidth / 2 - sideWidth, baseY, sideWidth, standHeight);

        // Main body
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - standWidth / 2, baseY, standWidth, standHeight);

        // Drawer
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - standWidth / 2 + p * 2, baseY + p * 8, standWidth - p * 4, p * 8);
        g.fillStyle(C.BRASS);
        g.fillRect(x - p * 2, baseY + p * 11, p * 4, p * 2);

        // Top surface
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - standWidth / 2 - p, baseY - p * 2, standWidth + p * 2, p * 2);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - standWidth / 2, baseY - p, standWidth, p);

        // Lamp on top
        const lampY = baseY - p * 2;

        // Lamp base
        g.fillStyle(C.BRASS);
        g.fillRect(x - p * 3, lampY - p * 3, p * 6, p * 3);

        // Lamp stem
        g.fillStyle(C.BRASS);
        g.fillRect(x - p, lampY - p * 14, p * 2, p * 12);

        // Lampshade
        g.fillStyle(C.CREAM_DARK);
        g.fillRect(x - p * 5, lampY - p * 20, p * 10, p * 7);
        g.fillStyle(C.CREAM_MID);
        g.fillRect(x - p * 4, lampY - p * 19, p * 8, p * 5);

        // Warm glow beneath shade
        g.fillStyle(0xffdd88);
        g.fillRect(x - p * 3, lampY - p * 13, p * 6, p * 2);

        // Gardening book on nightstand
        g.fillStyle(0x3a4a30);
        g.fillRect(x - standWidth / 2 + p * 2, baseY - p * 8, p * 8, p * 5);
        g.fillStyle(0x4a6a40);
        g.fillRect(x - standWidth / 2 + p * 3, baseY - p * 7, p * 6, p * 3);

        // Mug with cold tea
        const mugX = x + p * 2;
        const mugY = baseY - p * 9;
        g.fillStyle(0x6a6a5a);
        g.fillRect(mugX, mugY, p * 5, p * 6);
        g.fillStyle(0x7a7a6a);
        g.fillRect(mugX + p, mugY + p, p * 3, p * 4);
        // Cold tea surface
        g.fillStyle(0x4a3a2a);
        g.fillRect(mugX + p, mugY + p, p * 3, p);
        // Handle
        g.fillStyle(0x6a6a5a);
        g.fillRect(mugX + p * 5, mugY + p, p * 2, p * 4);
    }

    function drawDresser(g, x, floorY, p, C) {
        const dresserWidth = p * 35;
        const dresserHeight = p * 32;
        const depthOffset = p * 8;
        const baseY = floorY - dresserHeight + depthOffset;
        const sideWidth = p * 4;

        // Left side panel (depth effect)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - dresserWidth / 2 - sideWidth, baseY, sideWidth, dresserHeight);

        // Main body
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - dresserWidth / 2, baseY, dresserWidth, dresserHeight);

        // Drawers (3 rows)
        for (let i = 0; i < 3; i++) {
            const drawerY = baseY + p * 4 + i * p * 9;
            g.fillStyle(C.WOOD_LIGHT);
            g.fillRect(x - dresserWidth / 2 + p * 3, drawerY, dresserWidth - p * 6, p * 7);
            g.fillStyle(C.BRASS);
            g.fillRect(x - p * 2, drawerY + p * 3, p * 4, p * 2);
        }

        // Top surface
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - dresserWidth / 2 - p, baseY - p * 2, dresserWidth + p * 2, p * 2);

        // Potted succulents on top
        const potY = baseY - p * 2;

        // Succulent 1
        g.fillStyle(C.POT_MID);
        g.fillRect(x - p * 12, potY - p * 5, p * 6, p * 5);
        g.fillStyle(C.PLANT_MID);
        g.fillRect(x - p * 11, potY - p * 8, p * 4, p * 4);

        // Succulent 2
        g.fillStyle(C.POT_MID);
        g.fillRect(x - p * 3, potY - p * 6, p * 7, p * 6);
        g.fillStyle(C.PLANT_LIGHT);
        g.fillRect(x - p * 2, potY - p * 9, p * 5, p * 4);

        // Succulent 3
        g.fillStyle(C.POT_MID);
        g.fillRect(x + p * 6, potY - p * 5, p * 6, p * 5);
        g.fillStyle(C.PLANT_DARK);
        g.fillRect(x + p * 7, potY - p * 8, p * 4, p * 4);

        // Seed packets (stack of colorful rectangles)
        const colors = [0x9a6a4a, 0x6a8a5a, 0x7a5a4a, 0x5a7a6a];
        for (let i = 0; i < 4; i++) {
            g.fillStyle(colors[i]);
            g.fillRect(x + dresserWidth / 2 - p * 12, potY - p * 10 + i * p * 2, p * 8, p * 2);
        }
    }

    function drawFloorPlant(g, x, floorY, p, C, type) {
        const potWidth = p * 14;
        const potHeight = p * 8;
        const baseY = floorY + p * 2;

        // Terracotta pot
        g.fillStyle(C.POT_DARK);
        g.fillRect(x - potWidth / 2, baseY, potWidth, potHeight);
        g.fillStyle(C.POT_MID);
        g.fillRect(x - potWidth / 2 + p * 2, baseY + p, potWidth - p * 4, potHeight - p * 2);
        g.fillStyle(C.POT_LIGHT);
        g.fillRect(x - potWidth / 2 + p * 3, baseY + p * 2, p, potHeight - p * 4);

        // Rim
        g.fillStyle(C.POT_MID);
        g.fillRect(x - potWidth / 2 - p, baseY, potWidth + p * 2, p * 2);

        if (type === 'fern') {
            // Fern fronds
            g.fillStyle(C.PLANT_DARK);
            g.fillRect(x - p * 8, baseY - p * 12, p * 16, p * 2);
            g.fillRect(x - p * 6, baseY - p * 16, p * 12, p * 2);
            g.fillRect(x - p * 7, baseY - p * 10, p * 14, p * 2);

            g.fillStyle(C.PLANT_MID);
            g.fillRect(x - p * 7, baseY - p * 14, p * 14, p * 2);
            g.fillRect(x - p * 5, baseY - p * 18, p * 10, p * 2);

            g.fillStyle(C.PLANT_LIGHT);
            g.fillRect(x - p * 4, baseY - p * 20, p * 8, p * 2);
        } else if (type === 'rubber') {
            // Rubber plant stem - starts from inside the pot
            const stemStartY = baseY + p * 2;  // Start from near top of pot
            g.fillStyle(C.PLANT_DARK);
            g.fillRect(x - p, stemStartY - p * 20, p * 2, p * 20);

            // Large glossy leaves - positioned relative to stem
            g.fillStyle(C.PLANT_MID);
            g.fillRect(x - p * 8, stemStartY - p * 20, p * 10, p * 8);
            g.fillRect(x - p * 2, stemStartY - p * 16, p * 10, p * 8);
            g.fillRect(x - p * 6, stemStartY - p * 12, p * 10, p * 8);

            g.fillStyle(C.PLANT_LIGHT);
            g.fillRect(x - p * 6, stemStartY - p * 18, p * 4, p * 2);
            g.fillRect(x, stemStartY - p * 14, p * 4, p * 2);
        }
    }

})();
