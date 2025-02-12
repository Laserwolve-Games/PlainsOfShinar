export default class Player {
    constructor(animation) {
        this.body = PIXI.AnimatedSprite.fromFrames(animation);
        const baseTexture = PIXI.Texture.WHITE;
        baseTexture.tint = 0xFF0000;
        this.base = new PIXI.Sprite(baseTexture);
        this.base.width = 50; // Set width
        this.base.height = 50; // Set height
    }
}