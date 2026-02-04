        // Room ID: 'woods'
        class WoodsScene extends BaseScene {
            constructor() {
                super({ key: 'woods' });
                this.worldWidth = 3840; // 3x screen width
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.72, maxY: 0.94 };
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                return [
                    {
                        x: 600, y: height * 0.65, w: 120, h: height * 0.25,
                        interactX: 650, interactY: height * 0.82,
                        name: 'Twisted Oak',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "An ancient oak, gnarled and twisted. Its branches look like reaching fingers.",
                        useResponse: "The bark feels... warm? That's not normal for a tree.",
                        talkResponse: "Psst. Hey tree. Blink twice if you're alive. ...Okay, good talk."
                    },
                    {
                        x: 1200, y: height * 0.72, w: 80, h: height * 0.15,
                        interactX: 1250, interactY: height * 0.82,
                        name: 'Old Tombstone',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Read', talkVerb: 'Talk to' },
                        lookResponse: "RIP Bartholomew Grimshaw, 1823-1867. 'He finally got some peace and quiet.'",
                        useResponse: "Not touching that. Learned my lesson from that zombie movie.",
                        talkResponse: "Hello? Mr. Grimshaw? ...No answer. Phew. I mean, how sad."
                    },
                    {
                        x: 1500, y: height * 0.70, w: 70, h: height * 0.18,
                        interactX: 1550, interactY: height * 0.82,
                        name: 'Crooked Headstone',
                        verbLabels: { actionVerb: 'Push', lookVerb: 'Read', talkVerb: 'Talk to' },
                        lookResponse: "A weathered stone. The inscription reads: 'I told you I was sick.'",
                        useResponse: "It wobbles slightly. I'd rather not disturb the occupant.",
                        talkResponse: "Any wisdom from beyond the grave? ...Just an awkward silence? Fair enough."
                    },
                    {
                        x: 2200, y: height * 0.55, w: 100, h: height * 0.30,
                        interactX: 2250, interactY: height * 0.80,
                        name: 'Wisp Light',
                        verbLabels: { actionVerb: 'Catch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A floating ball of ethereal light. Either supernatural or very lost fireflies.",
                        useResponse: "It drifts away as I reach for it. Playing hard to get, I see.",
                        talkResponse: "Take me to your leader! ...It just bobs there judgmentally."
                    },
                    {
                        x: 2800, y: height * 0.60, w: 150, h: height * 0.28,
                        interactX: 2750, interactY: height * 0.82,
                        name: 'Dead Tree',
                        verbLabels: { actionVerb: 'Shake', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A skeletal tree, completely dead. Ravens have made it their home.",
                        useResponse: "I shake the trunk. A raven caws angrily. Point taken.",
                        talkResponse: "Caw caw? ...The ravens don't seem impressed by my bird impression."
                    },
                    {
                        x: 1800, y: height * 0.74, w: 90, h: height * 0.12,
                        interactX: 1800, interactY: height * 0.82,
                        name: 'Freshly Dug Grave',
                        verbLabels: { actionVerb: 'Dig', lookVerb: 'Examine', talkVerb: 'Call out to' },
                        lookResponse: "A fresh grave. The dirt is still loose. I'm sure there's a perfectly normal explanation.",
                        useResponse: "Nope. Not digging. Some mysteries are better left buried. Literally.",
                        talkResponse: "Anyone down there? ...I'm going to assume that silence is good news."
                    }
                ];
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup for wide scrolling scene
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - spooky forest ambient (bright but eerie)
                this.lights.enable();
                const isMobile = this.sys.game.device.input.touch;
                this.lights.setAmbientColor(isMobile ? 0x8a8aaa : 0x6a6a8a); // Brighter on mobile

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Create fog effects
                this.createFogEffects(height);

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create edge transition zones
                this.createEdgeZones(height);

                // Create player at spawn position
                const spawnPoint = this.getSpawnPoint();
                let spawnX = this.worldWidth / 2;
                if (spawnPoint === 'from_garden') spawnX = this.worldWidth - 150;
                else if (spawnPoint === 'left') spawnX = 150;

                this.createPlayer(spawnX, height * 0.82);

                // Center camera on player
                this.cameras.main.scrollX = Phaser.Math.Clamp(
                    spawnX - this.screenWidth / 2, 0, this.worldWidth - this.screenWidth
                );

                // Mark room as visited
                if (!TSH.State.hasVisitedRoom('woods')) {
                    TSH.State.markRoomVisited('woods');
                    this.showDialog("Well, this isn't creepy at all. Said no one, ever.");
                }
            }

            // Room-specific background - Dark spooky forest with graveyard
            drawRoom(worldWidth, height) {
                if (this.textures.exists('forestBackground')) {
                    this.textures.remove('forestBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Very dark sky
                g.fillStyle(0x050510);
                g.fillRect(0, 0, worldWidth, height * 0.60);
                g.fillStyle(0x0a0a15);
                g.fillRect(0, height * 0.30, worldWidth, height * 0.30);

                // Sparse stars (barely visible through canopy)
                g.fillStyle(0x333355);
                const starPositions = [
                    [200, 50], [800, 80], [1500, 40], [2200, 70], [2900, 55],
                    [500, 100], [1200, 90], [1900, 60], [2600, 85], [3400, 45],
                    [100, 120], [700, 110], [1400, 130], [2100, 95], [3000, 115]
                ];
                starPositions.forEach(([x, y]) => {
                    g.fillCircle(x, y, 1);
                });

                // Eerie moon (partially hidden)
                g.fillStyle(0x334455);
                g.fillCircle(2400, 80, 50);
                g.fillStyle(0x050510);
                g.fillCircle(2430, 70, 45); // Moon shadow

                // Forest ground - dark earth
                g.fillStyle(0x0a0f0a);
                g.fillRect(0, height * 0.72, worldWidth, height * 0.28);
                // Ground texture
                g.fillStyle(0x080c08);
                for (let x = 0; x < worldWidth; x += 40) {
                    g.fillRect(x, height * 0.72, 20, height * 0.28);
                }

                // Dirt path through forest
                g.fillStyle(0x1a1510);
                g.fillRect(0, height * 0.80, worldWidth, height * 0.12);
                g.fillStyle(0x151008);
                for (let x = 50; x < worldWidth; x += 80) {
                    g.fillCircle(x, height * 0.86, 6);
                }

                // ===== FAR BACKGROUND TREES (silhouettes) =====
                g.fillStyle(0x080808);
                for (let x = 0; x < worldWidth; x += 200) {
                    const treeHeight = height * (0.35 + Math.random() * 0.15);
                    const baseY = height * 0.60;
                    // Trunk
                    g.fillRect(x + 90, baseY - treeHeight * 0.5, 20, treeHeight * 0.5);
                    // Canopy layers
                    g.fillTriangle(x + 100, baseY - treeHeight, x + 50, baseY - treeHeight * 0.4, x + 150, baseY - treeHeight * 0.4);
                    g.fillTriangle(x + 100, baseY - treeHeight * 0.7, x + 40, baseY - treeHeight * 0.2, x + 160, baseY - treeHeight * 0.2);
                }

                // ===== GRAVEYARD SECTION (center-left area: 900-2100) =====
                // Iron fence
                g.fillStyle(0x1a1a1a);
                g.fillRect(900, height * 0.68, 1200, 8);
                g.fillStyle(0x252525);
                for (let x = 920; x < 2100; x += 60) {
                    g.fillRect(x, height * 0.55, 6, height * 0.15);
                    // Fence spike tops
                    g.fillTriangle(x + 3, height * 0.52, x - 2, height * 0.55, x + 8, height * 0.55);
                }

                // Tombstones
                this.drawTombstone(g, 1000, height, 0.70, 'cross');
                this.drawTombstone(g, 1200, height, 0.72, 'rounded');
                this.drawTombstone(g, 1400, height, 0.69, 'pointed');
                this.drawTombstone(g, 1500, height, 0.71, 'rounded');
                this.drawTombstone(g, 1700, height, 0.70, 'cross');
                this.drawTombstone(g, 1900, height, 0.72, 'pointed');

                // Freshly dug grave (dirt mound)
                g.fillStyle(0x1a120a);
                g.fillRect(1750, height * 0.76, 100, height * 0.06);
                g.fillStyle(0x251a10);
                g.fillRect(1760, height * 0.74, 80, height * 0.04);
                // Shovel
                g.fillStyle(0x3a3a3a);
                g.fillRect(1860, height * 0.60, 6, height * 0.20);
                g.fillStyle(0x555555);
                g.fillRect(1855, height * 0.78, 16, 20);

                // ===== TWISTED TREES =====
                // Twisted Oak (left section)
                this.drawTwistedTree(g, 550, height, 0.72, 0x1a1008, 0x0a0804);

                // Dead tree with ravens (right section)
                this.drawDeadTree(g, 2800, height, 0.72);

                // More atmospheric trees
                this.drawTwistedTree(g, 150, height, 0.68, 0x151008, 0x0a0804);
                this.drawTwistedTree(g, 3200, height, 0.70, 0x181008, 0x0a0804);
                this.drawTwistedTree(g, 3500, height, 0.69, 0x141008, 0x0a0804);

                // ===== FOREGROUND ELEMENTS =====
                // Mushrooms (bioluminescent hints)
                g.fillStyle(0x1a2a1a);
                g.fillCircle(300, height * 0.88, 8);
                g.fillCircle(310, height * 0.89, 6);
                g.fillCircle(2500, height * 0.87, 7);
                g.fillCircle(3100, height * 0.89, 9);

                // Fallen log
                g.fillStyle(0x1a1008);
                g.fillRect(400, height * 0.85, 150, 25);
                g.fillStyle(0x0f0a05);
                g.fillCircle(400, height * 0.86, 12);
                g.fillCircle(550, height * 0.86, 12);

                // Rocks
                g.fillStyle(0x2a2a2a);
                g.fillCircle(100, height * 0.88, 15);
                g.fillCircle(3700, height * 0.87, 20);
                g.fillCircle(3720, height * 0.89, 12);

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('forestBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'forestBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            drawTombstone(g, x, height, yPos, style) {
                g.fillStyle(0x3a3a3a);
                if (style === 'cross') {
                    g.fillRect(x - 5, height * yPos - 60, 10, 70);
                    g.fillRect(x - 20, height * yPos - 45, 40, 10);
                } else if (style === 'rounded') {
                    g.fillRect(x - 20, height * yPos - 40, 40, 50);
                    g.fillCircle(x, height * yPos - 40, 20);
                } else if (style === 'pointed') {
                    g.fillRect(x - 18, height * yPos - 35, 36, 45);
                    g.fillTriangle(x, height * yPos - 55, x - 18, height * yPos - 35, x + 18, height * yPos - 35);
                }
                // Weathering
                g.fillStyle(0x2a2a2a);
                g.fillRect(x - 15, height * yPos - 20, 5, 15);
                g.fillRect(x + 5, height * yPos - 30, 8, 10);
            }

            drawTwistedTree(g, x, height, groundY, trunkColor, darkColor) {
                // Gnarled trunk
                g.fillStyle(trunkColor);
                g.fillRect(x - 15, height * groundY - 180, 30, 190);
                g.fillRect(x - 25, height * groundY - 150, 50, 30);

                // Twisted branches
                g.fillStyle(darkColor);
                // Main branches
                g.fillTriangle(x, height * groundY - 180, x - 80, height * groundY - 250, x - 60, height * groundY - 200);
                g.fillTriangle(x, height * groundY - 170, x + 90, height * groundY - 230, x + 70, height * groundY - 190);
                g.fillTriangle(x, height * groundY - 160, x - 50, height * groundY - 280, x - 30, height * groundY - 220);
                g.fillTriangle(x, height * groundY - 150, x + 60, height * groundY - 270, x + 40, height * groundY - 200);

                // Reaching finger-like twigs
                g.fillStyle(0x0a0804);
                for (let i = 0; i < 5; i++) {
                    const branchX = x - 70 + i * 35;
                    const branchY = height * groundY - 240 - Math.random() * 40;
                    g.fillRect(branchX, branchY, 3, 25 + Math.random() * 15);
                }

                // Roots
                g.fillStyle(trunkColor);
                g.fillTriangle(x - 25, height * groundY, x - 50, height * groundY + 10, x - 15, height * groundY);
                g.fillTriangle(x + 25, height * groundY, x + 50, height * groundY + 10, x + 15, height * groundY);
            }

            drawDeadTree(g, x, height, groundY) {
                // Skeletal trunk
                g.fillStyle(0x1a1510);
                g.fillRect(x - 20, height * groundY - 200, 40, 210);

                // Bare branches
                g.fillStyle(0x151008);
                g.fillRect(x - 100, height * groundY - 180, 80, 8);
                g.fillRect(x + 20, height * groundY - 160, 90, 8);
                g.fillRect(x - 70, height * groundY - 140, 60, 6);
                g.fillRect(x + 30, height * groundY - 190, 70, 6);

                // Branch ends
                g.fillRect(x - 100, height * groundY - 200, 6, 25);
                g.fillRect(x + 100, height * groundY - 175, 6, 20);
                g.fillRect(x - 70, height * groundY - 160, 5, 25);
                g.fillRect(x + 90, height * groundY - 205, 5, 20);

                // Ravens (silhouettes)
                g.fillStyle(0x0a0a0a);
                g.fillCircle(x - 90, height * groundY - 185, 8);
                g.fillTriangle(x - 100, height * groundY - 185, x - 90, height * groundY - 190, x - 90, height * groundY - 180);
                g.fillCircle(x + 85, height * groundY - 165, 7);
                g.fillTriangle(x + 75, height * groundY - 165, x + 85, height * groundY - 170, x + 85, height * groundY - 160);
            }

            // Room-specific lighting
            createLighting(worldWidth, height) {
                // Moonlight filtering through trees - multiple sources for varied lighting
                this.moonLight = this.lights.addLight(2400, 80, 700, 0x5566aa, 0.5);
                this.moonFill1 = this.lights.addLight(800, height * 0.30, 500, 0x4455aa, 0.3);
                this.moonFill2 = this.lights.addLight(2000, height * 0.25, 600, 0x4455aa, 0.35);

                // Eerie wisp lights (ghostly green/cyan) - larger radius, brighter
                this.wispLight1 = this.lights.addLight(600, height * 0.50, 250, 0x55ffaa, 0.8);
                this.wispLight2 = this.lights.addLight(2200, height * 0.55, 280, 0x77ffcc, 0.9);
                this.wispLight3 = this.lights.addLight(3000, height * 0.48, 220, 0x99ffdd, 0.7);

                // Base intensities for pulsing animation
                this.wispBaseIntensity1 = 0.8;
                this.wispBaseIntensity2 = 0.9;
                this.wispBaseIntensity3 = 0.7;

                // Graveyard ambient (cold blue) - brighter for visibility
                this.graveyardLight = this.lights.addLight(1500, height * 0.70, 600, 0x4455bb, 0.45);

                // Mushroom glow - bioluminescent feel
                this.mushroomGlow1 = this.lights.addLight(305, height * 0.86, 100, 0x55cc77, 0.5);
                this.mushroomGlow2 = this.lights.addLight(2500, height * 0.85, 80, 0x55cc77, 0.4);

                // General fill for visibility in dark areas
                this.fillLight1 = this.lights.addLight(400, height * 0.70, 400, 0x445566, 0.25);
                this.fillLight2 = this.lights.addLight(1200, height * 0.70, 400, 0x445566, 0.25);
                this.fillLight3 = this.lights.addLight(2600, height * 0.70, 400, 0x445566, 0.25);
                this.fillLight4 = this.lights.addLight(3400, height * 0.70, 400, 0x445566, 0.25);

                this.createLightBloom(height);
            }

            createLightBloom(height) {
                // Multi-layer wisp blooms for ethereal glow effect
                // Wisp 1 - inner bright, outer soft
                this.wispBloom1Inner = this.add.graphics();
                this.wispBloom1Inner.fillStyle(0x55ffaa, 0.15);
                this.wispBloom1Inner.fillCircle(0, 0, 60);
                this.wispBloom1Inner.setPosition(600, height * 0.50);
                this.wispBloom1Inner.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom1Inner.setDepth(1);

                this.wispBloom1 = this.add.graphics();
                this.wispBloom1.fillStyle(0x44ff88, 0.08);
                this.wispBloom1.fillCircle(0, 0, 120);
                this.wispBloom1.setPosition(600, height * 0.50);
                this.wispBloom1.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom1.setDepth(1);

                this.wispBloom1Outer = this.add.graphics();
                this.wispBloom1Outer.fillStyle(0x33dd77, 0.04);
                this.wispBloom1Outer.fillCircle(0, 0, 180);
                this.wispBloom1Outer.setPosition(600, height * 0.50);
                this.wispBloom1Outer.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom1Outer.setDepth(1);

                // Wisp 2
                this.wispBloom2Inner = this.add.graphics();
                this.wispBloom2Inner.fillStyle(0x77ffcc, 0.18);
                this.wispBloom2Inner.fillCircle(0, 0, 70);
                this.wispBloom2Inner.setPosition(2200, height * 0.55);
                this.wispBloom2Inner.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom2Inner.setDepth(1);

                this.wispBloom2 = this.add.graphics();
                this.wispBloom2.fillStyle(0x66ffaa, 0.10);
                this.wispBloom2.fillCircle(0, 0, 140);
                this.wispBloom2.setPosition(2200, height * 0.55);
                this.wispBloom2.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom2.setDepth(1);

                this.wispBloom2Outer = this.add.graphics();
                this.wispBloom2Outer.fillStyle(0x55dd99, 0.05);
                this.wispBloom2Outer.fillCircle(0, 0, 200);
                this.wispBloom2Outer.setPosition(2200, height * 0.55);
                this.wispBloom2Outer.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom2Outer.setDepth(1);

                // Wisp 3
                this.wispBloom3Inner = this.add.graphics();
                this.wispBloom3Inner.fillStyle(0x99ffdd, 0.12);
                this.wispBloom3Inner.fillCircle(0, 0, 50);
                this.wispBloom3Inner.setPosition(3000, height * 0.48);
                this.wispBloom3Inner.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom3Inner.setDepth(1);

                this.wispBloom3 = this.add.graphics();
                this.wispBloom3.fillStyle(0x88ffcc, 0.08);
                this.wispBloom3.fillCircle(0, 0, 100);
                this.wispBloom3.setPosition(3000, height * 0.48);
                this.wispBloom3.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom3.setDepth(1);

                this.wispBloom3Outer = this.add.graphics();
                this.wispBloom3Outer.fillStyle(0x77ddbb, 0.04);
                this.wispBloom3Outer.fillCircle(0, 0, 150);
                this.wispBloom3Outer.setPosition(3000, height * 0.48);
                this.wispBloom3Outer.setBlendMode(Phaser.BlendModes.ADD);
                this.wispBloom3Outer.setDepth(1);

                // Moon glow - multi-layer for soft atmospheric effect
                const moonBloom1 = this.add.graphics();
                moonBloom1.fillStyle(0x5566aa, 0.08);
                moonBloom1.fillCircle(0, 0, 120);
                moonBloom1.setPosition(2400, 80);
                moonBloom1.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom1.setDepth(1);

                const moonBloom2 = this.add.graphics();
                moonBloom2.fillStyle(0x445588, 0.05);
                moonBloom2.fillCircle(0, 0, 200);
                moonBloom2.setPosition(2400, 80);
                moonBloom2.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom2.setDepth(1);

                // Mushroom glow halos
                const mushroomBloom1 = this.add.graphics();
                mushroomBloom1.fillStyle(0x55cc77, 0.1);
                mushroomBloom1.fillCircle(0, 0, 50);
                mushroomBloom1.setPosition(305, height * 0.86);
                mushroomBloom1.setBlendMode(Phaser.BlendModes.ADD);
                mushroomBloom1.setDepth(1);

                const mushroomBloom2 = this.add.graphics();
                mushroomBloom2.fillStyle(0x55cc77, 0.08);
                mushroomBloom2.fillCircle(0, 0, 40);
                mushroomBloom2.setPosition(2500, height * 0.85);
                mushroomBloom2.setBlendMode(Phaser.BlendModes.ADD);
                mushroomBloom2.setDepth(1);
            }

            createFogEffects(height) {
                // Ground fog layers
                this.fogLayers = [];

                for (let i = 0; i < 4; i++) {
                    const fog = this.add.graphics();
                    fog.fillStyle(0x1a1a2a, 0.15 - i * 0.03);

                    // Draw wavy fog
                    for (let x = 0; x < this.worldWidth; x += 200) {
                        const yOffset = Math.sin(x * 0.01 + i) * 10;
                        fog.fillEllipse(x, height * (0.78 + i * 0.03) + yOffset, 250, 30);
                    }

                    fog.setDepth(2 + i);
                    fog.setBlendMode(Phaser.BlendModes.ADD);
                    this.fogLayers.push(fog);
                }
            }

            createEdgeZones(height) {
                // Right edge zone (exit to garden)
                this.rightEdgeZone = this.add.zone(this.worldWidth - 40, height * 0.5, 80, height)
                    .setInteractive()
                    .setOrigin(0.5);

                this.rightEdgeZone.on('pointerover', () => {
                    if (!this.inventoryOpen) {
                        this.edgeHovered = 'right';
                        this.showArrowCursor('right');
                    }
                });

                this.rightEdgeZone.on('pointerout', () => {
                    this.edgeHovered = null;
                    this.hideArrowCursor();
                });

                this.rightEdgeZone.on('pointerdown', (pointer) => {
                    if (this.inventoryOpen) return;

                    // Prevent main input handler from overriding our walk
                    this.clickedUI = true;

                    const currentTime = Date.now();
                    const isDoubleClick = (currentTime - (this.edgeClickTime || 0)) < 300;
                    this.edgeClickTime = currentTime;

                    if (isDoubleClick) {
                        // Immediate transition
                        this.hideArrowCursor();
                        this.transitionToScene('front_of_house', 'from_forest');
                    } else {
                        // Walk to edge then transition
                        this.hideArrowCursor();
                        this.walkToEdgeAndTransition(this.worldWidth - 80, height * 0.82, 'front_of_house', 'from_forest');
                    }
                });
            }

            walkToEdgeAndTransition(targetX, targetY, scene, spawnPoint) {
                this.walkTo(targetX, targetY, () => {
                    this.transitionToScene(scene, spawnPoint);
                }, false);
            }

            // Room-specific action handling
            executeAction(action, hotspot) {
                if (action === 'Look At') {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Use') {
                    this.showDialog(hotspot.useResponse);
                } else if (action === 'Talk To') {
                    this.showDialog(hotspot.talkResponse);
                }
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Old Tombstone' || hotspot.name === 'Crooked Headstone') {
                    this.showDialog("Leaving offerings for the dead? How thoughtful. And creepy.");
                } else if (hotspot.name === 'Wisp Light') {
                    this.showDialog("The wisp seems unimpressed by my earthly possessions.");
                } else {
                    this.showDialog(`That doesn't seem useful here.`);
                }
            }

            update() {
                super.update();

                const { height } = this.scale;

                // Animate wisp lights with eerie slow pulsing
                if (this.wispLight1) {
                    const time = this.time.now * 0.001;

                    // Slow ethereal floating motion
                    const y1 = height * 0.50 + Math.sin(time * 0.8) * 25 + Math.sin(time * 1.7) * 10;
                    const y2 = height * 0.55 + Math.sin(time * 0.6 + 1) * 30 + Math.sin(time * 1.3) * 12;
                    const y3 = height * 0.48 + Math.sin(time * 0.9 + 2) * 20 + Math.sin(time * 2.1) * 8;

                    // Slight horizontal drift
                    const x1Drift = Math.sin(time * 0.5) * 15;
                    const x2Drift = Math.sin(time * 0.4 + 1.5) * 20;
                    const x3Drift = Math.sin(time * 0.6 + 0.8) * 12;

                    this.wispLight1.y = y1;
                    this.wispLight2.y = y2;
                    this.wispLight3.y = y3;
                    this.wispLight1.x = 600 + x1Drift;
                    this.wispLight2.x = 2200 + x2Drift;
                    this.wispLight3.x = 3000 + x3Drift;

                    // Eerie slow pulsing - different frequencies for organic feel
                    const pulse1 = Math.sin(time * 1.2) * 0.25 + Math.sin(time * 2.7) * 0.1;
                    const pulse2 = Math.sin(time * 0.9 + 0.5) * 0.3 + Math.sin(time * 2.3 + 1) * 0.12;
                    const pulse3 = Math.sin(time * 1.1 + 1.2) * 0.2 + Math.sin(time * 3.1 + 0.7) * 0.08;

                    this.wispLight1.intensity = this.wispBaseIntensity1 + pulse1;
                    this.wispLight2.intensity = this.wispBaseIntensity2 + pulse2;
                    this.wispLight3.intensity = this.wispBaseIntensity3 + pulse3;

                    // Update all bloom positions to follow lights
                    if (this.wispBloom1) {
                        this.wispBloom1.setPosition(this.wispLight1.x, y1);
                        this.wispBloom1Inner.setPosition(this.wispLight1.x, y1);
                        this.wispBloom1Outer.setPosition(this.wispLight1.x, y1);

                        this.wispBloom2.setPosition(this.wispLight2.x, y2);
                        this.wispBloom2Inner.setPosition(this.wispLight2.x, y2);
                        this.wispBloom2Outer.setPosition(this.wispLight2.x, y2);

                        this.wispBloom3.setPosition(this.wispLight3.x, y3);
                        this.wispBloom3Inner.setPosition(this.wispLight3.x, y3);
                        this.wispBloom3Outer.setPosition(this.wispLight3.x, y3);

                        // Animate bloom opacity for ethereal glow effect
                        this.wispBloom1Inner.setAlpha(0.8 + pulse1 * 0.4);
                        this.wispBloom1.setAlpha(0.6 + pulse1 * 0.3);
                        this.wispBloom1Outer.setAlpha(0.4 + pulse1 * 0.2);

                        this.wispBloom2Inner.setAlpha(0.85 + pulse2 * 0.35);
                        this.wispBloom2.setAlpha(0.65 + pulse2 * 0.25);
                        this.wispBloom2Outer.setAlpha(0.45 + pulse2 * 0.2);

                        this.wispBloom3Inner.setAlpha(0.75 + pulse3 * 0.4);
                        this.wispBloom3.setAlpha(0.55 + pulse3 * 0.3);
                        this.wispBloom3Outer.setAlpha(0.35 + pulse3 * 0.2);
                    }
                }

                // Animate fog layers (slow drift)
                if (this.fogLayers) {
                    const time = this.time.now * 0.0001;
                    this.fogLayers.forEach((fog, i) => {
                        fog.x = Math.sin(time + i * 0.7) * 40;
                    });
                }

                // Subtle mushroom glow pulse
                if (this.mushroomGlow1) {
                    const time = this.time.now * 0.001;
                    const mushroomPulse = Math.sin(time * 1.5) * 0.1;
                    this.mushroomGlow1.intensity = 0.5 + mushroomPulse;
                    this.mushroomGlow2.intensity = 0.4 + mushroomPulse * 0.8;
                }
            }
        }

        // ============================================================================
        // LABORATORY SCENE - Mad Scientist's Workshop
        // ============================================================================
