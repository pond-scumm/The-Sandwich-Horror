# Testing the Dialogue System

## Quick Start Testing

### 1. Test Parser in Browser Console

Open the game in a browser and run:

```javascript
// Test loading and parsing
const tree = await TSH.DialogueLoader.load('test_npc');
console.log('Parsed dialogue tree:', tree);

// Inspect a specific node
console.log('Start node:', tree.start);

// Check option structure
console.log('First option:', tree.start.options[0]);
```

Expected output structure:
```javascript
{
  start: {
    options: [
      {
        text: "Simple greeting",
        heroLine: "Hello there!",
        npcResponse: ["Well hello to you too!"],
        exit: true
      },
      // ... more options
    ]
  },
  // ... more nodes
}
```

### 2. Test Multi-line NPC Responses

Look for the "Multi-line response" option in the parsed tree:

```javascript
const multiLineOption = tree.start.options.find(opt => opt.text === "Multi-line response");
console.log('NPC responses:', multiLineOption.npcResponse);
// Expected: Array with 3 strings
```

### 3. Test Conditions

```javascript
const conditionalOption = tree.start.options.find(opt => opt.text === "Conditional option with flag");
console.log('Has condition?', conditionalOption.condition !== undefined);

// Test the condition function
const scene = { getFlag: (flag) => false, hasItem: () => false };
console.log('Condition result (should be false):', conditionalOption.condition(scene));
```

### 4. Test Actions

```javascript
const actionOption = tree.start.options.find(opt => opt.text === "Multiple flags and actions");
console.log('Actions:', actionOption.actions);
// Expected: { setFlags: [...], addItems: [...], removeItems: [...], once: false }
```

### 5. Test Once-Choice Tracking

```javascript
// Initially should be false
console.log('Has chosen once?', TSH.State.hasChosenOnce('test_npc', 'start', 4));

// Mark as chosen
TSH.State.markOnceChosen('test_npc', 'start', 4);

// Should now be true
console.log('Has chosen once?', TSH.State.hasChosenOnce('test_npc', 'start', 4));
```

### 6. Test NPC State-Based Starting Node

```javascript
// Set Earl to behind_fence state
TSH.State.setNPCState('earl', 'behind_fence');

// Create a mock scene
const mockScene = {
    _selectStartingNode(tree, npcId) {
        if (!npcId) return 'start';
        const npcState = TSH.State.getNPCState(npcId);
        if (!npcState) return 'start';
        for (const [nodeKey, node] of Object.entries(tree)) {
            if (node.npcState === npcState) return nodeKey;
        }
        return 'start';
    }
};

const startNode = mockScene._selectStartingNode(tree, 'earl');
console.log('Selected starting node:', startNode); // Should be 'state_test' if Earl is behind_fence
```

### 7. Test in Actual Conversation

To test with a real NPC conversation, you'll need to modify a scene to use the loader:

```javascript
// In a scene file (e.g., earls_yard.js), replace:
const dialogue = this.getEarlDialogue();
this.enterConversation(npcData, dialogue);

// With:
const dialogue = await TSH.DialogueLoader.load('earl');
this.enterConversation(npcData, dialogue, 'earl');
```

## Testing Checklist

- [ ] Parser loads test_npc.txt without errors
- [ ] Dialogue tree structure is correct
- [ ] Multi-line NPC responses are arrays
- [ ] Conditions are functions that evaluate correctly
- [ ] Actions object contains correct arrays
- [ ] Once-choice tracking works (hasChosenOnce/markOnceChosen)
- [ ] Starting node selection based on NPC state works
- [ ] Backwards compatibility: inline dialogue trees still work
- [ ] Backwards compatibility: single-string npcResponse still works
- [ ] Backwards compatibility: legacy setFlag property still works

## Common Issues & Solutions

### Issue: "Failed to load dialogue"
**Solution:** Make sure you're running from a web server (not file://). Use:
```bash
python -m http.server 8000
# or
python3 -m http.server 8000
```
Then open http://localhost:8000

### Issue: Options not filtering correctly
**Solution:** Check that conditions are comma-separated without spaces around operators:
```
# requires: story.found_hector, !story.talked_to_earl  ✓
# requires: story.found_hector,!story.talked_to_earl   ✓
# requires: story.found_hector, ! story.talked_to_earl ✗ (space after !)
```

### Issue: Once-choices not persisting
**Solution:** Make sure you're passing the `npcId` parameter to `enterConversation()`:
```javascript
this.enterConversation(npcData, dialogue, 'earl'); // ✓ with npcId
this.enterConversation(npcData, dialogue);         // ✗ without npcId
```

### Issue: NPC state node not selected
**Solution:** Verify:
1. NPC state is set correctly: `TSH.State.getNPCState('earl')`
2. Node has matching annotation: `# npc_state: behind_fence`
3. NPC ID is passed to enterConversation: `enterConversation(npcData, dialogue, 'earl')`

## Example Test Scenario

Complete test flow for once-choices:

```javascript
// 1. Load dialogue
const tree = await TSH.DialogueLoader.load('test_npc');

// 2. Start conversation (in a scene)
this.enterConversation(npcData, tree, 'test_npc');

// 3. Select the "Nice weather today" option (marked with # once)
// - Option should be visible initially
// - After selecting, it should disappear from the options list
// - After save/load, option should still be gone

// 4. Verify in console
console.log('Once-choices:', TSH.State._state.onceChoices);
// Should show: { "test_npc:start:4": true }
```

## Performance Testing

Test dialogue caching:

```javascript
// First load (should fetch from server)
console.time('First load');
const tree1 = await TSH.DialogueLoader.load('test_npc');
console.timeEnd('First load');

// Second load (should use cache)
console.time('Cached load');
const tree2 = await TSH.DialogueLoader.load('test_npc');
console.timeEnd('Cached load');

// Verify same object
console.log('Same reference?', tree1 === tree2); // Should be true
```

## Debug Mode

Enable detailed conversation logging:

```javascript
// In browser console before starting conversation:
localStorage.setItem('debug_conversation', 'true');

// Then start a conversation and check console for detailed logs
```

All conversation methods already have console.log statements for debugging.
