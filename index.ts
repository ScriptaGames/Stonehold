import Phaser from "phaser";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
});
