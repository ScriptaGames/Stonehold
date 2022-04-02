import Phaser from "phaser";
import {
  PLAYER_SPEED,
  DODGE_SPEED_BONUS,
  DODGE_COOLDOWN,
  DODGE_DURATION,
  WEAPON_HOVER_DISTANCE,
} from "../variables";

export class Player {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }
  preload() {
    this.scene.load.image("smear", "images/smear.png");
  }
  create() {
    this.player = this.scene.add.rectangle(40, 400, 40, 80, 0xf1f1f1, 1);
    this.scene.physics.add.existing(this.player);

    // save a reference to the player body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.playerBody = this.player.body;

    this.speedBoost = 0;

    this.hands = this.scene.add.circle(0, 0, 20, 0x919191, 1);
    this.scene.physics.add.existing(this.hands);

    this.createSmear();
    this.createKeyboardControls();
    this.createMouse();
  }

  update() {
    this.handleKeyboard();
    this.updateHandPosition();
  }

  createMouse() {
    this.scene.input.mouse.disableContextMenu(); // disable right click menu

    this.mouse = new Phaser.Math.Vector2(0, 0);
    this.scene.input.on("pointermove", (pointer) => {
      this.mouse.copy(pointer);
    });

    this.scene.input.on("pointerdown", () => {
      this.swingWeapon();
    });
  }

  createSmear() {
    this.particles = this.scene.add.particles("smear");

    this.particlesEmitter = this.particles.createEmitter({
      // frame: "spritesheetFrame", // spritesheet frame
      x: 400,
      y: 300,
      lifespan: 600,
      quantity: 0,
      scale: 1.6,
      alpha: { start: 0.5, end: 0, ease: Phaser.Math.Easing.Quintic.Out },
      blendMode: Phaser.BlendModes.COLOR,
    });
  }

  createKeyboardControls() {
    this.dodgeStatus = { x: 0, y: 0, ready: true, keyReleased: true };
    this.kb = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE");
  }

  handleKeyboard() {
    this.playerBody.setVelocity(0, 0);

    if (this.kb.A.isDown) {
      this.playerBody.setVelocityX(-1);
      this.dodgeStatus.x = -1;
    } else if (this.kb.D.isDown) {
      this.playerBody.setVelocityX(1);
      this.dodgeStatus.x = 1;
    }

    if (this.kb.W.isDown) {
      this.playerBody.setVelocityY(-1);
      this.dodgeStatus.y = -1;
    } else if (this.kb.S.isDown) {
      this.playerBody.setVelocityY(1);
      this.dodgeStatus.y = 1;
    }

    // if space is pressed, and dodge is off cooldown, and the key has been
    // released since the last dodge, then dodge!
    if (
      this.kb.SPACE.isDown &&
      this.dodgeStatus.ready &&
      this.dodgeStatus.keyReleased
    ) {
      console.log("DODGE");
      this.dodgeStatus.ready = false;
      this.dodgeStatus.keyReleased = false;

      // update speed boost
      this.speedBoost = DODGE_SPEED_BONUS;

      // start cooldown timer
      this.scene.time.addEvent({
        delay: DODGE_COOLDOWN,
        callback: () => {
          this.dodgeStatus.ready = true;
        },
      });

      // tween the speedBoost back to
      this.scene.tweens.add({
        targets: this,
        speedBoost: 0, // the property to tween
        delay: 0,
        duration: DODGE_DURATION, // ms
        ease: Phaser.Math.Easing.Quadratic.InOut, // https://easings.net/ and https://photonstorm.github.io/phaser3-docs/Phaser.Math.Easing.html
        paused: false,
      });
    }
    // detect dodge key release
    if (this.kb.SPACE.isUp) {
      this.dodgeStatus.keyReleased = true;
    }

    this.playerBody.velocity.normalize().scale(PLAYER_SPEED + this.speedBoost);
  }

  updateHandPosition() {
    this.hands.body.position.copy(this.playerBody.position);
    this.hands.body.position
      .subtract(this.mouse)
      .negate()
      .normalize()
      .scale(WEAPON_HOVER_DISTANCE)
      .add(this.playerBody.position);
  }

  swingWeapon() {
    this.smear();
  }

  smear() {
    // position the smear a little farther out than the hands
    const smearPos = this.hands.body.position.clone();
    smearPos.subtract(this.playerBody.position);
    smearPos.scale(2);
    smearPos.add(this.hands.body.position);

    this.particlesEmitter.emitParticle(1, smearPos.x + 20, smearPos.y + 20);
  }
}
