// ============================================================================
// LAB ACTION FUNCTIONS
// ============================================================================
// Custom action handlers for laboratory puzzles and interactions
// ============================================================================

(function() {
    'use strict';

    TSH.Actions = TSH.Actions || {};

    // Take scalpel from knife block
    // Dialogue comes from spreadsheet via hotspot.useResponse
    TSH.Actions.take_scalpel = function(scene, hotspot, item) {
        // Get dialogue from hotspot (populated from spreadsheet)
        // Could be a string or variant array, so parse it
        const rawResponse = hotspot.useResponse || hotspot._data?.responses?.action || "";
        const dialogue = scene.parseResponse(rawResponse);

        // Check if player already has a scalpel
        if (TSH.State.hasItem('scalpel')) {
            // Show dialogue (spreadsheet will have different text for has:scalpel state)
            if (dialogue) {
                scene.showDialog(dialogue);
            }
            return;
        }

        // Give scalpel and show dialogue
        if (dialogue) {
            scene.showDialog(dialogue);
        }
        TSH.State.addItem('scalpel');

        // Note: Knife block visual stays - it's a block with multiple scalpels
    };

})();
