import Phaser from "phaser";
import { Actor } from "./actor";
import { PIXEL_SCALE } from "../variables";

export class Portcullis extends Actor {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    super(scene, { hp: 1, damage: 0 });

    this.lock();
  }
  /** @param {Phaser.Scene} scene */
  static preload(scene) {
    scene.load.spritesheet("door-open", "images/doorOpen_strip.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    scene.load.audio("door-open", "audio/portcullis2.mp3");
    scene.load.audio("door-hit", "audio/axe-hitting-stone.mp3");
  }

  lock() {
    this.locked = true;
  }
  unlock() {
    this.portcullis.play("door-open", { volume: 2 });
    this.locked = false;
    // entry hitbox
    this.portcullisBody.setSize(50, 10);
    this.portcullisBody.setOffset(0, 7);
    this.setVulnerable(false);
  }

  /** @param {Phaser.Math.Vector2} position */
  create(position) {
    super.create();
    this.setVulnerable(false);
    this.portcullis = this.mainSprite = this.scene.add.sprite(
      250,
      500,
      "door-open"
    );
    this.portcullis.setScale(PIXEL_SCALE);
    this.portcullis.copyPosition(position);
    this.scene.physics.add.existing(this.portcullis);
    this.portcullis.setDataEnabled();
    this.portcullis.data.set("actor", this);

    // save a reference to the player body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.portcullisBody = this.portcullis.body;

    // this.hands = this.scene.add.circle(0, 0, 20, 0x919191, 1);

    this.portcullis.on(Phaser.Animations.Events.ANIMATION_START, (anim) => {
      this.scene.sound.play("door-open");
    });
    this.portcullis.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      console.log("door finished opening");
    });
  }

  update() {}

  /**
   * Create animations to be used by any Player instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    scene.anims.create({
      key: "door-open",
      frames: scene.anims.generateFrameNumbers("door-open"),
      frameRate: 15,
      repeat: 0,
    });
  }

  die() {
    this.setVulnerable(false);
    // override so this doesn't actually die
  }

  /**
   * Cause damage to this actor.
   * @param {number} inflictedDamage
   */
  takeDamage() {
    this.hp = 0;
    if (this.vulnerable) {
      this.scene.sound.play("door-hit");
      this.unlock();
    }
    this.die();
  }

  dealDamage() {
    // this.scene.sound.play(["axe-hit1", "axe-hit2"][Math.round(Math.random())]);
  }
}
