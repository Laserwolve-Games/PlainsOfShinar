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
        this.currentDirection = '0'; // Current facing direction as string
        this.facingDirection = 0; // 0 degrees facing right
        
        // Available directions in the spritesheets (16 directions)
        this.directions = [
            '0', '22.5', '45', '67.5', '90', '112.5', '135', '157.5',
            '180', '-157.5', '-135', '-112.5', '-90', '-67.5', '-45', '-22.5'
        ];
        
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
            
            // First try to load just the basic files we know work
            await PIXI.Assets.load([
                './spritesheets/man_walk_model/man_walk_model-0.json',
                './spritesheets/man_idle_model/man_idle_model-0.json'
            ]);
            
            // Get the animations from the cache
            const walkSheet = PIXI.Assets.cache.get('./spritesheets/man_walk_model/man_walk_model-0.json');
            const idleSheet = PIXI.Assets.cache.get('./spritesheets/man_idle_model/man_idle_model-0.json');
            
            console.log('Walk sheet loaded:', !!walkSheet);
            console.log('Idle sheet loaded:', !!idleSheet);
            
            if (walkSheet && walkSheet.data && walkSheet.data.animations) {
                console.log('Walk sheet animations:', Object.keys(walkSheet.data.animations));
            }
            if (idleSheet && idleSheet.data && idleSheet.data.animations) {
                console.log('Idle sheet animations:', Object.keys(idleSheet.data.animations));
            }
            
            // Initialize animations structure
            this.animations = {
                walk: {},
                idle: {}
            };
            
            // Store the directional animations
            if (walkSheet && walkSheet.data && walkSheet.data.animations) {
                this.animations.walk = walkSheet.data.animations;
            }
            
            if (idleSheet && idleSheet.data && idleSheet.data.animations) {
                this.animations.idle = idleSheet.data.animations;
            }
            
            console.log('Final walk directions loaded:', Object.keys(this.animations.walk));
            console.log('Final idle directions loaded:', Object.keys(this.animations.idle));
            
        } catch (error) {
            console.error('Error loading animations:', error);
            this.animations = {
                walk: {},
                idle: {}
            };
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
        console.log('Creating character...');
        console.log('Available animations:', this.animations);
        
        if (this.animations.idle && this.animations.idle['0']) {
            console.log('Creating animated character with idle animations');
            console.log('Idle frames for direction 0:', this.animations.idle['0'].length);
            
            // Create animated sprite using the default direction (0 degrees)
            this.character = PIXI.AnimatedSprite.fromFrames(this.animations.idle['0']);
            this.character.anchor.set(0.5, 1);
            this.character.animationSpeed = 1/6; // 6 fps as recommended in documentation
            this.character.play();
            
            // Scale down the character to a reasonable size
            this.character.scale.set(0.3);
            
            // Position in center
            this.character.x = this.app.screen.width / 2;
            this.character.y = this.app.screen.height / 2;
            
            this.app.stage.addChild(this.character);
            
        } else if (this.animations.walk && this.animations.walk['0']) {
            console.log('No idle animation, using walk animation');
            console.log('Walk frames for direction 0:', this.animations.walk['0'].length);
            
            // Use walk animation if idle is not available
            this.character = PIXI.AnimatedSprite.fromFrames(this.animations.walk['0']);
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
            console.log('Idle animations available:', Object.keys(this.animations.idle || {}));
            console.log('Walk animations available:', Object.keys(this.animations.walk || {}));
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

    // Convert radians to degrees
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    // Find the closest direction from the available directions
    getClosestDirection(angleInDegrees) {
        // Normalize angle to -180 to 180 range
        while (angleInDegrees > 180) angleInDegrees -= 360;
        while (angleInDegrees < -180) angleInDegrees += 360;

        let closestDirection = '0';
        let smallestDifference = Infinity;

        for (const direction of this.directions) {
            const directionAngle = parseFloat(direction);
            let difference = Math.abs(angleInDegrees - directionAngle);
            
            // Handle the wrap-around case (e.g., difference between 180 and -180)
            if (difference > 180) {
                difference = 360 - difference;
            }

            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestDirection = direction;
            }
        }

        return closestDirection;
    }

    moveCharacterTo(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;
        
        // Calculate direction for character facing
        const deltaX = x - this.character.x;
        const deltaY = y - this.character.y;
        this.facingDirection = Math.atan2(deltaY, deltaX);
        
        // Convert to degrees and find closest sprite direction
        const angleInDegrees = this.radiansToDegrees(this.facingDirection);
        this.currentDirection = this.getClosestDirection(angleInDegrees);
        
        console.log(`Moving to angle: ${angleInDegrees.toFixed(1)}°, using direction: ${this.currentDirection}`);
        
        // Switch to walk animation with the correct direction
        this.setAnimation('walk', this.currentDirection);
    }

    setAnimation(animationName, direction = null) {
        // Use current direction if none specified
        if (!direction) {
            direction = this.currentDirection;
        }
        
        // Check if we're already using this animation and direction
        if (this.currentAnimation === animationName && this.currentDirection === direction) {
            return;
        }
        
        // Check if the animation and direction exist
        if (!this.animations[animationName] || !this.animations[animationName][direction]) {
            console.warn(`Animation ${animationName} direction ${direction} not found`);
            return;
        }
        
        this.currentAnimation = animationName;
        this.currentDirection = direction;
        
        if (this.character && this.character instanceof PIXI.AnimatedSprite) {
            // Create a new AnimatedSprite with the new animation frames
            const newAnimation = PIXI.AnimatedSprite.fromFrames(this.animations[animationName][direction]);
            
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
                this.setAnimation('idle', this.currentDirection);
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