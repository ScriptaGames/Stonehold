import Phaser from "phaser";
import { PIXEL_SCALE, CAPTAIN_ATTACK_DAMAGE } from "../variables";

export class Captain {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    this.baseAttackDamage = CAPTAIN_ATTACK_DAMAGE;
  }
  /** @param {Phaser.Scene} scene */
  static preload(scene) {
    scene.load.spritesheet("captain-idle", "images/captain_idle_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    scene.load.spritesheet("captain-run", "images/captain_run_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    scene.load.spritesheet(
      "captain-attack",
      "images/captain_attack_strip.png",
      {
        frameWidth: 64,
        frameHeight: 64,
      }
    );
    scene.load.spritesheet("poison-ball", "images/poisonBall_strip.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
  }
  create() {
    this.captain = this.scene.add.sprite(250, 500);
    this.captain.setScale(PIXEL_SCALE);
    this.captain.play("captain-idle");
    this.scene.physics.add.existing(this.captain);
    this.captain.setDataEnabled();
    this.captain.data.set("actor", this);

    // save a reference to the captain body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.captainBody = this.captain.body;
    this.captainBody.immovable = true;
  }

  update() {
    this.captain.depth = this.captain.y + this.captain.height;
  }

  /**
   * Create animations to be used by any Captain instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    ["captain-idle", "captain-run", "captain-attack", "poison-ball"].forEach(
      (name) => {
        scene.anims.create({
          key: name,
          frames: scene.anims.generateFrameNumbers(name),
          frameRate: 10,
          repeat: -1,
        });
      }
    );
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {}

  /** Get the attack damage of this pinky.  May be adjusted from  */
  getAttackDamage() {
    return this.baseAttackDamage;
  }
}
