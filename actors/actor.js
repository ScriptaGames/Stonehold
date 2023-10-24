import Phaser from "phaser";
import { ACTOR_DAMAGE_INVUL_PERIOD } from "../variables";

export class Actor {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, { hp, damage }) {
    /** A reference to the Phaser.Scene the actor is a member of.
     * @type {Phaser.Scene}
     */
    this.scene = scene;
    /** The actor's current HP.
     * @type {number}
     */
    this.hp = hp;
    /** The actor's current attack damage.
     * @type {Phaser.Scene}
     */
    this.damage = damage;

    /** Actor starts vulnerable. Post-damage, actors are invul for a moment. */
    this.setVulnerable(true);

    /** The actor's main sprite, as in ".player", ".pinky", etc.
     * @type {Phaser.GameObjects.Sprite?}
     */
    this.mainSprite;

    /** Is this actor still alive?
     * @type {boolean}
     */
    this.isAlive = true;
  }

  create() {}

  /**
   * Set the actor as vulnerable or not.
   * @param {boolean} vul
   */
  setVulnerable(vul) {
    this.vulnerable = vul;
  }

  /**
   * Cause damage to this actor.
   * @param {number} inflictedDamage
   * @returns boolean on whether the enemy was killed
   */
  takeDamage(inflictedDamage) {
    if (this.vulnerable) {
      this.hp -= inflictedDamage;

      // after taking damage, become invul for a moment
      this.setVulnerable(false);

      console.debug(
        `ACTOR took ${inflictedDamage} damage and is now at ${this.hp} hp`
      );

      if (this.hp <= 0) {
        console.debug("ACTOR took fatal damage");
        this.die();
      } else {
        // make actor vulnerable again after a delay
        this.scene.time.delayedCall(ACTOR_DAMAGE_INVUL_PERIOD, () =>
          this.setVulnerable(true)
        );
      }

      // damage flash effect
      this.mainSprite.setTintFill(0xf1f1f1);
      this.scene.time.delayedCall(128, () => this.mainSprite.clearTint());
    }
  }

  /**
   * Make this actor die.
   */
  die() {
    if (this.isAlive) {
      this.isAlive = false;

      // set invul on death to avoid taking more damage. TODO consider removing
      // this, it might feel cool for further weapon swipes to cause flash
      // effects even during the death anim
      this.setVulnerable(false);

      // play the actor's unique death animation
      this.playDeathAnim();

      this.scene.events.emit("actor-death", this);
    }
  }

  /** Play the actor's death animation.  Override this to customize the death anim. */
  playDeathAnim() {
    this.scene.tweens.addCounter({
      from: 255,
      to: 0,
      duration: 500,
      ease: Phaser.Math.Easing.Elastic.In, // https://easings.net/ and https://photonstorm.github.io/phaser3-docs/Phaser.Math.Easing.html
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        this.mainSprite.setTint(
          Phaser.Display.Color.GetColor(value, value, value)
        );
      },
    });

    this.scene.tweens.add({
      targets: this.mainSprite,
      alpha: 0, // the property to tween
      duration: 1500, // ms
      ease: Phaser.Math.Easing.Quartic.In, // https://easings.net/ and https://photonstorm.github.io/phaser3-docs/Phaser.Math.Easing.html
      onComplete: () => {
        this.mainSprite.destroy();
      },
    });
  }

  /**
   * Meant to be overridden.  This method is run so the actor can do any
   * custom stuff when it deals damage to another, like playing sfx.
   */
  dealDamage() {}
}
