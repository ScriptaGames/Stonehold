import Phaser from "phaser";
import { GraphQLClient } from "../lib/GraphQLClient.js";
import shortUUID from "short-uuid";
import ProfanityFilter from "bad-words-relaxed";
import xss from "xss";
import { Utils } from "../lib/utils.js";
import { PIXEL_SCALE } from "../variables.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
    this.gqlClient = new GraphQLClient();
  }

  preload() {
    this.load.html("nameform", "nameform.html");
    this.load.image("title_background", "images/Stonehold_title_688_x_512.png");
    this.load.audio("hub-music", "audio/ld50-level_ambient.mp3");
  }

  async create() {
    // set master volume
    // this.game.sound.setVolume(1);

    // Add background image
    const titleImage = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "title_background"
    );
    titleImage.setScale(PIXEL_SCALE / 2);

    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const element = this.add
      .dom(screenCenterX, screenCenterY + 150)
      .createFromCache("nameform");
    const scene = this.scene;
    const gqlClient = this.gqlClient;
    const filterName = this.filterName;

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
          name = filterName(inputText.value);
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

          if (existingPlayer) {
            localStorage.setItem("player_name", existingPlayer.name);
            localStorage.setItem("player_seed", existingPlayer.seed);
            localStorage.setItem(
              "player_rooms_cleared",
              existingPlayer.rooms_cleared
            );
          }

          console.debug("existingPlayer:", existingPlayer);
        }

        if (!existingPlayer) {
          // Create the player
          const createdPlayer = await gqlClient.createPlayer({
            name,
            seed,
            rooms_cleared: 0,
          });
          console.debug("Created player:", createdPlayer);

          // Save player to local storage
          localStorage.setItem("player_id", createdPlayer.id);
          localStorage.setItem("player_name", name);
          localStorage.setItem("player_seed", seed);
          localStorage.setItem("player_rooms_cleared", 0);
        }

        //  Turn off the click events
        this.removeListener("click");

        scene.start("PlayUIScene");
        scene.start("CellScene", { player: Utils.getLocalStoragePlayer() });
      }
    });

    // play room music if it isn't already playing from the previous room
    if (!this.game.sound.get("hub-music")?.isPlaying) {
      this.game.sound.play("hub-music", { loop: true, volume: 0.3 });
    }
  }

  filterName(name) {
    const profanityFilter = new ProfanityFilter();
    let filtered_name = xss(name);

    // now also remove quotes because they break the backend
    filtered_name = filtered_name.replace(/["']/g, "");

    // now also replace any profane words with astrix
    filtered_name = profanityFilter.clean(filtered_name);

    if (name.length > 20) {
      filtered_name = filtered_name.substring(0, 20);
    }

    return filtered_name;
  }
}
