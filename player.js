import Entity from "./entity.js";

export default class Player extends Entity {
    constructor(animation) {
        super(animation, 25, 25, 150, 300);
        this.speed = 5;
    }
}