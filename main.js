import Phaser from "phaser";
import RoomManager from "./plugins/room_manager";
import ExampleScene from "./scenes/example";
import Room1Scene from "./scenes/room1";
import Room2Scene from "./scenes/room2";

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
  scene: [Room1Scene, Room2Scene],
});
