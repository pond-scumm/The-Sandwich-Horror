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

    // Toggle electrical panel open/closed
    // Dialogue comes from spreadsheet via hotspot.useResponse
    TSH.Actions.toggle_panel = function(scene, hotspot, item) {
        const isOpen = TSH.State.getFlag('lab.panel_open');

        // Toggle the state
        TSH.State.setFlag('lab.panel_open', !isOpen);

        // Get dialogue from hotspot (populated from spreadsheet)
        // State variants (default/flag:lab.panel_open) handled automatically by parseResponse
        const rawResponse = hotspot.useResponse || hotspot._data?.responses?.action || "";
        const dialogue = scene.parseResponse(rawResponse);

        // Show dialogue only if it exists
        if (dialogue) {
            scene.showDialog(dialogue);
        }
    };

})();
