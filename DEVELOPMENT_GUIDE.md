# Point & Click Adventure Game - Development Guide

## Project Overview
A Monkey Island-style point-and-click adventure game optimized for mobile browsers. Modest scope: 4 rooms, 2-4 NPCs, approximately 1 hour of gameplay. Built with Phaser 3 and HTML5.

---

## Architecture Principles

### Code Structure
- **Use BaseScene class** for ALL shared functionality (player, UI, interactions, dialogue, inventory)
- **Individual room scenes** (GameScene, GardenScene, etc.) extend BaseScene
- Each room scene ONLY defines:
  - Background rendering (`drawRoomName()` method)
  - Hotspot data (positions, interactions, responses)
  - Room-specific lighting
  - Scene transition logic

### Game State Management
- Maintain a **central GameState object** that persists across all scenes
- Store in GameState:
  - `inventory`: array of collected items
  - `selectedItem`: currently selected inventory item
  - `flags`: object tracking puzzle progress (e.g., `chest_unlocked`, `painting_moved`, `key_obtained`)
  - `visitedRooms`: array of rooms player has entered
- Pass GameState through Phaser's registry on scene transitions
- ALL scenes read from and write to this single source of truth

### Data-Driven Configuration
- **Separate data from code**: Store all text content in configuration objects
- Hotspot data structure:
  ```javascript
  {
    x: number,           // hotspot center X
    y: number,           // hotspot center Y
    w: number,           // hotspot width
    h: number,           // hotspot height
    interactX: number,   // where player walks to interact
    interactY: number,   // where player walks to interact
    name: string,        // display name
    lookResponse: string,
    useResponse: string,
    talkResponse: string
  }
  ```
- Keep all dialogue text in data structures at top of scene files for easy editing

---

## Interaction Systems

### Verb Coin System
- **Left-click**: Walk to location
- **Left-click and hold (0.2s) on hotspot**: Reveals verb coin
- **Hold and drag** to action, release to select
- **Three actions**: "Use" (includes Pick Up), "Look At", "Talk To"
- **Right-click**: Open/close inventory
- Verb coin must be **mobile-optimized** with large touch targets

### Movement
- **Single click**: Walk at normal speed
- **Double-click**: Run (2x speed)
- **Click and hold while running**: Continuous running toward cursor
- Character always walks to `interactX/Y` position before showing verb coin
- Walkable area defined by `walkableArea: { minY: percentage, maxY: percentage }`

### Dialogue System
- Speech bubble appears above character
- Multi-sentence dialogue auto-advances with timing
- Click/tap or press period (.) to skip to next sentence
- Dialogue pauses character movement
- Updates position to follow character

### Inventory
- Right-click toggles inventory panel
- Click item in inventory to select it
- Selected item changes cursor
- Right-click again to deselect item
- Inventory persists across scene transitions

---

## Dialogue System

### Conversation Mode
When the player uses "Talk To" on an NPC, the game enters CONVERSATION MODE:

**Conversation Mode Behavior:**
- Character movement is frozen
- Verb coin is disabled
- Cursor becomes a pointer (not crosshair)
- Dialogue choice UI appears in bottom-left corner
- Player can only select dialogue options, not interact with world

**Exiting Conversation:**
- One option is always available to end the conversation ("Goodbye", "That's all", etc.)
- Clicking exit option returns to normal gameplay mode
- Movement, verb coin, and world interactions re-enable

### Dialogue Choice UI
- Display 3-4 dialogue options at a time in bottom-left
- Options should be the hero's actual dialogue (what they'll say), not descriptions
- Track conversation state with flags (e.g., `'asked_about_portal'`, `'scientist_angry'`)
- Options can change/disappear based on:
  - What's already been discussed
  - Puzzle state
  - NPC relationship/mood
  - Story progression

### Conversation Flow
1. Player clicks dialogue option
2. Hero speaks the line (speech bubble above hero)
3. NPC responds (speech bubble above NPC)
4. New dialogue options appear (may be same, different, or fewer options)
5. Repeat until player chooses exit option

### NPC Dialogue Writing
- NPCs should have distinct personalities that contrast with hero's sarcasm
- Scientist: Enthusiastic, absent-minded, earnest (plays off hero's snark)
- Future NPCs: Each should have unique voice and communication style
- Avoid exposition dumps - weave information into character personality
- Include character reactions to hero's sarcasm/attitude

### Dialogue Tree Structure
Store conversation trees as nested objects with state tracking:
```javascript
dialogueTree: {
  initial: [
    { text: "What are you working on?", leads_to: 'about_work', flag: 'asked_about_work' },
    { text: "Nice lab. Very... sciencey.", leads_to: 'compliment' },
    { text: "Goodbye", leads_to: 'exit' }
  ],
  about_work: [
    // Scientist explains, new options appear
  ]
}
```

---

## Hero Character Profile

### Nathaniel "Nate" Barnswallow

**Age:** 20 years old (not even 21 yet)

**Background:**
- High school graduate, self-taught tinkerer
- Interested in obscure, fringe sciences (quantum mechanics, portal technology, weird physics)
- Found a help-wanted ad in an obscure scientific journal
- Came to apply for a job at the laboratory to prove himself and begin his scientific career
- Admires the scientist who placed the ad
- Does NOT know about the portal or specific experiments - just knows there's a job opportunity

**Physical Appearance:**
- Tall, lanky, pencil-necked
- Big bushy green hair (distinctive!)
- Wears blue suit without jacket - just vest over shirt
- Nerdy appearance
- Think: Spike Spiegel's build but not a fighter

**Personality Core:**
- **Hapless wannabe scientist** - eager but inexperienced
- **Naive but unfazed** - ready for anything despite lack of experience
- **Level-headed and even-keeled** - calm even in bizarre/dangerous situations
- **Resourceful and clever** - solves problems with creativity, not brute force
- **Witty with dry, deadpan humor** - observational comedy about absurd situations
- **Kind to people, snarky about situations** - CRITICAL DISTINCTION (see below)
- **Self-deprecating** - can laugh at his own mistakes
- **Unconventional problem-solver** - will bend rules if needed, but not malicious

**CRITICAL: Nate's Humor Style**
Nate is NOT boring or milquetoast! He has plenty of personality and wit.

**What Nate CAN be snarky/funny about:**
- ✅ Absurd situations ("Well. This explains the electricity bill")
- ✅ Strange objects ("Please be decorative. Please be decorative.")
- ✅ The weirdness of his circumstances ("If anything here is sentient, now's the time to speak up")
- ✅ His own predicaments ("Great job, Nate. Real smooth.")
- ✅ Observational humor about the environment
- ✅ Deadpan reactions to chaos

**What Nate should NOT do:**
- ❌ Mock or belittle other PEOPLE
- ❌ Be mean-spirited toward NPCs
- ❌ Cynical dismissal of others' efforts/passions
- ❌ Arrogant superiority over others

**The Key Difference:**
- Snarky about SITUATIONS and OBJECTS = YES
- Cruel to PEOPLE = NO

**Character Influences:**
- Buster Keaton (deadpan reactions to chaos)
- Marty McFly (plucky, out of his depth but adapts)
- Special Agent Dale Cooper (earnest, observant, sees wonder in details)
- Guybrush Threepwood from MI1/CMI (clever underdog, not arrogant)
- Spike Spiegel (cool under pressure, goes with the flow)

**How Nate Reacts:**

*To absurdity/danger:*
- Deadpan, Buster Keaton-style observations
- "Well. This explains the electricity bill."
- "If anything here is sentient, now's the time to speak up. ...Okay good. Just checking."
- "That's either a portal to another dimension or a very impressive light show."

*To puzzles/problems:*
- Curious and methodical, with self-aware commentary
- "Let's see... if I combine these two things... what's the worst that could happen?"
- "I wonder what happens if I try this? Probably nothing good, but let's find out."
- "Okay, Nate. Think. There's got to be a way to..."

*To NPCs:*
- Polite, earnest, genuinely interested (NOT snarky toward people)
- Respectful even when they're eccentric
- "That's... really fascinating, actually."
- Listens without judgment

*To strange/creepy things:*
- Anxious humor and observational wit
- "Beakers, tubes, bubbling liquids, and... is that a brain in a jar? Please be decorative. Please be decorative."
- "I'm choosing to believe that's a prop. For my own sanity."

*To setbacks:*
- Self-deprecating but not defeated
- "Great job, Nate. Real smooth."
- "Well, that didn't work. Let's try something else."

*To success:*
- Modest surprise with a quip
- "Oh! That actually worked. Didn't see that coming."
- "Huh. Not bad for a first try. Or a complete guess."

**Voice/Speaking Style:**
- **Dry humor, not snark** - observational, deadpan
- **Economical with words** - doesn't ramble
- **Self-aware** - acknowledges when he's out of his depth
- **Polite** - even to inanimate objects
- **Curious questions** - genuinely wants to understand things
- **Practical** - focuses on solutions

**What Nate Would Say:**
- ✅ "Well. This explains the electricity bill."
- ✅ "Beakers, tubes, bubbling liquids, and... is that a brain in a jar? Please be decorative."
- ✅ "If anything here is sentient, now's the time to speak up. ...Okay good."
- ✅ "I suppose touching this mysterious coil is the logical next step. What could go wrong?"
- ✅ "This seems like a terrible idea. Let's do it."
- ✅ "I'm not entirely sure what I'm doing, but here goes nothing."
- ✅ "Okay, Nate. You've come this far. Might as well see it through."

**What Nate Would NOT Say:**
- ❌ "This scientist is clearly an idiot." (mean to people)
- ❌ "What kind of moron would design it this way?" (mocking others)
- ❌ "Oh great, ANOTHER locked door. How original." (cynical and boring)
- ❌ "You've got to be kidding me." (too jaded for Nate)
- ❌ Long technical explanations (he's not pretentious)

**Motivations:**
- Prove himself as a scientist
- Get the job at the laboratory
- Learn from the scientist he admires
- Satisfy his curiosity about fringe science
- Do the right thing when push comes to shove

**Skills/Competencies:**
- Creative problem-solving
- Resourceful with limited tools
- Quick learner
- Observant (notices details)
- Calm under pressure
- NOT good at: fighting, social manipulation, playing it safe

**Relationship to Other Characters:**
- **The Scientist (Hector):** Admiring, respectful, eager to impress
- **The Neighbor (Earl):** Friendly, polite, genuinely interested
- **NPCs generally:** Earnest and kind, never condescending

---

## NPC Character Profiles

### Dr. Hector Manzana (The Scientist)

**Age:** Late 30s to 40

**Heritage:** Latino (though not evident in demeanor or accent)

**Physical Appearance:**
- Dapper and well-groomed despite personal struggles
- Slick black hair with distinguished gray on the sides
- Meticulous mustache
- Thick protective goggles (often worn or around neck)
- White lab coat (always)
- Occasionally smokes a pipe
- Tired but composed appearance

**Background:**
- Brilliant scientist investigating fringe/unconventional sciences
- Working on portal device technology - nearing major breakthrough (possibly tonight)
- Inherited this house from his former mentor
- Came to this town because it's one of the most scientifically interesting places in New England
- Placed help-wanted ad in obscure scientific journal (doesn't quite remember doing it)

**Emotional State (Hidden Depths):**
- Clearly depressed but hides it well
- Suffered significant emotional trauma (doesn't discuss)
- Former mentor betrayed him (corrupted by dark forces/black magic - details mysterious)
- Lost his wife and dog (died or left - unclear, he won't talk about it)
- Avoids dealing with emotions by throwing himself into work
- Photographs around house are taken down and covered
- Secretly hopes portal might allow him to change the past (even he's not fully aware of this motivation)

**Personality:**
- **Calm, cool, collected** - maintains composure despite inner turmoil
- **Passionate about his work** - especially the portal project
- **Absent-minded** - doesn't remember placing the ad
- **Guarded/professional** - doesn't open up easily
- **Bold and unafraid of "unsafe science"** - pushes boundaries
- **Matter-of-fact** - treats unusual things (aliens, bigfoot) casually
- **Capable but diminished** - trauma has affected his abilities
- **Good man with good intentions** - just lost and lonely

**Relationship with Nate:**
- Doesn't remember Nate's job application but goes along with it
- Hires Nate on trial basis for the night
- Needs extra hands for tonight's breakthrough
- Professional and guarded (for now)
- Doesn't reveal personal struggles
- Focuses on the work

**Unconventional Household:**
- Allows alien to live in attic (matter-of-fact about it)
- Friends with Earl the bigfoot next door
- Built a Frankenstein monster in basement (to be revealed later)
- Doesn't bring up houseguests unless Nate discovers them
- Treats bizarre as mundane

**Scientific Philosophy:**
- Investigates areas most consider foolish superstition
- Gets real results from fringe science
- Bold experimenter, not cautious
- Believes conventional science is too limited

**Speaking Style:**
- Professional and measured
- Technical but not condescending
- Occasionally distracted by work
- Doesn't volunteer personal information
- Direct and efficient
- Matter-of-fact about strange occurrences

**What Hector Would Say:**
- ✅ "Ah yes, you must be... remind me your name again?"
- ✅ "The portal should reach critical mass within the hour. I'll need your assistance."
- ✅ "Oh, him? That's just the alien. He's watching his programs. Don't disturb him."
- ✅ "Conventional scientists lack imagination. That's why they never discover anything interesting."
- ✅ "We don't have time for safety protocols. Hand me that Tesla coil."

**What Hector Would NOT Say:**
- ❌ Anything about his personal life/trauma (too guarded)
- ❌ "I'm fine, everything's fine" (he doesn't acknowledge emotions at all)
- ❌ Enthusiastic small talk (he's focused on work)
- ❌ Jokes or humor (he's serious, not playful)

### Earl (The Bigfoot Neighbor)

**To be detailed when implemented**

**Personality notes:**
- Warm, neighborly, completely casual about being bigfoot
- Normal suburban neighbor who happens to be cryptid
- Knows about Hector's trauma but respects his privacy
- Doesn't say much, but observant
- Grilling enthusiast

### The Alien (Attic Resident)

**To be detailed when implemented**

**Personality notes:**
- Inspired by Harry Vanderspeigle (Resident Alien)
- Came to destroy Earth, now stranded and lazy
- Obsessed with terrible soap operas
- Cranky, irreverent, sarcastic
- Dismissive but gradually tolerates Nate

---

## Writing Style & Tone

### Dialogue Guidelines
**The hero CHARACTER speaks directly to the PLAYER in first person, reacting to commands:**

- **Hero talks in first person**: "I can't reach that" NOT "You can't reach that"
- **Hero reacts to player's commands**: Questions, sarcasm, personality
- **Hero is NOT a narrator**: Don't describe actions ("You find a key"), have hero REACT ("Oh great, a rusty key. Just what I needed.")
- **Conversational and snarky**: Hero is your sarcastic companion executing your commands
- **Self-aware humor**: Hero comments on absurdity, questions player's logic

**Think of it as:**
- **Player**: *clicks "Use" on hot object*
- **Hero**: "Yeah, let me just burn myself. Brilliant plan."

### Example Dialogue (CORRECT)
- ✅ "I'm not sticking my hand in there. You do it."
- ✅ "You want me to talk to a BUSH? Fine, but I'm not expecting much."
- ✅ "Great. A locked chest. And I don't suppose you have a key?"
- ✅ "Pick up the mysterious glowing orb? What could possibly go wrong?"
- ✅ "I've seen prettier paintings. In dumpsters."

### Example Dialogue (WRONG - Don't do this!)
- ❌ "You examine the dusty book." (narrator voice, not hero speaking)
- ❌ "You peer into the chest. It's empty." (narrator describing action)
- ❌ "The painting looks old and faded." (objective description, no personality)
- ❌ "You find a key behind the portrait." (narrator telling story)

### Response Variety by Action
- **Look At**: Hero observes and comments with personality
  - "That painting's seen better days. Unlike me. I look great."
  
- **Use/Pick Up/Open**: Hero reacts with intention, hesitation, or commentary - NOT simple action description
  - ✅ "I'll try opening it, but don't get your hopes up."
  - ✅ "I suppose I could pick that up. Can't hurt, right?"
  - ✅ "I feel strangely compelled to touch this coil..."
  - ❌ "I open the door." (too simple, no personality)
  - ❌ "I draw on the chalkboard." (describing action without commentary)
  
- **Talk To**: Hero talks to object/NPC, often acknowledging absurdity
  - "Hi there, Mr. Bush. Nice... leaves?"
  - NPC dialogue should also have personality and banter with hero

### Key Rule: Add Intention, Hesitation, or Commentary
Don't just describe actions flatly. The hero should:
- Express willingness/reluctance ("Fine, I'll grab it")
- Add commentary ("Here goes nothing...")
- Question the logic ("You really want me to touch that?")
- Show personality ("Alright, let's see what happens when I push this button...")

---

## Technical Standards

### Naming Conventions
- **Scene classes**: PascalCase - `HouseInterior`, `GardenScene`, `LaboratoryScene`
- **Spawn points**: lowercase with underscores - `'left'`, `'right'`, `'door_front'`, `'door_back'`
- **Puzzle flags**: lowercase with underscores - `'chest_unlocked'`, `'key_obtained'`, `'talked_to_scientist'`
- **Room IDs**: lowercase with underscores - `'house_interior'`, `'garden'`, `'laboratory'`

### Lighting System
- Use Phaser's **Light2D pipeline** for high-quality lighting
- Enable on all sprites that should be affected: `sprite.setPipeline('Light2D')`
- Set ambient light per scene: `this.lights.setAmbientColor(0x______)`
- Add point lights: `this.lights.addLight(x, y, radius, color, intensity)`
- Optimize for mobile: Limit to 3-5 lights per scene

### Mobile Optimization
- Verb coin: Minimum 60px touch targets, 70px radius coin
- All interactive UI: Minimum 44px touch targets (Apple guidelines)
- Test responsiveness: Game scales from 320px to 1600px width
- Crosshair cursor: Hidden on touch devices, visible on desktop
- Disable default context menus: `canvas.addEventListener('contextmenu', e => e.preventDefault())`

### Performance
- Reuse graphics objects where possible
- Use render textures for complex static backgrounds
- Limit active tweens (stop old ones before starting new)
- Pool frequently created objects (dialogue boxes, UI elements)

---

## Development Workflow

### Iterative Development
1. **One feature at a time**: Request single additions per prompt
2. **Test between changes**: Refresh browser after each update
3. **Back up regularly**: Copy working files before major refactors
4. **Start simple**: Use placeholders before adding complexity

### Adding New Rooms
1. Create new scene class extending BaseScene
2. Implement `drawRoomName()` method for background
3. Implement `createHotspots()` with room-specific data
4. Add lighting setup
5. Define entry dialogue (optional)
6. Add transition hotspots to/from connected rooms
7. Update spawn positions in connected rooms

### Testing Checklist
- [ ] Character walks correctly in walkable area
- [ ] Verb coin appears on hotspot hold
- [ ] All three actions work on each hotspot
- [ ] Inventory opens/closes with right-click
- [ ] Scene transitions work in both directions
- [ ] Dialogue displays and advances correctly
- [ ] Lighting looks good (not too dark on mobile)
- [ ] Game works on mobile device (touch interactions)

---

## Future Considerations

### When Adding Real Art Assets
- Organize in folders: `/backgrounds`, `/characters`, `/items`, `/ui`
- Naming: `room_[name]_bg.png`, `char_[name]_idle.png`, `item_[name].png`
- Use sprite sheets for character animations
- Transparent PNGs for sprites and items
- Consider file size (mobile optimization)

### Audio Integration
- Background music: loops continuously per room
- Sound effects: footsteps, item pickup, door open, etc.
- Mute/unmute button in UI
- Preload all audio to avoid loading delays
- Use web-compatible formats: MP3 or OGG

### Puzzle Design
- Track completion with flags in GameState
- Check flags before allowing actions
- Update hotspot responses based on puzzle state
- Consider inventory combinations for complex puzzles

### Debug Features (for development)
- Keyboard shortcuts to jump between rooms (for testing)
- Console commands to add items to inventory
- Toggle to show hotspot boundaries
- Flag viewer to check puzzle state

---

## Common Pitfalls to Avoid

❌ **Don't** duplicate code across scenes - use BaseScene inheritance
❌ **Don't** hardcode dialogue in methods - use data objects
❌ **Don't** forget to clamp player position to walkable area
❌ **Don't** make verb coin too small on mobile
❌ **Don't** forget to stop previous tweens before starting new ones
❌ **Don't** use first-person dialogue ("I look at...")
❌ **Don't** forget to test on actual mobile device, not just desktop
❌ **Don't** add too many lights (performance on mobile)

✅ **Do** back up before major refactors
✅ **Do** test each change immediately
✅ **Do** keep dialogue humorous and second-person
✅ **Do** use consistent naming conventions
✅ **Do** save GameState on every scene transition
✅ **Do** make touch targets large enough for fingers
✅ **Do** check lighting on mobile (appears darker)

---

## Reference: File Structure

```
game-folder/
├── index.html                 # Main game file (Phaser + all scenes)
├── DEVELOPMENT_GUIDE.md       # This file
├── background-music.mp3       # Audio assets
└── [future assets]
    ├── backgrounds/
    ├── characters/
    ├── items/
    └── ui/
```

---

## Quick Start for Claude Code Sessions

**At the beginning of each session:**
1. Read this DEVELOPMENT_GUIDE.md file
2. Review current code structure
3. Follow established patterns for all changes
4. Maintain consistent tone and architecture
5. Test after each change

**Before making any change, ask:**
- Does this follow BaseScene pattern?
- Is dialogue second-person and humorous?
- Will this work on mobile?
- Am I using consistent naming?
- Should this be in GameState?

---

*Last updated: January 2026*
*Project: Proof-of-concept point-and-click adventure game*
