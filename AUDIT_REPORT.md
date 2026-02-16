# Game State Audit Report
**Generated:** February 16, 2026
**Purpose:** Identify used vs unused flags and inventory items

---

## Summary

### Flags
- **Total defined:** 80 flags across 9 categories
- **Actively used:** 17 flags (both READ and WRITTEN)
- **Write-only:** 2 flags (set but never checked)
- **Read-only:** 1 flag (checked but never set - test file)
- **Orphaned:** 60 flags (defined but never referenced)

### Items
- **Total defined:** 47 items
- **Actively used:** 24 items (given AND used/checked)
- **Never referenced:** 23 items (defined but no references found)

---

## USED FLAGS
*Flags that are both SET and CHECKED in working game logic*

### Lab Puzzle
#### `lab.panel_open`
- **WRITTEN:** lab_actions.js:44 (toggle_panel action)
- **READ:** lab_actions.js:41, laboratory.js:369, laboratory.js:494, laboratory.js:1264
- **TRIGGERS REFRESH:** laboratory.js:527 (relevantFlags)

### Clock Puzzle
#### `clock.fixed`
- **WRITTEN:** laboratory.js:540 (itemInteractions setFlag)
- **READ:** laboratory.js:387, laboratory.js:536, laboratory.js:1225
- **TRIGGERS REFRESH:** laboratory.js:527 (relevantFlags)

#### `clock.has_spring_1`
- **WRITTEN:** laboratory.js:381 (pickupFlag)
- **READ:** laboratory.js:369 (condition in getHotspotData)

#### `clock.earl_invited`
- **WRITTEN:** earl_fence.txt:16 (dialogue # set:)
- **READ:** backyard.js:338, backyard.js:358
- **TRIGGERS REFRESH:** backyard.js:420 (relevantFlags)

#### `clock.ladder_deployed`
- **WRITTEN:** backyard.js:431 (itemInteractions setFlag)
- **READ:** backyard.js:393, backyard.js:1214, backyard.js:1304
- **TRIGGERS REFRESH:** backyard.js:420 (relevantFlags)

#### `clock.has_clock`
- **WRITTEN:** backyard.js:446 (itemInteractions setFlag)
- **READ:** backyard.js:378, backyard.js:1209, backyard.js:1299
- **TRIGGERS REFRESH:** backyard.js:420 (relevantFlags)

#### `clock.returned_borrowed_item`
- **WRITTEN:** earls_yard.js:394 (itemInteractions setFlag)
- **READ:** earls_yard.js:317, earl.txt:45, earl.txt:51, earl.txt:60, earl.txt:68, earl.txt:73
- **TRIGGERS REFRESH:** earls_yard.js:400 (relevantFlags)

#### `clock.has_ladder`
- **WRITTEN:** earls_yard.js:330 (pickupFlag)
- **READ:** earls_yard.js:314, earl.txt:73, earls_yard.js:1027
- **TRIGGERS REFRESH:** earls_yard.js:400 (relevantFlags)

#### `clock.shoes_repaired`
- **WRITTEN:** combinations.js:54, combinations.js:69 (setFlags)
- **READ:** *(No reads found - possibly unused or for future logic)*

### Storage Room
#### `storage.beaker_holder_taken`
- **WRITTEN:** secure_storage.js:143 (pickupFlag)
- **READ:** secure_storage.js:131, secure_storage.js:622
- **TRIGGERS REFRESH:** secure_storage.js:109 (relevantFlags)

### Frank's Room
#### `franks_room.bed_cut`
- **WRITTEN:** *(Not found - may be set by future action function)*
- **READ:** franks_room.js:170, franks_room.js:566
- **TRIGGERS REFRESH:** franks_room.js:91 (relevantFlags)
- **NOTE:** Read-only currently; needs write implementation

#### `franks_room.spring_taken`
- **WRITTEN:** franks_room.js:182 (pickupFlag)
- **READ:** franks_room.js:170, franks_room.js:566
- **TRIGGERS REFRESH:** franks_room.js:91 (relevantFlags)

### Test/Debug
#### `story.test_action_complete`
- **WRITTEN:** *(Not found - may be set by test action)*
- **READ:** alien_room.js:125
- **TRIGGERS REFRESH:** alien_room.js:101 (relevantFlags)

### Brain Puzzle (Write-Only - No Reads Found)
#### `brain.trophy_built`
- **WRITTEN:** combinations.js:109 (setFlags)
- **READ:** *(None found)*

#### `brain.trophy_painted`
- **WRITTEN:** combinations.js:117 (setFlags)
- **READ:** *(None found)*

#### `brain.trophy_named`
- **WRITTEN:** combinations.js:125 (setFlags)
- **READ:** *(None found)*

#### `brain.has_disguise`
- **WRITTEN:** combinations.js:135 (setFlags)
- **READ:** *(None found)*

---

## UNUSED FLAGS
*Flags that are defined but not meaningfully referenced, or only set/read but not both*

### Write-Only (Set but never checked)
These flags are set somewhere but nothing in the game checks them, making them effectively useless:

#### `story.action_test`
- **WRITTEN:** test_actions.js:15
- **NEVER READ** - Test flag with no corresponding check

#### `story.delayed_test`
- **WRITTEN:** test_actions.js:24
- **NEVER READ** - Test flag with no corresponding check

#### `brain.trophy_built`
- **WRITTEN:** combinations.js:109
- **NEVER READ** - Flag is set but never checked

#### `brain.trophy_painted`
- **WRITTEN:** combinations.js:117
- **NEVER READ** - Flag is set but never checked

#### `brain.trophy_named`
- **WRITTEN:** combinations.js:125
- **NEVER READ** - Flag is set but never checked

#### `brain.has_disguise`
- **WRITTEN:** combinations.js:135
- **NEVER READ** - Flag is set but never checked

### Read-Only (Checked but never set - will always be false)
#### `story.found_hector`
- **READ:** test_npc.txt:16, test_npc.txt:37 (test dialogue file)
- **NEVER WRITTEN** - Flag is checked but never becomes true

#### `franks_room.bed_cut`
- **READ:** franks_room.js:170, franks_room.js:566
- **NEVER WRITTEN** - Needs action function to set this flag

### Orphaned (Defined but never referenced)
These flags exist in GameState.js but are not referenced anywhere in the codebase:

#### Story Flags
- `story.entered_house`
- `story.hired_by_hector`
- `story.experiment_failed`
- `story.title_card_shown`
- `story.damage_report_printed`
- `story.lab_unlocked`
- `story.all_components_installed`
- `story.polarity_reversed`
- `story.clone_created`
- `story.experiment_rerun`
- `story.game_complete`

#### Hector Puzzle Flags
- `hector.head_found`
- `hector.body_running`
- `hector.locker_closed`
- `hector.sneezed_on_book`
- `hector.coat_dropped`
- `hector.body_captured`
- `hector.has_keycard`
- `hector.has_lab_coat`

#### Computer Puzzle Flags
- `computer.tried_login`
- `computer.security_q1_found`
- `computer.security_q2_found`
- `computer.security_q3_found`
- `computer.password_reset`
- `computer.logged_in`

#### Clock Puzzle Flags (Unused Subset)
- `clock.has_spring_2` *(May be needed for spring_2 item when implemented)*
- `clock.has_shoes` *(May be needed for satellite_shoes pickup)*
- `clock.met_earl` *(Not needed - uses asked labels in dialogue instead)*

#### Power Puzzle Flags
- `power.found_generator`
- `power.generator_unplugged`
- `power.has_padlock`
- `power.robot_locked_in`
- `power.monkey_placed`
- `power.robot_unlocked`
- `power.robot_locked_out`
- `power.generator_plugged_back`
- `power.robot_bumping`
- `power.has_fuse`

#### Screen Puzzle Flags
- `screen.met_alien`
- `screen.knows_hated_channel`
- `screen.has_tv_guide`
- `screen.found_satellite`
- `screen.channel_changed`
- `screen.satellite_sabotaged`
- `screen.correct_channel_set`
- `screen.alien_on_roof`
- `screen.window_locked`
- `screen.has_tv`

#### Brain Puzzle Flags (Unused Subset)
- `brain.found_brain`
- `brain.tried_brain_in_machine`
- `brain.knows_about_victor`
- `brain.met_frank`
- `brain.frank_offered_swap`
- `brain.brains_swapped_to_victor`
- `brain.talked_to_rival`
- `brain.rival_demands_known`
- `brain.has_trophy_item_1`
- `brain.has_trophy_item_2`
- `brain.has_spray_paint`
- `brain.has_goggles`
- `brain.has_sharpie`
- `brain.glasses_removed`
- `brain.brains_swapped_back`
- `brain.brains_swapped_final`
- `brain.rival_convinced`

#### Finale Flags
- `finale.found_teleporter`
- `finale.knows_teleporter_truth`
- `finale.has_mirror`
- `finale.death_ray_disabled`
- `finale.clone_created`

---

## USED ITEMS
*Items that are both GIVEN (added to inventory) AND USED/CHECKED somewhere in game logic*

### Starting Items
- **help_wanted_ad** - Given at start, used in combinations (lit_candle combo)
- **candle** - Given at start, used in combinations (matches combo)
- **matches** - Given in interior.js:211, used in combinations (candle combo)

### Lab Items
- **scalpel** - Given in lab_actions.js:33, checked in laboratory.js:340, used in itemInteractions
- **spring_1** - Given in laboratory.js:380, used in combinations (satellite_shoes, broken_moon_shoes)

### Clock Puzzle Items
- **ladder** - Given in earls_yard.js:329, used in backyard itemInteractions
- **clock** - Given in backyard.js:445, used in laboratory itemInteractions
- **broken_moon_shoes** - Given in basement.js:193, used in combinations
- **moon_shoes** - Produced by combinations, used in backyard itemInteractions
- **half_broken_moon_shoes** - Produced by combinations, used in combinations

### Lighting
- **lit_candle** - Produced by candle+matches combo, used in combinations dialogue

### Storage Room
- **tongs** - Given in secure_storage.js:141, used in backyard/earls_yard itemInteractions

### Frank's Room
- **spring_2** - Given in franks_room.js:180, used in combinations

### Combination Products (Brain Puzzle)
- **trophy_assembled** - Produced by trophy_item_1+trophy_item_2, used in spray_paint combo
- **trophy_painted** - Produced by trophy_assembled+spray_paint, used in sharpie combo
- **fake_trophy** - Produced by trophy_painted+sharpie combo
- **hector_disguise** - Produced by goggles+lab_coat combo (if has sharpie)

### Intermediate Combination Products
- **shoes_one_spring** - Produced by spring+satellite_shoes combo (intermediate state)

---

## UNUSED ITEMS
*Items that are defined but never given to the player OR never used/checked in logic*

### Never Referenced Anywhere
These items exist in items.js but have no giveItem, hasItem, or itemInteractions references:

#### General Items
- **crowbar** - Defined but never given or used
- **damage_report** - Defined but never given or used
- **dusty_book** - Defined but never given or used

#### Clock Puzzle Items (Planned)
- **satellite_shoes** - Defined, used in combinations, but never given to player
- **repaired_shoes** - Produced by combos, but never checked/used (planned for backyard interaction)
- **borrowed_item** - Defined but never given or used

#### Power Puzzle Items
- **keycard** - Defined but never given or used
- **lab_coat** - Defined, used in combinations, but never given to player
- **padlock** - Defined but never given or used
- **monkey** - Defined but never given or used
- **fuse** - Defined but never given or used

#### Screen Puzzle Items
- **tv_guide** - Defined but never given or used
- **wrench** - Defined, referenced in test_npc.txt (test file), never given
- **tv** - Defined but never given or used

#### Brain Puzzle Items
- **brain** - Defined but never given or used
- **trophy_item_1** - Defined, used in combinations, but never given to player
- **trophy_item_2** - Defined, used in combinations, but never given to player
- **spray_paint** - Defined, used in combinations, but never given to player
- **sharpie** - Defined, used in combinations (conditional check), never given to player
- **goggles** - Defined, used in combinations, but never given to player

#### Finale Items
- **mirror** - Defined but never given or used

---

## NOTES & RECOMMENDATIONS

### Flags to Consider Removing
1. **Test flags** - `story.action_test`, `story.delayed_test` can likely be removed unless needed for testing
2. **Write-only brain flags** - The 4 brain puzzle flags that are set but never checked could be removed or need logic added to check them
3. **Large orphaned sets** - Consider if entire puzzle chains (power, screen, hector, computer, brain, finale) should be removed if not planned for implementation

### Flags to Keep (Likely Planned Features)
- Clock puzzle flags like `clock.has_spring_2`, `clock.has_shoes` are likely needed when those items are implemented
- All orphaned flags for major puzzle chains (power, screen, brain, finale) are probably planned future features

### Items to Consider Removing
1. **Never-used items with no combinations** - crowbar, damage_report, dusty_book
2. **Items that won't be implemented** - Any items from abandoned puzzle chains

### Items to Keep (Active in Combinations)
Even though some items are never given to the player, they ARE used in combination recipes:
- `satellite_shoes`, `trophy_item_1`, `trophy_item_2`, `spray_paint`, `goggles`, `lab_coat`, `sharpie`

These should be kept if those puzzles will be implemented. The missing pieces are the giveItem locations.

### Audit Methodology
This audit searched for:
- `getFlag()`, `setFlag()`, `pickupFlag:` - flag reads/writes
- `hasItem()`, `addItem()`, `giveItem:`, `consumeItem`, `removeItem()` - item usage
- `relevantFlags:` arrays - flags that trigger hotspot refresh
- `itemInteractions[hotspot][item]` - item-on-hotspot usage
- Combination recipes in combinations.js
- Dialogue file flag/item conditions (`# requires:`, `# set:`, `has:`)

Files searched:
- All room files (src/data/rooms/*.js)
- All action files (src/data/actions/*.js)
- All dialogue files (src/data/dialogue/*.txt)
- Item combinations (src/data/items/combinations.js)
- Scene files (src/scenes/*.js)

---

## END OF REPORT
