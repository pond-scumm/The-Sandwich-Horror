        class GameScene extends BaseScene {
            constructor() {
                super({ key: 'GameScene' });
                this.worldWidth = 2400;
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.62, maxY: 0.88 };
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                return [
                    {
                        x: 50, y: height * 0.40, w: 80, h: height * 0.35,
                        interactX: 120, interactY: height * 0.72,
                        name: 'Front Door',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "The front door. Fresh air awaits on the other side.",
                        useResponse: "TRANSITION_TO_GARDEN",
                        talkResponse: "You're looking very door-able today."
                    },
                    {
                        x: 175, y: height * 0.22, w: 150, h: height * 0.25,
                        interactX: 175, interactY: height * 0.65,
                        name: 'Window',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Look through', talkVerb: 'Talk to' },
                        lookResponse: "A grimy window. I can barely see the moon through all that dirt.",
                        useResponse: "Painted shut. So much for my dramatic escape.",
                        talkResponse: "Hey window, how's it hanging? ...Tough crowd."
                    },
                    {
                        x: 410, y: height * 0.35, w: 120, h: height * 0.35,
                        interactX: 410, interactY: height * 0.70,
                        name: 'Bookshelf',
                        verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Dusty old books. 'Advanced Lock Picking'... 'Treasure Hunting for Dummies'... interesting collection.",
                        useResponse: "I pull a book and... nothing happens. Not every bookshelf hides a secret passage, I guess.",
                        talkResponse: "Any of you books know the way out? No? Didn't think so."
                    },
                    {
                        x: 610, y: height * 0.72, w: 120, h: height * 0.15,
                        interactX: 500, interactY: height * 0.75,
                        name: 'Chest',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Ooh, a treasure chest! With a big golden lock on it.",
                        useResponse: "It's locked. Of course it is. I need a key.",
                        talkResponse: "Open sesame! ...No? Worth a shot."
                    },
                    {
                        x: 780, y: height * 0.35, w: 100, h: height * 0.40,
                        interactX: 720, interactY: height * 0.72,
                        name: 'Stairs to Attic',
                        verbLabels: { actionVerb: 'Climb', lookVerb: 'Look up', talkVerb: 'Call out' },
                        lookResponse: "A narrow staircase leading up to what looks like an attic. There's a faint blue glow coming from up there. And... is that television noise?",
                        useResponse: "TRANSITION_TO_ATTIC",
                        talkResponse: "Hello? Anyone up there? ...I hear what sounds like a soap opera. Weird."
                    },
                    {
                        x: 1000, y: height * 0.20, w: 200, h: height * 0.28,
                        interactX: 1000, interactY: height * 0.65,
                        name: 'Painting',
                        verbLabels: { actionVerb: 'Move', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A majestic mountain landscape. Either a masterpiece or really good hotel art.",
                        useResponse: "Wait, there's something behind the frame... A key!",
                        talkResponse: "Nice peaks. Very... mountainous."
                    },
                    {
                        x: 1290, y: height * 0.45, w: 180, h: height * 0.25,
                        interactX: 1290, interactY: height * 0.72,
                        name: 'Fireplace',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Look at', talkVerb: 'Talk to' },
                        lookResponse: "A cozy fireplace. The flames dance invitingly, but I'm not THAT cold.",
                        useResponse: "I'm not sticking my hand in there. I need these fingers for pointing at things!",
                        talkResponse: "Crackle crackle to you too, fire."
                    },
                    {
                        x: 1150, y: height * 0.77, w: 300, h: height * 0.12,
                        interactX: 1150, interactY: height * 0.75,
                        name: 'Rug',
                        verbLabels: { actionVerb: 'Lift', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A fancy Persian rug. Probably worth more than everything I own.",
                        useResponse: "I lift the corner and... just dusty floor. How disappointing.",
                        talkResponse: "You really tie the room together, you know that?"
                    },
                    {
                        x: 1550, y: height * 0.40, w: 100, h: height * 0.35,
                        interactX: 1480, interactY: height * 0.72,
                        name: 'Steel Door',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A heavy steel door with strange symbols etched into it. Definitely not original to the house.",
                        useResponse: "TRANSITION_TO_LABORATORY",
                        talkResponse: "What secrets are you hiding? ...The strong, silent type, I see."
                    },
                    {
                        x: 1840, y: height * 0.50, w: 280, h: height * 0.15,
                        interactX: 1700, interactY: height * 0.72,
                        name: 'Desk',
                        verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "An oak desk with a journal on it. Looks important.",
                        useResponse: "The journal says 'the treasure is in the chest.' Very helpful, mysterious journal writer.",
                        talkResponse: "Hey desk, seen anything suspicious? No? Keeping your secrets, I see."
                    },
                    {
                        x: 2140, y: height * 0.35, w: 80, h: height * 0.35,
                        interactX: 2140, interactY: height * 0.72,
                        name: 'Grandfather Clock',
                        verbLabels: { actionVerb: 'Wind', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A stately grandfather clock. It's always 10:10 in here, apparently.",
                        useResponse: "I try winding it but... nothing. Time stands still in this place.",
                        talkResponse: "Tick tock, old timer. Got any secrets to share?"
                    },
                    {
                        x: 2310, y: height * 0.35, w: 120, h: height * 0.35,
                        interactX: 2200, interactY: height * 0.72,
                        name: 'Back Door',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A glass-paned door leading to the backyard. I can see some kind of glow coming from over the fence.",
                        useResponse: "TRANSITION_TO_BACKYARD",
                        talkResponse: "Take me to the great outdoors! ...Well, the small outdoors, anyway."
                    },
                    {
                        x: 2070, y: height * 0.60, w: 60, h: height * 0.20,
                        interactX: 2070, interactY: height * 0.75,
                        name: 'Potted Plant',
                        verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A leafy potted plant. Still alive somehow, despite the neglect.",
                        useResponse: "I dig around in the soil and... just dirt. And now dirty hands. Great.",
                        talkResponse: "Hey there, little guy. Photosynthesizing hard?"
                    }
                ];
            }

            preload() {
                this.load.on('loaderror', (file) => console.log('Failed to load:', file.key));
                this.load.audio('bgMusic', './background-music.mp3');
                this.load.audio('pickupSound', './pickup.mp3');
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup for wide room
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - warm interior ambient
                this.lights.enable();
                this.lights.setAmbientColor(0x8a7a7a); // Brighter ambient for better visibility

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Dynamic elements
                this.chestContainer = this.add.container(0, 0).setDepth(50);
                this.drawChest(height, this.getFlag('chest_unlocked'));

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create player at spawn position
                const spawnPoint = this.registry.get('spawnPoint') || 'default';
                let spawnX = 400;
                if (spawnPoint === 'left') spawnX = 100;
                else if (spawnPoint === 'right') spawnX = this.worldWidth - 100;
                else if (spawnPoint === 'from_lab') spawnX = 1480;
                else if (spawnPoint === 'from_backyard') spawnX = 2200;
                else if (spawnPoint === 'from_attic') spawnX = 720;

                this.createPlayer(spawnX, height * 0.75);

                // Center camera on player
                this.cameras.main.scrollX = Phaser.Math.Clamp(
                    spawnX - this.screenWidth / 2, 0, this.worldWidth - this.screenWidth
                );

                // Play background music
                if (this.cache.audio.exists('bgMusic') && !this.sound.get('bgMusic')) {
                    this.bgMusic = this.sound.add('bgMusic', { loop: true, volume: 0.5 });
                    this.bgMusic.play();
                }

                // Mark room as visited
                const state = this.getGameState();
                if (!state.visitedRooms.includes('house_interior')) {
                    state.visitedRooms.push('house_interior');
                    this.setGameState(state);
                    this.showDialog("Great, another dusty old room. Let's see what's in here.");
                }
            }

            // Room-specific background - LucasArts MI1/MI2 style with Victorian New England aesthetic
            drawRoom(worldWidth, height) {
                if (this.textures.exists('roomBackground')) {
                    this.textures.remove('roomBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Color palette - rich Victorian tones with LucasArts depth
                const WALL_DARK = 0x1a1428;
                const WALL_MID = 0x2a2448;
                const WALL_LIGHT = 0x3a3458;
                const WALL_ACCENT = 0x4a4468;
                const WOOD_DARK = 0x2a1a0a;
                const WOOD_MID = 0x4a3018;
                const WOOD_LIGHT = 0x5a4028;
                const WOOD_HIGHLIGHT = 0x6a5038;
                const FLOOR_DARK = 0x3a2818;
                const FLOOR_MID = 0x4a3828;
                const FLOOR_LIGHT = 0x5a4838;
                const MOLDING_DARK = 0x3a2a1a;
                const MOLDING_LIGHT = 0x6a5a4a;
                const GOLD = 0xc4a035;
                const GOLD_DARK = 0x8a7025;
                const BRASS = 0xb08030;

                const floorY = height * 0.72;

                // === BACK WALL with damask pattern ===
                g.fillStyle(WALL_DARK);
                g.fillRect(0, 0, worldWidth, floorY);
                g.fillStyle(WALL_MID);
                g.fillRect(0, height * 0.08, worldWidth, floorY - height * 0.08);

                // Damask wallpaper pattern with dithering
                for (let px = 0; px < worldWidth; px += 4) {
                    for (let py = 20; py < floorY - 120; py += 4) {
                        const patternX = (px % 80);
                        const patternY = (py % 60);
                        const inDiamond = Math.abs(patternX - 40) + Math.abs(patternY - 30) < 25;
                        if (inDiamond && ((px + py) % 8 === 0)) {
                            g.fillStyle(WALL_ACCENT);
                            g.fillRect(px, py, 3, 3);
                        }
                    }
                }

                // === CROWN MOLDING ===
                g.fillStyle(MOLDING_LIGHT);
                g.fillRect(0, 0, worldWidth, 18);
                g.fillStyle(MOLDING_DARK);
                g.fillRect(0, 18, worldWidth, 6);
                for (let x = 0; x < worldWidth; x += 20) {
                    g.fillStyle(MOLDING_LIGHT);
                    g.fillRect(x, 12, 12, 8);
                    if (x % 40 === 0) {
                        g.fillStyle(MOLDING_DARK);
                        g.fillRect(x + 10, 14, 2, 6);
                    }
                }

                // === WAINSCOTING ===
                const wainscotTop = floorY - 130;
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(0, wainscotTop - 8, worldWidth, 4);
                g.fillStyle(WOOD_MID);
                g.fillRect(0, wainscotTop - 4, worldWidth, 4);
                g.fillStyle(WOOD_DARK);
                g.fillRect(0, wainscotTop, worldWidth, 2);
                g.fillStyle(WOOD_MID);
                g.fillRect(0, wainscotTop, worldWidth, 130);

                // Wainscot panels
                for (let px = 30; px < worldWidth - 30; px += 140) {
                    g.fillStyle(WOOD_DARK);
                    g.fillRect(px, wainscotTop + 15, 110, 95);
                    g.fillStyle(WOOD_MID);
                    g.fillRect(px + 4, wainscotTop + 19, 102, 87);
                    for (let gy = wainscotTop + 22; gy < wainscotTop + 100; gy += 6) {
                        if ((px + gy) % 12 === 0) {
                            g.fillStyle(WOOD_LIGHT);
                            g.fillRect(px + 8, gy, 94, 2);
                        }
                    }
                    g.fillStyle(WOOD_HIGHLIGHT);
                    g.fillRect(px + 4, wainscotTop + 19, 102, 2);
                    g.fillRect(px + 4, wainscotTop + 19, 2, 87);
                }

                // Baseboard
                g.fillStyle(WOOD_DARK);
                g.fillRect(0, floorY - 12, worldWidth, 12);
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(0, floorY - 12, worldWidth, 2);

                // === FLOOR (simple parallel boards) ===
                g.fillStyle(FLOOR_DARK);
                g.fillRect(0, floorY, worldWidth, height - floorY);

                // Simple parallel floorboard lines
                g.lineStyle(2, WOOD_DARK, 0.6);
                for (let x = 0; x < worldWidth; x += 80) {
                    g.moveTo(x, floorY);
                    g.lineTo(x, height);
                }
                g.strokePath();

                // Horizontal plank lines
                for (let y = floorY + 25; y < height; y += 25) {
                    g.lineStyle(1, FLOOR_LIGHT, 0.4);
                    g.moveTo(0, y);
                    g.lineTo(worldWidth, y);
                    g.strokePath();
                }

                // Floor dithering for wood texture
                for (let px = 0; px < worldWidth; px += 8) {
                    for (let py = floorY; py < height; py += 8) {
                        if ((px + py) % 24 === 0) {
                            g.fillStyle(FLOOR_LIGHT);
                            g.fillRect(px, py, 3, 2);
                        }
                    }
                }

                // === FRONT DOOR (hotspot x:50) ===
                const doorX = 20, doorY = 70, doorW = 90, doorH = floorY - 70;
                g.fillStyle(WOOD_DARK);
                g.fillRect(doorX - 12, doorY - 20, doorW + 24, doorH + 20);
                // Transom
                g.fillStyle(0x0a1525);
                g.fillRect(doorX, doorY - 15, doorW, 20);
                g.fillStyle(WOOD_MID);
                g.fillRect(doorX + doorW/3, doorY - 15, 3, 20);
                g.fillRect(doorX + doorW*2/3, doorY - 15, 3, 20);
                // Door body
                g.fillStyle(WOOD_MID);
                g.fillRect(doorX, doorY + 8, doorW, doorH - 8);
                // Four panels
                const panelW = 35, panelH = 70;
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 2; col++) {
                        const px = doorX + 8 + col * 42;
                        const py = doorY + 20 + row * 85;
                        g.fillStyle(WOOD_DARK);
                        g.fillRect(px, py, panelW, panelH);
                        g.fillStyle(WOOD_LIGHT);
                        g.fillRect(px + 3, py + 3, panelW - 6, panelH - 6);
                    }
                }
                // Hardware
                g.fillStyle(BRASS);
                g.fillRect(doorX + doorW - 20, doorY + doorH/2, 8, 35);
                g.fillStyle(GOLD);
                g.fillCircle(doorX + doorW - 16, doorY + doorH/2 + 18, 6);

                // === WINDOW (hotspot x:175, extended lower to wainscot) ===
                const winX = 160, winY = 50, winW = 130, winH = wainscotTop - 60;
                // Window recess
                g.fillStyle(WOOD_DARK);
                g.fillRect(winX - 10, winY - 10, winW + 20, winH + 20);
                // Night sky
                g.fillStyle(0x0a0a20);
                g.fillRect(winX, winY, winW, winH);
                // Moon glow
                for (let r = 50; r > 0; r -= 5) {
                    g.fillStyle(r > 30 ? 0x1a1a40 : r > 15 ? 0x2a2a60 : 0x4a4a80);
                    g.fillCircle(winX + winW - 35, winY + 45, r);
                }
                g.fillStyle(0xe8e8d0);
                g.fillCircle(winX + winW - 35, winY + 45, 16);
                // Window frame (6 panes)
                g.fillStyle(WOOD_MID);
                g.fillRect(winX + winW/2 - 3, winY, 6, winH);
                g.fillRect(winX, winY + winH/3, winW, 6);
                g.fillRect(winX, winY + winH*2/3, winW, 6);
                // Frame border
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(winX - 6, winY - 6, winW + 12, 5);
                g.fillRect(winX - 6, winY + winH + 1, winW + 12, 5);
                g.fillRect(winX - 6, winY - 6, 5, winH + 12);
                g.fillRect(winX + winW + 1, winY - 6, 5, winH + 12);
                // Velvet curtains (extending to wainscot)
                const curtainColor1 = 0x4a0a1a;
                const curtainColor2 = 0x6a1a2a;
                for (let cy = winY - 15; cy < wainscotTop - 5; cy += 3) {
                    const fold = Math.sin(cy * 0.07) * 7;
                    g.fillStyle((cy % 6 < 3) ? curtainColor1 : curtainColor2);
                    g.fillRect(winX - 30 + fold, cy, 25, 3);
                    g.fillRect(winX + winW + 5 - fold, cy, 25, 3);
                }
                // Curtain rod
                g.fillStyle(BRASS);
                g.fillRect(winX - 40, winY - 20, winW + 80, 5);
                g.fillStyle(GOLD);
                g.fillCircle(winX - 40, winY - 18, 7);
                g.fillCircle(winX + winW + 40, winY - 18, 7);

                // === BOOKSHELF (hotspot x:410) ===
                const shelfX = 350, shelfY = 80, shelfW = 140, shelfH = floorY - 90;
                g.fillStyle(WOOD_DARK);
                g.fillRect(shelfX, shelfY, shelfW, shelfH);
                g.fillStyle(WOOD_MID);
                g.fillRect(shelfX + 5, shelfY + 5, shelfW - 10, shelfH - 10);
                // Pediment
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillTriangle(shelfX + shelfW/2, shelfY - 12, shelfX + 15, shelfY + 3, shelfX + shelfW - 15, shelfY + 3);
                // Shelves with books
                const bookColors = [0x6a1010, 0x104a10, 0x10106a, 0x4a104a, 0x4a3010, 0x103a4a];
                for (let s = 0; s < 5; s++) {
                    const sy = shelfY + 15 + s * (shelfH - 25) / 5;
                    g.fillStyle(WOOD_LIGHT);
                    g.fillRect(shelfX + 8, sy + 40, shelfW - 16, 5);
                    let bx = shelfX + 12;
                    while (bx < shelfX + shelfW - 18) {
                        const bookW = 7 + (bx * s) % 6;
                        const bookH = 28 + (bx + s) % 12;
                        g.fillStyle(bookColors[(bx + s) % bookColors.length]);
                        g.fillRect(bx, sy + 43 - bookH, bookW, bookH);
                        bx += bookW + 2;
                    }
                }

                // === STAIRWELL TO ATTIC (hotspot x:780) ===
                const stairX = 720, stairY = 50, stairW = 120, stairH = floorY - 50;
                // Dark stairwell opening
                g.fillStyle(0x0a0808);
                g.fillRect(stairX, stairY, stairW, stairH);
                // Wooden frame
                g.fillStyle(WOOD_DARK);
                g.fillRect(stairX - 8, stairY - 8, 10, stairH + 16);
                g.fillRect(stairX + stairW - 2, stairY - 8, 10, stairH + 16);
                g.fillRect(stairX - 8, stairY - 12, stairW + 16, 12);
                // Visible stairs going up into darkness
                for (let step = 0; step < 6; step++) {
                    const stepY = floorY - 25 - step * 35;
                    const stepX = stairX + 10 + step * 8;
                    const stepW = stairW - 20 - step * 12;
                    if (stepY > stairY + 20) {
                        // Step top
                        g.fillStyle(WOOD_MID);
                        g.fillRect(stepX, stepY - 6, stepW, 6);
                        // Step front
                        g.fillStyle(WOOD_DARK);
                        g.fillRect(stepX, stepY, stepW, 18);
                    }
                }
                // Blue TV glow from above (subtle hint)
                g.fillStyle(0x2a3a4a);
                g.fillRect(stairX + 20, stairY + 10, stairW - 40, 40);
                for (let gx = stairX + 25; gx < stairX + stairW - 25; gx += 6) {
                    for (let gy = stairY + 15; gy < stairY + 45; gy += 6) {
                        if ((gx + gy) % 12 === 0) {
                            g.fillStyle(0x3a5a7a);
                            g.fillRect(gx, gy, 3, 3);
                        }
                    }
                }
                // Railing
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(stairX + stairW - 12, stairY + 30, 6, stairH - 40);
                g.fillStyle(BRASS);
                g.fillCircle(stairX + stairW - 9, stairY + 28, 6);

                // === PAINTING (hotspot x:1000, standalone on wall) ===
                const paintX = 950, paintY = 60, paintW = 160, paintH = 110;
                // Gold frame
                g.fillStyle(GOLD_DARK);
                g.fillRect(paintX - 10, paintY - 10, paintW + 20, paintH + 20);
                g.fillStyle(GOLD);
                g.fillRect(paintX - 6, paintY - 6, paintW + 12, paintH + 12);
                g.fillStyle(GOLD_DARK);
                g.fillRect(paintX - 2, paintY - 2, paintW + 4, paintH + 4);
                // Canvas - landscape
                g.fillStyle(0x87ceeb);
                g.fillRect(paintX, paintY, paintW, paintH * 0.6);
                g.fillStyle(0x228b22);
                g.fillRect(paintX, paintY + paintH * 0.5, paintW, paintH * 0.5);
                // Mountains
                g.fillStyle(0x4a4a6a);
                g.fillTriangle(paintX + 40, paintY + 25, paintX + 10, paintY + paintH * 0.6, paintX + 70, paintY + paintH * 0.6);
                g.fillTriangle(paintX + 100, paintY + 20, paintX + 60, paintY + paintH * 0.6, paintX + 140, paintY + paintH * 0.6);
                // Snow caps
                g.fillStyle(0xffffff);
                g.fillTriangle(paintX + 40, paintY + 25, paintX + 30, paintY + 40, paintX + 50, paintY + 40);
                g.fillTriangle(paintX + 100, paintY + 20, paintX + 88, paintY + 38, paintX + 112, paintY + 38);

                // === FIREPLACE (hotspot x:1290, lower mantle) ===
                const fpX = 1200, fpY = 160, fpW = 180, fpH = floorY - 160;
                // Stone surround
                g.fillStyle(0x4a4a4a);
                g.fillRect(fpX, fpY, fpW, fpH);
                // Stone texture
                for (let sx = fpX; sx < fpX + fpW; sx += 10) {
                    for (let sy = fpY; sy < fpY + fpH; sy += 10) {
                        if ((sx + sy) % 20 === 0) {
                            g.fillStyle(0x5a5a5a);
                            g.fillRect(sx, sy, 7, 7);
                        }
                    }
                }
                // Firebox
                g.fillStyle(0x0a0a0a);
                g.fillRect(fpX + 25, fpY + 50, fpW - 50, fpH - 60);
                // Grate
                g.fillStyle(0x2a2a2a);
                g.fillRect(fpX + 35, fpY + fpH - 25, fpW - 70, 6);
                // Logs
                g.fillStyle(0x3a2010);
                g.fillRect(fpX + 45, fpY + fpH - 45, 40, 16);
                g.fillRect(fpX + 90, fpY + fpH - 40, 35, 12);
                // Flames
                g.fillStyle(0xff2200);
                g.fillTriangle(fpX + 70, fpY + fpH - 80, fpX + 50, fpY + fpH - 40, fpX + 90, fpY + fpH - 40);
                g.fillTriangle(fpX + 110, fpY + fpH - 75, fpX + 90, fpY + fpH - 40, fpX + 130, fpY + fpH - 40);
                g.fillStyle(0xff6600);
                g.fillTriangle(fpX + 80, fpY + fpH - 65, fpX + 60, fpY + fpH - 40, fpX + 100, fpY + fpH - 40);
                g.fillStyle(0xffaa00);
                g.fillTriangle(fpX + 90, fpY + fpH - 55, fpX + 75, fpY + fpH - 40, fpX + 105, fpY + fpH - 40);
                g.fillStyle(0xffdd44);
                g.fillTriangle(fpX + 90, fpY + fpH - 48, fpX + 82, fpY + fpH - 40, fpX + 98, fpY + fpH - 40);
                // Mantle (lower position)
                g.fillStyle(WOOD_DARK);
                g.fillRect(fpX - 12, fpY - 12, fpW + 24, 20);
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(fpX - 12, fpY - 12, fpW + 24, 5);
                // Corbels
                g.fillStyle(WOOD_MID);
                g.fillRect(fpX - 8, fpY + 5, 16, 45);
                g.fillRect(fpX + fpW - 8, fpY + 5, 16, 45);

                // === RUG (hotspot x:1150) ===
                const rugX = 1050, rugY = floorY + 12, rugW = 320, rugH = height - floorY - 25;
                g.fillStyle(0x6a1515);
                g.fillRoundedRect(rugX, rugY, rugW, rugH, 4);
                g.fillStyle(GOLD_DARK);
                g.fillRoundedRect(rugX + 8, rugY + 5, rugW - 16, rugH - 10, 3);
                g.fillStyle(0x4a0a0a);
                g.fillRoundedRect(rugX + 18, rugY + 12, rugW - 36, rugH - 24, 2);
                // Pattern
                for (let rx = rugX + 25; rx < rugX + rugW - 25; rx += 12) {
                    for (let ry = rugY + 16; ry < rugY + rugH - 16; ry += 12) {
                        if ((rx + ry) % 36 === 0) {
                            g.fillStyle(GOLD);
                            g.fillRect(rx, ry, 4, 4);
                        }
                    }
                }
                // Medallion
                g.fillStyle(GOLD_DARK);
                g.fillCircle(rugX + rugW/2, rugY + rugH/2, 30);
                g.fillStyle(0x6a1515);
                g.fillCircle(rugX + rugW/2, rugY + rugH/2, 22);
                g.fillStyle(GOLD);
                g.fillCircle(rugX + rugW/2, rugY + rugH/2, 6);

                // === STEEL LAB DOOR (hotspot x:1550) ===
                const labX = 1500, labY = 80, labW = 100, labH = floorY - 80;
                g.fillStyle(0x3a3a3a);
                g.fillRect(labX - 8, labY - 8, labW + 16, labH + 8);
                g.fillStyle(0x5a5a5a);
                g.fillRect(labX, labY, labW, labH);
                // Texture
                for (let dx = labX; dx < labX + labW; dx += 14) {
                    for (let dy = labY; dy < labY + labH; dy += 14) {
                        if ((dx + dy) % 28 === 0) {
                            g.fillStyle(0x6a6a6a);
                            g.fillRect(dx, dy, 10, 10);
                        }
                    }
                }
                // Rivets
                g.fillStyle(0x707070);
                [[12, 15], [labW-12, 15], [12, labH-15], [labW-12, labH-15]].forEach(([rx, ry]) => {
                    g.fillCircle(labX + rx, labY + ry, 5);
                });
                // Symbol
                g.lineStyle(3, 0x30a0a0, 0.9);
                g.strokeCircle(labX + labW/2, labY + labH/2 - 15, 25);
                g.moveTo(labX + labW/2, labY + labH/2 - 40);
                g.lineTo(labX + labW/2, labY + labH/2 + 10);
                g.moveTo(labX + labW/2 - 25, labY + labH/2 - 15);
                g.lineTo(labX + labW/2 + 25, labY + labH/2 - 15);
                g.strokePath();
                // Handle
                g.fillStyle(0x505050);
                g.fillRect(labX + labW - 25, labY + labH/2 + 15, 15, 40);

                // === DESK (hotspot x:1840) ===
                const deskX = 1750, deskY = floorY - 130, deskW = 180, deskH = 130;
                // Legs
                g.fillStyle(WOOD_DARK);
                g.fillRect(deskX + 12, deskY + 60, 16, 70);
                g.fillRect(deskX + deskW - 28, deskY + 60, 16, 70);
                // Body
                g.fillStyle(WOOD_MID);
                g.fillRect(deskX, deskY + 25, deskW, 40);
                // Desktop
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(deskX - 5, deskY + 8, deskW + 10, 6);
                // Leather surface
                g.fillStyle(0x2a4a2a);
                g.fillRect(deskX + 5, deskY + 14, deskW - 10, 14);
                // Drawers
                g.fillStyle(WOOD_DARK);
                g.fillRect(deskX + 15, deskY + 32, 60, 28);
                g.fillRect(deskX + deskW - 75, deskY + 32, 60, 28);
                g.fillStyle(WOOD_LIGHT);
                g.fillRect(deskX + 18, deskY + 35, 54, 22);
                g.fillRect(deskX + deskW - 72, deskY + 35, 54, 22);
                // Pulls
                g.fillStyle(BRASS);
                g.fillCircle(deskX + 45, deskY + 46, 4);
                g.fillCircle(deskX + deskW - 45, deskY + 46, 4);
                // Papers
                g.fillStyle(0xf5f0e0);
                g.fillRect(deskX + 50, deskY - 5, 45, 30);
                // Inkwell
                g.fillStyle(0x1a1a1a);
                g.fillRect(deskX + deskW - 40, deskY - 2, 18, 12);

                // === CLOCK (hotspot x:2140) ===
                const clockX = 2100, clockY = 45, clockW = 65, clockH = floorY - 50;
                g.fillStyle(WOOD_DARK);
                g.fillRect(clockX, clockY, clockW, clockH);
                // Hood
                g.fillStyle(WOOD_MID);
                g.fillRect(clockX - 4, clockY, clockW + 8, 75);
                // Pediment
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillTriangle(clockX + clockW/2, clockY - 12, clockX - 4, clockY + 4, clockX + clockW + 4, clockY + 4);
                // Finials
                g.fillStyle(BRASS);
                g.fillCircle(clockX + 4, clockY - 3, 5);
                g.fillCircle(clockX + clockW/2, clockY - 15, 7);
                g.fillCircle(clockX + clockW - 4, clockY - 3, 5);
                // Face
                g.fillStyle(GOLD_DARK);
                g.fillCircle(clockX + clockW/2, clockY + 42, 25);
                g.fillStyle(0xfff8e0);
                g.fillCircle(clockX + clockW/2, clockY + 42, 21);
                // Hands
                g.lineStyle(2, 0x1a1a1a, 1);
                g.moveTo(clockX + clockW/2, clockY + 42);
                g.lineTo(clockX + clockW/2, clockY + 28);
                g.moveTo(clockX + clockW/2, clockY + 42);
                g.lineTo(clockX + clockW/2 + 10, clockY + 47);
                g.strokePath();
                // Trunk
                g.fillStyle(WOOD_MID);
                g.fillRect(clockX + 8, clockY + 80, clockW - 16, clockH - 110);
                // Pendulum window
                g.fillStyle(0x0a0a15);
                g.fillRect(clockX + 14, clockY + 90, clockW - 28, clockH - 140);
                // Pendulum
                g.fillStyle(BRASS);
                g.fillRect(clockX + clockW/2 - 2, clockY + 95, 4, clockH - 165);
                g.fillStyle(GOLD);
                g.fillCircle(clockX + clockW/2, clockY + clockH - 80, 15);
                // Base
                g.fillStyle(WOOD_HIGHLIGHT);
                g.fillRect(clockX - 6, clockY + clockH - 30, clockW + 12, 30);

                // === PLANT (hotspot x:2070) ===
                const plantX = 2040, plantY = floorY - 80;
                g.fillStyle(0x8a4a2a);
                g.fillRect(plantX, plantY + 45, 45, 35);
                g.fillStyle(0x9a5a3a);
                g.fillRect(plantX - 4, plantY + 40, 53, 8);
                g.fillStyle(0x2a1a0a);
                g.fillRect(plantX + 6, plantY + 43, 33, 6);
                // Fern
                const fernColors = [0x1a4a1a, 0x2a5a2a, 0x3a6a3a];
                for (let f = 0; f < 6; f++) {
                    const angle = (f - 2.5) * 0.35;
                    g.fillStyle(fernColors[f % 3]);
                    for (let i = 0; i < 10; i++) {
                        const fx = plantX + 22 + Math.sin(angle) * i * 3.5;
                        const fy = plantY + 38 - i * 5;
                        g.fillRect(fx - 2, fy, 4, 4);
                        g.fillRect(fx - 7, fy + 1, 5, 3);
                        g.fillRect(fx + 3, fy + 1, 5, 3);
                    }
                }

                // === BACK DOOR (hotspot x:2310) ===
                const bdoorX = 2260, bdoorY = 85, bdoorW = 90, bdoorH = floorY - 85;
                g.fillStyle(WOOD_DARK);
                g.fillRect(bdoorX - 8, bdoorY - 8, bdoorW + 16, bdoorH + 8);
                g.fillStyle(WOOD_MID);
                g.fillRect(bdoorX, bdoorY, bdoorW, bdoorH);
                // Glass panes (2x2)
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 2; col++) {
                        g.fillStyle(0x0a1020);
                        g.fillRect(bdoorX + 10 + col * 38, bdoorY + 15 + row * 90, 32, 75);
                        if ((col + row) % 2 === 0) {
                            g.fillStyle(0xffffff);
                            g.fillRect(bdoorX + 20 + col * 38, bdoorY + 35 + row * 60, 2, 2);
                        }
                    }
                }
                // Warm glow
                g.fillStyle(0x3a3020);
                g.fillRect(bdoorX + 15, bdoorY + 120, 25, 30);
                // Handle
                g.fillStyle(BRASS);
                g.fillCircle(bdoorX + bdoorW - 15, bdoorY + bdoorH/2, 7);

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('roomBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'roomBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            // Room-specific chest (hotspot x:610)
            drawChest(height, isOpen) {
                this.chestContainer.removeAll(true);
                const chestX = 600, chestW = 120;

                const createBlock = (x, y, w, h, color) => {
                    const gfx = this.add.graphics();
                    gfx.fillStyle(color, 1);
                    gfx.fillRect(x, y, w, h);
                    gfx.setPipeline('Light2D');
                    return gfx;
                };

                if (isOpen) {
                    this.chestContainer.add(createBlock(chestX, height * 0.65, chestW, height * 0.15, 0x654321));
                    this.chestContainer.add(createBlock(chestX + 10, height * 0.68, chestW - 20, height * 0.10, 0x4a2d1e));
                    this.chestContainer.add(createBlock(chestX, height * 0.62, chestW, height * 0.06, 0x654321));
                    this.chestContainer.add(createBlock(chestX + 8, height * 0.63, chestW - 16, height * 0.04, 0x5c3d2e));

                    if (!this.getFlag('chest_looted')) {
                        if (!this.textures.exists('rubyGem')) {
                            const rubyRt = this.add.renderTexture(0, 0, 24, 24);
                            const rubyG = this.make.graphics({ add: false });
                            rubyG.fillStyle(0xe91e63);
                            rubyG.fillCircle(12, 12, 12);
                            rubyG.fillStyle(0xff5c8d);
                            rubyG.fillCircle(9, 10, 5);
                            rubyRt.draw(rubyG);
                            rubyG.destroy();
                            rubyRt.saveTexture('rubyGem');
                            rubyRt.destroy();
                        }
                        const ruby = this.add.sprite(chestX + chestW / 2, height * 0.72, 'rubyGem');
                        ruby.setPipeline('Light2D');
                        this.chestContainer.add(ruby);
                    }
                } else {
                    this.chestContainer.add(createBlock(chestX, height * 0.65, chestW, height * 0.15, 0x654321));
                    this.chestContainer.add(createBlock(chestX, height * 0.65, chestW, height * 0.04, 0x8b4513));
                    this.chestContainer.add(createBlock(chestX + chestW / 2 - 15, height * 0.72, 30, 18, 0xffd700));
                }
            }

            // Room-specific lighting
            createLighting(worldWidth, height) {
                // Cool moonlight through window (window center ~225) - larger radius, softer
                this.moonLight = this.lights.addLight(225, height * 0.25, 500, 0x7788bb, 0.6);
                this.moonLightSoft = this.lights.addLight(225, height * 0.30, 700, 0x556688, 0.25);

                // Main fireplace light - warm orange (fireplace center at 1290)
                this.fireplaceLight = this.lights.addLight(1290, height * 0.55, 550, 0xff8844, 1.2);
                // Secondary fireplace glow - softer, warmer
                this.fireplaceGlow = this.lights.addLight(1290, height * 0.62, 400, 0xffaa55, 0.7);
                // Tertiary ambient fire warmth - very large soft radius
                this.fireplaceAmbient = this.lights.addLight(1290, height * 0.65, 800, 0xff6633, 0.25);

                // Desk lamp - warm yellow (desk center ~1840) - larger radius
                this.deskLamp = this.lights.addLight(1840, height * 0.40, 400, 0xffee99, 0.9);
                this.deskLampSoft = this.lights.addLight(1840, height * 0.45, 600, 0xffdd77, 0.35);
                // Clock face subtle glow (clock center ~2132)
                this.clockLight = this.lights.addLight(2132, height * 0.38, 250, 0xffcc88, 0.5);

                // General room fill lights for visibility - increased
                this.fillLight1 = this.lights.addLight(500, height * 0.50, 600, 0x998877, 0.4);
                this.fillLight2 = this.lights.addLight(1900, height * 0.50, 600, 0x887766, 0.35);
                this.fillLight3 = this.lights.addLight(1200, height * 0.60, 500, 0x887777, 0.3);

                // Base intensities for animation
                this.fireplaceBaseIntensity = 1.2;
                this.fireplaceGlowBaseIntensity = 0.7;
                this.fireplaceAmbientBaseIntensity = 0.25;

                this.createLightBloom(height);
            }

            createLightBloom(height) {
                // Multi-layered fireplace bloom for soft gradual falloff (fireplace at 1290)
                // Layer 1: Core glow
                this.fireplaceBloom1 = this.add.graphics();
                this.fireplaceBloom1.fillStyle(0xff4400, 0.10);
                this.fireplaceBloom1.fillCircle(0, 0, 50);
                this.fireplaceBloom1.setPosition(1290, height * 0.60);
                this.fireplaceBloom1.setBlendMode(Phaser.BlendModes.ADD);
                this.fireplaceBloom1.setDepth(1);

                // Layer 2: Inner glow
                this.fireplaceBloom2 = this.add.graphics();
                this.fireplaceBloom2.fillStyle(0xff6600, 0.07);
                this.fireplaceBloom2.fillCircle(0, 0, 100);
                this.fireplaceBloom2.setPosition(1290, height * 0.60);
                this.fireplaceBloom2.setBlendMode(Phaser.BlendModes.ADD);
                this.fireplaceBloom2.setDepth(1);

                // Layer 3: Mid glow
                this.fireplaceBloom3 = this.add.graphics();
                this.fireplaceBloom3.fillStyle(0xff7733, 0.05);
                this.fireplaceBloom3.fillCircle(0, 0, 160);
                this.fireplaceBloom3.setPosition(1290, height * 0.60);
                this.fireplaceBloom3.setBlendMode(Phaser.BlendModes.ADD);
                this.fireplaceBloom3.setDepth(1);

                // Layer 4: Outer soft glow
                const fireplaceBloom4 = this.add.graphics();
                fireplaceBloom4.fillStyle(0xff8844, 0.03);
                fireplaceBloom4.fillCircle(0, 0, 250);
                fireplaceBloom4.setPosition(1290, height * 0.60);
                fireplaceBloom4.setBlendMode(Phaser.BlendModes.ADD);
                fireplaceBloom4.setDepth(1);

                // Layer 5: Very soft ambient warmth
                const fireplaceBloom5 = this.add.graphics();
                fireplaceBloom5.fillStyle(0xff9955, 0.02);
                fireplaceBloom5.fillCircle(0, 0, 350);
                fireplaceBloom5.setPosition(1290, height * 0.60);
                fireplaceBloom5.setBlendMode(Phaser.BlendModes.ADD);
                fireplaceBloom5.setDepth(1);

                // Moonlight bloom - cool blue, multi-layered soft (window center at 225)
                const moonBloom1 = this.add.graphics();
                moonBloom1.fillStyle(0x7799dd, 0.08);
                moonBloom1.fillCircle(0, 0, 80);
                moonBloom1.setPosition(225, height * 0.28);
                moonBloom1.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom1.setDepth(1);

                const moonBloom2 = this.add.graphics();
                moonBloom2.fillStyle(0x6688cc, 0.06);
                moonBloom2.fillCircle(0, 0, 140);
                moonBloom2.setPosition(225, height * 0.28);
                moonBloom2.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom2.setDepth(1);

                const moonBloom3 = this.add.graphics();
                moonBloom3.fillStyle(0x5577aa, 0.04);
                moonBloom3.fillCircle(0, 0, 220);
                moonBloom3.setPosition(225, height * 0.28);
                moonBloom3.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom3.setDepth(1);

                const moonBloom4 = this.add.graphics();
                moonBloom4.fillStyle(0x446699, 0.02);
                moonBloom4.fillCircle(0, 0, 320);
                moonBloom4.setPosition(225, height * 0.28);
                moonBloom4.setBlendMode(Phaser.BlendModes.ADD);
                moonBloom4.setDepth(1);

                // Desk lamp bloom - multi-layered soft (desk center at 1840)
                const deskBloom1 = this.add.graphics();
                deskBloom1.fillStyle(0xffee88, 0.08);
                deskBloom1.fillCircle(0, 0, 60);
                deskBloom1.setPosition(1840, height * 0.42);
                deskBloom1.setBlendMode(Phaser.BlendModes.ADD);
                deskBloom1.setDepth(1);

                const deskBloom2 = this.add.graphics();
                deskBloom2.fillStyle(0xffdd77, 0.06);
                deskBloom2.fillCircle(0, 0, 110);
                deskBloom2.setPosition(1840, height * 0.42);
                deskBloom2.setBlendMode(Phaser.BlendModes.ADD);
                deskBloom2.setDepth(1);

                const deskBloom3 = this.add.graphics();
                deskBloom3.fillStyle(0xffcc66, 0.04);
                deskBloom3.fillCircle(0, 0, 180);
                deskBloom3.setPosition(1840, height * 0.42);
                deskBloom3.setBlendMode(Phaser.BlendModes.ADD);
                deskBloom3.setDepth(1);

                const deskBloom4 = this.add.graphics();
                deskBloom4.fillStyle(0xffbb55, 0.02);
                deskBloom4.fillCircle(0, 0, 260);
                deskBloom4.setPosition(1840, height * 0.42);
                deskBloom4.setBlendMode(Phaser.BlendModes.ADD);
                deskBloom4.setDepth(1);
            }

            // Room-specific action handling
            executeAction(action, hotspot) {
                if (action === 'Look At') {
                    if (hotspot.name === 'Chest') {
                        if (this.getFlag('chest_looted')) {
                            this.showDialog("Empty now. I already grabbed everything.");
                        } else if (this.getFlag('chest_unlocked')) {
                            this.showDialog("It's open! And there's something sparkly inside...");
                        } else {
                            this.showDialog(hotspot.lookResponse);
                        }
                    } else if (hotspot.name === 'Painting') {
                        if (this.getFlag('key_found')) {
                            this.showDialog("A majestic mountain landscape. The frame's a bit crooked now.");
                        } else {
                            this.showDialog(hotspot.lookResponse);
                        }
                    } else {
                        this.showDialog(hotspot.lookResponse);
                    }
                } else if (action === 'Use') {
                    if (hotspot.name === 'Front Door') {
                        this.transitionToScene('GardenScene', 'from_house');
                    } else if (hotspot.name === 'Steel Door') {
                        this.transitionToScene('LaboratoryScene', 'from_house');
                    } else if (hotspot.name === 'Back Door') {
                        this.transitionToScene('BackyardScene', 'from_house');
                    } else if (hotspot.name === 'Stairs to Attic') {
                        this.transitionToScene('AtticScene', 'from_house');
                    } else if (hotspot.name === 'Painting') {
                        if (!this.getFlag('key_found')) {
                            this.setFlag('key_found', true);
                            this.addToInventory({ id: 'key', name: 'Key', color: 0xffd700 });
                            this.showDialog("Wait, a key behind the painting? Classic!");
                        } else {
                            this.showDialog("Nothing else here. Just wall.");
                        }
                    } else if (hotspot.name === 'Chest') {
                        if (!this.getFlag('chest_unlocked')) {
                            this.showDialog(hotspot.useResponse);
                        } else if (!this.getFlag('chest_looted')) {
                            this.setFlag('chest_looted', true);
                            this.addToInventory({ id: 'gem', name: 'Ruby', color: 0xe91e63 });
                            this.drawChest(this.scale.height, true);
                            this.showDialog("A ruby! A big sparkly ruby! This is mine now.");
                        } else {
                            this.showDialog("Already empty. I'm thorough.");
                        }
                    } else {
                        this.showDialog(hotspot.useResponse);
                    }
                } else if (action === 'Talk To') {
                    this.showDialog(hotspot.talkResponse);
                }
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (item.id === 'key' && hotspot.name === 'Chest') {
                    if (!this.getFlag('chest_unlocked')) {
                        this.setFlag('chest_unlocked', true);
                        this.removeFromInventory('key');
                        this.deselectItem();
                        this.drawChest(this.scale.height, true);
                        this.showDialog("Click! The key fits! The chest is open!");
                    } else {
                        this.showDialog("It's already unlocked.");
                    }
                } else {
                    this.showDialog(`That doesn't work.`);
                }
            }

            update() {
                super.update();

                // Organic fireplace flicker with multiple frequencies
                if (this.fireplaceLight) {
                    const time = this.time.now * 0.001;

                    // Combine multiple sine waves for organic flicker
                    const flicker1 = Math.sin(time * 8) * 0.12;
                    const flicker2 = Math.sin(time * 13 + 0.5) * 0.08;
                    const flicker3 = Math.sin(time * 21 + 1.2) * 0.05;
                    const randomPop = Math.random() > 0.98 ? 0.15 : 0; // Occasional spark pop
                    const totalFlicker = flicker1 + flicker2 + flicker3 + randomPop;

                    // Main fireplace light intensity
                    this.fireplaceLight.intensity = this.fireplaceBaseIntensity + totalFlicker;

                    // Secondary glow follows with slight delay feel
                    const glowFlicker = Math.sin(time * 7 + 0.3) * 0.1 + Math.sin(time * 15 + 0.8) * 0.06;
                    this.fireplaceGlow.intensity = this.fireplaceGlowBaseIntensity + glowFlicker;

                    // Ambient warmth pulses slowly
                    const ambientPulse = Math.sin(time * 2) * 0.08;
                    this.fireplaceAmbient.intensity = this.fireplaceAmbientBaseIntensity + ambientPulse;

                    // Animate bloom opacity for soft glow effect
                    if (this.fireplaceBloom1) {
                        this.fireplaceBloom1.setAlpha(0.8 + totalFlicker * 0.5);
                        this.fireplaceBloom2.setAlpha(0.7 + glowFlicker * 0.4);
                    }
                }
            }
        }

        // ============================================================================
        // GARDEN SCENE - Victorian House Exterior at Night (extends BaseScene)
        // ============================================================================
