// import AgoraRTC from "agora-rtc-sdk-ng";
import { createRef } from "react";
import React, { Component } from "react";
import styles from "./game.module.scss";
import Game from "../../game/Game";

// Can be public
// We generate token serverside
var AGORA_APPID = "c2fc730c17d0471188e63e675f7e268d";
var TICK_HZ = 10;
var IDLE_MINUTES = 10;
export var PLAYER_SPEED = 1;

// TODO: Replace with something better
export const stringHash = (s) => {
  return (
    s
      .split("")
      .reduce((acc, curr, index) => acc + curr.charCodeAt(0) * 31 ** index, 0) %
    2 ** 64
  );
};

export default class PixiGame extends Component {
  constructor(props) {
    super(props);
    this.player = null;
    this.players = {};
    this.canvasRef = createRef();

    this.state = {
      audioStatus: "connecting...",
      disconnected: false,
      disconnectedStatus: "",
      nameInput: "",
    };
  }

  componentDidMount() {
    // // init websockets
    // this.socket = io("ws://localhost:3005");
    // Object.entries(this.sockets).forEach(([name, callback]) => {
    //   this.socket.on(name, callback);
    // });

    // init timers
    // Every 15 minutes check to see if this has been set. If not, disconnect.
    this.timeoutTimer = null;
    this.movedInInterval = false;
    // this.setupTimeoutTimer();

    const setGameState = this.setState.bind(this);
    this.game = new Game(this.canvasRef, this.state, setGameState);
  }

  // ontick(timeStamp) {
  //   if (this.player && this.player.moved) {
  //     this.player.moved = false;

  //     // For some reason this is the fastest way to assign binary values in JS (at least v8). Microbenchmarked it.
  //     this.movedInInterval = !0;

  //     this.socket.emit("playerMovement", {
  //       x: this.player.x,
  //       y: this.player.y,
  //       rotation: this.player.rotation,
  //     });
  //   }
  // }

  onNameInput = (e) => {
    this.setState({ nameInput: e.target.value });
  };

  componentDidUpdate = () => {
    this.game.gameComponentDidUpdate(this.state);
  };

  render = () => {
    return (
      <div>
        {/* {this.state.disconnected ? (
          <p>{this.state.disconnectedStatus}</p>
        ) : ( */}
        <div>
          <canvas
            className={`${styles.game} rounded-xl focus:outline-none mx-auto`}
            ref={this.canvasRef}
            id="game"
            tabIndex="-1"
          ></canvas>
        </div>
        <br />
        <input type="text" placeholder="Your name" onInput={this.onNameInput} />
        <strong>{this.state.audioStatus}</strong>
      </div>
    );
  };
}
