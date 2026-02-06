# The Sandwich Horror — Room Design Bible

> **Purpose:** This document defines all global rules, conventions, and standards for procedural room backgrounds. Claude Code must read this document before creating or modifying any room scene. These rules ensure visual consistency across all rooms in the game.

---

## 0. Writing Nate's Responses (CRITICAL)

**Every hotspot interaction is a conversation between the player and Nate.** The player suggests an action ("Hey Nate, USE that cooler"), and Nate responds conversationally about what he's experiencing. He's not narrating a story—he's talking *to* the player.

### The Golden Rule

**Nate can use "I" when conversing, but NEVER when describing his physical actions in that moment.**

### Examples

| Situation | Wrong (Narration) | Right (Conversation) |
|-----------|-------------------|----------------------|
| Player asks Nate to knock | "I knock on the door. No answer." | "No answer. Earl's out here by the grill." |
| Player asks Nate to peek | "I peek through the window. Nice curtains." | "Nice curtains through there. A small kitchen. Some photos." |
| Player asks Nate to check heat | "I lean in and feel the heat. Those coals are perfect." | "Wow, that's HOT. Those coals are perfect." |
| Player asks about going into woods | "I like it here where there's light." ✓ | (This is fine—he's expressing preference) |
| Player asks about tree climbing | "I'm not much of a tree climber." ✓ | (This is fine—he's talking about himself) |

### The Test

Ask: "Is Nate describing a physical action he's performing right now in response to the player's command?"
- **YES** → Remove the narration, jump to the result/reaction
- **NO** → It's probably fine (thoughts, feelings, observations, preferences are all conversational)

### Response Writing Checklist

When writing hotspot responses:
1. ✓ Jump straight to what Nate observes or experiences
2. ✓ Let him express opinions, preferences, and thoughts using "I"
3. ✓ Keep it playful, enthusiastic, and conversational
4. ✗ Don't describe the physical action the player just commanded
5. ✗ Don't write stage directions ("I approach", "I reach out", "I examine")

See CREATIVE_BIBLE.md for full character voice guidelines.

---

## 1. Resolution & Canvas

| Property | Value | Notes |
|----------|-------|-------|
| Screen resolution | 1280 x 720 | 16:9, mobile-first |
| Background pixel unit (`p`) | 2px | Minimum drawn element. Allows high detail density |
| Effective pixel grid | 640 x 360 | How many "game pixels" fit on screen |
| Room width | Flexible | Any width as needed (1280-3840px+) |

### Pixel Grid Rules

- Every coordinate, dimension, and offset in drawing code must be a multiple of `p` (2)
- This maintains a consistent pixel-art grid throughout all backgrounds
- The only exception is sub-pixel work within dithering patterns
- Character sprites use a larger pixel unit (~4px) than backgrounds -- chunkier sprites on detailed backgrounds is a classic pixel-art convention (see Section 2A)

### Room Width

Rooms are not locked to fixed multiples of screen width. A room can be any width that serves the design:
- **1280px** (1x) -- fits one screen, no scrolling. Good for small/intimate rooms
- **1920px** (1.5x) -- moderate scroll
- **2560px** (2x) -- standard wide room
- **3200px** (2.5x) -- large rooms like the Main Lab
- Any other width as needed
- Camera scrolls horizontally to follow the player. Vertical scrolling is never used

### Background Generation

Room backgrounds are **generated procedurally at scene load time**, not pre-rendered as images. The `drawRoom()` function creates a `RenderTexture`, draws everything with Phaser graphics calls, saves it as a named texture, then destroys the graphics object. This happens **once per scene load** -- not per frame. Performance cost is minimal.

When hand-drawn PNG backgrounds are eventually imported, they will replace this procedural system entirely, loading from image files instead of being drawn in code.

### No Animated Backgrounds

Background textures are **static**. No animated tiles, no parallax scrolling, no moving background elements of any kind. All atmospheric movement comes from the Phaser Light2D system (fire flicker, device pulse, etc.), which operates as a separate layer on top of the static background texture. This keeps performance clean and avoids unnecessary complexity.

---

## 2. Camera Distance & Character Scale

Rooms use one of three camera presets. Each defines how large Nate appears and how much of the environment is visible.

### The Sprite Anchor

**Nate's sprite height is the anchor for all room proportions.** Doors, furniture, shelves, and architectural features all scale relative to Nate. Before generating rooms at a new camera distance, Nate's height at that distance must be established -- even a rough blocked-out silhouette at the correct height is sufficient.

| Preset | Nate Height | Walkable Band | Feel | Example Rooms |
|--------|------------|---------------|------|---------------|
| **FAR** | ~225px | 0.78-0.92 | Expansive, establishing | Main Lab, Backyard |
| **MEDIUM** | ~315px | 0.72-0.92 | Standard gameplay | Foyer, 2nd Floor, Front Exterior |
| **CLOSE** | ~405px | 0.68-0.90 | Intimate, detailed | Back Lab, Storage, Attic |

> **Note:** Nate's placeholder sprite is 180×610px native. Scale factors in `BaseScene.PLAYER_SCALES` are calibrated at 2.25× the original design targets to achieve these heights.

### Scale Rules

- **Doors** are always ~1.5x Nate's height at that camera distance
- **Standard furniture** (tables, chairs) scales proportionally to Nate
- **Wall features** (windows, paintings) scale to the room architecture, not to Nate -- a window in a FAR room is smaller on screen but represents a larger real-world object
- **Walkable area** is the bottom band of the screen. Characters walk left-right only. The `minY` and `maxY` values define this band as a fraction of screen height

### Transitioning Between Distances

When Nate walks between rooms of different camera distances, the scene transition (fade/cut) handles the scale jump. Do not animate camera zoom changes.

---

## 2A. Character Art Baseline

This section defines the character sprite style established by the Nate and Hector placeholder sprites. All future character sprites must match these conventions.

### Pixel Scale Relationship

Character sprites are drawn at approximately **4px pixel unit** -- chunkier than the p=2 background grid. This mismatch is **intentional and correct.** Chunky characters on detailed environments is a classic pixel-art convention used by LucasArts, Thimbleweed Park, and similar titles. The character reads as a bold, clear silhouette against a richer backdrop.

- **Do not** redraw characters at p=2 to match backgrounds
- **Inventory icons** should match the character's chunkier pixel scale, not the background scale

### Proportions

Established by the Nate and Hector reference sprites:

| Feature | Convention |
|---------|-----------|
| Head | ~30% of total sprite height, oversized |
| Shoulders | Narrow relative to head |
| Limbs | Long, thin legs and arms |
| Facial detail | Minimal -- 1-2 distinguishing features max |
| Body type | Varies per character but shares the same visual DNA |

Each character is distinguished by **silhouette and 1-2 key details:**
- **Nate:** Wild green hair, vest with rolled sleeves
- **Hector:** Lab coat, goggles on forehead, pipe, mustache, slightly shorter/stockier

Future characters (Earl, Harry, Frank, Victor) should vary in height and bulk but maintain the same head-to-body ratio philosophy and pixel density.

### Color & Saturation

Character sprites are **slightly warmer and more saturated** than the muted background palette. This ensures the player's eye always finds the protagonist easily against dark, moody environments. This is a deliberate Octavi Navarro technique -- characters pop, backgrounds recede.

### Animation

- Nate's walk cycle: **6 frames**
- This frame count is the baseline for all character walk cycles
- The sprite simplicity means fewer frames read as charming rather than cheap

### Sprite Lighting (Current: Simple Per-Room Tint)

Characters receive a **single ambient tint per room** using Phaser's `sprite.setTint()`. This is a multiplicative color -- it can only darken or shift colors, never brighten beyond the original sprite.

Sprites should be drawn at their **brightest/neutral-lit version.** Rooms then pull the colors down into their mood:

```javascript
// Example per-room tints
sprite.setTint(0xffe0c0);  // Warm room (fireplace, lamps)
sprite.setTint(0xc0d0ff);  // Cool room (moonlight)
sprite.setTint(0xd0ffd0);  // Lab glow
sprite.setTint(0xffffff);  // Neutral (no tint)
```

**Future upgrade path:** When hand-drawn art replaces procedural backgrounds, upgrade to **zone-based smooth tinting** (a la Return to Monkey Island), where light zones are defined per room and the sprite tint lerps between them as the character walks through different areas. The per-room system is designed so this upgrade requires changing how tints are *applied*, not how sprites are *drawn*.

---

## 3. Perspective & Depth Convention

### The 3/4 Side-View

All rooms use a **3/4 top-down side view** -- a flat elevation with a slightly angled floor plane to suggest depth. This is the same perspective as classic LucasArts adventure games (Monkey Island, Full Throttle, Thimbleweed Park).

The room should feel like **a space the player is looking into**, not a flat elevation drawing. Objects must appear to be standing *on* a floor that recedes into the scene, not painted on a wall.

### Understanding `floorY`

**`floorY` is the back of the room** -- the line where the back wall meets the floor. It is NOT a universal baseline for all objects.

```
    +-----------------------------+
    |                             |  <- Back wall (flat, vertical)
    |   [window]  [painting]      |
    |                             |
    |   ####  <shelf>   ####      |  <- Furniture against back wall (base at floorY)
    +=============================+  <- floorY: wall-floor boundary
    |     ####          ####      |  <- Mid-floor zone (base BELOW floorY)
    |                             |  <- Visible floor space
    |        ####    ####         |  <- Foreground zone (lowest, slightly larger)
    +-----------------------------+
```

Only objects physically against the back wall should have their base at `floorY`. Everything else sits lower.

### Depth Zones

Each camera preset defines a walkable band. Within that band, three depth zones control where objects are placed and how large they appear:

**MEDIUM camera (walkable 0.72–0.92):**

| Zone | y-range | Scale | Use for |
|------|---------|-------|---------|
| **Back wall** | 0.72 (floorY) | 1.0x | Shelves, wall-mounted items, furniture pushed against the wall |
| **Mid-floor** | 0.74–0.78 | 1.0–1.05x | Tables, chairs, large freestanding furniture |
| **Foreground** | 0.80–0.85 | 1.05–1.1x | Items near the viewer, foreground props |

**FAR camera (walkable 0.78–0.92):**

| Zone | y-range | Scale | Use for |
|------|---------|-------|---------|
| **Back wall** | 0.78 (floorY) | 1.0x | Wall-mounted, against-wall furniture |
| **Mid-floor** | 0.80–0.84 | 1.0–1.05x | Freestanding furniture |
| **Foreground** | 0.85–0.88 | 1.05–1.1x | Foreground props |

**CLOSE camera (walkable 0.68–0.90):**

| Zone | y-range | Scale | Use for |
|------|---------|-------|---------|
| **Back wall** | 0.68 (floorY) | 1.0x | Wall-mounted, against-wall furniture |
| **Mid-floor** | 0.70–0.76 | 1.0–1.05x | Freestanding furniture |
| **Foreground** | 0.78–0.84 | 1.05–1.1x | Foreground props |

Exact y-values are per room — these are guidelines, not rigid constraints.

### Depth Rules

1. **Back wall** is a flat vertical surface. All wall-mounted items are drawn flat with no perspective distortion
2. **Floor** extends from `floorY` to the bottom of the screen. There should be **meaningful visible floor space** between the wall-floor line and the bottom of the frame
3. **Objects further from the viewer** (closer to the back wall) are positioned higher in the frame and drawn at 1.0x scale
4. **Objects closer to the viewer** are positioned lower in the frame and drawn up to 1.1x scale. Keep scaling subtle — depth comes mainly from vertical staggering and overlap, not size changes
5. **Stagger vertical placement.** Avoid placing all objects at the same y-baseline. Vary their depth positions to break the flat-elevation look
6. **Overlap creates depth.** Objects in the mid-floor or foreground should partially overlap objects behind them. A foreground chair might clip the bottom of a back-wall desk. This occlusion is the strongest depth cue
7. **Furniture depth** is additionally faked using:
   - **Side panels:** A narrow rectangle on the left edge, drawn in a darker color, suggesting a visible side face. Width is typically `p*10` to `p*12` (20-24px at p=2)
   - **Value shift:** Objects closer to the viewer get slightly higher contrast and warmer colors
8. **No diagonal lines.** All edges are axis-aligned rectangles. Curves and angles are suggested through stepped pixel patterns only

### Floor Hotspot Rule

**No hotspots in the walkable band unless the item is plot-critical.** Decorative floor items (rugs, floor patterns, floor stains) should not have hotspots — they interfere with walking. If a floor item needs a hotspot for puzzle purposes (trapdoor, dropped item), that's fine, but it should be the exception.

### Layering / Draw Order (Back to Front)

Items drawn later appear in front of earlier items. **Draw order follows depth — back wall first, foreground last:**

1. Back wall (panels, wallpaper texture, crown molding, wainscoting)
2. Floor (boards, base texture)
3. Wall-mounted furniture (bookshelves, windows, fireplace, wall clocks)
4. Floor-level furniture against wall (desks, tables at `floorY`)
5. Floor items (rugs, floor markings)
6. Mid-floor furniture (chairs, freestanding tables — below `floorY`)
7. Foreground objects (items closest to camera — lowest y, up to 1.1x scale)

This matches the hotspot array ordering rule (Section 7A, Rule 7): background hotspots first, foreground hotspots last.

---

## 4. Color Palette

### Origin & Philosophy

The current palette was established during foyer development. It uses limited, intentional color families with clear warm/cool separation -- consistent with the Octavi Navarro-inspired art direction.

The palette is **deliberately constrained.** Each room uses a subset of the master palette, never inventing new colors. This constraint is what gives pixel art cohesion.

**Note:** This palette may be revised as art direction develops. Any changes should be applied consistently across all existing rooms.

### Master Palette

#### Architectural Colors

```
WALL_DARK:       0x1a1520    WALL_MID:       0x2a2535
WALL_LIGHT:      0x3a3545    WALL_HIGHLIGHT: 0x4a4555

WOOD_DARK:       0x2a1a10    WOOD_MID:       0x4a3520
WOOD_LIGHT:      0x6a5030    WOOD_HIGHLIGHT: 0x8a6840

FLOOR_DARK:      0x1a1512    FLOOR_MID:      0x2a2520
FLOOR_LIGHT:     0x3a352a
```

#### Material Colors

```
STONE_DARK:      0x3a3530    STONE_BASE:     0x4a4540
STONE_MID:       0x5a5550    STONE_LIGHT:    0x6a6560

METAL_DARK:      0x3a3a3a    METAL_MID:      0x5a5a5a
METAL_LIGHT:     0x7a7a7a    METAL_HIGHLIGHT: 0x9a9a9a

BRASS:           0x9a8540    GOLD:           0x8a7530
```

#### Mood Colors

```
# Warm (fire, lamps, candles)
FIRE_DARK:       0x4a2010    FIRE_MID:       0x8a4020
FIRE_LIGHT:      0xca6030    FIRE_BRIGHT:    0xffa050

# Cool (moonlight, night sky)
MOON_DARK:       0x2a3545    MOON_MID:       0x4a5565
MOON_LIGHT:      0x6a7585    MOON_BRIGHT:    0x8a95a5

# Science (lab glow, devices, portal)
LAB_DARK:        0x1a3a2a    LAB_MID:        0x2a5a3a
LAB_LIGHT:       0x4a8a5a    LAB_BRIGHT:     0x6aba6a

# Accent (rugs, upholstery, fabric)
RUG_DARK:        0x3a1515    RUG_MID:        0x5a2525
RUG_PATTERN:     0x6a3030
```

### Palette Rules

- **Max 20-25 unique colors per room.** More than that looks muddy
- **Each room has a dominant mood.** Pick 1-2 mood color families and commit
- **Push the value range.** Darkest shadow ~0x0a0505. Brightest highlight ~0xeee8d0
- **Avoid pure black (0x000000) and pure white (0xffffff)**

---

## 5. Lighting

### Background Light Contamination

Every light source **tints** nearby surfaces in the background texture. A fireplace makes things warmer (orange shift). Moonlight makes things cooler (blue shift). This is what gives Octavi Navarro's work its atmospheric quality.

#### Contamination Zones

| Zone | Distance from Source | Warm Shift (fire/lamp) | Cool Shift (moon) |
|------|---------------------|----------------------|-------------------|
| **Core** | 0-50px | R+40, G+20, B-10 | R-10, G+5, B+30 |
| **Mid** | 50-120px | R+25, G+10 | R-5, B+20 |
| **Outer** | 120-200px | R+10, G+5 | B+10 |
| **Ambient** | Beyond 200px | No shift | No shift |

#### Implementation (Simplified for Placeholder Phase)

During the procedural art phase, light contamination in backgrounds should be kept **simple and pragmatic.** Rather than defining dozens of per-color contaminated variants, use 2-3 broad zones per room with pre-shifted colors only where the effect is most visible (walls, floors, large furniture surfaces). Small props and clutter can use their base palette colors.

```javascript
// Simple approach: define a few key contaminated colors per room
// rather than exhaustive variants of every palette color
WALL_MID:       0x2a2535,  // Base (ambient zone)
WALL_MID_WARM:  0x3a2a30,  // Near fireplace
FLOOR_MID:      0x2a2520,  // Base
FLOOR_MID_WARM: 0x3a2a1a,  // Near fireplace
```

**Future upgrade:** When hand-drawn art replaces procedural backgrounds, contamination will be baked directly into the painted artwork with much more nuance. The zone definitions above remain useful as a guide for the artist.

### Phaser Light2D System

The game uses Phaser's Light2D pipeline for **dynamic** lighting on top of the static background:
- Fire flicker (randomized intensity oscillation)
- Lamp glow (steady warm light)
- Device pulse (slow sinusoidal intensity)
- Lab door spill (colored directional light)

The two systems complement each other:
- **Baked contamination** = static color shifts in the background texture
- **Dynamic lights** = real-time glow, flicker, intensity changes

The lighting system is lightweight and adds significant atmosphere. Always include it.

Mobile devices may need brighter ambient light:
```javascript
const isMobile = this.sys.game.device.input.touch;
this.lights.setAmbientColor(isMobile ? 0xb8a090 : 0x9a8878);
```

### Sprite Lighting

See Section 2A for character sprite tinting. Currently **per-room ambient tint only** -- will be upgraded to zone-based smooth tinting when hand-drawn art is implemented.

---

## 6. Architectural Standards

These proportions keep Hector's home feeling like one coherent building.

### Wall Structure (MEDIUM Camera)

```
Crown Molding:     p*10 (20px) from top   -- WOOD_DARK to WOOD_LIGHT
Upper Wall:        variable height         -- WALL_MID with panel texture
Wainscoting:       p*70 (140px) tall       -- WOOD_DARK with recessed panels
Floor Line:        floorY (height * 0.72)  -- transition to floor
Floor:             remaining height        -- FLOOR_DARK with board texture
```

Adjust proportionally for FAR and CLOSE cameras. Wainscoting should always reach approximately Nate's waist height.

### Wall Panels

- Upper wall panel width: `p * 40` (80px)
- Wainscot panel width: `p * 56` (112px)
- Each panel: left highlight edge, right shadow edge
- Subtle wallpaper texture in upper wall, spaced `p*24` apart

### Doors

- Height: ~1.5x Nate's height at current camera distance (FAR: ~338px, MEDIUM: ~473px, CLOSE: ~608px)
- Width: **~140px** (realistic door proportions, not sized to Nate). Reference the interior room doors for correct sizing. Doors should look like real doors that a person walks through, not narrow slits sized exactly to the character sprite width
- Frame: `p * 6` (12px) border in WOOD_DARK
- 4-panel design with highlight/shadow edges
- Brass handle with keyhole detail
- Lab/special doors: slightly brighter, ajar with colored light spill

### Windows

- 4-pane design with cross muntins
- Dark night sky (0x0a0a18) through glass
- Pixel-art moon and stars
- Curtains on brass rod with finials
- Windowsill

### Floors

- Floorboard width: `p * 30` (60px)
- Board divider at left edge of each board
- Subtle highlight line
- Sparse wood grain (2-3 horizontal lines per board)
- Some rooms use tile, concrete, or other surfaces

---

## 7. Furniture Drawing Conventions

### General Rules

- Every piece of furniture is a named function: `drawCoatRack()`, `drawFireplace()`, etc.
- Each function takes `(g, x, floorY, COLORS)` at minimum
- All functions declare `const p = 2` as pixel unit
- Furniture is positioned relative to `floorY`, not absolute Y
- Items against wall sit at `floorY`. Items "in front" sit at `floorY + 15` to `floorY + 25`

### 3D Depth Effect (Side Panels)

Larger furniture gets a **side panel** on its **left** side:
- Width: `p*10` to `p*12` (20-24px)
- Color: WOOD_DARK (darker than front face)
- Optional wood grain texture

### Detail Level (at p=2)

With `p = 2`, significantly more detail is possible than `p = 4`:
- **4-5 value levels per material** (dark, shadow, mid, light, highlight)
- **Interior detail:** Individual drawer handles, book spine variations, wood knots, mortar lines, fabric texture
- **Clear silhouettes:** Shape is instantly recognizable
- **Functional clarity:** Interactive objects must be visually obvious

### Clutter & Props

Surfaces should have items on them:
- **Papers/books:** Stacked piles, cream/tan tones
- **Science equipment:** Brass/glass, blue-green tints
- **Dead plants:** Brown-green stems, terra cotta pots
- **Mugs/dishes:** Gray ceramic, dark liquid inside

---

## 7A. Element Positioning (MANDATORY)

Every room file with procedural drawing **must** define a single `LAYOUT` object at the top of the drawing scope containing the position and size of every interactive element. Both the drawing functions and the hotspot definitions must reference this same `LAYOUT` object. Never hardcode position values in two places. When an element needs to move, there should be exactly one number to change.

### Why This Exists

Drawing functions and hotspot definitions are independent systems that both need the same position data. Without a shared source of truth, moving a visual element leaves its hotspot behind — a bug that has occurred in every room built so far.

### Pattern

```javascript
// ===== SHARED LAYOUT (single source of truth for all positions) =====
const LAYOUT = {
    grill:     { x: 780, y: 0.66, w: 90, h: 0.20 },
    flamingo:  { x: 320, y: 0.66, w: 40, h: 0.18 },
    ladder:    { x: 1160, y: 0.52, w: 50, h: 0.32 },
    // ...
};

// ===== DRAWING CODE references LAYOUT =====
function drawMainRoom(g, scene, worldWidth, height) {
    const floorY = height * 0.72;
    drawGrill(g, LAYOUT.grill.x, floorY);
    drawFlamingo(g, LAYOUT.flamingo.x, floorY);
    drawLadder(g, LAYOUT.ladder.x, floorY, p * 120);
}

// ===== HOTSPOTS reference LAYOUT =====
hotspots: [
    {
        id: 'grill_charcoal',
        ...LAYOUT.grill,
        interactX: LAYOUT.grill.x, interactY: 0.82,
        name: 'Charcoal Grill',
        verbs: { action: 'Examine', look: 'Look at' },
        responses: { look: "That's a serious grill.", action: "I shouldn't mess with another man's grill." }
    },
    {
        id: 'flamingo_pink',
        ...LAYOUT.flamingo,
        interactX: LAYOUT.flamingo.x, interactY: 0.82,
        name: 'Pink Flamingo',
        // ...
    }
]
```

### Rules

1. **`LAYOUT` contains `x`, `y`, `w`, `h` for every interactive element.** `x` is the visual center of the element. `y` is proportional (0.0–1.0). `w` and `h` define the clickable extent around that center
2. **Drawing functions receive position from `LAYOUT`:** `drawGrill(g, LAYOUT.grill.x, floorY)` — never a hardcoded literal
3. **Hotspot definitions spread from `LAYOUT`:** `{ id: 'grill', ...LAYOUT.grill, name: 'Grill' }` — the spread provides x/y/w/h, the rest is hotspot-specific
4. **Manual overrides are allowed.** If you need to tweak a hotspot position after debug testing, override the spread value: `{ ...LAYOUT.grill, x: 800 }`. The explicit value wins. This is expected when fine-tuning with the debug overlay
5. **Decorative-only elements don't need LAYOUT entries.** If something has no hotspot (pure background detail), position it however you like in the drawing code
6. **Non-procedural rooms skip LAYOUT entirely.** When a room uses a static background image instead of procedural drawing, there's no drawing code to share positions with — define hotspot coordinates directly
7. **Hotspot array order = bottom to top.** Phaser creates zones in array order, and later zones sit "on top" for input priority. Place large background hotspots (e.g., `woods_background`, `airstream`) first in the array, and smaller overlapping hotspots (e.g., `airstream_door`, `airstream_window`, `grill`) after them. If a specific hotspot can't be highlighted, it's probably buried under a larger one created later in the array

### What Goes in LAYOUT vs. What Doesn't

| In LAYOUT | Not in LAYOUT |
|-----------|---------------|
| Grill (has hotspot) | Background stars (decorative) |
| Ladder (has hotspot) | Wall texture (decorative) |
| TV (has hotspot) | Floor boards (decorative) |
| NPC standing position (has hotspot) | Dithering patterns |

---

## 8. Dithering

Dithering mixes two colors in a scattered pattern to create the illusion of a third. At `p = 2`, dithering is more effective because individual pixels are smaller and blend better.

### When to Dither

- Light falloff zones
- Shadow corners
- Dusty/aged surfaces
- Atmospheric haze in background areas
- Texture variation (stone, fabric, weathered wood)

### When NOT to Dither

- Flat surfaces under direct light
- Small individual props
- Near UI elements

### Pattern Style

Use **randomized sparse placement**, not regular checkerboard:

```javascript
// Density values:
// 0.10 = very sparse (subtle texture)
// 0.25 = light (visible but airy)
// 0.50 = medium (solid transition)
// 0.75 = heavy (nearly solid)
```

Since backgrounds render once to a texture, `Math.random()` dithering is fine.

---

## 9. Room Structure Template

```javascript
class [RoomName]Scene extends BaseScene {
    constructor() {
        super({ key: '[RoomName]Scene' });
        this.worldWidth = [room width];
        this.screenWidth = 1280;
        this.walkableArea = { minY: [preset], maxY: [preset] };
        this.roomTint = 0xffffff; // Per-room sprite tint (see Section 2A)
    }

    getHotspotData(height) {
        return [ /* interactive objects */ ];
    }

    create() {
        // 1. Camera bounds
        // 2. Enable lighting + set ambient
        // 3. drawRoom()
        // 4. createLighting()
        // 5. super.create()
        // 6. createHotspots()
        // 7. createEdgeZones()
        // 8. Spawn player
        // 9. Apply this.roomTint to player sprite
    }

    drawRoom(worldWidth, height) {
        // 1. COLORS object (master palette subset + a few contaminated variants for key surfaces)
        // 2. floorY from camera preset
        // 3. Back wall -> floor -> wall furniture -> floor items -> foreground
        // 4. Commit to RenderTexture
    }

    createLighting(worldWidth, height) {
        // Point lights per source, store animated refs
    }

    createEdgeZones(height) {
        // Transition zones at room edges
    }

    executeAction(action, hotspot) { }
    useItemOnHotspot(item, hotspot) { }

    update() {
        super.update();
        // Animate light intensities ONLY -- no background animation
    }
}
```

---

## 10. Claude Code Capabilities

### CAN Do
- Architectural layouts and spatial composition
- Consistent color palettes
- Recognizable furniture silhouettes (rectangles)
- Atmospheric dithering and texture (better at p=2)
- Phaser Light2D with animation
- Consistent proportions and scale
- Accurate hotspot placement
- Side-panel depth effects
- Interior detail at p=2 (handles, spines, mortar, knots)

### CANNOT Do
- Diagonal lines or true curves
- Tilted/whimsical aesthetic
- Organic shapes (trees, characters)
- Strategic individual pixel placement
- Perspective distortion

### Dev Art Goal
Procedural backgrounds are **layout and atmosphere placeholders.** They establish room dimensions, furniture placement, hotspot positions, lighting mood, and transitions. All will eventually be hand-drawn.

---

## 11. Room List & Assignments

| Room | Camera | Width | Primary Light | Mood | Status |
|------|--------|-------|---------------|------|--------|
| Foyer | MEDIUM | 2560 | Fireplace, moonlight, desk lamp | Warm, cozy | Built at p=4 -- rebuild to p=2 after new standard is validated |
| Main Lab | FAR | 3200 | Fluorescent, device glow, portal | Science green | Planned |
| Back Lab | CLOSE | 1280 | Dim overhead, locker light | Cramped, cluttered | Planned |
| 2nd Floor Hallway | MEDIUM | 2560 | Wall sconces, moonlight | Dim, mysterious | Planned |
| Hector's Bedroom | MEDIUM | 1280 | Bedside lamp, moonlight | Personal, warm | Planned |
| Attic / Alien Room | CLOSE | 1280 | TV glow, starlight | Blue-white, alien | Planned |
| Basement | MEDIUM | 1280 | Bare bulb, generator glow | Industrial, cold | Planned |
| Frank's Room | CLOSE | 1280 | Single overhead, candle | Eerie, Gothic | Planned |
| Front Exterior | MEDIUM | 2560 | Moonlight, window glow | Night, foreboding | Planned |
| Backyard | FAR | 2560 | Moonlight, fence glow | Open, mysterious | Planned |
| Earl's Yard | MEDIUM | 1280 | Tiki torches, strings, grill | Warm, festive | Planned |
| Roof | MEDIUM | 1280 | Moonlight, starfield | Exposed, vast sky | Planned |
| Storage Room | CLOSE | 1280 | Laser grid, emergency light | Tense, red-lit | Planned |
