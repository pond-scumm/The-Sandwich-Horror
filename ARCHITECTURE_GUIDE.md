# The Sandwich Horror — Architecture Guide
## For Claude Code Implementation

Last Updated: February 5, 2026 (UIScene + Cursors - Phase 3)

---

## Overview

This document captures all architecture decisions made during planning. Claude Code should follow these patterns when implementing features.

**IMPORTANT:** Before proposing new features, always check the Implementation Status below and verify against actual code. Don't assume something needs to be built — grep the codebase first.

---

## Implementation Status

### Complete
- [x] TSH namespace and global structure (`src/TSH.js`)
- [x] GameState with flags, inventory, NPC states (`src/GameState.js`)
- [x] Save/Load system (`src/SaveSystem.js`)
- [x] BaseScene with player, movement, dialogue bubbles (`src/BaseScene.js`)
- [x] RoomScene data-driven room renderer (`src/scenes/RoomScene.js`)
- [x] Inventory UI (button toggle, slots, selection, item cursor)
- [x] Items data definitions (`src/data/items/items.js`)
- [x] Combinations data definitions (`src/data/items/combinations.js`)
- [x] Hotspot system with polygon support
- [x] useItemOnHotspot (reads `itemInteractions` from room data)
- [x] actionTrigger for scene transitions
- [x] Debug overlay with coordinate display, hotspot visualization, walkable polygon
- [x] Polygon walkable areas with smart movement (nearest point projection)
- [x] 2-action interaction system (left-click Use/Talk, right-click Examine)
- [x] Interior room data file with 18 hotspots and draft dialogue (`src/data/rooms/interior.js`)
- [x] NPC conversation system (`enterConversation`, `showDialogueOptions`, `exitConversation`, `showConversationLine` in BaseScene.js)
- [x] Audio manager with channel-based music, SFX, volume categories (`src/AudioManager.js`)
- [x] Room music integration with auto-preload and smart continuity (`RoomScene.js`)
- [x] SFX registry with action hooks for inventory, items, UI (`src/data/audio/sfx.js`)
- [x] Footstep system with walk/run variants, left/right alternation, randomized selection
- [x] Settings menu with gear icon button, blur overlay, X close button
- [x] Fullscreen toggle checkbox in settings menu
- [x] Volume sliders (Master, Music, Effects) with mute buttons and percentage display
- [x] Hotspot highlighting system (Shift key on desktop, long-press on mobile)
- [x] Character placeholder sprites with camera preset scaling (`nate_placeholder.png`, `hector_placeholder.png`)
- [x] Procedural item icons system (`src/data/items/icons.js`) with p=4 chunky pixel style
- [x] Event emitter system in TSH.State (Phase 1 of UIScene refactor)
- [x] UI state management in TSH.State (Phase 2 of UIScene refactor)
- [x] UIScene with cursor management (Phase 3 of UIScene refactor)

### TODO (Not Yet Implemented)
- [x] **Item-on-item combinations** — Click item B while item A is selected to combine (`tryCombineItems` in BaseScene.js)
- [x] **Item pickup from hotspots** — `giveItem`, `removeAfterPickup`, `pickupFlag` supported in RoomScene.js
- [ ] **State-driven hotspot changes** — `states` system from architecture spec not implemented (hotspots that change responses based on flags)
- [ ] **Cutscene/sequence system** — No async/await wrappers for walkTo/showDialog to enable scripted sequences

### Legacy Scene Classes (Exist but Not Data-Driven)
These scenes exist but use the old scene-class pattern instead of the data-driven RoomScene approach:
- `LaboratoryScene.js` — Has hotspots, dialogue trees, NPC conversation
- `BackyardScene.js` — Has Earl NPC with conversation
- `GardenScene.js`, `ForestScene.js`, `GameScene.js`, `NeighborYardScene.js`, `AtticScene.js`

**Decision needed:** Convert these to data-driven room files, or keep as legacy?

### Data-Driven Room Files
- [x] `interior.js` — Complete with hotspots, walkable polygon, lighting, itemInteractions
- [ ] Other rooms need data files if using RoomScene pattern

---

## 1. Global Namespace

Everything lives under `window.TSH` to avoid global scope pollution.

```javascript
window.TSH = {
    Rooms: {},        // Room definitions
    NPCs: {},         // NPC definitions
    Dialogue: {},     // Dialogue trees
    Items: {},        // Item definitions
    Actions: {},      // Puzzle action functions
    Combinations: {}, // Item crafting recipes
    State: null,      // GameState manager
    Save: null,       // Save system
    Audio: null,      // Audio manager (initialized after game created)
    debug: false      // Debug mode toggle
}
```

**TSH.js must be loaded FIRST**, before all other game scripts.

---

## 2. Game State

All game state lives in a single manager: `TSH.State`

### Flags are grouped by concept:
```javascript
flags: {
    story: { entered_house, experiment_failed, ... },
    hector: { head_found, body_captured, ... },
    computer: { tried_login, logged_in, ... },
    clock: { has_spring_1, shoes_repaired, has_clock, ... },
    power: { generator_unplugged, has_fuse, ... },
    screen: { met_alien, satellite_sabotaged, has_tv, ... },
    brain: { found_brain, rival_convinced, ... },
    finale: { clone_created, ... }
}
```

### Flag rules:
- Flags represent **facts**, not intentions
- Good: `has_clock`, `alien_on_roof`
- Bad: `player_should_go_to_lab`, `ready_for_next_step`
- Use dot notation: `TSH.State.getFlag('clock.has_spring_1')`

### API:
```javascript
TSH.State.getFlag('clock.has_spring_1')     // → true/false
TSH.State.setFlag('clock.has_spring_1', true)
TSH.State.addItem('crowbar')
TSH.State.removeItem('crowbar')
TSH.State.hasItem('crowbar')                 // → true/false
TSH.State.getNPCState('alien')               // → 'watching_tv'
TSH.State.setNPCState('alien', 'on_roof')
TSH.State.markRoomVisited('laboratory')
TSH.State.hasVisitedRoom('laboratory')       // → true/false
TSH.State.toJSON()                           // For saving
TSH.State.loadFromJSON(data)                 // For loading
TSH.State.dump()                             // Debug: log state to console
```

### Event System:
State changes emit events that any part of the game can listen to. This enables reactive UI updates and decoupled architecture.

```javascript
// Subscribe to events
TSH.State.on('inventoryChanged', (data) => {
    console.log('Inventory changed:', data.type, data.itemId);
});

TSH.State.on('flagChanged', (data) => {
    if (data.path === 'finale.knows_teleporter_truth') {
        // Update hotspot label dynamically
    }
});

// Unsubscribe
TSH.State.off('inventoryChanged', myCallback);
```

**Available Events:**
| Event | Data | Triggers |
|-------|------|----------|
| `inventoryChanged` | `{ type: 'added'\|'removed'\|'consumed', itemId }` | `addItem()`, `removeItem()`, `consumeItem()` |
| `flagChanged` | `{ path, value }` | `setFlag()` |
| `npcStateChanged` | `{ npcId, state, previousState }` | `setNPCState()` |
| `roomChanged` | `{ from, to }` | `setCurrentRoom()` |
| `uiStateChanged` | `{ key, value, previousValue }` | `setUIState()`, `setSelectedItem()`, etc. |

### UI State:
UI-related state is tracked separately from game state, enabling reactive UI updates.

```javascript
// Persistent UI state (survives room transitions)
TSH.State.getSelectedItem()           // → item ID or null
TSH.State.setSelectedItem('key')
TSH.State.clearSelectedItem()
TSH.State.isInventoryOpen()           // → true/false
TSH.State.setInventoryOpen(true)

// Generic getter/setter for any UI state
TSH.State.getUIState('dialogActive')  // → true/false
TSH.State.setUIState('dialogActive', true)

// Reset transient UI state (dialogs, settings, conversations)
TSH.State.resetTransientUIState()
```

**UI State Keys:**
| Key | Persistent? | Description |
|-----|-------------|-------------|
| `selectedItem` | Yes | Currently selected inventory item ID |
| `inventoryOpen` | Yes | Is inventory panel expanded? |
| `dialogActive` | No | Is examine/action dialog showing? |
| `conversationActive` | No | Is NPC conversation in progress? |
| `settingsOpen` | No | Is settings menu open? |
| `edgeZone` | No | Edge zone direction ('left', 'right', or null) |
| `itemCursorHighlight` | No | Show red highlight on item cursor |
| `crosshairColor` | No | Crosshair color (hex, default 0xffffff) |

*Persistent state survives room transitions. Transient state may reset on room change.*

### UIScene (Persistent UI Layer):
UIScene runs parallel to game scenes and manages persistent UI elements. It listens to TSH.State events and updates reactively.

```javascript
// UIScene is launched automatically by RoomScene
// It handles: crosshair cursor, arrow cursor, item cursor

// Game scenes communicate with UIScene via TSH.State:
TSH.State.setSelectedItem('key');           // Shows item as cursor
TSH.State.clearSelectedItem();              // Returns to crosshair
TSH.State.setUIState('edgeZone', 'left');   // Shows arrow cursor
TSH.State.setUIState('edgeZone', null);     // Hides arrow cursor
TSH.State.setUIState('crosshairColor', 0xff0000);  // Red crosshair
```

UIScene automatically hides cursors when `dialogActive`, `conversationActive`, or `settingsOpen` are true.

### Migration note:
The old approach used Phaser's registry (`this.registry.get('gameState')`). All scenes should be migrated to use `TSH.State` instead.

---

## 3. Rooms Are Data-Driven

Each room is a plain JavaScript data object, NOT a giant scene class with drawing code.

```javascript
TSH.Rooms.laboratory = {
    id: 'laboratory',
    name: "Hector's Laboratory",
    background: 'assets/backgrounds/laboratory.png',
    music: 'lab_ambient',
    worldWidth: 640,   // 640 = scrolling (2x screen), 320 = static

    walkableArea: { minY: 0.72, maxY: 0.92 },

    spawns: {
        from_interior: { x: 50, y: 0.82 },
        from_back_lab: { x: 500, y: 0.82 },
        default: { x: 200, y: 0.82 }
    },

    exits: [
        { edge: 'left', target: 'interior', spawnPoint: 'from_lab' },
        { edge: 'right', target: 'back_lab', spawnPoint: 'from_lab' }
    ],

    npcs: [
        {
            id: 'hector_head',
            condition: (flags) => flags.hector.head_found && !flags.story.game_complete,
            position: { x: 400, y: 0.60 },
            dialogue: 'hector_head'
        }
    ],

    hotspots: [
        {
            id: 'portal_device',
            x: 300, y: 0.40, w: 80, h: 0.35,
            interactX: 300, interactY: 0.82,
            name: 'Portal Device',
            verbLabels: { actionVerb: 'Examine', lookVerb: 'Look at', talkVerb: 'Talk to' },
            states: {
                default: {
                    lookResponse: "The portal device. Heavily damaged.",
                    useResponse: "I need all four components first."
                },
                ready: {
                    condition: (flags) => flags.story.all_components_installed,
                    lookResponse: "All four components installed. Ready to go.",
                    useResponse: "TRIGGER_FINALE"
                }
            }
        }
    ],

    // Dynamic item visuals that disappear when picked up
    pickupOverlays: [
        {
            hotspotId: 'matches',     // Links to hotspot (destroyed when item picked up)
            itemId: 'matches',        // Item ID (overlay hidden if player has this item)
            x: 984, y: 0.365,         // Position (y is proportional)
            depth: 55,                // Render depth
            draw: (g, x, y, height) => {
                // Custom graphics drawing function
                g.fillStyle(0x8B4513, 1);
                g.fillRect(x, y, 20, 12);
            }
        }
    ]
}
```

A single scene class (or small number of classes) reads this data and renders any room. This replaces the current approach of one massive scene class per room.

---

## 4. Async/Await for Sequences

**CRITICAL: Do not use callback pyramids for cutscenes or action sequences.**

All scene methods that involve waiting (walking, dialogue, animation) should return Promises so they can be awaited.

```javascript
// BAD - callback hell
scene.walkTo(300, () => {
    scene.showDialog("text", () => {
        scene.playAnimation('sneeze', () => {
            scene.setFlag('sneezed', true);
        });
    });
});

// GOOD - async/await
async function triggerSneeze(scene) {
    await scene.walkTo(300);
    await scene.showDialog("Let me blow the dust off this...");
    await scene.playAnimation('sneeze');
    TSH.State.setFlag('hector.sneezed_on_book', true);
    await scene.showDialog("*ACHOO!*");
}
```

BaseScene's walkTo(), showDialog(), and playAnimation() methods should all return Promises.

---

## 5. Item Combinations

Defined as data in `src/data/items/combinations.js`. Keys are alphabetically sorted: `'item_a+item_b'`.

```javascript
TSH.Combinations.tryCombine('spring', 'satellite_shoes')  // Check if valid
TSH.Combinations.executeCombine('spring', 'satellite_shoes')  // Do it
```

Each recipe specifies what's consumed, what's produced, what flags are set, and what Nate says.

---

## 6. Item Icons

Inventory items display as procedural pixel-art icons drawn at runtime. Defined in `src/data/items/icons.js`.

### Style Guidelines

- **Pixel size:** `p = 4` (chunky, matches character sprites per ROOM_DESIGN_BIBLE)
- **Icon area:** ~70px (fits 70% of inventory slot)
- **Working grid:** ~17x17 "game pixels" maximum
- **Colors:** Use defined palettes, avoid pure black/white

### Adding a New Icon

1. Add drawing function to `TSH.ItemIcons` in `icons.js`:

```javascript
TSH.ItemIcons = {
    // ... existing icons ...

    my_new_item: function(graphics, x, y, size) {
        const g = graphics;
        const p = 4;  // Pixel size

        // Center the icon (adjust based on your design)
        const baseX = x - 6 * p;  // Half width in pixels
        const baseY = y - 7 * p;  // Half height in pixels

        // Define colors
        const MAIN_COLOR = 0xaabbcc;
        const SHADOW = 0x889900;

        // Draw pixels using helper
        // pixel(g, px, py, color, baseX, baseY) draws a p×p square
        g.fillStyle(MAIN_COLOR, 1);
        g.fillRect(baseX + 0 * p, baseY + 0 * p, p, p);  // One pixel at (0,0)
        // ... continue drawing ...
    }
};
```

2. The icon automatically appears in inventory and cursor when that item is selected.

### Helper Pattern

```javascript
// Inline pixel helper (define inside each icon function)
function pixel(g, px, py, color, baseX, baseY) {
    g.fillStyle(color, 1);
    g.fillRect(baseX + px * p, baseY + py * p, p, p);
}
```

### Fallback Behavior

Items without a `TSH.ItemIcons[item.id]` function display as colored rounded rectangles using `item.color` (default: gold `0xffd700`).

### Current Icons

| Item ID | Description |
|---------|-------------|
| `help_wanted_ad` | Torn paper with text lines |
| `candle` | Cream candle with wick, brass holder |
| `lit_candle` | Candle with orange/yellow flame |
| `matches` | Blue matchbox with red-tipped matches |

---

## 7. Save/Load

3 slots, JSON to localStorage.

```javascript
TSH.Save.save(1)         // Save to slot 1
TSH.Save.load(1)         // Load slot 1
TSH.Save.listSaves()     // Get all slot info for menu
TSH.Save.hasSave(1)      // Quick check
TSH.Save.deleteSave(1)   // Delete
```

Version field enables future migration of old saves.

---

## 8. Audio System

Channel-based audio with volume categories. Initialized after Phaser game creates.

### Volume Categories
| Category | Controls |
|----------|----------|
| master | Everything (global multiplier) |
| music | Background music + ambient loops |
| sfx | Sound effects (pickup, doors, footsteps) |
| voice | Dialogue/speech |

### Music Channels
Multiple tracks can play simultaneously on different channels:
- `main` — Primary background music
- `ambient` — Secondary environmental loops (generator hum, TV audio)
- `ambient2` — Third channel for layered ambience

### API
```javascript
// Music
TSH.Audio.playMusic('lab_theme', { channel: 'main', volume: 0.7, fade: 1000 })
TSH.Audio.playMusic('tv_audio', { channel: 'ambient', volume: 0.4 })
TSH.Audio.stopMusic('main', { fade: 500 })
TSH.Audio.stopAllMusic({ fade: 1000 })
TSH.Audio.isPlaying('lab_theme')           // → true/false

// SFX
TSH.Audio.playSFX('pickup', { volume: 0.8 })

// Voice
TSH.Audio.playVoice('nate_greeting')

// Volume control
TSH.Audio.setVolume('master', 0.8)
TSH.Audio.setVolume('music', 0.6)
TSH.Audio.getVolume('sfx')                 // → 0.8

// Utility
TSH.Audio.duckMusic(2000)                  // Lower music for dialogue
TSH.Audio.pauseAll()
TSH.Audio.resumeAll()
TSH.Audio.dump()                           // Debug: log audio state
```

### Asset Folder Structure
```
assets/audio/
├── music/          # Background music loops
├── ambient/        # Environmental sounds
├── sfx/            # Sound effects
└── voice/          # Dialogue lines
```

### Preloading Audio (in scene preload)
```javascript
preload() {
    this.load.audio('lab_theme', 'assets/audio/music/lab_theme.mp3');
    this.load.audio('pickup', 'assets/audio/sfx/pickup.mp3');
}
```

### Room Audio Config
RoomScene automatically handles audio based on room data. Audio is preloaded and transitions are managed.

```javascript
TSH.Rooms.alien_room = {
    // ...other properties
    audio: {
        // Main music track (plays on 'main' channel)
        music: {
            key: 'alien_theme',     // assets/audio/music/alien_theme.mp3
            volume: 0.7,            // Base volume 0-1 (default: 0.7)
            fade: 1000              // Fade in duration ms (default: 1000)
        },
        // Additional ambient layers
        layers: [
            {
                key: 'tv_soap_opera',   // assets/audio/music/tv_soap_opera.mp3
                channel: 'ambient',      // 'ambient' or 'ambient2'
                volume: 0.5,
                fade: 500
            }
        ],
        // Don't restart music if coming from these rooms
        continueFrom: ['franks_room', 'hallway']
    }
}
```

**Behavior:**
- Music auto-loops
- If same track already playing from a `continueFrom` room, it continues seamlessly
- Unused ambient channels are automatically stopped when entering a room
- Audio files are preloaded during scene preload phase

### Sound Effects (SFX)
SFX are defined in `src/data/audio/sfx.js` and auto-preloaded by RoomScene.

```javascript
// Play by name (looks up in TSH.SFX registry)
TSH.Audio.playSFX('pickup');
TSH.Audio.playSFX('door_open', { volume: 0.5 });

// Registry defines: key, path, default volume
TSH.SFX.pickup = {
    key: 'sfx_pickup',
    path: 'assets/audio/sfx/pickup.wav',  // WAV for SFX (no decode delay)
    volume: 0.7
};
```

**Built-in action hooks** (already wired up in BaseScene):
| Action | SFX |
|--------|-----|
| Pick up item | `pickup` |
| Open inventory | `inventory_open` |
| Close inventory | `inventory_close` |
| Select item | `item_select` |
| Combine items (success) | `item_combine` |
| Combine items (fail) | `item_fail` |

**To add a new SFX:**
1. Add WAV file to `assets/audio/sfx/` (WAV preferred for SFX - no decode delay)
2. Add entry to `src/data/audio/sfx.js`
3. Call `TSH.Audio.playSFX('name')` where needed

### Footsteps
Footsteps play automatically when Nate walks or runs, alternating left/right with randomization.

**Files needed (8 variants):**
```
assets/audio/sfx/stepwlkl1.wav    # Walk left variant 1
assets/audio/sfx/stepwlkl2.wav    # Walk left variant 2
assets/audio/sfx/stepwlkr1.wav    # Walk right variant 1
assets/audio/sfx/stepwlkr2.wav    # Walk right variant 2
assets/audio/sfx/steprunl1.wav    # Run left variant 1
assets/audio/sfx/steprunl2.wav    # Run left variant 2
assets/audio/sfx/steprunr1.wav    # Run right variant 1
assets/audio/sfx/steprunr2.wav    # Run right variant 2
```

**Selection Logic:**
- Alternates left (l) and right (r) foot
- 75% chance of variant 1, 25% chance of variant 2
- Automatically uses walk (wlk) or run (run) based on movement speed

**Timing:**
- Walking: ~400ms between steps
- Running: ~250ms between steps

### Legacy Scene Audio
For non-data-driven scenes, call TSH.Audio directly:
```javascript
create() {
    super.create();
    TSH.Audio.playMusic('scene_theme', { channel: 'main', volume: 0.6 });
}
```

---

## 9. NPC States

Tracked as string enums in `TSH.State`:

| NPC | Valid States |
|-----|-------------|
| hector_body | pre_experiment, running_loose, coat_dropped, captured, reunited |
| hector_head | pre_experiment, in_locker, locker_closed, on_shelf, reunited |
| alien | watching_tv, angry, on_roof, locked_out |
| frank | reading, strapped_down, victor_brain |
| victor | in_jar, in_frank, back_in_jar |
| robot | in_station, deployed, chasing_monkey, locked_out, bumping, disabled |
| earl | behind_fence, visible |
| generator | plugged_in, unplugged |

---

## 10. File Structure

```
src/
├── TSH.js                          # Global namespace (load first)
├── GameState.js                    # State manager
├── SaveSystem.js                   # Save/load
├── AudioManager.js                 # Audio system
├── BaseScene.js                    # Parent scene class
├── config.js                       # Phaser config (load last)
├── data/
│   ├── rooms/                      # Room definitions
│   │   ├── interior.js
│   │   ├── laboratory.js
│   │   └── ...
│   ├── npcs/                       # NPC definitions
│   │   ├── hector.js
│   │   └── ...
│   ├── items/                      # Item & combination data
│   │   ├── items.js
│   │   └── combinations.js
│   ├── audio/                      # Audio definitions
│   │   └── sfx.js                  # SFX registry
│   ├── dialogue/                   # Dialogue trees
│   │   ├── hector.js
│   │   └── ...
│   └── actions/                    # Puzzle action functions
│       ├── lab_actions.js
│       └── ...
└── scenes/                         # Phaser scene classes
    └── RoomScene.js                # Generic room renderer
```

---

## 11. Script Loading Order (index.html)

1. Phaser CDN
2. `TSH.js` (namespace)
3. `GameState.js`, `SaveSystem.js`, `AudioManager.js` (core systems)
4. `data/**/*.js` (all game data)
5. `BaseScene.js` (scene base class)
6. `scenes/*.js` (scene classes)
7. `config.js` (starts game — must be last)

---

## 12. Technical Specs

- **Engine:** Phaser 3.60 via CDN
- **No build tools.** No npm, no bundler. Script tags only.
- **Resolution:** 1280x720 with Phaser.Scale.FIT
- **Pixel art:** 4x4 minimum pixel size at 1280x720 (manual discipline, not true upscaling)
- **Rendering:** Phaser.WEBGL with Light2D pipeline
- **Hosting:** GitHub Pages (static files only)
- **Mobile:** Touch input, 2-action system, responsive scaling
- **Fonts:** LucasArts SCUMM Solid (.otf) for dialog and hotspot labels

---

## 13. Room List (18 rooms, 5-6 cuttable)

1. Bus Stop (cutscene only, cuttable)
2. Woods (intro only, cuttable)
3. Front of House (intro only, cuttable)
4. Interior (main hub)
5. Laboratory (Hector, portal device, 4 component slots)
6. Back Lab (security door, robot charging station)
7. Storage Room (empty shelf, accessed past robot)
8. Side Lab (Hector's head locker, stairs to bedroom)
9. Hector's Bedroom (goggles, cuttable)
10. 2nd Floor Hallway (attic pull stairs, bedroom doors)
11. Alien's Room (alien, TV)
12. Frank's Room (window to roof, spring in mattress)
13. Roof (satellite dish, window)
14. Attic (satellite shoes, cuttable)
15. Backyard (bulkhead, fence, clock on wall)
16. Shed (spray paint, padlock, cuttable)
17. Earl's Yard (Earl, ladder)
18. Basement (Frank, brain jar, generator, TV guide)

---

## 14. What NOT to Do

- Don't use Phaser registry for game state (use TSH.State)
- Don't write monolithic scene classes with inline drawing code
- Don't use callback pyramids (use async/await)
- Don't put dialogue strings inside scene files (use dialogue data files)
- Don't hardcode puzzle logic inside hotspot handlers (use action functions)
- Don't create separate CSS/JS files — this is a single-page game

---

## 15. Interaction Systems

### 2-Action System
- **Left-click on background**: Walk to location
- **Left-click on hotspot**: Run to hotspot, then Use (or Talk for NPCs)
- **Right-click on hotspot**: Examine immediately (no walking)
- **Right-click with item cursor**: Deselect item (clear cursor)
- NPC detection: hotspots with `type: 'npc'` or `isNPC: true` get "Talk To" instead of "Use"

### Inventory (Desktop)
- **Inventory button**: Always visible in bottom-left corner (hollow when idle, filled on hover/open)
- **Left-click button**: Toggle inventory panel open/closed
- **Left-click item**: Select as cursor (for combining or using on hotspots)
- **Right-click item**: Examine item (shows description)
- **Left-click with item on another item**: Attempt combination
- Item cursor persists after failed combinations (not cleared)
- Item cursor persists after using on hotspot (can reuse)
- When item transforms via combination, both cursor and inventory slot update

### Inventory (Mobile)
- **Tap inventory button**: Toggle inventory panel open/closed
- **Quick tap item**: Examine item (shows description)
- **Long-press item (500ms)**: Pick up item as cursor for dragging
- **Drag item to another item**: Shows "Use X on Y" label, release to combine
- **Drag item outside inventory**: Inventory closes, continue dragging to hotspot
- **Release on hotspot**: Uses item on hotspot, then clears cursor immediately
- **Release on empty space**: Clears cursor (deselects item)
- Item cursor clears immediately on release (different from desktop)

### Hotspot Labels
- Labels follow cursor position (offset above cursor)
- Show hotspot name when hovering
- Show "Use [item] on [hotspot]" when hovering with item cursor
- Labels hidden during dialog and when inventory is open
- Labels reappear when dialog ends if cursor still over hotspot

### Movement
- **Single click on background**: Walk at normal speed (450 px/s)
- **Click on hotspot**: Run to interact position (750 px/s)
- **Click and hold**: Continuous running toward cursor
- Walkable area constrains movement (polygon or minY/maxY bounds)

### Dialogue Display
- **Font**: LucasArts SCUMM Solid (35px desktop, 60px mobile)
- Speech bubble appears above Nate's head
- When inventory is open, dialog appears at top of screen (text expands downward)
- Multi-sentence dialogue auto-advances with timing
- Click/tap or press period (.) to skip to next sentence
- Dialogue pauses character movement and hides cursor/labels
- Cursor and hotspot labels restore when dialog ends

---

## 16. Conversation Mode

When player left-clicks on an NPC, the game enters conversation mode:

**Behavior:**
- Character movement is frozen
- Hotspot interactions disabled
- Crosshair cursor remains visible (white)
- Dialogue choice UI appears (bottom-left)
- Player can only select dialogue options, not interact with world

**Exiting:**
- One option is always available to end conversation ("Goodbye", "That's all", etc.)
- Selecting exit option returns to normal gameplay
- Movement, verb coin, and world interactions re-enable

**Dialogue Flow:**
1. Player clicks dialogue option
2. Hero speaks the line (speech bubble above hero)
3. NPC responds (speech bubble above NPC)
4. New dialogue options appear
5. Repeat until player chooses exit option

---

## 17. Mobile Optimization

### Touch Targets
- Verb coin actions: Minimum 60px, recommended 70px
- All interactive UI: Minimum 44px (Apple guidelines)
- Inventory items: Comfortable tap size with spacing

### Responsive Scaling
- Game scales from 320px to 1600px viewport width
- Use Phaser.Scale.FIT with CENTER_BOTH
- Test on actual mobile devices, not just desktop resize

### Mobile Detection
- Uses `window.matchMedia('(pointer: coarse)').matches` to detect mobile
- This checks if primary input is touch (not just touch-capable)
- Correctly identifies touchscreen laptops as desktop when using mouse
- Set in `BaseScene.create()` as `this.isMobile`

### Cursor Behavior
- Crosshair cursor: Hidden on mobile (`this.isMobile`), visible on desktop
- Disable default context menus: `canvas.addEventListener('contextmenu', e => e.preventDefault())`

### Performance
- Limit to 3-5 lights per scene (Light2D is expensive)
- Lighting appears darker on mobile — test and adjust ambient
- Reuse graphics objects where possible
- Limit active tweens (stop old ones before starting new)

---

## 18. Settings Menu

The settings menu provides player options without leaving the game.

### Opening/Closing
- **Gear icon button**: Top-right corner (hollow when idle, filled on hover)
- **X button**: Top-right of panel to close
- **Return to Game button**: Bottom of panel to close
- Menu blocked during dialogue or conversation

### Fullscreen Toggle
- Checkbox immediately enters/exits fullscreen mode
- State syncs if user exits fullscreen via Escape or browser controls
- Works on both desktop and mobile

### Volume Controls
Three sliders with labels above:
| Slider | Audio Category | TSH.Audio Key |
|--------|----------------|---------------|
| Master | Global multiplier | `master` |
| Music | Background music | `music` |
| Effects | Sound effects | `sfx` |

**Slider Features:**
- Mute button (speaker icon) to left of each slider
- Draggable handle with extended hit area at 0% and 100%
- Percentage display (right-aligned)
- Real-time volume changes as slider is dragged
- Audio continues playing while menu is open (for preview)

**Mute Behavior:**
- Stores previous volume when muted
- Restores previous volume when unmuted
- Dragging slider above 0% auto-unmutes

### Game State While Menu Open
- Tweens paused (character animations)
- Scene timers paused
- Audio continues playing (not paused)
- Hotspot interactions blocked
- Crosshair cursor visible for menu navigation
- Crosshair turns red when hovering over interactive elements

### Implementation Notes
- Panel size: 320x520 pixels, centered on screen
- Uses manual click detection (not Phaser interactive) for camera scroll compatibility
- All UI elements use `setScrollFactor(0)` to stay fixed on screen
- Blur overlay covers entire screen behind panel

---

## 19. Hotspot Highlighting

Helps players find interactive elements without pixel hunting.

### Activation
- **Desktop**: Hold Shift key to show highlights (instant on/off)
- **Mobile**: Long-press for 1 second to show, release to hide

### Visual Design
- Small white circle centered on each hotspot
- Semi-transparent with subtle outer ring
- Appears/disappears instantly

### Position Calculation
- Rectangle hotspots: Center of bounding box
- Polygon hotspots: Bounding box center (or manual `highlightX`/`highlightY` if specified)

### Room Data Override
For irregular polygon shapes where bounding box center is outside the shape:
```javascript
hotspots: [
    {
        id: 'chair',
        polygon: [...],
        highlightX: 150,      // Manual X position
        highlightY: 0.65      // Manual Y position (proportional)
    }
]
```

---

## 20. Testing Checklist

### Core Functionality
- [ ] Character walks correctly within walkable area
- [ ] Character cannot escape polygon bounds during movement
- [ ] Left-click on hotspot runs to it and triggers Use/Talk
- [ ] Right-click on hotspot triggers Examine (no walking)
- [ ] Inventory opens/closes with button click
- [ ] Items can be selected and used on hotspots
- [ ] Hotspot labels appear/hide correctly during dialog

### Scene Transitions
- [ ] Transitions work in both directions
- [ ] Player spawns at correct position after transition
- [ ] Camera follows player correctly in scrolling rooms

### Dialogue
- [ ] Speech bubbles display and position correctly
- [ ] Dialogue advances on click/tap or period key
- [ ] Conversation mode locks movement appropriately

### Mobile
- [ ] Touch interactions work (tap hotspots, inventory button)
- [ ] Lighting looks acceptable (not too dark)
- [ ] UI elements are large enough to tap
- [ ] No context menu appears on long-press

---

## 21. Development Workflow

### Version Number

**IMPORTANT:** Increment the version number in the settings menu on every commit.

**Location:** `src/BaseScene.js` in `openSettingsMenu()` method
```javascript
const versionText = this.add.text(0, btnY - 45, 'v0.1.13', {  // ← Update this
    fontFamily: '"Press Start 2P", cursive',
    fontSize: '14px',
    color: '#ffffff'
}).setOrigin(0.5);
```

**Why:** The version number helps verify which build is running, especially on mobile where caching and deploy delays can make it unclear if the latest code is active.

**Format:** `v0.X.Y` where:
- `0` = Pre-release (changes to `1` at launch)
- `X` = Feature/milestone number
- `Y` = Increments with each commit

### Commit Guidelines
- Always test on desktop before committing
- Push to trigger GitHub Pages deploy for mobile testing
- Version number in settings menu confirms deploy is live

### Incremental Implementation

**IMPORTANT:** When there is a list of multiple features to implement or bugs to fix, do NOT implement them all at once.

**Process:**
1. Implement ONE feature/fix
2. Let user test locally (do NOT commit/push unless asked)
3. Wait for user to confirm it works
4. Only then proceed to the next item
5. User will request commits/pushes when ready

**Why:** This makes it easier to isolate issues. If multiple changes are bundled together and something breaks, it's harder to identify which change caused the problem. One change at a time = easier debugging.
