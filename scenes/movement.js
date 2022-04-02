import Phaser from "phaser";

const PLAYER_SPEED = 400;
const DODGE_SPEED_BONUS = 1200;
const DODGE_COOLDOWN = 1000;
const DODGE_DURATION = 200;
const WEAPON_HOVER_DISTANCE = 30;

class MovementScene extends Phaser.Scene {
  init() {}
  preload() {
    this.load.image("smear", "images/smear.png");
  }
  create() {
    this.player = this.add.rectangle(40, 400, 40, 80, 0xf1f1f1, 1);
    this.physics.add.existing(this.player);

    this.speedBoost = 0;

    this.hands = this.add.circle(0, 0, 20, 0x919191, 1);
    this.physics.add.existing(this.hands);

    this.createSmear();
    this.createKeyboardControls();
    this.createMouse();
  }

  update() {
    this.handleKeyboard();
    this.updateHandPosition();
  }

  createMouse() {
    this.input.mouse.disableContextMenu(); // disable right click menu

    this.mouse = new Phaser.Math.Vector2(0, 0);
    this.input.on("pointermove", (pointer) => {
      this.mouse.copy(pointer);
    });

    this.input.on("pointerdown", () => {
      this.swingWeapon();
    });
  }

  createSmear() {
    this.particles = this.add.particles("smear");

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
    this.kb = this.input.keyboard.addKeys("W,A,S,D,SPACE");
  }

  handleKeyboard() {
    this.player.body.setVelocity(0, 0);

    if (this.kb.A.isDown) {
      this.player.body.setVelocityX(-1);
      this.dodgeStatus.x = -1;
    } else if (this.kb.D.isDown) {
      this.player.body.setVelocityX(1);
      this.dodgeStatus.x = 1;
    }

    if (this.kb.W.isDown) {
      this.player.body.setVelocityY(-1);
      this.dodgeStatus.y = -1;
    } else if (this.kb.S.isDown) {
      this.player.body.setVelocityY(1);
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
      this.time.addEvent({
        delay: DODGE_COOLDOWN,
        callback: () => {
          this.dodgeStatus.ready = true;
        },
      });

      // tween the speedBoost back to
      this.tweens.add({
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

    this.player.body.velocity.normalize().scale(PLAYER_SPEED + this.speedBoost);
  }

  updateHandPosition() {
    this.hands.body.position.copy(this.player.body.position);
    this.hands.body.position
      .subtract(this.mouse)
      .negate()
      .normalize()
      .scale(WEAPON_HOVER_DISTANCE)
      .add(this.player.body.position);
  }

  swingWeapon() {
    this.smear();
  }

  smear() {
    // position the smear a little farther out than the hands
    const smearPos = this.hands.body.position.clone();
    smearPos.subtract(this.player.body.position);
    smearPos.scale(2);
    smearPos.add(this.hands.body.position);

    this.particlesEmitter.emitParticle(1, smearPos.x + 20, smearPos.y + 20);
  }
}

export default MovementScene;
