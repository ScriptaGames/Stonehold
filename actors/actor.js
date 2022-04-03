import Phaser from "phaser";
import { ACTOR_DAMAGE_INVUL_PERIOD } from "../variables";

export class Actor {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, { hp, damage }) {
    this.scene = scene;
    this.hp = hp;
    this.damage = damage;
    window.pinky = this;
    /** Is the actor vulnerable.  Post-damage, actors are invul for a moment. */

    this.setVulnerable(true);

    /** The actor's main sprite, as in ".player", ".pinky", etc.
     * @type {Phaser.GameObjects.Sprite?}
     */
    this.mainSprite;
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
   */
  inflictDamage(inflictedDamage) {
    if (this.vulnerable) {
      this.hp -= inflictedDamage;

      // after taking damage, become invul for a moment
      this.setVulnerable(false);

      console.log(
        `ACTOR took ${inflictedDamage} damage and is now at ${this.hp} hp`
      );

      if (this.hp <= 0) {
        this.die();
      }

      // damage flash effect
      this.mainSprite.setTintFill(0xf1f1f1);
      this.scene.time.delayedCall(128, () => this.mainSprite.clearTint());

      // make actor vulnerable again after a delay
      this.scene.time.delayedCall(ACTOR_DAMAGE_INVUL_PERIOD, () =>
        this.setVulnerable(true)
      );
    }
  }

  /**
   * Make this actor die.
   */
  die() {
    console.log("ACTOR has ceased to be");
  }
}
