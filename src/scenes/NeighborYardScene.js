        // Room ID: 'earls_yard'
        class EarlsYardScene extends BaseScene {
            constructor() {
                super({ key: 'earls_yard' });
                this.worldWidth = 1280; // Single screen, no scrolling
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.70, maxY: 0.92 };
                this.earlSprite = null;
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                return [
                    {
                        x: 655, y: height * 0.52, w: 90, h: height * 0.22,
                        interactX: 580, interactY: height * 0.78,
                        name: 'Grill',
                        verbLabels: { actionVerb: 'Use', lookVerb: 'Examine', talkVerb: 'Sniff' },
                        lookResponse: "A classic Weber kettle grill. Earl's got some serious looking burgers sizzling away. The smell is incredible.",
                        useResponse: "I shouldn't mess with another man's grill. That's like... sacred territory.",
                        talkResponse: "*sniff sniff* Oh man, that smells good. Real charcoal, none of that propane nonsense."
                    },
                    {
                        x: 190, y: height * 0.55, w: 80, h: height * 0.20,
                        interactX: 280, interactY: height * 0.78,
                        name: 'Lawn Chair',
                        verbLabels: { actionVerb: 'Sit', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A well-worn aluminum lawn chair with woven straps. The kind that leaves a pattern on your legs if you sit too long.",
                        useResponse: "I settle into the chair. It's surprisingly comfortable. I could get used to this.",
                        talkResponse: "Hey chair. You've seen some things, haven't you? Some real backyard moments."
                    },
                    {
                        x: 950, y: height * 0.55, w: 60, h: height * 0.20,
                        interactX: 880, interactY: height * 0.78,
                        name: 'Plastic Flamingo',
                        verbLabels: { actionVerb: 'Pick up', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A pink plastic flamingo, standing proudly on one leg. It's seen better days, but it's got character.",
                        useResponse: "Earl might notice if his flamingo went missing. Better leave it.",
                        talkResponse: "Hey there, pinky. Keeping the yard safe from... whatever plastic flamingos guard against."
                    },
                    {
                        x: 1100, y: height * 0.55, w: 70, h: height * 0.20,
                        interactX: 1030, interactY: height * 0.78,
                        name: 'Vintage Radio',
                        verbLabels: { actionVerb: 'Tune', lookVerb: 'Examine', talkVerb: 'Listen' },
                        lookResponse: "A beautiful mid-century radio, the kind with real wood and that warm tube sound. Soft oldies music drifts from the speaker.",
                        useResponse: "I fiddle with the dial. Nothing but static and... is that 'Fly Me to the Moon'? Classic.",
                        talkResponse: "The radio croons softly about love and summer nights. Good stuff."
                    },
                    {
                        x: 400, y: height * 0.50, w: 250, h: height * 0.35,
                        interactX: 400, interactY: height * 0.78,
                        name: 'Mobile Home',
                        verbLabels: { actionVerb: 'Enter', lookVerb: 'Examine', talkVerb: 'Knock' },
                        lookResponse: "Earl's mobile home. It's small but cozy-looking, with warm light glowing from the windows. Very homey.",
                        useResponse: "I should probably be invited in first. Can't just barge into a neighbor's home.",
                        talkResponse: "*knock knock* No answer. Earl's out here at the grill anyway."
                    },
                    {
                        x: 750, y: height * 0.45, w: 100, h: height * 0.35,
                        interactX: 650, interactY: height * 0.78,
                        name: 'Earl',
                        isNPC: true,
                        verbLabels: { actionVerb: 'Approach', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Earl Henderson. He's... well, he's definitely a bigfoot. Standing about 7 feet tall, covered in reddish-brown fur, wearing a chef's hat and a 'Kiss the Cook' apron. He seems completely at ease.",
                        useResponse: "I'm not sure what that would accomplish.",
                        talkResponse: "START_EARL_CONVERSATION"
                    }
                ];
            }

            // Earl's dialogue tree
            getEarlDialogue() {
                return {
                    start: {
                        options: [
                            {
                                text: "Nice place you got here.",
                                heroLine: "This is a really nice setup you've got here, Earl.",
                                npcResponse: "Thanks, neighbor! Been workin' on it for years. Little slice of paradise, I like to say. Nothing fancy, but it's home.",
                                setFlag: 'earl_complimented_yard',
                                condition: (scene) => !scene.getFlag('earl_complimented_yard')
                            },
                            {
                                text: "What's on the grill?",
                                heroLine: "Those burgers smell amazing. What's your secret?",
                                npcResponse: "Ah, just a little seasoning, bit of Worcestershire, and the key - real hardwood charcoal. None of that briquette business. You gotta treat the meat with respect, you know?",
                                nextNode: 'grilling_tips',
                                setFlag: 'earl_asked_grill'
                            },
                            {
                                text: "So... you're a bigfoot.",
                                heroLine: "So, I hope this isn't rude, but... you're a bigfoot?",
                                npcResponse: "Sasquatch, technically. 'Bigfoot' is more of a media thing. But yeah, guilty as charged! Been one my whole life, heh heh.",
                                nextNode: 'bigfoot_questions',
                                setFlag: 'earl_asked_bigfoot',
                                condition: (scene) => !scene.getFlag('earl_asked_bigfoot')
                            },
                            {
                                text: "Tell me about the neighborhood.",
                                heroLine: "What's the neighborhood like around here?",
                                npcResponse: "Pretty quiet, mostly. Good folks. The Hendersons down the street - no relation - they keep to themselves. Old Mrs. Patterson's got a mean casserole recipe. And of course, your house has always been... interesting.",
                                nextNode: 'neighborhood_talk',
                                setFlag: 'earl_asked_neighborhood'
                            },
                            {
                                text: "I should head back.",
                                heroLine: "Well, thanks for having me over. I should probably get back.",
                                npcResponse: "Anytime, neighbor! Door's always open. Well, gate's always open. You know what I mean. Don't be a stranger!",
                                exit: true
                            }
                        ]
                    },
                    grilling_tips: {
                        options: [
                            {
                                text: "Any other tips?",
                                heroLine: "Got any other grilling wisdom to share?",
                                npcResponse: "Don't press the patties! Everyone wants to squish 'em, but that's just pushing all the juice out. Let 'em be. Patience is key.",
                                setFlag: 'earl_tip_patties',
                                condition: (scene) => !scene.getFlag('earl_tip_patties')
                            },
                            {
                                text: "Where'd you learn to cook?",
                                heroLine: "Where'd you learn to grill like this?",
                                npcResponse: "Self-taught, mostly. Spent a lot of years in the woods, cooking over campfires. You learn to appreciate good food when you've eaten raw fish for a decade. Not recommended, by the way.",
                                setFlag: 'earl_cooking_history',
                                condition: (scene) => !scene.getFlag('earl_cooking_history')
                            },
                            {
                                text: "Back to other topics.",
                                heroLine: "Let me ask about something else.",
                                npcResponse: "Sure thing! What's on your mind?",
                                nextNode: 'start'
                            }
                        ]
                    },
                    bigfoot_questions: {
                        options: [
                            {
                                text: "How long have you lived here?",
                                heroLine: "How long have you been living... you know, among regular people?",
                                npcResponse: "Oh, about thirty years now. Settled down after I got tired of the nomadic life. Turns out, indoor plumbing is a game-changer. Who knew?",
                                setFlag: 'earl_history',
                                condition: (scene) => !scene.getFlag('earl_history')
                            },
                            {
                                text: "Don't people... notice?",
                                heroLine: "Don't people notice that you're, well, a seven-foot-tall sasquatch?",
                                npcResponse: "You'd be surprised what people don't notice when they're busy with their own lives. Plus, I tell 'em I have a glandular condition. Works every time.",
                                setFlag: 'earl_noticed',
                                condition: (scene) => !scene.getFlag('earl_noticed')
                            },
                            {
                                text: "Any other cryptids around?",
                                heroLine: "Are there... other creatures like you around here?",
                                npcResponse: "Here and there. There's a chupacabra runs the laundromat two towns over. Real nice guy. And I'm pretty sure the mailman is a werewolf, but he's never said anything directly.",
                                setFlag: 'earl_cryptids',
                                condition: (scene) => !scene.getFlag('earl_cryptids')
                            },
                            {
                                text: "Back to other topics.",
                                heroLine: "Let me ask about something else.",
                                npcResponse: "Fire away, neighbor!",
                                nextNode: 'start'
                            }
                        ]
                    },
                    neighborhood_talk: {
                        options: [
                            {
                                text: "What do you mean, 'interesting'?",
                                heroLine: "What do you mean my house has been 'interesting'?",
                                npcResponse: "Oh, nothing bad! Just... the previous owners always had weird stuff going on. Lights at odd hours, strange deliveries, that whole 'secret laboratory in the basement' thing. You know how it is.",
                                setFlag: 'earl_house_history',
                                condition: (scene) => !scene.getFlag('earl_house_history')
                            },
                            {
                                text: "Who lived there before?",
                                heroLine: "Do you remember who lived in my house before me?",
                                npcResponse: "Let's see... there was that scientist fella, real eccentric type. Before him, an artist who painted nothing but doors. And before that, someone who claimed to be a time traveler. Nice guy, always knew the weather in advance.",
                                setFlag: 'earl_previous_owners',
                                condition: (scene) => !scene.getFlag('earl_previous_owners')
                            },
                            {
                                text: "Any neighborhood events?",
                                heroLine: "Does the neighborhood do any events? Block parties, that kind of thing?",
                                npcResponse: "Oh sure! We used to do potlucks. I'd bring my famous venison chili - secret family recipe. Folks stopped asking where I got the venison, which I appreciated.",
                                setFlag: 'earl_events',
                                condition: (scene) => !scene.getFlag('earl_events')
                            },
                            {
                                text: "Back to other topics.",
                                heroLine: "Let me ask about something else.",
                                npcResponse: "What else you wanna know?",
                                nextNode: 'start'
                            }
                        ]
                    }
                };
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup (no scrolling for this scene)
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - warm backyard evening atmosphere
                this.lights.enable();
                this.lights.setAmbientColor(0x4a3a2a); // Warm amber ambient

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
                let spawnX = 100;
                if (spawnPoint === 'from_backyard') spawnX = 100;

                this.createPlayer(spawnX, height * 0.80);

                // Create Earl at the grill
                this.createEarl(height);

                // Mark room as visited
                if (!TSH.State.hasVisitedRoom('earls_yard')) {
                    TSH.State.markRoomVisited('earls_yard');
                    this.showDialog("Earl's backyard. Cozy. The grill smells amazing and those tiki lights give the whole place a warm, festive feel.");
                }
            }

            // Room-specific background - Earl's backyard
            drawRoom(worldWidth, height) {
                if (this.textures.exists('neighborYardBackground')) {
                    this.textures.remove('neighborYardBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Night sky gradient
                g.fillStyle(0x0a0a1a);
                g.fillRect(0, 0, worldWidth, height * 0.40);
                g.fillStyle(0x101025);
                g.fillRect(0, height * 0.22, worldWidth, height * 0.18);

                // Stars
                g.fillStyle(0xffffff);
                const starPositions = [
                    [80, 35], [180, 70], [320, 25], [450, 80], [580, 40],
                    [720, 65], [850, 30], [980, 75], [1100, 45], [1200, 60],
                    [140, 90], [380, 50], [620, 85], [900, 55], [1050, 95]
                ];
                starPositions.forEach(([x, y]) => {
                    const size = Math.random() > 0.7 ? 2 : 1;
                    g.fillCircle(x, y, size);
                });

                // === LEFT SECTION: Gate back to your yard ===
                // Fence on left side (boundary back to player's yard)
                g.fillStyle(0x5a4a3a);
                for (let x = 0; x < 120; x += 80) {
                    g.fillRect(x, height * 0.35, 75, height * 0.40);
                }
                g.fillStyle(0x4a3a2a);
                for (let x = 0; x < 120; x += 80) {
                    g.fillRect(x - 3, height * 0.33, 81, 12);
                }
                // Gate opening
                g.fillStyle(0x1a2a1a);
                g.fillRect(20, height * 0.36, 50, height * 0.38);

                // === CENTER-LEFT: Mobile Home ===
                // Mobile home body
                g.fillStyle(0x6a7a7a);
                g.fillRect(250, height * 0.25, 350, height * 0.45);
                // Roof
                g.fillStyle(0x4a5a5a);
                g.fillRect(240, height * 0.22, 370, height * 0.06);
                // Windows (glowing warm)
                g.fillStyle(0x2a3a3a);
                g.fillRect(280, height * 0.32, 60, 50);
                g.fillRect(380, height * 0.32, 60, 50);
                g.fillRect(480, height * 0.32, 60, 50);
                // Window glow
                g.fillStyle(0x6a5a3a, 0.8);
                g.fillRect(283, height * 0.34, 54, 44);
                g.fillRect(383, height * 0.34, 54, 44);
                g.fillRect(483, height * 0.34, 54, 44);
                // Door
                g.fillStyle(0x4a3020);
                g.fillRect(320, height * 0.45, 40, height * 0.25);
                g.fillStyle(0xc0a060);
                g.fillCircle(350, height * 0.58, 4);
                // Steps
                g.fillStyle(0x5a5a5a);
                g.fillRect(310, height * 0.70, 60, 12);

                // Metal siding lines
                g.lineStyle(1, 0x5a6a6a, 0.5);
                for (let y = height * 0.28; y < height * 0.70; y += 15) {
                    g.moveTo(250, y);
                    g.lineTo(600, y);
                }
                g.strokePath();

                // === CENTER: Grass ===
                g.fillStyle(0x1a3a1a);
                g.fillRect(0, height * 0.72, worldWidth, height * 0.28);
                // Grass texture
                g.fillStyle(0x152a15);
                for (let x = 0; x < worldWidth; x += 50) {
                    g.fillRect(x, height * 0.72, 25, height * 0.28);
                }

                // === CENTER: Weber Grill ===
                const grillX = 655;
                const grillBaseY = height * 0.72; // Ground level
                // Grill legs (tripod style)
                g.fillStyle(0x2a2a2a);
                g.fillRect(grillX - 35, grillBaseY - 50, 6, 50);
                g.fillRect(grillX + 30, grillBaseY - 50, 6, 50);
                g.fillRect(grillX - 3, grillBaseY - 45, 6, 45);
                // Grill bowl (bottom half of kettle)
                g.fillStyle(0x1a1a1a);
                g.fillRect(grillX - 40, grillBaseY - 80, 80, 35);
                g.fillStyle(0x2a2a2a);
                g.fillRect(grillX - 38, grillBaseY - 78, 76, 5);
                // Grill lid (dome)
                g.fillStyle(0x1a1a1a);
                g.fillRect(grillX - 38, grillBaseY - 115, 76, 35);
                g.fillStyle(0x2a2a2a);
                g.fillRect(grillX - 35, grillBaseY - 118, 70, 8);
                // Handle on top
                g.fillStyle(0x5a3a2a);
                g.fillRect(grillX - 5, grillBaseY - 130, 10, 15);
                // Vent holes
                g.fillStyle(0x3a3a3a);
                g.fillRect(grillX - 25, grillBaseY - 70, 8, 4);
                g.fillRect(grillX + 17, grillBaseY - 70, 8, 4);

                // === RIGHT SIDE: Decorations ===
                // Lawn chair (aluminum folding style)
                const chairX = 190;
                const chairY = height * 0.72;
                g.fillStyle(0x8a8a8a); // Aluminum frame
                // Back legs
                g.fillRect(chairX - 25, chairY - 80, 4, 80);
                g.fillRect(chairX + 35, chairY - 80, 4, 80);
                // Seat frame
                g.fillRect(chairX - 25, chairY - 45, 64, 4);
                // Webbing (seat)
                g.fillStyle(0x3a8aaa);
                for (let i = 0; i < 5; i++) {
                    g.fillRect(chairX - 22 + i * 12, chairY - 43, 10, 25);
                }
                // Webbing (back)
                for (let i = 0; i < 5; i++) {
                    g.fillRect(chairX - 22 + i * 12, chairY - 78, 10, 30);
                }
                // Arm rests
                g.fillStyle(0x8a8a8a);
                g.fillRect(chairX - 28, chairY - 50, 6, 4);
                g.fillRect(chairX + 36, chairY - 50, 6, 4);

                // Plastic flamingo
                const flamingoX = 950;
                const flamingoY = height * 0.72;
                // Single leg (wire)
                g.fillStyle(0x333333);
                g.fillRect(flamingoX, flamingoY - 55, 2, 55);
                // Body
                g.fillStyle(0xff69b4);
                g.fillCircle(flamingoX, flamingoY - 65, 18);
                g.fillCircle(flamingoX + 5, flamingoY - 70, 12);
                // Neck (curved)
                g.fillRect(flamingoX + 8, flamingoY - 95, 6, 30);
                // Head
                g.fillCircle(flamingoX + 11, flamingoY - 100, 8);
                // Beak
                g.fillStyle(0x1a1a1a);
                g.fillTriangle(flamingoX + 11, flamingoY - 100, flamingoX - 5, flamingoY - 102, flamingoX + 11, flamingoY - 98);
                // Eye
                g.fillStyle(0x000000);
                g.fillCircle(flamingoX + 14, flamingoY - 101, 2);

                // Vintage radio on small table
                const radioX = 1100;
                const radioY = height * 0.72;
                // Table
                g.fillStyle(0x5a4a3a);
                g.fillRect(radioX - 20, radioY - 40, 70, 8);
                g.fillRect(radioX - 15, radioY - 40, 6, 40);
                g.fillRect(radioX + 40, radioY - 40, 6, 40);
                // Radio body
                g.fillStyle(0x6a4a2a);
                g.fillRect(radioX - 15, radioY - 75, 60, 35);
                // Radio face (dial area)
                g.fillStyle(0xddc080);
                g.fillRect(radioX - 10, radioY - 70, 35, 25);
                // Dial markings
                g.fillStyle(0x4a3a2a);
                g.fillRect(radioX - 5, radioY - 65, 25, 2);
                g.fillRect(radioX + 5, radioY - 60, 2, 10);
                // Speaker grille
                g.fillStyle(0x4a3a2a);
                g.fillRect(radioX + 30, radioY - 70, 12, 25);
                g.lineStyle(1, 0x5a4a3a);
                for (let i = 0; i < 5; i++) {
                    g.moveTo(radioX + 32, radioY - 68 + i * 5);
                    g.lineTo(radioX + 40, radioY - 68 + i * 5);
                }
                g.strokePath();
                // Knobs
                g.fillStyle(0x3a2a1a);
                g.fillCircle(radioX, radioY - 48, 5);
                g.fillCircle(radioX + 30, radioY - 48, 5);

                // === STRING LIGHTS (Tiki style - colorful) ===
                // Main string across the yard
                g.lineStyle(2, 0x3a3a3a, 0.8);
                g.moveTo(100, height * 0.22);
                const stringY = [0.20, 0.18, 0.20, 0.19, 0.21, 0.18, 0.20, 0.19];
                const stringX = [200, 350, 500, 650, 800, 950, 1100, 1200];
                stringX.forEach((x, i) => {
                    g.lineTo(x, height * stringY[i]);
                });
                g.strokePath();

                // String from mobile home
                g.moveTo(600, height * 0.22);
                g.lineTo(700, height * 0.25);
                g.lineTo(850, height * 0.23);
                g.lineTo(1000, height * 0.26);
                g.lineTo(1150, height * 0.24);
                g.strokePath();

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('neighborYardBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'neighborYardBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            createLighting(worldWidth, height) {
                // Main ambient from mobile home windows
                this.windowLight = this.lights.addLight(400, height * 0.45, 250, 0xffcc88, 1.0);

                // Grill glow
                this.grillLight = this.lights.addLight(655, height * 0.58, 120, 0xff6633, 0.9);

                // Tiki string lights - colorful!
                this.tikiBlooms = [];
                this.tikiLights = [];
                const tikiColors = [
                    0xff4444, 0xffaa33, 0x44ff44, 0x4444ff,
                    0xff44ff, 0xffff44, 0x44ffff, 0xff8844
                ];
                const tikiPositions = [
                    [200, height * 0.20], [350, height * 0.18], [500, height * 0.20],
                    [650, height * 0.19], [800, height * 0.21], [950, height * 0.18],
                    [1100, height * 0.20], [700, height * 0.25], [850, height * 0.23],
                    [1000, height * 0.26]
                ];

                tikiPositions.forEach((pos, i) => {
                    const color = tikiColors[i % tikiColors.length];
                    // Light source
                    const light = this.lights.addLight(pos[0], pos[1], 80, color, 0.6);
                    this.tikiLights.push(light);

                    // Bloom effect
                    const bloom = this.add.graphics();
                    bloom.fillStyle(color, 0.15);
                    bloom.fillCircle(pos[0], pos[1], 12);
                    bloom.fillStyle(color, 0.25);
                    bloom.fillCircle(pos[0], pos[1], 6);
                    bloom.setBlendMode(Phaser.BlendModes.ADD);
                    bloom.setDepth(10);
                    this.tikiBlooms.push({ bloom, color, x: pos[0], y: pos[1] });
                });

                // Create smoke particles for grill
                this.createGrillSmoke(height);
            }

            createGrillSmoke(height) {
                // Animated smoke rising from grill
                this.smokeParticles = [];
                for (let i = 0; i < 5; i++) {
                    const smoke = this.add.graphics();
                    smoke.fillStyle(0xaaaaaa, 0.3);
                    smoke.fillCircle(0, 0, 8 + Math.random() * 8);
                    smoke.setPosition(655 + (Math.random() - 0.5) * 30, height * 0.45);
                    smoke.setDepth(8);
                    smoke.setBlendMode(Phaser.BlendModes.ADD);
                    this.smokeParticles.push({
                        graphic: smoke,
                        baseX: 655,
                        baseY: height * 0.45,
                        offset: Math.random() * Math.PI * 2,
                        speed: 0.5 + Math.random() * 0.3
                    });
                }
            }

            createEarl(height) {
                // Earl - Sam & Max style bigfoot: chunky, cartoony, friendly
                // Position him next to the grill, feet on the ground
                const earlX = 750;
                const earlY = height * 0.72; // Ground level

                this.earlSprite = this.add.container(earlX, earlY);
                const p = 5; // Pixel size

                const pixel = (x, y, color) => {
                    const rect = this.add.rectangle(x * p, -y * p, p, p, color);
                    rect.setOrigin(0.5);
                    return rect;
                };

                // Sam & Max style colors - warm reddish-brown fur
                const FUR = 0x8B4513;
                const FUR_LIGHT = 0xA0522D;
                const FUR_DARK = 0x5D3A1A;
                const FUR_SHADE = 0x4A2A10;
                const FACE = 0x6B4423;
                const NOSE = 0x2a1a0a;
                const EYES = 0x1a1a1a;
                const EYE_WHITE = 0xfafafa;
                const APRON = 0xf0f0f0;
                const APRON_SHADE = 0xd0d0d0;
                const HEART = 0xdd3333;
                const HAT = 0xffffff;
                const HAT_SHADE = 0xe8e8e8;
                const SPATULA_METAL = 0x888888;
                const SPATULA_HANDLE = 0x4a3020;

                const pixels = [];

                // === BIG FURRY FEET (y: 0-6) ===
                // Left foot
                for (let x = -8; x <= -2; x++) {
                    for (let y = 0; y <= 3; y++) {
                        pixels.push(pixel(x, y, y === 0 ? FUR_SHADE : FUR_DARK));
                    }
                }
                // Right foot
                for (let x = 2; x <= 8; x++) {
                    for (let y = 0; y <= 3; y++) {
                        pixels.push(pixel(x, y, y === 0 ? FUR_SHADE : FUR_DARK));
                    }
                }

                // === THICK LEGS (y: 4-18) ===
                for (let y = 4; y <= 18; y++) {
                    // Left leg - chunky
                    for (let x = -7; x <= -2; x++) {
                        const shade = (x === -7 || x === -2) ? FUR_DARK : ((y % 4 < 2) ? FUR : FUR_LIGHT);
                        pixels.push(pixel(x, y, shade));
                    }
                    // Right leg - chunky
                    for (let x = 2; x <= 7; x++) {
                        const shade = (x === 2 || x === 7) ? FUR_DARK : ((y % 4 < 2) ? FUR : FUR_LIGHT);
                        pixels.push(pixel(x, y, shade));
                    }
                }

                // === LOWER BODY WITH APRON (y: 19-35) ===
                for (let y = 19; y <= 35; y++) {
                    const bodyWidth = y < 25 ? 9 : (y < 30 ? 10 : 9);
                    for (let x = -bodyWidth; x <= bodyWidth; x++) {
                        // Apron in front (narrower than body)
                        if (x >= -5 && x <= 5 && y >= 19 && y <= 32) {
                            pixels.push(pixel(x, y, (x === -5 || x === 5) ? APRON_SHADE : APRON));
                        } else {
                            // Fur on sides
                            const shade = (Math.abs(x) === bodyWidth) ? FUR_DARK : ((y % 3 === 0) ? FUR_LIGHT : FUR);
                            pixels.push(pixel(x, y, shade));
                        }
                    }
                }

                // === HEART ON APRON (y: 24-29) - "Kiss the Cook" ===
                const heartPixels = [
                    [-2, 28], [-1, 28], [1, 28], [2, 28],
                    [-3, 27], [-2, 27], [-1, 27], [0, 27], [1, 27], [2, 27], [3, 27],
                    [-3, 26], [-2, 26], [-1, 26], [0, 26], [1, 26], [2, 26], [3, 26],
                    [-2, 25], [-1, 25], [0, 25], [1, 25], [2, 25],
                    [-1, 24], [0, 24], [1, 24],
                    [0, 23]
                ];
                heartPixels.forEach(([hx, hy]) => pixels.push(pixel(hx, hy, HEART)));

                // === UPPER BODY / SHOULDERS (y: 36-48) ===
                for (let y = 36; y <= 48; y++) {
                    const shoulderWidth = y < 40 ? 10 : (y < 44 ? 11 : 10);
                    for (let x = -shoulderWidth; x <= shoulderWidth; x++) {
                        const shade = (Math.abs(x) >= shoulderWidth - 1) ? FUR_DARK : ((y % 3 === 0) ? FUR_LIGHT : FUR);
                        pixels.push(pixel(x, y, shade));
                    }
                }

                // === APRON STRAPS (over shoulders) ===
                for (let y = 33; y <= 46; y++) {
                    pixels.push(pixel(-4, y, APRON));
                    pixels.push(pixel(-3, y, APRON_SHADE));
                    pixels.push(pixel(4, y, APRON_SHADE));
                    pixels.push(pixel(5, y, APRON));
                }
                // Strap goes behind neck
                for (let x = -3; x <= 4; x++) {
                    pixels.push(pixel(x, 47, APRON_SHADE));
                }

                // === ARMS (y: 38-50) ===
                // Left arm - hanging
                for (let y = 36; y <= 50; y++) {
                    for (let x = -13; x <= -10; x++) {
                        pixels.push(pixel(x, y, (x === -13) ? FUR_DARK : FUR));
                    }
                }
                // Left hand/paw
                for (let x = -14; x <= -10; x++) {
                    for (let y = 32; y <= 36; y++) {
                        pixels.push(pixel(x, y, FACE));
                    }
                }

                // Right arm - holding spatula, bent
                for (let y = 36; y <= 48; y++) {
                    for (let x = 10; x <= 13; x++) {
                        pixels.push(pixel(x, y, (x === 13) ? FUR_DARK : FUR));
                    }
                }
                // Right hand holding spatula
                for (let x = 12; x <= 16; x++) {
                    for (let y = 42; y <= 46; y++) {
                        pixels.push(pixel(x, y, FACE));
                    }
                }

                // === SPATULA ===
                // Handle
                for (let y = 47; y <= 55; y++) {
                    pixels.push(pixel(14, y, SPATULA_HANDLE));
                    pixels.push(pixel(15, y, SPATULA_HANDLE));
                }
                // Metal head
                for (let x = 12; x <= 17; x++) {
                    for (let y = 56; y <= 62; y++) {
                        pixels.push(pixel(x, y, SPATULA_METAL));
                    }
                }

                // === NECK (y: 49-52) ===
                for (let y = 49; y <= 52; y++) {
                    for (let x = -5; x <= 5; x++) {
                        pixels.push(pixel(x, y, FUR));
                    }
                }

                // === BIG ROUND HEAD (y: 53-72) - Sam & Max style ===
                for (let y = 53; y <= 72; y++) {
                    // Head gets wider then narrower (round shape)
                    let headWidth;
                    if (y < 56) headWidth = 6 + (y - 53);
                    else if (y < 65) headWidth = 9;
                    else if (y < 70) headWidth = 9 - (y - 65);
                    else headWidth = 4 - (y - 70);

                    for (let x = -headWidth; x <= headWidth; x++) {
                        // Fur texture
                        const shade = (Math.abs(x) === headWidth) ? FUR_DARK :
                                     ((y + x) % 4 === 0) ? FUR_LIGHT : FUR;
                        pixels.push(pixel(x, y, shade));
                    }
                }

                // === FACE AREA (y: 56-65) ===
                for (let y = 56; y <= 65; y++) {
                    const faceWidth = y < 59 ? 4 : (y < 63 ? 5 : 4);
                    for (let x = -faceWidth; x <= faceWidth; x++) {
                        pixels.push(pixel(x, y, FACE));
                    }
                }

                // === EYES (y: 62-64) - friendly, slightly cartoonish ===
                // Eye whites
                pixels.push(pixel(-3, 63, EYE_WHITE)); pixels.push(pixel(-2, 63, EYE_WHITE));
                pixels.push(pixel(-3, 62, EYE_WHITE)); pixels.push(pixel(-2, 62, EYE_WHITE));
                pixels.push(pixel(2, 63, EYE_WHITE)); pixels.push(pixel(3, 63, EYE_WHITE));
                pixels.push(pixel(2, 62, EYE_WHITE)); pixels.push(pixel(3, 62, EYE_WHITE));
                // Pupils
                pixels.push(pixel(-2, 62, EYES));
                pixels.push(pixel(2, 62, EYES));

                // === NOSE (y: 59-61) - big friendly nose ===
                for (let x = -1; x <= 1; x++) {
                    for (let y = 59; y <= 61; y++) {
                        pixels.push(pixel(x, y, NOSE));
                    }
                }

                // === FRIENDLY SMILE (y: 57-58) ===
                pixels.push(pixel(-3, 58, FUR_DARK));
                pixels.push(pixel(-2, 57, FUR_DARK));
                pixels.push(pixel(-1, 57, FUR_DARK));
                pixels.push(pixel(0, 57, FUR_DARK));
                pixels.push(pixel(1, 57, FUR_DARK));
                pixels.push(pixel(2, 57, FUR_DARK));
                pixels.push(pixel(3, 58, FUR_DARK));

                // === CHEF'S HAT (y: 73-88) ===
                // Hat band
                for (let x = -7; x <= 7; x++) {
                    pixels.push(pixel(x, 73, HAT_SHADE));
                    pixels.push(pixel(x, 74, HAT));
                }
                // Hat puff (tall and puffy)
                for (let y = 75; y <= 88; y++) {
                    const hatWidth = y < 80 ? 7 : (y < 85 ? 8 : 6);
                    for (let x = -hatWidth; x <= hatWidth; x++) {
                        const shade = (Math.abs(x) === hatWidth || y === 88) ? HAT_SHADE : HAT;
                        pixels.push(pixel(x, y, shade));
                    }
                }
                // Hat pleats/folds for texture
                pixels.push(pixel(-3, 82, HAT_SHADE));
                pixels.push(pixel(3, 82, HAT_SHADE));
                pixels.push(pixel(0, 85, HAT_SHADE));

                pixels.forEach(px => this.earlSprite.add(px));
                this.earlSprite.setDepth(5);
            }

            // Edge zones for scene transitions
            createEdgeZones(height) {
                // Left edge zone (exit back to backyard)
                this.leftEdgeZone = this.add.zone(40, height * 0.5, 80, height)
                    .setInteractive()
                    .setOrigin(0.5);

                this.leftEdgeZone.on('pointerover', () => {
                    if (!this.inventoryOpen) {
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
                        this.transitionToScene('backyard', 'from_neighbor');
                    } else {
                        // Walk to edge then transition
                        this.hideArrowCursor();
                        this.walkToEdgeAndTransition(80, height * 0.80, 'backyard', 'from_neighbor');
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
                if (action === 'Use' || action === hotspot.verbLabels?.actionVerb) {
                    this.showDialog(hotspot.useResponse);
                } else if (action === 'Look At' || action === hotspot.verbLabels?.lookVerb) {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Talk To' || action === hotspot.verbLabels?.talkVerb) {
                    if (hotspot.talkResponse === 'START_EARL_CONVERSATION') {
                        const npcData = {
                            name: 'Earl',
                            x: 750,
                            y: this.scale.height * 0.55  // Speech bubble will be positioned 280px above this
                        };
                        const dialogue = this.getEarlDialogue();
                        this.enterConversation(npcData, dialogue);
                    } else {
                        this.showDialog(hotspot.talkResponse);
                    }
                }
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Grill') {
                    this.showDialog(`I don't think Earl would appreciate me tossing my ${item.name} on his grill.`);
                } else if (hotspot.name === 'Earl') {
                    this.showDialog(`I hand Earl my ${item.name}. He looks at it curiously, then hands it back. "Interesting, but I got burgers to flip."`);
                } else {
                    this.showDialog(`That doesn't work.`);
                }
            }

            update() {
                super.update();

                const time = this.time.now * 0.001;

                // Tiki lights gentle flicker
                if (this.tikiLights) {
                    this.tikiLights.forEach((light, i) => {
                        const flicker = Math.sin(time * 4 + i * 1.3) * 0.15 + Math.sin(time * 9 + i * 0.7) * 0.08;
                        light.intensity = 0.6 + flicker;
                    });
                }

                if (this.tikiBlooms) {
                    this.tikiBlooms.forEach((item, i) => {
                        const flicker = Math.sin(time * 4 + i * 1.3) * 0.1;
                        item.bloom.clear();
                        item.bloom.fillStyle(item.color, 0.15 + flicker * 0.3);
                        item.bloom.fillCircle(item.x, item.y, 12);
                        item.bloom.fillStyle(item.color, 0.25 + flicker * 0.2);
                        item.bloom.fillCircle(item.x, item.y, 6);
                    });
                }

                // Grill light flicker
                if (this.grillLight) {
                    const grillFlicker = Math.sin(time * 6) * 0.15 + Math.sin(time * 11) * 0.1;
                    this.grillLight.intensity = 0.9 + grillFlicker;
                }

                // Animate smoke particles
                if (this.smokeParticles) {
                    this.smokeParticles.forEach((particle, i) => {
                        // Rise and drift
                        const yOffset = (time * particle.speed * 50 + particle.offset * 100) % 150;
                        const xDrift = Math.sin(time * 2 + particle.offset) * 15;

                        particle.graphic.setPosition(
                            particle.baseX + xDrift,
                            particle.baseY - yOffset
                        );

                        // Fade as it rises
                        const alpha = Math.max(0, 0.4 - (yOffset / 300));
                        particle.graphic.setAlpha(alpha);
                    });
                }
            }
        }

        // ============================================================================
        // ATTIC SCENE - Teenager's bedroom with alien resident
        // ============================================================================
