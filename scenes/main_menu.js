import Phaser from "phaser";
import { GraphQLClient } from "../lib/GraphQLClient.js";
import shortUUID from "short-uuid";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
    this.gqlClient = new GraphQLClient();
  }

  preload() {
    this.load.html("nameform", "nameform.html");
  }

  async create() {
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const element = this.add
      .dom(screenCenterX, screenCenterY)
      .createFromCache("nameform");
    const scene = this.scene;
    const gqlClient = this.gqlClient;

    element.addListener("click");

    element.on("click", async function (event) {
      if (event.target.name === "playButton") {
        const rn = Phaser.Math.Between(100, 90000);
        const seed = shortUUID.generate();

        const inputText = this.getChildByName("nameField");
        let name;

        //
        if (inputText.value !== "") {
          name = inputText.value;
        } else {
          name = "Prisoner" + rn;
        }

        // TODO: query to see if the player exists before creating them

        // Create the player
        const createdPlayer = await gqlClient.createPlayer({
          name,
          seed,
          rooms_cleared: 0,
        });
        console.log("Created player:", createdPlayer);

        //  Turn off the click events
        this.removeListener("click");

        scene.start("HubScene", { name });
      }
    });
  }
}
