import Phaser from "phaser";
import HubDoor from "../actors/hub_door";
import { Player } from "../actors/player";

class HubScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'HubScene',
        });

        this.player = new Player(this);
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
                        "rooms_cleared": 0,
                        "seed": "1234"
                    }
                    ,
                    {
                        "name": "hannah",
                        "rooms_cleared": 2,
                        "seed": "123asd"
                    }
                    ,
                    {
                        "name": "zoe",
                        "rooms_cleared": 20,
                        "seed": "asdfasdfasd"
                    }
                    ,
                    {
                        "name": "john",
                        "rooms_cleared": 0,
                        "seed": "55555555"
                    }
                    ,
                    {
                        "name": "jane",
                        "rooms_cleared": 5,
                        "seed": "agehajhea"
                    }
                ]
            }
        };

        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.image("cell_door", "images/cell_door.png");
        this.load.image("player", "images/player.png");
        this.player.preload();
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

        Player.createAnims(this);
        this.player.create();

        this.physics.add.overlap(this.player.player, this.doors, (player, door, colInfo) => {
            console.log("overlap: " + door.info.name);
            this.room_manager.initChain(door.info);
            let room_config = this.room_manager.nextRoom();
            this.scene.start(room_config.key, room_config.config);
        });

        this.cameras.main.startFollow(this.player.player, true, 0.4, 0.4);
    }

    update() {
        this.player.update();
    }
}

export default HubScene;
