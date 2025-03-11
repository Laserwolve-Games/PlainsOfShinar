import Entity from './entity.js';

export default class Player extends Entity {

    constructor() {

        super('man', 'man', 'idle', 128, 0, 0);

        this.speed = 5;
    }
}