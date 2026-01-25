        class AtticScene extends BaseScene {
            constructor() {
                super({ key: 'AtticScene' });
                this.worldWidth = 1280; // Single screen, no scrolling
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.70, maxY: 0.92 };
                this.alienSprite = null;
                this.tvFlickerTime = 0;
            }

            getHotspotData(height) {
                return [
                    {
                        x: 100, y: height * 0.55, w: 120, h: height * 0.35,
                        interactX: 180, interactY: height * 0.78,
                        name: 'Stairs Down',
                        verbLabels: { actionVerb: 'Descend', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "The stairs leading back down to the house. The warm glow from below is inviting.",
                        useResponse: "TRANSITION_TO_HOUSE",
                        talkResponse: "Thanks for the workout, stairs. My calves appreciate it."
                    },
                    {
                        x: 640, y: height * 0.48, w: 180, h: height * 0.30,
                        interactX: 520, interactY: height * 0.78,
                        name: 'Alien',
                        isNPC: true,
                        verbLabels: { actionVerb: 'Poke', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A gray alien. Huge black eyes, oversized head, sitting on a ratty couch... watching what appears to be a soap opera. This is not what I expected to find in an attic.",
                        useResponse: "He swats my hand away without looking. 'Do you MIND? Elena is about to confront Ricardo about the baby.'",
                        talkResponse: "START_ALIEN_CONVERSATION"
                    },
                    {
                        x: 640, y: height * 0.85, w: 250, h: height * 0.12,
                        interactX: 640, interactY: height * 0.82,
                        name: 'Old Couch',
                        verbLabels: { actionVerb: 'Sit on', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A beat-up old couch that's seen better decades. Currently occupied by an extraterrestrial being. The cushions are worn to the shape of someone who's been sitting there for... years?",
                        useResponse: "I start to sit down. The alien shifts over slightly, eyes still glued to the screen. I'll take that as an invitation.",
                        talkResponse: "The couch creaks ominously. It's been through a lot."
                    },
                    {
                        x: 1100, y: height * 0.55, w: 120, h: height * 0.25,
                        interactX: 1020, interactY: height * 0.78,
                        name: 'TV',
                        verbLabels: { actionVerb: 'Change channel', lookVerb: 'Watch', talkVerb: 'Talk to' },
                        lookResponse: "An ancient CRT television. The screen shows what looks like a telenovela - lots of dramatic close-ups and passionate arguing. The alien seems riveted.",
                        useResponse: "I reach for the dial. 'Touch that and I will END you,' the alien says flatly, still not looking away.",
                        talkResponse: "The TV responds with melodramatic Spanish dialogue. Someone named Ricardo has apparently betrayed someone."
                    },
                    {
                        x: 280, y: height * 0.35, w: 100, h: height * 0.25,
                        interactX: 300, interactY: height * 0.78,
                        name: 'Guitar',
                        verbLabels: { actionVerb: 'Play', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A dusty electric guitar leaning in the corner. Hasn't been played in a while. The strings are coated in what I hope is just dust.",
                        useResponse: "I strum it gently. The alien winces. 'That belonged to the teenager who lived here. Please stop. You're worse than he was.'",
                        talkResponse: "Sing me a song, guitar. No? Fair enough."
                    },
                    {
                        x: 400, y: height * 0.18, w: 200, h: height * 0.20,
                        interactX: 450, interactY: height * 0.78,
                        name: 'Band Posters',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Faded band posters on the sloped ceiling. Some 80s hair metal, some grunge. Whoever lived here had eclectic taste. And possibly hearing damage.",
                        useResponse: "The posters are practically glued to the wall by decades of humidity. They're not going anywhere.",
                        talkResponse: "The bands on these posters are probably all broken up by now. Such is the nature of rock and roll."
                    },
                    {
                        x: 900, y: height * 0.25, w: 80, h: height * 0.18,
                        interactX: 850, interactY: height * 0.78,
                        name: 'Strange Device',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Some kind of alien technology? It's got blinking lights and smooth curves that definitely weren't made on Earth. Looks broken though - there's a crack running through the middle.",
                        useResponse: "I touch it gingerly. Nothing happens. 'It's dead,' the alien says without looking. 'Like my hopes of ever leaving this planet.'",
                        talkResponse: "The device hums softly but doesn't respond. Typical."
                    },
                    {
                        x: 1150, y: height * 0.75, w: 80, h: height * 0.15,
                        interactX: 1080, interactY: height * 0.80,
                        name: 'Snack Pile',
                        verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A mountain of empty chip bags, candy wrappers, and soda cans. The alien has apparently developed a taste for Earth junk food. The pile is... impressive.",
                        useResponse: "I dig through the wrappers. Nothing but crumbs and regret. 'Those are MINE,' the alien mutters.",
                        talkResponse: "The snack pile rustles slightly. I hope that's just settling."
                    }
                ];
            }

            // Alien dialogue tree - cranky, obsessed with TV, secretly lonely
            getAlienDialogue() {
                return {
                    start: {
                        npcGreeting: this.getFlag('alien_talked_before')
                            ? "You again. Can't you see I'm busy? Elena just found out Ricardo is actually her half-brother."
                            : "*sigh* A human. In MY attic. The doctor said you might come up here eventually. What do you want?",
                        options: [
                            {
                                text: "What are you?",
                                heroLine: "So... not to be rude, but... what exactly ARE you?",
                                npcResponse: "What am I? WHAT AM I? I am Zyx'thorian the Destroyer, Harbinger of Extinction, He Who Brings the Final Night! ...Currently on hiatus. Shh, commercial's over.",
                                setFlag: 'alien_asked_what',
                                condition: (scene) => !scene.getFlag('alien_asked_what')
                            },
                            {
                                text: "Why are you watching TV?",
                                heroLine: "So... an alien. Watching soap operas. In an attic. This is normal.",
                                npcResponse: "These humans are IDIOTS. They lie, they betray, they make the worst possible decisions at every turn. It's... *chef's kiss* ...exquisite. I've learned more about human psychology from 'Passion's Tempest' than from any probe.",
                                setFlag: 'alien_asked_tv',
                                nextNode: 'tv_discussion',
                                condition: (scene) => !scene.getFlag('alien_asked_tv')
                            },
                            {
                                text: "How long have you been here?",
                                heroLine: "How long have you been up here exactly?",
                                npcResponse: "By your Earth calendar? Approximately... seventeen years. My ship crashed in 2009. I was SUPPOSED to trigger the extinction event, but the impact damaged my transmitter. And then I discovered basic cable.",
                                setFlag: 'alien_asked_how_long',
                                nextNode: 'crashed_ship'
                            },
                            {
                                text: "Tell me about your ship.",
                                heroLine: "You mentioned your ship crashed?",
                                npcResponse: "Yes, my magnificent vessel is now scattered across the neighboring forest. The self-destruct didn't even work properly. Everything is broken. Like my dreams.",
                                setFlag: 'alien_asked_ship',
                                nextNode: 'crashed_ship',
                                condition: (scene) => scene.getFlag('alien_asked_how_long') && !scene.getFlag('alien_asked_ship')
                            },
                            {
                                text: "I'll let you get back to your show.",
                                heroLine: "I'll leave you to your... program.",
                                npcResponse: "Finally, some consideration. Come back during commercials if you must talk. And close the door - you're letting the glow out.",
                                exit: true,
                                setFlag: 'alien_talked_before'
                            }
                        ]
                    },
                    tv_discussion: {
                        options: [
                            {
                                text: "What's happening in the show?",
                                heroLine: "So what's the plot of this thing?",
                                npcResponse: "WHERE DO I BEGIN. Elena married Ricardo not knowing he killed her father, but her father was actually alive and plotting revenge with Ricardo's evil twin, and NOW it turns out Ricardo might be her half-brother through a secret affair and- oh, you don't care. Nobody cares about MY interests.",
                                setFlag: 'alien_explained_plot'
                            },
                            {
                                text: "Seems like trash TV.",
                                heroLine: "I mean... this seems like pretty terrible television.",
                                npcResponse: "*bristles* TERRIBLE? This is ART. The melodrama, the betrayal, the inexplicable amnesia subplots... Your species creates garbage, but OCCASIONALLY that garbage is transcendent. Now be quiet, the evil twin is about to reveal himself.",
                                setFlag: 'alien_defended_show'
                            },
                            {
                                text: "Back to other topics.",
                                heroLine: "Let's talk about something else.",
                                npcResponse: "If we must.",
                                nextNode: 'start'
                            }
                        ]
                    },
                    crashed_ship: {
                        options: [
                            {
                                text: "Why don't you fix it?",
                                heroLine: "Can't you repair your ship and leave?",
                                npcResponse: "Oh, BRILLIANT suggestion. Fix the QUANTUM DISPLACEMENT DRIVE with EARTH TECHNOLOGY. Why didn't I think of that? The most advanced device your species has invented is the combination pizza oven and also it's a phone. I'm STUCK here.",
                                setFlag: 'alien_asked_repair'
                            },
                            {
                                text: "What about destroying Earth?",
                                heroLine: "Weren't you supposed to destroy Earth or something?",
                                npcResponse: "Yes, yes, extinction event, cosmic mandate, heat death of your sun hastened by three billion years, very important. But I MISSED the window. And then I discovered snacks. Have you tried 'Cool Ranch'? It's not cool and it's not ranch, but it IS delicious.",
                                setFlag: 'alien_asked_destroy',
                                condition: (scene) => !scene.getFlag('alien_asked_destroy')
                            },
                            {
                                text: "Do you miss home?",
                                heroLine: "Do you ever miss... wherever you're from?",
                                npcResponse: "...Sometimes. At night, when the TV is off and the house is quiet. My homeworld had seven moons. The light was always silver. Here it's just... dark. And your moon is PATHETIC. One? ONE moon? How do you even have tides?",
                                setFlag: 'alien_asked_home',
                                condition: (scene) => !scene.getFlag('alien_asked_home')
                            },
                            {
                                text: "Let's talk about something else.",
                                heroLine: "Let's change the subject.",
                                npcResponse: "Fine by me. The commercial break is almost over anyway.",
                                nextNode: 'start'
                            }
                        ]
                    }
                };
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup - no scrolling for single screen
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - bright ambient similar to main house
                this.lights.enable();
                const isMobile = this.sys.game.device.input.touch;
                this.lights.setAmbientColor(isMobile ? 0x9a9aaa : 0x7a7a8a); // Brighter on mobile

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create alien sprite
                this.createAlien(height);

                // Create player at spawn position
                const spawnPoint = this.registry.get('spawnPoint') || 'default';
                let spawnX = 180;
                if (spawnPoint === 'from_house') spawnX = 180;

                this.createPlayer(spawnX, height * 0.82);

                // Mark room as visited
                const state = this.getGameState();
                if (!state.visitedRooms.includes('attic')) {
                    state.visitedRooms.push('attic');
                    this.setGameState(state);
                    // First time entering - alien speaks
                    this.time.delayedCall(500, () => {
                        this.showDialog("*muttering from the darkness* Oh great. ANOTHER visitor. As if I didn't have enough interruptions.");
                    });
                }
            }

            // Draw attic room - MI2/Day of Tentacle style with TV glow
            drawRoom(worldWidth, height) {
                if (this.textures.exists('roomBackground')) {
                    this.textures.remove('roomBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Color palette - dark and moody with blue TV tones
                const WALL_DARK = 0x0a0a12;
                const WALL_MID = 0x12121a;
                const WALL_LIGHT = 0x1a1a25;
                const WOOD_DARK = 0x1a1208;
                const WOOD_MID = 0x2a2010;
                const WOOD_LIGHT = 0x3a3018;
                const FLOOR_DARK = 0x1a1510;
                const FLOOR_MID = 0x2a2518;
                const TV_GLOW = 0x4488cc;
                const TV_GLOW_LIGHT = 0x66aaee;

                const floorY = height * 0.70;

                // === BACK WALL (sloped attic ceiling) ===
                g.fillStyle(WALL_DARK);
                g.fillRect(0, 0, worldWidth, height);

                // Sloped ceiling from left
                g.fillStyle(WALL_MID);
                g.beginPath();
                g.moveTo(0, height * 0.10);
                g.lineTo(400, height * 0.05);
                g.lineTo(400, floorY);
                g.lineTo(0, floorY);
                g.closePath();
                g.fillPath();

                // Sloped ceiling from right
                g.beginPath();
                g.moveTo(worldWidth, height * 0.10);
                g.lineTo(880, height * 0.05);
                g.lineTo(880, floorY);
                g.lineTo(worldWidth, floorY);
                g.closePath();
                g.fillPath();

                // Center flat ceiling area
                g.fillStyle(WALL_LIGHT);
                g.fillRect(400, 0, 480, height * 0.08);

                // Ceiling beams (exposed rafters)
                g.fillStyle(WOOD_DARK);
                for (let i = 0; i < 5; i++) {
                    const beamX = 200 + i * 220;
                    // Angled beams following roof slope
                    g.lineStyle(8, WOOD_MID, 1);
                    if (beamX < 400) {
                        g.moveTo(beamX, height * 0.10 - (beamX / 400) * height * 0.05);
                        g.lineTo(beamX, floorY);
                    } else if (beamX > 880) {
                        g.moveTo(beamX, height * 0.10 - ((worldWidth - beamX) / 400) * height * 0.05);
                        g.lineTo(beamX, floorY);
                    } else {
                        g.moveTo(beamX, height * 0.05);
                        g.lineTo(beamX, floorY);
                    }
                    g.strokePath();
                }

                // === TV GLOW on walls (dithered) ===
                for (let px = 800; px < worldWidth; px += 4) {
                    for (let py = 50; py < floorY; py += 4) {
                        const dist = Math.sqrt(Math.pow(px - 1100, 2) + Math.pow(py - height * 0.50, 2));
                        if (dist < 350 && (px + py) % 8 === 0) {
                            const intensity = 1 - (dist / 350);
                            if (intensity > 0.3) {
                                g.fillStyle(TV_GLOW);
                                g.fillRect(px, py, 3, 3);
                            } else if (intensity > 0.1) {
                                g.fillStyle(0x223344);
                                g.fillRect(px, py, 2, 2);
                            }
                        }
                    }
                }

                // === FLOOR (old wooden boards) ===
                g.fillStyle(FLOOR_DARK);
                g.fillRect(0, floorY, worldWidth, height - floorY);

                // Floorboard lines
                g.lineStyle(2, WOOD_DARK, 0.7);
                for (let x = 0; x < worldWidth; x += 70) {
                    g.moveTo(x, floorY);
                    g.lineTo(x, height);
                    g.strokePath();
                }

                // Floor dithering
                for (let px = 0; px < worldWidth; px += 6) {
                    for (let py = floorY; py < height; py += 6) {
                        if ((px + py) % 18 === 0) {
                            g.fillStyle(FLOOR_MID);
                            g.fillRect(px, py, 3, 2);
                        }
                    }
                }

                // === STAIRS (left side, going down) ===
                const stairX = 50, stairY = floorY - 30;
                // Stairwell opening
                g.fillStyle(0x2a1a0a);
                g.fillRect(stairX, stairY - 20, 130, floorY - stairY + 50);
                // Warm glow from below
                g.fillStyle(0x3a2a15);
                g.fillRect(stairX + 10, stairY, 110, 40);
                for (let i = 0; i < 4; i++) {
                    g.fillStyle(0x2a1a08);
                    g.fillRect(stairX + 20, stairY + 35 + i * 15, 90, 8);
                }
                // Railing
                g.fillStyle(WOOD_MID);
                g.fillRect(stairX + 120, stairY - 50, 8, 80);
                g.fillStyle(WOOD_LIGHT);
                g.fillCircle(stairX + 124, stairY - 55, 8);

                // === BAND POSTERS on sloped walls ===
                // Left wall poster 1
                g.fillStyle(0x4a2020);
                g.fillRect(250, 90, 80, 100);
                g.fillStyle(0x6a3030);
                g.fillRect(255, 95, 70, 70);
                // Skull graphic (simplified)
                g.fillStyle(0xd0d0d0);
                g.fillCircle(290, 125, 18);
                g.fillStyle(0x4a2020);
                g.fillCircle(283, 120, 5);
                g.fillCircle(297, 120, 5);
                g.fillRect(280, 132, 20, 8);
                // Band name text
                g.fillStyle(0xff4444);
                g.fillRect(258, 168, 64, 8);

                // Left wall poster 2
                g.fillStyle(0x203050);
                g.fillRect(350, 70, 70, 90);
                g.fillStyle(0x3050a0);
                g.fillRect(355, 75, 60, 60);
                // Lightning bolt
                g.fillStyle(0xffff00);
                g.beginPath();
                g.moveTo(385, 80);
                g.lineTo(375, 105);
                g.lineTo(385, 105);
                g.lineTo(375, 130);
                g.lineTo(395, 100);
                g.lineTo(385, 100);
                g.closePath();
                g.fillPath();

                // === GUITAR in corner ===
                const guitarX = 230, guitarY = floorY - 20;
                // Guitar body
                g.fillStyle(0x6a2020);
                g.fillCircle(guitarX, guitarY - 40, 35);
                g.fillCircle(guitarX, guitarY - 90, 28);
                // Guitar neck
                g.fillStyle(WOOD_MID);
                g.fillRect(guitarX - 6, guitarY - 200, 12, 130);
                // Headstock
                g.fillStyle(WOOD_DARK);
                g.fillRect(guitarX - 10, guitarY - 220, 20, 25);
                // Strings (subtle)
                g.lineStyle(1, 0xaaaaaa, 0.5);
                for (let s = 0; s < 6; s++) {
                    g.moveTo(guitarX - 4 + s * 1.5, guitarY - 195);
                    g.lineTo(guitarX - 4 + s * 1.5, guitarY - 50);
                }
                g.strokePath();

                // === COUCH (center, worn out) ===
                const couchX = 500, couchY = floorY - 20, couchW = 280, couchH = 100;
                // Couch frame
                g.fillStyle(0x3a2a20);
                g.fillRect(couchX, couchY - couchH, couchW, couchH);
                // Cushions (lumpy, worn)
                g.fillStyle(0x4a3525);
                g.fillRect(couchX + 10, couchY - couchH + 15, couchW - 20, couchH - 30);
                // Cushion lines
                g.fillStyle(0x3a2518);
                g.fillRect(couchX + couchW/3, couchY - couchH + 15, 4, couchH - 35);
                g.fillRect(couchX + couchW*2/3, couchY - couchH + 15, 4, couchH - 35);
                // Back cushions
                g.fillStyle(0x4a3020);
                g.fillRect(couchX + 15, couchY - couchH - 40, couchW - 30, 45);
                // Couch arms
                g.fillStyle(0x3a2520);
                g.fillRect(couchX - 20, couchY - couchH - 20, 35, couchH + 20);
                g.fillRect(couchX + couchW - 15, couchY - couchH - 20, 35, couchH + 20);
                // TV glow on couch
                for (let cx = couchX; cx < couchX + couchW; cx += 5) {
                    for (let cy = couchY - couchH; cy < couchY; cy += 5) {
                        if ((cx + cy) % 15 === 0) {
                            g.fillStyle(TV_GLOW);
                            g.fillRect(cx, cy, 2, 2);
                        }
                    }
                }

                // === TV (foreground, seen from behind - silhouette) ===
                const tvX = 1020, tvY = floorY - 30, tvW = 180, tvH = 150;
                // TV back (dark silhouette)
                g.fillStyle(0x0a0a0a);
                g.fillRect(tvX, tvY - tvH, tvW, tvH);
                // TV shape details
                g.fillStyle(0x151515);
                g.fillRect(tvX + 10, tvY - tvH + 10, tvW - 20, tvH - 30);
                // Vents on back
                for (let v = 0; v < 5; v++) {
                    g.fillStyle(0x050505);
                    g.fillRect(tvX + 30, tvY - tvH + 25 + v * 20, tvW - 60, 8);
                }
                // TV stand
                g.fillStyle(0x0a0a0a);
                g.fillRect(tvX + 40, tvY - 5, tvW - 80, 10);
                g.fillRect(tvX + 60, tvY, tvW - 120, 30);
                // Glow spilling around edges
                g.fillStyle(TV_GLOW_LIGHT);
                g.fillRect(tvX - 5, tvY - tvH, 5, tvH);
                g.fillRect(tvX + tvW, tvY - tvH, 5, tvH);
                g.fillRect(tvX, tvY - tvH - 5, tvW, 5);

                // === ALIEN ARTIFACT (broken device) ===
                const artifactX = 880, artifactY = 140;
                // Base
                g.fillStyle(0x3a3a4a);
                g.fillCircle(artifactX, artifactY, 30);
                g.fillStyle(0x2a2a3a);
                g.fillCircle(artifactX, artifactY, 22);
                // Blinking lights
                g.fillStyle(0x00ff00);
                g.fillCircle(artifactX - 10, artifactY - 5, 3);
                g.fillStyle(0xff0000);
                g.fillCircle(artifactX + 10, artifactY - 5, 3);
                g.fillStyle(0x0066ff);
                g.fillCircle(artifactX, artifactY + 8, 3);
                // Crack
                g.lineStyle(2, 0x1a1a2a, 1);
                g.moveTo(artifactX - 15, artifactY - 20);
                g.lineTo(artifactX + 5, artifactY + 5);
                g.lineTo(artifactX + 20, artifactY + 25);
                g.strokePath();

                // === SNACK PILE (right side) ===
                const snackX = 1130, snackY = floorY - 10;
                // Pile of wrappers
                const wrapperColors = [0xdd2222, 0x22dd22, 0xdddd22, 0x2222dd, 0xdd8822];
                for (let w = 0; w < 15; w++) {
                    g.fillStyle(wrapperColors[w % wrapperColors.length]);
                    const wx = snackX + (w % 5) * 15 - 30 + Math.sin(w) * 10;
                    const wy = snackY - Math.floor(w / 5) * 12 - 10;
                    g.fillRect(wx, wy, 12 + (w % 3) * 4, 8 + (w % 2) * 4);
                }
                // Soda cans
                g.fillStyle(0xcc0000);
                g.fillRect(snackX + 30, snackY - 35, 18, 28);
                g.fillStyle(0xaaaaaa);
                g.fillRect(snackX + 30, snackY - 35, 18, 5);
                g.fillStyle(0x0000cc);
                g.fillRect(snackX - 10, snackY - 45, 18, 28);
                g.fillStyle(0xaaaaaa);
                g.fillRect(snackX - 10, snackY - 45, 18, 5);

                // === MISCELLANEOUS CLUTTER ===
                // Old magazines
                g.fillStyle(0x8a7a60);
                g.fillRect(450, floorY + 30, 40, 5);
                g.fillRect(455, floorY + 25, 40, 5);
                g.fillRect(448, floorY + 35, 40, 5);

                // Dust particles (dithered atmosphere)
                for (let px = 0; px < worldWidth; px += 20) {
                    for (let py = 50; py < floorY; py += 25) {
                        if ((px * py) % 500 < 5) {
                            g.fillStyle(0x333340);
                            g.fillRect(px, py, 1, 1);
                        }
                    }
                }

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('roomBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'roomBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            // Create alien sprite
            createAlien(height) {
                this.alienSprite = this.add.container(640, height * 0.52);

                const p = 3; // Pixel size

                // Color palette
                const SKIN_DARK = 0x5a5a6a;
                const SKIN_MID = 0x7a7a8a;
                const SKIN_LIGHT = 0x9a9aaa;
                const EYE_BLACK = 0x000000;
                const EYE_SHINE = 0x2a2a4a;
                const TEETH = 0xcccccc;

                const createPixel = (x, y, color) => {
                    const pixel = this.add.graphics();
                    pixel.fillStyle(color, 1);
                    pixel.fillRect(x * p, y * p, p, p);
                    pixel.setPipeline('Light2D');
                    return pixel;
                };

                // Body (sitting, hunched forward watching TV)
                // Torso
                for (let x = -8; x <= 8; x++) {
                    for (let y = 10; y <= 30; y++) {
                        if (Math.abs(x) <= 6 + (y - 10) * 0.2) {
                            const color = x < -3 ? SKIN_DARK : x > 3 ? SKIN_DARK : SKIN_MID;
                            this.alienSprite.add(createPixel(x, y, color));
                        }
                    }
                }

                // Arms (thin, resting on knees)
                // Left arm
                for (let i = 0; i < 15; i++) {
                    this.alienSprite.add(createPixel(-9 - i * 0.3, 15 + i * 0.8, SKIN_MID));
                    this.alienSprite.add(createPixel(-10 - i * 0.3, 15 + i * 0.8, SKIN_DARK));
                }
                // Right arm
                for (let i = 0; i < 15; i++) {
                    this.alienSprite.add(createPixel(9 + i * 0.3, 15 + i * 0.8, SKIN_MID));
                    this.alienSprite.add(createPixel(10 + i * 0.3, 15 + i * 0.8, SKIN_DARK));
                }

                // Hands (three long fingers each)
                for (let f = 0; f < 3; f++) {
                    // Left hand fingers
                    this.alienSprite.add(createPixel(-14 + f * 2, 28, SKIN_LIGHT));
                    this.alienSprite.add(createPixel(-14 + f * 2, 29, SKIN_MID));
                    // Right hand fingers
                    this.alienSprite.add(createPixel(14 + f * 2, 28, SKIN_LIGHT));
                    this.alienSprite.add(createPixel(14 + f * 2, 29, SKIN_MID));
                }

                // Neck (thin)
                for (let y = 5; y <= 10; y++) {
                    this.alienSprite.add(createPixel(-2, y, SKIN_DARK));
                    this.alienSprite.add(createPixel(-1, y, SKIN_MID));
                    this.alienSprite.add(createPixel(0, y, SKIN_MID));
                    this.alienSprite.add(createPixel(1, y, SKIN_MID));
                    this.alienSprite.add(createPixel(2, y, SKIN_DARK));
                }

                // Head (oversized, classic gray alien shape)
                for (let y = -25; y <= 5; y++) {
                    const headWidth = Math.floor(12 - Math.abs(y + 10) * 0.4);
                    for (let x = -headWidth; x <= headWidth; x++) {
                        let color = SKIN_MID;
                        if (x < -headWidth + 3) color = SKIN_DARK;
                        else if (x > headWidth - 3) color = SKIN_DARK;
                        else if (y < -20) color = SKIN_LIGHT;
                        this.alienSprite.add(createPixel(x, y, color));
                    }
                }

                // Eyes (huge, black, almond-shaped, reflecting TV)
                // Left eye
                for (let y = -15; y <= -5; y++) {
                    const eyeWidth = Math.floor(5 - Math.abs(y + 10) * 0.4);
                    for (let x = -10; x <= -10 + eyeWidth * 2; x++) {
                        this.alienSprite.add(createPixel(x, y, EYE_BLACK));
                    }
                }
                // Right eye
                for (let y = -15; y <= -5; y++) {
                    const eyeWidth = Math.floor(5 - Math.abs(y + 10) * 0.4);
                    for (let x = 10 - eyeWidth * 2; x <= 10; x++) {
                        this.alienSprite.add(createPixel(x, y, EYE_BLACK));
                    }
                }
                // Eye shine (TV reflection)
                this.alienSprite.add(createPixel(-8, -12, EYE_SHINE));
                this.alienSprite.add(createPixel(-7, -11, 0x4488aa));
                this.alienSprite.add(createPixel(6, -12, EYE_SHINE));
                this.alienSprite.add(createPixel(7, -11, 0x4488aa));

                // Mouth (thin line with hints of sharp teeth)
                for (let x = -4; x <= 4; x++) {
                    this.alienSprite.add(createPixel(x, 0, SKIN_DARK));
                }
                // Sharp teeth peeking
                this.alienSprite.add(createPixel(-3, 1, TEETH));
                this.alienSprite.add(createPixel(-1, 1, TEETH));
                this.alienSprite.add(createPixel(1, 1, TEETH));
                this.alienSprite.add(createPixel(3, 1, TEETH));
                // Teeth points
                this.alienSprite.add(createPixel(-2, 2, TEETH));
                this.alienSprite.add(createPixel(0, 2, TEETH));
                this.alienSprite.add(createPixel(2, 2, TEETH));

                this.alienSprite.setDepth(50);
            }

            createLighting(worldWidth, height) {
                // Primary light: TV glow (flickering blue-white) - increased intensity
                this.tvLight = this.lights.addLight(1100, height * 0.45, 500, 0x6699cc, 2.5);
                this.tvGlow = this.lights.addLight(1100, height * 0.50, 300, 0x88bbee, 2.0);

                // Secondary: warm glow from stairwell
                this.stairLight = this.lights.addLight(120, height * 0.65, 200, 0xffaa66, 0.8);

                // Fill light - brighter so we can see the room
                this.fillLight = this.lights.addLight(640, height * 0.50, 600, 0x445566, 0.4);

                // Artifact blinking light
                this.artifactLight = this.lights.addLight(880, 140, 80, 0x00ff00, 0.4);

                // TV bloom effects (behind the TV silhouette)
                this.tvBloom1 = this.add.graphics();
                this.tvBloom1.fillStyle(0x4488cc, 0.2);
                this.tvBloom1.fillCircle(0, 0, 120);
                this.tvBloom1.setPosition(1100, height * 0.45);
                this.tvBloom1.setBlendMode(Phaser.BlendModes.ADD);
                this.tvBloom1.setDepth(1);

                this.tvBloom2 = this.add.graphics();
                this.tvBloom2.fillStyle(0x6699aa, 0.12);
                this.tvBloom2.fillCircle(0, 0, 220);
                this.tvBloom2.setPosition(1100, height * 0.45);
                this.tvBloom2.setBlendMode(Phaser.BlendModes.ADD);
                this.tvBloom2.setDepth(1);

                // TV silhouette (drawn in FRONT of the bloom effects)
                const floorY = height * 0.70;
                const tvX = 1020, tvY = floorY - 30, tvW = 180, tvH = 150;
                this.tvSilhouette = this.add.graphics();
                // TV back (dark silhouette)
                this.tvSilhouette.fillStyle(0x0a0a0a);
                this.tvSilhouette.fillRect(tvX, tvY - tvH, tvW, tvH);
                // TV shape details
                this.tvSilhouette.fillStyle(0x151515);
                this.tvSilhouette.fillRect(tvX + 10, tvY - tvH + 10, tvW - 20, tvH - 30);
                // Vents on back
                for (let v = 0; v < 5; v++) {
                    this.tvSilhouette.fillStyle(0x050505);
                    this.tvSilhouette.fillRect(tvX + 30, tvY - tvH + 25 + v * 20, tvW - 60, 8);
                }
                // TV stand
                this.tvSilhouette.fillStyle(0x0a0a0a);
                this.tvSilhouette.fillRect(tvX + 40, tvY - 5, tvW - 80, 10);
                this.tvSilhouette.fillRect(tvX + 60, tvY, tvW - 120, 30);
                // Glow spilling around edges (visible from behind)
                this.tvSilhouette.fillStyle(0x66aaee);
                this.tvSilhouette.fillRect(tvX - 5, tvY - tvH, 5, tvH);
                this.tvSilhouette.fillRect(tvX + tvW, tvY - tvH, 5, tvH);
                this.tvSilhouette.fillRect(tvX, tvY - tvH - 5, tvW, 5);
                this.tvSilhouette.setDepth(2); // In front of bloom effects
            }

            executeAction(action, hotspot) {
                if (action === 'Use' || action === hotspot.verbLabels?.actionVerb) {
                    if (hotspot.name === 'Stairs Down') {
                        this.transitionToScene('GameScene', 'from_attic');
                    } else {
                        this.showDialog(hotspot.useResponse);
                    }
                } else if (action === 'Look At' || action === hotspot.verbLabels?.lookVerb) {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Talk To' || action === hotspot.verbLabels?.talkVerb) {
                    if (hotspot.talkResponse === 'START_ALIEN_CONVERSATION') {
                        const npcData = {
                            name: 'Zyx',
                            x: 640,
                            y: this.scale.height * 0.55
                        };
                        const dialogue = this.getAlienDialogue();
                        this.enterConversation(npcData, dialogue);
                    } else {
                        this.showDialog(hotspot.talkResponse);
                    }
                }
            }

            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Alien') {
                    this.showDialog(`The alien glances at my ${item.name}. 'Fascinating. Truly. Now put it away, you're blocking the screen.'`);
                } else if (hotspot.name === 'TV') {
                    this.showDialog(`I'm not putting my ${item.name} anywhere near that TV. The alien might actually destroy me.`);
                } else if (hotspot.name === 'Snack Pile') {
                    this.showDialog(`I add my ${item.name} to the pile. It fits right in with the rest of the garbage.`);
                } else {
                    this.showDialog(`That doesn't work.`);
                }
            }

            update() {
                super.update();

                const { height } = this.scale;
                const time = this.time.now * 0.001;

                // TV flicker effect
                if (this.tvLight) {
                    const flicker = 1 + Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.05 + Math.random() * 0.05;
                    this.tvLight.setIntensity(1.8 * flicker);
                    this.tvGlow.setIntensity(1.2 * flicker);

                    // Occasional color shift (scene change on TV)
                    if (Math.random() < 0.002) {
                        const colors = [0x6699cc, 0x99cc66, 0xcc9966, 0x9966cc];
                        const newColor = colors[Math.floor(Math.random() * colors.length)];
                        this.tvLight.setColor(newColor);
                    }
                }

                // Artifact light blink
                if (this.artifactLight) {
                    const blink = Math.sin(time * 2) > 0.7 ? 0.4 : 0.1;
                    this.artifactLight.setIntensity(blink);
                    // Occasionally change color
                    if (Math.sin(time * 0.5) > 0.9) {
                        this.artifactLight.setColor(0xff0000);
                    } else if (Math.sin(time * 0.5) < -0.9) {
                        this.artifactLight.setColor(0x0066ff);
                    } else {
                        this.artifactLight.setColor(0x00ff00);
                    }
                }

                // TV bloom pulse
                if (this.tvBloom1) {
                    const pulse = 1 + Math.sin(time * 6) * 0.15;
                    this.tvBloom1.setScale(pulse);
                }
            }
        }

        // ============================================================================
