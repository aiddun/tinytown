// import AgoraRTC from "agora-rtc-sdk-ng";
import { createRef, useState } from "react";
import React, { Component } from "react";
import styles from "./game.module.scss";
import Game from "../../game/Game";
import { AwesomeButton } from "react-awesome-button";
import { useRouter } from "next/router";
import { throttle } from "lodash";
import Link from "next/link";

import BottomMenu from "./BottomMenu";

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
    // To avoid lag due to high rerenders on the color picker, we set the color value using the ref
    this.colorRef = React.createRef();

    this.state = {
      gameConnected: false,
      audioConnected: false,
      disconnected: false,
      disconnectedStatus: "",
      nameInput: "",
      colorInput: "",
      error: false,
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

  onColorInput = async (e) => {
    this.setState({ colorInput: e.target.value });
  };

  throttledOnColorInput = throttle(this.onColorInput, 50);

  componentDidUpdate = (prevProps, prevState) => {
    this.game.gameComponentDidUpdate(this.state);
    if (prevState.colorInput !== this.state.colorInput) {
      // For some reason I decided that all server colors should be decimal literals for hex numbers
      // Need to change at some point
      this.colorRef.current.value = this.state.colorInput;
    }
  };

  render = () => {
    const { gameConnected, audioConnected } = this.state;

    let gameStatusText;
    if (gameConnected && audioConnected) gameStatusText = "connected";
    else if (gameConnected && !audioConnected)
      gameStatusText = "audio connecting";
    else if (!gameConnected && audioConnected)
      gameStatusText = "game connecting";
    else if (!gameConnected && !audioConnected) gameStatusText = "connecting";

    return (
      <div style={{ backdropFilter: this.state.error ? "blur(2px)" : "unset" }}>
        {/* {this.state.disconnected ? (
          <p>{this.state.disconnectedStatus}</p>
        ) : ( */}
        {this.state.error && <ErrorAlert errorMsg={this.state.errorMsg} />}
        <div
          className="rounded-xl mx-auto bg-gray-100 h-16 my-5"
          style={{ width: GAME_WIDTH }}
        >
          <div className="h-full flex justify-between items-center px-5">
            <Link href="/">
              <a>
                <h1 className="text-3xl font-bold">🏘️ tiny town</h1>
              </a>
            </Link>
            <span className="leading-3 text-right">
              code <h2 className="text-2xl font-semibold">{this.props.roomId}</h2>
            </span>
          </div>
        </div>
        <div>
          <canvas
            className={`${styles.game} rounded-xl focus:outline-none mx-auto`}
            ref={this.canvasRef}
            id="game"
            tabIndex="-1"
          ></canvas>
          <div className="">foo</div>
        </div>
        <BottomMenu
          width={GAME_WIDTH}
          gameStatusText={this.state.gameStatusText}
          onNameInput={this.onNameInput}
          colorRef={this.colorRef}
          throttledOnColorInput={this.throttledOnColorInput}
        />
      </div>
    );
  };
}
