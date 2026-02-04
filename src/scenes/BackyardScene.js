        // Room ID: 'backyard'
        class BackyardScene extends BaseScene {
            constructor() {
                super({ key: 'backyard' });
                this.worldWidth = 1920; // 1.5x screen width
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.68, maxY: 0.92 };
                this.neighborVisible = false;
                this.neighborSprite = null;
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                const hotspots = [
                    {
                        x: 150, y: height * 0.45, w: 100, h: height * 0.35,
                        interactX: 220, interactY: height * 0.78,
                        name: 'Back Door',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "The door back into the house. Warm light spills out through the glass.",
                        useResponse: "TRANSITION_TO_HOUSE",
                        talkResponse: "Thanks for letting me out here, door. I needed some air."
                    },
                    {
                        x: 960, y: height * 0.78, w: 300, h: height * 0.14,
                        interactX: 960, interactY: height * 0.82,
                        name: 'Lawn',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Grass. Slightly overgrown, but it's nice to be outside. The night air is refreshing.",
                        useResponse: "I run my hand through the cool grass. Damp from the evening dew.",
                        talkResponse: "Hey grass. Keep up the good work."
                    },
                    {
                        x: 600, y: height * 0.65, w: 80, h: height * 0.20,
                        interactX: 600, interactY: height * 0.78,
                        name: 'Garden Gnome',
                        verbLabels: { actionVerb: 'Pick up', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A garden gnome with a knowing smirk. It's seen things. Things it's not telling.",
                        useResponse: "It's surprisingly heavy. And... is it glaring at me? I'll leave it.",
                        talkResponse: "What do you know, little gnome? ...Nothing? That's what they all say."
                    },
                    {
                        x: 1700, y: height * 0.40, w: 200, h: height * 0.35,
                        interactX: 1600, interactY: height * 0.78,
                        name: 'Fence',
                        isNPC: true,
                        verbLabels: { actionVerb: 'Climb', lookVerb: 'Examine', talkVerb: 'Call out' },
                        lookResponse: "A tall wooden fence. I can see warm string lights glowing over the top. Looks cozy over there.",
                        useResponse: "I could probably climb it, but that seems rude. Maybe I should just say hello?",
                        talkResponse: "START_NEIGHBOR_CONVERSATION"
                    }
                ];

                // Gate is now an edge zone, not a hotspot (created in createEdgeZones)

                return hotspots;
            }

            // Neighbor dialogue tree
            getNeighborDialogue() {
                return {
                    start: {
                        options: [
                            {
                                text: "Who are you?",
                                heroLine: "Oh! Hello there. I didn't expect... anyone. Who are you?",
                                npcResponse: "Name's Earl! Earl Henderson. Been living next door for... oh, must be twenty years now. Longer than most of the folks who've lived in that house, I'll tell you that much.",
                                setFlag: 'neighbor_asked_who',
                                condition: (scene) => !scene.getFlag('neighbor_asked_who')
                            },
                            {
                                text: "Nice night, huh?",
                                heroLine: "Nice night out, huh?",
                                npcResponse: "Sure is! Perfect for sitting on the porch with a cold one. The stars are real pretty tonight. Don't get nights like this in the city, I'll tell you that.",
                                setFlag: 'neighbor_asked_weather',
                                condition: (scene) => !scene.getFlag('neighbor_asked_weather')
                            },
                            {
                                text: "Tell me about this house.",
                                heroLine: "So... what can you tell me about this house?",
                                npcResponse: "Oh, the old place? It's got history, that one. Been through a lot of owners. Scientists, artists, one fella who collected... well, strange things. Real strange things.",
                                nextNode: 'house_questions',
                                setFlag: 'neighbor_asked_house'
                            },
                            {
                                text: "Those lights look cozy.",
                                heroLine: "I couldn't help but notice those string lights. Looks really cozy over there.",
                                npcResponse: "Oh, I put those up myself! Makes the backyard feel like a little slice of paradise. Plus I can find my way to the cooler without a flashlight, heh heh!",
                                setFlag: 'neighbor_asked_lights',
                                condition: (scene) => !scene.getFlag('neighbor_asked_lights'),
                                nextNode: 'beer_path'
                            },
                            {
                                text: "I should get going.",
                                heroLine: "Well, it was nice meeting you. I should probably head back inside.",
                                npcResponse: "Don't be a stranger now! I'm usually out here most evenings. Holler if you need anything!",
                                exit: true
                            }
                        ]
                    },
                    house_questions: {
                        options: [
                            {
                                text: "Strange things?",
                                heroLine: "What kind of strange things?",
                                npcResponse: "Oh, you know... glowing rocks, humming machines, that kind of stuff. He'd have deliveries at all hours. Big metal crates. Never did find out what happened to him. Just... gone one day.",
                                setFlag: 'neighbor_asked_strange',
                                condition: (scene) => !scene.getFlag('neighbor_asked_strange')
                            },
                            {
                                text: "Any weird occurrences?",
                                heroLine: "Has anything... weird ever happened around here?",
                                npcResponse: "Weird? Well, there was that one time the power went out in the whole neighborhood, but just for a second. And the sky turned this funny color. Purple, I think. But that was probably just a storm, right?",
                                setFlag: 'neighbor_asked_weird',
                                condition: (scene) => !scene.getFlag('neighbor_asked_weird')
                            },
                            {
                                text: "Who lives here now?",
                                heroLine: "Who owns the place now?",
                                npcResponse: "Some scientist fella moved in a few years back. Keeps to himself mostly. Nice enough when you catch him outside. Bit scattered, if you know what I mean. Always talking about 'breakthroughs' and such.",
                                setFlag: 'neighbor_asked_owner',
                                condition: (scene) => !scene.getFlag('neighbor_asked_owner')
                            },
                            {
                                text: "Let's talk about something else.",
                                heroLine: "Interesting. What else can you tell me?",
                                npcResponse: "What else would you like to know?",
                                nextNode: 'start'
                            }
                        ]
                    },
                    beer_path: {
                        options: [
                            {
                                text: "Sounds like paradise indeed.",
                                heroLine: "A slice of paradise sounds pretty good right about now.",
                                npcResponse: "You know what? Why don't you come on over! I've got cold ones in the cooler and I just made a fresh batch of my famous chili. There's a gate in the fence right there - just give it a push!",
                                setFlag: 'neighbor_invited_over',
                                action: 'SHOW_GATE',
                                exit: true
                            },
                            {
                                text: "I'm more of an indoors person.",
                                heroLine: "Sounds nice, but I'm more of an indoors person myself.",
                                npcResponse: "To each their own! But if you ever change your mind, you know where to find me. Usually right here, enjoying the evening.",
                                nextNode: 'start'
                            }
                        ]
                    }
                };
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup for scrolling scene
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - moonlit exterior with warm glow from neighbor's yard
                this.lights.enable();
                this.lights.setAmbientColor(0x3a4a5a); // Cool moonlit ambient

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create edge zones for scene transitions (gate to neighbor's yard)
                this.createEdgeZones(height);

                // If returning after invitation, draw the gate visual
                if (this.getFlag('neighbor_invited_over')) {
                    this.drawGate(height);
                }

                // Create player at spawn position
                const spawnPoint = this.getSpawnPoint();
                let spawnX = 300;
                if (spawnPoint === 'from_house') spawnX = 250;
                else if (spawnPoint === 'right') spawnX = this.worldWidth - 200;
                else if (spawnPoint === 'from_neighbor') spawnX = this.worldWidth - 200;

                this.createPlayer(spawnX, height * 0.80);

                // Create neighbor sprite (hidden initially unless flag is set)
                this.createNeighbor(height);

                // Center camera on player
                this.cameras.main.scrollX = Phaser.Math.Clamp(
                    spawnX - this.screenWidth / 2, 0, this.worldWidth - this.screenWidth
                );

                // Mark room as visited
                if (!TSH.State.hasVisitedRoom('backyard')) {
                    TSH.State.markRoomVisited('backyard');
                    this.showDialog("Ah, the backyard. Nice to get some fresh air. And those lights over the fence look inviting...");
                }
            }

            // Room-specific background - Backyard at night
            drawRoom(worldWidth, height) {
                if (this.textures.exists('backyardBackground')) {
                    this.textures.remove('backyardBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Night sky gradient
                g.fillStyle(0x0a0a1a);
                g.fillRect(0, 0, worldWidth, height * 0.45);
                g.fillStyle(0x101025);
                g.fillRect(0, height * 0.25, worldWidth, height * 0.20);

                // Stars
                g.fillStyle(0xffffff);
                const starPositions = [
                    [100, 40], [250, 80], [400, 30], [550, 90], [700, 50],
                    [850, 70], [1000, 25], [1150, 85], [1300, 45], [1450, 95],
                    [1600, 35], [1750, 75], [1850, 55], [150, 120], [450, 110],
                    [750, 130], [1050, 115], [1350, 105], [1650, 125], [1900, 60]
                ];
                starPositions.forEach(([x, y]) => {
                    const size = Math.random() > 0.7 ? 2 : 1;
                    g.fillCircle(x, y, size);
                });

                // Moon (upper left)
                g.fillStyle(0xeeeedd);
                g.fillCircle(250, 100, 35);
                g.fillStyle(0xddddcc);
                g.fillCircle(240, 95, 7);
                g.fillCircle(260, 105, 5);

                // === LEFT SECTION: House Back Wall and Door ===

                // House back wall
                g.fillStyle(0x3a3a4a);
                g.fillRect(0, height * 0.15, 300, height * 0.60);

                // Back door (glass-paned)
                g.fillStyle(0x4a3020);
                g.fillRect(100, height * 0.25, 100, height * 0.45);
                // Glass panes showing warm interior
                g.fillStyle(0x4a3a2a);
                g.fillRect(110, height * 0.28, 35, height * 0.15);
                g.fillRect(155, height * 0.28, 35, height * 0.15);
                g.fillRect(110, height * 0.47, 35, height * 0.15);
                g.fillRect(155, height * 0.47, 35, height * 0.15);
                // Warm glow from inside
                g.fillStyle(0x6a5a3a, 0.7);
                g.fillRect(112, height * 0.30, 31, height * 0.12);
                g.fillRect(157, height * 0.30, 31, height * 0.12);
                // Door handle
                g.fillStyle(0xc0a060);
                g.fillCircle(185, height * 0.52, 5);
                g.lineStyle(2, 0x2a1808, 1);
                g.strokeRect(100, height * 0.25, 100, height * 0.45);

                // Back steps
                g.fillStyle(0x5a4a3a);
                g.fillRect(80, height * 0.70, 140, 15);
                g.fillStyle(0x4a3a2a);
                g.fillRect(70, height * 0.72, 160, 15);
                g.fillStyle(0x3a2a1a);
                g.fillRect(60, height * 0.74, 180, 12);

                // House wall texture - siding
                g.lineStyle(1, 0x2a2a3a, 0.3);
                for (let y = height * 0.18; y < height * 0.75; y += 15) {
                    g.moveTo(0, y);
                    g.lineTo(300, y);
                }
                g.strokePath();

                // Window on house wall
                g.fillStyle(0x1a1a2a);
                g.fillRect(220, height * 0.30, 60, 50);
                g.fillStyle(0x5a4a3a, 0.5);
                g.fillRect(223, height * 0.32, 25, 22);
                g.fillRect(252, height * 0.32, 25, 22);
                g.lineStyle(2, 0x4a3a2a, 1);
                g.strokeRect(220, height * 0.30, 60, 50);

                // === CENTER SECTION: Grass and Garden ===

                // Grass ground
                g.fillStyle(0x1a3a1a);
                g.fillRect(0, height * 0.72, worldWidth, height * 0.28);
                // Grass texture variation
                g.fillStyle(0x152a15);
                for (let x = 0; x < worldWidth; x += 40) {
                    g.fillRect(x, height * 0.72, 20, height * 0.28);
                }

                // Garden gnome
                g.fillStyle(0x8a4a3a);
                g.fillCircle(600, height * 0.68, 20); // Body
                g.fillStyle(0xe8c4a0);
                g.fillCircle(600, height * 0.62, 12); // Face
                g.fillStyle(0xcc2222);
                g.fillTriangle(600, height * 0.50, 585, height * 0.60, 615, height * 0.60); // Hat
                g.fillStyle(0xffffff);
                g.fillCircle(595, height * 0.61, 3); // Eye
                g.fillCircle(605, height * 0.61, 3); // Eye
                g.fillStyle(0x4a4a4a);
                g.fillCircle(596, height * 0.61, 1.5);
                g.fillCircle(606, height * 0.61, 1.5);

                // Some bushes in the center
                g.fillStyle(0x1a4a1a);
                g.fillCircle(450, height * 0.70, 30);
                g.fillCircle(480, height * 0.68, 25);
                g.fillCircle(420, height * 0.71, 20);
                g.fillStyle(0x2a5a2a);
                g.fillCircle(460, height * 0.67, 18);

                // More bushes near fence
                g.fillStyle(0x1a4a1a);
                g.fillCircle(1300, height * 0.70, 35);
                g.fillCircle(1350, height * 0.68, 28);
                g.fillCircle(1260, height * 0.71, 22);

                // === RIGHT SECTION: Fence with String Lights ===

                // Fence posts and planks
                g.fillStyle(0x5a4a3a);
                for (let x = 1400; x < worldWidth; x += 80) {
                    // Fence planks
                    g.fillRect(x, height * 0.32, 75, height * 0.43);
                }
                // Fence post caps
                g.fillStyle(0x4a3a2a);
                for (let x = 1400; x < worldWidth; x += 80) {
                    g.fillRect(x - 3, height * 0.30, 81, 12);
                }
                // Fence texture - wood grain
                g.lineStyle(1, 0x3a2a1a, 0.5);
                for (let x = 1400; x < worldWidth; x += 80) {
                    g.moveTo(x + 37, height * 0.32);
                    g.lineTo(x + 37, height * 0.75);
                }
                g.strokePath();

                // Gate in fence (only visible if invited)
                // Will be drawn as hotspot overlay when needed

                // String lights ABOVE the fence (visible glow from neighbor's yard)
                // The lights themselves
                g.fillStyle(0xffeeaa);
                const lightPositions = [
                    [1450, height * 0.26], [1520, height * 0.24], [1590, height * 0.27],
                    [1660, height * 0.25], [1730, height * 0.26], [1800, height * 0.24],
                    [1870, height * 0.27]
                ];
                lightPositions.forEach(([lx, ly]) => {
                    g.fillCircle(lx, ly, 6);
                });

                // String between lights
                g.lineStyle(2, 0x2a2a2a, 0.8);
                g.moveTo(1420, height * 0.25);
                lightPositions.forEach(([lx, ly]) => {
                    g.lineTo(lx, ly - 4);
                });
                g.lineTo(1920, height * 0.25);
                g.strokePath();

                // Warm glow above fence (neighbor's yard atmosphere)
                g.fillStyle(0x3a3520, 0.3);
                g.fillRect(1400, height * 0.12, worldWidth - 1400, height * 0.20);

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('backyardBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'backyardBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            createLighting(worldWidth, height) {
                // Main moonlight - cool blue
                this.moonLight = this.lights.addLight(250, 100, 500, 0x8899cc, 0.8);
                // Moon fill
                this.moonFill = this.lights.addLight(600, height * 0.40, 700, 0x6677aa, 0.35);

                // Warm light spilling from house door
                this.doorLight = this.lights.addLight(150, height * 0.50, 300, 0xffaa66, 0.9);

                // Window light
                this.windowLight = this.lights.addLight(250, height * 0.38, 150, 0xffcc88, 0.5);

                // String lights glow - warm yellow/orange
                this.stringLights = [];
                const lightXPositions = [1450, 1520, 1590, 1660, 1730, 1800, 1870];
                lightXPositions.forEach((lx, i) => {
                    const light = this.lights.addLight(lx, height * 0.26, 120, 0xffdd88, 0.7);
                    this.stringLights.push(light);
                });

                // General warm glow from neighbor's yard spilling over
                this.neighborGlow = this.lights.addLight(1700, height * 0.35, 400, 0xffcc77, 0.4);

                // Ground fill for visibility
                this.groundFill = this.lights.addLight(960, height * 0.85, 800, 0x5566aa, 0.2);

                this.createLightBloom(height);
            }

            createLightBloom(height) {
                // Moon glow
                const moonBloom = this.add.graphics();
                moonBloom.fillStyle(0x8899cc, 0.08);
                moonBloom.fillCircle(0, 0, 80);
                moonBloom.setPosition(250, 100);
                moonBloom.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom.setDepth(1);

                // Door warm glow
                const doorBloom = this.add.graphics();
                doorBloom.fillStyle(0xffaa66, 0.1);
                doorBloom.fillCircle(0, 0, 100);
                doorBloom.setPosition(150, height * 0.52);
                doorBloom.setBlendMode(Phaser.BlendModes.ADD);
                doorBloom.setDepth(1);

                // String light blooms
                this.stringLightBlooms = [];
                const lightXPositions = [1450, 1520, 1590, 1660, 1730, 1800, 1870];
                lightXPositions.forEach((lx, i) => {
                    const bloom = this.add.graphics();
                    bloom.fillStyle(0xffee99, 0.15);
                    bloom.fillCircle(0, 0, 25);
                    bloom.setPosition(lx, height * 0.26);
                    bloom.setBlendMode(Phaser.BlendModes.ADD);
                    bloom.setDepth(1);
                    this.stringLightBlooms.push(bloom);
                });
            }

            createNeighbor(height) {
                // Check if neighbor has been talked to before
                if (this.getFlag('neighbor_appeared')) {
                    this.showNeighborSprite(height);
                }
            }

            showNeighborSprite(height) {
                if (this.neighborSprite) return; // Already shown

                // Create neighbor sprite - Wilson style (just eyes and top of hat visible above fence)
                this.neighborSprite = this.add.container(1700, height * 0.30);
                this.neighborSprite.setDepth(150);

                const g = this.add.graphics();

                // Top of hat (visible above fence)
                g.fillStyle(0x4a6a4a); // Green fishing/hunting hat
                g.fillRect(-25, -10, 50, 15);
                g.fillStyle(0x3a5a3a);
                g.fillRect(-30, 5, 60, 8); // Hat brim

                // Eyes peeking over fence
                g.fillStyle(0xe8c4a0); // Skin
                g.fillRect(-20, 12, 40, 20); // Forehead area visible

                // Eyes
                g.fillStyle(0xffffff);
                g.fillCircle(-8, 22, 8);
                g.fillCircle(8, 22, 8);
                g.fillStyle(0x4a6a8a); // Blue-gray eyes
                g.fillCircle(-8, 22, 4);
                g.fillCircle(8, 22, 4);
                g.fillStyle(0x000000);
                g.fillCircle(-8, 22, 2);
                g.fillCircle(8, 22, 2);

                // Bushy eyebrows
                g.fillStyle(0x6a6a6a);
                g.fillRect(-15, 12, 14, 4);
                g.fillRect(1, 12, 14, 4);

                this.neighborSprite.add(g);

                // Add slight animation - neighbor sways slightly
                this.tweens.add({
                    targets: this.neighborSprite,
                    y: height * 0.30 + 3,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                this.neighborVisible = true;
            }

            hideNeighborSprite() {
                if (this.neighborSprite) {
                    this.neighborSprite.destroy();
                    this.neighborSprite = null;
                    this.neighborVisible = false;
                }
            }

            // Room-specific action handling
            executeAction(action, hotspot) {
                const height = this.scale.height;

                if (action === 'Use') {
                    if (hotspot.name === 'Back Door') {
                        this.transitionToScene('interior', 'from_backyard');
                    } else if (hotspot.name === 'Gate') {
                        this.showDialog(hotspot.useResponse);
                    } else {
                        this.showDialog(hotspot.useResponse);
                    }
                } else if (action === 'Look At') {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Talk To') {
                    if (hotspot.name === 'Fence') {
                        // First time talking - neighbor appears
                        if (!this.getFlag('neighbor_appeared')) {
                            this.setFlag('neighbor_appeared', true);
                            // Nate calls out first
                            this.showDialog("Hello? Anyone over there?", () => {
                                // Neighbor pops up
                                this.showNeighborSprite(height);
                                // Start conversation with Earl's greeting
                                this.startNeighborConversation(true);
                            });
                        } else {
                            // Already talked before - just start conversation
                            this.startNeighborConversation(false);
                        }
                    } else {
                        this.showDialog(hotspot.talkResponse);
                    }
                }
            }

            startNeighborConversation(showGreeting = false) {
                const height = this.scale.height;
                const npcData = {
                    name: 'Earl',
                    x: 1700,
                    y: height * 0.50  // Position for speech bubble calc (y - 280 = above fence)
                };
                const dialogue = this.getNeighborDialogue();

                if (showGreeting) {
                    // Set up conversation state first
                    this.conversationActive = true;
                    this.conversationNPC = npcData;
                    this.conversationData = dialogue;
                    this.conversationState = 'start';
                    this.stopCharacterMovement();
                    if (this.verbCoin) this.verbCoin.setVisible(false);
                    this.verbCoinVisible = false;
                    if (this.crosshairCursor) this.crosshairCursor.setVisible(true);
                    this.drawCrosshair(0xffffff);

                    // Show Earl's greeting, then show options
                    this.showConversationLine("Well hello there, neighbor! Don't think I've seen you around before!", 'npc', () => {
                        this.showDialogueOptions('start');
                    });
                } else {
                    this.enterConversation(npcData, dialogue);
                }
            }

            handleDialogueChoice(option, currentNode) {
                // Store the action to execute after conversation exits
                if (option.action === 'SHOW_GATE') {
                    this.pendingAction = 'SHOW_GATE';
                }
                // Call parent handler with both parameters
                super.handleDialogueChoice(option, currentNode);
            }

            exitConversation() {
                // Check for pending actions before exiting
                if (this.pendingAction === 'SHOW_GATE') {
                    // Show gate visual (this also creates the edge zone for transitioning)
                    this.drawGate(this.scale.height);
                    // Hide the neighbor
                    this.hideNeighborSprite();
                    this.pendingAction = null;
                }
                // Call parent exit
                super.exitConversation();
            }

            drawGate(height) {
                // Add gate visual to the fence - positioned to the RIGHT of where hero stands
                const gateX = 1750;

                // Warm light spilling through the open gate
                const glow = this.add.graphics();
                glow.fillStyle(0xffcc66, 0.3);
                glow.fillRect(gateX + 10, height * 0.35, 40, height * 0.40);
                glow.fillStyle(0xffaa44, 0.2);
                glow.fillRect(gateX + 15, height * 0.38, 30, height * 0.34);
                glow.setDepth(4);
                glow.setBlendMode(Phaser.BlendModes.ADD);

                // The gap in the fence (dark opening)
                const opening = this.add.graphics();
                opening.fillStyle(0x1a2a1a);
                opening.fillRect(gateX + 5, height * 0.32, 50, height * 0.43);
                opening.setPipeline('Light2D');
                opening.setDepth(3);

                // The gate door itself - slightly ajar/angled
                const gate = this.add.graphics();
                // Gate frame
                gate.fillStyle(0x5a4a3a);
                gate.fillRect(gateX + 45, height * 0.33, 15, height * 0.41);
                // Gate planks (vertical boards)
                gate.fillStyle(0x6a5a4a);
                gate.fillRect(gateX + 48, height * 0.35, 10, height * 0.37);
                // Gate details
                gate.lineStyle(1, 0x4a3a2a, 0.8);
                gate.moveTo(gateX + 53, height * 0.35);
                gate.lineTo(gateX + 53, height * 0.72);
                gate.strokePath();
                // Hinges
                gate.fillStyle(0x3a3a3a);
                gate.fillRect(gateX + 55, height * 0.38, 6, 8);
                gate.fillRect(gateX + 55, height * 0.62, 6, 8);
                gate.setPipeline('Light2D');
                gate.setDepth(5);

                // Add a light source for the warm glow from neighbor's yard
                this.gateLight = this.lights.addLight(gateX + 30, height * 0.50, 150, 0xffaa55, 0.8);

                // Brief flash effect to draw attention
                const flash = this.add.graphics();
                flash.fillStyle(0xffffcc, 0.4);
                flash.fillRect(gateX, height * 0.30, 70, height * 0.45);
                flash.setDepth(10);
                flash.setBlendMode(Phaser.BlendModes.ADD);

                // Fade out the flash
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => flash.destroy()
                });

                // Create the edge zone for the gate after it appears
                this.createGateEdgeZone(height);
            }

            // Edge zones for scene transitions
            createEdgeZones(height) {
                // Gate edge zone only appears after neighbor invites you over
                if (this.getFlag('neighbor_invited_over')) {
                    // Gate visual should already exist from drawGate
                    this.createGateEdgeZone(height);
                }
            }

            createGateEdgeZone(height) {
                // Destroy existing gate edge zone if any
                if (this.gateEdgeZone) {
                    this.gateEdgeZone.destroy();
                }

                const gateX = 1750;

                // Create the edge zone at the gate location
                this.gateEdgeZone = this.add.zone(gateX + 30, height * 0.55, 80, height * 0.35)
                    .setInteractive()
                    .setOrigin(0.5);

                this.gateEdgeZone.on('pointerover', () => {
                    if (!this.inventoryOpen && !this.verbCoinVisible) {
                        this.edgeHovered = 'right';
                        this.showArrowCursor('right');
                    }
                });

                this.gateEdgeZone.on('pointerout', () => {
                    this.edgeHovered = null;
                    this.hideArrowCursor();
                });

                this.gateEdgeZone.on('pointerdown', (pointer) => {
                    if (this.inventoryOpen) return;

                    // Prevent main input handler from overriding our walk
                    this.clickedUI = true;

                    const currentTime = Date.now();
                    const isDoubleClick = (currentTime - (this.edgeClickTime || 0)) < 300;
                    this.edgeClickTime = currentTime;

                    if (isDoubleClick) {
                        // Immediate transition
                        this.hideArrowCursor();
                        this.transitionToScene('earls_yard', 'from_backyard');
                    } else {
                        // Walk to gate then transition
                        this.hideArrowCursor();
                        this.walkToEdgeAndTransition(gateX, height * 0.80, 'earls_yard', 'from_backyard');
                    }
                });
            }

            walkToEdgeAndTransition(targetX, targetY, scene, spawnPoint) {
                this.walkTo(targetX, targetY, () => {
                    this.transitionToScene(scene, spawnPoint);
                }, false);
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Garden Gnome') {
                    this.showDialog(`The gnome doesn't seem interested in my ${item.name}. Judgmental little guy.`);
                } else if (hotspot.name === 'Fence') {
                    this.showDialog(`I don't think throwing my ${item.name} over the fence would help anything.`);
                } else {
                    this.showDialog(`That doesn't work.`);
                }
            }

            update() {
                super.update();

                // String lights gentle flicker
                const time = this.time.now * 0.001;
                if (this.stringLights) {
                    this.stringLights.forEach((light, i) => {
                        const flicker = Math.sin(time * 3 + i * 1.5) * 0.1 + Math.sin(time * 7 + i) * 0.05;
                        light.intensity = 0.7 + flicker;
                    });
                }

                if (this.stringLightBlooms) {
                    this.stringLightBlooms.forEach((bloom, i) => {
                        const flicker = Math.sin(time * 3 + i * 1.5) * 0.1;
                        bloom.setAlpha(0.12 + flicker * 0.5);
                    });
                }
            }
        }

        // ============================================================================
        // NEIGHBOR YARD SCENE - Earl's Backyard BBQ (extends BaseScene)
        // ============================================================================
