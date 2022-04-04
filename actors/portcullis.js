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

    scene.load.audio("door-open", "audio/portcullis.mp3");
    scene.load.audio("door-hit", "audio/axe-hitting-stone.mp3");
  }

  lock() {
    this.locked = true;
    console.log("locked");
  }
  unlock() {
    this.portcullis.play("door-open");
    this.locked = false;
    // entry hitbox
    this.portcullisBody.setSize(50, 10);
    this.portcullisBody.setOffset(0, 7);
    this.setVulnerable(false);
    console.log("unlocked");
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
    window.door = this;

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

  createMouse() {
    this.scene.input.mouse.disableContextMenu(); // disable right click menu

    this.mouse = new Phaser.Math.Vector2(0, 0);
    this.scene.input.on("pointermove", (pointer) => {
      this.mouse.copy(pointer);
    });

    this.scene.input.on("pointerdown", (pointer) => {
      if (pointer.button == 0) {
        // if trying to attack while already attacking, then try a combo
        if (this.attack.attacking) {
          this.attack.performCombo = true;
        }
        this.trySwingAxe();
      } else if (pointer.button == 2) {
        this.tryUltimateAbility();
      } else {
        console.log(`got pointer ${pointer.button}`);
      }
    });
  }

  createKeyboardControls() {
    /** Various state about dodging. */
    this.dodge = {
      x: 0,
      y: 0,
      ready: true,
      keyReleased: true,
      dodging: false,
      gracePeriod: true,
    };
    /** Various state about dwarf's attacks. */
    this.attack = {
      /** True when the attack animation is playing. */
      attacking: false,
      /** True when not attacking, and true near the end of the attack animation, when the animation is still playing, but it's possible to move and dodge again. */
      gracePeriod: true,
      /** True when the axe is in one of it's "damage frames", ie the frames in the spritesheet where there's a BIG SWOOSH. */
      activeFrame: false,
      /** True when attacking during the first sequence of the combo. */
      performCombo: false,
    };

    this.kb = this.scene.input.keyboard.addKeys("W,A,S,D,SPACE,SHIFT");
  }

  handleKeyboard() {
    this.portcullisBody.setVelocity(0, 0);

    // choose whether to play/continue idle, run, or dodge anim
    let isRunning =
      this.kb.W.isDown ||
      this.kb.A.isDown ||
      this.kb.S.isDown ||
      this.kb.D.isDown;
    if (this.dodge.dodging && this.attack.gracePeriod) {
      // since we're dodging, flip the sprite in the direction of the dodge
      this.portcullis.setFlipX(this.dodge.x < 0);
      // play dodge anim if not already playing it
      if (this.portcullis.anims.getName() !== "dwarf-dodge") {
        this.portcullis.play("dwarf-dodge");
      }
    } else if (!this.attack.attacking) {
      if (isRunning) {
        // play run anim if not already playing it
        if (this.portcullis.anims.getName() !== "dwarf-run") {
          this.portcullis.play("dwarf-run");
          this.leftHand.play({
            key: "left-hand",
          });
          this.rightHand.play({
            key: "right-hand",
          });
        }
      } else {
        // play idle anim if not already playing it
        if (this.portcullis.anims.getName() !== "dwarf-idle") {
          this.portcullis.play("dwarf-idle");
        }
        this.leftHand.stop();
        this.rightHand.stop();
      }
    }

    // apply WASD motion if dodge status allows it

    if (this.dodge.gracePeriod && this.attack.gracePeriod) {
      // apply left/right motion
      if (this.kb.A.isDown) {
        this.portcullisBody.setVelocityX(-1);
        this.dodge.x = -1;
        this.portcullis.setFlipX(true);
      } else if (this.kb.D.isDown) {
        this.portcullisBody.setVelocityX(1);
        this.dodge.x = 1;
        this.portcullis.setFlipX(false);
      }

      // apply up/down motion
      if (this.kb.W.isDown) {
        this.portcullisBody.setVelocityY(-1);
        this.dodge.y = -1;
      } else if (this.kb.S.isDown) {
        this.portcullisBody.setVelocityY(1);
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
    if (
      this.kb.SPACE.isDown &&
      this.dodge.ready &&
      this.dodge.keyReleased &&
      this.attack.gracePeriod
    ) {
      // start dodging
      this.dodge.dodging = true;
      this.dodge.ready = false;
      this.dodge.keyReleased = false;
      this.dodge.gracePeriod = false;

      // become invul during the dodge roll
      this.setVulnerable(false);

      // apply speed boost in the direction of the dodge
      this.speedBoost.copy(this.dodge).normalize().scale(DODGE_SPEED_BONUS);

      this.portcullisBody.setVelocity(this.dodge.x, this.dodge.y);

      // start cooldown timer
      this.scene.time.delayedCall(
        DODGE_COOLDOWN,
        () => (this.dodge.ready = true)
      );

      // start dodge duration timer
      this.scene.time.delayedCall(
        DODGE_DURATION,
        () => (this.dodge.dodging = false)
      );

      // start timer until player can move with WASD again
      this.scene.time.delayedCall(DODGE_GRACE_PERIOD, () => {
        this.dodge.gracePeriod = true;

        // become vulnerable again during the grace period
        this.setVulnerable(true);
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

    this.portcullisBody.velocity
      .normalize()
      .scale(PLAYER_SPEED)
      .add(this.speedBoost);
  }

  updateHandPosition() {
    this.leftHand.copyPosition(this.portcullis);
    this.leftHand.setFlipX(this.portcullis.flipX);

    this.rightHand.copyPosition(this.portcullis);
    this.rightHand.setFlipX(this.portcullis.flipX);

    // also update the weapon hitbox position
    if (!this.attack.attacking) {
      this.axe.copyPosition(this.portcullis);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  trySwingAxe() {
    // yes, this looks wrong, but just, I mean... just trust me.
    this.axeLive(false);

    if (this.dodge.gracePeriod && this.attack.gracePeriod) {
      this.attack.attacking = true;
      this.attack.gracePeriod = false;

      this.portcullis.setFlipX(
        this.scene.cameras.main.getWorldPoint(this.mouse.x, this.mouse.y).x -
          this.portcullis.x <
          0
      );

      // also set the horizontal dodge direction to match the direction the player is facing
      this.dodge.x = this.portcullis.flipX ? -1 : 1;

      this.leftHand.setVisible(false);
      this.rightHand.setVisible(false);
      this.axe.setFlipX(this.portcullis.flipX);

      const axeOffset = new Phaser.Math.Vector2()
        .copy(this.scene.cameras.main.getWorldPoint(this.mouse.x, this.mouse.y))
        .subtract(this.portcullis)
        .normalize()
        .scale(WEAPON_HOVER_DISTANCE);

      const axePos = axeOffset.clone().add(this.portcullis);

      // rotate towards the cursor
      this.axe.setRotation(axeOffset.angle() * 2);
      // apply special compensation to make downward attacks look better (FRAGILE, hope to replace)
      if (axeOffset.y > 0) {
        if (axeOffset.x > 0) {
          this.axe.rotation -= axeOffset.y / 36;
        } else {
          this.axe.rotation += axeOffset.y / 36;
        }
      }

      this.axeBody.position.copy(axePos);

      this.axe.copyPosition(this.axeBody.position);

      this.axe.on(
        Phaser.Animations.Events.ANIMATION_UPDATE,
        /** @param {number} frameIndex */
        // not sure what the first three args are
        (foo, bar, baz, frameIndex) => {
          // enable hitbox on the big SWOOSH frames
          this.axeLive(frameIndex == 2 || frameIndex == 7);
          console.log(`attack frame ${foo.key} ${frameIndex}`);
        }
      );

      this.axe.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
        if (anim.key == "axe-attack1" && this.attack.performCombo) {
          this.playSecondAttack();
        } else {
          this.attack.attacking = false;
          this.leftHand.setVisible(true);
          this.rightHand.setVisible(true);
        }
      });

      if (this.attack.performCombo) {
        this.playSecondAttack();
      } else {
        this.playFirstAttack();
      }
    }
  }

  playFirstAttack() {
    console.log("first attack");
    this.attack.canCombo = true;

    // play attack anims
    this.axe.stop();
    this.axe.play({
      key: "axe-attack1",
      hideOnComplete: true,
      showOnStart: true,
    });
    this.portcullis.play("dwarf-attack1");

    this.scene.time.delayedCall(ATTACK_GRACE_PERIOD, () => {
      if (!this.attack.performCombo) {
        this.attack.gracePeriod = true;
      }
    });

    this.scene.time.delayedCall(COMBO_ATTACK_INPUT_PERIOD, () => {
      this.attack.performCombo = false;
    });
  }

  playSecondAttack() {
    console.log("second attack");

    // play attack anims
    this.axe.play({
      key: "axe-attack2",
      hideOnComplete: true,
      showOnStart: true,
      startFrame: 5,
    });
    this.portcullis.play({
      key: "dwarf-attack2",
      startFrame: 5,
    });

    this.scene.time.delayedCall(
      ATTACK_COMBO_GRACE_PERIOD,
      () => (this.attack.gracePeriod = true)
    );
  }

  tryUltimateAbility() {
    console.log(`ultimate charge: ${this.ultimateCharge}`);
    if (
      this.dodge.gracePeriod &&
      this.attack.gracePeriod &&
      this.ultimateCharge >= 1.0
    ) {
      this.attack.attacking = true;
      this.attack.gracePeriod = false;
      this.ultimateCharge = 0.0;

      this.leftHand.setVisible(false);
      this.rightHand.setVisible(false);

      this.portcullis.play("ultimate-attack");

      this.scene.time.delayedCall(
        ULTIMATE_ATTACK_GRACE_PERIOD,
        () => (this.attack.gracePeriod = true)
      );

      this.portcullis.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.scene.time.delayedCall(PLAYER_AFTER_ULTIMATE_DELAY, () => {
          this.attack.attacking = false;
          this.leftHand.setVisible(true);
          this.rightHand.setVisible(true);
        });

        this.scene.cameras.main.shake(500);

        this.spawnUltimateExplosion();
      });
    }
  }

  spawnUltimateExplosion() {
    this.ultimateActive = true;
    this.ultimateExplosion.setVisible(true);
    this.ultimateExplosion.setPosition(this.portcullis.x, this.portcullis.y);
    this.ultimateExplosion.play("ultimate-explosion");
    this.scene.sound.play("ultimate-boom", { volume: 4 });

    // ultimate should only deal damage briefly when it lands
    this.scene.time.delayedCall(5, () => (this.ultimateActive = false));

    this.ultimateExplosion.on(
      Phaser.Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.ultimateExplosion.setVisible(false);
      }
    );
  }

  addUltimateCharge() {
    if (!this.ultimateActive) {
      this.ultimateCharge = Phaser.Math.Clamp(
        this.ultimateCharge + ULTIMATE_CHARGE_PER_ENEMY,
        0,
        1
      );
    }
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
