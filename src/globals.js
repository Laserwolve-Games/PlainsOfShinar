// import * as PIXI from './pixi.js';

const PlainsOfShinar = {};

PlainsOfShinar.app = new PIXI.Application();

PlainsOfShinar.entities = [];

PlainsOfShinar.loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}
PlainsOfShinar.lerp = (a, b, x) => a + x * (b - a);

PlainsOfShinar.isometrify = (value, angle) => value * PlainsOfShinar.lerp(.5, 1, Math.abs(Math.abs(angle) - 90) / 90);

export default PlainsOfShinar;