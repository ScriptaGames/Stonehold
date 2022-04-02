import Phaser from "phaser";
import MovementScene from "./scenes/movement";

new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [MovementScene],
});
