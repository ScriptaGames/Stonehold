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

  async create(data) {
    console.log("name:", data.name);

    // Create the main player
    Player.createAnims(this);
    this.player.create();

    // Fetch all the player data from the backend
    this.players = await this.graphQLClient.getPlayers();

    // Dynamically create the doors based on players
    this.doors = this.physics.add.staticGroup();

    // Add current player's door first
    this.localPlayer = {
      id: localStorage.getItem("player_id"),
      name: localStorage.getItem("player_name"),
      seed: localStorage.getItem("player_seed"),
      rooms_cleared: localStorage.getItem("player_rooms_cleared"),
    };
    let first_door_x = 0;
    let first_door_y = 300;
    let first_door = new HubDoor({
      scene: this,
      x: first_door_x,
      y: first_door_y,
      info: this.localPlayer,
    });
    this.doors.add(first_door, true);
    this.add.text(first_door_x - 32, first_door_y - 100, this.localPlayer.name);

    let other_player_index = 0;
    for (let other_player of this.players) {
      if (other_player.id === this.localPlayer.id) {
        continue; // skip local player
      }
      let x = other_player_index * 200 + 200;
      let y = 300;
      let door = new HubDoor({
        scene: this,
        x: x,
        y: y,
        info: other_player,
      });
      this.doors.add(door, true);
      this.add.text(x - 32, y - 100, other_player.name);

      other_player_index++;
    }

    this.physics.add.overlap(
      this.player.player,
      this.doors,
      (player, door, colInfo) => {
        this.enterDoor(door);
      }
    );

    this.cameras.main.startFollow(this.player.player, true, 0.4, 0.4);

    // uncomment this to go straight into a room, helpful for quick iteration
    // on certain things
    // this.enterDoor(this.doors.children.getArray()[5]);
  }

  /** @param {HubDoor} door */
  enterDoor(door) {
    // stop hub music
    this.sound.stopAll();

    console.log("overlap: " + door.info.name);
    this.room_manager.initChain(door.info);
    let room_config = this.room_manager.nextRoom();
    this.scene.start(room_config.key, room_config.config);
  }

  update() {
    this.player.update();
  }
}

export default HubScene;
