import Phaser from "phaser";
import { PIXEL_SCALE, PINKY_ATTACK_DAMAGE, PINKY_SPEED } from "../variables";

export class Pinky {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;

    this.baseAttackDamage = PINKY_ATTACK_DAMAGE;
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
    this.pinky.play("pinky-run");
    this.pinky.setDataEnabled();
    this.pinky.data.set("actor", this);
    this.scene.physics.add.existing(this.pinky);

    // save a reference to the pinky body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.pinkyBody = this.pinky.body;
    this.pinkyBody.immovable = true;

    this.isAttacking = false;
  }

  update() {
    this.pinkyBody.setVelocity(0, 0);
    this.pinky.depth = this.pinky.y + this.pinky.height;

    const targetX = this.scene.player.player.x;
    this.pinky.setFlipX(targetX > this.pinky.x);

    this.playerDistance = new Phaser.Math.Vector2()
      .copy(this.scene.player.player)
      .subtract(this.pinky);
    
    console.log("distance: " + this.playerDistance.length());
    if (this.playerDistance.length() < 100) {
      this.attack();
    }

    this.handleMovement();
  }

  /**
   * Create animations to be used by any Pinky instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    ["pinky-idle", "pinky-run"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: -1,
      });
    });
    ["pinky-attack", "poison"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: 0,
      });
    });
  }

  handleMovement() {
    if (!this.isAttacking) {
      const vel = this.playerDistance
        .normalize()
        .scale(PINKY_SPEED);
      this.pinkyBody.setVelocity(vel.x, vel.y);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {
    if (this.isAttacking) return;

    this.pinkyBody.setVelocity(0, 0);

    this.isAttacking = true;
    this.pinky.anims.stop;
    this.pinky.play("pinky-attack");

    this.pinky.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isAttacking = false;
      this.pinky.play("pinky-run")
    });
  }

  /** Get the attack damage of this pinky.  May be adjusted from  */
  getAttackDamage() {
    return this.baseAttackDamage;
  }
}
