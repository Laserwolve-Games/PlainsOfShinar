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

    console.log(PIXI.Assets.cache);

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

        // player.body.position.set(player.position.x, player.position.y);

        // every tick, for every entity
        entities.forEach(entity => {

            // keep bodies on top of their entities
            entity.body.position.set(entity.position.x, entity.position.y);

            // entity movement
            if (entity.targetPosition !== entity.position) {

                const dx = entity.targetPosition.x - entity.position.x;
                const dy = entity.targetPosition.y - entity.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > entity.speed) {

                    entity.position.x += (dx / distance) * entity.speed;
                    entity.position.y += (dy / distance) * entity.speed;
                } else {

                    entity.targetPosition = entity.position;
                }
            }
        });
    });
})();

class Entity extends PIXI.Sprite {

    constructor(spritesheet, initialAnimation, width, height, x, y, angle) {

        super(PIXI.Texture.WHITE);
        this.width = width;
        this.height = height;
        this.position.set(x, y);
        this.angle = angle;
        this.targetPosition = this.position;

        this.speed = 0;
        this.anchor.set(.5);

        this.init(spritesheet, initialAnimation + '_' + angle);
    }
    async init(spritesheet, initialAnimation) {

        await loadAsset(spritesheet);

        this.spritesheet = PIXI.Assets.cache.get(spritesheet).data.animations;

        this.body = PIXI.AnimatedSprite.fromFrames(this.spritesheet[initialAnimation]);

        this.body.animationSpeed = .5;
        this.body.updateAnchor = true;
        this.body.play();

        app.stage.addChild(this);
        app.stage.addChild(this.body);

        entities.push(this);
    }
    moveTo(x, y) {

        this.targetPosition = { x, y };
    }
    changeAnimation(newAnimation) {
        this.body = PIXI.AnimatedSprite.fromFrames(this.spritesheet[newAnimation]);
    }
}

class Player extends Entity {

    constructor() {

        super('spritesheets/man.json', 'walk', 50, 25, 150, 300, 0);

        this.speed = 5;
    }
}
async function loadAsset(asset) {

    if (!PIXI.Assets.cache.has(asset)) {

        await PIXI.Assets.load(asset);
    }
}