import Phaser from "phaser";

class ExampleScene extends Phaser.Scene {
    graphics: Phaser.GameObjects.Graphics;
    logo: Phaser.GameObjects.Image;
    path: Phaser.Curves.Path;

    init() {
    }
    preload() {
        this.load.image("logo", "images/logo.png");
    }
    create() {
        this.graphics = this.add.graphics();

        const firstPosition = this.getLogoPosition();
        this.path = new Phaser.Curves.Path(firstPosition[0], firstPosition[1]);
        this.logo = this.add.image(firstPosition[0], firstPosition[1], "logo").setName("logo");
    }
    update() {
        const newPosition = this.getLogoPosition();
        this.logo?.setPosition(newPosition[0], newPosition[1]);
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xcfcfcf, 0.3);
        this.path?.lineTo(this.logo.getCenter());
        this.path?.draw(this.graphics);
    }
    getLogoPosition() {
        return [this.cameras.main.centerX + 300 * Math.sin(this.time.now / 317), this.cameras.main.centerY + 200 * Math.cos(this.time.now / 359)];
    }
}

export default ExampleScene;
