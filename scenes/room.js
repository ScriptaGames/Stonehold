import Phaser from "phaser";
import { Player } from "../components/player";

class RoomScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'RoomScene'
        });

        this.player = new Player(this);
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
        this.load.image("enemy", "images/enemy.png");
        this.load.image("enemy_captain", "images/enemy_captain.png");

        this.player.preload();
    }

    create() {
        this.add.sprite(0, 0, this.roomConfig.background);
        
        this.doorUnlocked = false;
        let doorTexture = "door";
        if (this.room_manager.currentChainDepth <= this.room_manager.unlockedDepth) {
            doorTexture = "door_open";
            this.doorUnlocked = true;
        } else if (!this.room_manager.myChain) {
            doorTexture = "door_locked";
        }
        this.doorExit = this.physics.add.staticSprite(1024, 150, doorTexture);

        let numMushrooms = this.room_manager.rnd.between(1, this.roomConfig.numMushrooms);
        console.log("room1 mushrooms: " + numMushrooms);
        for (let m = 0; m < numMushrooms; m++) {
            let x = this.room_manager.rnd.between(20, 800);
            let y = this.room_manager.rnd.between(20, 800);
            this.add.sprite(x, y, "mushroom");
        }

        let maxEnemies = this.roomConfig.numEnemies;
        let numEnemies = this.room_manager.rnd.between(maxEnemies / 2, maxEnemies);
        let percentCaptains = 100 * this.room_manager.currentChainDepth / maxEnemies;
        for (let e = 0; e < numEnemies; e++) {
            let x = this.room_manager.rnd.between(20, 800);
            let y = this.room_manager.rnd.between(20, 800);
            let enemyKey = "enemy";
            if (this.room_manager.rnd.frac() * 100 <= percentCaptains) {
                enemyKey = "enemy_captain";
            }
            this.physics.add.staticSprite(x, y, enemyKey);
        }

        Player.createAnims(this);
        this.player.create();

        this.physics.add.collider(this.player.player, this.doorExit, (player, door, colInfo) => {
            console.log("exit overlap");
            if (this.doorUnlocked) {
                this.exitingRoom();
            } else if (this.room_manager.myChain) {
                this.room_manager.unlockedDepth++;
                this.exitingRoom();
            }
        });

        this.keyEscape = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    update() {
        this.player.update();
    }

    exitingRoom() {
        console.log('exiting room');
        let room_config = this.room_manager.nextRoom();
        this.scene.start(room_config.key, room_config.config);
    }
}

export default RoomScene;