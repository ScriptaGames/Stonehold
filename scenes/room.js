import Phaser from "phaser";
import { Player } from "../actors/player";
import { Pinky } from "../actors/pinky";
import { Captain } from "../actors/captain";
import { Portcullis } from "../actors/portcullis";
import { GraphQLClient } from "../lib/GraphQLClient";
import { Level } from "../actors/level";
import { Decoration } from "../actors/decoration";
import {
  PIXEL_SCALE,
  ULTIMATE_ATTACK_DAMAGE,
  PLAYER_BASE_HP,
  BONUS_DAMAGE_INCREASE,
} from "../variables";
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
    this.roomConfig = data.roomConfig;
    this.initPlayerState = data.playerState;
    if (!data.playerState) {
      this.initPlayerState = {
        hp: PLAYER_BASE_HP,
        ultimateCharge: 0,
      };
    }

    if (data.playerState) {
      console.log(`player state hp: ${data.playerState.hp}`);
    }

    console.log(this.roomConfig.levelMap);

    this.level = new Level(this, this.roomConfig.levelMap);
  }

  preload() {
    this.load.image("door", "images/door_rubble.png");

    this.load.audio("room-music", "audio/ld50-menumusic.mp3");

    this.level.preload();

    Player.preload(this);
    Pinky.preload(this);
    Captain.preload(this);
    Portcullis.preload(this);
    Decoration.preload(this);
  }

  create() {
    Pinky.createAnims(this);
    Player.createAnims(this);
    Captain.createAnims(this);
    Portcullis.createAnims(this);

    console.debug("Creating RoomScene with config:", this.roomConfig);
    console.debug("In my chain:", this.room_manager.myChain);

    this.tileMap = this.level.createMap();
    let playerSpawn = this.tileMap.tileMap
      .getObjectLayer("Objects")
      .objects.find((obj) => obj.name == "PlayerSpawn");
    playerSpawn.x *= PIXEL_SCALE;
    playerSpawn.y *= PIXEL_SCALE;

    let doorPosition = this.tileMap.tileMap
      .getObjectLayer("Objects")
      .objects.find((obj) => obj.name == "Door");
    doorPosition.x *= PIXEL_SCALE;
    doorPosition.y *= PIXEL_SCALE;

    this.player = new Player(
      this,
      this.initPlayerState.hp,
      this.initPlayerState.ultimateCharge
    );
    this.player.create();
    this.player.player.copyPosition(playerSpawn);

    this.pinkies = [];
    this.captains = [];
    this.decorations = [];

    this.physics.world.setBounds(
      this.tileMap.floor.x,
      this.tileMap.floor.y,
      this.tileMap.floor.width,
      this.tileMap.floor.height
    );

    // play room music if it isn't already playing from the previous room
    const roomMusics = this.game.sound.getAll("room-music");
    if (roomMusics.length) {
      if (!roomMusics[0].isPlaying) {
        roomMusics[0].play({ loop: true, volume: 0.3 });
      }
    } else {
      this.game.sound.play("room-music", { loop: true, volume: 0.3 });
    }

    window.cam = this.cameras.main;

    this.cameras.main.startFollow(this.player.player, 200, 30, 30, 0, -20);
    this.cameras.main.backgroundColor.setTo(46, 49, 62);

    this.portcullis = new Portcullis(this);
    this.portcullis.create(doorPosition);

    if (
      this.room_manager.currentChainDepth <= this.room_manager.unlockedDepth
    ) {
      this.portcullis.setVulnerable(true);
    } else if (!this.room_manager.myChain) {
    }

    // this.doorExit.setSize(70, 100);

    console.log("room1 mushrooms: " + this.roomConfig.numMushrooms);
    for (let m = 0; m < this.roomConfig.numMushrooms; m++) {
      let mushroom = new Decoration(this);
      mushroom.create();
      this.decorations.push(mushroom);
      mushroom.mainSprite.copyPosition(
        this.room_manager.rnd.pick(
          this.tileMap.tileMap.getObjectLayer("Enemy Spawn Points").objects
        )
      );
      mushroom.mainSprite.x *= PIXEL_SCALE;
      mushroom.mainSprite.y *= PIXEL_SCALE;
    }

    this.numEnemies = this.roomConfig.numEnemies;
    let percentCaptains = this.roomConfig.percentCaptains;
    for (let e = 0; e < this.numEnemies; e++) {
      let enemy;

      // Always have at least 1 captain after level 3
      if (e === 0 && this.room_manager.currentChainDepth >= 3) {
        enemy = new Captain(this, this.roomConfig);
        enemy.create();
        this.captains.push(enemy);
      } else {
        if (this.room_manager.rnd.frac() * 100 <= percentCaptains) {
          enemy = new Captain(this, this.roomConfig);
          enemy.create();
          this.captains.push(enemy);
        } else {
          enemy = new Pinky(this, this.roomConfig);
          enemy.create();
          this.pinkies.push(enemy);
        }
      }

      // pick one of the enemy placements objects file the tiled map
      enemy.mainSprite.copyPosition(
        this.room_manager.rnd.pick(
          this.tileMap.tileMap.getObjectLayer("Enemy Spawn Points").objects
        )
      );
      enemy.mainSprite.x *= PIXEL_SCALE;
      enemy.mainSprite.y *= PIXEL_SCALE;
    }

    this.physics.add.collider(
      this.player.player,
      this.portcullis.portcullis,
      (player, door, colInfo) => {
        if (!this.portcullis.locked) {
          this.exitingRoom();
        } else if (this.room_manager.myChain) {
          this.room_manager.unlockedDepth++;
          this.exitingRoom();
        }
      },
      () => !this.portcullis.locked
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
      this.tileMap.map
    );

    // // position the enemies
    // [
    //   ...this.pinkies.map((pinky) => pinky.pinky),
    //   ...this.captains.map((captain) => captain.captain),
    // ].forEach((enemy) => {
    //   // keep randomly repositioning each enemy until they don't overlap the walls
    //   while (this.physics.overlap(enemy, this.map)) {
    //     enemy.setRandomPosition();
    //     console.log(`repositioning enemy to ${enemy.x},${enemy.y}`);
    //   }
    // });

    // collide player weapon with enemies

    this.physics.add.collider(
      this.player.axe,
      [
        this.portcullis.portcullis,
        ...this.pinkies.map((pinky) => pinky.pinky),
        ...this.captains.map((captain) => captain.captain),
      ],
      /** @param {Phaser.GameObjects.GameObject} player
       * @param {Phaser.GameObjects.GameObject} enemy
       */
      (player, enemy, colInfo) => {
        /** @type {Pinky} */
        let enemyActor = enemy.data.get("actor");

        if (enemyActor instanceof Portcullis) {
          if (this.numEnemies == 0) {
            this.player.dealDamage();
            enemyActor.takeDamage(this.player.getTotalDamage());
          }
        } else {
          // deal damage to enemy
          this.player.dealDamage();
          enemyActor.takeDamage(this.player.getTotalDamage());
        }
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
          .setDepth(10000);

        // TODO: fade out player
        setTimeout(() => {
          this.player.hide();
        }, 1000);

        // TODO: add a fade scene transition here
        setTimeout(() => {
          const uiScene = this.scene.get("PlayUIScene");
          uiScene.scene.restart();
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

    this.events.emit("createRoom", this.room_manager.currentChainDepth, this);
    this.events.emit("roomLoaded", this.room_manager.myChain, this);
  }

  update() {
    if (this.player.isAlive) {
      this.player.update();
    }

    this.pinkies.forEach((pinky) => pinky.update());
    this.captains.forEach((captain) => captain.update());
    this.decorations.forEach((decoration) => decoration.update());
  }

  /**
   * Notify this room that an enemy was killed.
   */
  async enemyKilled() {
    this.player.addUltimateCharge();
    this.numEnemies -= 1;
    if (this.numEnemies < 0) {
      this.numEnemies = 0;
    }
    console.log(`enemy killed! ${this.numEnemies} remain`);
    if (this.numEnemies === 0) {
      await this.unlockDoor();
    }
  }

  /** Set the door to unlocked. */
  async unlockDoor() {
    // automatically open the door after a short delay for those who don't know you need to hit it
    setTimeout(() => {
      this.portcullis.unlock();
    }, 1500);

    if (!this.portcullis.vulnerable) {
      // allow player to start hitting the door
      this.portcullis.setVulnerable(true);

      // Increment the players rooms cleared count
      const playerId = localStorage.getItem("player_id");
      const remotePlayer = await this.gqlClient.queryPlayerByID(playerId);

      if (this.room_manager.currentChainDepth > remotePlayer.rooms_cleared) {
        const newRoomsCleared = parseInt(remotePlayer.rooms_cleared) + 1;
        const updatedPlayer = await this.gqlClient.updatePlayer(
          playerId,
          newRoomsCleared
        );
        console.debug("updatedPlayer:", updatedPlayer);
        localStorage.setItem(
          "player_rooms_cleared",
          newRoomsCleared.toString()
        );
      }
    }
  }

  exitingRoom() {
    console.log("exiting room");
    if (
      !this.room_manager.myChain ||
      this.room_manager.currentChainDepth >= this.room_manager.unlockedDepth
    ) {
      this.player.bonusDamage =
        Number(localStorage.getItem("bonus_damage")) + BONUS_DAMAGE_INCREASE;
      localStorage.setItem("bonus_damage", this.player.bonusDamage);
      this.events.emit(
        "playerIncreaseDamage",
        this.player.bonusDamage,
        this
      );
    }
    let room_config = this.room_manager.nextRoom();
    this.registry.destroy(); // destroy registry
    this.events.off("actor-death"); // disable all active events
    this.events.off("roomLoaded");
    this.scene.restart({
      roomConfig: room_config.config,
      playerState: {
        hp: this.player.hp,
        ultimateCharge: this.player.ultimateCharge,
      },
    });
  }
}

export default RoomScene;
