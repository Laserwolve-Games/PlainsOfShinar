const app = new PIXI.Application();

const entities = [];

const loadAsset = async (asset) => {

    if (!PIXI.Assets.cache.has(asset)) await PIXI.Assets.load(asset);
}

export { app, loadAsset, entities };