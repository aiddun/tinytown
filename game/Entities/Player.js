import { CSS_COLOR_NAMES } from "../colors";
import PixiEntity from "./PixiEntity";
import { stringHash, PLAYER_SPEED } from "../../components/Game/PixiGame";
import * as PIXI from "pixi.js";

var RADIUS = 15;
var MUTE_TEXTURE = PIXI.Texture.from("/mute.svg");

export class Player extends PixiEntity {
  constructor(x, y, playerId, game, name = "", color = "0xff0000") {
    super(game, x, y);
    this.isUser = false;

    this.nextX = x;
    this.nextY = y;
    this.boost = false;

    this.playerId = playerId;

    this.name = name;
    this.nameChanged = false;
    this.color = color;
    this.colorChanged = false;

    const gameState = this.game.gameComponentState;
    this.background = gameState.background;
    this.backgroundChanged = false;

    this.muted = false;
    // this.audioTrack = null;
    // this.lastTimeStamp = null;
    this.graphic = new PIXI.Graphics();
    this.nameText = new PIXI.Text(this.name, {
      fontFamily: "Arial",
      fontSize: 16,
      fill: "black",
      align: "center",
      lineJoin: "bevel",
      stroke: "white",
      strokeThickness: 2,
    });
    this.muteSprite = new PIXI.Sprite(MUTE_TEXTURE);
    // Initially invisible
    this.muteSprite.visible = false;

    this.container.addChild(this.graphic, this.nameText, this.muteSprite);
    this.msCount = 0;

    this.firstdraw();
  }

  setPosition(x = this.x, y = this.y) {
    this.x = Math.max(RADIUS, Math.min(x, this.game.width - RADIUS));
    this.y = Math.max(RADIUS, Math.min(y, this.game.height - RADIUS));
  }

  setTargetPosition(x, y) {
    this.nextX = Math.max(RADIUS, Math.min(x, this.game.width - RADIUS));
    this.nextY = Math.max(RADIUS, Math.min(y, this.game.height - RADIUS));
  }

  setTargetDelta(x, y) {
    this.nextX = Math.max(
      RADIUS,
      Math.min(this.nextX + x, this.game.width - RADIUS)
    );
    this.nextY = Math.max(
      RADIUS,
      Math.min(this.nextY + y, this.game.height - RADIUS)
    );
  }

  setColor(color) {
    this.color = color;

    this.graphic.clear();
    this.graphic.beginFill(PIXI.utils.string2hex(this.color));
    this.graphic.drawCircle(0, 0, RADIUS); // drawCircle(x, y, radius)
    this.graphic.endFill();
  }

  setName(name) {
    this.name = name;
    this.nameText.text = name;
  }

  setBackground(background) {
    this.background = background;
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

  mute() {
    // Invert muted
    this.muted ^= 1;
    this.muteSprite.visible = this.muted;
  }

  onClick(e) {
    e.stopPropagation();
    this.mute();
  }

  firstdraw() {
    this.graphic.clear();
    // this.graphic.beginFill(0x0); // White border
    // this.graphic.drawCircle(0, 0, RADIUS * 1.05); // drawCircle(x, y, radius)
    // this.graphic.endFill();
    this.graphic.beginFill(PIXI.utils.string2hex(this.color));
    this.graphic.drawCircle(0, 0, RADIUS); // drawCircle(x, y, radius)
    this.graphic.endFill();

    // Interactivity
    const hitArea = new PIXI.Circle(0, 0, RADIUS + 3);
    this.graphic.hitArea = hitArea;
    this.graphic.interactive = true;
    this.graphic.buttonMode = true;
    const onClick = this.onClick.bind(this);
    // Pointertap for click + touch
    this.graphic.on("pointertap", onClick);

    // Scale mute button
    this.muteSprite.width = 2 * RADIUS * 0.7;
    this.muteSprite.height = 2 * RADIUS * 0.7;
    this.muteSprite.anchor.set(0.5, 0.5);

    this.nameText.interactive = true;
    this.nameText.buttonMode = true;
    this.nameText.on("pointertap", onClick);
    this.nameText.anchor.set(0.5, -0.6);

    this.container.x = this.x;
    this.container.y = this.y;
  }

  draw(deltaMS, first = false) {
    // If not loaded
    if (!this.graphic || !this.nameText) return;

    let V_S = 65;
    const BOOST_FACTOR = 2;

    const xDiff = this.nextX - this.x;
    const yDiff = this.nextY - this.y;

    // // 3 seconds of walking time -> teleport
    // const MAX_WALK = 5 * V_S;
    // if (xDiff > MAX_WALK || xDiff > MAX_WALK) {
    //   V_S = 1000;
    // }

    // How much to travel in time frame
    const delta_in_s = deltaMS / 1000;
    const distFromVelocity = V_S * delta_in_s;

    const xDiffAbs = Math.abs(xDiff);
    const yDiffAbs = Math.abs(yDiff);

    if (!first && xDiffAbs < 0.001 && yDiffAbs < 0.001) return;

    // |_\
    const angle = Math.atan(xDiffAbs / yDiffAbs);
    const xDistFromVelocity = Math.sin(angle) * distFromVelocity;
    const yDistFromVelocity = Math.cos(angle) * distFromVelocity;

    // If xDiffAbs or yDiffAbs is less than how far it will travel, travel by only that much
    const travelDispX = Math.min(xDistFromVelocity, xDiffAbs);
    const travelDispY = Math.min(yDistFromVelocity, yDiffAbs);

    const travelX = Math.sign(xDiff) * travelDispX;
    const travelY = Math.sign(yDiff) * travelDispY;

    this.x += travelX || 0;
    this.y += travelY || 0;

    this.container.x = this.x;
    this.container.y = this.y;
  }

  destructor() {
    console.log(`destructing ${this.playerId}`);
    super.destructor();
  }
}

export class User extends Player {
  constructor(x, y, playerId, game, name = "", color = 0xff0000) {
    super(x, y, playerId, game, name, color);
    this.moved = false;
    this.isUser = true;
  }

  updateAudio() {}

  onTick() {
    const gameState = this.game.gameComponentState;

    // Check for name change on every tick, but only send every 10 or so
    // Same for other user-customizable attributes

    // Check if name changed
    // TODO: Refactor
    const gameStateName = gameState.nameInput;
    if (this.name !== gameStateName) {
      this.setName(gameStateName);
      this.nameChanged = true;
    }

    // Check if color changed
    const gameStateColor = gameState.colorInput;
    if (gameStateColor.length != 0 && this.color !== gameStateColor) {
      this.setColor(gameStateColor);
      this.colorChanged = true;
    }

    // Check if background changed
    const gameStateBackground = gameState.background;
    if (this.background !== gameStateBackground) {
      debugger;
      this.setBackground(gameStateBackground);
      this.backgroundChanged = true;
    }

    const deltaMS = this.game.ticker.elapsedMS;
    const msCount = (this.msCount += deltaMS);
    if (msCount < 100) return;

    if (this.nameChanged) {
      this.emitNameChange();
      this.nameChanged = false;
    }
    if (this.colorChanged) {
      this.emitColorChange();
      this.colorChanged = false;
    }
    if (this.backgroundChanged) {
      this.emitBackgroundChange();
      this.backgroundChanged = false;
    }

    // Move V_S units/s for .1 s
    const V_S = 75;
    const BOOST_FACTOR = 2;

    const dist = V_S * (msCount / 1000);

    let dx = 0;
    let dy = 0;
    let boost = false;

    this.game.keysdown.forEach((key) => {
      if (key === "w") dy -= dist;
      else if (key === "a") dx -= dist;
      else if (key === "s") dy += dist;
      else if (key === "d") dx += dist;
      else if (key === "shift") boost = true;
    });

    this.game.players.player.boost = boost;
    // Mini optimization but do a single branch rather than mult
    // if (boost)
    //   this.players.player.setTargetDelta(dx * BOOST_FACTOR, dy * BOOST_FACTOR);
    // else
    this.game.players.player.setTargetDelta(dx, dy);
    this.msCount = 0;

    if (dx || dy) {
      this.emitMovement();
    }
  }

  emitNameChange() {
    this.game.udpChannel.emit(
      "nameChange",
      { player: { name: this.name } },
      { reliable: true }
    );
  }

  emitMovement() {
    this.game.udpChannel.emit("move", {
      player: { x: this.nextX, y: this.nextY },
    });
  }

  emitColorChange() {
    this.game.udpChannel.emit("colorChange", { player: { color: this.color } });
  }

  emitBackgroundChange() {
    this.game.udpChannel.emit("backgroundChange", {
      background: this.background,
    });
  }
}
