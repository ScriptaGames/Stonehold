import Phaser from "phaser";

class ExampleScene extends Phaser.Scene {
    init() {
    }
    preload() {
        this.load.image("logo", "images/logo.png");
        this.load.audio("paeMusic", ["audio/pae-main-menu.mp3"]);
    }
    create() {

        const firstPosition = this.getLogoPosition();

        this.graphics = this.add.graphics();
        this.path = new Phaser.Curves.Path(firstPosition[0], firstPosition[1]);

        this.logo = this.add.image(firstPosition[0], firstPosition[1], "logo").setName("logo");
        this.logo.setInteractive();

        // add the audio to the scene.  this should go in create()
        this.paeMusic = this.sound.add("paeMusic");

        // example handlers for user input.  prefer using "gameobjectdown" (ie, mousedown) because it feels like more instant feedback than waiting for mouseup.
        this.input.on("gameobjectdown", (pointer, gameObject) => {
            console.log(`mouse down on ${gameObject.name}`, gameObject);
            this.paeMusic.play();
        });

        // tween example
        //
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
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xcfcfcf, 0.3);
        this.path.lineTo(this.logo.getCenter());
        this.path.draw(this.graphics);
    }
    getLogoPosition() {
        return [this.cameras.main.centerX + 300 * Math.sin(this.time.now / 317), this.cameras.main.centerY + 200 * Math.cos(this.time.now / 359)];
    }
}

export default ExampleScene;
