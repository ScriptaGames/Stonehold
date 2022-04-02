import Phaser from "phaser";
import ExampleScene from "./scenes/example";

new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  scene: [ExampleScene],
});
