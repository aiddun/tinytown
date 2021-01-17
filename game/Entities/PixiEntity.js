import * as PIXI from "pixi.js";

export default class PixiEntity {
  constructor(game, x = 0, y = 0) {
    this.container = new PIXI.Container();
    this.x = x;
    this.y = y;

    game.ticker.add((dt) => {
      this.onTick(dt);
      this.draw(dt);
    });
  }

  onTick() {}

  draw() {}

  destructor() {
    this.graphic.destroy();
  }
}
