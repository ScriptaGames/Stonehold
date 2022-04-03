import Phaser from "phaser";
import { PIXEL_SCALE, CAPTAIN_ATTACK_DAMAGE, CAPTAIN_SPEED, CAPTAIN_ATTACK_RANGE, CAPTAIN_PROJECTILE_SPEED, CAPTAIN_IDLE_AFTER_ATTACK } from "../variables";

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
    this.captain.play("captain-run");
    this.scene.physics.add.existing(this.captain);
    this.captain.setDataEnabled();
    this.captain.data.set("actor", this);

    // this.ball = this.scene.add.sprite(this.captain.x, this.captain.y, "poison-ball");
    // this.ball.setScale(PIXEL_SCALE);
    // this.ball.play("poison-ball");
    // this.scene.physics.add.existing(this.ball);
    //ball.body.setVelocity(this.playerDistance.normalize().scale(1));

    // save a reference to the captain body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.captainBody = this.captain.body;
    this.captainBody.immovable = true;

    // adjust hitbox
    this.captainBody.setSize(28, 26);
    this.captainBody.setOffset(17, 28);

    this.isAttacking = false;

    this.projectiles = [];
  }

  update() {
    this.captain.depth = this.captain.y + this.captain.height;

    this.playerDistance = new Phaser.Math.Vector2()
      .copy(this.scene.player.player)
      .subtract(this.captain);

    if (this.playerDistance.length() < CAPTAIN_ATTACK_RANGE) {
      this.attack();
    }

    this.projectiles.forEach((projectile) => projectile.update());

    this.handleMovement();
  }

  /**
   * Create animations to be used by any Captain instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    ["captain-idle", "captain-run"].forEach(
      (name) => {
        scene.anims.create({
          key: name,
          frames: scene.anims.generateFrameNumbers(name),
          frameRate: 10,
          repeat: -1,
        });
      }
    );
    ["captain-attack", "poison-ball"].forEach(
      (name) => {
        scene.anims.create({
          key: name,
          frames: scene.anims.generateFrameNumbers(name),
          frameRate: 10,
          repeat: 0,
        });
      }
    );
  }

  handleMovement() {
    if (!this.isAttacking) {
      const targetX = this.scene.player.player.x;
      this.captain.setFlipX(targetX > this.captain.x);
      const vel = this.playerDistance
        .normalize()
        .scale(CAPTAIN_SPEED);
      this.captainBody.setVelocity(vel.x, vel.y);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {
    if (this.isAttacking) return;

    const targetX = this.scene.player.player.x;
    this.captain.setFlipX(targetX > this.captain.x);
    
    this.isAttacking = true;

    this.captainBody.setVelocity(0, 0);

    this.captain.anims.stop();
    this.captain.play("captain-attack");

    this.captain.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.captain.play("captain-idle");
      this.scene.time.addEvent({
        delay: CAPTAIN_IDLE_AFTER_ATTACK,
        callback: this.attackComplete,
        callbackScope: this,
      });
    });
  }

  attackComplete() {
    this.captain.play("captain-run");
    this.isAttacking = false;
  }

  /** Get the attack damage of this captain.  May be adjusted from  */
  getAttackDamage() {
    return this.baseAttackDamage;
  }
}
