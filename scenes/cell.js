import Phaser from "phaser";
import { Player } from "../actors/player";
import HubDoor from "../actors/hub_door.js";
import { PIXEL_SCALE } from "../variables.js";

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
    // this.load.image("cell_background", "images/cell_background.png");
    this.load.image("cell_walls", "images/player_cell_walls.png");
    this.load.image("cell_floor", "images/player_cell_floor.png");
    this.load.image("player", "images/player.png");

    this.load.audio("hub-music", "audio/ld50-level_ambient.mp3");

    Player.preload(this);
  }

  async create() {
    this.sound.play("hub-music", {
      loop: true,
    });

    // Create the main player
    Player.createAnims(this);
    this.player.create();

    const cellFloor = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, "cell_floor");
    const cellWalls = this.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, "cell_walls");

    cellFloor.setScale(PIXEL_SCALE);
    cellWalls.setScale(PIXEL_SCALE);

    // Hub Door
    let hubDoorBounds = this.add.rectangle(390, 160, 70, 100);
    this.physics.add.existing(hubDoorBounds);

    this.physics.add.overlap(
      this.player.player,
      hubDoorBounds,
      (player, rec, colInfo) => {
        console.log('collided with hub Door');
        this.scene.start('HubScene');
      }
    );

    // First room door
    let roomDoorBounds = this.add.rectangle(705, 160, 70, 100);
    this.physics.add.existing(roomDoorBounds);

    this.physics.add.overlap(
      this.player.player,
      roomDoorBounds,
      (player, rec, colInfo) => {
        console.log('collided with room Door');
        // enterDoor(door);
      }
    );

    // for (let other_player_index in this.players) {
    //   let other_player = this.players[other_player_index];
    //   console.debug("player:", other_player);
    //   let x = other_player_index * 256 + 200;
    //   let y = 300;
    //   let door = new HubDoor({
    //     scene: this,
    //     x: x,
    //     y: y,
    //     info: other_player,
    //   });
    //   this.doors.add(door, true);
    //   this.add.text(x - 32, y - 100, other_player.name);
    //   this.add.text(x - 32, y - 150, other_player.seed);
    // }
    //

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
