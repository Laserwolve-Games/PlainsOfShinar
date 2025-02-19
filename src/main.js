// Intellisense doesn't work unless we use node.js/npm.
// This doesn't work: /// <reference path='./pixi.js' />
// Neither does a jsconfig.json file, or a global.d.ts file.
// We've asked for help in  this issue: https://github.com/pixijs/pixijs/discussions/11280
// Unfortunately the only solution we have found is toggling this line:
// import * as PIXI from './pixi.js';
import { app, loadAsset, entities } from './globals.js';
import Entity from './entity.js';
import Player from './player.js';

(async () => {
    // app = new PIXI.Application();
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

const isometrify = (value, angle) => value * lerp(.5, 1, Math.abs(Math.abs(angle) - 90) / 90);

const lerp = (a, b, x) => a + x * (b - a);