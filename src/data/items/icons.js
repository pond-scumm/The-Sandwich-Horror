// ============================================================================
// ITEM ICON DRAWING FUNCTIONS
// ============================================================================
// Procedural pixel-art icons for inventory items.
// Uses p=4 chunky pixel style to match character sprites.
//
// Each function: drawIcon(graphics, x, y, size)
//   - graphics: Phaser Graphics object to draw on
//   - x, y: center position of the icon
//   - size: available space (icon should fit within this square)
// ============================================================================

(function() {
    'use strict';

    const p = 4;  // Pixel size (chunky, matches character sprites)

    // Helper: draw a single "pixel" (actually a p x p square)
    function pixel(g, px, py, color, baseX, baseY) {
        g.fillStyle(color, 1);
        g.fillRect(baseX + px * p, baseY + py * p, p, p);
    }

    TSH.ItemIcons = {

        // ── Help Wanted Ad ─────────────────────────────────────────────────
        // Torn piece of paper with text lines
        help_wanted_ad: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 12x14 pixels = 48x56 at p=4)
            const baseX = x - 6 * p;
            const baseY = y - 7 * p;

            // Paper colors
            const PAPER = 0xf5f0e0;
            const PAPER_SHADOW = 0xd4cfc0;
            const TEXT = 0x2a2a2a;
            const TEAR = 0xe0dbd0;

            // Paper background (12 wide, 14 tall with torn edge)
            for (let py = 0; py < 14; py++) {
                for (let px = 0; px < 12; px++) {
                    // Torn right edge (jagged)
                    if (px === 11 && (py === 2 || py === 5 || py === 9 || py === 12)) continue;
                    // Torn bottom edge
                    if (py === 13 && (px === 1 || px === 4 || px === 7 || px === 10)) continue;

                    // Shadow on right and bottom edges
                    if (px === 11 || py === 13) {
                        pixel(g, px, py, PAPER_SHADOW, baseX, baseY);
                    } else {
                        pixel(g, px, py, PAPER, baseX, baseY);
                    }
                }
            }

            // Torn edge highlight
            pixel(g, 10, 2, TEAR, baseX, baseY);
            pixel(g, 10, 5, TEAR, baseX, baseY);
            pixel(g, 10, 9, TEAR, baseX, baseY);

            // "HELP" text line (top)
            for (let px = 2; px <= 8; px++) {
                pixel(g, px, 2, TEXT, baseX, baseY);
            }

            // "WANTED" text line
            for (let px = 1; px <= 9; px++) {
                pixel(g, px, 4, TEXT, baseX, baseY);
            }

            // Body text lines (shorter, lighter)
            const TEXT_LIGHT = 0x5a5a5a;
            for (let px = 1; px <= 7; px++) pixel(g, px, 7, TEXT_LIGHT, baseX, baseY);
            for (let px = 1; px <= 8; px++) pixel(g, px, 9, TEXT_LIGHT, baseX, baseY);
            for (let px = 1; px <= 5; px++) pixel(g, px, 11, TEXT_LIGHT, baseX, baseY);
        },

        // ── Candle (unlit) ─────────────────────────────────────────────────
        // Cream/white candle with wick
        candle: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 6x14 pixels)
            const baseX = x - 3 * p;
            const baseY = y - 7 * p;

            // Colors
            const WAX = 0xfff8e8;
            const WAX_SHADOW = 0xe8e0d0;
            const WAX_DARK = 0xd0c8b8;
            const WICK = 0x2a2a2a;
            const HOLDER = 0xc0a050;
            const HOLDER_DARK = 0x907030;

            // Wick (top)
            pixel(g, 2, 0, WICK, baseX, baseY);
            pixel(g, 2, 1, WICK, baseX, baseY);

            // Candle body (6 wide, 10 tall)
            for (let py = 2; py < 12; py++) {
                for (let px = 0; px < 6; px++) {
                    if (px === 0) {
                        pixel(g, px, py, WAX_DARK, baseX, baseY);
                    } else if (px === 5) {
                        pixel(g, px, py, WAX_SHADOW, baseX, baseY);
                    } else {
                        pixel(g, px, py, WAX, baseX, baseY);
                    }
                }
            }

            // Candle holder base (wider)
            for (let px = -1; px < 7; px++) {
                if (px === -1 || px === 6) {
                    pixel(g, px, 12, HOLDER_DARK, baseX, baseY);
                    pixel(g, px, 13, HOLDER_DARK, baseX, baseY);
                } else {
                    pixel(g, px, 12, HOLDER, baseX, baseY);
                    pixel(g, px, 13, HOLDER_DARK, baseX, baseY);
                }
            }
        },

        // ── Lit Candle ─────────────────────────────────────────────────────
        // Same candle with flame
        lit_candle: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 6x16 pixels with flame)
            const baseX = x - 3 * p;
            const baseY = y - 8 * p;

            // Colors
            const WAX = 0xfff8e8;
            const WAX_SHADOW = 0xe8e0d0;
            const WAX_DARK = 0xd0c8b8;
            const WICK = 0x2a2a2a;
            const HOLDER = 0xc0a050;
            const HOLDER_DARK = 0x907030;
            const FLAME_CORE = 0xffffaa;
            const FLAME_MID = 0xffaa30;
            const FLAME_OUTER = 0xff6600;

            // Flame (top) - 3 pixels wide, 4 tall
            pixel(g, 2, 0, FLAME_OUTER, baseX, baseY);
            pixel(g, 1, 1, FLAME_OUTER, baseX, baseY);
            pixel(g, 2, 1, FLAME_MID, baseX, baseY);
            pixel(g, 3, 1, FLAME_OUTER, baseX, baseY);
            pixel(g, 1, 2, FLAME_MID, baseX, baseY);
            pixel(g, 2, 2, FLAME_CORE, baseX, baseY);
            pixel(g, 3, 2, FLAME_MID, baseX, baseY);
            pixel(g, 2, 3, FLAME_MID, baseX, baseY);

            // Wick
            pixel(g, 2, 4, WICK, baseX, baseY);

            // Candle body (6 wide, 9 tall - slightly shorter than unlit)
            for (let py = 5; py < 14; py++) {
                for (let px = 0; px < 6; px++) {
                    if (px === 0) {
                        pixel(g, px, py, WAX_DARK, baseX, baseY);
                    } else if (px === 5) {
                        pixel(g, px, py, WAX_SHADOW, baseX, baseY);
                    } else {
                        pixel(g, px, py, WAX, baseX, baseY);
                    }
                }
            }

            // Candle holder base
            for (let px = -1; px < 7; px++) {
                if (px === -1 || px === 6) {
                    pixel(g, px, 14, HOLDER_DARK, baseX, baseY);
                    pixel(g, px, 15, HOLDER_DARK, baseX, baseY);
                } else {
                    pixel(g, px, 14, HOLDER, baseX, baseY);
                    pixel(g, px, 15, HOLDER_DARK, baseX, baseY);
                }
            }
        },

        // ── Matches ────────────────────────────────────────────────────────
        // Matchbox with matches visible
        matches: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 14x10 pixels)
            const baseX = x - 7 * p;
            const baseY = y - 5 * p;

            // Colors
            const BOX = 0x4a6a8a;
            const BOX_DARK = 0x3a5a7a;
            const BOX_LIGHT = 0x5a7a9a;
            const MATCH_WOOD = 0xc8a878;
            const MATCH_TIP = 0xcc3333;
            const STRIKER = 0x2a2a2a;

            // Matchbox body (14 wide, 8 tall)
            for (let py = 2; py < 10; py++) {
                for (let px = 0; px < 14; px++) {
                    if (px === 0 || py === 9) {
                        pixel(g, px, py, BOX_DARK, baseX, baseY);
                    } else if (px === 13 || py === 2) {
                        pixel(g, px, py, BOX_LIGHT, baseX, baseY);
                    } else {
                        pixel(g, px, py, BOX, baseX, baseY);
                    }
                }
            }

            // Striker strip on side
            for (let py = 3; py < 9; py++) {
                pixel(g, 1, py, STRIKER, baseX, baseY);
            }

            // Matches sticking out the top (3 matches)
            // Match 1
            pixel(g, 4, 0, MATCH_TIP, baseX, baseY);
            pixel(g, 4, 1, MATCH_WOOD, baseX, baseY);

            // Match 2 (center, taller)
            pixel(g, 7, 0, MATCH_TIP, baseX, baseY);
            pixel(g, 7, 1, MATCH_WOOD, baseX, baseY);

            // Match 3
            pixel(g, 10, 0, MATCH_TIP, baseX, baseY);
            pixel(g, 10, 1, MATCH_WOOD, baseX, baseY);

            // Label area suggestion (lighter rectangle)
            for (let py = 4; py < 8; py++) {
                for (let px = 4; px < 12; px++) {
                    pixel(g, px, py, BOX_LIGHT, baseX, baseY);
                }
            }
        },

        // ── Broken Moon Shoes ──────────────────────────────────────────
        // Pair of vintage moon boots with broken spring soles
        broken_moon_shoes: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 16x11 pixels for a pair)
            const baseX = x - 8 * p;
            const baseY = y - 5.5 * p;

            // Colors
            const BOOT = 0x5a5a6a;
            const BOOT_DARK = 0x3a3a4a;
            const BOOT_LIGHT = 0x7a7a8a;
            const SPRING = 0x8a8a8a;
            const SOLE = 0x2a2a2a;
            const CRACK = 0xaa3333;

            // === LEFT BOOT ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 1; px <= 5; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Spring coils
            g.fillStyle(SPRING);
            pixel(g, 1, 9, SPRING, baseX, baseY);
            pixel(g, 3, 9, SPRING, baseX, baseY);
            pixel(g, 5, 9, SPRING, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 9; py++) {
                for (let px = 1; px < 6; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Left boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 9; py++) pixel(g, 1, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 2; px < 5; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Left boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 9; py++) pixel(g, 5, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 2, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 3, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 4, 2, BOOT_DARK, baseX, baseY);

            // Damage mark
            g.fillStyle(CRACK);
            pixel(g, 3, 5, CRACK, baseX, baseY);

            // === RIGHT BOOT ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 10; px <= 14; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Spring coils
            g.fillStyle(SPRING);
            pixel(g, 10, 9, SPRING, baseX, baseY);
            pixel(g, 12, 9, SPRING, baseX, baseY);
            pixel(g, 14, 9, SPRING, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 9; py++) {
                for (let px = 10; px < 15; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Right boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 9; py++) pixel(g, 10, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 11; px < 14; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Right boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 9; py++) pixel(g, 14, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 11, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 12, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 13, 2, BOOT_DARK, baseX, baseY);

            // Damage mark
            g.fillStyle(CRACK);
            pixel(g, 12, 6, CRACK, baseX, baseY);
        },

        // ── Half-Broken Moon Shoes ─────────────────────────────────────
        // Moon shoes with one spring installed (left boot fixed)
        half_broken_moon_shoes: function(graphics, x, y, size) {
            const g = graphics;
            const baseX = x - 8 * p;
            const baseY = y - 5.5 * p;

            const BOOT = 0x5a5a6a;
            const BOOT_DARK = 0x3a3a4a;
            const BOOT_LIGHT = 0x7a7a8a;
            const SPRING_METAL = 0xc0c0c0;
            const SPRING_DARK = 0x808080;
            const SPRING_LIGHT = 0xe0e0e0;
            const SOLE = 0x2a2a2a;
            const CRACK = 0xaa3333;

            // === LEFT BOOT (FIXED - with proper spring) ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 1; px <= 5; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Better spring coils (full spring, not broken)
            g.fillStyle(SPRING_DARK);
            pixel(g, 2, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 3, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 4, 9, SPRING_DARK, baseX, baseY);
            g.fillStyle(SPRING_METAL);
            pixel(g, 2, 8, SPRING_METAL, baseX, baseY);
            pixel(g, 4, 8, SPRING_METAL, baseX, baseY);
            g.fillStyle(SPRING_LIGHT);
            pixel(g, 3, 8, SPRING_LIGHT, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 8; py++) {
                for (let px = 1; px < 6; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Left boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 8; py++) pixel(g, 1, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 2; px < 5; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Left boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 8; py++) pixel(g, 5, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 2, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 3, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 4, 2, BOOT_DARK, baseX, baseY);

            // === RIGHT BOOT (STILL BROKEN) ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 10; px <= 14; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Broken spring coils
            g.fillStyle(0x8a8a8a);
            pixel(g, 10, 9, 0x8a8a8a, baseX, baseY);
            pixel(g, 12, 9, 0x8a8a8a, baseX, baseY);
            pixel(g, 14, 9, 0x8a8a8a, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 9; py++) {
                for (let px = 10; px < 15; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Right boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 9; py++) pixel(g, 10, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 11; px < 14; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Right boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 9; py++) pixel(g, 14, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 11, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 12, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 13, 2, BOOT_DARK, baseX, baseY);

            // Damage mark
            g.fillStyle(CRACK);
            pixel(g, 12, 6, CRACK, baseX, baseY);
        },

        // ── Moon Shoes (Fully Repaired) ────────────────────────────────
        // Both boots with springs underneath
        moon_shoes: function(graphics, x, y, size) {
            const g = graphics;
            const baseX = x - 8 * p;
            const baseY = y - 5.5 * p;

            const BOOT = 0x5a5a6a;
            const BOOT_DARK = 0x3a3a4a;
            const BOOT_LIGHT = 0x7a7a8a;
            const SPRING_METAL = 0xc0c0c0;
            const SPRING_DARK = 0x808080;
            const SPRING_LIGHT = 0xe0e0e0;
            const SOLE = 0x2a2a2a;

            // === LEFT BOOT (FIXED) ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 1; px <= 5; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Spring coils
            g.fillStyle(SPRING_DARK);
            pixel(g, 2, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 3, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 4, 9, SPRING_DARK, baseX, baseY);
            g.fillStyle(SPRING_METAL);
            pixel(g, 2, 8, SPRING_METAL, baseX, baseY);
            pixel(g, 4, 8, SPRING_METAL, baseX, baseY);
            g.fillStyle(SPRING_LIGHT);
            pixel(g, 3, 8, SPRING_LIGHT, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 8; py++) {
                for (let px = 1; px < 6; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Left boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 8; py++) pixel(g, 1, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 2; px < 5; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Left boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 8; py++) pixel(g, 5, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 2, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 3, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 4, 2, BOOT_DARK, baseX, baseY);

            // === RIGHT BOOT (ALSO FIXED) ===

            // Sole
            g.fillStyle(SOLE);
            for (let px = 10; px <= 14; px++) pixel(g, px, 10, SOLE, baseX, baseY);

            // Spring coils
            g.fillStyle(SPRING_DARK);
            pixel(g, 11, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 12, 9, SPRING_DARK, baseX, baseY);
            pixel(g, 13, 9, SPRING_DARK, baseX, baseY);
            g.fillStyle(SPRING_METAL);
            pixel(g, 11, 8, SPRING_METAL, baseX, baseY);
            pixel(g, 13, 8, SPRING_METAL, baseX, baseY);
            g.fillStyle(SPRING_LIGHT);
            pixel(g, 12, 8, SPRING_LIGHT, baseX, baseY);

            // Boot body
            g.fillStyle(BOOT);
            for (let py = 3; py < 8; py++) {
                for (let px = 10; px < 15; px++) {
                    pixel(g, px, py, BOOT, baseX, baseY);
                }
            }

            // Right boot highlights
            g.fillStyle(BOOT_LIGHT);
            for (let py = 3; py < 8; py++) pixel(g, 10, py, BOOT_LIGHT, baseX, baseY);
            for (let px = 11; px < 14; px++) pixel(g, px, 3, BOOT_LIGHT, baseX, baseY);

            // Right boot shadows
            g.fillStyle(BOOT_DARK);
            for (let py = 4; py < 8; py++) pixel(g, 14, py, BOOT_DARK, baseX, baseY);

            // Boot opening
            g.fillStyle(BOOT_DARK);
            pixel(g, 11, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 12, 2, BOOT_DARK, baseX, baseY);
            pixel(g, 13, 2, BOOT_DARK, baseX, baseY);
        },

        // ── Scalpel ────────────────────────────────────────────────────
        // Surgical scalpel with pointed blade
        scalpel: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 4x14 pixels - tall and thin)
            const baseX = x - 2 * p;
            const baseY = y - 7 * p;

            // Colors
            const BLADE = 0xc0c0c0;      // Silver blade
            const BLADE_LIGHT = 0xe0e0e0; // Blade highlight
            const BLADE_DARK = 0x808080;  // Blade shadow
            const HANDLE = 0x4a4a4a;      // Dark handle
            const HANDLE_LIGHT = 0x6a6a6a; // Handle highlight

            // Blade (top) - pointed
            g.fillStyle(BLADE_LIGHT);
            pixel(g, 1, 0, BLADE_LIGHT, baseX, baseY); // Tip
            pixel(g, 1, 1, BLADE_LIGHT, baseX, baseY);

            g.fillStyle(BLADE);
            for (let py = 2; py < 6; py++) {
                pixel(g, 1, py, BLADE, baseX, baseY);
            }

            // Blade edge (left highlight)
            g.fillStyle(BLADE_LIGHT);
            pixel(g, 0, 2, BLADE_LIGHT, baseX, baseY);
            pixel(g, 0, 3, BLADE_LIGHT, baseX, baseY);
            pixel(g, 0, 4, BLADE_LIGHT, baseX, baseY);

            // Blade edge (right shadow)
            g.fillStyle(BLADE_DARK);
            pixel(g, 2, 3, BLADE_DARK, baseX, baseY);
            pixel(g, 2, 4, BLADE_DARK, baseX, baseY);
            pixel(g, 2, 5, BLADE_DARK, baseX, baseY);

            // Handle (bottom) - grip
            g.fillStyle(HANDLE);
            for (let py = 6; py < 14; py++) {
                pixel(g, 1, py, HANDLE, baseX, baseY);
            }

            // Handle highlight (left edge)
            g.fillStyle(HANDLE_LIGHT);
            for (let py = 7; py < 13; py++) {
                pixel(g, 0, py, HANDLE_LIGHT, baseX, baseY);
            }
        },

        // ── Tongs ──────────────────────────────────────────────────────────
        // Laboratory tongs/clamp for holding beakers
        tongs: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 10x14 pixels)
            const baseX = x - 5 * p;
            const baseY = y - 7 * p;

            // Colors
            const METAL = 0x3a3a3a;         // Dark metal
            const METAL_LIGHT = 0x5a5a5a;   // Metal highlight
            const GRIP = 0x2a2a2a;          // Grip pads

            // Left arm (top to bottom)
            g.fillStyle(METAL);
            pixel(g, 2, 0, METAL, baseX, baseY);  // Left grip top
            pixel(g, 1, 1, METAL, baseX, baseY);
            pixel(g, 1, 2, METAL, baseX, baseY);
            pixel(g, 2, 3, METAL, baseX, baseY);
            pixel(g, 2, 4, METAL, baseX, baseY);
            pixel(g, 3, 5, METAL, baseX, baseY);  // Angling toward center
            pixel(g, 4, 6, METAL, baseX, baseY);  // Pivot point

            // Right arm (mirror)
            pixel(g, 7, 0, METAL, baseX, baseY);  // Right grip top
            pixel(g, 8, 1, METAL, baseX, baseY);
            pixel(g, 8, 2, METAL, baseX, baseY);
            pixel(g, 7, 3, METAL, baseX, baseY);
            pixel(g, 7, 4, METAL, baseX, baseY);
            pixel(g, 6, 5, METAL, baseX, baseY);  // Angling toward center
            pixel(g, 5, 6, METAL, baseX, baseY);  // Pivot point

            // Pivot/hinge (center)
            pixel(g, 4, 7, METAL, baseX, baseY);
            pixel(g, 5, 7, METAL, baseX, baseY);

            // Handle arms (spreading out from pivot)
            pixel(g, 3, 8, METAL, baseX, baseY);
            pixel(g, 2, 9, METAL, baseX, baseY);
            pixel(g, 2, 10, METAL, baseX, baseY);
            pixel(g, 2, 11, METAL, baseX, baseY);
            pixel(g, 6, 8, METAL, baseX, baseY);
            pixel(g, 7, 9, METAL, baseX, baseY);
            pixel(g, 7, 10, METAL, baseX, baseY);
            pixel(g, 7, 11, METAL, baseX, baseY);

            // Grip pads (dark circles at ends)
            g.fillStyle(GRIP);
            pixel(g, 2, 1, GRIP, baseX, baseY);
            pixel(g, 7, 1, GRIP, baseX, baseY);

            // Metal highlights
            g.fillStyle(METAL_LIGHT);
            pixel(g, 1, 3, METAL_LIGHT, baseX, baseY);
            pixel(g, 8, 3, METAL_LIGHT, baseX, baseY);
        },

        // ── Spring ─────────────────────────────────────────────────────────
        // Coiled metal spring
        spring_1: function(graphics, x, y, size) {
            const g = graphics;
            const baseX = x - 6 * p;
            const baseY = y - 7 * p;

            const SPRING_METAL = 0xc0c0c0;
            const SPRING_DARK = 0x808080;
            const SPRING_LIGHT = 0xe0e0e0;

            // Draw spring coils (zigzag pattern for top-down view)
            // Top coil
            for (let px = 2; px <= 9; px++) {
                pixel(g, px, 2, SPRING_DARK, baseX, baseY);
            }
            for (let px = 3; px <= 8; px++) {
                pixel(g, px, 3, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 3, 4, SPRING_LIGHT, baseX, baseY);
            pixel(g, 8, 4, SPRING_LIGHT, baseX, baseY);

            // Middle coils
            for (let px = 1; px <= 10; px++) {
                pixel(g, px, 5, SPRING_DARK, baseX, baseY);
            }
            for (let px = 2; px <= 9; px++) {
                pixel(g, px, 6, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 2, 7, SPRING_LIGHT, baseX, baseY);
            pixel(g, 9, 7, SPRING_LIGHT, baseX, baseY);

            // Bottom coil
            for (let px = 3; px <= 8; px++) {
                pixel(g, px, 8, SPRING_DARK, baseX, baseY);
            }
            for (let px = 4; px <= 7; px++) {
                pixel(g, px, 9, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 4, 10, SPRING_LIGHT, baseX, baseY);
            pixel(g, 7, 10, SPRING_LIGHT, baseX, baseY);
        },

        // ── Spring 2 ───────────────────────────────────────────────────────
        // Identical to spring_1 (both are coiled metal springs)
        spring_2: function(graphics, x, y, size) {
            const g = graphics;
            const baseX = x - 6 * p;
            const baseY = y - 7 * p;

            const SPRING_METAL = 0xc0c0c0;
            const SPRING_DARK = 0x808080;
            const SPRING_LIGHT = 0xe0e0e0;

            // Draw spring coils (zigzag pattern for top-down view)
            // Top coil
            for (let px = 2; px <= 9; px++) {
                pixel(g, px, 2, SPRING_DARK, baseX, baseY);
            }
            for (let px = 3; px <= 8; px++) {
                pixel(g, px, 3, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 3, 4, SPRING_LIGHT, baseX, baseY);
            pixel(g, 8, 4, SPRING_LIGHT, baseX, baseY);

            // Middle coils
            for (let px = 1; px <= 10; px++) {
                pixel(g, px, 5, SPRING_DARK, baseX, baseY);
            }
            for (let px = 2; px <= 9; px++) {
                pixel(g, px, 6, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 2, 7, SPRING_LIGHT, baseX, baseY);
            pixel(g, 9, 7, SPRING_LIGHT, baseX, baseY);

            // Bottom coil
            for (let px = 3; px <= 8; px++) {
                pixel(g, px, 8, SPRING_DARK, baseX, baseY);
            }
            for (let px = 4; px <= 7; px++) {
                pixel(g, px, 9, SPRING_METAL, baseX, baseY);
            }
            pixel(g, 4, 10, SPRING_LIGHT, baseX, baseY);
            pixel(g, 7, 10, SPRING_LIGHT, baseX, baseY);
        },

        // Alias for spring_2 (same visual)
        spring_2: function(graphics, x, y, size) {
            TSH.ItemIcons.spring_1(graphics, x, y, size);
        },

        // ── Ladder ─────────────────────────────────────────────────────────
        // Aluminum ladder with rungs
        ladder: function(graphics, x, y, size) {
            const g = graphics;
            // Center the icon (roughly 7x16 pixels - tall and narrow)
            const baseX = x - 3.5 * p;
            const baseY = y - 8 * p;

            // Colors
            const METAL_LIGHT = 0xcccccc;
            const METAL_MID = 0xaaaaaa;
            const METAL_DARK = 0x888888;

            // === LEFT RAIL (vertical) ===
            for (let py = 0; py < 16; py++) {
                pixel(g, 0, py, METAL_DARK, baseX, baseY);
                pixel(g, 1, py, METAL_MID, baseX, baseY);
            }

            // === RIGHT RAIL (vertical) ===
            for (let py = 0; py < 16; py++) {
                pixel(g, 5, py, METAL_MID, baseX, baseY);
                pixel(g, 6, py, METAL_LIGHT, baseX, baseY);
            }

            // === RUNGS (horizontal) ===
            const rungPositions = [2, 5, 8, 11, 14];
            for (const py of rungPositions) {
                // Rung spans between rails
                for (let px = 2; px <= 4; px++) {
                    pixel(g, px, py, METAL_MID, baseX, baseY);
                }
                // Highlight on top of rung
                for (let px = 2; px <= 4; px++) {
                    pixel(g, px, py - 1, METAL_LIGHT, baseX, baseY);
                }
            }
        }

    };

})();
