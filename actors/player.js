import Phaser from "phaser";
import { Actor } from "./actor";
import {
  PLAYER_SPEED,
  DODGE_SPEED_BONUS,
  DODGE_COOLDOWN,
  DODGE_DURATION,
  WEAPON_HOVER_DISTANCE,
  DODGE_GRACE_PERIOD,
  PIXEL_SCALE,
  ATTACK_GRACE_PERIOD,
  PLAYER_BASE_HP,
  PLAYER_BASE_DAMAGE,
  PLAYER_AFTER_ULTIMATE_DELAY,
  ULTIMATE_ATTACK_GRACE_PERIOD,
  ULTIMATE_ATTACK_RADIUS,
  ULTIMATE_CHARGE_PER_ENEMY,
  COMBO_ATTACK_INPUT_PERIOD,
  ATTACK_COMBO_GRACE_PERIOD,
  ATTACK_LUNGE_SPEED,
  BUFF_HEALTH_AMOUNT,
  BUFF_SPEED_MULTIPLIER,
  BUFF_SPEED_DURATION,
} from "../variables";
import { Captain } from "./captain";
import { Utils } from "../lib/utils";

export class Player extends Actor {
  /** @param {Phaser.Scene} scene */
  constructor(scene, hp = PLAYER_BASE_HP, ultimateCharge = 0.0) {
    super(scene, { hp: hp, damage: PLAYER_BASE_DAMAGE });
    this.ultimateCharge = ultimateCharge;
    this.bonusDamage = 0;
    this.buffSpeedMultiplier = 1;
  }
  /** @param {Phaser.Scene} scene */
  static preload(scene) {
    scene.load.spritesheet("dwarf-idle", "images/dwarfBody_idle_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
    });

    scene.load.spritesheet("dwarf-run", "images/dwarfBody_run_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
    });

    scene.load.spritesheet("dwarf-dodge", "images/dwarfBody_dodge_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
    });

    scene.load.spritesheet(
      "dwarf-attack1",
      "images/dwarfBody_attack_strip.png",
      { frameWidth: 36, frameHeight: 36, startFrame: 0, endFrame: 4 }
    );
    scene.load.spritesheet(
      "dwarf-attack2",
      "images/dwarfBody_attack_strip.png",
      { frameWidth: 36, frameHeight: 36, startFrame: 5 }
    );

    scene.load.spritesheet("axe-attack1", "images/dwarfAxe_attack_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
      startFrame: 0,
      endFrame: 4,
    });
    scene.load.spritesheet("axe-attack2", "images/dwarfAxe_attack_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
      startFrame: 5,
      endFrame: 8,
    });

    scene.load.spritesheet(
      "right-hand",
      "images/dwarfFrontHand_run_strip.png",
      { frameWidth: 36, frameHeight: 36 }
    );

    scene.load.spritesheet("left-hand", "images/dwarfBackHand_run_strip.png", {
      frameWidth: 36,
      frameHeight: 36,
    });

    scene.load.spritesheet(
      "ultimate-attack",
      "images/dwarfFull_ultimate_strip.png",
      {
        frameWidth: 36,
        frameHeight: 36,
      }
    );

    scene.load.spritesheet(
      "ultimate-explosion",
      "images/ultimate_explosion_strip.png",
      {
        frameWidth: 148,
        frameHeight: 148,
      }
    );
    scene.load.audio("swing-big", "audio/swing-big.mp3");
    scene.load.audio("swing-small", "audio/swing-small.mp3");
    scene.load.audio("axe-hit-stone", "audio/axe-hitting-stone.mp3");
    scene.load.audio("footstep", "audio/footstep.mp3");
    scene.load.audio("ultimate", "audio/ultimate-boom.mp3");
    scene.load.audio("player-damaged", "audio/player-damaged.mp3");
    scene.load.audio("player-hit-aah", "audio/player-hit-aah.mp3");
    scene.load.audio("axe-hit1", "audio/weapon-hit.mp3");
    scene.load.audio("axe-hit2", "audio/weapon-hit2.mp3");
    scene.load.audio("ultimate-boom", "audio/ultimate-boom.mp3");
    scene.load.audio("dwarf-dies", "audio/player-dies.mp3");
    scene.load.audio("health-buff", "audio/health_buff.mp3");
    scene.load.audio("speed-buff", "audio/speed_buff.mp3");
  }
  create() {
    super.create();
    this.player = this.mainSprite = this.scene.add.sprite(250, 500);
    this.player.setScale(PIXEL_SCALE);
    this.player.play("dwarf-idle");
    this.player.setOrigin(0.5);
    this.scene.physics.add.existing(this.player);
    this.player.setDataEnabled();
    this.player.data.set("actor", this);

    // save a reference to the player body with the correct type
    /** @type {Phaser.Physics.Arcade.Body} */
    this.playerBody = this.player.body;

    // adjust hitbox
    this.playerBody.setSize(15, 28);
    this.playerBody.setOffset(10, 4);

    this.speedBoost = new Phaser.Math.Vector2();

    // this.hands = this.scene.add.circle(0, 0, 20, 0x919191, 1);

    this.leftHand = this.scene.add.sprite(64, 64, "left-hand");
    this.leftHand.setScale(PIXEL_SCALE);
    // this.leftHand.play("left-hand");
    this.rightHand = this.scene.add.sprite(128, 128, "right-hand");
    this.rightHand.setScale(PIXEL_SCALE);

    // this.scene.physics.add.existing(this.hands);

    this.axe = this.scene.add.sprite(100, 100, "axe-attack");
    this.axe.setScale(PIXEL_SCALE);
    this.axe.visible = false;
    // put axe on top of everything (probably)
    this.axe.setDepth(5000);
    this.scene.physics.add.existing(this.axe);

    // configure ultimate explosion effect
    this.ultimateExplosion = this.scene.add.sprite(100, 100);
    this.ultimateExplosion.setScale(PIXEL_SCALE);
    this.ultimateExplosion.setVisible(false);
    this.scene.physics.add.existing(this.ultimateExplosion);
    this.ultimateExplosionBody = this.ultimateExplosion.body;
    this.ultimateExplosionBody.setSize(100, 100);
    this.ultimateExplosionBody.setOffset(25, 25);
    this.ultimateActive = false;

    this.bonusDamage = Number(Utils.getLocalStoragePlayer().bonus_damage);

    this.createKeyboardControls();
    this.createMouse();

    // set a pretty-good not-too-bad fairly accurate hitbox
    /** @type {Phaser.Physics.Arcade.Body} */
    this.axeBody = this.axe.body;
    this.axeBody.immovable = true;
    // adjust axe hitbox to fit the sprite better
    this.axeBody.setSize(27, 27);
    this.axeLive(false);

    // link footstep sfx to run animation
    this.player.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (anim, _b, _c, frameIndex) => {
        // when dwarf-run hits frame 3, play footstep sfx
        if (anim.key == "dwarf-run" && frameIndex == 3) {
          this.scene.sound.play("footstep");
        }
      }
    );
    // stop footstep sfx immediately when the dwarf-run animation is stopped or completed
    this.player.on(Phaser.Animations.Events.ANIMATION_STOP, (anim) => {
      if (anim.key == "dwarf-run") {
        this.scene.sound.stopByKey("footstep");
      }
    });
    this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      if (anim.key == "dwarf-run") {
        this.scene.sound.stopByKey("footstep");
      }
    });
  }

  update() {
    // set z-index depth
    this.player.depth = this.player.y + this.player.height;
    this.leftHand.depth = this.player.depth - 0.1;
    this.rightHand.depth = this.player.depth + 0.1;

    this.ultimateExplosion.depth =
      this.player.y + this.ultimateExplosion.height;

    this.handleKeyboard();
    this.updateHandPosition();
  }

  /**
   * Create animations to be used by any Player instances.
   * @param {Phaser.Scene} scene
   */
  static createAnims(scene) {
    // loop through each spritesheet and create an animation
    [
      "dwarf-idle",
      "dwarf-run",
      "dwarf-dodge",
      "left-hand",
      "right-hand",
      "dwarf-attack1",
    ].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: -1,
      });
    });
    ["ultimate-attack", "ultimate-explosion"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 10,
        repeat: 0,
      });
    });
    ["axe-attack1"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 15,
        repeat: 0,
      });
    });
    ["axe-attack2", "dwarf-attack2"].forEach((name) => {
      scene.anims.create({
        key: name,
        frames: scene.anims.generateFrameNumbers(name),
        frameRate: 15,
        repeat: 0,
        startFrame: 5,
        endFrame: 8,
      });
    });
  }

  createMouse() {
    this.scene.input.mouse.disableContextMenu(); // disable right click menu

    this.mouse = new Phaser.Math.Vector2(0, 0);
    this.scene.input.on("pointermove", (pointer) => {
      this.mouse.copy(pointer);
    });

    this.scene.input.on("pointerdown", (pointer) => {
      if (this.isAlive) {
        if (pointer.button == 0) {
          // if trying to attack while already attacking, then try a combo
          if (this.attack.attacking) {
            this.attack.performCombo = true;
          }
          this.trySwingAxe();
        } else if (pointer.button == 2) {
          this.tryUltimateAbility();
        } else {
          console.debug(`got pointer ${pointer.button}`);
        }
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
    this.playerBody.setVelocity(0, 0);

    // choose whether to play/continue idle, run, or dodge anim
    let isRunning =
      this.kb.W.isDown ||
      this.kb.A.isDown ||
      this.kb.S.isDown ||
      this.kb.D.isDown;
    if (this.dodge.dodging && this.attack.gracePeriod) {
      // since we're dodging, flip the sprite in the direction of the dodge
      this.player.setFlipX(this.dodge.x < 0);
      // play dodge anim if not already playing it
      if (this.player.anims.getName() !== "dwarf-dodge") {
        this.player.play("dwarf-dodge");
      }
    } else if (!this.attack.attacking) {
      if (isRunning) {
        // play run anim if not already playing it
        if (this.player.anims.getName() !== "dwarf-run") {
          this.player.play("dwarf-run");
          this.leftHand.play({
            key: "left-hand",
          });
          this.rightHand.play({
            key: "right-hand",
          });
        }
      } else {
        // play idle anim if not already playing it
        if (this.player.anims.getName() !== "dwarf-idle") {
          this.player.play("dwarf-idle");
        }
        this.leftHand.stop();
        this.rightHand.stop();
      }
    }

    // apply WASD motion if dodge status allows it

    if (this.dodge.gracePeriod && this.attack.gracePeriod) {
      // apply left/right motion
      if (this.kb.A.isDown) {
        this.playerBody.setVelocityX(-1);
        this.dodge.x = -1;
        this.player.setFlipX(true);
      } else if (this.kb.D.isDown) {
        this.playerBody.setVelocityX(1);
        this.dodge.x = 1;
        this.player.setFlipX(false);
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
    if (
      this.kb.SPACE.isDown &&
      this.dodge.ready &&
      this.dodge.keyReleased //&&
      // this.attack.gracePeriod
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

      this.playerBody.setVelocity(this.dodge.x, this.dodge.y);

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

    this.playerBody.velocity
      .normalize()
      .scale(PLAYER_SPEED * this.buffSpeedMultiplier)
      .add(this.speedBoost);
  }

  updateHandPosition() {
    this.leftHand.copyPosition(this.player);
    this.leftHand.setFlipX(this.player.flipX);

    this.rightHand.copyPosition(this.player);
    this.rightHand.setFlipX(this.player.flipX);

    // also update the weapon hitbox position
    if (!this.attack.attacking || this.dodge.dodging) {
      this.axe.copyPosition(this.player);
    }
  }

  /** Attack, if we're in a state that allows attacking. */
  trySwingAxe() {
    // yes, this looks wrong, but just, I mean... just trust me.
    this.axeLive(false);

    if (this.dodge.gracePeriod && this.attack.gracePeriod) {
      this.attack.attacking = true;
      this.attack.gracePeriod = false;

      this.player.setFlipX(
        this.scene.cameras.main.getWorldPoint(this.mouse.x, this.mouse.y).x -
          this.player.x <
          0
      );

      // also set the horizontal dodge direction to match the direction the player is facing
      this.dodge.x = this.player.flipX ? -1 : 1;

      this.leftHand.setVisible(false);
      this.rightHand.setVisible(false);
      this.axe.setFlipX(this.player.flipX);

      const axeOffset = new Phaser.Math.Vector2()
        .copy(this.scene.cameras.main.getWorldPoint(this.mouse.x, this.mouse.y))
        .subtract(this.player)
        .normalize()
        .scale(WEAPON_HOVER_DISTANCE);

      const axePos = axeOffset.clone().add(this.player);

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
    // play attack anims
    this.axe.stop();
    this.axe.play({
      key: "axe-attack1",
      hideOnComplete: true,
      showOnStart: true,
    });
    this.player.play("dwarf-attack1");

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
    this.attack.performCombo = false;

    // play attack anims
    this.axe.play({
      key: "axe-attack2",
      hideOnComplete: true,
      showOnStart: true,
      startFrame: 5,
    });
    this.player.play({
      key: "dwarf-attack2",
      startFrame: 5,
    });

    this.scene.time.delayedCall(
      ATTACK_COMBO_GRACE_PERIOD,
      () => (this.attack.gracePeriod = true)
    );
  }

  tryUltimateAbility() {
    console.debug(`ultimate charge: ${this.ultimateCharge}`);
    if (
      this.dodge.gracePeriod &&
      this.attack.gracePeriod &&
      this.ultimateCharge >= 1.0
    ) {
      this.attack.attacking = true;
      this.attack.gracePeriod = false;

      this.leftHand.setVisible(false);
      this.rightHand.setVisible(false);

      this.player.play("ultimate-attack");

      this.scene.time.delayedCall(
        ULTIMATE_ATTACK_GRACE_PERIOD,
        () => (this.attack.gracePeriod = true)
      );

      this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
        if (anim.key == "ultimate-attack") {
          this.scene.time.delayedCall(PLAYER_AFTER_ULTIMATE_DELAY, () => {
            this.attack.attacking = false;
            this.leftHand.setVisible(true);
            this.rightHand.setVisible(true);
          });

          this.scene.cameras.main.shake(500);

          this.spawnUltimateExplosion();
        }
      });
    }
  }

  spawnUltimateExplosion() {
    this.ultimateActive = true;
    this.ultimateExplosion.setVisible(true);
    this.ultimateExplosion.setPosition(this.player.x, this.player.y);
    this.ultimateExplosion.play("ultimate-explosion");
    this.scene.sound.play("ultimate-boom", { volume: 4 });

    // reset progress bar
    this.ultimateCharge = 0.0;
    this.scene.events.emit("chargeUltimate", 0, this);

    // ultimate should only deal damage briefly when it lands
    this.scene.time.delayedCall(20, () => (this.ultimateActive = false));

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
      this.scene.events.emit("chargeUltimate", this.ultimateCharge, this);
    }
  }

  /**
   * Enable or disable the axe's damage.  This is to help align the axe's
   * damage with the spritesheet's "big swoosh" frames.
   * @param {number} enabled
   */
  axeLive(enabled) {
    if (enabled) {
      this.attack.activeFrame = true;

      // Fixes bug where ax swing got louder and louder
      this.scene.sound.removeByKey("swing-small");
      this.scene.sound.add("swing-small").play();

      this.performLunge();
    } else {
      this.attack.activeFrame = false;
    }
  }

  performLunge() {
    if (this.isAlive) {
      let lungeDirection = this.scene.cameras.main
        .getWorldPoint(this.mouse.x, this.mouse.y)
        .subtract(this.player)
        .normalize();
      let lunge = new Phaser.Math.Vector2()
        .copy(lungeDirection)
        .normalize()
        .scale(ATTACK_LUNGE_SPEED);

      this.playerBody.velocity.normalize().scale(PLAYER_SPEED).add(lunge);
    }
  }

  playDeathAnim() {
    this.player.stop();
    this.player.disableInteractive();
    this.playerBody.setVelocity(0, 0);
    this.scene.sound.play("dwarf-dies", { volume: 3 });
    this.scene.tweens.addCounter({
      from: 255,
      to: 0,
      duration: 500,
      ease: Phaser.Math.Easing.Elastic.In, // https://easings.net/ and https://photonstorm.github.io/phaser3-docs/Phaser.Math.Easing.html
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        const color = Phaser.Display.Color.GetColor(value, value, value);
        this.mainSprite.setTint(color);
        this.leftHand.setTint(color);
        this.rightHand.setTint(color);
      },
    });
  }

  /**
   * Cause damage to this actor.
   * @param {number} inflictedDamage
   */
  takeDamage(inflictedDamage) {
    if (this.vulnerable) {
      this.scene.sound.play("player-damaged");
    }
    super.takeDamage(inflictedDamage);
    // use damage flash effect on hands too
    this.leftHand.setTintFill(0xf1f1f1);
    this.scene.time.delayedCall(128, () => this.leftHand.clearTint());
    this.rightHand.setTintFill(0xf1f1f1);
    this.scene.time.delayedCall(128, () => this.rightHand.clearTint());

    this.emitHealthBarUpdate();
  }

  emitHealthBarUpdate() {
    this.scene.events.emit(
      "playerUpdateHealthBar",
      this.hp / PLAYER_BASE_HP,
      this
    );
  }

  addHealthPoints() {
    //add hp based on buff value
    this.hp += BUFF_HEALTH_AMOUNT;
    this.hp = Math.min(this.hp, PLAYER_BASE_HP);

    this.scene.sound.play("health-buff", { volume: 3.5 });

    this.emitHealthBarUpdate();
  }

  addSpeedBuff() {
    //TODO: listen for this event if we ever want to update the UI
    //      to indicate that speed buff is active, like putting the boot
    //      in the top left corner or something
    this.scene.events.emit("playerAddSpeedBuff", true, this);

    // apply speed boost and set timeout
    console.debug(
      "applying speed buff, multiplier: ",
      BUFF_SPEED_MULTIPLIER,
      " duration: ",
      BUFF_SPEED_DURATION
    );

    this.buffSpeedMultiplier = BUFF_SPEED_MULTIPLIER;

    // play sound effect
    this.scene.sound.play("speed-buff", { volume: 1.5 });

    this.scene.time.delayedCall(BUFF_SPEED_DURATION, () => {
      console.debug("removing speed buff");
      this.buffSpeedMultiplier = 1;
    });
  }

  dealDamage() {
    if (this.isAlive) {
      this.scene.sound.play(
        ["axe-hit1", "axe-hit2"][Math.round(Math.random())]
      );
    }
  }

  hide() {
    this.player.setVisible(false);
    this.leftHand.setVisible(false);
    this.rightHand.setVisible(false);
    this.axe.setVisible(false);
  }

  getTotalDamage() {
    return this.damage * this.bonusDamage;
  }

  handleBuff(name) {
    switch (name) {
      case "health":
        this.addHealthPoints();
        break;
      case "speed":
        this.addSpeedBuff();
        break;
      default:
        console.debug(`unknown buff: ${name}`);
    }
  }
}
