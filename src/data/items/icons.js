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
        }

    };

})();
