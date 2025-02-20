import PlainsOfShinar from './globals.js';
import Player from './player.js';

// No Intellisense. Bug: https://github.com/Laserwolve-Games/PlainsOfShinar/issues/1
// import * as PIXI from './pixi.js';

(async () => {

    await PlainsOfShinar.app.init({ width: 4096, height: 4096,
        
        // Can't use WebGPU. Bug: https://github.com/Laserwolve-Games/PlainsOfShinar/issues/2
        preference: 'webgl'
    });

    PlainsOfShinar.app.canvas.style.width = '4096px';
    PlainsOfShinar.app.canvas.style.height = '4096px';

    document.body.appendChild(PlainsOfShinar.app.canvas);

    await PlainsOfShinar.loadAsset('background.png');
    
    const background = new PIXI.TilingSprite({
        texture: PIXI.Texture.from('background.png'),
        width: PlainsOfShinar.app.canvas.width,
        height: PlainsOfShinar.app.canvas.height
    });
    background.tileScale.y = .5;
    background.tileTransform.rotation = .5;
    PlainsOfShinar.app.stage.addChild(background);

    const player = new Player();

    let PointerIsDown = false;
    let mouseX = 0;
    let mouseY = 0;

    PlainsOfShinar.app.canvas.addEventListener('pointermove', (event) => {

        const rect = PlainsOfShinar.app.canvas.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / PlainsOfShinar.app.stage.scale.x;
        mouseY = (event.clientY - rect.top) / PlainsOfShinar.app.stage.scale.y;
    });

    PlainsOfShinar.app.canvas.addEventListener('pointerdown', () => PointerIsDown = true);
    PlainsOfShinar.app.canvas.addEventListener('pointerup', () => PointerIsDown = false);

    // stuff that runs every tick
    PlainsOfShinar.app.ticker.add(() => {

        // console.log(PlainsOfShinar.app.renderer);

        // scroll to the player
        window.scrollTo(player?.position.x - window.innerWidth / 2, player?.position.y - window.innerHeight / 2);

        // TODO: Think about setting the entity to the width of its body,
        // and maybe making it an oval and adjusting its angle.
        // player.body.position.set(player.position.x, player.position.y);

        if (PointerIsDown) player.moveTo(mouseX, mouseY);

        // every tick, for every entity
        PlainsOfShinar.entities.forEach(entity => {

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