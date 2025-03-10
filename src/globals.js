// import PIXI from 'C:/pixi.js';

const PlainsOfShinar = {};

PlainsOfShinar.app = new PIXI.Application();

PlainsOfShinar.entities = [];

PlainsOfShinar.loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}
PlainsOfShinar.lerp = (a, b, x) => a + x * (b - a);

/** Reduces a number by the appropriate amount to appear isometric.
 * @author Andrew Rogers
 * @param {number} value - The number to be reduced.
 * @param {number} angle - Optional: the angle to use in the isometric calculation.
 * @returns {number} The isometrically-corrected number.
 */
PlainsOfShinar.isometrify = (value, angle) => {

    if (angle) return value * PlainsOfShinar.lerp(PlainsOfShinar.isometry, 1, Math.abs(Math.abs(angle) - 90) / 90);
     
    // There's a chance this is being used in places that have nothing to do with isometry,
    // and I really should just be dividing by 2.
    else return value * PlainsOfShinar.isometry;
}

// Isometric angles: https://github.com/Laserwolve-Games/PlainsOfShinar/discussions/8
PlainsOfShinar.isometry = .5;
PlainsOfShinar.cellWidth = 64;
PlainsOfShinar.cellHeight = PlainsOfShinar.isometrify(PlainsOfShinar.cellWidth);
PlainsOfShinar.layoutWidth = 4096;
PlainsOfShinar.layoutHeight = PlainsOfShinar.isometrify(PlainsOfShinar.layoutWidth);

PlainsOfShinar.collisionCheck = (poly1, poly2) => {
    const projectPolygon = (axis, polygon) => {
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < polygon.length; i += 2) {
            let projection = polygon[i] * axis.x + polygon[i + 1] * axis.y;
            if (projection < min) min = projection;
            if (projection > max) max = projection;
        }
        return { min, max };
    };

    const overlapOnAxis = (proj1, proj2) => proj1.max >= proj2.min && proj2.max >= proj1.min;

    const getAxes = (polygon) => {
        let axes = [];
        for (let i = 0; i < polygon.length; i += 2) {
            let p1 = { x: polygon[i], y: polygon[i + 1] };
            let p2 = { x: polygon[(i + 2) % polygon.length], y: polygon[(i + 3) % polygon.length] };
            let edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            axes.push({ x: -edge.y, y: edge.x });
        }
        return axes;
    };

    let axes1 = getAxes(poly1);
    let axes2 = getAxes(poly2);

    for (let axis of axes1.concat(axes2)) {
        let proj1 = projectPolygon(axis, poly1);
        let proj2 = projectPolygon(axis, poly2);
        if (!overlapOnAxis(proj1, proj2)) return false;
    }

    return true;
}
PlainsOfShinar.getCellFromLocation = (x, y) => {

    x = Math.round(x / PlainsOfShinar.cellWidth) * PlainsOfShinar.cellWidth;
    y = Math.round(y / PlainsOfShinar.cellHeight) * PlainsOfShinar.cellHeight;

    let gridX = Math.round((x - PlainsOfShinar.cellWidth) / (2 * PlainsOfShinar.cellWidth));
    let gridY = Math.round((y - PlainsOfShinar.isometrify(PlainsOfShinar.layoutHeight) + gridX * PlainsOfShinar.isometrify(PlainsOfShinar.cellWidth)) / PlainsOfShinar.isometrify(PlainsOfShinar.cellWidth));

    return {gridX, gridY};
}
PlainsOfShinar.getLocationFromCell = (gridX, gridY) => {

    // subtract 1 to make it zero based
    gridX -= 1;
    gridY -= 1;

    let x = gridX * PlainsOfShinar.cellWidth + PlainsOfShinar.cellWidth + gridY * PlainsOfShinar.cellWidth;
    let y = PlainsOfShinar.isometrify(PlainsOfShinar.layoutHeight)
    - gridX * PlainsOfShinar.isometrify(PlainsOfShinar.cellWidth) + gridY * PlainsOfShinar.isometrify(PlainsOfShinar.cellWidth);

    return {x, y};
}
export default PlainsOfShinar;