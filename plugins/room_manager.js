class RoomManager extends Phaser.Plugins.BasePlugin {
    init() {
        this.myName = "nicksmaddog";
        this.roomChoices = [
            {
                key: 'RoomScene',
                num_mushrooms: 5,
                background: "room_background"
            },
            {
                key: 'RoomScene',
                num_mushrooms: 10,
                background: "room2_background"
            }
        ];

        this.rnd = Phaser.Math.RND;
    }

    initChain(player_data) {
        this.rnd = new Phaser.Math.RandomDataGenerator([this.seed]);
        this.rnd.seed = this.seed;

        this.unlockedDepth = player_data.rooms_cleared;
        this.currentChainDepth = 0;
        this.myChain = player_data.name === this.myName;
    }

    nextRoom() {
        this.currentChainDepth++;
        let room = this.rnd.pick(this.roomChoices);
        console.log(room);
        return {
            key: room.key,
            config: room,
        };
    }
}

export default RoomManager;