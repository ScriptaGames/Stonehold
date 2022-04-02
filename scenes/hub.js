import Phaser from "phaser";
import HubDoor from "../actors/hub_door";

class HubScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'HubScene',
        });
    }

    init(data) {
        this.players_data = {
            "data": {
                "players": [
                    {
                        "name": "caramelcode",
                        "rooms_cleared": 7,
                        "seed": "sdfsde34653"
                    },
                    {
                        "name": "zip",
                        "rooms_cleared": 3,
                        "seed": "sdfsdf34546"
                    },
                    {
                        "name": "nicksmaddog",
                        "rooms_cleared": 10,
                        "seed": "sdfsdvjkhj676"
                    }
                ]
            }
        };

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.image("cell_door", "images/cell_door.png");
        this.load.image("player", "images/player.png");
    }

    create() {
        this.doors = this.physics.add.staticGroup();

        for (let other_player_index in this.players_data.data.players) {
            let other_player = this.players_data.data.players[other_player_index];
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

        this.player = this.physics.add.sprite(200, 400, "player");

        this.physics.add.overlap(this.player, this.doors, (player, door, colInfo) => {
            console.log("overlap: " + door.info.name);
            this.room_manager.initChain(door.info);
            this.scene.start(this.room_manager.nextRoom());
        });
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
    
        this.player.setVelocity(input.x, input.y);
    }
}

export default HubScene;