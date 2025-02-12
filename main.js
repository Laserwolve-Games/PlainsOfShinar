import Player from './player.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({width: 960, height: 540});

    document.body.appendChild(app.canvas);

    await PIXI.Assets.load([ "spritesheets/man.json", "background.webp" ]);

    const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;

    const background = PIXI.Sprite.from("background.webp");
    app.stage.addChild(background);

    app.stage.scale.x = app.canvas.width / background.width;
    app.stage.scale.y = app.canvas.height / background.height;

    const player = new Player(animations["die_0"]);

    player.body.animationSpeed = .5;
    player.base.position.set(150, background.height - 780);
    player.body.play();

    player.body.updateAnchor = true;

    app.stage.addChild(player.base);
    app.stage.addChild(player.body);

    app.ticker.add(() => {
        player.body.position.set(player.base.position.x, player.base.position.y);
    });
})();