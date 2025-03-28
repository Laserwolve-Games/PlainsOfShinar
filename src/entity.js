import PlainsOfShinar from './globals.js';

// Can't extend PIXI.Container: https://github.com/Laserwolve-Games/PlainsOfShinar/discussions/3
// Can't extend PIXI.Graphics because we need this.anchor

export default class Entity extends PIXI.Sprite {

    // TODO: Turn this into a pool of workers
    static worker = new Worker('src/pathfindingWorker.js');
    static blurFilter = new PIXI.BlurFilter(5);

    constructor(set, name, animation, size, x, y, isStatic, initialFacing = 0) {

        super();

        // this.visible = false;
        this.animations = [];
        this.body = null; // stores the current animation
        this.shadow = null; // stores the current shadow
        this.label = name;
        this.width = size;
        this.height = PlainsOfShinar.isometrify(this.width);
        this.setLocation(x, y);
        this.currentCell = { x, y };
        this.set = set;

        // Set the node of this entity and the 8 surrounding nodes
        // as intraversable for pathfinding, if this entity is static.
        // Necessary since our collision logic doesn't like entities
        // that are very close together.
        if (isStatic) {

            PlainsOfShinar.grid[x][y] = 1;

            PlainsOfShinar.grid[x - 1][y - 1] = 1;
            PlainsOfShinar.grid[x][y - 1] = 1;
            PlainsOfShinar.grid[x + 1][y - 1] = 1;
            PlainsOfShinar.grid[x - 1][y] = 1;
            PlainsOfShinar.grid[x + 1][y] = 1;
            PlainsOfShinar.grid[x - 1][y + 1] = 1;
            PlainsOfShinar.grid[x][y + 1] = 1;
            PlainsOfShinar.grid[x + 1][y + 1] = 1;
        }
        const isometricDiamond = [
            0, PlainsOfShinar.isometrify(-this.height),
            PlainsOfShinar.isometrify(this.width), 0,
            0, PlainsOfShinar.isometrify(this.height),
            PlainsOfShinar.isometrify(-this.width), 0
        ];
        const randomColor = Math.floor(Math.random() * 16777215);
        const graphic = new PIXI.Graphics().poly(isometricDiamond).fill(randomColor);

        // Set the texture here instead of in the constructor so we can use this.height/width
        this.texture = PlainsOfShinar.app.renderer.generateTexture(graphic, 'nearest', 1);
        this.facing = initialFacing;
        this.actualFacing = initialFacing;
        this.targetPositionX = this.position.x;
        this.targetPositionY = this.position.y;
        this.speed = 0;
        this.anchor.set(.5);

        PlainsOfShinar.app.stage.addChild(this);

        // The paths to all files for this set
        const jsonPaths = PlainsOfShinar.manifest[this.set];

        (async () => {

            for (const animation of jsonPaths) await PlainsOfShinar.loadAsset(animation);

            // For animated entities, the first JSON file is animation data
            const animationData = PIXI.Assets.cache.get(jsonPaths[0])?.data.animations;

            // If there was animation data in that first JSON file, this entity is animated
            if (animationData) {

                for (let i = 0; i < Object.keys(animationData).length; i++) {

                    // fromFrames pulls from the Pixi cache
                    const animation = PIXI.AnimatedSprite.fromFrames(animationData[Object.keys(animationData)[i]]);

                    animation.label = Object.keys(animationData)[i];
                    animation.updateAnchor = true;
                    animation.interactive = false;

                    this.animations.push(animation);
                }
                this.setAnimation(animation);
            }
            else {

                // Don't call this.setAnimation() because it's not animated
                // Just set everything once here
                this.body = PIXI.Sprite.from(this.label + '_default_90_000');
                this.shadow = PIXI.Sprite.from('shadow_' + this.label + '_default_90_000');

                this.setShadow();

                this.body.label = 'default';
                this.body.updateAnchor = true;
                this.body.interactive = false;

                PlainsOfShinar.app.stage.addChild(this.body);
                PlainsOfShinar.app.stage.addChild(this.shadow);
            }
            PlainsOfShinar.entities.push(this);
        })();
    }
    setAnimation = (animation, playFromBeginning = true) => {

        let startFrame = 0;

        animation = this.label + '_' + animation + '_' + this.facing;

        // If the current animation is the same as the new one...
        if (this?.body?.label === animation) {

            // Check if we should restart it or not...
            if (playFromBeginning) this.body.currentFrame = startFrame;

            // then exit
            return;
        }
        // If a body exists, save its current frame, then remove it and its shadow from the stage
        if (this.body) {

            if (!playFromBeginning) startFrame = this.body.currentFrame;

            this.body.stop();

            PlainsOfShinar.app.stage.removeChild(this.body);
            PlainsOfShinar.app.stage.removeChild(this.shadow);
        }
        // set body to the specified animation     
        this.body = this.animations.find(a => a.label === animation);

        this.shadow = this.animations.find(a => a.label === 'shadow_' + animation);
        this.setShadow();

        this.body.currentFrame = startFrame;
        this.body.animationSpeed = .5;

        this.body.play();

        PlainsOfShinar.app.stage.addChild(this.body);
        PlainsOfShinar.app.stage.addChild(this.shadow);
    }
    setShadow = () => {

        this.shadow.alpha = 0.5;
        this.shadow.filters = [Entity.blurFilter];
    }
    /**
     * Keeps bodies, shadows, and (soon) gear in sync with their entities.
     * @author Andrew Rogers
     */
    sync = () => {

        this.collisionBox = [
            this.position.x, this.position.y - PlainsOfShinar.isometrify(this.height),
            this.position.x + PlainsOfShinar.isometrify(this.width), this.position.y,
            this.position.x, this.position.y + PlainsOfShinar.isometrify(this.height),
            this.position.x - PlainsOfShinar.isometrify(this.width), this.position.y
        ];
        this.currentCell = PlainsOfShinar.getCellFromLocation(this.position.x, this.position.y);

        this.body.position.set(this.position.x, this.position.y);

        this.shadow.position.set(this.body.position.x, this.body.position.y);

        this.shadow.currentFrame = this.body.currentFrame;
    }
    /** Check if this entity needs pathfinding to reach the target location.
     * 
     * This function creates four lines, one from each corner of the entity,
     * to the location where that corner would be if the entity was at the
     * target location. Only two lines are needed (i.e. if the target location
     * is above  the entity, we only need the left and right lines) for a good
     * approximation. A third line can be added with `fullCheck` to ensure the
     * entity will entirely fit at the target location.
     * 
     * @author Andrew Rogers
     * @param {*} x The X coordinate of the target location.
     * @param {*} y The Y coordinate of the target location.
     * @param {*} fullCheck Whether or not the check the extra line for collisions.
     * @returns Whether or not this entity needs pathfinding to reach the target location.
     */
    isPathfindingNeeded = (x, y, fullCheck = false) => {

        /** The angle between the current position and the target position, in degrees */
        const angle = PlainsOfShinar.radiansToDegrees(Math.atan2(y - this.position.y, x - this.position.x));
        let linesToCheck;

        // Lines that go from the specified corner of the entity,
        // to the potential location of that corner at the target location
        const leftLine = [this.position.x - PlainsOfShinar.isometrify(this.width), this.position.y,
        x - PlainsOfShinar.isometrify(this.width), y];
        const rightLine = [this.position.x + PlainsOfShinar.isometrify(this.width), this.position.y,
        x + PlainsOfShinar.isometrify(this.width), y]
        const topLine = [this.position.x, this.position.y - PlainsOfShinar.isometrify(this.height),
            x, y - PlainsOfShinar.isometrify(this.height)];
        const bottomLine = [this.position.x, this.position.y + PlainsOfShinar.isometrify(this.height),
            x, y + PlainsOfShinar.isometrify(this.height)];

        // Determine which lines are needed to check for collisions
        if ((angle >= PlainsOfShinar.verticalLineAngle && angle <= PlainsOfShinar.horizontalLineAngle)) {
            // target location is below the entity
            linesToCheck = [leftLine, rightLine];

            if (fullCheck) linesToCheck.push(bottomLine);
        }
        if ((angle <= -PlainsOfShinar.verticalLineAngle && angle >= -PlainsOfShinar.horizontalLineAngle)) {
            // target location is above the entity
            linesToCheck = [leftLine, rightLine];

            if (fullCheck) linesToCheck.push(topLine);
        }
        if ((angle >= PlainsOfShinar.horizontalLineAngle || angle <= -PlainsOfShinar.horizontalLineAngle)) {
            // target location is to the right of the entity
            linesToCheck = [topLine, bottomLine];

            if (fullCheck) linesToCheck.push(rightLine);
        }
        if ((angle <= PlainsOfShinar.verticalLineAngle && angle >= -PlainsOfShinar.verticalLineAngle)) {
            // target location is to the left of the entity
            linesToCheck = [topLine, bottomLine];

            if (fullCheck) linesToCheck.push(leftLine);
        }

        // Check all the specified lines against entities for collisions
        for (const line of linesToCheck)

            // TODO: Again, probably shouldn't loop over all entities
            for (const entity of PlainsOfShinar.entities)

                if (entity !== this && PlainsOfShinar.collisionCheck(line, entity.collisionBox))

                    // If any line collides with any entity, pathfinding is needed
                    return true;

        // Otherwise, pathfinding is not needed
        return false;
    }
    hasLineOfSightTo = (x, y) => {

        return !this.isPathfindingNeeded(x, y, true);
    }
    moveTo = (x, y, pathfind) => {

        // Only continue if the target position is new
        if (this.targetPositionX != x || this.targetPositionY != y) {

            // If we want to pathfind...
            if (pathfind) {

                // Check if we even need to...
                if (this.isPathfindingNeeded(x, y)) {

                    this.targetCell = PlainsOfShinar.getCellFromLocation(x, y);

                    // Find a path to the target cell in a web worker
                    Entity.worker.postMessage({

                        grid: PlainsOfShinar.grid,
                        start: this.currentCell,
                        end: this.targetCell
                    });

                    Entity.worker.onmessage = (event) => {

                        this.path = event.data.path;

                        if (this.path?.length) this.setNextNode();
                    }
                }
                else {

                    this.path = [];

                    this.targetPositionX = x;
                    this.targetPositionY = y;
                }
            }
            else {

                this.path = [];

                this.targetPositionX = x;
                this.targetPositionY = y;
            }
        }
    }
    setNextNode = (takeShortcuts = true) => {

        let cell;

        if (takeShortcuts) {

            // Start from the end of the path and work backwards
            for (let i = this.path.length - 1; i >= 0; i--) {

                // If the entity has line of sight to this node...
                const { x, y } = PlainsOfShinar.getLocationFromCell(this.path[i].x, this.path[i].y);

                if (this.hasLineOfSightTo(x, y)) {

                    // Set cell to this node
                    cell = this.path[i];

                    // Remove all nodes before this node
                    this.path.splice(0, i + 1);

                    // Stop the loop
                    break;
                }
            }
        }
        else cell = this.path.shift();

        const { x, y } = PlainsOfShinar.getLocationFromCell(cell.x, cell.y);
        
        this.targetPositionX = x;
        this.targetPositionY = y;

    }
    calculateFacing = (x1, y1, x2, y2) => {

        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const angleInRadians = Math.atan2(deltaY, deltaX);
        const angleInDegrees = angleInRadians * (180 / Math.PI);

        this.actualFacing = angleInDegrees;

        // + 0 prevents negative 0
        let facing = Math.round(angleInDegrees / 22.5) * 22.5 + 0;

        if (facing == -180) facing = 180;

        this.facing = facing;
    }
    handleMovement = () => {

        if (this.position.x != this.targetPositionX || this.position.y != this.targetPositionY) {

            const dx = this.targetPositionX - this.position.x;
            const dy = this.targetPositionY - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance) {

                this.actualSpeed = PlainsOfShinar.isometrify(this.speed, this.actualFacing);

                const moveDistance = Math.min(distance, this.actualSpeed);

                // Collision system: https://github.com/Laserwolve-Games/PlainsOfShinar/discussions/4
                const nextX = this.position.x + (dx / distance) * moveDistance;
                const nextY = this.position.y + (dy / distance) * moveDistance;

                const nextCollisionBox = [
                    nextX, nextY - PlainsOfShinar.isometrify(this.height),
                    nextX + PlainsOfShinar.isometrify(this.width), nextY,
                    nextX, nextY + PlainsOfShinar.isometrify(this.height),
                    nextX - PlainsOfShinar.isometrify(this.width), nextY
                ];

                for (const entity of PlainsOfShinar.entities) {

                    // TODO: optimize this because right now it'll check every moving entity against every other entity everywhere
                    if (entity !== this && PlainsOfShinar.collisionCheck(nextCollisionBox, entity.collisionBox)) {

                        // TODO: this is still firing when one entity 'grinds' into another;
                        // i.e. the entity is not moving but the engine thinks it is repeatedly colliding
                        // console.log(this.label + ' collided with entity:', entity.label);

                        this.isMoving = false;
                        return;
                    }
                }

                this.position.x = nextX;
                this.position.y = nextY;

                // If this entity is now at its target position...
                if (this.position.x == this.targetPositionX && this.position.y == this.targetPositionY)

                    // Set the next path node (if there is one) as the target position
                    if (this.path?.length) this.setNextNode();

                    // Otherwise, we're done moving
                    else this.isMoving = false;

                else this.isMoving = true;
            }
        }
    }
    handleMovementAnimations = () => {

        if (this.isMoving) {

            this.calculateFacing(this.position.x, this.position.y, this.targetPositionX, this.targetPositionY);

            // If the entity already was walking, play from the current frame...
            if (this.body.label.includes('walk')) this.setAnimation('walk', false);

            // ...otherwise, start from the beginning
            else this.setAnimation('walk');

            // if the walk animation is playing but the entity isn't moving, set the animation to idle
        } else if (this.body.label.includes('walk')) this.setAnimation('idle');
    }
    /**
     * Sort entities by their Y position to determine the zIndex of their bodies and shadows.
     * @author Andrew Rogers
     */
    static sort() {

        PlainsOfShinar.entities.sort((a, b) => a.position.y - b.position.y).forEach((entity, index) => {

            // The background lives at zIndex 0, so we need plus 1
            entity.body.zIndex = 1 + index * 2;
            entity.shadow.zIndex = 1 + index * 2 - 1;
        });
    }
    /** Sets the entity's location to exact grid coordinates.
     * @author Andrew Rogers
     * @param {*} gridX The X coordinate of the grid cell.
     * @param {*} gridY The Y coordinate of the grid cell.
     */
    setLocation = (gridX, gridY) => {

        const { x, y } = PlainsOfShinar.getLocationFromCell(gridX, gridY);
        this.position.set(x, y);
    }
}