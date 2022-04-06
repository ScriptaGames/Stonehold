import Phaser from "phaser";
import {
  PIXEL_SCALE,
} from "../variables";

export class Decoration {
  /**  @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    // list of keys into the object atlas, sorted by weight
    // i.e. items at the front are more likely to be picked
    this.weightedMushrooms = [
      "small_red_mushroom",
      "small_red_mushroom",
      "small_blue_mushroom01",
      "small_blue_mushroom02",
      "small_brown_mushroom",
      "large_red_mushroom",
      "large_blue_mushroom",
    ]
  }

  /**  @param {Phaser.Scene} scene */
  static preload(scene) {
    scene.load.atlas("objects", "images/Objects_atlas.png", "images/Objects_atlas.json");
  }

  create() {
    const spriteKey = this.scene.room_manager.rnd.weightedPick(this.weightedMushrooms);
    this.mainSprite = this.scene.add.sprite(250, 500, "objects", spriteKey);
    this.mainSprite.setScale(PIXEL_SCALE);
  }

  update() {
    this.mainSprite.depth = this.mainSprite.y + this.mainSprite.height;
  }
}
