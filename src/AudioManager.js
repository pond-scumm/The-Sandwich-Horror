// ============================================================================
// TSH.Audio - The Sandwich Horror Audio Manager
// ============================================================================
// Handles all game audio: background music, ambient sounds, SFX, and voice.
// Supports multiple simultaneous music channels, volume categories, and looping.
//
// Volume hierarchy:
//   Master -> Music (background + ambient)
//            SFX (sound effects)
//            Voice (dialogue)
//
// Usage:
//   TSH.Audio.init(game)                          // Call once after Phaser game created
//   TSH.Audio.playMusic('lab_theme', { channel: 'main', volume: 0.7 })
//   TSH.Audio.playMusic('generator_hum', { channel: 'ambient', volume: 0.4 })
//   TSH.Audio.stopMusic('main', { fade: 1000 })
//   TSH.Audio.playSFX('pickup')
//   TSH.Audio.setVolume('master', 0.8)
// ============================================================================

(function() {
    'use strict';

    // Volume categories with default values (0.0 to 1.0)
    const DEFAULT_VOLUMES = {
        master: 1.0,
        music: 0.7,
        sfx: 0.8,
        voice: 1.0
    };

    // Music channels - each can play one track at a time
    const CHANNELS = {
        main: null,      // Primary background music
        ambient: null,   // Secondary ambient/environmental loops
        ambient2: null   // Third channel for layered ambience
    };

    TSH.Audio = {
        // ====================================================================
        // State
        // ====================================================================

        _game: null,           // Phaser game reference
        _initialized: false,

        // Volume settings (saved to localStorage)
        volumes: { ...DEFAULT_VOLUMES },

        // Active music instances by channel
        channels: { ...CHANNELS },

        // Track what's currently playing (for continuity checks)
        currentTracks: {
            main: null,
            ambient: null,
            ambient2: null
        },

        // ====================================================================
        // Initialization
        // ====================================================================

        /**
         * Initialize the audio manager. Call once after Phaser game is created.
         * @param {Phaser.Game} game - The Phaser game instance
         */
        init(game) {
            if (this._initialized) {
                console.warn('TSH.Audio already initialized');
                return;
            }

            this._game = game;
            this._initialized = true;

            // Load saved volume settings
            this._loadVolumeSettings();

            // Unlock audio on first user interaction (mobile requirement)
            this._setupAudioUnlock();

            console.log('TSH.Audio initialized');
        },

        /**
         * Check if audio manager is ready to use
         */
        isReady() {
            return this._initialized && this._game && this._game.sound;
        },

        // ====================================================================
        // Music Playback
        // ====================================================================

        /**
         * Play music on a channel. Automatically loops.
         * @param {string} key - Audio asset key (must be preloaded)
         * @param {object} options - Playback options
         * @param {string} options.channel - Channel name ('main', 'ambient', 'ambient2')
         * @param {number} options.volume - Base volume 0-1 (default: 1.0)
         * @param {boolean} options.loop - Loop the track (default: true)
         * @param {number} options.fade - Fade in duration in ms (default: 0)
         */
        playMusic(key, options = {}) {
            if (!this.isReady()) {
                if (TSH.debug) console.warn('TSH.Audio not ready, cannot play:', key);
                return null;
            }

            const channel = options.channel || 'main';
            const baseVolume = options.volume ?? 1.0;
            const loop = options.loop ?? true;
            const fadeIn = options.fade || 0;

            // Check if this track is already playing on this channel
            if (this.currentTracks[channel] === key && this.channels[channel]?.isPlaying) {
                // Already playing, just adjust volume if needed
                const effectiveVolume = this._calculateVolume('music', baseVolume);
                this.channels[channel].setVolume(effectiveVolume);
                return this.channels[channel];
            }

            // Stop current track on this channel
            this.stopMusic(channel, { fade: fadeIn > 0 ? Math.min(fadeIn, 500) : 0 });

            // Check if sound exists - graceful fallback if not
            if (!this._game.sound.get(key) && !this._game.cache.audio.exists(key)) {
                if (TSH.debug) {
                    console.log(`[Audio] Track "${key}" not loaded (this is OK during development)`);
                }
                return null;
            }

            // Calculate effective volume
            const effectiveVolume = this._calculateVolume('music', baseVolume);
            const startVolume = fadeIn > 0 ? 0 : effectiveVolume;

            // Create and play the sound
            const sound = this._game.sound.add(key, {
                volume: startVolume,
                loop: loop
            });

            // Store reference and track info
            this.channels[channel] = sound;
            this.currentTracks[channel] = key;

            // Store base volume for recalculation when master/category volume changes
            sound._tshBaseVolume = baseVolume;
            sound._tshCategory = 'music';

            sound.play();

            // Fade in if requested
            if (fadeIn > 0) {
                this._fadeSound(sound, startVolume, effectiveVolume, fadeIn);
            }

            if (TSH.debug) {
                console.log(`TSH.Audio: Playing "${key}" on channel "${channel}" (volume: ${effectiveVolume.toFixed(2)})`);
            }

            return sound;
        },

        /**
         * Stop music on a channel
         * @param {string} channel - Channel name to stop
         * @param {object} options - Stop options
         * @param {number} options.fade - Fade out duration in ms (default: 0)
         */
        stopMusic(channel, options = {}) {
            const sound = this.channels[channel];
            if (!sound) return;

            const fadeOut = options.fade || 0;

            if (fadeOut > 0 && sound.isPlaying) {
                this._fadeSound(sound, sound.volume, 0, fadeOut, () => {
                    sound.stop();
                    sound.destroy();
                });
            } else {
                sound.stop();
                sound.destroy();
            }

            this.channels[channel] = null;
            this.currentTracks[channel] = null;
        },

        /**
         * Stop all music channels
         * @param {object} options - Stop options (fade, etc.)
         */
        stopAllMusic(options = {}) {
            Object.keys(this.channels).forEach(channel => {
                this.stopMusic(channel, options);
            });
        },

        /**
         * Check if a track is currently playing on any channel
         * @param {string} key - Audio asset key
         * @returns {boolean}
         */
        isPlaying(key) {
            return Object.values(this.currentTracks).includes(key);
        },

        /**
         * Get the channel a track is playing on
         * @param {string} key - Audio asset key
         * @returns {string|null} Channel name or null
         */
        getTrackChannel(key) {
            for (const [channel, track] of Object.entries(this.currentTracks)) {
                if (track === key) return channel;
            }
            return null;
        },

        // ====================================================================
        // Sound Effects
        // ====================================================================

        /**
         * Play a one-shot sound effect
         * @param {string} name - SFX name from TSH.SFX registry, or raw audio key
         * @param {object} options - Playback options
         * @param {number} options.volume - Base volume 0-1 (overrides registry default)
         * @param {number} options.rate - Playback rate (default: 1.0)
         * @param {number} options.detune - Detune in cents (default: 0)
         */
        playSFX(name, options = {}) {
            if (!this.isReady()) {
                if (TSH.debug) console.warn('TSH.Audio not ready, cannot play SFX:', name);
                return null;
            }

            // Look up in SFX registry first
            let key = name;
            let registryVolume = 1.0;

            if (TSH.SFX && TSH.SFX[name]) {
                const sfxDef = TSH.SFX[name];
                key = sfxDef.key;
                registryVolume = sfxDef.volume ?? 1.0;
            }

            const baseVolume = options.volume ?? registryVolume;
            const rate = options.rate ?? 1.0;
            const detune = options.detune ?? 0;

            if (!this._game.cache.audio.exists(key)) {
                if (TSH.debug) {
                    console.log(`[Audio] SFX "${name}" (${key}) not loaded (this is OK during development)`);
                }
                return null;
            }

            const effectiveVolume = this._calculateVolume('sfx', baseVolume);

            const sound = this._game.sound.add(key, {
                volume: effectiveVolume,
                rate: rate,
                detune: detune
            });

            sound.play();

            // Clean up after playback
            sound.once('complete', () => {
                sound.destroy();
            });

            if (TSH.debug) {
                console.log(`TSH.Audio: SFX "${key}" (volume: ${effectiveVolume.toFixed(2)})`);
            }

            return sound;
        },

        // ====================================================================
        // Voice (Dialogue)
        // ====================================================================

        /**
         * Play a voice line
         * @param {string} key - Audio asset key
         * @param {object} options - Playback options
         * @param {number} options.volume - Base volume 0-1 (default: 1.0)
         */
        playVoice(key, options = {}) {
            if (!this.isReady()) {
                if (TSH.debug) console.warn('TSH.Audio not ready, cannot play voice:', key);
                return null;
            }

            const baseVolume = options.volume ?? 1.0;

            if (!this._game.cache.audio.exists(key)) {
                if (TSH.debug) {
                    console.log(`[Audio] Voice "${key}" not loaded (this is OK during development)`);
                }
                return null;
            }

            const effectiveVolume = this._calculateVolume('voice', baseVolume);

            const sound = this._game.sound.add(key, {
                volume: effectiveVolume
            });

            sound.play();

            sound.once('complete', () => {
                sound.destroy();
            });

            return sound;
        },

        // ====================================================================
        // Volume Control
        // ====================================================================

        /**
         * Set volume for a category
         * @param {string} category - 'master', 'music', 'sfx', or 'voice'
         * @param {number} volume - Volume level 0-1
         */
        setVolume(category, volume) {
            if (!DEFAULT_VOLUMES.hasOwnProperty(category)) {
                console.warn(`Unknown volume category: ${category}`);
                return;
            }

            this.volumes[category] = Phaser.Math.Clamp(volume, 0, 1);

            // Update all playing music
            this._updateMusicVolumes();

            // Save to localStorage
            this._saveVolumeSettings();

            if (TSH.debug) {
                console.log(`TSH.Audio: Set ${category} volume to ${volume.toFixed(2)}`);
            }
        },

        /**
         * Get current volume for a category
         * @param {string} category - Volume category
         * @returns {number} Current volume 0-1
         */
        getVolume(category) {
            return this.volumes[category] ?? 1.0;
        },

        /**
         * Set volume for a specific music channel
         * @param {string} channel - Channel name
         * @param {number} volume - Base volume 0-1
         */
        setChannelVolume(channel, volume) {
            const sound = this.channels[channel];
            if (!sound) return;

            sound._tshBaseVolume = Phaser.Math.Clamp(volume, 0, 1);
            const effectiveVolume = this._calculateVolume('music', sound._tshBaseVolume);
            sound.setVolume(effectiveVolume);
        },

        /**
         * Mute/unmute all audio
         * @param {boolean} muted
         */
        setMuted(muted) {
            if (!this.isReady()) return;
            this._game.sound.mute = muted;
        },

        /**
         * Check if audio is muted
         * @returns {boolean}
         */
        isMuted() {
            return this._game?.sound?.mute ?? false;
        },

        // ====================================================================
        // Utility Methods
        // ====================================================================

        /**
         * Pause all audio (for game pause menu)
         */
        pauseAll() {
            if (!this.isReady()) return;
            this._game.sound.pauseAll();
        },

        /**
         * Resume all audio
         */
        resumeAll() {
            if (!this.isReady()) return;
            this._game.sound.resumeAll();
        },

        /**
         * Duck music volume temporarily (for dialogue)
         * @param {number} duration - Duck duration in ms
         * @param {number} duckLevel - Volume multiplier during duck (default: 0.3)
         */
        duckMusic(duration, duckLevel = 0.3) {
            if (!this.isReady()) return;

            Object.values(this.channels).forEach(sound => {
                if (!sound || !sound.isPlaying) return;

                const originalVolume = sound.volume;
                const duckedVolume = originalVolume * duckLevel;

                // Fade down
                this._fadeSound(sound, originalVolume, duckedVolume, 200, () => {
                    // Hold at ducked level, then fade back up
                    setTimeout(() => {
                        const effectiveVolume = this._calculateVolume('music', sound._tshBaseVolume);
                        this._fadeSound(sound, duckedVolume, effectiveVolume, 200);
                    }, duration - 400);
                });
            });
        },

        // ====================================================================
        // Internal Methods
        // ====================================================================

        /**
         * Calculate effective volume based on category and master
         * @private
         */
        _calculateVolume(category, baseVolume) {
            const masterVol = this.volumes.master;
            const categoryVol = this.volumes[category] ?? 1.0;
            return baseVolume * categoryVol * masterVol;
        },

        /**
         * Fade a sound's volume over time (no tween dependency)
         * @private
         * @param {Phaser.Sound.BaseSound} sound - The sound to fade
         * @param {number} fromVol - Starting volume
         * @param {number} toVol - Target volume
         * @param {number} duration - Fade duration in ms
         * @param {function} onComplete - Optional callback when done
         */
        _fadeSound(sound, fromVol, toVol, duration, onComplete) {
            if (!sound || duration <= 0) {
                if (sound) sound.setVolume(toVol);
                if (onComplete) onComplete();
                return;
            }

            const startTime = performance.now();
            const volumeDiff = toVol - fromVol;

            const updateFade = () => {
                if (!sound || !sound.isPlaying) {
                    if (onComplete) onComplete();
                    return;
                }

                const elapsed = performance.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                sound.setVolume(fromVol + (volumeDiff * progress));

                if (progress < 1) {
                    requestAnimationFrame(updateFade);
                } else {
                    if (onComplete) onComplete();
                }
            };

            requestAnimationFrame(updateFade);
        },

        /**
         * Update all playing music volumes (after category volume change)
         * @private
         */
        _updateMusicVolumes() {
            Object.values(this.channels).forEach(sound => {
                if (!sound) return;
                const effectiveVolume = this._calculateVolume(
                    sound._tshCategory || 'music',
                    sound._tshBaseVolume || 1.0
                );
                sound.setVolume(effectiveVolume);
            });
        },

        /**
         * Save volume settings to localStorage
         * @private
         */
        _saveVolumeSettings() {
            try {
                localStorage.setItem('tsh_audio_volumes', JSON.stringify(this.volumes));
            } catch (e) {
                console.warn('Could not save audio settings:', e);
            }
        },

        /**
         * Load volume settings from localStorage
         * @private
         */
        _loadVolumeSettings() {
            try {
                const saved = localStorage.getItem('tsh_audio_volumes');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    this.volumes = { ...DEFAULT_VOLUMES, ...parsed };
                }
            } catch (e) {
                console.warn('Could not load audio settings:', e);
            }
        },

        /**
         * Set up audio unlock on first user interaction (required for mobile)
         * @private
         */
        _setupAudioUnlock() {
            if (!this._game?.sound?.locked) return;

            this._game.sound.once('unlocked', () => {
                if (TSH.debug) {
                    console.log('TSH.Audio: Audio context unlocked');
                }
            });
        },

        // ====================================================================
        // Debug
        // ====================================================================

        /**
         * Log current audio state (for debugging)
         */
        dump() {
            console.group('TSH.Audio State');
            console.log('Initialized:', this._initialized);
            console.log('Volumes:', this.volumes);
            console.log('Current Tracks:', this.currentTracks);
            console.log('Active Channels:',
                Object.entries(this.channels)
                    .filter(([k, v]) => v !== null)
                    .map(([k, v]) => `${k}: ${v.key} (playing: ${v.isPlaying})`)
            );
            console.groupEnd();
        }
    };

})();
