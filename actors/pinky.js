import Phaser from "phaser";
import { PIXEL_SCALE } from "../variables";

export class Pinky {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }
  /** @param {Phaser.Scene} scene */
  static preload(scene) {
    scene.load.spritesheet("pinky-idle", "images/pinky_idle_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    scene.load.spritesheet("pinky-run", "images/pinky_run_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    scene.load.spritesheet("pinky-attack", "images/pinky_attack_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    scene.load.spritesheet("poison", "images/poisonSpray_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }
  create() {
    this.pinky = this.scene.add.sprite(250, 500);
    this.pinky.setScale(PIXEL_SCALE);
    this.pinky.play("pinky-idle");
    this.scene.physics.add.existing(this.pinky);

    // save a reference to the pinky body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.pinkyBody = this.pinky.body;
  }

  update() {
    this.pinky.depth = this.pinky.y + this.pinky.height;
  }

  /**
   * Create animations to be used by any Pinky instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    ["pinky-idle", "pinky-run", "pinky-attack", "poison"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: -1,
      });
    });
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {}
}
