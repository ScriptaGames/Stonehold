import Phaser from "phaser";
import { Player } from "../components/player";

class MovementScene extends Phaser.Scene {
  constructor(config) {
    super(config);

    this.player = new Player(this);
  }
  init() {}
  preload() {
    this.player.preload();
  }
  create() {
    Player.createAnims(this);
    this.player.create();
  }

  update() {
    this.player.update();
  }
}

export default MovementScene;
