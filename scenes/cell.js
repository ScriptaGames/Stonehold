import Phaser from "phaser";
import { Player } from "../actors/player";
import HubDoor from "../actors/hub_door.js";
import { Level } from "../actors/level";
import { PIXEL_SCALE } from "../variables.js";
import { Utils } from "../lib/utils.js";

class CellScene extends Phaser.Scene {
  constructor(config) {
    super({
      ...config,
      key: "CellScene",
    });

    this.level = new Level(this, {
      mapName: "cell-map",
      mapImagePath: "images/player_cell_walls.png",
      jsonName: "cell-map",
      jsonPath: "maps/cell.json",
      tilesetNameFromTiled: "player_cell_walls",
    });
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  async preload() {
    this.load.image("cell_walls", "images/player_cell_walls.png");
    this.load.image("cell_floor", "images/player_cell_floor.png");
    this.load.image("player", "images/player.png");

    // cell tile stuff
    this.level.preload();
    this.load.audio("hub-music", "audio/ld50-level_ambient.mp3");

    Player.preload(this);
  }

  async create(data) {
    console.debug("Create CellScene with player:", data.player);

    this.sound.play("hub-music", {
      loop: true,
    });

    this.cameras.main.backgroundColor.setTo(46, 49, 62);

    // Create the main player
    this.player = new Player(this);
    Player.createAnims(this);
    this.player.create();
    this.player.player.x = 400;
    this.player.player.y = 400;

    const cellFloor = this.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "cell_floor"
    );
    cellFloor.setScale(PIXEL_SCALE);

    this.map = this.level.createMap();
    this.map.setPosition(cellFloor.getTopLeft().x, cellFloor.getTopLeft().y);

    this.physics.add.collider(this.player.player, this.map, () => {});

    for (let other_player_index in this.players) {
      let other_player = this.players[other_player_index];
      console.debug("player:", other_player);
      let x = other_player_index * 256 + 200;
      let y = 300;
      let door = new HubDoor({
        scene: this,
        x: x,
        y: y,
        info: other_player,
      });
      this.doors.add(door, true);
      this.add.text(x - 32, y - 100, other_player.name);
      this.add.text(x - 32, y - 150, other_player.seed);
    }

    // Hub Door
    let hubDoorBounds = this.add.rectangle(390, 120, 70, 100);
    this.physics.add.existing(hubDoorBounds);

    this.physics.add.overlap(
      this.player.player,
      hubDoorBounds,
      (player, rec, colInfo) => {
        console.log("collided with hub Door");
        this.scene.start("HubScene");
      }
    );

    // First room door
    let roomDoorBounds = this.add.rectangle(687, 120, 70, 100);
    this.physics.add.existing(roomDoorBounds);

    this.physics.add.overlap(
      this.player.player,
      roomDoorBounds,
      (player, rec, colInfo) => {
        console.log("collided with room Door");
        this.sound.stopAll();
        this.room_manager.initChain(data.player);
        let room_config = this.room_manager.nextRoom();
        this.scene.start(room_config.key, room_config.config);
      }
    );

    // // uncomment this to enter door immediately for debugging
    // this.sound.stopAll();
    // this.room_manager.initChain(this.localPlayer);
    // let room_config = this.room_manager.nextRoom();
    // this.scene.start(room_config.key, room_config.config);
  }

  update() {
    this.player.update();
  }
}

export default CellScene;
