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

    await loadAsset("background.webp");

    // const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;

    const background = PIXI.Sprite.from("background.webp");
    app.stage.addChild(background);

    app.stage.scale.x = app.canvas.width / background.width;
    app.stage.scale.y = app.canvas.height / background.height;

    const player = new Player();

    app.canvas.addEventListener('pointerdown', (event) => {
        const rect = app.canvas.getBoundingClientRect();
        const targetX = (event.clientX - rect.left) / app.stage.scale.x;
        const targetY = (event.clientY - rect.top) / app.stage.scale.y;
        player.moveTo(targetX, targetY);
    });

    // stuff that runs every tick
    app.ticker.add(() => {

        // TODO: Think about setting the entity to the width of its body,
        // and maybe making it an oval and adjusting its angle.
        // player.body.position.set(player.position.x, player.position.y);

        // every tick, for every entity
        entities.forEach(entity => {



            // entity movement
            if (entity.targetPosition !== entity.position) {

                const dx = entity.targetPosition.x - entity.position.x;
                const dy = entity.targetPosition.y - entity.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > entity.speed) {

                    entity.isMoving = true;

                    entity.position.x += (dx / distance) * entity.speed;
                    entity.position.y += (dy / distance) * entity.speed;

                } else {

                    entity.isMoving = false;

                    entity.targetPosition = entity.position;
                }
            }

            // TODO: I don't think we need to do this every tick, but let's figure that out when we deal with holding click to move
            if (entity.isMoving) {

                entity.facing = calculateFacing(entity.position.x, entity.position.y, entity.targetPosition.x, entity.targetPosition.y);

                const animation = "walk_" + entity.facing;

                if (entity.body.animation != animation) {

                    entity.setAnimation("walk_" + entity.facing);
                }
            } else {

                const animation = "idle_" + entity.facing;

                if (entity.body.animation != animation) {

                    entity.setAnimation("idle_" + entity.facing);
                }
            }

            // keep bodies on top of their entities
            entity.body.position.set(entity.position.x, entity.position.y);
        });
    });
})();

class Entity extends PIXI.Sprite {

    constructor(spritesheet, animation, width, height, x, y, facing) {

        spritesheet = 'spritesheets/' + spritesheet + '.json';

        super(PIXI.Texture.WHITE);
        this.width = width;
        this.height = height;
        this.position.set(x, y);
        this.facing = facing;
        this.targetPosition = this.position;

        this.speed = 0;
        this.anchor.set(.5);

        this.init(spritesheet, animation + '_' + this.facing);
    }
    async init(spritesheet, animation) {

        await loadAsset(spritesheet);

        this.spritesheet = PIXI.Assets.cache.get(spritesheet).data.animations;

        this.setAnimation(animation);

        app.stage.addChild(this);

        entities.push(this);
    }
    moveTo(x, y) {

        this.targetPosition = { x, y };
    }
    setAnimation(animation) {

        if (this.body) {
            app.stage.removeChild(this.body);
            this.body.destroy();
        }
        this.body = PIXI.AnimatedSprite.fromFrames(this.spritesheet[animation]);
        this.body.animation = animation;
        this.body.animationSpeed = .5;
        this.body.updateAnchor = true;
        if (!this.body.playing) this.body.play();

        // Add the new animated sprite to the stage
        app.stage.addChild(this.body);
    }
}

class Player extends Entity {

    constructor() {

        super('man', 'walk', 50, 25, 150, 300, 90);

        this.speed = 5;
    }
}
async function loadAsset(asset) {

    if (!PIXI.Assets.cache.has(asset)) {

        await PIXI.Assets.load(asset);
    }
}
function calculateFacing(x1, y1, x2, y2) {

    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const angleInRadians = Math.atan2(deltaY, deltaX);
    const angleInDegrees = angleInRadians * (180 / Math.PI);
    // TODO: Correct facings in the DazScript
    let facing = Math.round(angleInDegrees / 22.5) * 22.5;

    // Code to correct the facings if they weren't corrected in the DazScript
    facing = Math.abs((facing + 270) % 360 - 360);
    if (facing == 360) facing = 0;

    return facing;
}