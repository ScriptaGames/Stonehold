import Phaser from "phaser";
import HubDoor from "../actors/hub_door";
import { Player } from "../actors/player";
import { GraphQLClient } from "../lib/GraphQLClient.js";

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
    this.load.image("cell_door", "images/cell_door.png");
    this.load.image("player", "images/player.png");
    Player.preload(this);
  }

  async create() {
    // Create the main player
    Player.createAnims(this);
    this.player.create();

    // Fetch all the player data from the backend
    this.players = await this.graphQLClient.getPlayers();

    // Dynamically create the doors based on players
    this.doors = this.physics.add.staticGroup();

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

    this.physics.add.overlap(
      this.player.player,
      this.doors,
      (player, door, colInfo) => {
        console.log("overlap: " + door.info.name);
        this.room_manager.initChain(door.info);
        let room_config = this.room_manager.nextRoom();
        this.scene.start(room_config.key, room_config.config);
      }
    );

    this.cameras.main.startFollow(this.player.player, true, 0.4, 0.4);
  }

  update() {
    this.player.update();
  }
}

export default HubScene;
