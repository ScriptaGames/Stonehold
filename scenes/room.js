import Phaser from "phaser";
import { Player } from "../actors/player";
import { Pinky } from "../actors/pinky";
import { Captain } from "../actors/captain";
import { GraphQLClient } from "../lib/GraphQLClient";
import { Level } from "../actors/level";
import { PIXEL_SCALE, ULTIMATE_ATTACK_DAMAGE } from "../variables";
import { Utils } from "../lib/utils.js";

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

    console.log(this.roomConfig.levelMap);

    this.level = new Level(this, this.roomConfig.levelMap);
  }

  preload() {
    this.load.image("floor", "images/fightRooms_floor.png");
    this.load.image("door", "images/door_rubble.png");
    this.load.image("door_open", "images/door_open.png");
    this.load.image("door_locked", "images/door_locked.png");
    this.load.image("mushroom", "images/mushroom.png");

    this.load.audio("room-music", "audio/ld50-menumusic.mp3");

    this.level.preload();

    Player.preload(this);
    Pinky.preload(this);
    Captain.preload(this);
  }

  create() {
    Pinky.createAnims(this);
    Player.createAnims(this);
    Captain.createAnims(this);

    console.debug("Creating RoomScene with config:", this.roomConfig);
    console.debug("In my chain:", this.room_manager.myChain);

    this.player = new Player(this);
    this.player.create();
    this.player.player.copyPosition(this.roomConfig.levelMap.playerSpawn);
    this.pinkies = [];
    this.captains = [];

    this.floor = this.add
      .image(0, 0, "floor")
      .setScale(PIXEL_SCALE)
      .setOrigin(0, 0);

    this.map = this.level.createMap();
    this.map.setPosition(this.floor.x, this.floor.y);

    this.physics.world.setBounds(
      this.floor.x,
      this.floor.y,
      this.floor.width,
      this.floor.height
    );
    console.log(
      this.floor.x,
      this.floor.y,
      this.floor.width,
      this.floor.height,
      this.floor.getTopLeft().x,
      this.floor.getTopLeft().y
    );

    // play room music if it isn't already playing from the previous room
    if (!this.sound.get("room-music")?.isPlaying) {
      this.sound.play("room-music", { loop: true, volume: 0.3 });
    }

    window.cam = this.cameras.main;

    this.cameras.main.startFollow(this.player.player, 200, 30, 30, 0, -20);
    this.cameras.main.backgroundColor.setTo(46, 49, 62);

    // rfolrtptlptlhp[loupy

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
    this.doorExit = this.physics.add.staticSprite(
      this.roomConfig.levelMap.doorPosition.x,
      this.roomConfig.levelMap.doorPosition.y,
      doorTexture
    );
    this.doorExit.setVisible(false);
    this.doorExit.setSize(70, 100);

    console.log("room1 mushrooms: " + this.roomConfig.numMushrooms);
    for (let m = 0; m < this.roomConfig.numMushrooms; m++) {
      let x = this.room_manager.rnd.between(20, 800);
      let y = this.room_manager.rnd.between(20, 800);
      this.add.sprite(x, y, "mushroom");
    }

    this.numEnemies = this.roomConfig.numEnemies;
    let percentCaptains = this.roomConfig.percentCaptains;
    for (let e = 0; e < this.numEnemies; e++) {
      let x = this.room_manager.rnd.between(20, 800);
      let y = this.room_manager.rnd.between(20, 800);
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

    // collide player and enemies with the map
    this.physics.add.collider(
      [
        this.player.player,
        ...this.pinkies.map((pinky) => pinky.pinky),
        ...this.captains.map((captain) => captain.captain),
      ],
      this.map,
      () => {}
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

    // collide player ultimate with enemies
    this.physics.add.overlap(
      this.player.ultimateExplosion,
      [
        ...this.pinkies.map((pinky) => pinky.pinky),
        ...this.captains.map((captain) => captain.captain),
      ],
      (explosion, enemy, colInfo) => {
        let enemyActor = enemy.data.get("actor");
        enemyActor.takeDamage(ULTIMATE_ATTACK_DAMAGE);
      },
      (explosion, enemy) => this.player.ultimateActive
    );

    this.keyEscape = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    this.events.addListener("actor-death", async (actor) => {
      if (actor instanceof Player) {
        // TODO respawn in the player's room
        console.log("PLAYER DIED OH NOOOOOOOO");

        // Display "You Died" message
        const screenCenterX =
          this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY =
          this.cameras.main.worldView.y + this.cameras.main.height / 2;
        this.add
          .text(screenCenterX, screenCenterY, "You Died", {
            fontFamily: "DungeonFont",
            fontSize: "70px",
          })
          .setOrigin(0.5)
          .setDepth(1000);

        // TODO: fade out player
        setTimeout(() => {
          this.player.hide();
        }, 1000);

        // TODO: add a fade scene transition here
        setTimeout(() => {
          this.sound.stopAll();
          this.scene.start("CellScene", {
            player: Utils.getLocalStoragePlayer(),
          });
        }, 4000);
      } else {
        console.log("ENEMY DIED OH YEAAAAAH");
        await this.enemyKilled();
      }
    });
  }

  update() {
    if (this.player.isAlive) {
      this.player.update();
    }

    this.pinkies.forEach((pinky) => pinky.update());
    this.captains.forEach((captain) => captain.update());
  }

  /**
   * Notify this room that an enemy was killed.
   */
  async enemyKilled() {
    this.player.addUltimateCharge();
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
