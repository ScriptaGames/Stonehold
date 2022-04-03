import Phaser from "phaser";
import { Player } from "../actors/player";

class CellScene extends Phaser.Scene {
  constructor(config) {
    super({
      ...config,
      key: "CellScene",
    });

    this.player = new Player(this);
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  async preload() {
    this.load.image("cell_background", "images/cell_background.png");
    this.load.image("cell_door", "images/cell_door.png");
    this.load.image("player", "images/player.png");
    Player.preload(this);
  }

  async create() {

    // Create the main player
    Player.createAnims(this);
    this.player.create();

    const background = this.add.sprite(0, 0, "cell_background");
    background.setOrigin(0,0);
    background.setScale(1.1, 1.1);
    // background.width = this.cameras.main.width;
    // background.height = this.cameras.main.height;

    // this.physics.add.overlap(
    //   this.player.player,
    //   this.doors,
    //   (player, door, colInfo) => {
    //     this.enterDoor(door);
    //   }
    // );

    // this.cameras.main.startFollow(this.player.player, true, 0.4, 0.4);

    // uncomment this to go straight into a room, helpful for quick iteration
    // on certain things
    // this.enterDoor(this.doors.children.getArray()[5]);
  }

  // /** @param {HubDoor} door */
  // enterDoor(door) {
  //   console.log("overlap: " + door.info.name);
  //   this.room_manager.initChain(door.info);
  //   let room_config = this.room_manager.nextRoom();
  //   this.scene.start(room_config.key, room_config.config);
  // }

  update() {
    this.player.update();
  }
}

export default CellScene;
