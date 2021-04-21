import { CSS_COLOR_NAMES } from "../colors";
import PixiEntity from "./PixiEntity";
import { stringHash, PLAYER_SPEED } from "../../components/Game/PixiGame";
import * as PIXI from "pixi.js";

var RADIUS = 15;
var MUTE_TEXTURE = PIXI.Texture.from("/img/mute.svg");

export class Player extends PixiEntity {
  constructor(x, y, playerId, game, name = "", emoji) {
    super(game, x, y);
    this.isUser = false;

    this.nextX = x;
    this.nextY = y;
    this.boost = false;

    this.playerId = playerId;

    this.name = name;
    this.nameChanged = false;
    this.emojiChanged = false;

    const gameState = this.game.gameComponentState;
    this.background = gameState.background;
    this.backgroundChanged = false;

    this.muted = false;
    this.agoraAudioTrack = null;

    // this.lastTimeStamp = null;
    this.graphic = new PIXI.Graphics();
    this.emoji = emoji;
    this.emojiText = new PIXI.Text(this.emoji, {
      fontFamily: "Arial",
      fontSize: 36,
      fill: "black",
      align: "center",
      lineJoin: "bevel",
      stroke: 0xf3f4f6,
      strokeThickness: 4,
    });
    this.emojiText.anchor.set(0.5, 0.5);
    this.nameText = new PIXI.Text(this.name, {
      fontFamily: "Arial",
      fontSize: 18,
      fill: "black",
      align: "center",
      lineJoin: "bevel",
      stroke: 0xf3f4f6,
      strokeThickness: 4,
    });
    this.nameText.anchor.set(0.5, -0.5);

    this.muteSprite = new PIXI.Sprite(MUTE_TEXTURE);
    // Initially invisible
    this.muteSprite.visible = false;

    // Scale mute button
    this.muteSprite.width = 2 * RADIUS;
    this.muteSprite.height = 2 * RADIUS;
    this.muteSprite.anchor.set(0.5, 0.5);

    this.container.addChild(this.emojiText, this.nameText, this.muteSprite);
    this.msCount = 0;

    // Last moved time
    this.lastMoved = new Date();

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

  setEmoji(emoji) {
    this.emoji = emoji;
    this.emojiText.text = emoji;
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

  updateVolumeFromDist(dist) {
    if (this.agoraAudioTrack) {
      dist = dist > 200 ? 200 : dist;
      const vol = 200 - dist;
      const { isPlaying } = this.agoraAudioTrack;
      if (dist === 200 && isPlaying) this.agoraAudioTrack.stop();
      else if (!isPlaying && dist < 200) {
        this.agoraAudioTrack.setVolume(vol);
        this.agoraAudioTrack.play();
      } else this.agoraAudioTrack.setVolume(vol);
    }
  }

  firstdraw() {
    this.graphic.clear();
    // this.graphic.beginFill(0x0); // White border
    // this.graphic.drawCircle(0, 0, RADIUS * 1.05); // drawCircle(x, y, radius)
    // this.graphic.endFill();
    this.graphic.beginFill(PIXI.utils.string2hex(this.color));
    this.graphic.drawCircle(0, 0, RADIUS); // drawCircle(x, y, radius)
    this.graphic.endFill();

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

  setMuteSprite(level) {
    switch (level) {
      case 0: {
        this.muteSprite.visible = false;
        this.emojiText.alpha = 1;
        break;
      }
      case 1: {
        this.muteSprite.visible = true;
        this.muteSprite.alpha = 0.2;
        this.emojiText.alpha = 1;
        break;
      }
      default: {
        this.muteSprite.visible = true;
        this.muteSprite.alpha = 1;
        this.emojiText.alpha = .5;
        break;
      }
    }
  }

  mute() {
    this.muted = true;
    this.setMuteSprite(2);
  }

  unmute() {
    this.muted = false;
    this.setMuteSprite(0);
  }

  destructor() {
    console.log(`destructing ${this.playerId}`);
    super.destructor();
  }
}

export class User extends Player {
  constructor(x, y, playerId, game, name = "", emoji = "") {
    super(x, y, playerId, game, name, emoji);
    this.moved = false;
    this.isUser = true;
    this.tapMove = false;

    // Interactivity
    this.emojiText.interactive = true;
    this.emojiText.buttonMode = true;

    // const mouseOver = this.mouseOver.bind(this);
    // this.emojiText.on("mouseover", mouseOver);
    // const mouseOut = this.mouseOut.bind(this);
    // this.emojiText.on("mouseout", mouseOut);

    const onClick = this.onClick.bind(this);
    // Pointertap for click + touch
    this.emojiText.on("pointertap", onClick);

    // if dblclick on player, do nothing unusual
    this.emojiText.on("dblclick", (e) => {
      e.stopPropagation();
    });

    // Scale mute button
    this.muteSprite.width = 2 * RADIUS;
    this.muteSprite.height = 2 * RADIUS;
    this.muteSprite.anchor.set(0.5, 0.5);

    this.nameText.interactive = true;
    this.nameText.buttonMode = true;
    this.nameText.on("pointertap", onClick);
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
    const gameEmoji = gameState.emoji;
    if (this.emoji !== gameEmoji) {
      this.setEmoji(gameEmoji);
      this.emojiChanged = true;
    }

    // Check if background changed
    const gameStateBackground = gameState.background;
    if (this.background !== gameStateBackground) {
      this.setBackground(gameStateBackground);
      this.backgroundChanged = true;
    }

    // check if mute changed
    // Check if background changed
    const gameStateMute = gameState.muted;
    if (this.muted !== gameStateMute) {
      // todo - add mute indicator serverside
      if (gameStateMute) {
        this.mute();
        this.setMuteSprite(2);
      } else {
        this.unmute();
        this.setMuteSprite(0);
      }
    }

    const deltaMS = this.game.ticker.elapsedMS;
    const msCount = (this.msCount += deltaMS);
    if (msCount < 100) return;

    if (this.nameChanged) {
      this.emitNameChange();
      this.nameChanged = false;
    }
    if (this.emojiChanged) {
      this.emiteEmojiChange();
      this.emojiChanged = false;
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
      if (key === "w" || key === "arrowup") dy -= dist;
      else if (key === "a" || key === "arrowleft") dx -= dist;
      else if (key === "s" || key === "arrowdown") dy += dist;
      else if (key === "d" || key === "arrowright") dx += dist;
      else if (key === "shift") boost = true;
    });

    if (dx && dy) {
      dx *= Math.sqrt(1 / 2);
      dy *= Math.sqrt(1 / 2);
    }

    this.boost = boost;
    // Mini optimization but do a single branch rather than mult
    // if (boost)
    //   this.players.player.setTargetDelta(dx * BOOST_FACTOR, dy * BOOST_FACTOR);
    // else
    // this.setTargetDelta(dx, dy);
    if (dx || dy) this.setTargetPosition(this.x + dx, this.y + dy);
    this.msCount = 0;

    if (dx || dy) {
      this.emitMovement();
    }

    Object.entries(this.game.players)
      // Don't include current player
      .filter(([_, player]) => player != this)
      .forEach(([id, player]) => {
        const dist = this.getDistance(player);
        player.updateVolumeFromDist(dist);
      }, this);

    if (this.agoraAudioTrack) {
      // console.log(this.agoraAudioTrack.getVolumeLevel());
    }
  }

  emitNameChange() {
    this.game.socket.emit(
      "nameChange",
      { player: { name: this.name } },
      { reliable: true }
    );
  }

  emitMovement(reliable = true) {
    this.lastMoved = new Date();
    this.game.socket.emit(
      "move",
      {
        player: { x: this.nextX, y: this.nextY },
      },
      { reliable }
    );
  }

  emiteEmojiChange() {
    this.game.socket.emit("emojiChange", { player: { emoji: this.emoji } });
  }

  emitBackgroundChange() {
    this.game.socket.emit("backgroundChange", {
      background: this.background,
    });
  }

  mute() {
    // Invert muted
    this.muted = true;
    this.setMuteSprite(2);
    this.agoraAudioTrack.setEnabled(false);
    this.game.socket.emit("mute", { player: { mute: true } });
  }

  unmute() {
    // Invert muted
    this.muted = false;
    this.setMuteSprite(0);
    this.agoraAudioTrack.setEnabled(true);
    this.game.socket.emit("mute", { player: { mute: false } });
  }

  mouseOver(e) {
    e.stopPropagation();
    this.setMuteSprite(1);
  }

  mouseOut(e) {
    e.stopPropagation();
    this.setMuteSprite(this.muted ? 2 : 0);
  }

  onClick(e) {
    e.stopPropagation();
    if (!this.muted) {
      this.setMuteSprite(2);
      this.mute();
      this.game.setGameComponentState({ muted: true });
    } else {
      this.setMuteSprite(0);
      this.unmute();
      this.game.setGameComponentState({ muted: false });
    }
  }
}
