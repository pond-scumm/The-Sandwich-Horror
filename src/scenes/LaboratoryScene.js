        // Room ID: 'laboratory'
        class LaboratoryScene extends BaseScene {
            constructor() {
                super({ key: 'laboratory' });
                this.worldWidth = 2560; // 2x screen width
                this.screenWidth = 1280;
                this.walkableArea = { minY: 0.68, maxY: 0.90 };
            }

            // Room-specific hotspot data
            getHotspotData(height) {
                return [
                    {
                        x: 150, y: height * 0.45, w: 100, h: height * 0.35,
                        interactX: 220, interactY: height * 0.78,
                        name: 'Door to House',
                        verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "The way back to sanity. Or at least, back to rooms without interdimensional portals.",
                        useResponse: "TRANSITION_TO_HOUSE",
                        talkResponse: "You're my favorite door. Don't tell the others."
                    },
                    {
                        x: 1280, y: height * 0.35, w: 280, h: height * 0.40,
                        interactX: 1280, interactY: height * 0.78,
                        name: 'Portal Device',
                        verbLabels: { actionVerb: 'Examine', lookVerb: 'Study', talkVerb: 'Talk to' },
                        lookResponse: "A swirling vortex of otherworldly energy. Either a gateway to another dimension or the world's most dangerous lava lamp.",
                        useResponse: "Sure, let me just stick my hand into the crackling void. ...On second thought, I'd like to keep all my fingers.",
                        talkResponse: "Hello? Anyone home? ...Nothing. Either nobody's there, or they're screening my calls."
                    },
                    {
                        x: 2100, y: height * 0.40, w: 200, h: height * 0.35,
                        interactX: 2000, interactY: height * 0.78,
                        name: 'Control Terminal',
                        verbLabels: { actionVerb: 'Use', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Blinking lights, ominous switches, and three buttons labeled 'DO NOT PRESS'. So naturally...",
                        useResponse: "Alright, let's flip something and see what happens. ...Huh. Nothing exploded. Disappointing, honestly.",
                        talkResponse: "Beep boop? ...Right. The strong, silent type."
                    },
                    {
                        x: 650, y: height * 0.35, w: 150, h: height * 0.30,
                        interactX: 650, interactY: height * 0.78,
                        name: 'Tesla Coil',
                        verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Crackling electricity, copper coils, chrome sphere on top. Either mad science or a very aggressive lamp.",
                        useResponse: "Touch the giant lightning machine? Bold strategy. Let's see how that... BZZZT! ...Noted.",
                        talkResponse: "BZZZT! Was that 'hello' or 'go away'? Hard to tell with Tesla coils."
                    },
                    {
                        x: 1800, y: height * 0.55, w: 120, h: height * 0.25,
                        interactX: 1750, interactY: height * 0.78,
                        name: 'Equipment Shelf',
                        verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "Beakers, tubes, bubbling liquids, and... is that a brain in a jar? Please be decorative. Please be decorative.",
                        useResponse: "Let's see if there's anything useful in... whoops. That beaker wasn't important, right?",
                        talkResponse: "If anything here is sentient, now's the time to speak up. ...Okay good. Just checking."
                    },
                    {
                        x: 400, y: height * 0.50, w: 100, h: height * 0.25,
                        interactX: 450, interactY: height * 0.78,
                        name: 'Chalkboard',
                        verbLabels: { actionVerb: 'Read', lookVerb: 'Study', talkVerb: 'Talk to' },
                        lookResponse: "Equations, diagrams, arcane symbols. Either groundbreaking physics or someone really committed to their doodles.",
                        useResponse: "Might as well add something. There. A little smiley face. My contribution to science.",
                        talkResponse: "E equals MC... squared? Cubed? ...Math remains unimpressed by my guesses."
                    },
                    {
                        x: 2050, y: height * 0.55, w: 80, h: height * 0.30,
                        interactX: 1950, interactY: height * 0.78,
                        name: 'Dr. Manzana',
                        isNPC: true,
                        verbLabels: { actionVerb: 'Poke', lookVerb: 'Examine', talkVerb: 'Talk to' },
                        lookResponse: "A composed man in a pristine lab coat. Slick dark hair, goggles pushed up on his forehead, a meticulous mustache. He's focused intently on the terminal.",
                        useResponse: "Poking a scientist mid-experiment seems unwise. Maybe just talk to him?",
                        talkResponse: "START_CONVERSATION"
                    }
                ];
            }

            // Scientist dialogue tree - Dr. Hector Manzana
            getScientistDialogue() {
                return {
                    start: {
                        options: [
                            {
                                text: "Hi, I'm here about the job posting.",
                                heroLine: "Hi there! I'm Nate - Nathaniel Barnswallow. I'm here about the job posting in Fringe Science Quarterly?",
                                npcResponse: "The job posting. Hm. I don't entirely remember placing that, but... well, the universe works in mysterious ways. And I could use an extra pair of hands tonight. You any good with instruments?",
                                nextNode: 'hiring',
                                setFlag: 'introduced_self',
                                condition: (scene) => !scene.getFlag('introduced_self')
                            },
                            {
                                text: "What's with the swirling vortex?",
                                heroLine: "So that swirling vortex of unknown energy in the middle of the room... should I be concerned, or...?",
                                npcResponse: "The Resonance Gateway? Nah, she's gentle. Mostly. Tonight's the night we finally get a stable connection. Years of work, all coming together. It's actually quite exciting. In a 'could alter the fabric of reality' sort of way.",
                                nextNode: 'portal_questions',
                                setFlag: 'asked_portal',
                                condition: (scene) => scene.getFlag('hired_for_night')
                            },
                            {
                                text: "What do you need me to do?",
                                heroLine: "So what do you need me to do? I'm eager to help. Possibly too eager. It's a character flaw.",
                                npcResponse: "Ha! I like you already. Okay, simple job - keep an eye on that terminal over there. If the numbers go into the red, holler. If they go into the purple, run. I'll handle the rest.",
                                nextNode: 'tasks',
                                setFlag: 'asked_tasks',
                                condition: (scene) => scene.getFlag('hired_for_night') && !scene.getFlag('asked_tasks')
                            },
                            {
                                text: "I noticed some unusual things around here...",
                                heroLine: "I couldn't help but notice some... unusual things around the house. Anything I should know about?",
                                npcResponse: "You'll have to be more specific. 'Unusual' covers a lot of ground around here. I've learned to be very precise with my vocabulary.",
                                nextNode: 'houseguests',
                                condition: (scene) => scene.getFlag('hired_for_night')
                            },
                            {
                                text: "Most scientists would call this insane.",
                                heroLine: "Most scientists would call this kind of research... how do I put this diplomatically... completely insane?",
                                npcResponse: "Oh, they do. Frequently. But here's the thing - I get results. Real, measurable, occasionally terrifying results. Hard to argue with data, even when the data suggests reality is more flexible than people like to believe.",
                                nextNode: 'philosophy',
                                setFlag: 'asked_philosophy',
                                condition: (scene) => scene.getFlag('hired_for_night') && !scene.getFlag('asked_philosophy')
                            },
                            {
                                text: "I'll let you get back to work.",
                                heroLine: "I'll let you get back to it. Don't let me interrupt the... reality bending.",
                                npcResponse: "Appreciated. Stick around though - when the readings stabilize, things might get interesting. And by interesting I mean potentially catastrophic. In a good way.",
                                exit: true,
                                condition: (scene) => scene.getFlag('hired_for_night')
                            }
                        ]
                    },
                    hiring: {
                        options: [
                            {
                                text: "I love instruments! Well, I've read about them.",
                                heroLine: "Instruments? I love instruments. Well, I've read about them. Extensively. I'm basically an expert who's never touched one.",
                                npcResponse: "Perfect. You'll fit right in. I'm Hector, by the way. Dr. Manzana if we're being formal, but we're not. Welcome to the night shift. Try not to die.",
                                setFlag: 'hired_for_night',
                                nextNode: 'start'
                            },
                            {
                                text: "What exactly would I be getting into?",
                                heroLine: "Before I commit... what exactly would I be getting myself into here?",
                                npcResponse: "Portal stabilization. Dimensional resonance calibration. Possibly making contact with parallel realities. Standard Tuesday night stuff, really. Nothing to worry about. Probably.",
                                nextNode: 'hiring'
                            }
                        ]
                    },
                    portal_questions: {
                        options: [
                            {
                                text: "How dangerous is that thing?",
                                heroLine: "On a scale of 'paper cut' to 'unraveling the fabric of spacetime'... how dangerous are we talking?",
                                npcResponse: "Very. But in a manageable way. Like skydiving, except instead of falling you might get scattered across multiple dimensions. The containment field handles most of it though. Mostly.",
                                setFlag: 'asked_danger',
                                condition: (scene) => !scene.getFlag('asked_danger')
                            },
                            {
                                text: "Where does it lead?",
                                heroLine: "So where does it actually lead? Narnia? The Upside Down? A dimension where everyone has goatees?",
                                npcResponse: "Somewhere similar to here, but different. The readings suggest comparable physical laws, just... shifted slightly. Could be fascinating. Could be horrifying. That's science for you.",
                                setFlag: 'asked_destination',
                                condition: (scene) => !scene.getFlag('asked_destination')
                            },
                            {
                                text: "Has anyone gone through it?",
                                heroLine: "Has anyone ever... you know... gone through it? On purpose or otherwise?",
                                npcResponse: "Sent through some probes. Most came back. Got some interesting readings from the ones that didn't. Still working on the human trials. Volunteers have been... scarce.",
                                setFlag: 'asked_travel',
                                condition: (scene) => !scene.getFlag('asked_travel')
                            },
                            {
                                text: "What's special about tonight?",
                                heroLine: "What makes tonight special? Besides the obvious 'swirling portal in the living room' thing?",
                                npcResponse: "The frequency's been fluctuating for weeks - never could hold a stable connection. Tonight, for the first time, it's steady. If we lock it in now, we get a permanent bridge. That's never been done before. By anyone. Anywhere.",
                                setFlag: 'asked_breakthrough',
                                condition: (scene) => !scene.getFlag('asked_breakthrough')
                            },
                            {
                                text: "Let me ask about something else.",
                                heroLine: "Fascinating. And mildly terrifying. Let me ask about something else before my existential dread kicks in.",
                                npcResponse: "Fair enough. What else is on your mind?",
                                nextNode: 'start'
                            }
                        ]
                    },
                    tasks: {
                        options: [
                            {
                                text: "Red means holler, purple means run. Got it.",
                                heroLine: "Red means holler, purple means run. I think I can handle that. Probably.",
                                npcResponse: "That's the spirit. Cautious optimism. The official mood of fringe science. Now, the readings should stay in the green for a while. If they don't... well, we'll cross that bridge when we come to it. Or when it collapses.",
                                setFlag: 'accepted_task',
                                nextNode: 'start'
                            },
                            {
                                text: "What if things go really wrong?",
                                heroLine: "And if things go really wrong? Like, 'dimensional rift swallowing the house' wrong?",
                                npcResponse: "Then we improvise. I've got contingency plans for my contingency plans. And a fire extinguisher. You'd be surprised how often that last one comes in handy.",
                                nextNode: 'tasks'
                            }
                        ]
                    },
                    houseguests: {
                        options: [
                            {
                                text: "I saw something in the attic. With eyes.",
                                heroLine: "I thought I saw something in the attic. Something with... a lot of eyes? Please tell me that was a hallucination.",
                                npcResponse: "Oh, that's just the alien. Don't mind him - he's been crashing here for a while. Mostly just watches his shows. Very into soap operas. Gets surprisingly emotional about them.",
                                setFlag: 'asked_alien',
                                condition: (scene) => !scene.getFlag('asked_alien')
                            },
                            {
                                text: "Your neighbor seems... large. And furry.",
                                heroLine: "Your neighbor Earl seems... large. And furry. Is that just a style choice, or...?",
                                npcResponse: "Earl? Yeah, he's a bigfoot. Good guy though. We play chess on Thursdays. He's terrible at it, but he makes this amazing chili, so it evens out.",
                                setFlag: 'asked_earl',
                                condition: (scene) => !scene.getFlag('asked_earl')
                            },
                            {
                                text: "Anything in the basement I should know about?",
                                heroLine: "Is there anything in the basement I should know about? Or specifically avoid knowing about?",
                                npcResponse: "The basement is... a work in progress. Let's leave it at that for now. Nothing down there that concerns tonight's experiment. Probably best to just focus on the portal.",
                                setFlag: 'asked_basement',
                                condition: (scene) => !scene.getFlag('asked_basement')
                            },
                            {
                                text: "You know what? I'll just roll with it.",
                                heroLine: "You know what? I'm just going to roll with it. Aliens, bigfoots, mystery basements. This is fine.",
                                npcResponse: "That's the healthiest attitude, honestly. Questioning reality too hard can be exhausting. Better to just make coffee and keep going.",
                                nextNode: 'start'
                            }
                        ]
                    },
                    philosophy: {
                        options: [
                            {
                                text: "Don't other scientists give you a hard time?",
                                heroLine: "Don't the mainstream scientists give you a hard time? The whole 'mad scientist' stereotype and all?",
                                npcResponse: "Oh, constantly. They think I'm a crackpot. But I've got a working interdimensional portal in my basement-slash-laboratory, and they've got... peer review. I know which one I'd rather have.",
                                setFlag: 'asked_crazy',
                                condition: (scene) => !scene.getFlag('asked_crazy')
                            },
                            {
                                text: "Why this town specifically?",
                                heroLine: "Why here? What's special about this particular town for this kind of research?",
                                npcResponse: "This place has... unique properties. The readings here are off the charts. Scientifically speaking, it's one of the most interesting spots in New England. Also the rent is cheap. Both factors were important.",
                                setFlag: 'asked_origin',
                                condition: (scene) => !scene.getFlag('asked_origin')
                            },
                            {
                                text: "Any advice for a newcomer to fringe science?",
                                heroLine: "Any advice for someone just starting out in the 'science that might break reality' field?",
                                npcResponse: "Document everything. Trust your instruments more than your eyes. Never assume something is impossible. And always - always - keep a fire extinguisher within arm's reach. You'll thank me later.",
                                setFlag: 'asked_advice',
                                condition: (scene) => !scene.getFlag('asked_advice')
                            },
                            {
                                text: "Let me ask about something else.",
                                heroLine: "This is all great advice. Let me ask about something else before I get too philosophical.",
                                npcResponse: "Sure thing. Philosophy's fun, but it doesn't calibrate resonance arrays.",
                                nextNode: 'start'
                            }
                        ]
                    }
                };
            }

            create() {
                const { width, height } = this.scale;

                // Camera setup for wide scrolling scene
                this.cameras.main.setBounds(0, 0, this.worldWidth, height);

                // Enable lighting - bright warm amber laboratory lighting
                this.lights.enable();
                this.lights.setAmbientColor(0x8a7a6a); // Bright warm ambient

                // Draw room background
                this.drawRoom(this.worldWidth, height);

                // Create lighting
                this.createLighting(this.worldWidth, height);

                // Call parent create (sets up all UI systems)
                super.create();

                // Create hotspots
                this.createHotspots(this.getHotspotData(height));

                // Create player at spawn position
                const spawnPoint = this.getSpawnPoint();
                let spawnX = 300;
                if (spawnPoint === 'from_house') spawnX = 250;
                else if (spawnPoint === 'right') spawnX = this.worldWidth - 200;

                this.createPlayer(spawnX, height * 0.80);

                // Create the scientist NPC
                this.createScientist(height);

                // Center camera on player
                this.cameras.main.scrollX = Phaser.Math.Clamp(
                    spawnX - this.screenWidth / 2, 0, this.worldWidth - this.screenWidth
                );

                // Mark room as visited
                if (!TSH.State.hasVisitedRoom('laboratory')) {
                    TSH.State.markRoomVisited('laboratory');
                    this.showDialog("Well. This explains the electricity bill.");
                }
            }

            // Room-specific background - Mid Century Sci-Fi Laboratory
            drawRoom(worldWidth, height) {
                if (this.textures.exists('labBackground')) {
                    this.textures.remove('labBackground');
                }

                const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
                const g = this.make.graphics({ add: false });

                // Floor - industrial metal plates
                g.fillStyle(0x3a3a4a);
                g.fillRect(0, height * 0.72, worldWidth, height * 0.28);
                // Floor plate lines
                g.lineStyle(2, 0x2a2a3a, 0.6);
                for (let x = 0; x < worldWidth; x += 120) {
                    g.moveTo(x, height * 0.72);
                    g.lineTo(x, height);
                }
                for (let y = height * 0.80; y < height; y += 40) {
                    g.moveTo(0, y);
                    g.lineTo(worldWidth, y);
                }
                g.strokePath();
                // Floor rivets
                g.fillStyle(0x505060);
                for (let x = 60; x < worldWidth; x += 120) {
                    g.fillCircle(x, height * 0.76, 3);
                    g.fillCircle(x, height * 0.90, 3);
                }

                // Back wall - industrial panels
                g.fillStyle(0x4a4a5a);
                g.fillRect(0, 0, worldWidth, height * 0.72);
                // Wall panels
                g.fillStyle(0x3a3a4a);
                for (let x = 0; x < worldWidth; x += 200) {
                    g.fillRect(x + 5, height * 0.05, 190, height * 0.62);
                }
                // Panel borders
                g.lineStyle(2, 0x5a5a6a, 0.8);
                for (let x = 0; x < worldWidth; x += 200) {
                    g.strokeRect(x + 5, height * 0.05, 190, height * 0.62);
                }

                // Ceiling pipes
                g.fillStyle(0x606070);
                g.fillRect(0, height * 0.02, worldWidth, 15);
                g.fillStyle(0x707080);
                g.fillRect(0, 0, worldWidth, 8);
                // Pipe segments
                for (let x = 100; x < worldWidth; x += 300) {
                    g.fillStyle(0x505060);
                    g.fillRect(x, 0, 20, height * 0.15);
                }

                // === LEFT SECTION: Door and Chalkboard ===

                // Steel Door back to house
                g.fillStyle(0x5a5a5a);
                g.fillRect(100, height * 0.25, 100, height * 0.45);
                g.fillStyle(0x4a4a4a);
                g.fillRect(95, height * 0.23, 110, 12);
                g.fillRect(95, height * 0.23, 8, height * 0.49);
                g.fillRect(197, height * 0.23, 8, height * 0.49);
                // Door rivets
                g.fillStyle(0x707070);
                g.fillCircle(115, height * 0.30, 4);
                g.fillCircle(185, height * 0.30, 4);
                g.fillCircle(115, height * 0.65, 4);
                g.fillCircle(185, height * 0.65, 4);
                // Handle
                g.fillStyle(0x808080);
                g.fillRect(175, height * 0.48, 12, 25);

                // Chalkboard
                g.fillStyle(0x4a3a2a);
                g.fillRect(330, height * 0.18, 180, 140);
                g.fillStyle(0x2a4a3a);
                g.fillRect(340, height * 0.20, 160, 120);
                // Chalk equations
                g.lineStyle(2, 0xcccccc, 0.8);
                g.moveTo(355, height * 0.26);
                g.lineTo(400, height * 0.26);
                g.moveTo(410, height * 0.24);
                g.lineTo(430, height * 0.28);
                g.moveTo(355, height * 0.34);
                g.lineTo(480, height * 0.34);
                g.moveTo(360, height * 0.42);
                g.lineTo(420, height * 0.42);
                g.strokePath();
                // Chalk diagrams
                g.strokeCircle(450, height * 0.44, 20);
                g.moveTo(430, height * 0.44);
                g.lineTo(470, height * 0.44);

                // === LEFT-CENTER: Tesla Coil ===

                // Tesla coil base
                g.fillStyle(0x4a4a5a);
                g.fillRect(600, height * 0.55, 100, height * 0.17);
                g.fillStyle(0x606070);
                g.fillRect(590, height * 0.52, 120, 20);
                // Coil structure
                g.fillStyle(0x8b4513);
                g.fillRect(635, height * 0.20, 30, height * 0.35);
                // Coil windings
                g.lineStyle(3, 0xcd853f, 1);
                for (let y = height * 0.25; y < height * 0.52; y += 12) {
                    g.strokeRect(632, y, 36, 8);
                }
                // Top sphere
                g.fillStyle(0xc0c0c0);
                g.fillCircle(650, height * 0.18, 35);
                g.fillStyle(0xe0e0e0);
                g.fillCircle(640, height * 0.15, 12);

                // === CENTER: Portal Device ===

                // Portal frame base/pedestal
                g.fillStyle(0x4a4a5a);
                g.fillRect(1130, height * 0.60, 300, height * 0.12);
                g.fillStyle(0x5a5a6a);
                g.fillRect(1120, height * 0.57, 320, 20);

                // Portal outer frame
                g.fillStyle(0x6a6a7a);
                g.fillCircle(1280, height * 0.38, 160);
                g.fillStyle(0x5a5a6a);
                g.fillCircle(1280, height * 0.38, 145);
                // Inner ring
                g.fillStyle(0x7a7a8a);
                g.fillCircle(1280, height * 0.38, 130);
                // Portal void (will be enhanced with lighting)
                g.fillStyle(0x1a0a2a);
                g.fillCircle(1280, height * 0.38, 115);
                // Swirl effect (static part)
                g.lineStyle(4, 0x4a2a8a, 0.6);
                g.arc(1280, height * 0.38, 80, 0, Math.PI * 0.8);
                g.strokePath();
                g.lineStyle(3, 0x6a4aaa, 0.5);
                g.arc(1280, height * 0.38, 60, Math.PI * 0.5, Math.PI * 1.5);
                g.strokePath();
                g.lineStyle(2, 0x8a6aca, 0.4);
                g.arc(1280, height * 0.38, 40, Math.PI, Math.PI * 2.2);
                g.strokePath();
                // Frame details - bolts
                g.fillStyle(0x808090);
                for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
                    const bx = 1280 + Math.cos(angle) * 150;
                    const by = height * 0.38 + Math.sin(angle) * 150;
                    g.fillCircle(bx, by, 8);
                }
                // Support struts
                g.fillStyle(0x4a4a5a);
                g.fillRect(1140, height * 0.55, 30, height * 0.10);
                g.fillRect(1390, height * 0.55, 30, height * 0.10);

                // Cables from portal to floor
                g.lineStyle(8, 0x3a3a4a, 1);
                g.moveTo(1150, height * 0.60);
                g.lineTo(1100, height * 0.72);
                g.moveTo(1410, height * 0.60);
                g.lineTo(1460, height * 0.72);
                g.strokePath();

                // === RIGHT-CENTER: Equipment Shelf ===

                // Shelf unit
                g.fillStyle(0x5a4a3a);
                g.fillRect(1720, height * 0.25, 180, height * 0.47);
                // Shelves
                g.fillStyle(0x6a5a4a);
                for (let y = height * 0.32; y < height * 0.70; y += height * 0.12) {
                    g.fillRect(1725, y, 170, 8);
                }
                // Beakers and bottles
                const bottleColors = [0x4a9a4a, 0x9a4a9a, 0x4a4a9a, 0x9a9a4a, 0x9a4a4a];
                for (let shelf = 0; shelf < 3; shelf++) {
                    for (let i = 0; i < 4; i++) {
                        const bx = 1745 + i * 40;
                        const by = height * 0.30 + shelf * height * 0.12;
                        g.fillStyle(0xcccccc);
                        g.fillRect(bx, by - 30, 20, 30);
                        g.fillStyle(bottleColors[(shelf + i) % bottleColors.length]);
                        g.fillRect(bx + 2, by - 25, 16, 20);
                    }
                }
                // Brain jar (because mad scientist)
                g.fillStyle(0xaaaaaa);
                g.fillRect(1870, height * 0.38, 25, 40);
                g.fillStyle(0x88ccaa);
                g.fillRect(1872, height * 0.40, 21, 35);
                g.fillStyle(0xddaaaa);
                g.fillCircle(1882, height * 0.48, 8);

                // === FAR RIGHT: Control Terminal ===

                // Main console body
                g.fillStyle(0x4a4a5a);
                g.fillRect(2000, height * 0.35, 250, height * 0.37);
                g.fillStyle(0x5a5a6a);
                g.fillRect(1990, height * 0.32, 270, 20);
                // Screen
                g.fillStyle(0x1a2a1a);
                g.fillRect(2020, height * 0.38, 150, 90);
                g.fillStyle(0x2a4a2a);
                g.fillRect(2025, height * 0.40, 140, 80);
                // Screen text lines (green terminal style)
                g.lineStyle(2, 0x40ff40, 0.8);
                for (let i = 0; i < 4; i++) {
                    const lineLen = 60 + Math.random() * 60;
                    g.moveTo(2035, height * 0.43 + i * 18);
                    g.lineTo(2035 + lineLen, height * 0.43 + i * 18);
                }
                g.strokePath();
                // Blinking cursor
                g.fillStyle(0x40ff40);
                g.fillRect(2035, height * 0.53, 8, 12);

                // Button panel
                g.fillStyle(0x3a3a4a);
                g.fillRect(2020, height * 0.58, 210, 60);
                // Buttons
                const buttonColors = [0xff4040, 0x40ff40, 0x4040ff, 0xffff40, 0xff40ff, 0x40ffff];
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 6; col++) {
                        g.fillStyle(buttonColors[col]);
                        g.fillCircle(2045 + col * 32, height * 0.60 + row * 25, 8);
                    }
                }
                // Levers
                g.fillStyle(0x808080);
                g.fillRect(2180, height * 0.40, 15, 60);
                g.fillRect(2210, height * 0.45, 15, 55);
                g.fillStyle(0xff4040);
                g.fillCircle(2187, height * 0.38, 10);
                g.fillStyle(0x40ff40);
                g.fillCircle(2217, height * 0.43, 10);

                // Cables on floor (simple polylines)
                g.lineStyle(6, 0x2a2a3a, 0.8);
                g.moveTo(2050, height * 0.72);
                g.lineTo(1900, height * 0.78);
                g.lineTo(1700, height * 0.76);
                g.lineTo(1500, height * 0.72);
                g.strokePath();
                g.lineStyle(4, 0x3a2a2a, 0.8);
                g.moveTo(700, height * 0.72);
                g.lineTo(900, height * 0.80);
                g.lineTo(1100, height * 0.77);
                g.lineTo(1200, height * 0.72);
                g.strokePath();

                // Wall-mounted lights
                for (let x = 300; x < worldWidth; x += 400) {
                    g.fillStyle(0x606070);
                    g.fillRect(x - 15, height * 0.08, 30, 20);
                    g.fillStyle(0xffdd88);
                    g.fillRect(x - 10, height * 0.12, 20, 12);
                }

                roomTexture.draw(g);
                g.destroy();

                roomTexture.saveTexture('labBackground');
                roomTexture.destroy();

                this.roomSprite = this.add.sprite(0, 0, 'labBackground');
                this.roomSprite.setOrigin(0, 0);
                this.roomSprite.setPipeline('Light2D');
                this.roomSprite.setDepth(0);
            }

            // Room-specific lighting
            createLighting(worldWidth, height) {
                // Main overhead lights - warm amber
                this.overheadLights = [];
                for (let x = 300; x < worldWidth; x += 400) {
                    const light = this.lights.addLight(x, height * 0.15, 400, 0xffdd88, 1.2);
                    this.overheadLights.push(light);
                }

                // Portal glow - blue/purple ethereal
                this.portalLight = this.lights.addLight(1280, height * 0.38, 300, 0x8866ff, 1.5);
                this.portalLightInner = this.lights.addLight(1280, height * 0.38, 150, 0xaa88ff, 1.0);

                // Tesla coil glow - electric blue
                this.teslaLight = this.lights.addLight(650, height * 0.30, 200, 0x88aaff, 0.8);

                // Terminal glow - green
                this.terminalLight = this.lights.addLight(2100, height * 0.50, 180, 0x44ff44, 0.6);

                // Equipment shelf warm light
                this.shelfLight = this.lights.addLight(1810, height * 0.45, 150, 0xffaa66, 0.5);

                // Portal bloom effects
                this.portalBloom = this.add.graphics();
                this.portalBloom.setDepth(5);
                this.drawPortalBloom(height);

                // Tesla spark effect container
                this.teslaSparks = this.add.graphics();
                this.teslaSparks.setDepth(6);
            }

            drawPortalBloom(height) {
                this.portalBloom.clear();
                // Multiple layers for soft glow
                const layers = [
                    { radius: 140, alpha: 0.05, color: 0x8866ff },
                    { radius: 130, alpha: 0.08, color: 0x9977ff },
                    { radius: 120, alpha: 0.12, color: 0xaa88ff },
                    { radius: 110, alpha: 0.15, color: 0xbb99ff }
                ];
                layers.forEach(layer => {
                    this.portalBloom.fillStyle(layer.color, layer.alpha);
                    this.portalBloom.fillCircle(1280, height * 0.38, layer.radius);
                });
            }

            // Room-specific action handling
            executeAction(action, hotspot) {
                console.log('[Lab] executeAction:', action, hotspot.name);
                if (action === 'Use') {
                    if (hotspot.name === 'Door to House') {
                        this.transitionToScene('interior', 'from_lab');
                    } else {
                        this.showDialog(hotspot.useResponse);
                    }
                } else if (action === 'Look At') {
                    this.showDialog(hotspot.lookResponse);
                } else if (action === 'Talk To') {
                    console.log('[Lab] Talk To action on:', hotspot.name);
                    if (hotspot.name === 'Dr. Manzana') {
                        console.log('[Lab] Starting scientist conversation...');
                        this.startScientistConversation();
                    } else {
                        this.showDialog(hotspot.talkResponse);
                    }
                }
            }

            startScientistConversation() {
                console.log('[Lab] startScientistConversation called');
                console.log('[Lab] this.scientist:', this.scientist);
                const npcData = {
                    name: 'Hector',
                    x: this.scientist.x,
                    y: this.scientist.y
                };
                console.log('[Lab] npcData:', npcData);
                const dialogue = this.getScientistDialogue();
                console.log('[Lab] dialogue:', dialogue);
                this.enterConversation(npcData, dialogue);
            }

            createScientist(height) {
                // Create scientist sprite container at the terminal - Dr. Hector Manzana
                // Position adjusted for bottom-center origin (feet on ground)
                const groundY = height * 0.78;  // Adjusted from 0.68 to account for origin change
                this.scientist = this.add.container(2050, groundY);
                this.scientist.setDepth(100);

                // Get scale from BaseScene, adjusted so Hector matches Nate's height
                // Nate is 610px tall, Hector is 589px - multiply by 610/589 to equalize
                const baseScale = BaseScene.PLAYER_SCALES[this.cameraPreset] || BaseScene.PLAYER_SCALES.MEDIUM;
                const scale = baseScale * (610 / 589);  // ~1.036x to match Nate's height

                if (this.textures.exists('hector_placeholder')) {
                    // Create sprite with origin at bottom-center (feet)
                    this.scientistSprite = this.add.sprite(0, 0, 'hector_placeholder');
                    this.scientistSprite.setOrigin(0.5, 1);
                    this.scientistSprite.setScale(scale);
                    this.scientistSprite.setPipeline('Light2D');
                    this.scientist.add(this.scientistSprite);
                } else {
                    // Fallback: colored rectangle if sprite not loaded
                    console.warn('[LaboratoryScene] hector_placeholder texture not found, using fallback');
                    const fallbackHeight = 306 * scale / BaseScene.PLAYER_SCALES.MEDIUM;
                    const fallbackWidth = fallbackHeight * (147 / 589);
                    const fallback = this.add.rectangle(0, -fallbackHeight / 2, fallbackWidth, fallbackHeight, 0xeeeeee);
                    fallback.setPipeline('Light2D');
                    this.scientist.add(fallback);
                    this.scientistSprite = fallback;
                }
            }

            // Room-specific item interactions
            useItemOnHotspot(item, hotspot) {
                if (hotspot.name === 'Portal Device') {
                    this.showDialog(`Toss the ${item.name} into a swirling void? Tempting, but I might need that later.`);
                } else if (hotspot.name === 'Control Terminal') {
                    this.showDialog(`No slot for a ${item.name}. These old machines, so picky about their inputs.`);
                } else if (hotspot.name === 'Tesla Coil') {
                    this.showDialog(`The ${item.name} and high voltage? That's how you get a very ex-${item.name}.`);
                } else {
                    this.showDialog(`Not sure what that would accomplish, but I admire the creativity.`);
                }
            }

            update() {
                super.update();

                const { height } = this.scale;
                const time = this.time.now * 0.001;

                // Portal pulsing effect
                if (this.portalLight) {
                    const portalPulse = Math.sin(time * 2) * 0.3 + Math.sin(time * 3.7) * 0.15;
                    this.portalLight.intensity = 1.5 + portalPulse;
                    this.portalLightInner.intensity = 1.0 + portalPulse * 0.5;

                    // Update bloom opacity
                    this.portalBloom.clear();
                    const bloomAlpha = 0.12 + portalPulse * 0.05;
                    const layers = [
                        { radius: 140, alpha: bloomAlpha * 0.4 },
                        { radius: 130, alpha: bloomAlpha * 0.6 },
                        { radius: 120, alpha: bloomAlpha * 0.8 },
                        { radius: 110, alpha: bloomAlpha }
                    ];
                    layers.forEach((layer, i) => {
                        const color = 0x8866ff + (i * 0x111100);
                        this.portalBloom.fillStyle(color, layer.alpha);
                        this.portalBloom.fillCircle(1280, height * 0.38, layer.radius);
                    });
                }

                // Tesla coil crackle
                if (this.teslaLight) {
                    const teslaCrackle = Math.sin(time * 15) * 0.3 + Math.sin(time * 23) * 0.2;
                    this.teslaLight.intensity = 0.8 + teslaCrackle;

                    // Random spark effect
                    this.teslaSparks.clear();
                    if (Math.random() > 0.7) {
                        this.teslaSparks.lineStyle(2, 0x88ccff, 0.8);
                        const sparkAngle = Math.random() * Math.PI * 2;
                        const sparkLen = 30 + Math.random() * 40;
                        const sx = 650 + Math.cos(sparkAngle) * 35;
                        const sy = height * 0.18 + Math.sin(sparkAngle) * 35;
                        this.teslaSparks.moveTo(sx, sy);
                        this.teslaSparks.lineTo(
                            sx + Math.cos(sparkAngle) * sparkLen,
                            sy + Math.sin(sparkAngle) * sparkLen
                        );
                        this.teslaSparks.strokePath();
                    }
                }

                // Terminal screen flicker
                if (this.terminalLight) {
                    const termFlicker = Math.sin(time * 8) * 0.1 + Math.sin(time * 13) * 0.05;
                    this.terminalLight.intensity = 0.6 + termFlicker;
                }

                // Subtle overhead light flicker
                if (this.overheadLights) {
                    this.overheadLights.forEach((light, i) => {
                        const flicker = Math.sin(time * 4 + i) * 0.05 + Math.sin(time * 7 + i * 2) * 0.03;
                        light.intensity = 1.2 + flicker;
                    });
                }
            }
        }

        // ============================================================================
        // BACKYARD SCENE - Backyard at Night with Neighbor (extends BaseScene)
        // ============================================================================
