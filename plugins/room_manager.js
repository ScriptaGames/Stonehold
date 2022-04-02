class RoomManager extends Phaser.Plugins.BasePlugin {
    init() {
        this.roomChoices = [
            'Room1Scene',
            'Room2Scene',
        ];
    }

    initChain(player_data) {
        this.seed = player_data.seed;

        // this.seed = "1123245";
        this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);
        this.rnd.seed = this.seed;
    }

    nextRoom() {
        let room = this.rnd.pick(this.roomChoices);
        console.log(room);
        return room;
    }
}

export default RoomManager;