// ============================================================================
// RADIO ACTIONS - Station cycling for Earl's Yard radio
// ============================================================================
// Lets the player cycle through radio stations by clicking "Listen" on the
// Old Radio hotspot. Each station remembers its playback position so cycling
// back resumes where it left off.
// ============================================================================

(function() {
    'use strict';

    // Helper to read/write non-boolean values in state flags
    // (getFlag coerces to boolean, so we access the raw state object)
    function getRawFlag(path) {
        const parts = path.split('.');
        let obj = TSH.State._state.flags;
        for (const part of parts) {
            if (obj === undefined || obj === null) return undefined;
            obj = obj[part];
        }
        return obj;
    }

    TSH.Actions.cycle_radio_station = function(scene, hotspot) {
        const musicConfig = scene.roomData.audio?.music;
        if (!musicConfig || !musicConfig.stations || musicConfig.stations.length === 0) {
            scene.showDialog("Nothing but static.");
            return;
        }

        const stations = musicConfig.stations;
        const roomId = scene.roomId;

        // Get current station index from state (default 0)
        const currentIndex = getRawFlag(roomId + '.radioStation') || 0;

        // Save current track's playback position
        const currentSound = TSH.Audio.channels.main;
        const currentKey = TSH.Audio.currentTracks.main;
        if (currentSound && currentKey) {
            try {
                const positions = getRawFlag(roomId + '.radioPositions') || {};
                positions[currentKey] = currentSound.seek || 0;
                TSH.State.setFlag(roomId + '.radioPositions', positions);
            } catch (e) {
                // Seek not available, skip saving
            }
        }

        // Advance to next station (wrap around)
        const nextIndex = (currentIndex + 1) % stations.length;
        const nextStation = stations[nextIndex];

        // Stop current music
        TSH.Audio.stopMusic('main', { fade: 0 });

        // Start new station
        const sound = TSH.Audio.playMusic(nextStation.key, {
            channel: 'main',
            volume: musicConfig.volume || 0.25,
            fade: 0
        });

        // Resume from saved position if available
        if (sound) {
            const positions = getRawFlag(roomId + '.radioPositions') || {};
            const savedPos = positions[nextStation.key];
            if (savedPos && savedPos > 0) {
                try {
                    sound.setSeek(savedPos);
                } catch (e) {
                    // Seek failed, play from beginning
                }
            }
        }

        // Reapply radio effect after short delay (matches handleRoomAudio pattern)
        const effects = musicConfig.effects || [];
        if (effects.length > 0) {
            scene.time.delayedCall(100, () => {
                scene.applyMusicEffects('main', effects);
            });
        }

        // Save new station index
        TSH.State.setFlag(roomId + '.radioStation', nextIndex);

        // Show hotspot action response
        const response = hotspot._data?.responses?.action || hotspot.useResponse;
        if (response) {
            scene.showDialog(response);
        }
    };

})();
