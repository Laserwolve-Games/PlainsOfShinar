export default class Player extends PIXI.Sprite {
    constructor(animation) {
        super(PIXI.Texture.WHITE);
        this.width = 25;
        this.height = 25;
        this.anchor.set(.5);
        this.position.set(150, 300);
        this.targetX = 150;
        this.targetY = 300;
        this.speed = 5;

        this.body = PIXI.AnimatedSprite.fromFrames(animation);
        this.body.animationSpeed = .5;
        this.body.updateAnchor = true;
        this.body.play();
    }
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
}