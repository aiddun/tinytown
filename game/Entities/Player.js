import { CSS_COLOR_NAMES } from "../colors";
import PixiEntity from "./PixiEntity";
import { stringHash, PLAYER_SPEED } from "../../components/Game/PixiGame";
import * as PIXI from "pixi.js";

export class Player extends PixiEntity {
  constructor(x, y, playerId, game, name = "") {
    super(game, x, y);
    this.nextX = x;
    this.nextY = y;
    this.boost = false;

    this.playerId = playerId;
    // We need this because agora user ids can only be ints
    this.idHash = stringHash(playerId);
    this.name = name;
    // this.audioTrack = null;
    // this.lastTimeStamp = null;
    this.graphic = new PIXI.Graphics();
    this.text = new PIXI.Text("djslfk", {
      fontFamily: "Arial",
      fontSize: 10,
      fill: 0xff1010,
      align: "center",
    });
    this.container.addChild(this.graphic, this.text);

    this.firstdraw();
  }

  setPosition(x = this.x, y = this.y) {
    this.x = x;
    this.y = y;
  }

  setTargetPosition(x, y) {
    this.nextX = x;
    this.nextY = y;
  }

  setTargetDelta(x, y) {
    // console.log(this.nextX);
    this.nextX += x;
    this.nextY += y;
  }

  getDistance(user) {
    return Math.sqrt((user.x - this.x) ** 2 + (user.y - this.y) ** 2);
  }

  ontick() {}

  updateAudio(user) {
    if (this.audioTrack) {
      let dist = this.getDistance(user);
      dist = dist > 200 ? 200 : dist;
      const vol = 200 - dist;
      this.audioTrack.setVolume(vol);
    }
  }

  olddraw(delta, force = false) {
    if (!this.graphic || !this.text) return;

    const V = 1;
    const BOOST_FACTOR = 2;

    const xDiff = this.nextX - this.x;
    const yDiff = this.nextY - this.y;

    const xDiffAbs = Math.abs(xDiff);
    const yDiffAbs = Math.abs(yDiff);

    if (!force && xDiffAbs < 0.01 && yDiffAbs < 0.01) return;

    // If xDiffAbs and yDiffAbs is less than how far it will travel, travel by only that much
    let distFromVelocity = delta * V;

    const travelDispX = Math.min(distFromVelocity, xDiffAbs);
    const travelDispY = Math.min(distFromVelocity, yDiffAbs);

    const travelX = Math.sign(xDiff) * travelDispX;
    const travelY = Math.sign(yDiff) * travelDispY;

    this.x += travelX || 0;
    this.y += travelY || 0;

    this.graphic.clear();
    this.graphic.beginFill(0xe74c3c); // Red
    this.graphic.drawCircle(this.x, this.y, 10); // drawCircle(x, y, radius)
    this.graphic.endFill();

    if (this.text) {
      this.text.x = this.x;
      this.text.y = this.y;
    }
  }

  firstdraw() {
    const RADIUS = 10;
    this.graphic.clear();
    this.graphic.beginFill(0xe74c3c); // Red
    this.graphic.drawCircle(0, 0, RADIUS); // drawCircle(x, y, radius)
    this.graphic.endFill();

    this.text.anchor.set(0.5, -0.5);

    this.container.x = this.x;
    this.container.y = this.y;
  }

  draw(delta, first = false) {
    if (!this.graphic || !this.text) return;

    const V = 1;
    const BOOST_FACTOR = 2;

    const xDiff = this.nextX - this.x;
    const yDiff = this.nextY - this.y;

    const xDiffAbs = Math.abs(xDiff);
    const yDiffAbs = Math.abs(yDiff);

    if (!first && xDiffAbs < 0.01 && yDiffAbs < 0.01) return;

    // If xDiffAbs and yDiffAbs is less than how far it will travel, travel by only that much
    let distFromVelocity = delta * V;

    const travelDispX = Math.min(distFromVelocity, xDiffAbs);
    const travelDispY = Math.min(distFromVelocity, yDiffAbs);

    const travelX = Math.sign(xDiff) * travelDispX;
    const travelY = Math.sign(yDiff) * travelDispY;

    this.x += travelX || 0;
    this.y += travelY || 0;

    this.container.x = this.x;
    this.container.y = this.y;
  }

  destructor() {
    super.destructor();
  }
}

export class User extends Player {
  constructor(x, y, rotation = 0, name = "", playerId, canvas, ctx) {
    super(x, y, rotation, name, playerId, canvas, ctx);
    this.vx = 0;
    this.vy = 0;
    this.angularvelocity = 0;
    this.moved = false;
  }

  setVX(vx) {
    this.vx = vx;
  }

  setVY(vy) {
    this.vy = vy;
  }

  setPosition(omega) {
    this.angularvelocity = omega;
  }

  updateAudio() {}

  ontick() {
    // this.x =
    //   (this.x + this.vx + this.canvas.current.width) %
    //   this.canvas.current.width;
    // this.y =
    //   (this.y + this.vy + this.canvas.current.height) %
    //   this.canvas.current.height;
    // this.rotation += this.angularvelocity;
    // this.moved = this.vx | this.vy | this.rotation;
  }
}
