// ============================================================================
// BACK LAB (SIDE ROOM) - Storage/Overflow Area
// ============================================================================
// A small utilitarian room behind the main laboratory. This is where lab
// supplies are stored, equipment gathers dust, and eventually where Hector's
// body (and detached head) end up after the teleporter accident.
//
// Connects to: laboratory (left), hectors_room (stairs up - not built yet)
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
        fire_ext:   { x: 110, y: 0.428, w: 50, h: 0.20 },    // Wall mounted, far left
        equipment:  { x: 110, y: 0.70, w: 120, h: 0.16 },    // Below fire extinguisher, mid-floor
        shelves:    { x: 350, y: 0.60, w: 200, h: 0.42 },    // Mid-floor depth
        locker:     { x: 640, y: 0.60, w: 240, h: 0.42 },    // Mid-floor depth
        boxes:      { x: 880, y: 0.62, w: 180, h: 0.26 },    // Mid-floor depth
        cabinet:    { x: 1020, y: 0.58, w: 100, h: 0.38 },   // Mid-floor depth
        stairs:     { x: 1180, y: 0.48, w: 180, h: 0.48 }    // Doorway with stairs, far right
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.back_lab = {
        id: 'back_lab',
        name: "Side Room",

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
                { id: 'hanging_bulb', x: 640, y: 0.185, radius: 550, color: 0xffeeaa, intensity: 1.2 }
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
                draw: drawBackLabRoom
            }
        ],

        spawns: {
            default: { x: 120, y: 0.82 },
            from_laboratory: { x: 120, y: 0.82 },
            from_hectors_room: { x: 1127, y: 0.793, direction: 'left' }
        },

        exits: [
            {
                edge: 'left',
                x: 0,
                width: 80,
                target: 'laboratory',
                spawnPoint: 'from_sideroom'
            }
        ],

        npcs: [],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================
        // Order: bottom to top (large background first, overlapping items after)

        hotspots: [
            {
                id: 'equipment_tarp',
                ...LAYOUT.equipment,
                interactX: LAYOUT.equipment.x, interactY: 0.82,
                name: 'Covered Equipment',
                verbs: { action: 'Uncover', look: 'Look at' },
                responses: {
                    look: "Something large under a dusty tarp. Could be anything from an old generator to a very committed ghost.",
                    action: "Looks like old lab equipment. Definitely not a ghost. Probably."
                }
            },
            {
                id: 'locker_hector',
                ...LAYOUT.locker,
                interactX: LAYOUT.locker.x, interactY: 0.82,
                name: 'Metal Lockers',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Two tall industrial lockers side by side. Big enough to hold... well, pretty much anything. There's a crack of light showing through one of the door seals.",
                    action: "Both locked tight. Wonder what's inside?"
                }
            },
            {
                id: 'stairs_bedroom',
                ...LAYOUT.stairs,
                interactX: LAYOUT.stairs.x, interactY: 0.82,
                name: 'Stairs Up',
                verbs: { action: 'Go up', look: 'Look at' },
                responses: {
                    look: "A doorway in the back wall. I can see stairs leading up through it. Looks like they go to the second floor."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'hectors_room',
                    spawnPoint: 'from_back_lab'
                }
            },
            {
                id: 'shelves_lab',
                ...LAYOUT.shelves,
                interactX: LAYOUT.shelves.x, interactY: 0.82,
                name: 'Storage Shelves',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "Metal shelving loaded with lab supplies. Beakers, chemicals in unmarked bottles, cables, spare parts. The organized chaos of a working lab.",
                    action: "Lots of interesting stuff, but nothing I need right now. Just supplies."
                }
            },
            {
                id: 'boxes_storage',
                ...LAYOUT.boxes,
                interactX: LAYOUT.boxes.x, interactY: 0.82,
                name: 'Stacked Boxes',
                verbs: { action: 'Open', look: 'Look at' },
                responses: {
                    look: "Cardboard boxes stacked haphazardly. Some have labels: 'FRAGILE,' 'TESLA COILS,' 'DO NOT OPEN UNTIL CRISIS.' That last one's ominous.",
                    action: "The boxes are taped shut and stacked pretty precariously. Better not disturb them."
                }
            },
            {
                id: 'cabinet_metal',
                ...LAYOUT.cabinet,
                interactX: LAYOUT.cabinet.x, interactY: 0.82,
                name: 'Filing Cabinet',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "A dented metal filing cabinet. The kind that survives nuclear war and office relocations.",
                    action: "The drawers are jammed shut. Probably haven't been opened in years."
                }
            },
            {
                id: 'fire_extinguisher',
                ...LAYOUT.fire_ext,
                interactX: LAYOUT.fire_ext.x, interactY: 0.82,
                name: 'Fire Extinguisher',
                verbs: { action: 'Take', look: 'Look at' },
                responses: {
                    look: "A red fire extinguisher mounted on the wall. The inspection tag is... wow, that date can't be right.",
                    action: "It's bolted to the wall. Plus I don't have a fire. Yet."
                }
            }
        ]
    };

    // =========================================================================
    // DRAWING CODE
    // =========================================================================

    function drawBackLabRoom(graphics, scene, worldWidth, height) {
        const g = graphics;
        const p = 4;  // Pixel unit (matches interior.js)
        const floorY = height * 0.72;

        // Industrial color palette
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

            // Rust/wear
            RUST_DARK:       0x4a2010,
            RUST_MID:        0x6a3020,

            // Lab glow
            LAB_GREEN:       0x2a5a3a,
            LAB_BLUE:        0x2a3a5a,

            // Accents
            YELLOW:          0xd0c030,
            RED:             0xa03020,
            WHITE:           0xe0e0e0,

            // Wood (for boxes)
            WOOD_DARK:       0x2a1a10,
            WOOD_MID:        0x4a3520
        };

        // =====================================================================
        // BACK WALL
        // =====================================================================

        g.fillStyle(COLORS.CONCRETE_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        // Wall panels (subtle depth)
        for (let x = 0; x < worldWidth; x += p * 80) {
            g.fillStyle(COLORS.CONCRETE_MID);
            g.fillRect(x + p * 4, p * 10, p * 72, floorY - p * 20);

            // Panel edges
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(x + p * 4, p * 10, p * 2, floorY - p * 20);  // Left
            g.fillRect(x + p * 74, p * 10, p * 2, floorY - p * 20); // Right
        }

        // Exposed conduit along ceiling
        g.fillStyle(COLORS.METAL_MID);
        for (let x = p * 20; x < worldWidth; x += p * 120) {
            g.fillRect(x, p * 5, p * 3, p * 3);
            g.fillRect(x + p * 3, p * 6, p * 40, p * 2);
        }

        // Hanging lightbulb (center of room, just above lockers)
        const bulbX = worldWidth / 2;
        const bulbY = height * 0.185;

        // Wire from ceiling
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(bulbX - p * 0.5, p * 10, p, bulbY - p * 10);

        // Bulb base/socket
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(bulbX - p * 2, bulbY - p * 4, p * 4, p * 4);

        // Glass bulb
        g.fillStyle(0xfffacd);  // Light yellow
        g.fillRect(bulbX - p * 3, bulbY, p * 6, p * 8);

        // Bulb highlight (glass shine)
        g.fillStyle(0xffffff);
        g.fillRect(bulbX - p * 2, bulbY + p, p * 2, p * 2);

        // =====================================================================
        // FLOOR
        // =====================================================================

        g.fillStyle(COLORS.CONCRETE_MID);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Concrete floor texture (cracks and wear)
        for (let y = floorY + p * 8; y < height; y += p * 16) {
            for (let x = p * 10; x < worldWidth; x += p * 30) {
                if (Math.random() > 0.7) {
                    g.fillStyle(COLORS.CONCRETE_DARK);
                    g.fillRect(x, y, p * 12, p);
                }
            }
        }

        // Floor drain (industrial detail)
        const drainX = worldWidth / 2;
        const drainY = floorY + p * 30;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(drainX - p * 4, drainY - p * 4, p * 8, p * 8);
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(drainX - p * 3, drainY - p * 3, p * 6, p * 6);
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(drainX - p * 2, drainY - p * 2, p * 4, p * 4);

        // =====================================================================
        // FURNITURE & PROPS (using LAYOUT for positions)
        // =====================================================================

        drawTarpedEquipment(g, LAYOUT.equipment.x, floorY, p, COLORS);
        drawShelving(g, LAYOUT.shelves.x, floorY, p, COLORS);
        drawDoubleLocker(g, LAYOUT.locker.x, floorY, p, COLORS);
        drawStackedBoxes(g, LAYOUT.boxes.x, floorY, p, COLORS);
        drawFilingCabinet(g, LAYOUT.cabinet.x, floorY, p, COLORS);
        drawFireExtinguisher(g, LAYOUT.fire_ext.x, floorY, p, COLORS);
        drawDoorwayWithStairs(g, LAYOUT.stairs.x, floorY, p, COLORS, worldWidth);
    }

    // =========================================================================
    // FURNITURE DRAWING FUNCTIONS
    // =========================================================================

    function drawDoubleLocker(g, x, floorY, p, C) {
        const lockerWidth = p * 30;
        const lockerHeight = p * 85;
        const depthOffset = p * 15;  // Pull forward from wall
        const baseY = floorY - lockerHeight + depthOffset;
        const spacing = p * 4;  // Gap between lockers
        const totalWidth = lockerWidth * 2 + spacing;
        const sideWidth = p * 3;  // Half width side panel

        // Draw two lockers side by side, centered at x
        for (let i = 0; i < 2; i++) {
            const lockerX = x - totalWidth/2 + i * (lockerWidth + spacing);

            // Side panel (depth effect - left side only on first locker)
            if (i === 0) {
                g.fillStyle(C.METAL_DARK);
                g.fillRect(lockerX - sideWidth, baseY, sideWidth, lockerHeight);
            }

            // Main body (front face)
            g.fillStyle(C.METAL_MID);
            g.fillRect(lockerX, baseY, lockerWidth, lockerHeight);

            // Door frame
            g.fillStyle(C.METAL_LIGHT);
            g.fillRect(lockerX + p * 2, baseY + p * 2, lockerWidth - p * 4, lockerHeight - p * 4);

            // Door panel (inset)
            g.fillStyle(C.METAL_MID);
            g.fillRect(lockerX + p * 4, baseY + p * 4, lockerWidth - p * 8, lockerHeight - p * 8);

            // Vent slots at top
            g.fillStyle(C.METAL_DARK);
            for (let j = 0; j < 4; j++) {
                g.fillRect(lockerX + p * 6, baseY + p * 8 + j * p * 3, p * 18, p);
            }

            // Handle
            g.fillStyle(C.METAL_HIGHLIGHT);
            g.fillRect(lockerX + lockerWidth - p * 8, baseY + lockerHeight/2 - p * 2, p * 4, p * 4);
            g.fillStyle(C.METAL_DARK);
            g.fillRect(lockerX + lockerWidth - p * 7, baseY + lockerHeight/2 - p, p * 2, p * 2);

            // Small gap in door seal on right locker (no light, just a detail)
            if (i === 1) {
                g.fillStyle(C.METAL_DARK);
                g.fillRect(lockerX + lockerWidth - p * 2, baseY + p * 20, p, p * 40);
            }
        }
    }

    function drawDoorwayWithStairs(g, x, floorY, p, C, worldWidth) {
        const doorWidth = p * 35;   // Standard door width from ROOM_DESIGN_BIBLE
        const doorHeight = p * 90;
        const frameWidth = p * 3;
        const baseY = floorY - doorHeight;

        // Door frame
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 5, doorWidth + frameWidth * 2, doorHeight + frameWidth * 5);

        // Door opening (darker interior)
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - doorWidth/2, baseY, doorWidth, doorHeight);

        // Stairs visible inside doorway (receding into darkness)
        const numStairs = 5;
        const stairDepth = p * 6;
        const stairHeight = p * 7;

        for (let i = 0; i < numStairs; i++) {
            const stepY = floorY - i * stairHeight;
            const stepWidth = doorWidth - i * p * 3;  // Narrowing perspective
            const stepX = x - stepWidth/2;

            // Tread
            g.fillStyle(C.WOOD_MID);
            g.fillRect(stepX, stepY - stairHeight, stepWidth, stairDepth);

            // Tread edge (lighter)
            g.fillStyle(0x5a4530);
            g.fillRect(stepX, stepY - stairHeight, stepWidth, p);

            // Riser (darker)
            g.fillStyle(C.WOOD_DARK);
            g.fillRect(stepX, stepY - stairHeight + stairDepth, stepWidth, stairHeight - stairDepth);
        }

        // Door frame highlight (inner edge)
        g.fillStyle(C.METAL_LIGHT);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 5, frameWidth, doorHeight + frameWidth * 5);
        g.fillRect(x + doorWidth/2, baseY - frameWidth * 5, frameWidth, doorHeight + frameWidth * 5);
        g.fillRect(x - doorWidth/2 - frameWidth, baseY - frameWidth * 5, doorWidth + frameWidth * 2, frameWidth * 2);
    }

    function drawShelving(g, x, floorY, p, C) {
        const shelfWidth = p * 50;
        const shelfHeight = p * 60;
        const depthOffset = p * 12;
        const baseY = floorY - shelfHeight + depthOffset;
        const numShelves = 4;
        const sideWidth = p * 3;

        // Left side panel (depth effect)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - shelfWidth/2 - sideWidth, baseY, sideWidth, shelfHeight);

        // Back panel (main unit)
        g.fillStyle(C.METAL_MID);
        g.fillRect(x - shelfWidth/2, baseY, shelfWidth, shelfHeight);

        // Right side (internal support, not full depth panel)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x + shelfWidth/2 - p, baseY, p, shelfHeight);

        // Shelves
        for (let i = 0; i < numShelves; i++) {
            const shelfY = baseY + (i * shelfHeight / (numShelves - 1));
            g.fillStyle(C.METAL_LIGHT);
            g.fillRect(x - shelfWidth/2, shelfY, shelfWidth, p * 2);
            g.fillStyle(C.METAL_DARK);
            g.fillRect(x - shelfWidth/2, shelfY + p * 2, shelfWidth, p);
        }

        // Items on shelves (beakers, bottles)
        const colors = [C.LAB_GREEN, C.LAB_BLUE, C.YELLOW, C.WHITE];
        for (let i = 0; i < numShelves - 1; i++) {
            const shelfY = baseY + (i * shelfHeight / (numShelves - 1));
            for (let j = 0; j < 5; j++) {
                const itemX = x - shelfWidth/2 + p * 8 + j * p * 9;
                const color = colors[Math.floor(Math.random() * colors.length)];
                g.fillStyle(color);
                g.fillRect(itemX, shelfY - p * 4, p * 3, p * 4);
            }
        }
    }

    function drawStackedBoxes(g, x, floorY, p, C) {
        const depthOffset = p * 10;
        const sideWidth = p * 3;
        const boxes = [
            { w: p * 30, h: p * 20, offsetY: 0, offsetX: 0 },
            { w: p * 28, h: p * 18, offsetY: p * 20, offsetX: p * 4 },
            { w: p * 24, h: p * 16, offsetY: p * 38, offsetX: -p * 2 }
        ];

        boxes.forEach((box, index) => {
            const boxX = x + box.offsetX;
            const boxY = floorY - box.h - box.offsetY + depthOffset;

            // Left side panel (depth effect) - only on bottom box
            if (index === 0) {
                g.fillStyle(C.WOOD_DARK);
                g.fillRect(boxX - box.w/2 - sideWidth, boxY, sideWidth, box.h);
            }

            // Main box
            g.fillStyle(C.WOOD_MID);
            g.fillRect(boxX - box.w/2, boxY, box.w, box.h);

            // Top highlight
            g.fillStyle(0x5a4530);
            g.fillRect(boxX - box.w/2, boxY, box.w, p);

            // Tape
            g.fillStyle(C.YELLOW);
            g.fillRect(boxX - box.w/2, boxY + box.h/2 - p, box.w, p * 2);

            // Label
            g.fillStyle(C.WHITE);
            g.fillRect(boxX - p * 8, boxY + p * 4, p * 16, p * 8);
            g.fillStyle(C.METAL_DARK);
            for (let i = 0; i < 3; i++) {
                g.fillRect(boxX - p * 6, boxY + p * 6 + i * p * 2, p * 12, p);
            }
        });
    }

    function drawFilingCabinet(g, x, floorY, p, C) {
        const cabinetWidth = p * 25;
        const cabinetHeight = p * 40;
        const depthOffset = p * 12;
        const baseY = floorY - cabinetHeight + depthOffset;
        const sideWidth = p * 3;

        // Left side panel (depth effect)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - cabinetWidth/2 - sideWidth, baseY, sideWidth, cabinetHeight);

        // Main body
        g.fillStyle(C.METAL_MID);
        g.fillRect(x - cabinetWidth/2, baseY, cabinetWidth, cabinetHeight);

        // Drawers
        for (let i = 0; i < 3; i++) {
            const drawerY = baseY + i * (cabinetHeight / 3) + p * 2;
            const drawerH = (cabinetHeight / 3) - p * 4;

            // Drawer face
            g.fillStyle(C.METAL_LIGHT);
            g.fillRect(x - cabinetWidth/2 + p * 2, drawerY, cabinetWidth - p * 4, drawerH);

            // Handle
            g.fillStyle(C.METAL_DARK);
            g.fillRect(x - p * 4, drawerY + drawerH/2 - p, p * 8, p * 2);

            // Dent
            if (i === 1) {
                g.fillStyle(C.RUST_DARK);
                g.fillRect(x + p * 4, drawerY + p * 4, p * 6, p * 6);
            }
        }
    }

    function drawFireExtinguisher(g, x, floorY, p, C) {
        const extWidth = p * 8;
        const extHeight = p * 24;
        const baseY = floorY - p * 60;  // Mounted on wall

        // Wall mount bracket
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

        // Pressure gauge
        g.fillStyle(C.WHITE);
        g.fillRect(x - p * 2, baseY + p * 12, p * 4, p * 4);
        g.fillStyle(C.YELLOW);
        g.fillRect(x - p, baseY + p * 13, p * 2, p * 2);
    }

    function drawTarpedEquipment(g, x, floorY, p, C) {
        const tarpWidth = p * 30;
        const tarpHeight = p * 16;
        const depthOffset = p * 8;
        const baseY = floorY - tarpHeight + depthOffset;
        const sideWidth = p * 3;

        // Left side panel (depth effect)
        g.fillStyle(0x3a3a2a);
        g.fillRect(x - tarpWidth/2 - sideWidth, baseY, sideWidth, tarpHeight);

        // Equipment shape beneath (vague)
        g.fillStyle(C.METAL_DARK);
        g.fillRect(x - tarpWidth/2 + p * 4, baseY + p * 4, p * 20, p * 12);

        // Tarp (dusty canvas color)
        g.fillStyle(0x4a4a3a);
        g.fillRect(x - tarpWidth/2, baseY, tarpWidth, tarpHeight);

        // Tarp folds
        g.fillStyle(0x3a3a2a);
        for (let i = 0; i < 4; i++) {
            g.fillRect(x - tarpWidth/2 + i * p * 8, baseY + p * 2, p * 4, tarpHeight - p * 4);
        }

        // Dust specks
        for (let i = 0; i < 12; i++) {
            const dustX = x - tarpWidth/2 + Math.random() * tarpWidth;
            const dustY = baseY + Math.random() * tarpHeight;
            g.fillStyle(0x6a6a5a);
            g.fillRect(dustX, dustY, p, p);
        }
    }

})();
