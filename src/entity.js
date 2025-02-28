import PlainsOfShinar from './globals.js';
// import PIXI from './pixi.js';

// Can't extend PIXI.Container: https://github.com/Laserwolve-Games/PlainsOfShinar/discussions/3
// Can't extend PIXI.Graphics because we need this.anchor
export default class Entity extends PIXI.Sprite {

    constructor(set, name, animation, size, x, y, isAnimated, initialFacing = 0) {

        super();

        // this.visible = false;
        this.animations = [];
        this.body = null; // stores the current animation
        this.shadow = null; // stores the current shadow
        this.label = name;
        this.width = size;
        this.height = this.width / 2;
        this.position.set(x, y);
        this.set = set;

        const isometricDiamond = [
            0, -this.height / 2,
            this.width / 2, 0,
            0, this.height / 2,
            -this.width / 2, 0
        ];
        const randomColor = Math.floor(Math.random() * 16777215);
        const graphic = new PIXI.Graphics().poly(isometricDiamond).fill(randomColor);

        // Set the texture here instead of in the constructor so we can use this.height/width
        this.texture = PlainsOfShinar.app.renderer.generateTexture(graphic, 'nearest', 1);
        this.facing = initialFacing;
        this.actualFacing = initialFacing;
        this.targetPosition = this.position;
        this.speed = 0;
        this.anchor.set(.5);

        PlainsOfShinar.app.stage.addChild(this);

        // The paths to all files for this set
        const jsonPaths = PlainsOfShinar.manifest[this.set];

        (async () => {

            for (const animation of jsonPaths) await PlainsOfShinar.loadAsset(animation);

            if (isAnimated) {

                // For animated entities, the first JSON file is animation data
                const animationData = PIXI.Assets.cache.get(jsonPaths[0]).data.animations;

                for (let i = 0; i < Object.keys(animationData).length; i++) {

                    // fromFrames pulls from the Pixi cache
                    const animation = PIXI.AnimatedSprite.fromFrames(animationData[Object.keys(animationData)[i]]);

                    animation.label = Object.keys(animationData)[i];
                    animation.updateAnchor = true;
                    animation.interactive = false;

                    this.animations.push(animation);
                }
                PlainsOfShinar.app.stage.addChild(this);

                this.setAnimation(animation);

                PlainsOfShinar.entities.push(this);
            }
            else {

                // Don't call this.setAnimation() because it's not animated
                // Just set everything once here
                this.body = PIXI.Sprite.from(this.label + '_default_90_000');
                this.shadow = PIXI.Sprite.from('shadow_' + this.label + '_default_90_000');

                this.body.label = 'default';
                this.body.updateAnchor = true;
                this.body.interactive = false;

                PlainsOfShinar.app.stage.addChild(this.body);
                PlainsOfShinar.app.stage.addChild(this.shadow);

                PlainsOfShinar.entities.push(this);
            }
        })();
    }
    setAnimation = (animation, playFromBeginning = true) => {

        let startFrame = 0;

        animation = this.label + '_' + animation + '_' + this.facing;

        // If the current animation is the same as the new one...
        if (this?.body?.label === animation) {

            // Check if we should restart it or not...
            if (playFromBeginning) this.body.currentFrame = startFrame;

            // then exit
            return;
        }
        // If a body exists, save its current frame, then remove it and its shadow from the stage
        if (this.body) {

            if (!playFromBeginning) startFrame = this.body.currentFrame;

            this.body.stop();

            PlainsOfShinar.app.stage.removeChild(this.body);
            PlainsOfShinar.app.stage.removeChild(this.shadow);
        }
        // set body to the specified animation     
        this.body = this.animations.find(a => a.label === animation);

        this.shadow = this.animations.find(a => a.label === 'shadow_' + animation);

        // add the body and its shadow to the stage and set all necessary properties
        PlainsOfShinar.app.stage.addChild(this.body);
        PlainsOfShinar.app.stage.addChild(this.shadow);

        this.body.currentFrame = startFrame;
        this.body.animationSpeed = .5;

        this.body.play();
    }
    /**
     * Keeps bodies, shadows, and (soon) gear in sync with their entities.
     * @author Andrew Rogers
     */
    sync = () => {

        this.collisionBox = [
            this.position.x, this.position.y - this.height / 2,
            this.position.x + this.width / 2, this.position.y,
            this.position.x, this.position.y + this.height / 2,
            this.position.x - this.width / 2, this.position.y
        ];

        this.body.position.set(this.position.x, this.position.y);
        this.shadow.position.set(this.body.position.x, this.body.position.y);

        this.shadow.currentFrame = this.body.currentFrame;
    }
    moveTo = (x, y) => {

        this.targetPosition = { x, y };
    }
    calculateFacing = (x1, y1, x2, y2) => {

        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        this.actualFacing = angleInDegrees;

        // + 0 prevents negative 0
        let facing = Math.round(angleInDegrees / 22.5) * 22.5 + 0;

        if (facing == -180) facing = 180;

        this.facing = facing;
    }
    handleMovement = () => {

        if (this.targetPosition !== this.position) {

            const dx = this.targetPosition.x - this.position.x;
            const dy = this.targetPosition.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            this.actualSpeed = PlainsOfShinar.isometrify(this.speed, this.actualFacing);

            if (distance > this.actualSpeed) {

                /*
                 TODO: Issues with this system:
                 Theoretically, the faster an entity moves, the further away it'll stop from other entities.
                 Also the age-old problem of an entity moving fast enough that it's collision polygon would
                 completely jump over another entity's collision polygon in a single tick.
                 */
                const nextX = this.position.x + (dx / distance) * this.actualSpeed;
                const nextY = this.position.y + (dy / distance) * this.actualSpeed;

                const nextCollisionBox = [
                    nextX, nextY - this.height / 2,
                    nextX + this.width / 2, nextY,
                    nextX, nextY + this.height / 2,
                    nextX - this.width / 2, nextY
                ];

                for (const entity of PlainsOfShinar.entities) {

                    // TODO: optimize this because right now it'll check every moving entity against every other entity everywhere
                    if (entity !== this && PlainsOfShinar.collisionCheck(nextCollisionBox, entity.collisionBox)) {

                        // TODO: this is still firing when one entity 'grinds' into another;
                        // i.e. the entity is not moving but the engine thinks it is repeatedly colliding
                        console.log(this.label + ' collided with entity:', entity.label);

                        this.isMoving = false;
                        this.targetPosition = this.position;
                        return;
                    }
                }

                this.isMoving = true;

                this.position.x = nextX;
                this.position.y = nextY;

            } else {

                this.isMoving = false;

                this.targetPosition = this.position;
            }
        }

    }
    handleMovementAnimations = () => {

        if (this.isMoving) {

            this.calculateFacing(this.position.x, this.position.y, this.targetPosition.x, this.targetPosition.y);

            // If the entity already was walking, play from the current frame...
            if (this.body.label.includes('walk')) this.setAnimation('walk', false);

            // ...otherwise, start from the beginning
            else this.setAnimation('walk');

            // if the walk animation is playing but the entity isn't moving, set the animation to idle
        } else if (this.body.label.includes('walk')) this.setAnimation('idle');
    }
    /**
     * Sort entities by their Y position to determine the zIndex of their bodies and shadows.
     * @author Andrew Rogers
     */
    static sort() {

        PlainsOfShinar.entities.sort((a, b) => a.position.y - b.position.y).forEach((entity, index) => {

            // The background lives at zIndex 0, so we need plus 1
            entity.body.zIndex = 1 + index * 2;
            entity.shadow.zIndex = 1 + index * 2 - 1;
        });
    }
}