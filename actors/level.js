import Phaser from "phaser";
import { PIXEL_SCALE } from "../variables";

export class Level {
  /** @param {Phaser.Scene} scene */
  constructor(
    scene,
    { mapName, mapImagePath, jsonName, jsonPath, tilesetNameFromTiled }
  ) {
    this.scene = scene;
    this.mapName = mapName;
    this.mapImagePath = mapImagePath;
    this.jsonName = jsonName;
    this.jsonPath = jsonPath;
    this.tilesetNameFromTiled = tilesetNameFromTiled;
  }

  preload() {
    this.scene.load.image(this.mapName, this.mapImagePath);
    this.scene.load.tilemapTiledJSON(this.jsonName, this.jsonPath);
  }

  createMap() {
    const tileMap = this.scene.make.tilemap({
      key: this.mapName,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tileset = tileMap.addTilesetImage(
      this.tilesetNameFromTiled,
      this.mapName
    );

    // this should be the same in all maps made in Tiled
    const visualLayerNameFromTiled = "Tile Layer 1";

    // add the layer to the scene so it can be referenced as "this.level"
    // within scenes, to set up collision, etc
    const map = tileMap.createLayer(visualLayerNameFromTiled, tileset, 0, 0);
    map.setScale(PIXEL_SCALE);
    map.setCollisionByProperty({ collide: "true" });

    return { tileMap, map };
  }
}
