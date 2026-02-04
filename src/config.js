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
    scene: [RoomScene, FrontOfHouseScene, InteriorScene, WoodsScene, LaboratoryScene, BackyardScene, EarlsYardScene, AlienRoomScene],
    input: { activePointers: 1 }
};

// Wait for the custom font to load before starting the game
document.fonts.load('16px "Press Start 2P"').then(() => {
    new Phaser.Game(config);
});
