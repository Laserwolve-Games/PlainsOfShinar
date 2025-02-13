export default class Entity extends PIXI.Sprite {
    constructor(animation, width, height, x, y) {
        super(PIXI.Texture.WHITE);
        this.width = width;
        this.height = height;
        this.position.set(x, y);
        this.targetX = x;
        this.targetY = y;
        
        this.speed = 0;
        this.anchor.set(.5);

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