# Dialogue File Format

This directory contains NPC dialogue files in plain text format. Each file represents one NPC's conversation tree.

## File Structure

```
=== node_name ===
# npc_state: state_name
# id: label
# default
# requires: condition1, condition2

- Option text
# requires: story.found_hector, has:ladder, !story.talked_to_earl
# id: asked_about_key
# set: flag_name
# add: item_id
# remove: item_id
# once
nate: What the player says
earl: NPC's first response line
earl: NPC's second response line
> next_node_name

- Another option
nate: Different line
> END
```

## Syntax Reference

### Node Definition
- `=== node_name ===` - Defines a conversation node
- `# npc_state: state_name` - (Optional) Marks this node as the starting node when NPC is in specified state
- `# id: label` - (Optional) Tags this node with a persistent label. The label is marked as visited when the player enters this node. Can be checked with `asked:label` in conditions.
- `# default` - (Optional) Marks this node as a candidate starting node. The first `# default` node whose `# requires:` condition passes is used as the starting node. If no default passes, the first non-default node is used instead.
- `# requires: conditions` - (Optional, node-level) Conditions that must pass for this node to be selected as a `# default` starting node.

### Options
- `- Option text` - Starts a player dialogue choice (bullet point)
- Multiple options can exist in one node

### Dialogue Lines
- `speaker_id: line` - Dialogue line (speaker ID must be lowercase: `nate:`, `earl:`, etc.)
- Multiple consecutive lines from the same NPC create a multi-line response
- Each NPC line will be shown one at a time in sequence

### Routing
- `> node_name` - Jump to another node after this option
- `> END` - Exit conversation

### Annotations (placed after option, before dialogue)

#### Conditions (all must pass)
- `# requires: condition1, condition2, condition3`
  - `flag` - Flag must be true (supports dot notation: `story.found_hector`)
  - `!flag` - Flag must be false
  - `has:item` - Must have item in inventory
  - `!has:item` - Must NOT have item in inventory
  - `npc_state:npc_id:state` - NPC must be in specified state (e.g., `npc_state:alien:watching_tv`)
  - `visited:room` - Must have visited room (e.g., `visited:laboratory`)
  - `asked:label` - A node or option with `# id: label` must have been visited
  - `!asked:label` - A node or option with `# id: label` must NOT have been visited

#### Actions
- `# set: flag_name` - Set flag when option is chosen (supports dot notation)
- `# add: item_id` - Add item to inventory when chosen
- `# remove: item_id` - Remove item from inventory when chosen
- `# once` - Option disappears permanently after being chosen once
- `# id: label` - Tags this option with a persistent label. Marked as visited when the player chooses this option. Can be checked with `asked:label`.

## Examples

### Basic Conversation
```
=== start ===

- Hello
nate: Hi there!
earl: Well hello yourself.
> END
```

### Multi-line NPC Response
```
=== start ===

- Tell me a story
nate: Got any good stories?
earl: Oh boy, do I ever.
earl: Let me tell you about the time I found a UFO in my barn.
earl: It was a Tuesday, I think.
> END
```

### Conditional Options
```
=== start ===

- Ask about the key
# requires: story.knows_about_key, !has:rusty_key
nate: Where's that key you mentioned?
earl: I left it in the shed.
> END

- Use the key
# requires: has:rusty_key
nate: I have your key right here.
earl: Thanks for finding it!
# remove: rusty_key
# set: story.returned_key
> END
```

### Once Options
```
=== start ===

- Ask about the weather
# once
nate: Nice weather today.
earl: Sure is! Perfect day for farming.
> start

- Ask about crops
nate: How are your crops doing?
earl: Pretty well, thanks for asking.
> start

- Goodbye
nate: See you later.
> END
```

### State-Based Starting Nodes
```
=== start ===
# npc_state: behind_fence

- Talk over fence
nate: Hey Earl!
earl: Can't talk long, got work to do.
> END

=== after_fence_down ===
# npc_state: at_barn

- Approach Earl
nate: Got a minute now?
earl: Sure thing, come on over!
> main_conversation
```

### Default Nodes with ID Tracking
```
=== start ===
# id: met_earl

- Hi! My name is Nate.
nate: Hi! I'm Nate.
earl: Nice to meetcha!
> END

=== main ===
# default
# requires: asked:met_earl

- How's it going?
nate: How's it going, Earl?
earl: Can't complain!
> END
```

On first visit, `start` is used (no default passes because `met_earl` hasn't been marked yet). When the player enters the `start` node, `met_earl` gets marked. On subsequent visits, the `main` node's `# default` condition passes (`asked:met_earl` is true), so `main` is used as the starting node.

## Parser Robustness

- Unparseable lines are skipped with a console warning
- Empty NPC dialogue lines (e.g., `earl:` with no text) are skipped
- Options with no dialogue lines are valid (show option text, skip to navigation)
- Options with no `>` routing loop back to the current node
- A malformed node won't prevent other nodes from loading
- `showConversationLine()` also skips empty/null text as a safety net

## Notes

- All dialogue strings should be written by Chris in the spreadsheet, then transferred to these files
- Speaker IDs must be lowercase (enforced by parser)
- Blank lines are ignored
- `# id:` labels persist across conversations and survive save/load
