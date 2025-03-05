// import PIXI from 'C:/pixi.js';

const PlainsOfShinar = {};

PlainsOfShinar.app = new PIXI.Application();

PlainsOfShinar.entities = [];

PlainsOfShinar.loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}
PlainsOfShinar.lerp = (a, b, x) => a + x * (b - a);

PlainsOfShinar.isometrify = (value, angle) => value * PlainsOfShinar.lerp(.5, 1, Math.abs(Math.abs(angle) - 90) / 90);

// We'd use Math.sqrt(2) if the daz camera was at -45 degrees
PlainsOfShinar.isometry = 2;

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
export default PlainsOfShinar;