import * as PIXI from "pixi.js";
// import { asyncScheduler, fromEvent } from "rxjs";
// import { throttleTime } from "rxjs/operators";
import { Player, User } from "./Entities/Player";
import geckos from "@geckos.io/client";

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

    this.roomId = roomId;
    this.canvasRef = canvasRef;
    this.gameComponentState = gameComponentState;
    this.setGameState = setGameComponentState;
    this.msCount = 0;

    this.players = {};
    this.keysdown = new Set();

    this.udpChannel = geckos({ authorization: this.roomId }); // default port is 9208

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
      });
      this.udpChannel.emit("joinRoom", { room: this.roomId });
      this.udpChannel.on("userDisconnect", ({ id }) => {
        if (id in this.players) {
          this.players[id].destroy();
          delete this.players[id];
        }
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
  };

  ondata = (data) => {
    const room = data;
    Object.entries(room).forEach(([id, playerData]) => {
      // Ignore player bc player is always right. Should anyways but just in case
      if (id === this.udpChannel.id) return;
      const { x, y, name, color } = playerData;
      if (id in this.players) {
        const player = this.players[id];
        if (x && y) player.setTargetPosition(x, y);
        if (name) player.setName(name);
        if (color) player.setColor(color);
      }
    });
  };

  setupPlayer = (player) => {
    const { x, y, name, color, id } = player;
    this.setGameState({ colorInput: color });
    this.players.player = new User(x, y, id, this, name, color);

    // // // 10-tick cycles
    // this.tickFuncs = new Set();
    // setInterval(() => this.tickFuncs.forEach((f) => f()), 100);

    this.setupKeysDown();
    this.ticker.add(this.onKeysDown);

    console.log(color)
    this.setGameState({
      colorInput: color,
      gameStatusText: "audio connecting",
    });
    // this.tickFuncs.add(this.onKeysDown);
    // HACK
    // TODO: Remove hack and find a better throttling fix
    // setInterval(() => this.keysdown.clear(), 100);
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

    {
      // this.keyDownObservable = fromEvent(this.canvasRef.current, "keydown");
      // this.keyDownObservable.subscribe(({ key }) => {
      //   this.keysdown.add(key);
      // });
      // Keyup event
      // this.keyUpObservable = fromEvent(this.canvasRef.current, "keyup");
      // this.keyUpObservable.subscribe(({ key }) => {
      //   console.log("here");
      //   this.keysdown.delete(key);
      // });
    }
  };

  // hack
  gameComponentDidUpdate = (newState) => {
    this.gameComponentState = newState;
  };

  onTick = () => {};
}
