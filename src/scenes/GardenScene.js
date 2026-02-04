        // Room ID: 'front_of_house'
        class FrontOfHouseScene extends BaseScene {
            constructor() {
                super({ key: 'front_of_house' });
                this.worldWidth = 1280;
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.70, maxY: 0.92 };
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                return [
                    {
                        x: 1050, y: height * 0.45, w: 100, h: height * 0.30,
                        interactX: 980, interactY: height * 0.75,
                        name: 'Front Door',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "The front door. Looks warmer inside than out here.",
                        useResponse: "TRANSITION_TO_HOUSE",
                        talkResponse: "Open up! ...Oh wait, I can just use you."
                    },
                    {
                        x: 180, y: height * 0.72, w: 140, h: height * 0.18,
                        interactX: 250, interactY: height * 0.80,
                        name: 'Rose Bush',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Thorny roses. Beautiful but deadly. Nature's way of saying 'look, don't touch.'",
                        useResponse: "Ouch! These thorns are vicious. Better admire from afar.",
                        talkResponse: "Hey roses. Looking sharp tonight. Literally."
                    },
                    {
                        x: 640, y: height * 0.85, w: 400, h: height * 0.10,
                        interactX: 640, interactY: height * 0.82,
                        name: 'Garden Path',
                        verbLabels: { actionVerb: 'Walk on', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A winding dirt path. It's seen better days, much like this garden.",
                        useResponse: "Walking on it now. Mission accomplished.",
                        talkResponse: "Where do you lead, mysterious path? ...To the house, apparently."
                    },
                    {
                        x: 100, y: height * 0.35, w: 200, h: height * 0.30,
                        interactX: 200, interactY: height * 0.75,
                        name: 'Dark Woods',
                        verbLabels: { actionVerb: 'Enter', lookVerb: 'Peer into', talkVerb: 'Call out to' },
                        lookResponse: "Dense, dark woods. Probably full of wolves. Or worse, squirrels with attitude.",
                        useResponse: "TRANSITION_TO_FOREST",
                        talkResponse: "Hello darkness, my old friend..."
                    },
                    {
                        x: 450, y: height * 0.65, w: 80, h: height * 0.15,
                        interactX: 450, interactY: height * 0.78,
                        name: 'Garden Statue',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A cherub statue. Its blank eyes follow me everywhere. Creepy.",
                        useResponse: "It's cemented in place. Probably for the best.",
                        talkResponse: "Any secrets to share? No? Just gonna stare? Okay then."
                    }
                ];
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup (single screen, no scroll)
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - cool moonlit exterior
                this.lights.enable();
                const isMobile = this.sys.game.device.input.touch;
                this.lights.setAmbientColor(isMobile ? 0x9a9aba : 0x7a7a9a); // Brighter on mobile

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create edge zones for scene transitions
                this.createEdgeZones(height);

                // Create player at spawn position
                const spawnPoint = this.getSpawnPoint();
                let spawnX = 640;
                if (spawnPoint === 'from_house') spawnX = 900;
                else if (spawnPoint === 'from_forest') spawnX = 120;
                else if (spawnPoint === 'left') spawnX = 100;

                this.createPlayer(spawnX, height * 0.80);

                // Mark room as visited
                if (!TSH.State.hasVisitedRoom('front_of_house')) {
                    TSH.State.markRoomVisited('front_of_house');
                    this.showDialog("Ah, fresh night air. And the faint smell of roses and mystery.");
                }
            }

            // Room-specific background - Victorian house exterior at night
            drawRoom(worldWidth, height) {
                if (this.textures.exists('gardenBackground')) {
                    this.textures.remove('gardenBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Night sky gradient
                g.fillStyle(0x0a0a1a);
                g.fillRect(0, 0, worldWidth, height * 0.50);
                g.fillStyle(0x101025);
                g.fillRect(0, height * 0.25, worldWidth, height * 0.25);

                // Stars
                g.fillStyle(0xffffff);
                const starPositions = [
                    [50, 40], [120, 80], [200, 30], [280, 90], [350, 50],
                    [420, 70], [500, 25], [580, 85], [650, 45], [720, 95],
                    [800, 35], [880, 75], [950, 55], [1020, 40], [1100, 80],
                    [1180, 30], [1250, 65], [70, 120], [330, 110], [590, 130],
                    [850, 115], [1110, 105]
                ];
                starPositions.forEach(([x, y]) => {
                    const size = Math.random() > 0.7 ? 2 : 1;
                    g.fillCircle(x, y, size);
                });

                // Moon
                g.fillStyle(0xeeeedd);
                g.fillCircle(200, 100, 40);
                g.fillStyle(0xddddcc);
                g.fillCircle(190, 95, 8);
                g.fillCircle(210, 110, 6);
                g.fillCircle(195, 115, 4);

                // Dark woods (background, left side)
                g.fillStyle(0x0a1a0a);
                g.fillRect(0, height * 0.20, 350, height * 0.55);
                // Tree silhouettes
                g.fillStyle(0x051505);
                g.fillTriangle(50, height * 0.20, 0, height * 0.55, 100, height * 0.55);
                g.fillTriangle(120, height * 0.15, 60, height * 0.55, 180, height * 0.55);
                g.fillTriangle(200, height * 0.18, 140, height * 0.55, 260, height * 0.55);
                g.fillTriangle(280, height * 0.22, 220, height * 0.55, 340, height * 0.55);
                g.fillStyle(0x0a1a0a);
                g.fillTriangle(80, height * 0.25, 30, height * 0.55, 130, height * 0.55);
                g.fillTriangle(160, height * 0.20, 100, height * 0.55, 220, height * 0.55);
                g.fillTriangle(240, height * 0.23, 180, height * 0.55, 300, height * 0.55);

                // Ground/grass
                g.fillStyle(0x1a2a1a);
                g.fillRect(0, height * 0.70, worldWidth, height * 0.30);
                // Grass texture
                g.fillStyle(0x152515);
                for (let x = 0; x < worldWidth; x += 30) {
                    g.fillRect(x, height * 0.70, 15, height * 0.30);
                }

                // Garden path (dirt)
                g.fillStyle(0x3a2a1a);
                g.fillRect(400, height * 0.75, 500, height * 0.20);
                g.fillStyle(0x2a1a0a);
                for (let x = 420; x < 880; x += 60) {
                    g.fillCircle(x, height * 0.85, 8);
                }

                // Victorian House (right side)
                // Main structure
                g.fillStyle(0x3a3a4a);
                g.fillRect(850, height * 0.25, 400, height * 0.50);

                // Roof
                g.fillStyle(0x2a2a3a);
                g.fillTriangle(850, height * 0.25, 1050, height * 0.08, 1250, height * 0.25);
                // Roof shingles
                g.fillStyle(0x252535);
                for (let y = height * 0.12; y < height * 0.25; y += 15) {
                    const leftX = 850 + (1050 - 850) * (1 - (y - height * 0.08) / (height * 0.17));
                    const rightX = 1250 - (1250 - 1050) * (1 - (y - height * 0.08) / (height * 0.17));
                    g.fillRect(leftX, y, rightX - leftX, 8);
                }

                // Chimney
                g.fillStyle(0x4a3a3a);
                g.fillRect(1150, height * 0.05, 40, height * 0.15);
                g.fillStyle(0x5a4a4a);
                g.fillRect(1145, height * 0.03, 50, 10);

                // Windows (upper floor)
                g.fillStyle(0x1a1a2a);
                g.fillRect(900, height * 0.30, 60, 70);
                g.fillRect(1000, height * 0.30, 60, 70);
                g.fillRect(1140, height * 0.30, 60, 70);
                // Window frames
                g.lineStyle(3, 0x5a4a3a, 1);
                g.strokeRect(900, height * 0.30, 60, 70);
                g.strokeRect(1000, height * 0.30, 60, 70);
                g.strokeRect(1140, height * 0.30, 60, 70);
                // Window glow
                g.fillStyle(0x3a3a5a, 0.3);
                g.fillRect(902, height * 0.31, 56, 66);
                g.fillRect(1002, height * 0.31, 56, 66);
                // Window panes
                g.lineStyle(2, 0x4a3a2a, 1);
                g.moveTo(930, height * 0.30); g.lineTo(930, height * 0.30 + 70);
                g.moveTo(900, height * 0.30 + 35); g.lineTo(960, height * 0.30 + 35);
                g.moveTo(1030, height * 0.30); g.lineTo(1030, height * 0.30 + 70);
                g.moveTo(1000, height * 0.30 + 35); g.lineTo(1060, height * 0.30 + 35);
                g.moveTo(1170, height * 0.30); g.lineTo(1170, height * 0.30 + 70);
                g.moveTo(1140, height * 0.30 + 35); g.lineTo(1200, height * 0.30 + 35);
                g.strokePath();

                // Front door
                g.fillStyle(0x4a3020);
                g.fillRect(1000, height * 0.48, 80, height * 0.27);
                g.fillStyle(0x3a2010);
                g.fillRect(1010, height * 0.52, 25, height * 0.08);
                g.fillRect(1045, height * 0.52, 25, height * 0.08);
                g.fillRect(1010, height * 0.64, 25, height * 0.08);
                g.fillRect(1045, height * 0.64, 25, height * 0.08);
                g.fillStyle(0xc0a060);
                g.fillCircle(1065, height * 0.60, 5);
                g.lineStyle(3, 0x2a1808, 1);
                g.strokeRect(1000, height * 0.48, 80, height * 0.27);
                // Door frame
                g.fillStyle(0x5a4a3a);
                g.fillRect(990, height * 0.45, 100, 10);
                g.fillRect(990, height * 0.45, 8, height * 0.30);
                g.fillRect(1082, height * 0.45, 8, height * 0.30);

                // Porch
                g.fillStyle(0x4a3a2a);
                g.fillRect(950, height * 0.72, 180, height * 0.08);
                g.fillStyle(0x3a2a1a);
                g.fillRect(950, height * 0.72, 180, 5);

                // Rose bush (left of path)
                g.fillStyle(0x1a3a1a);
                g.fillCircle(150, height * 0.72, 50);
                g.fillCircle(200, height * 0.70, 45);
                g.fillCircle(120, height * 0.74, 35);
                // Roses
                g.fillStyle(0x8a2a3a);
                g.fillCircle(140, height * 0.68, 8);
                g.fillCircle(180, height * 0.66, 7);
                g.fillCircle(160, height * 0.72, 9);
                g.fillCircle(200, height * 0.70, 6);
                g.fillCircle(130, height * 0.75, 7);

                // Garden statue (cherub)
                g.fillStyle(0x7a7a8a);
                g.fillRect(440, height * 0.68, 20, height * 0.12);
                g.fillCircle(450, height * 0.65, 15);
                g.fillStyle(0x6a6a7a);
                g.fillCircle(445, height * 0.64, 4);
                g.fillCircle(455, height * 0.64, 4);

                // Lamp post near path
                g.fillStyle(0x2a2a2a);
                g.fillRect(380, height * 0.45, 8, height * 0.30);
                g.fillStyle(0x3a3a3a);
                g.fillRect(370, height * 0.42, 28, 20);
                g.fillStyle(0xffdd88);
                g.fillRect(375, height * 0.44, 18, 14);

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('gardenBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'gardenBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            // Room-specific lighting
            createLighting(worldWidth, height) {
                // Main moonlight - bright cool blue, large soft radius
                this.moonLight = this.lights.addLight(200, 100, 600, 0x8899cc, 0.9);
                // Secondary moon fill - very large for ambient moonlit feel
                this.moonFill = this.lights.addLight(640, height * 0.30, 800, 0x6677aa, 0.4);

                // Lamp post light - warm contrast to moonlight
                this.lampLight = this.lights.addLight(384, height * 0.50, 300, 0xffdd88, 1.1);
                this.lampLightBaseIntensity = 1.1;

                // Window glow from house - warm interior visible
                this.windowGlow1 = this.lights.addLight(930, height * 0.35, 150, 0x6677bb, 0.5);
                this.windowGlow2 = this.lights.addLight(1030, height * 0.35, 150, 0x6677bb, 0.5);

                // Door light - warm spill from interior
                this.doorLight = this.lights.addLight(1040, height * 0.58, 220, 0xffaa66, 0.7);

                // Ground fill for walkable area visibility
                this.groundFill = this.lights.addLight(640, height * 0.85, 600, 0x5566aa, 0.25);

                this.createLightBloom(height);
            }

            createLightBloom(height) {
                // Multi-layer moon glow for soft atmospheric effect
                const moonBloom1 = this.add.graphics();
                moonBloom1.fillStyle(0x8899cc, 0.08);
                moonBloom1.fillCircle(0, 0, 100);
                moonBloom1.setPosition(200, 100);
                moonBloom1.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom1.setDepth(1);

                const moonBloom2 = this.add.graphics();
                moonBloom2.fillStyle(0x6688bb, 0.06);
                moonBloom2.fillCircle(0, 0, 200);
                moonBloom2.setPosition(200, 100);
                moonBloom2.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom2.setDepth(1);

                const moonBloom3 = this.add.graphics();
                moonBloom3.fillStyle(0x5577aa, 0.04);
                moonBloom3.fillCircle(0, 0, 300);
                moonBloom3.setPosition(200, 100);
                moonBloom3.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom3.setDepth(1);

                // Multi-layer lamp glow for soft warm halo
                this.lampBloom1 = this.add.graphics();
                this.lampBloom1.fillStyle(0xffee99, 0.12);
                this.lampBloom1.fillCircle(0, 0, 50);
                this.lampBloom1.setPosition(384, height * 0.50);
                this.lampBloom1.setBlendMode(Phaser.BlendModes.ADD);
                this.lampBloom1.setDepth(1);

                this.lampBloom2 = this.add.graphics();
                this.lampBloom2.fillStyle(0xffdd88, 0.08);
                this.lampBloom2.fillCircle(0, 0, 100);
                this.lampBloom2.setPosition(384, height * 0.50);
                this.lampBloom2.setBlendMode(Phaser.BlendModes.ADD);
                this.lampBloom2.setDepth(1);

                this.lampBloom3 = this.add.graphics();
                this.lampBloom3.fillStyle(0xffcc66, 0.05);
                this.lampBloom3.fillCircle(0, 0, 160);
                this.lampBloom3.setPosition(384, height * 0.50);
                this.lampBloom3.setBlendMode(Phaser.BlendModes.ADD);
                this.lampBloom3.setDepth(1);

                // Door warm glow spill
                const doorBloom = this.add.graphics();
                doorBloom.fillStyle(0xffaa66, 0.08);
                doorBloom.fillCircle(0, 0, 100);
                doorBloom.setPosition(1040, height * 0.58);
                doorBloom.setBlendMode(Phaser.BlendModes.ADD);
                doorBloom.setDepth(1);
            }

            // Edge zones for scene transitions
            createEdgeZones(height) {
                // Left edge zone (exit to forest)
                this.leftEdgeZone = this.add.zone(40, height * 0.5, 80, height)
                    .setInteractive()
                    .setOrigin(0.5);

                this.leftEdgeZone.on('pointerover', () => {
                    if (!this.inventoryOpen && !this.verbCoinVisible) {
                        this.edgeHovered = 'left';
                        this.showArrowCursor('left');
                    }
                });

                this.leftEdgeZone.on('pointerout', () => {
                    this.edgeHovered = null;
                    this.hideArrowCursor();
                });

                this.leftEdgeZone.on('pointerdown', (pointer) => {
                    if (this.inventoryOpen) return;

                    // Prevent main input handler from overriding our walk
                    this.clickedUI = true;

                    const currentTime = Date.now();
                    const isDoubleClick = (currentTime - (this.edgeClickTime || 0)) < 300;
                    this.edgeClickTime = currentTime;

                    if (isDoubleClick) {
                        // Immediate transition
                        this.hideArrowCursor();
                        this.transitionToScene('woods', 'from_garden');
                    } else {
                        // Walk to edge then transition
                        this.hideArrowCursor();
                        this.walkToEdgeAndTransition(80, height * 0.80, 'woods', 'from_garden');
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
                if (action === 'Use') {
                    if (hotspot.name === 'Front Door') {
                        this.transitionToScene('interior', 'left');
                    } else {
                        this.showDialog(hotspot.useResponse);
                    }
                } else if (action === 'Look At') {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Talk To') {
                    this.showDialog(hotspot.talkResponse);
                }
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Front Door') {
                    this.showDialog("The door's not locked. I can just use it.");
                } else if (hotspot.name === 'Rose Bush') {
                    this.showDialog(`Using ${item.name} on roses? That's not how gardening works.`);
                } else {
                    this.showDialog(`That doesn't work.`);
                }
            }

            update() {
                super.update();

                // Organic lamp flicker - gas lamp style
                if (this.lampLight) {
                    const time = this.time.now * 0.001;

                    // Multiple frequencies for organic flicker
                    const flicker1 = Math.sin(time * 5) * 0.08;
                    const flicker2 = Math.sin(time * 11 + 0.7) * 0.05;
                    const flicker3 = Math.sin(time * 19 + 1.3) * 0.03;
                    const totalFlicker = flicker1 + flicker2 + flicker3;

                    this.lampLight.intensity = this.lampLightBaseIntensity + totalFlicker;

                    // Animate lamp bloom opacity
                    if (this.lampBloom1) {
                        this.lampBloom1.setAlpha(0.9 + totalFlicker * 0.3);
                        this.lampBloom2.setAlpha(0.8 + totalFlicker * 0.25);
                    }
                }
            }
        }

        // ============================================================================
        // FOREST SCENE - Dark Spooky Forest with Graveyard (extends BaseScene)
        // ============================================================================
