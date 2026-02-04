// ============================================================================
// ITEM COMBINATIONS
// ============================================================================
// Defines what happens when player uses one item on another.
// Keys are sorted alphabetically: 'item_a+item_b' (a < b)
// 
// Each combination specifies:
//   consumes  - array of item IDs to remove from inventory
//   produces  - item ID to add to inventory (or null)
//   setFlags  - flags to set when combination happens
//   dialogue  - what Nate says
//   action    - optional action ID for special behavior
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
        dialogue: "I light the candle. Ooh, very cozy!",
        setFlags: {}
    };

    // ── Clock Puzzle Combinations ────────────────────────────────────────
    
    // Springs + Satellite Shoes → Repaired Shoes
    // (Need both springs, done in two steps)
    combinations[makeKey('spring', 'satellite_shoes')] = {
        consumes: ['spring', 'satellite_shoes'],
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
    
    combinations[makeKey('spring', 'shoes_one_spring')] = {
        consumes: ['spring', 'shoes_one_spring'],
        produces: 'repaired_shoes',
        dialogue: "Both springs are in! These satellite shoes are ready for action.",
        setFlags: { 'clock.shoes_repaired': true }
    };
    
    // ── Brain Puzzle Combinations ────────────────────────────────────────
    
    // Trophy parts → Assembled trophy
    combinations[makeKey('trophy_item_1', 'trophy_item_2')] = {
        consumes: ['trophy_item_1', 'trophy_item_2'],
        produces: 'trophy_assembled',
        dialogue: "I tape them together. It's... trophy-shaped. Ish. Needs paint.",
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
    
    // ── Expose to namespace ─────────────────────────────────────────────
    
    TSH.Combinations = {
        _recipes: combinations,
        
        // Try to combine two items. Returns result object or null.
        tryCombine(itemA, itemB) {
            const key = makeKey(itemA, itemB);
            const recipe = combinations[key];
            
            if (!recipe) return null;
            
            // Check additional conditions
            if (recipe.condition && !recipe.condition()) {
                return { 
                    success: false, 
                    dialogue: recipe.failDialogue || "Something's still missing..." 
                };
            }
            
            return {
                success: true,
                consumes: recipe.consumes,
                produces: recipe.produces,
                dialogue: recipe.dialogue,
                setFlags: recipe.setFlags,
                action: recipe.action || null
            };
        },
        
        // Execute a combination (modify state)
        executeCombine(itemA, itemB) {
            const result = this.tryCombine(itemA, itemB);
            if (!result || !result.success) return result;
            
            // Remove consumed items
            for (const itemId of result.consumes) {
                TSH.State.removeItem(itemId);
            }
            
            // Add produced item
            if (result.produces) {
                TSH.State.addItem(result.produces);
            }
            
            // Set flags
            if (result.setFlags) {
                for (const [path, value] of Object.entries(result.setFlags)) {
                    TSH.State.setFlag(path, value);
                }
            }
            
            return result;
        }
    };
    
})();
