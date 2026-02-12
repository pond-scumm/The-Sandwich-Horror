// ============================================================================
// ITEM COMBINATIONS
// ============================================================================
// Defines what happens when player uses one item on another.
// Keys are sorted alphabetically: 'item_a+item_b' (a < b)
//
// Each combination specifies:
//   consumes    - array of item IDs to remove from inventory
//   produces    - item ID to add to inventory (or null)
//   setFlags    - flags to set when combination happens
//   dialogue    - what Nate says on success
//   sfx         - sound effect on success (default: 'item_combine')
//   condition   - optional function that must return true
//   failDialogue - what Nate says if condition fails
//   sfxFail     - sound effect on condition fail (default: 'item_fail')
//   action      - optional action ID for special behavior
// ============================================================================

(function() {
    'use strict';
    
    // Helper: create a canonical key from two item IDs (alphabetical order)
    function makeKey(a, b) {
        return [a, b].sort().join('+');
    }
    
    const combinations = {};

    // ── Interior / Test Combinations ─────────────────────────────────────

    // Matches + Candle → Lit Candle
    combinations[makeKey('candle', 'matches')] = {
        consumes: ['candle'],  // Keep matches, they have more than one use
        produces: 'lit_candle',
        dialogue: "Better to light a candle than be slightly scared of the dark.",
        setFlags: {}
    };

    // ── Clock Puzzle Combinations ────────────────────────────────────────
    
    // Springs + Satellite Shoes → Repaired Shoes
    // (Need both springs, done in two steps)
    combinations[makeKey('spring_1', 'satellite_shoes')] = {
        consumes: ['spring_1', 'satellite_shoes'],
        produces: 'shoes_one_spring',
        dialogue: "I put one spring in. Still need another one.",
        setFlags: {}
    };
    
    combinations[makeKey('spring_2', 'shoes_one_spring')] = {
        consumes: ['spring_2', 'shoes_one_spring'],
        produces: 'repaired_shoes',
        dialogue: "Both springs are in! These satellite shoes are ready for action.",
        setFlags: { 'clock.shoes_repaired': true }
    };
    
    // Also handle if player finds springs in opposite order
    combinations[makeKey('spring_2', 'satellite_shoes')] = {
        consumes: ['spring_2', 'satellite_shoes'],
        produces: 'shoes_one_spring',
        dialogue: "I put one spring in. Still need another one.",
        setFlags: {}
    };
    
    combinations[makeKey('spring_1', 'shoes_one_spring')] = {
        consumes: ['spring_1', 'shoes_one_spring'],
        produces: 'repaired_shoes',
        dialogue: "Both springs are in! These satellite shoes are ready for action.",
        setFlags: { 'clock.shoes_repaired': true }
    };

    // Broken Moon Shoes + Spring → Half-Broken Moon Shoes
    combinations[makeKey('spring_1', 'broken_moon_shoes')] = {
        consumes: ['spring_1', 'broken_moon_shoes'],
        produces: 'half_broken_moon_shoes',
        dialogue: "",  // Dialogue from spreadsheet
        setFlags: {}
    };

    combinations[makeKey('spring_2', 'broken_moon_shoes')] = {
        consumes: ['spring_2', 'broken_moon_shoes'],
        produces: 'half_broken_moon_shoes',
        dialogue: "",  // Dialogue from spreadsheet
        setFlags: {}
    };

    // Half-Broken Moon Shoes + Spring → Moon Shoes (Fully Repaired)
    combinations[makeKey('spring_1', 'half_broken_moon_shoes')] = {
        consumes: ['spring_1', 'half_broken_moon_shoes'],
        produces: 'moon_shoes',
        dialogue: "",  // Dialogue from spreadsheet
        setFlags: {}
    };

    combinations[makeKey('spring_2', 'half_broken_moon_shoes')] = {
        consumes: ['spring_2', 'half_broken_moon_shoes'],
        produces: 'moon_shoes',
        dialogue: "",  // Dialogue from spreadsheet
        setFlags: {}
    };

    // ── Brain Puzzle Combinations ────────────────────────────────────────
    
    // Trophy parts → Assembled trophy
    combinations[makeKey('trophy_item_1', 'trophy_item_2')] = {
        consumes: ['trophy_item_1', 'trophy_item_2'],
        produces: 'trophy_assembled',
        dialogue: "I taped them together. It's... trophy-shaped. Ish. Needs paint.",
        setFlags: { 'brain.trophy_built': true }
    };
    
    // Assembled trophy + spray paint → Gold trophy
    combinations[makeKey('spray_paint', 'trophy_assembled')] = {
        consumes: ['trophy_assembled'],  // Keep spray paint
        produces: 'trophy_painted',
        dialogue: "A few coats of gold spray paint and... magnificent. Just needs a name.",
        setFlags: { 'brain.trophy_painted': true }
    };
    
    // Gold trophy + sharpie → Fake trophy with name
    combinations[makeKey('sharpie', 'trophy_painted')] = {
        consumes: ['trophy_painted'],  // Keep sharpie
        produces: 'fake_trophy',
        dialogue: "I write 'VICTOR' on the plaque in my best formal Sharpie handwriting. Perfect.",
        setFlags: { 'brain.trophy_named': true }
    };
    
    // Lab coat + goggles → Hector disguise
    combinations[makeKey('goggles', 'lab_coat')] = {
        // Only works if player also has sharpie (for mustache)
        condition: () => TSH.State.hasItem('sharpie'),
        consumes: ['goggles', 'lab_coat'],
        produces: 'hector_disguise',
        dialogue: "Lab coat, goggles, and a Sharpie mustache. I am Hector Manzana. Fear my science.",
        setFlags: { 'brain.has_disguise': true },
        failDialogue: "I have the coat and goggles but I need something for the mustache..."
    };
    
    
    // Dialogue-only (no recipe)
    combinations[makeKey('help_wanted_ad', 'lit_candle')] = {
        dialogue: 'I don\'t want to burn it! I\'m trying to get a job.'
    };

    
    // Dialogue-only (no recipe)
    combinations[makeKey('lit_candle', 'matches')] = {
        dialogue: 'It\'s already lit.'
    };

    // ── Expose to namespace ─────────────────────────────────────────────
    
    TSH.Combinations = {
        _recipes: combinations,

        // Execute a combination and modify state.
        // Always returns a result object: { success, dialogue, sfx, consumes?, produces? }
        // heldItemId: the item being used/dragged (for failDefault fallback)
        executeCombine(itemAId, itemBId, heldItemId) {
            const key = makeKey(itemAId, itemBId);
            const recipe = combinations[key];

            // No recipe exists for this combination
            if (!recipe) {
                // 3-level fallback chain:
                // 1. Recipe dialogue (not found, so skip)
                // 2. Held item's failDefault
                // 3. Global Use default

                const heldItem = TSH.Items[heldItemId];
                let dialogue;

                if (heldItem && heldItem.failDefault) {
                    // Use held item's failDefault
                    dialogue = heldItem.failDefault;
                } else {
                    // Fall back to Global Use default
                    dialogue = TSH.Defaults.use;
                }

                return {
                    success: false,
                    dialogue: dialogue,
                    sfx: 'item_fail'
                };
            }

            // Recipe exists but condition not met
            if (recipe.condition && !recipe.condition()) {
                return {
                    success: false,
                    dialogue: recipe.failDialogue || "Something's still missing...",
                    sfx: recipe.sfxFail || 'item_fail'
                };
            }

            // Check if this is a dialogue-only entry (no state modification)
            const modifiesState = (recipe.consumes && recipe.consumes.length > 0) || recipe.produces;

            if (!modifiesState) {
                // Dialogue-only entry - return failure with custom dialogue
                return {
                    success: false,
                    dialogue: recipe.dialogue,
                    sfx: recipe.sfx || 'item_fail'
                };
            }

            // Recipe modifies state - execute it
            for (const itemId of recipe.consumes) {
                TSH.State.removeItem(itemId);
            }
            if (recipe.produces) {
                TSH.State.addItem(recipe.produces);
            }
            if (recipe.setFlags) {
                for (const [path, value] of Object.entries(recipe.setFlags)) {
                    TSH.State.setFlag(path, value);
                }
            }

            return {
                success: true,
                dialogue: recipe.dialogue,
                sfx: recipe.sfx || 'item_combine',
                consumes: recipe.consumes,
                produces: recipe.produces
            };
        },

        // Check if a combination exists (without executing it)
        hasRecipe(itemAId, itemBId) {
            const key = makeKey(itemAId, itemBId);
            return !!combinations[key];
        }
    };
    
})();
