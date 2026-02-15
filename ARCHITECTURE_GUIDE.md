# The Sandwich Horror — Architecture Guide
## For Claude Code Implementation

Last Updated: February 11, 2026 (Implemented state-based dialogue system with @state annotations and spreadsheet State column)

---

## Overview

This document captures all architecture decisions made during planning. Claude Code should follow these patterns when implementing features.

**IMPORTANT:** Before proposing new features, always check the Implementation Status below and verify against actual code. Don't assume something needs to be built — grep the codebase first.

---

## 0. How to Use This Guide

**Don't read this entire document every session.** Read the Always Read sections, then use the task table to find what else you need.

### Always Read
These sections are foundational — every task depends on them:
- **Implementation Status** — Know what's built and what isn't before proposing work
- **§1 Global Namespace** — TSH structure
- **§2 Game State** — Flags, inventory, events, UI state (the core API for everything)
- **§3 Rooms Are Data-Driven** — Room data format, hotspot schema, pickupOverlays
- **§3.1 State-Driven Hotspots** — How hotspots respond to game state
- **§14 What NOT to Do** — Common mistakes to avoid
- **§22 Development Workflow** — Versioning, incremental implementation, commit rules

### Read When Relevant
| Task | Also Read |
|------|-----------|
| Building or modifying a room | §3.3 NPC Drawing, §3.4 Transition Cleanup, §8 Audio, §12 Tech Specs. Also read ROOM_DESIGN_BIBLE.md |
| Building conditional hotspots/pickups | §3.2 Decision Tree, §3.1 State-Driven Hotspots |
| Writing dialogue or hotspot responses | §5 Item Combinations (for combination dialogue), §16 Conversation Mode, §23 Dialogue Editing System, §24 Plain Text Dialogue System. Also read CREATIVE_BIBLE.md for Nate's voice |
| Editing the dialogue spreadsheet | §23 Dialogue Editing System |
| Working on audio | §8 Audio System (full section) |
| Implementing puzzle logic | §3.2 Decision Tree, §4 Async/Await, §5 Item Combinations, §9 Entity States |
| Working on inventory or items | §5 Item Combinations, §6 Item Icons, §15 Interaction Systems |
| Mobile or UX work | §15 Interaction Systems, §17 Mobile Optimization, §18 Settings Menu, §19 Hotspot Highlighting |
| Modifying UI elements | §2 UIScene subsection, §18 Settings Menu, §19 Hotspot Highlighting |
| Scene transitions | §3.4 Transition Cleanup |
| Debugging or testing | §20 Debug Overlay, §21 Testing Checklist |
| Save/Load work | §7 Save/Load |

### After Compaction
If context was compacted mid-session, re-read the Always Read sections and `git log --oneline -10` before continuing. Do not rely on compacted memory for in-progress edits — re-read any file you were modifying. Before starting any multi-file refactor, estimate whether compaction is likely mid-change — if so, alert the developer and compact first.

---

## Implementation Status

### Built
- TSH namespace and global structure (`src/TSH.js`)
- GameState with flags, inventory, NPC states, event emitter (`src/GameState.js`)
- Save/Load system (`src/SaveSystem.js`)
- BaseScene with player, movement, dialogue bubbles (`src/BaseScene.js`)
- RoomScene data-driven room renderer (`src/scenes/RoomScene.js`)
- UIScene with cursor management, inventory panel, settings buttons (`src/scenes/UIScene.js`)
- Inventory UI (button toggle, slots, selection, item cursor, item-on-item combinations)
- Item pickup from hotspots (`giveItem`, `removeAfterPickup`, `pickupFlag`)
- Action objects for item interactions (dialogue + side effects: `giveItem`, `setFlag`, `consumeItem`, `removeHotspot`, conditions, custom action functions)
- Action function system (`src/data/actions/`) for complex puzzle sequences
- Dynamic hotspots via `getHotspotData()` function with state-based conditionals
- Automatic hotspot refresh (`relevantFlags` + `refreshHotspots()`) for mid-room state changes
- State-driven hotspots (via `actionTrigger`, conditional NPCs, conditional dialogue options)
- Items and combinations data (`src/data/items/items.js`, `combinations.js`)
- Hotspot system with polygon support and highlighting (Shift/long-press)
- 2-action interaction system (left-click Use/Talk, right-click Examine)
- NPC conversation system (`enterConversation`, `showDialogueOptions`, etc.)
- Audio manager with channel-based music, SFX, volume categories (`src/AudioManager.js`)
- Room music with auto-preload, smart continuity, and audio persistence (`pauseIn`)
- SFX registry with action hooks (`src/data/audio/sfx.js`)
- Footstep system with walk/run variants, left/right alternation
- Settings menu with fullscreen toggle, volume sliders, mute buttons
- Character placeholder sprites with camera preset scaling
- Procedural item icons system (`src/data/items/icons.js`)
- Debug overlay with coordinate display, hotspot visualization, walkable polygon
- Dialogue export script (`tools/export_dialogue.js`) — exports all hotspot dialogue, items, flags, and combinations to `TSH_Hotspot_Dialogue.xlsx`
- Dialogue import script (`tools/import_dialogue.js`) — reads `TSH_Hotspot_Dialogue.xlsx` and writes changed dialogue back into room data files
- State-based dialogue system (`@state` annotations, State column, variant arrays) — enables multiple dialogue responses per hotspot verb based on game state, managed through spreadsheet

### Not Yet Built
- **Cutscene/sequence system** — No async/await wrappers for walkTo/showDialog to enable scripted sequences

### Legacy Scene Classes
These scenes use the old scene-class pattern instead of data-driven RoomScene:
- `LaboratoryScene.js`, `BackyardScene.js`, `NeighborYardScene.js`, `AtticScene.js`

Legacy scenes will be converted to data-driven format when their rooms are next touched. No bulk conversion planned.

### Data-Driven Room Files
- `interior.js`, `laboratory.js`, `backyard.js`, `earls_yard.js`, `basement.js`
- `second_floor.js`, `alien_room.js`, `franks_room.js`, `roof.js`
- `front_of_house.js`, `back_lab.js`, `secure_storage.js`, `hectors_room.js`

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
// It handles: crosshair cursor, arrow cursor, item cursor, inventory panel

// Game scenes communicate with UIScene via TSH.State:
TSH.State.setSelectedItem('key');           // Shows item as cursor
TSH.State.clearSelectedItem();              // Returns to crosshair
TSH.State.setUIState('edgeZone', 'left');   // Shows arrow cursor
TSH.State.setUIState('edgeZone', null);     // Hides arrow cursor
TSH.State.setUIState('crosshairColor', 0xff0000);  // Red crosshair
TSH.State.setInventoryOpen(true);           // Opens inventory panel
```

UIScene automatically hides cursors when `dialogActive`, `conversationActive`, or `settingsOpen` are true.

**Inventory Panel Features:**
- Reactive slot display (syncs with TSH.State inventory via `inventoryChanged` event)
- Desktop: Click item to select, right-click to examine
- Mobile: Quick tap to examine, long-press (300ms) to pick up and drag
- Mobile drag-to-combine with tolerance for finger position
- Hotspot label follows cursor with word wrap and bounds clamping
- Dialog overlay shows speech text above inventory panel when open

### Migration note:
The old approach used Phaser's registry (`this.registry.get('gameState')`). All scenes should be migrated to use `TSH.State` instead.

---

## 3. Rooms Are Data-Driven

Each room is a plain JavaScript data object, NOT a giant scene class with drawing code.

```javascript
TSH.Rooms.laboratory = {
    id: 'laboratory',
    name: "Hector's Laboratory",
    worldWidth: 2560,           // Room width in pixels (1280 = no scroll)

    walkableArea: { minY: 0.72, maxY: 0.92 },

    spawns: {
        from_interior: { x: 50, y: 0.82, direction: 'left' },   // Optional: face left on spawn
        from_back_lab: { x: 500, y: 0.82, direction: 'right' }, // Optional: face right on spawn
        default: { x: 200, y: 0.82 }                            // No direction = face right (default)
    },

    exits: [
        { edge: 'left', target: 'interior', spawnPoint: 'from_lab' },
        { edge: 'right', target: 'back_lab', spawnPoint: 'from_lab' }
    ],

    // Exit Movement Behavior: When the player clicks on screen edge exits (which display
    // arrow cursors), Nate runs to the exit instead of walking, making transitions feel
    // faster and more responsive. Door hotspots and other interactive transitions continue
    // to walk normally.
    // Implementation: RoomScene.js exit zone pointerdown handler passes true as 4th
    // parameter to walkTo().

    npcs: [
        {
            id: 'hector_head',
            sprite: 'hector_placeholder',
            condition: (flags) => flags.hector.head_found && !flags.story.game_complete,
            position: { x: 400, y: 0.60 },
            heightRatio: 0.5
        }
    ],

    // Hotspot array order = bottom to top (Phaser input priority).
    // Large background hotspots first, specific overlapping ones after.
    hotspots: [
        {
            id: 'portal_device',
            x: 300, y: 0.40, w: 80, h: 0.35,
            interactX: 300, interactY: 0.82,
            name: 'Portal Device',
            verbs: { action: 'Examine', look: 'Look at' },
            responses: {
                look: "The portal device. Heavily damaged.",
                action: "I need all four components first."
            }
            // Responses should follow Nate's voice — see CREATIVE_BIBLE.md
        },
        {
            id: 'npc_example',
            x: 800, y: 0.52, w: 60, h: 0.30,
            interactX: 750, interactY: 0.82,
            name: 'Earl',
            type: 'npc',                                    // Makes default action "Talk to"
            verbs: { action: 'Talk to', look: 'Look at' },
            responses: { look: "A very large, very hairy neighbor." },
            actionTrigger: { type: 'action', action: 'talk_to_earl' }
        },
        {
            id: 'pickup_example',
            x: 200, y: 0.65, w: 30, h: 0.05,
            interactX: 200, interactY: 0.82,
            name: 'Matches',
            verbs: { action: 'Take', look: 'Look at' },
            responses: { look: "A box of matches.", action: "Might come in handy." },
            giveItem: 'matches',                            // Item ID to add to inventory
            pickupFlag: 'story.found_matches',              // Flag to set on pickup
            removeAfterPickup: true                         // Hide hotspot after pickup
        }
    ],

    // Dynamic item visuals that disappear when picked up.
    // Each overlay links to a hotspot. When the player picks up the item,
    // the overlay is hidden. Use for items that should be visually present
    // in the room before pickup.
    pickupOverlays: [
        {
            hotspotId: 'pickup_example',
            itemId: 'matches',
            x: 200, y: 0.65, depth: 55,
            draw: (g, x, y, height) => {
                g.fillStyle(0x8B4513, 1);
                g.fillRect(x, y, 20, 12);
            }
        }
    ],

    // Specific item-on-hotspot responses (all other combinations fall back to item failDefault or Global Use default)
    // Supports both string responses (simple dialogue) and action objects (puzzle logic)
    itemInteractions: {
        portal_device: {
            component_item: "That fits perfectly!",  // String: just shows dialogue
            wrong_item: {                             // Object: dialogue + side effects
                dialogue: "That doesn't fit.",
                setFlag: "story.tried_wrong_item"
            }
        },
        mattress: {
            scalpel: {                                // Action object with condition
                condition: () => !TSH.State.getFlag('clock.has_spring_2'),
                failDialogue: "I already got the spring from there.",
                dialogue: "I cut open the mattress and find a spring!",
                giveItem: "spring_2",
                setFlag: "clock.has_spring_2"
            }
        },
        wall_clock: {
            repaired_shoes: {                         // Complex action with custom function
                condition: () => TSH.State.getFlag('clock.ladder_deployed'),
                failDialogue: "I can't reach it from down here.",
                action: "get_clock"                   // Calls TSH.Actions.get_clock(scene, hotspot, item)
            }
        }
        // Per-hotspot defaults and _default are IGNORED by runtime — use item failDefaults instead
    },

    // Flags that trigger automatic hotspot refresh when changed (for dynamic puzzles)
    relevantFlags: ['clock.ladder_deployed', 'clock.has_clock'],

    // First-visit entrance dialogue
    // [DISABLED — re-enable when testing is less frequent]
    firstVisit: {
        dialogue: "Whoa, look at this place!",
        delay: 500                                          // ms before showing
    },

    // Audio config (see §8 for full audio docs)
    audio: {
        music: { key: 'lab_theme', volume: 0.7, fade: 1000 },
        layers: [
            { key: 'generator_hum', channel: 'ambient', volume: 0.3 }
        ],
        continueFrom: ['back_lab'],
        pauseIn: ['interior']
    },

    // Procedural drawing via layers array (supports parallax)
    layers: [
        {
            type: 'procedural',
            name: 'background',
            depth: 0,
            scrollFactor: 1.0,
            draw: (g, scene, worldWidth, height) => { /* drawing code */ }
        }
    ]
    // OR legacy single-function alternative (no parallax):
    // drawRoom: (g, scene, worldWidth, height) => { /* drawing code */ }
}
```

A single scene class (`RoomScene.js`) reads this data and renders any room.

**Hotspot Data Format:** Room data uses `verbs` and `responses` objects. RoomScene internally transforms these to `verbLabels` and `lookResponse`/`useResponse`/`talkResponse` — but room data files should always use the `verbs`/`responses` format shown above.

**Item Interaction Fallback:** When using an item on a hotspot, the runtime checks: (1) specific `itemInteractions[hotspot][item]` entry, (2) item's `failDefault` from spreadsheet, (3) Global Use default. Per-hotspot `.default` and `_default` entries are ignored. See §23 for full fallback chain documentation.

**Action Objects:** Item interactions support both strings (simple dialogue) and objects (puzzle logic with side effects):

```javascript
itemInteractions: {
    hotspot_id: {
        item_id: "Simple string response",  // Shows dialogue only
        item_id: {                           // Action object with side effects
            dialogue: "Response text",       // Required (empty string = use fallback)
            giveItem: "item_id",             // Add item to inventory
            consumeItem: true,               // Remove the used item
            setFlag: "flag.name",            // Set single flag to true
            setFlags: {                      // Set multiple flags
                "flag.one": true,
                "flag.two": false
            },
            removeHotspot: true,             // Remove this hotspot from scene
            pickupOverlay: "overlay_id",     // Remove a pickup overlay
            condition: () => boolean,        // Optional: check before executing
            failDialogue: "Not yet...",      // Shown if condition fails
            action: "function_name"          // Calls TSH.Actions.function_name(scene, hotspot, item)
        }
    }
}
```

**Execution Order:** (1) Check condition (if present), (2) Show dialogue, (3) Call custom action function (if `action` specified), OR apply simple side effects (giveItem, setFlag, etc.), (4) Hotspot refresh triggers if relevant flags changed.

**Known Limitation — Action Objects in Direct Hotspot Responses:** Currently, action objects only work in `itemInteractions`. Direct hotspot `responses` (look/action/talk) accept strings or variant arrays (for state-based dialogue), but not action objects with side effects. For hotspots that need conditional game logic (like "take item if you don't have it, else show 'already have it' message"), use `actionTrigger: { type: 'action', action: 'function_name' }` and create a custom action function. **Future improvement:** Support action objects directly in hotspot responses to match the `itemInteractions` pattern.

**Action Functions:** For complex multi-step sequences, define functions in `src/data/actions/*.js`:

> **⚠️ Before Creating Custom Actions:** Check if state-driven hotspots (`getHotspotData()`) can handle the behavior first. Custom action functions should only be used for sequences requiring multiple steps, delays, animations, or system coordination. Conditional pickup behavior (e.g., "item available after flag is set") should use state-driven hotspots, not custom actions. See §3.2 for the decision tree.

```javascript
TSH.Actions.get_clock = function(scene, hotspot, item) {
    scene.showDialog("I climb up and grab the clock!");
    TSH.State.addItem('clock');
    TSH.State.removeItem('repaired_shoes');
    TSH.State.setFlag('clock.has_clock', true);
    scene.removeHotspot('clock_wall');
    // Can include delays, animations, multiple dialogue steps, etc.
};
```

**IMPORTANT:** When action functions need to display hotspot dialogue (e.g., from `hotspot.useResponse`), they must use `scene.parseResponse()` to handle variant arrays:

```javascript
TSH.Actions.take_scalpel = function(scene, hotspot, item) {
    // Get and parse response (handles both strings and variant arrays)
    const rawResponse = hotspot.useResponse || hotspot._data?.responses?.action || "";
    const dialogue = scene.parseResponse(rawResponse);

    if (dialogue) {
        scene.showDialog(dialogue);
    }
    // ... rest of action logic
};
```

**State-Based Dialogue Responses:** Hotspots can define multiple dialogue variants for the same verb (look/action/talk) that change based on game state, without requiring separate hotspot definitions. Use the `@state` annotation in room files to enable this:

```javascript
// @state knife_block: default, has:scalpel
{
    id: 'knife_block',
    name: 'Knife Block',
    responses: {
        look: "It's a collection of scalpels.",
        action: "I'll just take one."  // Will be imported as variant array
    },
    actionTrigger: { type: 'action', action: 'take_scalpel' }
}
```

The export script creates multiple spreadsheet rows (one per state). After editing dialogue in the spreadsheet, the import script generates conditional variant arrays:

```javascript
action: [
    { condition: () => TSH.State.hasItem('scalpel'), text: "One is enough." },
    { text: "I'll just take one." }
]
```

The runtime (`parseResponse()` in RoomScene) evaluates conditions top-to-bottom and shows the first matching variant. See §23 for full workflow documentation.

**For hotspots that change name, position, or available actions** (not just dialogue), continue using the `getHotspotData()` pattern (§3.1) to build different hotspot definitions based on `TSH.State`.

**Hotspot Array Ordering:** Phaser creates input zones in array order. Later zones sit on top and receive pointer events first. Always place large background hotspots (e.g., `woods_background`, full vehicle bodies) at the start of the array, and smaller overlapping hotspots (e.g., sub-elements like doors/windows, props on top of backgrounds) later. Array order = bottom to top for input priority.

**LAYOUT Pattern (Procedural Rooms):** Rooms with procedural drawing must define a shared `LAYOUT` object that both drawing functions and hotspot definitions reference, preventing position drift when elements are moved. See ROOM_DESIGN_BIBLE.md Section 7A for full specification.

**Layers Array:** Rooms can define a `layers` array instead of a single `drawRoom` function. Each layer has a `type` (`'procedural'` or `'image'`), a `scrollFactor` for parallax (1.0 = moves with camera, 0.5 = half speed), and a `depth` for z-ordering. Layers are rendered back-to-front.

---

## 3.1 State-Driven Hotspots (Standard Pattern)

**All room hotspots are state-driven.** When building or redesigning a room, `getHotspotData()` reads from `TSH.State` to determine what hotspots exist, what they're named, what their examine text says, and what actions are available. Rooms are renderers of current game state, not containers of static data.

This is the standard pattern, not a future refactor. Every new or redesigned room uses it from the start.

```javascript
getHotspotData(height) {
    const hotspots = [];

    // Hotspot exists conditionally
    if (!TSH.State.getFlag('clock.clock_fallen')) {
        hotspots.push({ id: 'wall-clock', name: 'Wall Clock', ... });
    }

    // Hotspot changes based on knowledge
    hotspots.push({
        id: 'teleporter',
        name: TSH.State.getFlag('finale.knows_teleporter_truth')
            ? 'Cloning Device' : 'Teleporter',
        responses: {
            look: TSH.State.getFlag('finale.knows_teleporter_truth')
                ? 'The cloning machine. Hector failed to mention the death ray.'
                : 'Some kind of teleportation device?'
        },
        ...
    });

    return hotspots;
}
```

**For rooms where puzzles aren't implemented yet**, hotspots can start simple with no conditionals. Add state conditionals when wiring up the puzzle logic for that room. Don't add speculative conditionals for puzzles that aren't built yet.

**Mid-visit hotspot updates:** Rooms where state changes while the player is present (e.g., deploying a ladder, catching Hector's body) should declare `relevantFlags` in their room data. RoomScene automatically sets up listeners and calls `refreshHotspots()` when these flags change:

```javascript
TSH.Rooms.backyard = {
    // ... room data ...
    relevantFlags: ['clock.ladder_deployed', 'clock.has_clock'],
    // When either flag changes, hotspots are automatically recreated
    // to reflect new state (ladder appears, clock disappears, etc.)
};
```

The `refreshHotspots()` method recreates hotspots, pickup overlays, and debug overlay (if visible) without reloading the entire room. This allows for immediate visual feedback when puzzles progress.

**What can change per hotspot:**
| Property | Example |
|----------|---------|
| Existence | TV hotspot gone after player steals it |
| Name | "Teleporter" → "Cloning Device" |
| Examine text | Different description after learning the truth |
| Available actions | "Take" only available when alien is on roof |
| Position | Clock on wall → clock on floor after falling |

**Writing Hotspot Responses:**

All responses should follow Nate's conversational voice. See CREATIVE_BIBLE.md for full voice guidelines.

---

## 3.2 When to Use Each Pattern (Decision Tree)

Before implementing hotspot behavior, choose the right approach based on what needs to change:

### Use State-Driven Hotspots (`getHotspotData()`) When:

✅ **Hotspot needs different properties based on game state**
- Pickup items should only be available after certain conditions
- Different verbs/interactions available in different states
- Hotspot name, position, or available actions change

✅ **Hotspot should appear/disappear based on flags**
- Spring only visible when electrical panel is open
- Ladder only available after returning borrowed item
- TV hotspot removed after player takes it

✅ **Same hotspot ID, different behavior**
- "Teleporter" becomes "Cloning Device" after learning truth
- Clock on wall vs. clock on floor after falling
- Door locked vs. unlocked based on keycard

**Example:**
```javascript
getHotspotData(height) {
    const hotspots = [ /* static hotspots */ ];

    // Conditional pickup - only available after flag is set
    if (TSH.State.getFlag('clock.returned_borrowed_item')) {
        hotspots.push({
            id: 'ladder',
            giveItem: 'ladder',
            pickupFlag: 'clock.has_ladder',
            removeAfterPickup: true
        });
    } else {
        hotspots.push({
            id: 'ladder',
            responses: { action: "Earl won't let me borrow it yet." }
        });
    }

    return hotspots;
}
```

### Use State-Based Dialogue (`@state` annotations) When:

✅ **Only dialogue text changes, not the hotspot behavior**
- Same hotspot, same action, different response text
- Multiple dialogue variants based on inventory or flags
- "I'll take one" vs. "One is enough" (before/after taking scalpel)

**Example:**
```javascript
// @state knife_block: default, has:scalpel
{
    id: 'knife_block',
    responses: {
        action: "I'll just take one."  // Becomes variant array after import
    }
}
```

### Use Custom Action Functions When:

✅ **Multi-step sequences with delays/animations**
- Character walks, speaks, plays animation, sets flag
- Cutscenes that require temporal coordination
- Async/await sequences (when system supports it)

✅ **Complex logic that can't be expressed declaratively**
- Calculations or conditional branching mid-sequence
- Dynamic dialogue based on multiple state checks
- Logic that requires reading multiple flags/items

✅ **Need to coordinate multiple systems**
- NPC movement + dialogue + audio + scene changes
- Physics interactions or tween sequences
- Complex puzzle mechanics spanning multiple hotspots

**Example:**
```javascript
TSH.Actions.complex_sequence = async function(scene, hotspot, item) {
    await scene.walkTo(300);
    await scene.showDialog("Let me try this...");
    await scene.playAnimation('use_item');
    TSH.State.setFlag('puzzle.sequence_triggered', true);
    scene.removeHotspot(hotspot.id);
};
```

### ❌ DO NOT Use Custom Action Functions When:

- State-driven hotspots can handle it (conditional properties)
- You're just checking a flag to decide pickup behavior
- The behavior can be expressed as room data
- Only dialogue changes, not the action itself

**Rule of Thumb:** If you can describe the behavior as "if flag X, hotspot has properties Y, else properties Z" → use `getHotspotData()`, not custom actions.

---

## 3.3 NPC Sprites

All NPCs use custom sprite artwork loaded from PNG files.

**Pattern:**
```javascript
npcs: [
    {
        id: 'earl',
        name: 'Earl',
        sprite: 'earl_placeholder',      // Loaded from assets/sprites/
        position: { x: 920, y: 0.82 },
        heightRatio: 1.15,                // Relative to Nate's height
        interactX: 920,
        interactY: 0.82
    }
]
```

**Key Points:**
- Sprites are loaded in `BaseScene.js` during preload
- `heightRatio` scales the sprite relative to Nate's height (camera zoom adjusted)
- Sprite depth is controlled by `depth` property or auto-calculated from Y position
- Add lighting sources in room's `lighting.sources[]` to illuminate NPCs

**NPCs with Sprite Artwork:**
| NPC | Sprite | Room |
|-----|--------|------|
| Hector | hector_placeholder.png | laboratory.js |
| Earl | earl_placeholder.png | earls_yard.js |
| Frank | frank_placeholder.png | basement.js |
| Harry | harry_placeholder.png | alien_room.js |

**Hotspot for NPC Interaction:**
NPCs defined in the `npcs` array are automatically interactive. For additional hotspot customization, add to the `hotspots` array with matching coordinates.

---

## 3.3A Player Direction and Sprite Flipping

**Critical:** Player direction must be controlled using `playerSprite.setFlipX()` consistently across both spawn and movement systems.

**Why this matters:**
- RoomScene handles spawn direction when entering rooms
- BaseScene's `walkTo()` handles direction during movement
- Both systems must use the same flip method to avoid conflicts

**Implementation:**
```javascript
// CORRECT - RoomScene spawn handling
if (spawnDirection && this.playerSprite && this.playerSprite.setFlipX) {
    if (spawnDirection === 'left') {
        this.playerSprite.setFlipX(true);   // Flip sprite horizontally
    } else if (spawnDirection === 'right') {
        this.playerSprite.setFlipX(false);  // Normal orientation
    }
}

// CORRECT - BaseScene walkTo handling
if (targetX < this.player.x) {
    this.playerSprite.setFlipX(true);   // Walking left
} else {
    this.playerSprite.setFlipX(false);  // Walking right
}
```

**The current pattern uses `setFlipX()` consistently in both spawn and movement to prevent sprite flip conflicts (commit a7fdf55).**

**Spawn Direction Property:**
- The optional `direction` property in spawns controls which way Nate faces when entering the room
- Valid values: `'left'`, `'right'`, or omit (both `'right'` and omitting are equivalent - default right-facing)
- Used primarily when entering from the opposite direction (e.g., entering from the right side of the room should face left)
- Implemented via `playerSprite.setFlipX()` for consistency with movement system

---

## 3.4 Scene Transition Cleanup (Critical)

**Problem:** When using `scene.start()` to transition between rooms, Phaser reuses the same scene instance. Interactive objects (hotspot zones, exit zones) and pending callbacks from the previous room can persist, causing:
- Old hotspots remaining clickable in the new room
- Hotspot labels from old rooms appearing
- WalkTo callbacks executing actions on stale hotspots
- Room reloading loops

**Solution:** RoomScene implements `cleanupPreviousRoom()` called at the very start of `create()`:

```javascript
cleanupPreviousRoom() {
    // Cancel ALL tweens (prevents stale walkTo callbacks)
    if (this.walkTween) {
        this.walkTween.stop();
        this.walkTween = null;
    }
    this.tweens.killAll();
    this.isWalking = false;

    // Clean up hotspots (from BaseScene)
    this.cleanupHotspots();

    // Clean up exit zones
    if (this.exitZones) {
        this.exitZones.forEach(zone => {
            zone.disableInteractive();
            zone.removeAllListeners();
            zone.destroy();
        });
    }
    this.exitZones = [];

    // Clean up NPC sprites, pickup overlays, layers, player
    // ... (destroy and clear arrays/objects)
}
```

**BaseScene.cleanupHotspots():**
```javascript
cleanupHotspots() {
    this.hotspots.forEach(hotspot => {
        if (hotspot.zone) {
            hotspot.zone.disableInteractive();  // Remove from input manager
            hotspot.zone.removeAllListeners();
            hotspot.zone.destroy();
        }
    });
    this.hotspots = [];
    this.currentHoveredHotspot = null;
}
```

**Additional Safeguards:**
1. **Stale hotspot validation** in `setCrosshairHover()` and `handleDesktopPointerDown()` - reject hotspots not in current room's list
2. **Stale action rejection** in `executeAction()` - validates hotspot belongs to current room before executing
3. **Try-catch in cleanup** - handles zones already in destroyed state during transitions

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
// Always returns a result object - never null
const result = TSH.Combinations.executeCombine('candle', 'matches');
// result = { success: true/false, dialogue: "...", sfx: "item_combine", consumes?: [...], produces?: "..." }

// Check if recipe exists without executing
TSH.Combinations.hasRecipe('candle', 'matches')  // → true/false
```

Each recipe specifies what's consumed, what's produced, what flags are set, what Nate says, and optionally a custom sound effect.

**Recipe fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `consumes` | Yes | Array of item IDs to remove from inventory |
| `produces` | No | Item ID to add to inventory |
| `dialogue` | Yes | What Nate says on success |
| `setFlags` | No | Flags to set when combination happens |
| `sfx` | No | Sound effect on success (default: `'item_combine'`) |
| `condition` | No | Function that must return true for combination to work |
| `failDialogue` | No | What Nate says if condition fails |
| `sfxFail` | No | Sound effect on condition fail (default: `'item_fail'`) |

**Event-driven dialog:** UIScene emits `TSH.State.emit('showDialog', { text })` after combinations. BaseScene listens and displays the dialog. This keeps UIScene decoupled from BaseScene.

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

3. **Register the item in the debug panel** — Add the item ID to the appropriate category in `src/scenes/DebugPanel.js`:

```javascript
// ── Inventory item groups ────────────────────────────────────────────
const ITEM_GROUPS = {
    'General': ['help_wanted_ad', 'crowbar', 'matches', 'candle', 'lit_candle', 'damage_report'],
    'Lab / Hector': ['keycard', 'lab_coat', 'dusty_book'],
    'Clock': ['broken_moon_shoes', 'spring', 'spring_2', 'satellite_shoes', 'repaired_shoes', 'ladder', 'borrowed_item', 'scalpel', 'clock'],
    'Power': ['padlock', 'monkey', 'fuse'],
    'Screen': ['tv_guide', 'wrench', 'tv'],
    'Brain': ['brain', 'trophy_item_1', 'trophy_item_2', 'trophy_assembled', 'spray_paint', 'trophy_painted', 'sharpie', 'fake_trophy', 'goggles', 'hector_disguise'],
    'Finale': ['mirror']
};
```

**Why this matters:** Items not listed in `ITEM_GROUPS` won't appear in the F9 debug panel's Inventory tab and won't generate pickup events in the Events log. Always add new items to the appropriate puzzle category.

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
        continueFrom: ['franks_room', 'hallway'],
        // Pause audio (save position) when going to these rooms
        pauseIn: ['second_floor']
    }
}
```

**Behavior:**
- Music auto-loops
- If same track already playing from a `continueFrom` room, it continues seamlessly
- Unused ambient channels are automatically stopped when entering a room
- Audio files are preloaded during scene preload phase

**Audio Persistence (`pauseIn`):**
When leaving a room to one listed in `pauseIn`, the audio position is saved. When returning, playback resumes from that exact position instead of restarting.

```javascript
// Example: alien_room audio persists when visiting second_floor
audio: {
    music: { key: 'alien_theme', volume: 0.25 },
    layers: [{ key: 'tv_theme', channel: 'ambient', volume: 1.0 }],
    continueFrom: ['second_floor'],
    pauseIn: ['second_floor']  // Save position when going to second_floor
}
```

This creates seamless audio continuity for rooms the player frequently moves between.

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

## 9. Entity States

Tracked as string enums in `TSH.State`. Non-NPC objects (like the generator) can also have tracked states using the same API.

| Entity | Valid States |
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

tools/
├── export_dialogue.js              # Dialogue export script (Deno)
└── import_dialogue.js              # Dialogue import script (Deno)
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
- Don't put dialogue strings inside scene classes — dialogue is authored in `TSH_Hotspot_Dialogue.xlsx` and exported/imported via the dialogue pipeline (§23). Room data files contain the runtime copy.
- Don't hardcode dialogue in action functions — use `scene.parseResponse(hotspot.useResponse)` to read dialogue from spreadsheet (§3, lines 459-472). Action functions should handle game logic only; dialogue comes from room data populated by import script.
- Don't hardcode puzzle logic inside hotspot handlers (use action functions)
- Don't create separate CSS/JS files — this is a single-page game
- Don't write placeholder or AI-generated dialogue text for hotspots or items — use empty strings and let Chris author dialogue in the spreadsheet (§23)

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
- **Long-press item (300ms)**: Pick up item as cursor for dragging
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
- **Click on screen edge exit**: Run to exit for faster transitions (750 px/s)
- **Click and hold**: Continuous running toward cursor
- Walkable area constrains movement (polygon or minY/maxY bounds)

**Hotspot Interaction Position Best Practices:**
- `interactX` and `interactY` define where Nate walks before interacting with the hotspot
- These should be set to accessible walkable positions in front of the hotspot
- For precision: Use debug mode coordinate display to find exact positions that feel natural
- For exits/transitions: Position should be at the transition point (e.g., at the edge for screen exits, at the door for door hotspots)
- Test in-game to ensure Nate doesn't walk to awkward positions or clip through objects

### Dialogue Display
- **Font**: LucasArts SCUMM Solid (35px desktop, 60px mobile)
- Speech bubble appears above Nate's head
- When inventory is open, dialog appears at top of screen via UIScene's dialog overlay (above inventory panel)
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
- Movement and world interactions re-enable

**Dialogue Flow:**
1. Player clicks dialogue option
2. Hero speaks the line (speech bubble above hero)
3. NPC responds (speech bubble above NPC)
4. New dialogue options appear
5. Repeat until player chooses exit option

---

## 17. Mobile Optimization

### Touch Targets
- All interactive UI: Minimum 44px (Apple guidelines)
- Inventory items: Comfortable tap size with spacing

### Responsive Scaling
- Game scales from 320px to 1600px viewport width
- Use Phaser.Scale.FIT with CENTER_BOTH
- Test on actual mobile devices, not just desktop resize

### Mobile Detection
- **Standard method:** `window.matchMedia('(pointer: coarse)').matches`
- This checks if primary input is touch (not just touch-capable)
- Correctly identifies touchscreen laptops as desktop when using mouse
- Set in `BaseScene.create()` as `this.isMobile`
- UIScene (which doesn't extend BaseScene) sets its own `this.isMobile` using the same `matchMedia` check

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

## 20. Debug Overlay

The debug overlay provides coordinate display and visual aids for room development. Toggle with the backtick (`) key.

### Features

**Visual Overlays:**
- Mouse coordinates (world, screen, and proportional Y)
- Click logging to console with hotspot-ready format
- Hotspot zone visualization (colored boxes/polygons)
- Walkable area polygon with vertex numbers
- Spawn point markers
- Exit zone visualization

**Implementation:**
- Defined in `RoomScene.js` → `setupDebugOverlay()`
- Toggle method: `toggleDebugOverlay()`
- Property: `this.debugEnabled` (inherited from `BaseScene`)

### Action Blocking

**When debug mode is active, all player actions are disabled:**

| Blocked Action | Entry Points |
|----------------|--------------|
| Walking | `handleBackgroundClick()`, `runToPointer()`, `handleBackgroundPress()` |
| Hotspot interactions | `handleHotspotPress()`, `examineHotspot()`, `executeAction()` |
| Using items on hotspots | `useItemOnHotspot()` |
| Scene transitions | Exit zone `pointerdown` handlers |
| Inventory (open/close) | `toggleInventory()` |
| Settings menu (open/close) | `openSettingsMenu()`, `closeSettingsMenu()` |
| Item selection/deselection | `selectItem()`, `deselectItem()` |

**Implementation Pattern:**
```javascript
functionName() {
    if (this.debugEnabled) return;
    // ... rest of function
}
```

### Usage

1. Press ` (backtick) to toggle debug mode
2. Move mouse to see coordinates
3. Click to log coordinate data to console
4. All player actions are blocked while active
5. Press ` again to resume normal gameplay

---

## 21. Testing Checklist

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

## 22. Development Workflow

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

---

## 23. Dialogue Editing System

All hotspot dialogue is authored in `TSH_Hotspot_Dialogue.xlsx` and imported into the game. The spreadsheet is the **source of truth** for what Nate says.

### Spreadsheet Structure

| Tab | Contents |
|-----|----------|
| Instructions | Format reference (cell tags, state column rules, fallback chain) |
| Flags Reference | All game flags exported from `GameState.js` (Category, Flag Name, Description) |
| Global Defaults | 3 global action defaults (Examine, Use, TalkTo) + per-item Examine and Fail Default |
| Item Combinations | One row per unique item pair. Pre-populated with recipe dialogue from `combinations.js` |
| Room tabs (×13+) | One sheet per room, one row per hotspot |

**Room tab columns:** `Hotspot | State | Examine | Use | TalkTo | [one column per inventory item] | Hotspot ID`

- Item columns contain what Nate says when **using that item ON the hotspot**
- Hotspot ID (last column) maps back to the hotspot's `id` in room data

### Fallback Chains

The game uses consistent 3-level fallback chains for all interaction types. The spreadsheet controls ALL dialogue through these chains.

#### Item on Hotspot Interactions

When the player uses an inventory item on a hotspot:

1. **Specific interaction** — Check `itemInteractions[hotspot][item]` in room data (populated from spreadsheet)
2. **Item Fail Default** — Check item's Fail Default in Global Defaults tab
3. **Global Use default** — Fall back to Global Use default

Example: Using Candle on Window
- No specific interaction defined → skip to level 2
- Candle has blank failDefault → skip to level 3
- Shows "Hmmmm no." (Global Use default)

#### Direct Hotspot Actions (USE, EXAMINE, TALK TO)

When the player left-clicks (USE) or right-clicks (EXAMINE) a hotspot:

1. **Hotspot response** — Check hotspot's Use/Examine/TalkTo response from spreadsheet
2. **Global default** — Fall back to Global Use/Examine/TalkTo default

Example: Left-clicking Window with no Use response defined
- Hotspot Use response is blank → skip to level 2
- Shows "Hmmmm no." (Global Use default)

#### Item on Item Combinations

When the player combines two inventory items:

1. **Recipe dialogue** — Check `TSH.Combinations` for explicit combination recipe
2. **Held item Fail Default** — Check the **held/dragged item's** Fail Default
3. **Global Use default** — Fall back to Global Use default

Example: Using Matches on Help Wanted Ad (no recipe)
- No combination recipe → skip to level 2
- Matches has failDefault: "Surprisingly, I don't think lighting that on fire will help"
- Shows Matches' failDefault

Example: Using Candle on Help Wanted Ad (no recipe)
- No combination recipe → skip to level 2
- Candle has blank failDefault → skip to level 3
- Shows "Hmmmm no." (Global Use default)

**Key principle:** The **active/held item** provides the failure context. The item being used determines what Nate says when it doesn't work.

### Cell Conventions

| Cell Content | Meaning |
|--------------|---------|
| (blank) | `""` in code — fallback chain handles at runtime |
| plain text | That exact string in code |

Every cell is a 1:1 mapping to a code value. No interpretation layer, no special tags.

### State Column

Enables multiple dialogue variants for a single hotspot response based on game state. Controlled by `@state` annotations in room files.

**In the room file, add an annotation:**
```javascript
// @state knife_block: default, has:scalpel
{
    id: 'knife_block',
    // ... hotspot definition
}
```

**In the spreadsheet, you'll see multiple rows:**
| Hotspot | State | Examine | Use |
|---------|-------|---------|-----|
| Knife Block | default | ... | I'll just take one. |
| Knife Block | has:scalpel | ... | One is enough. |

**Supported state syntax:**
- `default` — Always matches (fallback, should be last)
- `has:item_id` — Player has the item in inventory
- `!has:item_id` — Player does NOT have the item
- `flag:flag_name` — Game flag is set to true
- `!flag:flag_name` — Game flag is NOT set

**Runtime behavior:** The game evaluates conditions top-to-bottom and shows the first matching variant. Conditional states are automatically sorted before `default` during import.

**Adding new states:** Update the `@state` annotation in the room file, re-run export, and new rows appear in the spreadsheet for editing.

### Export Script

`tools/export_dialogue.js` — run with Deno:

```
deno run --allow-read --allow-write --allow-env --allow-net tools/export_dialogue.js
```

- Full overwrite of the spreadsheet every run (except Item Combinations tab)
- Dynamically picks up new rooms, hotspots, items, and flags
- **Preserves** hand-written dialogue in the Item Combinations tab on re-run
- Overwrites all other tabs from code data

### Workflow

1. **Claude Code** re-runs the export script whenever hotspots, items, or flags change
2. **Chris** edits dialogue directly in the spreadsheet
3. **Import script** reads the spreadsheet and writes dialogue back into room data files

**New hotspot rule:** When creating new hotspots, use empty strings (`""`) for all dialogue responses (look, action, talk). The export script creates the spreadsheet row; Chris writes the dialogue.

**New item rule:** When creating new inventory items, use empty strings for description. The fallback chain provides default lines until specific dialogue is written.

**No AI dialogue:** Claude Code must never generate placeholder dialogue text. Empty strings only.

### Runtime Fallback Implementation

The dialogue fallback system is implemented in three key locations:

**Item on Hotspot:** `src/scenes/RoomScene.js` → `useItemOnHotspot()` method
- Checks specific `itemInteractions` entry
- Checks item's `failDefault`
- Falls to `TSH.Defaults.use`

**Direct Hotspot Actions:** `src/scenes/RoomScene.js` → `executeAction()` method override
- Checks `hotspot.useResponse` / `lookResponse` / `talkResponse`
- Falls to `TSH.Defaults.use` / `examine` / `talkTo`

**Item Combinations:** `src/data/items/combinations.js` → `executeCombine()` method
- Checks for recipe in `combinations` object
- Checks held item's `failDefault`
- Falls to `TSH.Defaults.use`

**Ignored at runtime:**
- Per-hotspot defaults (`itemInteractions[hotspot].default`)
- Room-level defaults (`itemInteractions._default`)
- Hardcoded fallback strings (replaced with spreadsheet defaults)

These may exist in older room data files but are no longer checked by the game.

### Scope Boundary

The spreadsheet contains **ONLY dialogue** — what Nate says. It does not contain:
- Game logic or puzzle mechanics
- State changes, flag setting, or item transfers
- Action triggers, transitions, or sound effects

All puzzle logic stays in code (`actionTrigger`, `giveItem`, `setFlags`, etc.).

### Import Script

`tools/import_dialogue.js` — run with Deno:

```
deno run --allow-read --allow-write --allow-env --allow-net tools/import_dialogue.js
```

- Reads `TSH_Hotspot_Dialogue.xlsx` and writes ALL cells back to room data files (blank → `""`, text → that string)
- Compares spreadsheet values against current code values — only writes files where dialogue actually changed
- Logs which files were updated and how many lines changed
- Does NOT modify game logic, positions, drawing code, or anything structural — only string literal values

---

## 24. Plain Text Dialogue System

The plain text dialogue system stores NPC conversations in `.txt` files located in `src/data/dialogue/` (one file per NPC). Files are parsed at runtime via `TSH.DialogueLoader` and integrate with the existing conversation system. This provides an alternative to inline dialogue trees defined in scene files.

**Format Reference:** See `src/data/dialogue/README.md` for complete syntax specification and examples.

### Loading Dialogue

```javascript
// Load dialogue at runtime (async)
const dialogue = await TSH.DialogueLoader.load('earl');
this.enterConversation(npcData, dialogue, 'earl');

// OLD way (inline dialogue trees still supported):
const dialogue = this.getEarlDialogue();
this.enterConversation(npcData, dialogue);
```

### Key Features

| Feature | Description | Example |
|---------|-------------|---------|
| Multi-line NPC responses | NPC speaks multiple consecutive lines | `earl: First line\nearl: Second line` |
| Once-choices | Options disappear after selection | `# once` annotation |
| Conditional intros | Intro sequences change based on game state | `# requires: asked:met_earl` |
| Item actions | Add/remove items on dialogue choice | `# add: key`, `# remove: ladder` |
| Conditions | Show options based on flags/items | `# requires: story.found_hector, has:ladder` |

### System Components

**TSH.DialogueParser** — Parses `.txt` files into dialogue tree objects. Handles node definitions, option parsing, conditions, actions, and routing. Validates syntax and provides error messages.

**TSH.DialogueLoader** — Loads dialogue files from `src/data/dialogue/` via fetch API and caches parsed trees for performance. No re-parsing on subsequent conversations with the same NPC.

**Once-choice tracking** — Persists in GameState under `onceChoices` object. Survives save/load cycles. Tracks by `npcId:nodeKey:optionIndex`.

**Starting node selection** — Uses the first node in the dialogue file (insertion order). The calling code is responsible for loading the appropriate dialogue file based on NPC state if needed (e.g., different files for different NPC states).

### Backwards Compatibility

- Inline dialogue trees (defined in scene files) continue to work unchanged
- `npcId` parameter is optional (defaults to null)
- Single-string `npcResponse` automatically wrapped in array
- Legacy `setFlag` property still supported
- Existing conversations in LaboratoryScene, AtticScene, etc. remain functional

### File Structure

```
src/data/dialogue/
├── README.md           # Format specification
├── parser.js           # Parser module
├── loader.js           # Loader module
├── earl.txt            # Earl's dialogue
├── test_npc.txt        # Test dialogue
└── ...                 # Other NPC dialogue files
```

### Notes

- Dialogue files use plain text format documented in README.md
- Parser validates flags and warns on unknown flags
- Loader caches parsed trees for performance
- Fetch requires web server (GitHub Pages or local server)
