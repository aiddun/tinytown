import * as PIXI from "pixi.js";
// import { asyncScheduler, fromEvent } from "rxjs";
// import { throttleTime } from "rxjs/operators";
import { Player, User } from "./Entities/Player";
import geckos from "@geckos.io/client";

export default class Game extends PIXI.Application {
  constructor(canvasRef, gameComponentState, setGameComponentState) {
    super({
      view: canvasRef.current,
      width: 1050,
      height: 750,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      antialias: true,
      transparent: true,
      resolution: 2,
    });
    this.canvasRef = canvasRef;
    this.gameComponentState = gameComponentState;
    this.setGameState = setGameComponentState;
    this.msCount = 0;

    this.players = {};
    this.keysdown = new Set();

    this.udpChannel = geckos(); // default port is 9208

    this.udpChannel.onConnect((error) => {
      if (error) {
        console.error(error.message);
        return;
      }

      this.udpChannel.on("setup", (data) => this.setup(data));
      this.udpChannel.on("data", this.ondata);
      this.udpChannel.on("newPlayer", ({ id, player }) => {
        const { x, y, name, color } = player;
        this.players[id] = new Player(x, y, id, this, name, color);
      });
      this.udpChannel.emit("joinRoom", { room: "test" });
      this.udpChannel.on("userDisconnect", ({ id }) => {
        if (id in this.players) {
          this.players[id].destroy();
          delete this.players[id];
        }
      });
    });
  }

  setup = (data) => {
    const { players } = data;
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
    // console.log(this.players)
    Object.entries(room).forEach(([id, player]) => {
      // Ignore player bc player is always right. Should anyways but just in case
      if (id === this.udpChannel.id) return;
      const { x, y, name } = player;
      if (id in this.players) {
        if (x && y) this.players[id].setTargetPosition(x, y);
        if (name) this.players[id].setName(name);
      }
    });
  };

  setupPlayer = (player) => {
    const { x, y, name, color, id } = player;
    this.players.player = new User(x, y, id, this, name, color);

    // // // 10-tick cycles
    // this.tickFuncs = new Set();
    // setInterval(() => this.tickFuncs.forEach((f) => f()), 100);

    this.setupKeysDown();
    this.ticker.add(this.onKeysDown);
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
