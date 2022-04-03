class RoomManager extends Phaser.Plugins.BasePlugin {
  init() {
    this.myName = "nicksmaddog";
    this.roomChoices = [
      {
        key: "RoomScene",
        numMushrooms: 5,
        numEnemies: 2,
        background: "room_background",
      },
      {
        key: "RoomScene",
        numMushrooms: 10,
        numEnemies: 2,
        background: "room2_background",
      },
    ];
  }

  initChain(player_data) {
    this.rnd = new Phaser.Math.RandomDataGenerator([player_data.seed]);
    this.rnd.seed = player_data.seed;

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
