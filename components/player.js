import Phaser from "phaser";
import {
  PLAYER_SPEED,
  DODGE_SPEED_BONUS,
  DODGE_COOLDOWN,
  DODGE_DURATION,
  WEAPON_HOVER_DISTANCE,
  DODGE_FREEZE_DURATION,
} from "../variables";

export class Player {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    this.scene = scene;
  }
  preload() {
    this.scene.load.image("smear", "images/smear.png");
    this.scene.load.spritesheet(
      "dwarf-idle",
      "images/dwarfBody_idle_strip.png",
      { frameWidth: 36, frameHeight: 36 }
    );
    this.scene.load.spritesheet("dwarf-run", "images/dwarfBody_run_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
    });
    this.scene.load.spritesheet(
      "dwarf-dodge",
      "images/dwarfBody_dodge_strip.png",
      { frameWidth: 36, frameHeight: 36 }
    );
  }
  create() {
    this.player = this.scene.add.sprite(250, 500);
    this.player.setScale(3);
    this.player.play("dwarf-idle");
    this.player.setOrigin(0.5);
    this.scene.physics.add.existing(this.player);

    // save a reference to the player body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.playerBody = this.player.body;

    this.speedBoost = new Phaser.Math.Vector2();

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

  /**
   * Create animations to be used by any Player instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    ["dwarf-idle", "dwarf-run", "dwarf-dodge"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: -1,
      });
    });
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
    this.dodge = {
      x: 0,
      y: 0,
      ready: true,
      keyReleased: true,
      dodging: false,
      wasdEnabled: true,
    };
    this.kb = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE");
  }

  handleKeyboard() {
    this.playerBody.setVelocity(0, 0);

    // choose whether to play/continue idle, run, or dodge anim
    let isWalking =
      this.kb.W.isDown ||
      this.kb.A.isDown ||
      this.kb.S.isDown ||
      this.kb.D.isDown;
    if (this.dodge.dodging) {
      // since we're dodging, flip the sprite in the direction of the dodge
      this.player.setFlipX(this.dodge.x < 0);
      // play dodge anim if not already playing it
      if (this.player.anims.getName() !== "dwarf-dodge") {
        this.player.play("dwarf-dodge");
      }
    } else {
      // if we aren't dodging, flip the sprite in the direction the mouse is facing
      this.player.setFlipX(this.mouse.x - this.player.x < 0);
      if (isWalking) {
        // play run anim if not already playing it
        if (this.player.anims.getName() !== "dwarf-run") {
          this.player.play("dwarf-run");
        }
      } else {
        // play idle anim if not already playing it
        if (this.player.anims.getName() !== "dwarf-idle") {
          this.player.play("dwarf-idle");
        }
      }
    }

    // apply WASD motion if dodge status allows it

    if (this.dodge.wasdEnabled) {
      // apply left/right motion
      if (this.kb.A.isDown) {
        this.playerBody.setVelocityX(-1);
        this.dodge.x = -1;
      } else if (this.kb.D.isDown) {
        this.playerBody.setVelocityX(1);
        this.dodge.x = 1;
      }

      // apply up/down motion
      if (this.kb.W.isDown) {
        this.playerBody.setVelocityY(-1);
        this.dodge.y = -1;
      } else if (this.kb.S.isDown) {
        this.playerBody.setVelocityY(1);
        this.dodge.y = 1;
      }

      // ensure the next dodge is pointing in the right direction
      const goingHoriz = this.kb.A.isDown || this.kb.D.isDown;
      const goingVert = this.kb.W.isDown || this.kb.S.isDown;
      if (goingHoriz && !goingVert) {
        this.dodge.y = 0;
      }
      if (goingVert && !goingHoriz) {
        this.dodge.x = 0;
      }
    }

    // if space is pressed, and dodge is off cooldown, and the key has been
    // released since the last dodge, then dodge!
    if (this.kb.SPACE.isDown && this.dodge.ready && this.dodge.keyReleased) {
      // start dodging
      this.dodge.dodging = true;
      this.dodge.ready = false;
      this.dodge.keyReleased = false;
      this.dodge.wasdEnabled = false;

      // apply speed boost in the direction of the dodge
      this.speedBoost.copy(this.dodge).normalize().scale(DODGE_SPEED_BONUS);

      this.playerBody.setVelocity(this.dodge.x, this.dodge.y);

      // start cooldown timer
      this.scene.time.addEvent({
        delay: DODGE_COOLDOWN,
        callback: () => {
          this.dodge.ready = true;
        },
      });

      // start dodge duration timer
      this.scene.time.addEvent({
        delay: DODGE_DURATION,
        callback: () => {
          this.dodge.dodging = false;
        },
      });

      // start timer until player can move with WASD again
      this.scene.time.addEvent({
        delay: DODGE_FREEZE_DURATION,
        callback: () => {
          this.dodge.wasdEnabled = true;
        },
      });

      // tween the speedBoost back to 0
      this.scene.tweens.add({
        targets: this.speedBoost,
        x: 0, // the property to tween
        y: 0, // the property to tween
        delay: 0,
        duration: DODGE_DURATION, // ms
        ease: Phaser.Math.Easing.Quartic.Out, // https://easings.net/ and https://photonstorm.github.io/phaser3-docs/Phaser.Math.Easing.html
      });
    }
    // detect dodge key release
    if (this.kb.SPACE.isUp) {
      this.dodge.keyReleased = true;
    }

    this.playerBody.velocity
      .normalize()
      .scale(PLAYER_SPEED)
      .add(this.speedBoost);
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
