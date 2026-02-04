# The Sandwich Horror — Architecture Guide
## For Claude Code Implementation

Last Updated: February 2026

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

## 6. Save/Load

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

## 7. NPC States

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

## 8. File Structure

```
src/
├── TSH.js                          # Global namespace (load first)
├── GameState.js                    # State manager
├── SaveSystem.js                   # Save/load
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

## 9. Script Loading Order (index.html)

1. Phaser CDN
2. `TSH.js` (namespace)
3. `GameState.js`, `SaveSystem.js` (core systems)
4. `data/**/*.js` (all game data)
5. `BaseScene.js` (scene base class)
6. `scenes/*.js` (scene classes)
7. `config.js` (starts game — must be last)

---

## 10. Technical Specs

- **Engine:** Phaser 3.60 via CDN
- **No build tools.** No npm, no bundler. Script tags only.
- **Resolution:** 1280x720 with Phaser.Scale.FIT
- **Pixel art:** 4x4 minimum pixel size at 1280x720 (manual discipline, not true upscaling)
- **Rendering:** Phaser.WEBGL with Light2D pipeline
- **Hosting:** GitHub Pages (static files only)
- **Mobile:** Touch input, 2-action system, responsive scaling
- **Fonts:** LucasArts SCUMM Solid (.otf) for dialog and hotspot labels

---

## 11. Room List (18 rooms, 5-6 cuttable)

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

## 12. What NOT to Do

- Don't use Phaser registry for game state (use TSH.State)
- Don't write monolithic scene classes with inline drawing code
- Don't use callback pyramids (use async/await)
- Don't put dialogue strings inside scene files (use dialogue data files)
- Don't hardcode puzzle logic inside hotspot handlers (use action functions)
- Don't create separate CSS/JS files — this is a single-page game

---

## 13. Interaction Systems

### 2-Action System
- **Left-click on background**: Walk to location
- **Left-click on hotspot**: Run to hotspot, then Use (or Talk for NPCs)
- **Right-click on hotspot**: Examine immediately (no walking)
- **Right-click with item cursor**: Deselect item (clear cursor)
- NPC detection: hotspots with `type: 'npc'` or `isNPC: true` get "Talk To" instead of "Use"

### Inventory
- **Inventory button**: Always visible in top-right corner
- **Left-click button**: Toggle inventory panel open/closed
- **Left-click item**: Select as cursor (for combining or using on hotspots)
- **Right-click item**: Examine item (shows description)
- **Left-click with item on another item**: Attempt combination
- Item cursor persists after failed combinations (not cleared)
- When item transforms via combination, both cursor and inventory slot update

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

## 14. Conversation Mode

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

## 15. Mobile Optimization

### Touch Targets
- Verb coin actions: Minimum 60px, recommended 70px
- All interactive UI: Minimum 44px (Apple guidelines)
- Inventory items: Comfortable tap size with spacing

### Responsive Scaling
- Game scales from 320px to 1600px viewport width
- Use Phaser.Scale.FIT with CENTER_BOTH
- Test on actual mobile devices, not just desktop resize

### Cursor Behavior
- Crosshair cursor: Hidden on touch devices, visible on desktop
- Disable default context menus: `canvas.addEventListener('contextmenu', e => e.preventDefault())`

### Performance
- Limit to 3-5 lights per scene (Light2D is expensive)
- Lighting appears darker on mobile — test and adjust ambient
- Reuse graphics objects where possible
- Limit active tweens (stop old ones before starting new)

---

## 16. Testing Checklist

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
