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

    this.level = new Level(this,
      {
        mapName: "room1-map",
        mapImagePath: "images/room1_walls.png",
        objectsImagePath: "images/Objects_atlas.png",
        jsonName: "room1-map",
        jsonPath: "maps/room1.json",
        tilesetNameFromTiled: "room1_walls",
        objectsTilesetFromTiled: "room1_objects",
        playerSpawn: { x: 634, y: 1158 },
        // playerSpawn: { x: 1221, y: 817 + 200 }, // spawn beside door
        doorPosition: { x: 1224, y: 697 },
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

    // Player.preload(this);
  }

  async create(data) {
    console.debug("Create CellScene with player:", data.player);

    this.game.sound.stopAll();
    if (!this.game.sound.get("hub-music")?.isPlaying) {
      this.game.sound.play("hub-music", { loop: true });
    }

    this.cameras.main.backgroundColor.setTo(46, 49, 62);

    // Create the main player
    // this.player = new Player(this);
    // Player.createAnims(this);
    // this.player.create();
    // this.player.player.x = 400;
    // this.player.player.y = 400;

    const cellFloor = this.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "cell_floor"
    );
    cellFloor.setScale(PIXEL_SCALE);

    this.tileMap = this.level.createMap();
    this.tileMap.map.setPosition(
      cellFloor.getTopLeft().x,
      cellFloor.getTopLeft().y
    );

    this.matter.world.convertTilemapLayer(this.tileMap.map);

    // this.matter.world.convertTilemapLayer(lavaLayer);

    this.player = this.matter.add.image(634, 1158, "player");
    this.player.setFixedRotation();
    this.player.setAngle(270);
    this.player.setMass(30);
    this.cameras.main.startFollow(this.player, true, 0.4, 0.4);

    // this.physics.add.collider(this.player.player, this.tileMap.map, () => {});

    // Hub Door
    // let hubDoorBounds = this.add.rectangle(390, 120, 70, 100);
    // this.physics.add.existing(hubDoorBounds);
    //
    // this.physics.add.overlap(
    //   this.player.player,
    //   hubDoorBounds,
    //   (player, rec, colInfo) => {
    //     console.log("collided with hub Door");
    //     this.scene.start("HubScene");
    //   }
    // );

    // // First room door
    // let roomDoorBounds = this.add.rectangle(687, 120, 70, 100);
    // this.physics.add.existing(roomDoorBounds);
    //
    // this.physics.add.overlap(
    //   this.player.player,
    //   roomDoorBounds,
    //   (player, rec, colInfo) => {
    //     console.log("collided with room Door");
    //     this.sound.stopAll();
    //     this.room_manager.initChain(data.player);
    //     let room_config = this.room_manager.nextRoom();
    //     this.scene.start(room_config.key, {
    //       roomConfig: room_config.config,
    //     });
    //   }
    // );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // this.player.update();
    if (this.cursors.left.isDown) {
      console.debug('left.isDown')
      this.player.thrustLeft(0.02);
    } else if (this.cursors.right.isDown) {
      console.debug('right.isDown')
      this.player.thrustRight(0.02);
    }

    if (this.cursors.up.isDown) {
      console.debug('up.isDown')
      this.player.thrust(0.02);
    } else if (this.cursors.down.isDown) {
      console.debug('down.isDown')
      this.player.thrustBack(0.02);
    }
  }
}

export default CellScene;
