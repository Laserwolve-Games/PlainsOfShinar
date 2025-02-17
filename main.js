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
    await app.init({ width: 960, height: 540 });

    document.body.appendChild(app.canvas);

    await loadAsset('background.webp');

    // const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;

    const background = PIXI.Sprite.from('background.webp');
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
                if (entity.body.animation.includes('walk')) entity.setAnimation('walk_' + entity.facing, false);
                else entity.setAnimation('walk_' + entity.facing, true);

            } else entity.setAnimation('idle_' + entity.facing, true);

            // keep bodies on top of their entities
            entity.body.position.set(entity.position.x, entity.position.y);
        });
    });
})();
class Entity extends PIXI.Sprite {

    constructor(spritesheet, animation, size, x, y, facing) {

        spritesheet = 'spritesheets/' + spritesheet + '.json';

        super(PIXI.Texture.WHITE);

        // this.visible = false;
        this.width = size;
        this.height = this.width / 2;
        this.position.set(x, y);
        this.facing = facing;
        this.actualFacing = facing;
        this.targetPosition = this.position;
        this.speed = 0;
        this.anchor.set(.5);

        this.init(spritesheet, animation + '_' + this.facing);
    }
    async init(spritesheet, animation) {

        await loadAsset(spritesheet);

        this.spritesheet = PIXI.Assets.cache.get(spritesheet).data.animations;

        this.setAnimation(animation, true);

        app.stage.addChild(this);

        entities.push(this);
    }
    moveTo = (x, y) => {

        this.targetPosition = { x, y };
    }
    setAnimation = (animation, playFromBeginning) => {

        // Don't set the animation if the new one is the same as the current one
        if (this.body?.animation != animation) {

            // Save the current frame of the current animation before destroying it,
            // to use if playFromBeginning is false
            let savedFrame;

            // Get rid of the current wrong animation, if there is one
            if (this.body) {

                if (!playFromBeginning) savedFrame = this.body.currentFrame;

                app.stage.removeChild(this.body);

                this.body.destroy();
            }
            this.body = PIXI.AnimatedSprite.fromFrames(this.spritesheet[animation]);
            this.body.animation = animation;
            this.body.animationSpeed = .5;
            this.body.updateAnchor = true;

            if (playFromBeginning) this.body.currentFrame = 0;
            else this.body.currentFrame = savedFrame;

            this.body.play();

            // Add the new animated sprite to the stage
            app.stage.addChild(this.body);
        }
    }
    calculateFacing = (x1, y1, x2, y2) => {

        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        this.actualFacing = angleInDegrees;

        let facing = Math.round(angleInDegrees / 22.5) * 22.5;
    


        // temp fix until we re-make the spritesheets
        if (facing == 180) facing = -180;

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