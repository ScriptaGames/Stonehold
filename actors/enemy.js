import { Actor } from "./actor";
import { PIXEL_SCALE } from "../variables";

export class Enemy extends Actor {
  constructor(scene, config) {
    super(scene, config);

    this.lootTable = ["health", "speed"];
    this.isAggro = false;
  }

  static preload(scene) {
    scene.load.spritesheet("health", "images/health_buff.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
    scene.load.spritesheet("speed", "images/speed_buff.png", {
      frameWidth: 24,
      frameHeight: 24,
    });
  }

  spawnBuffItem(name) {
    let buffItem = this.scene.add.sprite(
      this.mainSprite.x,
      this.mainSprite.y + 40
    );

    buffItem.setScale(PIXEL_SCALE);
    buffItem.play(name);
    this.scene.physics.add.existing(buffItem);

    // Add collision with player
    this.scene.physics.add.overlap(
      buffItem,
      this.scene.player.player,
      (buff, player, colInfo) => {
        console.debug("player collided with buff item");
        let playerActor = player.data.get("actor");
        playerActor.handleBuff(name);
        buffItem.destroy();
      },
      () => this.scene.player.isAlive
    );

    buffItem.setDepth(4000);
  }

  dropItems() {
    const dropChance = Phaser.Math.RND.frac() * 100;
    if (dropChance <= this.dropChance) {
      const item_index = Phaser.Math.RND.between(0, this.lootTable.length - 1);
      let randomItem = this.lootTable[item_index];

      // only drop speed buff once per-scene (room)
      if (randomItem == "speed") {
        // check if speed buff has already been dropped
        if (this.scene.speed_dropped) {
          console.debug(
            "speed buff already dropped this level, drop health instead"
          );
          randomItem = "health";
        } else {
          console.debug("First speed buff dropped this level, setting flag.");
          this.scene.speed_dropped = true;
        }
      }

      // Spawn the buff item after a delay
      this.scene.time.delayedCall(1300, () => {
        // spawn the buff item into the scene
        this.spawnBuffItem(randomItem);
      });
    } else {
      console.debug("👨🏻‍🍳 no soup for you!");
    }
  }

  die() {
    super.die();

    // drop any items from the loot table
    this.dropItems();
  }
}
