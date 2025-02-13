import Player from './player.js';

(async () => {
    const app = new PIXI.Application();
    await app.init({ width: 960, height: 540 });

    document.body.appendChild(app.canvas);

    await PIXI.Assets.load(["spritesheets/man.json", "background.webp"]);

    const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;

    const background = PIXI.Sprite.from("background.webp");
    app.stage.addChild(background);

    app.stage.scale.x = app.canvas.width / background.width;
    app.stage.scale.y = app.canvas.height / background.height;

    const player = new Player(animations["walk_0"]);

    app.stage.addChild(player);
    app.stage.addChild(player.body);

    app.view.addEventListener('pointerdown', (event) => {
        const rect = app.view.getBoundingClientRect();
        const targetX = (event.clientX - rect.left) / app.stage.scale.x;
        const targetY = (event.clientY - rect.top) / app.stage.scale.y;
        player.moveTo(targetX / 2, targetY / 2);
    });

    app.ticker.add(() => {
        player.body.position.set(player.position.x, player.position.y);

        player.width = player.body.width;

        if (player.targetX !== player.position.x || player.targetY !== player.position.y) {
            const dx = player.targetX - player.position.x;
            const dy = player.targetY - player.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > player.speed) {
                player.position.x += (dx / distance) * player.speed;
                player.position.y += (dy / distance) * player.speed;
            } else {
                player.position.x = player.targetX;
                player.position.y = player.targetY;
            }
        }
    });
})();