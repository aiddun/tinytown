import * as PIXI from "pixi.js";
// import { asyncScheduler, fromEvent } from "rxjs";
// import { throttleTime } from "rxjs/operators";
import { Player } from "./Entities/Player";
import geckos from "@geckos.io/client";

const TICK_RATE = process.env.TICK_RATE;

export default class Game extends PIXI.Application {
  constructor(canvasRef, setGameState) {
    super({
      view: canvasRef.current,
      width: 700,
      height: 500,
      resolution: window.devicePixelRatio,
      autoDensity: true,
      antialias: true,
      transparent: true,
    });
    this.canvasRef = canvasRef;

    this.setGameState = setGameState;

    this.player = new Player(50, 50, "disdf", this);
    this.stage.addChild(this.player.container);

    // 10-tick cycles
    this.tickFuncs = new Set();
    setInterval(() => this.tickFuncs.forEach((f) => f()), 1000 / 10);

    this.setupKeysDown();
    this.tickFuncs.add(this.onKeysDown);

    // // HACK
    // // TODO: Remove hack and find a better throttling fix
    // setInterval(() => this.keysdown.clear(), 1000);

  //   const channel = geckos(); // default port is 9208

  //   channel.onConnect((error) => {
  //     if (error) {
  //       console.error(error.message);
  //       return;
  //     }

  //     channel.on("data", (data) => {
  //       console.log(`You got the message ${data}`);
  //     });

  //     channel.emit("chat message", "a short message sent to the server");
  //   });
  }

  setupKeysDown = () => {
    this.keysdown = new Set();

    // Keydown event
    this.canvasRef.current.addEventListener("keydown", ({ key }) =>
      this.keysdown.add(key.toLowerCase())
    );
    this.canvasRef.current.addEventListener("keyup", ({ key }) =>
      this.keysdown.delete(key.toLowerCase())
    );

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

  onKeysDown = () => {
    const V = 6;
    const BOOST_FACTOR = 2;

    let dx = 0;
    let dy = 0;
    let boost = false;

    this.keysdown.forEach((key) => {
      if (key === "w") dy -= V;
      else if (key === "a") dx -= V;
      else if (key === "s") dy += V;
      else if (key === "d") dx += V;
      else if (key === "shift") boost = true;
    });

    this.player.boost = boost;
    this.player.setTargetDelta(dx, dy);
  };

  onTick = () => {};
}
