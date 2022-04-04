import Phaser from "phaser";
import HubDoor from "../actors/hub_door";
import { Player } from "../actors/player";
import { GraphQLClient } from "../lib/GraphQLClient.js";
import { Utils } from "../lib/utils.js";
import { PIXEL_SCALE } from "../variables.js";

class HubScene extends Phaser.Scene {
  constructor(config) {
    super({
      ...config,
      key: "HubScene",
    });

    this.player = new Player(this);
    this.graphQLClient = new GraphQLClient();
  }

  init() {
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  async preload() {
    this.load.image("hub_left_wall", "images/hub_left_wall.png");
    this.load.image("hub_wall", "images/HallOfCells_walls.png");
    this.load.image("hub_floor", "images/HallOfCells_floor.png");
    this.load.image("cell_door", "images/HallOfCells_door.png");
    this.load.image("player", "images/player.png");

    Player.preload(this);
  }

  async create(data) {
    console.log("name:", data.name);

    // Create the main player
    Player.createAnims(this);
    this.player.create();
    this.player.player.x = 320;
    this.player.player.y = 450;

    // Fetch all the player data from the backend
    this.players = await this.graphQLClient.getPlayers();

    // Dynamically create the doors based on players
    this.doors = this.physics.add.staticGroup();

    // first add the hub left wall
    const leftWallSprite = this.add
      .sprite(40, this.cameras.main.height / 2, "hub_left_wall")
      .setScale(PIXEL_SCALE);
    this.physics.add.existing(leftWallSprite);
    leftWallSprite.body.immovable = true;
    this.physics.add.collider(
      this.player.player,
      leftWallSprite,
      (player, rec, colInfo) => {
        console.debug("collided with left wall");
      }
    );

    this.localPlayer = this.localPlayer = Utils.getLocalStoragePlayer();
    this.drawSection(321, this.localPlayer);

    let other_player_index = 2;
    for (let other_player of this.players) {
      if (other_player.id === this.localPlayer.id) {
        continue; // skip local player
      }

      this.drawSection(321 * other_player_index * 1.49 - 160, other_player);

      other_player_index++;
    }

    this.cameras.main.setDeadzone(400, 2000);
    this.cameras.main.startFollow(this.player.player, true, 0.4, 0.4);
    this.cameras.main.backgroundColor.setTo(46, 49, 62);
  }

  drawSection(startX, playerObj) {
    this.add
      .sprite(startX, this.cameras.main.height / 2, "hub_floor")
      .setScale(PIXEL_SCALE);

    // Add hub wall
    this.add
      .image(startX, this.cameras.main.height / 2, "hub_wall")
      .setScale(PIXEL_SCALE);

    // bottom wall bounds
    let bottomWallBounds = this.add
      .rectangle(startX, this.cameras.main.height / 2 + 320, 160, 70)
      .setScale(PIXEL_SCALE);
    this.physics.add.existing(bottomWallBounds);
    bottomWallBounds.body.immovable = true;
    this.physics.add.collider(
      this.player.player,
      bottomWallBounds,
      (player, rec, colInfo) => {
        console.debug("collided with bottom wall");
      }
    );

    // Upper wall bounds
    let upperWallBounds = this.add
      .rectangle(startX, this.cameras.main.height / 2 - 140, 160, 70)
      .setScale(PIXEL_SCALE);
    this.physics.add.existing(upperWallBounds);
    upperWallBounds.body.immovable = true;
    this.physics.add.collider(
      this.player.player,
      upperWallBounds,
      (player, rec, colInfo) => {
        console.debug("collided with upper wall");
      }
    );

    // Entry bounds
    let entryBounds = this.add
      .rectangle(startX, this.cameras.main.height / 2 - 70, 15, 40)
      .setScale(PIXEL_SCALE);
    this.physics.add.existing(entryBounds);
    entryBounds.body.immovable = false;
    this.physics.add.overlap(
      this.player.player,
      entryBounds,
      (player, rec, colInfo) => {
        console.debug("collided door entry");
        this.scene.start("CellScene", { player: playerObj });
      }
    );

    // Add players door
    let doorX = startX;
    let doorY = this.cameras.main.height / 2;
    let playerDoor = new HubDoor({
      scene: this,
      x: doorX,
      y: doorY,
      info: playerObj,
    });
    playerDoor.setScale(PIXEL_SCALE);
    this.doors.add(playerDoor, true);
    this.add.text(doorX - 80, doorY - 185, playerObj.name, {
      fontFamily: "DungeonFont",
      fontSize: "28px",
      color: "#8d8f98",
    });
  }

  update() {
    this.player.update();
  }
}

export default HubScene;
