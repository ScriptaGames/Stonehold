import Phaser from "phaser";
import RoomManager from "./plugins/room_manager";
import HubScene from "./scenes/hub";
import RoomScene from "./scenes/room";
import MovementScene from "./scenes/movement";

new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  plugins: {
    global: [
      {
        key: "RoomManager",
        plugin: RoomManager,
        start: false,
        mapping: "room_manager",
      },
    ],
  },
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [HubScene, RoomScene],
});
