import Phaser from "phaser";
import { Player } from "../actors/player";
import { PIXEL_SCALE } from "../variables";
// import HubDoor from "../actors/hub_door.js";

class CellScene extends Phaser.Scene {
  // constructor(config) {
  //   super({
  //     ...config,
  //     key: "CellScene",
  //   });

  //   // this.player = new Player(this);
  // }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  preload() {
    // this.load.image("cell_background", "images/cell_background.png");
    // this.load.image("cell_door", "images/cell_door.png");
    // this.load.image("player", "images/player.png");
    this.load.image("dwarf-idle", "images/dwarfBody_idle_strip.png");
    this.load.image("cell-image", "images/player_cell_walls.png");
    this.load.tilemapTiledJSON("cell-map", "maps/test.json");
    // Player.preload(this);
  }

  create() {
    // Create the main player
    // Player.createAnims(this);
    // this.player.create();

    // const background = this.add.image(0, 0, "cell-image");
    // background.setOrigin(0, 0);
    // background.setScale(PIXEL_SCALE);

    const map = this.make.tilemap({
      key: "cell-map",
      tileWidth: 16,
      tileHeight: 16,
    });

    const tilesetNameFromTiled = "player_cell_walls";
    const tileset = map.addTilesetImage(tilesetNameFromTiled, "cell-image");
    const visualLayerNameFromTiled = "layout";
    const cell = map.createLayer(visualLayerNameFromTiled, tileset, 0, 0);
    cell.setScale(PIXEL_SCALE);
    // cell.setCollisionByExclusion(-1, true);
    cell.setCollisionByProperty({ collide: "true" });

    this.player = this.add.rectangle(400, 400, 100, 100, 0xffffff);
    this.player.setDepth(500);
    this.physics.add.existing(this.player);
    this.physics.add.collider(this.player, cell, () => {
      console.log("player hit wall");
    });
    this.player.body.setVelocityX(300);
    this.player.body.setVelocityY(-20);

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
    // this.physics.add.overlap(
    //   this.player.player,
    //   this.doors,
    //   (player, door, colInfo) => {
    //     this.enterDoor(door);
    //   }
    // );
  }

  // /** @param {HubDoor} door */
  // enterDoor(door) {
  //   console.log("overlap: " + door.info.name);
  //   this.room_manager.initChain(door.info);
  //   let room_config = this.room_manager.nextRoom();
  //   this.scene.start(room_config.key, room_config.config);
  // }

  update() {
    // this.player.update();
  }
}

export default CellScene;
