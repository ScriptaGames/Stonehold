import Phaser from "phaser";

class ExampleScene extends Phaser.Scene {
    init() {
    }
    preload() {
        this.load.image("logo", "images/logo.png");
        this.load.spritesheet("dreyr-idle", "images/Dreyr_idle_strip.png", { frameWidth: 128, frameHeight: 96 });
        this.load.spritesheet("dreyr-run", "images/Dreyr_run_strip.png", { frameWidth: 128, frameHeight: 96 });
        this.load.audio("paeMusic", ["audio/pae-main-menu.mp3"]);
    }
    create() {

        const firstPosition = this.getLogoPosition();

        this.logo = this.add.image(firstPosition[0], firstPosition[1], "logo").setName("logo");
        this.logo.setInteractive();

        // add the audio to the scene.  this should go in create()
        this.paeMusic = this.sound.add("paeMusic");

        // example handlers for user input.  prefer using "gameobjectdown" (ie, mousedown) because it feels like more instant feedback than waiting for mouseup.
        this.input.on("gameobjectdown", (pointer, gameObject) => {
            console.log(`mouse down on ${gameObject.name}`, gameObject);
            this.paeMusic.play();
        });

        // spritesheet animation example

        this.anims.create({
            key: "dreyr-idle",
            frames: this.anims.generateFrameNumbers("dreyr-idle"),
            frameRate: 10,
            repeat: -1,
        });
        this.anims.create({
            key: "dreyr-run",
            frames: this.anims.generateFrameNumbers("dreyr-run"),
            frameRate: 10,
            repeat: -1,
        });

        const dreyr = this.add.sprite(150, 600);
        dreyr.setScale(4);
        dreyr.play("dreyr-idle");
        dreyr.setInteractive();
        dreyr.on("gameobjectdown", () => {
            console.log("dreyr");
        });

        this.dreyrRunTimer = this.time.addEvent({
            delay: 5000,
            loop: true,
            callback() {
                // alternate between idle and run each time the timer completes
                if (dreyr.anims.currentAnim.key == "dreyr-idle") {
                    dreyr.play("dreyr-run");
                } else {
                    dreyr.play("dreyr-idle");
                }
            }
        });

        // tween example

        const tween = this.tweens.add({
            targets: this.logo,
            alpha: 0.5,
            duration: 800,
            paused: false,
            ease: Phaser.Math.Easing.Quadratic.InOut, // https://easings.net/
            yoyo: true,
            repeat: -1
        });
        // if you need to stop it: tween.stop();
    }
    update() {
        const newPosition = this.getLogoPosition();
        this.logo.setPosition(newPosition[0], newPosition[1]);
    }
    getLogoPosition() {
        return [this.cameras.main.centerX + 300 * Math.sin(this.time.now / 317), this.cameras.main.centerY + 200 * Math.cos(this.time.now / 359)];
    }
}

export default ExampleScene;
