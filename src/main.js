// Plains of Shinar - Character Walking Game
class Game {
    constructor() {
        this.app = null;
        this.character = null;
        this.background = null;
        this.isMoving = false;
        this.targetX = 0;
        this.targetY = 0;
        this.moveSpeed = 2;
        this.animations = {};
        this.currentAnimation = 'idle';
        this.facingDirection = 0; // 0 degrees facing right
        
        this.init().catch(error => {
            console.error('Game initialization failed:', error);
        });
    }

    async init() {
        // Create PIXI application
        this.app = new PIXI.Application();
        
        // Initialize the application
        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x228B22,
            antialias: true
        });

        document.body.appendChild(this.app.canvas);

        // Load background
        await this.loadBackground();
        
        // Load character animations
        await this.loadCharacterAnimations();
        
        // Create character sprite
        this.createCharacter();
        
        // Setup click interaction
        this.setupInteraction();
        
        // Start game loop
        this.app.ticker.add(() => this.update());
    }

    async loadBackground() {
        try {
            const backgroundTexture = await PIXI.Assets.load('./background.png');
            this.background = new PIXI.Sprite(backgroundTexture);
            
            // Scale background to fit screen while maintaining aspect ratio
            const scaleX = this.app.screen.width / this.background.width;
            const scaleY = this.app.screen.height / this.background.height;
            const scale = Math.max(scaleX, scaleY);
            
            this.background.scale.set(scale);
            this.background.x = (this.app.screen.width - this.background.width * scale) / 2;
            this.background.y = (this.app.screen.height - this.background.height * scale) / 2;
            
            this.app.stage.addChild(this.background);
        } catch (error) {
            console.error('Error loading background:', error);
            // Create a simple colored background as fallback
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, this.app.screen.width, this.app.screen.height);
            graphics.fill(0x228B22);
            this.app.stage.addChild(graphics);
        }
    }

    async loadCharacterAnimations() {
        try {
            console.log('Loading character animations...');
            
            // Load the sprite sheet JSON files - this automatically loads the associated PNG files
            await PIXI.Assets.load([
                './spritesheets/man_walk_model/man_walk_model-0.json',
                './spritesheets/man_idle_model/man_idle_model-0.json'
            ]);
            
            // Get the animations from the cache
            const walkSheet = PIXI.Assets.cache.get('./spritesheets/man_walk_model/man_walk_model-0.json');
            const idleSheet = PIXI.Assets.cache.get('./spritesheets/man_idle_model/man_idle_model-0.json');
            
            console.log('Walk sheet animations:', Object.keys(walkSheet.data.animations || {}));
            console.log('Idle sheet animations:', Object.keys(idleSheet.data.animations || {}));
            
            // Store the animations - looking for the "0" angle animations
            this.animations = {};
            
            if (walkSheet.data.animations && walkSheet.data.animations["0"]) {
                this.animations.walk = walkSheet.data.animations["0"];
                console.log('Walk animation loaded with', this.animations.walk.length, 'frames');
            }
            
            if (idleSheet.data.animations && idleSheet.data.animations["0"]) {
                this.animations.idle = idleSheet.data.animations["0"];
                console.log('Idle animation loaded with', this.animations.idle.length, 'frames');
            }
            
            // If no "0" angle, try to find any available animation
            if (!this.animations.walk && walkSheet.data.animations) {
                const firstWalkAnim = Object.keys(walkSheet.data.animations)[0];
                if (firstWalkAnim) {
                    this.animations.walk = walkSheet.data.animations[firstWalkAnim];
                    console.log('Using first available walk animation:', firstWalkAnim);
                }
            }
            
            if (!this.animations.idle && idleSheet.data.animations) {
                const firstIdleAnim = Object.keys(idleSheet.data.animations)[0];
                if (firstIdleAnim) {
                    this.animations.idle = idleSheet.data.animations[firstIdleAnim];
                    console.log('Using first available idle animation:', firstIdleAnim);
                }
            }
            
        } catch (error) {
            console.error('Error loading animations:', error);
            this.createFallbackCharacter();
        }
    }

    createFallbackCharacter() {
        // Create a simple colored rectangle as fallback
        const graphics = new PIXI.Graphics();
        graphics.rect(0, 0, 40, 60);
        graphics.fill(0x3498db);
        
        const texture = this.app.renderer.generateTexture(graphics);
        this.character = new PIXI.Sprite(texture);
        this.character.anchor.set(0.5, 1);
        this.character.x = this.app.screen.width / 2;
        this.character.y = this.app.screen.height / 2;
        
        this.app.stage.addChild(this.character);
    }

    createCharacter() {
        if (this.animations.idle && this.animations.idle.length > 0) {
            console.log('Creating animated character with', this.animations.idle.length, 'idle frames');
            
            // Create animated sprite using the proper PIXI.js API
            this.character = PIXI.AnimatedSprite.fromFrames(this.animations.idle);
            this.character.anchor.set(0.5, 1);
            this.character.animationSpeed = 1/6; // 6 fps as recommended in documentation
            this.character.play();
            
            // Scale down the character to a reasonable size
            this.character.scale.set(0.3);
            
            // Position in center
            this.character.x = this.app.screen.width / 2;
            this.character.y = this.app.screen.height / 2;
            
            this.app.stage.addChild(this.character);
            
        } else if (this.animations.walk && this.animations.walk.length > 0) {
            console.log('No idle animation, using walk animation with', this.animations.walk.length, 'frames');
            
            // Use walk animation if idle is not available
            this.character = PIXI.AnimatedSprite.fromFrames(this.animations.walk);
            this.character.anchor.set(0.5, 1);
            this.character.animationSpeed = 1/6; // 6 fps
            this.character.play();
            
            // Scale down the character to a reasonable size
            this.character.scale.set(0.3);
            
            // Position in center
            this.character.x = this.app.screen.width / 2;
            this.character.y = this.app.screen.height / 2;
            
            this.app.stage.addChild(this.character);
            
        } else {
            console.log('No animations available, creating fallback character');
            this.createFallbackCharacter();
        }
    }

    setupInteraction() {
        // Make the stage interactive
        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = new PIXI.Rectangle(0, 0, this.app.screen.width, this.app.screen.height);
        
        // Add click/tap event listener
        this.app.stage.on('pointerdown', (event) => {
            const position = event.global;
            this.moveCharacterTo(position.x, position.y);
        });
    }

    moveCharacterTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
        
        // Calculate direction for character facing
        const deltaX = x - this.character.x;
        const deltaY = y - this.character.y;
        this.facingDirection = Math.atan2(deltaY, deltaX);
        
        // Flip character if moving left
        if (deltaX < 0) {
            this.character.scale.x = -Math.abs(this.character.scale.x);
        } else {
            this.character.scale.x = Math.abs(this.character.scale.x);
        }
        
        // Switch to walk animation
        this.setAnimation('walk');
    }

    setAnimation(animationName) {
        if (this.currentAnimation === animationName) return;
        if (!this.animations[animationName]) return;
        
        this.currentAnimation = animationName;
        
        if (this.character && this.character instanceof PIXI.AnimatedSprite) {
            // Create a new AnimatedSprite with the new animation frames
            const newAnimation = PIXI.AnimatedSprite.fromFrames(this.animations[animationName]);
            
            // Copy properties from the old character
            newAnimation.anchor.copyFrom(this.character.anchor);
            newAnimation.position.copyFrom(this.character.position);
            newAnimation.scale.copyFrom(this.character.scale);
            newAnimation.animationSpeed = 1/6; // 6 fps
            newAnimation.play();
            
            // Replace the old character
            this.app.stage.removeChild(this.character);
            this.character = newAnimation;
            this.app.stage.addChild(this.character);
        }
    }

    update() {
        if (!this.character) return;
        
        if (this.isMoving) {
            const deltaX = this.targetX - this.character.x;
            const deltaY = this.targetY - this.character.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance < this.moveSpeed) {
                // Reached target
                this.character.x = this.targetX;
                this.character.y = this.targetY;
                this.isMoving = false;
                this.setAnimation('idle');
            } else {
                // Move towards target
                const moveX = (deltaX / distance) * this.moveSpeed;
                const moveY = (deltaY / distance) * this.moveSpeed;
                
                this.character.x += moveX;
                this.character.y += moveY;
            }
        }
        
        // Keep character within screen bounds
        const margin = 50;
        this.character.x = Math.max(margin, Math.min(this.app.screen.width - margin, this.character.x));
        this.character.y = Math.max(margin, Math.min(this.app.screen.height - margin, this.character.y));
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    if (window.game && window.game.app) {
        window.game.app.renderer.resize(window.innerWidth, window.innerHeight);
        
        // Update background scaling
        if (window.game.background) {
            const scaleX = window.innerWidth / window.game.background.texture.width;
            const scaleY = window.innerHeight / window.game.background.texture.height;
            const scale = Math.max(scaleX, scaleY);
            
            window.game.background.scale.set(scale);
            window.game.background.x = (window.innerWidth - window.game.background.width * scale) / 2;
            window.game.background.y = (window.innerHeight - window.game.background.height * scale) / 2;
        }
        
        // Update stage hit area
        if (window.game.app.stage) {
            window.game.app.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
        }
    }
});

// Start the game when the page loads
window.addEventListener('load', async () => {
    try {
        console.log('Starting Plains of Shinar game...');
        window.game = new Game();
    } catch (error) {
        console.error('Failed to start game:', error);
    }
});