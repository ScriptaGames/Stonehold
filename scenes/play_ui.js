import { PIXEL_SCALE } from "../variables.js";
import CellScene from "./cell.js";

export class PlayUIScene extends Phaser.Scene {
  constructor() {
    super({ key: "PlayUIScene", active: true });

    this.health = 100;
  }

  preload() {
    this.load.image("health_bar_border", "images/healthbar.png");
    this.load.image("health_bar_filling", "images/health-filling.png");
  }

  create() {
    //  Our Text object to display the Score
    // let info = this.add.text(10, 10, 'Score: 0', { font: '48px Arial', fill: '#000000' });

    // add player UI bars
    this.add.sprite(100, 50, "health_bar_border").setScale(PIXEL_SCALE);
    this.add.sprite(100, 50, "health_bar_filling").setScale(PIXEL_SCALE);

    //  Grab a reference to the Game Scene
    let roomScene = this.scene.get("RoomScene");

    //  Listen for events from it
    roomScene.events.addListener("playerTakeDamage", () => {
      console.debug("GOT EVENT player took took damage:");

      // this.score += 10;
      //
      // info.setText('Score: ' + this.score);
    });
  }
}
export default PlayUIScene;
