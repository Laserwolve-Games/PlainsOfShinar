import Entity from './entity.js';

export default class Player extends Entity {

    constructor() {

        super('man', 'idle', 60, 150, 300, 90);

        this.speed = 5;
    }
}