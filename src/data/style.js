// ============================================================================
// TSH.Style - Visual Style Guide
// ============================================================================
// Defines the consistent visual look across all rooms.
// All procedural drawing should reference these palettes and functions.
//
// To adjust the overall look:
//   - Change palette colors here → all rooms update
//   - Modify drawing functions → all rooms using them update
// ============================================================================

(function() {
    'use strict';

    TSH.Style = {

        // ========== RESOLUTION & PIXEL ART ==========

        screen: {
            width: 1280,
            height: 720
        },

        // Minimum "pixel" size for chunky pixel art look
        // All drawing should use multiples of this
        pixelSize: 4,

        // Helper to get pixel-aligned values
        px(n) {
            return this.pixelSize * n;
        },

        // ========== COLOR PALETTES ==========

        palette: {
            // ── Wall Colors (Victorian dark purple/brown) ──────────────
            wall: {
                dark: 0x1a1520,
                mid: 0x2a2535,
                light: 0x3a3545,
                highlight: 0x4a4555
            },

            // ── Wood Colors (warm brown tones) ─────────────────────────
            wood: {
                dark: 0x2a1a10,
                mid: 0x4a3520,
                light: 0x6a5030,
                highlight: 0x8a6840
            },

            // ── Floor Colors ───────────────────────────────────────────
            floor: {
                dark: 0x1a1512,
                mid: 0x2a2520,
                light: 0x3a352a
            },

            // ── Stone Colors (for basement, lab, etc.) ─────────────────
            stone: {
                dark: 0x2a2a30,
                mid: 0x3a3a45,
                light: 0x4a4a55,
                highlight: 0x5a5a65
            },

            // ── Moonlight Tints (cool blue for windows, outdoor) ───────
            moon: {
                dark: 0x2a3545,
                mid: 0x4a5565,
                light: 0x6a7585,
                bright: 0x8a95a5
            },

            // ── Firelight Tints (warm orange/red) ──────────────────────
            fire: {
                dark: 0x4a2010,
                mid: 0x8a4020,
                light: 0xca6030,
                bright: 0xffa050
            },

            // ── Lab Glow (sickly green) ────────────────────────────────
            lab: {
                dark: 0x1a3a2a,
                mid: 0x2a5a3a,
                light: 0x4a8a5a,
                bright: 0x6aba7a
            },

            // ── Accent Colors ──────────────────────────────────────────
            rug: {
                dark: 0x3a1515,
                mid: 0x5a2525,
                pattern: 0x6a3030
            },

            metal: {
                gold: 0x8a7530,
                brass: 0x9a8540,
                copper: 0x8a5530,
                iron: 0x4a4a50
            },

            // ── UI / Text Colors ───────────────────────────────────────
            ui: {
                text: 0xffffff,
                textShadow: 0x000000,
                highlight: 0xffff00,
                disabled: 0x888888
            },

            // ── Sky Colors ─────────────────────────────────────────────
            sky: {
                nightDark: 0x0a0a18,
                nightMid: 0x1a1a2e,
                nightLight: 0x2a2a3e,
                dusk: 0x3a2a4a,
                stars: 0xffffff
            }
        },

        // ========== LIGHTING PRESETS ==========

        lighting: {
            // Ambient light colors for different room types
            ambient: {
                cozyIndoor: 0x9a8878,      // Warm, lived-in interior
                coldIndoor: 0x667788,       // Unused room, moonlit
                basement: 0x665566,         // Damp, purple-ish
                lab: 0x778877,              // Greenish tint
                outdoor: 0x556677,          // Cool night air
                attic: 0x554455             // Dusty, dim
            },

            // Brighter versions for mobile (screens are dimmer)
            ambientMobile: {
                cozyIndoor: 0xb8a090,
                coldIndoor: 0x8899aa,
                basement: 0x887788,
                lab: 0x99aa99,
                outdoor: 0x778899,
                attic: 0x776677
            },

            // Common dynamic light source colors
            sources: {
                fireplace: 0xff6633,
                candle: 0xffaa44,
                lamp: 0xffcc66,
                moonbeam: 0xaabbff,
                labEquipment: 0x44ff88,
                portal: 0x8844ff
            }
        },

        // ========== LAYER DEFAULTS ==========

        layers: {
            // Default scroll factors for parallax layers
            scrollFactors: {
                distantBg: 0.2,      // Far background (sky, distant objects)
                midBg: 0.5,          // Middle background
                mainRoom: 1.0,       // Main room layer (player walks here)
                foreground: 1.1      // Foreground objects (slight forward motion)
            },

            // Default depth values
            depths: {
                distantBg: 0,
                midBg: 10,
                mainRoom: 50,
                foreground: 150,
                player: 100,         // Player depth = 100 + y position
                ui: 1000
            }
        },

        // ========== DRAWING HELPERS ==========

        draw: {
            // Draw a filled rectangle aligned to pixel grid
            rect(graphics, x, y, w, h, color) {
                const p = TSH.Style.pixelSize;
                graphics.fillStyle(color);
                graphics.fillRect(
                    Math.round(x / p) * p,
                    Math.round(y / p) * p,
                    Math.round(w / p) * p,
                    Math.round(h / p) * p
                );
            },

            // Draw panel with highlight and shadow (3D effect)
            panel(graphics, x, y, w, h, baseColor, highlightColor, shadowColor) {
                const p = TSH.Style.pixelSize;
                // Base
                graphics.fillStyle(baseColor);
                graphics.fillRect(x, y, w, h);
                // Highlight (top and left)
                graphics.fillStyle(highlightColor);
                graphics.fillRect(x, y, w, p);
                graphics.fillRect(x, y, p, h);
                // Shadow (bottom and right)
                graphics.fillStyle(shadowColor);
                graphics.fillRect(x, y + h - p, w, p);
                graphics.fillRect(x + w - p, y, p, h);
            },

            // Draw inset panel (recessed look)
            insetPanel(graphics, x, y, w, h, baseColor, highlightColor, shadowColor) {
                const p = TSH.Style.pixelSize;
                // Base
                graphics.fillStyle(baseColor);
                graphics.fillRect(x, y, w, h);
                // Shadow (top and left - reversed from panel)
                graphics.fillStyle(shadowColor);
                graphics.fillRect(x, y, w, p);
                graphics.fillRect(x, y, p, h);
                // Highlight (bottom and right)
                graphics.fillStyle(highlightColor);
                graphics.fillRect(x, y + h - p, w, p);
                graphics.fillRect(x + w - p, y, p, h);
            }
        },

        // ========== COMMON ELEMENT DRAWING ==========
        // These will be populated as we refactor rooms

        elements: {
            // Placeholder - will add: door, window, bookshelf, etc.
        }
    };

})();
