class RoomManager extends Phaser.Plugins.BasePlugin {
    constructor(pluginManager) {
        super(pluginManager);

        // TODO: get seed from API
        this.seed = "1123245";
        this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);

        this.roomChoices = [
            'Room1Scene',
            'Room2Scene',
        ];
    }

    nextRoom() {
        let room = this.rnd.pick(this.roomChoices);
        console.log(room);
        return room;
    }
}

export default RoomManager;