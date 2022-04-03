export class Actor {
  constructor({ hp, damage }) {
    this.hp = hp;
    this.damage = damage;
  }
  /**
   * Cause damage to this actor.
   * @param {number} inflictedDamage
   */
  inflictDamage(inflictedDamage) {
    this.hp -= inflictedDamage;

    console.log(
      `player took ${inflictedDamage} damage and is now at ${this.hp} hp`
    );

    if (this.hp <= 0) {
      this.die();
    }
  }

  /**
   * Make this actor die.
   */
  die() {
    console.log("ACTOR has ceased to be", this);
  }
}
