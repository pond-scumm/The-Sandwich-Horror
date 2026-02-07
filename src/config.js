// ============================================================================
// GAME CONFIG
// ============================================================================
const config = {
    type: Phaser.WEBGL,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    backgroundColor: '#1a1a2e',
    // RoomScene first - loads 'interior' by default, uses data-driven layers
    // UIScene runs in parallel for persistent UI (cursors, inventory, etc.)
    // Legacy scenes removed: FrontOfHouseScene, InteriorScene, WoodsScene, BackyardScene, EarlsYardScene
    scene: [RoomScene, UIScene, AlienRoomScene],
    input: { activePointers: 1 }
};

// Wait for the custom font to load before starting the game
document.fonts.load('16px "Press Start 2P"').then(() => {
    const game = new Phaser.Game(config);

    // Initialize audio manager once game is ready
    game.events.once('ready', () => {
        TSH.Audio.init(game);
    });
});
