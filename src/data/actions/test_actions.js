// ============================================================================
// TEST ACTIONS - Example action functions for Step 4 testing
// ============================================================================
// Action functions are called when an item interaction uses { action: "name" }
// They receive (scene, hotspot, item) and can perform complex sequences.
// ============================================================================

(function() {
    'use strict';

    // Simple test action - just shows dialogue and sets a flag
    TSH.Actions.test_sequence = function(scene, hotspot, item) {
        console.log('[TestActions] test_sequence called with:', { scene: scene.roomId, hotspot: hotspot.name, item: item.name });
        scene.showDialog("Action function works! You used " + item.name + " on " + hotspot.name + ".");
        TSH.State.setFlag('story.action_test', true);
    };

    // Example: Multi-step action with delays (for future use)
    TSH.Actions.test_delayed = function(scene, hotspot, item) {
        scene.showDialog("Starting delayed action...");

        scene.time.delayedCall(1000, () => {
            scene.showDialog("Step 2 of delayed action!");
            TSH.State.setFlag('story.delayed_test', true);
        });
    };

})();
