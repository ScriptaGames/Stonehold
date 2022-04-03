import Phaser from "phaser";
import { Player } from "../actors/player";
import { Pinky } from "../actors/pinky";
import { Captain } from "../actors/captain";

class RoomScene extends Phaser.Scene {
  constructor(config) {
    super({
      ...config,
      key: "RoomScene",
    });
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

    Player.preload(this);
    Pinky.preload(this);
    Captain.preload(this);
  }

  create() {
    this.player = new Player(this);
    this.pinkies = [];
    this.captains = [];

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
    let numEnemies = this.room_manager.rnd.between(maxEnemies / 2, maxEnemies);
    let percentCaptains =
      (100 * this.room_manager.currentChainDepth) / maxEnemies;
    for (let e = 0; e < numEnemies; e++) {
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
        console.log("player collided with", enemy, player, colInfo);
        /** @type {Player} */
        let playerActor = player.data.get("actor");
        /** @type {Pinky} */
        let pinkyActor = enemy.data.get("actor");

        playerActor.applyDamage(pinkyActor.getAttackDamage());
      },
      // disable player collision during the dodge grace period
      () => this.player.dodge.gracePeriod
    );

    this.keyEscape = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
  }

  update() {
    this.player.update();
    this.pinkies.forEach((pinky) => pinky.update());
    this.captains.forEach((captain) => captain.update());
  }

  exitingRoom() {
    console.log("exiting room");
    let room_config = this.room_manager.nextRoom();
    this.scene.start(room_config.key, room_config.config);
  }
}

export default RoomScene;
