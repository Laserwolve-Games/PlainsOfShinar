import Entity from './entity.js';

export default class Player extends Entity {

    constructor() {

        super('man', 'man', 'idle', 100, 300, 300);

        this.speed = 5;
    }
}