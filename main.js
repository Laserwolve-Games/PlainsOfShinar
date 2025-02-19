// Intellisense doesn't work unless we use node.js/npm.
// This doesn't work: /// <reference path='./pixi.js' />
// Neither does a jsconfig.json file, or a global.d.ts file.
// We've asked for help in  this issue: https://github.com/pixijs/pixijs/discussions/11280
// Unfortunately the only solution we have found is toggling this line:
// import * as PIXI from './pixi.js';

let app = null;
let entities = [];

(async () => {
    app = new PIXI.Application();
    await app.init({ width: 1920, height: 1080, renderer: new PIXI.WebGPURenderer() });

    document.body.appendChild(app.canvas);

    await loadAsset('background.png');

    const backgroundTexture = PIXI.Texture.from('background.png');

    const background = new PIXI.TilingSprite({ texture: backgroundTexture, width: app.canvas.width, height: app.canvas.height });

    background.tileScale.y = .33;
    background.tileTransform.rotation = .66;
    app.stage.addChild(background);

    app.stage.scale.x = app.canvas.width / background.width;
    app.stage.scale.y = app.canvas.height / background.height;

    const player = new Player();

    let PointerIsDown = false;
    let mouseX = 0;
    let mouseY = 0;

    app.canvas.addEventListener('pointermove', (event) => {
        const rect = app.canvas.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / app.stage.scale.x;
        mouseY = (event.clientY - rect.top) / app.stage.scale.y;
    });

    app.canvas.addEventListener('pointerdown', () => PointerIsDown = true);
    app.canvas.addEventListener('pointerup', () => PointerIsDown = false);

    // stuff that runs every tick
    app.ticker.add(() => {

        // TODO: Think about setting the entity to the width of its body,
        // and maybe making it an oval and adjusting its angle.
        // player.body.position.set(player.position.x, player.position.y);

        if (PointerIsDown) player.moveTo(mouseX, mouseY);

        // every tick, for every entity
        entities.forEach(entity => {

            // entity movement
            if (entity.targetPosition !== entity.position) {

                const dx = entity.targetPosition.x - entity.position.x;
                const dy = entity.targetPosition.y - entity.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                entity.actualSpeed = isometrify(entity.speed, entity.actualFacing);

                if (distance > entity.actualSpeed) {

                    entity.isMoving = true;

                    entity.position.x += (dx / distance) * entity.actualSpeed;
                    entity.position.y += (dy / distance) * entity.actualSpeed;

                } else {

                    entity.isMoving = false;

                    entity.targetPosition = entity.position;
                }
            }
            if (entity.isMoving) {

                entity.calculateFacing(entity.position.x, entity.position.y, entity.targetPosition.x, entity.targetPosition.y);

                // If the entity already was walking, play from the current frame...
                if (entity.body.label.includes('walk')) entity.setAnimation('walk', false);

                // ...otherwise, start from the beginning
                else entity.setAnimation('walk');

                // if the walk animation is playing but the entity isn't moving, set the animation to idle
            } else if (entity.body.label.includes('walk')) entity.setAnimation('idle');

            entity.sync();
        });
    });
})();
class Entity extends PIXI.Sprite {

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
class Player extends Entity {

    constructor() {

        super('man', 'idle', 50, 150, 300, 90);

        this.speed = 5;
    }
}
const loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}
const isometrify = (value, angle) => value * lerp(.5, 1, Math.abs(Math.abs(angle) - 90) / 90);

const lerp = (a, b, x) => a + x * (b - a);