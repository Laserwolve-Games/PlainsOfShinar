import Entity from './entity.js';

export default class Player extends Entity {

    constructor() {

        super('man', 'man', 'idle', 100, 150, 300, true);

        this.speed = 5;
    }
}