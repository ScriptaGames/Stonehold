import Phaser from "phaser";

class RoomScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'RoomScene'
        })
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
        this.load.image("player", "images/player.png");
        this.load.image("enemy", "images/enemy.png");
        this.load.image("enemy_captain", "images/enemy_captain.png");
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

        let numMushrooms = this.roomConfig.num_mushrooms;
        console.log("room1 mushrooms: " + numMushrooms);
        for (let m = 0; m < numMushrooms; m++) {
            let x = this.room_manager.rnd.between(20, 300);
            let y = this.room_manager.rnd.between(20, 300);
            this.add.sprite(x, y, "mushroom");
        }

        this.player = this.physics.add.sprite(800, 100, "player");

        this.physics.add.collider(this.player, this.doorExit, (player, door, colInfo) => {
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
        let input = new Phaser.Math.Vector2(0, 0);
        const speed = 200;
        if (this.cursors.left.isDown) {
            input.x -= speed;
        }
        if (this.cursors.right.isDown) {
            input.x += speed; 
        }
        if (this.cursors.up.isDown) {
            input.y -= speed;
        }
        if (this.cursors.down.isDown) {
            input.y += speed;
        }

        if (this.keyEscape.isDown) {
            this.scene.start('HubScene');
        }
    
        this.player.setVelocity(input.x, input.y);
    }

    exitingRoom() {
        console.log('exiting room');
        let room_config = this.room_manager.nextRoom();
        this.scene.start(room_config.key, room_config.config);
    }
}

export default RoomScene;