// ============================================================================
// TSH - The Sandwich Horror Global Namespace
// ============================================================================
// Everything lives under window.TSH to avoid global scope pollution.
// This file must be loaded FIRST, before all other game scripts.
// ============================================================================

window.TSH = {
    // Room definitions (loaded from src/data/rooms/*.js)
    Rooms: {},
    
    // NPC definitions (loaded from src/data/npcs/*.js)  
    NPCs: {},
    
    // Dialogue trees (loaded from src/data/dialogue/*.js)
    Dialogue: {},
    
    // Item definitions (loaded from src/data/items/*.js)
    Items: {},
    
    // Puzzle actions (loaded from src/data/actions/*.js)
    Actions: {},
    
    // Item combination recipes
    Combinations: {},
    
    // Game state manager (initialized in GameState.js)
    State: null,
    
    // Save system (initialized in SaveSystem.js)
    Save: null,

    // Audio manager (initialized in AudioManager.js, requires game reference)
    Audio: null,

    // Debug mode flag - set to true to enable debug overlay
    debug: false
};
