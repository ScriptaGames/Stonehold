import Phaser from "phaser";

class Room2Scene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'Room2Scene'
        })
    }

    init(data) {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.image("room2_background", "images/room2_background.png");
        this.load.image("door", "images/door_rubble.png");
        this.load.image("door_open", "images/door_open.png");
        this.load.image("mushroom", "images/mushroom.png");
        this.load.image("player", "images/player.png");
    }

    create() {
        console.log("room2 create");
        this.add.sprite(0, 0, "room2_background");
        
        const doorExit = this.physics.add.sprite(500, 150, "door");
        const doorEntrance = this.add.sprite(15, 150, "door_open");

        const numMushrooms = this.room_manager.rnd.between(5, 10);
        console.log("room2 mushrooms: " + numMushrooms);
        for (let m = 0; m < numMushrooms; m++) {
            let x = this.room_manager.rnd.between(20, 300);
            let y = this.room_manager.rnd.between(20, 300);
            this.add.sprite(x, y, "mushroom");
        }

        this.player = this.physics.add.sprite(200, 100, "player");

        // this.physics.add.overlap(this.player, this.doorExit, this.exitingRoom, null, this);
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

        if (this.player.x >= 500) {
            this.exitingRoom();
        }
    }

    exitingRoom() {
        console.log('exiting room');
        let next = this.room_manager.nextRoom();
        this.scene.start(next);
    }
}

export default Room2Scene;