// ============================================================================
// LABORATORY - Hector's Main Lab
// ============================================================================
// A large scientific workspace where the portal experiment takes place.
// This is pre-accident: everything is working, humming along nicely.
// Nate sees this for the first time with wonder and nervous excitement.
//
// Connects to: interior (left door), back_lab (center door), side_room (right door)
// Width: 3200px (2.5x screen), Camera: MEDIUM
// ============================================================================

(function() {
    'use strict';

    // =========================================================================
    // ROOM DATA
    // =========================================================================

    TSH.Rooms.laboratory = {
        id: 'laboratory',
        name: "Hector's Laboratory",

        worldWidth: 3200,
        screenWidth: 1280,
        cameraPreset: 'MEDIUM',

        walkableArea: {
            polygon: [
                { x: 0, y: 0.73 },
                { x: 200, y: 0.73 },
                { x: 400, y: 0.74 },
                { x: 800, y: 0.73 },
                { x: 1200, y: 0.74 },
                { x: 1600, y: 0.73 },
                { x: 2000, y: 0.74 },
                { x: 2400, y: 0.73 },
                { x: 2800, y: 0.74 },
                { x: 3200, y: 0.73 },
                { x: 3200, y: 0.92 },
                { x: 0, y: 0.92 }
            ]
        },

        lighting: {
            enabled: true,
            ambient: 0x7a8a7a,
            ambientMobile: 0x9aaa9a,
            sources: [
                { id: 'overhead_1', x: 400, y: 0.15, radius: 400, color: 0xddffdd, intensity: 1.0 },
                { id: 'overhead_2', x: 1000, y: 0.15, radius: 400, color: 0xddffdd, intensity: 1.0 },
                { id: 'overhead_3', x: 1600, y: 0.15, radius: 400, color: 0xddffdd, intensity: 1.0 },
                { id: 'overhead_4', x: 2200, y: 0.15, radius: 400, color: 0xddffdd, intensity: 1.0 },
                { id: 'overhead_5', x: 2800, y: 0.15, radius: 400, color: 0xddffdd, intensity: 1.0 },
                { id: 'teleporter_glow', x: 575, y: 0.60, radius: 250, color: 0x88ffaa, intensity: 0.8 },
                { id: 'portal_glow', x: 1950, y: 0.45, radius: 350, color: 0x66ff88, intensity: 1.2 },
                { id: 'terminal_glow', x: 2650, y: 0.55, radius: 200, color: 0x44ff66, intensity: 0.7 }
            ]
        },

        audio: {
            music: {
                key: 'lab_theme',
                volume: 0.6,
                fade: 1000
            },
            continueFrom: ['interior', 'back_lab']
        },

        layers: [
            {
                name: 'room',
                scrollFactor: 1.0,
                depth: 50,
                draw: drawLaboratoryRoom
            }
        ],

        spawns: {
            default: { x: 300, y: 0.82 },
            from_interior: { x: 300, y: 0.82 },
            from_backlab: { x: 1600, y: 0.82 },
            from_secure_storage: { x: 1600, y: 0.82 },
            from_sideroom: { x: 3000, y: 0.82 }
        },

        exits: [],  // Using door hotspots instead of edge exits

        npcs: [
            {
                id: 'hector',
                position: { x: 2700, y: 0.82 },
                sprite: 'hector_placeholder',
                dialogue: 'hector_lab',
                name: 'Hector',
                lookResponse: "A composed man in a pristine lab coat. Slick dark hair, goggles on his forehead, a meticulous mustache. He's focused on the terminal, completely in his element."
            }
        ],

        // =====================================================================
        // HOTSPOTS
        // =====================================================================

        hotspots: [
            // === DOORS ===
            // Coordinates use CENTER-BASED x,y (not top-left)
            {
                id: 'door_interior',
                x: 176, y: 0.497, w: 113, h: 0.400,
                interactX: 176, interactY: 0.82,
                name: 'Door to House',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "The door back to the foyer. Feels like I just walked through it, but also like a lifetime ago.",
                    action: "Back to the normal part of the house. Well, 'normal.'"
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'interior',
                    spawnPoint: 'from_laboratory'
                }
            },
            {
                id: 'door_backlab',
                x: 1556, y: 0.500, w: 116, h: 0.394,
                interactX: 1556, interactY: 0.82,
                name: 'Back Lab Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Heavy security door. There's a keypad and what looks like a retina scanner. Behind it is the secure storage area with laser grids."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'secure_storage',
                    spawnPoint: 'from_laboratory'
                }
            },
            {
                id: 'door_sideroom',
                x: 3058, y: 0.505, w: 116, h: 0.396,
                interactX: 3058, interactY: 0.82,
                name: 'Side Room Door',
                verbs: { action: 'Open', look: 'Examine' },
                responses: {
                    look: "Another door. This one has a small window. Looks like a storage area back there."
                },
                actionTrigger: {
                    type: 'transition',
                    target: 'back_lab',
                    spawnPoint: 'from_laboratory'
                }
            },

            // === TELEPORTER ===
            {
                id: 'device_teleporter',
                x: 579, y: 0.464, w: 301, h: 0.475,
                interactX: 579, interactY: 0.82,
                name: 'Teleporter',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "Two circular pads side by side, connected by a mess of cables and a control panel. Very Star Trek. Very 'I hope this doesn't scramble my atoms.'",
                    action: "I probably shouldn't just hop on without asking. That seems like a good way to end up as two of me. Or half of me."
                }
            },
            {
                id: 'teleporter_controls',
                x: 574, y: 0.672, w: 44, h: 0.077,
                interactX: 574, interactY: 0.82,
                name: 'Teleporter Controls',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "Buttons, dials, a couple of levers. There's a label that says 'DEMATERIALIZATION SEQUENCE' which is both exciting and terrifying.",
                    action: "Better not touch anything without knowing what I'm doing. The word 'dematerialization' demands respect."
                }
            },

            // === WORK AREA ===
            {
                id: 'workbench',
                x: 1019, y: 0.643, w: 231, h: 0.106,
                interactX: 1019, interactY: 0.82,
                name: 'Workbench',
                verbs: { action: 'Search', look: 'Examine' },
                responses: {
                    look: "A long metal workbench covered in equipment. Soldering irons, multimeters, half-assembled gizmos. This is where the magic happens.",
                    action: "I rifle through carefully. Tools, spare parts, a half-eaten sandwich. The essentials of scientific discovery."
                }
            },
            {
                id: 'beakers',
                x: 1214, y: 0.575, w: 111, h: 0.152,
                interactX: 1214, interactY: 0.82,
                name: 'Beakers and Tubes',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "Glass beakers, test tubes, bubbling liquids in colors that don't occur in nature. Some of them are glowing. That's probably fine.",
                    action: "I gently tap one. It bubbles more aggressively. I stop tapping."
                }
            },
            {
                id: 'panel_controls',
                x: 1370, y: 0.439, w: 139, h: 0.270,
                interactX: 1370, interactY: 0.82,
                name: 'Control Panel',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "A wall-mounted panel covered in switches, gauges, and indicator lights. Most of them are green. Green is good, right?",
                    action: "I'm not touching anything until someone tells me what these do. I've seen enough movies."
                }
            },

            // === PORTAL DEVICE (FOCAL POINT) ===
            {
                id: 'device_portal',
                x: 1932, y: 0.449, w: 314, h: 0.433,
                interactX: 1932, interactY: 0.82,
                name: 'Portal Device',
                verbs: { action: 'Examine', look: 'Study' },
                responses: {
                    look: "Whoa. That is... a LOT of science happening right there. A massive ring of metal and glass, humming with power. Cables snake everywhere. Lights pulse in rhythm. This is the real deal.",
                    action: "I lean in for a closer look. The air around it feels... charged. Electric. Like standing next to something that's about to change everything."
                }
            },

            // === FOUR COMPONENTS ===
            {
                id: 'component_clock',
                x: 2137, y: 0.544, w: 60, h: 0.110,
                interactX: 2137, interactY: 0.82,
                name: 'Temporal Synchronizer',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A sophisticated clock mechanism integrated into the portal frame. It's ticking away steadily, keeping perfect time. The label reads 'TEMPORAL SYNCHRONIZER' which sounds way cooler than 'fancy clock.'",
                    action: "It's humming along perfectly. Probably best not to mess with something that has 'temporal' in the name."
                }
            },
            {
                id: 'component_screen',
                x: 2228, y: 0.544, w: 59, h: 0.110,
                interactX: 2228, interactY: 0.82,
                name: 'Interdimensional Relay',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A display screen showing... wavelengths? Dimensions? Readings I can't begin to interpret. The label says 'INTERDIMENSIONAL RELAY SERVICE.' Fancy TV, got it.",
                    action: "The screen flickers through data faster than I can read. Whatever it's doing, it's doing it with confidence."
                }
            },
            {
                id: 'component_power',
                x: 2317, y: 0.543, w: 61, h: 0.113,
                interactX: 2317, interactY: 0.82,
                name: 'Energy Resonator',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "A pulsing core of contained energy. I can feel it vibrating from here. 'NUCLEAR ENERGY RESONATOR' says the label. That's not ominous at all.",
                    action: "It's practically thrumming with power. I think I'll admire it from a safe distance."
                }
            },
            {
                id: 'component_brain',
                x: 2405, y: 0.543, w: 64, h: 0.113,
                interactX: 2405, interactY: 0.82,
                name: 'Stabilizer Cortex',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "Is that a... brain? In a jar? Just casually wired into the machine? The label says 'STABILIZER CORTEX' but I know a brain when I see one. Cool. Cool cool cool.",
                    action: "I'm not touching the brain. That's a rule I'm making right now. No touching brains."
                }
            },

            // === COMPUTER TERMINAL ===
            {
                id: 'computer_terminal',
                x: 2651, y: 0.581, w: 192, h: 0.210,
                interactX: 2651, interactY: 0.82,
                name: 'Computer Terminal',
                verbs: { action: 'Use', look: 'Examine' },
                responses: {
                    look: "Multiple screens, all showing scrolling data. Green text on black backgrounds. Very retro, very serious. This is mission control.",
                    action: "I'd need to ask Hector before poking around in here. This looks like the kind of system where pressing the wrong key could be... consequential."
                }
            },

            // === LAB COAT ===
            {
                id: 'item_labcoat',
                x: 2877, y: 0.433, w: 57, h: 0.163,
                interactX: 2877, interactY: 0.82,
                name: 'Lab Coat',
                verbs: { action: 'Take', look: 'Examine' },
                responses: {
                    look: "A spare lab coat hanging on a hook. Crisp, white, official-looking. The uniform of People Who Know Things.",
                    action: "I should probably earn the right to wear one of these first. Can't just waltz in and start cosplaying as a scientist."
                }
            },

            // === DECORATIVE/FLAVOR ===
            {
                id: 'tesla_coils',
                x: 795, y: 0.483, w: 87, h: 0.463,
                interactX: 795, interactY: 0.82,
                name: 'Tesla Coils',
                verbs: { action: 'Touch', look: 'Examine' },
                responses: {
                    look: "Tesla coils! Actual Tesla coils, just... casually existing. Electricity arcs between them in beautiful, terrifying patterns. This place is amazing.",
                    action: "Touch the tesla coil, she says. It'll be fun, she says. No thank you. I like my hair the way it is."
                }
            },
            {
                id: 'wall_diagrams',
                x: 355, y: 0.350, w: 100, h: 0.177,
                interactX: 355, interactY: 0.82,
                name: 'Wall Diagrams',
                verbs: { action: 'Study', look: 'Examine' },
                responses: {
                    look: "Blueprints, schematics, hand-drawn diagrams. Some of it looks like physics, some of it looks like philosophy, and some of it looks like the ramblings of a beautiful madman.",
                    action: "I trace the lines with my eyes. Portal mechanics, dimensional theory... I understand about every fifth word, but I want to understand all of them."
                }
            },

            // === HECTOR NPC ===
            {
                id: 'hector',
                x: 2697, y: 0.604, w: 43, h: 0.395,
                interactX: 2600, interactY: 0.82,
                name: 'Scientist',
                isNPC: true,
                verbs: { action: 'Approach', look: 'Examine', talk: 'Talk to' },
                responses: {
                    look: "A composed man in a pristine lab coat. Slick dark hair, goggles pushed up on his forehead, a meticulous mustache. He's focused intently on the terminal, completely in his element.",
                    action: "I should probably just talk to him."
                }
                // Talk will trigger conversation via NPC system
            }
        ],

        // =====================================================================
        // ITEM INTERACTIONS
        // =====================================================================

        itemInteractions: {
            device_portal: {
                default: "I'm not putting my {item} anywhere near that thing. I've seen what happens when you mix random objects with portals."
            },
            device_teleporter: {
                default: "Teleporting my {item}? What if it comes back inside-out? I'd rather not risk it."
            },
            computer_terminal: {
                default: "I don't think the terminal has a slot for a {item}. Very picky about inputs, these old machines."
            },
            tesla_coils: {
                default: "The {item} and high voltage? That's how you get a very ex-{item}."
            },
            _default: "I don't think the {item} goes with the {hotspot}. But I admire my own creativity."
        },

        firstVisit: {
            delay: 800,
            dialogue: "Well. This explains the electricity bill."
        },

        features: {
            tesla_coils: true,
            portal_glow: true
        }
    };

    // =========================================================================
    // DRAWING HELPER FUNCTIONS
    // =========================================================================

    const COLORS = {
        // Metal/Industrial
        METAL_DARK: 0x2a2a35,
        METAL_MID: 0x3a3a45,
        METAL_LIGHT: 0x4a4a55,
        METAL_HIGHLIGHT: 0x5a5a65,

        // Floor
        FLOOR_DARK: 0x252530,
        FLOOR_MID: 0x303038,
        FLOOR_LIGHT: 0x3a3a42,

        // Wall panels
        WALL_DARK: 0x2a2a35,
        WALL_MID: 0x353540,
        WALL_LIGHT: 0x40404a,
        WALL_HIGHLIGHT: 0x4a4a55,

        // Science green
        LAB_DARK: 0x1a3a2a,
        LAB_MID: 0x2a5a3a,
        LAB_LIGHT: 0x4a8a5a,
        LAB_BRIGHT: 0x6aba6a,

        // Copper/brass for coils
        COPPER_DARK: 0x6a3a20,
        COPPER_MID: 0x8a5530,
        COPPER_LIGHT: 0xaa7040,

        // Screen glow
        SCREEN_DARK: 0x102010,
        SCREEN_MID: 0x204020,
        SCREEN_LIGHT: 0x40ff40,

        // Portal colors
        PORTAL_DARK: 0x1a4a2a,
        PORTAL_MID: 0x2a6a3a,
        PORTAL_LIGHT: 0x4a9a5a,
        PORTAL_BRIGHT: 0x6aca6a,
        PORTAL_CORE: 0x88ff88
    };

    function drawDoor(g, x, y, width, height, hasWindow, glowColor) {
        const p = 2;

        // Door frame
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*4, y - p*4, width + p*8, height + p*8);

        // Door body
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x, y, width, height);

        // Door panels (industrial style)
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x + p*4, y + p*4, width - p*8, height/3 - p*6);
        g.fillRect(x + p*4, y + height/3 + p*2, width - p*8, height/3 - p*4);
        g.fillRect(x + p*4, y + height*2/3, width - p*8, height/3 - p*6);

        // Highlights
        g.fillStyle(COLORS.METAL_HIGHLIGHT);
        g.fillRect(x + p*4, y + p*4, width - p*8, p*2);

        // Handle
        g.fillStyle(COLORS.METAL_HIGHLIGHT);
        g.fillRect(x + width - p*16, y + height/2 - p*8, p*8, p*16);
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + width - p*14, y + height/2 - p*6, p*4, p*12);

        // Window if specified
        if (hasWindow) {
            const winY = y + p*10;
            const winW = width - p*16;
            const winH = height/4;
            g.fillStyle(0x1a2030);
            g.fillRect(x + p*8, winY, winW, winH);
            if (glowColor) {
                g.fillStyle(glowColor, 0.3);
                g.fillRect(x + p*8, winY, winW, winH);
            }
        }

        // Keypad for security doors
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + width + p*6, y + height/2 - p*15, p*16, p*24);
        g.fillStyle(COLORS.SCREEN_DARK);
        g.fillRect(x + width + p*8, y + height/2 - p*13, p*12, p*8);
        // Keypad buttons
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                g.fillStyle(COLORS.METAL_LIGHT);
                g.fillRect(x + width + p*8 + col*p*4, y + height/2 - p*3 + row*p*5, p*3, p*3);
            }
        }
    }

    function drawTeleporter(g, x, y, floorY) {
        const p = 2;
        const padRadius = p*35;
        const padY = floorY - p*4;

        // Base platform
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*80, padY - p*8, p*160, p*12);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*78, padY - p*6, p*156, p*8);

        // Left pad
        const leftPadX = x - p*40;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(leftPadX - padRadius, padY - p*3, padRadius*2, p*6);
        g.fillStyle(COLORS.LAB_DARK);
        g.fillRect(leftPadX - padRadius + p*4, padY - p*2, padRadius*2 - p*8, p*4);
        // Pad circle (simplified)
        g.fillStyle(COLORS.LAB_MID);
        for (let i = 0; i < 3; i++) {
            const r = padRadius - i*p*8;
            g.fillRect(leftPadX - r + p*4, padY - p*1, (r-p*4)*2, p*2);
        }

        // Right pad
        const rightPadX = x + p*40;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(rightPadX - padRadius, padY - p*3, padRadius*2, p*6);
        g.fillStyle(COLORS.LAB_DARK);
        g.fillRect(rightPadX - padRadius + p*4, padY - p*2, padRadius*2 - p*8, p*4);
        g.fillStyle(COLORS.LAB_MID);
        for (let i = 0; i < 3; i++) {
            const r = padRadius - i*p*8;
            g.fillRect(rightPadX - r + p*4, padY - p*1, (r-p*4)*2, p*2);
        }

        // Overhead arch
        const archTop = y - p*20;
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*85, archTop, p*10, padY - archTop);
        g.fillRect(x + p*75, archTop, p*10, padY - archTop);
        g.fillRect(x - p*85, archTop, p*170, p*10);

        // Control console between pads
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*12, padY - p*30, p*24, p*26);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*10, padY - p*28, p*20, p*22);
        // Screen
        g.fillStyle(COLORS.SCREEN_DARK);
        g.fillRect(x - p*8, padY - p*26, p*16, p*10);
        g.fillStyle(COLORS.SCREEN_LIGHT);
        g.fillRect(x - p*6, padY - p*24, p*12, p*2);
        g.fillRect(x - p*6, padY - p*20, p*8, p*2);
        // Buttons
        g.fillStyle(0x44ff44);
        g.fillRect(x - p*6, padY - p*12, p*4, p*4);
        g.fillStyle(0xff4444);
        g.fillRect(x + p*2, padY - p*12, p*4, p*4);
    }

    function drawWorkbench(g, x, y, floorY) {
        const p = 2;
        const benchWidth = p*120;
        const benchHeight = p*40;
        const legHeight = p*35;

        // Legs
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + p*4, floorY - legHeight, p*6, legHeight);
        g.fillRect(x + benchWidth - p*10, floorY - legHeight, p*6, legHeight);

        // Bench top
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x, floorY - legHeight - p*4, benchWidth, p*6);
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x + p*2, floorY - legHeight - p*3, benchWidth - p*4, p*2);

        // Items on bench (tools, parts)
        // Soldering iron
        g.fillStyle(0x444444);
        g.fillRect(x + p*10, floorY - legHeight - p*8, p*20, p*3);
        g.fillStyle(0xcccccc);
        g.fillRect(x + p*28, floorY - legHeight - p*8, p*8, p*2);

        // Multimeter
        g.fillStyle(0x333355);
        g.fillRect(x + p*45, floorY - legHeight - p*14, p*16, p*10);
        g.fillStyle(COLORS.SCREEN_DARK);
        g.fillRect(x + p*47, floorY - legHeight - p*12, p*12, p*5);

        // Random parts
        for (let i = 0; i < 4; i++) {
            g.fillStyle(COLORS.COPPER_MID);
            g.fillRect(x + p*70 + i*p*10, floorY - legHeight - p*6 - (i%2)*p*3, p*6, p*4);
        }
    }

    function drawBeakers(g, x, y, floorY) {
        const p = 2;
        const shelfY = floorY - p*60;

        // Shelf bracket
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x, shelfY, p*60, p*4);
        g.fillRect(x, shelfY, p*4, p*20);
        g.fillRect(x + p*56, shelfY, p*4, p*20);

        // Beakers
        const colors = [0x44aa44, 0xaa44aa, 0x4444aa, 0xaaaa44];
        for (let i = 0; i < 4; i++) {
            const bx = x + p*6 + i*p*14;
            // Glass
            g.fillStyle(0xaacccc);
            g.fillRect(bx, shelfY - p*18, p*10, p*18);
            g.fillStyle(0x88aaaa);
            g.fillRect(bx + p, shelfY - p*16, p*8, p*14);
            // Liquid
            g.fillStyle(colors[i]);
            g.fillRect(bx + p*2, shelfY - p*10, p*6, p*8);
        }

        // Test tube rack below
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + p*5, floorY - p*30, p*50, p*4);
        for (let i = 0; i < 5; i++) {
            g.fillStyle(0xccccdd);
            g.fillRect(x + p*10 + i*p*10, floorY - p*42, p*4, p*14);
            g.fillStyle(colors[i % colors.length]);
            g.fillRect(x + p*11 + i*p*10, floorY - p*38, p*2, p*6);
        }
    }

    function drawControlPanel(g, x, y, height) {
        const p = 2;
        const panelW = p*70;
        const panelH = p*100;

        // Panel backing
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x, y, panelW, panelH);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x + p*2, y + p*2, panelW - p*4, panelH - p*4);

        // Gauges
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const gx = x + p*8 + col*p*30;
                const gy = y + p*8 + row*p*30;
                g.fillStyle(COLORS.METAL_DARK);
                g.fillRect(gx, gy, p*24, p*24);
                g.fillStyle(0x111115);
                g.fillRect(gx + p*2, gy + p*2, p*20, p*20);
                // Gauge needle (random position)
                g.fillStyle(0xff4444);
                g.fillRect(gx + p*10, gy + p*10, p*8, p*2);
            }
        }

        // Switches at bottom
        for (let i = 0; i < 4; i++) {
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(x + p*8 + i*p*15, y + p*70, p*10, p*20);
            g.fillStyle(i < 3 ? COLORS.LAB_LIGHT : 0xff4444);
            g.fillRect(x + p*10 + i*p*15, y + p*72, p*6, p*8);
        }

        // Indicator lights
        const lightColors = [COLORS.LAB_BRIGHT, COLORS.LAB_BRIGHT, COLORS.LAB_LIGHT, 0xffff44];
        for (let i = 0; i < 4; i++) {
            g.fillStyle(lightColors[i]);
            g.fillRect(x + p*10 + i*p*15, y + panelH - p*8, p*6, p*4);
        }
    }

    function drawTeslaCoil(g, x, y, floorY) {
        const p = 2;
        const coilTop = y;
        const baseY = floorY;

        // Base
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*25, baseY - p*15, p*50, p*15);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*23, baseY - p*13, p*46, p*11);

        // Main column
        g.fillStyle(COLORS.COPPER_DARK);
        g.fillRect(x - p*8, coilTop + p*30, p*16, baseY - coilTop - p*45);

        // Copper windings
        g.fillStyle(COLORS.COPPER_MID);
        for (let cy = coilTop + p*35; cy < baseY - p*20; cy += p*6) {
            g.fillRect(x - p*12, cy, p*24, p*4);
        }
        g.fillStyle(COLORS.COPPER_LIGHT);
        for (let cy = coilTop + p*35; cy < baseY - p*20; cy += p*6) {
            g.fillRect(x - p*12, cy, p*24, p*2);
        }

        // Top sphere
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(x - p*20, coilTop, p*40, p*30);
        g.fillStyle(COLORS.METAL_HIGHLIGHT);
        g.fillRect(x - p*18, coilTop + p*2, p*36, p*10);
        g.fillRect(x - p*15, coilTop + p*4, p*15, p*6);
    }

    function drawPortalDevice(g, x, y, floorY, height) {
        const p = 2;
        const ringOuterR = p*90;
        const ringInnerR = p*70;
        const centerY = y + ringOuterR;

        // Base platform
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*100, floorY - p*20, p*200, p*24);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - p*98, floorY - p*18, p*196, p*18);

        // Support struts
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*85, centerY, p*15, floorY - centerY - p*20);
        g.fillRect(x + p*70, centerY, p*15, floorY - centerY - p*20);

        // Outer ring (simplified rectangle representation)
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x - ringOuterR, centerY - ringOuterR, ringOuterR*2, ringOuterR*2);
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(x - ringInnerR, centerY - ringInnerR, ringInnerR*2, ringInnerR*2);

        // Inner glow
        g.fillStyle(COLORS.PORTAL_DARK);
        g.fillRect(x - ringInnerR + p*10, centerY - ringInnerR + p*10, ringInnerR*2 - p*20, ringInnerR*2 - p*20);
        g.fillStyle(COLORS.PORTAL_MID);
        g.fillRect(x - ringInnerR + p*20, centerY - ringInnerR + p*20, ringInnerR*2 - p*40, ringInnerR*2 - p*40);
        g.fillStyle(COLORS.PORTAL_LIGHT);
        g.fillRect(x - ringInnerR + p*35, centerY - ringInnerR + p*35, ringInnerR*2 - p*70, ringInnerR*2 - p*70);

        // Ring details - bolts around edge
        g.fillStyle(COLORS.METAL_HIGHLIGHT);
        const boltPositions = [
            { dx: -ringOuterR + p*8, dy: -p*10 },
            { dx: -ringOuterR + p*8, dy: p*10 },
            { dx: ringOuterR - p*14, dy: -p*10 },
            { dx: ringOuterR - p*14, dy: p*10 },
            { dx: -p*10, dy: -ringOuterR + p*8 },
            { dx: p*10, dy: -ringOuterR + p*8 },
            { dx: -p*10, dy: ringOuterR - p*14 },
            { dx: p*10, dy: ringOuterR - p*14 }
        ];
        boltPositions.forEach(pos => {
            g.fillRect(x + pos.dx, centerY + pos.dy, p*6, p*6);
        });

        // Cables from portal to floor
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x - p*70, centerY + ringOuterR - p*20, p*8, floorY - centerY - ringOuterR);
        g.fillRect(x + p*62, centerY + ringOuterR - p*20, p*8, floorY - centerY - ringOuterR);
    }

    function drawComponentSlot(g, x, y, label, isActive) {
        const p = 2;
        const slotW = p*35;
        const slotH = p*45;

        // Slot housing
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x, y, slotW, slotH);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x + p*2, y + p*2, slotW - p*4, slotH - p*4);

        // Component visualization based on type
        if (isActive) {
            g.fillStyle(COLORS.LAB_MID);
            g.fillRect(x + p*4, y + p*4, slotW - p*8, slotH - p*12);
            g.fillStyle(COLORS.LAB_LIGHT);
            g.fillRect(x + p*6, y + p*6, slotW - p*12, slotH - p*16);
        } else {
            g.fillStyle(COLORS.WALL_DARK);
            g.fillRect(x + p*4, y + p*4, slotW - p*8, slotH - p*12);
        }

        // Status light
        g.fillStyle(isActive ? COLORS.LAB_BRIGHT : 0x442222);
        g.fillRect(x + slotW/2 - p*3, y + slotH - p*6, p*6, p*4);
    }

    function drawComputerTerminal(g, x, y, floorY) {
        const p = 2;
        const termW = p*100;
        const termH = p*80;
        const termY = floorY - termH - p*10;

        // Main console body
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x, termY, termW, termH);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x + p*2, termY + p*2, termW - p*4, termH - p*4);

        // Main screen
        g.fillStyle(COLORS.SCREEN_DARK);
        g.fillRect(x + p*8, termY + p*8, termW - p*16, p*40);
        g.fillStyle(COLORS.SCREEN_MID);
        g.fillRect(x + p*10, termY + p*10, termW - p*20, p*36);

        // Screen text lines
        g.fillStyle(COLORS.SCREEN_LIGHT);
        for (let i = 0; i < 5; i++) {
            const lineW = p*20 + (i * p*8) % (p*40);
            g.fillRect(x + p*14, termY + p*14 + i*p*6, lineW, p*3);
        }

        // Cursor
        g.fillRect(x + p*14, termY + p*44, p*4, p*3);

        // Keyboard area
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + p*8, termY + p*54, termW - p*16, p*20);
        g.fillStyle(COLORS.METAL_LIGHT);
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 10; col++) {
                g.fillRect(x + p*12 + col*p*8, termY + p*58 + row*p*6, p*5, p*4);
            }
        }

        // Side monitor
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(x + termW + p*10, termY + p*10, p*40, p*50);
        g.fillStyle(COLORS.SCREEN_DARK);
        g.fillRect(x + termW + p*12, termY + p*12, p*36, p*30);
        g.fillStyle(COLORS.LAB_MID);
        g.fillRect(x + termW + p*14, termY + p*14, p*32, p*26);
        // Waveform
        g.fillStyle(COLORS.LAB_BRIGHT);
        for (let i = 0; i < 8; i++) {
            const waveH = p*4 + (i % 3) * p*4;
            g.fillRect(x + termW + p*16 + i*p*4, termY + p*26 - waveH/2, p*2, waveH);
        }
    }

    function drawLabCoat(g, x, y) {
        const p = 2;

        // Hook
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(x, y, p*8, p*4);
        g.fillRect(x + p*2, y + p*4, p*4, p*8);

        // Coat (simplified)
        g.fillStyle(0xeeeeee);
        g.fillRect(x - p*10, y + p*10, p*28, p*60);
        g.fillStyle(0xdddddd);
        g.fillRect(x - p*8, y + p*12, p*24, p*56);
        // Collar
        g.fillStyle(0xeeeeee);
        g.fillRect(x - p*4, y + p*10, p*16, p*8);
        // Shadow/fold
        g.fillStyle(0xcccccc);
        g.fillRect(x + p*4, y + p*20, p*2, p*40);
    }

    // =========================================================================
    // MAIN ROOM DRAWING FUNCTION
    // =========================================================================

    function drawLaboratoryRoom(g, scene, worldWidth, height) {
        const floorY = height * 0.72;
        const p = 2;

        // === BACK WALL ===
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(0, 0, worldWidth, floorY);

        // Wall panels
        const panelWidth = p*100;
        for (let px = 0; px < worldWidth; px += panelWidth) {
            g.fillStyle(COLORS.WALL_MID);
            g.fillRect(px + p*2, p*20, panelWidth - p*4, floorY - p*30);
            g.fillStyle(COLORS.WALL_LIGHT);
            g.fillRect(px + p*2, p*20, panelWidth - p*4, p*2);
            g.fillRect(px + p*2, p*20, p*2, floorY - p*32);
            g.fillStyle(COLORS.WALL_DARK);
            g.fillRect(px + panelWidth - p*4, p*20, p*2, floorY - p*32);
        }

        // === CEILING ===
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(0, 0, worldWidth, p*18);
        g.fillStyle(COLORS.METAL_MID);
        g.fillRect(0, p*16, worldWidth, p*4);

        // Ceiling pipes
        g.fillStyle(COLORS.METAL_LIGHT);
        g.fillRect(0, p*4, worldWidth, p*8);
        // Pipe supports
        for (let px = p*50; px < worldWidth; px += p*150) {
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(px, 0, p*10, p*20);
        }

        // Overhead lights
        for (let lx = 200; lx < worldWidth; lx += 600) {
            g.fillStyle(COLORS.METAL_DARK);
            g.fillRect(lx - p*30, p*14, p*60, p*10);
            g.fillStyle(0xffffee);
            g.fillRect(lx - p*25, p*20, p*50, p*6);
        }

        // === FLOOR ===
        g.fillStyle(COLORS.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);

        // Floor tiles
        const tileSize = p*60;
        for (let tx = 0; tx < worldWidth; tx += tileSize) {
            for (let ty = floorY; ty < height; ty += tileSize) {
                g.fillStyle(COLORS.FLOOR_MID);
                g.fillRect(tx + p, ty + p, tileSize - p*2, tileSize - p*2);
                g.fillStyle(COLORS.FLOOR_LIGHT);
                g.fillRect(tx + p*2, ty + p*2, tileSize - p*4, p*2);
            }
        }

        // Floor cables
        g.fillStyle(COLORS.METAL_DARK);
        // Cable run from teleporter to portal
        g.fillRect(650, floorY + p*10, 1200, p*6);
        g.fillRect(700, floorY + p*15, 100, p*4);
        g.fillRect(1500, floorY + p*8, 200, p*5);
        // Cable run from portal to terminal
        g.fillRect(2100, floorY + p*12, 500, p*5);

        // === LEFT SECTION: Door and Wall Diagrams ===
        drawDoor(g, 120, height * 0.30, p*55, height * 0.40, false, null);

        // Wall diagrams/blueprints
        g.fillStyle(COLORS.METAL_DARK);
        g.fillRect(300, height * 0.25, p*70, p*70);
        g.fillStyle(0x8090a0);
        g.fillRect(304, height * 0.25 + p*2, p*68, p*66);
        // Blueprint lines
        g.fillStyle(0x4060a0);
        for (let i = 0; i < 5; i++) {
            g.fillRect(310, height * 0.27 + i*p*12, p*30 + (i%3)*p*10, p*2);
        }
        g.fillRect(340, height * 0.30, p*20, p*20);
        g.fillStyle(0x8090a0);
        g.fillRect(344, height * 0.30 + p*2, p*16, p*16);

        // === TELEPORTER ===
        drawTeleporter(g, 575, height * 0.25, floorY);

        // === TESLA COILS ===
        drawTeslaCoil(g, 790, height * 0.25, floorY);

        // === WORK AREA ===
        drawWorkbench(g, 900, height * 0.55, floorY);
        drawBeakers(g, 1150, height * 0.35, floorY);
        drawControlPanel(g, 1300, height * 0.30, height);

        // === BACK LAB DOOR ===
        drawDoor(g, 1500, height * 0.30, p*55, height * 0.40, true, 0xff4444);

        // === PORTAL DEVICE (FOCAL POINT) ===
        drawPortalDevice(g, 1950, height * 0.22, floorY, height);

        // === FOUR COMPONENT SLOTS ===
        const slotStartX = 2100;
        const slotY = height * 0.48;
        const slotSpacing = p*45;
        drawComponentSlot(g, slotStartX, slotY, 'clock', true);
        drawComponentSlot(g, slotStartX + slotSpacing, slotY, 'screen', true);
        drawComponentSlot(g, slotStartX + slotSpacing*2, slotY, 'power', true);
        drawComponentSlot(g, slotStartX + slotSpacing*3, slotY, 'brain', true);

        // === COMPUTER TERMINAL ===
        drawComputerTerminal(g, 2550, height * 0.35, floorY);

        // === LAB COAT ===
        drawLabCoat(g, 2870, height * 0.32);

        // === SIDE ROOM DOOR ===
        drawDoor(g, 3000, height * 0.30, p*55, height * 0.40, true, null);

        // === ADDITIONAL DETAILS ===

        // Warning signs
        g.fillStyle(0xffcc00);
        g.fillRect(1470, height * 0.25, p*25, p*20);
        g.fillStyle(0x000000);
        g.fillRect(1478, height * 0.26, p*2, p*10);
        g.fillRect(1478, height * 0.28 + p*8, p*2, p*4);

        g.fillStyle(0xffcc00);
        g.fillRect(2970, height * 0.25, p*25, p*20);
        g.fillStyle(0x000000);
        g.fillRect(2978, height * 0.26, p*2, p*10);
        g.fillRect(2978, height * 0.28 + p*8, p*2, p*4);

        // Fire extinguisher by terminal
        g.fillStyle(0xcc2222);
        g.fillRect(2520, floorY - p*30, p*12, p*28);
        g.fillStyle(0x111111);
        g.fillRect(2522, floorY - p*32, p*8, p*6);
        g.fillStyle(0xaa1111);
        g.fillRect(2522, floorY - p*28, p*8, p*24);
    }

})();
