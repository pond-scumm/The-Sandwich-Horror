// ============================================================================
// BASEMENT - Hector's Basement (accessed via bulkhead in backyard)
// ============================================================================
// A cramped, dank New England basement. Frank hangs out here reading TV Guide.
// Nuclear generator, brain jar, and important puzzle elements.
// Connects to: backyard (bulkhead stairs up)
//
// Layout: Generator (left), bulkhead stairs (center), Frank (center-right),
// storage shelves with brain jar (right)
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // SHARED LAYOUT (single source of truth for all positions)
    // =========================================================================

    const LAYOUT = {
        generator:       { x: 280,  y: 0.55, w: 280, h: 0.33 },
        bulkhead_stairs: { x: 1190, y: 0.095, w: 394, h: 0.154 },
        frank_npc:       { x: 1280, y: 0.52, w: 80,  h: 0.40 },
        brain_jar:       { x: 1800, y: 0.40, w: 100, h: 0.17 },
        jars_various:    { x: 1550, y: 0.48, w: 160, h: 0.20 },
        cobwebs:         { x: 70,   y: 0.17, w: 100, h: 0.17 },
        lightbulb:       { x: 589,  y: 0.217, w: 80, h: 0.081 },
        task_lamp:       { x: 1192, y: 0.413, w: 45, h: 0.155 },
        workbench:       { x: 1122, y: 0.499, w: 217, h: 0.050 },
        crates:          { x: 40,   y: 0.50, w: 80,  h: 0.34 }
    };

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.basement = {
        id: 'basement',
        name: "The Basement",

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
            ambient: 0x4a4a3a,
            ambientMobile: 0x6a6a5a,
            sources: [
                // Bare bulb (harsh, warm) - left-center area
                { id: 'bulb_main', x: 589, y: 0.217, radius: 280, color: 0xffcc88, intensity: 1.2 },
                // Task lamp (warm, bright) - tall lamp on workbench, illuminates Frank's face
                { id: 'task_lamp', x: 1200, y: 0.35, radius: 400, color: 0xffcc88, intensity: 1.5 },
                // Generator glow (cold green/blue) - left side
                { id: 'generator_glow', x: 280, y: 0.62, radius: 220, color: 0x88ffaa, intensity: 0.9, type: 'pulse' },
                // Brain jar glow (green) - right side on shelves, aligned with jar
                { id: 'brain_glow', x: 1800, y: 0.46, radius: 150, color: 0x88ff88, intensity: 1.0, type: 'pulse' },
                // Daylight from bulkhead (when open)
                { id: 'bulkhead_light', x: 1200, y: 0.10, radius: 250, color: 0xaabbdd, intensity: 0.6 }
            ]
        },

        audio: {
            music: {
                key: 'basement_theme',
                volume: 0.5,
                fade: 1000,
                loop: true
            },
            layers: [],
            continueFrom: ['backyard']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawBasementRoom
            }
        ],

        spawns: {
            default: { x: 200, y: 0.82 },
            from_backyard: { x: 200, y: 0.82 }
        },

        exits: [],

        npcs: [
            {
                id: 'frank',
                name: 'Frank',
                sprite: 'frank_placeholder',
                position: { x: 1280, y: 0.82 },
                heightRatio: 1.15,
                interactX: 1280,
                interactY: 0.82
            }
        ],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === NUCLEAR GENERATOR (left side) ===
            {
                id: 'generator_nuclear',
                ...LAYOUT.generator,
                interactX: LAYOUT.generator.x, interactY: 0.82,
                name: 'Nuclear Generator',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "A large nuclear generator humming with ominous power. Green lights pulse through viewing windows. The control panel has switches for 'Lab 1' and 'Lab 2'. There's a power outlet at the base.",
                    action: "The generator powers parts of the lab. Lab 1 seems inactive - the fuse looks blown. Lab 2 is still running. There's a power cord I could unplug..."
                }
                // TODO: State-driven - can unplug/plug generator, affects security systems
            },

            // === BULKHEAD STAIRS (center-right) ===
            {
                id: 'bulkhead_stairs',
                ...LAYOUT.bulkhead_stairs,
                interactX: LAYOUT.bulkhead_stairs.x + 300, interactY: 0.82,
                name: 'Stairs to Backyard',
                verbs: { action: 'Climb', look: 'Look at' },
                responses: {
                    look: "Wooden stairs leading up to the outside. Light filters down from above. I can see each step descending from the open bulkhead doors.",
                    action: null
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'backyard',
                    spawnPoint: 'from_basement'
                }
            },

            // === FRANK (NPC) ===
            {
                id: 'frank_npc',
                ...LAYOUT.frank_npc,
                interactX: LAYOUT.frank_npc.x, interactY: 0.82,
                name: 'Frank',
                type: 'npc',
                verbs: { action: 'Talk to', look: 'Look at' },
                responses: {
                    look: "A gentle giant in a black suit. Frank has green skin and distinctive neck bolts. He's standing quietly, looking friendly despite his imposing appearance.",
                    action: null
                }
                // TODO: Conversation system - Frank can loan TV Guide, swap brains, needs to be strapped down
            },

            // === STORAGE SHELVES (right side) ===
            {
                id: 'brain_jar',
                ...LAYOUT.brain_jar,
                interactX: LAYOUT.brain_jar.x, interactY: 0.82,
                name: 'Brain in Jar',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A human brain floating in glowing green liquid. The jar is labeled 'ABNORMAL' in classic horror movie fashion. That's not ominous at all.",
                    action: "I... probably shouldn't just grab someone's brain without asking. Even if it IS labeled 'abnormal'."
                }
                // TODO: State-driven - can take after talking to Hector, needed for stabilizer core puzzle
            },
            {
                id: 'jars_various',
                ...LAYOUT.jars_various,
                interactX: LAYOUT.jars_various.x, interactY: 0.82,
                name: 'Specimen Jars',
                verbs: { action: 'Examine', look: 'Look at' },
                responses: {
                    look: "Various jars with mysterious contents. Some glow faintly. Labels include 'DO NOT OPEN' and 'PROPERTY OF DR. M.'",
                    action: "Better not. These look like the kind of things that end badly when touched."
                }
            },

            // === ENVIRONMENT DETAILS ===
            {
                id: 'cobwebs',
                ...LAYOUT.cobwebs,
                interactX: LAYOUT.cobwebs.x, interactY: 0.82,
                name: 'Cobwebs',
                verbs: { action: 'Clear away', look: 'Look at' },
                responses: {
                    look: "Thick cobwebs in the corner. How long has it been since anyone cleaned down here?",
                    action: "Nope. I'm not touching those. If there's a spider the size of my hand in there, I don't want to know."
                }
            },
            {
                id: 'workbench_old',
                ...LAYOUT.workbench,
                interactX: LAYOUT.workbench.x + 100, interactY: 0.82,
                name: 'Old Workbench',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A dusty workbench covered in tools and parts. Looks like Frank might use this for... something.",
                    action: "Tools, bolts, screws, random metal pieces... nothing immediately useful."
                }
            },
            {
                id: 'task_lamp',
                ...LAYOUT.task_lamp,
                interactX: LAYOUT.task_lamp.x, interactY: 0.82,
                name: 'Task Lamp',
                verbs: { action: 'Turn off', look: 'Look at' },
                responses: {
                    look: "An old task lamp with a dented metal shade. The bulb flickers occasionally.",
                    action: "I'd rather leave it on. The basement is dark enough as it is."
                }
            },
            {
                id: 'lightbulb_bare',
                ...LAYOUT.lightbulb,
                interactX: LAYOUT.lightbulb.x, interactY: 0.82,
                name: 'Bare Bulb',
                verbs: { action: 'Touch', look: 'Look at' },
                responses: {
                    look: "A single bare lightbulb hanging from the ceiling. It casts harsh shadows everywhere.",
                    action: "Still hot. And I just made everything sway. Great lighting design there, Hector."
                }
            },
            {
                id: 'crates_stacked',
                ...LAYOUT.crates,
                interactX: LAYOUT.crates.x, interactY: 0.82,
                name: 'Stacked Crates',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Wooden crates stacked high against the wall. They look old and forgotten.",
                    action: "Empty. Just dust and disappointment."
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
            brain_jar: {
                default: "I'm not using my {item} on a brain in a jar. That feels wrong."
            },
            generator_nuclear: {
                fuse: "I insert the fuse into the Lab 1 slot. The indicator light flickers on. Lab 1 is back online!",
                default: "The {item} doesn't fit anywhere on the generator."
            },
            _default: "I don't think the {item} works with the {hotspot}."
        },

        firstVisit: {
            delay: 800,
            dialogue: "Whoa. Classic creepy basement. Dank, musty, and... is that a brain?"
        },

        features: {
            basement: true,
            generator: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Stone walls
        STONE_DARK: 0x2a2a25,
        STONE_BASE: 0x3a3a30,
        STONE_MID: 0x4a4a40,
        STONE_LIGHT: 0x5a5a50,

        // Wood (beams, stairs, shelves)
        WOOD_DARK: 0x2a1a10,
        WOOD_MID: 0x4a3520,
        WOOD_LIGHT: 0x6a5030,
        WOOD_HIGHLIGHT: 0x8a6840,

        // Floor (concrete)
        FLOOR_DARK: 0x3a3a35,
        FLOOR_MID: 0x4a4a40,
        FLOOR_LIGHT: 0x5a5a4a,
        FLOOR_STAIN: 0x2a2a20,

        // Metal (pipes, generator, bulkhead)
        METAL_DARK: 0x2a2a2a,
        METAL_MID: 0x4a4a4a,
        METAL_LIGHT: 0x6a6a6a,
        METAL_RUST: 0x6a3a20,

        // Generator colors
        GEN_BODY: 0x3a4a4a,
        GEN_PANEL: 0x5a6a6a,
        GEN_LIGHT_ON: 0x44ff44,
        GEN_LIGHT_OFF: 0x2a3a2a,

        // Glass/liquid colors
        GLASS: 0x88aaaa,
        LIQUID_GREEN: 0x44ff44,
        BRAIN_PINK: 0xffaacc,

        // Lighting
        BULB_GLOW: 0xffcc88,
        DAYLIGHT: 0xaabbdd,

        // Cobwebs
        WEB_GRAY: 0x8a8a8a
    };

    const p = 2;

    function drawStoneWall(g, x, y, width, height) {
        // Base stone wall
        g.fillStyle(COLORS.STONE_BASE);
        g.fillRect(x, y, width, height);

        // Stone blocks with mortar lines
        const blockHeight = p * 18;
        const blockWidths = [p * 45, p * 52, p * 38, p * 48];

        let currentY = y;
        let rowOffset = 0;

        while (currentY < y + height) {
            let currentX = x + (rowOffset % 2 === 0 ? 0 : -p * 22);

            while (currentX < x + width) {
                const blockWidth = blockWidths[Math.floor((currentX + currentY) / 50) % blockWidths.length];

                if (currentX + blockWidth > x && currentX < x + width) {
                    // Draw stone block
                    g.fillStyle(COLORS.STONE_MID);
                    g.fillRect(Math.max(currentX, x), currentY,
                              Math.min(blockWidth, x + width - currentX), blockHeight);

                    // Highlight
                    g.fillStyle(COLORS.STONE_LIGHT);
                    g.fillRect(Math.max(currentX + p, x), currentY + p,
                              Math.min(blockWidth - p * 2, x + width - currentX - p), p * 2);

                    // Shadow
                    g.fillStyle(COLORS.STONE_DARK);
                    g.fillRect(Math.max(currentX + p, x), currentY + blockHeight - p * 2,
                              Math.min(blockWidth - p * 2, x + width - currentX - p), p);
                }

                // Mortar line
                g.fillStyle(COLORS.STONE_DARK);
                g.fillRect(Math.max(currentX, x), currentY + blockHeight - p,
                          Math.min(blockWidth, x + width - currentX), p);

                currentX += blockWidth;
            }

            currentY += blockHeight;
            rowOffset++;
        }

        // Moisture stains
        g.fillStyle(COLORS.FLOOR_STAIN);
        for (let i = 0; i < 5; i++) {
            const stainX = x + ((i * 347) % width);
            const stainY = y + height - p * 60 + ((i * 123) % 80);
            g.globalAlpha = 0.3;
            g.fillRect(stainX, stainY, p * 20, p * 40);
            g.globalAlpha = 1.0;
        }
    }

    function drawSupportBeam(g, x, floorY, height) {
        const beamWidth = p * 40;
        const beamTop = 0;

        // Main beam
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - beamWidth / 2, beamTop, beamWidth, floorY);

        // Wood grain
        for (let py = beamTop + p * 10; py < floorY - p * 10; py += p * 15) {
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x - beamWidth / 2 + p * 4, py, beamWidth - p * 8, p * 2);
            g.fillRect(x - beamWidth / 2 + p * 6, py + p * 5, beamWidth - p * 12, p);
        }

        // Highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - beamWidth / 2 + p * 2, beamTop + p * 5, p * 3, floorY - p * 10);

        // Shadows
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + beamWidth / 2 - p * 5, beamTop + p * 5, p * 3, floorY - p * 10);

        // Base plate
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - beamWidth / 2 - p * 4, floorY - p * 8, beamWidth + p * 8, p * 8);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - beamWidth / 2 - p * 2, floorY - p * 6, beamWidth + p * 4, p * 4);
    }

    function drawExposedPipes(g, y, worldWidth) {
        const pipeY = y + p * 8;
        const pipeThickness = p * 30; // 2.5x bigger (was p * 12)

        // Main pipe run - spanning full width
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(0, pipeY, worldWidth, pipeThickness);

        // Pipe highlights
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(0, pipeY + p, worldWidth, p * 3);

        // Pipe shadows
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(0, pipeY + pipeThickness - p * 3, worldWidth, p * 3);

        // Pipe joints
        const numJoints = 8;
        const jointSpacing = worldWidth / numJoints;
        for (let i = 1; i < numJoints; i++) {
            const jointX = i * jointSpacing;
            g.fillStyle(COLORS.METAL_LIGHT);
            g.fillRect(jointX - p * 6, pipeY - p * 3, p * 12, pipeThickness + p * 6);
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(jointX - p * 4, pipeY, p * 8, pipeThickness);
        }

        // Rust spots
        g.fillStyle(COLORS.METAL_RUST);
        for (let i = 0; i < 15; i++) {
            const rustX = (i * 213) % (worldWidth - p * 10);
            g.fillRect(rustX, pipeY + p * 3, p * 6, p * 3);
        }

        // Water drips
        g.fillStyle(COLORS.GLASS);
        g.globalAlpha = 0.6;
        for (let i = 0; i < 8; i++) {
            const dripX = (i * 457) % (worldWidth - p * 5);
            g.fillRect(dripX, pipeY + pipeThickness, p, p * 12);
            g.fillRect(dripX - p, pipeY + pipeThickness + p * 8, p * 3, p * 4);
        }
        g.globalAlpha = 1.0;
    }

    function drawBulkheadStairs(g, x, floorY, ceilingY) {
        // Steeper stairs with 1:1 step:riser ratio, reaching to top of screen
        const stepSize = p * 30; // Both width and height (1:1 ratio)
        const numSteps = 12; // More steps to reach ceiling

        // Calculate where stairs start (leftmost point)
        const stairLeft = x - (numSteps * stepSize);

        // Wood wall UNDER stairs - fills triangular space below the diagonal staircase
        g.fillStyle(COLORS.WOOD_DARK);
        for (let i = 0; i < numSteps; i++) {
            const stripX = x - (i * stepSize); // Position moving left
            const stepY = floorY - ((numSteps - i) * stepSize); // TOP of this step
            const stepBottom = stepY + stepSize; // BOTTOM of this step
            const wallHeight = floorY - stepBottom; // From bottom of step down to floor

            // Only draw if there's space below the step (step is above floor)
            if (wallHeight > 0) {
                g.fillRect(stripX - stepSize, stepBottom, stepSize, wallHeight);
            }
        }

        // Wood wall texture - vertical planks
        g.fillStyle(COLORS.WOOD_MID);
        for (let i = 0; i < numSteps; i++) {
            const stripX = x - (i * stepSize);
            const stepY = floorY - ((numSteps - i) * stepSize);
            const stepBottom = stepY + stepSize;
            const wallHeight = floorY - stepBottom;

            if (wallHeight > p * 20 && i % 3 === 0) {
                g.fillRect(stripX - stepSize + p * 8, stepBottom + p * 10, p * 3, wallHeight - p * 20);
            }
        }

        // Draw stairs from bottom to top (back to front)
        for (let i = numSteps - 1; i >= 0; i--) {
            const stepY = floorY - ((numSteps - i) * stepSize);
            const stepX = x - (i * stepSize);

            // Riser (vertical face) - what we see from the side
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(stepX - stepSize, stepY, stepSize, stepSize);

            // Riser highlight (left edge)
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(stepX - stepSize + p * 2, stepY + p * 2, p * 2, stepSize - p * 4);

            // Riser shadow (right edge)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(stepX - p * 3, stepY + p * 2, p * 2, stepSize - p * 4);

            // Tread (horizontal top surface)
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(stepX - stepSize, stepY, stepSize, p * 4);

            // Wood grain on tread
            g.fillStyle(COLORS.WOOD_MID);
            if (stepSize > p * 20) {
                g.fillRect(stepX - stepSize + p * 6, stepY + p, stepSize - p * 12, p);
            }
        }

        // Side stringer (right side support beam)
        g.fillStyle(COLORS.WOOD_DARK);
        const stringerX = x + p * 4;
        const stringerTop = floorY - (numSteps * stepSize);
        g.fillRect(stringerX, stringerTop, p * 10, floorY - stringerTop);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(stringerX + p * 2, stringerTop + p * 8, p * 6, floorY - stringerTop - p * 16);

        // Light from above (through open bulkhead)
        const topStepY = floorY - (numSteps * stepSize);
        g.fillStyle(COLORS.DAYLIGHT);
        g.globalAlpha = 0.3;
        g.fillRect(stairLeft - p * 30, ceilingY, (numSteps * stepSize) + p * 60, topStepY + p * 20);
        g.globalAlpha = 1.0;

        // Metal bulkhead doors at top (angled, open)
        const bulkheadY = ceilingY + p * 5;
        g.fillStyle(COLORS.METAL_MID);
        // Left door
        g.fillRect(stairLeft - p * 20, bulkheadY, p * 80, p * 12);
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(stairLeft - p * 18, bulkheadY + p * 2, p * 76, p * 3);
        // Right door
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(stairLeft + p * 70, bulkheadY - p * 8, p * 80, p * 12);
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(stairLeft + p * 72, bulkheadY - p * 6, p * 76, p * 3);
    }

    function drawGenerator(g, x, floorY) {
        const genWidth = p * 140;
        const genHeight = p * 120;
        const genTop = floorY - genHeight;

        // Metal casing frame (FIRST - base layer)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - genWidth / 2, genTop, genWidth, genHeight);

        // Metal panels (second layer)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - genWidth / 2 + p * 4, genTop + p * 4, genWidth - p * 8, genHeight - p * 8);

        // Metal panel detail lines
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - genWidth / 2 + p * 6, genTop + p * 35, genWidth - p * 12, p * 2);
        g.fillRect(x - genWidth / 2 + p * 6, genTop + p * 60, genWidth - p * 12, p * 2);

        // Viewing windows (recessed, where green glows through)
        const windowWidth = p * 28;
        const windowHeight = p * 38;

        // Left window frame
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 52, genTop + p * 18, windowWidth + p * 4, windowHeight + p * 4);
        g.fillStyle(0x0a0a0a);
        g.fillRect(x - p * 50, genTop + p * 20, windowWidth, windowHeight);
        // Green glow INSIDE window
        g.fillStyle(COLORS.LIQUID_GREEN);
        g.fillRect(x - p * 48, genTop + p * 22, windowWidth - p * 4, windowHeight - p * 4);

        // Right window frame
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + p * 24, genTop + p * 18, windowWidth + p * 4, windowHeight + p * 4);
        g.fillStyle(0x0a0a0a);
        g.fillRect(x + p * 26, genTop + p * 20, windowWidth, windowHeight);
        // Green glow INSIDE window
        g.fillStyle(COLORS.LIQUID_GREEN);
        g.fillRect(x + p * 28, genTop + p * 22, windowWidth - p * 4, windowHeight - p * 4);

        // Control panel (raised metal plate with indicators)
        const panelX = x - p * 35;
        const panelY = genTop + p * 68;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(panelX, panelY, p * 70, p * 42);
        g.fillStyle(COLORS.GEN_PANEL);
        g.fillRect(panelX + p * 3, panelY + p * 3, p * 64, p * 36);

        // "Lab 1" indicator housing (OFF - dark)
        g.fillStyle(0x1a1a1a);
        g.fillRect(panelX + p * 10, panelY + p * 8, p * 14, p * 14);
        g.fillStyle(COLORS.GEN_LIGHT_OFF);
        g.fillRect(panelX + p * 12, panelY + p * 10, p * 10, p * 10);

        // "Lab 2" indicator housing (ON - bright green)
        g.fillStyle(0x1a1a1a);
        g.fillRect(panelX + p * 46, panelY + p * 8, p * 14, p * 14);
        g.fillStyle(COLORS.GEN_LIGHT_ON);
        g.fillRect(panelX + p * 48, panelY + p * 10, p * 10, p * 10);

        // Label plates below indicators
        g.fillStyle(0xdddddd);
        g.fillRect(panelX + p * 9, panelY + p * 24, p * 16, p * 4);
        g.fillRect(panelX + p * 45, panelY + p * 24, p * 16, p * 4);
        // Label text lines
        g.fillStyle(0x1a1a1a);
        g.fillRect(panelX + p * 11, panelY + p * 25, p * 12, p);
        g.fillRect(panelX + p * 11, panelY + p * 27, p * 8, p);
        g.fillRect(panelX + p * 47, panelY + p * 25, p * 12, p);
        g.fillRect(panelX + p * 47, panelY + p * 27, p * 8, p);

        // Rivets/bolts around edges
        g.fillStyle(COLORS.METAL_DARK);
        const rivetPositions = [p * 10, p * 35, p * 60, p * 85, p * 110];
        rivetPositions.forEach(rx => {
            g.fillRect(x - genWidth / 2 + rx, genTop + p * 8, p * 4, p * 4);
            g.fillRect(x - genWidth / 2 + rx, genTop + genHeight - p * 12, p * 4, p * 4);
        });

        // Cooling vents (right side)
        for (let vy = genTop + p * 15; vy < genTop + p * 65; vy += p * 8) {
            g.fillStyle(0x1a1a1a);
            g.fillRect(x + genWidth / 2 - p * 22, vy, p * 18, p * 4);
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(x + genWidth / 2 - p * 21, vy + p, p * 16, p * 2);
        }

        // Power cord at base (thicker, more visible)
        const cordX = x - genWidth / 2 + p * 20;
        g.fillStyle(0x1a1a1a);
        g.fillRect(cordX, genTop + genHeight - p * 15, p * 4, p * 15);
        g.fillRect(cordX - p * 12, floorY - p * 4, p * 16, p * 4);

        // Wall outlet (more detailed)
        g.fillStyle(COLORS.STONE_MID);
        g.fillRect(cordX - p * 22, floorY - p * 18, p * 20, p * 14);
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(cordX - p * 20, floorY - p * 16, p * 16, p * 10);
        // Outlet holes
        g.fillStyle(0x0a0a0a);
        g.fillRect(cordX - p * 17, floorY - p * 13, p * 4, p * 4);
        g.fillRect(cordX - p * 11, floorY - p * 13, p * 4, p * 4);
    }

    function drawStorageShelves(g, startX, floorY, worldWidth) {
        const shelfWidth = worldWidth - startX; // Extend to far right
        const shelfHeight = p * 160;
        const shelfTop = floorY - shelfHeight;
        const numShelves = 5;
        const shelfSpacing = shelfHeight / numShelves;

        // Frame (left and right posts)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(startX, shelfTop, p * 8, shelfHeight);
        g.fillRect(worldWidth - p * 8, shelfTop, p * 8, shelfHeight);

        // Shelves
        for (let i = 0; i < numShelves; i++) {
            const shelfY = shelfTop + i * shelfSpacing + p * 10;

            // Shelf board (sagging in middle)
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(startX, shelfY, shelfWidth, p * 8);
            g.fillStyle(COLORS.WOOD_DARK);
            // Sag in middle
            const sagX = startX + shelfWidth / 2 - p * 15;
            g.fillRect(sagX, shelfY + p * 3, p * 30, p * 2);

            // Wood grain
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(startX + p * 10, shelfY + p, shelfWidth - p * 20, p);
        }

        // Brain jar on second shelf (most prominent) - using LAYOUT position
        const brainShelfY = shelfTop + shelfSpacing + p * 15;
        drawBrainJar(g, LAYOUT.brain_jar.x, brainShelfY - p * 35);

        // Other jars on various shelves
        drawJar(g, startX + p * 40, brainShelfY - p * 22, p * 12, p * 18, 0x8888ff);
        drawJar(g, startX + p * 65, brainShelfY - p * 24, p * 10, p * 16, 0xff8888);

        // Jars on third shelf
        const thirdShelfY = shelfTop + shelfSpacing * 2 + p * 15;
        drawJar(g, startX + p * 25, thirdShelfY - p * 20, p * 14, p * 22, 0xffaa44);
        drawJar(g, startX + p * 90, thirdShelfY - p * 18, p * 12, p * 20, 0xaa88ff);

        // Boxes and clutter on shelves
        g.fillStyle(0x4a3a2a);
        g.fillRect(startX + p * 15, brainShelfY - p * 18, p * 18, p * 18);
        g.fillStyle(0x5a4a3a);
        g.fillRect(startX + p * 16, brainShelfY - p * 17, p * 16, p * 3);

        // More boxes on fourth shelf
        const fourthShelfY = shelfTop + shelfSpacing * 3 + p * 15;
        g.fillStyle(0x3a3a2a);
        g.fillRect(startX + p * 50, fourthShelfY - p * 15, p * 20, p * 15);
        g.fillRect(startX + p * 75, fourthShelfY - p * 12, p * 15, p * 12);
    }

    function drawBrainJar(g, x, y) {
        const jarWidth = p * 50;  // Much bigger jar to contain all green
        const jarHeight = p * 60;

        // Bright glowing liquid (inside jar) - brighter and more vibrant
        g.fillStyle(0x66ff66);  // Brighter green for glow effect
        g.globalAlpha = 0.8;
        g.fillRect(x - jarWidth / 2 + p * 3, y + p * 6, jarWidth - p * 6, jarHeight - p * 12);
        g.globalAlpha = 1.0;

        // Inner glow (inside jar, layered for brightness)
        g.fillStyle(0xaaffaa);  // Very bright green
        g.globalAlpha = 0.4;
        g.fillRect(x - jarWidth / 2 + p * 6, y + p * 10, jarWidth - p * 12, jarHeight - p * 20);
        g.globalAlpha = 1.0;

        // Brain (floating in liquid) - larger to match jar size
        g.fillStyle(COLORS.BRAIN_PINK);
        g.fillRect(x - p * 14, y + p * 22, p * 28, p * 20);
        g.fillStyle(0xffccdd);
        g.fillRect(x - p * 10, y + p * 26, p * 8, p * 4);
        g.fillRect(x + p * 4, y + p * 30, p * 6, p * 4);
        g.fillRect(x - p * 6, y + p * 36, p * 12, p * 4);

        // Jar glass outline (in front of liquid) - thick visible edges
        g.fillStyle(COLORS.GLASS);
        g.globalAlpha = 0.7;
        // Left edge
        g.fillRect(x - jarWidth / 2, y, p * 3, jarHeight);
        // Right edge
        g.fillRect(x + jarWidth / 2 - p * 3, y, p * 3, jarHeight);
        // Bottom
        g.fillRect(x - jarWidth / 2, y + jarHeight - p * 3, jarWidth, p * 3);
        g.globalAlpha = 1.0;

        // Lid (AFTER liquid - clearly visible on top)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - jarWidth / 2 - p * 2, y - p * 5, jarWidth + p * 4, p * 6);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - jarWidth / 2 - p, y - p * 3, jarWidth + p * 2, p * 3);

        // "ABNORMAL" label (AFTER liquid - clearly visible in front)
        g.fillStyle(0xeeeeee);
        g.fillRect(x - p * 18, y + jarHeight - p * 10, p * 36, p * 7);
        g.fillStyle(0x1a1a1a);
        // Letter shapes (simplified "ABNORMAL")
        g.fillRect(x - p * 14, y + jarHeight - p * 8, p * 3, p * 3);
        g.fillRect(x - p * 9, y + jarHeight - p * 8, p * 3, p * 3);
        g.fillRect(x - p * 4, y + jarHeight - p * 8, p * 3, p * 3);
        g.fillRect(x + p * 1, y + jarHeight - p * 8, p * 3, p * 3);
        g.fillRect(x + p * 6, y + jarHeight - p * 8, p * 3, p * 3);
        g.fillRect(x + p * 11, y + jarHeight - p * 8, p * 3, p * 3);
    }

    function drawJar(g, x, y, width, height, liquidColor) {
        // Jar glass
        g.fillStyle(COLORS.GLASS);
        g.globalAlpha = 0.3;
        g.fillRect(x - width / 2, y, width, height);
        g.globalAlpha = 1.0;

        // Liquid
        g.fillStyle(liquidColor);
        g.globalAlpha = 0.5;
        g.fillRect(x - width / 2 + p, y + p * 3, width - p * 2, height - p * 6);
        g.globalAlpha = 1.0;

        // Lid
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - width / 2 - p, y - p * 2, width + p * 2, p * 3);
    }

    function drawCobwebs(g, x, y, width, height) {
        g.fillStyle(COLORS.WEB_GRAY);
        g.globalAlpha = 0.4;

        // Anchor points
        const anchors = [
            { x: x, y: y },
            { x: x + width, y: y },
            { x: x + width / 2, y: y + height }
        ];

        // Draw web strands
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const length = width * 0.6;
            const endX = x + width / 2 + Math.cos(angle) * length;
            const endY = y + height / 2 + Math.sin(angle) * length;

            g.fillRect(x + width / 2 - p / 2, y + height / 2 - p / 2,
                      endX - (x + width / 2), p);
        }

        // Spiral
        for (let r = 10; r < 40; r += 10) {
            const cx = x + width / 2;
            const cy = y + height / 2;
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const px = cx + Math.cos(angle) * r;
                const py = cy + Math.sin(angle) * r;
                g.fillRect(px - p / 2, py - p / 2, p, p);
            }
        }

        g.globalAlpha = 1.0;
    }

    function drawBareLightbulb(g, x, y) {
        // Cord
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p / 2, 0, p, y);

        // Socket
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 4, y - p * 6, p * 8, p * 6);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p * 3, y - p * 5, p * 6, p * 4);

        // Bulb glass
        g.fillStyle(COLORS.BULB_GLOW);
        g.fillRect(x - p * 5, y, p * 10, p * 14);
        g.fillStyle(0xffffcc);
        g.fillRect(x - p * 3, y + p * 2, p * 6, p * 10);

        // Bulb glow
        g.fillStyle(COLORS.BULB_GLOW);
        g.globalAlpha = 0.4;
        g.fillRect(x - p * 12, y - p * 8, p * 24, p * 30);
        g.globalAlpha = 1.0;
    }

    function drawTableLamp(g, x, y) {
        // Base (wider, traditional lamp base)
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 12, y - p * 2, p * 24, p * 6);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p * 10, y, p * 20, p * 4);

        // Body/column (short ceramic or metal column)
        g.fillStyle(0x4a3a2a); // Ceramic brown
        g.fillRect(x - p * 5, y - p * 46, p * 10, p * 44);
        // Column highlight
        g.fillStyle(0x5a4a3a);
        g.fillRect(x - p * 4, y - p * 44, p * 3, p * 40);
        // Column bands (decorative rings)
        g.fillStyle(0x3a2a1a);
        g.fillRect(x - p * 5, y - p * 12, p * 10, p * 2);
        g.fillRect(x - p * 5, y - p * 30, p * 10, p * 2);

        // Socket at top of column
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p * 4, y - p * 50, p * 8, p * 4);

        // Lampshade (traditional cone/drum shape)
        // Outer shade fabric
        g.fillStyle(0x8a7a5a); // Beige/cream fabric
        g.fillRect(x - p * 16, y - p * 60, p * 32, p * 14);

        // Shade top band
        g.fillStyle(0x6a5a4a);
        g.fillRect(x - p * 16, y - p * 60, p * 32, p * 2);

        // Shade bottom band
        g.fillStyle(0x6a5a4a);
        g.fillRect(x - p * 16, y - p * 48, p * 32, p * 2);

        // Inner shade (darker, shows it's hollow)
        g.fillStyle(0x3a3020);
        g.fillRect(x - p * 14, y - p * 58, p * 28, p * 10);

        // Bulb glow (warm light from inside)
        g.fillStyle(0xffffcc);
        g.globalAlpha = 0.8;
        g.fillRect(x - p * 12, y - p * 56, p * 24, p * 8);
        g.globalAlpha = 1.0;

        // Shade texture (vertical lines suggesting pleats/fabric)
        g.fillStyle(0x7a6a4a);
        g.globalAlpha = 0.3;
        for (let i = 0; i < 8; i++) {
            g.fillRect(x - p * 14 + i * p * 4, y - p * 58, p, p * 10);
        }
        g.globalAlpha = 1.0;
    }

    function drawFloorDrain(g, x, y) {
        const drainSize = p * 15;

        // Drain grate
        g.fillStyle(COLORS.METAL_RUST);
        g.fillRect(x - drainSize / 2, y - drainSize / 2, drainSize, drainSize);

        // Grate slots
        g.fillStyle(0x0a0a0a);
        for (let i = 0; i < 5; i++) {
            g.fillRect(x - drainSize / 2 + p * 2,
                      y - drainSize / 2 + p * 2 + i * p * 3,
                      drainSize - p * 4, p);
        }

        // Water pooled around drain
        g.fillStyle(COLORS.FLOOR_STAIN);
        g.globalAlpha = 0.5;
        g.fillRect(x - drainSize, y - drainSize, drainSize * 2, drainSize * 2);
        g.globalAlpha = 1.0;
    }

    function drawOldWorkbench(g, x, floorY) {
        const benchWidth = p * 140; // Wider
        const benchHeight = p * 80; // Taller (was p * 50)
        const benchTop = floorY - benchHeight;

        // Bench surface
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - benchWidth / 2, benchTop, benchWidth, p * 10);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - benchWidth / 2 + p * 3, benchTop + p, benchWidth - p * 6, p * 3);

        // Legs
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - benchWidth / 2 + p * 8, benchTop + p * 10, p * 8, benchHeight - p * 10);
        g.fillRect(x + benchWidth / 2 - p * 16, benchTop + p * 10, p * 8, benchHeight - p * 10);

        // Shelf under bench
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - benchWidth / 2 + p * 4, benchTop + p * 30, benchWidth - p * 8, p * 6);

        // Tools on bench (larger)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p * 40, benchTop - p * 6, p * 18, p * 6);
        g.fillRect(x - p * 15, benchTop - p * 4, p * 12, p * 4);
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + p * 5, benchTop - p * 5, p * 25, p * 5);
        g.fillRect(x + p * 35, benchTop - p * 7, p * 12, p * 7);

        // Parts scattered on bench
        g.fillStyle(0x6a6a6a);
        g.fillRect(x - p * 5, benchTop - p * 2, p * 4, p * 2);
        g.fillRect(x + p * 18, benchTop - p * 2, p * 3, p * 2);
    }

    function drawStackedCrates(g, x, floorY) {
        const crateSize = p * 40;
        const numCrates = 4; // Stack of 4 crates
        const crateLeft = x - crateSize / 2; // x is center, calculate left edge

        // Draw crates from bottom to top, aligned evenly, sitting ON the floor
        for (let i = 0; i < numCrates; i++) {
            const crateY = floorY + p * 4 - ((i + 1) * crateSize); // +p*4 to sit slightly into floor

            // Crate frame
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(crateLeft, crateY, crateSize, crateSize);

            // Crate face
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(crateLeft + p * 2, crateY + p * 2, crateSize - p * 4, crateSize - p * 4);

            // Wood slats (horizontal)
            for (let j = 0; j < 3; j++) {
                g.fillStyle(COLORS.WOOD_DARK);
                g.fillRect(crateLeft + p * 4, crateY + p * 6 + j * p * 12, crateSize - p * 8, p * 3);
            }

            // Wood grain
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(crateLeft + p * 6, crateY + p * 4, crateSize - p * 12, p);
            g.fillRect(crateLeft + p * 8, crateY + p * 18, crateSize - p * 16, p);
        }
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawBasementRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72; // MEDIUM camera
        const ceilingY = 0;

        // === STONE WALLS ===
        drawStoneWall(g, 0, ceilingY, worldWidth, floorY);

        // === FLOOR (concrete) ===
        g.fillStyle(COLORS.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Floor texture (concrete cracks)
        for (let fx = 0; fx < worldWidth; fx += p * 40) {
            g.fillStyle(COLORS.FLOOR_MID);
            g.fillRect(fx + p * 3, floorY + p * 5, p * 25, p);
            g.fillStyle(COLORS.FLOOR_LIGHT);
            g.fillRect(fx + p * 10, floorY + p * 12, p * 15, p);
        }

        // === CEILING ELEMENTS ===
        // Exposed pipes (spanning full width)
        drawExposedPipes(g, ceilingY, worldWidth);

        // === SUPPORT BEAMS ===
        drawSupportBeam(g, p * 230, floorY, height);
        drawSupportBeam(g, p * 590, floorY, height);

        // === NUCLEAR GENERATOR (left side) ===
        drawGenerator(g, LAYOUT.generator.x, floorY);

        // === STACKED CRATES (far left corner) ===
        drawStackedCrates(g, LAYOUT.crates.x, floorY);

        // === BULKHEAD STAIRS ===
        const stairsRightEdge = LAYOUT.bulkhead_stairs.x + LAYOUT.bulkhead_stairs.w / 2;
        drawBulkheadStairs(g, stairsRightEdge, floorY, ceilingY);

        // === STORAGE SHELVES (right side, extending to far right) ===
        drawStorageShelves(g, p * 720, floorY, worldWidth);

        // === OLD WORKBENCH ===
        // Drawn AFTER stairs so it appears in front of the wood wall
        drawOldWorkbench(g, LAYOUT.workbench.x, floorY);

        // === TASK LAMP (on workbench) ===
        // Base sits at 0.50 (on bench), but hotspot is centered on shade at 0.413
        const taskLampBaseY = height * 0.50;
        drawTableLamp(g, LAYOUT.task_lamp.x, taskLampBaseY);

        // === BARE LIGHT BULB (drawn after stairs so it appears in front) ===
        const lightbulbY = LAYOUT.lightbulb.y * height;
        drawBareLightbulb(g, LAYOUT.lightbulb.x, lightbulbY);

        // === COBWEBS (corners) ===
        const cobwebLeftX = LAYOUT.cobwebs.x - LAYOUT.cobwebs.w / 2;
        const cobwebTopY = LAYOUT.cobwebs.y * height;
        drawCobwebs(g, cobwebLeftX, cobwebTopY, LAYOUT.cobwebs.w, LAYOUT.cobwebs.h * height);
        // Right corner cobwebs (decorative, no hotspot)
        drawCobwebs(g, worldWidth - p * 60, p * 40, p * 50, p * 50);
    }

})();
