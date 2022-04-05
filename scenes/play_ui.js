import { PIXEL_SCALE } from "../variables.js";
import CellScene from "./cell.js";

export class PlayUIScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayUIScene" });

    this.health = 100;
  }

  preload() {
    this.load.image("health_bar_border", "images/healthbar.png");
    this.load.image("health_bar_filling", "images/health-filling.png");
    this.load.image("return-home", "images/returnHome_button.png");
  }

  create() {
    // add player UI bars
    this.healthBar = this.makeBar(43, 47, 0xe74c3c);
    this.setValue(this.healthBar, 1);
    this.add.sprite(100, 50, "health_bar_border").setScale(PIXEL_SCALE);

    //  Grab a reference to the Game Scene
    let roomScene = this.scene.get("RoomScene");

    this.makeReturnHomeBtn();

    //  Listen for events from it
    roomScene.events.addListener("playerTakeDamage", (percent) => {
      console.debug("GOT EVENT player took took damage:", percent);
      this.setValue(this.healthBar, percent);
    });

    roomScene.events.addListener("roomLoaded", (inMyChain) => {
      console.log("room loaded: " + inMyChain);
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
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    this.returnHomeBtn = this.add.sprite(screenCenterX, 47, "return-home");
    this.returnHomeBtn.setVisible(false);

    this.returnHomeBtn.on("pointerup", () => {
      let roomScene = this.scene.get("RoomScene");
      this.returnHomeBtn.setVisible(false);
      this.returnHomeBtn.disableInteractive();
      roomScene.registry.destroy();
      roomScene.events.off('actor-death');
      roomScene.events.off('roomLoaded');
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
