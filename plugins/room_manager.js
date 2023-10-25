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
    ENEMY_DAMAGE_SCALER,
} from "../variables";
import { Utils } from "../lib/utils.js";

class RoomManager extends Phaser.Plugins.BasePlugin {
    init() { }

    getRoomConfig(depth) {
        depth = depth + 20;
        const key = "RoomScene";
        // this.rnd.pick(this.roomChoices);

        const maxMushrooms = 12;
        const numMushrooms = this.rnd.weightedPick(
            new Array(maxMushrooms).fill(1).map((_n, i) => i)
        );

        // TODO TWEAK DIFFICULTY SCALING HERE
        const numEnemies = depth;
        const percentCaptains = Math.min(100, depth * 2);
        const pinkyHP = PINKY_BASE_HP;
        const captainHP = CAPTAIN_BASE_HP;
        const captainAttackDamage =
            CAPTAIN_ATTACK_DAMAGE + (depth - 2) * ENEMY_DAMAGE_SCALER;
        const captainAttackRange = CAPTAIN_ATTACK_RANGE + depth * 5;
        const captainIdleAfterAttack = CAPTAIN_IDLE_AFTER_ATTACK;
        const captainProjectileSpeed = CAPTAIN_PROJECTILE_SPEED + depth;
        const captainSpeed = CAPTAIN_SPEED + depth;
        const pinkyAttackDamage =
            PINKY_ATTACK_DAMAGE + (depth - 1) * ENEMY_DAMAGE_SCALER;
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

    incrementEvery(current, every) {
        return Math.floor(current / every);
    }

    /** Configs for all the levels for each room type.  To be used with level.js */
    getLevels() {
        return [
            {
                mapName: "room1-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "room1-map",
                jsonPath: "maps/room1.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },
            {
                mapName: "room2-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "room2-map",
                jsonPath: "maps/room2.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },
            {
                mapName: "starnosed-mole-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "starnosed-mole-map",
                jsonPath: "maps/starnosed-mole.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },
            {
                mapName: "room3-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "room3-map",
                jsonPath: "maps/room3.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },
            {
                mapName: "room4-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "room4-map",
                jsonPath: "maps/room4.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },

            {
                mapName: "room5-map",
                mapImagePath: "images/tileset.png",
                objectsImagePath: "images/Objects_atlas.png",
                jsonName: "room5-map",
                jsonPath: "maps/room5.json",
                tilesetNameFromTiled: "tileset",
                objectsTilesetFromTiled: "Objects_atlas",
            },
        ];
    }

    initChain(player_data) {
        const localPlayer = Utils.getLocalStoragePlayer();
        const myID = localPlayer.id;

        this.rnd = new Phaser.Math.RandomDataGenerator([player_data.seed]);
        this.rnd.seed = player_data.seed;

        this.unlockedDepth = player_data.rooms_cleared;
        this.currentChainDepth = 0;
        this.myChain = player_data.id === myID;
    }

    nextRoom() {
        this.currentChainDepth++;
        return this.getRoomConfig(this.currentChainDepth);
    }
}

export default RoomManager;
