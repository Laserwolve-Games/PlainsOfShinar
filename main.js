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

    // const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;

    const backgroundTexture = PIXI.Texture.from('background.png');

    const background = new PIXI.TilingSprite({texture: backgroundTexture, width: app.canvas.width, height: app.canvas.height });

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

                // If the entity already was walking, play from the current frame, otherwise start from the beginning
                if (entity.body.animation.includes('walk')) entity.setAnimation('walk', false);
                else entity.setAnimation('walk', true);

            } else entity.setAnimation('idle', true);

            // keep bodies on top of their entities
            entity.body.position.set(entity.position.x, entity.position.y);
            entity.body.shadow.position.set(entity.position.x, entity.position.y);
        });
    });
})();
class Entity extends PIXI.Sprite {

    constructor(name, animation, size, x, y, facing) {

        super(PIXI.Texture.WHITE);

        // this.visible = false;
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

        this.init(animation);
    }
    init = async (animation) => {

        await loadAsset(this.bodySpritesheet);
        await loadAsset(this.shadowSpritesheet);

        this.setAnimation(animation, true);

        app.stage.addChild(this);

        entities.push(this);
    }
    moveTo = (x, y) => {

        this.targetPosition = { x, y };
    }
    setAnimation = (animation, playFromBeginning) => {

        // Add the extra necessary animation information
        animation = this.label + '_' + animation + '_' + this.facing;

        // Don't set the animation if the new one is the same as the current one
        if (this.body?.animation != animation) {

            // Save the current frame of the current animation before destroying it,
            // to use if playFromBeginning is false
            let savedFrame;

            // Get rid of the current wrong animation, if there is one
            if (this.body) {

                if (!playFromBeginning) savedFrame = this.body.currentFrame;

                // Get rid of the shadow, if there is one
                if (this.body.shadow) {

                    app.stage.removeChild(this.body.shadow);

                    this.body.shadow.destroy();
                }
                app.stage.removeChild(this.body);

                this.body.destroy();
            }
            this.body = PIXI.AnimatedSprite.fromFrames(PIXI.Assets.cache.get(this.bodySpritesheet).data.animations[animation]);
            this.body.animation = animation;
            this.body.animationSpeed = .5;
            this.body.updateAnchor = true;

            this.body.shadow = PIXI.AnimatedSprite.fromFrames(PIXI.Assets.cache.get(this.shadowSpritesheet).data.animations['shadow_' + animation]);
            console.log(this.body.shadow);
            this.body.shadow.animation = 'shadow_' + this.body.animation;
            this.body.shadow.animationSpeed = this.body.animationSpeed;
            this.body.shadow.updateAnchor = this.body.updateAnchor;

            if (playFromBeginning) this.body.currentFrame = 0;
            else this.body.currentFrame = savedFrame;

            this.body.shadow.currentFrame = this.body.currentFrame;

            this.body.play();
            this.body.shadow.play();

            // Add the new animated sprite to the stage
            app.stage.addChild(this.body);
            app.stage.addChild(this.body.shadow);
        }
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