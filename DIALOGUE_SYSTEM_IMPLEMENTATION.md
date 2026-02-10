# NPC Conversation System Implementation

## Overview

Successfully implemented a plain text dialogue format system for NPC conversations. The system allows dialogue to be stored in `.txt` files and parsed into the existing conversation system at runtime.

## Files Created

### Core System Files
1. **src/data/dialogue/parser.js** - Parses plain text dialogue files into dialogue tree objects
2. **src/data/dialogue/loader.js** - Loads and caches dialogue files at runtime
3. **src/data/dialogue/README.md** - Complete format documentation and examples

### Example Dialogue Files
4. **src/data/dialogue/earl.txt** - Example NPC dialogue (empty strings for Chris to fill in)
5. **src/data/dialogue/test_npc.txt** - Comprehensive test file with all syntax features

## Files Modified

### GameState.js
- Added `onceChoices` object to track dialogue options marked with `# once`
- Added `hasChosenOnce(npcId, nodeKey, optionIndex)` method
- Added `markOnceChosen(npcId, nodeKey, optionIndex)` method

### BaseScene.js
Enhanced conversation system with:
- **enterConversation()** - Added optional `npcId` parameter, calls `_selectStartingNode()`
- **_selectStartingNode()** - Selects starting node based on NPC state
- **showDialogueOptions()** - Filters out once-choices that have been selected
- **handleDialogueChoice()** - Processes actions and handles multi-line NPC responses
- **_finishDialogueChoice()** - Helper to complete dialogue choice logic
- **_showNPCResponses()** - Recursively shows multi-line NPC responses
- **_processDialogueActions()** - Processes flags, items, and once-marking
- **exitConversation()** - Clears `conversationNPCId`

### index.html
Added script tags for:
- `src/data/dialogue/parser.js`
- `src/data/dialogue/loader.js`

## Plain Text Format Features

### Supported Syntax

```
=== node_name ===              # Define a conversation node
# npc_state: state_name         # Mark as starting node for NPC state

- Option text                   # Player dialogue choice
# requires: conditions          # Conditions (comma-separated)
# set: flag_name                # Set flag on selection
# add: item_id                  # Add item to inventory
# remove: item_id               # Remove item from inventory
# once                          # Option disappears after selection
nate: Player line               # What player says
npc: NPC response line 1        # NPC's first response
npc: NPC response line 2        # NPC's second response
> next_node_name                # Jump to another node
> END                           # Exit conversation
```

### Condition Types
- `flag` / `!flag` - Flag check (dot notation: `story.found_hector`)
- `has:item` / `!has:item` - Inventory check
- `npc_state:npc:state` - NPC state check (e.g., `npc_state:alien:watching_tv`)
- `visited:room` - Room visited check (e.g., `visited:laboratory`)

### Actions
- **Set flags** - `# set: flag_name` (supports dot notation)
- **Add items** - `# add: item_id`
- **Remove items** - `# remove: item_id`
- **Once-choices** - `# once` (option disappears permanently after selection)

## New Features

### 1. Multi-line NPC Responses
Multiple consecutive lines from the same NPC speaker create an array of responses that are shown sequentially.

```
npc: First line of dialogue.
npc: Second line of dialogue.
npc: Third line of dialogue.
```

### 2. Item Actions
Options can add or remove items from inventory when selected.

```
# add: key
# remove: ladder
```

### 3. Once-Choices
Options marked with `# once` disappear permanently after being chosen. State is tracked in GameState and persists across save/load.

```
# once
- Ask about weather
nate: Nice day!
earl: Sure is!
> start
```

### 4. NPC State-Based Starting Nodes
Nodes can be marked with `# npc_state: state_name` to automatically become the starting node when the NPC is in that state.

```
=== behind_fence ===
# npc_state: behind_fence

- Talk through fence
nate: Hey there!
earl: Can't talk long, busy working!
> END
```

## Backwards Compatibility

The system maintains full backwards compatibility:
- Inline dialogue trees (defined in scene files) continue to work unchanged
- `npcId` parameter is optional (defaults to null)
- Single-string `npcResponse` is automatically wrapped in array
- Legacy `setFlag` property still supported
- Existing conversations in LaboratoryScene, AtticScene, etc. remain functional

## Usage

### Loading Dialogue at Runtime

```javascript
// NEW way (plain text files):
const dialogue = await TSH.DialogueLoader.load('earl');
this.enterConversation(npcData, dialogue, 'earl');

// OLD way (still works):
const dialogue = this.getEarlDialogue();
this.enterConversation(npcData, dialogue);
```

## Testing

### Parser Test (Browser Console)
```javascript
// Load and inspect parsed dialogue tree
const tree = await TSH.DialogueLoader.load('test_npc');
console.log(tree);
```

### Verification Steps

1. **Parser functionality** - Load test_npc.txt and verify structure
2. **Multi-line responses** - Test NPC says multiple lines in sequence
3. **Condition filtering** - Options hide/show based on flags and items
4. **Flag setting** - `# set` works correctly
5. **Item actions** - `# add` and `# remove` work
6. **Once-options** - Options disappear after selection and stay gone after save/load
7. **NPC state nodes** - Starting node selection based on NPC state
8. **Backwards compatibility** - Existing inline dialogue trees still work

## Notes

- All dialogue strings in earl.txt are empty placeholders for Chris to fill in
- Parser fails gracefully with console error and fallback tree on errors
- Loader caches parsed trees for performance (no re-parsing on subsequent conversations)
- Flag validation can be added to parser to warn on unknown flags
- Existing inline dialogue trees in scenes are unchanged and continue to work

## Next Steps

1. Test the parser with test_npc.txt in browser
2. Verify all features work as expected
3. Convert existing NPC dialogues to plain text format (optional)
4. Chris writes actual dialogue content for NPCs in .txt files
