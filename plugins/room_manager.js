import Phaser from "phaser";
import {
  CAPTAIN_ATTACK_DAMAGE,
  CAPTAIN_ATTACK_RANGE,
  CAPTAIN_BASE_HP,
  CAPTAIN_IDLE_AFTER_ATTACK,
  CAPTAIN_PROJECTILE_SPEED,
  CAPTAIN_SPEED,
  PINKY_ATTACK_DAMAGE,
  PINKY_ATTACK_RANGE,
  PINKY_BASE_HP,
  PINKY_IDLE_AFTER_ATTACK,
  PINKY_SPEED,
} from "../variables";
import { Utils } from "../lib/utils.js";

class RoomManager extends Phaser.Plugins.BasePlugin {
  init() {
    this.localPlayer = Utils.getLocalStoragePlayer();
    this.myID = this.localPlayer.id;
  }

  getRoomConfig(depth) {
    const key = "RoomScene";
    // this.rnd.pick(this.roomChoices);

    const maxMushrooms = 12;
    const numMushrooms = this.rnd.weightedPick(
      new Array(maxMushrooms).fill(1).map((n, i) => i)
    );

    // TODO TWEAK DIFFICULTY SCALING HERE
    const numEnemies = depth;
    const percentCaptains = Math.min(100, depth * 2);
    const pinkyHP = PINKY_BASE_HP + depth;
    const captainHP = CAPTAIN_BASE_HP + Math.ceil(depth + depth / 2);
    const captainAttackDamage = CAPTAIN_ATTACK_DAMAGE + depth;
    const captainAttackRange = CAPTAIN_ATTACK_RANGE + depth * 5;
    const captainIdleAfterAttack = CAPTAIN_IDLE_AFTER_ATTACK;
    const captainProjectileSpeed = CAPTAIN_PROJECTILE_SPEED + depth;
    const captainSpeed = CAPTAIN_SPEED + depth;
    const pinkyAttackDamage = PINKY_ATTACK_DAMAGE + depth;
    const pinkyIdleAfterAttack = PINKY_IDLE_AFTER_ATTACK;
    const pinkySpeed = PINKY_SPEED + depth;

    const levelMap = this.rnd.pick(this.getLevels());

    const config = {
      key,
      config: {
        key,
        depth,
        levelMap,
        numMushrooms,
        numEnemies,
        percentCaptains,
        captainHP,
        pinkyHP,
        captainAttackDamage,
        captainAttackRange,
        captainIdleAfterAttack,
        captainProjectileSpeed,
        captainSpeed,
        pinkyAttackDamage,
        pinkyIdleAfterAttack,
        pinkySpeed,
      },
    };

    console.debug(config);

    return config;
  }

  /** Configs for all the levels for each room type.  To be used with level.js */
  getLevels() {
    return [
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
      },
      {
        mapName: "room2-map",
        mapImagePath: "images/room2_walls.png",
        objectsImagePath: "images/Objects_atlas.png",
        jsonName: "room2-map",
        jsonPath: "maps/room2.json",
        tilesetNameFromTiled: "room2_walls",
        objectsTilesetFromTiled: "room2_objects",
        playerSpawn: { x: 1134, y: 1658 },
        //playerSpawn: { x: 3096, y: 1338 + 200 }, // spawn beside door
        doorPosition: { x: 984, y: 648 },
      },
      // {
      //   mapName: "room3-map",
      //   mapImagePath: "images/room3_walls.png",
      //   jsonName: "room3-map",
      //   jsonPath: "maps/room3.json",
      //   tilesetNameFromTiled: "room3_walls",
      // },
      // {
      //   mapName: "room4-map",
      //   mapImagePath: "images/room4_walls.png",
      //   jsonName: "room4-map",
      //   jsonPath: "maps/room4.json",
      //   tilesetNameFromTiled: "room4_walls",
      // },
    ];
  }

  initChain(player_data) {
    this.rnd = new Phaser.Math.RandomDataGenerator([player_data.seed]);
    this.rnd.seed = player_data.seed;

    this.unlockedDepth = player_data.rooms_cleared;
    this.currentChainDepth = 0;
    this.myChain = player_data.id === this.myID;
  }

  nextRoom() {
    this.currentChainDepth++;
    return this.getRoomConfig(this.currentChainDepth);
  }
}

export default RoomManager;
