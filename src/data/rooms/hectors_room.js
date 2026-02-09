// ============================================================================
// HECTOR'S BEDROOM - Private Sanctuary
// ============================================================================
// A cozy private bedroom above the side room. Warm, comfortable, and
// revealing of Hector's softer side. No science equipment here — just the
// private life of a man who spends too much time in his lab.
//
// Connects to: back_lab (stairs down)
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
        door:         { x: 110, y: 0.48, w: 146, h: 0.474 },    // Door to stairs, far left
        exit_stairs:  { x: 1100, y: 0.92, w: 180, h: 0.08 },    // Exit hotspot (lower right corner)
        artwork:      { x: 560, y: 0.275, w: 346, h: 0.192 },   // Art: center=(387+733)/2=560, y=(0.179+0.371)/2=0.275, w=346, h=0.192
        nightstand_l: { x: 310, y: 0.62, w: 105, h: 0.24 },     // Left nightstand (1.5x larger)
        photo:        { x: 290, y: 0.58, w: 52, h: 0.09 },      // Framed photo on left nightstand
        bed:          { x: 563.5, y: 0.5735, w: 339, h: 0.305 },// Bed: center=(394+733)/2=563.5, y=(0.421+0.726)/2=0.5735, w=339, h=0.305
        nightstand_r: { x: 810, y: 0.62, w: 105, h: 0.24 },     // Right nightstand (1.5x larger)
        robe:         { x: 900, y: 0.38, w: 50, h: 0.20 },      // Robe on hook (adjusted to match visual)
        closet:       { x: 1070, y: 0.46, w: 150, h: 0.48 },    // Open closet with goggles
        dog_bed:      { x: 1210, y: 0.78, w: 120, h: 0.08 }     // Dog bed in corner (adjusted to match visual)
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.hectors_room = {
        id: 'hectors_room',
        name: "Hector's Bedroom",

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
            ambient: 0x8a7060,
            ambientMobile: 0xa88878,
            sources: [
                { id: 'lamp_left', x: 308, y: 0.528, radius: 300, color: 0xffdd88, intensity: 1.0 },
                { id: 'lamp_right', x: 807, y: 0.528, radius: 300, color: 0xffdd88, intensity: 1.0 },
                { id: 'moonlight', x: 420, y: 0.45, radius: 250, color: 0xaabbdd, intensity: 0.5 }
            ]
        },

        audio: {
            music: {
                key: 'hector_theme',
                volume: 0.4,
                fade: 1000
            },
            continueFrom: ['back_lab']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawHectorsRoom
            }
        ],

        spawns: {
            default: { x: 1093, y: 0.808, direction: 'left' },
            from_back_lab: { x: 1049, y: 0.864, direction: 'left' },
            from_second_floor: { x: 134, y: 0.815, direction: 'right' }
        },

        exits: [],

        npcs: [],

        firstVisit: {
            delay: 600,
            dialogue: "This must be Hector's bedroom. It's... cozy. Really cozy, actually."
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
                    look: "A solid wooden door. Leads out to the hallway."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'second_floor',
                    spawnPoint: 'from_hectors_room'
                }
            },
            {
                id: 'exit_stairs',
                ...LAYOUT.exit_stairs,
                interactX: LAYOUT.exit_stairs.x, interactY: 0.92,
                name: 'Stairs Down',
                verbs: { action: 'Go down', look: 'Look at' },
                responses: {
                    look: "The stairs leading back down to the side room."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'back_lab',
                    spawnPoint: 'from_hectors_room'
                }
            },
            {
                id: 'artwork_bed',
                ...LAYOUT.artwork,
                interactX: LAYOUT.artwork.x, interactY: 0.82,
                name: 'Artwork',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A large painting over the bed. Abstract, lots of blues and greens. Peaceful. Like looking into calm water.",
                    action: "It's mounted pretty solidly to the wall. Also, it's not mine."
                }
            },
            {
                id: 'closet_hector',
                ...LAYOUT.closet,
                interactX: LAYOUT.closet.x, interactY: 0.82,
                name: 'Closet',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "An open closet, mostly empty. A few shirts, nothing fancy. But there's a pair of Hector's goggles hanging on a hook inside. The iconic ones.",
                    action: "I should probably leave Hector's personal stuff alone. For now."
                }
            },
            {
                id: 'robe_hook',
                ...LAYOUT.robe,
                interactX: LAYOUT.robe.x, interactY: 0.82,
                name: 'Bathrobe',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A well-worn bathrobe on a wall hook. The terrycloth kind. This thing has seen some long nights.",
                    action: "It's not my bathrobe. That would be weird."
                }
            },

            // === MID ROW (furniture) ===
            {
                id: 'bed_hector',
                ...LAYOUT.bed,
                interactX: LAYOUT.bed.x, interactY: 0.82,
                name: 'Bed',
                verbs: { action: 'Lie down', look: 'Examine' },
                responses: {
                    look: "A solid, comfortable bed with warm wool blankets. Rumpled on one side like someone got up in a hurry. The pillow still has a head-shaped dent.",
                    action: "Tempting, but I'm on the clock. Also it's somebody else's bed."
                }
            },
            {
                id: 'nightstand_left',
                ...LAYOUT.nightstand_l,
                interactX: LAYOUT.nightstand_l.x, interactY: 0.82,
                name: 'Nightstand',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A small nightstand with a warm lamp. There's a book of poetry, a pair of reading glasses, and a framed photo. The essentials.",
                    action: "A bookmark about two-thirds through the poetry book. Reading glasses sitting on top, lenses smudged. This is a man's bedtime routine."
                }
            },
            {
                id: 'photo_frame',
                ...LAYOUT.photo,
                interactX: LAYOUT.nightstand_l.x, interactY: 0.82,
                name: 'Framed Photo',
                verbs: { action: 'Pick up', look: 'Examine' },
                responses: {
                    look: "Hector, a woman, and a big goofy dog. Everyone's smiling. Wherever this was taken, it looks like a really good day.",
                    action: "I shouldn't... but the frame's warm from the lamp. Someone looks at this every night."
                }
            },
            {
                id: 'nightstand_right',
                ...LAYOUT.nightstand_r,
                interactX: LAYOUT.nightstand_r.x, interactY: 0.82,
                name: 'Nightstand',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Another lamp, and a cup of tea. Stone cold. He got pulled away mid-evening and never came back.",
                    action: "The tea has a skin on it. That's been sitting here a while."
                }
            },

            // === FRONT ROW (floor items) ===
            {
                id: 'dog_bed_empty',
                ...LAYOUT.dog_bed,
                interactX: LAYOUT.dog_bed.x, interactY: 0.82,
                name: 'Dog Bed',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A dog bed in the corner. Empty. There's still fur on it. Same dog from the photo on the nightstand?",
                    action: "Just a well-worn cushion. No dog. No note. Just... gone."
                }
            }
        ]
    };

    // =========================================================================
    // DRAWING CODE
    // =========================================================================

    function drawHectorsRoom(graphics, scene, worldWidth, height) {
        const g = graphics;
        const p = 4;
        const floorY = height * 0.72;
        const wainscotHeight = p * 35;

        // Warm bedroom color palette
        const C = {
            // Walls (warmer than standard house palette)
            WALL_DARK:       0x251520,
            WALL_MID:        0x352530,
            WALL_LIGHT:      0x453540,
            WALLPAPER:       0x3a2830,
            WALLPAPER_LIGHT: 0x4a3840,

            // Wood (consistent with house)
            WOOD_DARK:       0x2a1a10,
            WOOD_MID:        0x4a3520,
            WOOD_LIGHT:      0x6a5030,
            WOOD_HIGHLIGHT:  0x8a6840,

            // Floor
            FLOOR_DARK:      0x2a1a12,
            FLOOR_MID:       0x3a2a20,
            FLOOR_LIGHT:     0x4a3a2a,

            // Fabric (curtains)
            FABRIC_DARK:     0x2a1520,
            FABRIC_MID:      0x4a2535,
            FABRIC_LIGHT:    0x5a3545,

            // Blankets (deep blue-grey wool)
            BLANKET_DARK:    0x1a2535,
            BLANKET_MID:     0x2a3a50,
            BLANKET_LIGHT:   0x3a4a60,

            // Cream (pillows, lampshades)
            CREAM_DARK:      0xc0b8a0,
            CREAM_MID:       0xd8d0b8,
            CREAM_LIGHT:     0xe8e0d0,

            // Metals
            BRASS:           0x9a8540,
            GOLD:            0x8a7530,
            METAL_DARK:      0x3a3a3a,

            // Rug
            RUG_DARK:        0x3a1a15,
            RUG_MID:         0x5a2a25,
            RUG_PATTERN:     0x6a3a30,
            RUG_GOLD:        0x8a7530
        };

        // =================================================================
        // BACK WALL (warm wallpaper)
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

        // Wallpaper pattern (subtle warm diamond motif)
        for (let py = p * 8; py < floorY - wainscotHeight - p * 2; py += p * 10) {
            for (let px = p * 6; px < worldWidth - p * 4; px += p * 16) {
                const offset = (Math.floor(py / (p * 10)) % 2 === 0) ? 0 : p * 8;
                if (Math.random() > 0.3) {
                    g.fillStyle(C.WALLPAPER);
                    g.fillRect(px + offset, py, p * 2, p * 2);
                    g.fillStyle(C.WALLPAPER_LIGHT);
                    g.fillRect(px + offset + p, py, p, p);
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
        // RUG (under bed area - larger to match 1.5x furniture)
        // =================================================================

        drawRug(g, 280, floorY + p * 6, 600, p * 38, C);

        // =================================================================
        // FURNITURE & PROPS (using LAYOUT)
        // =================================================================

        drawDoor(g, LAYOUT.door.x, floorY, p, C);
        drawArtwork(g, LAYOUT.artwork.x, floorY, p, C);
        drawNightstand(g, LAYOUT.nightstand_l.x, floorY, p, C, true, 1.5);
        drawBed(g, LAYOUT.bed.x, floorY, p, C, 1.5);
        drawNightstand(g, LAYOUT.nightstand_r.x, floorY, p, C, false, 1.5);
        drawRobeOnHook(g, LAYOUT.robe.x, floorY, p, C);
        drawCloset(g, LAYOUT.closet.x, floorY, p, C);
        drawDogBed(g, LAYOUT.dog_bed.x, floorY, p, C);
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

    function drawArtwork(g, x, floorY, p, C) {
        // Large abstract painting over bed
        const artWidth = p * 85;
        const artHeight = p * 32;
        const artY = p * 32;  // Adjusted to create gap from headboard

        // Frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - artWidth / 2 - p * 3, artY - p * 3, artWidth + p * 6, artHeight + p * 6);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - artWidth / 2 - p, artY - p, artWidth + p * 2, artHeight + p * 2);

        // Canvas (abstract blues and greens - calm water)
        g.fillStyle(0x2a4a5a);
        g.fillRect(x - artWidth / 2, artY, artWidth, artHeight);

        // Abstract blue-green shapes
        g.fillStyle(0x3a5a6a);
        g.fillRect(x - artWidth / 2 + p * 8, artY + p * 4, p * 24, p * 12);
        g.fillRect(x - artWidth / 2 + p * 40, artY + p * 8, p * 28, p * 14);

        g.fillStyle(0x4a6a7a);
        g.fillRect(x - artWidth / 2 + p * 12, artY + p * 6, p * 18, p * 8);
        g.fillRect(x - artWidth / 2 + p * 44, artY + p * 12, p * 20, p * 10);

        g.fillStyle(0x5a7a8a);
        g.fillRect(x - artWidth / 2 + p * 16, artY + p * 8, p * 12, p * 6);
        g.fillRect(x - artWidth / 2 + p * 48, artY + p * 14, p * 14, p * 6);

        // Lighter highlights (calm reflection)
        g.fillStyle(0x6a8a9a);
        g.fillRect(x - artWidth / 2 + p * 20, artY + p * 10, p * 6, p * 3);
        g.fillRect(x - artWidth / 2 + p * 52, artY + p * 16, p * 8, p * 3);

        // Darker depths
        g.fillStyle(0x1a3a4a);
        g.fillRect(x - artWidth / 2 + p * 4, artY + p * 20, p * 32, p * 8);
        g.fillRect(x - artWidth / 2 + p * 60, artY + p * 22, p * 18, p * 6);
    }

    function drawBed(g, x, floorY, p, C, scale) {
        scale = scale || 1.0;
        var bedWidth = p * 60 * scale;
        var bedHeight = p * 20 * scale;
        var headboardHeight = p * 26 * scale;  // Reduced from 35 to 26
        var depthOffset = p * 12;
        var baseY = floorY - bedHeight + depthOffset;
        var sideWidth = p * 3 * scale;

        // Headboard (against wall)
        var hbY = baseY - headboardHeight;
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2, hbY, bedWidth, headboardHeight);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - bedWidth / 2 + p * 2, hbY + p * 2, bedWidth - p * 4, headboardHeight - p * 4);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - bedWidth / 2 + p * 3, hbY + p * 3, bedWidth - p * 6, p);
        // Headboard panel detail
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2 + p * 6, hbY + p * 6, bedWidth - p * 12, headboardHeight - p * 12);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - bedWidth / 2 + p * 7, hbY + p * 7, bedWidth - p * 14, headboardHeight - p * 14);

        // Left side panel (depth effect)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2 - sideWidth, baseY, sideWidth, bedHeight);

        // Bed frame (front face)
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - bedWidth / 2, baseY, bedWidth, bedHeight);
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - bedWidth / 2 + p, baseY + p, bedWidth - p * 2, p);

        // Footboard posts
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - bedWidth / 2, baseY - p * 6, p * 4, p * 6);
        g.fillRect(x + bedWidth / 2 - p * 4, baseY - p * 6, p * 4, p * 6);
        g.fillStyle(C.WOOD_HIGHLIGHT);
        g.fillRect(x - bedWidth / 2 + p, baseY - p * 5, p * 2, p);
        g.fillRect(x + bedWidth / 2 - p * 3, baseY - p * 5, p * 2, p);

        // Mattress visible above frame
        g.fillStyle(C.CREAM_DARK);
        g.fillRect(x - bedWidth / 2 + p * 2, baseY - p * 4, bedWidth - p * 4, p * 4);

        // Blankets (wool, deep blue-grey)
        g.fillStyle(C.BLANKET_DARK);
        g.fillRect(x - bedWidth / 2 + p * 2, baseY - p * 10, bedWidth - p * 4, p * 6);
        g.fillStyle(C.BLANKET_MID);
        g.fillRect(x - bedWidth / 2 + p * 3, baseY - p * 9, bedWidth - p * 6, p * 4);
        g.fillStyle(C.BLANKET_LIGHT);
        g.fillRect(x - bedWidth / 2 + p * 4, baseY - p * 8, p * 20, p * 2);

        // Rumpled right side (where someone got up in a hurry)
        g.fillStyle(C.BLANKET_MID);
        g.fillRect(x + p * 8, baseY - p * 13, p * 16, p * 5);
        g.fillStyle(C.BLANKET_LIGHT);
        g.fillRect(x + p * 10, baseY - p * 12, p * 8, p * 2);
        g.fillStyle(C.BLANKET_DARK);
        g.fillRect(x + p * 14, baseY - p * 11, p * 6, p);

        // Pillows (repositioned: left at x=490, right at x=635 from bed center at x=563.5)
        // Left pillow offset: 490 - 563.5 = -73.5 pixels from bed center
        // Right pillow offset: 635 - 563.5 = 71.5 pixels from bed center
        const leftPillowX = x - p * 18.375;  // -73.5 / 4 = -18.375p
        const rightPillowX = x + p * 17.875; // 71.5 / 4 = 17.875p
        const pillowWidth = p * 14;
        const pillowHeight = p * 6;

        // Left pillow
        g.fillStyle(C.CREAM_MID);
        g.fillRect(leftPillowX - pillowWidth / 2, baseY - p * 16, pillowWidth, pillowHeight);
        g.fillStyle(C.CREAM_LIGHT);
        g.fillRect(leftPillowX - pillowWidth / 2 + p, baseY - p * 15, p * 4, p * 2);

        // Head-shaped dent in left pillow
        g.fillStyle(C.CREAM_DARK);
        g.fillRect(leftPillowX - p * 3, baseY - p * 14, p * 6, p * 3);

        // Right pillow
        g.fillStyle(C.CREAM_MID);
        g.fillRect(rightPillowX - pillowWidth / 2, baseY - p * 16, pillowWidth, pillowHeight);
        g.fillStyle(C.CREAM_LIGHT);
        g.fillRect(rightPillowX - pillowWidth / 2 + p, baseY - p * 15, p * 4, p * 2);
    }

    function drawNightstand(g, x, floorY, p, C, isLeft, scale) {
        scale = scale || 1.0;
        var standWidth = p * 16 * scale;
        var standHeight = p * 18 * scale;
        var depthOffset = p * 10;
        var baseY = floorY - standHeight + depthOffset;
        var sideWidth = p * 3 * scale;

        // Left side panel (depth effect, only on left nightstand)
        if (isLeft) {
            g.fillStyle(C.WOOD_DARK);
            g.fillRect(x - standWidth / 2 - sideWidth, baseY, sideWidth, standHeight);
        }

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
        var lampY = baseY - p * 2;

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

        if (isLeft) {
            // Photo frame on left nightstand
            var photoX = x - standWidth / 2 + p * 2;
            var photoY = baseY - p * 12;
            g.fillStyle(C.WOOD_DARK);
            g.fillRect(photoX, photoY, p * 8, p * 10);
            g.fillStyle(C.WOOD_MID);
            g.fillRect(photoX + p, photoY + p, p * 6, p * 8);
            // Photo content (tiny warm scene)
            g.fillStyle(0xd8c8b0);
            g.fillRect(photoX + p, photoY + p, p * 6, p * 6);
            // Three tiny figures
            g.fillStyle(0x4a3520);
            g.fillRect(photoX + p * 2, photoY + p * 2, p, p * 3);
            g.fillStyle(0x6a3a30);
            g.fillRect(photoX + p * 4, photoY + p * 2, p, p * 3);
            g.fillStyle(0x5a4a30);
            g.fillRect(photoX + p * 3, photoY + p * 4, p, p * 2);

            // Book of poetry
            g.fillStyle(0x3a3a5a);
            g.fillRect(x + p * 2, baseY - p * 6, p * 8, p * 4);
            g.fillStyle(0x4a4a6a);
            g.fillRect(x + p * 3, baseY - p * 5, p * 6, p * 2);

            // Reading glasses
            g.fillStyle(C.METAL_DARK);
            g.fillRect(x + p * 3, baseY - p * 8, p * 6, p * 2);
            g.fillStyle(0x6a7a8a);
            g.fillRect(x + p * 3, baseY - p * 8, p * 2, p * 2);
            g.fillRect(x + p * 7, baseY - p * 8, p * 2, p * 2);
        } else {
            // Cold cup of tea on right nightstand
            var teaX = x + p * 2;
            var teaY = baseY - p * 8;
            g.fillStyle(0x6a6a5a);
            g.fillRect(teaX, teaY, p * 5, p * 6);
            g.fillStyle(0x7a7a6a);
            g.fillRect(teaX + p, teaY + p, p * 3, p * 4);
            // Cold tea surface
            g.fillStyle(0x4a3a2a);
            g.fillRect(teaX + p, teaY + p, p * 3, p);
            // Handle
            g.fillStyle(0x6a6a5a);
            g.fillRect(teaX + p * 5, teaY + p, p * 2, p * 4);
        }
    }

    function drawCloset(g, x, floorY, p, C) {
        var closetWidth = p * 35;
        var closetHeight = p * 80;
        var baseY = floorY - closetHeight;

        // Closet frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - closetWidth / 2 - p * 3, baseY - p * 2, closetWidth + p * 6, closetHeight + p * 2);

        // Interior (dark)
        g.fillStyle(0x1a1510);
        g.fillRect(x - closetWidth / 2, baseY, closetWidth, closetHeight);

        // Clothing rod
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - closetWidth / 2 + p * 2, baseY + p * 6, closetWidth - p * 4, p);

        // A few shirts hanging (sparse, mostly empty - only 2 shirts on left side)
        var shirtColors = [0x4a4a5a, 0x5a4a3a];
        for (var i = 0; i < 2; i++) {
            var shirtX = x - closetWidth / 2 + p * 4 + i * p * 8;
            g.fillStyle(shirtColors[i]);
            g.fillRect(shirtX, baseY + p * 7, p * 6, p * 20);
            // Hanger
            g.fillStyle(C.METAL_DARK);
            g.fillRect(shirtX + p * 2, baseY + p * 5, p * 2, p * 3);
        }

        // GOGGLES hanging on hook (key item - visually prominent, on right side alone)
        var goggleX = x + p * 8;
        var goggleY = baseY + p * 14;

        // Hook on wall
        g.fillStyle(C.BRASS);
        g.fillRect(goggleX + p * 2, baseY + p * 2, p, p * 8);
        g.fillRect(goggleX, baseY + p * 9, p * 5, p * 2);

        // Goggle strap (leather)
        g.fillStyle(0x5a3520);
        g.fillRect(goggleX - p * 2, goggleY, p * 12, p * 2);

        // Goggle lenses (brass rims, blue-green glass)
        g.fillStyle(C.BRASS);
        g.fillRect(goggleX - p, goggleY + p * 2, p * 5, p * 5);
        g.fillRect(goggleX + p * 5, goggleY + p * 2, p * 5, p * 5);
        g.fillStyle(0x6a8a9a);
        g.fillRect(goggleX, goggleY + p * 3, p * 3, p * 3);
        g.fillRect(goggleX + p * 6, goggleY + p * 3, p * 3, p * 3);
        // Lens highlight
        g.fillStyle(0x8aaaba);
        g.fillRect(goggleX + p, goggleY + p * 3, p, p);
        g.fillRect(goggleX + p * 7, goggleY + p * 3, p, p);

        // Left closet door (ajar, leaning open)
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x - closetWidth / 2 - p * 4, baseY - p * 2, p * 6, closetHeight + p * 2);
        g.fillStyle(C.WOOD_MID);
        g.fillRect(x - closetWidth / 2 - p * 3, baseY, p * 4, closetHeight - p * 2);
        // Door panel detail
        g.fillStyle(C.WOOD_LIGHT);
        g.fillRect(x - closetWidth / 2 - p * 2, baseY + p * 4, p * 2, p * 20);
        g.fillRect(x - closetWidth / 2 - p * 2, baseY + p * 30, p * 2, p * 25);
        // Handle
        g.fillStyle(C.BRASS);
        g.fillRect(x - closetWidth / 2 - p, baseY + closetHeight / 2, p * 2, p * 3);

        // Right frame
        g.fillStyle(C.WOOD_DARK);
        g.fillRect(x + closetWidth / 2 - p, baseY - p * 2, p * 4, closetHeight + p * 2);
    }

    function drawRobeOnHook(g, x, floorY, p, C) {
        var wallY = p * 46;  // Moved down (was p * 38) to align with y=0.256 (~184px)

        // Wall hook
        g.fillStyle(C.BRASS);
        g.fillRect(x - p, wallY, p * 2, p * 4);
        g.fillRect(x - p * 2, wallY + p * 3, p * 4, p * 2);

        // Robe hanging (terrycloth, warm color)
        g.fillStyle(0x5a4535);
        g.fillRect(x - p * 5, wallY + p * 5, p * 10, p * 30);
        g.fillStyle(0x6a5545);
        g.fillRect(x - p * 4, wallY + p * 6, p * 3, p * 28);
        // Collar
        g.fillStyle(0x6a5545);
        g.fillRect(x - p * 3, wallY + p * 4, p * 6, p * 3);
        // Belt/sash hanging
        g.fillStyle(0x4a3525);
        g.fillRect(x + p * 2, wallY + p * 20, p * 2, p * 10);
    }

    function drawDogBed(g, x, floorY, p, C) {
        var bedWidth = p * 30;
        var bedHeight = p * 8;
        var bedY = floorY + p * 2;

        // Cushion base (deep red to match rug)
        g.fillStyle(C.RUG_DARK);
        g.fillRect(x - bedWidth / 2, bedY, bedWidth, bedHeight);

        // Rim/lip (brighter red)
        g.fillStyle(C.RUG_MID);
        g.fillRect(x - bedWidth / 2, bedY, bedWidth, p * 2);
        g.fillRect(x - bedWidth / 2, bedY, p * 3, bedHeight);
        g.fillRect(x + bedWidth / 2 - p * 3, bedY, p * 3, bedHeight);
        g.fillRect(x - bedWidth / 2, bedY + bedHeight - p * 2, bedWidth, p * 2);

        // Inner cushion (darker red)
        g.fillStyle(0x2a1515);
        g.fillRect(x - bedWidth / 2 + p * 3, bedY + p * 2, bedWidth - p * 6, bedHeight - p * 4);

        // Pattern detail (stitching lines)
        g.fillStyle(C.RUG_PATTERN);
        g.fillRect(x - bedWidth / 2 + p * 4, bedY + p * 3, bedWidth - p * 8, p);
        g.fillRect(x - bedWidth / 2 + p * 4, bedY + bedHeight - p * 4, bedWidth - p * 8, p);

        // Fur remnants (more visible, light colored)
        g.fillStyle(0x8a7a6a);
        g.fillRect(x - p * 6, bedY + p * 4, p * 2, p);
        g.fillRect(x + p * 3, bedY + p * 3, p, p);
        g.fillRect(x - p * 2, bedY + p * 5, p * 2, p);
        g.fillRect(x + p * 8, bedY + p * 4, p, p);
        g.fillRect(x - p * 9, bedY + p * 5, p, p);
    }

    function drawRug(g, x, y, w, h, C) {
        // Warm rug under bed area
        g.fillStyle(C.RUG_DARK);
        g.fillRect(x, y, w, h);

        // Border
        g.fillStyle(C.RUG_GOLD);
        g.fillRect(x + 4, y + 4, w - 8, 4);
        g.fillRect(x + 4, y + h - 8, w - 8, 4);
        g.fillRect(x + 4, y + 4, 4, h - 8);
        g.fillRect(x + w - 8, y + 4, 4, h - 8);

        // Inner border
        g.fillStyle(C.RUG_MID);
        g.fillRect(x + 12, y + 12, w - 24, 4);
        g.fillRect(x + 12, y + h - 16, w - 24, 4);
        g.fillRect(x + 12, y + 12, 4, h - 24);
        g.fillRect(x + w - 16, y + 12, 4, h - 24);

        // Center field
        g.fillStyle(C.RUG_DARK);
        g.fillRect(x + 20, y + 20, w - 40, h - 40);

        // Center pattern
        var cx = x + w / 2;
        var cy = y + h / 2;
        g.fillStyle(C.RUG_PATTERN);
        g.fillRect(cx - 20, cy - 6, 40, 12);
        g.fillStyle(C.RUG_MID);
        g.fillRect(cx - 14, cy - 3, 28, 6);

        // Fringe
        g.fillStyle(C.RUG_PATTERN);
        for (var px = x + 6; px < x + w - 6; px += 6) {
            g.fillRect(px, y - 4, 3, 6);
            g.fillRect(px, y + h - 2, 3, 6);
        }
    }

})();
