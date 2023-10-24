import { Utils } from "../lib/utils.js";
import { BONUS_DAMAGE_BASE, PIXEL_SCALE } from "../variables.js";
import CellScene from "./cell.js";

export class PlayUIScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayUIScene" });
  }

  preload() {
    this.load.image("health_bar_border", "images/healthbar.png");
    this.load.image("health_bar_filling", "images/health-filling.png");
    this.load.spritesheet("RMB", "images/RMB_alert_strip.png", {
      frameWidth: 27,
      frameHeight: 27,
    });
    this.load.image("return-home", "images/returnHome_button.png");
  }

  create() {
    const localPlayer = Utils.getLocalStoragePlayer();

    // create animation
    this.rmbAnim = this.anims.create({
      key: "blink",
      frames: this.anims.generateFrameNumbers("RMB"),
      frameRate: 10,
      repeat: -1,
    });

    // Add floor number text
    this.floorText = this.add.text(43, 17, "Floor 0", {
      fontFamily: "DungeonFont",
      fontSize: "28px",
      color: "#ffffff",
    });

    let bonusDamageMultiplier = BONUS_DAMAGE_BASE;
    if (localPlayer.bonus_damage) {
      bonusDamageMultiplier = Number(localPlayer.bonus_damage);
    }
    this.damageText = this.add.text(
      150,
      17,
      "Damage x" + bonusDamageMultiplier.toPrecision(2),
      {
        fontFamily: "DungeonFont",
        fontSize: "28px",
        color: "#ffffff",
      }
    );
    this.damageText.setVisible(false); // hiding this until we add a damage buff

    // add player UI bars
    this.healthBar = this.makeBar(43, 60, 0xe74c3c);
    this.setValue(this.healthBar, 1);
    this.add.sprite(100, 63, "health_bar_border").setScale(PIXEL_SCALE);

    // Add Ultimate charge bar
    this.ultimateBar = this.makeBar(43, 100, 0xfed507);
    this.setValue(this.ultimateBar, 0);
    this.add.sprite(100, 103, "health_bar_border").setScale(PIXEL_SCALE);

    // RMB sprite
    this.rmbSprite = this.add.sprite(100, 103, "RMB");
    this.rmbSprite.setScale(PIXEL_SCALE);
    this.rmbSprite.play("blink");
    this.rmbSprite.visible = false;

    //  Grab a reference to the Game Scene
    let roomScene = this.scene.get("RoomScene");

    //  Listen for damage events
    this.makeReturnHomeBtn();

    //  Listen for events from it
    roomScene.events.addListener("playerUpdateHealthBar", (percent) => {
      console.debug("GOT EVENT player HP changed:", percent);
      this.setValue(this.healthBar, percent);
    });

    roomScene.events.addListener("playerIncreaseDamage", (damage) => {
      console.debug("GOT EVENT player increase damage:", damage);
      this.damageText.setText("Damage x" + damage.toPrecision(2));
    });

    //  Listen for charge events
    roomScene.events.addListener("chargeUltimate", (charge) => {
      console.debug("GOT EVENT chargeUltimate:", charge);
      this.setValue(this.ultimateBar, charge);
      this.rmbSprite.visible = charge >= 1;
    });

    roomScene.events.addListener("createRoom", (depth) => {
      this.floorText.setText("Floor " + depth);
    });

    roomScene.events.addListener("roomLoaded", (inMyChain) => {
      console.debug("room loaded: " + inMyChain);
      if (inMyChain) {
        this.returnHomeBtn.setVisible(false);
        this.returnHomeBtn.disableInteractive();
      } else {
        this.returnHomeBtn.setVisible(true);
        this.returnHomeBtn.setInteractive();
      }
    });
  }

  makeReturnHomeBtn() {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    this.returnHomeBtn = this.add.sprite(screenCenterX, 47, "return-home");
    this.returnHomeBtn.setVisible(false);

    this.returnHomeBtn.on("pointerup", () => {
      let roomScene = this.scene.get("RoomScene");
      this.returnHomeBtn.setVisible(false);
      this.returnHomeBtn.disableInteractive();
      roomScene.registry.destroy();
      roomScene.events.off("actor-death");
      roomScene.events.off("roomLoaded");
      roomScene.game.sound.stopAll();
      roomScene.scene.start("CellScene");
    });
  }

  makeBar(x, y, color) {
    //draw the bar
    let bar = this.add.graphics();

    //color the bar
    bar.fillStyle(color, 1);

    //fill the bar with a rectangle
    bar.fillRect(0, 0, 114, 6);

    //position the bar
    bar.x = x;
    bar.y = y;

    //return the bar
    return bar;
  }
  setValue(bar, percentage) {
    //scale the bar
    bar.scaleX = percentage;
  }
  update() {}
}
export default PlayUIScene;
