import Phaser from "phaser";
import { CAPTAIN_ATTACK_DAMAGE, CAPTAIN_PROJECTILE_SPEED } from "../variables";

export class PoisonBall extends Phaser.GameObjects.Sprite {
  /** @param {Phaser.Scene} scene */
  constructor(scene) {
    super(scene, 0, 0, "poison-ball");
    
    scene.physics.add.existing(this);

    this.setDataEnabled(true);
    this.data.set("actor", this);

    scene.physics.add.overlap(this, scene.player.player, (projectile, player, colInfo) => {
      if (this.active) {
        let poisonActor = projectile.data.get("actor");
        let playerActor = player.data.get("actor");
        playerActor.applyDamage(poisonActor.damage);
        this.die();
      }
    });

    // adjust hitbox
    this.body.setSize(16, 16);
    this.depth = 10000;

    this.damage = CAPTAIN_ATTACK_DAMAGE;
  }

  fire(x, y, direction) {
    let vel = direction.normalize().scale(CAPTAIN_PROJECTILE_SPEED);
    this.body.setVelocity(vel.x, vel.y);
    this.play("poison-ball");
    this.setPosition(x, y - 50);

    this.setActive(true);
    this.setVisible(true);

    this.scene.time.addEvent({
      delay: 10000,
      callback: this.die,
      callbackScope: this
    });
  }

  die() {
    this.setActive(false);
    this.setVisible(false);
  }
}