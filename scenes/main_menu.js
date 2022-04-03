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

    // Populate previous players name
    const localPlayerName = localStorage.getItem("player_name");
    if (localPlayerName) {
      const nameField = element.getChildByName("nameField");
      nameField.value = localPlayerName;
    }

    // Handle PLAY button click
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

        // first see if this player exists already
        let existingPlayer;
        const localPlayerId = localStorage.getItem("player_id");
        if (localPlayerId) {
          existingPlayer = await gqlClient.queryPlayerByIDAndName(
            localPlayerId,
            name
          );
          console.debug("existingPlayer:", existingPlayer);
        }

        if (!existingPlayer) {
          // Create the player
          const createdPlayer = await gqlClient.createPlayer({
            name,
            seed,
            rooms_cleared: 0,
          });
          console.log("Created player:", createdPlayer);

          // Save player to local storage
          localStorage.setItem("player_id", createdPlayer.id);
          localStorage.setItem("player_name", name);
          localStorage.setItem("player_seed", seed);
        }

        //  Turn off the click events
        this.removeListener("click");

        scene.start("HubScene", { name });
      }
    });
  }
}
