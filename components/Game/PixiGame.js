// import AgoraRTC from "agora-rtc-sdk-ng";
import { createRef, useState } from "react";
import React, { Component } from "react";
import styles from "./game.module.scss";
import Game from "../../game/Game";
import { AwesomeButton } from "react-awesome-button";
import { useRouter } from "next/router";

// Can be public
// We generate token serverside
var AGORA_APPID = "c2fc730c17d0471188e63e675f7e268d";
var TICK_HZ = 10;
var IDLE_MINUTES = 10;
export var PLAYER_SPEED = 1;

var GAME_HEIGHT = 750;
var GAME_WIDTH = 1000;

// TODO: Replace with something better
export const stringHash = (s) => {
  return (
    s
      .split("")
      .reduce((acc, curr, index) => acc + curr.charCodeAt(0) * 31 ** index, 0) %
    2 ** 64
  );
};

const ErrorAlert = ({ errorMsg }) => {
  const router = useRouter();
  const [animateLeave, setanimateLeave] = useState(false);

  return (
    <div className="absolute w-screen z-20">
      <div
        className="rounded-2xl bg-white	mx-auto mt-40 shadow-lg p-8"
        style={{ width: "20rem", height: "15rem" }}
      >
        <p
          className="text-3xl font-bold"
          style={{
            transition: "transform 2s ease-in",
            transform: animateLeave ? "translate(100vw, -100vh)" : "unset",
          }}
        >
          🛩️
        </p>
        <h1 className="text-3xl font-bold pt-4"> {errorMsg}</h1>
        <br />
        <AwesomeButton
          type="primary"
          className="pt-4"
          style={{
            // "margin-left": "0.25rem !important",
            "--button-default-height": "100%",
            "--button-default-border-radius": "1.5rem",
            "--button-raise-level": "4px",
            "--button-primary-border": "none",
            height: "3rem",
          }}
          onPress={() => {
            setanimateLeave(true);
            setTimeout(() => router.push("/"), 500);
          }}
        >
          <div className="align-middle text-xl">go back</div>
        </AwesomeButton>
      </div>
    </div>
  );
};

export default class PixiGame extends Component {
  constructor(props) {
    super(props);

    const { roomId } = props;
    this.roomId = roomId;
    this.player = null;
    this.players = {};
    this.canvasRef = createRef();

    this.state = {
      audioStatus: "connecting...",
      disconnected: false,
      disconnectedStatus: "",
      nameInput: "",
      colorInput: "",
      error: true,
      errorMsg: "town not found",
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
    this.game = new Game(
      this.roomId,
      GAME_HEIGHT,
      GAME_WIDTH,
      this.canvasRef,
      this.state,
      setGameState
    );
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

  onColorInput = (e) => {
    this.setState({ colorInput: e.target.value });
  };

  componentDidUpdate = () => {
    this.game.gameComponentDidUpdate(this.state);
  };

  render = () => {
    return (
      <div style={{ backdropFilter: this.state.error ? "blur(2px)" : "unset" }}>
        {/* {this.state.disconnected ? (
          <p>{this.state.disconnectedStatus}</p>
        ) : ( */}
        {this.state.error && <ErrorAlert errorMsg={this.state.errorMsg} />}
        <div>
          <canvas
            className={`${styles.game} rounded-xl focus:outline-none mx-auto`}
            ref={this.canvasRef}
            id="game"
            tabIndex="-1"
          ></canvas>
        </div>
        <div
          className="rounded-xl mx-auto bg-gray-100 h-40 mt-5"
          style={{ width: GAME_WIDTH }}
        >
          <div className="mx-auto text-center pt-5">
            <form autoComplete="off" id="search_form" method="post" action="">
              <input
                type="text"
                autoComplete="off"
                // placeholder="Your name"
                onInput={this.onNameInput}
              />
              <input type="color" onChange={this.onColorInput}></input>
            </form>

            <br />
            <strong>{this.state.audioStatus}</strong>
          </div>
        </div>
      </div>
    );
  };
}
