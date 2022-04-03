import Phaser from "phaser";
import RoomManager from "./plugins/room_manager";
import HubScene from "./scenes/hub";
import RoomScene from "./scenes/room";
import MovementScene from "./scenes/movement";
import MainMenuScene from "./scenes/main_menu.js";

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
  dom: {
    createContainer: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },
  scene: [HubScene, RoomScene],
});
