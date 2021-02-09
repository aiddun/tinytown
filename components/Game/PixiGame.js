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
import RightSidebar from "./RightSidebar"
import ErrorAlert from "./ErrorAlert"

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



const CenterColumn = ({ children }) => (
  <div className="grid grid-cols-7">
    <div className="col-span-2"></div>
    <div className="col-span-3">{children}</div>
    <div className="col-span-2"></div>
  </div>
);

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
      playerCount: 0,
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

    this.canvasRef.current.style.width = "100%";
    this.canvasRef.current.style.height = "auto";
  }


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
        <CenterColumn>
          <div className="rounded-xl mx-auto bg-gray-100 h-16 my-5 w-full">
            <div className="h-full flex justify-between items-center px-5">
              <Link href="/">
                <a>
                  <h1 className="text-3xl font-bold">🏘️ tiny town</h1>
                </a>
              </Link>
              <span className="leading-3 text-right">
                code
                <h2 className="text-2xl font-semibold" title={`${this.state.playerCount} players`}>{this.props.roomId}</h2>
              </span>
            </div>
          </div>
        </CenterColumn>
        <div className="grid lg:grid-cols-7">
        <div className="col-span-2"></div>
          <canvas
            className={`${styles.game} col-span-3 rounded-xl focus:outline-none`}
            // width modification above
            ref={this.canvasRef}
            id="game"
            tabIndex="-1"
          ></canvas>
          <RightSidebar/>
        </div>
        <CenterColumn>
          <BottomMenu
            gameStatusText={this.state.gameStatusText}
            onNameInput={this.onNameInput}
            colorRef={this.colorRef}
            throttledOnColorInput={this.throttledOnColorInput}
          />
        </CenterColumn>
      </div>
    );
  };
}
