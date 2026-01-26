// ============================================================================
// GAME SCENE - Hector's Foyer/Living Room
// First room the player explores after entering Hector's home
// ============================================================================
class GameScene extends BaseScene {
    constructor() {
        super({ key: 'GameScene' });
        this.worldWidth = 2560; // 2x screen width for scrolling
        this.screenWidth = 1280;
        this.walkableArea = { minY: 0.72, maxY: 0.92 };
        
        // Fireplace animation
        this.fireflickerTime = 0;
        this.fireLights = [];
    }

    getHotspotData(height) {
        return [
            // LEFT SIDE - Entrance area
            {
                x: 150, y: height * 0.50, w: 120, h: height * 0.40,
                interactX: 220, interactY: height * 0.82,
                name: 'Front Door',
                verbLabels: { actionVerb: 'Open', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "The front door. I just came through here. The night air outside is cold and uninviting.",
                useResponse: "I should explore inside first. I didn't walk all this way just to leave.",
                talkResponse: "I knock on the door from the inside. That's... not how doors work, Nate."
            },
            {
                x: 380, y: height * 0.35, w: 140, h: height * 0.25,
                interactX: 380, interactY: height * 0.82,
                name: 'Window',
                verbLabels: { actionVerb: 'Open', lookVerb: 'Look through', talkVerb: 'Talk to' },
                lookResponse: "Moonlight streams through the dusty glass. I can see the overgrown garden outside, silver in the pale light.",
                useResponse: "It's painted shut. Probably hasn't been opened in years.",
                talkResponse: "I whisper to the moon. It doesn't whisper back. Typical."
            },
            {
                x: 15, y: height * 0.45, w: 80, h: height * 0.40,
                interactX: 80, interactY: height * 0.82,
                name: 'Coat Rack',
                verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A wooden coat rack, sagging under the weight of coats that haven't been worn in decades. Moth-eaten wool and faded tweed.",
                useResponse: "I check the pockets. Nothing but lint and a very old receipt for... 'one dozen eggs, assorted beakers.' From 1987.",
                talkResponse: "The coats hang in silent judgment. They've seen things. Terrible fashion choices, probably."
            },
            {
                x: 500, y: height * 0.65, w: 100, h: height * 0.15,
                interactX: 500, interactY: height * 0.82,
                name: 'Small Table',
                verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A small side table, barely visible under a mountain of unopened mail. Bills, journals, and what looks like several years of 'Science Monthly.'",
                useResponse: "I rifle through the mail. Most of it is addressed to 'Dr. H. Manzana or Current Resident.' Nothing personal.",
                talkResponse: "Dear table, how long have you suffered under this paper avalanche? ...It doesn't answer. Tables rarely do."
            },
            
            // CENTER - Living area
            {
                x: 900, y: height * 0.40, w: 200, h: height * 0.35,
                interactX: 900, interactY: height * 0.82,
                name: 'Fireplace',
                verbLabels: { actionVerb: 'Warm hands', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A stone fireplace, crackling with a modest fire. The mantle above is cluttered with photographs, odd trinkets, and a thick layer of dust. Someone's been keeping this lit, at least.",
                useResponse: "I warm my hands by the fire. After that walk through the woods, it feels heavenly.",
                talkResponse: "I address the flames. 'Take me to your leader.' They dance but don't respond. Fire is notoriously apolitical."
            },
            {
                x: 900, y: height * 0.25, w: 200, h: height * 0.12,
                interactX: 900, interactY: height * 0.82,
                name: 'Mantle Photos',
                verbLabels: { actionVerb: 'Pick up', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "Faded photographs in tarnished frames. A younger man - must be Hector - standing with colleagues. One photo shows him receiving some kind of award. He looked... happier then.",
                useResponse: "These aren't mine to take. They're memories. Someone else's memories.",
                talkResponse: "The people in the photos smile back at me, frozen in better times."
            },
            {
                x: 760, y: height * 0.78, w: 100, h: height * 0.18,
                interactX: 760, interactY: height * 0.88,
                name: 'Left Armchair',
                verbLabels: { actionVerb: 'Sit in', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A plush leather armchair in deep burgundy. It faces the fireplace - the perfect spot for contemplation. Or napping.",
                useResponse: "I sink into the chair. The leather creaks welcomingly. I could get used to this.",
                talkResponse: "I ask the chair if it's seen Hector. It creaks noncommittally."
            },
            {
                x: 1040, y: height * 0.78, w: 100, h: height * 0.18,
                interactX: 1040, interactY: height * 0.88,
                name: 'Right Armchair',
                verbLabels: { actionVerb: 'Sit in', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "The matching armchair. Both seats face the fire, set up for conversation. Though it looks like it's been a while since anyone sat in this one.",
                useResponse: "I sit down. From here I have a good view of the whole room. And the fire. Mostly the fire.",
                talkResponse: "Two chairs, no waiting. The chair has no comment on this observation."
            },
            {
                x: 910, y: height * 0.82, w: 120, h: height * 0.12,
                interactX: 910, interactY: height * 0.88,
                name: 'Coffee Table',
                verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A sturdy coffee table positioned between the two armchairs. It's buried under scientific journals, a half-empty mug, and scribbled notes. 'Quantum Tunneling for Beginners,' 'Applied Dimensional Theory,' 'TV Guide.'",
                useResponse: "I flip through some of the journals. Most of it goes over my head, but I recognize passion when I see it.",
                talkResponse: "The collected wisdom of the coffee table remains silent. Wisdom often does."
            },
            {
                x: 1150, y: height * 0.45, w: 100, h: height * 0.35,
                interactX: 1100, interactY: height * 0.82,
                name: 'Bookshelf',
                verbLabels: { actionVerb: 'Search', lookVerb: 'Browse', talkVerb: 'Talk to' },
                lookResponse: "Floor-to-ceiling bookshelves, absolutely stuffed. Science texts lean against philosophy. Fiction mingles with technical manuals. Some books are stacked horizontally on top of vertical ones. It's chaos, but... organized chaos?",
                useResponse: "I pull out a book at random. 'The Complete Guide to Interdimensional Postal Services.' ...I put it back.",
                talkResponse: "So many voices trapped in these pages. None of them talking to me right now, thankfully."
            },
            {
                x: 680, y: height * 0.35, w: 60, h: height * 0.45,
                interactX: 650, interactY: height * 0.82,
                name: 'Grandfather Clock',
                verbLabels: { actionVerb: 'Check time', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "An imposing grandfather clock, its pendulum swinging steadily. The time reads 11:47. Or maybe 11:48. The second hand seems to be moving... irregularly.",
                useResponse: "According to this clock, it's nearly midnight. That feels about right.",
                talkResponse: "Tick. Tock. Tick. Tock. The clock speaks its own language. Persistently."
            },
            {
                x: 850, y: height * 0.78, w: 180, h: height * 0.08,
                interactX: 850, interactY: height * 0.85,
                name: 'Worn Rug',
                verbLabels: { actionVerb: 'Move', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "An ornate rug, its pattern faded by years of foot traffic. Once it was probably beautiful. Now it's just... comfortable. Lived-in.",
                useResponse: "I lift a corner. Just floorboards underneath. What was I expecting, a trap door? This isn't a mystery novel.",
                talkResponse: "I compliment the rug on its perseverance. It remains humble and flat."
            },
            
            // RIGHT SIDE - Transition to lab
            {
                x: 1900, y: height * 0.35, w: 140, h: height * 0.25,
                interactX: 1900, interactY: height * 0.82,
                name: 'Right Window',
                verbLabels: { actionVerb: 'Open', lookVerb: 'Look through', talkVerb: 'Talk to' },
                lookResponse: "Another window letting in the moonlight. Through it I can see the silhouette of trees, and beyond them... is that the town? Tiny lights flicker in the distance.",
                useResponse: "Also painted shut. Hector really doesn't like fresh air, apparently.",
                talkResponse: "I wave at the distant town lights. No one waves back. Story of my life."
            },
            {
                x: 1700, y: height * 0.50, w: 140, h: height * 0.30,
                interactX: 1650, interactY: height * 0.82,
                name: 'Desk',
                verbLabels: { actionVerb: 'Search', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "A heavy wooden desk, absolutely covered in papers, blueprints, and strange instruments I don't recognize. A desk lamp is on, casting a warm circle of light over the chaos.",
                useResponse: "I carefully look through the papers. Calculations, diagrams, notes in frantic handwriting. Whatever Hector is working on, it's consuming him.",
                talkResponse: "I ask the desk if it's seen better days. Its silence speaks volumes."
            },
            {
                x: 1750, y: height * 0.30, w: 100, h: height * 0.15,
                interactX: 1700, interactY: height * 0.82,
                name: 'Blueprints',
                verbLabels: { actionVerb: 'Take', lookVerb: 'Study', talkVerb: 'Talk to' },
                lookResponse: "Blueprints pinned to the wall above the desk. They show some kind of... archway? With lots of technical annotations I can't decipher. 'PORTAL MARK VII' is written at the top. Portal?",
                useResponse: "These look important. I should ask Hector about them rather than just taking them.",
                talkResponse: "The blueprints reveal nothing through conversation. I'll have to actually read them. Ugh."
            },
            {
                x: 2100, y: height * 0.55, w: 80, h: height * 0.30,
                interactX: 2020, interactY: height * 0.82,
                name: 'Strange Device',
                verbLabels: { actionVerb: 'Touch', lookVerb: 'Examine', talkVerb: 'Talk to' },
                lookResponse: "Some kind of device sits on a pedestal - all brass and glass and gently pulsing lights. It hums quietly, like it's dreaming. I have no idea what it does, but it's beautiful.",
                useResponse: "I reach out to touch it... and think better of it. Mysterious humming devices are best left untouched by aspiring scientists who want to remain un-vaporized.",
                talkResponse: "The device hums at me. Is that a greeting? A warning? Hard to say with devices."
            },
            {
                x: 2350, y: height * 0.45, w: 150, h: height * 0.40,
                interactX: 2280, interactY: height * 0.82,
                name: 'Laboratory Door',
                verbLabels: { actionVerb: 'Enter', lookVerb: 'Examine', talkVerb: 'Call out' },
                lookResponse: "A heavy door, slightly ajar. Warm, greenish light spills out from whatever's beyond. I can hear a faint electrical hum. This must be the laboratory.",
                useResponse: "TRANSITION_TO_LAB",
                talkResponse: "\"Hello? Dr. Manzana?\" My voice echoes slightly. I hear movement from within..."
            }
        ];
    }

    create() {
        const { width, height } = this.scale;
        
        // Camera setup for scrolling room
        this.cameras.main.setBounds(0, 0, this.worldWidth, height);
        
        // Enable lighting
        this.lights.enable();
        const isMobile = this.sys.game.device.input.touch;
        // Much brighter ambient - warm and cozy, not dark and moody
        this.lights.setAmbientColor(isMobile ? 0xb8a090 : 0x9a8878);
        
        // Draw the room background
        this.drawRoom(this.worldWidth, height);
        
        // Create lighting effects
        this.createLighting(this.worldWidth, height);
        
        // Call parent create (sets up UI systems)
        super.create();
        
        // Create hotspots
        this.createHotspots(this.getHotspotData(height));
        
        // Create edge zones for room transitions
        this.createEdgeZones(height);
        
        // Spawn player
        const spawnPoint = this.registry.get('spawnPoint') || 'default';
        let spawnX = 250;
        if (spawnPoint === 'from_lab') spawnX = 2200;
        if (spawnPoint === 'from_outside') spawnX = 250;
        
        this.createPlayer(spawnX, height * 0.82);
        
        // Initial camera position
        this.cameras.main.scrollX = Phaser.Math.Clamp(
            spawnX - this.screenWidth / 2,
            0,
            this.worldWidth - this.screenWidth
        );
        
        // First time entering - Nate speaks
        const state = this.getGameState();
        if (!state.visitedRooms.includes('hector_foyer')) {
            state.visitedRooms.push('hector_foyer');
            this.setGameState(state);
            this.time.delayedCall(800, () => {
                this.showDialog("Hello? Is anyone home?");
            });
        }
    }

    drawRoom(worldWidth, height) {
        // Clean up existing texture if present
        if (this.textures.exists('roomBackground')) {
            this.textures.remove('roomBackground');
        }
        
        const roomTexture = this.add.renderTexture(0, 0, worldWidth, height);
        const g = this.make.graphics({ add: false });
        
        // === COLOR PALETTE (MI2 style - limited, distinct colors) ===
        const COLORS = {
            // Wall colors
            WALL_DARK: 0x1a1520,
            WALL_MID: 0x2a2535,
            WALL_LIGHT: 0x3a3545,
            WALL_HIGHLIGHT: 0x4a4555,
            
            // Wood colors  
            WOOD_DARK: 0x2a1a10,
            WOOD_MID: 0x4a3520,
            WOOD_LIGHT: 0x6a5030,
            WOOD_HIGHLIGHT: 0x8a6840,
            
            // Floor
            FLOOR_DARK: 0x1a1512,
            FLOOR_MID: 0x2a2520,
            FLOOR_LIGHT: 0x3a352a,
            
            // Moonlight tints
            MOON_DARK: 0x2a3545,
            MOON_MID: 0x4a5565,
            MOON_LIGHT: 0x6a7585,
            MOON_BRIGHT: 0x8a95a5,
            
            // Fire/warm tints
            FIRE_DARK: 0x4a2010,
            FIRE_MID: 0x8a4020,
            FIRE_LIGHT: 0xca6030,
            FIRE_BRIGHT: 0xffa050,
            
            // Lab glow
            LAB_DARK: 0x1a3a2a,
            LAB_MID: 0x2a5a3a,
            LAB_LIGHT: 0x4a8a5a,
            
            // Accent colors
            RUG_DARK: 0x3a1515,
            RUG_MID: 0x5a2525,
            RUG_PATTERN: 0x6a3030,
            GOLD: 0x8a7530,
            BRASS: 0x9a8540
        };
        
        const floorY = height * 0.72;
        
        // === BACK WALL ===
        const p = 4; // Pixel size minimum
        const wainscotHeight = p * 35; // 140px - reaches Nate's waist
        
        // Base wall color
        g.fillStyle(COLORS.WALL_DARK);
        g.fillRect(0, 0, worldWidth, floorY);
        
        // Wall paneling - vertical stripes with 4x4 pixel standard
        const panelWidth = p * 20; // 80px panels
        for (let px = 0; px < worldWidth; px += panelWidth) {
            // Panel
            g.fillStyle(COLORS.WALL_MID);
            g.fillRect(px + p, p*5, panelWidth - p*2, floorY - wainscotHeight - p*6);
            
            // Panel highlight (left edge)
            g.fillStyle(COLORS.WALL_LIGHT);
            g.fillRect(px + p, p*5, p, floorY - wainscotHeight - p*6);
            
            // Panel shadow (right edge)
            g.fillStyle(COLORS.WALL_DARK);
            g.fillRect(px + panelWidth - p*2, p*5, p, floorY - wainscotHeight - p*6);
        }
        
        // Wallpaper texture - subtle pattern with 4x4 pixels
        for (let py = p*6; py < floorY - wainscotHeight - p*2; py += p*8) {
            for (let px = p*4; px < worldWidth - p*4; px += p*12) {
                if ((px + py) % (p*24) < p*4) {
                    g.fillStyle(COLORS.WALL_LIGHT);
                    g.fillRect(px, py, p, p);
                }
            }
        }
        
        // Wainscoting (lower wall trim) - reaches Nate's waist height
        const wainscotY = floorY - wainscotHeight;
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, wainscotY, worldWidth, wainscotHeight);
        
        // Wainscot top rail
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, wainscotY, worldWidth, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, wainscotY, worldWidth, p);
        
        // Wainscot bottom rail
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, floorY - p*2, worldWidth, p*2);
        
        // Wainscot panels with 4x4 pixel standard
        const wainscotPanelWidth = p * 28; // 112px panels
        for (let px = 0; px < worldWidth; px += wainscotPanelWidth) {
            // Panel recess
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(px + p*3, wainscotY + p*5, wainscotPanelWidth - p*6, wainscotHeight - p*10);
            
            // Panel highlight (top and left)
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(px + p*3, wainscotY + p*5, wainscotPanelWidth - p*6, p);
            g.fillRect(px + p*3, wainscotY + p*5, p, wainscotHeight - p*11);
            
            // Panel shadow (bottom and right)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(px + p*3, wainscotY + wainscotHeight - p*6, wainscotPanelWidth - p*6, p);
            g.fillRect(px + wainscotPanelWidth - p*4, wainscotY + p*6, p, wainscotHeight - p*12);
            
            // Wood grain texture - simple, clean
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(px + p*6, wainscotY + p*10, p*4, p);
            g.fillRect(px + p*12, wainscotY + p*16, p*6, p);
            g.fillRect(px + p*8, wainscotY + p*22, p*5, p);
        }
        
        // Crown molding
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(0, 0, worldWidth, p*5);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(0, p*4, worldWidth, p);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(0, p*3, worldWidth, p);
        
        // === FLOOR ===
        g.fillStyle(COLORS.FLOOR_DARK);
        g.fillRect(0, floorY, worldWidth, height - floorY);
        
        // Floorboards with 4x4 pixel standard - cleaner, less busy
        const boardWidth = p * 15; // 60px boards
        for (let bx = 0; bx < worldWidth; bx += boardWidth) {
            // Board divider lines
            g.fillStyle(0x1a1510);
            g.fillRect(bx, floorY, p, height - floorY);
            
            // Subtle board highlight (left edge of each board)
            g.fillStyle(COLORS.FLOOR_MID);
            g.fillRect(bx + p, floorY, p, height - floorY);
            
            // Simple wood grain - just a few horizontal lines per board
            g.fillStyle(COLORS.FLOOR_LIGHT);
            g.fillRect(bx + p*4, floorY + p*3, p*8, p);
            g.fillRect(bx + p*6, floorY + p*10, p*6, p);
        }
        
        // === LEFT SIDE - ENTRANCE AREA ===
        
        // Front Door (x: 100-250)
        this.drawDoor(g, 100, 180, floorY, COLORS, false);
        
        // Left Window (x: 320-480)
        this.drawWindow(g, 320, 120, 160, floorY - 200, COLORS, 'moon');
        
        // Coat Rack - to the left of the front door, partially off screen
        this.drawCoatRack(g, 15, floorY, COLORS);
        
        // Small Table with Mail - pulled forward from wall
        this.drawSmallTable(g, 500, floorY + 15, COLORS);
        
        // === CENTER - LIVING AREA ===
        
        // Worn Rug - drawn FIRST so furniture appears on top of it
        this.drawRug(g, 700, floorY + 35, 420, 120, COLORS);
        
        // Grandfather Clock - pulled forward from wall for depth
        this.drawGrandfatherClock(g, 630, floorY + 25, COLORS);
        
        // Fireplace (x: 800-1000) - drawn BEFORE chairs so chairs appear in front
        this.drawFireplace(g, 800, floorY, COLORS);
        
        // Bookshelf (x: 1100-1250)
        this.drawBookshelf(g, 1100, floorY, COLORS);
        
        // === FURNITURE IN FRONT OF FIREPLACE - drawn LAST (frontmost) ===
        // Left armchair - faces RIGHT toward fire, moved left so only 30% on rug
        this.drawArmchair(g, 640, floorY + 100, COLORS, true);
        
        // Coffee table - centered, fully on rug  
        this.drawCoffeeTable(g, 820, floorY + 100, COLORS);
        
        // Right armchair - faces LEFT toward fire, moved right so only 30% on rug
        this.drawArmchair(g, 1080, floorY + 100, COLORS, false);
        
        // === RIGHT SIDE - TRANSITION TO LAB ===
        
        // Desk (x: 1600-1800)
        this.drawDesk(g, 1620, floorY, COLORS);
        
        // Right Window (x: 1850-2000)
        this.drawWindow(g, 1850, 120, 150, floorY - 200, COLORS, 'moon');
        
        // Strange Device (x: 2050-2150)
        this.drawStrangeDevice(g, 2080, floorY, COLORS);
        
        // Laboratory Door (x: 2280-2450)
        this.drawDoor(g, 2280, 180, floorY, COLORS, true);
        

        
        // Commit to texture
        roomTexture.draw(g);
        g.destroy();
        
        roomTexture.saveTexture('roomBackground');
        roomTexture.destroy();
        
        this.roomSprite = this.add.sprite(0, 0, 'roomBackground');
        this.roomSprite.setOrigin(0, 0);
        this.roomSprite.setPipeline('Light2D');
        this.roomSprite.setDepth(0);
    }
    
    // === FURNITURE DRAWING FUNCTIONS ===
    
    drawDoor(g, x, y, floorY, COLORS, isLabDoor) {
        const p = 4; // Pixel size minimum
        const doorHeight = floorY - y;
        const doorWidth = p * 35; // 140px
        const frameWidth = p * 3;
        
        // === DOOR FRAME ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, doorHeight + p*5);
        
        // Frame inner edge
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - frameWidth, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x + doorWidth + p, y - p*5, p*2, doorHeight + p*5);
        g.fillRect(x - frameWidth, y - p*5, doorWidth + frameWidth*2, p*2);
        
        // === DOOR ===
        g.fillStyle(isLabDoor ? COLORS.WOOD_MID : COLORS.WOOD_DARK);
        g.fillRect(x, y, doorWidth, doorHeight);
        
        // === DOOR PANELS (4 panels - 2 top, 2 bottom) ===
        const panelInset = p*4;
        const panelWidth = p*12;
        const panelGap = p*3;
        const topPanelHeight = p*20;
        const bottomPanelHeight = p*25;
        const topPanelY = y + p*5;
        const bottomPanelY = y + p*30;
        
        // Top left panel
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + panelInset, topPanelY, panelWidth, topPanelHeight);
        // Top right panel
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, panelWidth, topPanelHeight);
        // Bottom left panel
        g.fillRect(x + panelInset, bottomPanelY, panelWidth, bottomPanelHeight);
        // Bottom right panel
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, bottomPanelHeight);
        
        // Panel highlights (top-left of each)
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + panelInset, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY, p, bottomPanelHeight);
        
        // Panel shadows (bottom-right of each)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + panelInset, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, topPanelY + topPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, topPanelY, p, topPanelHeight);
        g.fillRect(x + panelInset, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth - p, bottomPanelY, p, bottomPanelHeight);
        g.fillRect(x + panelInset + panelWidth + panelGap, bottomPanelY + bottomPanelHeight - p, panelWidth, p);
        g.fillRect(x + panelInset + panelWidth*2 + panelGap - p, bottomPanelY, p, bottomPanelHeight);
        
        // === DOOR HANDLE ===
        const handleY = bottomPanelY + bottomPanelHeight + p*6;
        const handleX = x + doorWidth - p*10;
        
        // Handle plate
        g.fillStyle(COLORS.BRASS);
        g.fillRect(handleX - p*2, handleY - p*5, p*6, p*14);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(handleX - p, handleY - p*4, p*4, p);
        
        // Handle knob
        g.fillStyle(COLORS.BRASS);
        g.fillRect(handleX - p, handleY, p*4, p*4);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(handleX, handleY + p, p*2, p*2);
        
        // Keyhole
        g.fillStyle(0x1a1a1a);
        g.fillRect(handleX, handleY + p*6, p*2, p*2);
        g.fillRect(handleX + p/2, handleY + p*7, p, p*2);
        
        if (isLabDoor) {
            // Lab door is ajar - show gap with green light
            g.fillStyle(COLORS.LAB_MID);
            g.fillRect(x + doorWidth - p, y + p*2, p*4, doorHeight - p*4);
            g.fillStyle(COLORS.LAB_LIGHT);
            g.fillRect(x + doorWidth, y + p*4, p*2, doorHeight - p*8);
        }
    }
    
    drawWindow(g, x, y, w, h, COLORS, lightType) {
        const p = 4; // Pixel size minimum
        
        // === WINDOW FRAME (with depth) ===
        // Outer frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*3, y - p*3, w + p*6, h + p*6);
        
        // Frame depth (left side visible)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p*4, y - p*2, p*2, h + p*4);
        
        // Inner frame
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p, y - p, w + p*2, h + p*2);
        
        // === WINDOW PANES (night sky) ===
        g.fillStyle(0x0a0a18);
        g.fillRect(x, y, w, h);
        
        // Cross frame (muntins) - 4 panes
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + w/2 - p, y, p*2, h);  // Vertical
        g.fillRect(x, y + h/2 - p, w, p*2);  // Horizontal
        
        // Frame highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + w/2 - p, y + p, p, h - p*2);
        g.fillRect(x + p, y + h/2 - p, w - p*2, p);
        
        if (lightType === 'moon') {
            // Stars (4x4 minimum)
            g.fillStyle(0xffffff);
            g.fillRect(x + p*4, y + p*4, p, p);
            g.fillRect(x + w - p*8, y + p*6, p, p);
            g.fillRect(x + p*6, y + h - p*12, p, p);
            g.fillRect(x + w - p*6, y + h/2 + p*2, p, p);
            
            // Moon (chunky pixel moon)
            const moonX = x + w - p*10;
            const moonY = y + p*5;
            g.fillStyle(0xd8d8e8);
            g.fillRect(moonX, moonY, p*5, p*5);
            g.fillStyle(0xe8e8f8);
            g.fillRect(moonX + p, moonY + p, p*3, p*3);
            // Moon highlight
            g.fillStyle(0xf8f8ff);
            g.fillRect(moonX + p, moonY + p, p*2, p*2);
        }
        
        // === CURTAINS ===
        // Left curtain
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x - p*6, y - p*4, p*6, h + p*8);
        // Curtain folds
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x - p*5, y - p*3, p*2, h + p*6);
        // Curtain highlight
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x - p*4, y - p*2, p, h + p*4);
        
        // Right curtain
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x + w, y - p*4, p*6, h + p*8);
        // Curtain folds
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x + w + p*3, y - p*3, p*2, h + p*6);
        // Curtain highlight
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x + w + p*3, y - p*2, p, h + p*4);
        
        // === CURTAIN ROD ===
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*8, y - p*6, w + p*16, p*2);
        // Rod finials
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x - p*10, y - p*7, p*3, p*4);
        g.fillRect(x + w + p*7, y - p*7, p*3, p*4);
        
        // === WINDOWSILL ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*4, y + h + p*2, w + p*8, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p*3, y + h + p*2, w + p*6, p*2);
        // Sill depth
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*5, y + h + p*2, p*2, p*3);
    }
    
    drawCoatRack(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const rackHeight = 300; // Taller than Nate (~290px)
        const rackY = floorY + 15; // Pull forward slightly
        const rackTop = rackY - rackHeight;
        
        // === BASE (tripod feet) ===
        g.fillStyle(COLORS.WOOD_DARK);
        // Center foot
        g.fillRect(x + p*4, rackY - p*3, p*4, p*3);
        // Left foot
        g.fillRect(x - p*2, rackY - p*2, p*5, p*2);
        // Right foot
        g.fillRect(x + p*9, rackY - p*2, p*5, p*2);
        // Foot connectors
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, rackY - p*4, p*2, p*2);
        g.fillRect(x + p*8, rackY - p*4, p*2, p*2);
        
        // === MAIN POLE ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*4, rackTop, p*4, rackHeight - p*3);
        // Pole highlight
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*4, rackTop, p, rackHeight - p*4);
        
        // === TOP FINIAL ===
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*3, rackTop - p*2, p*6, p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*4, rackTop - p, p*4, p);
        
        // === HOOKS (multiple heights) ===
        // Top hooks (left and right)
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x - p*2, rackTop + p*8, p*6, p*2);
        g.fillRect(x - p*3, rackTop + p*9, p*2, p*3);
        g.fillRect(x + p*8, rackTop + p*8, p*6, p*2);
        g.fillRect(x + p*13, rackTop + p*9, p*2, p*3);
        
        // Middle hooks
        g.fillRect(x - p*2, rackTop + p*20, p*6, p*2);
        g.fillRect(x - p*3, rackTop + p*21, p*2, p*3);
        g.fillRect(x + p*8, rackTop + p*20, p*6, p*2);
        g.fillRect(x + p*13, rackTop + p*21, p*2, p*3);
        
        // Lower hooks (for shorter items)
        g.fillRect(x, rackTop + p*35, p*4, p*2);
        g.fillRect(x - p, rackTop + p*36, p*2, p*2);
        g.fillRect(x + p*8, rackTop + p*35, p*4, p*2);
        g.fillRect(x + p*11, rackTop + p*36, p*2, p*2);
        
        // === HANGING COATS ===
        // Dark wool coat (left side, upper hook)
        g.fillStyle(0x2a2a2a);
        g.fillRect(x - p*6, rackTop + p*12, p*10, p*28);
        // Coat texture
        g.fillStyle(0x222222);
        for (let py = rackTop + p*14; py < rackTop + p*38; py += p*4) {
            g.fillRect(x - p*5, py, p*2, p);
        }
        // Coat collar
        g.fillStyle(0x1a1a1a);
        g.fillRect(x - p*4, rackTop + p*11, p*6, p*3);
        
        // Tweed jacket (right side, upper hook)
        g.fillStyle(0x4a4540);
        g.fillRect(x + p*8, rackTop + p*12, p*9, p*24);
        // Tweed texture
        for (let py = rackTop + p*14; py < rackTop + p*34; py += p*3) {
            for (let px = x + p*9; px < x + p*16; px += p*3) {
                if ((px + py) % (p*6) < p*2) {
                    g.fillStyle(0x5a5550);
                    g.fillRect(px, py, p, p);
                }
            }
        }
        
        // Old hat on top hook
        g.fillStyle(0x3a3535);
        g.fillRect(x + p*9, rackTop + p*6, p*8, p*4);
        g.fillRect(x + p*11, rackTop + p*3, p*4, p*4);
    }
    
    drawSmallTable(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const tableWidth = 80;
        const tableHeight = 28;
        const tableDepth = 20; // Side panel for 3D effect
        const legHeight = 56;
        
        const tableTop = floorY - legHeight - tableHeight;
        const tableY = floorY + 15; // Pull forward from wall
        
        // === SIDE PANEL (3D depth - left side visible) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - tableDepth, tableTop, tableDepth, tableHeight);
        // Side panel highlight
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - tableDepth + p, tableTop + p, tableDepth - p*2, p*2);
        
        // === LEGS ===
        // Back left leg
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop + tableHeight, p*3, legHeight);
        // Back right leg
        g.fillRect(x + tableWidth - p*3, tableTop + tableHeight, p*3, legHeight);
        // Front left leg (visible due to depth)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - tableDepth + p, tableTop + tableHeight, p*3, legHeight);
        
        // === TABLE TOP ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop, tableWidth, tableHeight);
        
        // Top surface
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p, tableTop + p, tableWidth - p*2, tableHeight - p*3);
        
        // Top highlight
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*2, tableTop + p*2, tableWidth - p*4, p);
        
        // === CLUTTER ON TABLE ===
        // Mail pile
        const mailColors = [0xd8d0c0, 0xc8c0b0, 0xe0d8c8, 0xd0c8b8];
        for (let i = 0; i < 5; i++) {
            g.fillStyle(mailColors[i % mailColors.length]);
            g.fillRect(x + p*2 + (i % 2) * p, tableTop - p*2 - i * p, p*10, p*2);
        }
        
        // Envelope sticking out
        g.fillStyle(0xe8e0d0);
        g.fillRect(x + p*3, tableTop - p*4, p*8, p);
        
        // Dead plant in pot
        const potX = x + tableWidth - p*8;
        // Pot
        g.fillStyle(0x6a4030);
        g.fillRect(potX, tableTop - p*6, p*6, p*6);
        g.fillStyle(0x5a3525);
        g.fillRect(potX + p, tableTop - p*5, p*4, p*4);
        // Rim
        g.fillStyle(0x7a5040);
        g.fillRect(potX - p/2, tableTop - p*6, p*7, p);
        // Dead stems
        g.fillStyle(0x4a3a20);
        g.fillRect(potX + p, tableTop - p*10, p, p*5);
        g.fillRect(potX + p*3, tableTop - p*12, p, p*7);
        g.fillRect(potX + p*4, tableTop - p*9, p, p*4);
        // Droopy dead leaves
        g.fillStyle(0x5a4a25);
        g.fillRect(potX + p*3, tableTop - p*12, p*3, p);
        g.fillRect(potX, tableTop - p*10, p*2, p);
    }
    
    drawGrandfatherClock(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const clockTop = floorY - 360;
        const clockWidth = 80;
        const clockDepth = 24; // Side panel depth for 3D effect
        
        // Position clock slightly forward from wall
        const clockY = floorY + 20; // Base slightly forward
        
        // === SIDE PANEL (3D depth - left side visible) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth, clockTop + p*2, clockDepth, 360 - p*4);
        // Side panel wood grain
        for (let py = clockTop + p*4; py < clockY - p*4; py += p*6) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - clockDepth + p, py, clockDepth - p*2, p);
        }
        
        // === MAIN BODY (front face) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, clockTop, clockWidth, 360);
        
        // Body panels with highlights
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p, clockTop + p, clockWidth - p*2, 360 - p*2);
        
        // Top decorative crown
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p*2, clockTop - p*3, clockWidth + p*4, p*4);
        g.fillRect(x + p*4, clockTop - p*5, clockWidth - p*8, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - p, clockTop - p*2, clockWidth + p*2, p*2);
        // Crown side depth
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth - p*2, clockTop - p*3, clockDepth, p*4);
        
        // === CLOCK FACE AREA (top section) ===
        const faceTop = clockTop + p*4;
        const faceHeight = p*24;
        
        // Face frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*2, faceTop, clockWidth - p*4, faceHeight);
        
        // Clock face (cream colored)
        const faceInset = p*3;
        g.fillStyle(0xd8d0b8);
        g.fillRect(x + faceInset, faceTop + p*2, clockWidth - faceInset*2, faceHeight - p*4);
        
        // Clock face inner circle (simulated with rectangles)
        const centerX = x + clockWidth/2;
        const centerY = faceTop + faceHeight/2;
        const radius = p*6;
        
        g.fillStyle(0xc8c0a8);
        g.fillRect(centerX - radius, centerY - radius, radius*2, radius*2);
        g.fillStyle(0xd8d0b8);
        g.fillRect(centerX - radius + p, centerY - radius + p, radius*2 - p*2, radius*2 - p*2);
        
        // Clock hands
        g.fillStyle(0x1a1a1a);
        // Hour hand (shorter, pointing up-right)
        g.fillRect(centerX - p/2, centerY - p*4, p, p*4);
        // Minute hand (longer, pointing right)  
        g.fillRect(centerX, centerY - p/2, p*5, p);
        
        // Clock face numerals (simplified - just marks)
        g.fillStyle(0x2a2a2a);
        g.fillRect(centerX - p/2, faceTop + p*3, p, p*2); // 12
        g.fillRect(centerX - p/2, faceTop + faceHeight - p*5, p, p*2); // 6
        g.fillRect(x + faceInset + p, centerY - p/2, p*2, p); // 9
        g.fillRect(x + clockWidth - faceInset - p*3, centerY - p/2, p*2, p); // 3
        
        // === PENDULUM WINDOW (middle section) ===
        const windowTop = faceTop + faceHeight + p*3;
        const windowHeight = p*20;
        
        // Window frame
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*4, windowTop, clockWidth - p*8, windowHeight);
        
        // Window glass (dark interior)
        g.fillStyle(0x1a1520);
        g.fillRect(x + p*5, windowTop + p, clockWidth - p*10, windowHeight - p*2);
        
        // Pendulum rod
        g.fillStyle(COLORS.BRASS);
        g.fillRect(centerX - p/2, windowTop + p*2, p, p*12);
        
        // Pendulum bob
        g.fillStyle(COLORS.GOLD);
        g.fillRect(centerX - p*3, windowTop + p*13, p*6, p*5);
        g.fillStyle(COLORS.BRASS);
        g.fillRect(centerX - p*2, windowTop + p*14, p*4, p*3);
        
        // === BASE SECTION ===
        const baseTop = windowTop + windowHeight + p*3;
        
        // Base panel
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, baseTop, clockWidth - p*4, clockY - baseTop - p*3);
        
        // Base decorative lines
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, baseTop + p, clockWidth - p*6, p);
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p*3, baseTop + p*8, clockWidth - p*6, p);
        
        // === FOOT/PLINTH ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - p, clockY - p*3, clockWidth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x, clockY - p*2, clockWidth, p);
        
        // Foot side depth
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - clockDepth - p, clockY - p*3, clockDepth, p*3);
    }
    
    drawArmchair(g, x, floorY, COLORS, facingRight = true) {
        // Large comfy leather armchair - side profile view
        // facingRight = true means seat faces right (we see left side of chair)
        // Using 4x4 minimum pixel blocks
        const CHAIR_DARK = 0x4a1a1a;
        const CHAIR_MID = 0x6a2525;
        const CHAIR_LIGHT = 0x8a3535;
        const CHAIR_HIGHLIGHT = 0x9a4040;
        
        const chairHeight = 200; // Back reaches Nate's shoulders
        const seatDepth = 80; // How wide the seat is (front to back in profile)
        const seatHeight = 50;
        const backWidth = 32; // Thickness of the back in profile
        const legSize = 12;
        const p = 4; // Pixel size minimum
        
        const chairY = floorY; // Base on floor
        const backTop = chairY - chairHeight;
        const seatTop = chairY - seatHeight - 40;
        
        if (facingRight) {
            // Chair faces right - we see its LEFT side
            // Back leg (left, rear)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(x, chairY - 36, legSize, 36);
            
            // Front leg (right, front) 
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x + seatDepth + backWidth - legSize, chairY - 40, legSize, 40);
            
            // Chair back (vertical, on left)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, backTop, backWidth, chairHeight - 40);
            // Back cushion
            g.fillStyle(CHAIR_MID);
            g.fillRect(x + p, backTop + p*2, backWidth - p*2, chairHeight - 56);
            // Back highlight
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + p*2, backTop + p*3, p*2, chairHeight - 68);
            // Back texture
            for (let py = backTop + p*5; py < seatTop - p*2; py += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(x + p*2, py, p*3, p);
            }
            
            // Seat bottom frame
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop + 28, seatDepth + backWidth, 16);
            
            // Seat cushion
            g.fillStyle(CHAIR_MID);
            g.fillRect(x + backWidth - p, seatTop, seatDepth + p, 32);
            // Seat highlight
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + backWidth, seatTop + p, seatDepth - p*2, p*2);
            // Seat texture
            for (let px = x + backWidth + p*2; px < x + backWidth + seatDepth - p*2; px += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(px, seatTop + p*3, p*2, p);
            }
            
            // Armrest (on the side we can see - the left/back side)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x - p*2, seatTop - p*3, backWidth + p*4, p*4);
            g.fillStyle(CHAIR_MID);
            g.fillRect(x - p, seatTop - p*2, backWidth + p*2, p*2);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x, seatTop - p*2 + 2, backWidth, p);
            
            // Armrest support (vertical piece)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x + backWidth + seatDepth - p*3, seatTop, p*3, 32);
            
        } else {
            // Chair faces left - we see its RIGHT side (mirror of above)
            const chairRight = x + seatDepth + backWidth;
            
            // Back leg (right, rear)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(chairRight - legSize, chairY - 36, legSize, 36);
            
            // Front leg (left, front)
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x, chairY - 40, legSize, 40);
            
            // Chair back (vertical, on right)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(chairRight - backWidth, backTop, backWidth, chairHeight - 40);
            // Back cushion
            g.fillStyle(CHAIR_MID);
            g.fillRect(chairRight - backWidth + p, backTop + p*2, backWidth - p*2, chairHeight - 56);
            // Back highlight (on right edge now)
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(chairRight - p*4, backTop + p*3, p*2, chairHeight - 68);
            // Back texture
            for (let py = backTop + p*5; py < seatTop - p*2; py += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(chairRight - backWidth + p*2, py, p*3, p);
            }
            
            // Seat bottom frame
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop + 28, seatDepth + backWidth, 16);
            
            // Seat cushion
            g.fillStyle(CHAIR_MID);
            g.fillRect(x, seatTop, seatDepth + p, 32);
            // Seat highlight
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(x + p*2, seatTop + p, seatDepth - p*2, p*2);
            // Seat texture
            for (let px = x + p*2; px < x + seatDepth - p*2; px += p*4) {
                g.fillStyle(CHAIR_HIGHLIGHT);
                g.fillRect(px, seatTop + p*3, p*2, p);
            }
            
            // Armrest (on the side we can see - the right/back side)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(chairRight - backWidth - p*2, seatTop - p*3, backWidth + p*4, p*4);
            g.fillStyle(CHAIR_MID);
            g.fillRect(chairRight - backWidth - p, seatTop - p*2, backWidth + p*2, p*2);
            g.fillStyle(CHAIR_LIGHT);
            g.fillRect(chairRight - backWidth, seatTop - p*2 + 2, backWidth, p);
            
            // Armrest support (vertical piece on left/front)
            g.fillStyle(CHAIR_DARK);
            g.fillRect(x, seatTop, p*3, 32);
        }
    }
    
    drawFireplace(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const fireplaceHeight = 220; // Lower - top reaches bottom of Nate's head
        const mantleY = floorY - fireplaceHeight;
        
        // === STONE DIMENSIONS ===
        const stoneW = p*6;
        const stoneH = p*4;
        const stoneGap = p;
        const stoneUnit = stoneW + stoneGap; // 28px per stone column
        
        // Calculate fireplace width based on stones: 1 column left, 5 columns firebox, 1 column right = 7 columns
        const numColumns = 7;
        const fireplaceWidth = numColumns * stoneUnit;
        
        // Firebox spans middle 5 columns
        const fireboxX = x + stoneUnit; // Start after first column
        const fireboxWidth = stoneUnit * 5 - stoneGap; // 5 columns wide minus last gap
        const fireboxTop = mantleY + p*12;
        const fireboxHeight = fireplaceHeight - p*16;
        
        // === STONE SURROUND BASE (exactly fits the stones) ===
        g.fillStyle(0x4a4540);
        g.fillRect(x, mantleY, fireplaceWidth - stoneGap, fireplaceHeight);
        
        // === FIREBOX OPENING ===
        g.fillStyle(0x0a0505);
        g.fillRect(fireboxX, fireboxTop, fireboxWidth, fireboxHeight);
        
        // Back wall of firebox (darker)
        g.fillStyle(0x050202);
        g.fillRect(fireboxX + p*2, fireboxTop + p*2, fireboxWidth - p*4, fireboxHeight - p*4);
        
        // === STONE TEXTURE ===
        // Left column of stones (1 column)
        for (let py = mantleY + p*2; py < floorY - p*2; py += stoneH + stoneGap) {
            g.fillStyle(0x5a5550);
            g.fillRect(x + p, py, stoneW, stoneH);
            g.fillStyle(0x6a6560);
            g.fillRect(x + p + p, py + p, stoneW - p*2, p);
            g.fillStyle(0x3a3530);
            g.fillRect(x + p + p, py + stoneH - p, stoneW - p*2, p);
        }
        
        // Right column of stones (1 column)
        const rightColX = x + stoneUnit * 6;
        for (let py = mantleY + p*2; py < floorY - p*2; py += stoneH + stoneGap) {
            g.fillStyle(0x5a5550);
            g.fillRect(rightColX, py, stoneW, stoneH);
            g.fillStyle(0x6a6560);
            g.fillRect(rightColX + p, py + p, stoneW - p*2, p);
            g.fillStyle(0x3a3530);
            g.fillRect(rightColX + p, py + stoneH - p, stoneW - p*2, p);
        }
        
        // Top rows of stones (above firebox, 5 columns wide)
        for (let py = mantleY + p*2; py < fireboxTop - stoneGap; py += stoneH + stoneGap) {
            for (let col = 1; col < 6; col++) {
                const px = x + col * stoneUnit;
                g.fillStyle(0x5a5550);
                g.fillRect(px, py, stoneW, stoneH);
                g.fillStyle(0x6a6560);
                g.fillRect(px + p, py + p, stoneW - p*2, p);
                g.fillStyle(0x3a3530);
                g.fillRect(px + p, py + stoneH - p, stoneW - p*2, p);
            }
        }
        
        // === MANTLE SHELF ===
        const mantleThickness = p*5;
        const mantleOverhang = p*4;
        const mantleWidth = fireplaceWidth - stoneGap + mantleOverhang * 2;
        
        // Mantle front face
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - mantleOverhang, mantleY - mantleThickness, mantleWidth, mantleThickness);
        // Mantle top surface
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - mantleOverhang, mantleY - mantleThickness, mantleWidth, p*2);
        // Mantle highlight
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - mantleOverhang + p, mantleY - mantleThickness + p, mantleWidth - p*2, p);
        
        // === ITEMS ON MANTLE (sitting on top of mantle) ===
        const itemBaseY = mantleY - mantleThickness; // Items sit here
        const mantelCenterX = x + (fireplaceWidth - stoneGap) / 2;
        
        // Photo frame left
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, itemBaseY - p*10, p*8, p*10);
        g.fillStyle(0x2a2520);
        g.fillRect(x + p*3, itemBaseY - p*9, p*6, p*8);
        
        // Photo frame center-left  
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*14, itemBaseY - p*8, p*7, p*8);
        g.fillStyle(0x2a2520);
        g.fillRect(x + p*15, itemBaseY - p*7, p*5, p*6);
        
        // Small clock center
        g.fillStyle(COLORS.BRASS);
        g.fillRect(mantelCenterX - p*4, itemBaseY - p*7, p*8, p*7);
        g.fillStyle(0xd0c8b0);
        g.fillRect(mantelCenterX - p*3, itemBaseY - p*6, p*6, p*5);
        // Clock hands
        g.fillStyle(0x1a1a1a);
        g.fillRect(mantelCenterX - p/2, itemBaseY - p*5, p, p*2);
        g.fillRect(mantelCenterX, itemBaseY - p*4, p*2, p);
        
        // Candlestick right
        const candleX = x + fireplaceWidth - stoneGap - p*12;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(candleX + p*2, itemBaseY - p*7, p*2, p*7);
        g.fillRect(candleX, itemBaseY - p*2, p*6, p*2);
        // Candle
        g.fillStyle(0xeae0c0);
        g.fillRect(candleX + p*2, itemBaseY - p*12, p*2, p*5);
        // Candle flame
        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.fillRect(candleX + p*2, itemBaseY - p*15, p*2, p*3);
        g.fillStyle(COLORS.FIRE_LIGHT);
        g.fillRect(candleX + p*2, itemBaseY - p*14, p, p*2);
        
        // === FIRE IN FIREBOX (centered) ===
        const fireWidth = fireboxWidth - p*8;
        const fireX = fireboxX + (fireboxWidth - fireWidth) / 2;
        this.drawFire(g, fireX, floorY - p*6, fireWidth, p*14, COLORS);
        
        // === FIREPLACE GRATE (centered) ===
        g.fillStyle(0x1a1a1a);
        const grateWidth = fireboxWidth - p*6;
        const grateX = fireboxX + p*3;
        const numBars = 5;
        const barSpacing = grateWidth / (numBars - 1);
        // Grate bars
        for (let i = 0; i < numBars; i++) {
            g.fillRect(grateX + i * barSpacing - p/2, floorY - p*3, p, p*3);
        }
        // Grate front bar
        g.fillRect(grateX - p, floorY - p*2, grateWidth + p*2, p);
    }
    
    drawFire(g, x, y, w, h, COLORS) {
        // Base coals/logs
        g.fillStyle(0x2a1508);
        g.fillRect(x - 5, y - 8, w + 10, 15);
        g.fillStyle(0x1a0a04);
        g.fillRect(x, y - 5, 25, 10);
        g.fillRect(x + 35, y - 6, 30, 12);
        
        // Glowing embers
        g.fillStyle(COLORS.FIRE_DARK);
        g.fillRect(x + 5, y - 4, 15, 6);
        g.fillRect(x + 40, y - 5, 20, 8);
        
        // Main flame shapes (solid, layered)
        // Outer flame (dark orange)
        g.fillStyle(COLORS.FIRE_MID);
        g.beginPath();
        g.moveTo(x + 10, y - 5);
        g.lineTo(x + 25, y - h + 10);
        g.lineTo(x + 40, y - 5);
        g.closePath();
        g.fill();
        
        g.beginPath();
        g.moveTo(x + 30, y - 5);
        g.lineTo(x + 50, y - h + 5);
        g.lineTo(x + 70, y - 5);
        g.closePath();
        g.fill();
        
        // Middle flame (bright orange)
        g.fillStyle(COLORS.FIRE_LIGHT);
        g.beginPath();
        g.moveTo(x + 15, y - 5);
        g.lineTo(x + 27, y - h + 25);
        g.lineTo(x + 38, y - 5);
        g.closePath();
        g.fill();
        
        g.beginPath();
        g.moveTo(x + 38, y - 5);
        g.lineTo(x + 52, y - h + 20);
        g.lineTo(x + 65, y - 5);
        g.closePath();
        g.fill();
        
        // Inner flame (yellow/white hot)
        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.beginPath();
        g.moveTo(x + 20, y - 5);
        g.lineTo(x + 28, y - h + 40);
        g.lineTo(x + 35, y - 5);
        g.closePath();
        g.fill();
        
        g.beginPath();
        g.moveTo(x + 45, y - 5);
        g.lineTo(x + 53, y - h + 35);
        g.lineTo(x + 60, y - 5);
        g.closePath();
        g.fill();
    }
    
    drawCoffeeTable(g, x, floorY, COLORS) {
        // Larger coffee table with perspective - sits on the rug in front of fireplace
        const tableY = floorY - 5; // Legs on floor
        const tableTop = tableY - 50;
        const tableWidth = 180;
        const tableHeight = 55;
        
        // Table legs (4 legs with perspective - back legs slightly higher/smaller)
        g.fillStyle(COLORS.WOOD_DARK);
        // Back legs (further away)
        g.fillRect(x + 12, tableTop + 8, 10, 40);
        g.fillRect(x + tableWidth - 22, tableTop + 8, 10, 40);
        // Front legs (closer)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + 8, tableTop + 12, 12, 43);
        g.fillRect(x + tableWidth - 20, tableTop + 12, 12, 43);
        
        // Table top surface (thick, solid wood)
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop - 5, tableWidth, 18);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + 3, tableTop - 3, tableWidth - 6, 12);
        // Wood grain highlight
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + 8, tableTop - 1, tableWidth - 16, 4);
        
        // Table edge detail
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, tableTop + 10, tableWidth, 4);
        
        // Clutter on table - more items for larger table
        // Stack of journals/books (left side)
        g.fillStyle(0x8a4030); // Red book
        g.fillRect(x + 20, tableTop - 20, 45, 12);
        g.fillStyle(0x2a4a3a); // Green book
        g.fillRect(x + 24, tableTop - 30, 40, 10);
        g.fillStyle(0x3a3a5a); // Blue book  
        g.fillRect(x + 28, tableTop - 38, 35, 8);
        
        // Open journal (center)
        g.fillStyle(0xd0c8b0);
        g.fillRect(x + 70, tableTop - 14, 50, 10);
        g.fillStyle(0xe0d8c0);
        g.fillRect(x + 72, tableTop - 12, 22, 7);
        g.fillRect(x + 96, tableTop - 12, 22, 7);
        // Writing on pages
        g.fillStyle(0x2a2a3a);
        for (let i = 0; i < 4; i++) {
            g.fillRect(x + 74, tableTop - 10 + i * 2, 18, 1);
            g.fillRect(x + 98, tableTop - 10 + i * 2, 18, 1);
        }
        
        // Coffee mug (right side)
        g.fillStyle(0x6a6560);
        g.fillRect(x + 135, tableTop - 24, 22, 20);
        g.fillStyle(0x3a2010); // Coffee inside
        g.fillRect(x + 138, tableTop - 22, 16, 10);
        // Mug handle
        g.fillStyle(0x6a6560);
        g.fillRect(x + 155, tableTop - 20, 7, 4);
        g.fillRect(x + 159, tableTop - 20, 4, 14);
        g.fillRect(x + 155, tableTop - 10, 7, 4);
        
        // Small dish/ashtray
        g.fillStyle(0x5a5a5a);
        g.fillRect(x + 130, tableTop - 10, 18, 6);
        g.fillStyle(0x4a4a4a);
        g.fillRect(x + 132, tableTop - 9, 14, 4);
    }
    
    drawBookshelf(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const shelfWidth = 160;
        const shelfHeight = 340;
        const shelfTop = floorY - shelfHeight;
        const shelfDepth = 20; // Side panel depth
        const numShelves = 5;
        const shelfSpacing = (shelfHeight - p*8) / numShelves;
        
        // === SIDE PANEL (3D depth - left side visible) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - shelfDepth, shelfTop, shelfDepth, shelfHeight);
        // Side panel wood grain
        for (let py = shelfTop + p*2; py < floorY - p*2; py += p*8) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - shelfDepth + p, py, shelfDepth - p*2, p);
        }
        
        // === MAIN BODY (back panel) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, shelfTop, shelfWidth, shelfHeight);
        
        // Back panel (slightly recessed)
        g.fillStyle(0x1a1510);
        g.fillRect(x + p*2, shelfTop + p*2, shelfWidth - p*4, shelfHeight - p*4);
        
        // === TOP TRIM ===
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - shelfDepth - p, shelfTop - p*2, shelfWidth + shelfDepth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - shelfDepth, shelfTop - p, shelfWidth + shelfDepth, p);
        
        // === SHELVES AND BOOKS ===
        for (let i = 0; i < numShelves; i++) {
            const shelfY = shelfTop + p*4 + i * shelfSpacing;
            
            // Shelf board
            g.fillStyle(COLORS.WOOD_MID);
            g.fillRect(x, shelfY + shelfSpacing - p*3, shelfWidth, p*3);
            // Shelf highlight
            g.fillStyle(COLORS.WOOD_LIGHT);
            g.fillRect(x + p, shelfY + shelfSpacing - p*3, shelfWidth - p*2, p);
            // Shelf depth (left side)
            g.fillStyle(COLORS.WOOD_DARK);
            g.fillRect(x - shelfDepth, shelfY + shelfSpacing - p*3, shelfDepth, p*3);
            
            // Books on this shelf
            this.drawBooksOnShelf(g, x + p*2, shelfY, shelfWidth - p*4, shelfSpacing - p*4);
        }
        
        // === SIDE TRIM (right edge) ===
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + shelfWidth - p, shelfTop, p*2, shelfHeight);
        
        // === BASE ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - shelfDepth - p, floorY - p*3, shelfWidth + shelfDepth + p*2, p*3);
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - shelfDepth, floorY - p*2, shelfWidth + shelfDepth, p);
    }
    
    drawBooksOnShelf(g, x, y, w, h) {
        const p = 4; // Pixel size minimum
        const bookColors = [
            0x8a3030, 0x2a5a3a, 0x3a3a6a, 0x6a5a2a, 
            0x5a2a4a, 0x2a4a5a, 0x6a3a2a, 0x3a5a5a
        ];
        
        let currentX = x;
        let colorIndex = Math.floor(y / 10) % bookColors.length; // Vary by shelf
        
        while (currentX < x + w - p*3) {
            // Vary book width (2-4 units of p)
            const bookWidth = p * (2 + Math.floor((currentX * 7) % 3));
            // Vary book height
            const bookHeight = h - p * (Math.floor((currentX * 3) % 3));
            const bookColor = bookColors[colorIndex % bookColors.length];
            
            // Book spine
            g.fillStyle(bookColor);
            g.fillRect(currentX, y + (h - bookHeight), bookWidth, bookHeight);
            
            // Spine highlight (left edge)
            const highlight = bookColor + 0x202020;
            g.fillStyle(highlight > 0xffffff ? 0xffffff : highlight);
            g.fillRect(currentX, y + (h - bookHeight) + p, p, bookHeight - p*2);
            
            // Spine shadow (right edge)
            const shadow = bookColor - 0x151515;
            g.fillStyle(shadow < 0 ? 0x000000 : shadow);
            g.fillRect(currentX + bookWidth - p, y + (h - bookHeight) + p, p, bookHeight - p*2);
            
            // Some books leaning or horizontal
            if ((currentX * 13) % 17 < 3 && currentX < x + w - p*12) {
                // Horizontal book on top
                g.fillStyle(bookColors[(colorIndex + 3) % bookColors.length]);
                g.fillRect(currentX, y + (h - bookHeight) - p*2, p*8, p*2);
            }
            
            currentX += bookWidth + p;
            colorIndex++;
        }
    }
    
    drawRug(g, x, y, w, h, COLORS) {
        // Rug base - larger size
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x, y, w, h);
        
        // Outer decorative border
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + 4, y + 4, w - 8, 6);
        g.fillRect(x + 4, y + h - 10, w - 8, 6);
        g.fillRect(x + 4, y + 4, 6, h - 8);
        g.fillRect(x + w - 10, y + 4, 6, h - 8);
        
        // Inner border
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(x + 14, y + 14, w - 28, 4);
        g.fillRect(x + 14, y + h - 18, w - 28, 4);
        g.fillRect(x + 14, y + 14, 4, h - 28);
        g.fillRect(x + w - 18, y + 14, 4, h - 28);
        
        // Inner field
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(x + 22, y + 22, w - 44, h - 44);
        
        // Subtle pattern - diamond/medallion shapes (not too busy)
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        
        // Central medallion
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(centerX - 30, centerY - 15, 60, 30);
        g.fillStyle(COLORS.RUG_MID);
        g.fillRect(centerX - 24, centerY - 10, 48, 20);
        g.fillStyle(COLORS.RUG_DARK);
        g.fillRect(centerX - 18, centerY - 6, 36, 12);
        
        // Corner accents
        const cornerOffset = 50;
        g.fillStyle(COLORS.RUG_PATTERN);
        g.fillRect(x + cornerOffset - 10, y + 30, 20, 12);
        g.fillRect(x + w - cornerOffset - 10, y + 30, 20, 12);
        g.fillRect(x + cornerOffset - 10, y + h - 42, 20, 12);
        g.fillRect(x + w - cornerOffset - 10, y + h - 42, 20, 12);
        
        // Subtle dithered texture throughout
        for (let py = y + 24; py < y + h - 24; py += 8) {
            for (let px = x + 24; px < x + w - 24; px += 12) {
                if ((px + py) % 32 < 4) {
                    g.fillStyle(COLORS.RUG_MID);
                    g.fillRect(px, py, 3, 2);
                }
            }
        }
        
        // Worn path through center (lighter, shows use)
        for (let py = y + 30; py < y + h - 30; py += 6) {
            for (let px = centerX - 40; px < centerX + 40; px += 10) {
                if ((px + py) % 18 < 4) {
                    g.fillStyle(COLORS.RUG_MID);
                    g.fillRect(px, py, 4, 2);
                }
            }
        }
        
        // Fringe on short ends
        g.fillStyle(COLORS.RUG_PATTERN);
        for (let px = x + 8; px < x + w - 8; px += 6) {
            g.fillRect(px, y - 8, 3, 10);
            g.fillRect(px, y + h - 2, 3, 10);
        }
    }
    
    drawDesk(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const deskWidth = 180;
        const deskHeight = 100;
        const deskDepth = 24; // Side panel for 3D effect
        const deskY = floorY + 15; // Pull forward from wall
        const deskTop = deskY - deskHeight;
        
        // === SIDE PANEL (3D depth - left side visible) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - deskDepth, deskTop, deskDepth, deskHeight);
        // Side panel wood grain
        for (let py = deskTop + p*2; py < deskY - p*2; py += p*5) {
            g.fillStyle(0x2a1a10);
            g.fillRect(x - deskDepth + p, py, deskDepth - p*2, p);
        }
        
        // === DESK BODY (front face) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, deskTop, deskWidth, deskHeight);
        
        // === DESKTOP SURFACE ===
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - deskDepth - p*2, deskTop - p*3, deskWidth + deskDepth + p*4, p*4);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - deskDepth - p, deskTop - p*2, deskWidth + deskDepth + p*2, p);
        
        // === DRAWERS ===
        // Left column - 2 drawers
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, deskTop + p*4, p*18, p*9);
        g.fillRect(x + p*2, deskTop + p*15, p*18, p*9);
        // Drawer highlights
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, deskTop + p*5, p*16, p);
        g.fillRect(x + p*3, deskTop + p*16, p*16, p);
        // Drawer handles
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*9, deskTop + p*7, p*4, p*2);
        g.fillRect(x + p*9, deskTop + p*18, p*4, p*2);
        
        // Right column - 1 large drawer
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*24, deskTop + p*4, p*18, p*20);
        // Drawer highlight
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*25, deskTop + p*5, p*16, p);
        // Drawer handle
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p*31, deskTop + p*12, p*4, p*3);
        
        // === LEGS ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x + p, deskY - p*3, p*3, p*3);
        g.fillRect(x + deskWidth - p*4, deskY - p*3, p*3, p*3);
        // Front leg (visible due to depth)
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - deskDepth + p, deskY - p*3, p*3, p*3);
        
        // === ITEMS ON DESK ===
        const surfaceY = deskTop - p*3;
        
        // Papers scattered
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0xd8d0c0);
            g.fillRect(x + p*4 + i * p*5, surfaceY - p*2 - i * p, p*12, p*2);
        }
        
        // Open book/journal
        g.fillStyle(0x8a4030);
        g.fillRect(x + p*20, surfaceY - p*4, p*14, p*4);
        g.fillStyle(0xd8d0c0);
        g.fillRect(x + p*21, surfaceY - p*3, p*5, p*2);
        g.fillRect(x + p*27, surfaceY - p*3, p*5, p*2);
        
        // Desk lamp
        const lampX = x + deskWidth - p*12;
        // Lamp base
        g.fillStyle(COLORS.BRASS);
        g.fillRect(lampX, surfaceY - p*3, p*6, p*3);
        // Lamp arm
        g.fillRect(lampX + p*2, surfaceY - p*16, p*2, p*14);
        // Lamp shade
        g.fillStyle(0x3a6a4a);
        g.fillRect(lampX - p*3, surfaceY - p*20, p*12, p*5);
        // Lamp glow
        g.fillStyle(COLORS.FIRE_BRIGHT);
        g.fillRect(lampX - p, surfaceY - p*17, p*8, p*2);
        
        // === BLUEPRINTS ON WALL ABOVE ===
        const bpX = x + p*6;
        const bpY = surfaceY - p*50;
        g.fillStyle(0x8090a0);
        g.fillRect(bpX, bpY, p*28, p*20);
        // Blueprint border
        g.fillStyle(0x6080a0);
        g.fillRect(bpX + p, bpY + p, p*26, p);
        g.fillRect(bpX + p, bpY + p*18, p*26, p);
        g.fillRect(bpX + p, bpY + p, p, p*18);
        g.fillRect(bpX + p*26, bpY + p, p, p*18);
        // Blueprint arch drawing
        g.fillStyle(0x4060a0);
        g.fillRect(bpX + p*8, bpY + p*4, p*12, p*12);
        g.fillStyle(0x8090a0);
        g.fillRect(bpX + p*10, bpY + p*6, p*8, p*8);
        // Blueprint lines
        for (let i = 0; i < 4; i++) {
            g.fillStyle(0x5070a0);
            g.fillRect(bpX + p*3, bpY + p*4 + i * p*4, p*4, p);
        }
    }
    
    drawStrangeDevice(g, x, floorY, COLORS) {
        const p = 4; // Pixel size minimum
        const deviceY = floorY + 15; // Pull forward from wall
        const pedestalHeight = p*28;
        const pedestalWidth = p*14;
        const pedestalDepth = p*5; // Side panel for 3D
        const pedestalTop = deviceY - pedestalHeight;
        
        // === PEDESTAL SIDE PANEL (3D depth) ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x - pedestalDepth, pedestalTop + p*2, pedestalDepth, pedestalHeight - p*2);
        
        // === PEDESTAL BODY ===
        g.fillStyle(COLORS.WOOD_DARK);
        g.fillRect(x, pedestalTop, pedestalWidth, pedestalHeight);
        
        // Pedestal top trim
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - pedestalDepth - p, pedestalTop - p, pedestalWidth + pedestalDepth + p*2, p*2);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x - pedestalDepth, pedestalTop, pedestalWidth + pedestalDepth, p);
        
        // Pedestal base trim
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x - pedestalDepth - p, deviceY - p*2, pedestalWidth + pedestalDepth + p*2, p*2);
        
        // Pedestal panel detail
        g.fillStyle(COLORS.WOOD_MID);
        g.fillRect(x + p*2, pedestalTop + p*4, pedestalWidth - p*4, pedestalHeight - p*8);
        g.fillStyle(COLORS.WOOD_LIGHT);
        g.fillRect(x + p*3, pedestalTop + p*5, pedestalWidth - p*6, p);
        
        // === DEVICE BASE ===
        const deviceBaseY = pedestalTop - p*2;
        g.fillStyle(COLORS.BRASS);
        g.fillRect(x + p, deviceBaseY, pedestalWidth - p*2, p*3);
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, deviceBaseY + p, pedestalWidth - p*4, p);
        
        // === GLASS DOME ===
        const domeWidth = pedestalWidth - p*4;
        const domeHeight = p*10;
        const domeX = x + p*2;
        const domeY = deviceBaseY - domeHeight;
        
        // Dome body (bluish glass)
        g.fillStyle(0x3a5a6a);
        g.fillRect(domeX, domeY, domeWidth, domeHeight);
        // Dome highlight
        g.fillStyle(0x4a7a8a);
        g.fillRect(domeX + p, domeY + p, p*2, domeHeight - p*2);
        // Dome top
        g.fillStyle(0x4a6a7a);
        g.fillRect(domeX + p, domeY - p, domeWidth - p*2, p*2);
        
        // === GLOWING CORE ===
        const coreX = domeX + domeWidth/2 - p*2;
        const coreY = domeY + domeHeight/2 - p*2;
        // Outer glow
        g.fillStyle(COLORS.LAB_MID);
        g.fillRect(coreX - p, coreY - p, p*6, p*6);
        // Inner glow
        g.fillStyle(COLORS.LAB_LIGHT);
        g.fillRect(coreX, coreY, p*4, p*4);
        // Bright center
        g.fillStyle(0xaaffaa);
        g.fillRect(coreX + p, coreY + p, p*2, p*2);
        
        // === BRASS RINGS ===
        g.fillStyle(COLORS.BRASS);
        g.fillRect(domeX - p, domeY - p*2, domeWidth + p*2, p);
        g.fillRect(domeX - p, deviceBaseY - p, domeWidth + p*2, p);
        
        // === SMALL DETAILS ===
        // Brass knobs on base
        g.fillStyle(COLORS.GOLD);
        g.fillRect(x + p*2, deviceBaseY + p*2, p*2, p);
        g.fillRect(x + pedestalWidth - p*4, deviceBaseY + p*2, p*2, p);
    }
    
    // === LIGHTING EFFECTS ===
    



    createLighting(worldWidth, height) {
        // Moonlight from left window - soft blue accent
        this.lights.addLight(380, height * 0.5, 350, 0xaabbdd, 0.8);
        
        // Moonlight from right window
        this.lights.addLight(1920, height * 0.5, 320, 0xaabbdd, 0.7);
        
        // Fireplace light (warm, will flicker) - main light source
        this.fireLight = this.lights.addLight(900, height * 0.60, 450, 0xffcc88, 2.0);
        this.fireLight2 = this.lights.addLight(900, height * 0.72, 300, 0xffaa66, 1.5);
        
        // Lab doorway glow - inviting
        this.labLight = this.lights.addLight(2400, height * 0.6, 350, 0xaaffaa, 1.0);
        
        // Desk lamp - warm pool of light
        this.lights.addLight(1780, height * 0.45, 200, 0xffeeaa, 1.0);
        
        // Strange device glow
        this.deviceLight = this.lights.addLight(2105, height * 0.55, 120, 0xaaffcc, 0.8);
    }
    
    createEdgeZones(height) {
        // Right edge - to laboratory
        this.rightEdgeZone = this.add.zone(this.worldWidth - 40, height * 0.5, 80, height)
            .setInteractive()
            .setOrigin(0.5);
        
        this.rightEdgeZone.on('pointerdown', (pointer) => {
            if (this.inventoryOpen) return;
            this.walkToEdgeAndTransition(this.worldWidth - 100, height * 0.82, 'LaboratoryScene', 'from_foyer');
        });
    }
    
    walkToEdgeAndTransition(targetX, targetY, scene, spawnPoint) {
        this.walkTo(targetX, targetY, () => {
            this.transitionToScene(scene, spawnPoint);
        }, false);
    }
    
    executeAction(action, hotspot) {
        if (action === 'Use' || action === hotspot.verbLabels?.actionVerb) {
            if (hotspot.useResponse === 'TRANSITION_TO_LAB') {
                this.walkTo(hotspot.interactX, hotspot.interactY, () => {
                    this.transitionToScene('LaboratoryScene', 'from_foyer');
                });
            } else {
                this.showDialog(hotspot.useResponse);
            }
        } else if (action === 'Look At' || action === hotspot.verbLabels?.lookVerb) {
            this.showDialog(hotspot.lookResponse);
        } else if (action === 'Talk To' || action === hotspot.verbLabels?.talkVerb) {
            this.showDialog(hotspot.talkResponse);
        }
    }
    
    useItemOnHotspot(item, hotspot) {
        if (hotspot.name === 'Fireplace') {
            this.showDialog(`I'm not throwing my ${item.name} into the fire. That seems wasteful.`);
        } else if (hotspot.name === 'Strange Device') {
            this.showDialog(`I wave my ${item.name} near the device. It hums appreciatively but nothing happens.`);
        } else {
            this.showDialog(`I don't think the ${item.name} works with the ${hotspot.name}.`);
        }
    }
    
    update() {
        super.update();
        
        const time = this.time.now * 0.001;
        
        // Fireplace flicker
        if (this.fireLight) {
            const flicker = Math.sin(time * 8) * 0.3 + Math.sin(time * 13) * 0.15 + Math.random() * 0.1;
            this.fireLight.setIntensity(1.8 + flicker);
            this.fireLight2.setIntensity(1.3 + flicker * 0.7);
        }
        
        // Lab light subtle pulse
        if (this.labLight) {
            const pulse = Math.sin(time * 2) * 0.15;
            this.labLight.setIntensity(0.7 + pulse);
        }
        
        // Strange device pulse
        if (this.deviceLight) {
            const pulse = Math.sin(time * 3) * 0.2 + 0.5;
            this.deviceLight.setIntensity(pulse);
        }
    }
}
