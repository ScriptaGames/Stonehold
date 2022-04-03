import Phaser from "phaser";
import { Actor } from "./actor";
import {
  PIXEL_SCALE,
  PINKY_ATTACK_DAMAGE,
  PINKY_SPEED,
  WEAPON_HOVER_DISTANCE,
  PINKY_ATTACK_RANGE,
  PINKY_BASE_HP,
  PINKY_IDLE_AFTER_ATTACK,
} from "../variables";

export class Pinky extends Actor {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    super(scene, { hp: PINKY_BASE_HP, damage: PINKY_ATTACK_DAMAGE });
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
    super.create();
    this.pinky = this.mainSprite = this.scene.add.sprite(250, 500);
    this.pinky.setScale(PIXEL_SCALE);
    this.pinky.play("pinky-run");
    this.pinky.setDataEnabled();
    this.pinky.data.set("actor", this);
    this.scene.physics.add.existing(this.pinky);

    // save a reference to the pinky body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.pinkyBody = this.pinky.body;
    this.pinkyBody.immovable = true;

    // adjust hitbox
    this.pinkyBody.setSize(28, 26);
    this.pinkyBody.setOffset(17, 28);

    this.poison = this.scene.add.sprite(250, 500, "poison");
    this.poison.setScale(PIXEL_SCALE);
    this.poison.anims.hideOnComplete = true;
    this.poison.visible = false;
    this.scene.physics.add.existing(this.poison);

    this.isAttacking = false;
  }

  update() {
    this.pinkyBody.setVelocity(0, 0);
    this.pinky.depth = this.pinky.y + this.pinky.height;

    this.playerDistance = new Phaser.Math.Vector2()
      .copy(this.scene.player.player)
      .subtract(this.pinky);

    if (this.playerDistance.length() < PINKY_ATTACK_RANGE) {
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
      const targetX = this.scene.player.player.x;
      this.pinky.setFlipX(targetX > this.pinky.x);
      const vel = this.playerDistance.normalize().scale(PINKY_SPEED);
      this.pinkyBody.setVelocity(vel.x, vel.y);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {
    if (this.isAttacking) return;
    const targetX = this.scene.player.player.x;
    this.pinky.setFlipX(targetX > this.pinky.x);

    this.isAttacking = true;

    this.pinkyBody.setVelocity(0, 0);

    this.poison.body.enable = true;

    this.poison.setFlipX(this.pinky.flipX);

    const poisonOffset = new Phaser.Math.Vector2()
      .copy(this.scene.player.player)
      .subtract(this.pinky)
      .normalize()
      .scale(WEAPON_HOVER_DISTANCE);

    const poisonPos = poisonOffset.clone().add(this.pinky);
    this.poison.copyPosition(poisonPos);

    // play attack anims
    this.poison.playAfterDelay(
      {
        key: "poison",
        hideOnComplete: true,
        showOnStart: true,
      },
      600
    );

    this.pinky.anims.stop();
    this.pinky.play("pinky-attack");

    this.pinky.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.pinky.play("pinky-idle");
      this.scene.time.addEvent({
        delay: PINKY_IDLE_AFTER_ATTACK,
        callback: this.attackComplete,
        callbackScope: this,
      });
    });
  }

  attackComplete() {
    this.pinky.play("pinky-run");
    this.isAttacking = false;
  }

  /** Get the attack damage of this pinky.  May be adjusted from  */
  getAttackDamage() {
    return this.baseAttackDamage;
  }
}
