import Phaser from "phaser";
import { Player } from "../actors/player";
import { Pinky } from "../actors/pinky";
import { Captain } from "../actors/captain";
import { GraphQLClient } from "../lib/GraphQLClient";

class RoomScene extends Phaser.Scene {
  constructor(config) {
    super({
      ...config,
      key: "RoomScene",
    });

    this.gqlClient = new GraphQLClient();
  }

  init(data) {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.roomConfig = data;
  }

  preload() {
    this.load.image("room_background", "images/room_background.png");
    this.load.image("room2_background", "images/room2_background.png");
    this.load.image("door", "images/door_rubble.png");
    this.load.image("door_open", "images/door_open.png");
    this.load.image("door_locked", "images/door_locked.png");
    this.load.image("mushroom", "images/mushroom.png");

    this.load.audio("room-music", "audio/ld50-menumusic.mp3");

    Player.preload(this);
    Pinky.preload(this);
    Captain.preload(this);
  }

  create() {
    this.player = new Player(this);
    this.pinkies = [];
    this.captains = [];

    // play room music if it isn't already playing from the previous room
    if (!this.sound.get("room-music")?.isPlaying) {
      // this.sound.play("room-music", { loop: true });
    }

    this.add.sprite(0, 0, this.roomConfig.background);

    Pinky.createAnims(this);
    Player.createAnims(this);
    Captain.createAnims(this);

    this.doorUnlocked = false;
    let doorTexture = "door";
    if (
      this.room_manager.currentChainDepth <= this.room_manager.unlockedDepth
    ) {
      doorTexture = "door_open";
      this.doorUnlocked = true;
    } else if (!this.room_manager.myChain) {
      doorTexture = "door_locked";
    }
    this.doorExit = this.physics.add.staticSprite(1024, 150, doorTexture);

    let numMushrooms = this.room_manager.rnd.between(
      1,
      this.roomConfig.numMushrooms
    );
    console.log("room1 mushrooms: " + numMushrooms);
    for (let m = 0; m < numMushrooms; m++) {
      let x = this.room_manager.rnd.between(20, 800);
      let y = this.room_manager.rnd.between(20, 800);
      this.add.sprite(x, y, "mushroom");
    }

    let maxEnemies = this.roomConfig.numEnemies;
    this.numEnemies = this.room_manager.rnd.between(maxEnemies / 2, maxEnemies);
    let percentCaptains =
      (100 * this.room_manager.currentChainDepth) / maxEnemies;
    for (let e = 0; e < this.numEnemies; e++) {
      let x = this.room_manager.rnd.between(20, 800);
      let y = this.room_manager.rnd.between(20, 800);
      let enemyKey = "enemy";
      if (this.room_manager.rnd.frac() * 100 <= percentCaptains) {
        let captain = new Captain(this);
        captain.create();
        captain.captain.copyPosition({ x, y });
        this.captains.push(captain);
      } else {
        let pinky = new Pinky(this);
        pinky.create();
        pinky.pinky.copyPosition({ x, y });
        this.pinkies.push(pinky);
      }
    }

    this.player.create();

    this.physics.add.collider(
      this.player.player,
      this.doorExit,
      (player, door, colInfo) => {
        console.log("exit overlap");
        if (this.doorUnlocked) {
          this.exitingRoom();
        } else if (this.room_manager.myChain) {
          this.room_manager.unlockedDepth++;
          this.exitingRoom();
        }
      }
    );

    // collide player with enemies

    this.physics.add.collider(
      this.player.player,
      [
        // enemies that can deal DAMAGE to player
        ...this.pinkies.map((pinky) => pinky.pinky),
        ...this.captains.map((captain) => captain.captain),
      ],
      /** @param {Phaser.GameObjects.GameObject} player
       * @param {Phaser.GameObjects.GameObject} enemy
       */
      (player, enemy, colInfo) => {
        /** @type {Player} */
        let playerActor = player.data.get("actor");
        /** @type {Pinky} */
        let enemyActor = enemy.data.get("actor");

        enemyActor.dealDamage();
        playerActor.takeDamage(enemyActor.damage);
      },
      // disable player collision during the dodge grace period
      (player, enemy) =>
        player.data.get("actor").vulnerable && enemy.data.get("actor").isAlive
    );

    // collide player weapon with enemies

    this.physics.add.collider(
      this.player.axe,
      [
        ...this.pinkies.map((pinky) => pinky.pinky),
        ...this.captains.map((captain) => captain.captain),
      ],
      /** @param {Phaser.GameObjects.GameObject} player
       * @param {Phaser.GameObjects.GameObject} enemy
       */
      (player, enemy, colInfo) => {
        /** @type {Pinky} */
        let enemyActor = enemy.data.get("actor");

        this.player.dealDamage();
        enemyActor.takeDamage(this.player.damage);
      },
      // check collision only when the axe is active, and when the enemy is vulnerable
      (player, enemy) => this.player.attack.activeFrame && enemy.vulnerable
    );

    this.keyEscape = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.events.addListener("actor-death", async (actor) => {
      if (actor instanceof Player) {
        // TODO respawn in the player's room
        console.log("PLAYER DIED OH NOOOOOOOO");
      } else {
        console.log("ENEMY DIED OH YEAAAAAH");
        await this.enemyKilled();
      }
    });
  }

  update() {
    this.player.update();
    this.pinkies.forEach((pinky) => pinky.update());
    this.captains.forEach((captain) => captain.update());
  }

  /**
   * Notify this room that an enemy was killed.
   */
  async enemyKilled() {
    this.numEnemies -= 1;
    console.log(`enemy killed! ${this.numEnemies} remain`);
    if (this.numEnemies == 0) {
      await this.unlockDoor();
    }
  }

  /** Set the door to unlocked. */
  async unlockDoor() {
    this.doorUnlocked = true;
    this.doorExit.setTexture("door_open");

    // Increment the players rooms cleared count
    const playerId = localStorage.getItem("player_id");
    let roomsCleared = parseInt(localStorage.getItem("player_rooms_cleared"));
    roomsCleared++;
    const updatedPlayer = await this.gqlClient.updatePlayer(
      playerId,
      roomsCleared
    );
    console.debug("updatedPlayer:", updatedPlayer);
    localStorage.setItem("player_rooms_cleared", roomsCleared.toString());
  }

  exitingRoom() {
    console.log("exiting room");
    let room_config = this.room_manager.nextRoom();
    this.scene.start(room_config.key, room_config.config);
  }
}

export default RoomScene;
