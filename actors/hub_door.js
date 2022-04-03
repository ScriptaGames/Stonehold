import Phaser from "phaser";

class HubDoor extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, "cell_door");

    this.info = config.info;
  }
}

export default HubDoor;
