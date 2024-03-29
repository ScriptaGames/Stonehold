import Phaser from "phaser";
import { Enemy } from "./enemy";
import { PIXEL_SCALE, CAPTAIN_DROP_CHANCE, CAPTAIN_AGGRO_RANGE, CAPTAIN_AGGRO_FRIEND_RANGE } from "../variables";
import { PoisonBall } from "./poison_ball";

export class Captain extends Enemy {
  /** @param {Phaser.Scene} scene */
  constructor(scene, config) {
    super(scene, { hp: config.captainHP, damage: config.captainAttackDamage });

    this.captainAttackRange = config.captainAttackRange;
    this.captainIdleAfterAttack = config.captainIdleAfterAttack;
    this.captainProjectileSpeed = config.captainProjectileSpeed;
    this.captainSpeed = config.captainSpeed * (Math.random() / 10 + 1);

    this.dropChance = CAPTAIN_DROP_CHANCE;
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
      frameWidth: 36,
      frameHeight: 36,
    });
    scene.load.spritesheet(
      "poison-ball-explosion",
      "images/poisonBall_explosion_strip.png",
      {
        frameWidth: 96,
        frameHeight: 96,
      }
    );

    scene.load.audio("captain-dies", "audio/captain-dies.mp3");
    scene.load.audio("captain-roar", "audio/captain-roar.mp3");
    scene.load.audio("enemy-damaged", "audio/enemy-damaged.mp3");
    scene.load.audio("enemy-hit-aah", "audio/enemy-hit-aah.mp3");
  }

  create() {
    super.create();
    this.captain = this.mainSprite = this.scene.add.sprite(250, 500);
    this.captain.setScale(PIXEL_SCALE);
    this.captain.play("captain-run");
    this.scene.physics.add.existing(this.captain);
    this.captain.setDataEnabled();
    this.captain.data.set("actor", this);

    this.poisonBalls = this.scene.add.group({
      classType: PoisonBall,
      maxSize: 50,
      runChildUpdate: true,
    });

    // save a reference to the captain body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.captainBody = this.captain.body;
    this.captainBody.immovable = true;

    // adjust hitbox
    this.captainBody.setSize(28, 26);
    this.captainBody.setOffset(17, 28);

    this.isAttacking = false;

    this.scene.events.addListener("enemyAggro",
      /**
       * @param {Phaser.Math.Vector2} pos
       */
      (pos) => {
        let friend_distance = this.captainBody.position.distance(pos);
        if (friend_distance <= CAPTAIN_AGGRO_FRIEND_RANGE) {
          this.isAggro = true;
          console.debug("AGGRO captain tags along");
        }
    });
  }

  update() {
    this.captain.depth = this.captain.y + this.captain.height;

    this.playerDistance = new Phaser.Math.Vector2()
      .copy(this.scene.player.player)
      .subtract(this.captain);

    if (this.playerDistance.length() < this.captainAttackRange) {
      this.attack();
    }

    if (!this.isAggro && this.playerDistance.length() <= CAPTAIN_AGGRO_RANGE) {
      console.debug("AGGRO player entered captain aggro range");
      // let nearby enemies know about the aggro
      this.scene.events.emit("enemyAggro", this.captainBody.position, this);
      this.isAggro = true;
    }

    this.handleMovement();
  }

  /**
   * Create animations to be used by any Captain instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    ["captain-idle", "captain-run", "poison-ball"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: -1,
      });
    });

    ["captain-attack", "poison-ball-explosion"].forEach((name) => {
      let res = scene.anims.create({
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
      this.captain.setFlipX(targetX > this.captain.x);
      const vel = this.playerDistance.normalize().scale(this.captainSpeed);
      this.captainBody.setVelocity(vel.x, vel.y);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  attack() {
    if (this.isAttacking || !this.playerDistance) return;

    const targetX = this.scene.player.player.x;
    this.captain.setFlipX(targetX > this.captain.x);

    this.isAttacking = true;

    this.captainBody.setVelocity(0, 0);

    const poisonOffset = new Phaser.Math.Vector2(20, -50);
    if (this.captain.flipX) {
      poisonOffset.x *= -1;
    }
    const poisonPos = new Phaser.Math.Vector2()
      .copy(this.captain)
      .subtract(poisonOffset);

    let poisonBallDirection = this.playerDistance;

    this.scene.time.addEvent({
      delay: 600,
      callback: () => this.spawnPoisonBalls(poisonPos, poisonBallDirection),
      callbackScope: this,
    });

    this.captain.anims.stop();
    this.captain.play("captain-attack");

    this.captain.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.captain.play("captain-idle");
      this.scene.time.addEvent({
        delay: this.captainIdleAfterAttack,
        callback: this.attackComplete,
        callbackScope: this,
      });
    });
  }

  attackComplete() {
    if (!this.isAlive) return;

    this.captain.play("captain-run");
    this.isAttacking = false;
  }

  spawnPoisonBalls(pos, dir) {
    let patternChance = Phaser.Math.RND.frac() * 100;
    if (patternChance < 50) {
      this.linearSpawnPattern(pos, dir);
    } else {
      this.arcSpawnPattern(pos, dir);
    }
  }

  linearSpawnPattern(pos, dir) {
    this.scene.time.addEvent({
      delay: 50,
      callback: () => this.spawnPoisonBall(pos, dir),
      callbackScope: this,
      repeat: 4,
    });
  }

  arcSpawnPattern(pos, dir) {
    const spreadAngle = Phaser.Math.DegToRad(10);
    let offsetAngle = -1.5 * spreadAngle;
    this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        this.spawnPoisonBall(pos, dir.rotate(offsetAngle));
        offsetAngle += spreadAngle;
      },
      callbackScope: this,
      repeat: 4,
    });
  }

  spawnPoisonBall(pos, dir) {
    let poisonBall = this.poisonBalls.get();
    if (poisonBall) {
      poisonBall.fire(pos.x, pos.y, dir);
    }
  }

  /**
   * Cause damage to this actor.
   * @param {number} inflictedDamage
   */
  takeDamage(inflictedDamage) {
    super.takeDamage(inflictedDamage);
    if (this.vulnerable) {
      this.scene.sound.play(
        ["enemy-damaged", "enemy-hit-aah"][Math.round(Math.random())]
      );
    }
  }

  playDeathAnim() {
    super.playDeathAnim();
    this.captain.removeAllListeners();
    this.captain.anims.stop();
    // this seems like a good death anim, with the hands flying up
    this.scene.sound.play("captain-dies", { volume: 4 });
  }

  dealDamage() {
    this.scene.sound.play(["axe-hit1", "axe-hit2"][Math.round(Math.random())]);
  }
}
