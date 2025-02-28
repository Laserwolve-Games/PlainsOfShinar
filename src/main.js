import PlainsOfShinar from './globals.js';
import Entity from './entity.js';
import Player from './player.js';

// No Intellisense. Bug: https://github.com/Laserwolve-Games/PlainsOfShinar/issues/1
// import * as PIXI from './pixi.js';

(async () => {

    await PlainsOfShinar.app.init({
        width: 4096, height: 4096,

        preference: 'webgpu'
    });

    PlainsOfShinar.app.canvas.style.width = '4096px';
    PlainsOfShinar.app.canvas.style.height = '4096px';

    document.body.appendChild(PlainsOfShinar.app.canvas);

    await PlainsOfShinar.loadAsset('background.png');

    await PlainsOfShinar.loadAsset('spritesheets/manifest.json');

    PlainsOfShinar.manifest = PIXI.Assets.cache.get('spritesheets/manifest.json');

    const background = new PIXI.TilingSprite({
        texture: PIXI.Texture.from('background.png'),
        width: PlainsOfShinar.app.canvas.width,
        height: PlainsOfShinar.app.canvas.height
    });
    background.tileScale.y = .5;
    background.tileTransform.rotation = .5;
    PlainsOfShinar.app.stage.addChild(background);

    const player = new Player();

    const barrel = new Entity('tutorial', 'barrel', 'default', 200, 300, 600, false);

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

        // scroll to the player
        window.scrollTo(player?.position.x - window.innerWidth / 2, player?.position.y - window.innerHeight / 2);

        if (PointerIsDown) player.moveTo(mouseX, mouseY);

        Entity.sort();

        // every tick, for every entity
        PlainsOfShinar.entities.forEach(entity => {

            entity.handleMovement();

            entity.handleMovementAnimations();

            entity.sync();
        });
    });
})();