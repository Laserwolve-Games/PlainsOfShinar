import PlainsOfShinar from './globals.js';
import Entity from './entity.js';
import Player from './player.js';

// No Intellisense. Bug: https://github.com/Laserwolve-Games/PlainsOfShinar/issues/1
// import PIXI from 'C:/pixi.js';

(async () => {

    const masterWidth = 4096;
    const masterHeight = PlainsOfShinar.isometrify(masterWidth);

    await PlainsOfShinar.app.init({
        width: masterWidth, height: masterHeight,

        preference: 'webgpu'
    });

    PlainsOfShinar.app.canvas.style.width = masterWidth + 'px';
    PlainsOfShinar.app.canvas.style.height = masterHeight + 'px';

    document.body.appendChild(PlainsOfShinar.app.canvas);

    await PlainsOfShinar.loadAsset('spritesheets/manifest.json');

    PlainsOfShinar.manifest = PIXI.Assets.cache.get('spritesheets/manifest.json');

    await PlainsOfShinar.loadAsset('background.png');

    const background = new PIXI.TilingSprite({
        texture: PIXI.Texture.from('background.png'),
        width: PlainsOfShinar.app.canvas.width,
        height: PlainsOfShinar.app.canvas.height
    });

    /** Not the same as the isometric diamond used for entities. */
    const isometricDiamond = [
        PlainsOfShinar.isometrify(background.width), 0,
        background.width, PlainsOfShinar.isometrify(background.height),
        PlainsOfShinar.isometrify(background.width), background.height,
        0, PlainsOfShinar.isometrify(background.height)
    ];
    
    background.mask = new PIXI.Graphics().poly(isometricDiamond).fill({ color: 0xffffff });
    background.tileScale.y = PlainsOfShinar.isometry;
    background.tileTransform.rotation = PlainsOfShinar.isometry;
    PlainsOfShinar.app.stage.addChild(background);

    const cellSize = 32;
    const gridSize = masterWidth / cellSize;
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));

    // Generate a visualization of the grid.
    for (let i = 0; i <= masterHeight; i += cellSize) {

        /** Starts in the upper left and terminates in the bottom right. */
        const verticalLine = new PIXI.Graphics();
        /** Starts in the upper right and terminates in the bottom left. */
        const HorizontalLine = new PIXI.Graphics();
        const stroke = { width: 1, color: 0xFF0000 };
        const adjustedI= PlainsOfShinar.isometrify(i);
        const adjustedMasterHeight = PlainsOfShinar.isometrify(masterHeight);

        PlainsOfShinar.app.stage.addChild(verticalLine);
        PlainsOfShinar.app.stage.addChild(HorizontalLine);

        verticalLine.moveTo(masterHeight - i, adjustedI);

        verticalLine.lineTo(masterWidth - i, adjustedMasterHeight + adjustedI);

        HorizontalLine.moveTo(masterHeight + i, adjustedI);

        HorizontalLine.lineTo(i, adjustedMasterHeight + adjustedI);

        HorizontalLine.stroke(stroke);
        verticalLine.stroke(stroke);
    }

    const player = new Player();
    const barrel = new Entity('tutorial', 'barrel', 'default', 200, 300, 600);
    const barrel2 = new Entity('tutorial', 'barrel', 'default', 200, 600, 600);

    let PointerIsDown = false;
    let mouseX = 0;
    let mouseY = 0;

    // Not possible to get mouse position outside of an event:
    // https://github.com/Laserwolve-Games/PlainsOfShinar/issues/6
    PlainsOfShinar.app.canvas.addEventListener('pointermove', (event) => updateMousePosition(event));

    PlainsOfShinar.app.canvas.addEventListener('pointerdown', (event) => {

        updateMousePosition(event);
        PointerIsDown = true;
    });
    PlainsOfShinar.app.canvas.addEventListener('pointerup', (event) => {

        updateMousePosition(event);
        PointerIsDown = false;
    });

    const updateMousePosition = (event) => {

        const rect = PlainsOfShinar.app.canvas.getBoundingClientRect();
        mouseX = (event.clientX - rect.left) / PlainsOfShinar.app.stage.scale.x;
        mouseY = (event.clientY - rect.top) / PlainsOfShinar.app.stage.scale.y;
    }

    // stuff that runs every tick
    PlainsOfShinar.app.ticker.add(() => {

        // scroll to the player
        const middle = 2;
        const center = (value) => value / middle;
        window.scrollTo(player?.position.x - center(window.innerWidth), player?.position.y -  center(window.innerHeight));

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