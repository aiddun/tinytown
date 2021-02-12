import * as PIXI from "pixi.js";
// import { asyncScheduler, fromEvent } from "rxjs";
// import { throttleTime } from "rxjs/operators";
import { Player, User } from "./Entities/Player";
import geckos from "@geckos.io/client";
import "./dblclick";

export default class Game extends PIXI.Application {
  constructor(
    roomId,
    height,
    width,
    canvasRef,
    gameComponentState,
    setGameComponentState
  ) {
    super({
      view: canvasRef.current,
      width: width,
      height: height,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      antialias: true,
      transparent: true,
      resolution: 2,
    });

    this.width = width;
    this.height = height;

    this.roomId = roomId;
    this.canvasRef = canvasRef;
    this.gameComponentState = gameComponentState;
    this.setGameComponentState = setGameComponentState;

    this.players = {};
    this.keysdown = new Set();

    this.udpChannel = geckos({ authorization: this.roomId }); // default port is 9208

    // Setup stage interactivity for click movement
    this.stage.interactive = true;
    this.stage.hitArea = new PIXI.Rectangle(0, 0, width, height);

    this.udpChannel.onConnect((error) => {
      if (error) {
        console.log("err");
        console.error(error.message);
        return;
      }

      this.udpChannel.on("setup", (data) => this.setup(data));
      this.udpChannel.on("data", this.ondata);
      this.udpChannel.on("newPlayer", ({ id, player }) => {
        const { x, y, name, color } = player;
        this.players[id] = new Player(x, y, id, this, name, color);
        this.setGameComponentState({
          playerCount: Object.keys(this.players).length,
        });
      });
      this.udpChannel.emit("joinRoom", { room: this.roomId });
      this.udpChannel.on("userDisconnect", ({ id }) => {
        if (id in this.players) {
          this.players[id].destroy();
          delete this.players[id];
        }
        this.setGameComponentState({
          playerCount: Object.keys(this.players).length,
        });
      });
    });
  }

  setup = (data) => {
    const { players, error } = data;
    if (error) {
      alert("Error: room does not exist");
      return;
    }
    Object.entries(players).forEach(([id, player]) => {
      const { x, y, name, color } = player;
      if (id === this.udpChannel.id) {
        this.setupPlayer(player);
      } else {
        const newPlayer = new Player(x, y, id, this, name, color);
        this.players[id] = newPlayer;
      }
    });
    this.setGameComponentState({
      playerCount: Object.keys(this.players).length,
    });
  };

  ondata = (data) => {
    const room = data;
    Object.entries(room).forEach(([id, playerData]) => {
      // Ignore player bc player is always right. Should anyways but just in case
      if (id === this.udpChannel.id) return;
      const { x, y, name, color, background } = playerData;
      if (id in this.players) {
        const player = this.players[id];
        if (x && y) player.setTargetPosition(x, y);
        if (name) player.setName(name);
        if (color) player.setColor(color);
        if (background) this.setGameComponentState({ background });
      }
    });
  };

  setupPlayer = (player) => {
    const { x, y, name, color, id } = player;
    this.setGameComponentState({ colorInput: color });
    this.players.player = new User(x, y, id, this, name, color);

    this.setupKeysDown();
    this.ticker.add(this.onKeysDown);

    this.setGameComponentState({
      colorInput: color,
      gameStatusText: "audio connecting",
    });
    // this.tickFuncs.add(this.onKeysDown);
    // HACK
    // TODO: Remove hack and find a better throttling fix
    // setInterval(() => this.keysdown.clear(), 100);

    const onTouch = (e) => {
      if (e.data.button > 0) return;
      const point = e.data.global;
      const { player } = this.players;
      player.setTargetPosition(point.x, point.y);
      player.emitMovement();
    };

    this.stage.on("dblclick", onTouch);
    this.stage.on("tap", onTouch);
  };

  setupKeysDown = () => {
    // Keydown event
    this.canvasRef.current.addEventListener("keydown", ({ key }) =>
      this.keysdown.add(key.toLowerCase())
    );
    // always listen for keyup
    this.canvasRef.current.addEventListener("keyup", ({ key }) =>
      this.keysdown.delete(key.toLowerCase())
    );

    this.canvasRef.current.addEventListener("focusout", () => {
      this.keysdown.clear();
    });
  };

  // hack
  gameComponentDidUpdate = (newState) => {
    this.gameComponentState = newState;
  };

  onTick = () => {};
}
