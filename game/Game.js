import * as PIXI from "pixi.js";
// import { asyncScheduler, fromEvent } from "rxjs";
// import { throttleTime } from "rxjs/operators";
import { Player, User } from "./Entities/Player";
import geckos from "@geckos.io/client";
import "./dblclick";
import AgoraRTC from "agora-rtc-sdk-ng";

// Can be public
// We generate token serverside
var AGORA_APPID = "c2fc730c17d0471188e63e675f7e268d";

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

    this.agoraClient = null;

    this.udpChannel
      .onConnect((error) => {
        if (error) {
          this.setGameComponentState({ error: true, errorMsg: "town not found" });
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

        this.udpChannel.onDisconnect(() =>
          setGameComponentState({
            error: true,
            errorMsg: "something went wrong",
          })
        );
      })
      .catch((e) => {
        this.exitGame();
        setGameComponentState({
          error: true,
          errorMsg: "something went wrong",
        });
      });

    // setTimeoutWorker

    setInterval(() => {
      // TODO: Also add dialogue timeout
      if (
        this.players.player &&
        this.players.player.lastMoved &&
        // if idle for > 20 mins, kick
        new Date() - this.players.player.lastMoved > 1000 * 60 * 10
      ) {
        this.exitGame();
        this.setGameComponentState({
          error: true,
          errorMsg: "you have been kicked due to inactivity",
        });
      }
    }, 1000 * 60);
  }

  setup = (data) => {
    const { players, token, error } = data;
    if (error) {
      alert("Error: room does not exist");
      return;
    }
    Object.entries(players).forEach(([id, player]) => {
      const { x, y, name, emoij } = player;
      if (id === this.udpChannel.id) {
        this.setupPlayer(player);
      } else {
        const newPlayer = new Player(x, y, id, this, name, emoij);
        this.players[id] = newPlayer;
      }
    });
    this.setGameComponentState({
      playerCount: Object.keys(this.players).length,
    });
    this.setupAudio(this.roomId, token);
  };

  async setupAudio(roomId, token) {
    this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "h264" });
    const appid = AGORA_APPID;
    const uid = await this.agoraClient.join(
      appid,
      roomId,
      token,
      this.udpChannel.id
    );

    this.agoraClient.on("user-published", async (user, mediaType) => {
      // Subscribe to a remote user.
      await this.agoraClient.subscribe(user, mediaType);
      console.log("subscribe success");

      // If the subscribed track is audio.
      if (mediaType === "audio") {
        // Get `RemoteAudioTrack` in the `user` object.
        const remoteAudioTrack = user.audioTrack;
        // Play the audio track. No need to pass any DOM element.
        remoteAudioTrack.play();

        const { uid } = user;
        this.players[uid].agoraAudioTrack = remoteAudioTrack;
      } else {
        console.error("error: unsupported media track");
      }
    });

    const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
      // AEC: true,
      // AGC: true,
      // ANS: true,
      encoderConfig: "speech_standard",
    });

    this.players.player.agoraAudioTrack = localAudioTrack;

    // Publish the local audio to the channel.
    await this.agoraClient.publish([localAudioTrack]);

    console.log("audio publish success!");
    this.setGameComponentState({ audioConnected: true });

    this.agoraClient.on("user-unpublished", (user) => {});
  }

  async stopAudio() {
    // Stop mic
    this.players.player.localAudioTrack.close();
    // Leave the channel.
    await this.client.leave();

    const audioStatus = document.getElementById("audiostatus");
    audioStatus.innerHTML = "audio disconnected";
  }

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
      player.emitMovement(true);
    };

    this.stage.on("dblclick", onTouch);
    this.stage.on("tap", onTouch);
  };

  setupKeysDown = () => {
    // Keydown event
    console.log(this.canvasRef);
    this.canvasRef.current.addEventListener("keydown", ({ key }) => {
      key = key.toLowerCase();
      this.keysdown.add(key);
      if (key === "m") {
        this.players.player.mute();
      }
    });
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

  exitGame = () => {
    this.udpChannel.close();
    Object.values(this.players).forEach(
      (p) => p.agoraAudioTrack && p.agoraAudioTrack.stop()
    );
  };
}
