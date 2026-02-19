// TitleScene.js — Start menu for The Sandwich Horror
// Translates the HTML mockup design into a Phaser 3 scene.
// Does NOT extend BaseScene — this is a standalone scene with no game systems.

class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
        this.menuItems = [];
        this.selectedIndex = 0;
        this.menuActive = false;
        this.isTransitioning = false;
        this.isMobile = false;
        this.stars = [];
        this.particles = [];
        this.particleTimer = null;
        this.portalGlow = null;
    }

    preload() {
        // Title music
        this.load.audio('title_theme', 'assets/audio/music/title_theme.mp3');
        
        // Font (same font used throughout the game)
        // LucasArts SCUMM Solid should already be loaded via CSS @font-face in index.html
    }

    create() {
        this.isMobile = window.matchMedia('(pointer: coarse)').matches;
        
        const W = 1280;
        const H = 720;

        // === COLORS (from mockup CSS variables) ===
        const COLORS = {
            bgDeep:       0x0a0611,
            bgMid:        0x1a1033,
            purpleDark:   0x2d1b4e,
            purpleMid:    0x4a2d7a,
            purpleLight:  0x7b52a0,
            blueDark:     0x152040,
            greenGlow:    0x39ff7f,
            greenDim:     0x1a8c45,
            greenDark:    0x0d4a24,
            textPrimary:  '#d4c8e8',
            textDim:      '#6b5a8a',
            textHover:    '#ffffff',
            textDisabled: '#2a2040',
            panelBg:      0x05030a,
            panelBorder:  0x2d1b4e,
        };

        // === BACKGROUND ===
        // Base fill
        this.add.rectangle(W / 2, H / 2, W, H, COLORS.bgDeep).setDepth(0);

        // Gradient overlays using graphics
        const bgGfx = this.add.graphics().setDepth(1);
        
        // Purple glow from bottom center
        this.drawRadialGlow(bgGfx, W * 0.5, H * 0.8, 500, 350, 0x2a1e50, 0.6);
        // Blue glow upper left
        this.drawRadialGlow(bgGfx, W * 0.3, H * 0.2, 350, 200, 0x1e3a6e, 0.3);
        // Purple glow upper right
        this.drawRadialGlow(bgGfx, W * 0.7, H * 0.3, 400, 250, 0x2d1b4e, 0.4);

        // === STARS ===
        this.createStars(W, H, COLORS);

        // === HOUSE SILHOUETTE ===
        this.drawHouseSilhouette(W, H);

        // === PORTAL GLOW (animated) ===
        this.createPortalGlow(W, H);

        // === FLOATING PARTICLES ===
        this.createParticleSystem(W, H);

        // === VIGNETTE ===
        this.createVignette(W, H);

        // === SCANLINES ===
        this.createScanlines(W, H);

        // === TITLE TEXT ===
        this.createTitle(W, H);

        // === MENU ===
        this.createMenu(W, H, COLORS);

        // === VERSION ===
        this.add.text(W - 20, H - 16, 'v0.2.0', {
            fontFamily: '"LucasArts SCUMM Solid", "Press Start 2P", cursive',
            fontSize: '10px',
            color: '#1f1535',
        }).setOrigin(1, 1).setDepth(100);

        // === "CLICK ANYWHERE TO BEGIN" (pre-menu state for audio unlock) ===
        this.createClickPrompt(W, H);

        // === KEYBOARD INPUT ===
        if (!this.isMobile) {
            this.input.keyboard.on('keydown-UP', () => this.navigateMenu(-1));
            this.input.keyboard.on('keydown-DOWN', () => this.navigateMenu(1));
            this.input.keyboard.on('keydown-ENTER', () => this.selectMenuItem());
            this.input.keyboard.on('keydown-SPACE', () => this.selectMenuItem());
        }

        // Hide default cursor on this scene
        this.input.setDefaultCursor('default');
    }

    // ==========================================
    // BACKGROUND HELPERS
    // ==========================================

    drawRadialGlow(gfx, cx, cy, rx, ry, color, maxAlpha) {
        // Approximate radial gradient with concentric ellipses
        const steps = 12;
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const alpha = maxAlpha * (1 - t) * 0.15;
            const w = rx * t * 2;
            const h = ry * t * 2;
            gfx.fillStyle(color, alpha);
            gfx.fillEllipse(cx, cy, w, h);
        }
    }

    // ==========================================
    // STARS
    // ==========================================

    createStars(W, H) {
        const starGfx = this.add.graphics().setDepth(2);
        const P = 4;

        for (let i = 0; i < 80; i++) {
            const x = Math.floor(Math.random() * W / P) * P;
            const y = Math.floor(Math.random() * (H * 0.55) / P) * P;
            const sizeRoll = Math.random();
            const size = sizeRoll < 0.5 ? 2 : sizeRoll < 0.85 ? 3 : 4;
            const baseAlpha = size === 2 ? 0.3 : size === 3 ? 0.5 : 0.7;

            starGfx.fillStyle(0xffffff, baseAlpha);
            starGfx.fillRect(x, y, size, size);

            // ~30% of stars twinkle
            if (Math.random() < 0.3) {
                const starRect = this.add.rectangle(x + size / 2, y + size / 2, size, size, 0xffffff)
                    .setAlpha(baseAlpha)
                    .setDepth(2);

                const minAlpha = 0.15;
                const maxAlpha = Math.min(baseAlpha + 0.4, 0.9);
                const duration = 2500 + Math.random() * 2500;

                this.tweens.add({
                    targets: starRect,
                    alpha: { from: minAlpha, to: maxAlpha },
                    duration: duration,
                    yoyo: true,
                    repeat: -1,
                    delay: Math.random() * 3000,
                    ease: 'Sine.easeInOut',
                });

                this.stars.push(starRect);
            }
        }
    }

    // ==========================================
    // HOUSE SILHOUETTE
    // ==========================================

    drawHouseSilhouette(W, H) {
        const gfx = this.add.graphics().setDepth(5);
        const P = 4;

        const dark = 0x08050f;
        const darker = 0x050310;
        const windowGreen = 0x1a8c45;
        const windowGreenBright = 0x39ff7f;
        const windowWarm = 0x3a2a1a;

        // Helper: pixel-snapped rect
        const pr = (x, y, w, h, color) => {
            const px = Math.round(x / P) * P;
            const py = Math.round(y / P) * P;
            const pw = Math.round(w / P) * P;
            const ph = Math.round(h / P) * P;
            gfx.fillStyle(color, 1);
            gfx.fillRect(px, py + (H - 360), pw, ph);
        };

        // Ground
        pr(0, 300, 1280, 60, dark);

        // === MAIN HOUSE ===
        const hx = 440;
        const hw = 400;

        // Body
        pr(hx, 120, hw, 180, dark);

        // Roof (peaked)
        for (let i = 0; i < 60; i += P) {
            const roofW = hw + (i * 1.2);
            const roofX = hx + (hw / 2) - (roofW / 2);
            pr(roofX, 120 - 60 + i, roofW, P, dark);
        }

        // Chimney
        pr(hx + 60, 40, 32, 60, dark);
        pr(hx + 56, 36, 40, 8, dark);

        // === SECOND FLOOR WINDOWS ===
        pr(hx + 40, 140, 36, 28, windowWarm);
        pr(hx + 120, 140, 36, 28, windowWarm);
        // Alien's room - TV glow
        pr(hx + 240, 140, 36, 28, 0x1a2040);
        pr(hx + 250, 150, 16, 10, 0x2a3a6a);

        // === FIRST FLOOR — LAB WINDOWS ===
        pr(hx + 140, 220, 44, 36, windowGreen);
        pr(hx + 144, 224, 36, 28, windowGreenBright);
        pr(hx + 220, 220, 44, 36, windowGreen);
        pr(hx + 224, 224, 36, 28, windowGreenBright);

        // Front door
        pr(hx + 60, 216, 40, 84, 0x0e0820);
        pr(hx + 64, 220, 32, 76, 0x100a24);
        pr(hx + 84, 258, 4, 4, 0x2a2040); // knob
        pr(hx + 40, 296, 100, 8, 0x0a0616); // porch

        // === SIDE WING ===
        pr(hx + hw, 180, 120, 120, darker);
        pr(hx + hw + 20, 210, 32, 24, 0x0e1a10);

        // === TREES (symmetrical) ===
        const drawTree = (x, baseY, trunkCol, leafCol) => {
            pr(x, baseY, 16, 100, trunkCol);
            for (let ly = -60; ly < 20; ly += P) {
                const spread = 48 - Math.abs(ly + 20) * 1.2;
                if (spread > 0) {
                    pr(x + 8 - spread, baseY + ly, spread * 2, P, leafCol);
                }
            }
        };

        drawTree(120, 200, dark, darker);
        drawTree(240, 200, darker, dark);
        drawTree(340, 200, dark, darker);
        drawTree(920, 200, dark, darker);
        drawTree(1020, 200, darker, dark);
        drawTree(1140, 200, dark, darker);

        // === FENCES ===
        for (let fx = 20; fx < 380; fx += 28) {
            pr(fx, 268, 4, 36, darker);
            pr(fx - 2, 266, 8, 4, darker);
        }
        for (let fx = 900; fx < 1260; fx += 28) {
            pr(fx, 268, 4, 36, darker);
            pr(fx - 2, 266, 8, 4, darker);
        }
        pr(20, 278, 360, 4, darker);   // left rail
        pr(900, 278, 360, 4, darker);  // right rail

        // Earl's tall fence
        pr(880, 220, 8, 84, dark);
        pr(876, 216, 16, 8, dark);

        // Ground glow overlay
        const groundGlow = this.add.graphics().setDepth(6);
        for (let i = 0; i < 20; i++) {
            const alpha = 0.5 * (1 - i / 20) * 0.08;
            groundGlow.fillStyle(0x2d1b4e, alpha);
            groundGlow.fillRect(0, H - i * 4, W, 4);
        }
    }

    // ==========================================
    // PORTAL GLOW
    // ==========================================

    createPortalGlow(W, H) {
        const glowGfx = this.add.graphics().setDepth(7);
        
        // Draw a soft green glow near the lab windows
        this.drawRadialGlow(glowGfx, W * 0.52, H - 120, 80, 50, 0x39ff7f, 0.3);

        // Animate it pulsing
        this.tweens.add({
            targets: glowGfx,
            alpha: { from: 0.6, to: 1 },
            scaleX: { from: 1, to: 1.15 },
            scaleY: { from: 1, to: 1.15 },
            duration: 4000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.portalGlow = glowGfx;
    }

    // ==========================================
    // FLOATING PARTICLES
    // ==========================================

    createParticleSystem(W, H) {
        this.particleTimer = this.time.addEvent({
            delay: 800,
            callback: () => this.spawnParticle(W, H),
            loop: true,
        });
    }

    spawnParticle(W, H) {
        const size = Math.random() < 0.5 ? 2 : 4;
        const x = (0.48 + Math.random() * 0.12) * W;
        const y = H * (0.67 + Math.random() * 0.05);
        const duration = 4000 + Math.random() * 4000;

        const p = this.add.rectangle(x, y, size, size, 0x39ff7f, 0.15).setDepth(8);

        this.tweens.add({
            targets: p,
            y: y - 200,
            x: x + 20,
            alpha: { from: 0, to: 0.15 },
            duration: duration * 0.1,
            ease: 'Linear',
            onComplete: () => {
                this.tweens.add({
                    targets: p,
                    y: y - 200,
                    alpha: 0,
                    duration: duration * 0.1,
                    delay: duration * 0.8,
                    ease: 'Linear',
                    onComplete: () => p.destroy(),
                });
            },
        });

        // Main movement tween
        this.tweens.add({
            targets: p,
            y: y - 200,
            x: x + (Math.random() - 0.5) * 40,
            duration: duration,
            ease: 'Power1',
        });

        this.particles.push(p);
    }

    // ==========================================
    // VIGNETTE & SCANLINES
    // ==========================================

    createVignette(W, H) {
        // Approximate vignette with overlapping dark rectangles at edges
        const vig = this.add.graphics().setDepth(90);
        
        // Dark corners and edges
        const steps = 20;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const alpha = 0.7 * t * t; // quadratic falloff
            const inset = (1 - t) * Math.min(W, H) * 0.35;
            
            vig.fillStyle(0x05030a, alpha * 0.05);
            // Top
            vig.fillRect(0, 0, W, inset * 0.3);
            // Bottom
            vig.fillRect(0, H - inset * 0.3, W, inset * 0.3);
            // Left
            vig.fillRect(0, 0, inset * 0.4, H);
            // Right
            vig.fillRect(W - inset * 0.4, 0, inset * 0.4, H);
        }
    }

    createScanlines(W, H) {
        const scanGfx = this.add.graphics().setDepth(95);
        scanGfx.fillStyle(0x000000, 0.04); // very subtle
        for (let y = 0; y < H; y += 4) {
            scanGfx.fillRect(0, y + 2, W, 2);
        }
    }

    // ==========================================
    // TITLE TEXT
    // ==========================================

    createTitle(W, H) {
        const fontFamily = '"LucasArts SCUMM Solid", "Press Start 2P", cursive';
        const depth = 50;

        // "THE"
        this.add.text(W / 2, 80, 'THE', {
            fontFamily: fontFamily,
            fontSize: '18px',
            color: '#6b5a8a',
            letterSpacing: 14,
        }).setOrigin(0.5, 0).setDepth(depth);

        // "SANDWICH" (green, glowing)
        this.titleSandwich = this.add.text(W / 2, 110, 'SANDWICH', {
            fontFamily: fontFamily,
            fontSize: '42px',
            color: '#39ff7f',
            letterSpacing: 4,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#0d4a24',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5, 0).setDepth(depth);

        // Glow pulse on SANDWICH
        this.tweens.add({
            targets: this.titleSandwich,
            alpha: { from: 0.85, to: 1 },
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // "HORROR"
        this.add.text(W / 2, 165, 'HORROR', {
            fontFamily: fontFamily,
            fontSize: '42px',
            color: '#d4c8e8',
            letterSpacing: 4,
            shadow: {
                offsetX: 0,
                offsetY: 4,
                color: '#1a0d30',
                blur: 0,
                fill: true,
            },
        }).setOrigin(0.5, 0).setDepth(depth);

        // "PART 1"
        this.add.text(W / 2, 225, 'PART 1', {
            fontFamily: fontFamily,
            fontSize: '11px',
            color: '#6b5a8a',
            letterSpacing: 6,
        }).setOrigin(0.5, 0).setDepth(depth).setAlpha(0.7);
    }

    // ==========================================
    // CLICK PROMPT (audio unlock)
    // ==========================================

    createClickPrompt(W, H) {
        const fontFamily = '"LucasArts SCUMM Solid", "Press Start 2P", cursive';

        this.clickPrompt = this.add.text(W / 2, H - 240, 'CLICK ANYWHERE TO BEGIN', {
            fontFamily: fontFamily,
            fontSize: '13px',
            color: '#6b5a8a',
            letterSpacing: 4,
        }).setOrigin(0.5, 0.5).setDepth(100);

        // Pulsing animation
        this.tweens.add({
            targets: this.clickPrompt,
            alpha: { from: 0.4, to: 0.9 },
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Menu starts hidden
        if (this.menuContainer) {
            this.menuContainer.setAlpha(0);
        }

        // Click/tap anywhere to unlock audio and show menu
        this.input.once('pointerdown', () => {
            this.unlockAudioAndShowMenu();
        });

        // Also support any key press
        if (!this.isMobile) {
            this.input.keyboard.once('keydown', () => {
                this.unlockAudioAndShowMenu();
            });
        }
    }

    unlockAudioAndShowMenu() {
        if (this.menuActive) return;

        // Ensure AudioContext is unlocked
        if (this.sound.context && this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }

        // Start title music using TSH.Audio if available, otherwise direct Phaser audio
        if (typeof TSH !== 'undefined' && TSH.Audio && TSH.Audio.playMusic) {
            TSH.Audio.playMusic('title_theme', { channel: 'main', volume: 0.7, fade: 2000 });
        } else {
            // Fallback: direct Phaser audio
            try {
                this.titleMusic = this.sound.add('title_theme', { loop: true, volume: 0 });
                this.titleMusic.play();
                this.tweens.add({
                    targets: this.titleMusic,
                    volume: 0.7,
                    duration: 2000,
                    ease: 'Linear',
                });
            } catch (e) {
                console.warn('Could not play title music:', e);
            }
        }

        // Fade out click prompt
        this.tweens.add({
            targets: this.clickPrompt,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => this.clickPrompt.setVisible(false),
        });

        // Fade in menu
        this.tweens.add({
            targets: this.menuContainer,
            alpha: 1,
            duration: 800,
            delay: 300,
            ease: 'Power2',
        });

        this.menuActive = true;
    }

    // ==========================================
    // MENU
    // ==========================================

    createMenu(W, H, COLORS) {
        this.menuContainer = this.add.container(W / 2, 0).setDepth(80).setAlpha(0);

        const fontFamily = '"LucasArts SCUMM Solid", "Press Start 2P", cursive';
        const menuY = H - 180; // bottom-anchored like mockup
        const itemSpacing = 40;
        const items = [
            { label: 'NEW GAME',   enabled: true,  action: 'newGame' },
            { label: 'LOAD GAME',  enabled: false, action: 'loadGame' },
            { label: 'SETTINGS',   enabled: false, action: 'settings' },
            { label: 'CONTROLS',   enabled: false, action: 'controls' },
        ];

        // Calculate panel dimensions
        const panelW = 320;
        const panelH = items.length * itemSpacing + 80 + 50; // extra for fullscreen row + padding
        const panelY = menuY - panelH / 2 - 20;

        // Dark backdrop panel
        const panel = this.add.graphics();
        panel.fillStyle(COLORS.panelBg, 0.88);
        panel.fillRoundedRect(-panelW / 2, panelY, panelW, panelH, 2);
        panel.lineStyle(1, COLORS.panelBorder, 0.3);
        panel.strokeRoundedRect(-panelW / 2, panelY, panelW, panelH, 2);
        this.menuContainer.add(panel);

        // Menu items
        let currentY = panelY + 28;

        items.forEach((item, index) => {
            const color = item.enabled ? COLORS.textDim : COLORS.textDisabled;

            // Cursor arrow (hidden by default)
            const cursor = this.add.text(-110, currentY, '▸', {
                fontFamily: fontFamily,
                fontSize: '16px',
                color: '#39ff7f',
            }).setOrigin(0, 0.5).setAlpha(0);

            // Label
            const label = this.add.text(0, currentY, item.label, {
                fontFamily: fontFamily,
                fontSize: '16px',
                color: color,
                letterSpacing: 2,
            }).setOrigin(0.5, 0.5);

            this.menuContainer.add(cursor);
            this.menuContainer.add(label);

            const menuItem = {
                label: label,
                cursor: cursor,
                enabled: item.enabled,
                action: item.action,
                baseColor: color,
            };
            this.menuItems.push(menuItem);

            // Interactive hit area for enabled items
            if (item.enabled) {
                const hitZone = this.add.rectangle(0, currentY, panelW - 20, itemSpacing, 0x000000, 0)
                    .setInteractive({ useHandCursor: true });
                this.menuContainer.add(hitZone);

                hitZone.on('pointerover', () => {
                    this.selectedIndex = index;
                    this.updateMenuHighlight();
                });
                hitZone.on('pointerout', () => {
                    this.updateMenuHighlight();
                });
                hitZone.on('pointerdown', () => {
                    this.selectMenuItem();
                });
            }

            currentY += itemSpacing;
        });

        // === FULLSCREEN CHECKBOX ===
        const fsY = currentY + 10;

        // Checkbox box
        const checkbox = this.add.graphics();
        this.drawCheckbox(checkbox, false);
        checkbox.setPosition(-70, fsY);
        this.menuContainer.add(checkbox);

        // Checkbox label
        const fsLabel = this.add.text(-48, fsY, 'FULLSCREEN', {
            fontFamily: fontFamily,
            fontSize: '12px',
            color: COLORS.textDim,
            letterSpacing: 2,
        }).setOrigin(0, 0.5);
        this.menuContainer.add(fsLabel);

        // Fullscreen hit area
        const fsHit = this.add.rectangle(0, fsY, panelW - 20, 36, 0x000000, 0)
            .setInteractive({ useHandCursor: true });
        this.menuContainer.add(fsHit);

        this.isFullscreen = false;
        this.fsCheckbox = checkbox;
        this.fsLabel = fsLabel;

        fsHit.on('pointerdown', () => {
            this.toggleFullscreen();
        });

        // Listen for fullscreen changes (user may press Escape)
        this.scale.on('enterfullscreen', () => {
            this.isFullscreen = true;
            this.drawCheckbox(this.fsCheckbox, true);
        });
        this.scale.on('leavefullscreen', () => {
            this.isFullscreen = false;
            this.drawCheckbox(this.fsCheckbox, false);
        });

        // Set initial highlight
        this.updateMenuHighlight();
    }

    drawCheckbox(gfx, checked) {
        gfx.clear();
        // Border
        gfx.lineStyle(2, 0x6b5a8a, 1);
        gfx.strokeRect(-8, -8, 16, 16);
        // Check mark
        if (checked) {
            gfx.fillStyle(0x39ff7f, 1);
            gfx.fillRect(-4, -4, 8, 8);
        }
    }

    toggleFullscreen() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    }

    // ==========================================
    // MENU NAVIGATION
    // ==========================================

    navigateMenu(direction) {
        if (!this.menuActive || this.isTransitioning) return;

        // Find next enabled item
        let newIndex = this.selectedIndex;
        const count = this.menuItems.length;

        do {
            newIndex = (newIndex + direction + count) % count;
        } while (!this.menuItems[newIndex].enabled && newIndex !== this.selectedIndex);

        if (this.menuItems[newIndex].enabled) {
            this.selectedIndex = newIndex;
            this.updateMenuHighlight();
        }
    }

    updateMenuHighlight() {
        this.menuItems.forEach((item, index) => {
            if (!item.enabled) return;

            const isSelected = index === this.selectedIndex;
            if (isSelected) {
                // Primary (New Game) highlights green, others highlight white
                const highlightColor = item.action === 'newGame' ? '#39ff7f' : '#ffffff';
                item.label.setColor(highlightColor);
                item.cursor.setAlpha(1);
            } else {
                item.label.setColor(item.baseColor);
                item.cursor.setAlpha(0);
            }
        });
    }

    selectMenuItem() {
        if (!this.menuActive || this.isTransitioning) return;

        const item = this.menuItems[this.selectedIndex];
        if (!item || !item.enabled) return;

        switch (item.action) {
            case 'newGame':
                this.startNewGame();
                break;
            case 'loadGame':
                // TODO: Open load game menu
                break;
            case 'settings':
                // TODO: Open settings
                break;
            case 'controls':
                // TODO: Open controls screen
                break;
        }
    }

    // ==========================================
    // NEW GAME TRANSITION
    // ==========================================

    startNewGame() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;

        // --- Step 1: Immediate button feedback — turn label white ---
        const selectedItem = this.menuItems[this.selectedIndex];
        if (selectedItem) {
            selectedItem.label.setColor('#ffffff');
            if (selectedItem.cursor) selectedItem.cursor.setAlpha(0);
        }

        // --- Step 2: Brief pause, then fade music + camera to black together ---
        this.time.delayedCall(400, () => {
            // Fade out music
            if (typeof TSH !== 'undefined' && TSH.Audio && TSH.Audio.stopAllMusic) {
                TSH.Audio.stopAllMusic({ fade: 1500 });
            } else if (this.titleMusic) {
                this.tweens.add({
                    targets: this.titleMusic,
                    volume: 0,
                    duration: 1500,
                    ease: 'Linear',
                    onComplete: () => this.titleMusic.stop(),
                });
            }

            // Camera fade to black
            this.cameras.main.fadeOut(1500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                // --- Step 3: Hold black briefly, then hand off to RoomScene ---
                this.time.delayedCall(300, () => {
                    if (this.particleTimer) {
                        this.particleTimer.destroy();
                    }

                    // Reset game state for a clean new game
                    if (typeof TSH !== 'undefined' && TSH.State) {
                        TSH.State.init();
                    }

                    // Transition to the first room.
                    // RoomScene.create() calls cameras.main.fadeIn(500) to reveal from black.
                    this.scene.start('RoomScene', { roomId: 'laboratory' });
                });
            });
        });
    }

    // ==========================================
    // CLEANUP
    // ==========================================

    shutdown() {
        // Clean up tweens and timers
        if (this.particleTimer) {
            this.particleTimer.destroy();
        }
        this.stars = [];
        this.particles = [];
        this.menuItems = [];
    }
}
