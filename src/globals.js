// import * as PIXI from './pixi.js';

const PlainsOfShinar = {};

PlainsOfShinar.app = new PIXI.Application();

PlainsOfShinar.entities = [];

PlainsOfShinar.loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}

export default PlainsOfShinar;