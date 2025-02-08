const app = new PIXI.Application();
await app.init({width: 960, height: 540});

document.body.appendChild(app.canvas);

await PIXI.Assets.load([ "spritesheets/man.json", "background.webp" ]);

const animations = PIXI.Assets.cache.get('spritesheets/man.json').data.animations;
console.log(animations);

const background = PIXI.Sprite.from("background.webp");
app.stage.addChild(background);

app.stage.scale.x = app.canvas.width / background.width;
app.stage.scale.y = app.canvas.height / background.height;

const character = PIXI.AnimatedSprite.fromFrames(animations["die/die_0"]);

character.animationSpeed = .5;
character.position.set(150, background.height - 780);
character.play();

character.updateAnchor =true;

app.stage.addChild(character);