import Phaser from "phaser";
import { PIXEL_SCALE } from "../variables";

export class Level {
  /** @param {Phaser.Scene} scene */
  constructor(
    scene,
    { mapName, mapImagePath, objectsImagePath, jsonName, jsonPath, tilesetNameFromTiled, objectsTilesetFromTiled }
  ) {
    this.scene = scene;
    this.mapName = mapName;
    this.objectsMapName = mapName + "-objects";
    this.mapImagePath = mapImagePath;
    this.objectsImagePath = objectsImagePath;
    this.jsonName = jsonName;
    this.jsonPath = jsonPath;
    this.tilesetNameFromTiled = tilesetNameFromTiled;
    this.objectsTilesetFromTiled = objectsTilesetFromTiled;
  }

  preload() {
    this.scene.load.image(this.mapName, this.mapImagePath);
    this.scene.load.image(this.objectsMapName, this.objectsImagePath);
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
    const objects = tileMap.addTilesetImage(
      this.objectsTilesetFromTiled,
      this.objectsMapName
    );

    // this should be the same in all maps made in Tiled
    const visualLayerNameFromTiled = "Tile Layer Background";
    const floorLayerNameFromTiled = "Floor";

    // add the layer to the scene so it can be referenced as "this.level"
    // within scenes, to set up collision, etc

    const floor = tileMap.createLayer(floorLayerNameFromTiled, tileset, 0, 0);
    floor.setScale(PIXEL_SCALE);
    const map = tileMap.createLayer(visualLayerNameFromTiled, [tileset, objects], 0, 0);
    map.setScale(PIXEL_SCALE);
    map.setCollisionByProperty({ collide: "true" });

    return { tileMap, map, floor };
  }
}
