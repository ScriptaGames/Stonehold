import Phaser from "phaser";
import RoomManager from "./plugins/room_manager";
import ExampleScene from "./scenes/example";
import HubScene from "./scenes/hub";
import RoomScene from "./scenes/room";

new Phaser.Game({
  type: Phaser.AUTO,
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: false
    }
  },
  plugins: {
    global: [
      { key: 'RoomManager', plugin: RoomManager, start: false, mapping: 'room_manager' },
    ]
  },
  scale: {
    parent: "game",
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
  },
  scene: [HubScene, RoomScene],
});
