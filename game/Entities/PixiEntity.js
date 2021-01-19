import * as PIXI from "pixi.js";

export default class PixiEntity {
  constructor(game, x = 0, y = 0) {
    this.game = game;
    this.container = new PIXI.Container();
    this.x = x;
    this.y = y;

    game.ticker.add(() => {
      this.onTick(game.ticker.elapsedMS);
      this.draw(game.ticker.elapsedMS);
    });

    game.stage.addChild(this.container);
  }

  onTick() {}

  draw() {}

  destroy() {
    this.container.destroy({ children: true });
  }
}
