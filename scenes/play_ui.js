import { PIXEL_SCALE } from "../variables.js";
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
  }

  create() {

    // create animation
    this.rmbAnim = this.anims.create({
      key: "blink",
      frames: this.anims.generateFrameNumbers("RMB"),
      frameRate: 10,
      repeat: -1,
    });

    // Add floor number text
    this.floorText = this.add.text(43,17, "Floor 0", {
      fontFamily: "DungeonFont",
      fontSize: "28px",
      color: "#ffffff",
    });

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
    roomScene.events.addListener("playerTakeDamage", (percent) => {
      console.debug("GOT EVENT player took took damage:", percent);
      this.setValue(this.healthBar, percent);
    });

    //  Listen for charge events
    roomScene.events.addListener("chargeUltimate", (charge) => {
      console.debug("GOT EVENT chargeUltimate:", charge);
      this.setValue(this.ultimateBar, charge);
      if (charge >= 1) {
        this.rmbSprite.visible = true;
      } else {
        this.rmbSprite.visible = false;
      }
    });

    roomScene.events.addListener("createRoom", (depth) => {
      this.floorText.setText("Floor " + depth);
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
