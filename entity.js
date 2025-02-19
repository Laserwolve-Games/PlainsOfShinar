import { app, loadAsset, entities } from './globals.js';

export default class Entity extends PIXI.Sprite {

    constructor(name, animation, size, x, y, facing) {

        super(PIXI.Texture.WHITE);

        // this.visible = false;
        this.animations = [];
        this.body = null; // stores the current animation
        this.label = name;
        this.width = size;
        this.height = this.width / 2;
        this.position.set(x, y);
        this.facing = facing;
        this.actualFacing = facing;
        this.targetPosition = this.position;
        this.speed = 0;
        this.anchor.set(.5);
        this.bodySpritesheet = 'spritesheets/' + this.label + '.json';
        this.shadowSpritesheet = 'spritesheets/' + this.label + '_shadow.json';

        (async () => {
            await loadAsset(this.bodySpritesheet);
            await loadAsset(this.shadowSpritesheet);

            const bodyAnimations = PIXI.Assets.cache.get(this.bodySpritesheet).data.animations;
            const shadowAnimations = PIXI.Assets.cache.get(this.shadowSpritesheet).data.animations;

            for (let i = 0; i < Object.keys(bodyAnimations).length; i++) {

                const animation = PIXI.AnimatedSprite.fromFrames(bodyAnimations[Object.keys(bodyAnimations)[i]]);
                const shadow = PIXI.AnimatedSprite.fromFrames(shadowAnimations[Object.keys(shadowAnimations)[i]]);

                animation.label = Object.keys(bodyAnimations)[i];
                animation.updateAnchor = true;

                shadow.label = Object.keys(shadowAnimations)[i];
                shadow.updateAnchor = animation.updateAnchor;

                animation.shadow = shadow;

                this.animations.push(animation);
            }
            app.stage.addChild(this);

            this.setAnimation(animation);

            entities.push(this);
        })();
    }
    setAnimation = (animation = 'default', playFromBeginning = true) => {

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

            app.stage.removeChild(this.body);
            app.stage.removeChild(this.body.shadow);
        }
        // set body to the specified animation     
        this.body = this.animations.find(a => a.label === animation);

        // add the body and its shadow to the stage and set all necessary properties
        app.stage.addChild(this.body);
        app.stage.addChild(this.body.shadow);

        this.body.currentFrame = startFrame;
        this.body.animationSpeed = .5;

        this.body.play();
        this.body.shadow.play();
    }
    /**
     * Keeps bodies, shadows, and (soon) gear in sync with their entities.
     * @author Andrew Rogers
     */
    sync = () => {

        this.body.position.set(this.position.x, this.position.y);
        this.body.shadow.position.set(this.body.position.x, this.body.position.y);

        this.body.shadow.animationSpeed = this.body.animationSpeed;
        this.body.shadow.currentFrame = this.body.currentFrame;
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
}